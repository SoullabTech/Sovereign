/**
 * JARVIS — exact existing editorial author-act/MAIA receipt acceptance.
 * All values fictional, no server, provider, database or manuscript Source.
 * An authored act is exactly the full (sometimes software-orchestrated) text
 * sent to the existing protected server. It is NOT the human-display `You`
 * literal and must never be displayed as such on its own.
 */
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
import { apiFetch } from '@/lib/http/apiBase';
import { sendBoundEditorialTurn } from '../editorialCollaboration';

const mocked = apiFetch as jest.Mock;
const id = 'fiction-owned-thread';
const section = 'fiction-section';
const relationship = 'fiction-relationship';
const submitted = 'FICTIONAL hidden orchestration\r\nAuthor typed 007 🜂  ';
const reply = 'A FICTIONAL MAIA reply';
const ordinary = { resolved: true as const, sanctuary: false };
const response = (status: number, body: unknown) => ({
  status, ok: status >= 200 && status < 300, json: async () => body,
});
const author = (body = submitted) => ({
  speaker: 'author', turnIndex: 11, body, at: '2026-10-20T12:00:00Z',
});
const maia = (body = reply, index = 12) => ({
  speaker: 'maia', turnIndex: index, body, at: '2026-10-20T12:00:01Z',
});
const thread = (turns: unknown[], threadId = id) => ({
  threadId, workId: 'fiction-manuscript', targetSectionId: section,
  locusText: 'FICTIONAL owned source passage', turns,
  versions: [], headVersionId: null, chainId: 'fiction-chain',
  sectionLabel: 'FICTIONAL section', legacyLocus: false,
});
const accepted = (data: Record<string, unknown> = {}) => ({
  threadId: id, memberTurnIndex: 11, maiaTurnIndex: 12,
  response: reply, version: null, ...data,
});
const call = () => sendBoundEditorialTurn(id, section, submitted, ordinary,
  { latitude: 1, mayRemoveParagraphs: false },
  { proposalPolicy: 'reply_only', relationshipId: relationship });
beforeEach(() => mocked.mockReset());

describe('JARVIS exact writer-act versus MAIA reply acknowledgment', () => {
  it('accepts exact committed author-orchestrated body and named MAIA readback, without a proposal', async () => {
    mocked.mockResolvedValueOnce(response(200, accepted()))
      .mockResolvedValueOnce(response(200, thread([author(), maia()])));
    const outcome = await call();
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.memberTurnIndex).toBe(11);
      expect(outcome.maiaTurnIndex).toBe(12);
      expect(outcome.producedVersionId).toBeNull();
      expect(outcome.thread.turns[0]?.body).toBe(submitted);
    }
    expect(mocked).toHaveBeenCalledTimes(2);
    const sent = JSON.parse(mocked.mock.calls[0][1].body);
    expect(sent.act.text).toBe(submitted);
    expect(sent.relationshipId).toBe(relationship);
  });

  it.each([
    ['different server-named thread', accepted({ threadId: 'fiction-foreign' }), thread([author(), maia()])],
    ['different readback thread', accepted(), thread([author(), maia()], 'fiction-foreign')],
    ['wrong authored body', accepted(), thread([author('altered text'), maia()])],
    ['wrong MAIA reply', accepted(), thread([author(), maia('foreign reply')])],
    ['different MAIA index', accepted(), thread([author(), maia(reply, 15)])],
    ['duplicate authored turn index', accepted(), thread([author(), author(), maia()])],
    ['duplicate MAIA turn index', accepted(), thread([author(), maia(), maia()])],
    ['missing author turn', accepted(), thread([maia()])],
    ['missing MAIA turn', accepted(), thread([author()])],
    ['missing member index', accepted({ memberTurnIndex: undefined }), thread([author(), maia()])],
    ['missing MAIA index', accepted({ maiaTurnIndex: undefined }), thread([author(), maia()])],
    ['out-of-order MAIA index', accepted({ maiaTurnIndex: 9 }), thread([author(), maia(reply, 9)])],
  ])('fails closed after 200 for %s', async (_label, payload, bound) => {
    mocked.mockResolvedValueOnce(response(200, payload))
      .mockResolvedValueOnce(response(200, bound));
    expect((await call()).ok).toBe(false);
    expect(mocked).toHaveBeenCalledTimes(2);
  });

  it('carries an opaque existing server recorded-member index on post-write 502, without retry', async () => {
    mocked.mockResolvedValueOnce(response(502, {
      threadId: id, memberTurnIndex: 7, dispatch: 'unknown',
      error: 'structured_refused', detail: 'provider_unavailable',
    }));
    const outcome = await call();
    expect(outcome).toMatchObject({
      ok: false, reason: 'turn_refused', memberTurnIndex: 7,
      dispatch: 'unknown',
    });
    expect(mocked).toHaveBeenCalledTimes(1);
  });

  it('never trusts foreign, absent or explicitly unpersisted index metadata', async () => {
    for (const body of [
      { threadId: 'fiction-foreign', memberTurnIndex: 7, dispatch: 'unknown', error: 'structured_refused' },
      { memberTurnIndex: 7, dispatch: 'unknown', error: 'structured_refused' },
      { threadId: id, memberTurnIndex: 7, persisted: false, dispatch: 'unknown', error: 'sanctuary_unavailable' },
    ]) {
      mocked.mockResolvedValueOnce(response(409, body));
      const result = await call();
      expect(result.ok).toBe(false);
      expect('memberTurnIndex' in result).toBe(false);
    }
    expect(mocked).toHaveBeenCalledTimes(3);
  });

  it('rejects an invented dispatch word, but retains the exact server-claimed composite act index', async () => {
    mocked.mockResolvedValueOnce(response(502, {
      threadId: id, memberTurnIndex: 61, dispatch: 'not_sent',
      error: 'structured_refused', detail: 'provider_unavailable',
    }));
    const outcome = await call();
    expect(outcome).toMatchObject({ ok: false, memberTurnIndex: 61 });
    expect('dispatch' in outcome).toBe(false);
    expect(mocked).toHaveBeenCalledTimes(1);
  });

  it('retains bounded act evidence from 200 after failed owned reread, never certifies MAIA', async () => {
    mocked.mockResolvedValueOnce(response(200, accepted({ memberTurnIndex: 51, maiaTurnIndex: 52 })))
      .mockResolvedValueOnce(response(503, { error: 'FICTIONAL REREAD UNAVAILABLE' }));
    const outcome = await call();
    expect(outcome).toMatchObject({ ok: false, memberTurnIndex: 51 });
    expect('maiaTurnIndex' in outcome).toBe(false);
    expect(mocked).toHaveBeenCalledTimes(2);
  });

  it('does not invent author evidence on a 200 with unreadable follow-up when thread is foreign', async () => {
    mocked.mockResolvedValueOnce(response(200, accepted({
      threadId: 'fiction-foreign', memberTurnIndex: 51, maiaTurnIndex: 52,
    }))).mockResolvedValueOnce(response(503, { error: 'FICTIONAL UNAVAILABLE' }));
    const outcome = await call();
    expect(outcome.ok).toBe(false);
    expect('memberTurnIndex' in outcome).toBe(false);
  });

  it('cannot invent a server act or automatically retry after an ambiguous lost response', async () => {
    mocked.mockRejectedValueOnce(new Error('FICTIONAL LOST HTTP RESPONSE'));
    const result = await call();
    expect(result).toMatchObject({ ok: false, reason: 'unavailable' });
    expect('memberTurnIndex' in result).toBe(false);
    expect(mocked).toHaveBeenCalledTimes(1);
  });
});
