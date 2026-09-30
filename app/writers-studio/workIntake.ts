/**
 * H1-R1 — the Studio's intake for a Work chosen at the House threshold.
 *
 * ── WHAT THE MEMBER DECLARED ───────────────────────────────────────────────
 *
 * In the House the member looks at living Works, not manuscripts. Clicking
 * one says "I want to continue THIS Work." So the Work is what travels, the
 * Work stays selected, and the manuscript is a choice made INSIDE it
 * (founder ruling D-02, 2026-09-30).
 *
 * Explicit present intention outranks inferred continuity: Studio Home's own
 * "Continue" pick (by writing activity) must not overrule the click. And
 * explicit present intention does not rewrite durable truth: nothing here is
 * stored, and WS2-03B (workContext.ts) still answers "which Work is this
 * manuscript?" from declarations once a manuscript is open.
 *
 * ── TWO QUESTIONS, DELIBERATELY NOT MIRRORED ───────────────────────────────
 *
 *   WS2-03B   manuscript → Works     0 none · 1 known · 2+ ambiguous
 *   here      Work → manuscripts     0 no writing yet · 1 open · 2+ member chooses
 *
 * A manuscript asks what Work it belongs to; a Work asks what writing has
 * emerged from it. The second is never answered by "the first one"
 * (homeState.manuscriptIdOf) or by recency.
 *
 * ── WHAT THIS MODULE MAY NOT DO ────────────────────────────────────────────
 *
 * No request, no storage, no cookie, no memory. Ownership is the member-scoped
 * server lists: a Work id that is not in them is refused, and the refusal
 * says nothing about whether such a Work exists. Governed by the frozen-law
 * suite tests/constitutional/house-studio-crossing (HS-F1…HS-F8).
 */

/** The query parameter carrying the chosen Work. Do not inline this string. */
export const WORK_INTAKE_PARAM = 'work';

/** The Writer's Studio, arriving from the House with one Work chosen. */
export function studioForWork(workId: string): string {
  return `/writers-studio?from=house&${WORK_INTAKE_PARAM}=${encodeURIComponent(workId)}`;
}

/** Reads the chosen Work out of route params. Empty is treated as absent. */
export function requestedWorkIdFrom(params: { get(name: string): string | null } | null): string | null {
  const value = params?.get(WORK_INTAKE_PARAM) ?? null;
  return value === '' ? null : value;
}

export interface IntakeWork {
  readonly id: string;
  /** Manuscript ids the member declared into this Work, in declaration order. */
  readonly manuscriptIds: readonly string[];
}

export interface IntakeInput {
  readonly phase: 'loading' | 'ready' | 'unauthorized' | 'error';
  readonly works: readonly IntakeWork[];
  readonly liveManuscriptIds: readonly string[];
  readonly requestedWorkId: string | null;
}

export type WorkIntake =
  | { readonly kind: 'absent' }
  | { readonly kind: 'wait' }
  | { readonly kind: 'refused' }
  | { readonly kind: 'open'; readonly workId: string; readonly manuscriptId: string }
  | { readonly kind: 'choose'; readonly workId: string; readonly manuscriptIds: readonly string[] }
  | { readonly kind: 'no-writing'; readonly workId: string };

export function resolveWorkIntake(input: IntakeInput): WorkIntake {
  if (input.requestedWorkId === null || input.requestedWorkId === '') return { kind: 'absent' };
  // Unread lists are not an answer. Refusing now would call a loading list "not yours".
  if (input.phase !== 'ready') return { kind: 'wait' };

  const work = input.works.find((w) => w.id === input.requestedWorkId);
  if (!work) return { kind: 'refused' };

  const live = new Set(input.liveManuscriptIds);
  const seen = new Set<string>();
  const writing: string[] = [];
  for (const id of work.manuscriptIds) {
    if (live.has(id) && !seen.has(id)) {
      seen.add(id);
      writing.push(id);
    }
  }

  const only = writing.length === 1 ? writing[0] : undefined;
  if (writing.length === 0) return { kind: 'no-writing', workId: work.id };
  if (only !== undefined) return { kind: 'open', workId: work.id, manuscriptId: only };
  return { kind: 'choose', workId: work.id, manuscriptIds: writing };
}

/** Adapts the Studio's own member-scoped reads to the intake's input. */
export function intakeInputFrom(args: {
  worksPhase: string;
  manuscriptPhase: string;
  works: readonly { id: string; expressions: readonly { expressionType: string; expressionId: string }[] }[];
  manuscripts: readonly { id: string }[];
  requestedWorkId: string | null;
}): IntakeInput {
  const phaseOf = (p: string) => (p === 'none' ? 'ready' : p);
  const w = phaseOf(args.worksPhase);
  const m = phaseOf(args.manuscriptPhase);
  const phase: IntakeInput['phase'] =
    w === 'ready' && m === 'ready' ? 'ready'
      : w === 'unauthorized' || m === 'unauthorized' ? 'unauthorized'
        : w === 'error' || m === 'error' ? 'error'
          : 'loading';
  return {
    phase,
    works: args.works.map((work) => ({
      id: work.id,
      manuscriptIds: work.expressions
        .filter((e) => e.expressionType === 'manuscript')
        .map((e) => e.expressionId),
    })),
    liveManuscriptIds: args.manuscripts.map((m) => m.id),
    requestedWorkId: args.requestedWorkId,
  };
}
