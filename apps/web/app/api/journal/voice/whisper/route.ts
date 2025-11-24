import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const userId = formData.get('userId') as string || 'beta-user';
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language,
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    });

    return NextResponse.json({
      success: true,
      transcript: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      words: transcription.words,
      segments: transcription.segments
    });

  } catch (error: any) {
    console.error('Whisper transcription error:', error);

    if (error?.response?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Transcription failed', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/journal/voice/whisper',
    method: 'POST',
    description: 'Transcribe audio to text using OpenAI Whisper',
    parameters: {
      audio: 'Audio file (required)',
      userId: 'User ID (optional, default: beta-user)',
      language: 'Language code (optional, default: en)'
    },
    supportedFormats: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'],
    maxFileSize: '25MB'
  });
}