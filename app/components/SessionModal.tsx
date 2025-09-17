import { useState, useEffect, useCallback } from 'react';
import { Service, ServiceCategory, Room, Therapist, BookingWithDetails } from '../types';

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

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSession: (sessionData: {
    serviceId: number;
    therapistIds: string[];
    roomId: string;
    bookingId?: string;
  }) => void;
  therapists: Therapist[];
  rooms: Room[];
  preselectedTherapistId?: string;
  bookingId?: string;
  bookingNote?: string;
  bookingData?: BookingWithDetails;
}

export default function SessionModal({
  isOpen,
  onClose,
  onConfirmSession,
  therapists,
  rooms,
  preselectedTherapistId,
  bookingId,
  bookingNote,
  bookingData
}: SessionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | ''>('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [selectedTherapist1Id, setSelectedTherapist1Id] = useState<string>('');
  const [selectedTherapist2Id, setSelectedTherapist2Id] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isFromBooking, setIsFromBooking] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (bookingId && bookingData) {
        // Opening from booking - pre-populate from booking data
        setIsFromBooking(true);
        const service = bookingData.service;
        
        setSelectedCategory(service.category);
        setSelectedServiceId(service.id);
        setSelectedTherapist1Id(bookingData.therapist_ids[0]);
        
        if (bookingData.therapist_ids.length > 1) {
          setSelectedTherapist2Id(bookingData.therapist_ids[1]);
        } else {
          setSelectedTherapist2Id('');
        }
        
        setSelectedRoomId('');
      } else {
        // Opening for new session
        setIsFromBooking(false);
        setSelectedCategory('');
        setSelectedServiceId('');
        setSelectedTherapist1Id(preselectedTherapistId || '');
        setSelectedTherapist2Id('');
        setSelectedRoomId('');
      }
    }
  }, [isOpen, bookingId, bookingData, preselectedTherapistId]);

  // Get available therapists (only Available status)
  const availableTherapists = therapists.filter(t => t.status === 'Available');

  // Get filtered services based on category
  const filteredServices = selectedCategory 
    ? SERVICES.filter(s => s.category === selectedCategory)
    : [];

  // Get compatible rooms based on selected service
  const getCompatibleRooms = useCallback(() => {
    if (!selectedServiceId) return rooms.filter(r => r.status === 'Available');
    
    const service = SERVICES.find(s => s.id === selectedServiceId);
    if (!service) return rooms.filter(r => r.status === 'Available');
    
    // Room compatibility logic
    const compatibleTypes = service.room_type === 'Shower' 
      ? ['Shower', 'Large Shower', 'VIP Jacuzzi'] 
      : ['VIP Jacuzzi'];
    
    return rooms.filter(r => 
      r.status === 'Available' && 
      compatibleTypes.includes(r.type)
    );
  }, [selectedServiceId, rooms]);

  const compatibleRooms = getCompatibleRooms();

  // Update room selection when service changes
  useEffect(() => {
    if (selectedServiceId) {
      const newCompatibleRooms = getCompatibleRooms();
      if (newCompatibleRooms.length > 0) {
        // Only auto-select if current room is not compatible with new service
        const currentRoom = rooms.find(r => r.id === selectedRoomId);
        const isCurrentRoomCompatible = currentRoom && 
          newCompatibleRooms.some(r => r.id === currentRoom.id);
        
        if (!isCurrentRoomCompatible) {
          setSelectedRoomId(newCompatibleRooms[0].id);
        }
      } else {
        setSelectedRoomId('');
      }
    }
  }, [selectedServiceId, getCompatibleRooms, rooms, selectedRoomId]);

  // Validation
  const isFormValid = () => {
    if (!selectedServiceId || !selectedTherapist1Id || !selectedRoomId) return false;
    
    // For 2 Ladies, need second therapist
    if (selectedCategory === '2 Ladies' && !selectedTherapist2Id) return false;
    
    // Can't select same therapist twice
    if (selectedCategory === '2 Ladies' && selectedTherapist1Id === selectedTherapist2Id) return false;
    
    return true;
  };

  const handleConfirm = () => {
    if (!isFormValid()) return;
    
    const therapistIds = [selectedTherapist1Id];
    if (selectedCategory === '2 Ladies') {
      therapistIds.push(selectedTherapist2Id);
    }
    
    onConfirmSession({
      serviceId: selectedServiceId as number,
      therapistIds,
      roomId: selectedRoomId,
      bookingId: bookingId
    });
    
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Get selected service for summary
  const selectedService = selectedServiceId ? SERVICES.find(s => s.id === selectedServiceId) : null;
  const selectedTherapist1 = selectedTherapist1Id ? therapists.find(t => t.id === selectedTherapist1Id) : null;
  const selectedTherapist2 = selectedTherapist2Id ? therapists.find(t => t.id === selectedTherapist2Id) : null;
  const selectedRoom = selectedRoomId ? rooms.find(r => r.id === selectedRoomId) : null;

  if (!isOpen) return null;

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
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg space-y-4 modal-fade-in">
          <h3 className="text-2xl font-bold text-white">
            {isFromBooking ? 'Start a Booked Session' : 'Create a New Session'}
          </h3>
          
          {/* Booking Note Display */}
          {isFromBooking && bookingNote && (
            <div className="bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-200 p-3 rounded-md text-sm">
              <p className="font-bold">Booking Note:</p>
              <p>{bookingNote}</p>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-300 mb-2">1. Category</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as ServiceCategory);
                setSelectedServiceId('');
                setSelectedTherapist2Id('');
              }}
              disabled={isFromBooking}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
            >
              <option value="">Select category...</option>
              <option value="1 Lady">1 Lady</option>
              <option value="2 Ladies">2 Ladies</option>
              <option value="Couple">Couple</option>
            </select>
          </div>

          {/* Service Selection */}
          <div>
            <label htmlFor="service-select" className="block text-sm font-medium text-gray-300 mb-2">2. Service</label>
            <select
              id="service-select"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(Number(e.target.value) || '')}
              disabled={isFromBooking}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
            >
              <option value="">Select service...</option>
              {filteredServices.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - ฿{service.price}
                </option>
              ))}
            </select>
          </div>

          {/* Therapist Selection */}
          <div>
            <label htmlFor="therapist-select-1" className="block text-sm font-medium text-gray-300 mb-2">3. Therapist(s)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select
                id="therapist-select-1"
                value={selectedTherapist1Id}
                onChange={(e) => setSelectedTherapist1Id(e.target.value)}
                disabled={isFromBooking}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              >
                <option value="">Select therapist...</option>
                {availableTherapists.map(therapist => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name}
                  </option>
                ))}
              </select>
              
              {selectedCategory === '2 Ladies' && (
                <select
                  id="therapist-select-2"
                  value={selectedTherapist2Id}
                  onChange={(e) => setSelectedTherapist2Id(e.target.value)}
                  disabled={isFromBooking}
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                >
                  <option value="">Select second therapist...</option>
                  {availableTherapists
                    .filter(t => t.id !== selectedTherapist1Id)
                    .map(therapist => (
                      <option key={therapist.id} value={therapist.id}>
                        {therapist.name}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Room Selection */}
          <div>
            <label htmlFor="room-select" className="block text-sm font-medium text-gray-300 mb-2">4. Room</label>
            <select
              id="room-select"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
            >
              <option value="">Select room...</option>
              {compatibleRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.type}) - {room.status === 'Available' ? '✅ Available' : '❌ Occupied'}
                </option>
              ))}
            </select>
          </div>

          {/* Review Summary */}
          <div className="bg-gray-900 p-4 rounded-md text-center">
            {selectedService && selectedTherapist1 && selectedRoom ? (
              <div>
                <p className="text-white">
                  <span className="font-bold">{selectedService.name}</span> with{' '}
                  <span className="font-bold">
                    {selectedTherapist1.name}
                    {selectedTherapist2 && ` & ${selectedTherapist2.name}`}
                  </span>{' '}
                  in <span className="font-bold">{selectedRoom.name}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Duration: {selectedService.duration} min | Price: ฿{selectedService.price} | Payout: ฿{selectedService.payout}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">Please complete all selections</p>
            )}
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
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
