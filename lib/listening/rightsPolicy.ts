/** LISTEN-03 — server-only reference decision contract, NOT a delivery endpoint.
 * Never pass browser-derived grant or territory data as authority. Entitlements,
 * signed rights receipts, member access and territory must be server verified.
 * This module is intentionally not imported into client UI. */
export type UsageMode = 'on_demand' | 'shared_session' | 'offline_cabin' | 'download' | 'remix' | 'ai_processing';
export type RightsClaim = {
  holder: string;
  evidenceRef: string;
  verifiedAt: string;  // validated server-side ISO timestamp
  validUntil?: string;
};
export type RecordingGrant = {
  id: string;
  status: 'draft' | 'active' | 'withdrawn' | 'expired';
  master?: RightsClaim;
  composition?: RightsClaim;
  samples: 'none_declared' | 'cleared' | 'unknown';
  sampleStatusReceipt?: RightsClaim; // signed, current provenance declaration
  sampleClearances?: RightsClaim[];
  effectiveAt: string;
  expiresAt: string;
  territories: string[]; // ISO 3166-1 alpha-2, or expressly contracted 'WORLD'
  uses: UsageMode[];
};
export type PlaybackClaim = {
  memberAuthenticated: boolean;
  memberEntitled: boolean;
  territory: string; // trusted geographic decision, not request input
  usage: UsageMode;
  now: string;        // server timestamp ISO 8601
};
export type RightsDecision = { allowed: false; reason: string } | { allowed: true; reason: 'VERIFIED' };
const FAIL = (reason: string): RightsDecision => ({ allowed: false, reason });
const MODES = new Set<UsageMode>(['on_demand','shared_session','offline_cabin','download','remix','ai_processing']);
function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value) && Number.isFinite(Date.parse(value));
}
function verifiedClaim(claim: RightsClaim | undefined, now: number): boolean {
  return Boolean(claim && typeof claim.holder === 'string' && claim.holder.trim() &&
    typeof claim.evidenceRef === 'string' && claim.evidenceRef.trim() &&
    isValidTime(claim.verifiedAt) && Date.parse(claim.verifiedAt) <= now &&
    (!claim.validUntil || (isValidTime(claim.validUntil) && Date.parse(claim.validUntil) > now)));
}
/** Pure policy evaluation. A YES requires a separately authenticated media origin
 * that rechecks this result and issues a short-lived request-bound grant. */
export function evaluateRecordingRights(grant: RecordingGrant | null | undefined, ctx: PlaybackClaim): RightsDecision {
  if (!ctx?.memberAuthenticated) return FAIL('AUTH_REQUIRED');
  if (!ctx.memberEntitled) return FAIL('ENTITLEMENT_REQUIRED');
  if (!grant || grant.status !== 'active') return FAIL('RECORDING_NOT_ACTIVE');
  if (!isValidTime(ctx.now)) return FAIL('UNTRUSTED_TIME');
  const now = Date.parse(ctx.now);
  if (!isValidTime(grant.effectiveAt) || !isValidTime(grant.expiresAt) ||
    now < Date.parse(grant.effectiveAt) || now >= Date.parse(grant.expiresAt)) return FAIL('OUTSIDE_LICENSE_TERM');
  if (!verifiedClaim(grant.master, now)) return FAIL('MASTER_RIGHTS_UNVERIFIED');
  if (!verifiedClaim(grant.composition, now)) return FAIL('COMPOSITION_RIGHTS_UNVERIFIED');
  if (grant.samples === 'unknown' || !['none_declared','cleared'].includes(grant.samples)) return FAIL('SAMPLE_STATUS_UNKNOWN');
  if (!verifiedClaim(grant.sampleStatusReceipt, now)) return FAIL('SAMPLE_DECLARATION_UNVERIFIED');
  if (grant.samples === 'cleared' &&
    (!Array.isArray(grant.sampleClearances) || !grant.sampleClearances.length ||
      !grant.sampleClearances.every(claim => verifiedClaim(claim, now)))) return FAIL('SAMPLES_UNVERIFIED');
  if (!ctx.territory || !/^[A-Z]{2}$/.test(ctx.territory) ||
    !Array.isArray(grant.territories) ||
    (!grant.territories.includes(ctx.territory) && !grant.territories.includes('WORLD'))) return FAIL('TERRITORY_NOT_CLEARED');
  if (!MODES.has(ctx.usage) || !Array.isArray(grant.uses) || !grant.uses.includes(ctx.usage)) return FAIL('USE_NOT_CLEARED');
  return { allowed: true, reason: 'VERIFIED' };
}

