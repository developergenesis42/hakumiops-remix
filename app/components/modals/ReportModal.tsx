import { useState, useEffect } from 'react';
import { Therapist, SessionWithDetails, Walkout, ShopExpense, FinancialSummary } from '~/types';
import PrintDailyReportButton from '~/components/print/PrintDailyReportButton';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapists: Therapist[];
  completedSessions: SessionWithDetails[];
  walkouts: Walkout[];
  shopExpenses: ShopExpense[];
  financials: FinancialSummary;
}

export default function ReportModal({
  isOpen,
  onClose,
  therapists,
  completedSessions,
  walkouts,
  shopExpenses,
  financials
}: ReportModalProps) {
  const [reportDate, setReportDate] = useState<string>('');

  // Set report date when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      setReportDate(`Report generated on ${now.toLocaleDateString('en-US', options)}`);
    }
  }, [isOpen]);

  // Format currency
  const formatCurrency = (value: number) => {
    return `฿${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate walkout summary
  const getWalkoutSummary = () => {
    const totalIncidents = walkouts.length;
    const totalPeople = walkouts.reduce((sum, w) => sum + w.count, 0);
    const reasonCounts = walkouts.reduce((acc, w) => {
      acc[w.reason] = (acc[w.reason] || 0) + w.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncidents,
      totalPeople,
      reasonCounts
    };
  };

  // Calculate shop expenses summary
  const getShopExpensesSummary = () => {
    const total = shopExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      total,
      expenses: shopExpenses
    };
  };

  // Calculate therapist breakdown
  const getTherapistBreakdown = () => {
    const therapistPayouts: Record<string, {
      name: string;
      grossPayout: number;
      sessionCount: number;
      expenses: number;
      checkIn: string;
      checkOut: string;
      totalHours: string;
    }> = {};

    // Initialize therapist data
    therapists.forEach(t => {
      const totalHours = t.check_out_time 
        ? `${((new Date(t.check_out_time).getTime() - new Date(t.check_in_time || '').getTime()) / 3600000).toFixed(2)} hrs`
        : t.check_in_time ? 'Active' : 'N/A';
      
      therapistPayouts[t.id] = {
        name: t.name,
        grossPayout: 0,
        sessionCount: 0,
        expenses: t.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        checkIn: t.check_in_time ? formatTime(t.check_in_time) : 'N/A',
        checkOut: t.check_out_time ? formatTime(t.check_out_time) : 'N/A',
        totalHours: totalHours
      };
    });

    // Calculate payouts from completed sessions
    completedSessions.forEach(session => {
      const payoutPerTherapist = session.payout / (session.therapist_ids?.length || 1);
      session.therapist_ids?.forEach(id => {
        if (therapistPayouts[id]) {
          therapistPayouts[id].grossPayout += payoutPerTherapist;
          therapistPayouts[id].sessionCount++;
        }
      });
    });

    return Object.values(therapistPayouts);
  };

  const walkoutSummary = getWalkoutSummary();
  const shopExpensesSummary = getShopExpensesSummary();
  const therapistBreakdown = getTherapistBreakdown();

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
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl space-y-6 modal-fade-in max-h-[90vh] flex flex-col">
          {/* Header */}
          <div>
            <h3 className="text-2xl font-bold text-white">Daily Operations Report</h3>
            <p className="text-gray-400">{reportDate}</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto pr-4 space-y-6">
            {/* Financial Summary */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-2">Financial Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(financials.total_revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Shop Revenue</p>
                  <p className="text-xl font-semibold text-blue-400">
                    {formatCurrency(financials.shop_revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Gross Therapist Payouts</p>
                  <p className="text-xl font-semibold text-yellow-400">
                    {formatCurrency(financials.therapist_payouts)}
                  </p>
                </div>
              </div>
            </div>

            {/* Session Summary */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-2">Session Summary</h4>
              <p>
                Total Sessions Completed:{' '}
                <span className="font-bold text-white">{completedSessions.length}</span>
              </p>
            </div>

            {/* Walkout Summary */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-2">Walkout Summary</h4>
              <div>
                <p>
                  Total Incidents:{' '}
                  <span className="font-bold text-white">{walkoutSummary.totalIncidents}</span>
                  {' | '}
                  Total People:{' '}
                  <span className="font-bold text-white">{walkoutSummary.totalPeople}</span>
                </p>
                {Object.keys(walkoutSummary.reasonCounts).length > 0 && (
                  <div className="text-xs mt-2 text-gray-400">
                    {Object.entries(walkoutSummary.reasonCounts).map(([reason, count]) => (
                      <span key={reason} className="mr-2">
                        {reason}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Shop Expenses */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-2">Shop Expenses</h4>
              <div>
                <p>
                  Total:{' '}
                  <span className="font-bold text-white">
                    {formatCurrency(shopExpensesSummary.total)}
                  </span>
                </p>
                {shopExpensesSummary.expenses.length > 0 && (
                  <div className="text-xs mt-2 text-gray-400">
                    {shopExpensesSummary.expenses.map(expense => (
                      <span key={expense.id} className="mr-2">
                        {expense.note}: {formatCurrency(expense.amount)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Therapist Payout Breakdown */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-2">Therapist Payout Breakdown</h4>
              <div className="space-y-2">
                {therapistBreakdown.length === 0 ? (
                  <p className="text-gray-500">No therapists were on duty.</p>
                ) : (
                  therapistBreakdown.map((therapist, index) => {
                    const netPayout = therapist.grossPayout - therapist.expenses;
                    return (
                      <div key={index} className="bg-gray-800 p-3 rounded">
                        <div className="flex justify-between items-center font-bold text-white mb-2">
                          <span>{therapist.name}</span>
                          <span>{therapist.sessionCount} session(s)</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                          <span>
                            In: {therapist.checkIn} | Out: {therapist.checkOut} | Hours: {therapist.totalHours}
                          </span>
                        </div>
                        <div className="text-sm space-y-1 text-gray-300">
                          <div className="flex justify-between">
                            <span>Gross Payout:</span>
                            <span className="text-yellow-400">
                              {formatCurrency(therapist.grossPayout)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Expenses:</span>
                            <span className="text-red-400">
                              -{formatCurrency(therapist.expenses)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-600 mt-1 pt-1">
                            <strong>Net Payout:</strong>
                            <strong className={netPayout >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {formatCurrency(netPayout)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4">
            <PrintDailyReportButton
              reportData={{
                date: new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                totalRevenue: financials.total_revenue,
                totalSessions: completedSessions.length,
                totalWalkouts: walkouts.reduce((sum, w) => sum + w.count, 0),
                shopExpenses: shopExpenses.reduce((sum, e) => sum + e.amount, 0),
                therapistBreakdown: therapists.map(therapist => {
                  const therapistSessions = completedSessions.filter(session => 
                    session.therapist_ids.includes(therapist.id)
                  );
                  const totalPayout = therapistSessions.reduce((sum, session) => 
                    sum + (session.payout || 0), 0
                  );
                  return {
                    name: therapist.name,
                    sessions: therapistSessions.length,
                    payout: totalPayout
                  };
                }).filter(t => t.sessions > 0)
              }}
            />
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
