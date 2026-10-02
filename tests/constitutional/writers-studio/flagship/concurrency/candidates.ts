/**
 * D-C1…D-C12 — THE CANON'S §31 FALSIFIERS, BUILT AS WRONG MACHINES.
 *
 * ⛔ A SURVIVING CANDIDATE REPAIRS THE SUITE, NEVER THE CANDIDATE.
 */

import type { Episode } from './laws';

/** ⭐ Conforming: the member asked about Passage A and stayed. */
export const REFERENCE: Episode = {
  request: {
    requestId: 'req-1', workId: 'work-1', memberId: 'm-1', version: 7,
    seam: 'seam:O44', sectionId: 'ch-6', actionType: 'explain-observation',
    intent: 'why are you showing me this', requestedScope: ['ch-6'],
  },
  world: {
    version: 7, currentSeam: 'seam:O44', currentSectionId: 'ch-6',
    durable: true, providerAuthorized: true, executedScope: ['ch-6'],
  },
  admission: {
    state: 'succeeded', attachedToSeam: 'seam:O44', attachedToSectionId: 'ch-6',
    admittedAsComplete: true, streamComplete: true, actsCreated: 1,
    mutationApplied: false, receiptSaysApplied: false,
    memberCopy: 'I noticed the river image returns here.', waysBackToWork: 2,
  },
  identicalInputs: 1, recheckedBeforeMutation: true,
  undoRestoredExact: null, undoStopped: null, dismissedCancelled: null,
};

type Deep = {
  request?: Partial<Episode['request']>;
  world?: Partial<Episode['world']>;
  admission?: Partial<Episode['admission']>;
} & Partial<Omit<Episode, 'request' | 'world' | 'admission'>>;

const from = (o: Deep): Episode => ({
  ...REFERENCE, ...o,
  request: { ...REFERENCE.request, ...(o.request ?? {}) },
  world: { ...REFERENCE.world, ...(o.world ?? {}) },
  admission: { ...REFERENCE.admission, ...(o.admission ?? {}) },
});

export const DEFEAT_CANDIDATES: Readonly<Record<string, Episode>> = {
  /* §31 D-C1 — A's answer appears on B. ⭐ The trust-critical one. */
  'D-C1_ANSWER_FOLLOWS_THE_MEMBER': from({
    world: { currentSeam: 'seam:O51', currentSectionId: 'ch-8' },
    admission: { attachedToSeam: 'seam:O51', attachedToSectionId: 'ch-8' },
  }),

  /* §31 D-C2 — double-click Ask creates duplicate observations.
     ⭐ S3's DC-2 in the Studio: two requests, two identities, both admitted. */
  'D-C2_DOUBLE_CLICK_DUPLICATES': from({
    identicalInputs: 2, admission: { actsCreated: 2 },
  }),

  /* §31 D-C3 — a partial stream persisted as a complete finding. */
  'D-C3_PARTIAL_ADMITTED': from({
    admission: { state: 'streaming', admittedAsComplete: true, streamComplete: false },
  }),

  /* §31 D-C4 — proposal at N applies to N+1 without recheck. */
  'D-C4_STALE_APPLY': from({
    world: { version: 8 },
    admission: { mutationApplied: true, receiptSaysApplied: true },
    recheckedBeforeMutation: false,
  }),

  /* §31 D-C5 — Undo after an intervening edit blindly restores N. */
  'D-C5_BLIND_UNDO': from({
    undoRestoredExact: false, undoStopped: false,
  }),

  /* §31 D-C6 — a stale refresh overwrites historical evidence.
     ⭐ Modelled at the SCOPE boundary: the refresh executed a read the member
     never agreed to, which is how the overwrite gets its new text. */
  'D-C6_REFRESH_OVERWRITES_EVIDENCE': from({
    request: { requestedScope: ['ch-6'] },
    world: { executedScope: ['ch-5', 'ch-6', 'ch-7'] },
  }),

  /* §31 D-C7 — dismissing the mobile sheet moves MAIA into the manuscript.
     ⭐ Modelled as the dismissal silently cancelling: §22's law is that
     dismiss puts the sheet away, ⛔ it does not end the member's request. */
  'D-C7_DISMISS_CANCELS': from({
    dismissedCancelled: true, admission: { state: 'cancelled', memberCopy: '' },
  }),

  /* §31 D-C8 — offline still displays Saved. */
  'D-C8_FALSE_SAVED': from({
    world: { durable: false }, admission: { memberCopy: 'Saved' },
  }),

  /* §31 D-C9 — failure and nothing-found render identically. */
  'D-C9_FAILURE_LOOKS_LIKE_A_RESULT': from({
    admission: { state: 'failed_recoverable', memberCopy: 'MAIA didn’t find anything here.' },
  }),

  /* §31 D-C10 — related passages for O44 appear under O51. */
  'D-C10_RELATED_LANDS_ON_THE_WRONG_FINDING': from({
    request: { actionType: 'related-passages' },
    world: { currentSeam: 'seam:O51', currentSectionId: 'ch-8' },
    admission: { attachedToSeam: 'seam:O51', attachedToSectionId: 'ch-8' },
  }),

  /* §31 D-C11 — changed agreed scope still executes the original broader read. */
  'D-C11_EXECUTES_THE_OLD_SCOPE': from({
    request: { requestedScope: ['ch-6'] },
    world: { executedScope: ['ch-5', 'ch-6'] },
  }),

  /* §31 D-C12 — provider failure silently routes to an unauthorized provider. */
  'D-C12_SILENT_PROVIDER_FALLBACK': from({
    world: { providerAuthorized: false },
  }),
};

