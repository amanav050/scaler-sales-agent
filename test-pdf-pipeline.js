// Using built-in fetch (Node.js 18+)

// Test data for 3 different personas
const testLeads = [
  {
    name: "Priya Sharma",
    company: "TCS",
    role: "Software Engineer",
    yearsOfExperience: 3,
    intent: "Wants to transition to AI/ML roles",
    linkedinNotes: "Strong in Java, some Python experience",
    phone: "+919876543210"
  },
  {
    name: "Rahul Verma",
    company: "StartupXYZ",
    role: "Frontend Developer",
    yearsOfExperience: 5,
    intent: "Looking for full-stack skills and better salary",
    linkedinNotes: "React expert, wants to learn backend",
    phone: "+919876543211"
  },
  {
    name: "Anita Kumar",
    company: "Infosys",
    role: "QA Engineer",
    yearsOfExperience: 2,
    intent: "Career change to development",
    linkedinNotes: "Manual testing, some automation",
    phone: "+919876543212"
  }
];

// Sample transcript with open questions
const sampleTranscript = `
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

async function testPdfPipeline() {
  console.log('🧪 Testing PDF Pipeline with 3 different personas...\n');

  for (let i = 0; i < testLeads.length; i++) {
    const lead = testLeads[i];
    console.log(`\n--- Testing Persona ${i + 1}: ${lead.name} ---`);
    
    try {
      // Step 1: Extract questions from transcript
      console.log('1. Extracting questions from transcript...');
      const extractResponse = await fetch('http://localhost:3000/api/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: sampleTranscript })
      });
      
      if (!extractResponse.ok) {
        throw new Error(`Extract questions failed: ${extractResponse.status}`);
      }
      
      const questionsData = await extractResponse.json();
      console.log(`   ✓ Extracted ${questionsData.questions.length} questions`);
      
      // Step 2: Generate PDF content
      console.log('2. Generating personalized PDF content...');
      const contentResponse = await fetch('http://localhost:3000/api/generate-pdf-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadProfile: lead,
          openQuestions: questionsData.questions
        })
      });
      
      if (!contentResponse.ok) {
        throw new Error(`Generate PDF content failed: ${contentResponse.status}`);
      }
      
      const pdfContent = await contentResponse.json();
      console.log(`   ✓ Generated content with ${pdfContent.sections.length} sections`);
      console.log(`   ✓ Headline: "${pdfContent.headline}"`);
      
      // Step 3: Generate actual PDF
      console.log('3. Creating PDF document...');
      const pdfResponse = await fetch('http://localhost:3000/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfContent: pdfContent,
          leadName: lead.name
        })
      });
      
      if (!pdfResponse.ok) {
        throw new Error(`Generate PDF failed: ${pdfResponse.status}`);
      }
      
      const pdfData = await pdfResponse.json();
      console.log(`   ✓ PDF generated successfully`);
      if (pdfData.pdfUrl) {
        console.log(`   ✓ PDF URL: ${pdfData.pdfUrl}`);
      } else if (pdfData.pdfBase64) {
        console.log(`   ✓ PDF generated as base64 (${pdfData.pdfBase64.length} chars)`);
      }
      
      console.log(`✅ Persona ${i + 1} completed successfully!\n`);
      
    } catch (error) {
      console.error(`❌ Persona ${i + 1} failed:`, error.message);
    }
  }
  
  console.log('\n🎉 PDF Pipeline Test Complete!');
  console.log('📊 Check the results above to verify that the 3 PDFs look different based on:');
  console.log('   - Different headlines for each persona');
  console.log('   - Different sections based on their specific questions');
  console.log('   - Personalized content addressing their unique goals');
}

// Run the test
testPdfPipeline().catch(console.error);
