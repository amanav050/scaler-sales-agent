import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '../../../lib/groq';
import { EXTRACT_QUESTIONS_SYSTEM_PROMPT, getExtractQuestionsUserPrompt } from '../../../lib/prompts';

export async function POST(request: NextRequest) {
  console.log('� API route /api/extract-questions called');
  
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
    const { transcript }: { transcript: string } = body;
    console.log('� Received transcript length:', transcript?.length || 0);

    if (!transcript) {
      console.error('❌ transcript is missing');
      return NextResponse.json(
        { error: 'transcript is required' },
        { status: 400 }
      );
    }

    const systemPrompt = EXTRACT_QUESTIONS_SYSTEM_PROMPT;
    const userPrompt = getExtractQuestionsUserPrompt(transcript);
    console.log('🤖 Calling GROQ API with prompts...');

    const questionsText = await chatCompletion(systemPrompt, userPrompt, true);
    console.log('📝 Generated questions text:', questionsText);

    let questions;
    try {
      questions = JSON.parse(questionsText || '[]');
    } catch (parseError) {
      console.error('❌ Failed to parse questions JSON:', parseError);
      questions = [];
    }

    console.log('✅ Successfully returning response');
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('❌ Error in extract-questions API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract questions' },
      { status: 500 }
    );
  }
}
