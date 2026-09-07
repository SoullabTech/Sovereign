'use client';

/**
 * Writer's Studio — Goals client.
 *
 *     The writer declares the goal.
 *     The system may measure progress against it.
 *     MAIA may not invent the goal.
 *
 * FR-09 · FR-10 · FR-11 · FR-12. The two dangerous things a goals feature can
 * do — put a number on a qualitative aim, and turn a number into a verdict —
 * are refused by the SHAPES in this file, not by discipline at the call sites.
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * FR-09, in the type system.
 *
 * A discriminated union rather than one interface with optional fields: there
 * is no value of this type that carries a target on an intention, so no render
 * can reach for one and no future edit can quietly add one. The database holds
 * the same rule as a biconditional CHECK; this is the same law where the code
 * can see it.
 */
/**
 * FR-13 — the three legitimate relationships a writer may want to their own aim.
 *
 *   track_only   "Just show me 2,140 / 3,000. Don't coach me."
 *   encourage    "Help me stay connected to why I'm writing this."
 *   work_with    "I'm stuck. Inspire me."
 *
 * `track_only` is the default and a REAL CHOICE, not an absence: an
 * unasked-for encouragement is the first move of a supervisor.
 */
export type GoalSupport = 'track_only' | 'encourage' | 'work_with';

export const GOAL_SUPPORT_LABEL: Readonly<Record<GoalSupport, string>> = {
  track_only: 'just track it',
  encourage: 'encourage me',
  work_with: 'help me work with it',
};

export type WriterGoal = {
  id: string;
  statement: string;
  sectionId: string | null;
  anchorHeading: string | null;
  livingWorkId: string | null;
  /** FR-10 — a date the writer named. Nothing here derives a rate from it. */
  byWhen: string | null;
  standing: 'open' | 'met' | 'set_aside';
  /**
   * FR-13 — what the writer invited, per goal.
   *
   * "Encouragement is invited. Pressure is imposed." The grant is DATA because
   * a grant that lives only in guidance is one refactor from being assumed —
   * and that refactor never looks like a decision to start coaching someone, it
   * looks like passing an extra field into a prompt.
   *
   * On the goal rather than the member: a writer can want company with the book
   * and silence about the essay.
   */
  support: GoalSupport;
  createdAt: string;
  updatedAt: string;
} & (
  | { kind: 'measurable'; metric: 'words' | 'sections'; target: number }
  | { kind: 'intention'; metric?: never; target?: never }
);

/**
 * What the room can actually count. Supplied by the caller because the room
 * already holds these figures; Goals does not open a second reading of the
 * writer's material to measure it.
 */
export interface Measurable {
  /**
   * NULLABLE, and the null is load-bearing. `draftMeta?.words ?? 0` would paint
   * "0 / 3,000 words" over a real draft the room simply had not read yet —
   * telling a writer they have written nothing because WE have not looked. The
   * canvas meta contract already forbids exactly that guard for the statistics
   * figure (`canvasMetaContract.test.ts`, R2); the same rule holds here, where
   * the number sits next to something the writer promised themselves.
   */
  manuscriptWords: number | null;
  sectionCount: number;
  /** Words per section id, for a goal anchored to one. */
  wordsBySection: Readonly<Record<string, number>>;
}

/**
 * FR-11 — progress, or an honest account of why there is none.
 *
 * `unmeasurable` is the case the ruling exists for. A goal of "3,000 words in
 * The Torus" whose section was deleted has lost its DENOMINATOR, not its
 * meaning. Re-basing it on the whole manuscript would convert "3,000 words in
 * this chapter" into "3,000 words in this book" — the system rewriting the
 * writer's intention while appearing to be helpful about it. So measurement
 * stops and says so, and the writer re-anchors or restates if they wish.
 *
 * `none` is not a failure: an intention has no number by construction, and
 * inventing one is the failure.
 */
export type GoalProgress =
  | { kind: 'counted'; current: number; target: number; metric: 'words' | 'sections' }
  /** The thing this goal counted is GONE. A fact about the writer's material. */
  | { kind: 'unmeasurable'; reason: 'anchor-lost'; target: number; metric: 'words' | 'sections' }
  /**
   * The thing is still there; THIS ROOM has not counted it. A fact about our
   * reading, not about the work — and the two must never be shown as one.
   *
   * The INSTRUMENT READ rule, in the product: reporting 0 / 3,000 because we
   * did not look is the same error as a test reporting FAIL because it did not
   * wait. One says the writer has written nothing; the other says we have not
   * read. v1 holds per-section CHARACTER counts and not word counts, and a
   * words-from-characters estimate would be an invented measurement of someone's
   * writing — so a section-scoped word goal is honestly uncounted here until the
   * room reads that section, and becomes countable later with no change of
   * meaning.
   */
  | { kind: 'uncounted'; target: number; metric: 'words' | 'sections' }
  | { kind: 'none' };

