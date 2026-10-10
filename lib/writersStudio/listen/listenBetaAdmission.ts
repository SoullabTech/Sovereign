import type { WritersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';

/**
 * Pilot gate: general beta-tester status alone is NOT Listen authorization.
 * The founder may witness; other writers need both active, member-linked
 * tester status AND exact inclusion in the separately authorized cohort.
 *
 * A missing or malformed allowlist fails closed. Nothing here grants
 * permission to read another member's manuscript or to save uploaded audio.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function exactIds(source: string | undefined): Set<string> {
  return new Set((source ?? '')
    .split(/[\s,;]+/)
    .map((id) => id.toLowerCase())
    .filter((id) => UUID.test(id)));
}

export function listenBetaAdmitted(
  memberId: string | null | undefined,
  access: WritersStudioBetaAccess,
  configuredIds: string | undefined,
  witnessIds?: string,
): boolean {
  if (!memberId || !UUID.test(memberId)) return false;
  // Only an operator-configured exact identity can witness in an environment
  // whose account data lacks a founder admin_role. No role wildcard or
  // implicit team administrator promotion is allowed.
  if (exactIds(witnessIds).has(memberId.toLowerCase())) return true;
  if (!access.eligible) return false;
  if (access.basis === 'founder_witness') return true;
  if (access.basis !== 'active_beta_tester') return false;
  return exactIds(configuredIds).has(memberId.toLowerCase());
}
