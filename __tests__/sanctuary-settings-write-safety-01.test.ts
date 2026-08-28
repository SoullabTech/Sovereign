/**
 * SANCTUARY-SETTINGS-WRITE-SAFETY-01 — two proven paths by which the settings
 * UI destroyed Sanctuary state without the member doing anything about privacy.
 *
 * Both share a shape: application-inserted defaults are laundered into member
 * intent. In A an un-hydrated `'continuity'` is persisted as though chosen; in B
 * a reset drops a key the panel does not own. Neither surfaces anything to the
 * member — the session simply resumes retrieving and persisting.
 *
 * Enforcement, retrieval, the resolver, session identity, F10, voice and Keep
 * are untouched by this unit and untested here.
 */

import {
  guardMemberAuthoredMemoryMode,
  withPreservedSanctuary,
  ACCOUNT_SETTINGS_KEY,
} from '@/lib/settings/settingsWriteSafety';
import { DEFAULT_ACCOUNT_SETTINGS } from '@/lib/settings/accountSettings';

const base = (over: Record<string, unknown> = {}) =>
  ({ ...DEFAULT_ACCOUNT_SETTINGS, ...over }) as any;
const raw = (o: unknown) => JSON.stringify(o);

// ═══════════════════════════════════════════════════════════════════════════
// A · an unresolved preference is never persisted as a member choice
// ═══════════════════════════════════════════════════════════════════════════
describe('A · AccountSettings provenance safety', () => {
  it('unhydrated + unrelated write → synthetic defaultMemoryMode is NOT persisted', () => {
    // The witnessed hazard: editing a display name revoking Sanctuary.
    const out = guardMemberAuthoredMemoryMode({
      updated: base({ defaultMemoryMode: 'continuity', preferredAssistantName: 'Aria' }),
      changedKey: 'preferredAssistantName',
      hydrated: false,
      storedRaw: null,
    });
    expect('defaultMemoryMode' in out).toBe(false);
    expect((out as any).preferredAssistantName).toBe('Aria');
  });

  it('failed hydration + unrelated write → the stored member choice survives', () => {
    const out = guardMemberAuthoredMemoryMode({
      updated: base({ defaultMemoryMode: 'continuity', preferredAssistantName: 'Aria' }),
      changedKey: 'preferredAssistantName',
      hydrated: false,
      storedRaw: raw({ defaultMemoryMode: 'sanctuary' }),
    });
    expect(out.defaultMemoryMode).toBe('sanctuary');
  });

  it('hydrated Sanctuary + unrelated write → Sanctuary preserved', () => {
    const out = guardMemberAuthoredMemoryMode({
      updated: base({ defaultMemoryMode: 'sanctuary', preferredAssistantName: 'Aria' }),
      changedKey: 'preferredAssistantName',
      hydrated: true,
      storedRaw: raw({ defaultMemoryMode: 'sanctuary' }),
    });
    expect(out.defaultMemoryMode).toBe('sanctuary');
  });

  it('the member explicitly changing the field → that value IS written, either way', () => {
    for (const mode of ['sanctuary', 'continuity'] as const) {
      const out = guardMemberAuthoredMemoryMode({
        updated: base({ defaultMemoryMode: mode }),
        changedKey: 'defaultMemoryMode',
        hydrated: false,           // explicit intent does not need hydration
        storedRaw: raw({ defaultMemoryMode: mode === 'sanctuary' ? 'continuity' : 'sanctuary' }),
      });
      expect(out.defaultMemoryMode).toBe(mode);
    }
  });

  it('a stored Continuity choice is honoured — this guard is not a Sanctuary thumb on the scale', () => {
    const out = guardMemberAuthoredMemoryMode({
      updated: base({ defaultMemoryMode: 'continuity' }),
      changedKey: 'archetype',
      hydrated: false,
      storedRaw: raw({ defaultMemoryMode: 'continuity' }),
    });
    expect(out.defaultMemoryMode).toBe('continuity');
  });

  it('corrupt or unrecognized stored values are not coerced into a choice', () => {
    for (const stored of ['{not json', raw({ defaultMemoryMode: 'private' }), raw({})]) {
      const out = guardMemberAuthoredMemoryMode({
        updated: base({ defaultMemoryMode: 'continuity' }),
        changedKey: 'archetype',
        hydrated: false,
        storedRaw: stored,
      });
      expect('defaultMemoryMode' in out).toBe(false);
    }
  });

  it('uses the same storage key the account settings module writes', () => {
    expect(ACCOUNT_SETTINGS_KEY).toBe('maia_account_settings');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// B · resetting unrelated settings does not revoke Sanctuary
// ═══════════════════════════════════════════════════════════════════════════
describe('B · MaiaSettingsPanel reset preserves Sanctuary', () => {
  const DEFAULTS = { memory: { enabled: true }, personality: { warmth: 0.8 } };

  it('sanctuary true survives reset → save', () => {
    const out = withPreservedSanctuary(DEFAULTS, { ...DEFAULTS, sanctuary: true, personality: { warmth: 0.1 } });
    expect(out.sanctuary).toBe(true);
  });

  it('sanctuary false survives reset → save', () => {
    // Equally important: reset must not INVENT Sanctuary either.
    const out = withPreservedSanctuary(DEFAULTS, { ...DEFAULTS, sanctuary: false });
    expect(out.sanctuary).toBe(false);
    expect('sanctuary' in out).toBe(true);
  });

  it('absent sanctuary stays absent — no key is manufactured', () => {
    const out = withPreservedSanctuary(DEFAULTS, { ...DEFAULTS });
    expect('sanctuary' in out).toBe(false);
  });

  it('everything the panel does own is still reset', () => {
    const out = withPreservedSanctuary(DEFAULTS, { memory: { enabled: false }, personality: { warmth: 0.1 }, sanctuary: true });
    expect(out.memory).toEqual({ enabled: true });
    expect(out.personality).toEqual({ warmth: 0.8 });
    expect(out.sanctuary).toBe(true);
  });

  it('tolerates a null/undefined previous state', () => {
    expect(withPreservedSanctuary(DEFAULTS, null)).toEqual(DEFAULTS);
    expect(withPreservedSanctuary(DEFAULTS, undefined)).toEqual(DEFAULTS);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// call sites — the helpers are actually used
// ═══════════════════════════════════════════════════════════════════════════
describe('call sites', () => {
  const read = (f: string) =>
    require('fs').readFileSync(require('path').join(__dirname, '..', f), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

  it('updateMaiaSetting persists through the guard, not raw state', () => {
    const src = read('components/account/AccountSettings.tsx');
    // BOTH write paths — updateMaiaSetting and updateNestedMaiaSetting. The
    // nested one was found unguarded by this very assertion.
    const guarded = src.match(/saveAccountSettings\(\s*guardMemberAuthoredMemoryMode\(/g) ?? [];
    expect(guarded).toHaveLength(2);
    expect(src).not.toMatch(/saveAccountSettings\(updated\)/);
  });

  it('resetSettings preserves through the helper, not DEFAULT_SETTINGS alone', () => {
    const src = read('components/MaiaSettingsPanel.tsx');
    expect(src).toMatch(/withPreservedSanctuary\(DEFAULT_SETTINGS, prev\)/);
    expect(src).not.toMatch(/setSettings\(DEFAULT_SETTINGS\)/);
  });
});