export function progressFor(goal: WriterGoal, counts: Measurable): GoalProgress {
  if (goal.kind !== 'measurable') return { kind: 'none' };

  /* Was anchored to a section, and that section is gone: section_id cleared by
     ON DELETE SET NULL while the historical heading survives. */
  const anchorLost = goal.sectionId === null && goal.anchorHeading !== null;
  if (anchorLost) {
    return { kind: 'unmeasurable', reason: 'anchor-lost', target: goal.target, metric: goal.metric };
  }

  if (goal.sectionId !== null) {
    const words = counts.wordsBySection[goal.sectionId];
    /* The section is named and still present, but this room has not counted it.
       NOT the same as anchor-lost, and never reported as 0 against the target:
       a zero would be a statement about the writer's work, and this is a
       statement about our own reading. */
    if (typeof words !== 'number') {
      return { kind: 'uncounted', target: goal.target, metric: goal.metric };
    }
    return { kind: 'counted', current: words, target: goal.target, metric: goal.metric };
  }

  const current = goal.metric === 'words' ? counts.manuscriptWords : counts.sectionCount;
  /* Unread, not empty. Same distinction as the section case above. */
  if (current === null) return { kind: 'uncounted', target: goal.target, metric: goal.metric };
  return { kind: 'counted', current, target: goal.target, metric: goal.metric };
}

/**
 * FR-10, as the only figure this module will render.
 *
 * There is deliberately no `pace`, `remaining`, `onTrack`, `projected`,
 * `daysLeft` or `perDay` export anywhere in this file. The rule is not "do not
 * call them" — it is that **no progress figure may be a function of the
 * clock**, and the way to keep that is to have no function here that takes a
 * date and returns a judgement. `byWhen` is passed to the render as a date and
 * nothing computes with it.
 */
export function progressLabel(p: GoalProgress): string | null {
  if (p.kind === 'counted') {
    return `${p.current.toLocaleString()} / ${p.target.toLocaleString()} ${p.metric}`;
  }
  if (p.kind === 'unmeasurable') {
    return `${p.target.toLocaleString()} ${p.metric} — the section this counted is gone`;
  }
  if (p.kind === 'uncounted') {
    return `${p.target.toLocaleString()} ${p.metric} — not counted here`;
  }
  return null;
}

interface WireGoal {
  id: string;
  statement: string;
  kind: 'measurable' | 'intention';
  metric: 'words' | 'sections' | null;
  target: number | null;
  section_id: string | null;
  anchor_heading: string | null;
  living_work_id: string | null;
  by_when: string | null;
  standing: 'open' | 'met' | 'set_aside';
  support: GoalSupport;
  created_at: string;
  updated_at: string;
}

export function fromWire(g: WireGoal): WriterGoal {
  const common = {
    id: g.id,
    statement: g.statement,
    sectionId: g.section_id,
    anchorHeading: g.anchor_heading,
    livingWorkId: g.living_work_id,
    byWhen: g.by_when,
    standing: g.standing,
    /* An unrecognised or absent grant reads as the quiet one. Failing open
       here would mean a row we cannot interpret invites MAIA to speak. */
    support: (['track_only', 'encourage', 'work_with'] as const).includes(g.support)
      ? g.support
      : 'track_only',
    createdAt: g.created_at,
    updatedAt: g.updated_at,
  };
  /* A wire row claiming `measurable` without both fields is malformed rather
     than a goal with a missing number: it is read as an intention, which is the
     shape that cannot lie. */
  if (g.kind === 'measurable' && g.metric !== null && g.target !== null) {
    return { ...common, kind: 'measurable', metric: g.metric, target: g.target };
  }
  return { ...common, kind: 'intention' };
}

const base = (manuscriptId: string) => `/api/sovereign/manuscripts/${manuscriptId}/goals`;

