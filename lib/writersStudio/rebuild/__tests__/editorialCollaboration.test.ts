const fetchMock = jest.fn();

jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => fetchMock(...args),
}));

import {
  adoptBoundEditorialVersion,
  changedSpan,
  exactVersion,
  readBoundEditorialThread,
  sendBoundEditorialTurn,
  threadMatchesVisibleSection,
  type RebuildEditorialThread,
} from '../editorialCollaboration';

const thread = (targetSectionId = 'draft-200'): RebuildEditorialThread => ({
  threadId: 'th-1', chainId: 'ch-1', locusText: 'original wording',
  targetSectionId, sectionLabel: 'II. Finding Our Place', legacyLocus: false,
  turns: [],
  versions: [{ id: 'v1', author: 'maia', wording: 'suggested wording', supersedes: null, rationale: 'clearer' }],
  headVersionId: 'v1',
});

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});
describe('revision collaboration binding', () => {
  beforeEach(() => fetchMock.mockReset());

  it('refuses a thread whose durable target is not the visible section', async () => {
    fetchMock.mockResolvedValueOnce(response(thread('draft-0')));
    const out = await readBoundEditorialThread('th-1', 'draft-200', 'rel-1');
    expect(out).toMatchObject({ ok: false, reason: 'locus_mismatch' });
  });

  it('treats matching visible and durable loci as one subject', () => {
    expect(threadMatchesVisibleSection(thread(), 'draft-200')).toBe(true);
    expect(threadMatchesVisibleSection(thread(), 'draft-199')).toBe(false);
  });

  it('carries the writer’s exact typed words into the editorial act', async () => {
    const exact = '  Make this less abstract, but keep my cadence.  ';
    // A successful turn now requires the exact server-named author/MAIA
    // pair in readback. A bare HTTP 200 is not a delivery receipt.
    const maiaReply = 'FICTIONAL MAIA reply for this passage.';
    fetchMock
      .mockResolvedValueOnce(response({
        threadId: 'th-1', memberTurnIndex: 0, maiaTurnIndex: 1,
        response: maiaReply, version: { id: 'v1' },
      }))
      .mockResolvedValueOnce(response({
        ...thread(),
        turns: [
          { turnIndex: 0, speaker: 'author', body: exact, at: '2026-10-20T10:00:00Z' },
          { turnIndex: 1, speaker: 'maia', body: maiaReply, at: '2026-10-20T10:00:01Z' },
        ],
      }));
    const out = await sendBoundEditorialTurn('th-1', 'draft-200', exact, { resolved: true, sanctuary: false }, undefined, 'rel-1');
    expect(out.ok).toBe(true);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.act.text).toBe(exact);
    expect(body.act.act).toBe('discourse');
  });
  it('withholds an unaccounted provider reply and never retries automatically', async () => {
    fetchMock.mockResolvedValueOnce(response({
      threadId: 'th-1',
      memberTurnIndex: 4,
      persisted: true,
      error: 'disclosure_confirmation_unresolved',
      detail: 'provider_disclosure_confirmation_unresolved',
      dispatch: 'response_observed',
    }, 500));
    const out = await sendBoundEditorialTurn(
      'th-1', 'draft-200', 'Fictional author question.',
      { resolved: true, sanctuary: false }, undefined, 'rel-1',
    );
    expect(out).toMatchObject({
      ok: false,
      reason: 'accountability_unresolved',
      memberTurnIndex: 4,
      dispatch: 'response_observed',
    });
    expect(out.ok === false ? out.detail : '').toContain('will not be retried automatically');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({ relationshipId: 'rel-1' });
  });

  it('adopts only a version that belongs to the bound thread', async () => {
    fetchMock.mockResolvedValueOnce(response(thread()));
    const out = await adoptBoundEditorialVersion('th-1', 'draft-200', 'not-here', 'rel-1');
    expect(out).toEqual({ ok: false, reason: 'version_not_in_bound_thread' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('selects an exact returned version by id, never the head by position', () => {
    const t = thread();
    expect(exactVersion(t, 'v1')?.wording).toBe('suggested wording');
    expect(exactVersion(t, 'missing')).toBeNull();
  });

  it('marks only the changed middle when prefix and suffix are shared', () => {
    expect(changedSpan('The rhythm is gentle.', 'The rhythm is deeply gentle.')).toEqual({
      before: 'The rhythm is ', changed: 'deeply ', after: 'gentle.',
    });
  });
});
