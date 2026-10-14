/**
 * Turns Store
 *
 * Stores and retrieves conversation turns for session recall.
 * This provides the "what did we just talk about" continuity.
 */

import { query,transaction } from '../../db/postgres';
import { TurnPosture, contentWritable } from '../../sanctuary/turnPosture';
import { Provenance } from '../../provenance/provenance';

/**
 * S5: mint turn provenance server-side, at the store, from the boundary-
 * resolved TurnPosture. The DB mint gate (s5_require_minted_provenance)
 * refuses any conversation_turns INSERT that lacks this — no layer trusts a
 * caller. Returns null (refusing the write) if minting fails.
 */
function mintTurnProvenance(
  posture: TurnPosture,
  role: 'user' | 'assistant',
  turnId: string,
  sessionId: string | null | undefined
): Provenance | null {
  return Provenance.mint(
    posture,
    {
      createdBy: role === 'user' ? 'member' : 'maia',
      generatedBy: role === 'user' ? 'member-utterance' : 'synthesis',
      sourceContainer: 'personal',
      source: { type: 'turn', turnId, sessionId: sessionId ?? null },
    },
    'TurnsStore'
  );
}

export interface TurnMeta {
  kind?: 'normal' | 'translation';
  parentTurnId?: string;       // Matches DB column; used for threading in meta if needed
  parentLocalId?: string;      // Client-side ID when parent not yet persisted
  toSystem?: string;
  fromSystem?: string;
  lens?: string;
  style?: string;
  [key: string]: unknown;
}

export interface ConversationTurn {
  id?: string;
  userId: string;
  sessionId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  meta?: TurnMeta;
  parentTurnId?: string;
}

