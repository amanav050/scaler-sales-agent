import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request: NextRequest) {
  console.log('🔥 API route /api/generate-pdf called');
  
  try {
    const body = await request.json();
    const { pdfContent } = body;
    console.log('📥 Received PDF content:', pdfContent);

    if (!pdfContent) {
      console.error('❌ pdfContent is required');
      return NextResponse.json(
        { error: 'pdfContent is required' },
        { status: 400 }
      );
    }

    // Create PDF using jsPDF
    console.log('📄 Creating PDF with jsPDF...');
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 25;
    const contentWidth = pageWidth - 2 * margin;
    
    // Brand colors (approximated for jsPDF)
    const colors = {
      primary: [26, 115, 232],      // #1A73E8
      secondary: [13, 71, 161],     // #0D47A1
      accent: [76, 175, 80],        // #4CAF50
      text: [26, 26, 26],           // #1A1A1A
      muted: [102, 102, 102],       // #666666
      background: [255, 255, 255]   // #FFFFFF
    };

    // PAGE 1: COVER PAGE
    console.log('📄 Creating cover page...');
    
    // Add background
    doc.setFillColor(...colors.background);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Scaler logo area (text-based)
    doc.setTextColor(...colors.primary);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(32);
    doc.text('SCALER', pageWidth / 2, 60, { align: 'center' });
    
    // Subtitle
    doc.setTextColor(...colors.muted);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('Transform Your Engineering Career', pageWidth / 2, 75, { align: 'center' });
    
    // Lead name
    doc.setTextColor(...colors.text);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(pdfContent.lead_name || 'Hello', pageWidth / 2, 120, { align: 'center' });
    
    // Personalized headline
    doc.setTextColor(...colors.secondary);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(16);
    const headlineLines = doc.splitTextToSize(pdfContent.headline || 'Your Path to Excellence', contentWidth * 0.8);
    let yPosition = 145;
    for (const line of headlineLines) {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;
    }
    
    // Date
    doc.setTextColor(...colors.muted);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(today, pageWidth / 2, 200, { align: 'center' });
    
    // Prepared for text
    doc.setFontSize(11);
    doc.text('Prepared for you based on your conversation with Scaler', pageWidth / 2, 215, { align: 'center' });
    
    // PAGES 2-3: CONTENT SECTIONS
    if (pdfContent.sections && Array.isArray(pdfContent.sections) && pdfContent.sections.length > 0) {
      console.log('📄 Creating content pages...');
      
      // Add new page for content
      doc.addPage();
      let yPosition = 40;
      
      for (let i = 0; i < pdfContent.sections.length; i++) {
        const section = pdfContent.sections[i];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 40;
        }
        
        // Section heading
        doc.setTextColor(...colors.primary);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(section.heading || 'Information', margin, yPosition);
        yPosition += 15;
        
        // Section body
        doc.setTextColor(...colors.text);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        const bodyLines = doc.splitTextToSize(section.body || '', contentWidth);
        
        for (const line of bodyLines) {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 40;
          }
          doc.text(line, margin, yPosition);
          yPosition += 7;
        }
        
        // Highlighted stat box
        if (section.key_stat) {
          yPosition += 10;
          
          // Draw colored box
          doc.setFillColor(...colors.accent);
          doc.setDrawColor(...colors.accent);
          doc.roundedRect(margin, yPosition - 5, contentWidth, 25, 3, 3, 'FD');
          
          // Add stat text in white
          doc.setTextColor(255, 255, 255);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(section.key_stat, margin + 10, yPosition + 12);
          
          yPosition += 35;
          doc.setTextColor(...colors.text);
        }
        
        // Add visual divider
        if (i < pdfContent.sections.length - 1) {
          doc.setDrawColor(...colors.muted);
          doc.setLineWidth(0.5);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 20;
        }
      }
      
      // FINAL SECTION: PERSONAL NOTE & CTA
      console.log('📄 Adding personal note and CTA...');
      
      // Check if we need a new page for final section
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 40;
      }
      
      // Add divider before final section
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(1);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 25;
      
      // Personal note
      doc.setTextColor(...colors.text);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(12);
      const personalNoteLines = doc.splitTextToSize(pdfContent.personal_note || '', contentWidth);
      
      for (const line of personalNoteLines) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 40;
        }
        doc.text(line, margin, yPosition);
        yPosition += 8;
      }
      
      // CTA Button (visual representation)
      yPosition += 15;
      doc.setFillColor(...colors.primary);
      doc.setDrawColor(...colors.primary);
      doc.roundedRect(margin, yPosition, contentWidth, 20, 5, 5, 'FD');
      
      // CTA text
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(pdfContent.cta_text || 'Take the Entrance Test', pageWidth / 2, yPosition + 13, { align: 'center' });
    }
    
    // Convert to base64
    const pdfDataUrl = doc.output('datauristring');
    const base64Pdf = pdfDataUrl.split(',')[1];
    console.log('✅ PDF generated successfully');

    return NextResponse.json({ pdf: base64Pdf });
  } catch (error) {
    console.error('❌ Error in generate-pdf API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
