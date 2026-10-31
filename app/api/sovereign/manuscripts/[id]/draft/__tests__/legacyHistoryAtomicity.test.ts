/** @jest-environment node */
/** Actual handlers with an in-memory, rollback-capable fictional ledger.
 * No real PostgreSQL, member data, Source vault, or network is used.
 * This models the transaction contract; it is not live database acceptance.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/manuscript/render/renderMemberBook', () => ({ computeSourceHash: jest.fn(() => 'fiction-hash') }));

import { NextRequest } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { payloadHash } from '@/lib/manuscript/draftConcurrency';
import { PUT as save } from '../route';
import { POST as restore } from '../revisions/route';

const MEMBER = '11111111-1111-1111-1111-111111111111';
const MANUSCRIPT = '22222222-2222-2222-2222-222222222222';
const DRAFT = '33333333-3333-3333-3333-333333333333';
const OTHER = '44444444-4444-4444-4444-444444444444';
const context = { params: Promise.resolve({ id: MANUSCRIPT }) };
type Operation = 'checkpoint' | 'restore';
type Receipt = { revisionCount: number; revisionId: number; updatedAt: string; checkpointed?: boolean; restoredFrom?: number };
type State = {
  exists: boolean; memberId: string; version: number; revisionCount: number;
  sectionAddressableAt: string | null; content: string; key: string | null;
  operation: string | null; hash: string | null; receipt: Receipt | null;
  history: { revisionNumber: number; content: string }[];
};
type Entry = { sql: string; params: unknown[]; channel: 'pool' | 'tx' };
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const rows = (...values: Record<string, unknown>[]) => ({ rows: values, rowCount: values.length });
const mockQuery = query as jest.Mock;
const mockTransaction = transaction as jest.Mock;
const mockAuth = getMemberIdFromRequest as jest.Mock;
let state: State;
let ledger: Entry[];
let unexpected: string[];
let failAppend: boolean, zeroAppend: boolean, failCommit: boolean, zeroUpdate: boolean;
let commits: number, rollbacks: number;
let atTransactionStart: (() => void) | null;
let queue: Promise<void>;
let errorSpy: jest.SpyInstance;

function guard(s: State) {
  return { id: DRAFT, version: String(s.version), revision_count: s.revisionCount,
    section_addressable_at: s.sectionAddressableAt,
    last_idempotency_key: s.key, last_idempotency_op: s.operation,
    last_idempotency_payload_hash: s.hash, last_idempotency_response: clone(s.receipt) };
}
function invalid(message: string): never {
  unexpected.push(message);
  throw new Error('UNEXPECTED_FICTIONAL_QUERY: ' + message);
}
async function execute(s: State, channel: 'pool' | 'tx', sql: string, params: unknown[] = []) {
  const text = sql.trim().replace(/\s+/g, ' ');
  ledger.push({ sql: text, params: clone(params), channel });
  if (text.startsWith('SELECT') && text.includes('FROM manuscript_working_drafts')) {
    if (text.includes('FOR UPDATE')) {
      if (channel !== 'tx') invalid('legacy lock outside transaction');
      // Both existing helper shapes bind the authenticated member plus the
      // exact manuscript or draft. Neither permits an unscoped row lock.
      const manuscriptLock = text.includes('WHERE manuscript_id = $1 AND member_id = $2') && params[0] === MANUSCRIPT;
      const draftLock = text.includes('WHERE id = $1 AND member_id = $2') && params[0] === DRAFT;
      if (!manuscriptLock && !draftLock) invalid('unscoped legacy row lock');
      return s.exists && params[1] === s.memberId ? rows(guard(s)) : rows();
    }
    if (text.startsWith('SELECT version')) return rows({ version: String(s.version) });
    if (!text.includes('manuscript_id = $1 AND member_id = $2') || params[0] !== MANUSCRIPT) invalid('unscoped initial read');
    return s.exists && params[1] === s.memberId ? rows(guard(s)) : rows();
  }
  if (/^SELECT content(?:, saved_by)? FROM working_draft_revisions/.test(text)) {
    if (params[0] !== DRAFT) invalid('foreign history read');
    const found = s.history.find(h => h.revisionNumber === params[1]);
    return found ? rows({ content: found.content, saved_by: MEMBER }) : rows();
  }
  if (text.startsWith('UPDATE manuscript_working_drafts')) {
    if (zeroUpdate) return rows();
    const restoring = text.includes("last_idempotency_op = 'restore'");
    if (restoring) {
      if (params[0] !== DRAFT) invalid('foreign restore update');
      if (text.includes('member_id = $7') && params[6] !== s.memberId) return rows();
      if (params[2] !== s.version) return rows();
      s.content = params[1] as string; s.version++; s.revisionCount++;
      s.key = params[3] as string; s.operation = 'restore'; s.hash = params[4] as string;
      s.receipt = { revisionCount: s.revisionCount, revisionId: s.version, restoredFrom: params[5] as number, updatedAt: 'fiction-time' };
    } else {
      if (params[0] !== MANUSCRIPT || params[1] !== s.memberId) return rows();
      if (params[3] !== s.version) return rows();
      const checkpointOnly = text.includes("'checkpointed', true");
      const checkpointed = checkpointOnly || params[4] === true;
      s.content = params[2] as string; s.version++;
      if (checkpointed) s.revisionCount++;
      s.key = params[checkpointOnly ? 4 : 5] as string; s.operation = 'save';
      s.hash = params[checkpointOnly ? 5 : 6] as string;
      s.receipt = { revisionCount: s.revisionCount, revisionId: s.version, checkpointed, updatedAt: 'fiction-time' };
    }
    return rows({ revision_count: s.revisionCount, version: s.version, last_idempotency_response: clone(s.receipt) });
  }
  if (text.startsWith('INSERT INTO working_draft_revisions')) {
    if (params[0] !== DRAFT || params[3] !== MEMBER) invalid('foreign history insert');
    if (failAppend) throw new Error('FICTIONAL_HISTORY_APPEND_FAILURE');
    if (zeroAppend) return rows();
    if (s.history.some(h => h.revisionNumber === params[1])) throw new Error('FICTIONAL_DUPLICATE_HISTORY_NUMBER');
    s.history.push({ revisionNumber: params[1] as number, content: params[2] as string });
    return { rows: [], rowCount: 1 };
  }
  return invalid(text);
}
const writes = () => ledger.filter(e => /^(UPDATE|INSERT|DELETE)\b/.test(e.sql));
const appends = () => ledger.filter(e => e.sql.startsWith('INSERT INTO working_draft_revisions'));
const updates = () => ledger.filter(e => e.sql.startsWith('UPDATE manuscript_working_drafts'));

beforeEach(() => {
  jest.resetAllMocks();
  mockAuth.mockResolvedValue(MEMBER);
  state = { exists: true, memberId: MEMBER, version: 7, revisionCount: 2,
    sectionAddressableAt: null, content: 'FICTION current draft.\n',
    key: null, operation: null, hash: null, receipt: null,
    history: [{ revisionNumber: 1, content: 'FICTION first draft.\n' }, { revisionNumber: 2, content: 'FICTION older draft.\n' }] };
  ledger = []; unexpected = [];
  failAppend = zeroAppend = failCommit = zeroUpdate = false;
  commits = rollbacks = 0; atTransactionStart = null; queue = Promise.resolve();
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockQuery.mockImplementation((sql: string, params?: unknown[]) => execute(state, 'pool', sql, params));
  mockTransaction.mockImplementation(async (callback: (tx: { query: (sql: string, params?: unknown[]) => ReturnType<typeof execute> }) => unknown) => {
    // Serialize this fictional draft's transactions. Pool reads see only the
    // committed state, never another request's uncommitted working copy.
    const prior = queue;
    let release!: () => void;
    queue = new Promise<void>(resolve => { release = resolve; });
    await prior;
    if (atTransactionStart) { const action = atTransactionStart; atTransactionStart = null; action(); }
    const working = clone(state);
    try {
      const result = await callback({ query: (sql: string, params?: unknown[]) => execute(working, 'tx', sql, params) });
      if (failCommit) throw new Error('FICTIONAL_COMMIT_FAILURE');
      state = working; commits++;
      return result;
    } catch (error) {
      rollbacks++;
      throw error;
    } finally { release(); }
  });
});
afterEach(() => {
  errorSpy.mockRestore();
  // Do not let an unexpected mock error, swallowed by a handler's catch,
  // masquerade as a correctly refused operation.
  expect(unexpected).toEqual([]);
});
function payload(operation: Operation, overrides: Record<string, unknown> = {}) {
  const common = { baseRevisionId: 7, idempotencyKey: 'fiction-key-' + operation };
  return operation === 'checkpoint'
    ? { ...common, content: 'FICTION revised draft.\n', checkpoint: true, note: 'Fictional keep', ...overrides }
    : { ...common, revisionNumber: 2, ...overrides };
}
async function invoke(operation: Operation, overrides: Record<string, unknown> = {}) {
  const request = new NextRequest('http://fiction.invalid/api/sovereign/manuscripts/' + MANUSCRIPT + '/draft' + (operation === 'restore' ? '/revisions' : ''), {
    method: operation === 'checkpoint' ? 'PUT' : 'POST',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload(operation, overrides)),
  });
  const response = await (operation === 'checkpoint' ? save : restore)(request, context);
  return { status: response.status, body: await response.json() };
}
function seedOldPhantomReceipt(operation: Operation) {
  state.version = 8; state.revisionCount = 3;
  state.content = operation === 'checkpoint' ? 'FICTION revised draft.\n' : 'FICTION older draft.\n';
  state.key = 'fiction-key-' + operation; state.operation = operation === 'checkpoint' ? 'save' : 'restore';
  state.hash = operation === 'checkpoint'
    ? payloadHash('save', { content: state.content, checkpoint: true, note: 'Fictional keep' })
    : payloadHash('restore', { revisionNumber: 2 });
  state.receipt = { revisionCount: 3, revisionId: 8, updatedAt: 'fiction-time',
    ...(operation === 'checkpoint' ? { checkpointed: true } : { restoredFrom: 2 }) };
}

for (const operation of ['checkpoint', 'restore'] as const) {
  describe('Required durability: ' + operation, () => {
    it('history append failure must leave current draft, version, history and retry receipt unchanged', async () => {
      const original = clone(state); failAppend = true;
      const result = await invoke(operation); expect(result.status).toBe(500);
      expect(state).toEqual(original);
    });
    it('an explicit retry must not report 200 while its claimed history revision is absent', async () => {
      failAppend = true; expect((await invoke(operation)).status).toBe(500);
      failAppend = false; const result = await invoke(operation);
      const exists = state.history.some(h => h.revisionNumber === result.body.revisionCount);
      expect(result.status === 200 && !exists).toBe(false);
      expect(result.status).toBe(200);
      expect(state.history).toHaveLength(3);
    });
  });
  describe('Atomic transaction and truthful retry: ' + operation, () => {
    it('commits once and replays identical success without duplicate history', async () => {
      const first = await invoke(operation); const second = await invoke(operation);
      expect(first.status).toBe(200); expect(second).toEqual(first);
      expect(state.version).toBe(8); expect(state.history).toHaveLength(3);
      expect(state.history[2].content).toBe(state.content);
      expect(updates()).toHaveLength(1); expect(appends()).toHaveLength(1);
      expect(writes().every(e => e.channel === 'tx')).toBe(true);
      expect(mockTransaction).toHaveBeenCalledTimes(2); expect(commits).toBe(1);
      expect(ledger.filter(e => e.sql.includes('FOR UPDATE'))).toHaveLength(2);
    });
    it('commit failure cannot expose draft, history or a successful receipt', async () => {
      const original = clone(state); failCommit = true;
      expect((await invoke(operation)).status).toBe(500);
      expect(state).toEqual(original); expect(commits).toBe(0); expect(rollbacks).toBe(1);
      failCommit = false;
      expect((await invoke(operation)).status).toBe(200);
      expect(state.history).toHaveLength(3);
    });
    it('a no-op history insert rolls back instead of reporting success', async () => {
      const original = clone(state); zeroAppend = true;
      expect((await invoke(operation)).status).toBe(500);
      expect(state).toEqual(original); expect(commits).toBe(0);
    });
    it('lost acknowledgement after commit is safe to retry with the same key', async () => {
      const committed = await invoke(operation); // Deliberately not acknowledged by the fictional client.
      expect(committed.status).toBe(200);
      const result = await invoke(operation);
      expect(result).toEqual(committed); expect(updates()).toHaveLength(1); expect(appends()).toHaveLength(1);
    });
    it('concurrent identical keys converge to one committed history entry', async () => {
      const [first, second] = await Promise.all([invoke(operation), invoke(operation)]);
      expect(first.status).toBe(200); expect(second).toEqual(first);
      expect(state.version).toBe(8); expect(state.history).toHaveLength(3);
      expect(updates()).toHaveLength(1); expect(appends()).toHaveLength(1);
    });
    it('concurrent different keys with the same base cannot overwrite one another', async () => {
      const results = await Promise.all([invoke(operation), invoke(operation, { idempotencyKey: 'fiction-other-tab' })]);
      expect(results.map(r => r.status).sort()).toEqual([200, 409]);
      expect(results.find(r => r.status === 409)?.body.reason).toBe('stale_base');
      expect(state.version).toBe(8); expect(state.history).toHaveLength(3); expect(updates()).toHaveLength(1);
    });
    it('committed key reuse with different payload is refused without further writes', async () => {
      expect((await invoke(operation)).status).toBe(200);
      const result = await invoke(operation, operation === 'checkpoint' ? { content: 'FICTION different wording' } : { revisionNumber: 1 });
      expect(result.status).toBe(409); expect(result.body.reason).toBe('idempotency_key_reuse');
      expect(updates()).toHaveLength(1); expect(appends()).toHaveLength(1);
    });
    it('a new key on a stale base is refused without further writes', async () => {
      expect((await invoke(operation)).status).toBe(200);
      const result = await invoke(operation, { idempotencyKey: 'fiction-stale-new-key' });
      expect(result.status).toBe(409); expect(result.body.reason).toBe('stale_base');
      expect(updates()).toHaveLength(1); expect(appends()).toHaveLength(1);
    });
    it('absent authentication on retry is refused before additional ledger access', async () => {
      failAppend = true; expect((await invoke(operation)).status).toBe(500);
      const calls = ledger.length; mockAuth.mockResolvedValue(null);
      expect((await invoke(operation)).status).toBe(401); expect(ledger).toHaveLength(calls);
    });
    it('another member receives the existing no-existence-leak refusal', async () => {
      mockAuth.mockResolvedValue(OTHER);
      const result = await invoke(operation);
      expect(result).toEqual({ status: 404, body: { error: 'Not found' } });
      expect(writes()).toHaveLength(0); expect(mockTransaction).not.toHaveBeenCalled();
    });
    it('ownership is checked again under the lock before history is read', async () => {
      atTransactionStart = () => { state.memberId = OTHER; };
      expect((await invoke(operation)).status).toBe(404);
      expect(writes()).toHaveLength(0);
      expect(ledger.some(e => e.sql.includes('FROM working_draft_revisions'))).toBe(false);
    });
    it('a draft removed before the lock cannot be updated or replayed', async () => {
      atTransactionStart = () => { state.exists = false; };
      expect((await invoke(operation)).status).toBe(404); expect(writes()).toHaveLength(0);
    });
    it('conversion between initial read and lock refuses legacy writes and replay', async () => {
      atTransactionStart = () => { state.sectionAddressableAt = 'fiction-converted'; };
      const result = await invoke(operation);
      expect(result.status).toBe(409); expect(result.body.refusal).toBe('representation_changed');
      expect(writes()).toHaveLength(0);
      expect(ledger.some(e => e.sql.includes('FROM working_draft_revisions'))).toBe(false);
    });
    it('the version read under the lock, not the earlier snapshot, controls the write', async () => {
      atTransactionStart = () => { state.version = 9; };
      const result = await invoke(operation);
      expect(result.status).toBe(409); expect(result.body.currentRevisionId).toBe(9);
      expect(writes()).toHaveLength(0);
    });
    it('a zero-row guarded update aborts before history or receipt commit', async () => {
      const original = clone(state); zeroUpdate = true;
      expect((await invoke(operation)).status).toBe(409);
      expect(state).toEqual(original); expect(appends()).toHaveLength(0); expect(commits).toBe(0);
    });
    it('an old cached success with missing history is refused without fabricating history', async () => {
      seedOldPhantomReceipt(operation); const original = clone(state);
      const result = await invoke(operation);
      expect(result.status).toBe(409); expect(result.body.refusal).toBe(operation === 'checkpoint' ? 'checkpoint_history_unverified' : 'restore_history_unverified');
      expect(state).toEqual(original); expect(writes()).toHaveLength(0);
    });
    it('a cached success with a mismatching historical text is refused', async () => {
      seedOldPhantomReceipt(operation); state.history.push({ revisionNumber: 3, content: 'FICTION wrong text' });
      const original = clone(state); const result = await invoke(operation);
      expect(result.status).toBe(409); expect(result.body.refusal).toBe(operation === 'checkpoint' ? 'checkpoint_history_unverified' : 'restore_history_unverified');
      expect(state).toEqual(original); expect(writes()).toHaveLength(0);
    });
    it('a malformed cached success is not returned to the writer', async () => {
      seedOldPhantomReceipt(operation); state.receipt = null;
      const result = await invoke(operation);
      expect(result.status).toBe(409); expect(result.body.refusal).toBe(operation === 'checkpoint' ? 'checkpoint_history_unverified' : 'restore_history_unverified');
      expect(writes()).toHaveLength(0);
    });
  });
}

it('ordinary legacy autosave still preserves exact wording without making a history revision', async () => {
  const content = '  FICTION author’s words 🜂\r\n\n';
  const result = await invoke('checkpoint', { content, checkpoint: false });
  expect(result.status).toBe(200); expect(result.body.checkpointed).toBe(false);
  expect(state.content).toBe(content); expect(state.history).toHaveLength(2);
  expect(appends()).toHaveLength(0); expect(mockTransaction).not.toHaveBeenCalled();
});
