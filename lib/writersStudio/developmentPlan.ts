/**
 * WS-DEVELOP-STUDIO · M4 — the development plan (pure half).
 *
 * A plan step is a DIRECTION for the writer, anchored to an EXACT passage of their own saved text. ⛔ A step never carries replacement prose and a plan never
 * changes the manuscript: it is opened in the existing passage desk, one passage at a time, with that desk's own authorization and Undo (founder ruling 2026-11-09).
 * Grounding is mechanical: a step whose anchor does not occur in the named chapter does not exist.
 */
import { createHash } from 'crypto';

export const STEP_STATUS = ['open', 'working', 'done', 'dropped'] as const;
export type StepStatus = (typeof STEP_STATUS)[number];
export const MAX_STEPS = 5;
export const MAX_ANCHOR = 200;
export const MAX_DIRECTION = 500;

export interface PlanStep { id: string; chapterId: string; anchor: string; direction: string; why: string; status: StepStatus }
export interface PlanChapter { id: string; heading: string | null; text: string }
export interface RawStep { chapterId?: unknown; anchor?: unknown; direction?: unknown; why?: unknown }

const norm = (s: string) => s.normalize('NFKC').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
export const digestOfText = (t: string): string => createHash('sha256').update(t).digest('hex');
const str = (v: unknown, max: number): string | null => (typeof v === 'string' && v.trim().length > 0 ? v.trim().slice(0, max) : null);

/** Keep only steps that are real: a named chapter she was handed, an anchor that occurs in it, a direction in plain words. Returns what was dropped, never silently. */
export function groundSteps(raw: readonly RawStep[], chapters: readonly PlanChapter[], newId: () => string): { steps: PlanStep[]; dropped: { reason: string }[] } {
  const byId = new Map(chapters.map((c) => [c.id, c]));
  const steps: PlanStep[] = []; const dropped: { reason: string }[] = [];
  for (const r of raw) {
    if (steps.length >= MAX_STEPS) { dropped.push({ reason: 'more than the maximum number of steps' }); continue; }
    const chapterId = str(r.chapterId, 80); const anchor = str(r.anchor, MAX_ANCHOR); const direction = str(r.direction, MAX_DIRECTION);
    if (!chapterId || !anchor || !direction) { dropped.push({ reason: 'incomplete step' }); continue; }
    const ch = byId.get(chapterId);
    if (!ch) { dropped.push({ reason: 'a chapter she was not handed' }); continue; }
    if (!norm(ch.text).includes(norm(anchor))) { dropped.push({ reason: 'the anchor is not in that chapter' }); continue; }
    steps.push({ id: newId(), chapterId, anchor, direction, why: str(r.why, 300) ?? '', status: 'open' });
  }
  return { steps, dropped };
}

/** What the WRITER may change on a step: its wording, its status, or removing it. Never its anchor or chapter. */
export interface StepEdit { id: string; direction?: unknown; status?: unknown; remove?: unknown }
export function applyStepEdits(steps: readonly PlanStep[], edits: readonly StepEdit[]): PlanStep[] {
  const byId = new Map(edits.map((e) => [e.id, e]));
  const out: PlanStep[] = [];
  for (const s of steps) {
    const e = byId.get(s.id);
    if (!e) { out.push(s); continue; }
    if (e.remove === true) continue;
    const direction = e.direction === undefined ? s.direction : (str(e.direction, MAX_DIRECTION) ?? s.direction);
    const status = (STEP_STATUS as readonly unknown[]).includes(e.status) ? (e.status as StepStatus) : s.status;
    out.push({ ...s, direction, status });
  }
  return out;
}

/** A step is stale when the chapter it was made against has changed since. */
export function staleStepIds(steps: readonly PlanStep[], basis: readonly { sectionId: string; digest: string }[], currentDigests: ReadonlyMap<string, string>): string[] {
  const made = new Map(basis.map((b) => [b.sectionId, b.digest]));
  return steps.filter((s) => { const now = currentDigests.get(s.chapterId); const was = made.get(s.chapterId); return now !== undefined && was !== undefined && now !== was; }).map((s) => s.id);
}

/**
 * The strict verdict the passage hand-off needs. A unique phrase match is not evidence the proposal still fits:
 * only a chapter whose text is byte-identical to what MAIA read is `verified`. No record of what she read, or no way to read it now, is `unverified` — never assumed fine.
 */
export type StepStanding = 'verified' | 'changed' | 'unverified';
export function stepStanding(step: Pick<PlanStep, 'chapterId'>, basis: readonly { sectionId: string; digest: string }[], currentDigests: ReadonlyMap<string, string>): StepStanding {
  const was = basis.find((b) => b.sectionId === step.chapterId)?.digest;
  const now = currentDigests.get(step.chapterId);
  if (!was || !now) return 'unverified';
  return was === now ? 'verified' : 'changed';
}

/**
 * Find a step's anchor in the chapter's CURRENT text. Exactly one match or nothing: a passage that has moved, or that occurs twice, is never guessed.
 * Exact match first; then the same words ignoring case. Returns offsets into `body`.
 */
