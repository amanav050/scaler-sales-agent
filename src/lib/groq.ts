// Required environment variables:
// GROQ_API_KEY=your_groq_api_key_here (get from https://console.groq.com/keys)
// NEXT_PUBLIC_APP_URL=http://localhost:3000

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// For text generation
export async function chatCompletion(systemPrompt: string, userPrompt: string, useJsonFormat: boolean = false) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    ...(useJsonFormat && { response_format: { type: 'json_object' } })
  });
  return response.choices[0].message.content;
}

// For audio transcription
export async function transcribeAudio(audioBuffer: Buffer, fileName: string) {
  const uint8Array = new Uint8Array(audioBuffer);
  const transcription = await groq.audio.transcriptions.create({
    file: new File([uint8Array], fileName),
    model: 'whisper-large-v3',
    language: 'en',
    response_format: 'text'
  });
  return transcription;
}
