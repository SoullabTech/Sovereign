/**
 * LIVING-FIELD-R2-MOUNT-01 — presentation admission for the complete R2 room.
 *
 * This authority is deliberately separate from EARLY-FIELD-01. EARLY-FIELD-01
 * governs one additive R1R3 instrument. This module governs only whether the
 * already-admitted R2E2 room presentation may be shown to a named cohort.
 *
 * It grants no Living Field API, memory, MAIA, source, or room authority.
 * The verified session is the only identity input. Configuration fails closed.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface LivingFieldR2Config {
  enabled: string | undefined;
  memberIds: string | undefined;
}

export function parseLivingFieldR2Cohort(raw: string | undefined): ReadonlySet<string> | null {
  if (typeof raw !== 'string') return null;
  const entries = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (entries.length === 0) return null;
  if (!entries.every((entry) => UUID.test(entry))) return null;
  return new Set(entries.map((entry) => entry.toLowerCase()));
}

export function decideLivingFieldR2(
  sessionMemberId: string | null | undefined,
  config: LivingFieldR2Config,
): boolean {
  if (!sessionMemberId) return false;
  if (config.enabled !== 'true') return false;
  const cohort = parseLivingFieldR2Cohort(config.memberIds);
  if (!cohort) return false;
  return cohort.has(sessionMemberId.toLowerCase());
}

export function livingFieldR2ConfigFromEnv(): LivingFieldR2Config {
  return {
    enabled: process.env.LIVING_FIELD_R2_ENABLED,
    memberIds: process.env.LIVING_FIELD_R2_MEMBER_IDS,
  };
}

export function canEnterLivingFieldR2(sessionMemberId: string | null | undefined): boolean {
  return decideLivingFieldR2(sessionMemberId, livingFieldR2ConfigFromEnv());
}
