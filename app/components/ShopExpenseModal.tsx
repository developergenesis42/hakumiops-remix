import { useState, useEffect } from 'react';

interface ShopExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExpense: (expenseData: {
    amount: number;
    note: string;
  }) => void;
}

export default function ShopExpenseModal({
  isOpen,
  onClose,
  onConfirmExpense
}: ShopExpenseModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
    }
  }, [isOpen]);

  // Validation
  const isFormValid = () => {
    const amountNum = parseFloat(amount);
    return !isNaN(amountNum) && amountNum > 0 && note.trim().length > 0;
  };

  const handleConfirm = () => {
    if (!isFormValid()) return;

    const amountNum = parseFloat(amount);
    onConfirmExpense({
      amount: amountNum,
      note: note.trim()
    });

    onClose();
  };

  const handleCancel = () => {
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
          <h3 className="text-2xl font-bold text-white">Log a Shop Expense</h3>
          
          {/* Amount Input */}
          <div>
            <label htmlFor="shop-expense-amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount (฿)
            </label>
            <input
              id="shop-expense-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              placeholder="e.g., 500.00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Note Input */}
          <div>
            <label htmlFor="shop-expense-note" className="block text-sm font-medium text-gray-300 mb-2">
              Note / Description
            </label>
            <textarea
              id="shop-expense-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
              placeholder="e.g., Cleaning supplies"
            />
          </div>

          {/* Expense Preview */}
          {amount && note.trim() && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-2">Expense Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount:</span>
                  <span className="font-semibold text-red-400">
                    -฿{parseFloat(amount) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Description:</span>
                  <span className="text-white">{note.trim()}</span>
                </div>
              </div>
            </div>
          )}

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
              className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Log Expense
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