export function locateAnchor(body: string, anchor: string): { ok: true; start: number; end: number; text: string } | { ok: false; reason: 'missing' | 'ambiguous' } {
  const a = anchor.trim();
  if (!a) return { ok: false, reason: 'missing' };
  for (const [hay, needle] of [[body, a], [body.toLowerCase(), a.toLowerCase()]] as const) {
    const first = hay.indexOf(needle);
    if (first === -1) continue;
    if (hay.indexOf(needle, first + 1) !== -1) return { ok: false, reason: 'ambiguous' };
    return { ok: true, start: first, end: first + needle.length, text: body.slice(first, first + needle.length) };
  }
  return { ok: false, reason: 'missing' };
}

/** Develop notes which step the writer chose; Write reads it once. Only an id, never prose. */
/** Signals a mounted Write room that a new hand-off is waiting (the key alone serves a fresh mount). */
export const PLAN_HANDOFF_EVENT = 'ws-plan-handoff';
export const PLAN_HANDOFF_KEY = (manuscriptId: string): string => `ws-plan-step:${manuscriptId}`;

/** Every way a plan-step hand-off can end. Only `hold` touches anything, and only the held passage and (if open) the step's status. */
export type HandoffDecision =
  | { kind: 'superseded' }
  | { kind: 'refuse'; reason: 'no_plan' | 'no_step' | 'no_verdict' | 'unsaved' | 'changed' | 'unverified' | 'missing' | 'ambiguous'; focusSectionId: string | null }
  | { kind: 'hold'; sectionId: string; start: number; end: number; text: string; markWorking: boolean };

/**
 * PURE. Decide a hand-off from facts only. Order matters and is the law:
 * a newer hand-off wins · a missing server verdict refuses · unsaved text refuses (the server verified the SAVED chapter) ·
 * a changed or unverified chapter refuses · the words must occur exactly once in the text being held.
 */
export function decideHandoff(i: {
  seq: number; latestSeq: number;
  view: { plan: { steps: readonly PlanStep[] } | null; staleStepIds: readonly string[]; unverifiedStepIds: readonly string[]; verdict: boolean } | undefined;
  stepId: string;
  sectionIds: readonly string[];
  saveStateOf: (sectionId: string) => string | undefined;
  bodyOf: (sectionId: string) => string;
}): HandoffDecision {
  if (i.seq !== i.latestSeq) return { kind: 'superseded' };
  if (!i.view) return { kind: 'refuse', reason: 'no_plan', focusSectionId: null };
  const step = i.view.plan?.steps.find((x) => x.id === i.stepId);
  if (!step || !i.sectionIds.includes(step.chapterId)) return { kind: 'refuse', reason: 'no_step', focusSectionId: null };
  const sid = step.chapterId;
  if (!i.view.verdict) return { kind: 'refuse', reason: 'no_verdict', focusSectionId: sid };
  const save = i.saveStateOf(sid);
  if (save !== undefined && save !== 'clean') return { kind: 'refuse', reason: 'unsaved', focusSectionId: sid };
  if (i.view.staleStepIds.includes(step.id)) return { kind: 'refuse', reason: 'changed', focusSectionId: sid };
  if (i.view.unverifiedStepIds.includes(step.id)) return { kind: 'refuse', reason: 'unverified', focusSectionId: sid };
  const found = locateAnchor(i.bodyOf(sid), step.anchor);
  if (!found.ok) return { kind: 'refuse', reason: found.reason, focusSectionId: sid };
  return { kind: 'hold', sectionId: sid, start: found.start, end: found.end, text: found.text, markWorking: step.status === 'open' };
}

/** What the writer is told on each refusal. Every one ends with: nothing was changed. */
export const HANDOFF_REFUSAL_COPY: Record<Extract<HandoffDecision, { kind: 'refuse' }>['reason'], string> = {
  no_plan: 'Your plan could not be loaded just now. Nothing was changed.',
  no_step: 'That plan step could not be found in this Work. Nothing was changed.',
  no_verdict: 'I could not confirm this step against your saved chapter just now. The chapter is open; select the passage you mean. Nothing was changed.',
  unsaved: 'This chapter has changes that are not saved yet, so I cannot be sure the step still matches it. Let it save, then choose Work on this passage again. Nothing was changed.',
  changed: 'This chapter has changed since the plan was made, so the step may no longer fit. The chapter is open; check it, then select the passage you mean or ask MAIA to look again. Nothing was changed.',
  unverified: 'I cannot confirm this chapter is the one MAIA read for the plan. The chapter is open; check it, then select the passage you mean or ask MAIA to look again. Nothing was changed.',
  missing: 'Those words are no longer in this chapter as they were. The chapter is open; select the passage you mean. Nothing was changed.',
  ambiguous: 'Those words occur more than once in this chapter, so I have not chosen for you. Select the passage you mean. Nothing was changed.',
};
