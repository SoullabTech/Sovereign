jest.mock('@/lib/writersStudio/developClient', () => ({
  fetchReading: jest.fn(),
  fetchReadingSummaries: jest.fn(),
  requestDevelopmentalReading: jest.fn(),
}));

import {
  fetchReading,
  fetchReadingSummaries,
  requestDevelopmentalReading,
} from '@/lib/writersStudio/developClient';
import { runWholeManuscriptReview } from '../wholeManuscriptReview';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';

const mockList = fetchReadingSummaries as jest.MockedFunction<typeof fetchReadingSummaries>;
const mockFetch = fetchReading as jest.MockedFunction<typeof fetchReading>;
const mockCommission = requestDevelopmentalReading as jest.MockedFunction<typeof requestDevelopmentalReading>;

function payload(id: string, lens: string, revisionNumber = 12, scope = ['s1', 's2']) {
  return {
    reading: {
      id,
      manuscriptId: 'm1',
      outcome: 'none',
      scope: { commissionedLens: lens, bodyScope: scope, withStructure: true },
      readState: { revisionNumber },
      observations: [],
    },
    assessment: { state: 'current' },
    sections: [],
  } as any;
}
describe('C11R2 resumable whole-manuscript review', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reuses only exact-current whole-work frozen readings', async () => {
    mockList.mockResolvedValue({
      ok: true,
      readings: LENS_ORDER.map((lens, i) => ({
        id: 'r' + i,
        outcome: 'none',
        commissionedLens: lens,
        frozenAt: '2026-09-28T00:00:00Z',
        observationCount: 0,
      })) as any,
    });
    mockFetch.mockImplementation(async (_m, id) => {
      const i = Number(id.slice(1));
      return { ok: true, payload: payload(id, LENS_ORDER[i]!) } as any;
    });

    const result = await runWholeManuscriptReview(
      'm1',
      undefined,
      { revisionNumber: 12, sectionIds: ['s1', 's2'] },
    );

    expect(result.readingIds).toHaveLength(8);
    expect(mockCommission).not.toHaveBeenCalled();
  });

  it('does not reuse a stale reading', async () => {
    mockList.mockResolvedValue({
      ok: true,
      readings: [{ id: 'old', outcome: 'none', commissionedLens: 'development',
        frozenAt: '2026-09-20T00:00:00Z', observationCount: 0 }] as any,
    });
    mockFetch.mockResolvedValue({ ok: true, payload: payload('old', 'development', 11) } as any);
    mockCommission.mockResolvedValue({ ok: false, refusal: 'stop', stage: 'read', attribution: 'system' } as any);

    await runWholeManuscriptReview(
      'm1',
      undefined,
      { revisionNumber: 12, sectionIds: ['s1', 's2'] },
    );

    expect(mockCommission).toHaveBeenCalledWith('m1', 'development', { kind: 'whole' });
  });
});
