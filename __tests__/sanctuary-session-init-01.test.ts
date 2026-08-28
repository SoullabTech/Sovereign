/**
 * SANCTUARY-SESSION-INIT-01 — the account default seeds a new conversation;
 * the conversation governs itself thereafter.
 *
 * The defect: `OracleConversation` initialized Sanctuary exclusively from
 * browser-local `maia_settings.sanctuary`. A member could select Default Memory
 * Mode → Sanctuary and be served an ordinary, remembering conversation —
 * on a second device always, and on their own browser as soon as
 * `maia_settings` existed at all.
 *
 * Three facts were sharing one field. This suite pins them apart:
 *
 *   account default        how a conversation BEGINS
 *   conversation state     what THIS conversation became
 *   maia_settings          compatibility only — decides nothing about a new one
 *
 * ⭐ The acceptance cases below are behavioural, run against the real module.
 * The source pins at the end cover the two component seams that have no
 * testable export — the dispatch gate and the identity rotation — following the
 * precedent set by the F10 boundary proof and VOICE-MIC-LABEL-01.
 */

import fs from 'fs';
import path from 'path';

// ── in-memory localStorage ──────────────────────────────────────────────────
class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

let store: MemoryStorage;
let fetchMock: jest.Mock;

const ACCOUNT_KEY = 'maia_account_settings';

/** Load the module fresh so no state leaks between cases. */
function loadModule() {
  let mod!: typeof import('@/lib/settings/sanctuarySession');
  jest.isolateModules(() => {
    mod = require('@/lib/settings/sanctuarySession');
  });
  return mod;
}

beforeEach(() => {
  store = new MemoryStorage();
  (globalThis as any).localStorage = store;
  (globalThis as any).window = globalThis;
  fetchMock = jest.fn();
  (globalThis as any).fetch = fetchMock;
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete (globalThis as any).window;
});

/** The server says this is the member's account default. */
function serverDefault(mode: 'sanctuary' | 'continuity') {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ maia: { defaultMemoryMode: mode } }),
  });
}

// ───────────────────────────────────────────────────────────────────────────
describe('a NEW conversation is seeded from the account default', () => {
  it('account default = Sanctuary → conversation starts Sanctuary', async () => {
    const m = loadModule();
    serverDefault('sanctuary');
    const r = await m.resolveInitialSanctuary('member-1');
    expect(r.sanctuary).toBe(true);
    expect(r.state).toBe('sanctuary');
    expect(r.source).toBe('account-server');
  });

  it('FALSIFIES: a stale maia_settings.sanctuary=false does NOT suppress the default', () => {
    // This is the existence-lock failure. Pre-repair, `maia_settings` existing
    // at all made the account default permanently inert on that browser.
    return (async () => {
      const m = loadModule();
      store.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
      serverDefault('sanctuary');
      const r = await m.resolveInitialSanctuary('member-1');
      expect(r.sanctuary).toBe(true);
    })();
  });

  it('FALSIFIES: a fresh browser/device reaches the same default', async () => {
    // Cross-device failure: nothing on the conversation path read the
    // server-persisted preference, so it never followed the member.
    const m = loadModule();
    expect(store.getItem('maia_settings')).toBeNull();
    expect(store.getItem(ACCOUNT_KEY)).toBeNull();
    serverDefault('sanctuary');
    const r = await m.resolveInitialSanctuary('member-1');
    expect(r.sanctuary).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/members/settings?memberId=member-1'),
      expect.anything(),
    );
  });

  it('PRESERVES: account default = continuity → conversation starts standard', async () => {
    // The repair must not be achievable by making everything Sanctuary.
    const m = loadModule();
    serverDefault('continuity');
    const r = await m.resolveInitialSanctuary('member-1');
    expect(r.sanctuary).toBe(false);
    expect(r.state).toBe('standard');
  });
});

