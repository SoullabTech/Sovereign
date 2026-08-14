/**
 * Two-sided proof for raw-member-identifier log containment.
 *
 * NEGATIVE CONTROL — a fixture identifier and email cannot appear in emitted logs.
 * POSITIVE CONTROL — the event still emits, memberRef correlation survives, and the
 *                    legitimate diagnostics around it are untouched.
 *
 * A test that cannot fail proves nothing, so the negative control asserts against real
 * captured stdout, not against the helper in isolation.
 *
 * The capture helper SERIALIZES object arguments. Using String(arg) yields "[object Object]",
 * which would make every `not.toContain(FIXTURE_UUID)` assertion pass vacuously — the exact
 * failure mode these controls exist to prevent.
 */

import { execFileSync, spawnSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { memberRef } from '../memberRef';

const FIXTURE_UUID = '49ae4717-2b3a-4189-b25d-2bef95b1a45a';
const FIXTURE_EMAIL = 'fixture.member@example.test';

describe('memberRef — the derivation itself', () => {
  it('never emits the identifier or any fragment of it', () => {
    const ref = memberRef(FIXTURE_UUID);
    expect(ref).not.toContain(FIXTURE_UUID);
    // A truncated UUID is a fragment of the source, not a derivation. Guard against
    // accidentally reintroducing prefix-truncation semantics.
    expect(ref).not.toContain(FIXTURE_UUID.slice(0, 8));
    expect(ref).not.toContain(FIXTURE_UUID.split('-')[0]);
  });

  it('is stable and correlatable — the same member yields the same token', () => {
    expect(memberRef(FIXTURE_UUID)).toBe(memberRef(FIXTURE_UUID));
    expect(memberRef(FIXTURE_UUID)).not.toBe(memberRef('a-different-member'));
  });

  it('renders absent identity distinguishably rather than as undefined', () => {
    expect(memberRef(undefined)).toBe('anonymous');
    expect(memberRef(null)).toBe('anonymous');
    expect(memberRef('')).toBe('anonymous');
  });

  it('agrees with the CC-A telemetry digest scheme so a log line and a provenance record match', () => {
    // Both are sha256(id).slice(0, 12); this pins them together rather than assuming it.
    const { createHash } = require('crypto');
    const expected = createHash('sha256').update(FIXTURE_UUID).digest('hex').slice(0, 12);
    expect(memberRef(FIXTURE_UUID)).toBe(expected);
  });
});

describe('NEGATIVE CONTROL — captured stdout', () => {
  function capture(fn: () => void): string {
    const chunks: string[] = [];
    const spies = (['log', 'warn', 'error', 'info'] as const).map((m) =>
      jest.spyOn(console, m).mockImplementation((...args: unknown[]) => {
        chunks.push(
          args
            .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
            .join(' ')
        );
      })
    );
    try {
      fn();
    } finally {
      spies.forEach((s) => s.mockRestore());
    }
    return chunks.join('\n');
  }

  it('a contained log statement emits no raw identifier and no email', () => {
    const emitted = capture(() => {
      console.log('[MemoryBundle] Building for user:', memberRef(FIXTURE_UUID));
      console.warn('[MemoryGate] denied', { userId: memberRef(FIXTURE_UUID), requested: 'longterm' });
    });

    expect(emitted).not.toContain(FIXTURE_UUID);
    expect(emitted).not.toContain(FIXTURE_UUID.slice(0, 8));
    expect(emitted).not.toContain(FIXTURE_EMAIL);
  });

  it('proves the assertion can fail — an uncontained statement IS detected', () => {
    const emitted = capture(() => {
      console.log('[Uncontained] user:', FIXTURE_UUID);
    });
    // If this passed, the negative control above would be vacuous.
    expect(emitted).toContain(FIXTURE_UUID);
  });
});

describe('POSITIVE CONTROL — observability survives containment', () => {
  function capture(fn: () => void): string {
    const chunks: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      chunks.push(
          args
            .map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
            .join(' ')
        );
    });
    try {
      fn();
    } finally {
      spy.mockRestore();
    }
    return chunks.join('\n');
  }

  it('the event still emits, carries correlation, and keeps its diagnostics', () => {
    const emitted = capture(() => {
      console.log('[MemoryWriteback] success', {
        userId: memberRef(FIXTURE_UUID),
        memoryType: 'pattern',
        durationMs: 42,
        outcome: 'ok',
      });
    });

    expect(emitted).toContain('[MemoryWriteback] success'); // event class survives
    expect(emitted).toContain(memberRef(FIXTURE_UUID)); // correlation survives
    expect(emitted).toContain('pattern'); // diagnostics survive
    expect(emitted).toContain('42');
    expect(emitted).toContain('ok');
    expect(emitted).not.toContain(FIXTURE_UUID); // and the identifier does not
  });
});

