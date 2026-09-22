/**
 * D-O1…D-O10 — THE CANON'S OWN DEFEAT CANDIDATES, BUILT.
 *
 * ⭐⭐ Unusual and valuable: `FIRST_ARRIVAL_AND_ONBOARDING_CANON_v1.md` §36
 * shipped the wrong machines ALONGSIDE the laws. So the suite cannot be quietly
 * shaped around an implementation — the things it must kill were named by the
 * authority, ⛔ not chosen by the implementer after the fact.
 *
 * ⭐ Each is the SMALLEST COMPETENT embodiment of its error. ⛔ A candidate
 * narrowed until it kills only its named law would no longer BE the error.
 *
 * ⛔ The REFERENCE is a test double proving the laws are mutually satisfiable.
 * ⛔ It is NOT the arrival room and must not be promoted into one: it has no
 * components, no CSS, no viewport and no member.
 */

import type { ArrivalDom } from './laws';

const REF_DISCOVERY = {
  text: '“The current” appears here and twice earlier in this chapter.',
  evidenceRefs: 3, address: 'ch-6:anchor:ch-6:0', whyAnswerable: true,
} as const;

/** ⭐ Conforming. §5 Existing Work, the ordinary first arrival. */
export const REFERENCE: ArrivalDom = {
  order: ['work', 'place', 'manuscript', 'invitation'],
  actions: ['Keep writing', 'Help me understand something', 'See the shape of this chapter',
    'Show me what keeps appearing', 'I don’t know — help me look'],
  workIdentity: 'The River Between',
  place: 'Chapter 6 — The Current Changes',
  blockingOverlay: false,
  tourStepper: false,
  meaningClaims: [],
  discoveries: [REF_DISCOVERY],
  scopeRequests: [{ namesScopeFirst: true }],
  trustElements: 1,
  trustInOneBox: false,
  selfGrading: [],
  machineryPrerequisite: [],
  /* ⭐ The reference claims only what the session itself knows. */
  continuityClaims: [{ text: 'You’re in Chapter 6 — The Current Changes.', durablyEvidenced: true }],
};

const from = (over: Partial<ArrivalDom>): ArrivalDom => ({ ...REFERENCE, ...over });

export const DEFEAT_CANDIDATES: Readonly<Record<string, ArrivalDom>> = {
  /* §36 D-O1 — a seven-step feature tour blocks manuscript access. */
  'D-O1_TOUR_CAROUSEL': from({
    order: ['tour', 'work', 'place', 'manuscript'],
    blockingOverlay: true, tourStepper: true,
    actions: ['Next →', 'Skip'],
  }),

  /* §36 D-O2 — new member must choose a professional writing level. */
  'D-O2_LEVEL_TEST': from({
    selfGrading: ['How experienced a writer are you?'],
    actions: ['Beginner', 'Intermediate', 'Professional'],
  }),

  /* §36 D-O3 — must choose Structure / Voice / Continuity before help begins. */
  'D-O3_PICK_A_LENS_FIRST': from({
    machineryPrerequisite: ['Structure', 'Voice', 'Continuity'],
    actions: ['Structure', 'Voice', 'Continuity'],
  }),

  /* §36 D-O4 — MAIA auto-reads the whole manuscript without consent.
     ⭐ Modelled as a scope request that does not name its scope first —
     which is exactly what "silently" means at this boundary. */
  'D-O4_SILENT_WHOLE_READ': from({
    scopeRequests: [{ namesScopeFirst: false }],
  }),

  /* §36 D-O5 — the welcome states what the book is "really about". */
  'D-O5_STATES_THE_MEANING': from({
    meaningClaims: ['This is a book about belonging and transformation.'],
  }),

  /* §36 D-O6 — the first insight is a grade. */
  'D-O6_FIRST_INSIGHT_IS_A_GRADE': from({
    discoveries: [{ text: 'Your voice is strong.', evidenceRefs: 0, address: '', whyAnswerable: false }],
  }),

  /* §36 D-O7 — the product celebrates Apply as the correct choice.
     ⭐ The error is not the word "Great" — it is that celebrating Apply makes
     the alternative feel like the wrong answer, so Keep my original goes. */
  'D-O7_CELEBRATES_APPLY': from({
    /* ⚠️ REPAIRED. The first version stripped Keep my original so it would
       die on O9 — making it D-O8 with a cheerful label, ⛔ not a celebration
       candidate at all. It now keeps the FULL escape intact, so the ONLY
       thing wrong with it is the tone. ⭐ That is the error the canon named. */
    actions: ['Apply', 'Great choice!', 'Keep my original', 'Undo', 'Keep writing'],
  }),

  /* §36 D-O8 — no Keep original / Undo in the first revision experience. */
  'D-O8_NO_ESCAPE_FROM_APPLY': from({
    actions: ['Keep writing', 'Apply this revision'],
  }),

  /* §36 D-O9 — the returning member sees full onboarding every session.
     ⚠️ Modelled STRUCTURALLY, as the tour re-blocking a Work the member is
     already in. ⛔ The durable half — that the system REMEMBERS onboarding
     happened — is not modellable here and is not claimed: §29/O14 are blocked
     on persistence, and a candidate cannot die on a law nothing can yet test. */
  'D-O9_ONBOARDS_EVERY_SESSION': from({
    order: ['tour', 'work', 'place', 'manuscript'],
    blockingOverlay: true, tourStepper: true,
    actions: ['Welcome back! Take the tour', 'Next →'],
  }),

  /* §36 D-O10 — mobile onboarding is squeezed desktop coach marks.
     ⭐ Modelled as the coach-mark overlay surviving into the small viewport
     while the Work loses its place — the compression, not the width. */
  'D-O10_SQUEEZED_COACH_MARKS': from({
    order: ['tour', 'work', 'manuscript'],
    blockingOverlay: true,
    place: '',
    actions: ['Got it', 'Next tip'],
  }),

  /* ⭐ NOT in §36 — added from the Home/Arrival ruling §9, because the canon's
     ten candidates predate it and none of them models a fabricated memory.
     ⚠️ This is the arrival a competent implementation ships by accident: it
     reads as care, and nothing in the ten would have caught it. */
  'D-O11_FABRICATED_CONTINUITY': from({
    continuityClaims: [
      { text: 'You’re in Chapter 6 — The Current Changes.', durablyEvidenced: true },
      { text: 'You last worked here three days ago.', durablyEvidenced: false },
    ],
  }),
};

