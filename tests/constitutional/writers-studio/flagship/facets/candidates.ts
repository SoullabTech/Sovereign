/**
 * D-F1…D-F12 — THE FACET CANON'S §36 DEFEAT CANDIDATES.
 *
 * ⛔ A SURVIVING CANDIDATE REPAIRS THE SUITE, NEVER THE CANDIDATE.
 * ⛔ D-F9 is absent BY DECISION, not by oversight — see HUMAN_WITNESS_ONLY.
 */

import type { FacetTriple, Rendering, Facet } from './laws';

const OBS = 'dobs_7c1f4a2e9b0d4c3fae61d2b8c05f9137';
const EVIDENCE = ['ch-2:passage:14-63', 'ch-6:passage:902-948'] as const;
const COVERAGE = ['ch-1', 'ch-2', 'ch-3', 'ch-4', 'ch-5', 'ch-6'] as const;
const LIMITS = ['author-intent', 'reader-effect'] as const;

const base = (facet: Facet, text: string): Rendering => ({
  facet, observationId: OBS,
  evidenceRefs: [...EVIDENCE], coverage: [...COVERAGE], doesNotEstablish: [...LIMITS],
  proposalMaxScope: 'sentence', alternativeCount: 3, mayReplaceCodePoints: 180,
  readsCommissioned: 0, seam: 'seam:O44', text,
  provenanceShown: true, setupQuestions: 1,
  teachingTiedToEvidence: facet === 'learning' ? true : null,
  restatesClaimAfterDisagreement: false, spokenText: null,
});

/** ⭐ The canon's own §8 worked example: one observation, three renderings. */
export const REFERENCE: FacetTriple = {
  guided: base('guided',
    'I notice “the current” is doing two different jobs in your Work. In Chapter 2 it’s the river itself. Here it seems to be carrying Clara’s experience too. Want to put those passages beside each other?'),
  learning: base('learning',
    'I notice “the current” shifts from literal image to figurative use. That’s one way a recurring motif can accumulate meaning across a Work. I can show you the two passages and the language that changes around them.'),
  direct: base('direct',
    'Motif shift: “the current” is literal in Ch 2 and figurative in Ch 6. Two addressed occurrences.'),
  seamAfterSwitch: 'seam:O44',
};

const with_ = (facet: Facet, over: Partial<Rendering>): FacetTriple => ({
  ...REFERENCE, [facet]: { ...REFERENCE[facet], ...over },
});

