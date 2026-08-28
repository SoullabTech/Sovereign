/**
 * Account Settings — Persistent defaults for new sessions
 *
 * These are the user's preferences that apply when they start a new chat.
 * Distinct from session settings (QuickSettingsSheet) which override for current session.
 */

import type { ArchetypeId } from '@/lib/services/archetypePreferenceService';
import type { ConversationMode } from '@/lib/types/conversation-style';

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface AccountSettings {
  /** Default memory mode for new sessions */
  defaultMemoryMode: 'continuity' | 'sanctuary';

  /** Voice preferences */
  voice: {
    openaiVoice: 'alloy' | 'shimmer' | 'nova' | 'fable' | 'echo' | 'onyx';
    speed: number;
    model: 'tts-1' | 'tts-1-hd'; // Standard (faster) vs HD (richer)
    /** Range of Effect: scales prosody intensity (0-4) */
    prosodyRange: 0 | 1 | 2 | 3 | 4;
  };

  /** Memory depth when in continuity mode */
  memory: {
    depth: 'minimal' | 'moderate' | 'deep';
  };

  /** Default archetype/presence */
  archetype: ArchetypeId;

  /** Default conversation style */
  conversationMode: ConversationMode;

  /** Display preferences */
  display: {
    /** Show vocabulary tooltips for soul vocabulary terms */
    vocabularyTooltips: boolean;
  };

  /** Member's preferred name for MAIA (she remains MAIA internally) */
  preferredAssistantName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
  defaultMemoryMode: 'continuity', // Most users want memory; Sanctuary is opt-in
  voice: {
    openaiVoice: 'alloy',
    speed: 1.0,  // Natural pace (was 0.95, felt slow)
    model: 'tts-1', // Standard by default (faster response)
    prosodyRange: 1, // Subtle by default (warm without being theatrical)
  },
  memory: {
    depth: 'moderate',
  },
  archetype: 'AUTO' as ArchetypeId,
  conversationMode: 'her',
  display: {
    vocabularyTooltips: true, // Default on for newcomers learning soul vocabulary
  },
  preferredAssistantName: 'MAIA', // Default name, member can customize
};

const STORAGE_KEY = 'maia_account_settings';

// ─────────────────────────────────────────────────────────────────────────────
// Read / Write
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get account settings from localStorage, falling back to defaults
 */
export function getAccountSettings(): AccountSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCOUNT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_ACCOUNT_SETTINGS;
    }

    const parsed = JSON.parse(stored);
    // Merge with defaults to handle missing fields from older versions
    return {
      ...DEFAULT_ACCOUNT_SETTINGS,
      ...parsed,
      voice: { ...DEFAULT_ACCOUNT_SETTINGS.voice, ...parsed.voice },
      memory: { ...DEFAULT_ACCOUNT_SETTINGS.memory, ...parsed.memory },
      display: { ...DEFAULT_ACCOUNT_SETTINGS.display, ...parsed.display },
    };
  } catch (e) {
    console.error('[AccountSettings] Failed to parse stored settings:', e);
    return DEFAULT_ACCOUNT_SETTINGS;
  }
}

/**
 * Save account settings to localStorage
 */
export function saveAccountSettings(settings: AccountSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    // Emit event for other components that may need to react
    window.dispatchEvent(
      new CustomEvent('maia-account-settings-changed', { detail: settings })
    );
  } catch (e) {
    console.error('[AccountSettings] Failed to save settings:', e);
  }
}

/**
 * Update a single field in account settings
 */
export function updateAccountSetting<K extends keyof AccountSettings>(
  key: K,
  value: AccountSettings[K]
): AccountSettings {
  const current = getAccountSettings();
  const updated = { ...current, [key]: value };
  saveAccountSettings(updated);
  return updated;
}

/**
 * Reset account settings to defaults
 */
export function resetAccountSettings(): AccountSettings {
  saveAccountSettings(DEFAULT_ACCOUNT_SETTINGS);
  return DEFAULT_ACCOUNT_SETTINGS;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Initialization Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The LIVE session settings key. Not a new authority — this is the same
 * `maia_settings` that Quick Settings already writes and that
 * OracleConversation already reads into `isSanctuary`. Named here only so the
 * seeding below and its tests refer to one spelling.
 */
export const LIVE_SESSION_SETTINGS_KEY = 'maia_settings';

/**
 * SANCTUARY-SETTINGS-DISCONNECT-01 — seed the LIVE Sanctuary authority from the
 * member's account default, at a new-session boundary only.
 *
 * THE DEFECT THIS CLOSES. `getInitialSessionSettings()` maps
 * `defaultMemoryMode === 'sanctuary'` correctly, but Quick Settings consumes
 * that mapping only when `maia_settings` does not yet exist. Once it exists —
 * which is to say after the member's first ever visit — a new session inherited
 * whatever the browser happened to be holding. Intended new-session
 * initialization, implemented as first-browser-initialization. A member could
 * set Default Memory Mode to Sanctuary, see it selected in MAIA Settings, and
 * begin a new session in Continuity.
 *
 * WHY ONLY AT THE BOUNDARY. A default has authority over beginnings; a live
 * setting has authority over the encounter already underway. Continuously
 * syncing the default into an active session would let a Settings change
 * silently revoke consent the member gave mid-conversation via Quick Settings
 * or voice command. Callers must therefore invoke this ONLY when
 * `getOrCreateMaiaSessionId().isNew === true`.
 *
 * WHY ONLY `sanctuary`. The rest of the live settings keep their own semantics
 * and are deliberately untouched. This writes one field into an authority that
 * already exists; it does not introduce a second source of truth for whether
 * Sanctuary is active. The enforcement chain is unchanged:
 *   account default → (new session only) → maia_settings.sanctuary → isSanctuary
 *   → turn settings → retrieval / persistence suppression
 *
 * Dispatches `maia-settings-changed` so an already-mounted conversation picks
 * the value up live, exactly as a Quick Settings toggle does.
 *
 * @returns the seeded Sanctuary value, or null if it could not be applied.
 */
export function seedLiveSanctuaryForNewSession(): boolean | null {
  if (typeof window === 'undefined') return null;

  try {
    const sanctuary = getAccountSettings().defaultMemoryMode === 'sanctuary';

    // Preserve whatever else the live settings hold; only the Sanctuary field
    // is governed by the account default at a session boundary.
    const stored = localStorage.getItem(LIVE_SESSION_SETTINGS_KEY);
    const base = stored ? JSON.parse(stored) : getInitialSessionSettings();
    const next = { ...base, sanctuary };

    localStorage.setItem(LIVE_SESSION_SETTINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: next }));
    return sanctuary;
  } catch (e) {
    console.error('[AccountSettings] Failed to seed session Sanctuary:', e);
    return null;
  }
}

/**
 * Get initial session settings based on account defaults
 * Called when a new chat/session is created
 */
export function getInitialSessionSettings() {
  const account = getAccountSettings();

  return {
    sanctuary: account.defaultMemoryMode === 'sanctuary',
    voice: { ...account.voice },
    memory: {
      enabled: account.defaultMemoryMode === 'continuity',
      depth: account.memory.depth,
    },
    archetype: account.archetype,
    conversationMode: account.conversationMode,
  };
}
