import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppResponse } from '../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, mediaUrl }: { to: string; message: string; mediaUrl?: string } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const cleanPhone = to.replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Create the full message with PDF URL if provided
    let fullMessage = message;
    if (mediaUrl) {
      fullMessage = `${message}\n\n📎 View PDF: ${mediaUrl}`;
    }

    // Create wa.me deep link
    const waMeUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;

    const response: WhatsAppResponse = {
      success: true,
      messageId: `wa.me-${Date.now()}`, // Generate a fake message ID for consistency
      waMeUrl
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating WhatsApp link:', error);
    const response: WhatsAppResponse = {
      success: false,
      error: 'Failed to create WhatsApp link'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
