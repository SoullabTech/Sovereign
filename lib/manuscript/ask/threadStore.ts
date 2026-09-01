/**
 * WS2-05B-8B-02c-2 — the editorial thread, persisted.
 *
 * THE ONLY TABLES THIS FILE WRITES ARE `ask_threads` AND `ask_turns`. It holds a
 * conversation ABOUT a Work and never the Work: no manuscript row, no section,
 * no proposal, no structure unit, no adoption. The static gate asserts the
 * table names, not just the intent, because "we only meant to write the thread"
 * is not a property a program has.
 *
 * NO PROSE FROM THE WORK IS STORED HERE. A turn holds what the author typed and
 * what MAIA answered. It is not a place manuscript text accumulates a second
 * copy - the same reason `proposalStore.assertNoProse` exists one layer over.
 *
 * APPEND-ONLY IS ENFORCED BY THE DATABASE, not by this module. `ask_turns` has a
 * trigger that refuses UPDATE outright, so a future caller that tries to "fix" a
 * turn fails loudly at the row rather than quietly at the type.
 */

import { query } from '@/lib/db/postgres';
import type { AskAnchor } from './anchor';
import type { StalenessState } from './staleness';

export interface ReadingIdentity {
  proposalId: string;
  interpretationInputHash: string;
  sectionTopologyHash: string;
  reviewRevision: number;
  readerProvenance: unknown | null;
}

export interface AskTurn {
  index: number;
  speaker: 'author' | 'maia';
  body: string;
  staleness: StalenessState;
  answerProvenance: unknown | null;
  createdAt: Date;
}

export interface AskThread {
  id: string;
  manuscriptId: string;
  anchor: AskAnchor;
  reading: ReadingIdentity | null;
  canonicalAtOpen: string;
  initiatedBy: 'maia' | 'author';
  openedAt: Date;
  turns: AskTurn[];
}

/**
 * Open a thread.
 *
 * `canonicalAtOpen` IS REQUIRED, including for a thread with no reading: it is
 * the BEFORE of the before/after canonical assertion, and a thread that opened
 * without one could never prove nothing moved beneath it.
 */
export async function openThread(input: {
  manuscriptId: string;
  memberId: string;
  anchor: AskAnchor;
  reading: ReadingIdentity | null;
  canonicalAtOpen: string;
  initiatedBy: 'maia' | 'author';
}): Promise<string> {
  const r = await query(
    `INSERT INTO ask_threads
       (manuscript_id, member_id, anchor, reading_identity, canonical_at_open, initiated_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [input.manuscriptId, input.memberId, JSON.stringify(input.anchor),
     input.reading ? JSON.stringify(input.reading) : null,
     input.canonicalAtOpen, input.initiatedBy]);
  return r.rows[0].id as string;
}

/**
 * Append one turn.
 *
 * The index is taken inside the statement rather than read-then-written, so two
 * concurrent turns cannot both compute the same next index and race; the primary
 * key on (thread_id, turn_index) then refuses the loser rather than letting a
 * turn overwrite another turn's slot.
 */
export async function appendTurn(input: {
  threadId: string;
  memberId: string;
  speaker: 'author' | 'maia';
  body: string;
  staleness: StalenessState;
  answerProvenance?: unknown | null;
}): Promise<number> {
  const r = await query(
    `INSERT INTO ask_turns (thread_id, turn_index, speaker, body, staleness, answer_provenance)
     SELECT t.id,
            COALESCE((SELECT MAX(turn_index) + 1 FROM ask_turns WHERE thread_id = t.id), 0),
            $2, $3, $4, $5
       FROM ask_threads t
      WHERE t.id = $1 AND t.member_id = $6
     RETURNING turn_index`,
    [input.threadId, input.speaker, input.body,
     JSON.stringify(input.staleness),
     input.answerProvenance ? JSON.stringify(input.answerProvenance) : null,
     input.memberId]);
  if (r.rows.length === 0) throw new Error('thread_not_found');
  return Number(r.rows[0].turn_index);
}

/** Load one thread with its turns, scoped to its owner in the SQL. */
export async function loadThread(
  threadId: string, memberId: string,
): Promise<AskThread | null> {
  const t = await query(
    `SELECT id, manuscript_id, anchor, reading_identity, canonical_at_open,
            initiated_by, opened_at
       FROM ask_threads WHERE id = $1 AND member_id = $2 LIMIT 1`,
    [threadId, memberId]);
  const row = t.rows[0];
  if (!row) return null;

  const turns = await query(
    `SELECT turn_index, speaker, body, staleness, answer_provenance, created_at
       FROM ask_turns WHERE thread_id = $1 ORDER BY turn_index`, [threadId]);

  return {
    id: row.id as string,
    manuscriptId: row.manuscript_id as string,
    anchor: row.anchor as AskAnchor,
    reading: (row.reading_identity as ReadingIdentity | null) ?? null,
    canonicalAtOpen: row.canonical_at_open as string,
    initiatedBy: row.initiated_by as 'maia' | 'author',
    openedAt: row.opened_at as Date,
    turns: turns.rows.map((x: Record<string, unknown>) => ({
      index: Number(x.turn_index),
      speaker: x.speaker as 'author' | 'maia',
      body: x.body as string,
      staleness: x.staleness as StalenessState,
      answerProvenance: (x.answer_provenance as unknown) ?? null,
      createdAt: x.created_at as Date,
    })),
  };
}

/**
 * Threads already open on one anchor.
 *
 * MANY THREADS PER ANCHOR ARE LAWFUL - identity is the thread id, and the anchor
 * is a grouping key. This exists so a surface can OFFER to resume one rather
 * than being structurally unable to make a second, which is presentation policy
 * and deliberately not enforced here.
 */
export async function threadsOnAnchor(
  manuscriptId: string, memberId: string, anchor: AskAnchor,
): Promise<{ id: string; openedAt: Date; turnCount: number }[]> {
  const r = await query(
    `SELECT t.id, t.opened_at, COUNT(u.turn_index)::int AS turn_count
       FROM ask_threads t
       LEFT JOIN ask_turns u ON u.thread_id = t.id
      WHERE t.manuscript_id = $1 AND t.member_id = $2 AND t.anchor = $3::jsonb
      GROUP BY t.id, t.opened_at
      ORDER BY t.opened_at DESC`,
    [manuscriptId, memberId, JSON.stringify(anchor)]);
  return r.rows.map((x: Record<string, unknown>) => ({
    id: x.id as string,
    openedAt: x.opened_at as Date,
    turnCount: Number(x.turn_count),
  }));
}
