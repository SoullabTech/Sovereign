/**
 * OpenAI TTS Route - Re-enabled for interim use until custom voice system
 */
import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, format, speed } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    console.log(`🎤 TTS Request: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Generate speech using OpenAI TTS
    const audioResponse = await synthesizeSpeech({
      text,
      voice: voice || 'alloy',
      format: format || 'mp3',
      speed: speed || 1.0
    });

    // Convert response to buffer
    const buffer = Buffer.from(await audioResponse.arrayBuffer());

    // Return audio with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      }
    });

  } catch (error: any) {
    console.error('❌ OpenAI TTS error:', error);

    return NextResponse.json(
      {
        error: 'Speech synthesis failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OpenAI TTS endpoint active',
    voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    usage: 'POST with { "text": "...", "voice": "alloy", "format": "mp3" }'
  });
}