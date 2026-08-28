/**
 * SANCTUARY-MEMBER-SCOPE-01 — falsification suite.
 *
 * The proven defect: `maia_account_settings` was write-through only.
 * `updateMaiaSetting` PUT `defaultMemoryMode` to the server; nothing ever read
 * it back (GET /api/members/settings returns `maia.defaultMemoryMode`, and its
 * only consumer discarded the block). On a shared device the cached default
 * could therefore be attributed to the wrong authenticated member — and once
 * session provenance began reseeding correctly at each new session, it reseeded
 * from that wrong member's default.
 *
 * Scope: the consent-bearing field only. Voice/display settings are
 * device-local by existing design and must survive untouched.
 */

import {
  getAccountSettings,
  saveAccountSettings,
  hydrateAccountSettingsForMember,
  loadMemberDefaultMemoryMode,
  claimDefaultMemoryModeOwnership,
  ensureSessionSanctuary,
  DEFAULT_ACCOUNT_SETTINGS,
} from '../accountSettings';

const ACCOUNT_KEY = 'maia_account_settings';
const OWNER_KEY = 'maia_account_settings_owner';

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

// ── Harness: members, sign-in/out, and a stubbed server ─────────────────────
function signIn(memberId: string) {
  localStorage.setItem('beta_user', JSON.stringify({ id: memberId, name: memberId }));
}

/** Mirrors clearAuthState()'s Sanctuary-relevant removals. */
function signOut() {
  localStorage.removeItem('beta_user');
  localStorage.removeItem('maia_session_id');
  localStorage.removeItem('maia_session_date');
  localStorage.removeItem(OWNER_KEY);
}

function serverWith(defaults: Record<string, 'continuity' | 'sanctuary' | undefined>) {
  return async (url: string) => {
    const memberId = decodeURIComponent(url.split('memberId=')[1] || '');
    return {
      ok: true,
      status: 200,
      json: async () => ({ maia: { defaultMemoryMode: defaults[memberId] }, notifications: {}, privacy: {} }),
    } as unknown as Response;
  };
}

const failingServer = async () => ({ ok: false, status: 500, json: async () => ({}) } as unknown as Response);

// ── The acceptance test: the exact two-member sequence ──────────────────────
describe('two-member shared device (the proven unsafe sequence)', () => {
  it("member B's Sanctuary default is not overridden by member A's cached Continuity", async () => {
    const server = serverWith({ memberA: 'continuity', memberB: 'sanctuary' });

    // Member A signs in, hydrates, and their Continuity default is cached.
    signIn('memberA');
    await loadMemberDefaultMemoryMode('memberA', server);
    expect(getAccountSettings().defaultMemoryMode).toBe('continuity');
    expect(ensureSessionSanctuary('session_A1')).toBe('continuity');

    signOut();

    // Member B signs in. A's cached 'continuity' is still on the device.
    signIn('memberB');
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!).defaultMemoryMode).toBe('continuity');

    // Before hydration: A's value must not be served as B's choice.
    expect(getAccountSettings().defaultMemoryMode).toBe(
      DEFAULT_ACCOUNT_SETTINGS.defaultMemoryMode,
    );

    // Hydration establishes B's real default.
    await loadMemberDefaultMemoryMode('memberB', server);
    expect(getAccountSettings().defaultMemoryMode).toBe('sanctuary');

    // B's new session consumes B's default — the bug was Sanctuary starting OFF.
    expect(ensureSessionSanctuary('session_B1')).toBe('sanctuary');
  });

  it("member B's Continuity default is not overridden by member A's cached Sanctuary", async () => {
    const server = serverWith({ memberA: 'sanctuary', memberB: 'continuity' });

    signIn('memberA');
    await loadMemberDefaultMemoryMode('memberA', server);
    expect(ensureSessionSanctuary('session_A1')).toBe('sanctuary');

    signOut();
    signIn('memberB');
    await loadMemberDefaultMemoryMode('memberB', server);

    expect(getAccountSettings().defaultMemoryMode).toBe('continuity');
    expect(ensureSessionSanctuary('session_B1')).toBe('continuity');
  });
});

