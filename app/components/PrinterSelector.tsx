import React, { useState, useEffect } from 'react';
import { usePrintNode } from '~/hooks/usePrintNode';

interface PrintNodePrinter {
  id: number;
  name: string;
  default: boolean;
  state: string;
  description: string;
  computerId: number;
  computerName: string;
}

interface PrinterSelectorProps {
  selectedPrinterId?: number;
  onPrinterSelect: (printerId: number) => void;
  className?: string;
}

export default function PrinterSelector({ 
  selectedPrinterId, 
  onPrinterSelect, 
  className = '' 
}: PrinterSelectorProps) {
  const [printers, setPrinters] = useState<PrintNodePrinter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchPrinters } = usePrintNode();

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const printerList = await fetchPrinters();
      setPrinters(printerList);
      
      // Auto-select default printer if none selected
      if (!selectedPrinterId && printerList.length > 0) {
        const defaultPrinter = printerList.find(p => p.default) || printerList[0];
        onPrinterSelect(defaultPrinter.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load printers');
    } finally {
      setIsLoading(false);
    }
  };

  const getPrinterStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'paused':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPrinterStatusIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'paused':
        return '🟡';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-600">Loading printers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        <div className="flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button 
            onClick={loadPrinters}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (printers.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        <div className="flex items-center space-x-2">
          <span>🖨️</span>
          <span>No printers available</span>
          <button 
            onClick={loadPrinters}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Select Printer
      </label>
      <select
        value={selectedPrinterId || ''}
        onChange={(e) => onPrinterSelect(Number(e.target.value))}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Choose a printer...</option>
        {printers.map((printer) => (
          <option key={printer.id} value={printer.id}>
            {getPrinterStatusIcon(printer.state)} {printer.name}
            {printer.default && ' (Default)'}
            {` - ${printer.computerName}`}
          </option>
        ))}
      </select>
      
      {selectedPrinterId && (
        <div className="text-xs text-gray-500">
          {(() => {
            const selectedPrinter = printers.find(p => p.id === selectedPrinterId);
            if (selectedPrinter) {
              return (
                <div className="flex items-center space-x-2">
                  <span className={getPrinterStatusColor(selectedPrinter.state)}>
                    {selectedPrinter.state}
                  </span>
                  <span>•</span>
                  <span>{selectedPrinter.description}</span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
