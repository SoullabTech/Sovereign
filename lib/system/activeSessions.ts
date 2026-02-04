/**
 * Active Sessions Tracking
 *
 * Tracks which sessions are currently active so maintenance mode
 * can block NEW sessions while letting existing ones finish.
 */

import { query } from '@/lib/db/postgres';

export async function touchActiveSession(params: {
  sessionId: string;
  memberId?: string | null;
  anonId?: string | null;
}): Promise<void> {
  const { sessionId, memberId = null, anonId = null } = params;

  if (!sessionId) return;

  try {
    await query(
      `
      INSERT INTO active_sessions (session_id, member_id, anon_id, last_seen_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (session_id)
      DO UPDATE SET
        last_seen_at = NOW(),
        member_id = COALESCE($2, active_sessions.member_id),
        anon_id = COALESCE($3, active_sessions.anon_id)
      `,
      [sessionId, memberId, anonId]
    );
  } catch (error) {
    // Log but don't fail the request
    console.warn('[activeSessions] Failed to touch session:', error);
  }
}

export async function isKnownActiveSession(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;

  try {
    const r = await query(
      `SELECT 1 FROM active_sessions WHERE session_id = $1 LIMIT 1`,
      [sessionId]
    );
    return (r.rowCount ?? 0) > 0;
  } catch (error) {
    // On error, assume not known (safer for maintenance)
    console.warn('[activeSessions] Failed to check session:', error);
    return false;
  }
}

export async function cleanupStaleSessions(olderThanHours = 24): Promise<number> {
  try {
    const r = await query(
      `DELETE FROM active_sessions WHERE last_seen_at < NOW() - INTERVAL '${olderThanHours} hours'`
    );
    return r.rowCount ?? 0;
  } catch (error) {
    console.warn('[activeSessions] Cleanup failed:', error);
    return 0;
  }
}
