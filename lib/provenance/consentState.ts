/**
 * Runtime consent state — the server-side record of the posture in force for a
 * request (Sanctuary S5, forgery prevention).
 *
 * The S1 TurnPosture is resolved once per request from request metadata and
 * passed by reference. S5 adds the durable half: the resolved posture is
 * RECORDED (content-free) at the serving boundary, so that background and
 * queued writers — and after-the-fact audits — can verify a turn's posture
 * against a server record instead of trusting arguments handed down a call
 * chain. Caller convention is how June happened.
 *
 * Everything in this table is metadata: ids, posture, timestamps. Never content.
 */

import { query } from '../db/postgres';
import { TurnPosture } from '../sanctuary/turnPosture';

/**
 * Record the posture resolved for this request. Fire-and-forget: never blocks
 * the serving path, never throws. Call at the same boundary where
 * `TurnPosture.resolve(...)` runs, with the request/exchange id that
 * downstream writers will carry.
 */
export function recordConsentState(opts: {
  requestId: string;
  posture: TurnPosture;
  memberId?: string | null;
  sessionId?: string | null;
}): void {
  if (!(opts.posture instanceof TurnPosture)) {
    console.error('[PROVENANCE] consent-state record refused — posture missing or forged', {
      requestIdPrefix: opts.requestId?.slice(0, 12) ?? null,
    });
    return;
  }
  void query(
    `INSERT INTO runtime_consent_state (request_id, member_id, session_id, posture, resolved_from)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (request_id) DO NOTHING`,
    [
      opts.requestId,
      opts.memberId ?? null,
      opts.sessionId ?? null,
      opts.posture.sanctuary ? 'sanctuary' : 'normal',
      opts.posture.source,
    ]
  ).catch((err) => {
    // Metadata-only; the serving path continues. A missing record is visible
    // to auditors as an absence, which is itself a truthful signal.
    console.error('[PROVENANCE] consent-state record failed', {
      requestIdPrefix: opts.requestId?.slice(0, 12) ?? null,
      error: err instanceof Error ? err.message : 'unknown',
    });
  });
}

/**
 * Resolve the recorded posture for a request id. For background/queued
 * writers: absence of a record is NOT 'normal' — it is null, and a durable
 * write that needs a posture must fail closed on null.
 */
export async function resolveRecordedPosture(
  requestId: string
): Promise<'normal' | 'sanctuary' | null> {
  try {
    const result = await query<{ posture: 'normal' | 'sanctuary' }>(
      `SELECT posture FROM runtime_consent_state WHERE request_id = $1`,
      [requestId]
    );
    return result.rows[0]?.posture ?? null;
  } catch (err) {
    console.error('[PROVENANCE] consent-state resolve failed (fail closed)', {
      requestIdPrefix: requestId?.slice(0, 12) ?? null,
      error: err instanceof Error ? err.message : 'unknown',
    });
    return null;
  }
}
