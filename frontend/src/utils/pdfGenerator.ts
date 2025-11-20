// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from '@/store/transactionStore'; // ✅ Import Invoice type

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone?: string;
}

/**
 * Generates a PDF for a given Invoice.
 * Works with your store's Invoice type.
 */
export const generateTransactionPDF = async (
  transaction: Invoice,
  companyInfo: CompanyInfo
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Determine type (Sale vs Purchase)
  const title =
    transaction.Type === 'Sale'
      ? 'INVOICE'
      : transaction.Type === 'Purchase'
      ? 'PURCHASE BILL'
      : 'ESTIMATE';

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Company Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 15, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.address, 15, yPos);
  yPos += 5;
  doc.text(companyInfo.email, 15, yPos);
  if (companyInfo.phone) {
    yPos += 5;
    doc.text(companyInfo.phone, 15, yPos);
  }
  yPos += 10;

  // Transaction Details
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details:', 15, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Transaction ID: ${transaction.Transaction_ID}`, 15, yPos);
  doc.text(`Date: ${new Date(transaction.Date).toLocaleDateString()}`, pageWidth - 70, yPos);
  yPos += 5;
  doc.text(`Status: ${transaction.Status}`, 15, yPos);
  if (transaction.Payment_Mode) {
    doc.text(`Payment Mode: ${transaction.Payment_Mode}`, pageWidth - 70, yPos);
  }
  yPos += 10;

  // Party Info
  if (transaction.Party_Name) {
    doc.setFont('helvetica', 'bold');
    doc.text(transaction.Type === 'Sale' ? 'Bill To:' : 'Vendor:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(transaction.Party_Name, 15, yPos);
    yPos += 10;
  }

  // Line Items Table
  if (transaction.Line_Items && transaction.Line_Items.length > 0) {
    const tableData = transaction.Line_Items.map((item) => [
      item.Item_Name,
      item.Quantity.toString(),
      `$${parseFloat(item.Rate.toString()).toFixed(2)}`,
      `${item.Discount > 0 ? `-${parseFloat(item.Discount.toString()).toFixed(2)}%` : '-'}`,
      `$${parseFloat(item.Line_Total.toString()).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Qty', 'Rate', 'Discount', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Totals Section
  const totalsX = pageWidth - 70;
  doc.setFont('helvetica', 'normal');

  // Subtotal
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`$${transaction.Subtotal.toFixed(2)}`, totalsX + 40, yPos, { align: 'right' });
  yPos += 6;

  // GST
  if (transaction.GST_Rate && transaction.Tax_Amount) {
    doc.text(`GST (${transaction.GST_Rate}%):`, totalsX, yPos);
    doc.text(`$${transaction.Tax_Amount.toFixed(2)}`, totalsX + 40, yPos, { align: 'right' });
    yPos += 6;
  }

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalsX, yPos);
  doc.text(`$${transaction.Total_Amount.toFixed(2)}`, totalsX + 40, yPos, { align: 'right' });
  yPos += 10;

  // Notes (if any)
  if (transaction.Status === 'Pending') {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(200, 0, 0);
    doc.text('This invoice is pending payment.', 15, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
  }

  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

  // Save PDF
  const filename = `${title}_${transaction.Transaction_ID}_${new Date().getTime()}.pdf`;
  doc.save(filename);
};
