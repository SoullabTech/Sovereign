/**
 * The whole-book editorial pass and the Free / Pro line (`writing.wholeWork`). The runner is shared by Write and Develop, so
 * both rooms behave the same. The server is the authority; the runner only avoids starting a pass the server would refuse.
 */
import fs from 'node:fs';
import path from 'node:path';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';

const review = jest.fn();
const synth = jest.fn();
jest.mock('@/lib/writersStudio/studio/wholeManuscriptReview', () => ({
  ...jest.requireActual('@/lib/writersStudio/studio/wholeManuscriptReview'),
  runWholeManuscriptReview: (...a: unknown[]) => review(...a),
}));
jest.mock('@/lib/writersStudio/attentionMapClient', () => ({ requestAttentionMap: (...a: unknown[]) => synth(...a) }));

import { runEditorialPass } from '@/lib/writersStudio/studio/editorialPassRunner';
import { WHOLE_WORK_MESSAGE, WHOLE_WORK_REFUSAL } from '@/lib/writersStudio/wholeWorkAccess';

const full = () => ({
  readingIds: LENS_ORDER.map((l) => `r-${l}`),
  payloads: LENS_ORDER.map((l) => ({ reading: { id: `r-${l}`, scope: { commissionedLens: l } } })),
  findings: [], failures: [], remaining: [],
});
const MAP = { manuscriptId: 'm', revisionNumber: 5, commissionedAt: 'now', readingIds: [], items: [] };
const run = (access: boolean | null) =>
  runEditorialPass({ manuscriptId: 'm', revisionNumber: 5, sectionIds: ['s1'], checkAccess: async () => access });

beforeEach(() => {
  review.mockReset(); synth.mockReset();
  review.mockResolvedValue(full());
  synth.mockResolvedValue({ ok: true, map: MAP });
});

describe('editorial pass × writing.wholeWork', () => {
  it('⭐ an explicit "not entitled" stops before any reading: no paid work is started', async () => {
    expect(await run(false)).toEqual({ ok: false, stage: 'entitlement', message: WHOLE_WORK_MESSAGE });
    expect(review).not.toHaveBeenCalled();
    expect(synth).not.toHaveBeenCalled();
  });
  it('entitled: the pass runs as before', async () => {
    expect((await run(true)).ok).toBe(true);
  });
  it('⭐ unknown (signed-out endpoint, offline, iOS header session) proceeds; the server decides', async () => {
    expect((await run(null)).ok).toBe(true);
    expect(review).toHaveBeenCalledTimes(1);
  });
  it('⭐ a server refusal at synthesis says why, not "could not prepare just now"', async () => {
    synth.mockResolvedValue({ ok: false, refusal: WHOLE_WORK_REFUSAL });
    expect(await run(null)).toEqual({ ok: false, stage: 'entitlement', message: WHOLE_WORK_MESSAGE });
  });
  it('any other synthesis failure keeps its own message', async () => {
    synth.mockResolvedValue({ ok: false, refusal: 'http_500' });
    expect(await run(true)).toMatchObject({ ok: false, stage: 'synthesis' });
  });
  it('the message states the fact, promises nothing, and says the manuscript is unchanged', () => {
    expect(WHOLE_WORK_MESSAGE).toMatch(/Pro/);
    expect(WHOLE_WORK_MESSAGE).toMatch(/Nothing in your manuscript changed/);
    expect(WHOLE_WORK_MESSAGE).not.toMatch(/upgrade|buy|unlock|today|now only/i);
  });
});

describe('the server gate sits on the whole-book synthesis only', () => {
  const src = fs.readFileSync(
    path.join(process.cwd(), 'app/api/sovereign/manuscripts/[id]/attention-map/route.ts'), 'utf8',
  );
  it('⭐ checks the entitlement (never tier) inside the deep-mode branch, before any model call', () => {
    const gate = src.indexOf("hasEntitlement(entitlements, 'writing.wholeWork')");
    expect(gate).toBeGreaterThan(-1);
    expect(src.lastIndexOf('if (deepMode) {', gate)).toBeGreaterThan(src.indexOf('const deepMode ='));
    expect(gate).toBeLessThan(src.indexOf('runStructured('));
    expect(src).not.toMatch(/\btier\b/);
  });
  it('the #2221 per-destination tier table is retired: one place decides this', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'lib/writersStudio/entitlements.ts'))).toBe(false);
    expect(fs.readFileSync(path.join(process.cwd(), 'app/writers-studio/studioMap.ts'), 'utf8')).not.toMatch(/isEntitled/);
  });
});
