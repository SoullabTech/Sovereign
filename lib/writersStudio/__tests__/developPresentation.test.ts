/**
 * BUILD-07D — the words beside a reading, falsified.
 *
 * The surface may describe; it may not rewrite, re-anchor, reorder, hide, or
 * upgrade a state. Observation text passes through verbatim; section numbers
 * come from the FROZEN topology; unmeasured is never shown as current; a
 * superseded observation keeps its place and says what moved.
 */

import { evidenceAtRev1 } from '../../manuscript/development/__tests__/fixture';
import type { DevelopmentalReading } from '../../manuscript/developmentalReading/contract';
import type { ReadingAssessment } from '../../manuscript/developmentalReading/assess';
import {
  LENS_MEANING, LENS_ORDER, STATE_LABEL, STATE_SENTENCE, coverageSummary, describeMoved, describeRef,
  frozenPosition, limitLine, observationView, readingView, sectionLabel,
} from '../developPresentation';
import { DEVELOPMENTAL_LENSES, NON_CONCLUSION_MEANING } from '../../manuscript/developmentalReader/contract';
import { DEVELOPMENTAL_PHENOMENA } from '../../manuscript/developmentalReading/contract';

const { evidence } = evidenceAtRev1({ withStructure: true });
const readState = evidence.readState;
const SECTIONS = [
  { id: 's0', heading: 'Arrival' },
  { id: 's1', heading: null },
  /* s2 is gone now; s3 remains */
  { id: 's3', heading: 'After' },
];

const VERBATIM = '  The lantern is set down in s0 and not picked up in s1.  \n';

function reading(): DevelopmentalReading {
  return {
    id: 'r-1', manuscriptId: 'm-1',
    scope: { commissionedLens: 'development', bodyScope: ['s0', 's1'], withStructure: true },
    readState, coverage: evidence.coverage,
    provenance: {
      reader: { provider: 'anthropic', model: 'claude-test', promptHash: 'h', readerVersion: 'DEVELOPMENTAL-READER-01' },
      classifier: { provider: 'anthropic', model: 'claude-test', promptHash: 'c', classifierVersion: 'DEVELOPMENTAL-PHENOMENON-01' },
      frozenAt: '2026-09-04T12:00:00.000Z',
    },
    outcome: 'reading',
    observations: [
      { key: 'o1', lens: 'development', phenomenon: 'recurrence', evidenceRefs: [{ kind: 'section', sectionId: 's0' }, { kind: 'passage', sectionId: 's1', range: { start: 3, end: 40 } }],
        observation: VERBATIM, doesNotEstablish: ['across-unread-span'], structureDependency: { kind: 'independent' } },
      { key: 'o2', lens: 'development', phenomenon: 'positional-asymmetry', evidenceRefs: [{ kind: 'section-run', sectionIds: ['s1', 's2', 's3'] }, { kind: 'structure-units', unitIds: ['u1', 'u2'] }],
        observation: 'The run crosses the chapter boundary.', doesNotEstablish: ['authored-structure-relation', 'chronology'], structureDependency: { kind: 'authored-structure' } },
      { key: 'o3', lens: 'development', phenomenon: 'movement', evidenceRefs: [{ kind: 'structure-topology' }],
        observation: 'Third.', doesNotEstablish: ['editorial-consequence'], structureDependency: { kind: 'authored-structure' } },
    ],
  };
}

const assessment: ReadingAssessment = {
  reading: { state: 'superseded', moved: [{ what: 'section-text', sectionId: 's0' }, { what: 'section-absent', sectionId: 's2' }] },
  observations: {
    o1: { state: 'superseded', moved: [{ what: 'section-text', sectionId: 's0' }] },
    o2: { state: 'superseded', moved: [{ what: 'section-absent', sectionId: 's2' }, { what: 'section-order', sectionIds: ['s1', 's2', 's3'] }] },
    o3: { state: 'current' },
  },
};

describe('labels come from the frozen topology, never the current order', () => {
  it('numbers sections by their position AS READ and shows the member heading only where the section still exists', () => {
    expect(frozenPosition(readState, 's0')).toBe(1);
    expect(frozenPosition(readState, 's3')).toBe(4);
    expect(frozenPosition(readState, 'never')).toBeNull();
    expect(sectionLabel(readState, SECTIONS, 's0')).toBe('Section 1 · “Arrival”');
    expect(sectionLabel(readState, SECTIONS, 's1')).toBe('Section 2');
    expect(sectionLabel(readState, SECTIONS, 's2')).toBe('Section 3 (no longer in the work)');
  });

  it('describes every ref kind as it stood when read; divisions by the FROZEN structure context', () => {
    expect(describeRef({ kind: 'section', sectionId: 's0' }, readState, SECTIONS)).toBe('Section 1 · “Arrival”, the whole section as read');
    expect(describeRef({ kind: 'passage', sectionId: 's1', range: { start: 3, end: 40 } }, readState, SECTIONS)).toBe('Section 2, characters 3–40 as read');
    expect(describeRef({ kind: 'section-run', sectionIds: ['s1', 's2', 's3'] }, readState, SECTIONS)).toBe('Sections 2–4, in the order they were read');
    expect(describeRef({ kind: 'structure-unit', unitId: 'u1' }, readState, SECTIONS)).toBe('The chapter “One”, as it stood in your structure');
    expect(describeRef({ kind: 'structure-units', unitIds: ['u1', 'u2'] }, readState, SECTIONS)).toBe('The chapter “One” and the chapter “Two”, as they stood in your structure');
    expect(describeRef({ kind: 'structure-topology' }, readState, SECTIONS)).toBe('The whole authored structure, as it stood when read');
    expect(describeRef({ kind: 'structure-unit', unitId: 'p9' }, readState, SECTIONS)).toMatch(/not in the frozen structure/);
  });

  it('says what moved, in the member\'s terms', () => {
    expect(describeMoved({ what: 'section-text', sectionId: 's0' }, readState, SECTIONS)).toBe('the text of Section 1 · “Arrival” has changed');
    expect(describeMoved({ what: 'section-absent', sectionId: 's2' }, readState, SECTIONS)).toBe('Section 3 is no longer in the work');
    expect(describeMoved({ what: 'section-order', sectionIds: ['s1', 's3'] }, readState, SECTIONS)).toBe('the order of sections 2, 4 has changed');
    expect(describeMoved({ what: 'structure-unit', unitId: 'u2' }, readState, SECTIONS)).toBe('the chapter “Two” has changed');
    expect(describeMoved({ what: 'structure-unit-absent', unitId: 'u2' }, readState, SECTIONS)).toBe('the chapter “Two” is no longer in your structure');
    expect(describeMoved({ what: 'structure-topology' }, readState, SECTIONS)).toBe('the shape of your authored structure has changed');
  });
});

