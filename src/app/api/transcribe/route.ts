import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  console.log('🎙️ Transcribe API endpoint called');
  
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    console.log('📁 Audio file details:', {
      name: audioFile?.name,
      size: audioFile?.size,
      type: audioFile?.type
    });
    
    if (!audioFile) {
      console.error('❌ No audio file provided');
      return Response.json({ error: 'No audio file' }, { status: 400 });
    }
    
    console.log('🤖 Starting transcription with Groq Whisper...');
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'en',
      response_format: 'text'
    });
    
    console.log('✅ Transcription completed successfully');
    console.log('📝 Transcript length:', transcription.length);
    
    return Response.json({ transcript: transcription });
    
  } catch (error) {
    console.error('💥 Transcription API error:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Transcription failed' 
    }, { status: 500 });
  }
}
