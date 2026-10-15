/**
 * WS-BETA-CONSENT-R1: beta admission requires the MEMBER'S latest consent act
 * for the exact, approved notice version and hash.
 *
 * A contact list, founder-controlled allowlist, admin role, paid tier,
 * a previous version or a browser query parameter cannot supply consent.
 *
 * There is deliberately no default notice, no consent-writing endpoint,
 * no automatic acceptance and no production activation in this candidate.
 */
import { query } from '@/lib/db/postgres';

const VERSION = /^[a-zA-Z0-9._-]{1,80}$/;
const SHA256 = /^[0-9a-f]{64}$/;

export type BetaConsentPolicy = {
  policyVersion: string;
  policySHA256: string;
};

export function approvedBetaConsentPolicy(
  version: string | undefined,
  hash: string | undefined,
): BetaConsentPolicy | null {
  if (!version || !VERSION.test(version) || !hash || !SHA256.test(hash)) return null;
  return { policyVersion: version, policySHA256: hash };
}

export async function hasActiveWriterBetaConsent(
  memberId: string,
  policy: BetaConsentPolicy | null,
): Promise<boolean> {
  if (!policy || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(memberId)) return false;

  // Query the member's latest decision ACROSS ALL notice versions, not just
  // the current version: a later revoke must invalidate an older acceptance.
  const decision = await query<{
    decision: string;
    policy_version: string;
    policy_sha256: string;
  }>(
    `SELECT decision, policy_version, policy_sha256
       FROM writers_studio_beta_consent_events
      WHERE member_id = $1
      ORDER BY seq DESC LIMIT 1`,
    [memberId],
  );

  const latest = decision.rows[0];
  return latest?.decision === 'accept'
    && latest.policy_version === policy.policyVersion
    && latest.policy_sha256 === policy.policySHA256;
}
