/**
 * TEXT-TO-SPEECH API ROUTE
 *
 * Server-side ElevenLabs proxy for high-quality voice synthesis.
 * Keeps API key secure on server side.
 */

import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE || 'y2TOWGCXSYEgBanvKsYJ';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

interface TTSRequest {
  text: string;
  element?: string;
}

// Element-specific voice settings for natural variation
const ELEMENT_VOICE_SETTINGS: Record<string, { stability: number; similarity_boost: number; style: number }> = {
  fire: { stability: 0.65, similarity_boost: 0.80, style: 0.7 },     // More dynamic, passionate
  water: { stability: 0.85, similarity_boost: 0.90, style: 0.4 },   // Calm, flowing
  earth: { stability: 0.80, similarity_boost: 0.85, style: 0.3 },   // Grounded, steady
  air: { stability: 0.70, similarity_boost: 0.85, style: 0.6 },     // Light, expressive
  aether: { stability: 0.75, similarity_boost: 0.88, style: 0.5 },  // Balanced, ethereal
};

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, element = 'earth' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse (ElevenLabs has limits)
    const truncatedText = text.slice(0, 5000);

    // Check if ElevenLabs is configured
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'TTS service not configured', fallbackToBrowser: true },
        { status: 503 }
      );
    }

    // Get element-specific voice settings
    const voiceSettings = ELEMENT_VOICE_SETTINGS[element] || ELEMENT_VOICE_SETTINGS.earth;

    // Call ElevenLabs API
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: truncatedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          ...voiceSettings,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS API] ElevenLabs error:', response.status, errorText);

      // Return fallback signal for rate limits or temporary errors
      if (response.status === 429 || response.status >= 500) {
        return NextResponse.json(
          { error: 'TTS service temporarily unavailable', fallbackToBrowser: true },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'TTS generation failed' },
        { status: 500 }
      );
    }

    // Return audio data
    const audioData = await response.arrayBuffer();

    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      }
    });

  } catch (err) {
    console.error('[TTS API] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process TTS request', fallbackToBrowser: true },
      { status: 500 }
    );
  }
}
