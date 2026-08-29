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
    for (const dead of ['getInitialUserData', 'getValidDisplayName', 'isValidMemberId',
                        // ⛔ Added by the integration correction: this one ran
                        // BEFORE identity resolution and could redirect to
                        // /signin on localStorage alone.
                        'checkAndMigrateSession']) {
      expect(code, `${dead} is still live in app/maia/page.tsx`).not.toContain(dead);
    }
  });

  it('/maia never asks the server about an id the client supplied', () => {
    // The old call was `/api/user/profile?userId=<whatever localStorage said>`.
    // Asking "who is this id" is not the same question as "who am I".
    expect(code).not.toContain('/api/user/profile');
  });

  it('identity is resolved through the shared resolver', () => {
    expect(code).toContain("from '@/lib/auth/maiaArrival'");
    expect(code).toContain('await decideMaiaArrival()');
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

  it('NOTHING reads localStorage or routes before the arrival decision', () => {
    // ⛔ THE GUARD THAT WAS MISSING. The first cut had the right resolver and
    // the wrong order: checkAndMigrateSession() ran first and could redirect to
    // /signin from localStorage alone, so a valid cookie with an empty store
    // never reached the server at all. Order is the defect, so order is what
    // this asserts.
    const fn = code.slice(code.indexOf('const initializeUser = async ()'));
    const decision = fn.indexOf('await decideMaiaArrival()');
    expect(decision, 'the arrival decision is missing from initializeUser').toBeGreaterThan(-1);

    const before = fn.slice(0, decision);
    expect(before, 'localStorage is consulted before identity is resolved').not.toContain('localStorage');
    expect(before, 'the member can be routed away before the server is asked').not.toContain('router.replace');
  });

  it('a failure to REACH the server is not rendered as a guest', () => {
    // ⛔ The defect one level down. `error` folded into `unauthenticated` is how
    // an authenticated member silently becomes soul_guest again.
    expect(src).toContain("identityState === 'error'");
    const errBranch = src.indexOf("if (identityState === 'error')");
    expect(errBranch).toBeGreaterThan(-1);
    expect(errBranch).toBeLessThan(src.indexOf('explorerId={'));
    // and the bootstrap bails before registering a session as anybody
    const bail = src.indexOf("decision.kind === 'identity-error'");
    const register = src.indexOf('/api/maia/session/start');
    expect(bail).toBeGreaterThan(-1);
    expect(bail, 'a session is registered before identity is known').toBeLessThan(register);
  });

  it('an unauthenticated verdict yields no member id', () => {
    // localStorage may cache identity; it may never originate authenticated
    // identity — including by rescuing an explicit "no" from the server.
    const bootstrap = src.slice(src.indexOf('await decideMaiaArrival()'), src.indexOf('setIdentityState(decision.kind'));
    expect(bootstrap).toContain("{ id: 'guest', name: '' }");
    expect(bootstrap).not.toMatch(/localStorage\.getItem/);
  });
});

/**
 * ⛔ THE RULING'S OWN CONDITION.
 *
 * The `soul_guest` attribution holds "provided no independent guest path
 * remains". It does not, yet. `generateGreeting({ userId })` builds
 * `soul_${userId}` and fetches `/api/relationship-essence?soulSignature=…`, and
 * it is reached from whatever mounted `OracleConversation` — so any surface that
 * still originates identity from localStorage can produce `soul_guest` for an
 * authenticated member, whatever `/maia` now does.
 *
 * This guard enumerates every mount and requires each to be either repaired or
 * EXPLICITLY named as awaiting a ruling. It does not pretend the named ones are
 * fine. What it prevents is a NEW surface joining that list in silence.
 */
describe('every surface that mounts the conversation is accounted for', () => {
  /** Repaired: identity comes from the server before the conversation mounts. */
  const RESOLVED = ['app/maia/page.tsx'];

  /**
   * Reads a member id from localStorage and hands it straight to
   * OracleConversation. Same inversion as /maia had. NOT repaired — the ruling
   * covered /maia, and these are separate surfaces that deserve separate
   * rulings rather than being swept into one fix.
   */
  const AWAITING_RULING = [
    // `getFieldUserData()` — a verbatim copy of the old /maia bootstrap, whose
    // own comment says "mirrors /maia logic, no API call on mount".
    'app/field/talk/page.tsx',
    // Falls back to localStorage explorerId when beta_user is absent.
    'app/studio/maia/page.tsx',
  ];

  /** Resolves through getValidMemberId() rather than a bespoke read. */
  const VIA_SHARED_HELPER = ['components/maia/presence/MaiaPresence.tsx'];

  it('no surface mounts the conversation outside these three lists', () => {
    const root = path.join(__dirname, '..', '..', '..');
    const known = new Set([...RESOLVED, ...AWAITING_RULING, ...VIA_SHARED_HELPER]);
    const found: string[] = [];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        if (!entry.name.endsWith('.tsx')) continue;
        const text = fs.readFileSync(full, 'utf8');
        if (!text.includes('<OracleConversation')) continue;
        const rel = path.relative(root, full);
        if (rel === 'components/OracleConversation.tsx') continue;  // its own definition
        found.push(rel);
      }
    };
    for (const top of ['app', 'components']) walk(path.join(root, top));

    const unaccounted = found.filter((f) => !known.has(f));
    expect(unaccounted, 'a new surface mounts the conversation and no one classified its identity origin').toEqual([]);
  });

  it('the repaired surface really is repaired', () => {
    expect(code).toContain('await decideMaiaArrival()');
  });
});
