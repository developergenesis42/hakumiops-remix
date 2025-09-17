import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EnhancedPDFDailyReportProps {
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
    therapists: Array<{
      name: string;
      status: string;
      checkIn?: string;
      checkOut?: string;
      totalExpenses: number;
      sessionCount: number;
    }>;
    walkouts: Array<{
      reason: string;
      count: number;
      created_at: string;
    }>;
    shopExpenses: Array<{
      note: string;
      amount: number;
      created_at: string;
    }>;
  };
  className?: string;
}

export default function EnhancedPDFDailyReport({ reportData, className = '' }: EnhancedPDFDailyReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateStyledPDF = async () => {
    setIsGenerating(true);
    
    try {
      if (!reportRef.current) {
        throw new Error('Report content not found');
      }

      // Create canvas from HTML content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const fileName = `Daily_Report_${reportData.date.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating styled PDF:', error);
      alert('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (value: number) => 
    `฿${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div>
      {/* Hidden report content for PDF generation */}
      <div ref={reportRef} className="hidden">
        <div style={{ 
          fontFamily: 'Arial, sans-serif', 
          padding: '20px', 
          backgroundColor: '#ffffff',
          color: '#000000',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', color: '#333' }}>Spa Operations</h1>
            <h2 style={{ fontSize: '22px', margin: '0', color: '#666' }}>Daily Operations Report</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: '10px 0 0 0' }}>
              Report Date: {reportData.date} | Generated: {new Date().toLocaleString()}
            </p>
          </div>

          {/* Financial Summary */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
              Financial Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Revenue</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                  {formatCurrency(reportData.totalRevenue)}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Sessions</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                  {reportData.totalSessions}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Walkouts</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
                  {reportData.totalWalkouts}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Shop Expenses</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6f42c1' }}>
                  {formatCurrency(reportData.shopExpenses)}
                </div>
              </div>
            </div>
          </div>

          {/* Therapist Performance */}
          {reportData.therapistBreakdown.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                Therapist Performance
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Therapist</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Sessions</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.therapistBreakdown.map((therapist, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{therapist.name}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{therapist.sessions}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                        {formatCurrency(therapist.payout)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Walkout Analysis */}
          {reportData.walkouts.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                Walkout Analysis
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {reportData.walkouts.map((walkout, index) => (
                  <div key={index} style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{walkout.reason}</div>
                    <div style={{ fontSize: '12px', color: '#856404' }}>{walkout.count} people at {formatTime(walkout.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shop Expenses */}
          {reportData.shopExpenses.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                Shop Expenses
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.shopExpenses.map((expense, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{expense.note}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                        {formatCurrency(expense.amount)}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        {formatTime(expense.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ccc', textAlign: 'center', fontSize: '10px', color: '#666' }}>
            <p>This report was generated automatically by the Spa Operations System</p>
            <p>For questions or concerns, please contact management</p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={generateStyledPDF}
        disabled={isGenerating}
        className={`${className} bg-red-600 hover:bg-red-500 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm flex items-center space-x-1`}
      >
        <span>📄</span>
        <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
      </button>
    </div>
  );
}
