export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * SOVEREIGNTY: OpenAI Whisper STT quarantined.
 *
 * Whisper (cloud STT) sends audio data to OpenAI infrastructure.
 * Under zero-OpenAI doctrine, cloud STT is disabled.
 * Voice input uses browser-native Web Speech API (client-side, no data egress).
 *
 * Double-gated: production feature flag (ALLOW_AUDIO_UPLOADS) returns 410;
 * sovereignty block below returns 503 for any bypassed calls.
 *
 * See lib/ai/openaiPolicy.ts.
 */
import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { logAudioUsageEvent } from "@/lib/usage/audioUsage";

export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Feature gate: audio uploads disabled by default (local-only policy)
  if (process.env.ALLOW_AUDIO_UPLOADS !== 'true') {
    logAudioUsageEvent({
      memberId,
      route: "/api/voice/transcribe",
      kind: "transcription",
      bytes: 0,
      status: "rejected",
      errorCode: "FEATURE_DISABLED",
      meta: { reason: "ALLOW_AUDIO_UPLOADS not enabled" },
    });
    return NextResponse.json(
      { success: false, error: 'Audio uploads are disabled. Audio is stored locally on-device by default.' },
      { status: 410 }
    );
  }

  // SOVEREIGNTY: Cloud STT (Whisper) is blocked — zero-OpenAI doctrine.
  // Use browser-native Web Speech API for voice input; audio stays on-device.
  logAudioUsageEvent({
    memberId,
    route: "/api/voice/transcribe",
    kind: "transcription",
    bytes: 0,
    status: "rejected",
    errorCode: "CLOUD_STT_DISABLED",
    meta: { reason: "zero-OpenAI doctrine" },
  });
  return NextResponse.json(
    {
      success: false,
      error: "Cloud STT is disabled. Use browser speech recognition (Web Speech API) for voice input.",
      sovereigntyNote: "Audio data does not leave your device when using browser-native speech recognition.",
    },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  return NextResponse.json(
    { error: 'Cloud STT is disabled. See POST /api/voice/transcribe for details.' },
    { status: 503 }
  );
}
