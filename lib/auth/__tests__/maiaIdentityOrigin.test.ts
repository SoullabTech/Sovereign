/**
 * DESKTOP-MAIA-IDENTITY-HYDRATION-01 — the inversion must not come back.
 *
 * `resolveMemberIdentity.test.ts` proves the RULE. This proves the rule is
 * actually what `/maia` uses, and it is a source guard on purpose: the defect
 * was never a wrong value, it was a wrong ORIGIN, and an origin is a property
 * of the file rather than of any single render.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const PAGE = path.join(__dirname, '..', '..', '..', 'app', 'maia', 'page.tsx');
const src = fs.readFileSync(PAGE, 'utf8');

/**
 * The same file with commentary removed.
 *
 * ⛔ Needed because this unit's own explanation NAMES the call it removed, and
 * a guard that cannot tell a warning from a call would be satisfied by deleting
 * the warning. Structural and ordering checks still use `src`; only the
 * "this must not appear" checks use `code`.
 */
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((l) => !/^\s*(\/\/|\*)/.test(l))
  .join('\n');

describe('/maia takes identity from the server, not from localStorage', () => {
  it('the localStorage-origin bootstrap is gone, not merely bypassed', () => {
    // ⛔ Left in place but unused, it is one call site away from returning.
    for (const dead of ['getInitialUserData', 'getValidDisplayName', 'isValidMemberId']) {
      expect(code, `${dead} is still live in app/maia/page.tsx`).not.toContain(dead);
    }
  });

  it('/maia never asks the server about an id the client supplied', () => {
    // The old call was `/api/user/profile?userId=<whatever localStorage said>`.
    // Asking "who is this id" is not the same question as "who am I".
    expect(code).not.toContain('/api/user/profile');
  });

  it('identity is resolved through the shared resolver', () => {
    expect(code).toContain("from '@/lib/auth/resolveMemberIdentity'");
    expect(code).toContain('await resolveMemberIdentity()');
  });
});

describe('the gate: nothing identity-dependent runs while identity is unknown', () => {
  it('resolving returns early, BEFORE any consumer is handed explorerId', () => {
    const gate = src.indexOf("identityState === 'resolving'");
    const firstConsumer = src.indexOf('explorerId={');
    expect(gate, 'the resolving gate is missing').toBeGreaterThan(-1);
    expect(firstConsumer).toBeGreaterThan(-1);
    expect(gate, 'a consumer receives explorerId before identity is resolved').toBeLessThan(firstConsumer);
  });

  it('the gate sits after every hook, so hook order cannot change between renders', () => {
    const gate = src.indexOf("if (identityState === 'resolving')");
    const hooks = [...src.matchAll(/\n  (?:const .*= )?use(?:State|Effect|Callback|Memo|Ref)\(/g)];
    expect(hooks.length).toBeGreaterThan(10);
    const lastHook = hooks[hooks.length - 1].index as number;
    expect(gate, 'an early return was placed above a hook').toBeGreaterThan(lastHook);
  });

  it('a failure to REACH the server is not rendered as a guest', () => {
    // ⛔ The defect one level down. `error` folded into `unauthenticated` is how
    // an authenticated member silently becomes soul_guest again.
    expect(src).toContain("identityState === 'error'");
    const errBranch = src.indexOf("if (identityState === 'error')");
    expect(errBranch).toBeGreaterThan(-1);
    expect(errBranch).toBeLessThan(src.indexOf('explorerId={'));
    // and the bootstrap bails before registering a session as anybody
    const bail = src.indexOf("resolved.state === 'error'");
    const register = src.indexOf('/api/maia/session/start');
    expect(bail).toBeGreaterThan(-1);
    expect(bail, 'a session is registered before identity is known').toBeLessThan(register);
  });

  it('an unauthenticated verdict yields no member id', () => {
    // localStorage may cache identity; it may never originate authenticated
    // identity — including by rescuing an explicit "no" from the server.
    const bootstrap = src.slice(src.indexOf('await resolveMemberIdentity()'), src.indexOf('setIdentityState(resolved.state)'));
    expect(bootstrap).toContain("{ id: 'guest', name: '' }");
    expect(bootstrap).not.toMatch(/localStorage\.getItem/);
  });
});