/** ⭐ Which law each candidate is REQUIRED to die on. */
export const NAMED_KILL: Readonly<Record<string, string>> = {
  'D-O1_TOUR_CAROUSEL': 'O6-nothing-blocks-the-work',
  'D-O2_LEVEL_TEST': 'O5-no-expertise-test',
  'D-O3_PICK_A_LENS_FIRST': 'O4-no-machinery-prerequisite',
  'D-O4_SILENT_WHOLE_READ': 'O8-scope-named-before-reading',
  'D-O5_STATES_THE_MEANING': 'O11-no-fabricated-meaning',
  'D-O6_FIRST_INSIGHT_IS_A_GRADE': 'O7-discovery-is-evidenced-and-addressed',
  'D-O7_CELEBRATES_APPLY': 'O9b-no-reward-language',
  'D-O8_NO_ESCAPE_FROM_APPLY': 'O9-apply-never-without-its-escape',
  'D-O9_ONBOARDS_EVERY_SESSION': 'O6-nothing-blocks-the-work',
  'D-O10_SQUEEZED_COACH_MARKS': 'O6-nothing-blocks-the-work',
  'D-O11_FABRICATED_CONTINUITY': 'O14b-continuity-claim-needs-a-memory',
};

/**
 * ⭐ CLASSIFIED COLLATERAL — a necessary consequence of faithfully embodying
 * the named error. ⛔ UNCLASSIFIED collateral is an isolation defect.
 * The test: if removing it requires the candidate to cease embodying its error,
 * the collateral is IRREDUCIBLE and is admissible evidence.
 */
export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  'D-O1_TOUR_CAROUSEL': [
    /* ⭐ A tour that blocks the Work necessarily puts itself first, and its
       only actions are Next and Skip — so there is no writing path and no way
       into the Work. Removing either would make it not a blocking tour. */
    'O1-work-before-explanation', 'O3-keep-writing-is-primary',
    'O12-a-way-into-the-work-at-rest',
  ],
  'D-O2_LEVEL_TEST': [
    /* ⭐ A level test replaces the invitation with three self-descriptions, so
       no path into the Work survives. That IS what a gate is. */
    'O3-keep-writing-is-primary', 'O12-a-way-into-the-work-at-rest',
  ],
  'D-O3_PICK_A_LENS_FIRST': [
    'O3-keep-writing-is-primary', 'O12-a-way-into-the-work-at-rest',
  ],
  'D-O7_CELEBRATES_APPLY': [],
  'D-O9_ONBOARDS_EVERY_SESSION': [
    'O1-work-before-explanation', 'O3-keep-writing-is-primary',
    'O12-a-way-into-the-work-at-rest',
  ],
  'D-O10_SQUEEZED_COACH_MARKS': [
    /* ⭐ Squeezing drops the place line — that is the compression being
       modelled, not an accident of the fixture. */
    'O1-work-before-explanation', 'O2-place-is-named',
    'O3-keep-writing-is-primary', 'O12-a-way-into-the-work-at-rest',
  ],
};
