/**
 * VISUAL WITNESS FIXTURES — controlled data, ⛔ no production read.
 *
 * ⭐ Real Elemental Alchemy Chapter 10 prose. ⛔ No database, no network, no
 * member data. The witness proves COMPOSITION and CONTEXTUAL BEHAVIOR; it is a
 * controlled-component witness, ⛔ never a production walk.
 */

import type {
  AlternativeSet, Observation as MachineObservation, PassageRef, Place, StudioState,
} from '../../../lib/writersStudio/studio/machine';
import { initialState, transition, type StudioEvent } from '../../../lib/writersStudio/studio/machine';
import type { ManuscriptView, MaiaCopy, VersionEntry } from '../../../app/writers-studio/flagship/WriteRoom';
import type { DevelopView, ReviewView } from '../../../app/writers-studio/flagship/DevelopReview';

export const MEMBER = { initials: 'KN', name: 'Kelly', org: 'Soullab' };
export const PROJECT = { workTitle: 'The River Between', workKind: 'Novel · 82,400 words' };

const TARGET = 'The atoms that form our bodies were forged within stars.';

export const MANUSCRIPT: ManuscriptView = {
  work: 'The River Between',
  chapterLabel: 'Chapter 10',
  chapterTitle: 'The Living Spiral',
  epigraph: {
    text: 'To be spiritual means essentially to take responsibility for our inner journey while using all the resources from all the traditions available to us.',
    attribution: 'Wayne Teasdale',
  },
  paragraphs: [
    { id: 'p1', text: 'To be human is to move through cycles. Morning turns to midday, midday leads toward dusk, dusk gives way to nightfall, and night eventually finds its way back to the light of day. These rhythms surround us so completely that we rarely stop to consider how deeply they shape the way life itself unfolds.' },
    { id: 'p2', target: TARGET,
      text: `These cycles are not simply happening around us. They are part of us. We come from this cycling earth, and our lives participate in its movements at every level. ${TARGET} Cells continually die and are replaced. We sleep and wake, hunger and become full, and move between activity and rest, expansion and contraction.` },
    { id: 'p3', text: 'The same movement occurs across the longer passages of a human life. We move from infancy through childhood, adulthood, aging, and death. We learn, forget, remember, reconsider, and learn again. Old emotions can return within entirely new circumstances.' },
  ],
  heldParagraphId: 'p2',
  words: 1248,
};

export const PLACE: Place = { sectionId: 'ea-10-i', anchor: 'anchor:ea-10-i:0' };
const PASSAGE: PassageRef = { sectionId: 'ea-10-i', codePointStart: 402, codePointEnd: 446 };

const OBSERVATION: MachineObservation = {
  observationId: 'dobs_fixture-0001', readingId: 'read_ea10', observationKey: 'o1',
  lens: 'rhythm',
  text: 'This passage is where the chapter turns from describing cycles to placing the reader inside one.',
  refs: [PASSAGE],
};

export const CANDIDATES: AlternativeSet = {
  items: [
    { id: 'embodied', name: 'More embodied',
      text: 'The atoms that form our bodies were forged in the hearts of dying stars.',
      rationale: 'Moves from a passive construction to a located one. The reader gets a place, not only a fact.' },
    { id: 'lyrical', name: 'More lyrical',
      text: 'The atoms that form our bodies were kindled in the furnaces of stars.',
      rationale: 'Carries the image further and lengthens the line before the paragraph shortens again.' },
    { id: 'simpler', name: 'Clearer and simpler',
      text: 'The atoms that form our bodies were forged in stars.',
      rationale: 'Removes one word. The cadence lands earlier and the sentence stops pushing.' },
    { id: 'cadence', name: 'Closer to my cadence',
      text: 'The atoms that form our bodies were themselves forged within stars.',
      rationale: 'Keeps your preposition and adds the reflexive you use elsewhere in this section.' },
    { id: 'mine', name: 'Keep my original', text: null,
      rationale: 'Your sentence stands as written. Nothing is applied and the conversation stays open.' },
  ],
};

