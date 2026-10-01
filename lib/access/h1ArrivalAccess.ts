/**
 * H1 arrival — who may receive the House → Studio contextual arrival.
 *
 * H1-COHORT-GATE-01 (founder rulings 2026-09-30 / 2026-10-01). The Studio is
 * universal; only the crossing that lets a House-supplied Work govern Studio
 * arrival is cohort-controlled. This module is the ONE authority for that
 * decision: the House consults it server-side, and the Studio learns its
 * verdict only as `{ admitted: boolean }` from
 * GET /api/writers-studio/h1-arrival/admission.
 *
 * CONFIGURATION (production env on minisforum):
 *
 *   H1_ARRIVAL_ENABLED=true
 *   H1_ARRIVAL_MEMBER_IDS=<uuid>,<uuid>
 *
 * FAILS CLOSED. Absent, empty, disabled, or malformed configuration admits
 * nobody: `ENABLED` must be exactly `true`, and a single malformed id closes the
 * whole list rather than silently admitting the rest — a list we cannot read
 * is not a list we may act on.
 *
 * ⛔ No inheritance. Founders, Lab Tools members, Early Field members and
 * Stewards are NOT thereby admitted; this list is read by this module alone,
 * and membership of it confers nothing beyond H1 arrival.
 *
 * ⛔ Identity is the caller's job and must be VERIFIED server identity
 * (requireMemberId / getMemberIdFromRequest). Never pass a client claim here.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type H1ArrivalEnv = {
  readonly [key: string]: string | undefined;
  H1_ARRIVAL_ENABLED?: string;
  H1_ARRIVAL_MEMBER_IDS?: string;
};

function configuredMembers(env: H1ArrivalEnv): ReadonlySet<string> | null {
  if (env.H1_ARRIVAL_ENABLED !== 'true') return null;
  const ids = (env.H1_ARRIVAL_MEMBER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0 || ids.some((id) => !UUID.test(id))) return null;
  return new Set(ids.map((id) => id.toLowerCase()));
}

/** May this verified member receive H1 contextual arrival? Closed on any doubt. */
export function canUseH1Arrival(
  verifiedMemberId: string | null | undefined,
  env: H1ArrivalEnv = process.env,
): boolean {
  if (!verifiedMemberId || !UUID.test(verifiedMemberId)) return false;
  const members = configuredMembers(env);
  return members !== null && members.has(verifiedMemberId.toLowerCase());
}

/**
 * The admission endpoint's whole answer. A boolean and nothing else: no member
 * ids, no list size, no cohort name, no configuration state, no reason.
 */
export function h1AdmissionResponse(
  verifiedMemberId: string | null,
  env: H1ArrivalEnv = process.env,
): { status: 200 | 401; body: { admitted: boolean } } {
  if (!verifiedMemberId) return { status: 401, body: { admitted: false } };
  return { status: 200, body: { admitted: canUseH1Arrival(verifiedMemberId, env) } };
}
