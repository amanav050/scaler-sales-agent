// Simple test script to verify nudge generation works
import { chatCompletion } from './src/lib/groq.js';
import { PRE_SALES_NUDGE_SYSTEM_PROMPT, getPreSalesNudgeUserPrompt } from './src/lib/prompts.js';

async function testNudgeGeneration() {
  console.log('Testing Rohan Sharma persona...');
  
  const rohanProfile = {
    name: "Rohan Sharma",
    company: "TCS",
    role: "Software Engineer",
    yearsOfExperience: 4,
    intent: "want to switch to a product company, interested in AI engineering roles",
    linkedinNotes: "B.Tech CSE VIT Vellore '20, SDE-2 at TCS for 4 years (banking clients: HDFC, Citi), recent AWS Solutions Architect cert"
  };

  try {
    const systemPrompt = PRE_SALES_NUDGE_SYSTEM_PROMPT;
    const userPrompt = getPreSalesNudgeUserPrompt(rohanProfile);
    
    const nudgeText = await chatCompletion(systemPrompt, userPrompt);
    
    console.log('\n=== GENERATED NUDGE FOR ROHAN ===');
    console.log(nudgeText);
    console.log('=== END NUDGE ===\n');
    
  } catch (error) {
    console.error('Error generating nudge:', error);
  }
}

testNudgeGeneration();
