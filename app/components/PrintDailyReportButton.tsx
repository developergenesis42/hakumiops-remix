import React, { useState } from 'react';
import { usePrintNode } from '~/hooks/usePrintNode';
import PrinterSelector from './PrinterSelector';

interface PrintDailyReportButtonProps {
  reportData: {
    date: string;
    totalRevenue: number;
    totalSessions: number;
    totalWalkouts: number;
    shopExpenses: number;
    therapistBreakdown: Array<{
      name: string;
      sessions: number;
      payout: number;
    }>;
  };
  className?: string;
}

export default function PrintDailyReportButton({ reportData, className = '' }: PrintDailyReportButtonProps) {
  const [selectedPrinterId, setSelectedPrinterId] = useState<number | undefined>();
  const [showPrinterSelector, setShowPrinterSelector] = useState(false);
  const { printDailyReport, isLoading, error } = usePrintNode();

  const handlePrintReport = async () => {
    if (!selectedPrinterId) {
      setShowPrinterSelector(true);
      return;
    }

    try {
      await printDailyReport(selectedPrinterId, reportData);
      
      // Close printer selector after successful print
      setShowPrinterSelector(false);
    } catch (err) {
      console.error('Failed to print daily report:', err);
    }
  };

  if (showPrinterSelector) {
    return (
      <div className="space-y-3 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-800">Print Daily Report</h4>
          <button
            onClick={() => setShowPrinterSelector(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <PrinterSelector
          selectedPrinterId={selectedPrinterId}
          onPrinterSelect={setSelectedPrinterId}
        />
        
        {error && (
          <div className="text-red-500 text-sm">
            Error: {error}
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={handlePrintReport}
            disabled={!selectedPrinterId || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Printing...' : 'Print Report'}
          </button>
          <button
            onClick={() => setShowPrinterSelector(false)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handlePrintReport}
      disabled={isLoading}
      className={`${className} bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm flex items-center space-x-1`}
    >
      <span>🖨️</span>
      <span>{isLoading ? 'Printing...' : 'Print Report'}</span>
    </button>
  );
}
