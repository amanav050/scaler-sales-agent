import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '../../../lib/groq';
import { PRE_SALES_NUDGE_SYSTEM_PROMPT, getPreSalesNudgeUserPrompt } from '../../../lib/prompts';
import { LeadProfile, NudgeResponse } from '../../../lib/types';

export async function POST(request: NextRequest) {
  console.log('🔧 API route /api/generate-nudge called');
  
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
    const { leadProfile }: { leadProfile: LeadProfile } = body;
    console.log('📋 Received leadProfile:', leadProfile);

    if (!leadProfile) {
      console.error('❌ leadProfile is missing');
      return NextResponse.json(
        { error: 'leadProfile is required' },
        { status: 400 }
      );
    }

    const systemPrompt = PRE_SALES_NUDGE_SYSTEM_PROMPT;
    const userPrompt = getPreSalesNudgeUserPrompt(leadProfile);
    console.log('🤖 Calling GROQ API with prompts...');

    const nudgeText = await chatCompletion(systemPrompt, userPrompt);
    console.log('📝 Generated nudge text:', nudgeText);

    const response: NudgeResponse = {
      nudgeText: nudgeText || 'Failed to generate nudge'
    };

    console.log('✅ Successfully returning response');
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error in generate-nudge API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate nudge' },
      { status: 500 }
    );
  }
}
