import React, { useState, useEffect } from 'react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // We'll add data props later when we implement data persistence
}

interface MonthlyData {
  month: string;
  totalRevenue: number;
  shopRevenue: number;
  therapistPayouts: number;
  totalSessions: number;
  totalWalkouts: number;
  totalWalkoutPeople: number;
  totalShopExpenses: number;
  therapistBreakdown: Array<{
    name: string;
    grossPayout: number;
    sessionCount: number;
    expenses: number;
    netPayout: number;
    checkIn: string;
    checkOut: string;
    totalHours: string;
  }>;
  walkoutReasons: Record<string, number>;
  shopExpenses: Array<{
    note: string;
    amount: number;
    timestamp: Date;
  }>;
}

export default function MonthlyReportModal({ isOpen, onClose }: MonthlyReportModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with current month
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(currentMonth);
      loadMonthlyData(currentMonth);
    }
  }, [isOpen]);

  const loadMonthlyData = async (month: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase query
      // For now, we'll generate mock data
      const mockData: MonthlyData = {
        month,
        totalRevenue: 125000,
        shopRevenue: 45000,
        therapistPayouts: 80000,
        totalSessions: 45,
        totalWalkouts: 12,
        totalWalkoutPeople: 18,
        totalShopExpenses: 2500,
        therapistBreakdown: [
          {
            name: 'Sarah Johnson',
            grossPayout: 15000,
            sessionCount: 8,
            expenses: 500,
            netPayout: 14500,
            checkIn: '09:00',
            checkOut: '18:00',
            totalHours: '9.0 hrs'
          },
          {
            name: 'Emma Wilson',
            grossPayout: 12000,
            sessionCount: 6,
            expenses: 300,
            netPayout: 11700,
            checkIn: '10:00',
            checkOut: '17:00',
            totalHours: '7.0 hrs'
          },
          {
            name: 'Lisa Chen',
            grossPayout: 18000,
            sessionCount: 10,
            expenses: 800,
            netPayout: 17200,
            checkIn: '08:30',
            checkOut: '19:00',
            totalHours: '10.5 hrs'
          }
        ],
        walkoutReasons: {
          'No Rooms': 5,
          'No Ladies': 3,
          'Price Too High': 2,
          'Client Too Picky': 1,
          'Chinese': 1,
          'Laowai': 0
        },
        shopExpenses: [
          { note: 'Cleaning supplies', amount: 800, timestamp: new Date() },
          { note: 'Towels', amount: 500, timestamp: new Date() },
          { note: 'Utilities', amount: 1200, timestamp: new Date() }
        ]
      };
      
      setMonthlyData(mockData);
    } catch (error) {
      console.error('Error loading monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    loadMonthlyData(month);
  };

  const formatCurrency = (value: number) => 
    `฿${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-4xl space-y-6 modal-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">Monthly Report</h3>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 rounded-md p-2"
          />
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto pr-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-white">Loading monthly data...</div>
            </div>
          ) : monthlyData ? (
            <>
              {/* Month Header */}
              <div className="bg-gray-900 p-4 rounded-lg text-center">
                <h4 className="text-xl font-bold text-white">{formatMonth(monthlyData.month)}</h4>
                <p className="text-gray-400">Monthly Operations Summary</p>
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-white mb-4">Financial Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(monthlyData.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Shop Revenue</p>
                    <p className="text-xl font-semibold text-blue-400">
                      {formatCurrency(monthlyData.shopRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Gross Therapist Payouts</p>
                    <p className="text-xl font-semibold text-yellow-400">
                      {formatCurrency(monthlyData.therapistPayouts)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Operations Summary */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-white mb-4">Operations Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Total Sessions</p>
                    <p className="text-xl font-bold text-white">{monthlyData.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Walkout Incidents</p>
                    <p className="text-xl font-bold text-red-400">{monthlyData.totalWalkouts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Walkout People</p>
                    <p className="text-xl font-bold text-orange-400">{monthlyData.totalWalkoutPeople}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Shop Expenses</p>
                    <p className="text-xl font-bold text-purple-400">
                      {formatCurrency(monthlyData.totalShopExpenses)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Walkout Analysis */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-white mb-4">Walkout Analysis</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Total Incidents: <span className="font-bold text-white">{monthlyData.totalWalkouts}</span> | 
                    Total People: <span className="font-bold text-white">{monthlyData.totalWalkoutPeople}</span>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(monthlyData.walkoutReasons).map(([reason, count]) => (
                      <div key={reason} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span className="text-gray-300">{reason}:</span>
                        <span className="font-bold text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shop Expenses */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-white mb-4">Shop Expenses</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Total: <span className="font-bold text-white">
                      {formatCurrency(monthlyData.totalShopExpenses)}
                    </span>
                  </p>
                  <div className="space-y-1">
                    {monthlyData.shopExpenses.map((expense, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded text-sm">
                        <span className="text-gray-300">{expense.note}:</span>
                        <span className="font-bold text-white">{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Therapist Breakdown */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-white mb-4">Therapist Performance Breakdown</h4>
                <div className="space-y-3">
                  {monthlyData.therapistBreakdown.map((therapist, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between items-center font-bold text-white mb-2">
                        <span>{therapist.name}</span>
                        <span>{therapist.sessionCount} session(s)</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        <span>In: {therapist.checkIn} | Out: {therapist.checkOut} | Hours: {therapist.totalHours}</span>
                      </div>
                      <div className="text-sm space-y-1 text-gray-300">
                        <div className="flex justify-between">
                          <span>Gross Payout:</span>
                          <span className="text-yellow-400">{formatCurrency(therapist.grossPayout)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Expenses:</span>
                          <span className="text-red-400">-{formatCurrency(therapist.expenses)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-600 mt-1 pt-1">
                          <strong>Net Payout:</strong>
                          <strong className="text-green-400">{formatCurrency(therapist.netPayout)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <p>No data available for the selected month</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center pt-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
