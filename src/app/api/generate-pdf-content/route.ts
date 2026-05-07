import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '../../../lib/groq';
import { POST_CALL_PDF_SYSTEM_PROMPT, getPostCallPdfUserPrompt } from '../../../lib/prompts';
import { SCALER_CONTEXT } from '../../../lib/scaler-context';

export async function POST(request: NextRequest) {
  console.log('� API route /api/generate-pdf-content called');
  
  try {
    // Check if GROQ_API_KEY is available
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY is not configured');
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }
    console.log('✅ GROQ_API_KEY is configured');
    
    const body = await request.json();
    const { leadProfile, openQuestions } = body;
    console.log('� Received leadProfile:', leadProfile);
    console.log('📋 Received openQuestions count:', openQuestions?.length || 0);

    if (!leadProfile || !openQuestions) {
      console.error('❌ leadProfile and openQuestions are required');
      return NextResponse.json(
        { error: 'leadProfile and openQuestions are required' },
        { status: 400 }
      );
    }

    const systemPrompt = POST_CALL_PDF_SYSTEM_PROMPT.replace('{scaler_context}', SCALER_CONTEXT);
    const userPrompt = getPostCallPdfUserPrompt(leadProfile, openQuestions);
    console.log('🤖 Calling GROQ API with prompts...');

    const pdfContentText = await chatCompletion(systemPrompt, userPrompt, true);
    console.log('📝 Generated PDF content text:', pdfContentText);

    let pdfContent;
    try {
      pdfContent = JSON.parse(pdfContentText || '{}');
    } catch (parseError) {
      console.error('❌ Failed to parse PDF content JSON:', parseError);
      pdfContent = {};
    }

    console.log('✅ Successfully returning response');
    return NextResponse.json(pdfContent);
  } catch (error) {
    console.error('❌ Error in generate-pdf-content API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF content' },
      { status: 500 }
    );
  }
}
