/**
 * Session Room — client join token store (server IO).
 *
 * Design: docs/specs/SESSION_ROOM_JOIN_TOKEN_DESIGN_2026-06-14.md
 *
 * The token is opaque; only sha256(token) is stored. The decision/reveal logic lives in the
 * pure functions in ./ClientConsent — this module only does DB IO and hashing.
 */

import crypto from 'crypto';
import { query, queryOne, transaction } from '@/lib/db/postgres';
import type { JoinTokenState, LedgerEvent } from './ClientConsent';

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function generateRawToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export interface JoinTokenContext {
  tokenState: JoinTokenState;
  sessionId: string;
  clientId: string;
  videoLink: string | null;
  videoProvider: string | null;
  agreementText: string | null;
  providerNotice: string | null;
  agreementMode: string | null;
  consentFlags: Record<string, unknown> | null;
}

/** Look up a token by its raw value and join the session context. null = not found. */
export async function loadJoinTokenContext(rawToken: string): Promise<JoinTokenContext | null> {
  if (!rawToken) return null;
  const tokenHash = hashToken(rawToken);
  const row = await queryOne<any>(
    `SELECT t.session_id, t.client_id, t.agreement_version AS token_version, t.status, t.expires_at,
            s.agreement_version AS current_version, s.room_state, s.video_link, s.video_provider,
            s.agreement_text_snapshot, s.external_provider_notice_snapshot,
            s.agreement_mode, s.consent_flags
       FROM session_join_tokens t
       JOIN scribe_sessions s ON s.id = t.session_id
      WHERE t.token_hash = $1`,
    [tokenHash]
  );
  if (!row) return null;
  return {
    tokenState: {
      status: row.status,
      agreementVersion: row.token_version,
      currentAgreementVersion: row.current_version,
      expiresAt: new Date(row.expires_at).getTime(),
      roomState: row.room_state,
    },
    sessionId: row.session_id,
    clientId: row.client_id,
    videoLink: row.video_link,
    videoProvider: row.video_provider,
    agreementText: row.agreement_text_snapshot,
    providerNotice: row.external_provider_notice_snapshot,
    agreementMode: row.agreement_mode ?? null,
    consentFlags: (row.consent_flags ?? null) as Record<string, unknown> | null,
  };
}

/** Client consent events for a session, mapped for the pure reveal/decision functions. */
export async function loadClientLedger(sessionId: string): Promise<LedgerEvent[]> {
  const res = await query<any>(
    `SELECT actor_type, action, agreement_version, created_at
       FROM session_consent_events WHERE session_id = $1 AND actor_type = 'client'`,
    [sessionId]
  );
  return res.rows.map((r) => ({
    actorType: r.actor_type,
    action: r.action,
    agreementVersion: r.agreement_version,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

/**
 * Record a client decision atomically: ledger event + session consent state + token status.
 * accept => consent_client_at set, video_link_reveal_allowed=true (cache mirror), token 'used'.
 * refuse => consent cleared, reveal cache false, token 'refused' (terminal for this version).
 */
export async function recordClientDecision(args: {
  rawToken: string;
  sessionId: string;
  clientId: string;
  agreementVersion: string;
  decision: 'accept' | 'refuse';
}): Promise<void> {
  const tokenHash = hashToken(args.rawToken);
  const accepted = args.decision === 'accept';
  await transaction(async (client) => {
    await client.query(
      `INSERT INTO session_consent_events (session_id, actor_type, actor_id, action, agreement_version)
       VALUES ($1, 'client', $2, $3, $4)`,
      [args.sessionId, args.clientId, args.decision, args.agreementVersion]
    );
    await client.query(
      `UPDATE scribe_sessions
          SET consent_client_at = ${accepted ? 'NOW()' : 'NULL'},
              video_link_reveal_allowed = ${accepted ? 'true' : 'false'}
        WHERE id = $1`,
      [args.sessionId]
    );
    await client.query(
      `UPDATE session_join_tokens SET status = $2, decided_at = NOW() WHERE token_hash = $1`,
      [tokenHash, accepted ? 'used' : 'refused']
    );
  });
}
