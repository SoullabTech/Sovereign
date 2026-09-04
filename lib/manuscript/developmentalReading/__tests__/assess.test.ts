/**
 * BUILD-07C — supersession, three-state and scoped per observation
 * (INV-19, INV-20, INV-21, INV-22). Pure, over the 07A fixture.
 */

import { evidenceAtRev1, liveDraft, STRUCTURE } from '../../development/__tests__/fixture';
import type { LiveWork } from '../../development/resolve';
import type { DevelopmentalReading } from '../contract';
import { assessReading } from '../assess';

function reading(withStructure = true): DevelopmentalReading {
  const { evidence } = evidenceAtRev1({ withStructure });
  return {
    id: 'r1', manuscriptId: 'm1',
    scope: { commissionedLens: 'continuity', bodyScope: ['s0', 's1'], withStructure },
    readState: evidence.readState, coverage: evidence.coverage,
    provenance: { reader: { provider: 'anthropic', model: 'm', promptHash: 'p', readerVersion: 'DEVELOPMENTAL-READER-01' }, classifier: null, frozenAt: '2026-09-04T00:00:00.000Z' },
    outcome: 'reading',
    observations: [
      { key: 'o1', lens: 'continuity', phenomenon: 'recurrence', evidenceRefs: [{ kind: 'section', sectionId: 's0' }], observation: 'a', doesNotEstablish: ['author-intent'], structureDependency: { kind: 'independent' } },
      { key: 'o2', lens: 'continuity', phenomenon: 'movement', evidenceRefs: [{ kind: 'section-run', sectionIds: ['s1', 's2', 's3'] }], observation: 'b', doesNotEstablish: ['chronology'], structureDependency: { kind: 'independent' } },
      { key: 'o3', lens: 'continuity', phenomenon: 'positional-asymmetry', evidenceRefs: [{ kind: 'structure-unit', unitId: 'u2' }], observation: 'c', doesNotEstablish: ['authored-structure-relation'], structureDependency: { kind: 'authored-structure' } },
    ],
  };
}
const live = (over: Parameters<typeof liveDraft>[0] = {}, structure = STRUCTURE): LiveWork =>
  ({ sections: liveDraft(over).sections, structure });

describe('assessReading', () => {
  it('unchanged Work → every observation current; reading current', () => {
    const a = assessReading(reading(), live());
    expect(a.reading).toEqual({ state: 'current' });
    expect(Object.values(a.observations).every((l) => l.state === 'current')).toBe(true);
  });

  it('a section edit supersedes only the observations whose evidence depends on that section (INV-21)', () => {
    const a = assessReading(reading(), live({ s0: 'The First Movement 😀 — rewritten.\n\n' }));
    expect(a.observations.o1.state).toBe('superseded');
    expect(a.observations.o2.state).toBe('current');   // a run depends on order, not text
    expect(a.observations.o3.state).toBe('current');
    expect(a.reading.state).toBe('superseded');
    if (a.observations.o1.state === 'superseded') expect(a.observations.o1.moved).toEqual([{ what: 'section-text', sectionId: 's0' }]);
  });

  it('a structure change supersedes only structure-dependent observations', () => {
    const changed = { ...STRUCTURE, units: STRUCTURE.units.map((u) => u.id === 'u2' ? { ...u, title: 'Two, renamed' } : u) };
    const a = assessReading(reading(), live({}, changed));
    expect(a.observations.o1.state).toBe('current');
    expect(a.observations.o2.state).toBe('current');
    expect(a.observations.o3.state).toBe('superseded');
  });

  it('a Work that could not be loaded is unmeasured, never current (INV-20)', () => {
    const a = assessReading(reading(), { sections: null, structure: null });
    expect(a.reading).toEqual({ state: 'unmeasured' });
    expect(a.observations.o1).toEqual({ state: 'unmeasured' });
  });

  it('a none reading is assessed by its body scope: current, superseded where a covered section moved, unmeasured without a Work', () => {
    const none: DevelopmentalReading = { ...reading(), outcome: 'none', observations: [] };
    expect(assessReading(none, live()).reading).toEqual({ state: 'current' });
    expect(assessReading(none, live({ s1: 'changed 𝔘' })).reading.state).toBe('superseded');
    expect(assessReading(none, { sections: null, structure: null }).reading).toEqual({ state: 'unmeasured' });
    expect(assessReading(none, live()).observations).toEqual({});
  });

  it('never re-anchors: the reading object is untouched by assessment (INV-19)', () => {
    const r = reading();
    const before = JSON.stringify(r);
    assessReading(r, live({ s0: 'x' }));
    expect(JSON.stringify(r)).toBe(before);
  });
});