describe('the observation is encountered, not edited', () => {
  it('passes the text through VERBATIM — leading spaces, trailing newline and all', () => {
    const v = observationView(reading().observations[0], assessment.observations.o1!, readState, SECTIONS);
    expect(v.observation).toBe(VERBATIM);
    expect(v.key).toBe('o1');
    expect(v.phenomenonLabel).toBe('recurrence');
    expect(v.evidence).toHaveLength(2);
    expect(v.limits).toEqual([{ name: 'across unread span', meaning: NON_CONCLUSION_MEANING['across-unread-span'] }]);
    expect(v.dependsOnStructure).toBe(false);
  });

  it('carries the three states with their own words; unmeasured is never current', () => {
    const o = reading().observations[2];
    expect(observationView(o, { state: 'current' }, readState, SECTIONS)).toMatchObject({ state: 'current', stateLabel: 'Current', moved: [] });
    expect(observationView(o, { state: 'unmeasured' }, readState, SECTIONS)).toMatchObject({ state: 'unmeasured', stateLabel: 'Unmeasured' });
    expect(STATE_SENTENCE.unmeasured).toMatch(/not a no/);
    expect(STATE_LABEL.unmeasured).not.toBe(STATE_LABEL.current);
    const s = observationView(reading().observations[1], assessment.observations.o2!, readState, SECTIONS);
    expect(s.state).toBe('superseded');
    expect(s.moved).toEqual(['Section 3 is no longer in the work', 'the order of sections 2, 3, 4 has changed']);
  });

  it('a missing assessment row is UNMEASURED, not current', () => {
    const v = readingView(reading(), { reading: { state: 'current' }, observations: {} }, SECTIONS);
    expect(v.observations.map((o) => o.state)).toEqual(['unmeasured', 'unmeasured', 'unmeasured']);
  });
});

describe('the reading is presented whole and in order', () => {
  it('keeps o1…oN in the reading\'s own order with superseded ones in place, marked', () => {
    const v = readingView(reading(), assessment, SECTIONS);
    expect(v.id).toBe('r-1');
    expect(v.observations.map((o) => o.key)).toEqual(['o1', 'o2', 'o3']);
    expect(v.observations.map((o) => o.state)).toEqual(['superseded', 'superseded', 'current']);
    expect(v.state).toBe('superseded');
    expect(v.moved).toEqual(['the text of Section 1 · “Arrival” has changed', 'Section 3 is no longer in the work']);
    expect(v.lensMeaning).toBe(LENS_MEANING.development);
    expect(v.readerVersion).toBe('DEVELOPMENTAL-READER-01');
    expect(v.classifierVersion).toBe('DEVELOPMENTAL-PHENOMENON-01');
    expect(v.revisionNumber).toBe(readState.revisionNumber);
  });

  it('coverage is derived from the frozen coverage, never stored or inferred', () => {
    const c = coverageSummary(reading());
    expect(c).toMatchObject({ total: 4, body: 2, position: 2 });
    expect(c.sentence).toBe('MAIA read 2 of 4 sections in full; 2 by position only.');
  });

  it('a none reading presents as complete with no observations and a classifier of null', () => {
    const r = reading();
    const none: DevelopmentalReading = { ...r, outcome: 'none', observations: [], provenance: { ...r.provenance, classifier: null } };
    const v = readingView(none, { reading: { state: 'current' }, observations: {} }, SECTIONS);
    expect(v.outcome).toBe('none');
    expect(v.observations).toEqual([]);
    expect(v.classifierVersion).toBeNull();
  });

  it('the vocabularies are the closed ones — every lens has a meaning, every phenomenon a label, every non-conclusion a line', () => {
    expect([...LENS_ORDER].sort()).toEqual([...DEVELOPMENTAL_LENSES].sort());
    for (const l of DEVELOPMENTAL_LENSES) expect(LENS_MEANING[l].length).toBeGreaterThan(0);
    for (const n of Object.keys(NON_CONCLUSION_MEANING)) expect(limitLine(n as never).meaning.length).toBeGreaterThan(0);
    expect(DEVELOPMENTAL_PHENOMENA).toHaveLength(8);
  });
});
