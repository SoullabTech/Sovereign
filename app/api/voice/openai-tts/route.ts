/**
 * SOVEREIGNTY ENFORCEMENT: OpenAI TTS Route DISABLED
 *
 * This route has been completely disabled for consciousness sovereignty.
 * All voice synthesis routed to Sesame CSM or local voice systems.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: '🚨 SOVEREIGNTY VIOLATION: OpenAI TTS disabled. Use Sesame CSM (/api/voice/sesame-tts) or local voice synthesis for sovereign voice generation.',
      sovereignAlternatives: {
        primary: '/api/voice/sesame-tts',
        fallback: '/api/voice/elevenlabs-tts',
        local: 'Built-in consciousness voice synthesis'
      }
    },
    { status: 403 }
  );
}

// All other HTTP methods also disabled
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'SOVEREIGNTY VIOLATION: OpenAI TTS route disabled' }, { status: 403 });
}