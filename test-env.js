// Test if environment variables are loaded
console.log('Testing environment variables...');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test Groq client initialization
try {
  const Groq = require('groq-sdk');
  console.log('Groq SDK loaded successfully');
  
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log('Groq client initialized successfully');
} catch (error) {
  console.error('Error with Groq:', error.message);
}
