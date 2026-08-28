/**
 * SANCTUARY-SETTINGS-DISCONNECT-01 — a default governs beginnings; a live
 * setting governs the encounter already underway.
 *
 * THE DEFECT. MAIA Settings → Default Memory Mode → Sanctuary was consumed only
 * when `maia_settings` did not yet exist. After a member's first ever visit it
 * always exists, so a new session inherited browser residue instead of the
 * member's standing default: Settings could display Sanctuary as selected while
 * the session ran in Continuity, with no indicator and no suppression.
 *
 * WHAT IS NOT UNDER TEST. Enforcement is already proven in production
 * (F10-WIRE, SANCTUARY-DURABLE-NONRETENTION-01) and is untouched here. These
 * tests cover exactly one edge: whether the account default reaches the live
 * authority at a new-session boundary, and — equally — whether it stays out of
 * an active one.
 *
 * The asymmetry is the point. Seeding too little leaves the member unprotected.
 * Seeding too often silently revokes consent they gave mid-conversation.
 */

import {
  seedLiveSanctuaryForNewSession,
  LIVE_SESSION_SETTINGS_KEY,
  saveAccountSettings,
  getAccountSettings,
  DEFAULT_ACCOUNT_SETTINGS,
} from '@/lib/settings/accountSettings';
import { readFileSync } from 'fs';
import { join } from 'path';

// ── minimal window/localStorage for the node test env ──────────────────────
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
  (global as any).CustomEvent = class { type: string; detail: any;
    constructor(type: string, init?: any) { this.type = type; this.detail = init?.detail; } };
  (global as any).window = {
    localStorage: (global as any).localStorage,
    dispatchEvent: (e: any) => { dispatched.push(e); return true; },
  };
});

const setDefault = (mode: 'sanctuary' | 'continuity') =>
  saveAccountSettings({ ...DEFAULT_ACCOUNT_SETTINGS, defaultMemoryMode: mode } as any);

const liveSanctuary = () => {
  const raw = store.get(LIVE_SESSION_SETTINGS_KEY);
  return raw ? JSON.parse(raw).sanctuary : undefined;
};
const setLive = (settings: Record<string, unknown>) =>
  store.set(LIVE_SESSION_SETTINGS_KEY, JSON.stringify(settings));

