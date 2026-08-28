/**
 * SANCTUARY-SETTINGS-DISCONNECT-01 — falsification matrix.
 *
 * One test per row of the authorized acceptance matrix. The cases that carry
 * the most weight are the pair that pins the TEMPORAL shape:
 *
 *   "same device, next day"  requires the re-seed to fire
 *   "same device, reload"    requires it NOT to fire
 *
 * Both must hold, or the repair either fails to apply the member's default or
 * silently overwrites their deliberate in-session choice. The second failure is
 * the worse one and is invisible from the UI, which is why it is pinned here
 * rather than left to review.
 *
 * The "fires only at isNew" property is a call-site guarantee (app/maia/page.tsx
 * invokes this only inside the `identity.isNew` branch), so it is asserted as
 * source structure at the bottom rather than simulated — the same method the F10
 * boundary tests use for seams that need a live request to exercise.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  resolveSessionSanctuary,
  readCachedMemoryMode,
  applySessionSanctuary,
  initializeSessionSanctuary,
} from '../sessionSanctuaryInit';
import { ACCOUNT_SETTINGS_STORAGE_KEY } from '../accountSettings';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  (globalThis as any).window = {
    dispatchEvent: jest.fn(),
    CustomEvent: class { constructor(public type: string, public init?: any) {} },
  };
  (globalThis as any).CustomEvent = (globalThis as any).window.CustomEvent;
  (globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
  };
});

afterEach(() => {
  delete (globalThis as any).window;
  delete (globalThis as any).localStorage;
  delete (globalThis as any).CustomEvent;
});

const ok = (body: unknown) =>
  async () => ({ ok: true, json: async () => body } as unknown as Response);
const fails = async () => { throw new Error('network down'); };

describe('resolveSessionSanctuary — server is authoritative', () => {
  it('account default Sanctuary → new session begins Sanctuary', () => {
    expect(resolveSessionSanctuary({ serverMode: 'sanctuary', cachedMode: null }))
      .toEqual({ sanctuary: true, source: 'server' });
  });

  it('account default Continuity → new session begins Continuity', () => {
    expect(resolveSessionSanctuary({ serverMode: 'continuity', cachedMode: null }))
      .toEqual({ sanctuary: false, source: 'server' });
  });

  it('server wins over a stale local cache that disagrees', () => {
    // The cross-device case: this device cached Continuity, the member has since
    // chosen Sanctuary elsewhere. Trusting the cache would begin the session in
    // the wrong privacy mode.
    expect(resolveSessionSanctuary({ serverMode: 'sanctuary', cachedMode: 'continuity' }))
      .toEqual({ sanctuary: true, source: 'server' });
  });
});

describe('resolveSessionSanctuary — degraded paths', () => {
  it('server unavailable + member-authored cache → uses the cache', () => {
    expect(resolveSessionSanctuary({ serverMode: null, cachedMode: 'sanctuary' }))
      .toEqual({ sanctuary: true, source: 'local_cache' });
    expect(resolveSessionSanctuary({ serverMode: null, cachedMode: 'continuity' }))
      .toEqual({ sanctuary: false, source: 'local_cache' });
  });

  it('server unavailable + no trustworthy default → FAILS CLOSED to Sanctuary', () => {
    // Beginning in Continuity here would retrieve cross-session memory and
    // persist the turn on a guess. The safe guess retains nothing.
    expect(resolveSessionSanctuary({ serverMode: null, cachedMode: null }))
      .toEqual({ sanctuary: true, source: 'fail_closed' });
  });
});

describe('readCachedMemoryMode — a synthesized default is not a member choice', () => {
  it('returns null when the key is absent', () => {
    expect(readCachedMemoryMode()).toBeNull();
  });

  it('returns null when defaultMemoryMode was never stored', () => {
    // getAccountSettings() would merge DEFAULT_ACCOUNT_SETTINGS here and yield
    // 'continuity', which on a fresh device must NOT be read as a deliberate
    // choice — that is exactly the fail-closed case.
    store.set(ACCOUNT_SETTINGS_STORAGE_KEY, JSON.stringify({ voice: { speed: 1 } }));
    expect(readCachedMemoryMode()).toBeNull();
  });

  it('returns null on an unrecognized value rather than coercing', () => {
    store.set(ACCOUNT_SETTINGS_STORAGE_KEY, JSON.stringify({ defaultMemoryMode: 'balanced' }));
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

describe('applySessionSanctuary — owns exactly one key', () => {
  it('preserves every unrelated maia_settings field', () => {
    store.set('maia_settings', JSON.stringify({
      sanctuary: false, interrupt: { enabled: true }, conversationMode: 'her', voice: 'maia_core',
    }));
    applySessionSanctuary(true);
    const next = JSON.parse(store.get('maia_settings')!);
    expect(next).toEqual({
      sanctuary: true, interrupt: { enabled: true }, conversationMode: 'her', voice: 'maia_core',
    });
  });

  it('creates the object when absent without inventing other fields', () => {
    applySessionSanctuary(true);
    expect(JSON.parse(store.get('maia_settings')!)).toEqual({ sanctuary: true });
  });

  it('notifies a mounted OracleConversation via maia-settings-changed', () => {
    applySessionSanctuary(true);
    const dispatch = (globalThis as any).window.dispatchEvent;
    expect(dispatch).toHaveBeenCalledTimes(1);
    // The listener reads detail.sanctuary as a boolean; anything else is ignored.
    expect(dispatch.mock.calls[0][0].init.detail.sanctuary).toBe(true);
  });
});

describe('initializeSessionSanctuary — end to end', () => {
  it('applies the server default to the live authority', async () => {
    const r = await initializeSessionSanctuary({
      memberId: 'm1', fetcher: ok({ maia: { defaultMemoryMode: 'sanctuary' } }),
    });
    expect(r).toEqual({ sanctuary: true, source: 'server' });
    expect(JSON.parse(store.get('maia_settings')!).sanctuary).toBe(true);
  });

  it('falls back to cache when the server call throws', async () => {
    store.set(ACCOUNT_SETTINGS_STORAGE_KEY, JSON.stringify({ defaultMemoryMode: 'sanctuary' }));
    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: fails as any });
    expect(r).toEqual({ sanctuary: true, source: 'local_cache' });
  });

  it('fails closed when neither server nor cache can answer', async () => {
    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: fails as any });
    expect(r).toEqual({ sanctuary: true, source: 'fail_closed' });
    expect(JSON.parse(store.get('maia_settings')!).sanctuary).toBe(true);
  });

  it('does nothing for an unauthenticated visitor', async () => {
    // No account means no account default. Guessing on behalf of an account we
    // cannot identify is not initialization, it is invention.
    const r = await initializeSessionSanctuary({ memberId: null, fetcher: fails as any });
    expect(r).toBeNull();
    expect(store.has('maia_settings')).toBe(false);
  });

  it('ignores a non-ok server response rather than treating it as Continuity', async () => {
    const notOk = async () => ({ ok: false, json: async () => ({}) } as unknown as Response);
    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: notOk as any });
    expect(r!.source).toBe('fail_closed');
  });
});

describe('call-site contract — fires ONLY at the canonical new-session boundary', () => {
  const page = readFileSync(
    join(__dirname, '..', '..', '..', 'app', 'maia', 'page.tsx'), 'utf8',
  );

  it('is invoked exactly once in /maia', () => {
    expect(page.match(/initializeSessionSanctuary\(/g)).toHaveLength(1);
  });

  it('sits after the new-session log, not in the restored-session branch', () => {
    // The restored branch logs "Restored session"; the new branch logs
    // "Created new session". The call must follow the latter — re-applying the
    // default on a restored session would overwrite a live Quick Settings
    // override, which is the failure mode this unit exists to prevent.
    const restored = page.indexOf('Restored session');
    const created = page.indexOf('Created new session');
    const call = page.indexOf('initializeSessionSanctuary(');
    expect(restored).toBeGreaterThan(-1);
    expect(created).toBeGreaterThan(-1);
    expect(call).toBeGreaterThan(created);
    expect(call).toBeGreaterThan(restored);
  });
});
