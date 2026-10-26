jest.mock('@/lib/db/postgres', () => ({ transaction: jest.fn(), query: jest.fn() }));
jest.mock('@/lib/storage/fileVault', () => ({ destroyVaultBytes: jest.fn() }));
jest.mock('@/lib/recovery/r20DeletionLedger', () => ({
  sealR20DeletionLedger: jest.fn(),
  r20LedgerErrorCode: jest.fn(() => 'fictional_ledger_error'),
}));

import { transaction, query } from '@/lib/db/postgres';
import { destroyVaultBytes } from '@/lib/storage/fileVault';
import { sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';
import { discardUnclaimedArrival } from '../discardUnclaimedArrival';

const tr = transaction as jest.Mock;
const q = query as jest.Mock;
const destroy = destroyVaultBytes as jest.Mock;
const seal = sealR20DeletionLedger as jest.Mock;
const a = '11111111-1111-4111-8111-111111111111';
const m = '22222222-2222-4222-8222-222222222222';
const original = 'manuscript-sources/fictional-source.docx';
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();

type Fixture = { member: string; manuscript: string | null; artifact: string | null } | null;
const configure = (initial: Fixture) => {
  let item = initial;
  const emitted: string[] = [];
  let queued: string | null = null;
  let deleted = false;
  tr.mockImplementation(async (fn: (tx: { query: (s: string, params?: unknown[]) => Promise<unknown> }) => Promise<unknown>) => {
    const tx = {
      query: async (s: string, params: unknown[] = []) => {
        const sql = normalize(s); emitted.push(sql);
        if (sql.startsWith('SELECT artifact_ref, manuscript_id')) {
          // This fake enforces both the member predicate and the row lock.
          if (!sql.includes('member_id = $2') || !sql.includes('FOR UPDATE')) {
            throw Error('missing ownership row lock');
          }
          return { rows: item && item.member === params[1]
            ? [{ artifact_ref: item.artifact, manuscript_id: item.manuscript }] : [] };
        }
        if (sql.startsWith('SELECT id FROM writer_source_landing_intents')) {
          return { rows: [{ id: '33333333-3333-4333-8333-333333333333' }] };
        }
        if (sql.startsWith('DELETE FROM manuscript_source_arrivals')) {
          if (!sql.includes('member_id = $2') || !sql.includes('manuscript_id IS NULL')) throw Error('missing unclaimed-only predicate');
          if (!item || item.member !== params[1] || item.manuscript !== null) return { rows: [] };
          item = null;deleted=true;return { rows: [{ id: a }] };
        }
        if (sql.startsWith('INSERT INTO deletion_manifests')) {
          return { rows: [{ id: '44444444-4444-4444-8444-444444444444' }] };
        }
        if (sql.startsWith('INSERT INTO provenance_tombstones')) {
          expect(params[1]).toEqual([
            'manuscript_source_arrivals',
            'writer_source_landing_intents',
          ]);
          expect(params[2]).toEqual([
            a,
            '33333333-3333-4333-8333-333333333333',
          ]);
          return { rows: [], rowCount: 2 };
        }
        if (sql.startsWith('SELECT id FROM manuscript_source_arrivals')) return { rows: [] };
        if (sql.startsWith('INSERT INTO vault_erasure_queue')) { queued = original;return { rows: [{ id: 'queue-1' }] }; }
        throw Error('unexpected SQL');
      },
    };
    return fn(tx);
  });
  q.mockImplementation(async (sql: string, params: unknown[]) => {
    if (!normalize(sql).startsWith('DELETE FROM vault_erasure_queue') || params[0] !== 'queue-1') throw Error('wrong queue acknowledgement');
    queued = null;return { rows: [], rowCount: 1 };
  });
  return { state: () => ({ item, deleted, queued, emitted }) };
};

beforeEach(() => {
  jest.clearAllMocks();
  destroy.mockResolvedValue(undefined);
  seal.mockResolvedValue({ sealed: true });
});

it('discards ONLY the authenticated owner unclaimed upload and destroys its original after commit', async () => {
  const f = configure({ member: m, manuscript: null, artifact: original });
  const outcome = await discardUnclaimedArrival(a, m);
  expect(outcome).toEqual({ kind: 'discarded', bytesDestroyed: true });
  expect(f.state().deleted).toBe(true);
  expect(f.state().queued).toBe(null);
  expect(destroy).toHaveBeenCalledWith(original);
  expect(seal).toHaveBeenCalledTimes(1);
  expect(f.state().emitted.findIndex(x => x.startsWith('INSERT INTO deletion_manifests'))).toBeGreaterThan(-1);
  expect(f.state().emitted.findIndex(x => x.startsWith('INSERT INTO provenance_tombstones'))).toBeGreaterThan(-1);
  expect(f.state().emitted.findIndex(x => x.startsWith('INSERT INTO vault_erasure_queue'))).toBeGreaterThan(-1);
});

it('refuses another member without revealing the upload', async () => {
  configure({ member: m, manuscript: null, artifact: original });
  expect(await discardUnclaimedArrival(a, 'different-member')).toEqual({ kind: 'not_found' });
  expect(destroy).not.toHaveBeenCalled();
  expect(q).not.toHaveBeenCalled();
});

it('refuses a claimed upload, including one claimed before obtaining the row lock', async () => {
  const f = configure({ member: m, manuscript: 'saved-manuscript', artifact: original });
  expect(await discardUnclaimedArrival(a, m)).toEqual({ kind: 'already_claimed' });
  expect(f.state().deleted).toBe(false);
  expect(destroy).not.toHaveBeenCalled();
});

it('does not destroy bytes or report completion when the independent R20 seal is unavailable', async () => {
  const f = configure({ member: m, manuscript: null, artifact: original });
  seal.mockRejectedValueOnce(new Error('fictional seal outage'));

  expect(await discardUnclaimedArrival(a, m)).toEqual({ kind: 'erasure_pending' });
  expect(f.state().deleted).toBe(true);
  expect(f.state().queued).toBe(original);
  expect(destroy).not.toHaveBeenCalled();
  expect(q).not.toHaveBeenCalled();
});

it('survives a filesystem failure with a durable erasure obligation', async () => {
  const f = configure({ member: m, manuscript: null, artifact: original });
  destroy.mockRejectedValue(Object.assign(new Error('unavailable'), { code: 'EACCES' }));
  expect(await discardUnclaimedArrival(a, m)).toEqual({ kind: 'erasure_pending' });
  expect(f.state().deleted).toBe(true);
  expect(f.state().queued).toBe(original);
  expect(q).not.toHaveBeenCalled();
});

it('refuses an already absent arrival without touching any bytes', async () => {
  configure(null);
  expect(await discardUnclaimedArrival(a, m)).toEqual({ kind: 'not_found' });
  expect(destroy).not.toHaveBeenCalled();
});

it('allows a pasted unclaimed arrival with no file, without inventing a vault operation', async () => {
  configure({ member: m, manuscript: null, artifact: null });
  expect(await discardUnclaimedArrival(a, m)).toEqual({ kind: 'discarded', bytesDestroyed: true });
  expect(destroy).not.toHaveBeenCalled();
  expect(q).not.toHaveBeenCalled();
});
