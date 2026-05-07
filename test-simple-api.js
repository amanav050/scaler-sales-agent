// Simple test without environment variables
const testTranscript = `
BDA: Hi Priya, thanks for your interest in Scaler. I see you're currently working at TCS as a Software Engineer with 3 years of experience. What's motivating you to look for a program right now?

Priya: I want to transition into AI/ML roles. I see lots of opportunities but I'm not sure if I have the right skills. What kind of AI projects do you cover in your program?

BDA: We have comprehensive AI coverage. You'll work on various AI projects throughout the program.

Priya: That's good to know, but can you be more specific? Like what kind of ML algorithms and frameworks will I learn? Also, what's the placement record for people transitioning to AI roles?

BDA: We have excellent placement records and our curriculum covers all major ML frameworks.

Priya: I'm also concerned about the time commitment. I'm working full-time, so how flexible is the schedule? And what's the total cost including any hidden fees?

BDA: The program is quite flexible and we have various payment options available.

Priya: One last question - do you have any alumni who successfully transitioned from regular software engineering to AI roles that I could talk to?

BDA: We have many successful alumni. I'll get back to you with specific details.
`;

async function testApiEndpoint() {
  console.log('Testing API endpoint with simple request...');
  
  try {
    const response = await fetch('http://localhost:3000/api/extract-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: testTranscript })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Success! Extracted questions:', data.questions?.length || 0);
    } else {
      console.log('❌ Error:', text);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testApiEndpoint();
