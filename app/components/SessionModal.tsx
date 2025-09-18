import { useState, useEffect, useCallback } from 'react';
import { Service, ServiceCategory, Room, Therapist, BookingWithDetails } from '../types';
import { usePrintNode } from '~/hooks/usePrintNode';

// Utility function to round time to nearest 5-minute increment
const roundToNearestFiveMinutes = (date: Date): Date => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 5) * 5;
  
  const roundedDate = new Date(date);
  roundedDate.setMinutes(roundedMinutes, 0, 0);
  
  // If we rounded up to 60 minutes, move to next hour
  if (roundedDate.getMinutes() === 60) {
    roundedDate.setHours(roundedDate.getHours() + 1);
    roundedDate.setMinutes(0);
  }
  
  return roundedDate;
};

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
    discount?: 0 | 200 | 300;
    wob?: 'W' | 'O' | 'B';
    vip?: boolean;
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [discount, setDiscount] = useState<0 | 200 | 300>(0);
  const [wob, setWob] = useState<'W' | 'O' | 'B'>('W');
  const [vip, setVip] = useState<boolean>(false);
  
  // PrintNode hook for automatic printing
  const { getDefaultPrinter, printReceipt } = usePrintNode();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPrinting(false);
      setPrintError(null);
      setDiscount(0);
      setWob('W');
      setVip(false);
      
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

  const handleConfirm = async () => {
    if (!isFormValid()) return;
    
    const therapistIds = [selectedTherapist1Id];
    if (selectedCategory === '2 Ladies') {
      therapistIds.push(selectedTherapist2Id);
    }
    
    // Get selected data for printing
    const selectedService = SERVICES.find(s => s.id === selectedServiceId);
    const selectedTherapist1 = therapists.find(t => t.id === selectedTherapist1Id);
    const selectedTherapist2 = selectedTherapist2Id ? therapists.find(t => t.id === selectedTherapist2Id) : null;
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    
    if (!selectedService || !selectedTherapist1 || !selectedRoom) return;
    
    try {
      setIsPrinting(true);
      setPrintError(null);
      
      // Call the original confirm handler first (create session)
      onConfirmSession({
        serviceId: selectedServiceId as number,
        therapistIds,
        roomId: selectedRoomId,
        bookingId: bookingId,
        discount,
        wob,
        vip
      });
      
      // Create rounded timestamp for the sales slip
      const now = new Date();
      const roundedTime = roundToNearestFiveMinutes(now);
      
      // Get default printer and print receipt automatically
      const defaultPrinter = await getDefaultPrinter();
      
      if (!defaultPrinter) {
        throw new Error('No printer available. Please check your printer setup.');
      }
      
      const receiptData = {
        sessionId: `temp-${Date.now()}`, // Temporary ID
        clientName: 'Walk-in Customer',
        service: selectedService.name,
        duration: selectedService.duration,
        price: Math.max(0, selectedService.price - (discount || 0)),
        payout: selectedService.payout,
        therapist: [
          selectedTherapist1.name,
          ...(selectedTherapist2 ? [selectedTherapist2.name] : [])
        ].join(', '),
        room: selectedRoom.name,
        startTime: roundedTime.toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        endTime: new Date(roundedTime.getTime() + selectedService.duration * 60000).toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        timestamp: roundedTime.toLocaleString(),
        paymentMethod: 'Cash',
        discount: discount || 0,
        wob: wob || 'W',
        vip: vip || false
      };
      
      // Determine number of copies based on service category
      let copies = 1;
      if (selectedService.category === '1 Lady') {
        copies = 2; // 2 copies for 1 lady service
      } else if (selectedService.category === '2 Ladies') {
        copies = 4; // 4 copies for 2 ladies service
      }
      
      // Print the receipt automatically
      await printReceipt(defaultPrinter.id, receiptData, copies);
      
      // Close modal after successful printing
      onClose();
      
    } catch (err) {
      console.error('Failed to print receipt:', err);
      setPrintError(err instanceof Error ? err.message : 'Failed to print receipt');
      // Still close the modal even if printing fails - session was created successfully
      onClose();
    } finally {
      setIsPrinting(false);
    }
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

          {/* Discount, WOB, VIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="discount-select" className="block text-sm font-medium text-gray-300 mb-2">5. Discount</label>
              <select
                id="discount-select"
                value={discount}
                onChange={(e) => setDiscount((Number(e.target.value) as 0 | 200 | 300) || 0)}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              >
                <option value={0}>No discount</option>
                <option value={200}>฿200</option>
                <option value={300}>฿300</option>
              </select>
            </div>
            <div>
              <label htmlFor="wob-select" className="block text-sm font-medium text-gray-300 mb-2">6. WOB</label>
              <select
                id="wob-select"
                value={wob}
                onChange={(e) => setWob(e.target.value as 'W' | 'O' | 'B')}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              >
                <option value="W">W - Walk-in</option>
                <option value="O">O - Online</option>
                <option value="B">B - Booking</option>
              </select>
            </div>
            <div>
              <label htmlFor="vip-select" className="block text-sm font-medium text-gray-300 mb-2">7. VIP</label>
              <select
                id="vip-select"
                value={vip ? 'yes' : 'no'}
                onChange={(e) => setVip(e.target.value === 'yes')}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
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
                  Duration: {selectedService.duration} min | Price: ฿{Math.max(0, selectedService.price - (discount || 0))} (−฿{discount}) | Payout: ฿{selectedService.payout}
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
              disabled={isPrinting}
              className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFormValid() || isPrinting}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
            >
              {isPrinting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating & Printing...</span>
                </>
              ) : (
                <span>Confirm</span>
              )}
            </button>
          </div>
          
          {/* Print Error Display */}
          {printError && (
            <div className="mt-3 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm">
              <p className="font-semibold">Printing Error:</p>
              <p>{printError}</p>
              <p className="text-xs mt-1 text-red-300">Session was created successfully, but printing failed.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
