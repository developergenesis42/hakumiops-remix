import { useState, useEffect } from 'react';
import { Therapist } from '~/types';

interface RosterTherapist {
  id: number;
  name: string;
  vip_number: number | null;
}

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
  const [availableTherapists, setAvailableTherapists] = useState<RosterTherapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available therapists from roster when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTherapistId('');
      setError(null);
      fetchAvailableTherapists();
    }
  }, [isOpen, currentTherapists]);

  const fetchAvailableTherapists = async () => {
    setLoading(true);
    try {
      const currentTherapistNames = currentTherapists.map(t => t.name);
      const excludeParams = currentTherapistNames.length > 0 
        ? `?exclude=${currentTherapistNames.join(',')}` 
        : '';
      
      const response = await fetch(`/api/roster${excludeParams}`, {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch roster');
      }
      
      setAvailableTherapists(result.data || []);
    } catch (err) {
      console.error('Error fetching available therapists:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch available therapists');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedTherapistId) {
      const selectedRosterTherapist = availableTherapists.find(
        t => t.id === selectedTherapistId
      );
      
      if (selectedRosterTherapist) {
        // Convert roster therapist to Therapist type
        const newTherapist: Omit<Therapist, 'id' | 'created_at' | 'updated_at'> = {
          name: selectedRosterTherapist.name,
          is_on_duty: true,
          status: 'Rostered',
          check_in_time: null,
          check_out_time: null,
          active_room_id: null,
          completed_room_ids: [],
          expenses: [],
          vip_number: selectedRosterTherapist.vip_number
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
            Select a therapist from the roster to add to today&apos;s duty roster.
          </p>
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchAvailableTherapists}
                className="text-xs underline mt-1 hover:text-red-100"
              >
                Try again
              </button>
            </div>
          )}
          
          <div>
            <label 
              htmlFor="roster-therapist-select" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Available Therapists {loading && <span className="text-blue-400">(Loading...)</span>}
            </label>
            <select
              id="roster-therapist-select"
              value={selectedTherapistId}
              onChange={(e) => setSelectedTherapistId(Number(e.target.value) || '')}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              disabled={loading}
            >
              <option value="">
                {loading ? 'Loading therapists...' : 
                 availableTherapists.length === 0 ? 'No available therapists' :
                 'Select a therapist...'}
              </option>
              {availableTherapists.map((therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name} {therapist.vip_number && `(#${therapist.vip_number})`}
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
              disabled={!selectedTherapistId || loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              {loading ? 'Loading...' : 'Add to Roster'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
