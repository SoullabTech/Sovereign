const txQuery = jest.fn();
const events: string[] = [];
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
  transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
    events.push('begin');
    try { const r = await fn({ query: txQuery }); events.push('commit'); return r; }
    catch (e) { events.push('rollback'); throw e; }
  },
}));
jest.mock('../thread', () => ({ openEditorialSelectionWithExecutor: jest.fn() }));
jest.mock('../../proposalChain/store', () => ({ appendAuthoredVersionWithExecutor: jest.fn() }));
import { openEditorialSelectionWithExecutor } from '../thread';
import { appendAuthoredVersionWithExecutor } from '../../proposalChain/store';
import { saveCraftVersion, savedCraftVersions } from '../craftSave';
import { query } from '@/lib/db/postgres';
const open = openEditorialSelectionWithExecutor as jest.Mock;
const append = appendAuthoredVersionWithExecutor as jest.Mock;
const identity = { status: 'verified' as const, memberId: 'owner' };
const input = { sectionId: 'section', range: { start: 0, end: 9 }, revisionNumber: 2,
  threadId: null as string | null, supersedes: null as string | null, replacementText: '', sanctuary: false };

beforeEach(() => {
  jest.clearAllMocks(); events.length = 0;
  open.mockResolvedValue({ ok: true, threadId: 'new', chainId: 'chain' });
  append.mockResolvedValue({ outcome: 'appended', version: { id: 'v' } });
  txQuery.mockResolvedValue({ rows: [{ chain_id: 'chain', expected_text: 'Original.', text: 'Original.', heading: null, version: '2' }] });
});
it('creates a writer root atomically without a MAIA formulation', async () => {
  expect(await saveCraftVersion(identity, input)).toEqual({ ok: true, threadId: 'new', versionId: 'v' });
  expect(events).toEqual(['begin', 'commit']);
  expect(append).toHaveBeenCalledWith(expect.anything(), 'owner', 'chain', {
    author: 'member', supersedes: null, replacementText: '', rationale: 'Writer-shaped Craft version',
  });
});
it('rolls back the new chain and thread if the initial append fails', async () => {
  append.mockResolvedValue({ outcome: 'refused', reason: 'chain_corrupt' });
  expect(await saveCraftVersion(identity, input)).toEqual({ ok: false, reason: 'chain_corrupt' });
  expect(events).toEqual(['begin', 'rollback']);
});
it('refuses Sanctuary before opening or writing', async () => {
  expect((await saveCraftVersion(identity, { ...input, sanctuary: true })).ok).toBe(false);
  expect(events).toEqual([]); expect(open).not.toHaveBeenCalled(); expect(append).not.toHaveBeenCalled();
});
it('preserves the stated predecessor for existing-thread saves', async () => {
  await saveCraftVersion(identity, { ...input, threadId: 'existing', supersedes: 'chosen', replacementText: 'Mine.' });
  expect(open).not.toHaveBeenCalled();
  expect(append).toHaveBeenCalledWith(expect.anything(), 'owner', 'chain', expect.objectContaining({ supersedes: 'chosen', replacementText: 'Mine.' }));
  expect(txQuery.mock.calls[0][1]).toEqual(['existing', 'owner', 'section']);
});
it.each([
  ['thread_not_found', []],
  ['selection_stale', [{ chain_id: 'chain', expected_text: 'Original.', text: 'Original.', heading: null, version: '3' }]],
  ['selection_stale', [{ chain_id: 'chain', expected_text: 'Elsewhere', text: 'Original.', heading: null, version: '2' }]],
])('refuses %s before appending', async (reason, rows) => {
  txQuery.mockResolvedValue({ rows });
  expect(await saveCraftVersion(identity, { ...input, threadId: 'existing' })).toEqual({ ok: false, reason });
  expect(append).not.toHaveBeenCalled(); expect(events).toEqual(['begin', 'rollback']);
});
it('saved-draft discovery is owner scoped and offers every version rather than choosing a newest', async () => {
  (query as jest.Mock).mockResolvedValue({ rows: [] });
  expect(await savedCraftVersions(identity, 'work')).toEqual([]);
  const [sql, params] = (query as jest.Mock).mock.calls[0];
  expect(params).toEqual(['owner', 'work']); expect(sql).toContain("v.author = 'member'"); expect(sql).not.toContain('LIMIT');
});

it('saves choices and wording in the same transaction against verified original text', async () => {
  const kept = [{ start: 0, end: 8, text: 'Original' }];
  const result = await saveCraftVersion(identity, { ...input, replacementText: 'Original.', kept });
  expect(result.ok).toBe(true);
  expect(txQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO writer_craft_version_choices'), ['v', JSON.stringify(kept)]);
  expect(events).toEqual(['begin', 'commit']);
});
it('rolls back a saved version when metadata storage fails', async () => {
  txQuery.mockRejectedValue(new Error('storage unavailable'));
  await expect(saveCraftVersion(identity, input)).rejects.toThrow('storage unavailable');
  expect(events).toEqual(['begin', 'rollback']);
});
it('refuses to call replaced words settled', async () => {
  const result = await saveCraftVersion(identity, { ...input, replacementText: 'Different.', kept: [{ start: 0, end: 8, text: 'Original' }] });
  expect(result).toEqual({ ok: false, reason: 'settled_choices_conflict' });
  expect(append).not.toHaveBeenCalled(); expect(events).toEqual(['begin', 'rollback']);
});
