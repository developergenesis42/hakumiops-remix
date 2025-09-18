import { usePrintNode } from '~/hooks/usePrintNode';

interface PrintReceiptButtonProps {
  sessionData: {
    id: string;
    service: {
      name: string;
      duration: number;
      price: number;
      payout: number;
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
  const { getDefaultPrinter, printReceipt, isLoading, error } = usePrintNode();

  const handlePrintReceipt = async () => {
    try {
      // Get default printer automatically
      const defaultPrinter = await getDefaultPrinter();
      
      if (!defaultPrinter) {
        throw new Error('No printer available. Please check your printer setup.');
      }

      const receiptData = {
        sessionId: sessionData.id,
        clientName: sessionData.clientName || 'Walk-in Customer',
        service: sessionData.service.name,
        duration: sessionData.service.duration,
        price: sessionData.service.price,
        payout: sessionData.service.payout,
        therapist: sessionData.therapists.map(t => t.name).join(', '),
        room: sessionData.room.name,
        timestamp: new Date(sessionData.created_at).toLocaleString(),
        paymentMethod: sessionData.paymentMethod || 'Cash'
      };

      await printReceipt(defaultPrinter.id, receiptData);
    } catch (err) {
      console.error('Failed to print receipt:', err);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handlePrintReceipt}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
      >
        <span>🖨️</span>
        <span>{isLoading ? 'Printing...' : 'Print Sales Slip'}</span>
      </button>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm text-center">
          Error: {error}
        </div>
      )}
    </div>
  );
}
