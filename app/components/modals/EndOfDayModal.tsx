import { useState } from 'react';

interface EndOfDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEndOfDay: () => void;
  // We'll add data props later when we implement data persistence
}

export default function EndOfDayModal({ isOpen, onClose, onConfirmEndOfDay }: EndOfDayModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // Call the actual end of day function
      await onConfirmEndOfDay();
      onClose();
    } catch (error) {
      console.error('Error ending day:', error);
      alert('Error ending day. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md space-y-6 modal-fade-in">
        <div className="text-center">
          <div className="text-6xl mb-4">🌅</div>
          <h3 className="text-2xl font-bold text-white mb-2">End of Day Confirmation</h3>
          <p className="text-gray-400">
            Are you sure you want to end the day? This will save today&apos;s final report to history 
            and reset the dashboard for the next day. This action cannot be undone.
          </p>
        </div>

        {/* Warning Section */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div className="text-sm text-yellow-200">
              <p className="font-semibold mb-2">This will:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-300">
                <li>Save today&apos;s final report to history</li>
                <li>Reset all therapist statuses to &quot;Rostered&quot;</li>
                <li>Clear all active sessions</li>
                <li>Reset all rooms to &quot;Available&quot;</li>
                <li>Clear today&apos;s bookings (keep future bookings)</li>
                <li>Reset financial counters</li>
                <li>Preserve walkouts and expenses for analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-red-700 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>🌅</span>
                <span>End Day & Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
