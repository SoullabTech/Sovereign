// Attention substrate — the per-recipient, SOURCE-AGNOSTIC attention loop.
// Spec: docs/specs/ATTENTION_SUBSTRATE_GENERALIZATION_2026-06-06.md  (builds on
// COLAB_ATTENTION_LAYER_SPEC_2026-06-06.md). Doctrine: "Universal attention
// substrate; Co-lab-only first surface."
//
// An attention_item is a SENDER-DECLARED loop. Boundary (enforced structurally):
//   - created_by is always a human — no system-authored items                       [S1]
//   - status is closure-only (open | resolved | declined)
//   - "opened" is a TIMESTAMP (opened_at), NOT a status — opening ≠ closing.
//     No field carries read-depth / agreement / reception / consent, so "Opened"
//     cannot leak any of those meanings.                                            [D2/S4]
//   - the recipient owns opened_at / resolve / decline; the sender may only withdraw [S5]
//   - ordering is deterministic (kind priority, then recency) — never scored         [S2]
//
// The ORIGIN is polymorphic: (source_type, source_id, source_context). Display reads
// entirely from source_context (no origin-table joins) — see §4 of the spec.

import { query } from '@/lib/db/postgres';

export type AttentionKind = 'mention' | 'request' | 'assignment' | 'thread_reply';
export type AttentionStatus = 'open' | 'resolved' | 'declined';

// ── Source types (open enum). colab_message is the only LIVE materializer; the
//    rest are HELD (spec §3) — named, not built.
export const COLAB_MESSAGE = 'colab_message';

// Minimal display contract every source must denormalize into source_context.
export interface AttentionContext {
  excerpt: string;   // ≤280 chars for the For You list
  deepLink: string;  // where to act on it
  [k: string]: unknown;
}

const MENTION_PATTERN = /@(\w+)/g;
// Low-signal kinds carry no reply obligation → auto-resolve when opened (D3).
const LOW_SIGNAL: AttentionKind[] = ['mention', 'thread_reply'];

// ── Generic substrate entry point ───────────────────────────────────────────
// Any source builds (sourceType, sourceId, context) and calls this. Idempotent
// via the (recipient, source_type, source_id, kind) unique index. created_by must
// be a human (S1). Single-recipient; multi-recipient sources loop over this.
export async function createAttentionItem(p: {
  recipientId: string;
  createdBy: string;
  sourceType: string;
  sourceId: string;
  sourceContext: AttentionContext;
  kind: AttentionKind;
}): Promise<void> {
  await query(
    `INSERT INTO attention_items
       (recipient_id, created_by, source_type, source_id, source_context, kind)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     ON CONFLICT (recipient_id, source_type, source_id, kind) DO NOTHING`,
    [p.recipientId, p.createdBy, p.sourceType, p.sourceId, JSON.stringify(p.sourceContext), p.kind]
  );
}

// Best-effort purge when a source entity is hard-deleted — replaces the FK cascade
// the team_messages FK used to give for free (spec §4). Wire from each source's
// delete path. (Co-lab uses soft-delete today, so there is no live caller yet.)
export async function purgeAttentionForSource(sourceType: string, sourceId: string): Promise<void> {
  try {
    await query(`DELETE FROM attention_items WHERE source_type = $1 AND source_id = $2`, [sourceType, sourceId]);
  } catch (err) {
    console.error('[attention] purge failed (non-blocking)', err);
  }
}

