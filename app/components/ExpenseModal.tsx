import { useState, useEffect } from 'react';
import { Therapist } from '../types';

// Expense items from the HTML version
const EXPENSE_ITEMS = [
  { id: 'condom-12', name: 'Condom 12', price: 50 },
  { id: 'condom-24', name: 'Condom 24', price: 60 },
  { id: 'condom-36', name: 'Condom 36', price: 70 },
  { id: 'condom-48', name: 'Condom 48', price: 80 },
  { id: 'lube', name: 'Lube', price: 100 },
  { id: 'towel', name: 'Towel', price: 30 },
  { id: 'other', name: 'Other', price: 0 }
];

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExpense: (expenseData: {
    therapistId: string;
    itemId: string;
    amount: number;
    itemName: string;
  }) => void;
  therapist: Therapist | null;
}

export default function ExpenseModal({
  isOpen,
  onClose,
  onConfirmExpense,
  therapist
}: ExpenseModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItemId('');
      setCustomAmount('');
    }
  }, [isOpen]);

  // Get selected item details
  const selectedItem = EXPENSE_ITEMS.find(item => item.id === selectedItemId);
  const isCustomAmount = selectedItem?.id === 'other';
  const amount = isCustomAmount ? parseFloat(customAmount) || 0 : selectedItem?.price || 0;

  // Validation
  const isFormValid = () => {
    if (!selectedItemId) return false;
    if (isCustomAmount) {
      const customAmountNum = parseFloat(customAmount);
      return !isNaN(customAmountNum) && customAmountNum > 0;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!isFormValid() || !therapist || !selectedItem) return;

    onConfirmExpense({
      therapistId: therapist.id,
      itemId: selectedItem.id,
      amount: amount,
      itemName: selectedItem.name
    });

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
    if (itemId !== 'other') {
      setCustomAmount('');
    }
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
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md space-y-6 modal-fade-in">
          <h3 className="text-2xl font-bold text-white">
            Add Expense for <span className="text-indigo-400">{therapist.name}</span>
          </h3>
          
          {/* Item Selection */}
          <div>
            <label htmlFor="expense-item-select" className="block text-sm font-medium text-gray-300 mb-2">
              Item
            </label>
            <select
              id="expense-item-select"
              value={selectedItemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
            >
              <option value="">Select item...</option>
              {EXPENSE_ITEMS.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.price > 0 ? `(฿${item.price})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Amount Input (only shown for "Other" item) */}
          {isCustomAmount && (
            <div>
              <label htmlFor="custom-expense-amount" className="block text-sm font-medium text-gray-300 mb-2">
                Amount (฿)
              </label>
              <input
                id="custom-expense-amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
          )}

          {/* Amount Display */}
          {selectedItemId && !isCustomAmount && (
            <div className="bg-gray-900 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Amount:</span>
                <span className="text-xl font-bold text-green-400">฿{amount}</span>
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
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
