import { useState, useEffect } from 'react';
import { SessionWithDetails, Service, Room, Therapist } from '../types';
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

interface ModifySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmModify: (modifyData: {
    sessionId: string;
    newServiceId: number;
    newRoomId: string;
    newTherapistIds?: string[];
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
  const [selectedTherapist1Id, setSelectedTherapist1Id] = useState<string>('');
  const [selectedTherapist2Id, setSelectedTherapist2Id] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  
  // PrintNode hook for automatic printing
  const { getDefaultPrinter, printReceipt } = usePrintNode();

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && session) {
      setIsPrinting(false);
      setPrintError(null);
      setSelectedServiceId(session.service_id);
      setSelectedRoomId(session.room_id || '');
      // Initialize therapist selections
      setSelectedTherapist1Id(session.therapist_ids[0] || '');
      setSelectedTherapist2Id(session.therapist_ids[1] || '');
    }
  }, [isOpen, session]);

  // Get current service and room
  const currentService = SERVICES.find(s => s.id === session?.service_id);

  // Get available rooms (excluding current room)
  const availableRooms = rooms.filter(r => r.status === 'Available' || r.id === session?.room_id);

  // Get available therapists (Available status OR currently in this session)
  const availableTherapists = therapists.filter(t => 
    t.status === 'Available' || (session?.therapist_ids.includes(t.id))
  );

  // Get selected service category for therapist validation
  const selectedService = SERVICES.find(s => s.id === selectedServiceId);
  const selectedCategory = selectedService?.category;

  // Clear second therapist when service category changes from "2 Ladies" to something else
  useEffect(() => {
    if (selectedCategory !== '2 Ladies' && selectedTherapist2Id) {
      setSelectedTherapist2Id('');
    }
  }, [selectedCategory, selectedTherapist2Id]);

  // Calculate changes
  const newService = SERVICES.find(s => s.id === selectedServiceId);

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
    if (!selectedServiceId || !selectedRoomId) return false;
    
    // Validate therapist selections based on service category
    if (selectedCategory === '1 Lady' || selectedCategory === 'Couple') {
      return selectedTherapist1Id && !selectedTherapist2Id;
    }
    
    if (selectedCategory === '2 Ladies') {
      return selectedTherapist1Id && selectedTherapist2Id && 
             selectedTherapist1Id !== selectedTherapist2Id;
    }
    
    return false;
  };

  const handleConfirm = async () => {
    if (!isFormValid() || !session) return;

    try {
      setIsPrinting(true);
      setPrintError(null);

      // Prepare therapist IDs based on service category
      const newTherapistIds = [selectedTherapist1Id];
      if (selectedCategory === '2 Ladies') {
        newTherapistIds.push(selectedTherapist2Id);
      }

      // Call the original confirm handler first (modify session)
      onConfirmModify({
        sessionId: session.id,
        newServiceId: selectedServiceId as number,
        newRoomId: selectedRoomId,
        newTherapistIds
      });

      // Get the new service and room data for printing
      const newService = SERVICES.find(s => s.id === selectedServiceId);
      const newRoom = rooms.find(r => r.id === selectedRoomId);
      
      if (!newService || !newRoom) {
        throw new Error('Unable to find service or room data for printing');
      }

      // Create rounded timestamp for the updated receipt
      const now = new Date();
      const roundedTime = roundToNearestFiveMinutes(now);

      // Get default printer and print updated receipt automatically
      const defaultPrinter = await getDefaultPrinter();
      
      if (!defaultPrinter) {
        throw new Error('No printer available. Please check your printer setup.');
      }

      // Get new therapist names for receipt
      const newTherapistNames = newTherapistIds
        .map(id => therapists.find(t => t.id === id)?.name || 'Unknown')
        .join(' & ');

      const receiptData = {
        sessionId: session.id,
        clientName: 'Walk-in Customer', // Default client name
        service: newService.name,
        duration: newService.duration,
        price: newService.price,
        payout: newService.payout,
        therapist: newTherapistNames,
        room: newRoom.name,
        timestamp: roundedTime.toLocaleString(),
        paymentMethod: 'Cash'
      };

      // Print the updated receipt automatically
      await printReceipt(defaultPrinter.id, receiptData);

      // Close modal after successful printing
      onClose();

    } catch (err) {
      console.error('Failed to print updated receipt:', err);
      setPrintError(err instanceof Error ? err.message : 'Failed to print updated receipt');
      // Still close the modal even if printing fails - session was modified successfully
      onClose();
    } finally {
      setIsPrinting(false);
    }
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
          
          {/* Therapist Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Change Therapists</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="modify-therapist1-select" className="block text-sm font-medium text-gray-300 mb-2">
                  Therapist 1
                </label>
                <select
                  id="modify-therapist1-select"
                  value={selectedTherapist1Id}
                  onChange={(e) => setSelectedTherapist1Id(e.target.value)}
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                >
                  <option value="">Select therapist</option>
                  {availableTherapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name} {session?.therapist_ids.includes(therapist.id) ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedCategory === '2 Ladies' && (
                <div>
                  <label htmlFor="modify-therapist2-select" className="block text-sm font-medium text-gray-300 mb-2">
                    Therapist 2
                  </label>
                  <select
                    id="modify-therapist2-select"
                    value={selectedTherapist2Id}
                    onChange={(e) => setSelectedTherapist2Id(e.target.value)}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                  >
                    <option value="">Select therapist</option>
                    {availableTherapists
                      .filter(t => t.id !== selectedTherapist1Id) // Prevent duplicate selection
                      .map(therapist => (
                        <option key={therapist.id} value={therapist.id}>
                          {therapist.name} {session?.therapist_ids.includes(therapist.id) ? '(Current)' : ''}
                        </option>
                      ))}
                  </select>
                </div>
              )}
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
              disabled={isPrinting}
              className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFormValid() || isPrinting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
            >
              {isPrinting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating & Printing...</span>
                </>
              ) : (
                <span>Confirm Changes</span>
              )}
            </button>
          </div>
          
          {/* Print Error Display */}
          {printError && (
            <div className="mt-3 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm">
              <p className="font-semibold">Printing Error:</p>
              <p>{printError}</p>
              <p className="text-xs mt-1 text-red-300">Session was updated successfully, but printing failed.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
