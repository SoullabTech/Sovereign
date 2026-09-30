/**
 * WRITERS-STUDIO-CONVERGENCE-01 · H1-R1 — House → Studio Work crossing.
 *
 * The OBSERVABLE contract of the Studio's Work intake. It types what the
 * intake decides, never how it stores anything — and it stores nothing.
 *
 * The member clicked one living Work in the House. The URL carries that
 * Work's identity and nothing else. The Studio must turn that pointer into
 * exactly one lawful outcome, using only what the member has declared:
 *
 *   absent      no Work was requested; the Studio behaves as it always has
 *   wait        the member's own lists are not read yet — decide nothing
 *   refused     the id is not among THIS member's Works (unknown and foreign
 *               are deliberately indistinguishable — a refusal discloses nothing)
 *   open        the Work declares exactly one live manuscript → open it
 *   choose      the Work declares two or more live manuscripts → the member picks
 *   no-writing  the Work declares no live manuscript → offer, never create
 *
 * ⛔ The crossing never selects the Studio's CURRENT Work. WS2-03B still
 * derives that from declarations once a manuscript is open.
 */

/** The member's Works, as the member-scoped server list returns them. */
export interface IntakeWork {
  readonly id: string;
  /** Manuscript ids the member declared into this Work, in declaration order. */
  readonly manuscriptIds: readonly string[];
}

export type ListPhase = 'loading' | 'ready' | 'unauthorized' | 'error';

export interface IntakeInput {
  /** Phase of BOTH member-scoped reads; 'ready' only when both are ready. */
  readonly phase: ListPhase;
  readonly works: readonly IntakeWork[];
  /** Ids of the member's manuscripts that exist now. */
  readonly liveManuscriptIds: readonly string[];
  /** The raw value of the Work parameter, or null when absent. */
  readonly requestedWorkId: string | null;
}

export type IntakeOutcome =
  | { readonly kind: 'absent' }
  | { readonly kind: 'wait' }
  | { readonly kind: 'refused' }
  | { readonly kind: 'open'; readonly workId: string; readonly manuscriptId: string }
  | { readonly kind: 'choose'; readonly workId: string; readonly manuscriptIds: readonly string[] }
  | { readonly kind: 'no-writing'; readonly workId: string };

export type IntakeResolver = (input: IntakeInput) => IntakeOutcome;