// ── colab_message materializer ──────────────────────────────────────────────
// Create per-recipient items for @mentions in a freshly-sent channel message.
// D1: only @-mentioned members get a loop — a request with no @mention creates
// nothing. A 'request' message elevates its mentions from 'mention' → 'request'.
// Never throws — must not block message delivery.
export async function createAttentionItemsForMessage(params: {
  messageId: string;
  channelId: string;
  senderId: string;
  body: string;
  messageKind: string;
}): Promise<void> {
  try {
    const { messageId, channelId, senderId, body, messageKind } = params;
    const usernames = Array.from(new Set([...body.matchAll(MENTION_PATTERN)].map(m => m[1])));
    if (usernames.length === 0) return; // D1: no @mention → no obligation

    const kind: AttentionKind = messageKind === 'request' ? 'request' : 'mention';

    // colab buildContext: channel slug/name for the deep-link + display.
    const ch = await query<{ slug: string; name: string }>(
      `SELECT slug, name FROM team_channels WHERE id = $1`, [channelId]
    );
    const slug = ch.rows[0]?.slug ?? '';
    const context: AttentionContext = {
      excerpt: body.slice(0, 280),
      deepLink: `/team/${slug}`,
      channelSlug: slug,
      channelName: ch.rows[0]?.name ?? '',
    };

    // Resolve usernames → members (skip sender + unknowns), then create one loop each
    // via the generic substrate entry point.
    const recips = await query<{ id: string }>(
      `SELECT id FROM members WHERE username = ANY($1) AND id <> $2`, [usernames, senderId]
    );
    let n = 0;
    for (const { id } of recips.rows) {
      await createAttentionItem({
        recipientId: id, createdBy: senderId,
        sourceType: COLAB_MESSAGE, sourceId: messageId, sourceContext: context, kind,
      });
      n++;
    }
    if (n > 0) {
      console.log(`[attention] items created { source:'${COLAB_MESSAGE}', kind:'${kind}', recipients:${n}, src:${messageId.slice(0, 8)} }`);
    }
  } catch (err) {
    // The attention layer never blocks message delivery.
    console.error('[attention] colab create failed (non-blocking)', err);
  }
}

// ── For You read (recipient surface) ────────────────────────────────────────
export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  status: AttentionStatus;
  createdByName: string;
  sourceType: string;
  sourceId: string;
  excerpt: string;
  deepLink: string;
  channelSlug?: string; // colab convenience (from context) for "#slug" display
  createdAt: string;
  openedAt: string | null;
}

interface AttentionRow {
  id: string;
  kind: AttentionKind;
  status: AttentionStatus;
  created_by_name: string;
  source_type: string;
  source_id: string;
  source_context: Record<string, unknown> | null;
  created_at: string;
  opened_at: string | null;
}

function toItem(r: AttentionRow): AttentionItem {
  const ctx = r.source_context ?? {};
  return {
    id: r.id,
    kind: r.kind,
    status: r.status,
    createdByName: r.created_by_name,
    sourceType: r.source_type,
    sourceId: r.source_id,
    excerpt: typeof ctx.excerpt === 'string' ? ctx.excerpt : '',
    deepLink: typeof ctx.deepLink === 'string' ? ctx.deepLink : '#',
    channelSlug: typeof ctx.channelSlug === 'string' ? ctx.channelSlug : undefined,
    createdAt: r.created_at,
    openedAt: r.opened_at,
  };
}

/**
 * The recipient's "For You" list. Renders from source_context — NO origin-table
 * joins (only `members` for the author name). Deterministic order (S2): kind
 * priority, then recency. Open loops only, unless includeClosed. Surfaces scope
 * via sourceTypes (spec §6); Co-lab For You passes none (shows all).
 */
export async function listAttentionItems(
  recipientId: string,
  opts: { includeClosed?: boolean; limit?: number; sourceTypes?: string[] } = {}
): Promise<AttentionItem[]> {
  const includeClosed = opts.includeClosed ?? false;
  const limit = Math.min(opts.limit ?? 100, 200);
  const sourceTypes = opts.sourceTypes ?? null;
  const res = await query<AttentionRow>(
    `SELECT a.id, a.kind, a.status, a.source_type, a.source_id, a.source_context,
            a.created_at, a.opened_at,
            COALESCE(cb.name, cb.username) AS created_by_name
       FROM attention_items a
       JOIN members cb ON cb.id = a.created_by
      WHERE a.recipient_id = $1
        AND ($2 OR a.status = 'open')
        AND ($3::text[] IS NULL OR a.source_type = ANY($3::text[]))
      ORDER BY
        CASE a.kind WHEN 'request' THEN 0 WHEN 'assignment' THEN 1 WHEN 'mention' THEN 2 ELSE 3 END,
        a.created_at DESC
      LIMIT ${limit}`,
    [recipientId, includeClosed, sourceTypes]
  );
  return res.rows.map(toItem);
}

