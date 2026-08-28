/**
 * SANCTUARY-DEFAULT-RESOLVE-01 — resolver contract.
 *
 * The asymmetry these tests exist to hold: resolving too permissively begins a
 * session in Continuity for a member who asked for Sanctuary — retrieval and
 * persistence live, with the UI saying otherwise. That is the defect witnessed
 * in production. Resolving too conservatively only withholds memory.
 *
 * So every ambiguous case must resolve to Sanctuary, and "ambiguous" must
 * include the case that actually bites: a fresh device where the member's
 * choice exists on the server but not in this browser.
 *
 * NOT COVERED HERE, DELIBERATELY. Whether resolution happens before dispatch is
 * an ordering property this module cannot provide — a turn that dispatches
 * mid-lookup has already retrieved and persisted, and a later Sanctuary write
 * cannot retract it. That is SANCTUARY-INIT-GATE-01, and the two call-site
 * tests ported from candidate 7999bc910 (isNew-guard mutation, default-change
 * inertness) belong to it too, since nothing is wired in this unit.
 */

import {
  resolveSessionSanctuary,
  readCachedMemoryMode,
  fetchServerMemoryMode,
  applySessionSanctuary,
  resolveSessionSanctuaryForMember,
  LIVE_SESSION_SETTINGS_KEY,
} from '../sessionSanctuaryInit';
import {
  ACCOUNT_SETTINGS_STORAGE_KEY,
  DEFAULT_ACCOUNT_SETTINGS,
  getAccountSettings,
} from '../accountSettings';

const store = new Map<string, string>();
const dispatched: any[] = [];