// ═══════════════════════════════════════════════════════════════════════════
// A / B — a new session begins from the standing default
// ═══════════════════════════════════════════════════════════════════════════
describe('new session consumes the account default', () => {
  it('A · default Sanctuary → live Sanctuary true', () => {
    setDefault('sanctuary');
    expect(seedLiveSanctuaryForNewSession()).toBe(true);
    expect(liveSanctuary()).toBe(true);
  });

  it('B · default Continuity → live Sanctuary false', () => {
    setDefault('continuity');
    expect(seedLiveSanctuaryForNewSession()).toBe(false);
    expect(liveSanctuary()).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// G / H — stale browser state cannot outrank the default. THE DEFECT CLASS.
// ═══════════════════════════════════════════════════════════════════════════
describe('stale maia_settings from a previous session', () => {
  it('G · stale false + default Sanctuary → Sanctuary wins', () => {
    // The witnessed production shape: Settings said Sanctuary, the session ran
    // Continuity, and the member could not tell from the conversation surface.
    setLive({ sanctuary: false, voice: { pace: 0.5 } });
    setDefault('sanctuary');
    seedLiveSanctuaryForNewSession();
    expect(liveSanctuary()).toBe(true);
  });

  it('H · stale true + default Continuity → Continuity wins', () => {
    // The mirror. Sanctuary must not persist past its session either: the
    // member would believe they were protected when the default says otherwise.
    setLive({ sanctuary: true });
    setDefault('continuity');
    seedLiveSanctuaryForNewSession();
    expect(liveSanctuary()).toBe(false);
  });

  it('preserves other live settings — this seeds one field, not the object', () => {
    setLive({ sanctuary: false, voice: { pace: 0.9 }, archetype: 'SAGE' });
    setDefault('sanctuary');
    seedLiveSanctuaryForNewSession();
    const live = JSON.parse(store.get(LIVE_SESSION_SETTINGS_KEY)!);
    expect(live.sanctuary).toBe(true);
    expect(live.voice).toEqual({ pace: 0.9 });
    expect(live.archetype).toBe('SAGE');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// C / D / F — an active session is NOT reseeded
// ═══════════════════════════════════════════════════════════════════════════
describe('the live encounter is not governed by the default', () => {
  it('D · a same-day reload does not call the seeder at all', () => {
    // Enforced at the call site, not in the function: the page seeds only in
    // the identity.isNew branch. Pinned there, and mutation-checked below.
    const page = readFileSync(join(__dirname, '..', 'app/maia/page.tsx'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
    const restore = page.indexOf('if (identity && !identity.isNew)');
    const newSession = page.indexOf('} else if (identity) {', restore);
    expect(restore).toBeGreaterThan(-1);
    expect(newSession).toBeGreaterThan(-1);
    // absent from the restore branch, present in the new-session branch
    expect(page.slice(restore, newSession)).not.toContain('seedLiveSanctuaryForNewSession');
    expect(page.slice(newSession, newSession + 1600)).toContain('seedLiveSanctuaryForNewSession');
  });

  it('C · an override written after seeding is not undone by the seeder', () => {
    setDefault('sanctuary');
    seedLiveSanctuaryForNewSession();      // new session → Sanctuary
    setLive({ ...JSON.parse(store.get(LIVE_SESSION_SETTINGS_KEY)!), sanctuary: false }); // Quick Settings → Continuity
    expect(liveSanctuary()).toBe(false);   // and nothing reseeds it
  });

  it('F · changing the default does not touch live settings on its own', () => {
    setLive({ sanctuary: false });
    setDefault('sanctuary');               // Settings change, no session boundary
    expect(liveSanctuary()).toBe(false);   // untouched — only the seeder writes
    expect(getAccountSettings().defaultMemoryMode).toBe('sanctuary');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// J / K / L — the existing authority and its consumers are unchanged
// ═══════════════════════════════════════════════════════════════════════════
describe('no second Sanctuary authority was created', () => {
  it('writes the same key Quick Settings writes and OracleConversation reads', () => {
    expect(LIVE_SESSION_SETTINGS_KEY).toBe('maia_settings');
    const oc = readFileSync(join(__dirname, '..', 'components/OracleConversation.tsx'), 'utf8');
    expect(oc).toContain("localStorage.getItem('maia_settings')");
    expect(oc).toMatch(/settings\.sanctuary === true/);
  });

  it('J · dispatches maia-settings-changed so a mounted conversation updates live', () => {
    setDefault('sanctuary');
    seedLiveSanctuaryForNewSession();
    // saveAccountSettings emits its own 'maia-account-settings-changed', so
    // filter rather than assuming the seeder's is the only event on the bus.
    const live = dispatched.filter((e) => e.type === 'maia-settings-changed');
    expect(live).toHaveLength(1);
    expect(live[0].detail.sanctuary).toBe(true);
  });

  it('K/L · indicator, Keep and the voice wire still derive from isSanctuary', () => {
    const oc = readFileSync(join(__dirname, '..', 'components/OracleConversation.tsx'), 'utf8');
    expect(oc).toMatch(/\{isSanctuary && \(/);            // indicator
    expect(oc).toMatch(/sanctuary: isSanctuary/);         // streaming voice wire (F10)
    expect(oc).toMatch(/setIsSanctuary\(event\.detail\.sanctuary\)/); // live listener
  });
});

describe('degrades safely', () => {
  it('returns null without a window rather than throwing', () => {
    const w = (global as any).window;
    delete (global as any).window;
    expect(seedLiveSanctuaryForNewSession()).toBeNull();
    (global as any).window = w;
  });

  it('survives corrupt live settings', () => {
    store.set(LIVE_SESSION_SETTINGS_KEY, '{not json');
    setDefault('sanctuary');
    expect(() => seedLiveSanctuaryForNewSession()).not.toThrow();
  });
});
