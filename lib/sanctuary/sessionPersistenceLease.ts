/** Proposed source-persistence session serialization adapter.
 * NOT YET wired to POST/PATCH while UI transitions and migration are unadmitted.
 * Locks an authenticated auth_sessions row for an entire async content write.
 * The transition uses the same row lock, so it cannot acknowledge Sanctuary
 * while a previously authorized write is still running.
 */
import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db/postgres';
import { decideSourcePersistence, type ServerPosture } from './persistenceProtocol';

export class PersistenceRefused extends Error {
  constructor() { super('Session posture does not authorize source persistence'); }
}

function sessionToken(request: NextRequest): string | null {
  return request.cookies.get('maia_session')?.value || request.headers.get('x-session-token');
}

export async function withSourcePersistenceLease<T>(
  request: NextRequest, memberId: string, work: () => Promise<T>,
): Promise<T> {
  const token = sessionToken(request);
  if (!token || !pool) throw new PersistenceRefused();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query<{
      source_persistence_posture: ServerPosture; source_persistence_revision: string;
    }>(`SELECT source_persistence_posture, source_persistence_revision
         FROM auth_sessions
        WHERE session_token = $1 AND member_id = $2 AND revoked = FALSE
          AND expires_at > NOW() FOR UPDATE NOWAIT`, [token, memberId]);
    const row = found.rows[0];
    const revision = row ? BigInt(row.source_persistence_revision) : null;
    if (decideSourcePersistence({
      sessionAuthenticated: Boolean(row), sessionActive: Boolean(row),
      posture: row?.source_persistence_posture ?? 'unresolved',
      exclusivePersistenceLease: Boolean(row),
      leaseRevision: revision, postureRevision: revision,
    }) !== 'allow') throw new PersistenceRefused();
    // The row lock remains held while asynchronous storage and DB writes finish.
    // A transition can only commit after this callback has completed.
    const result = await work();
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function transitionSourcePersistencePosture(
  request: NextRequest, memberId: string, next: 'ordinary' | 'sanctuary',
): Promise<{ posture: 'ordinary' | 'sanctuary'; revision: string }> {
  const token = sessionToken(request);
  if (!token || !pool) throw new PersistenceRefused();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const changed = await client.query<{ source_persistence_revision: string }>(
      `UPDATE auth_sessions
          SET source_persistence_posture = $3,
              source_persistence_revision = source_persistence_revision + 1
        WHERE session_token = $1 AND member_id = $2 AND revoked = FALSE
          AND expires_at > NOW()
        RETURNING source_persistence_revision`, [token, memberId, next]);
    if (!changed.rows[0]) throw new PersistenceRefused();
    await client.query('COMMIT');
    return { posture: next, revision: String(changed.rows[0].source_persistence_revision) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

/** Read-only, session-bound display state. Never grants write authority. */
export async function readSourcePersistencePosture(
  request: NextRequest, memberId: string,
): Promise<{ posture: ServerPosture; revision: string }> {
  const token = sessionToken(request);
  if (!token || !pool) throw new PersistenceRefused();
  const found = await pool.query<{ source_persistence_posture: ServerPosture; source_persistence_revision: string }>(
    `SELECT source_persistence_posture, source_persistence_revision
       FROM auth_sessions
      WHERE session_token = $1 AND member_id = $2 AND revoked = FALSE
        AND expires_at > NOW()`, [token, memberId],
  );
  const row = found.rows[0];
  if (!row) throw new PersistenceRefused();
  return { posture: row.source_persistence_posture, revision: String(row.source_persistence_revision) };
}
