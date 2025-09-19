import { useState, useEffect } from 'react';
import { Service, Therapist } from '~/types';

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

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (bookingData: {
    therapistIds: string[];
    serviceId: number;
    startTime: Date;
    note?: string;
  }) => void;
  therapist: Therapist | null;
  allTherapists: Therapist[];
}

export default function BookingModal({
  isOpen,
  onClose,
  onConfirmBooking,
  therapist,
  allTherapists
}: BookingModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [selectedTherapist2Id, setSelectedTherapist2Id] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedServiceId('');
      setSelectedTherapist2Id('');
      setStartTime('');
      setNote('');
    }
  }, [isOpen]);

  // Get all available services
  const availableServices = SERVICES;
  
  // Get selected service to determine if second therapist is needed
  const selectedService = selectedServiceId ? SERVICES.find(s => s.id === selectedServiceId) : null;
  const needsSecondTherapist = selectedService?.category === '2 Ladies';
  
  // Get available therapists for second selection (excluding the primary therapist)
  const availableTherapists = allTherapists.filter(t => 
    t.id !== therapist?.id && 
    (t.status === 'Available' || t.status === 'Rostered')
  );

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Update booking summary
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

    return (
      <div>
        Session will run from{' '}
        <span className="font-bold text-white">{formatTime(startDateTime)}</span> to{' '}
        <span className="font-bold text-white">{formatTime(endDateTime)}</span>.
      </div>
    );
  };

  // Validation
  const isFormValid = () => {
    if (!selectedServiceId || !startTime) return false;
    
    // For 2 Ladies services, need second therapist
    if (needsSecondTherapist && !selectedTherapist2Id) return false;
    
    // Can't select same therapist twice
    if (needsSecondTherapist && selectedTherapist2Id === therapist?.id) return false;
    
    return true;
  };

  const handleConfirm = () => {
    if (!isFormValid() || !therapist) return;

    const [hours, minutes] = startTime.split(':');
    const startDateTime = new Date();
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Build therapist IDs array
    const therapistIds = [therapist.id];
    if (needsSecondTherapist && selectedTherapist2Id) {
      therapistIds.push(selectedTherapist2Id);
    }

    onConfirmBooking({
      therapistIds,
      serviceId: selectedServiceId as number,
      startTime: startDateTime,
      note: note.trim() || undefined
    });

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !therapist) return null;

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
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg space-y-6 modal-fade-in">
          <h3 className="text-2xl font-bold text-white">Create New Booking</h3>
          
          {/* Therapist Display */}
          <div>
            <label htmlFor="booking-therapist-display" className="block text-sm font-medium text-gray-300 mb-2">Therapist(s)</label>
            <div id="booking-therapist-display" className="w-full bg-gray-700 text-gray-400 border-gray-600 rounded-md p-2">
              {therapist.name}
            </div>
          </div>

          {/* Service and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="booking-service-select" className="block text-sm font-medium text-gray-300 mb-2">Service</label>
              <select
                id="booking-service-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(Number(e.target.value) || '')}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              >
                <option value="">Select service...</option>
                {availableServices.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="booking-start-time" className="block text-sm font-medium text-gray-300 mb-2">Start Time (24hr)</label>
              <input
                id="booking-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              />
            </div>
          </div>

          {/* Second Therapist Selection (for 2 Ladies services) */}
          {needsSecondTherapist && (
            <div>
              <label htmlFor="booking-therapist2-select" className="block text-sm font-medium text-gray-300 mb-2">
                Second Therapist (Required for 2 Ladies)
              </label>
              <select
                id="booking-therapist2-select"
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

          {/* Booking Summary */}
          <div className="bg-gray-900 p-4 rounded-md text-center text-sm">
            {getBookingSummary()}
          </div>

          {/* Booking Note */}
          <div>
            <label htmlFor="booking-note" className="block text-sm font-medium text-gray-300 mb-2">
              Booking Note (Optional)
            </label>
            <textarea
              id="booking-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              placeholder="e.g., Customer prefers soft music, VIP client..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFormValid()}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
