// @ts-nocheck
/**
 * TTS Route - OpenAI with macOS fallback for local development
 */
import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';
import { synthesizeSpeechMacOS } from '@/lib/tts/macosTts';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

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

    console.log(`🎤 TTS Request: ${text.length} chars`); // Never log content

    let buffer: Buffer;
    let contentType: string;

    // Check at runtime, not build time
    const useLocalFallback = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('placeholder');

    // Use macOS fallback if no valid OpenAI key (only works locally)
    if (useLocalFallback) {
      console.log('🍎 Using macOS TTS fallback (Samantha voice)');
      buffer = await synthesizeSpeechMacOS(text);
      contentType = 'audio/x-aiff';
    } else {
      // Generate speech using OpenAI TTS
      const audioResponse = await synthesizeSpeech({
        text,
        voice: voice || 'alloy',
        format: format || 'mp3',
        speed: speed || 1.0
      });
      buffer = Buffer.from(await audioResponse.arrayBuffer());
      contentType = 'audio/mpeg';
    }

    // Return audio with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
      }
    });

  } catch (error: any) {
    console.error('❌ TTS error:', error);

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