/** Count of open loops, for the For-You badge. */
export async function countOpenAttention(recipientId: string): Promise<number> {
  const res = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM attention_items WHERE recipient_id = $1 AND status = 'open'`,
    [recipientId]
  );
  return res.rows[0]?.n ?? 0;
}

// ── Lifecycle (source-agnostic — unchanged by generalization) ───────────────

/**
 * Recipient opens a loop: sets opened_at (does NOT close it). Low-signal kinds
 * (mention / thread_reply) auto-resolve on open (D3); request / assignment stay open.
 * S5: only the recipient may do this.
 */
export async function markAttentionOpened(itemId: string, recipientId: string): Promise<boolean> {
  const res = await query(
    `UPDATE attention_items
        SET opened_at   = COALESCE(opened_at, NOW()),
            status      = CASE WHEN kind = ANY($3::text[]) AND status = 'open' THEN 'resolved' ELSE status END,
            resolved_at = CASE WHEN kind = ANY($3::text[]) AND status = 'open' THEN NOW()      ELSE resolved_at END
      WHERE id = $1 AND recipient_id = $2`,
    [itemId, recipientId, LOW_SIGNAL]
  );
  return (res.rowCount ?? 0) > 0;
}

/** Recipient explicitly closes a loop as handled. S5: recipient-only. */
export async function resolveAttentionItem(itemId: string, recipientId: string): Promise<boolean> {
  const res = await query(
    `UPDATE attention_items
        SET status = 'resolved', resolved_at = NOW(), opened_at = COALESCE(opened_at, NOW())
      WHERE id = $1 AND recipient_id = $2 AND status = 'open'`,
    [itemId, recipientId]
  );
  return (res.rowCount ?? 0) > 0;
}

/** Recipient honestly declines a loop (better than ghosting — D5). S5: recipient-only. */
export async function declineAttentionItem(itemId: string, recipientId: string): Promise<boolean> {
  const res = await query(
    `UPDATE attention_items
        SET status = 'declined', resolved_at = NOW(), opened_at = COALESCE(opened_at, NOW())
      WHERE id = $1 AND recipient_id = $2 AND status = 'open'`,
    [itemId, recipientId]
  );
  return (res.rowCount ?? 0) > 0;
}

/** Sender withdraws their own loop — the sender's ONLY write (S5). */
export async function withdrawAttentionItem(itemId: string, senderId: string): Promise<boolean> {
  const res = await query(
    `DELETE FROM attention_items WHERE id = $1 AND created_by = $2`,
    [itemId, senderId]
  );
  return (res.rowCount ?? 0) > 0;
}

// ── Sender-side states (for the author's own source entities) ───────────────
export interface SenderAttentionState {
  sourceId: string;
  recipientId: string;
  recipientName: string;
  kind: AttentionKind;
  status: AttentionStatus;
  openedAt: string | null;
  resolvedAt: string | null;
}

/**
 * For the SENDER's own source entities (e.g. their channel messages): the Sent /
 * Opened / Resolved / Declined states of the loops they created. Keyed by
 * (source_type, source_id); only the creator sees these. "Opened" = opened_at IS
 * NOT NULL: a mechanical fact, never agreement/consent (D2).
 */
export async function getSenderAttentionStates(
  sourceType: string,
  sourceIds: string[],
  senderId: string
): Promise<SenderAttentionState[]> {
  if (sourceIds.length === 0) return [];
  const res = await query<{
    source_id: string;
    recipient_id: string;
    recipient_name: string;
    kind: AttentionKind;
    status: AttentionStatus;
    opened_at: string | null;
    resolved_at: string | null;
  }>(
    `SELECT a.source_id, a.recipient_id, a.kind, a.status, a.opened_at, a.resolved_at,
            COALESCE(r.name, r.username) AS recipient_name
       FROM attention_items a
       JOIN members r ON r.id = a.recipient_id
      WHERE a.source_type = $1 AND a.source_id = ANY($2) AND a.created_by = $3`,
    [sourceType, sourceIds, senderId]
  );
  return res.rows.map(r => ({
    sourceId: r.source_id,
    recipientId: r.recipient_id,
    recipientName: r.recipient_name,
    kind: r.kind,
    status: r.status,
    openedAt: r.opened_at,
    resolvedAt: r.resolved_at,
  }));
}
