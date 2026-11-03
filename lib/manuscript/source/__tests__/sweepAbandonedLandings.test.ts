/**
 * The abandoned-upload retention sweep (founder-approved 2026-11-03): options, dry-run guarantee, authority, and failure handling.
 * The behaviour against a real database (what is removed, what is NOT) is pinned by the PostgreSQL probes S7a-S7d.
 */
const MEMBER_1 = '11111111-1111-4111-8111-111111111111';
const MEMBER_2 = '22222222-2222-4222-8222-222222222222';
const SECRET_NAME = 'WSICANARYSWEEP0123456789ABCDEF';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('../discardIncompleteLanding', () => ({ discardIncompleteLanding: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { discardIncompleteLanding } from '../discardIncompleteLanding';
import {
  SweepConfigError,
  SWEEP_DEFAULT_LIMIT,
  SWEEP_MAX_LIMIT,
  SWEEP_MIN_AGE_HOURS,
  sweepAbandonedLandings,
  validateSweepOptions,
} from '../sweepAbandonedLandings';

const q = query as jest.Mock;
const discard = discardIncompleteLanding as jest.Mock;
const rows = [
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', member_id: MEMBER_1, state: 'WRITING_BYTES', age_hours: '50.4' },
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', member_id: MEMBER_2, state: 'PENDING_BYTES', age_hours: 30 },
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', member_id: MEMBER_1, state: 'WRITING_BYTES', age_hours: '26.9' },
];
let errors: string[];

beforeEach(() => {
  jest.clearAllMocks();
  q.mockResolvedValue({ rows });
  discard.mockResolvedValue({ kind: 'discarded', bytesDestroyed: true });
  errors = [];
  jest.spyOn(console, 'error').mockImplementation((...a: unknown[]) => { errors.push(JSON.stringify(a)); });
});
afterEach(() => jest.restoreAllMocks());

describe('options', () => {
  it('defaults to the documented floor and limit', () => {
    expect(validateSweepOptions({})).toEqual({ olderThanHours: SWEEP_MIN_AGE_HOURS, limit: SWEEP_DEFAULT_LIMIT });
    expect(SWEEP_MIN_AGE_HOURS).toBe(24);
  });
  it.each([[23], [1], [0], [-24]])('refuses an age below the floor (%p) so a caller bug cannot sweep recent uploads', (h) => {
    expect(() => validateSweepOptions({ olderThanHours: h })).toThrow(expect.objectContaining({ code: 'sweep_age_below_floor' }));
  });
  it.each([[24.5], ['24'], [NaN], [Infinity], [null]])('refuses a non-integer age (%p)', (h) => {
    expect(() => validateSweepOptions({ olderThanHours: h as never })).toThrow(expect.objectContaining({ code: 'sweep_age_invalid' }));
  });
  it.each([[0], [-1], [1.5], [SWEEP_MAX_LIMIT + 1], ['5'], [NaN]])('refuses a bad limit (%p)', (l) => {
    expect(() => validateSweepOptions({ limit: l as never })).toThrow(expect.objectContaining({ code: 'sweep_limit_invalid' }));
  });
  it('accepts the boundaries', () => {
    expect(validateSweepOptions({ olderThanHours: 24, limit: 1 })).toEqual({ olderThanHours: 24, limit: 1 });
    expect(validateSweepOptions({ olderThanHours: 24 * 30, limit: SWEEP_MAX_LIMIT }).limit).toBe(SWEEP_MAX_LIMIT);
  });
  it('enforces the floor in the LIBRARY: a below-floor call fails before any query is made', async () => {
    await expect(sweepAbandonedLandings({ apply: true, olderThanHours: 1 })).rejects.toBeInstanceOf(SweepConfigError);
    expect(q).not.toHaveBeenCalled();
    expect(discard).not.toHaveBeenCalled();
  });
});

describe('the selection', () => {
  it('asks only for non-recorded intents that are old enough and whose lease has lapsed, oldest first, bounded', async () => {
    await sweepAbandonedLandings({});
    const [sql, params] = q.mock.calls[0]!;
    expect(sql).toContain("state <> 'ARRIVAL_RECORDED'");       // a recorded arrival is never selected
    expect(sql).toMatch(/created_at < clock_timestamp\(\) - make_interval\(hours => \$1::int\)/);
    expect(sql).toMatch(/lease_expires_at IS NULL OR lease_expires_at <= clock_timestamp\(\)/); // a live write lease is never selected
    expect(sql).toMatch(/ORDER BY created_at, id\s+LIMIT \$2/);
    expect(params).toEqual([24, 50]);
  });
});

describe('dry run (the default)', () => {
  it('lists what WOULD be removed and deletes nothing', async () => {
    const r = await sweepAbandonedLandings({});
    expect(r.mode).toBe('dry_run');
    expect(discard).not.toHaveBeenCalled();
    expect(r.considered).toBe(3);
    expect(r.byState).toEqual({ WRITING_BYTES: 2, PENDING_BYTES: 1 });
    expect(r.oldestAgeHours).toBe(50);
    expect(r.outcomes).toEqual({ discarded: 0, in_progress: 0, already_recorded: 0, not_found: 0, erasure_pending: 0, failed: 0 });
  });
  it('never exposes a raw member id: members are pseudonymous references', async () => {
    const r = await sweepAbandonedLandings({});
    const text = JSON.stringify(r);
    expect(text).not.toContain(MEMBER_1);
    expect(text).not.toContain(MEMBER_2);
    expect(r.candidates.every((c) => /\S/.test(c.memberRef))).toBe(true);
  });
  it('apply must be exactly true: truthy values and omission both stay a dry run', async () => {
    for (const apply of [undefined, 1 as never, 'true' as never, {} as never]) {
      discard.mockClear();
      const r = await sweepAbandonedLandings({ apply });
      expect(r.mode).toBe('dry_run');
      expect(discard).not.toHaveBeenCalled();
    }
  });
});

describe('apply', () => {
  it('removes each candidate with the RETENTION SWEEP authority, never recorded as a member request', async () => {
    const r = await sweepAbandonedLandings({ apply: true });
    expect(r.mode).toBe('applied');
    expect(discard).toHaveBeenCalledTimes(3);
    for (const [i, call] of discard.mock.calls.entries()) {
      expect(call[0]).toBe(rows[i]!.id);
      expect(call[1]).toBe(rows[i]!.member_id);
      expect(call[2]).toEqual({ authority: 'retention_sweep' });
    }
    expect(r.outcomes.discarded).toBe(3);
  });
  it('counts every outcome kind and does not treat a refusal as a removal', async () => {
    discard.mockResolvedValueOnce({ kind: 'in_progress' }).mockResolvedValueOnce({ kind: 'already_recorded' }).mockResolvedValueOnce({ kind: 'erasure_pending' });
    const r = await sweepAbandonedLandings({ apply: true });
    expect(r.outcomes).toEqual({ discarded: 0, in_progress: 1, already_recorded: 1, not_found: 0, erasure_pending: 1, failed: 0 });
  });
  it('one failure never stops the pass, and the log carries the error NAME but never its message', async () => {
    discard.mockRejectedValueOnce(Object.assign(new Error(`SQL text with ${SECRET_NAME}`), { name: 'FictionalDbFault' }));
    const r = await sweepAbandonedLandings({ apply: true });
    expect(r.outcomes.failed).toBe(1);
    expect(r.outcomes.discarded).toBe(2);
    expect(discard).toHaveBeenCalledTimes(3);
    const all = errors.join('\n');
    expect(all).toContain('FictionalDbFault');
    expect(all).not.toContain(SECRET_NAME);
  });
  it('with nothing to remove it removes nothing', async () => {
    q.mockResolvedValue({ rows: [] });
    const r = await sweepAbandonedLandings({ apply: true });
    expect(r.considered).toBe(0);
    expect(r.oldestAgeHours).toBeNull();
    expect(discard).not.toHaveBeenCalled();
  });
});
