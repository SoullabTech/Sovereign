/**
 * RF01 S0-A2.1 — a conversation ID is not an authorization credential.
 *
 * Bind an absent session to the authenticated actor exactly once. A known
 * foreign or NULL-owner session is NEVER adopted. Each query is parameterized.
 * No member content, owner IDs, or session IDs enter a refusal log.
 *
 * This is the first member-session authority boundary; Sanctuary consent is a
 * separate S0-B prerequisite and is not established by owning a session.
 */
import { randomUUID } from 'crypto';
import { query } from '@/lib/db/postgres';
import type { MaiaSession } from './sessionManager';

export class SessionOwnershipRefusal extends Error {
  constructor(readonly code: 'SESSION_NOT_OWNED' | 'SESSION_ID_INVALID' | 'SESSION_NOT_FOUND') {
    super(code);
    this.name = 'SessionOwnershipRefusal';
  }
}

export function normalizedSessionId(requested: unknown): string {
  if (requested == null || requested === '') return randomUUID();
  if (typeof requested !== 'string' || requested.trim() !== requested ||
      requested.length < 1 || requested.length > 200 ||
      /[\x00-\x1F\x7F]/.test(requested)) {
    throw new SessionOwnershipRefusal('SESSION_ID_INVALID');
  }
  return requested;
}

/** Atomic first-writer ownership: conflicts never replace an existing owner. */
export async function ensureOwnedMemberSession(
  sessionId: string,
  verifiedMemberId: string,
): Promise<MaiaSession> {
  if (!verifiedMemberId || !sessionId) {
    throw new SessionOwnershipRefusal('SESSION_ID_INVALID');
  }
  await query(
    'INSERT INTO maia_sessions (id, member_id) VALUES ($1, $2) ' +
    'ON CONFLICT (id) DO NOTHING',
    [sessionId, verifiedMemberId],
  );
  const result = await query<MaiaSession>(
    'SELECT id, created_at, updated_at, turn_count, conversation_history ' +
    "FROM maia_sessions WHERE id = $1 AND member_id = $2 AND status = 'active'",
    [sessionId, verifiedMemberId],
  );
  if (!result.rows[0]) throw new SessionOwnershipRefusal('SESSION_NOT_OWNED');
  return result.rows[0];
}

/** Guests can never reopen or mutate an authenticated member's session row. */
export async function ensureGuestSession(sessionId: string): Promise<MaiaSession> {
  await query(
    'INSERT INTO maia_sessions (id, member_id) VALUES ($1, NULL) ' +
    'ON CONFLICT (id) DO NOTHING',
    [sessionId],
  );
  const result = await query<MaiaSession>(
    'SELECT id, created_at, updated_at, turn_count, conversation_history ' +
    "FROM maia_sessions WHERE id = $1 AND member_id IS NULL AND status = 'active'",
    [sessionId],
  );
  if (!result.rows[0]) throw new SessionOwnershipRefusal('SESSION_NOT_OWNED');
  return result.rows[0];
}

/** Read-only owner check for endpoints that operate on an existing conversation. */
export async function requireExistingOwnedSession(
  sessionId: string,
  verifiedMemberId: string,
): Promise<void> {
  if (!sessionId || sessionId.length > 200 || !verifiedMemberId) {
    throw new SessionOwnershipRefusal('SESSION_ID_INVALID');
  }
  const result = await query(
    'SELECT 1 FROM maia_sessions WHERE id = $1 AND member_id = $2',
    [sessionId, verifiedMemberId],
  );
  if (!result.rows[0]) throw new SessionOwnershipRefusal('SESSION_NOT_OWNED');
}