export const DEFEAT_CANDIDATES: Readonly<Record<string, FacetTriple>> = {
  /* §36 D-F1 — Learning returns a different finding from Guided. */
  'D-F1_LEARNING_FINDS_SOMETHING_ELSE': with_('learning', {
    observationId: 'dobs_0000000000000000000000000000beef',
    evidenceRefs: ['ch-4:passage:11-98'],
  }),

  /* §36 D-F2 — Direct may rewrite a paragraph where Guided was sentence-bound. */
  'D-F2_DIRECT_REWRITES_MORE': with_('direct', {
    proposalMaxScope: 'paragraph', mayReplaceCodePoints: 1400,
  }),

  /* §36 D-F3 — Guided automatically expands reading scope. */
  'D-F3_GUIDED_READS_MORE': with_('guided', {
    readsCommissioned: 1, coverage: [...COVERAGE, 'ch-7', 'ch-8'],
  }),

  /* §36 D-F4 — Learning calls something "stronger" because it is educational. */
  'D-F4_TEACHING_BECOMES_A_VERDICT': with_('learning', {
    text: 'The figurative use in Ch 6 is stronger than the literal one in Ch 2.',
  }),

  /* §36 D-F5 — Direct hides provenance to be concise. */
  'D-F5_DIRECT_DROPS_PROVENANCE': with_('direct', { provenanceShown: false }),

  /* §36 D-F6 — a facet switch creates a new observation id. */
  'D-F6_SWITCH_MINTS_A_NEW_ID': with_('direct', {
    observationId: 'dobs_ffffffffffffffffffffffffffffffff',
  }),

  /* §36 D-F7 — Guided asks five setup questions before helping. */
  'D-F7_GUIDED_INTERROGATES': with_('guided', { setupQuestions: 5 }),

  /* §36 D-F8 — Learning gives a generic lecture unrelated to the evidence. */
  'D-F8_GENERIC_LECTURE': with_('learning', {
    teachingTiedToEvidence: false,
    text: 'Motifs are recurring images that authors use to unify a narrative. They date back to classical epic.',
  }),

  /* §36 D-F10 — MAIA argues with the member after "I disagree". */
  'D-F10_ARGUES_AFTER_DISAGREEMENT': with_('guided', {
    restatesClaimAfterDisagreement: true,
  }),

  /* §36 D-F11 — "Teach me" silently runs another reading.
     ⭐ Distinct from D-F3: there the FACET reads more; here the TEACHING
     GESTURE does. Both are silent commissions, at different seams. */
  'D-F11_TEACH_ME_READS_SILENTLY': with_('learning', { readsCommissioned: 1 }),

  /* §36 D-F12 — voice paraphrases or embellishes the governed text. */
  'D-F12_SPEECH_EMBELLISHES': with_('direct', {
    spokenText: 'Here’s something really interesting — your motif gets much richer in chapter six!',
  }),

  /* ⭐ NOT in §36. §9 says a switch must not move the conversation, and none
     of the twelve models a seam that survives every rendering yet lands
     somewhere else after the switch itself. */
  'D-F13_SWITCH_MOVES_THE_SEAM': { ...REFERENCE, seamAfterSwitch: 'seam:O51' },
};

export const NAMED_KILL: Readonly<Record<string, string>> = {
  'D-F1_LEARNING_FINDS_SOMETHING_ELSE': 'FCT1-one-observation-identity',
  'D-F2_DIRECT_REWRITES_MORE': 'FCT4-authorship-ceiling-is-facet-invariant',
  'D-F3_GUIDED_READS_MORE': 'FCT3-facet-changes-neither-coverage-nor-reads',
  'D-F4_TEACHING_BECOMES_A_VERDICT': 'FCT12-no-facet-introduces-verdict-language',
  'D-F5_DIRECT_DROPS_PROVENANCE': 'FCT9-direct-keeps-provenance',
  'D-F6_SWITCH_MINTS_A_NEW_ID': 'FCT1-one-observation-identity',
  'D-F7_GUIDED_INTERROGATES': 'FCT10-guided-does-not-interrogate',
  'D-F8_GENERIC_LECTURE': 'FCT8-teaching-is-tied-to-this-work',
  'D-F10_ARGUES_AFTER_DISAGREEMENT': 'FCT13-disagreement-keeps-the-members-reading-primary',
  'D-F11_TEACH_ME_READS_SILENTLY': 'FCT3-facet-changes-neither-coverage-nor-reads',
  'D-F12_SPEECH_EMBELLISHES': 'FCT14-speech-does-not-paraphrase',
  'D-F13_SWITCH_MOVES_THE_SEAM': 'FCT11-switching-facet-keeps-the-conversation',
};

export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  /* ⭐ A facet that genuinely finds something ELSE necessarily cites other
     evidence — that is what a different finding IS. Removing the evidence
     divergence would leave two ids over one body of evidence, which models
     nothing the canon warns about. */
  'D-F1_LEARNING_FINDS_SOMETHING_ELSE': ['FCT2-same-evidence'],
  /* ⭐ A wider rewrite ceiling IS a wider proposal scope; §3 lists them as two
     invariants because they are two columns, ⛔ not because either can move
     alone in a faithful candidate. */
  'D-F2_DIRECT_REWRITES_MORE': ['FCT5-same-locus-same-proposal-breadth'],
  /* ⭐ Reading two more chapters to render necessarily changes coverage; the
     law tests both halves precisely so neither can move unnoticed. */
  'D-F3_GUIDED_READS_MORE': [],
};
