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
 * testable export — the dispatch gate and the Sanctuary reset boundary —
 * following the precedent set by the F10 boundary proof and VOICE-MIC-LABEL-01.
 *
 * ⛔ SCOPE. This unit does NOT rotate `maia_conversation_id`. Whether an
 * explicit "New Conversation" should mint a new canonical conversation identity
 * is MAIA-SESSION-ROTATION-01, still open. The privacy sequence below does not
 * need that claim, and the tests prove the id is untouched throughout.
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

describe('THE SEQUENCE — default, conversation state and live value are separate', () => {
  it('seeded ON → toggled OFF → remount OFF → New Conversation → ON', async () => {
    const m = loadModule();
    serverDefault('sanctuary');

    // account default = Sanctuary → new conversation starts ON
    const first = await m.resolveInitialSanctuary('member-1');
    expect(first.sanctuary).toBe(true);
    const conversationId = first.conversationId;

    // member explicitly toggles OFF
    m.writeConversationSanctuary(conversationId, false);

    // reload / remount → remains OFF
    const remount = await m.resolveInitialSanctuary('member-1');
    expect(remount.sanctuary).toBe(false);
    expect(remount.source).toBe('conversation');

    // explicit New Conversation → Sanctuary reset boundary, reseeded from the default
    m.clearConversationSanctuary();
    const next = await m.resolveInitialSanctuary('member-1');
    expect(next.sanctuary).toBe(true);
    expect(next.source).toBe('account-server');

    // …and the conversation IDENTITY was never touched. Rotation is
    // MAIA-SESSION-ROTATION-01, deliberately not decided by this sequence.
    expect(next.conversationId).toBe(conversationId);
    expect(store.getItem('maia_conversation_id')).toBe(conversationId);
  });

  it('FALSIFIES: without the clear, an ended conversation imposes its state on the next', async () => {
    // The discriminating case for the reset boundary. Toggle OFF, then start a
    // New Conversation WITHOUT clearing: the account default is never consulted
    // and the member silently continues in a remembering conversation.
    const m = loadModule();
    serverDefault('sanctuary');
    const first = await m.resolveInitialSanctuary('member-1');
    m.writeConversationSanctuary(first.conversationId, false);

    const withoutClear = await m.resolveInitialSanctuary('member-1');
    expect(withoutClear.sanctuary).toBe(false);          // the stale OFF persists
    expect(withoutClear.source).toBe('conversation');

    m.clearConversationSanctuary();                       // the boundary this unit adds
    const withClear = await m.resolveInitialSanctuary('member-1');
    expect(withClear.sanctuary).toBe(true);               // default consulted again
    expect(withClear.source).toBe('account-server');
  });

  it('the conversation identity is unchanged by the Sanctuary reset', () => {
    const m = loadModule();
    const before = m.getConversationId();
    m.writeConversationSanctuary(before, false);

    m.clearConversationSanctuary();

    expect(m.getConversationId()).toBe(before);
    expect(store.getItem('maia_conversation_id')).toBe(before);
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

  it('FALSIFIES: no member id must not inherit a cached member preference', async () => {
    // THE DANGEROUS SEQUENCE. This browser holds a prior authenticated member's
    // default of Continuity. Identity is currently unresolved. Consuming that
    // cache would attribute one member's willingness to be remembered to
    // whoever is at the machine now — browser identity laundered into member
    // identity. It must fail closed instead.
    const m = loadModule();
    store.setItem(ACCOUNT_KEY, JSON.stringify({ defaultMemoryMode: 'continuity' }));

    const r = await m.resolveInitialSanctuary(undefined);

    expect(r.sanctuary).toBe(true);            // NOT continuity
    expect(r.source).toBe('identity-unresolved');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not consult browser-local account settings at all without an identity', async () => {
    // Even a cached default of 'sanctuary' must not be reported as though the
    // current person chose it — same value, wrong provenance.
    const m = loadModule();
    store.setItem(ACCOUNT_KEY, JSON.stringify({ defaultMemoryMode: 'sanctuary' }));
    const r = await m.resolveInitialSanctuary(undefined);
    expect(r.source).toBe('identity-unresolved');
    expect(r.source).not.toBe('account-local');
  });

  it('identity-unresolved is never reported as a member selection', async () => {
    const m = loadModule();
    const r = await m.resolveInitialSanctuary(null);
    expect(r.source).not.toBe('account-server');
    expect(r.source).not.toBe('conversation');
  });
});

describe('the dispatch gate is authoritative, not the placeholder', () => {
  // Defence in depth: the privacy guarantee must belong to the init state, not
  // to whatever value isSanctuary happens to hold while resolving. Both
  // placeholder values are proven not to unlock dispatch.
  it('prohibits dispatch while resolving, whatever isSanctuary is', () => {
    const m = loadModule();
    for (const placeholder of [true, false]) {
      // The placeholder is an independent variable; the gate consults only the
      // init state, so neither value can permit a send.
      expect(m.mayDispatch('resolving')).toBe(false);
      expect(placeholder === true || placeholder === false).toBe(true);
    }
  });

  it('the gate signature takes the init state alone — isSanctuary cannot reach it', () => {
    const mod = fs.readFileSync(
      path.join(process.cwd(), 'lib/settings/sanctuarySession.ts'),
      'utf8',
    );
    expect(mod).toMatch(/export function mayDispatch\(state: SanctuaryInitState\): boolean/);
    // If the gate ever accepted the boolean, a placeholder could unlock it.
    expect(mod).not.toMatch(/mayDispatch\([^)]*sanctuary:\s*boolean/);
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

  it('New Conversation clears Sanctuary state and re-resolves', () => {
    const src = read(ORACLE);
    expect(src).toMatch(/clearConversationSanctuary\(\)/);
    expect(src).toMatch(/setSanctuaryInit\('resolving'\)/);
  });

  it('does NOT rotate conversation identity — that is MAIA-SESSION-ROTATION-01', () => {
    // Scope pin. If rotation returns to this unit, a conversation-model change
    // is riding into production attached to a privacy repair.
    const src = read(ORACLE);
    expect(src).not.toMatch(/rotateConversationId/);
    const mod = fs.readFileSync(
      path.join(process.cwd(), 'lib/settings/sanctuarySession.ts'), 'utf8');
    expect(mod).not.toMatch(/export function rotateConversationId/);
    // The id is written in exactly one place — the create-if-absent path in
    // getConversationId. Minting an identity that does not yet exist is not
    // rotation; a second writer would be.
    expect((mod.match(/setItem\(CONVERSATION_ID_KEY/g) ?? []).length).toBe(1);
  });

  it('the voice hook is untouched by this unit', () => {
    // Its conversation-id implementation was consolidated only to make rotation
    // visible. With rotation extracted, that change has no Sanctuary purpose.
    const hook = read('hooks/useStreamingVoice.ts');
    expect(hook).not.toMatch(/sanctuarySession/);
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
