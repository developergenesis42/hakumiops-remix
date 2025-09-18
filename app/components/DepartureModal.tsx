import { useState, useEffect, useCallback } from 'react';
import { Therapist, SessionWithDetails } from '../types';

interface DepartureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeparture: (therapistId: string) => void;
  therapist: Therapist | null;
  completedSessions: SessionWithDetails[];
}

export default function DepartureModal({
  isOpen,
  onClose,
  onConfirmDeparture,
  therapist,
  completedSessions
}: DepartureModalProps) {
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
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md space-y-6 modal-fade-in">
          <h3 className="text-2xl font-bold text-white">
            Departure Tally for <span className="text-red-400">{therapist.name}</span>
          </h3>
          
          {/* Financial Summary */}
          <div className="space-y-4 bg-gray-900 p-4 rounded-lg">
            {/* Gross Payout */}
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Gross Payout:</span>
              <span className="font-semibold text-yellow-400">
                {formatCurrency(grossPayout)}
              </span>
            </div>
            
            {/* Total Expenses */}
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Total Expenses:</span>
              <span className="font-semibold text-red-400">
                -{formatCurrency(totalExpenses)}
              </span>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-600 mt-2 pt-2"></div>
            
            {/* Final Payout */}
            <div className="flex justify-between text-2xl font-bold">
              <span className="text-white">Final Payout:</span>
              <span className={`${netPayout >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netPayout)}
              </span>
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
