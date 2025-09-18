// PrintNode API integration for server-side printing
// This keeps your API key secure on the server

interface PrintNodePrinter {
  id: number;
  name: string;
  default: boolean;
  state: string;
  description: string;
  computerId: number;
  computerName: string;
}

interface PrintJob {
  printerId: number;
  title: string;
  contentType: string;
  content: string;
  source: string;
}

export class PrintNodeService {
  private apiKey: string;
  private baseUrl = 'https://api.printnode.com';

  constructor() {
    this.apiKey = process.env.PRINTNODE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('PRINTNODE_API_KEY environment variable is required');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const auth = Buffer.from(`${this.apiKey}:`).toString('base64');

    console.log('PrintNode API Request:', {
      url,
      method: options.method || 'GET',
      hasBody: !!options.body,
      bodyLength: options.body ? options.body.toString().length : 0
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('PrintNode API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PrintNode API Error Response:', errorText);
      throw new Error(`PrintNode API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Get list of available printers
  async getPrinters(): Promise<PrintNodePrinter[]> {
    try {
      const printers = await this.makeRequest('/printers');
      return printers;
    } catch (error) {
      console.error('Error fetching printers:', error);
      throw error;
    }
  }

  // Get default printer
  async getDefaultPrinter(): Promise<PrintNodePrinter | null> {
    try {
      const printers = await this.getPrinters();
      return printers.find(p => p.default) || printers[0] || null;
    } catch (error) {
      console.error('Error getting default printer:', error);
      return null;
    }
  }

  // Submit a print job
  async printJob(printerId: number, content: string, title: string = 'Spa Operations Print', contentType: string = 'raw_base64'): Promise<{ id: number; printer: { id: number; name: string } }> {
    try {
      // Debug: Validate the content before sending
      if (contentType === 'raw_base64') {
        const rawBuffer = Buffer.from(content, 'base64');
        const rawText = rawBuffer.toString('utf8');
        console.log('PrintJob Debug - Raw content length:', content.length);
        console.log('PrintJob Debug - Decoded size:', rawBuffer.length, 'bytes');
        console.log('PrintJob Debug - Content type:', contentType);
        console.log('PrintJob Debug - First 50 chars:', rawText.substring(0, 50));
        
        // Check if it's ESC/POS data (should start with ESC command)
        if (!rawText.startsWith('\x1B')) {
          console.warn('Warning: Content does not appear to be ESC/POS data');
        }
      }

      const printJob: PrintJob = {
        printerId,
        title,
        contentType,
        content: content, // content is already base64 encoded
        source: 'Spa Operations App'
      };

      // Debug: Log the print job details (without the full content)
      console.log('PrintJob Details:', {
        printerId: printJob.printerId,
        title: printJob.title,
        contentType: printJob.contentType,
        contentLength: printJob.content.length,
        source: printJob.source
      });

      const result = await this.makeRequest('/printjobs', {
        method: 'POST',
        body: JSON.stringify(printJob),
      });

      return result;
    } catch (error) {
      console.error('Error submitting print job:', error);
      throw error;
    }
  }

  // Print a receipt (ESC/POS raw)
  async printReceipt(printerId: number, receiptData: {
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
    timestamp: string;
    paymentMethod?: string;
    discount?: number;
    wob?: string;
    vip?: boolean;
  }): Promise<{ id: number; printer: { id: number; name: string } }> {
    const escPosData = this.generateReceiptESC_POS(receiptData);
    return this.printJob(printerId, escPosData, `Receipt - ${receiptData.service}`, 'raw_base64');
  }

  // Print multiple copies of receipt (ESC/POS raw)
  async printReceiptCopies(printerId: number, receiptData: {
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
    timestamp: string;
    paymentMethod?: string;
    discount?: number;
    wob?: string;
    vip?: boolean;
  }, copies: number = 1): Promise<{ id: number; printer: { id: number; name: string } }[]> {
    const printJobs = [];
    
    // Generate separate ESC/POS data for each copy
    for (let i = 0; i < copies; i++) {
      const escPosData = this.generateReceiptESC_POS(receiptData);
      const job = await this.printJob(printerId, escPosData, `Receipt Copy ${i + 1} - ${receiptData.service}`, 'raw_base64');
      printJobs.push(job);
    }
    
    return printJobs;
  }

  // Print a daily report
  async printDailyReport(printerId: number, reportData: {
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
  }): Promise<{ id: number; printer: { id: number; name: string } }> {
    const report = this.generateDailyReportText(reportData);
    return this.printJob(printerId, report, `Daily Report - ${reportData.date}`);
  }

  // Generate ESC/POS receipt
  private generateReceiptESC_POS(data: { 
    service: string; 
    duration: number; 
    price: number; 
    payout: number;
    therapist: string; 
    room: string; 
    startTime?: string;
    endTime?: string;
    timestamp: string; 
    paymentMethod?: string; 
    sessionId?: string; 
    clientName?: string;
    discount?: number;
    wob?: string;
    vip?: boolean;
  }): string {
    try {
      // ESC/POS commands
      const ESC = '\x1B';
      const GS = '\x1D';
      const LF = '\x0A';
      
      let receipt = '';
      
      // Initialize printer
      receipt += ESC + '@'; // Initialize printer
      
      // Center alignment for header
      receipt += ESC + 'a' + '\x01'; // Center alignment
      receipt += ESC + '!' + '\x38'; // Triple height and width + bold
      receipt += 'HAKUMI NURU MASSAGE' + LF;
      
      // Reset formatting
      receipt += ESC + '!' + '\x00'; // Normal text
      receipt += ESC + 'a' + '\x00'; // Left alignment
      receipt += 'Receipt' + LF;
      
      // Line separator
      receipt += '--------------------------------' + LF;
      
      // Session details
      if (data.sessionId) {
        receipt += `Session ID: ${data.sessionId}` + LF;
      }
      
      // Format date from timestamp
      const date = new Date(data.timestamp);
      const dateStr = date.toLocaleDateString('th-TH', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      receipt += `Date: ${dateStr}` + LF + LF;
      
      // Calculate start and end times
      const startTime = data.startTime || date.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      const endTime = data.endTime || new Date(date.getTime() + data.duration * 60000).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      // Bold and large sections for critical info
      receipt += ESC + 'E' + '\x01'; // Bold on
      receipt += ESC + '!' + '\x18'; // Double height
      receipt += `Start Time: ${startTime}` + LF;
      receipt += `End Time: ${endTime}` + LF;
      receipt += `Room: ${data.room}` + LF;
      receipt += `Therapist(s): ${data.therapist}` + LF;
      receipt += `Package: ${data.service}` + LF;
      receipt += ESC + '!' + '\x00'; // Normal height
      receipt += ESC + 'E' + '\x00'; // Bold off
      
      // Line separator
      receipt += LF + '--------------------------------' + LF;
      
      // Financial section
      const shopRevenue = data.price - data.payout;
      
      receipt += ESC + '!' + '\x18'; // Double height
      receipt += `TOTAL: ${data.price.toLocaleString('en-US')} THB` + LF;
      receipt += ESC + '!' + '\x00'; // Normal text
      
      receipt += LF;
      receipt += `lady payout: ${data.payout.toLocaleString('en-US')} THB` + LF;
      receipt += `shop revenue: ${shopRevenue.toLocaleString('en-US')} THB` + LF;
      
      // Optional metadata (smaller text at bottom)
      if (data.discount && data.discount > 0) {
        receipt += LF + `Discount: -${data.discount} THB` + LF;
      }
      
      // Cut paper and feed
      receipt += LF + LF + LF; // Extra spacing
      receipt += GS + 'V' + '\x00'; // Full cut
      
      // Convert to base64
      const base64Data = Buffer.from(receipt, 'utf8').toString('base64');
      
      console.log('ESC/POS Receipt Debug:', {
        receiptLength: receipt.length,
        base64Length: base64Data.length,
        firstChars: receipt.substring(0, 50)
      });
      
      return base64Data;
    } catch (error) {
      console.error('Error generating ESC/POS receipt:', error);
      throw new Error(`Failed to generate ESC/POS receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate formatted daily report text
  private generateDailyReportText(data: { date: string; totalRevenue: number; totalSessions: number; totalWalkouts: number; shopExpenses: number; therapistBreakdown: Array<{ name: string; sessions: number; payout: number }> }): string {
    const lines = [];
    
    // Header
    lines.push('='.repeat(50));
    lines.push('           DAILY REPORT');
    lines.push(`           ${data.date}`);
    lines.push('='.repeat(50));
    lines.push('');
    
    // Summary
    lines.push('SUMMARY:');
    lines.push(`Total Revenue: ฿${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    lines.push(`Total Sessions: ${data.totalSessions}`);
    lines.push(`Total Walkouts: ${data.totalWalkouts}`);
    lines.push(`Shop Expenses: ฿${data.shopExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    lines.push('');
    
    // Therapist breakdown
    if (data.therapistBreakdown && data.therapistBreakdown.length > 0) {
      lines.push('THERAPIST PERFORMANCE:');
      lines.push('-'.repeat(50));
      data.therapistBreakdown.forEach((therapist: { name: string; sessions: number; payout: number }) => {
        lines.push(`${therapist.name}:`);
        lines.push(`  Sessions: ${therapist.sessions}`);
        lines.push(`  Payout: ฿${therapist.payout.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        lines.push('');
      });
    }
    
    lines.push('='.repeat(50));
    
    return lines.join('\n');
  }
}

// Export singleton instance (lazy-loaded)
let _printNodeService: PrintNodeService | null = null;

export function getPrintNodeService(): PrintNodeService {
  if (!_printNodeService) {
    _printNodeService = new PrintNodeService();
  }
  return _printNodeService;
}
