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

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`PrintNode API error: ${response.status} ${response.statusText}`);
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
  async printJob(printerId: number, content: string, title: string = 'Spa Operations Print'): Promise<any> {
    try {
      const printJob: PrintJob = {
        printerId,
        title,
        contentType: 'raw_base64',
        content: Buffer.from(content).toString('base64'),
        source: 'Spa Operations App'
      };

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

  // Print a receipt (formatted text)
  async printReceipt(printerId: number, receiptData: {
    sessionId?: string;
    clientName?: string;
    service: string;
    duration: number;
    price: number;
    therapist: string;
    room: string;
    timestamp: string;
    paymentMethod?: string;
  }): Promise<any> {
    const receipt = this.generateReceiptText(receiptData);
    return this.printJob(printerId, receipt, `Receipt - ${receiptData.service}`);
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
  }): Promise<any> {
    const report = this.generateDailyReportText(reportData);
    return this.printJob(printerId, report, `Daily Report - ${reportData.date}`);
  }

  // Generate formatted receipt text
  private generateReceiptText(data: any): string {
    const lines = [];
    
    // Header
    lines.push('='.repeat(40));
    lines.push('           SPA RECEIPT');
    lines.push('='.repeat(40));
    lines.push('');
    
    // Service details
    lines.push(`Service: ${data.service}`);
    lines.push(`Duration: ${data.duration} minutes`);
    lines.push(`Therapist: ${data.therapist}`);
    lines.push(`Room: ${data.room}`);
    lines.push('');
    
    // Financial
    lines.push('-'.repeat(40));
    lines.push(`Amount: ฿${data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    if (data.paymentMethod) {
      lines.push(`Payment: ${data.paymentMethod}`);
    }
    lines.push('');
    
    // Footer
    lines.push(`Date: ${data.timestamp}`);
    if (data.sessionId) {
      lines.push(`Receipt #: ${data.sessionId}`);
    }
    lines.push('');
    lines.push('Thank you for your visit!');
    lines.push('='.repeat(40));
    
    return lines.join('\n');
  }

  // Generate formatted daily report text
  private generateDailyReportText(data: any): string {
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
      data.therapistBreakdown.forEach((therapist: any) => {
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

// Export singleton instance
export const printNodeService = new PrintNodeService();
