const resolve = jest.fn(), save = jest.fn(), list = jest.fn();
jest.mock('@/lib/maia/canonical-turn', () => ({ resolveCanonicalIdentity: (...a: unknown[]) => resolve(...a) }));
jest.mock('@/lib/manuscript/editorialRuntime/craftSave', () => ({
  saveCraftVersion: (...a: unknown[]) => save(...a), savedCraftVersions: (...a: unknown[]) => list(...a),
}));
import { POST, GET } from '../route';
const id = '11111111-1111-4111-8111-111111111111';
const identity = { status: 'verified', memberId: 'owner' };
const body = { sectionId: id, range: { start: 0, end: 10 }, revisionNumber: 2,
  threadId: null, supersedes: null, replacementText: 'My words.  ', sanctuary: false };
const request = (value: unknown) => ({ json: async () => value, nextUrl: new URL('http://local/?manuscriptId=' + id) }) as never;
beforeEach(() => {
  jest.clearAllMocks(); process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  resolve.mockResolvedValue(identity); save.mockResolvedValue({ ok: true, threadId: 't', versionId: 'v' });
  list.mockResolvedValue([]);
});
it('is off by default before resolving identity', async () => {
  delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;
  expect((await POST(request(body))).status).toBe(404); expect(resolve).not.toHaveBeenCalled();
});
it('requires verified identity', async () => {
  resolve.mockResolvedValue({ status: 'unverified' });
  expect((await POST(request(body))).status).toBe(401); expect(save).not.toHaveBeenCalled();
});
it.each([{ sanctuary: true }, { sanctuary: undefined }, { author: 'member' }, { chainId: 'forged' }, { memberId: 'other' }])('rejects unauthorized fields or posture before persistence', async patch => {
  expect((await POST(request({ ...body, ...patch }))).status).toBeGreaterThanOrEqual(400); expect(save).not.toHaveBeenCalled();
});
it('forwards exact writer wording and returns only durable identities', async () => {
  const r = await POST(request(body)); expect(r.status).toBe(201);
  expect(await r.json()).toEqual({ threadId: 't', versionId: 'v' }); expect(save).toHaveBeenCalledWith(identity, body);
});
it('reports a stale predecessor as a conflict without retry', async () => {
  save.mockResolvedValue({ ok: false, reason: 'not_successor_of_head' });
  const r = await POST(request(body)); expect(r.status).toBe(409); expect(save).toHaveBeenCalledTimes(1);
  expect(await r.json()).toEqual({ error: 'not_successor_of_head', persisted: false });
});
it('does not turn storage failure into success or leak error text', async () => {
  save.mockRejectedValue(new Error('private text'));
  const r = await POST(request(body)); expect(r.status).toBe(503);
  expect(await r.json()).toEqual({ error: 'save_unconfirmed' });
});
it('lists owned saved versions and distinguishes unavailable from empty', async () => {
  expect(await (await GET(request({}))).json()).toEqual({ versions: [] });
  expect(list).toHaveBeenCalledWith(identity, id);
  list.mockRejectedValue(new Error('offline')); expect((await GET(request({}))).status).toBe(503);
});
