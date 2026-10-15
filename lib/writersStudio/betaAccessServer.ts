import { query } from '@/lib/db/postgres';
import { approvedBetaConsentPolicy, hasActiveWriterBetaConsent } from './betaConsentGate';

/**
 * SMALL-BETA-01 / B4 — server-side cohort membership.
 *
 * An active Soullab beta-tester contact alone does NOT grant Writer's Studio.
 * A writer additionally needs their exact, verified member ID in a protected,
 * server-only allowlist for this small pilot. Founder/CTO retain their
 * explicitly role-bound witness path, not a writer invitation.
 *
 * Never log the allowlist or take it from client input, URL or browser storage.
 */
export type WritersStudioBetaAccess =
  | { eligible: true; basis: 'active_beta_tester' | 'founder_witness' }
  | { eligible: false; basis: 'not_in_pilot' };

export const WRITERS_STUDIO_BETA_MEMBER_IDS_ENV = 'WRITERS_STUDIO_BETA_MEMBER_IDS' as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A second, exact-member gate for Writer's Studio alone.
 * Missing, wildcard, malformed or duplicate configuration fails closed.
 * The list is an admission restriction, never proof of account ownership.
 */
export function explicitlyApprovedWriterMember(
  memberId: string,
  rawAllowlist: string | undefined,
): boolean {
  if (!UUID_PATTERN.test(memberId) || !rawAllowlist) return false;

  const entries = rawAllowlist.split(',').map((part) => part.trim().toLowerCase());
  if (entries.some((part) => !UUID_PATTERN.test(part))) return false;
  if (new Set(entries).size !== entries.length) return false;

  return entries.includes(memberId.toLowerCase());
}

export async function writersStudioBetaAccess(memberId: string): Promise<WritersStudioBetaAccess> {
  const result = await query<{ beta: boolean; founder: boolean }>(
    `SELECT
       EXISTS (
         SELECT 1 FROM ops_contacts c
          WHERE c.member_id = $1
            AND c.deleted_at IS NULL
            AND c.contact_type = 'beta_tester'
            AND c.pipeline_stage = 'active'
       ) AS beta,
       EXISTS (
         SELECT 1 FROM members m
          WHERE m.id = $1 AND m.admin_role IN ('founder','cto')
       ) AS founder`,
    [memberId],
  );
  const row = result.rows[0];
  if (row?.founder) return { eligible: true, basis: 'founder_witness' };

  // Both founder-approved member ID and separately active beta contact
  // are required. Neither a general tester flag nor a supplied ID alone
  // confers admission.
  if (row?.beta && explicitlyApprovedWriterMember(
    memberId, process.env.WRITERS_STUDIO_BETA_MEMBER_IDS,
  )) {
    const policy = approvedBetaConsentPolicy(
      process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION,
      process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256,
    );
    if (await hasActiveWriterBetaConsent(memberId, policy)) {
      return { eligible: true, basis: 'active_beta_tester' };
    }
  }
  return { eligible: false, basis: 'not_in_pilot' };
}

/**
 * Only a pre-consent enrollment candidate, NOT a Studio permission.
 * The future consent page may call this after independently verified login;
 * the ordinary Caddy forward authorizer must continue to call
 * writersStudioBetaAccess() and demand actual accepted consent.
 */
export async function writerStudioBetaPreConsentCandidate(memberId: string): Promise<boolean> {
  if (!explicitlyApprovedWriterMember(memberId, process.env.WRITERS_STUDIO_BETA_MEMBER_IDS)) {
    return false;
  }
  const contact = await query<{ active_tester: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM ops_contacts c
        WHERE c.member_id = $1 AND c.deleted_at IS NULL
          AND c.contact_type = 'beta_tester' AND c.pipeline_stage = 'active'
     ) AS active_tester`,
    [memberId],
  );
  return contact.rows[0]?.active_tester === true;
}
