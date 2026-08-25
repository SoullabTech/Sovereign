/**
 * AUTH-01-D4B — trajectory edge containment.
 *
 * The defect this closes: the five `/api/maia/trajectory/*` handlers take member
 * identity from caller-supplied `?memberId=` / `body.memberId`, and carried NO
 * accessMatrix rule. `getAccessMode()` returns 'permissive' unless
 * ACCESS_CONTROL_MODE === 'strict' (it is UNSET in production), and permissive mode
 * ALLOWS unmapped routes — so anonymous callers reached member-scoped reads and
 * member-attributed writes.
 *
 * This suite proves the EDGE is closed. It deliberately proves nothing about whether
 * `memberId` should be identity or a service-selected subject — that is D4B-adjacent
 * and unresolved.
 *
 * ⚠️ Evidence class: this is a MATCHER-level proof against the real
 * `matchRule`/`checkAccess`. It is not a runtime 401 witness against a served app.
 */
import * as fs from 'fs';
import * as path from 'path';
import { matchRule, checkAccess, ACCESS_RULES, getAccessMode } from '@/config/accessMatrix';

const RULE_PREFIX = '/api/maia/trajectory/';
const FAMILIES = ['state', 'state-history', 'thresholds', 'focus', 'threshold'] as const;
const PATHS = FAMILIES.map((f) => `/api/maia/trajectory/${f}`);

/** Remove the D4B rule to reproduce the PRE-FIX matcher, using the real matcher. */
function withoutD4BRule<T>(fn: () => T): T {
  const i = ACCESS_RULES.findIndex((r) => r.prefix === RULE_PREFIX);
  if (i < 0) throw new Error('D4B rule not present — cannot build negative control');
  const [removed] = ACCESS_RULES.splice(i, 1);
  try {
    return fn();
  } finally {
    ACCESS_RULES.splice(i, 0, removed);
  }
}

beforeAll(() => {
  // Production has ACCESS_CONTROL_MODE UNSET. The negative control is only meaningful
  // against that mode, so pin it rather than inherit whatever CI exports.
  delete process.env.ACCESS_CONTROL_MODE;
});

describe('AUTH-01-D4B · precondition', () => {
  it('reproduces production access mode (permissive) — the condition that made this reachable', () => {
    expect(getAccessMode()).toBe('permissive');
  });
});

describe('AUTH-01-D4B · NEGATIVE CONTROL — the defect was real', () => {
  it('pre-fix, the matcher returned NO rule for these paths', () => {
    withoutD4BRule(() => {
      for (const p of PATHS) expect(matchRule(p)).toBeNull();
    });
  });

  it('pre-fix, permissive mode ALLOWED them to an unauthenticated caller', () => {
    withoutD4BRule(() => {
      for (const p of PATHS) {
        const r = checkAccess(p, 'free', [], /* isAuthenticated */ false);
        expect(r.allowed).toBe(true);
        expect(r.unmapped).toBe(true);
      }
    });
  });
});

describe('AUTH-01-D4B · the edge is now closed', () => {
  it.each(PATHS)('%s is matched by exactly the D4B rule', (p) => {
    const rule = matchRule(p);
    expect(rule).not.toBeNull();
    expect(rule!.prefix).toBe(RULE_PREFIX);
    expect(rule!.minTier).toBe('free');
    expect(rule!.public).toBeUndefined();
  });

  it.each(PATHS)('%s refuses an UNAUTHENTICATED caller before the handler', (p) => {
    const r = checkAccess(p, 'free', [], false);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('unauthenticated');
  });

  it.each(PATHS)('%s admits an AUTHENTICATED free-tier member', (p) => {
    const r = checkAccess(p, 'free', [], true);
    expect(r.allowed).toBe(true);
  });

  it('middleware turns that refusal into 401 JSON for /api/ paths (chain to the status code)', () => {
    const mw = fs.readFileSync(path.join(process.cwd(), 'middleware.ts'), 'utf8');
    expect(mw).toMatch(/case 'unauthenticated'/);
    expect(mw).toMatch(/pathname\.startsWith\('\/api\/'\)/);
    expect(mw).toMatch(/status:\s*401/);
  });

  it('an authenticated caller still reaches the handler, so the existing 400 governs a missing memberId', () => {
    // The rule must not answer for the handler. Admission is the whole contract here.
    for (const p of PATHS) expect(checkAccess(p, 'free', [], true).allowed).toBe(true);
    const src = fs.readFileSync(
      path.join(process.cwd(), 'app/api/maia/trajectory/state/route.ts'),
      'utf8'
    );
    expect(src).toMatch(/memberId required/);
    expect(src).toMatch(/status:\s*400/);
  });
});

describe('AUTH-01-D4B · the prefix does not overreach', () => {
  it('does not capture a sibling that merely starts with the same characters', () => {
    for (const p of [
      '/api/maia/trajectoryX',
      '/api/maia/trajectories/state',
      '/api/maia/trajectory-archive/state',
    ]) {
      const rule = matchRule(p);
      expect(rule?.prefix).not.toBe(RULE_PREFIX);
    }
  });

  it('the bare path without a trailing segment is not claimed by this rule', () => {
    expect(matchRule('/api/maia/trajectory')?.prefix).not.toBe(RULE_PREFIX);
  });
});

describe('AUTH-01-D4B · no collateral matcher change', () => {
  it('changes the decision for EXACTLY the five trajectory routes, across every app/api route', () => {
    const API = path.join(process.cwd(), 'app/api');
    const files: string[] = [];
    (function walk(d: string) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const q = path.join(d, e.name);
        if (e.isDirectory()) walk(q);
        else if (e.name === 'route.ts') files.push(q);
      }
    })(API);

    const toPathname = (f: string) =>
      '/api' +
      path
        .relative(API, path.dirname(f))
        .split(path.sep)
        .filter((s) => s && !(s.startsWith('(') && s.endsWith(')')))
        .map((s) => (s.startsWith('[') ? '_param_' : s))
        .reduce((acc, s) => acc + '/' + s, '');

    const pathnames = files.map(toPathname);
    expect(pathnames.length).toBeGreaterThan(900); // guard: the walk actually found the surface

    const before = withoutD4BRule(() => pathnames.map((p) => matchRule(p)?.notes ?? null));
    const after = pathnames.map((p) => matchRule(p)?.notes ?? null);

    const changed = pathnames.filter((_, i) => before[i] !== after[i]).sort();
    expect(changed).toEqual([...PATHS].sort());
  });
});
