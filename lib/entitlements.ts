/**
 * Entitlements - Central source of truth for tier-based feature access
 *
 * Route access is controlled by middleware + accessMatrix.ts
 * Feature access within routes is controlled here.
 *
 * Tier hierarchy (member_settings.circle_tier):
 *   explorer (free) < sustainer < guardian < elder < pioneer
 *
 * Audio transcription requires: guardian+ OR audio_minutes_addon
 */

import { query } from "@/lib/db/postgres";

// Tiers from member_settings.circle_tier
export type Tier = "explorer" | "sustainer" | "guardian" | "elder" | "pioneer";

export interface Entitlements {
  tier: Tier;
  audioMinutesAddon: boolean;
  features: {
    voiceTranscription: boolean;
    cloudAudioUploads: boolean; // Cloud-based audio processing (metered)
    analyticsBasic: boolean;
    analyticsExport: boolean;
    longitudinalTrends: boolean;
  };
  limits: {
    voiceSecondsPerDay: number;
    maxRecordingSeconds: number;
    analyticsLookbackDays: number;
  };
}

/**
 * Normalize raw tier string from DB to typed Tier.
 * Handles missing/null values and legacy aliases.
 */
function normalizeTier(raw: unknown): Tier {
  const t = String(raw ?? "").toLowerCase().trim();

  // Exact matches for our tier values
  if (t === "pioneer") return "pioneer";
  if (t === "elder") return "elder";
  if (t === "guardian") return "guardian";
  if (t === "sustainer") return "sustainer";

  // Default to explorer (free tier)
  return "explorer";
}

/**
 * Numeric rank for tier comparison.
 * Higher = more permissions.
 */
function tierRank(tier: Tier): number {
  switch (tier) {
    case "explorer":
      return 0;
    case "sustainer":
      return 1;
    case "guardian":
      return 2;
    case "elder":
      return 3;
    case "pioneer":
      return 4;
    default:
      return 0;
  }
}

/**
 * Get entitlements for a member based on their tier + add-ons.
 *
 * Reads from member_settings table (circle_tier, audio_minutes_addon).
 */
export async function getEntitlements(memberId: string): Promise<Entitlements> {
  // Pull tier + addon flag from DB
  let tier: Tier = "explorer";
  let audioMinutesAddon = false;

  try {
    const res = await query(
      `
      SELECT
        circle_tier,
        audio_minutes_addon
      FROM member_settings
      WHERE member_id = $1
      LIMIT 1
      `,
      [memberId]
    );

    const row = res.rows[0] ?? null;
    tier = normalizeTier(row?.circle_tier);
    audioMinutesAddon = Boolean(row?.audio_minutes_addon);
  } catch {
    // If query fails (e.g., no settings row), default to explorer
    // This is safe because we'll just deny premium features
  }

  // Permission rule: guardian+ OR audio_minutes_addon
  const canUseCloudAudio = tierRank(tier) >= tierRank("guardian") || audioMinutesAddon;

  // Limits policy (adjust these as you learn real costs)
  // - guardian+: solid daily allowance
  // - addon: smaller allowance (or set higher and rely on metering)
  // - below guardian and no addon: effectively off
  const voiceSecondsPerDay =
    tierRank(tier) >= tierRank("guardian")
      ? 60 * 30 // 30 min/day for guardian+
      : audioMinutesAddon
        ? 60 * 10 // 10 min/day for addon holders
        : 0;

  const maxRecordingSeconds =
    tierRank(tier) >= tierRank("guardian") || audioMinutesAddon
      ? 10 * 60 // 10 min per clip
      : 0;

  return {
    tier,
    audioMinutesAddon,
    features: {
      voiceTranscription: canUseCloudAudio,
      cloudAudioUploads: canUseCloudAudio,
      analyticsBasic: true,
      analyticsExport: tierRank(tier) >= tierRank("guardian"),
      longitudinalTrends: tierRank(tier) >= tierRank("guardian"),
    },
    limits: {
      voiceSecondsPerDay,
      maxRecordingSeconds,
      analyticsLookbackDays: tierRank(tier) >= tierRank("guardian") ? 365 : 30,
    },
  };
}
