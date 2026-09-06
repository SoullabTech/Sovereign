/**
 * Shadow Field — server-held session state (MAIA-SHADOW-FIELD-01 · P4-C1).
 *
 * WHY THIS EXISTS. The first keep implementation derived Sanctuary from a boolean on the
 * request body. That protects an honest client and nothing else: a forged request during a
 * Sanctuary session could send `sanctuary: false` and reach the insert. The claim "a forged
 * keep under Sanctuary creates zero rows" was therefore not true. Founder correction P4-C1,
 * 2026-09-06.
 *
 * The authority direction is now one-way:
 *
 *     member act at entry  →  server records the Field session  →  keep reads the SERVER
 *
 * The client may still send Sanctuary state for its own UI. It is never the authority that
 * permits persistence, and the keep decision does not read it.
 *
 * FAIL CLOSED, deliberately. An unknown, expired, foreign or closed token is not "assume
 * not-Sanctuary" — it is a refusal. Process restart or a second instance therefore causes a
 * refused keep, never an unauthorized write. That is the correct failure direction for a
 * prototype, and it is the reason this is safe as in-memory state.
 *
 * SCOPE. Prototype v1, Dedicated room only. This is not a general session mechanism and is
 * not on the ordinary MAIA path. It stores no conversation content and no psychological
 * representation of the member — only who opened the Field, when, and whether they opened it
 * as a Sanctuary session.
 */

import { randomUUID } from 'node:crypto';

export interface FieldSession {
  readonly token: string;
  readonly memberId: string;
  /** Server-authoritative. Fixed at entry; a session never changes its Sanctuary posture. */
  readonly sanctuary: boolean;
  readonly openedAt: number;
}

/** A Field sitting is bounded. Beyond this the token is dead and keep refuses. */
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

const SESSIONS = new Map<string, FieldSession>();

function expired(s: FieldSession, now: number): boolean {
  return now - s.openedAt > SESSION_TTL_MS;
}

/**
 * The member has entered the Field. Records the sitting server-side.
 * `sanctuary` is the member's choice AT ENTRY — after this it is the server's fact.
 */
export function openFieldSession(memberId: string, sanctuary: boolean): FieldSession {
  const session: FieldSession = {
    token: randomUUID(),
    memberId,
    sanctuary: sanctuary === true,
    openedAt: Date.now(),
  };
  SESSIONS.set(session.token, session);
  return session;
}

/**
 * Resolve a token to its server-held session. Returns null for unknown, expired, closed, or
 * another member's token — every one of which must be treated as a refusal by the caller.
 */
export function verifyFieldSession(token: unknown, memberId: string): FieldSession | null {
  if (typeof token !== 'string' || !token) return null;
  const session = SESSIONS.get(token);
  if (!session) return null;
  if (session.memberId !== memberId) return null;
  if (expired(session, Date.now())) {
    SESSIONS.delete(token);
    return null;
  }
  return session;
}

/** Leaving deactivates the Field server-side, not only in the client (L6, F14). */
export function closeFieldSession(token: unknown): void {
  if (typeof token === 'string' && token) SESSIONS.delete(token);
}

/** Test seam only. Never called by a route. */
export function __resetFieldSessionsForTest(): void {
  SESSIONS.clear();
}
