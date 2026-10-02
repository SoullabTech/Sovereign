/**
 * EARLY-FIELD-01 — who may meet the early Living Field instrument.
 *
 * ── WHAT THIS GOVERNS, AND NOTHING ELSE ────────────────────────────────────
 *
 * Exposure of ONE component: `LivingFieldInstrument` (#1539), mounted inside
 * the existing Living Field dashboard. The Living Field route, its APIs, the
 * House doorway, the circulation into it and #1539's shared copy changes are
 * NOT governed here — every member keeps the Living Field they already have
 * (founder ruling, 2026-09-30).
 *
 * ── THE LAW ────────────────────────────────────────────────────────────────
 *
 *   A member must not meet an early field merely because the client knows
 *   that the field exists. Admission is decided server-side. The UI may
 *   reflect that decision; it must never create it.
 *
 * ── CONFIGURATION (production env on minisforum) ───────────────────────────
 *
 *   EARLY_FIELD_ENABLED=true            the cohort is open. Anything else —
 *                                       absent, "false", "1", "TRUE " — is
 *                                       CLOSED. This is the rollback switch:
 *                                       set it to false and restart; no
 *                                       migration, no source edit.
 *   EARLY_FIELD_MEMBER_IDS=<uuid>,<uuid>   the cohort, named explicitly.
 *
 * ── FAILS CLOSED ───────────────────────────────────────────────────────────
 *
 *   no switch · switch not exactly "true" · no list · empty list ·
 *   ANY malformed entry (the whole list is then untrusted, not partially
 *   honoured) · no authenticated member  →  nobody is admitted.
 *
 * ── DELIBERATELY SEPARATE AUTHORITY ────────────────────────────────────────
 *
 * Not lab access and not founder status. Unlike labAccess, founders are NOT
 * admitted implicitly: cohort membership is explicit, and the founder is
 * listed like anyone else. Membership here confers nothing beyond this one
 * instrument; it is read by this module alone and written nowhere — it is
 * operational configuration, never member data.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface EarlyFieldConfig {
  /** Raw EARLY_FIELD_ENABLED. */
  enabled: string | undefined;
  /** Raw EARLY_FIELD_MEMBER_IDS. */
  memberIds: string | undefined;
}

/** The parsed cohort, or null when the configuration cannot be trusted. */
export function parseCohort(raw: string | undefined): ReadonlySet<string> | null {
  if (typeof raw !== 'string') return null;
  const entries = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (entries.length === 0) return null;
  if (!entries.every((e) => UUID.test(e))) return null;
  return new Set(entries.map((e) => e.toLowerCase()));
}

/**
 * The one authoritative decision. Pure: the member id must come from the
 * server session (see canEnterEarlyField / the admission route) — this
 * function has no way to receive a client claim, by construction.
 */
export function decideEarlyField(
  sessionMemberId: string | null | undefined,
  config: EarlyFieldConfig,
): boolean {
  if (!sessionMemberId) return false;
  if (config.enabled !== 'true') return false;
  const cohort = parseCohort(config.memberIds);
  if (!cohort) return false;
  return cohort.has(sessionMemberId.toLowerCase());
}

/** Read the live configuration. Read per call so a restart is the only step. */
export function earlyFieldConfigFromEnv(): EarlyFieldConfig {
  return {
    enabled: process.env.EARLY_FIELD_ENABLED,
    memberIds: process.env.EARLY_FIELD_MEMBER_IDS,
  };
}

/** Server-side: may this authenticated member meet the early instrument? */
export function canEnterEarlyField(sessionMemberId: string | null | undefined): boolean {
  return decideEarlyField(sessionMemberId, earlyFieldConfigFromEnv());
}
