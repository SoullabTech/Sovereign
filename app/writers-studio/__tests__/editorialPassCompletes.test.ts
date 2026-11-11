/**
 * EA walk 2026-11-11 (production): "Start an editorial pass" could never finish. The whole-manuscript review grew to 9 readings when
 * overview joined it, while the pass still demanded exactly 8 and the synthesis route accepts exactly the 8 deep lenses.
 * One runner now serves every room; these tests run it for real against stubbed clients.
 */
import fs from 'node:fs';
import path from 'node:path';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';
import { DEVELOPMENTAL_LENSES } from '@/lib/manuscript/developmentalReader/contract';

const review = jest.fn();
const synth = jest.fn();
jest.mock('@/lib/writersStudio/studio/wholeManuscriptReview', () => ({
  ...jest.requireActual('@/lib/writersStudio/studio/wholeManuscriptReview'),
  runWholeManuscriptReview: (...a: unknown[]) => review(...a),
}));
jest.mock('@/lib/writersStudio/attentionMapClient', () => ({ requestAttentionMap: (...a: unknown[]) => synth(...a) }));

import { runEditorialPass, inBookOrder } from '@/lib/writersStudio/studio/editorialPassRunner';

const full = () => ({
  readingIds: LENS_ORDER.map((l) => `r-${l}`),
  payloads: LENS_ORDER.map((l) => ({ reading: { id: `r-${l}`, scope: { commissionedLens: l } } })),
  findings: [], failures: [], remaining: [],
});
const MAP = { manuscriptId: 'm', revisionNumber: 5, commissionedAt: 'now', readingIds: [], items: [] };
const run = () => runEditorialPass({ manuscriptId: 'm', revisionNumber: 5, sectionIds: ['s1'] });
beforeEach(() => { review.mockReset(); synth.mockReset(); synth.mockResolvedValue({ ok: true, map: MAP }); });

describe('the editorial pass can finish', () => {
  it('⭐ a full nine-reading review completes, and the synthesis gets exactly the deep lenses (no overview)', async () => {
    review.mockResolvedValue(full());
    const out = await run();
    expect(out.ok).toBe(true);
    const sent = synth.mock.calls[0]![1] as string[];
    expect(sent).toHaveLength(DEVELOPMENTAL_LENSES.filter((l) => l !== 'overview').length);
    expect(sent).not.toContain('r-overview');
  });
  it('⭐ one refused lens is tried once more; completed readings are reused by the review itself', async () => {
    const short = full(); short.readingIds.pop(); short.payloads.pop();
    (short.failures as unknown[]).push({ lens: 'voice', refusal: 'claim_unbindable', stage: 'read', attribution: 'contract_violation' });
    review.mockResolvedValueOnce(short).mockResolvedValueOnce(full());
    expect((await run()).ok).toBe(true);
    expect(review).toHaveBeenCalledTimes(2);
  });
  it('a second refusal stops the pass; nothing is synthesized from an incomplete reading', async () => {
    const short = full(); short.readingIds.pop(); short.payloads.pop();
    (short.failures as unknown[]).push({ lens: 'voice', refusal: 'claim_unbindable', stage: 'read' });
    review.mockResolvedValue(short);
    const out = await run();
    expect(out).toMatchObject({ ok: false, stage: 'readings' });
    expect(synth).not.toHaveBeenCalled();
  });
  it('an upstream stop (readings remaining) is not retried', async () => {
    const stopped = full(); stopped.readingIds.length = 3; stopped.payloads.length = 3;
    (stopped.remaining as unknown[]).push('voice');
    (stopped.failures as unknown[]).push({ lens: 'arc', refusal: 'unreachable', stage: 'read' });
    review.mockResolvedValue(stopped);
    expect((await run()).ok).toBe(false);
    expect(review).toHaveBeenCalledTimes(1);
  });
  it('Develop uses the same runner (no hard-coded reading count anywhere in the room)', () => {
    const SRC = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx'), 'utf8');
    expect(SRC).toMatch(/await runEditorialPass\(\{/);
    expect(SRC).not.toMatch(/readingIds\.length\s*!==\s*\d/);
  });
  it('places come in the order of the book, never ranked', () => {
    const items = [{ id: 'c', sectionIds: ['s3'] }, { id: 'a', sectionIds: ['s1'] }, { id: 'b', sectionIds: ['s2', 's1'] }];
    expect(inBookOrder(items, ['s1', 's2', 's3']).map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
});
