import { useState, useEffect } from 'react';
import { Service, ServiceCategory, Therapist } from '../types';

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
}

export default function BookingModal({
  isOpen,
  onClose,
  onConfirmBooking,
  therapist
}: BookingModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [startTime, setStartTime] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedServiceId('');
      setStartTime('');
      setNote('');
    }
  }, [isOpen]);

  // Get services based on therapist status (simplified to 1 Lady for now)
  const availableServices = SERVICES.filter(s => s.category === '1 Lady');

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
    return selectedServiceId && startTime;
  };

  const handleConfirm = () => {
    if (!isFormValid() || !therapist) return;

    const [hours, minutes] = startTime.split(':');
    const startDateTime = new Date();
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    onConfirmBooking({
      therapistIds: [therapist.id],
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Therapist(s)</label>
            <div className="w-full bg-gray-700 text-gray-400 border-gray-600 rounded-md p-2">
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
