import { presenceFromOccurrenceCount, projectThemePresence } from '../projection';
import type { WorkTheme, WorkThemeOccurrence } from '../store';
import type { DevelopmentalReading } from '@/lib/manuscript/developmentalReading/contract';

const theme: WorkTheme = {
  id: '11111111-1111-4111-8111-111111111111',
  manuscriptId: '22222222-2222-4222-8222-222222222222',
  provenance: 'maia-observation',
  initialLabel: 'Crossing and staying',
  currentLabel: 'Crossing and staying',
  standing: 'accepted',
  sourceReadingId: '33333333-3333-4333-8333-333333333333',
  sourceObservationId: 'dobs_theme',
  templateName: null,
  createdAt: '2026-09-26T00:00:00.000Z',
};

const reading = (coverage: Record<string, 'body' | 'position'>): DevelopmentalReading => ({
  id: theme.sourceReadingId!,
  manuscriptId: theme.manuscriptId,
  scope: { commissionedLens: 'themes', bodyScope: Object.keys(coverage), withStructure: false },
  readState: {
    draftId: '44444444-4444-4444-8444-444444444444',
    revisionNumber: 4,
    revisionDigest: 'a'.repeat(64),
    sectionTopology: ['s1', 's2', 's3'],
    sections: {
      s1: { revisionNumber: 4, range: { start: 0, end: 100 }, digest: '1'.repeat(64) },
      s2: { revisionNumber: 4, range: { start: 100, end: 200 }, digest: '2'.repeat(64) },
      s3: { revisionNumber: 4, range: { start: 200, end: 300 }, digest: '3'.repeat(64) },
    },
    inputFingerprint: 'f'.repeat(64),
  },
  coverage: { sections: coverage },
  outcome: 'reading',
  observations: [{
    key: 'o1', observationId: 'dobs_theme', admissionIndex: 0,
    basisFingerprint: 'b'.repeat(64), position: { sectionPosition: 0, codePointStart: 1 },
    lens: 'themes', themeLabel: 'Crossing and staying',
    evidenceRefs: [{ kind: 'section', sectionId: 's1' }, { kind: 'section', sectionId: 's2' }],
    observation: 'Crossing recurs.', doesNotEstablish: ['author-intent'],
    structureDependency: { kind: 'independent' },
  }],
  provenance: {
    reader: { provider: 'anthropic', model: 'witness', promptHash: 'p', readerVersion: 'r' },
    classifier: null, readingContractVersion: 'DEVELOPMENTAL-READING-CONTRACT-04',
    frozenAt: '2026-09-26T00:00:00.000Z',
  },
});

const occurrence = (sectionId: string, n: number): WorkThemeOccurrence[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `55555555-5555-4555-8555-${sectionId.padEnd(6, '0')}${String(i).padStart(6, '0')}`.slice(0, 36),
    themeId: theme.id,
    manuscriptId: theme.manuscriptId,
    sectionId,
    range: { start: i * 2, end: i * 2 + 1 },
    sourceReadingId: theme.sourceReadingId!,
    sourceObservationId: theme.sourceObservationId!,
    sourceRevisionNumber: 4,
    provenance: 'maia-observation',
    createdAt: '2026-09-26T00:00:00.000Z',
  }));

const sections = [
  { sectionId: 's1', label: 'One' },
  { sectionId: 's2', label: 'Two' },
  { sectionId: 's3', label: 'Three' },
];

describe('D5C4 deterministic Themes presence + trajectory', () => {
  test('count buckets are deterministic frequency, not importance', () => {
    expect([0,1,2,3,4,5,9].map(presenceFromOccurrenceCount)).toEqual([0,1,1,2,2,3,3]);
  });

  test('read-zero is known absence while unread remains unknown', () => {
    const p = projectThemePresence({
      theme, occurrences: occurrence('s1', 1),
      sourceReading: reading({ s1: 'body', s2: 'body', s3: 'position' }),
      currentSections: sections,
    });
    expect(p.cells.map((c) => [c.sectionId, c.state, c.occurrenceCount, c.presence])).toEqual([
      ['s1','known',1,1], ['s2','known',0,0], ['s3','unknown',null,null],
    ]);
    expect(p.coverage).toEqual({ read: 2, total: 3, wholeCurrentWork: false });
  });

  test('current display order may change without remapping historical identities', () => {
    const p = projectThemePresence({
      theme, occurrences: [...occurrence('s1', 1), ...occurrence('s3', 3)],
      sourceReading: reading({ s1: 'body', s2: 'body', s3: 'body' }),
      currentSections: [sections[2], sections[0], sections[1]],
    });
    expect(p.cells.map((c) => c.sectionId)).toEqual(['s3','s1','s2']);
    expect(p.trajectory.map((t) => [t.sectionId,t.sectionPosition,t.occurrenceCount])).toEqual([
      ['s3',0,3], ['s1',1,1],
    ]);
  });

  test('historical removed sections are counted but never remapped', () => {
    const p = projectThemePresence({
      theme, occurrences: [...occurrence('s1', 1), ...occurrence('s3', 1)],
      sourceReading: reading({ s1: 'body', s2: 'body', s3: 'body' }),
      currentSections: [sections[0], sections[1]],
    });
    expect(p.historicalUnmappedOccurrenceCount).toBe(1);
    expect(p.trajectory.map((t) => t.sectionId)).toEqual(['s1']);
  });

  test('whole-current-Work authority requires every current section at body depth', () => {
    const partial = projectThemePresence({
      theme, occurrences: [], sourceReading: reading({ s1:'body', s2:'position', s3:'body' }),
      currentSections: sections,
    });
    const whole = projectThemePresence({
      theme, occurrences: [], sourceReading: reading({ s1:'body', s2:'body', s3:'body' }),
      currentSections: sections,
    });
    expect(partial.coverage.wholeCurrentWork).toBe(false);
    expect(whole.coverage.wholeCurrentWork).toBe(true);
  });

  test('a member-declared theme without a source reading gets no invented bars', () => {
    const declared: WorkTheme = {
      ...theme, id:'66666666-6666-4666-8666-666666666666',
      provenance:'member-declared', sourceReadingId:null, sourceObservationId:null,
    };
    const p = projectThemePresence({
      theme: declared, occurrences: [], sourceReading: null, currentSections: sections,
    });
    expect(p.cells.every((c) => c.state === 'unknown' && c.presence === null)).toBe(true);
    expect(p.trajectory).toEqual([]);
    expect(p.coverage.wholeCurrentWork).toBe(false);
  });
});
