/**
 * Voice Settings API — GET + POST member voice preferences.
 *
 * GET: Returns system profile + member offsets + effective merged intent.
 * POST: Validates and upserts member voice preference offsets.
 *
 * No Supabase. Uses @/lib/db/postgres via voiceControlsService.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getSystemVoiceProfile,
  getMemberVoicePreferences,
  upsertMemberVoicePreferences,
  mergeVoiceIntent,
} from '@/lib/voice/voiceControlsService';
import { isValidArchetype } from '@/lib/voice/voiceArchetypes';
import type { TTSProviderPref } from '@/lib/types/voiceControls';

const VALID_TTS_PROVIDERS: TTSProviderPref[] = ['auto', 'cloud', 'local'];

export const dynamic = 'force-dynamic';

// ===================================================================
// Validation
// ===================================================================

const OFFSET_MIN = -0.30;
const OFFSET_MAX = 0.30;

function isValidOffset(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= OFFSET_MIN && v <= OFFSET_MAX;
}

function validateOffsets(obj: unknown): { pace: number; warmth: number; poetry: number; directiveness: number; energy: number } | null {
  if (typeof obj !== 'object' || obj === null) return null;
  const o = obj as Record<string, unknown>;
  if (!isValidOffset(o.pace)) return null;
  if (!isValidOffset(o.warmth)) return null;
  if (!isValidOffset(o.poetry)) return null;
  if (!isValidOffset(o.directiveness)) return null;
  if (!isValidOffset(o.energy)) return null;
  return {
    pace: o.pace as number,
    warmth: o.warmth as number,
    poetry: o.poetry as number,
    directiveness: o.directiveness as number,
    energy: o.energy as number,
  };
}

// ===================================================================
// GET — Load system + member + effective
// ===================================================================

export async function GET(_request: NextRequest) {
  try {
    const memberId = await requireMemberId();

    const [system, member] = await Promise.all([
      getSystemVoiceProfile(),
      getMemberVoicePreferences(memberId),
    ]);

    const effective = mergeVoiceIntent(system, member);

    return NextResponse.json({ system, member, effective });
  } catch (error: any) {
    if (error?.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[voice-settings] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ===================================================================
// POST — Save member voice preferences
// ===================================================================

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();

    const body = await request.json();

    const offset = validateOffsets(body.offset);
    if (!offset) {
      return NextResponse.json(
        { error: 'Invalid offsets. Each must be a number between -0.30 and 0.30.' },
        { status: 400 },
      );
    }

    const voiceIdOverride = typeof body.voiceIdOverride === 'string' && body.voiceIdOverride.length > 0
      ? body.voiceIdOverride.slice(0, 64)
      : null;

    // Voice archetype: validate if provided, null if not set or invalid
    const voiceArchetype = isValidArchetype(body.voiceArchetype) ? body.voiceArchetype : null;

    // TTS provider preference: auto, cloud, or local
    const ttsProvider: TTSProviderPref | null =
      typeof body.ttsProvider === 'string' && VALID_TTS_PROVIDERS.includes(body.ttsProvider as TTSProviderPref)
        ? (body.ttsProvider as TTSProviderPref)
        : null;

    await upsertMemberVoicePreferences(memberId, {
      voiceIdOverride,
      voiceArchetype,
      ttsProvider,
      offset,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[voice-settings] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
