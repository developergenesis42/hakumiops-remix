import { useState, useEffect, useCallback } from 'react';
import { Service, ServiceCategory, Room, Therapist, BookingWithDetails, AddonItem, SessionWithDetails } from '../types';
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

// Add-on items data
const ADDON_ITEMS: AddonItem[] = [
  { name: 'Item 1', price: 500 },
  { name: 'Item 2', price: 1000 }
];

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
    vip_number?: number;
    nationality?: 'Chinese' | 'Foreigner';
    payment_method?: 'Cash' | 'Thai QR Code' | 'WeChat' | 'Alipay' | 'FX Cash (other than THB)';
    addon_items?: AddonItem[];
    addon_custom_amount?: number;
    notes?: string;
  }) => void;
  therapists: Therapist[];
  rooms: Room[];
  preselectedTherapistId?: string;
  bookingId?: string;
  bookingNote?: string;
  bookingData?: BookingWithDetails;
  // Modification mode props
  modificationMode?: boolean;
  modifyingSessionId?: string;
  selectedSessionForModify?: SessionWithDetails;
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
  bookingData,
  modificationMode = false,
  modifyingSessionId: _modifyingSessionId, // eslint-disable-line @typescript-eslint/no-unused-vars
  selectedSessionForModify
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
  const [vipNumber, setVipNumber] = useState<number | ''>('');
  const [nationality, setNationality] = useState<'Chinese' | 'Foreigner'>('Chinese');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Thai QR Code' | 'WeChat' | 'Alipay' | 'FX Cash (other than THB)'>('Cash');
  const [selectedAddonItems, setSelectedAddonItems] = useState<string[]>([]);
  const [customAddonAmount, setCustomAddonAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');
  
  // PrintNode hook for automatic printing
  const { getDefaultPrinter, printReceipt } = usePrintNode();

  // Reset form when modal opens
  useEffect(() => {
    
    if (isOpen) {
      setIsPrinting(false);
      setPrintError(null);
      setDiscount(0);
      setWob('W');
      setVipNumber('');
      setNationality('Chinese');
      setPaymentMethod('Cash');
      setSelectedAddonItems([]);
      setCustomAddonAmount('');
      setNotes('');
      
      if (modificationMode && selectedSessionForModify) {
        // Opening for session modification - pre-populate from session data
        setIsFromBooking(false);
        const session = selectedSessionForModify;
        
        // Service data
        if (session.service) {
          setSelectedCategory(session.service.category);
          setSelectedServiceId(session.service_id);
        }
        
        // Room data
        setSelectedRoomId(session.room_id || '');
        
        // Therapist data
        if (session.therapist_ids && session.therapist_ids.length > 0) {
          setSelectedTherapist1Id(session.therapist_ids[0]);
          
          if (session.therapist_ids.length > 1) {
            setSelectedTherapist2Id(session.therapist_ids[1]);
          } else {
            setSelectedTherapist2Id('');
          }
        }
        
        // Payment data (from session metadata)
        setDiscount((session.discount as 0 | 200 | 300) || 0);
        setWob(session.wob || 'W');
        setVipNumber(session.vip_number || '');
        setNationality(session.nationality || 'Chinese');
        setPaymentMethod(session.payment_method || 'Cash');
        
        // Addon data
        setSelectedAddonItems(session.addon_items?.map(item => item.name) || []);
        setCustomAddonAmount(session.addon_custom_amount || '');
        
        // Notes
        setNotes(session.notes || '');
      } else if (bookingId && bookingData) {
        // Opening from booking - pre-populate from booking data
        setIsFromBooking(true);
        const service = bookingData.service;
        
        if (service) {
          setSelectedCategory(service.category);
          setSelectedServiceId(service.id);
        }
        
        if (bookingData.therapist_ids && bookingData.therapist_ids.length > 0) {
          setSelectedTherapist1Id(bookingData.therapist_ids[0]);
          
          if (bookingData.therapist_ids.length > 1) {
            setSelectedTherapist2Id(bookingData.therapist_ids[1]);
          } else {
            setSelectedTherapist2Id('');
          }
        }
        
        // Auto-populate room if assigned in booking
        setSelectedRoomId(bookingData.room_id || '');
        
        // Auto-populate booking note into notes field
        setNotes(bookingData.note || '');
        
        // Set WOB to 'B' (Booking) since this is from a booking
        setWob('B');
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
  }, [isOpen, bookingId, bookingData, preselectedTherapistId, modificationMode, selectedSessionForModify]);

  // Additional useEffect to handle booking data changes after modal is already open
  useEffect(() => {
    if (isOpen && bookingData) {
      const service = bookingData.service;
      
      // 1. Set category and service
      if (service) {
        setSelectedCategory(service.category);
        setSelectedServiceId(service.id);
      }
      
      // 2. Set therapist
      if (bookingData.therapist_ids && bookingData.therapist_ids.length > 0) {
        setSelectedTherapist1Id(bookingData.therapist_ids[0]);
        
        if (bookingData.therapist_ids.length > 1) {
          setSelectedTherapist2Id(bookingData.therapist_ids[1]);
        } else {
          setSelectedTherapist2Id('');
        }
      }
      
      setIsFromBooking(true);
    }
  }, [isOpen, bookingData]);

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
    
    // Include all compatible rooms, not just available ones
    // This allows showing booked rooms even if they're not available
    return rooms.filter(r => compatibleTypes.includes(r.type));
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
      
      // Call the original confirm handler first (create or modify session)
      onConfirmSession({
        serviceId: selectedServiceId as number,
        therapistIds,
        roomId: selectedRoomId,
        bookingId: bookingId,
        discount,
        wob,
        vip_number: vipNumber || undefined,
        nationality,
        payment_method: paymentMethod,
        addon_items: selectedAddonItems.length > 0 ? ADDON_ITEMS.filter(item => selectedAddonItems.includes(item.name)) : undefined,
        addon_custom_amount: customAddonAmount || undefined,
        notes: notes || undefined
      });
      
      // Only print if not in modification mode (for new sessions)
      // For modifications, we'll handle printing in the parent component
      if (!modificationMode) {
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
          paymentMethod: paymentMethod,
          discount: discount || 0,
          wob: wob || 'W',
          vip_number: vipNumber || undefined,
          addon_items: selectedAddonItems.length > 0 ? selectedAddonItems : undefined,
          addon_custom_amount: customAddonAmount || undefined,
          nationality: nationality
        };
        
        // Determine number of copies based on service category
        let copies = 1;
        if (selectedService.category === '1 Lady') {
          copies = 2; // 2 copies for 1 lady service
        } else if (selectedService.category === '2 Ladies') {
          copies = 3; // 3 copies for 2 ladies service (1 for each lady + 1 for shop)
        }
        
        // Print the receipt automatically
        await printReceipt(defaultPrinter.id, receiptData, copies);
      }
      
      // Close modal after successful operation
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
  
  // Calculate add-on total
  const addonTotal = selectedAddonItems.reduce((total, itemName) => {
    const item = ADDON_ITEMS.find(i => i.name === itemName);
    return total + (item ? item.price : 0);
  }, 0) + (customAddonAmount || 0);

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
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-6xl space-y-4 modal-fade-in max-h-[95vh] overflow-y-auto">
          <h3 className="text-2xl font-bold text-white">
            {modificationMode ? 'Modify Session' : 
             isFromBooking ? 'Start a Booked Session' : 'Create a New Session'}
          </h3>
          {isFromBooking && (
            <div className="text-sm text-blue-300 bg-blue-900/30 px-3 py-2 rounded-md">
              📋 Information pre-populated from booking
            </div>
          )}
          {modificationMode && (
            <div className="text-sm text-yellow-300 bg-yellow-900/30 px-3 py-2 rounded-md">
              ✏️ Modifying live session - all fields can be changed
            </div>
          )}
          
          {/* Booking Note Display */}
          {isFromBooking && bookingNote && (
            <div className="bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-200 p-3 rounded-md text-sm">
              <p className="font-bold">Booking Note:</p>
              <p>{bookingNote}</p>
            </div>
          )}

          {/* Main Form - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Session Info */}
            <div className="space-y-4">
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <h4 className="text-base font-semibold text-white mb-3">Basic Session Info</h4>
                
                {/* Category Selection */}
                <div className="mb-3">
                  <label htmlFor="category-select" className="block text-sm font-medium text-gray-300 mb-1">1. Category</label>
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
                <div className="mb-3">
                  <label htmlFor="service-select" className="block text-sm font-medium text-gray-300 mb-1">2. Service</label>
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
                <div className="mb-3">
                  <label htmlFor="therapist-select-1" className="block text-sm font-medium text-gray-300 mb-1">3. Therapist(s)</label>
                  <div className="space-y-2">
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
                  <label htmlFor="room-select" className="block text-sm font-medium text-gray-300 mb-1">4. Room</label>
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
              </div>
            </div>

            {/* Right Column - Payment & Customer Details */}
            <div className="space-y-4">
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <h4 className="text-base font-semibold text-white mb-3">Payment & Customer Details</h4>
                
                {/* Discount, WOB, VIP */}
                <div className="grid grid-cols-1 gap-3 mb-3">
                  <div>
                    <label htmlFor="discount-select" className="block text-sm font-medium text-gray-300 mb-1">5. Discount</label>
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
                    <label htmlFor="wob-select" className="block text-sm font-medium text-gray-300 mb-1">6. WOB</label>
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
                    <label htmlFor="vip-number-input" className="block text-sm font-medium text-gray-300 mb-1">7. VIP Number</label>
                    <input
                      id="vip-number-input"
                      type="number"
                      min="1"
                      max="1000"
                      value={vipNumber}
                      onChange={(e) => setVipNumber(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="Enter VIP number (1-1000)"
                      className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                    />
                  </div>
                </div>

                {/* Nationality, Payment Method */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label htmlFor="nationality-select" className="block text-sm font-medium text-gray-300 mb-1">8. Nationality</label>
                    <select
                      id="nationality-select"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value as 'Chinese' | 'Foreigner')}
                      className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                    >
                      <option value="Chinese">Chinese</option>
                      <option value="Foreigner">Foreigner</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="payment-method-select" className="block text-sm font-medium text-gray-300 mb-1">9. Payment Method</label>
                    <select
                      id="payment-method-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Thai QR Code' | 'WeChat' | 'Alipay' | 'FX Cash (other than THB)')}
                      className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Thai QR Code">Thai QR Code</option>
                      <option value="WeChat">WeChat</option>
                      <option value="Alipay">Alipay</option>
                      <option value="FX Cash (other than THB)">FX Cash (other than THB)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons and Notes Section */}
          <div className="bg-gray-700/30 p-3 rounded-lg">
            <h4 className="text-base font-semibold text-white mb-3">Add-ons & Notes</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Add-on Items */}
              <div>
                <div className="block text-sm font-medium text-gray-300 mb-2">10. Add-ons</div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Select add-on items:</p>
                    <div className="space-y-1">
                      {ADDON_ITEMS.map((item) => (
                        <label key={item.name} htmlFor={`addon-${item.name}`} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            id={`addon-${item.name}`}
                            type="checkbox"
                            checked={selectedAddonItems.includes(item.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAddonItems(prev => [...prev, item.name]);
                              } else {
                                setSelectedAddonItems(prev => prev.filter(name => name !== item.name));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-white">
                            {item.name}: ฿{item.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Add-on Amount */}
                  <div>
                    <label htmlFor="custom-addon-amount" className="block text-sm text-gray-400 mb-1">Custom amount (THB):</label>
                    <input
                      id="custom-addon-amount"
                      type="number"
                      min="0"
                      max="3000"
                      value={customAddonAmount}
                      onChange={(e) => setCustomAddonAmount(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="Enter custom amount (0-3000)"
                      className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <label htmlFor="notes-input" className="block text-sm font-medium text-gray-300 mb-1">
                  11. Notes
                </label>
                <textarea
                  id="notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes about the session or customer..."
                  rows={3}
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Review Summary - Compact */}
          <div className="bg-gray-900 p-3 rounded-md">
            {selectedService && selectedTherapist1 && selectedRoom ? (
              <div className="text-center">
                <p className="text-white text-sm">
                  📋 <span className="font-bold">{selectedService.name}</span> with{' '}
                  <span className="font-bold">
                    {selectedTherapist1.name}
                    {selectedTherapist2 && ` & ${selectedTherapist2.name}`}
                  </span>{' '}
                  in <span className="font-bold">{selectedRoom.name}</span>
                  {' | '}
                  <span className="text-gray-300">
                    {selectedService.duration}min | ฿{Math.max(0, selectedService.price - (discount || 0))} (−฿{discount}) | Payout: ฿{selectedService.payout}
                    {addonTotal > 0 && ` | Add-ons: ฿${addonTotal}`}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center">Please complete all selections</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
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
