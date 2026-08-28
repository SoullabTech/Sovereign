/**
 * CROSS-SURFACE-THREAD-ADOPTION-01 — adopting canonical turns by durable identity.
 *
 * THE DEFECT THIS REPAIRS. `conversation_turns` has always been one canonical
 * thread per member across every surface, and Desktop already re-reads it every
 * 15 s. The web `/maia` surface never did: it restored history once at mount and
 * afterwards only pushed its OWN turns up. So a member could speak on their
 * phone, or into Desktop's native microphone, and the page they were looking at
 * would not show it until a reload. Continuity ran one way.
 *
 * ⛔ WHY IDENTITY AND NOT TEXT, AND NOT WHOLESALE REPLACEMENT.
 *
 * A `ConversationMessage` is far more than a transcript line: it can carry Keep
 * state, integrity results, state vectors, consultations, delivery state, audio
 * and exchange ids. The server's projection of the same turn is four columns.
 * So replacing the local array with the server's version every poll would strip
 * a rich local message of everything the server does not model — seconds after
 * it appeared. And matching by TEXT is worse: two identical member messages are
 * ordinary, and treating them as the same turn silently drops one.
 *
 * The repair is therefore ADDITIVE and keyed on identity the database already
 * writes: `exchange_id` + `seq`, the pair `TurnsStore` uses for idempotent
 * retries. Local messages already carry `metadata.exchangeId`, so a turn coming
 * back from the server can be recognised as one already on screen, and the rich
 * local version is kept untouched.
 *
 * ⚠️ `exchange_id` is NULL on legacy rows written through the old `addTurn()`
 * path, so it is never the sole key — the row `id` is the always-present
 * identity and the fallback.
 */

/** A row as `GET /api/conversation/turns?sessionId=` returns it. */
export interface CanonicalTurnRow {
  id: string;
  role: 'user' | 'assistant' | 'oracle';
  content: string;
  /** Durable exchange identity. NULL for rows written before the seq migration. */
  exchangeId?: string | null;
  /** 0 = the member's half, 1 = MAIA's half of the same exchange. */
  seq?: number | null;
  createdAt: string;
}

/** The subset of a local message this module needs. Nothing else is touched. */
export interface LocalMessageLike {
  id: string;
  role: string;
  metadata?: { exchangeId?: string } | null;
}

/** Which half of an exchange a role represents, matching the `seq` convention. */
export function seqForRole(role: string): number {
  return role === 'user' ? 0 : 1;
}

/**
 * The identity under which a server row has been OBSERVED.
 *
 * ⛔ Always the row id. `exchangeId` is the right key for recognising a turn
 * across representations, but it is nullable; the primary key never is. Read
 * bookkeeping must not have a hole for legacy rows.
 */
export function observedKey(row: CanonicalTurnRow): string {
  return row.id;
}

/**
 * The identity under which a turn may already be REPRESENTED on screen.
 * Null when the row carries no durable exchange identity — such a row can only
 * be matched by id, never by content.
 */
export function representationKey(
  exchangeId: string | null | undefined,
  role: string,
): string | null {
  return exchangeId ? `${exchangeId}:${seqForRole(role)}` : null;
}

/** Every representation the local transcript already holds. */
export function localRepresentations(messages: readonly LocalMessageLike[]): Set<string> {
  const keys = new Set<string>();
  for (const m of messages) {
    keys.add(`id:${m.id}`);
    const k = representationKey(m.metadata?.exchangeId, m.role);
    if (k) keys.add(k);
  }
  return keys;
}

/**
 * One row to adopt, and WHERE it belongs.
 *
 * ⛔ Position is not "the end". The server tail is canonical order, and
 * cross-surface concurrency makes out-of-order arrival ordinary: another
 * surface's turn can be older than something already on screen, so appending
 * would render the conversation in an order it never happened in. Each adopted
 * row therefore carries the neighbouring rows that ARE already represented, so
 * the caller can splice it into its canonical place — without reordering,
 * replacing or otherwise disturbing the local messages around it.
 */
export interface AdoptedRow {
  row: CanonicalTurnRow;
  /** Local message this row follows in canonical order; null if none precedes it. */
  afterLocalId: string | null;
  /** Local message this row precedes; null if nothing represented follows it. */
  beforeLocalId: string | null;
}

