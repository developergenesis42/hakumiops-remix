import React, { useState } from 'react';
import { usePrintNode } from '~/hooks/usePrintNode';
import PrinterSelector from './PrinterSelector';

interface PrintReceiptButtonProps {
  sessionData: {
    id: string;
    service: {
      name: string;
      duration: number;
      price: number;
    };
    therapists: Array<{ name: string }>;
    room: {
      name: string;
    };
    created_at: string;
    clientName?: string;
    paymentMethod?: string;
  };
  className?: string;
}

export default function PrintReceiptButton({ sessionData, className = '' }: PrintReceiptButtonProps) {
  const [selectedPrinterId, setSelectedPrinterId] = useState<number | undefined>();
  const [showPrinterSelector, setShowPrinterSelector] = useState(false);
  const { printReceipt, isLoading, error } = usePrintNode();

  const handlePrintReceipt = async () => {
    if (!selectedPrinterId) {
      setShowPrinterSelector(true);
      return;
    }

    try {
      const receiptData = {
        sessionId: sessionData.id,
        clientName: sessionData.clientName || 'Walk-in Customer',
        service: sessionData.service.name,
        duration: sessionData.service.duration,
        price: sessionData.service.price,
        therapist: sessionData.therapists.map(t => t.name).join(', '),
        room: sessionData.room.name,
        timestamp: new Date(sessionData.created_at).toLocaleString(),
        paymentMethod: sessionData.paymentMethod || 'Cash'
      };

      await printReceipt(selectedPrinterId, receiptData);
      
      // Close printer selector after successful print
      setShowPrinterSelector(false);
    } catch (err) {
      console.error('Failed to print receipt:', err);
    }
  };

  if (showPrinterSelector) {
    return (
      <div className={`space-y-3 p-4 bg-gray-100 rounded-lg ${className}`}>
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-800">Print Receipt</h4>
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
            onClick={handlePrintReceipt}
            disabled={!selectedPrinterId || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Printing...' : 'Print Receipt'}
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
      onClick={handlePrintReceipt}
      disabled={isLoading}
      className={`${className} bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm flex items-center space-x-1`}
    >
      <span>🖨️</span>
      <span>{isLoading ? 'Printing...' : 'Print Receipt'}</span>
    </button>
  );
}