/* ⭐ Copy written to pass `inspectMemberCopy`: observations carrying evidence,
   ⛔ no verdict word stated as a property of the Work. */
export const MAIA_DISCUSS: MaiaCopy = {
  memberAsk: 'Help me strengthen this passage while keeping my voice. I want it to feel more embodied.',
  opening: 'This passage is where the chapter turns — it stops describing cycles and places you inside one. I can stay with what it is doing, or show you what you might try.',
  noticed: [
    'The paragraph states our continuity with the world three times before the image arrives.',
    'The sentence about atoms carries the only image in the paragraph.',
    'The rhythm shortens at “Cells continually die and are replaced.”',
  ],
  coverage: 'I read this section and the two around it, at full depth.',
};

export const MAIA_REVISE: MaiaCopy = {
  opening: 'Four directions and your own. Each keeps your subject and your voice; they differ in where the sentence lands. None is recommended — read them in place to see how they feel.',
};

export const MAIA_REASON: MaiaCopy = {
  opening: 'The sentence carries a claim the paragraph has already made twice — that we are continuous with the world. “Within” does the work of location, and the sentence around it is doing the work of rhythm, so the two compete for the same beat.',
  limits: 'This does not establish what you intended, and it does not establish how a reader will respond. Both stay open.',
  coverage: 'Read: this section and the two around it, at full depth.',
};

export const VERSIONS: readonly VersionEntry[] = [
  { when: 'Current', time: 'Today, 10:24', what: 'Clearer and simpler', current: true },
  { when: 'Previous', time: 'Today, 09:18', what: 'Your original' },
  { when: 'Earlier', time: 'Sep 20', what: 'Exploration draft' },
  { when: 'Earlier', time: 'Sep 18', what: 'Major revision' },
];

/* ── state builders ─────────────────────────────────────────────────────── */

function drive(events: readonly StudioEvent[], from = initialState(PLACE, 1)): StudioState {
  let s = from;
  for (const e of events) {
    const out = transition(s, e);
    if (out.refused) throw new Error(`fixture refused at ${e.type}: ${out.code} — ${out.detail}`);
    s = out.state;
  }
  return s;
}

export const S_REST = initialState(PLACE, 1);
export const S_HELD = drive([{ type: 'HOLD_PASSAGE', passage: PASSAGE },
  { type: 'TALK', observation: OBSERVATION }]);
export const S_ALTS = drive([{ type: 'REQUEST_ALTERNATIVES', candidates: CANDIDATES }], S_HELD);
export const S_CTX = drive([{ type: 'SELECT_ALTERNATIVE', alternativeId: 'simpler' },
  { type: 'READ_IN_CONTEXT' }], S_ALTS);
export const S_APPLIED = drive([{ type: 'APPLY' }], S_CTX);
export const S_APPLIED_HISTORY = drive([{ type: 'OPEN_OVERLAY', overlay: 'history' }], S_APPLIED);

/* ⭐ A NOVEL, deliberately — not Elemental Alchemy. The room must work for a Work
   with no declared movements and no elemental architecture, which is the common
   case and the one that exposes an imposed house shape. */
