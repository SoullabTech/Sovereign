import { runCraftReread, type CraftRereadDependencies } from '../craftRereadR1';
import type { ReadingPayload } from '../developClient';
import { LENS_ORDER } from '../developPresentation';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';

const sections = ['chapter', 'fire', 'chapter2'].map((id, position) => ({
  draftSectionId: id, sourceSectionId: null, position,
  heading: id === 'fire' ? 'Fire' : `Chapter ${position + 1}: Test`,
  headingDepth: id === 'fire' ? 2 : 1, headingSignal: null, body: 'Synthetic prose.', editable: true,
}));
function payload(lens: DevelopmentalLens): ReadingPayload {
  return {
    reading: { id: `read-${lens}`, manuscriptId: 'm', outcome: 'none', observations: [],
      scope: { commissionedLens: lens, bodyScope: ['chapter', 'fire'], withStructure: false },
      readState: { revisionNumber: 7, sectionTopology: sections.map(s => s.draftSectionId), structureContext: null },
      coverage: { sections: { chapter: 'body', fire: 'body', chapter2: 'position' } },
      provenance: { frozenAt: '2026-10-07T15:00:00Z', reader: { model: 'test', readerVersion: 'test' }, classifier: null },
    },
    assessment: { reading: { state: 'current' }, observations: {} },
    sections: sections.map(s => ({ id: s.draftSectionId, heading: s.heading })),
  } as ReadingPayload;
}
const input = (request = 'Read this chapter.') => ({
  request, manuscriptId: 'm', sections, activeSectionId: 'fire', revisionNumber: 7,
  stillCurrent: () => true,
});
function deps(): CraftRereadDependencies {
  return {
    commission: jest.fn(async (_m, lens) => ({ ok: true as const, readingId: `read-${lens}`, outcome: 'none' as const, observationCount: 0 })),
    fetch: jest.fn(async (_m, id) => ({ ok: true as const, payload: payload(id.replace('read-', '') as DevelopmentalLens) })),
  };
}

describe('Craft reread gate at the actual commission boundary', () => {
  it.each(['Do not read the whole book. Just help with this sentence.', 'My whole book is about return.', '"Read the whole book."'])
  ('makes zero read calls for %j', async request => {
    const d = deps();
    expect((await runCraftReread(input(request), d)).kind).toBe('local');
    expect(d.commission).not.toHaveBeenCalled();
    expect(d.fetch).not.toHaveBeenCalled();
  });
  it('commissions exactly the requested chapter and lens', async () => {
    const d = deps();
    const out = await runCraftReread(input('Read this chapter for voice.'), d);
    expect(d.commission).toHaveBeenCalledTimes(1);
    expect(d.commission).toHaveBeenCalledWith('m', 'voice', { kind: 'range', fromSectionId: 'chapter', toSectionId: 'fire' });
    expect(out).toMatchObject({ kind: 'read', coverage: 'complete' });
  });
  it('counts a no-observation result as a completed reading, not a failure', async () => {
    const out = await runCraftReread(input(), deps());
    expect(out).toMatchObject({ kind: 'read', coverage: 'complete' });
    expect(out.notice).toContain(`${LENS_ORDER.length}/${LENS_ORDER.length}`);
  });
  it('names partial completion rather than claiming the broad review completed', async () => {
    const d = deps();
    (d.commission as jest.Mock).mockImplementationOnce(async () => ({ ok: true, readingId: `read-${LENS_ORDER[0]}`, outcome: 'none', observationCount: 0 }))
      .mockImplementationOnce(async () => ({ ok: false, refusal: 'unreachable', stage: 'read' }));
    const out = await runCraftReread(input(), d);
    expect(out).toMatchObject({ kind: 'read', coverage: 'partial' });
    expect(out.notice).toContain(`1/${LENS_ORDER.length}`);
    expect(out.notice).toContain('Not completed');
    expect(d.commission).toHaveBeenCalledTimes(2);
    if (out.kind === 'read') expect(out.context).toContain('PARTIAL');
  });
  it.each(['foreign', 'stale', 'partial-body', 'wrong-lens', 'wrong-id', 'out-of-scope'])
  ('refuses unverified %s evidence', async flaw => {
    const d = deps(); const p = payload('voice');
    if (flaw === 'foreign') p.reading.manuscriptId = 'foreign';
    if (flaw === 'stale') p.reading.readState.revisionNumber = 6;
    if (flaw === 'partial-body') p.reading.coverage.sections.fire = 'position';
    if (flaw === 'wrong-lens') p.reading.scope.commissionedLens = 'arc';
    if (flaw === 'wrong-id') p.reading.id = 'other';
    if (flaw === 'out-of-scope') p.reading.scope.bodyScope = ['chapter', 'fire', 'chapter2'];
    (d.fetch as jest.Mock).mockResolvedValue({ ok: true, payload: p });
    expect((await runCraftReread(input('Read this chapter for voice.'), d)).kind).toBe('stopped');
  });
  it('does not start when the originating context is already stale', async () => {
    const d = deps();
    expect((await runCraftReread({ ...input(), stillCurrent: () => false }, d)).kind).toBe('stopped');
    expect(d.commission).not.toHaveBeenCalled();
  });
  it('does not fetch or continue after scope/privacy changes during a commission', async () => {
    const d = deps(); let current = true;
    (d.commission as jest.Mock).mockImplementation(async () => {
      current = false;
      return { ok: true, readingId: 'read-voice', outcome: 'none', observationCount: 0 };
    });
    expect((await runCraftReread({ ...input(), stillCurrent: () => current }, d)).kind).toBe('stopped');
    expect(d.fetch).not.toHaveBeenCalled();
    expect(d.commission).toHaveBeenCalledTimes(1);
  });
  it('stops after a thrown transport error without retrying', async () => {
    const d = deps(); (d.commission as jest.Mock).mockRejectedValue(new Error('transport'));
    expect((await runCraftReread(input(), d)).kind).toBe('stopped');
    expect(d.commission).toHaveBeenCalledTimes(1);
  });
});
