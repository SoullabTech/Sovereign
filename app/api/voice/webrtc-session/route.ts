import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * SOVEREIGNTY: OpenAI Realtime API quarantined.
 *
 * Was: WebRTC session proxy that forwarded SDP offers to
 *      https://api.openai.com/v1/realtime/calls and relayed the
 *      SDP answer back, using OpenAI Realtime for live voice conversation.
 *
 * Under zero-OpenAI doctrine, real-time voice uses:
 *   - Kokoro (local TTS) via /api/voice/local-tts
 *   - Browser Web Speech API (STT, client-side)
 *   - Claude via /api/oracle/conversation (conversation)
 *
 * See lib/ai/openaiPolicy.ts.
 */
export async function POST(req: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  return NextResponse.json(
    {
      error: 'WebRTC realtime sessions are disabled. MAIA uses local voice (Kokoro TTS + browser STT) and the oracle conversation API.',
      sovereigntyNote: 'OpenAI Realtime API is blocked under zero-access doctrine.',
      alternatives: {
        tts: '/api/voice/local-tts',
        stt: 'browser Web Speech API (client-side)',
        conversation: '/api/oracle/conversation',
      },
    },
    { status: 503 }
  );
}
