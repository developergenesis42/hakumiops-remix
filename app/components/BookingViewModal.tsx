import { useState, useEffect } from 'react';
import { Service, Therapist, Room, BookingWithDetails } from '../types';

// Services data from the HTML version
const SERVICES: Service[] = [
  { id: 1, category: '1 Lady', room_type: 'Shower', name: '40 min Shower', duration: 40, price: 3200, payout: 1300, created_at: '2024-01-15T08:00:00Z' },
  { id: 2, category: '1 Lady', room_type: 'Shower', name: '60 min Shower', duration: 60, price: 3500, payout: 1500, created_at: '2024-01-15T08:00:00Z' },
  { id: 3, category: '1 Lady', room_type: 'Shower', name: '90 min Shower', duration: 90, price: 4000, payout: 1800, created_at: '2024-01-15T08:00:00Z' },
  { id: 4, category: '1 Lady', room_type: 'VIP Jacuzzi', name: '60 min VIP', duration: 60, price: 4000, payout: 2000, created_at: '2024-01-15T08:00:00Z' },
  { id: 5, category: '1 Lady', room_type: 'VIP Jacuzzi', name: '90 min VIP', duration: 90, price: 5000, payout: 2300, created_at: '2024-01-15T08:00:00Z' },
  { id: 6, category: '2 Ladies', room_type: 'Shower', name: '60 min 2L Shower', duration: 60, price: 6500, payout: 3400, created_at: '2024-01-15T08:00:00Z' },
  { id: 7, category: '2 Ladies', room_type: 'Shower', name: '90 min 2L Shower', duration: 90, price: 7500, payout: 4000, created_at: '2024-01-15T08:00:00Z' },
  { id: 8, category: '2 Ladies', room_type: 'VIP Jacuzzi', name: '60 min 2L VIP', duration: 60, price: 7500, payout: 4000, created_at: '2024-01-15T08:00:00Z' },
  { id: 9, category: '2 Ladies', room_type: 'VIP Jacuzzi', name: '90 min 2L VIP', duration: 90, price: 8500, payout: 4800, created_at: '2024-01-15T08:00:00Z' },
  { id: 10, category: 'Couple', room_type: 'Shower', name: '60 min Couple Shower', duration: 60, price: 7500, payout: 2500, created_at: '2024-01-15T08:00:00Z' },
  { id: 11, category: 'Couple', room_type: 'Shower', name: '90 min Couple Shower', duration: 90, price: 8000, payout: 3000, created_at: '2024-01-15T08:00:00Z' },
  { id: 12, category: 'Couple', room_type: 'VIP Jacuzzi', name: '60 min Couple VIP', duration: 60, price: 8500, payout: 3000, created_at: '2024-01-15T08:00:00Z' },
  { id: 13, category: 'Couple', room_type: 'VIP Jacuzzi', name: '90 min Couple VIP', duration: 90, price: 9000, payout: 3500, created_at: '2024-01-15T08:00:00Z' }
];

interface ConflictInfo {
  therapistId: string;
  therapistName: string;
  conflict: string;
}

interface BookingViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateBooking: (bookingId: string, updates: {
    serviceId: number;
    therapistIds: string[];
    startTime: Date;
    endTime: Date;
    roomId?: string;
    note?: string;
  }) => Promise<void>;
  onStartSession: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  booking: BookingWithDetails | null;
  therapists: Therapist[];
  rooms: Room[];
}