export interface AdoptionPlan {
  /** Rows genuinely new to this surface, in server order, each with its anchor. */
  adopt: AdoptedRow[];
  /** Every row observed this poll — whether adopted or already represented. */
  observed: string[];
  /** Nothing new, so React can skip the render entirely. */
  unchanged: boolean;
}

/**
 * Decide what a poll result means for a transcript already on screen.
 *
 * ⛔ Returns a PLAN, not a new array. The caller owns message construction,
 * because only it knows the full local message shape; this module owns the
 * decision, because that is the part worth testing.
 *
 * A row is skipped when it is already represented locally — by durable exchange
 * identity, or by row id. Everything else is new and is adopted in server order.
 *
 * @param rows      the canonical tail, oldest-first
 * @param messages  what is currently on screen
 * @param seen      row ids already observed by previous polls
 */
export function planAdoption(
  rows: readonly CanonicalTurnRow[],
  messages: readonly LocalMessageLike[],
  seen: ReadonlySet<string>,
): AdoptionPlan {
  const represented = localRepresentations(messages);
  const byRepresentation = new Map<string, string>();
  for (const m of messages) {
    byRepresentation.set(`id:${m.id}`, m.id);
    const k = representationKey(m.metadata?.exchangeId, m.role);
    if (k) byRepresentation.set(k, m.id);
  }

  const observed: string[] = [];
  const pending: AdoptedRow[] = [];
  let lastMatchedLocalId: string | null = null;

  for (const row of rows) {
    observed.push(observedKey(row));

    // Is this row already on screen? By id, or by durable exchange identity.
    const k = representationKey(row.exchangeId, row.role);
    const matched = byRepresentation.get(`id:${row.id}`)
      ?? (k ? byRepresentation.get(k) : undefined);

    if (matched) {
      // An anchor: everything adopted after this belongs after it, and
      // everything adopted before it that lacked a successor now has one.
      for (const p of pending) if (p.beforeLocalId === null) p.beforeLocalId = matched;
      lastMatchedLocalId = matched;
      continue;
    }
    if (seen.has(observedKey(row)) || represented.has(`id:${row.id}`)) {
      lastMatchedLocalId = lastMatchedLocalId; // observed already; not an anchor
      continue;
    }
    pending.push({ row, afterLocalId: lastMatchedLocalId, beforeLocalId: null });
  }

  return { adopt: pending, observed, unchanged: pending.length === 0 };
}

// ── polling cadence ─────────────────────────────────────────────────────────
//
// ⛔ NOT the 15 s Desktop uses for background thread detection. This poll backs
// the visible conversation: at 15 s a member would speak, hear MAIA answer
// aloud, and watch an empty screen for twelve seconds. Convergent, and awful.

export const POLL_VISIBLE_MS = 1800;
export const POLL_HIDDEN_MS = 15000;
export const POLL_MAX_BACKOFF_MS = 60000;

/**
 * How long to wait before the next poll.
 *
 * Errors back off exponentially from the base cadence so a server that is down,
 * or a member who is offline, is not hammered at 1.8 s forever. A hidden
 * document backs off regardless: nobody is reading it.
 */
export function nextPollDelayMs(opts: { visible: boolean; consecutiveErrors: number }): number {
  const base = opts.visible ? POLL_VISIBLE_MS : POLL_HIDDEN_MS;
  if (opts.consecutiveErrors <= 0) return base;
  return Math.min(base * 2 ** opts.consecutiveErrors, POLL_MAX_BACKOFF_MS);
}

/**
 * Whether a poll may run at all.
 *
 * ⛔ Never while a turn is in flight. The optimistic member message and the
 * streaming reply are not on the server yet, so adopting mid-turn could append
 * a half-written exchange beneath the one being composed. Deferring costs one
 * cycle; the next poll sees the settled state.
 */
export function mayPoll(state: {
  hasSession: boolean;
  isProcessing: boolean;
  isResponding: boolean;
  isStreaming: boolean;
  inFlightRequest: boolean;
}): boolean {
  return state.hasSession
    && !state.isProcessing
    && !state.isResponding
    && !state.isStreaming
    && !state.inFlightRequest;
}
