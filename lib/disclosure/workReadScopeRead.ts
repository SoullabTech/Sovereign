/**
 * WS-WORK-CONTINUITY · Part B — read side of the standing reading scope, plus the
 * one record the Ask route writes (`ask_turn_reads`). Scope EVENTS are written
 * only by the scope route (`workReadScopeWrite.ts`), never from the Ask route's
 * import graph. ⛔ Every query is member-scoped in the SQL.
 */
import { query } from '@/lib/db/postgres';
import { loadProjectedSectionBody } from '@/lib/manuscript/ask/workContext';
import { activeGrant, digestOf, type ActiveGrant, type ScopeEventRow } from '@/lib/manuscript/ask/workReadScope';

export async function loadScopeEvents(memberId: string, livingWorkId: string): Promise<ScopeEventRow[]> {
  const r = await query<{ id: string; event: 'grant' | 'revoke'; level: 'chapter' | 'work' | null; created_at: Date }>(
    `SELECT id, event, level, created_at FROM work_reading_scope_events
      WHERE member_id = $1 AND living_work_id = $2
      ORDER BY created_at ASC, id ASC`, [memberId, livingWorkId]);
  return r.rows.map((x) => ({ id: x.id, event: x.event, level: x.level, createdAt: new Date(x.created_at).toISOString() }));
}

/** Revocation is read at EVERY Ask, so it is effective mid-thread and after recovery. */
export async function loadActiveGrant(memberId: string, livingWorkId: string): Promise<ActiveGrant | null> {
  return activeGrant(await loadScopeEvents(memberId, livingWorkId));
}

export interface SuppliedSection { id: string; label: string | null; body: string; digest: string }

/** Saved text of the chosen sections, each read member-scoped from the row. */
export async function loadSuppliedSections(
  manuscriptId: string, memberId: string, ids: readonly string[],
): Promise<SuppliedSection[]> {
  const out: SuppliedSection[] = [];
  for (const id of ids) {
    const p = await loadProjectedSectionBody(manuscriptId, memberId, id);
    if (p) out.push({ id: p.sectionId, label: p.label, body: p.body, digest: digestOf(p.body) });
  }
  return out;
}

/** Sizes for budgeting, without moving bodies. */
export async function loadSectionSizes(manuscriptId: string, memberId: string): Promise<Map<string, number>> {
  const r = await query<{ id: string; n: string }>(
    `SELECT s.id, LENGTH(s.text)::text AS n
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2`, [manuscriptId, memberId]);
  return new Map(r.rows.map((x) => [x.id, Number(x.n)]));
}

/** Latest digest MAIA was given for each section earlier in this thread. */
export async function loadEarlierDigests(threadId: string, memberId: string): Promise<Map<string, string>> {
  const r = await query<{ section_id: string; body_digest: string }>(
    `SELECT DISTINCT ON (r.section_id) r.section_id, r.body_digest
       FROM ask_turn_reads r JOIN ask_threads t ON t.id = r.thread_id
      WHERE r.thread_id = $1 AND t.member_id = $2
      ORDER BY r.section_id, r.turn_index DESC`, [threadId, memberId]);
  return new Map(r.rows.map((x) => [x.section_id, x.body_digest]));
}

export async function recordTurnReads(
  threadId: string, memberId: string, turnIndex: number, reads: readonly SuppliedSection[],
): Promise<void> {
  for (const s of reads) {
    await query(
      `INSERT INTO ask_turn_reads (thread_id, turn_index, section_id, body_digest)
       SELECT t.id, $2, $3, $4 FROM ask_threads t WHERE t.id = $1 AND t.member_id = $5
       ON CONFLICT DO NOTHING`, [threadId, turnIndex, s.id, s.digest, memberId]);
  }
}
