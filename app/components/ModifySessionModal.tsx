import { useState, useEffect } from 'react';
import { SessionWithDetails, Service, Room, Therapist } from '../types';

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

interface ModifySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmModify: (modifyData: {
    sessionId: string;
    newServiceId: number;
    newRoomId: string;
  }) => void;
  session: SessionWithDetails | null;
  therapists: Therapist[];
  rooms: Room[];
}

export default function ModifySessionModal({
  isOpen,
  onClose,
  onConfirmModify,
  session,
  therapists,
  rooms
}: ModifySessionModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && session) {
      setSelectedServiceId(session.service_id);
      setSelectedRoomId(session.room_id || '');
    }
  }, [isOpen, session]);

  // Get current service and room
  const currentService = SERVICES.find(s => s.id === session?.service_id);
  const currentRoom = rooms.find(r => r.id === session?.room_id);

  // Get available rooms (excluding current room)
  const availableRooms = rooms.filter(r => r.status === 'Available' || r.id === session?.room_id);

  // Calculate changes
  const newService = SERVICES.find(s => s.id === selectedServiceId);
  const newRoom = rooms.find(r => r.id === selectedRoomId);

  const priceDiff = newService && currentService ? newService.price - currentService.price : 0;
  const durationDiff = newService && currentService ? newService.duration - currentService.duration : 0;

  // Get therapist names
  const getTherapistNames = () => {
    if (!session?.therapist_ids) return 'No therapists';
    return session.therapist_ids
      .map(id => therapists.find(t => t.id === id)?.name || 'Unknown')
      .join(' & ');
  };

  // Validation
  const isFormValid = () => {
    return selectedServiceId && selectedRoomId;
  };

  const handleConfirm = () => {
    if (!isFormValid() || !session) return;

    onConfirmModify({
      sessionId: session.id,
      newServiceId: selectedServiceId as number,
      newRoomId: selectedRoomId
    });

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !session) return null;

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
          <h3 className="text-2xl font-bold text-white">Modify In-Progress Session</h3>
          
          {/* Therapist Display */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Therapist(s)</label>
            <div className="w-full bg-gray-700 text-gray-400 border-gray-600 rounded-md p-2">
              {getTherapistNames()}
            </div>
          </div>

          {/* Service and Room Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="modify-service-select" className="block text-sm font-medium text-gray-300 mb-2">
                Change Service
              </label>
              <select
                id="modify-service-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(Number(e.target.value) || '')}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              >
                {SERVICES.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="modify-room-select" className="block text-sm font-medium text-gray-300 mb-2">
                Change Room
              </label>
              <select
                id="modify-room-select"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              >
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} {room.id === session?.room_id ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Review Summary */}
          <div className="bg-gray-900 p-4 rounded-md text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Original Service:</span>
              <span>{currentService?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">New Service:</span>
              <span>{newService?.name || 'Select service'}</span>
            </div>
            <div className="border-t border-gray-700 my-2"></div>
            <div className={`flex justify-between font-bold ${priceDiff > 0 ? 'text-green-400' : priceDiff < 0 ? 'text-red-400' : ''}`}>
              <span>Price Difference:</span>
              <span>{priceDiff > 0 ? '+' : ''}฿{priceDiff.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between font-bold ${durationDiff > 0 ? 'text-green-400' : durationDiff < 0 ? 'text-red-400' : ''}`}>
              <span>Time Difference:</span>
              <span>{durationDiff > 0 ? '+' : ''}{durationDiff} mins</span>
            </div>
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
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Confirm Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
