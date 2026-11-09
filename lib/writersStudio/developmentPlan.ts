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
export const PLAN_HANDOFF_KEY = (manuscriptId: string): string => `ws-plan-step:${manuscriptId}`;