export async function listGoals(manuscriptId: string): Promise<WriterGoal[]> {
  const res = await apiFetch(base(manuscriptId), { method: 'GET' });
  if (!res.ok) throw new Error('goals-unavailable');
  const json = (await res.json()) as { goals?: WireGoal[] };
  return (json.goals ?? []).map(fromWire);
}

export type NewGoal =
  | { kind: 'measurable'; statement: string; metric: 'words' | 'sections'; target: number; sectionId?: string | null; byWhen?: string | null }
  | { kind: 'intention'; statement: string; sectionId?: string | null; byWhen?: string | null };

export async function declareGoal(manuscriptId: string, goal: NewGoal): Promise<WriterGoal> {
  const res = await apiFetch(base(manuscriptId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  });
  if (!res.ok) throw new Error('goal-not-declared');
  const json = (await res.json()) as { goal: WireGoal };
  return fromWire(json.goal);
}

/** Only the writer's own account changes here. Nothing computes a standing. */
export async function setGoalStanding(
  manuscriptId: string,
  goalId: string,
  standing: 'open' | 'met' | 'set_aside',
): Promise<WriterGoal> {
  const res = await apiFetch(`${base(manuscriptId)}/${goalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ standing }),
  });
  if (!res.ok) throw new Error('goal-not-changed');
  const json = (await res.json()) as { goal: WireGoal };
  return fromWire(json.goal);
}

/** The writer's grant, changed only by the writer. */
export async function setGoalSupport(
  manuscriptId: string,
  goalId: string,
  support: GoalSupport,
): Promise<WriterGoal> {
  const res = await apiFetch(`${base(manuscriptId)}/${goalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ support }),
  });
  if (!res.ok) throw new Error('goal-not-changed');
  const json = (await res.json()) as { goal: WireGoal };
  return fromWire(json.goal);
}

/**
 * FR-13, as the gate every future MAIA path must pass through — and FR-14, as
 * the three things it deliberately is not.
 *
 * ⚠️ CORRECTED. This said the gate answers whether MAIA may speak about a goal
 * "unbidden". That was wrong in one word, and the word was the whole problem:
 *
 *     GRANT     what relationship the writer permits around this goal
 *     TRIGGER   the circumstance in which support may actually appear
 *     CADENCE   how often it may recur
 *
 * **Permission to support is not permission to interrupt.** Choosing
 * `encourage` must not authorize MAIA to speak because progress changed or a
 * date approached. This function returns the GRANT and nothing else — note that
 * it takes no occasion, no timestamp, no previous-support time and no
 * frequency, and cannot be made into a trigger without changing its signature,
 * which is the point.
 *
 * **It answers MAY, never SHOULD.** A stored `encourage` cannot itself become a
 * command to produce motivational prose; whatever path eventually reads it must
 * still decide whether support is appropriate in the present interaction. The
 * gate removes a prohibition. It does not supply a reason.
 *
 * There is no MAIA path to Goals today and this commissions none. It exists so
 * that when one is designed it cannot be written without answering the question
 * the founder made structural: **did the writer ask for this?**
 *
 * Nothing here loosens FR-10 (no figure derived from the clock, at any grant
 * level) or FR-12 (no creating, altering or completing a goal, ever).
 */
export function maiaMaySupport(goal: Pick<WriterGoal, 'support'>): boolean {
  return goal.support !== 'track_only';
}

export async function releaseGoal(manuscriptId: string, goalId: string): Promise<void> {
  const res = await apiFetch(`${base(manuscriptId)}/${goalId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('goal-not-released');
}

/**
 * ONE reading of the writer's goals for the whole room (Q-D).
 *
 * The rail panel and the lower band are two DOORS into one capability, not two
 * Goals systems: the ruling's named mistake is "building a temporary second
 * Goals system in WRITE or Work Home". So the room reads goals once, here, and
 * hands the same list to both surfaces. When EXPLORE ships it becomes the
 * primary room by taking a third door onto this same object — no data
 * migration, no second semantics.
 */
export function useManuscriptGoals(manuscriptId: string | null) {
  const [goals, setGoals] = useState<WriterGoal[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const reload = useCallback(async () => {
    if (!manuscriptId) return;
    try {
      setGoals(await listGoals(manuscriptId));
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    }
  }, [manuscriptId]);

  useEffect(() => {
    if (!manuscriptId) {
      setGoals(null);
      return;
    }
    void reload();
  }, [manuscriptId, reload]);

  return { goals, unavailable, reload, setGoals };
}
