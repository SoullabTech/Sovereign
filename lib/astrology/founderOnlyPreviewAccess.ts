/**
 * ASTRO-PRO FG01 founder-first private preview.
 *
 * This is an isolated source candidate, not a release or paid entitlement.
 * Only the session-verified founder's canonical UUID is eligible. The existing
 * tester cohort, tester flag, legacy multiple-member allowlist, tier claim,
 * browser identity claim, or paid subscription field cannot widen this phase.
 *
 * A future invitation system MUST use a separate, audited and revocable
 * source of authority after its own privacy/R20 acceptance. It is deliberately
 * NOT enabled by this policy.
 */
export interface FounderPreviewConfig {
  [key: string]: string | undefined;
  ASTRO_PRO_PREVIEW_ENABLED?: string;
  ASTRO_PRO_ACCESS_PHASE?: string;
  ASTRO_PRO_FOUNDER_MEMBER_ID?: string;
  ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS?: string;
  ASTRO_PRO_BETA_TESTER_COHORT?: string;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function founderPreviewEnabled(config: Readonly<FounderPreviewConfig>): boolean {
  const id = config.ASTRO_PRO_FOUNDER_MEMBER_ID;
  return config.ASTRO_PRO_PREVIEW_ENABLED === 'true' &&
    config.ASTRO_PRO_ACCESS_PHASE === 'founder-only' &&
    typeof id === 'string' && UUID.test(id);
}

export function founderPreviewMemberAllowed(
  authenticatedMemberId: string | null | undefined,
  config: Readonly<FounderPreviewConfig>,
): boolean {
  return founderPreviewEnabled(config) &&
    typeof authenticatedMemberId === 'string' &&
    authenticatedMemberId === config.ASTRO_PRO_FOUNDER_MEMBER_ID;
}
