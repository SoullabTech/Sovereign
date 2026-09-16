jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));

import { apiFetch } from '@/lib/http/apiBase';
import {
  loadChapterReviewManifest,
  saveChapterReviewManifest,
} from '../chapterReviewManifest';

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const run = {
  id: 'run-1', manuscriptId: 'm1', chapterRootSectionId: 's1',
  sectionIds: ['s1', 's2'], draftRevision: 9,
  readingIds: ['r1'], failures: [], createdAt: '2026-09-16T14:00:00Z',
};
const response = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
}) as Response;

describe('chapter review manifest client', () => {
  beforeEach(() => mockedFetch.mockReset());
  it('distinguishes no saved run from an unavailable store', async () => {
    mockedFetch.mockResolvedValueOnce(response(200, { run: null }));
    await expect(loadChapterReviewManifest('m1', 's1')).resolves.toEqual({ ok: true, run: null });

    mockedFetch.mockResolvedValueOnce(response(503, { refusal: 'unavailable' }));
    await expect(loadChapterReviewManifest('m1', 's1')).resolves.toEqual({ ok: false, refusal: 'unavailable' });
  });

  it('returns the durable run only after a successful save', async () => {
    mockedFetch.mockResolvedValueOnce(response(201, { run }));
    const out = await saveChapterReviewManifest('m1', {
      chapterRootSectionId: 's1', sectionIds: ['s1', 's2'], draftRevision: 9,
      readingIds: ['r1'], failures: [],
    });
    expect(out).toEqual({ ok: true, run });

    mockedFetch.mockResolvedValueOnce(response(500, { refusal: 'store_failed' }));
    await expect(saveChapterReviewManifest('m1', {
      chapterRootSectionId: 's1', sectionIds: ['s1', 's2'], draftRevision: 9,
      readingIds: ['r1'], failures: [],
    })).resolves.toEqual({ ok: false, refusal: 'store_failed' });
  });
});
