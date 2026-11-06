/** R2 "MAIA opens" — the client door. Fictional values; no server, provider or database. */
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
import { apiFetch } from '@/lib/http/apiBase';
import { openEditorialConversation } from '../editorialCollaboration';

const mocked = apiFetch as jest.Mock;
const id = 'th-open'; const section = 'sec'; const rel = 'rel';
const ordinary = { resolved: true as const, sanctuary: false };
const response = (status: number, body: unknown) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
const maia = (body = 'I notice X. What are you after?', index = 0) => ({ speaker: 'maia', turnIndex: index, body, at: '2026-11-05T10:00:00Z' });
const author = () => ({ speaker: 'author', turnIndex: 0, body: 'Let’s look at this passage', at: '2026-11-05T10:00:00Z' });
const thread = (turns: unknown[], threadId = id) => ({
  threadId, workId: 'ms', targetSectionId: section, locusText: 'A passage.', turns,
  versions: [], headVersionId: null, chainId: 'c', sectionLabel: null, legacyLocus: false,
});
const accepted = (extra: Record<string, unknown> = {}) => ({ threadId: id, opening: true, memberTurnIndex: null, maiaTurnIndex: 0, response: 'I notice X. What are you after?', version: null, ...extra });
beforeEach(() => mocked.mockReset());

describe('openEditorialConversation', () => {
  it('sends the typed opening request (no act, no words) and matches the MAIA turn by index only', async () => {
    mocked.mockResolvedValueOnce(response(200, accepted())).mockResolvedValueOnce(response(200, thread([maia()])));
    const out = await openEditorialConversation(id, section, ordinary, rel, { scope: { latitude: 1, mayRemoveParagraphs: false } });
    expect(out.ok).toBe(true);
    const sent = JSON.parse(mocked.mock.calls[0][1].body);
    expect(sent).toMatchObject({ threadId: id, opening: true, sanctuary: false, relationshipId: rel });
    expect(sent.act).toBeUndefined();
    expect(sent.passageAct).toBeUndefined();
  });

  it('never calls the server under Sanctuary or with unresolved posture or no relationship', async () => {
    expect(await openEditorialConversation(id, section, { resolved: true, sanctuary: true }, rel)).toMatchObject({ ok: false, reason: 'sanctuary_unavailable' });
    expect(await openEditorialConversation(id, section, { resolved: false } as never, rel)).toMatchObject({ ok: false, reason: 'posture_unresolved' });
    expect(await openEditorialConversation(id, section, ordinary, '')).toMatchObject({ ok: false });
    expect(mocked).not.toHaveBeenCalled();
  });

  it.each([
    ['a stored writer turn appears (a fixed "Let’s look" author turn)', accepted(), thread([author(), maia('I notice X. What are you after?', 1)])],
    ['a writer turn stored after the exact MAIA opening', accepted(), thread([maia(), { ...author(), turnIndex: 1 }])],
    ['wrong MAIA body', accepted(), thread([maia('someone else')])],
    ['different server thread', accepted({ threadId: 'foreign' }), thread([maia()])],
    ['different readback thread', accepted(), thread([maia()], 'foreign')],
    ['no maiaTurnIndex', accepted({ maiaTurnIndex: undefined }), thread([maia()])],
    ['duplicate MAIA index', accepted(), thread([maia(), maia()])],
  ])('refuses to acknowledge: %s', async (_n, body, reread) => {
    mocked.mockResolvedValueOnce(response(200, body)).mockResolvedValueOnce(response(200, reread));
    expect(await openEditorialConversation(id, section, ordinary, rel)).toMatchObject({ ok: false, reason: 'unreadable' });
  });

  it('a 409 for an existing conversation is a refusal, not an opening', async () => {
    mocked.mockResolvedValueOnce(response(409, { error: 'opening_thread_not_new', persisted: false }));
    expect(await openEditorialConversation(id, section, ordinary, rel)).toMatchObject({ ok: false, reason: 'turn_refused', detail: 'opening_thread_not_new' });
  });
});

describe('the writer’s length choice travels with the request', () => {
  const store = new Map<string, string>();
  beforeAll(() => {
    (globalThis as any).window = { localStorage: {
      getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); } } };
  });
  afterAll(() => { delete (globalThis as any).window; });
  afterEach(() => store.clear());
  it('is absent until the writer chooses, then sent as the closed value', async () => {
    mocked.mockResolvedValue(response(200, accepted()));
    mocked.mockResolvedValueOnce(response(200, accepted())).mockResolvedValueOnce(response(200, thread([maia()])));
    await openEditorialConversation(id, section, ordinary, rel);
    expect(JSON.parse(mocked.mock.calls[0][1].body).replyLength).toBeUndefined();
    window.localStorage.setItem('ws.replyLength', 'shorter');
    mocked.mockClear();
    mocked.mockResolvedValueOnce(response(200, accepted())).mockResolvedValueOnce(response(200, thread([maia()], 'th-2')));
    await openEditorialConversation('th-2', section, ordinary, rel);
    expect(JSON.parse(mocked.mock.calls[0][1].body).replyLength).toBe('shorter');
  });
});
