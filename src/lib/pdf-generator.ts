import jsPDF from 'jspdf';
import { PdfContent } from './types';

export function generatePdfBuffer(pdfContent: PdfContent): Buffer {
  const doc = new jsPDF();
  
  // Set up fonts and colors
  const primaryColor = [0, 51, 102]; // Dark blue
  const accentColor = [255, 128, 0]; // Orange accent
  const textGray = [64, 64, 64];
  const lightGray = [240, 240, 240];
  
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };
  
  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    const words = text.split(' ');
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };
  
  // Header with Scaler branding
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Scaler', margin, 28);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('School of Technology', margin + 35, 28);
  
  // Reset text color for content
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  yPosition = 55;
  
  // Personalized headline
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  
  const headlineLines = wrapText(pdfContent.headline, contentWidth);
  headlineLines.forEach((line, index) => {
    if (index > 0) checkPageBreak(10);
    doc.text(line, margin, yPosition);
    yPosition += 12;
  });
  
  yPosition += 10;
  
  // Lead name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`Personalized for ${pdfContent.leadName}`, margin, yPosition);
  yPosition += 20;
  
  // PDF Sections
  pdfContent.sections.forEach((section, sectionIndex) => {
    checkPageBreak(40);
    
    // Section heading with accent
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(section.heading, margin + 5, yPosition + 12);
    
    yPosition += 30;
    
    // Section body
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    
    const bodyLines = wrapText(section.body, contentWidth);
    bodyLines.forEach(line => {
      checkPageBreak(8);
      doc.text(line, margin, yPosition);
      yPosition += 7;
    });
    
    // Key stat if present
    if (section.keyStat) {
      checkPageBreak(20);
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(margin, yPosition, contentWidth, 15, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`Key Insight: ${section.keyStat}`, margin + 5, yPosition + 10);
      
      yPosition += 25;
    }
    
    yPosition += 10;
  });
  
  // Personal note
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Personal Note:', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  
  const noteLines = wrapText(pdfContent.personalNote, contentWidth);
  noteLines.forEach(line => {
    checkPageBreak(8);
    doc.text(line, margin, yPosition);
    yPosition += 7;
  });
  
  yPosition += 15;
  
  // CTA section
  checkPageBreak(40);
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(pdfContent.ctaText, margin + 5, yPosition + 12);
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Generated by Scaler Sales Assistant', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`© ${new Date().getFullYear()} Scaler Academy`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  // Convert to buffer
  return Buffer.from(doc.output('arraybuffer'));
}

export async function uploadPdfToVercelBlob(pdfBuffer: Buffer, fileName: string): Promise<string> {
  const { put } = await import('@vercel/blob');
  
  const blob = await put(`pdfs/${fileName}`, pdfBuffer, {
    access: 'public',
    contentType: 'application/pdf',
  });

  return blob.url;
}
