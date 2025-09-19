import { useState, useEffect } from 'react';
import { Therapist } from '~/types';

// Master therapist list from the HTML version
const MASTER_THERAPIST_LIST = [
  { id: 1, name: 'Ally' }, { id: 2, name: 'Anna' }, { id: 3, name: 'Audy' }, 
  { id: 4, name: 'Ava' }, { id: 5, name: 'BB' }, { id: 6, name: 'Beer-male' }, 
  { id: 7, name: 'Bella' }, { id: 8, name: 'Bowie' }, { id: 9, name: 'Candy' }, 
  { id: 10, name: 'Cherry' }, { id: 11, name: 'Cookie' }, { id: 12, name: 'Diamond' }, 
  { id: 13, name: 'Emmy' }, { id: 14, name: 'Essay' }, { id: 15, name: 'Gina' }, 
  { id: 16, name: 'Hana' }, { id: 17, name: 'IV' }, { id: 18, name: 'Irin' }, 
  { id: 19, name: 'Jenny' }, { id: 20, name: 'Kana' }, { id: 21, name: 'Kira' }, 
  { id: 22, name: 'Kitty' }, { id: 23, name: 'Lita' }, { id: 24, name: 'Lucky' }, 
  { id: 25, name: 'Luna' }, { id: 26, name: 'Mabel' }, { id: 27, name: 'Mako' }, 
  { id: 28, name: 'Maria' }, { id: 29, name: 'Micky' }, { id: 30, name: 'Miku' }, 
  { id: 31, name: 'Mimi' }, { id: 32, name: 'Mina' }, { id: 33, name: 'Nabee' }, 
  { id: 34, name: 'Nana' }, { id: 35, name: 'Nicha' }, { id: 36, name: 'Oily' }, 
  { id: 37, name: 'Palmy' }, { id: 38, name: 'Rosy' }, { id: 39, name: 'Sara' }, 
  { id: 40, name: 'Shopee' }, { id: 41, name: 'Sophia' }, { id: 42, name: 'Sunny' }, 
  { id: 43, name: 'Susie' }, { id: 44, name: 'Tata' }, { id: 45, name: 'Violet' }, 
  { id: 46, name: 'Yuki' }, { id: 47, name: 'Yuri' }
];

interface AddTherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTherapist: (therapist: Omit<Therapist, 'id' | 'created_at' | 'updated_at'>) => void;
  currentTherapists: Therapist[];
}

export default function AddTherapistModal({ 
  isOpen, 
  onClose, 
  onAddTherapist, 
  currentTherapists 
}: AddTherapistModalProps) {
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | ''>('');

  // Filter out therapists already on duty
  const availableTherapists = MASTER_THERAPIST_LIST.filter(
    masterTherapist => !currentTherapists.some(
      currentTherapist => currentTherapist.name === masterTherapist.name
    )
  );

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTherapistId('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedTherapistId) {
      const selectedMasterTherapist = MASTER_THERAPIST_LIST.find(
        t => t.id === selectedTherapistId
      );
      
      if (selectedMasterTherapist) {
        // Convert master therapist to Therapist type
        const newTherapist: Omit<Therapist, 'id' | 'created_at' | 'updated_at'> = {
          name: selectedMasterTherapist.name,
          is_on_duty: true,
          status: 'Rostered',
          check_in_time: null,
          check_out_time: null,
          active_room_id: null,
          completed_room_ids: [],
          expenses: []
        };
        
        onAddTherapist(newTherapist);
        onClose();
      }
    }
  };

  const handleCancel = () => {
    setSelectedTherapistId('');
    onClose();
  };

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
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md space-y-6 modal-fade-in">
          <h3 className="text-2xl font-bold text-white">Add Therapist to Roster</h3>
          <p className="text-gray-400">
            Select a therapist from the master list to add to today&apos;s duty roster.
          </p>
          
          <div>
            <label 
              htmlFor="master-therapist-select" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Available Therapists
            </label>
            <select
              id="master-therapist-select"
              value={selectedTherapistId}
              onChange={(e) => setSelectedTherapistId(Number(e.target.value) || '')}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
            >
              <option value="">Select a therapist...</option>
              {availableTherapists.map((therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedTherapistId}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Add to Roster
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
