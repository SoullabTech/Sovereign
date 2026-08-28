/**
 * SANCTUARY-SETTINGS-DISCONNECT-01 — falsification suite.
 *
 * One live authority (`maia_settings.sanctuary`), one default
 * (`maia_account_settings.defaultMemoryMode`), and an explicit temporal
 * boundary between them carried by provenance (`maia_settings.sessionId`).
 *
 * The defect these guard: before provenance existed, the live flag was
 * unkeyed browser residue. Stale Sanctuary survived a Continuity default and
 * stale Continuity survived a Sanctuary default, in both cases forever.
 */

import {
  ensureSessionSanctuary,
  getSessionSanctuary,
  setSessionSanctuary,
  saveAccountSettings,
  DEFAULT_ACCOUNT_SETTINGS,
} from '../accountSettings';

const SESSION_KEY = 'maia_settings';
const ACCOUNT_KEY = 'maia_account_settings';

// ── Minimal localStorage + window shim (jest testEnvironment is 'node') ──────
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  setItem(k: string, v: string) { this.store.set(k, String(v)); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

let dispatched: Array<{ sanctuary?: boolean; sessionId?: string }>;

beforeEach(() => {
  const storage = new MemoryStorage();
  dispatched = [];
  (globalThis as any).window = {
    localStorage: storage,
    dispatchEvent: (e: any) => { dispatched.push(e?.detail); return true; },
  };
  (globalThis as any).localStorage = storage;
  (globalThis as any).CustomEvent = class {
    type: string; detail: any;
    constructor(type: string, init?: any) { this.type = type; this.detail = init?.detail; }
  };
});

afterEach(() => {
  delete (globalThis as any).window;
  delete (globalThis as any).localStorage;
  delete (globalThis as any).CustomEvent;
});

// ── Helpers ─────────────────────────────────────────────────────────────────
function setDefault(mode: 'continuity' | 'sanctuary') {
  saveAccountSettings({ ...DEFAULT_ACCOUNT_SETTINGS, defaultMemoryMode: mode });
  dispatched = []; // saveAccountSettings emits its own event; not under test here
}

/** Write live state directly, as residue from a previous session would look. */
function seedLiveState(sanctuary: boolean, sessionId?: string) {
  const settings: Record<string, unknown> = { sanctuary };
  if (sessionId !== undefined) settings.sessionId = sessionId;
  localStorage.setItem(SESSION_KEY, JSON.stringify(settings));
}

function readLive() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
}

// ── The two stale-state directions ──────────────────────────────────────────
describe('new session consumes the default (stale residue cannot survive)', () => {
  it('default Sanctuary + stale live Continuity + new sessionId → Sanctuary', () => {
    setDefault('sanctuary');
    seedLiveState(false, 'session_OLD');

    expect(ensureSessionSanctuary('session_NEW')).toBe(true);
    expect(readLive().sanctuary).toBe(true);
    expect(readLive().sessionId).toBe('session_NEW');
  });

  it('default Continuity + stale live Sanctuary + new sessionId → Continuity', () => {
    setDefault('continuity');
    seedLiveState(true, 'session_OLD');

    expect(ensureSessionSanctuary('session_NEW')).toBe(false);
    expect(readLive().sanctuary).toBe(false);
    expect(readLive().sessionId).toBe('session_NEW');
  });

  it('seeding announces itself so live listeners cannot hold a stale value', () => {
    setDefault('sanctuary');
    seedLiveState(false, 'session_OLD');
    ensureSessionSanctuary('session_NEW');

    expect(dispatched).toHaveLength(1);
    expect(dispatched[0]?.sanctuary).toBe(true);
  });
});

// ── Same-session reload preserves the member's override ─────────────────────
describe('same session preserves the live override', () => {
  it('override Continuity under a Sanctuary default survives reload', () => {
    setDefault('sanctuary');
    seedLiveState(false, 'session_A');

    expect(ensureSessionSanctuary('session_A')).toBe(false);
    expect(readLive().sanctuary).toBe(false);
  });

  it('override Sanctuary under a Continuity default survives reload', () => {
    setDefault('continuity');
    seedLiveState(true, 'session_A');

    expect(ensureSessionSanctuary('session_A')).toBe(true);
    expect(readLive().sanctuary).toBe(true);
  });

  it('a matching session never dispatches — no reseed, no churn', () => {
    setDefault('sanctuary');
    seedLiveState(false, 'session_A');
    ensureSessionSanctuary('session_A');

    expect(dispatched).toHaveLength(0);
  });
});