export default function BookingViewModal({
  isOpen,
  onClose,
  onUpdateBooking,
  onStartSession,
  onCancelBooking,
  booking,
  therapists,
  rooms
}: BookingViewModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [selectedTherapist1Id, setSelectedTherapist1Id] = useState<string>('');
  const [selectedTherapist2Id, setSelectedTherapist2Id] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      setSelectedServiceId(booking.service_id);
      setSelectedTherapist1Id(booking.therapist_ids[0] || '');
      setSelectedTherapist2Id(booking.therapist_ids[1] || '');
      setSelectedRoomId(booking.room_id || '');
      setStartTime(new Date(booking.start_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
      setNote(booking.note || '');
      setIsUpdating(false);
    }
  }, [isOpen, booking]);

  // Get selected service to determine if second therapist is needed
  const selectedService = selectedServiceId ? SERVICES.find(s => s.id === selectedServiceId) : null;
  const needsSecondTherapist = selectedService?.category === '2 Ladies';
  
  // Get available therapists for selection (excluding already selected ones)
  const availableTherapists = therapists.filter(t => 
    t.id !== selectedTherapist1Id && 
    (t.status === 'Available' || t.status === 'Rostered')
  );

  // Check for conflicts
  const checkConflicts = (): ConflictInfo[] => {
    const conflicts: ConflictInfo[] = [];
    const therapistIds = [selectedTherapist1Id, selectedTherapist2Id].filter(Boolean);
    
    therapistIds.forEach(therapistId => {
      const therapist = therapists.find(t => t.id === therapistId);
      if (therapist?.status === 'In Session') {
        conflicts.push({
          therapistId,
          therapistName: therapist.name,
          conflict: 'Currently in session'
        });
      }
    });
    
    return conflicts;
  };

  // Check for time conflicts with other bookings
  const checkTimeConflicts = (): string[] => {
    const timeConflicts: string[] = [];
    
    if (!selectedServiceId || !startTime) return timeConflicts;
    
    const service = SERVICES.find(s => s.id === selectedServiceId);
    if (!service) return timeConflicts;
    
    const [hours, minutes] = startTime.split(':');
    const startDateTime = new Date();
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);
    
    // Check against other bookings for the same therapists
    const therapistIds = [selectedTherapist1Id, selectedTherapist2Id].filter(Boolean);
    
    // This would need access to all bookings - for now, we'll add a note about potential conflicts
    return timeConflicts;
  };

  const conflicts = checkConflicts();
  const timeConflicts = checkTimeConflicts();
  const hasConflicts = conflicts.length > 0 || timeConflicts.length > 0;

  // Get compatible rooms for selected service
  const getCompatibleRooms = () => {
    if (!selectedService) return [];
    
    const compatibleTypes = selectedService.room_type === 'Shower' 
      ? ['Shower', 'Large Shower'] 
      : ['VIP Jacuzzi'];
    
    return rooms.filter(r => 
      r.status === 'Available' && 
      compatibleTypes.includes(r.type)
    );
  };

  const compatibleRooms = getCompatibleRooms();

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Get booking summary
  const getBookingSummary = () => {
    if (!selectedServiceId || !startTime) {
      return "Please select service and start time.";
    }

    const service = SERVICES.find(s => s.id === selectedServiceId);
    if (!service) return "Invalid service selected.";

    const [hours, minutes] = startTime.split(':');
    const startDateTime = new Date();
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

    return `Session will run from ${formatTime(startDateTime)} to ${formatTime(endDateTime)}.`;
  };

  // Validation
  const isFormValid = () => {
    if (!selectedServiceId || !startTime || !selectedTherapist1Id) return false;
    
    // For 2 Ladies services, need second therapist
    if (needsSecondTherapist && !selectedTherapist2Id) return false;
    
    // Can't select same therapist twice
    if (needsSecondTherapist && selectedTherapist2Id === selectedTherapist1Id) return false;
    
    return true;
  };

  const handleSaveChanges = async () => {
    if (!isFormValid() || !booking) return;

    setIsUpdating(true);
    try {
      const [hours, minutes] = startTime.split(':');
      const startDateTime = new Date();
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Ensure we're using today's date, not potentially yesterday if time is early
      const today = new Date();
      startDateTime.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());

      // Build therapist IDs array
      const therapistIds = [selectedTherapist1Id];
      if (needsSecondTherapist && selectedTherapist2Id) {
        therapistIds.push(selectedTherapist2Id);
      }

      // Calculate end time based on new service
      const service = SERVICES.find(s => s.id === selectedServiceId);
      if (!service) {
        throw new Error('Invalid service selected');
      }
      
      const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

      const updateData = {
        serviceId: selectedServiceId as number,
        therapistIds,
        startTime: startDateTime,
        endTime: endDateTime,
        roomId: selectedRoomId || undefined,
        note: note.trim() || undefined
      };
      
      console.log('BookingViewModal: Sending update data:', updateData);
      console.log('Start time:', startDateTime.toISOString());
      console.log('End time:', endDateTime.toISOString());

      await onUpdateBooking(booking.id, updateData);

      onClose();
    } catch (error) {
      console.error('Failed to update booking:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartSession = () => {
    if (!booking || hasConflicts) return;
    onStartSession(booking.id);
    onClose();
  };

  const handleCancelBooking = () => {
    if (!booking) return;
    onCancelBooking(booking.id);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !booking) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        .modal-fade-in { 
          animation: fadeIn 0.2s ease-out forwards; 
        }
      `}</style>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl space-y-6 modal-fade-in max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Booking Details</h3>
            <div className="text-sm text-gray-400">
              ID: {booking.id.slice(-8)}
            </div>
          </div>
          
          {/* Booking Status */}
          <div className="bg-gray-700 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                booking.status === 'Scheduled' ? 'bg-blue-600 text-white' :
                booking.status === 'Completed' ? 'bg-green-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Therapist Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Therapist(s)</label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Primary Therapist</label>
                <select
                  value={selectedTherapist1Id}
                  onChange={(e) => setSelectedTherapist1Id(e.target.value)}
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                >
                  <option value="">Select primary therapist...</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name} ({therapist.status})
                    </option>
                  ))}
                </select>
              </div>
              
              {needsSecondTherapist && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Second Therapist (Required for 2 Ladies)</label>
                  <select
                    value={selectedTherapist2Id}
                    onChange={(e) => setSelectedTherapist2Id(e.target.value)}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                  >
                    <option value="">Select second therapist...</option>
                    {availableTherapists.map(therapist => (
                      <option key={therapist.id} value={therapist.id}>
                        {therapist.name} ({therapist.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Service and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(Number(e.target.value) || '')}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              >
                <option value="">Select service...</option>
                {SERVICES.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Time (24hr)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              />
            </div>
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Room Assignment</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
            >
              <option value="">No room pre-assigned</option>
              {compatibleRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.type}) - {room.status}
                </option>
              ))}
              {/* Show incompatible rooms as disabled options */}
              {rooms.filter(r => !compatibleRooms.some(cr => cr.id === r.id)).map(room => (
                <option key={room.id} value={room.id} disabled>
                  {room.name} ({room.type}) - Incompatible with service
                </option>
              ))}
            </select>
            {selectedRoomId && (
              <div className="mt-2 text-sm text-blue-300">
                📍 Room assigned: {rooms.find(r => r.id === selectedRoomId)?.name}
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-900 p-4 rounded-md text-center text-sm">
            {getBookingSummary()}
          </div>

          {/* Booking Note */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Booking Note
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              placeholder="e.g., VIP client, special requests..."
            />
          </div>

          {/* Service Change Warning */}
          {selectedServiceId && booking && selectedServiceId !== booking.service_id && (
            <div className="bg-blue-900/50 border border-blue-600 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <span className="text-blue-400 text-lg mr-2">ℹ️</span>
                <span className="text-blue-300 font-semibold">Service Changed</span>
              </div>
              <div className="text-sm text-blue-200">
                <p>You've changed the service. This will update:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Session duration and end time</li>
                  <li>Room type requirements</li>
                  <li>Therapist requirements (if applicable)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Room Change Warning */}
          {selectedRoomId && booking && selectedRoomId !== booking.room_id && (
            <div className="bg-orange-900/50 border border-orange-600 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <span className="text-orange-400 text-lg mr-2">🏠</span>
                <span className="text-orange-300 font-semibold">Room Assignment Changed</span>
              </div>
              <div className="text-sm text-orange-200">
                <p>You've changed the room assignment:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Previous room will be marked as available</li>
                  <li>New room will be marked as occupied</li>
                  <li>Room status bar will update automatically</li>
                </ul>
              </div>
            </div>
          )}

          {/* Conflict Warning */}
          {hasConflicts && (
            <div className="bg-yellow-900/50 border border-yellow-600 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <span className="text-yellow-400 text-lg mr-2">⚠️</span>
                <span className="text-yellow-300 font-semibold">Warning: Conflicts Detected</span>
              </div>
              <div className="text-sm text-yellow-200">
                <p className="mb-1">Some therapists are currently unavailable:</p>
                <ul className="list-disc list-inside">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>
                      {conflict.therapistName} - {conflict.conflict}
                    </li>
                  ))}
                </ul>
                <p className="mt-2">You can save changes but cannot start the session until conflicts are resolved.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Close
              </button>
              <button
                onClick={handleCancelBooking}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel Booking
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveChanges}
                disabled={!isFormValid() || isUpdating}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleStartSession}
                disabled={!isFormValid() || hasConflicts}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Start Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
