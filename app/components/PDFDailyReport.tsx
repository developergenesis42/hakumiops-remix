import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFDailyReportProps {
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

export default function PDFDailyReport({ reportData, className = '' }: PDFDailyReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set up fonts and colors
      pdf.setFont('helvetica');
      
      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Daily Operations Report', 20, 20);
      
      // Date
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Report Date: ${reportData.date}`, 20, 30);
      
      // Generated timestamp
      const now = new Date();
      pdf.text(`Generated: ${now.toLocaleString()}`, 20, 35);
      
      let yPosition = 45;
      
      // Financial Summary Section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Financial Summary', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Total Revenue: ฿${reportData.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Total Sessions: ${reportData.totalSessions}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Total Walkouts: ${reportData.totalWalkouts}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Shop Expenses: ฿${reportData.shopExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20, yPosition);
      yPosition += 15;
      
      // Therapist Performance Section
      pdf.setFontSize(16);
      pdf.text('Therapist Performance', 20, yPosition);
      yPosition += 10;
      
      if (reportData.therapistBreakdown.length > 0) {
        pdf.setFontSize(10);
        reportData.therapistBreakdown.forEach((therapist, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.text(`${therapist.name}:`, 20, yPosition);
          pdf.text(`${therapist.sessions} sessions`, 80, yPosition);
          pdf.text(`฿${therapist.payout.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 130, yPosition);
          yPosition += 6;
        });
      } else {
        pdf.setFontSize(12);
        pdf.text('No therapist activity recorded', 20, yPosition);
        yPosition += 7;
      }
      
      yPosition += 10;
      
      // Walkout Analysis Section
      if (reportData.walkouts.length > 0) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(16);
        pdf.text('Walkout Analysis', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        reportData.walkouts.forEach((walkout, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.text(`${walkout.reason}: ${walkout.count} people`, 20, yPosition);
          yPosition += 6;
        });
      }
      
      // Shop Expenses Section
      if (reportData.shopExpenses.length > 0) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(16);
        pdf.text('Shop Expenses', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        reportData.shopExpenses.forEach((expense, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.text(`${expense.note}: ฿${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20, yPosition);
          yPosition += 6;
        });
      }
      
      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}`, 20, pdf.internal.pageSize.height - 10);
        pdf.text('Spa Operations Report', pdf.internal.pageSize.width - 60, pdf.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      const fileName = `Daily_Report_${reportData.date.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`${className} bg-red-600 hover:bg-red-500 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm flex items-center space-x-1`}
    >
      <span>📄</span>
      <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
    </button>
  );
}
