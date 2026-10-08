/** SOURCE-CUSTODY-DB-01 candidate: durable reservation before any member bytes.
 * Not wired to live source POST/PATCH. The legacy write path remains held.
 * Reservation commits in its own short transaction; DB triggers coordinate
 * the source operation with Sanctuary transitions across independent workers.
 */
import type { NextRequest } from 'next/server';
import type { PoolClient } from 'pg';
import { pool } from '@/lib/db/postgres';
import type { SourceCustodyIntent } from './sourceCustodyFiles';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class SourceCustodyReservationRefused extends Error {
  constructor() { super('Source custody reservation unavailable'); }
}
function verifiedToken(request: NextRequest): string | null {
  return request.cookies.get('maia_session')?.value || request.headers.get('x-session-token');
}

/** No plaintext content is accepted here, and the DB reservation commits
 * before callers may begin filesystem staging. The database trigger rechecks
 * the locked session's ownership, expiry, revocation and ordinary posture.
 */
export async function reserveSourceCustody(
  request: NextRequest, memberId: string, intent: SourceCustodyIntent,
): Promise<void> {
  const token = verifiedToken(request);
  if (!pool || !token || !UUID_RE.test(memberId) ||
      intent.version !== 1 || !UUID_RE.test(intent.operationId) ||
      !UUID_RE.test(intent.memberId) || !UUID_RE.test(intent.uploadId) ||
      intent.memberId !== memberId) throw new SourceCustodyReservationRefused();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const session = await client.query<{ id: string }>(
      `SELECT id FROM auth_sessions
        WHERE session_token = $1 AND member_id = $2
          AND revoked = FALSE AND expires_at > NOW()
        FOR UPDATE NOWAIT`, [token, memberId]);
    if (!session.rows[0]) throw new SourceCustodyReservationRefused();
    await client.query(
      `INSERT INTO workbench_source_custody_ops
        (operation_id, session_id, arranger_id, upload_id)
       VALUES ($1, $2, $3, $4)`,
      [intent.operationId, session.rows[0].id, memberId, intent.uploadId],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

/** Requires the DB reservation to be durable; no filesystem operations are
 * authorized by this function. Keep the reservation nonterminal on failures.
 */
export async function markSourceCustodyWriting(
  client: Pick<PoolClient, 'query'>, intent: SourceCustodyIntent,
): Promise<void> {
  const row = await client.query(
    `UPDATE workbench_source_custody_ops SET state='writing'
      WHERE operation_id=$1 AND arranger_id=$2 AND upload_id=$3
        AND state='reserved' RETURNING operation_id`,
    [intent.operationId, intent.memberId, intent.uploadId],
  );
  if (!row.rows[0]) throw new SourceCustodyReservationRefused();
}

/** Must run in the SAME transaction as the workbench_uploads final update,
 * after original bytes have been published+fsynced. The SQL checks that the
 * corresponding member-owned source row reached an admissible status.
 */
export async function markSourceCustodyCommitted(
  client: Pick<PoolClient, 'query'>, intent: SourceCustodyIntent,
): Promise<void> {
  const row = await client.query(
    `UPDATE workbench_source_custody_ops AS op SET state='committed'
      WHERE op.operation_id=$1 AND op.arranger_id=$2 AND op.upload_id=$3
        AND op.state='writing'
        AND EXISTS (
          SELECT 1 FROM workbench_uploads u
            WHERE u.id=op.upload_id AND u.arranger_id=op.arranger_id
              AND u.storage_path <> ''
              AND u.transcription_status IN ('reviewed','draft','error')
        )
      RETURNING op.operation_id`,
    [intent.operationId, intent.memberId, intent.uploadId],
  );
  if (!row.rows[0]) throw new SourceCustodyReservationRefused();
}
