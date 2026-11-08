/** Pure decision tests: no database. Fictional hashes only. */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { decideDuplicateImport, sectionsDigest, type HeldImport } from '../duplicateImport';

const held = (o: Partial<HeldImport> = {}): HeldImport => ({
  manuscriptId: 'm1', workId: 'w1', title: 'Fictional', artifactHash: 'B1', sourceTextHash: 'T1',
  createdAt: '2026-11-01T00:00:00.000Z', ...o,
});

describe('decideDuplicateImport', () => {
  it('proceeds when nothing is held', () => {
    expect(decideDuplicateImport({ held: [], bytesHash: 'B1', textHash: 'T1', importAgain: false })).toEqual({ outcome: 'proceed' });
  });
  it('reports already_imported on byte-identical match', () => {
    const d = decideDuplicateImport({ held: [held()], bytesHash: 'B1', textHash: 'TX', importAgain: false });
    expect(d).toMatchObject({ outcome: 'already_imported', matchedOn: 'bytes', existing: { manuscriptId: 'm1', workId: 'w1' } });
  });
  it('reports already_imported on identical extracted text with different bytes', () => {
    const d = decideDuplicateImport({ held: [held()], bytesHash: 'BX', textHash: 'T1', importAgain: false });
    expect(d).toMatchObject({ outcome: 'already_imported', matchedOn: 'text' });
  });
  it('proceeds when neither hash matches (never trusts the query filter)', () => {
    expect(decideDuplicateImport({ held: [held()], bytesHash: 'BX', textHash: 'TX', importAgain: false })).toEqual({ outcome: 'proceed' });
  });
  it('an explicit importAgain always proceeds', () => {
    expect(decideDuplicateImport({ held: [held()], bytesHash: 'B1', textHash: 'T1', importAgain: true })).toEqual({ outcome: 'proceed' });
  });
  it('a pasted arrival (no artifact hash) never matches on bytes', () => {
    const d = decideDuplicateImport({ held: [held({ artifactHash: null })], bytesHash: 'null', textHash: 'TX', importAgain: false });
    expect(d).toEqual({ outcome: 'proceed' });
  });
  it('prefers byte identity over text identity, and the newest among equals', () => {
    const d = decideDuplicateImport({
      held: [
        held({ manuscriptId: 'old', artifactHash: 'B1', createdAt: '2026-10-01T00:00:00.000Z' }),
        held({ manuscriptId: 'newText', artifactHash: 'BZ', sourceTextHash: 'T1', createdAt: '2026-11-03T00:00:00.000Z' }),
        held({ manuscriptId: 'newBytes', artifactHash: 'B1', createdAt: '2026-11-02T00:00:00.000Z' }),
      ],
      bytesHash: 'B1', textHash: 'T1', importAgain: false,
    });
    expect(d).toMatchObject({ matchedOn: 'bytes', existing: { manuscriptId: 'newBytes' } });
  });
  it('after the earlier copy is deleted the held list is empty, so re-import proceeds', () => {
    expect(decideDuplicateImport({ held: [], bytesHash: 'B1', textHash: 'T1', importAgain: false })).toEqual({ outcome: 'proceed' });
  });
});

describe('sectionsDigest', () => {
  it('is stable and sensitive to every character, heading, order and boundary', () => {
    const a = [{ heading: 'H', body: 'one' }, { heading: null, body: 'two' }];
    expect(sectionsDigest(a)).toBe(sectionsDigest(a.map((s) => ({ ...s }))));
    expect(sectionsDigest(a)).not.toBe(sectionsDigest([a[1]!, a[0]!]));
    expect(sectionsDigest(a)).not.toBe(sectionsDigest([{ heading: 'H', body: 'one ' }, a[1]!]));
    expect(sectionsDigest([{ heading: 'a', body: 'bc' }])).not.toBe(sectionsDigest([{ heading: 'ab', body: 'c' }]));
    expect(sectionsDigest([{ heading: null, body: 'x' }])).not.toBe(sectionsDigest([{ heading: '', body: 'x' }]));
  });
});
