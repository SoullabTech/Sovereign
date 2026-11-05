/**
 * eraseManuscript — the order of its refusals and its locks, over a scripted transaction (hermetic: no database).
 *
 * The PostgreSQL probes prove what the database does with these statements. This file pins the DECISIONS that must hold in the
 * ordinary jest run: which statement comes first, what the guard answers in each state, and that nothing is deleted before any
 * refusal. The fake transaction throws on any statement it was not told about, so reaching a DELETE by accident fails loudly.
 */
jest.mock('@/lib/db/postgres', () => ({ transaction: jest.fn(), query: jest.fn() }));
jest.mock('@/lib/storage/fileVault', () => ({ destroyVaultBytes: jest.fn() }));
jest.mock('@/lib/recovery/r20DeletionLedger', () => ({ sealR20DeletionLedger: jest.fn(async () => ({ sealed: true })), r20LedgerErrorCode: jest.fn(() => 'X') }));

import { transaction } from '@/lib/db/postgres';
import { eraseManuscript } from '../eraseManuscript';

const MS = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MEMBER = '11111111-1111-4111-8111-111111111111';
const W_A = 'a0000000-0000-4000-8000-00000000000a';
const W_B = 'b0000000-0000-4000-8000-00000000000b';
const W_C = 'c0000000-0000-4000-8000-00000000000c';

function script(opts: { claims: string[]; writingHeld: boolean }) {
  const seen: string[] = [];
  const tx = {
    query: jest.fn(async (sql: string) => {
      seen.push(sql);
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [] };
      if (sql.includes('ws-delete:lock-works-first')) return { rows: opts.claims.map((id) => ({ id })) };
      if (sql.includes('FROM living_work_expressions e') && sql.includes('JOIN living_works')) return { rows: opts.claims.map((id) => ({ living_work_id: id })) };
      if (sql.includes('SELECT id FROM member_manuscripts')) return { rows: opts.writingHeld ? [{ id: MS }] : [] };
      if (sql.includes('FROM manuscript_source_arrivals')) throw new Error('REACHED_PAST_THE_REFUSALS');
      throw new Error(`unexpected statement: ${sql.slice(0, 60)}`);
    }),
  };
  (transaction as jest.Mock).mockImplementation(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx));
  return { tx, seen };
}

beforeEach(() => jest.clearAllMocks());

describe('the Work rows are locked before the expression rows (the order a Work\'s removal takes them)', () => {
  it('the advisory lock, then the Work rows FOR UPDATE, then the expression rows FOR UPDATE OF e only', async () => {
    const { seen } = script({ claims: [W_A, W_B], writingHeld: true });
    await eraseManuscript(MS, MEMBER);
    expect(seen[0]).toContain('pg_advisory_xact_lock');
    expect(seen[1]).toContain('ws-delete:lock-works-first');
    expect(seen[1]).toMatch(/FROM living_works w[\s\S]*ORDER BY w\.id[\s\S]*FOR UPDATE\s*$/);
    expect(seen[2]).toContain('FOR UPDATE OF e');
    expect(seen[2]).not.toMatch(/FOR UPDATE OF e, w/);
  });
});

describe('the refusals, and that nothing is deleted before them', () => {
  it('no Work named, one holder: proceeds past the refusals', async () => {
    script({ claims: [W_A], writingHeld: true });
    await expect(eraseManuscript(MS, MEMBER)).rejects.toThrow('REACHED_PAST_THE_REFUSALS');
  });
  it('no Work named, two holders: shared-writing refusal with the count', async () => {
    const { seen } = script({ claims: [W_A, W_B], writingHeld: true });
    expect(await eraseManuscript(MS, MEMBER)).toEqual({ ok: false, refusal: 'declared_in_other_works', works: 2 });
    expect(seen.some((q) => /DELETE/.test(q))).toBe(false);
  });
  it('the named Work is a holder and the only one: proceeds', async () => {
    script({ claims: [W_A], writingHeld: true });
    await expect(eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).rejects.toThrow('REACHED_PAST_THE_REFUSALS');
  });
  it('the named Work is a holder but not the only one: still the shared-writing refusal', async () => {
    script({ claims: [W_A, W_B], writingHeld: true });
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toEqual({ ok: false, refusal: 'declared_in_other_works', works: 2 });
  });
  it('a stale card whose writing still exists: refused as stale, and no statement after the check runs', async () => {
    const { seen } = script({ claims: [W_B], writingHeld: true });
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toEqual({ ok: false, refusal: 'work_no_longer_holds_it' });
    expect(seen.every((q) => !/DELETE|manuscript_source_arrivals/.test(q))).toBe(true);
  });
  it('a stale card whose writing is ALREADY GONE: not found (done), not a scary refusal', async () => {
    script({ claims: [], writingHeld: false });
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toEqual({ ok: false, refusal: 'not_found' });
  });
  it('ORDER: with three holders and a named Work that is not one of them, the stale-card refusal wins over the shared refusal', async () => {
    script({ claims: [W_B, W_C], writingHeld: true });
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toEqual({ ok: false, refusal: 'work_no_longer_holds_it' });
  });
});