// ── Full override → reload → next-session lifecycle ─────────────────────────
describe('override lifecycle across the boundary', () => {
  it('default Sanctuary → override Continuity → reload holds → next session returns to Sanctuary', () => {
    setDefault('sanctuary');

    expect(ensureSessionSanctuary('session_1')).toBe(true);   // seeded
    setSessionSanctuary(false);                                // member overrides
    expect(ensureSessionSanctuary('session_1')).toBe(false);   // same-session reload
    expect(ensureSessionSanctuary('session_2')).toBe(true);    // next new session
  });

  it('default Continuity → override Sanctuary → reload holds → next session returns to Continuity', () => {
    setDefault('continuity');

    expect(ensureSessionSanctuary('session_1')).toBe(false);
    setSessionSanctuary(true);
    expect(ensureSessionSanctuary('session_1')).toBe(true);
    expect(ensureSessionSanctuary('session_2')).toBe(false);
  });
});

// ── Provenance is preserved by every live-state writer ──────────────────────
describe('live-state gestures change sanctuary only, never provenance', () => {
  it('Quick Settings / voice override keeps the session stamp', () => {
    setDefault('continuity');
    ensureSessionSanctuary('session_A');

    setSessionSanctuary(true); // Quick Settings toggle or voice command
    expect(readLive().sanctuary).toBe(true);
    expect(readLive().sessionId).toBe('session_A');
  });

  it('End Sanctuary clears the flag, keeps the stamp, leaves the default alone', () => {
    setDefault('sanctuary');
    ensureSessionSanctuary('session_A');

    setSessionSanctuary(false); // explicit member act
    expect(readLive().sanctuary).toBe(false);
    expect(readLive().sessionId).toBe('session_A');
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!).defaultMemoryMode).toBe('sanctuary');
  });
});

// ── A default governs the next beginning, never the present encounter ───────
describe('changing the default does not touch the session in progress', () => {
  it('default flipped mid-session leaves the live value untouched', () => {
    setDefault('continuity');
    ensureSessionSanctuary('session_A');
    expect(getSessionSanctuary()).toBe(false);

    setDefault('sanctuary'); // member changes tomorrow's default

    expect(getSessionSanctuary()).toBe(false);      // today's encounter unchanged
    expect(readLive().sessionId).toBe('session_A');
    expect(ensureSessionSanctuary('session_A')).toBe(false); // still unchanged
    expect(ensureSessionSanctuary('session_B')).toBe(true);  // next session consumes it
  });
});

// ── Idempotence and legacy state ────────────────────────────────────────────
describe('idempotence and legacy provenance', () => {
  it('repeated calls with the same id are idempotent (any surface, any order)', () => {
    setDefault('sanctuary');
    const first = ensureSessionSanctuary('session_A');
    const after = readLive();

    for (let i = 0; i < 5; i++) {
      expect(ensureSessionSanctuary('session_A')).toBe(first);
    }
    expect(readLive()).toEqual(after);
    expect(dispatched).toHaveLength(1); // only the initial seed announced
  });

  it('an override then repeated boundary calls do not re-seed it away', () => {
    setDefault('sanctuary');
    ensureSessionSanctuary('session_A');
    setSessionSanctuary(false);

    ensureSessionSanctuary('session_A');
    ensureSessionSanctuary('session_A');
    expect(readLive().sanctuary).toBe(false);
  });

  it('legacy maia_settings with no provenance is stale at the next boundary', () => {
    setDefault('continuity');
    seedLiveState(true); // pre-provenance residue: sanctuary, no sessionId

    expect(ensureSessionSanctuary('session_NEW')).toBe(false);
    expect(readLive().sessionId).toBe('session_NEW');
  });

  it('legacy residue is seeded safely in the Sanctuary direction too', () => {
    setDefault('sanctuary');
    seedLiveState(false);

    expect(ensureSessionSanctuary('session_NEW')).toBe(true);
  });

  it('absent maia_settings entirely → seeds from the default', () => {
    setDefault('sanctuary');
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();

    expect(ensureSessionSanctuary('session_NEW')).toBe(true);
    expect(readLive().sessionId).toBe('session_NEW');
  });

  it('an empty sessionId establishes nothing — reports the live value untouched', () => {
    setDefault('sanctuary');
    seedLiveState(false, 'session_OLD');

    expect(ensureSessionSanctuary('')).toBe(false);
    expect(readLive().sessionId).toBe('session_OLD'); // not stamped
    expect(dispatched).toHaveLength(0);
  });

  it('unrelated maia_settings keys survive the seed', () => {
    setDefault('sanctuary');
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      sanctuary: false,
      sessionId: 'session_OLD',
      conversationMode: 'her',
      interrupt: { enabled: true },
    }));

    ensureSessionSanctuary('session_NEW');
    const live = readLive();
    expect(live.conversationMode).toBe('her');
    expect(live.interrupt).toEqual({ enabled: true });
  });
});
