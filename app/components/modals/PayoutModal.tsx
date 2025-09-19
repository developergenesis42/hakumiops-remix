import { useState, useEffect, useCallback } from 'react';
import { Therapist, SessionWithDetails } from '~/types';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintPayout: (therapistId: string) => void;
  therapist: Therapist | null;
  completedSessions: SessionWithDetails[];
}

export default function PayoutModal({
  isOpen,
  onClose,
  onPrintPayout,
  therapist,
  completedSessions
}: PayoutModalProps) {
  const [grossPayout, setGrossPayout] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [netPayout, setNetPayout] = useState<number>(0);

  const calculateFinancials = useCallback(() => {
    if (!therapist) return;

    // Calculate gross payout from completed sessions
    let gross = 0;
    completedSessions.forEach(session => {
      if (session.therapist_ids?.includes(therapist.id)) {
        // Assuming equal split among therapists
        const payoutPerTherapist = session.payout / (session.therapist_ids?.length || 1);
        gross += payoutPerTherapist;
      }
    });

    // Calculate total expenses
    const expenses = therapist.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

    // Calculate net payout
    const net = gross - expenses;

    setGrossPayout(gross);
    setTotalExpenses(expenses);
    setNetPayout(net);
  }, [therapist, completedSessions]);

  // Calculate financials when modal opens or therapist changes
  useEffect(() => {
    if (isOpen && therapist) {
      calculateFinancials();
    }
  }, [isOpen, therapist, completedSessions, calculateFinancials]);

  // Format currency
  const formatCurrency = (value: number) => {
    return `฿${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const handlePrintPayout = () => {
    if (therapist) {
      onPrintPayout(therapist.id);
    }
  };

  const handleClose = () => {
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
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl space-y-4 modal-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Payout Summary</h2>
            <button
              onClick={handleClose}
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

          {/* Financial Summary */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h4 className="text-lg font-bold text-white mb-3">Financial Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Gross Payout:</span>
                <span className="font-semibold text-green-400">{formatCurrency(grossPayout)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total Expenses:</span>
                <span className="font-semibold text-red-400">-{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Net Payout:</span>
                  <span className={netPayout >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatCurrency(netPayout)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Summary */}
          {completedSessions.filter(s => s.therapist_ids?.includes(therapist.id)).length > 0 && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-2">Session Summary</h4>
              <div className="text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Sessions Completed:</span>
                  <span className="font-semibold text-white">
                    {completedSessions.filter(s => s.therapist_ids?.includes(therapist.id)).length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Expense Summary */}
          {therapist.expenses && therapist.expenses.length > 0 && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-2">Expense Details</h4>
              <div className="space-y-1 text-sm">
                {therapist.expenses.map((expense, index) => (
                  <div key={index} className="flex justify-between text-gray-300">
                    <span>{expense.name}:</span>
                    <span className="text-red-400">-{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleClose}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Close
            </button>
            <button
              onClick={handlePrintPayout}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Print Payout Slip
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
