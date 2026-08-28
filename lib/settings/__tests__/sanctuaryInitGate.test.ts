/**
 * SANCTUARY-INIT-GATE-01 — falsification suite.
 *
 * The defect this closes: when the member's default could not be established,
 * the boundary resolved to Continuity. That is a retention decision made on no
 * authority — uncertainty masquerading as certainty. `unresolved` makes the
 * uncertainty a real state, and no turn-bearing work may cross while it holds.
 *
 * The three boundaries, one predicate:
 *   TEXT ENTRY   handleTextMessage
 *   VOICE ENTRY  handleVoiceTranscript
 *   PERSISTENCE  messages effect → /api/conversation/turns
 */

import {
  ensureSessionSanctuary,
  establishSessionSanctuaryFallback,
  getSessionSanctuary,
  setSessionSanctuary,
  saveAccountSettings,
  claimDefaultMemoryModeOwnership,
  loadMemberDefaultMemoryMode,
  DEFAULT_ACCOUNT_SETTINGS,
} from '../accountSettings';
import { mayBeginTurn, decideTurnPersistence } from '../turnAdmission';

const SESSION_KEY = 'maia_settings';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  setItem(k: string, v: string) { this.store.set(k, String(v)); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

beforeEach(() => {
  const storage = new MemoryStorage();
  (globalThis as any).window = { localStorage: storage, dispatchEvent: () => true };
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

const MEMBER = 'member_x';
function signIn(id = MEMBER) {
  localStorage.setItem('beta_user', JSON.stringify({ id }));
}
/** An established, owned default — the member's real preference. */
function ownedDefault(mode: 'continuity' | 'sanctuary') {
  signIn();
  saveAccountSettings({ ...DEFAULT_ACCOUNT_SETTINGS, defaultMemoryMode: mode });
  claimDefaultMemoryModeOwnership(MEMBER);
}
function readLive() { return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}'); }

const failingServer = async () => ({ ok: false, status: 500, json: async () => ({}) } as unknown as Response);

// ── unresolved is a real state, not a value ─────────────────────────────────
describe('uncertainty is admitted rather than fabricated', () => {
  it('an unestablished default yields unresolved, NOT continuity', () => {
    signIn(); // signed in, but no owned default and no hydration
    expect(ensureSessionSanctuary('session_1')).toBe('unresolved');
  });

  it('unresolved writes nothing — no seed, no stamp', () => {
    signIn();
    ensureSessionSanctuary('session_1');
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("another member's cached default cannot resolve the boundary", () => {
    saveAccountSettings({ ...DEFAULT_ACCOUNT_SETTINGS, defaultMemoryMode: 'sanctuary' });
    claimDefaultMemoryModeOwnership('member_A');
    signIn('member_B');

    expect(ensureSessionSanctuary('session_1')).toBe('unresolved');
  });

  it('signed out yields unresolved', () => {
    expect(ensureSessionSanctuary('session_1')).toBe('unresolved');
  });

  it('no session id yields unresolved', () => {
    ownedDefault('sanctuary');
    expect(ensureSessionSanctuary('')).toBe('unresolved');
  });
});

// ── the single admission predicate ──────────────────────────────────────────
describe('one predicate, consumed by all three boundaries', () => {
  it('prohibits work while unresolved and admits it once established', () => {
    expect(mayBeginTurn('unresolved')).toBe(false);
    expect(mayBeginTurn('sanctuary')).toBe(true);
    expect(mayBeginTurn('continuity')).toBe(true);
  });
});

// ── PERSISTENCE boundary ────────────────────────────────────────────────────
describe('turn persistence is gated, not merely dispatch', () => {
  it('unresolved + a new-turn-shaped message change → no POST', () => {
    const d = decideTurnPersistence({ admitted: false, messageCount: 2, watermark: 0 });
    expect(d.post).toBe(false);
  });

  it('unresolved + a large transcript → no POST', () => {
    const d = decideTurnPersistence({ admitted: false, messageCount: 40, watermark: 0 });
    expect(d.post).toBe(false);
  });

  it('resolved Sanctuary → an admitted exchange may persist', () => {
    ownedDefault('sanctuary');
    const state = ensureSessionSanctuary('session_1');
    expect(state).toBe('sanctuary');

    const d = decideTurnPersistence({ admitted: mayBeginTurn(state), messageCount: 2, watermark: 0 });
    expect(d.post).toBe(true);
  });

  it('resolved Continuity → an admitted exchange may persist', () => {
    ownedDefault('continuity');
    const state = ensureSessionSanctuary('session_1');
    expect(state).toBe('continuity');

    const d = decideTurnPersistence({ admitted: mayBeginTurn(state), messageCount: 2, watermark: 0 });
    expect(d.post).toBe(true);
  });

  it('an admitted partial exchange still waits for its pair', () => {
    const d = decideTurnPersistence({ admitted: true, messageCount: 1, watermark: 0 });
    expect(d.post).toBe(false);
    expect(d.nextWatermark).toBe(0); // unchanged — the turn is still pending
  });
});

// ── the delayed-rewrite hazard the gate could have created ──────────────────
describe('restored history is never mistaken for a new admitted turn', () => {
  it('a transcript restored while unresolved is not re-POSTed on resolution', () => {
    // 30 restored messages arrive while the boundary is unresolved.
    const whileUnresolved = decideTurnPersistence({ admitted: false, messageCount: 30, watermark: 0 });
    expect(whileUnresolved.post).toBe(false);
    // The watermark moves past them: they are history, not pending work.
    expect(whileUnresolved.nextWatermark).toBe(30);

    // Resolution re-runs the effect over the same list. Nothing is written.
    const onResolution = decideTurnPersistence({
      admitted: true,
      messageCount: 30,
      watermark: whileUnresolved.nextWatermark,
    });
    expect(onResolution.post).toBe(false);
  });

  it('holding the watermark back instead WOULD re-POST the transcript', () => {
    // The counterfactual, asserted so the reason for advancing it is explicit.
    const naive = decideTurnPersistence({ admitted: true, messageCount: 30, watermark: 0 });
    expect(naive.post).toBe(true);
  });

  it('a genuine exchange after restoration still persists', () => {
    const restored = decideTurnPersistence({ admitted: false, messageCount: 30, watermark: 0 });
    const newTurn = decideTurnPersistence({
      admitted: true,
      messageCount: 32,
      watermark: restored.nextWatermark,
    });
    expect(newTurn.post).toBe(true);
    expect(newTurn.nextWatermark).toBe(32);
  });
});

// ── ordering: establish, THEN admit ─────────────────────────────────────────
describe('the boundary is established before work is admitted', () => {
  it('resolution failure establishes Sanctuary and only then admits', async () => {
    signIn();
    expect(ensureSessionSanctuary('session_1')).toBe('unresolved');
    expect(mayBeginTurn('unresolved')).toBe(false);

    // Authoritative resolution definitively fails.
    await loadMemberDefaultMemoryMode(MEMBER, failingServer);
    expect(ensureSessionSanctuary('session_1')).toBe('unresolved'); // still not fabricated

    const state = establishSessionSanctuaryFallback('session_1');

    expect(state).toBe('sanctuary');
    expect(getSessionSanctuary()).toBe(true);      // established FIRST
    expect(mayBeginTurn(state)).toBe(true);        // and only then admitted
    expect(readLive().sessionId).toBe('session_1');
  });

  it('failure falls closed to Sanctuary, never to Continuity', async () => {
    signIn();
    await loadMemberDefaultMemoryMode(MEMBER, failingServer);
    expect(establishSessionSanctuaryFallback('session_1')).toBe('sanctuary');
  });

  it('the fallback does not claim ownership of the member default', () => {
    signIn();
    establishSessionSanctuaryFallback('session_1');
    // The session is established; the member's PREFERENCE still is not known.
    expect(localStorage.getItem('maia_account_settings_owner')).toBeNull();
  });

  it('the fallback never overrides a boundary this session already established', () => {
    ownedDefault('continuity');
    expect(ensureSessionSanctuary('session_1')).toBe('continuity');

    expect(establishSessionSanctuaryFallback('session_1')).toBe('continuity');
    expect(getSessionSanctuary()).toBe(false);
  });

  it('a member override survives a later fallback attempt', () => {
    ownedDefault('sanctuary');
    ensureSessionSanctuary('session_1');
    setSessionSanctuary(false); // explicit End Sanctuary

    expect(establishSessionSanctuaryFallback('session_1')).toBe('continuity');
    expect(getSessionSanctuary()).toBe(false);
  });
});

// ── restored sessions must not pay an initialization cost ───────────────────
describe('a restored session incurs no initialization wait', () => {
  it('resolves from its own stamp with no owned default and no hydration', () => {
    // Session established earlier; the member default is not currently provable.
    localStorage.setItem(SESSION_KEY, JSON.stringify({ sanctuary: true, sessionId: 'session_1' }));
    signIn();

    // Immediately established — no unresolved window, no fallback needed.
    expect(ensureSessionSanctuary('session_1')).toBe('sanctuary');
  });

  it('a restored Continuity session likewise resolves immediately', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ sanctuary: false, sessionId: 'session_1' }));
    signIn();

    expect(ensureSessionSanctuary('session_1')).toBe('continuity');
  });
});

// ── hydration resolves the gate without a fallback ──────────────────────────
describe('authoritative resolution opens the gate on the real default', () => {
  it('unresolved → hydration → the member default, not the system one', async () => {
    signIn();
    expect(ensureSessionSanctuary('session_1')).toBe('unresolved');

    const server = async () => ({
      ok: true, status: 200,
      json: async () => ({ maia: { defaultMemoryMode: 'sanctuary' } }),
    } as unknown as Response);
    await loadMemberDefaultMemoryMode(MEMBER, server);

    expect(ensureSessionSanctuary('session_1')).toBe('sanctuary');
  });
});
