jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));

import { apiFetch } from '@/lib/http/apiBase';
import { commissionReviewDiscuss } from '../reviewDiscuss';
import { sendBoundEditorialTurn } from '../editorialCollaboration';

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const posture = { resolved: true as const, sanctuary: false };

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const THREAD = {
  threadId: 'thread-1',
  chainId: 'chain-1',
  locusText: 'The passage.',
  targetSectionId: 'section-1',
  sectionLabel: null,
  legacyLocus: false,
  turns: [],
  versions: [],
  headVersionId: null,
};

beforeEach(() => mockedApiFetch.mockReset());

describe('A2-6 relationship carriage', () => {
  it('Review carries the exact selected relationshipId', async () => {
    mockedApiFetch.mockResolvedValueOnce(response(200, {
      answer: 'Earlier answer.',
      threadId: 'review-thread',
      posture: 'AS_READ',
    }));

    const out = await commissionReviewDiscuss({
      manuscriptId: 'manuscript-1',
      readingId: 'reading-1',
      observationKey: 'observation-1',
      question: 'What did you see?',
      relationshipId: 'relationship-1',
    }, posture);

    expect(out.ok).toBe(true);
    const body = JSON.parse(String(mockedApiFetch.mock.calls[0]![1]?.body));
    expect(body.relationshipId).toBe('relationship-1');
  });

  it('Review omits relationshipId when no parent is selected', async () => {
    mockedApiFetch.mockResolvedValueOnce(response(200, {
      answer: 'Earlier answer.',
      threadId: 'review-thread',
      posture: 'AS_READ',
    }));

    await commissionReviewDiscuss({
      manuscriptId: 'manuscript-1',
      readingId: 'reading-1',
      observationKey: 'observation-1',
      question: 'What did you see?',
    }, posture);

    const body = JSON.parse(String(mockedApiFetch.mock.calls[0]![1]?.body));
    expect('relationshipId' in body).toBe(false);
  });

  it('Editorial carries the exact selected relationshipId', async () => {
    mockedApiFetch
      .mockResolvedValueOnce(response(200, { response: 'Reply.', version: null, voice: null }))
      .mockResolvedValueOnce(response(200, THREAD));

    const out = await sendBoundEditorialTurn(
      'thread-1',
      'section-1',
      'My question',
      posture,
      { latitude: 1, mayRemoveParagraphs: false },
      'relationship-1',
    );

    expect(out.ok).toBe(true);
    const body = JSON.parse(String(mockedApiFetch.mock.calls[0]![1]?.body));
    expect(body.relationshipId).toBe('relationship-1');
  });

  it('Editorial carry sends only kind and relationship-local episode sequence', async () => {
    mockedApiFetch
      .mockResolvedValueOnce(response(200, { response: 'Reply.', version: null, voice: null }))
      .mockResolvedValueOnce(response(200, THREAD));

    await sendBoundEditorialTurn(
      'thread-1', 'section-1', 'My question', posture,
      { latitude: 1, mayRemoveParagraphs: false },
      {
        relationshipId: 'relationship-1',
        carry: { kind: 'prior_maia_editorial_turn', sourceEpisodeSequence: 7 },
      },
    );

    const body = JSON.parse(String(mockedApiFetch.mock.calls[0]![1]?.body));
    expect(body.carry).toEqual({ kind: 'prior_maia_editorial_turn', sourceEpisodeSequence: 7 });
    expect(Object.keys(body.carry).sort()).toEqual(['kind', 'sourceEpisodeSequence']);
  });

  it('Editorial omits relationshipId when no parent is selected', async () => {
    mockedApiFetch
      .mockResolvedValueOnce(response(200, { response: 'Reply.', version: null, voice: null }))
      .mockResolvedValueOnce(response(200, THREAD));

    await sendBoundEditorialTurn(
      'thread-1',
      'section-1',
      'My question',
      posture,
      { latitude: 1, mayRemoveParagraphs: false },
    );

    const body = JSON.parse(String(mockedApiFetch.mock.calls[0]![1]?.body));
    expect('relationshipId' in body).toBe(false);
  });
});
