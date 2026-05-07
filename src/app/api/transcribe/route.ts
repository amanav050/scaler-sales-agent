import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;
  if (!audioFile) return Response.json({ error: 'No audio file' }, { status: 400 });
  
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-large-v3',
    language: 'en',
    response_format: 'text'
  });
  
  return Response.json({ transcript: transcription });
}