// ── Ownership gate ──────────────────────────────────────────────────────────
describe('ownership of the cached default', () => {
  it('an unstamped legacy cache is not proof of ownership', () => {
    saveAccountSettings({ ...DEFAULT_ACCOUNT_SETTINGS, defaultMemoryMode: 'sanctuary' });
    signIn('memberA'); // no stamp written

    expect(getAccountSettings().defaultMemoryMode).toBe('continuity');
  });

  it('a stamp for a different member is not proof of ownership', async () => {
    const server = serverWith({ memberA: 'sanctuary' });
    signIn('memberA');
    await loadMemberDefaultMemoryMode('memberA', server);
    expect(getAccountSettings().defaultMemoryMode).toBe('sanctuary');

    signIn('memberB'); // switch without sign-out; A's stamp remains
    localStorage.setItem(OWNER_KEY, 'memberA');
    expect(getAccountSettings().defaultMemoryMode).toBe('continuity');
  });

  it('signed out, no cached default is authoritative', async () => {
    const server = serverWith({ memberA: 'sanctuary' });
    signIn('memberA');
    await loadMemberDefaultMemoryMode('memberA', server);

    signOut();
    expect(getAccountSettings().defaultMemoryMode).toBe('continuity');
  });

  it('the member setting their own default claims ownership of it', () => {
    signIn('memberA');
    saveAccountSettings({ ...DEFAULT_ACCOUNT_SETTINGS, defaultMemoryMode: 'sanctuary' });
    claimDefaultMemoryModeOwnership('memberA');

    expect(getAccountSettings().defaultMemoryMode).toBe('sanctuary');
  });
});

// ── Failure modes must not promote stale cross-member data ──────────────────
describe('unresolved hydration never adopts stale data', () => {
  it('a failed fetch leaves the cache unowned, not promoted', async () => {
    saveAccountSettings({ ...DEFAULT_ACCOUNT_SETTINGS, defaultMemoryMode: 'sanctuary' });
    signIn('memberB');

    const resolved = await loadMemberDefaultMemoryMode('memberB', failingServer);

    expect(resolved).toBe('continuity');
    expect(localStorage.getItem(OWNER_KEY)).toBeNull();
    expect(getAccountSettings().defaultMemoryMode).toBe('continuity');
  });

  it('a server answer missing defaultMemoryMode leaves the cache unowned', async () => {
    saveAccountSettings({ ...DEFAULT_ACCOUNT_SETTINGS, defaultMemoryMode: 'sanctuary' });
    signIn('memberB');

    await loadMemberDefaultMemoryMode('memberB', serverWith({}));

    expect(localStorage.getItem(OWNER_KEY)).toBeNull();
    expect(getAccountSettings().defaultMemoryMode).toBe('continuity');
  });

  it('a garbage server value is rejected rather than stamped', () => {
    signIn('memberB');
    hydrateAccountSettingsForMember('memberB', 'nonsense');

    expect(localStorage.getItem(OWNER_KEY)).toBeNull();
  });
});

// ── Unrelated local settings keep their existing device-local semantics ─────
describe('scope is the consent-bearing field only', () => {
  it('voice, memory-depth and display settings survive a foreign cache', () => {
    saveAccountSettings({
      ...DEFAULT_ACCOUNT_SETTINGS,
      defaultMemoryMode: 'sanctuary',
      voice: { ...DEFAULT_ACCOUNT_SETTINGS.voice, speed: 1.4, openaiVoice: 'nova' },
      memory: { depth: 'deep' },
      display: { vocabularyTooltips: false },
      preferredAssistantName: 'Aria',
    });
    signIn('memberB'); // not the owner

    const s = getAccountSettings();
    expect(s.defaultMemoryMode).toBe('continuity'); // gated
    expect(s.voice.speed).toBe(1.4);                // untouched
    expect(s.voice.openaiVoice).toBe('nova');
    expect(s.memory.depth).toBe('deep');
    expect(s.display.vocabularyTooltips).toBe(false);
    expect(s.preferredAssistantName).toBe('Aria');
  });

  it('hydration writes the default without disturbing the rest', async () => {
    saveAccountSettings({
      ...DEFAULT_ACCOUNT_SETTINGS,
      voice: { ...DEFAULT_ACCOUNT_SETTINGS.voice, speed: 1.4 },
      preferredAssistantName: 'Aria',
    });
    signIn('memberB');
    await loadMemberDefaultMemoryMode('memberB', serverWith({ memberB: 'sanctuary' }));

    const s = getAccountSettings();
    expect(s.defaultMemoryMode).toBe('sanctuary');
    expect(s.voice.speed).toBe(1.4);
    expect(s.preferredAssistantName).toBe('Aria');
  });
});

// ── The session layer is untouched by any of this ───────────────────────────
describe('session provenance semantics are unchanged', () => {
  it('an established session is not reseeded when the member default hydrates', async () => {
    signIn('memberB');
    await loadMemberDefaultMemoryMode('memberB', serverWith({ memberB: 'continuity' }));
    expect(ensureSessionSanctuary('session_1')).toBe('continuity');

    // Default later changes (another device, or the member edits it).
    await loadMemberDefaultMemoryMode('memberB', serverWith({ memberB: 'sanctuary' }));

    // Same session — the encounter in progress keeps its boundary.
    expect(ensureSessionSanctuary('session_1')).toBe('continuity');
    // Next session consumes the new default.
    expect(ensureSessionSanctuary('session_2')).toBe('sanctuary');
  });
});
