// @ts-nocheck
export const dynamic = 'force-dynamic';
/**
 * TTS Route - OpenAI with macOS fallback for local development
 */
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import { synthesizeSpeech } from '@/lib/tts/openaiTts';
import { synthesizeSpeechMacOS } from '@/lib/tts/macosTts';

// Skip during static export (Capacitor builds)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, format, speed, model } = body;

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
        speed: speed || 1.0,
        model: model || 'tts-1'
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
    console.error('❌ [openai-tts] failed', {
      message: error?.message,
      name: error?.name,
      status: error?.status,
      code: error?.code,
      type: error?.type,
    });

    // Log the key presence (not the key itself)
    console.log('🔑 OPENAI_API_KEY present?', Boolean(process.env.OPENAI_API_KEY));
    console.log('🔑 OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);

    return NextResponse.json(
      {
        error: 'Speech synthesis failed',
        details: error?.message || error?.response?.data || 'Unknown error',
        status: error?.status,
        code: error?.code,
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