export const NAMED_KILL: Readonly<Record<string, string>> = {
  'D-C1_ANSWER_FOLLOWS_THE_MEMBER': 'C4-late-result-never-migrates',
  'D-C2_DOUBLE_CLICK_DUPLICATES': 'C5-repeated-input-creates-one-act',
  'D-C3_PARTIAL_ADMITTED': 'C6-partial-never-admitted-as-complete',
  'D-C4_STALE_APPLY': 'C3-changed-work-invalidates-mutation',
  'D-C5_BLIND_UNDO': 'C8-undo-restores-exactly-or-stops',
  'D-C6_REFRESH_OVERWRITES_EVIDENCE': 'C15-executed-scope-is-the-agreed-scope',
  'D-C7_DISMISS_CANCELS': 'C11-dismiss-is-not-cancel',
  'D-C8_FALSE_SAVED': 'C12-saved-only-when-durable',
  'D-C9_FAILURE_LOOKS_LIKE_A_RESULT': 'C9-failure-is-not-nothing-found',
  'D-C10_RELATED_LANDS_ON_THE_WRONG_FINDING': 'C4-late-result-never-migrates',
  'D-C11_EXECUTES_THE_OLD_SCOPE': 'C15-executed-scope-is-the-agreed-scope',
  'D-C12_SILENT_PROVIDER_FALLBACK': 'C14-no-unauthorized-provider-fallback',
};

/**
 * ⭐ CLASSIFIED COLLATERAL — irreducible consequences of embodying the error.
 */
export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  /* ⭐ An answer that FOLLOWS the member necessarily also fails C2: attaching
     to the current seam IS attaching to a seam that is not its own. Removing
     it would require the candidate to stop migrating. */
  'D-C1_ANSWER_FOLLOWS_THE_MEMBER': ['C2-result-attaches-only-to-its-own-seam'],
  'D-C10_RELATED_LANDS_ON_THE_WRONG_FINDING': ['C2-result-attaches-only-to-its-own-seam'],
  /* ⚠️ WITHDRAWN. I predicted this candidate would also strand the member,
     and the matrix falsified the prediction on its first run: the episode
     keeps the reference's two ways back, so C13 never fires. ⭐ The stale-
     classification check exists for exactly this — an exemption nobody is
     checking any more is an exemption that will one day excuse a real
     divergence. ⛔ The claim is removed, not the check. */
  'D-C7_DISMISS_CANCELS': [],
  /* ⭐ A failure dressed as a result still IS a failure outcome, so its lack of
     a way back is part of the same disguise. */
  'D-C9_FAILURE_LOOKS_LIKE_A_RESULT': [],
};
