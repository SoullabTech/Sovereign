/**
 * DEVELOP DATA — ⭐ every object built through `observe()`, which refuses.
 *
 * ⚠️ If any entry here graded the Work, cited nothing, hid its provenance, or
 * made a cross-Work claim without coverage, this module would THROW at import
 * and nothing would render. That is the point: ⛔ the guarantees are not a
 * checklist applied to a finished frame.
 */

import {
  buildContinuityMap, observeAll,
  type ContinuityMapData, type Coverage, type DevelopObservation, type Presence,
} from '../../../lib/writersStudio/studio/developObservation';

export const COVERAGE: Coverage = {
  read: 34, total: 41, depth: 'reading the full text', when: 'last read 12 minutes ago',
};

const ch = (n: number) => ({ label: `Go to Ch ${n}`, sectionId: `ch-${n}` });
const UNITS = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const addr = UNITS.map((u) => ({ label: `Ch ${u}`, sectionId: `ch-${u}` }));
const p = (...v: number[]) => v as Presence[];

/* ⭐ Rows declare their kind. `Clara` and `The River` are countable words in the
   text; `Belonging` is the member's declared part title; `Uncertainty` is MAIA's
   reading and is marked so. ⛔ They do not render identically. */
const mapData: ContinuityMapData = {
  units: UNITS,
  coverage: COVERAGE,
  rows: [
    { id: 'clara', label: 'Clara', provenance: { kind: 'textual-entity' },
      presence: p(3,3,3,2,3,3,2,3,3,3,2,3), addressOf: addr },
    { id: 'river', label: 'The river', provenance: { kind: 'textual-entity' },
      presence: p(3,2,2,1,0,3,1,0,1,2,1,2), addressOf: addr },
    { id: 'in-between', label: '“The in-between”', provenance: { kind: 'textual-entity' },
      presence: p(0,1,0,0,0,3,0,1,0,0,0,0), addressOf: addr },
    { id: 'belonging', label: 'Belonging', provenance: { kind: 'member-declared', declaredWhen: 'Sep 14' },
      presence: p(0,0,0,0,0,1,1,2,2,3,3,3), addressOf: addr },
    { id: 'thresholds', label: 'Moments of turning', provenance: { kind: 'maia-observation', readingId: 'r1', lens: 'continuity' },
      presence: p(1,0,2,0,1,3,0,2,0,3,0,2), addressOf: addr },
    /* ⭐ A template the member adopted — ⛔ NOT the same act as naming it. */
    { id: 'threshold-stage', label: 'Threshold', provenance: { kind: 'template-selected', templateName: 'the Spiral template', chosenWhen: 'Sep 14' },
      presence: p(0,0,1,2,3,3,2,1,0,0,0,0), addressOf: addr },
  ],
};

const built = buildContinuityMap(mapData);
if (!built.ok) throw new Error(`continuity map refused: ${built.code} — ${built.detail}`);
export const CONTINUITY_MAP = built.map;

const all = observeAll([
  { id: 'o-river', domain: 'continuity', label: 'The river',
    description: 'The river appears in 11 of 41 chapters. Nine are in the first half; it is absent between Ch 6 and Ch 9.',
    evidence: ['Ch 1', 'Ch 4', 'Ch 6', 'Ch 10'], returnTo: ch(6),
    provenance: { kind: 'textual-entity' }, crossWork: true, coverage: COVERAGE },

  { id: 'o-current', domain: 'continuity', label: '“The current” changes meaning',
    description: 'In Ch 2 it names the river. In Ch 6 it names what Clara is living through. It is not renamed between them.',
    evidence: ['Ch 2', 'Ch 6'], returnTo: ch(2),
    provenance: { kind: 'maia-observation', readingId: 'r1', lens: 'coherence' } },

  { id: 'o-address', domain: 'voice', label: 'Direct address to the reader',
    description: 'You address the reader as “you” in 31 of 41 chapters. Part III contains none.',
    evidence: ['Ch 1–30', 'Ch 31–41'], returnTo: ch(31),
    provenance: { kind: 'textual-entity' }, crossWork: true, coverage: COVERAGE },

  { id: 'o-sentence', domain: 'voice', label: 'Sentence length and certainty',
    description: 'Your sentences shorten when Clara is certain and lengthen into subordinate clauses when she is not. Ch 2 and Ch 6 are the clearest cases.',
    evidence: ['Ch 2', 'Ch 6'], returnTo: ch(2),
    provenance: { kind: 'maia-observation', readingId: 'r1', lens: 'voice' } },

  { id: 'o-inbetween', domain: 'themes', label: '“The in-between”',
    description: 'The phrase is spoken once, aloud, by Clara in Ch 6. It appears twice more in narration.',
    evidence: ['Ch 2', 'Ch 6', 'Ch 8'], returnTo: ch(6),
    provenance: { kind: 'textual-entity' } },

  { id: 'o-parts', domain: 'structure', label: 'Your three parts',
    description: 'Crossing runs Ch 9–10, Belonging runs Ch 11–12. Part I has eight chapters; the others have two each.',
    evidence: ['Part I', 'Part II', 'Part III'], returnTo: { label: 'Go to Part II', sectionId: 'part-2' },
    provenance: { kind: 'member-declared', declaredWhen: 'Sep 14' }, crossWork: true, coverage: COVERAGE },

  { id: 'o-endings', domain: 'structure', label: 'Where chapters end',
    description: 'Twenty-nine chapters close on an image. Twelve close on dialogue.',
    evidence: ['Ch 1–41'], returnTo: ch(12),
    provenance: { kind: 'maia-observation', readingId: 'r1', lens: 'structure' }, crossWork: true, coverage: COVERAGE },

  { id: 'o-reader', domain: 'reader', label: 'Reader perspective',
    description: 'A reader might lose the referent at Ch 6, because “the current” carries a meaning it did not have in Ch 2.',
    evidence: ['Ch 2', 'Ch 6'], returnTo: ch(6),
    provenance: { kind: 'maia-observation', readingId: 'r1', lens: 'reader' },
    doesNotEstablish: ['reader-effect'] },
]);
if (!all.ok) throw new Error(`observation refused: ${all.code} — ${all.detail}`);

export const OBSERVATIONS: readonly DevelopObservation[] = all.observations;
export const byDomain = (d: DevelopObservation['domain']) => OBSERVATIONS.filter((o) => o.domain === d);
