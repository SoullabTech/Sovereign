const fetchMock = jest.fn();

jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => fetchMock(...args),
}));

import {
  adoptBoundEditorialVersion,
  changedSpan,
  exactVersion,
  readBoundEditorialThread,
  locateUniquePresentationPassage,
  returnLocusText,
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
    const out = await readBoundEditorialThread('th-1', 'draft-200');
    expect(out).toMatchObject({ ok: false, reason: 'locus_mismatch' });
  });

  it('treats matching visible and durable loci as one subject', () => {
    expect(threadMatchesVisibleSection(thread(), 'draft-200')).toBe(true);
    expect(threadMatchesVisibleSection(thread(), 'draft-199')).toBe(false);
  });

  it('carries the writer’s exact typed words into the editorial act', async () => {
    const exact = '  Make this less abstract, but keep my cadence.  ';
    fetchMock
      .mockResolvedValueOnce(response({ version: { id: 'v1' } }))
      .mockResolvedValueOnce(response(thread()));
    const out = await sendBoundEditorialTurn('th-1', 'draft-200', exact, { resolved: true, sanctuary: false });
    expect(out.ok).toBe(true);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.act.text).toBe(exact);
    expect(body.act.act).toBe('discourse');
  });
  it('adopts only a version that belongs to the bound thread', async () => {
    fetchMock.mockResolvedValueOnce(response(thread()));
    const out = await adoptBoundEditorialVersion('th-1', 'draft-200', 'not-here');
    expect(out).toEqual({ ok: false, reason: 'version_not_in_bound_thread' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('selects an exact returned version by id, never the head by position', () => {
    const t = thread();
    expect(exactVersion(t, 'v1')?.wording).toBe('suggested wording');
    expect(exactVersion(t, 'missing')).toBeNull();
  });

  it('uses the exact applied wording only while that durable application remains undoable', () => {
    const applied: RebuildEditorialThread = {
      ...thread(),
      application: {
        authorizationId: 'auth-1', versionId: 'v1', resultingVersion: 2,
        undone: false, canUndo: true,
      },
    };
    expect(returnLocusText(applied)).toBe('suggested wording');
    expect(returnLocusText({ ...applied, application: { ...applied.application!, canUndo: false } }))
      .toBe('original wording');
    expect(returnLocusText({ ...applied, application: { ...applied.application!, undone: true } }))
      .toBe('original wording');
    expect(returnLocusText({ ...applied, application: { ...applied.application!, versionId: 'missing' } }))
      .toBe('original wording');
  });

  it('maps a selection from semantic Edit view back across PDF soft wraps', () => {
    const body = 'The Spiralogic Process offers a structured yet flexible way of noticing these\nmovements and bringing them into relationship.';
    const picked = 'The Spiralogic Process offers a structured yet flexible way of noticing these movements';
    const located = locateUniquePresentationPassage(body, picked);
    expect(located).not.toBeNull();
    const raw = Array.from(body).slice(located!.start, located!.end).join('');
    expect(raw).toBe('The Spiralogic Process offers a structured yet flexible way of noticing these\nmovements');
  });

  it('maps a selection across a hidden print folio without treating the folio as prose', () => {
    const body = 'within what\n\n185\n\nlarger field our experience can enter relationship.';
    const picked = 'within what larger field our experience can enter relationship.';
    const located = locateUniquePresentationPassage(body, picked);
    expect(located).not.toBeNull();
    const raw = Array.from(body).slice(located!.start, located!.end).join('');
    expect(raw).toContain('185');
    expect(raw).toContain('larger field');
  });

  it('refuses a normalized selection when it is not unique', () => {
    const body = 'one\nphrase\n\n185\n\none phrase';
    expect(locateUniquePresentationPassage(body, 'one phrase')).toBeNull();
  });

  it('marks only the changed middle when prefix and suffix are shared', () => {
    expect(changedSpan('The rhythm is gentle.', 'The rhythm is deeply gentle.')).toEqual({
      before: 'The rhythm is ', changed: 'deeply ', after: 'gentle.',
    });
  });
});
