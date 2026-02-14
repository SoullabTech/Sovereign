/**
 * Voice Controls Service — load/save MAIA norm + member voice preferences.
 *
 * Uses @/lib/db/postgres ONLY. No Supabase. No cloud databases.
 * Graceful degradation: if reads fail, return defaults (never block conversation).
 */

import { query } from '@/lib/db/postgres';
import type {
  MemberVoicePreferences,
  SystemVoiceProfile,
  VoiceControlOffsets,
} from '@/lib/types/voiceControls';

// ===================================================================
// Defaults
// ===================================================================

const DEFAULT_OFFSETS: VoiceControlOffsets = {
  pace: 0,
  warmth: 0,
  poetry: 0,
  directiveness: 0,
  energy: 0,
};

const DEFAULT_SYSTEM_PROFILE: SystemVoiceProfile = {
  voiceId: 'maia',
  base: { ...DEFAULT_OFFSETS },
};

const DEFAULT_MEMBER_PREFS: MemberVoicePreferences = {
  voiceIdOverride: null,
  offset: { ...DEFAULT_OFFSETS },
};

// ===================================================================
// System Voice Profile (singleton)
// ===================================================================

export async function getSystemVoiceProfile(): Promise<SystemVoiceProfile> {
  try {
    const result = await query(
      `SELECT voice_id, pace_base, warmth_base, poetry_base, directiveness_base, energy_base
       FROM system_voice_profile
       WHERE id = 'maia_default'`,
    );

    if (result.rows.length === 0) {
      return DEFAULT_SYSTEM_PROFILE;
    }

    const row = result.rows[0];
    return {
      voiceId: row.voice_id,
      base: {
        pace: row.pace_base,
        warmth: row.warmth_base,
        poetry: row.poetry_base,
        directiveness: row.directiveness_base,
        energy: row.energy_base,
      },
    };
  } catch (error) {
    console.warn('[voice-controls] Failed to load system profile:', error instanceof Error ? error.message : error);
    return DEFAULT_SYSTEM_PROFILE;
  }
}

export async function updateSystemVoiceProfile(
  profile: SystemVoiceProfile,
  updatedBy?: string,
): Promise<void> {
  await query(
    `UPDATE system_voice_profile SET
       voice_id = $1,
       pace_base = $2,
       warmth_base = $3,
       poetry_base = $4,
       directiveness_base = $5,
       energy_base = $6,
       updated_by = $7
     WHERE id = 'maia_default'`,
    [
      profile.voiceId,
      profile.base.pace,
      profile.base.warmth,
      profile.base.poetry,
      profile.base.directiveness,
      profile.base.energy,
      updatedBy ?? null,
    ],
  );
}

// ===================================================================
// Member Voice Preferences
// ===================================================================

export async function getMemberVoicePreferences(
  memberId: string,
): Promise<MemberVoicePreferences> {
  try {
    const result = await query(
      `SELECT voice_id_override, pace_offset, warmth_offset, poetry_offset, directiveness_offset, energy_offset
       FROM member_voice_preferences
       WHERE member_id = $1`,
      [memberId],
    );

    if (result.rows.length === 0) {
      return DEFAULT_MEMBER_PREFS;
    }

    const row = result.rows[0];
    return {
      voiceIdOverride: row.voice_id_override,
      offset: {
        pace: row.pace_offset,
        warmth: row.warmth_offset,
        poetry: row.poetry_offset,
        directiveness: row.directiveness_offset,
        energy: row.energy_offset,
      },
    };
  } catch (error) {
    console.warn('[voice-controls] Failed to load member prefs:', error instanceof Error ? error.message : error);
    return DEFAULT_MEMBER_PREFS;
  }
}

export async function upsertMemberVoicePreferences(
  memberId: string,
  prefs: MemberVoicePreferences,
): Promise<void> {
  await query(
    `INSERT INTO member_voice_preferences
       (member_id, voice_id_override, pace_offset, warmth_offset, poetry_offset, directiveness_offset, energy_offset)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (member_id) DO UPDATE SET
       voice_id_override = $2,
       pace_offset = $3,
       warmth_offset = $4,
       poetry_offset = $5,
       directiveness_offset = $6,
       energy_offset = $7`,
    [
      memberId,
      prefs.voiceIdOverride ?? null,
      prefs.offset.pace,
      prefs.offset.warmth,
      prefs.offset.poetry,
      prefs.offset.directiveness,
      prefs.offset.energy,
    ],
  );
}

// ===================================================================
// Merge Helper (for conductor)
// ===================================================================

/**
 * Merge system base + member offsets into effective intent.
 * This is the target the conductor modulates from.
 */
export function mergeVoiceIntent(
  system: SystemVoiceProfile,
  member: MemberVoicePreferences,
): { voiceId: string; intent: VoiceControlOffsets } {
  return {
    voiceId: member.voiceIdOverride || system.voiceId,
    intent: {
      pace: system.base.pace + member.offset.pace,
      warmth: system.base.warmth + member.offset.warmth,
      poetry: system.base.poetry + member.offset.poetry,
      directiveness: system.base.directiveness + member.offset.directiveness,
      energy: system.base.energy + member.offset.energy,
    },
  };
}
