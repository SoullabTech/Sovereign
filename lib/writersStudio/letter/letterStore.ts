/**
 * WS-RELATIONAL-ARCHITECTURE step 2 — MAIA's letter and the writer's decisions, kept per Work (server).
 * ⛔ A letter is saved only by the synthesis route from a map it just built; no client path writes one.
 * ⛔ A decision is saved only on the member's own request, and only for a place that exists in a letter that is theirs.
 * Ownership is in every predicate.
 */
import { query } from '@/lib/db/postgres';
import type { WholeManuscriptAttentionMap } from '@/lib/writersStudio/studio/attentionMap';

export type PlaceDecision = 'intended' | 'later';
export interface StoredLetter { id: string; draftRevision: number; map: WholeManuscriptAttentionMap; createdAt: string }

export async function saveLetter(memberId: string, manuscriptId: string, draftRevision: number, map: WholeManuscriptAttentionMap): Promise<string> {
  const r = await query<{ id: string }>(
    `INSERT INTO work_editorial_letters (member_id, manuscript_id, draft_revision, map) VALUES ($1, $2, $3, $4) RETURNING id`,
    [memberId, manuscriptId, draftRevision, JSON.stringify(map)]);
  return r.rows[0]!.id;
}

/** The newest letter for this manuscript, whatever draft it was of (the caller says whether it is current). */
export async function currentLetter(memberId: string, manuscriptId: string): Promise<StoredLetter | null> {
  const r = await query<{ id: string; draft_revision: number; map: WholeManuscriptAttentionMap; created_at: Date }>(
    `SELECT id, draft_revision, map, created_at FROM work_editorial_letters
      WHERE member_id = $1 AND manuscript_id = $2 ORDER BY created_at DESC LIMIT 1`,
    [memberId, manuscriptId]);
  const row = r.rows[0];
  return row ? { id: row.id, draftRevision: Number(row.draft_revision), map: row.map, createdAt: row.created_at.toISOString() } : null;
}

/** Current decision per place (newest event wins; "cleared" removes it). */
export async function currentDecisions(memberId: string, letterId: string): Promise<Record<string, PlaceDecision>> {
  const r = await query<{ place_id: string; decision: string }>(
    `SELECT DISTINCT ON (place_id) place_id, decision FROM work_place_decision_events
      WHERE member_id = $1 AND letter_id = $2 ORDER BY place_id, decided_at DESC, id DESC`,
    [memberId, letterId]);
  const out: Record<string, PlaceDecision> = {};
  for (const row of r.rows) if (row.decision === 'intended' || row.decision === 'later') out[row.place_id] = row.decision;
  return out;
}

export type DecideOutcome = { ok: true } | { ok: false; refusal: 'letter_not_found' | 'place_not_found' };

export async function recordDecision(memberId: string, manuscriptId: string, letterId: string, placeId: string,
  decision: PlaceDecision | 'cleared'): Promise<DecideOutcome> {
  const letter = await query<{ map: WholeManuscriptAttentionMap }>(
    `SELECT map FROM work_editorial_letters WHERE id = $1 AND member_id = $2 AND manuscript_id = $3`,
    [letterId, memberId, manuscriptId]);
  const map = letter.rows[0]?.map;
  if (!map) return { ok: false, refusal: 'letter_not_found' };
  if (!map.items.some((item) => item.id === placeId)) return { ok: false, refusal: 'place_not_found' };
  await query(
    `INSERT INTO work_place_decision_events (member_id, manuscript_id, letter_id, place_id, decision) VALUES ($1, $2, $3, $4, $5)`,
    [memberId, manuscriptId, letterId, placeId, decision]);
  return { ok: true };
}
