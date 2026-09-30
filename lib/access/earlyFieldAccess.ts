/**
 * EARLY-FIELD-01 — who may encounter the R1R3 Living Field instrument.
 *
 * WHAT THIS GOVERNS (founder ruling 2026-09-30, R1): the exposure of the new
 * R1R3 instrument that #1539 added INSIDE the Living Field. It does NOT govern
 * the Living Field room. /maia/living-field, its doorways and its APIs remain
 * available to every member exactly as before; a member outside the cohort
 * simply does not see the instrument. Restricting the room would revoke access
 * to members' own authored material, which is a different governed act.
 *
 * AUTHORITY: one decision, `canEnterEarlyField(verifiedMemberId)`. Identity must
 * come from a verified server session (e.g. getMemberIdFromRequest). No URL,
 * query string, localStorage, client cookie, React state, browser flag, House
 * disposition or lab membership is an input to it.
 *
 * DISTINCT AUTHORITY: this is not Lab Tools access and not founder access.
 * Neither list is consulted, and founders are NOT admitted automatically:
 * membership must be explicit (founder ruling). Cohort membership is
 * operational configuration only; nothing is written anywhere.
 *
 * CONFIGURATION (read at call time, so rollback needs no rebuild):
 *   EARLY_FIELD_ENABLED     exactly "true" opens the cohort; "false" or absent
 *                           closes it; any other value is malformed → closed.
 *   EARLY_FIELD_MEMBER_IDS  comma-separated member UUIDs. Absent/empty admits
 *                           nobody. A single malformed entry makes the whole
 *                           list untrustworthy → closed for everyone.
 *
 * ROLLBACK: EARLY_FIELD_ENABLED=false (or clearing the list) removes the
 * instrument from every member while the Living Field stays intact. No code
 * change, no migration, no member data touched.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Any string map carrying EARLY_FIELD_ENABLED / EARLY_FIELD_MEMBER_IDS (e.g. process.env). */
export type EarlyFieldEnv = { readonly [key: string]: string | undefined };

export type EarlyFieldConfig =
  | { state: 'open'; members: ReadonlySet<string> }
  | { state: 'closed'; reason: 'disabled' | 'malformed_enabled' | 'malformed_members' };

/** Parse cohort configuration. Anything untrustworthy is closed, never open. */
export function readEarlyFieldConfig(env: EarlyFieldEnv = process.env): EarlyFieldConfig {
  const enabled = env.EARLY_FIELD_ENABLED;
  if (enabled === undefined || enabled === 'false') return { state: 'closed', reason: 'disabled' };
  if (enabled !== 'true') return { state: 'closed', reason: 'malformed_enabled' };

  const entries = (env.EARLY_FIELD_MEMBER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (entries.some((id) => !UUID_RE.test(id))) {
    return { state: 'closed', reason: 'malformed_members' };
  }
  return { state: 'open', members: new Set(entries.map((id) => id.toLowerCase())) };
}

/**
 * The one decision. `verifiedMemberId` must come from a verified session;
 * a null or malformed id is never admitted.
 */
export function canEnterEarlyField(
  verifiedMemberId: string | null | undefined,
  env: EarlyFieldEnv = process.env,
): boolean {
  if (!verifiedMemberId || !UUID_RE.test(verifiedMemberId)) return false;
  const config = readEarlyFieldConfig(env);
  if (config.state !== 'open') return false;
  return config.members.has(verifiedMemberId.toLowerCase());
}

/** For diagnostics: cohort size and state. Never returns the ids themselves. */
export function describeEarlyFieldConfig(env: EarlyFieldEnv = process.env): {
  state: EarlyFieldConfig['state'];
  reason?: string;
  size: number;
} {
  const config = readEarlyFieldConfig(env);
  return config.state === 'open'
    ? { state: 'open', size: config.members.size }
    : { state: 'closed', reason: config.reason, size: 0 };
}