describe('the mechanical guard', () => {
  const GUARD = 'scripts/guards/member-id-log-gate.ts';
  const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const BASELINE = join(ROOT, 'member-id-log-baseline.json');

  /** Run the gate; never throws, so exit code and output are both assertable. */
  function runGuard(args: string[] = []): { status: number; out: string } {
    const r = spawnSync('npx', ['--no-install', 'tsx', GUARD, ...args], {
      encoding: 'utf8',
      cwd: ROOT,
    });
    return { status: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  }

  it('passes on the contained tree, with the outstanding debt reported', () => {
    const { status, out } = runGuard();
    expect(status).toBe(0);
    expect(out).toContain('No NEW raw member identifiers reaching logging sinks');
    // The baselined debt must stay VISIBLE on every run. A silent baseline is how a
    // ratchet quietly becomes a permanent exemption.
    expect(out).toMatch(/baselined debt: \d+ pre-existing violation/);
  });

  it('scans application scope, not only the four original directories', () => {
    // Regression pin 1: `git ls-files -- 'lib/memory/**/*.ts'` silently excludes
    // `lib/memory/Foo.ts`, because git's `**/` requires an intervening directory. That
    // defect made the guard report green while blind to 23 files.
    // Regression pin 2: the original scope was 121 files across four directories. The
    // behavior-scope widening must not silently narrow back.
    const { out } = runGuard();
    const scanned = Number(/scanned (\d+) source file/.exec(out)?.[1] ?? 0);
    expect(scanned).toBeGreaterThan(1000);
  });

  describe('the ratchet', () => {
    it('FAILS on a NEW violation that is not in the baseline', () => {
      // The probe must be git-TRACKED (intent-to-add is enough) — the population is
      // enumerated from `git ls-files`, so an untracked file would be invisible and this
      // test would pass vacuously.
      const probe = join(ROOT, 'lib', 'privacy', '__ratchet_probe_new__.ts');
      const rel = 'lib/privacy/__ratchet_probe_new__.ts';
      try {
        writeFileSync(probe, 'export function probe(userId: string) {\n  console.log("[Probe]", { userId });\n}\n');
        spawnSync('git', ['add', '-N', rel], { cwd: ROOT });
        const { status, out } = runGuard();
        expect(status).toBe(1);
        expect(out).toContain('NEW violation');
        expect(out).toContain(rel);
      } finally {
        spawnSync('git', ['rm', '--cached', '-q', '--force', rel], { cwd: ROOT });
        if (existsSync(probe)) unlinkSync(probe);
      }
      // …and the tree is clean again, proving the failure came from the probe.
      expect(runGuard().status).toBe(0);
    });

    it('FAILS when a baseline entry no longer exists, so the baseline cannot rot', () => {
      const original = readFileSync(BASELINE, 'utf8');
      try {
        const doctored = JSON.parse(original);
        doctored.entries.push({
          file: 'lib/privacy/__no_such_file__.ts',
          kind: 'raw identifier emitted as a logged property',
          excerpt: 'console.log("fabricated", { userId });',
          count: 1,
          lines: [1],
        });
        writeFileSync(BASELINE, JSON.stringify(doctored, null, 2));
        const { status, out } = runGuard();
        expect(status).toBe(1);
        expect(out).toContain('no longer exist');
        expect(out).toContain('__no_such_file__');
      } finally {
        writeFileSync(BASELINE, original);
      }
      expect(runGuard().status).toBe(0);
    });

    it('REFUSES to record a baseline without the explicit --accept-current flag', () => {
      const before = readFileSync(BASELINE, 'utf8');
      const { status, out } = runGuard(['--update']);
      expect(status).toBe(1);
      expect(out).toContain('Refusing to write');
      // The governed act must be a no-op without the flag — not "writes anyway, exits 1".
      expect(readFileSync(BASELINE, 'utf8')).toBe(before);
    });

    it('is BLOCKED (exit 2), never a pass, when the baseline is unreadable', () => {
      const original = readFileSync(BASELINE, 'utf8');
      try {
        writeFileSync(BASELINE, '{ not json');
        const { status, out } = runGuard();
        expect(status).toBe(2); // NOT 0 — a control that cannot check must not report a pass
        expect(out).toContain('BLOCKED');
      } finally {
        writeFileSync(BASELINE, original);
      }
    });
  });
});