export const TurnsStore = {
  /**
   * Get recent turns for a user (most recent N, returned in chronological order)
   */
  async getRecentTurns(
    userId: string,
    limit: number = 12
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string; createdAt: string }>> {
    const result = await query<{ role: 'user' | 'assistant'; content: string; createdAt: string }>(
      `
      SELECT
        role,
        content,
        created_at as "createdAt"
      FROM conversation_turns
      WHERE user_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM (SELECT session_id FROM astro_maia_protected_origins UNION ALL SELECT session_id FROM astro_maia_transfer_grants) AS r4f
          WHERE r4f.session_id = conversation_turns.session_id
        )
      ORDER BY created_at DESC, seq DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    // Return in chronological order (oldest first) for natural prompt flow
    return (result.rows ?? []).reverse();
  },

  /**
   * Get turns for a specific session
   */
  async getSessionTurns(
    sessionId: string,
    memberId: string
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string; createdAt: string }>> {
    const result = await query<{ role: 'user' | 'assistant'; content: string; createdAt: string }>(
      `
      SELECT
        role,
        content,
        created_at as "createdAt"
      FROM conversation_turns
      WHERE session_id = $1 AND user_id = $2
        AND NOT EXISTS (
          SELECT 1 FROM (
            SELECT session_id FROM astro_maia_protected_origins
            UNION ALL SELECT session_id FROM astro_maia_transfer_grants
          ) AS r4f WHERE r4f.session_id=conversation_turns.session_id
        )
      ORDER BY created_at ASC, seq ASC
      `,
      [sessionId, memberId]
    );

    return result.rows ?? [];
  },

  /**
   * Store a new turn
   *
   * SANCTUARY (S1, boundary-enforced): posture REQUIRED; sanctuary or
   * missing/forged posture refuses the write (fail closed, metadata-only log).
   */
  async addTurn(posture: TurnPosture, turn: Omit<ConversationTurn, 'id' | 'createdAt'>): Promise<string | null> {
    if (!contentWritable(posture, 'TurnsStore.addTurn', turn.sessionId)) {
      return null;
    }
    // globalThis.crypto works in both Node and Edge bundles (node:crypto does not).
    const turnRef = globalThis.crypto.randomUUID();
    const provenance = mintTurnProvenance(posture, turn.role, turnRef, turn.sessionId);
    if (!provenance) {
      return null; // mint refused — no durable object without provenance (S5)
    }
    // Note: meta and parent_turn_id are not in the production schema — omitted
    const result = await query<{ id: string }>(
      `
      INSERT INTO conversation_turns (user_id, session_id, role, content, posture_at_creation, provenance)
      SELECT $1, $2, $3, $4, 'normal', $5::jsonb
      WHERE NOT EXISTS (
        SELECT 1 FROM (SELECT session_id FROM astro_maia_protected_origins UNION ALL SELECT session_id FROM astro_maia_transfer_grants) r4f WHERE r4f.session_id = $2
      )
      RETURNING id
      `,
      [
        turn.userId,
        turn.sessionId ?? null,
        turn.role,
        turn.content,
        JSON.stringify(provenance.toJson()),
      ]
    );
    return result.rows[0]?.id ?? null;
  },

  /**
   * Store a translation turn (assistant response with translation metadata)
   *
   * parentTurnId: Valid UUID FK to parent turn (used for DB threading)
   * parentLocalId: Client-side ID when parent not yet persisted (stored in meta only)
   */
  async addTranslation(posture: TurnPosture, opts: {
    userId: string;
    sessionId?: string;
    content: string;
    parentTurnId?: string;     // Valid UUID for FK column
    parentLocalId?: string;    // Non-UUID client ID → stored in meta
    toSystem: string;
    fromSystem?: string;
    lens?: string;
    style?: string;
  }): Promise<string | null> {
    const meta: TurnMeta = {
      kind: 'translation',
      toSystem: opts.toSystem,
      fromSystem: opts.fromSystem ?? 'auto',
      lens: opts.lens ?? 'member-default',
      style: opts.style ?? 'meaning',
      // Store local ID in meta if parent wasn't a valid UUID
      ...(opts.parentLocalId ? { parentLocalId: opts.parentLocalId } : {}),
    };

    return this.addTurn(posture, {
      userId: opts.userId,
      sessionId: opts.sessionId,
      role: 'assistant',
      content: opts.content,
      meta,
      parentTurnId: opts.parentTurnId, // Only set if valid UUID
    });
  },

  /**
   * Store ONE turn of an exchange, idempotently, at an explicit seq.
   *
   * DURABLE TURN ACCEPTANCE (F1, audit 2026-08-10): the member's utterance must
   * become durable when the system ACCEPTS it, not when the browser later
   * reports a completed pair. `addExchange` can only write once both halves
   * exist, so a member turn whose generation never completed — or whose client
   * unloaded first — was never recorded at all. This writer lets the serving
   * boundary persist each half at the moment it genuinely exists:
   *   seq 0 = member utterance, durable at acceptance (before generation)
   *   seq 1 = MAIA response, durable only once it actually exists
   *
   * Idempotent on (exchange_id, seq): a retry, a re-render, or a later
   * client-side pair write carrying the SAME exchangeId is dropped by
   * ON CONFLICT DO NOTHING rather than duplicated.
   *
   * SANCTUARY (S1) and provenance (S5) are enforced exactly as in addExchange —
   * this is a narrower write, not a weaker one.
   */
  async addExchangeTurn(
    posture: TurnPosture,
    opts: {
      userId: string;
      sessionId?: string;
      role: 'user' | 'assistant';
      content: string;
      exchangeId: string;
    }
  ): Promise<boolean> {
    if (!contentWritable(posture, `TurnsStore.addExchangeTurn:${opts.role}`, opts.sessionId)) {
      return false;
    }
    const provenance = mintTurnProvenance(posture, opts.role, opts.exchangeId, opts.sessionId);
    if (!provenance) {
      return false; // mint refused — no durable object without provenance (S5)
    }
    const seq = opts.role === 'user' ? 0 : 1;
    const inserted = await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, exchange_id, seq, created_at, posture_at_creation, provenance)
       SELECT $1, $2, $3, $4, $5, $6, clock_timestamp(), 'normal', $7::jsonb
       WHERE NOT EXISTS (
         SELECT 1 FROM (SELECT session_id FROM astro_maia_protected_origins UNION ALL SELECT session_id FROM astro_maia_transfer_grants) r4f WHERE r4f.session_id = $2
       )
       ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
      [
        opts.userId,
        opts.sessionId ?? null,
        opts.role,
        opts.content,
        opts.exchangeId,
        seq,
        JSON.stringify(provenance.toJson()),
      ]
    );
    if (inserted.rowCount === 1) return true;
    // An idempotent retry of an ALREADY-ACCEPTED ordinary exchange is durable.
    // A protected-session refusal must NEVER be reported as 'durable'.
    const existing = await query(
      `SELECT 1 FROM conversation_turns AS ct
       WHERE ct.exchange_id = $1 AND ct.seq = $2
         AND ct.user_id = $3 AND ct.session_id = $4
         AND NOT EXISTS (
           SELECT 1 FROM (SELECT session_id FROM astro_maia_protected_origins UNION ALL SELECT session_id FROM astro_maia_transfer_grants) r4f
            WHERE r4f.session_id = ct.session_id
         )
       LIMIT 1`,
      [opts.exchangeId, seq, opts.userId, opts.sessionId ?? null],
    );
    return existing.rows.length === 1;
  },

  /**
   * R4F protected writer: THE ONLY explicit writer allowed for a consumed
   * chart-conversation scope. A single SQL statement checks the member,
   * live chart consent, private session origin and non-revoked grant before
   * inserting provenance-bound content; no client flag can create authority.
   * This method is not called by a model route in the source candidate.
   */
  async addR4fProtectedTurn(
    posture: TurnPosture,
    opts: {
      userId: string;
      sessionId: string;
      role: 'user' | 'assistant';
      content: string;
      exchangeId: string;
    }
  ): Promise<boolean> {
    if (!contentWritable(posture, 'TurnsStore.addR4fProtectedTurn', opts.sessionId)) {
      return false;
    }
    const minted = mintTurnProvenance(posture, opts.role, opts.exchangeId, opts.sessionId);
    if (!minted) return false;
    const provenance = {
      ...minted.toJson(),
      r4f: { scope: 'conversation_only', origin: 'astrology-pro', sessionId: opts.sessionId },
    };
    const seq = opts.role === 'user' ? 0 : 1;
    const result = await query(
      `INSERT INTO conversation_turns
        (user_id, session_id, role, content, exchange_id, seq, created_at, posture_at_creation, provenance)
       SELECT $1, $2, $3, $4, $5, $6, clock_timestamp(), 'normal', $7::jsonb
         FROM astro_maia_transfer_grants AS grant
         JOIN members AS member ON member.id = grant.member_id
        WHERE grant.member_id = $1::uuid
          AND grant.session_id = $2
          AND grant.scope = 'conversation_only'
          AND grant.status = 'consumed'
          AND member.astrology_consent = 'opted_in'
       ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL DO NOTHING
       RETURNING id`,
      [
        opts.userId, opts.sessionId, opts.role, opts.content,
        opts.exchangeId, seq, JSON.stringify(provenance),
      ]
    );
    return result.rowCount === 1;
  },

  /**
   * Store a user message and assistant response pair.
   *
   * SANCTUARY (S1, boundary-enforced): `posture` is REQUIRED and must be a
   * TurnPosture resolved at the serving boundary. Sanctuary posture — or a
   * missing/forged posture (fail closed) — refuses the write here at the
   * store, regardless of caller behavior. The refusal log carries metadata
   * only. See lib/sanctuary/turnPosture.ts and incident SANC-20260614-01.
   *
   * Uses two sequential INSERTs so created_at timestamps differ by at least
   * one clock tick — guarantees user < assistant ordering when sorted by
   * (created_at ASC, seq ASC).
   *
   * exchangeId: supply the same UUID to make the write idempotent on retry.
   * ON CONFLICT DO NOTHING drops a duplicate silently when exchange_id is set.
   * Omitting exchangeId falls back to the original non-idempotent behaviour.
   */
  async addExchange(
    posture: TurnPosture,
    userId: string,
    sessionId: string | undefined,
    userMessage: string,
    assistantResponse: string,
    exchangeId?: string
  ): Promise<void> {
    if (!contentWritable(posture, 'TurnsStore.addExchange', sessionId)) {
      return;
    }
    if (!exchangeId) {
      console.warn('[TurnsStore] addExchange called without exchangeId — turns will not be idempotent');
    }
    const eid = exchangeId ?? null;
    // S5: provenance minted here, per turn, from the boundary-resolved posture.
    // The exchange id (or a per-call reference) is the typed source's turnId.
    const turnRef = exchangeId ?? globalThis.crypto.randomUUID();
    const userProvenance = mintTurnProvenance(posture, 'user', turnRef, sessionId);
    const assistantProvenance = mintTurnProvenance(posture, 'assistant', turnRef, sessionId);
    if (!userProvenance || !assistantProvenance) {
      return; // mint refused — no durable object without provenance (S5)
    }
    // User turn first (seq=0) — use clock_timestamp() so each INSERT gets its
    // own wall-clock value even inside the same transaction.
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, exchange_id, seq, created_at, posture_at_creation, provenance)
       SELECT $1, $2, 'user', $3, $4, 0, clock_timestamp(), 'normal', $5::jsonb
       WHERE NOT EXISTS (
         SELECT 1 FROM (SELECT session_id FROM astro_maia_protected_origins UNION ALL SELECT session_id FROM astro_maia_transfer_grants) r4f WHERE r4f.session_id = $2
       )
       ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
      [userId, sessionId ?? null, userMessage, eid, JSON.stringify(userProvenance.toJson())]
    );
    // Assistant turn second (seq=1) — clock_timestamp() will be strictly later
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, exchange_id, seq, created_at, posture_at_creation, provenance)
       SELECT $1, $2, 'assistant', $3, $4, 1, clock_timestamp(), 'normal', $5::jsonb
       WHERE NOT EXISTS (
         SELECT 1 FROM (SELECT session_id FROM astro_maia_protected_origins UNION ALL SELECT session_id FROM astro_maia_transfer_grants) r4f WHERE r4f.session_id = $2
       )
       ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
      [userId, sessionId ?? null, assistantResponse, eid, JSON.stringify(assistantProvenance.toJson())]
    );
  },

  /**
   * R5f: atomic consent-audit + member-owned turn pair.
   * A failed audit or either turn write rolls back the complete transaction.
   * Never acknowledge durable storage without a committed content-free audit.
   */
  async addAuditedExchange(
    posture: TurnPosture,
    userId: string,
    sessionId: string | undefined,
    userMessage: string,
    assistantResponse: string,
    exchangeId: string
  ): Promise<void> {
    if (!contentWritable(posture, 'TurnsStore.addAuditedExchange', sessionId)) {
      throw new Error('Turn persistence refused by posture');
    }
    const userProv = mintTurnProvenance(posture, 'user', exchangeId, sessionId);
    const maiaProv = mintTurnProvenance(posture, 'assistant', exchangeId, sessionId);
    if (!userProv || !maiaProv) throw new Error('Turn provenance mint refused');
    await transaction(async client => {
      await client.query(
        `INSERT INTO runtime_consent_state(request_id, member_id, session_id, posture, resolved_from)
         VALUES ($1,$2,$3,'normal',$4)
         ON CONFLICT(request_id) DO NOTHING`,
        [exchangeId,userId,sessionId ?? null,posture.source]
      );
      const recorded = await client.query<{member_id:string|null;session_id:string|null;posture:string}>(
        `SELECT member_id,session_id,posture FROM runtime_consent_state WHERE request_id=$1`,
        [exchangeId]
      );
      const audit=recorded.rows[0];
      if (!audit || audit.member_id!==userId ||
          audit.session_id!==(sessionId ?? null) || audit.posture!=='normal') {
        throw new Error('Durable consent record disagrees with exchange');
      }
      await client.query(
        `INSERT INTO conversation_turns(user_id,session_id,role,content,exchange_id,seq,created_at,posture_at_creation,provenance)
         SELECT $1,$2,'user',$3,$4,0,clock_timestamp(),'normal',$5::jsonb
         WHERE NOT EXISTS (
           SELECT 1 FROM (
             SELECT session_id FROM astro_maia_protected_origins
             UNION ALL SELECT session_id FROM astro_maia_transfer_grants
           ) AS r4f WHERE r4f.session_id = $2
         )
         ON CONFLICT(exchange_id,seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
        [userId,sessionId ?? null,userMessage,exchangeId,JSON.stringify(userProv.toJson())]
      );
      await client.query(
        `INSERT INTO conversation_turns(user_id,session_id,role,content,exchange_id,seq,created_at,posture_at_creation,provenance)
         SELECT $1,$2,'assistant',$3,$4,1,clock_timestamp(),'normal',$5::jsonb
         WHERE NOT EXISTS (
           SELECT 1 FROM (
             SELECT session_id FROM astro_maia_protected_origins
             UNION ALL SELECT session_id FROM astro_maia_transfer_grants
           ) AS r4f WHERE r4f.session_id = $2
         )
         ON CONFLICT(exchange_id,seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
        [userId,sessionId ?? null,assistantResponse,exchangeId,JSON.stringify(maiaProv.toJson())]
      );
      // A reused exchange ID cannot silently adopt another member's turns.
      const check=await client.query<{user_id:string;seq:number}>(
        'SELECT user_id,seq FROM conversation_turns WHERE exchange_id=$1',[exchangeId]
      );
      if (check.rows.length!==2 || check.rows.some(r=>r.user_id!==userId) ||
          !check.rows.some(r=>r.seq===0) || !check.rows.some(r=>r.seq===1)) {
        throw new Error('Durable exchange ownership/completeness mismatch');
      }
    });
  },

  /**
   * Delete all turns for a session (Sanctuary purge)
   */
  async deleteBySessionId(sessionId: string): Promise<number> {
    const result = await query(
      `DELETE FROM conversation_turns WHERE session_id = $1`,
      [sessionId]
    );
    return result.rowCount ?? 0;
  },

  /**
   * Clean up old turns (keep last N per user)
   */
  async pruneOldTurns(userId: string, keepCount: number = 100): Promise<number> {
    const result = await query(
      `
      WITH turns_to_keep AS (
        SELECT id FROM conversation_turns
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      )
      DELETE FROM conversation_turns
      WHERE user_id = $1
        AND id NOT IN (SELECT id FROM turns_to_keep)
      `,
      [userId, keepCount]
    );

    return result.rowCount ?? 0;
  },
};