export const DEVELOP: DevelopView = {
  work: 'The River Between',
  kind: 'novel',
  pages: 284, sections: 41, words: 82400,
  coverage: { read: 34, total: 41, depth: 'reading the full text', when: 'last read 12 minutes ago' },
  /* ⛔ Undeclared: there is no declaration store, so the map is Sequence and no
     "Name the movements" control is drawn. */
  structure: { declared: false },
  /* ⭐ The opening is the member's own sentence, at an address. MAIA chose it and
     says why as a FACT about the text — ⛔ not that it is good. */
  opening: {
    kind: 'passage',
    text: '“Maybe this is what growing feels like,” she whispered. “Not arriving, but learning to stay with the in-between.”',
    because: 'The only time Clara says “the in-between” aloud',
    at: 'Ch 6', sectionId: 'ch-6-p4',
  },
  lenses: [
    { id: 'structure',   state: 'read',                 count: 3 },
    { id: 'development', state: 'partially-read',       count: 2, remaining: 7 },
    { id: 'arc',         state: 'not-read',             count: 0 },
    { id: 'continuity',  state: 'read-nothing-noticed', count: 0 },
    { id: 'coherence',   state: 'read',                 count: 1 },
    { id: 'voice',       state: 'read',                 count: 2 },
    { id: 'reader',      state: 'read',                 count: 1 },
  ],
  observations: [
    { id: 'o-river', heading: 'The river returns',
      body: 'The river appears in 11 of 41 sections. Nine of those are in the first half; it is absent between Ch 6 and Ch 9.',
      evidence: ['Ch 1', 'Ch 4', 'Ch 6', 'Ch 10'], returnTo: { label: 'Go to Ch 6', sectionId: 'ch-6' } },
    { id: 'o-interior', heading: 'Clara’s interior',
      body: 'The narration moves inside Clara in 4 of the first 6 chapters, and in 9 of the last 12.',
      evidence: ['Ch 1–6', 'Ch 30–41'], returnTo: { label: 'Go to Ch 30', sectionId: 'ch-30' } },
    { id: 'o-inbetween', heading: '“The in-between”',
      body: 'The phrase is spoken once, by Clara, in Ch 6. It is not used again.',
      evidence: ['Ch 6'], returnTo: { label: 'Go to the passage', sectionId: 'ch-6-p4' } },
    { id: 'o-chapters', heading: 'Where chapters end',
      body: 'Twenty-nine chapters close on an image. Twelve close on dialogue.',
      evidence: ['Ch 1–41'], returnTo: { label: 'Go to Ch 12', sectionId: 'ch-12' } },
    { id: 'o-term', heading: '“The current” changes meaning',
      body: 'In Ch 2 it names the river. In Ch 6 it names what Clara is living through. It is not renamed between them.',
      evidence: ['Ch 2', 'Ch 6'], returnTo: { label: 'Go to Ch 2', sectionId: 'ch-2' } },
    { id: 'o-reader', heading: 'Reader perspective', hypothesis: true,
      body: 'A reader might lose the referent at Ch 6, because “the current” carries a meaning it did not have in Ch 2.',
      evidence: ['Ch 6'], returnTo: { label: 'Go to the passage', sectionId: 'ch-6-p2' } },
  ],
};

export const REVIEW: ReviewView = {
  work: 'The River Between',
  coverage: { read: 14, total: 14, depth: 'full depth' },
  findings: [
    { id: 'f-bridge', glyph: '⇄', heading: 'The bridge between Chapter 9 and 10',
      body: 'Chapter 9 closes on the body; Chapter 10 opens on time. Nothing carries the reader across.',
      evidence: ['§9.4', '§10.1'], returnTo: { label: 'Go to passage', sectionId: 'ea-10-1' } },
    { id: 'f-theme', glyph: '↻', heading: 'Cycles and renewal recur through Part III',
      body: 'The pairing appears in six of the eight sections in Part III, each time in the closing paragraph.',
      evidence: ['§9–§16'], returnTo: { label: 'Go to passage', sectionId: 'ea-12' } },
    { id: 'f-mode', glyph: '◐', heading: 'The chapter changes mode here',
      body: 'The language moves from explanation into sensory detail at the third paragraph, and stays there.',
      evidence: ['§10.3'], returnTo: { label: 'Go to passage', sectionId: 'ea-10-3' } },
    { id: 'f-reader', glyph: '?', heading: 'Reader perspective', hypothesis: true,
      body: 'A reader may read “the work” here as the manuscript rather than the inner work, because the referent changes without being renamed.',
      evidence: ['§10.5'], returnTo: { label: 'Discuss', sectionId: 'ea-10-5' } },
    { id: 'f-image', glyph: '◈', heading: 'This image returns in four separate movements',
      body: 'The forge appears in §10, §18, §29 and §44, each time attached to a different element.',
      evidence: ['§10', '§18', '§29', '§44'], returnTo: { label: 'Go to passage', sectionId: 'ea-18' } },
  ],
};
