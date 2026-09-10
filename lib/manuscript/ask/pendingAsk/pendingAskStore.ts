/**
 * S3 · P1 — CREATING A PENDING ASK.
 *
 *   ⭐ The row records WHICH question is paused. ⛔ It never records what may be
 *     read: no section, no authority, no consent, no prose.
 *
 * The requirement and the required section set are RE-DERIVED inside the resumed
 * invocation from the reading and the anchor. Persisting them here is exactly how
 * an identity record becomes a permission record.
 */

import { randomBytes } from 'crypto';
import { query } from '@/lib/db/postgres';
import type { PendingAskRef } from './claimContract';

/**
 * ⭐ CONTINUITY HYGIENE, NOT DISCLOSURE FRESHNESS. The authority this resume will
 * eventually establish is invocation-bound and cannot be stored at all; this
 * window only bounds how long the paused encounter stays reconnectable.
 */
export const PENDING_ASK_TTL_MINUTES = 30;

/** Opaque and high-entropy. ⛔ Never derived from Work content or from an id. */
const mintRef = (): PendingAskRef => randomBytes(24).toString('base64url');

export async function createPendingAsk(input: {
  memberId: string;
  manuscriptId: string;
  threadId: string;
  readingId: string;
  observationKey: string;
}): Promise<PendingAskRef | null> {
  const ref = mintRef();
  try {
    await query(
      `INSERT INTO pending_ask_claims
         (ref, member_id, manuscript_id, thread_id, reading_id, observation_key, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, now() + ($7 || ' minutes')::interval)`,
      [ref, input.memberId, input.manuscriptId, input.threadId,
       input.readingId, input.observationKey, String(PENDING_ASK_TTL_MINUTES)],
    );
    return ref;
  } catch (err) {
    /* ⛔ A pending Ask that cannot be recorded must not be reported as one. The
       member would be offered a resume that no invocation can ever claim. */
    console.error('[S3/pendingAsk] could not open a paused Ask', {
      error: err instanceof Error ? err.message : 'unknown',
    });
    return null;
  }
}

/** The paused Ask's own coordinates, for a resume. ⛔ Carries no authority. */
export interface PendingAskIdentity {
  readonly memberId: string;
  readonly manuscriptId: string;
  readonly threadId: string;
  readonly readingId: string;
  readonly observationKey: string;
}
