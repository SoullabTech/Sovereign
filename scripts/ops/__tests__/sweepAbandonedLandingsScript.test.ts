/** The sweep script's gate: --apply deletes member uploads, so it is refused unless explicitly confirmed, BEFORE any database is opened. */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { CONFIRM_VALUE, exitCodeFor, parseSweepArgs } from '../sweep-abandoned-landings';

const ROOT = path.resolve(__dirname, '../../..');

describe('parseSweepArgs', () => {
  it('defaults to a dry run at the 24-hour floor', () => {
    expect(parseSweepArgs([], {})).toEqual({ ok: true, apply: false, olderThanHours: 24, limit: 50, quiet: false });
  });
  it('refuses --apply without the confirmation variable, and with a wrong one', () => {
    for (const env of [{}, { WRITER_LANDING_SWEEP_CONFIRM: '' }, { WRITER_LANDING_SWEEP_CONFIRM: 'yes' }, { WRITER_LANDING_SWEEP_CONFIRM: CONFIRM_VALUE.toUpperCase() }]) {
      const r = parseSweepArgs(['--apply'], env);
      expect(r.ok).toBe(false);
    }
  });
  it('accepts --apply with the exact confirmation', () => {
    expect(parseSweepArgs(['--apply'], { WRITER_LANDING_SWEEP_CONFIRM: CONFIRM_VALUE })).toMatchObject({ ok: true, apply: true });
  });
  it('the confirmation alone does not turn a dry run into a deletion', () => {
    expect(parseSweepArgs([], { WRITER_LANDING_SWEEP_CONFIRM: CONFIRM_VALUE })).toMatchObject({ ok: true, apply: false });
  });
  it.each([['--older-than-hours=23'], ['--older-than-hours=1'], ['--older-than-hours=abc'], ['--older-than-hours=24.5'], ['--limit=0'], ['--limit=-3'], ['--limit=x'], ['--bogus'], ['--apply=true']])(
    'refuses %s', (arg) => { expect(parseSweepArgs([arg], {}).ok).toBe(false); },
  );
  it('takes a longer age and a smaller limit', () => {
    expect(parseSweepArgs(['--older-than-hours=72', '--limit=5', '--quiet'], {})).toEqual({ ok: true, apply: false, olderThanHours: 72, limit: 5, quiet: true });
  });
});

describe('exitCodeFor', () => {
  it('is 0 only when nothing failed and no erasure is still owed', () => {
    expect(exitCodeFor({ failed: 0, erasure_pending: 0 })).toBe(0);
    expect(exitCodeFor({ failed: 1, erasure_pending: 0 })).toBe(1);
    expect(exitCodeFor({ failed: 0, erasure_pending: 1 })).toBe(1);
    expect(exitCodeFor({ failed: 2, erasure_pending: 3 })).toBe(1);
  });
});

describe('the script as a process', () => {
  const run = (args: string[], env: Record<string, string>) =>
    spawnSync(path.join(ROOT, 'node_modules/.bin/tsx'), ['scripts/ops/sweep-abandoned-landings.ts', ...args], {
      cwd: ROOT, encoding: 'utf8', timeout: 60_000,
      // No database is configured at all: a refusal must happen BEFORE a connection is attempted.
      env: { PATH: process.env.PATH ?? '', ...env },
    });

  it('--apply without confirmation exits 2 and says why, with no database configured', () => {
    const r = run(['--apply'], {});
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('requires WRITER_LANDING_SWEEP_CONFIRM');
    expect(r.stdout).toBe('');
  });
  it('an age below the floor exits 2', () => {
    const r = run(['--older-than-hours=3'], {});
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('at least 24');
  });
});
