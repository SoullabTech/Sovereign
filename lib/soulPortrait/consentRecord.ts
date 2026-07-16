/**
 * Soul Portrait — Consent Record (Path B, Gate 4 write path).
 *
 * The WRITE complement to consentAccess.ts (Gate 3, read-only): append one event
 * to the authoritative `soul_portrait_consents` ledger, then sync the
 * `soul_portraits.consent_state` denormalized cache FROM the ledger (never the
 * reverse — the ledger stays the sole source of truth).
 *
 * v1 scope: adult subjects only. The practitioner records the subject's consent
 * (verbal/written) on their behalf — `actor_type = 'subject'` with a `recorded_by`
 * flag naming the practitioner. Minors are refused here; the guardian flow is a
 * separate crossing (member_guardians resolution, consentAccess minor hard rule).
 */

import { query } from '@/lib/db/postgres';
import {
  CURRENT_CONSENT_AGREEMENT_VERSION,
  getPortraitConsentLiveness,
  type ConsentAction,
  type ConsentActorType,
} from '@/lib/soulPortrait/consentAccess';

export interface RecordConsentInput {
  portraitId: string;
  actorType: ConsentActorType;
  /** The member acting, when they have an account (null for a non-member subject). */
  actorMemberId?: string | null;
  action: ConsentAction;
  consentSource: 'verbal' | 'written' | 'digital';
  /** Extra provenance, e.g. { recorded_by: <practitionerMemberId> }. */
  flags?: Record<string, unknown>;
}

/**
 * Append a consent event and re-derive the cache. Returns the post-write liveness
 * so callers act on the ledger's answer, not their own assumption.
 */
export async function recordPortraitConsent(input: RecordConsentInput) {
  await query(
    `INSERT INTO soul_portrait_consents
       (portrait_id, actor_type, actor_member_id, action, consent_source, agreement_version, flags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.portraitId,
      input.actorType,
      input.actorMemberId ?? null,
      input.action,
      input.consentSource,
      CURRENT_CONSENT_AGREEMENT_VERSION,
      input.flags ? JSON.stringify(input.flags) : null,
    ],
  );

  // Cache correction: ledger → cache, never the reverse.
  const liveness = await getPortraitConsentLiveness(input.portraitId);
  const cacheState = liveness.live ? 'active' : liveness.latestAction === 'revoke' ? 'revoked' : 'pending';
  await query(`UPDATE soul_portraits SET consent_state = $2, updated_at = NOW() WHERE id = $1`, [
    input.portraitId,
    cacheState,
  ]);

  return liveness;
}
