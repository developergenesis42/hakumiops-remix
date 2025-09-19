import { Therapist } from '../types';

interface DepartureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeparture: (therapistId: string) => void;
  therapist: Therapist | null;
}

export default function DepartureModal({
  isOpen,
  onClose,
  onConfirmDeparture,
  therapist
}: DepartureModalProps) {

  const handleConfirm = () => {
    if (therapist) {
      onConfirmDeparture(therapist.id);
    }
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 modal-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Confirm Departure</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Therapist Info */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-2">{therapist.name}</h3>
            <div className="text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-white">{therapist.status}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="bg-yellow-900/30 border border-yellow-600/50 p-4 rounded-lg">
            <p className="text-yellow-200 text-sm">
              Are you sure you want to mark <strong>{therapist.name}</strong> as departed? 
              This will record their departure time and change their status to &quot;Departed&quot;.
            </p>
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
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Confirm Departure
            </button>
          </div>
        </div>
      </div>
    </>
  );
}