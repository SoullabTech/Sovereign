/**
 * H1 — cohort authority for explicit Work-context arrival into Writer's Studio.
 *
 * Governs ONLY the experimental crossing/arrival behaviour introduced by H1:
 * - House may emit a Studio address carrying `work=` only for an admitted member.
 * - Studio may honour a `work=` claim only for an admitted member.
 *
 * Writer's Studio itself, manuscripts, member Works, multi-manuscript correctness,
 * and House presentation remain universal. This authority is deliberately
 * separate from EARLY-FIELD-01, lab access, founder access and every other cohort.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface HouseStudioH1Config {
  enabled: string | undefined;
  memberIds: string | undefined;
}

export function parseHouseStudioH1Cohort(raw: string | undefined): ReadonlySet<string> | null {
  if (typeof raw !== 'string') return null;
  const entries = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (entries.length === 0) return null;
  if (!entries.every((entry) => UUID.test(entry))) return null;
  return new Set(entries.map((entry) => entry.toLowerCase()));
}

export function decideHouseStudioH1(
  sessionMemberId: string | null | undefined,
  config: HouseStudioH1Config,
): boolean {
  if (!sessionMemberId) return false;
  if (config.enabled !== 'true') return false;
  const cohort = parseHouseStudioH1Cohort(config.memberIds);
  if (!cohort) return false;
  return cohort.has(sessionMemberId.toLowerCase());
}

export function houseStudioH1ConfigFromEnv(): HouseStudioH1Config {
  return {
    enabled: process.env.HOUSE_STUDIO_H1_ENABLED,
    memberIds: process.env.HOUSE_STUDIO_H1_MEMBER_IDS,
  };
}

export function canUseHouseStudioH1(sessionMemberId: string | null | undefined): boolean {
  return decideHouseStudioH1(sessionMemberId, houseStudioH1ConfigFromEnv());
}

/**
 * The admission endpoint's whole answer (GET /api/house-studio/admission).
 * A boolean and nothing else: no member ids, no list size, no cohort name, no
 * configuration state, no reason. Signed out → 401 `{ admitted: false }`.
 */
export function houseStudioH1AdmissionResponse(
  sessionMemberId: string | null,
  config: HouseStudioH1Config = houseStudioH1ConfigFromEnv(),
): { status: 200 | 401; body: { admitted: boolean } } {
  if (!sessionMemberId) return { status: 401, body: { admitted: false } };
  return { status: 200, body: { admitted: decideHouseStudioH1(sessionMemberId, config) } };
}
