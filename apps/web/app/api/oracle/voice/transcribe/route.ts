import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Whisper STT endpoint
export async function POST(request: NextRequest) {
  try {
    // Get audio from form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert to format OpenAI expects
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

    // Create form data for OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('file', audioBlob, 'audio.webm');
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('language', 'en');
    openAIFormData.append('response_format', 'json');

    // Call OpenAI Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openAIFormData
    });

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text();
      console.error('Whisper API error:', error);
      throw new Error('Transcription failed');
    }

    const transcriptionData = await whisperResponse.json();

    // Return transcript with confidence score
    return NextResponse.json({
      success: true,
      transcript: transcriptionData.text || '',
      confidence: 0.95, // Whisper doesn't provide confidence, using default
      language: transcriptionData.language || 'en',
      duration: transcriptionData.duration
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}