beforeEach(() => {
  store.clear();
  dispatched.length = 0;
  (global as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  (global as any).CustomEvent = class {
    type: string; detail: any;
    constructor(t: string, i?: any) { this.type = t; this.detail = i?.detail; }
  };
  (global as any).window = {
    localStorage: (global as any).localStorage,
    dispatchEvent: (e: any) => { dispatched.push(e); return true; },
  };
});

const ok = (body: any) => async () => ({ ok: true, json: async () => body } as any);

// ═══════════════════════════════════════════════════════════════════════════
describe('resolveSessionSanctuary · the server is authoritative', () => {
  it('server Sanctuary → Sanctuary', () => {
    expect(resolveSessionSanctuary({ serverMode: 'sanctuary', cachedMode: null }))
      .toEqual({ sanctuary: true, source: 'server' });
  });

  it('server Continuity → Continuity', () => {
    expect(resolveSessionSanctuary({ serverMode: 'continuity', cachedMode: null }))
      .toEqual({ sanctuary: false, source: 'server' });
  });

  it('server beats a stale cache that disagrees, in both directions', () => {
    // The cross-device case: this browser is out of date, the account is not.
    expect(resolveSessionSanctuary({ serverMode: 'sanctuary', cachedMode: 'continuity' }).sanctuary).toBe(true);
    expect(resolveSessionSanctuary({ serverMode: 'continuity', cachedMode: 'sanctuary' }).sanctuary).toBe(false);
  });
});

describe('resolveSessionSanctuary · degraded paths fail closed', () => {
  it('no server + member-authored cache → uses the cache', () => {
    expect(resolveSessionSanctuary({ serverMode: null, cachedMode: 'sanctuary' }))
      .toEqual({ sanctuary: true, source: 'local_cache' });
    expect(resolveSessionSanctuary({ serverMode: null, cachedMode: 'continuity' }))
      .toEqual({ sanctuary: false, source: 'local_cache' });
  });

  it('nothing trustworthy → FAILS CLOSED to Sanctuary', () => {
    // The fresh-device case. Resolving Continuity here is the defect: the
    // member's standing choice lives on the server and simply is not present
    // in this browser yet.
    expect(resolveSessionSanctuary({ serverMode: null, cachedMode: null }))
      .toEqual({ sanctuary: true, source: 'fail_closed' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('readCachedMemoryMode · a synthesized default is not a member choice', () => {
  it('THE DISTINCTION: getAccountSettings() would say Continuity where this says null', () => {
    // Nothing stored. The merged read invents a member choice; the raw read
    // reports absence. On a fresh device that difference decides whether the
    // session begins protected.
    expect(getAccountSettings().defaultMemoryMode).toBe('continuity');
    expect(DEFAULT_ACCOUNT_SETTINGS.defaultMemoryMode).toBe('continuity');
    expect(readCachedMemoryMode()).toBeNull();
  });

  it('returns null when the stored object has no defaultMemoryMode', () => {
    store.set(ACCOUNT_SETTINGS_STORAGE_KEY, JSON.stringify({ archetype: 'AUTO' }));
    expect(readCachedMemoryMode()).toBeNull();
  });

  it('returns null on an unrecognized value rather than coercing it', () => {
    store.set(ACCOUNT_SETTINGS_STORAGE_KEY, JSON.stringify({ defaultMemoryMode: 'private' }));
    expect(readCachedMemoryMode()).toBeNull();
  });

  it('reads an explicitly stored mode', () => {
    store.set(ACCOUNT_SETTINGS_STORAGE_KEY, JSON.stringify({ defaultMemoryMode: 'sanctuary' }));
    expect(readCachedMemoryMode()).toBe('sanctuary');
  });

  it('survives corrupt JSON without throwing into session creation', () => {
    store.set(ACCOUNT_SETTINGS_STORAGE_KEY, '{not json');
    expect(readCachedMemoryMode()).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('fetchServerMemoryMode · silence is not Continuity', () => {
  it('reads maia.defaultMemoryMode from the settings route', async () => {
    expect(await fetchServerMemoryMode(ok({ maia: { defaultMemoryMode: 'sanctuary' } }), 'm1')).toBe('sanctuary');
  });

  it('non-ok response → null, NOT a Continuity verdict', async () => {
    const notOk = async () => ({ ok: false, json: async () => ({}) } as any);
    expect(await fetchServerMemoryMode(notOk, 'm1')).toBeNull();
  });

  it('a throw → null rather than propagating into session creation', async () => {
    const boom = async () => { throw new Error('offline'); };
    expect(await fetchServerMemoryMode(boom as any, 'm1')).toBeNull();
  });

  it('an unrecognized server value → null', async () => {
    expect(await fetchServerMemoryMode(ok({ maia: { defaultMemoryMode: 'whatever' } }), 'm1')).toBeNull();
  });

  it('encodes the memberId', async () => {
    let seen = '';
    await fetchServerMemoryMode((async (u: string) => { seen = u; return { ok: true, json: async () => ({}) }; }) as any, 'a b/c');
    expect(seen).toContain('memberId=a%20b%2Fc');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('applySessionSanctuary · owns exactly one key', () => {
  it('preserves every unrelated maia_settings field', () => {
    store.set(LIVE_SESSION_SETTINGS_KEY, JSON.stringify({ sanctuary: false, voice: { pace: 0.9 }, archetype: 'SAGE' }));
    applySessionSanctuary(true);
    const live = JSON.parse(store.get(LIVE_SESSION_SETTINGS_KEY)!);
    expect(live).toEqual({ sanctuary: true, voice: { pace: 0.9 }, archetype: 'SAGE' });
  });

  it('creates the object when absent without inventing other fields', () => {
    applySessionSanctuary(true);
    expect(JSON.parse(store.get(LIVE_SESSION_SETTINGS_KEY)!)).toEqual({ sanctuary: true });
  });

  it('writes the same key Quick Settings writes — no second authority', () => {
    expect(LIVE_SESSION_SETTINGS_KEY).toBe('maia_settings');
  });

  it('notifies a mounted conversation via maia-settings-changed', () => {
    applySessionSanctuary(true);
    const live = dispatched.filter((e) => e.type === 'maia-settings-changed');
    expect(live).toHaveLength(1);
    expect(live[0].detail.sanctuary).toBe(true);
  });

  it('does not throw on corrupt live settings', () => {
    store.set(LIVE_SESSION_SETTINGS_KEY, '{not json');
    expect(() => applySessionSanctuary(true)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('resolveSessionSanctuaryForMember · resolves, does not apply', () => {
  it('server value wins and nothing is written', async () => {
    const r = await resolveSessionSanctuaryForMember({
      memberId: 'm1', fetcher: ok({ maia: { defaultMemoryMode: 'sanctuary' } }),
    });
    expect(r).toEqual({ sanctuary: true, source: 'server' });
    // Application is the gate unit's job; resolving must have no side effect.
    expect(store.has(LIVE_SESSION_SETTINGS_KEY)).toBe(false);
    expect(dispatched).toHaveLength(0);
  });

  it('falls back to the member-authored cache when the server throws', async () => {
    store.set(ACCOUNT_SETTINGS_STORAGE_KEY, JSON.stringify({ defaultMemoryMode: 'sanctuary' }));
    const boom = async () => { throw new Error('offline'); };
    expect(await resolveSessionSanctuaryForMember({ memberId: 'm1', fetcher: boom as any }))
      .toEqual({ sanctuary: true, source: 'local_cache' });
  });

  it('fresh device, server unreachable → fail closed', async () => {
    const boom = async () => { throw new Error('offline'); };
    expect(await resolveSessionSanctuaryForMember({ memberId: 'm1', fetcher: boom as any }))
      .toEqual({ sanctuary: true, source: 'fail_closed' });
  });

  it('returns null for an unauthenticated visitor rather than guessing', async () => {
    let called = false;
    const f = (async () => { called = true; return { ok: true, json: async () => ({}) }; }) as any;
    expect(await resolveSessionSanctuaryForMember({ memberId: null, fetcher: f })).toBeNull();
    expect(called).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('unit boundary · nothing is wired', () => {
  it('no product file imports this module yet', () => {
    // SANCTUARY-DEFAULT-RESOLVE-01 is resolver infrastructure. Wiring, and the
    // dispatch ordering that makes fail-closed real, are SANCTUARY-INIT-GATE-01.
    const { execSync } = require('child_process');
    const hits = execSync(
      "grep -rl 'sessionSanctuaryInit' --include=*.ts --include=*.tsx app components hooks lib || true",
      { cwd: require('path').join(__dirname, '..', '..', '..'), encoding: 'utf8' },
    ).trim().split('\n').filter(Boolean);
    expect(hits).toEqual(['lib/settings/__tests__/sessionSanctuaryInit.test.ts']);
  });
});
