import { useState, useCallback } from 'react';

interface PrintNodePrinter {
  id: number;
  name: string;
  default: boolean;
  state: string;
  description: string;
  computerId: number;
  computerName: string;
}

interface ReceiptData {
  sessionId?: string;
  clientName?: string;
  service: string;
  duration: number;
  price: number;
  payout: number;
  therapist: string;
  room: string;
  startTime?: string;
  endTime?: string;
  timestamp?: string;
  paymentMethod?: string;
  discount?: number;
  wob?: string;
  vip?: boolean;
}

interface DailyReportData {
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
}

export function usePrintNode() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrinters = useCallback(async (): Promise<PrintNodePrinter[]> => {
    try {
      setError(null);
      const response = await fetch('/api/printers');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch printers: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.printers || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch printers';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getDefaultPrinter = useCallback(async (): Promise<PrintNodePrinter | null> => {
    try {
      setError(null);
      const printers = await fetchPrinters();
      return printers.find(p => p.default) || printers[0] || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get default printer';
      setError(errorMessage);
      return null;
    }
  }, [fetchPrinters]);

  const printReceipt = useCallback(async (printerId: number, receiptData: ReceiptData, copies: number = 1): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'receipt',
          printerId,
          data: receiptData,
          copies: copies,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Print failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Receipt printed successfully (${copies} copies):`, result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to print receipt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const printDailyReport = useCallback(async (printerId: number, reportData: DailyReportData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'daily-report',
          printerId,
          data: reportData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Print failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Daily report printed successfully:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to print daily report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const printCustom = useCallback(async (printerId: number, content: string, title?: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'custom',
          printerId,
          data: { content, title },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Print failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Custom print job completed:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to print';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    fetchPrinters,
    getDefaultPrinter,
    printReceipt,
    printDailyReport,
    printCustom,
  };
}
