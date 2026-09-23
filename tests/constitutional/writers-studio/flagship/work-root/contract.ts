/**
 * F8 / FIRST ARRIVAL + WORK-ROOT — THE ARRIVAL MACHINE, typed at the boundary.
 * Authority: JARVIS_WS_F8_FIRST_ARRIVAL_WORK_ROOT_CONTRACT_AND_FALSIFIER_FLOW_v1 §3–§26.
 * ⛔ Not imported by runtime. Implementation authority NOT GRANTED.
 *
 * ⭐ DIVISION OF LABOUR WITH THE EXISTING `first-arrival/` SUITE: that suite
 * (canon-numbered O1…O14b) governs a RENDERED arrival — document order, a
 * blocking overlay, reward language, a fabricated memory in copy. This suite
 * (flow-numbered F8-O1…F8-O15) governs the ARRIVAL MACHINE — Work selection
 * authority, the six arrival classes, what arrival may commission, and the
 * separation of resume from selection. ⛔ Neither re-states the other's law.
 *
 * ⭐⭐ THE FORBIDDEN TRANSITION IS UNREPRESENTABLE: `arrive()` takes a
 * WORK_SELECTED state, and WORK_SELECTED can be produced only by
 * `selectWork(authority)` where authority is never 'resume-state'.
 */

export type SelectionAuthority = 'member-choice' | 'route' | 'work-context' | 'product-selection';

export interface ResumeState { readonly memberId: string; readonly workId: string; readonly mode: 'write' | 'develop' | 'review'; readonly sectionId: string | null; readonly updatedAt: string; }

export interface ArrivalFacts {
  readonly workId: string;
  readonly title: string;
  readonly isNew: boolean;
  readonly imported: { readonly detectedChapters: number; readonly unnamedSections: number; readonly memberConfirmed: boolean } | null;
  readonly routeSectionId: string | null;
  readonly hasReading: boolean;
  readonly readingStale: boolean;
  readonly resume: ResumeState | null;
  readonly admitted: readonly { readonly observationId: string; readonly text: string; readonly sectionId: string }[];
  readonly memberDeclaredPurpose: string | null;
  readonly workLine: { readonly text: string; readonly sectionId: string; readonly reason: string } | null;
  readonly reviewHasMaterial: boolean;
}

export type ArrivalClass = 'ARRIVAL_NEW' | 'ARRIVAL_EXISTING' | 'ARRIVAL_RETURNING' | 'ARRIVAL_IMPORTED' | 'ARRIVAL_UNREAD' | 'ARRIVAL_STALE';

export type State =
  | { readonly name: 'NO_WORK_SELECTED' }
  | { readonly name: 'WORK_SELECTED'; readonly workId: string; readonly authority: SelectionAuthority }
  | { readonly name: ArrivalClass; readonly workId: string; readonly output: ArrivalOutput }
  | { readonly name: 'WRITE' | 'DEVELOP' | 'REVIEW'; readonly workId: string; readonly sectionId: string | null };

export interface Recognition { readonly source: 'member-declared' | 'work-line' | 'work-fact'; readonly text: string; }

export interface ArrivalOutput {
  readonly recognition: Recognition;
  readonly place: string | null;
  /** Document order of what the arrival renders. */
  readonly regions: readonly string[];
  readonly actions: readonly string[];
  readonly modes: readonly string[];
  readonly copy: readonly string[];
  readonly asksSkillLevel: boolean;
  readonly tutorialRequired: boolean;
  readonly discovery: { readonly observationId: string; readonly text: string; readonly sectionId: string; readonly provenance: 'maia-observation' } | null;
}

export interface ArrivalMachine {
  coldStart(resume: ResumeState | null): State;
  selectWork(workId: string, authority: SelectionAuthority): State;
  arrive(state: State, facts: ArrivalFacts): State;
  keepWriting(state: State, facts: ArrivalFacts): State;
  /** Readings, refreshes, lens runs, summaries, member observations, mutations caused by arrival. ⛔ Must be 0. */
  commissions(): number;
  /** Rows the resume store holds for (member, Work). ⛔ ≤ 1. */
  resumeRows(memberId: string, workId: string): number;
  writeResume(r: ResumeState): void;
}