describe('an EXISTING conversation governs itself and is never re-seeded', () => {
  it('restores what the member made it, against the account default', async () => {
    const m = loadModule();
    serverDefault('sanctuary');
    await m.resolveInitialSanctuary('member-1');           // seeded ON
    const id = m.getConversationId();

    m.writeConversationSanctuary(id, false);               // member toggles OFF

    const again = await m.resolveInitialSanctuary('member-1');
    expect(again.sanctuary).toBe(false);
    expect(again.source).toBe('conversation');
  });

  it('does not consult the server once the conversation has a state', async () => {
    const m = loadModule();
    serverDefault('sanctuary');
    await m.resolveInitialSanctuary('member-1');
    fetchMock.mockClear();

    await m.resolveInitialSanctuary('member-1');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('changing the account default cannot mutate a conversation underway', async () => {
    const m = loadModule();
    serverDefault('sanctuary');
    await m.resolveInitialSanctuary('member-1');
    const id = m.getConversationId();
    m.writeConversationSanctuary(id, true);

    serverDefault('continuity');                            // member changes the default
    const still = await m.resolveInitialSanctuary('member-1');
    expect(still.sanctuary).toBe(true);                     // this conversation is unchanged
    expect(still.source).toBe('conversation');
  });
});

describe('THE SEQUENCE — default, identity and live state are actually separate', () => {
  it('seeded ON → toggled OFF → remount OFF → New Conversation → ON', async () => {
    const m = loadModule();
    serverDefault('sanctuary');

    // account default = Sanctuary → new conversation starts ON
    const first = await m.resolveInitialSanctuary('member-1');
    expect(first.sanctuary).toBe(true);
    const firstId = first.conversationId;

    // member explicitly toggles OFF
    m.writeConversationSanctuary(firstId, false);

    // reload / remount → remains OFF
    const remount = await m.resolveInitialSanctuary('member-1');
    expect(remount.sanctuary).toBe(false);
    expect(remount.conversationId).toBe(firstId);
    expect(remount.source).toBe('conversation');

    // New Conversation → new identity, seeded from the account default again
    const rotated = m.rotateConversationId();
    expect(rotated).not.toBe(firstId);

    const next = await m.resolveInitialSanctuary('member-1');
    expect(next.conversationId).toBe(rotated);
    expect(next.sanctuary).toBe(true);
    expect(next.source).toBe('account-server');
  });

  it('the ended conversation cannot leave its state behind for the new one', () => {
    const m = loadModule();
    const id = m.getConversationId();
    m.writeConversationSanctuary(id, false);
    expect(m.readConversationSanctuary(id)).toBe(false);

    const rotated = m.rotateConversationId();
    expect(m.readConversationSanctuary(rotated)).toBeNull();

    // The read guard above rejects a record naming another conversation, so it
    // alone would pass even if rotation left the old record in place. Pin the
    // clearing itself: a dead conversation's privacy state should not linger in
    // storage waiting for an id collision or a future reader that forgets to
    // check. Without this assertion the removeItem is unproven.
    expect(store.getItem('maia_conversation_sanctuary')).toBeNull();
  });

  it('a record naming another conversation is not adopted', () => {
    const m = loadModule();
    store.setItem(
      'maia_conversation_sanctuary',
      JSON.stringify({ conversationId: 'conv-someone-elses', sanctuary: false }),
    );
    expect(m.readConversationSanctuary(m.getConversationId())).toBeNull();
  });
});

describe('resolution failure fails CLOSED and stays distinguishable', () => {
  it('a failed lookup yields Sanctuary, not standard memory', async () => {
    const m = loadModule();
    fetchMock.mockRejectedValue(new Error('network'));
    const r = await m.resolveInitialSanctuary('member-1');
    expect(r.sanctuary).toBe(true);
    expect(r.source).toBe('resolution-failed');
  });

  it('a non-ok response fails closed', async () => {
    const m = loadModule();
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    const r = await m.resolveInitialSanctuary('member-1');
    expect(r.sanctuary).toBe(true);
    expect(r.source).toBe('resolution-failed');
  });

  it('an unrecognized mode fails closed rather than guessing', async () => {
    const m = loadModule();
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ maia: { defaultMemoryMode: 'wat' } }) });
    const r = await m.resolveInitialSanctuary('member-1');
    expect(r.sanctuary).toBe(true);
    expect(r.source).toBe('resolution-failed');
  });

  it('failure is NEVER reported as a member selection', async () => {
    // The whole point of the source field: privacy-by-accident and
    // privacy-by-choice must not be the same record.
    const m = loadModule();
    fetchMock.mockRejectedValue(new Error('network'));
    const failed = await m.resolveInitialSanctuary('member-1');
    expect(failed.source).not.toBe('account-server');
    expect(failed.source).not.toBe('conversation');
  });

  it('no member id is a known state, not a failure — reads local account settings', async () => {
    const m = loadModule();
    store.setItem(ACCOUNT_KEY, JSON.stringify({ defaultMemoryMode: 'sanctuary' }));
    const r = await m.resolveInitialSanctuary(undefined);
    expect(r.source).toBe('account-local');
    expect(r.sanctuary).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('dispatch permission derives from the init state, not from isSanctuary', () => {
  it('prohibits dispatch while resolving', () => {
    const m = loadModule();
    expect(m.mayDispatch('resolving')).toBe(false);
  });

  it('permits it once resolved, either way', () => {
    const m = loadModule();
    expect(m.mayDispatch('sanctuary')).toBe(true);
    expect(m.mayDispatch('standard')).toBe(true);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Source pins — the two component seams with no testable export.
// ───────────────────────────────────────────────────────────────────────────

const read = (p: string) =>
  fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

describe('component wiring', () => {
  const ORACLE = 'components/OracleConversation.tsx';

  it('the mount initializer no longer reads maia_settings for Sanctuary', () => {
    const src = read(ORACLE);
    expect(src).not.toMatch(/useState\(\(\)\s*=>\s*\{[\s\S]{0,400}?settings\.sanctuary === true/);
    expect(src).toMatch(/resolveInitialSanctuary\(userId\)/);
  });

  it('both dispatch paths are gated on the init state', () => {
    const src = read(ORACLE);
    const gates = src.match(/if \(!mayDispatch\(sanctuaryInitRef\.current\)\)/g) ?? [];
    expect(gates.length).toBe(2); // handleVoiceTranscript + handleTextMessage
  });

  it('the gate reads a ref, not a captured state value', () => {
    // The send paths are useCallbacks with long dependency arrays; a captured
    // value could let a stale 'standard' decide a privacy boundary.
    const src = read(ORACLE);
    expect(src).toMatch(/const sanctuaryInitRef = useRef<SanctuaryInitState>\('resolving'\)/);
    expect(src).not.toMatch(/if \(!mayDispatch\(sanctuaryInitState\)\)/);
  });

  it('every Sanctuary mutation persists against the conversation', () => {
    const src = read(ORACLE);
    // setIsSanctuary may appear only in the declaration, the wrapper, and the resolver.
    const raw = src.match(/setIsSanctuary\(/g) ?? [];
    expect(raw.length).toBeLessThanOrEqual(4);
    expect(src).toMatch(/const applySanctuaryChange = useCallback/);
    expect(src).toMatch(/writeConversationSanctuary\(conversationId, next\)/);
  });

  it('New Conversation rotates the conversation identity and re-seeds', () => {
    const src = read(ORACLE);
    expect(src).toMatch(/const rotated = rotateConversationId\(\)/);
    expect(src).toMatch(/setSanctuaryInit\('resolving'\)/);
  });

  it('the voice hook uses the shared conversation identity', () => {
    const hook = read('hooks/useStreamingVoice.ts');
    expect(hook).toMatch(/import \{ getConversationId \} from '@\/lib\/settings\/sanctuarySession'/);
    expect(hook).toMatch(/const conversationId = getConversationId\(\)/);
    // Its private copy must not come back — a second authority would let a
    // rotation be invisible to the server.
    expect(hook).not.toMatch(/CONVERSATION_ID_KEY/);
    expect(hook).not.toMatch(/function getOrCreateConversationId/);
  });

  it('MaiaSettingsPanel reset cannot silently revoke Sanctuary', () => {
    const panel = read('components/MaiaSettingsPanel.tsx');
    expect(panel).toMatch(/setSettings\(\(prev\)\s*=>\s*\(\{[\s\S]{0,300}?sanctuary/);
    expect(panel).not.toMatch(/const resetSettings = \(\) => \{\s*setSettings\(DEFAULT_SETTINGS\);\s*\};/);
  });

  it('consentSummary.sanctuaryDefault is NOT wired into this path', () => {
    // Explicitly out of scope: sharing a word with Sanctuary is not a contract.
    const mod = fs.readFileSync(path.join(process.cwd(), 'lib/settings/sanctuarySession.ts'), 'utf8');
    expect(mod).not.toMatch(/getConsentSummary|sanctuaryDefault\s*[,;)]/);
  });
});
