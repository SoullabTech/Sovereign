/**
 * SANCTUARY-SETTINGS-DISCONNECT-01 — falsification matrix (V2 / Phase 2B).
 *
 * V1 (612633255) was architecturally right and had three Class A timing holes
 * that its 20 tests did not falsify. The tests that matter most here are the
 * ones that would have caught them:
 *
 *   A  "closes Sanctuary BEFORE the first await"      — no pre-init turn window
 *   B  "a member override during the fetch wins"      — default may not overrule
 *   C  "unwritable settings are reported unenforced"  — fail-closed means enforced
 *
 * A test suite that only checks the happy resolution would have passed V1.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  resolveSessionSanctuary,
  readLiveSanctuary,
  applySessionSanctuary,
  initializeSessionSanctuary,
} from '../sessionSanctuaryInit';

const store = new Map<string, string>();
let throwOnWrite = false;

beforeEach(() => {
  store.clear();
  throwOnWrite = false;
  (globalThis as any).CustomEvent = class {
    constructor(public type: string, public init?: any) {}
  };
  (globalThis as any).window = { dispatchEvent: jest.fn() };
  (globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      if (throwOnWrite) throw new Error('QuotaExceeded');
      store.set(k, v);
    },
    removeItem: (k: string) => { store.delete(k); },
  };
});

afterEach(() => {
  delete (globalThis as any).window;
  delete (globalThis as any).localStorage;
  delete (globalThis as any).CustomEvent;
});

const live = () => JSON.parse(store.get('maia_settings')!).sanctuary;
const ok = (mode: string) =>
  async () => ({ ok: true, json: async () => ({ maia: { defaultMemoryMode: mode } }) }) as any;
const fails = async () => { throw new Error('network down'); };

// ── resolver ────────────────────────────────────────────────────────────────

describe('resolveSessionSanctuary', () => {
  it('account default Sanctuary → session begins Sanctuary', () => {
    expect(resolveSessionSanctuary({ serverMode: 'sanctuary' }))
      .toEqual({ sanctuary: true, source: 'server' });
  });

  it('account default Continuity → session begins Continuity', () => {
    expect(resolveSessionSanctuary({ serverMode: 'continuity' }))
      .toEqual({ sanctuary: false, source: 'server' });
  });

  it('no server answer → FAILS CLOSED to Sanctuary, never assumes Continuity', () => {
    expect(resolveSessionSanctuary({ serverMode: null }))
      .toEqual({ sanctuary: true, source: 'fail_closed' });
  });

  it('(D) has no local-cache branch — an unidentified cache is not trusted', () => {
    // maia_account_settings carries no member identity, so on a shared browser a
    // cached default may belong to someone else. Reinstating this path requires
    // stamping member identity into that store — a separate unit.
    // Comments are stripped first: the module DOCUMENTS why the cache is gone,
    // and a pin that can be satisfied — or broken — by prose is not a pin.
    const src = readFileSync(join(__dirname, '..', 'sessionSanctuaryInit.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '');
    expect(src).not.toMatch(/maia_account_settings/);
    expect(src).not.toMatch(/local_cache/);
  });
});

// ── A: no pre-initialization turn ───────────────────────────────────────────

describe('A · the boundary is closed before any await', () => {
  it('leaves Sanctuary ON while the server call is still pending', async () => {
    store.set('maia_settings', JSON.stringify({ sanctuary: false }));
    let release: (v: any) => void;
    const pending = new Promise<any>((r) => { release = r; });

    const running = initializeSessionSanctuary({
      memberId: 'm1', fetcher: (() => pending) as any,
    });

    // The await has not resolved. Under V1 the live value would still be the
    // previous session's `false`, and a fast first turn would escape.
    expect(live()).toBe(true);

    release!({ ok: true, json: async () => ({ maia: { defaultMemoryMode: 'continuity' } }) });
    await running;
    expect(live()).toBe(false);
  });

  it('relaxes to Continuity only once the server authorizes it', async () => {
    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: ok('continuity') as any });
    expect(r).toMatchObject({ sanctuary: false, source: 'server', applied: true });
    expect(live()).toBe(false);
  });

  it('never relaxes when the server cannot answer', async () => {
    store.set('maia_settings', JSON.stringify({ sanctuary: false }));
    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: fails as any });
    expect(r).toMatchObject({ sanctuary: true, source: 'fail_closed', applied: true });
    expect(live()).toBe(true);
  });
});

// ── B: live override wins ───────────────────────────────────────────────────

describe('B · a member override during the fetch outranks a late default', () => {
  it('stands down when Quick Settings changed the value mid-flight', async () => {
    let release: (v: any) => void;
    const pending = new Promise<any>((r) => { release = r; });

    const running = initializeSessionSanctuary({
      memberId: 'm1', fetcher: (() => pending) as any,
    });
    expect(live()).toBe(true); // pessimistic close landed

    // The member deliberately turns Sanctuary off for this session.
    store.set('maia_settings', JSON.stringify({ sanctuary: false, interrupt: { enabled: true } }));

    // The account default (Sanctuary) now arrives late.
    release!({ ok: true, json: async () => ({ maia: { defaultMemoryMode: 'sanctuary' } }) });
    const r = await running;

    expect(r).toMatchObject({ overriddenByMember: true, applied: false });
    expect(live()).toBe(false); // the member's newer choice survives
    // and their other settings are untouched
    expect(JSON.parse(store.get('maia_settings')!).interrupt).toEqual({ enabled: true });
  });

  it('stands down even when the late default would have relaxed the boundary', async () => {
    // Symmetric case: member turns Sanctuary ON mid-flight, server says
    // Continuity. The default must not revoke a boundary the member just set.
    let release: (v: any) => void;
    const pending = new Promise<any>((r) => { release = r; });
    store.set('maia_settings', JSON.stringify({ sanctuary: false }));

    const running = initializeSessionSanctuary({
      memberId: 'm1', fetcher: (() => pending) as any,
    });
    store.set('maia_settings', JSON.stringify({ sanctuary: false })); // member set OFF explicitly
    release!({ ok: true, json: async () => ({ maia: { defaultMemoryMode: 'continuity' } }) });
    const r = await running;
    expect(r!.overriddenByMember).toBe(true);
    expect(live()).toBe(false);
  });
});

// ── C: fail-closed means enforced ───────────────────────────────────────────

describe('C · a boundary is never reported closed unless it was set', () => {
  it('reports enforced=false when settings cannot be written or announced', async () => {
    throwOnWrite = true;
    (globalThis as any).window.dispatchEvent = () => { throw new Error('no window'); };

    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: fails as any });
    expect(r).toMatchObject({ source: 'fail_closed', enforced: false });
    // The caller logs this loudly; the point is that it is not silently true.
  });

  it('still enforces via the event when persistence alone fails', async () => {
    throwOnWrite = true;
    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: fails as any });
    expect(r!.enforced).toBe(true);
    expect((globalThis as any).window.dispatchEvent).toHaveBeenCalled();
  });

  it('writes and announces despite malformed existing maia_settings', () => {
    // V1 parsed inside the same try/catch as the write, so a corrupt object threw
    // before either happened — reporting fail_closed while enforcing nothing.
    store.set('maia_settings', '{not json');
    const outcome = applySessionSanctuary(true);
    expect(outcome).toEqual({ persisted: true, notified: true });
    expect(live()).toBe(true);
  });
});

// ── shared behaviours ───────────────────────────────────────────────────────

describe('applySessionSanctuary owns exactly one key', () => {
  it('preserves every unrelated field', () => {
    store.set('maia_settings', JSON.stringify({
      sanctuary: false, interrupt: { enabled: true }, conversationMode: 'her',
    }));
    applySessionSanctuary(true);
    expect(JSON.parse(store.get('maia_settings')!))
      .toEqual({ sanctuary: true, interrupt: { enabled: true }, conversationMode: 'her' });
  });

  it('dispatches a boolean the OracleConversation listener will accept', () => {
    applySessionSanctuary(true);
    const call = ((globalThis as any).window.dispatchEvent as jest.Mock).mock.calls[0][0];
    expect(call.type).toBe('maia-settings-changed');
    expect(call.init.detail.sanctuary).toBe(true);
  });
});

describe('readLiveSanctuary', () => {
  it('returns null rather than guessing when absent or unreadable', () => {
    expect(readLiveSanctuary()).toBeNull();
    store.set('maia_settings', '{not json');
    expect(readLiveSanctuary()).toBeNull();
    store.set('maia_settings', JSON.stringify({ sanctuary: 'yes' }));
    expect(readLiveSanctuary()).toBeNull();
  });
});

describe('initializeSessionSanctuary scope', () => {
  it('does nothing for an unauthenticated visitor', async () => {
    const r = await initializeSessionSanctuary({ memberId: null, fetcher: fails as any });
    expect(r).toBeNull();
    expect(store.has('maia_settings')).toBe(false);
  });

  it('treats a non-ok response as no answer, not as Continuity', async () => {
    const notOk = async () => ({ ok: false, json: async () => ({}) }) as any;
    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: notOk as any });
    expect(r).toMatchObject({ source: 'fail_closed', sanctuary: true });
  });

  it('treats an unrecognized mode as no answer', async () => {
    const r = await initializeSessionSanctuary({ memberId: 'm1', fetcher: ok('balanced') as any });
    expect(r).toMatchObject({ source: 'fail_closed', sanctuary: true });
  });
});

// ── call-site contract ──────────────────────────────────────────────────────

describe('call site — fires ONLY at the canonical new-session boundary', () => {
  const page = readFileSync(
    join(__dirname, '..', '..', '..', 'app', 'maia', 'page.tsx'), 'utf8',
  );

  it('is invoked exactly once in /maia', () => {
    expect(page.match(/initializeSessionSanctuary\(/g)).toHaveLength(1);
  });

  it('sits in the new-session branch, not the restored-session branch', () => {
    const restored = page.indexOf('Restored session');
    const created = page.indexOf('Created new session');
    const call = page.indexOf('initializeSessionSanctuary(');
    expect(restored).toBeGreaterThan(-1);
    expect(created).toBeGreaterThan(-1);
    expect(call).toBeGreaterThan(created);
    expect(call).toBeGreaterThan(restored);
  });

  it('surfaces an unenforced boundary instead of swallowing it', () => {
    expect(page).toMatch(/if \(!r\.enforced\)/);
    expect(page).toMatch(/NOT enforced/);
  });
});
