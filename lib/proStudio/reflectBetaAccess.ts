/**
 * PRO-STUDIO-BETA-01 — invitation authority for the client-free Reflect preview.
 *
 * This is a bounded BETA invitation, not a product entitlement or a professional
 * credential. Both the feature flag and exact member ID allowlist must agree.
 * Do not inherit Field Lab tester status, MAIA intimacy, or practitioner role.
 */
export interface ReflectBetaConfiguration {
  enabled?: string;
  memberIds?: string;
}

export function isReflectBetaAllowed(memberId: string, config: ReflectBetaConfiguration): boolean {
  if (config.enabled !== 'true' || !memberId) return false;
  const entries = (config.memberIds ?? '').split(',').map(id => id.trim()).filter(Boolean);
  return entries.includes(memberId);
}
