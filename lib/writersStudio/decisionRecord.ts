/**
 * WS-DECISION-CONTINUITY — the writer's settled decisions (store + shared read).
 *
 * Binds MAIA to KNOW AND SAY that the writer settled something and not to re-offer it unprompted. ⛔ It never forbids discussion
 * and is never a fact about the text. Created ONLY by a writer gesture (`settleDecision`); the system infers nothing.
 * ⛔ Every query is member-scoped in the SQL. Sanctuary: callers do not read or write (see `decisionContextFor`).
 */
import { query } from '@/lib/db/postgres';
import { livingWorkIdForManuscript } from '@/lib/manuscript/ask/workOfManuscript';
import { loadDismissedObservations } from '@/lib/manuscript/standing/dismissedForConversation';

export type DecisionRoom = 'work_conversation' | 'passage_desk' | 'develop';
export type DecisionSubjectKind = 'note' | 'observation' | 'wording' | 'proposal';

export interface DecisionEventRow {
  readonly id: string; readonly event: 'settle' | 'withdraw';
  readonly room: DecisionRoom | null; readonly subjectKind: DecisionSubjectKind | null;
  readonly subjectRef: string | null; readonly saidIn: string | null;
  readonly versionRef: string | null; readonly targetId: string | null;
}
export interface ActiveDecision {
  readonly id: string; readonly room: DecisionRoom; readonly subjectKind: DecisionSubjectKind;
  readonly subjectRef: string | null; readonly saidIn: string; readonly versionRef: string | null;
}

/** Pure. A settle not later withdrawn; a withdrawn id is never revived (re-settling is a new event with a new id). */
export function activeDecisions(events: readonly DecisionEventRow[]): ActiveDecision[] {
  const live = new Map<string, ActiveDecision>();
  for (const e of events) {
    if (e.event === 'settle' && e.room && e.subjectKind && e.saidIn) {
      live.set(e.id, { id: e.id, room: e.room, subjectKind: e.subjectKind, subjectRef: e.subjectRef, saidIn: e.saidIn, versionRef: e.versionRef });
    } else if (e.event === 'withdraw' && e.targetId) live.delete(e.targetId);
  }
  return [...live.values()];
}

const isUndefinedTable = (e: unknown) => (e as { code?: string })?.code === '42P01';

export async function loadDecisionEvents(memberId: string, livingWorkId: string): Promise<DecisionEventRow[]> {
  try {
    const r = await query<{ id: string; event: 'settle' | 'withdraw'; room: DecisionRoom | null; subject_kind: DecisionSubjectKind | null;
      subject_ref: string | null; said_in: string | null; version_ref: string | null; target_id: string | null }>(
      `SELECT id, event, room, subject_kind, subject_ref, said_in, version_ref, target_id
         FROM writer_decision_events WHERE member_id = $1 AND living_work_id = $2 ORDER BY created_at ASC, id ASC`,
      [memberId, livingWorkId]);
    return r.rows.map((x) => ({ id: x.id, event: x.event, room: x.room, subjectKind: x.subject_kind, subjectRef: x.subject_ref,
      saidIn: x.said_in, versionRef: x.version_ref, targetId: x.target_id }));
  } catch (e) {
    /* Migrate-before-swap: an absent table means "no decisions yet", never a broken conversation. Anything else stays visible. */
    if (isUndefinedTable(e)) return [];
    throw e;
  }
}

/** The ONE shared read. The text carries the writer's own words and how MAIA may use them; nothing about the manuscript. */
export function decisionContextText(decisions: readonly ActiveDecision[], dismissed: readonly string[] = []): string {
  if (decisions.length === 0 && dismissed.length === 0) return '';
  return [
    'WHAT THE WRITER HAS SETTLED (their own words; they can withdraw any of these at any time):',
    /* one line each: the writer's words can never open a new section of the prompt */
    ...decisions.map((d) => `  - ${d.saidIn.replace(/\s*[\r\n]+\s*/g, ' ').trim()}`),
    ...(dismissed.length > 0
      ? ['The writer also set aside these earlier observations of yours in Develop (your words, not theirs; setting aside does not mean they are false):',
         ...dismissed.map((x) => `  - "${x}"`)]
      : []),
    'Know that they settled these, and say so if it matters. Do not offer these again unprompted.',
    'If they ask to revisit one, discuss it freely. They are the writer’s decisions, not facts about the manuscript, and they are not a standard to judge the text against.',
  ].join('\n');
}

export async function decisionContextForWork(memberId: string, livingWorkId: string, manuscriptId?: string | null): Promise<string> {
  const dismissed = manuscriptId ? await loadDismissedObservations(memberId, manuscriptId) : [];
  return decisionContextText(activeDecisions(await loadDecisionEvents(memberId, livingWorkId)), dismissed);
}

export async function decisionContextForManuscript(memberId: string, manuscriptId: string): Promise<string> {
  const workId = await livingWorkIdForManuscript(manuscriptId, memberId);
  return workId ? decisionContextForWork(memberId, workId) : '';
}

export async function listActiveDecisions(memberId: string, livingWorkId: string): Promise<ActiveDecision[]> {
  return activeDecisions(await loadDecisionEvents(memberId, livingWorkId));
}
