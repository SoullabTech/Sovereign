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

// ─────────────────────────────────────────────────────────────────────────────
// Session Sanctuary Flag — the live runtime boundary
// ─────────────────────────────────────────────────────────────────────────────
//
// `maia_account_settings.defaultMemoryMode` is the member's *default*. The live
// boundary that actually gates retention for the conversation in front of them
// is `maia_settings.sanctuary` — read by OracleConversation (badge, prompt
// wire, Keep refusal, continuity-buffer purge), VoiceHUD, the chat inputs and
// /maia. Those two used to drift: the settings surfaces wrote only the default,
// so a Sanctuary session entered in-HUD stayed on forever and no settings
// screen could clear it. Everything that changes the live boundary goes through
// setSessionSanctuary() so the flag and the `maia-settings-changed` event that
// every listener depends on can never come apart.

const SESSION_STORAGE_KEY = 'maia_settings';

/**
 * Provenance only: which canonical session the live `sanctuary` value belongs
 * to. It never answers *whether* Sanctuary is on — `sanctuary` remains the
 * single live authority. It answers only whether that authority is this
 * session's, which is what tells a reload (preserve the member's override)
 * apart from a genuinely new session (consume the default again).
 */

/** Read the live session Sanctuary flag. */
export function getSessionSanctuary(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return false;
    return JSON.parse(saved).sanctuary === true;
  } catch (e) {
    console.warn('[AccountSettings] Failed to read session sanctuary flag:', e);
    return false;
  }
}

/**
 * Set the live session Sanctuary flag and notify every listener.
 *
 * Turning it ON is always safe — it narrows what is kept. Turning it OFF widens
 * consent, so callers must only do it on an explicit member act. Nothing here
 * is retroactive either way: turns taken inside Sanctuary were never persisted,
 * and leaving Sanctuary cannot reach back for them (Sanctuary invariant 6).
 *
 * Read-modify-write, so the session's provenance stamp survives: an override
 * belongs to the session it was made in, and must not look like a new one.
 */
export function setSessionSanctuary(enabled: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    const settings = saved ? JSON.parse(saved) : {};
    settings.sanctuary = enabled;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent('maia-settings-changed', { detail: settings })
    );
  } catch (e) {
    console.error('[AccountSettings] Failed to set session sanctuary flag:', e);
  }
}

/**
 * The ONE place a new session consumes the member's default.
 *
 * Idempotent by construction: it compares the caller's canonical sessionId
 * against the provenance stamp rather than asking which component happened to
 * mint the session first. `getOrCreateMaiaSessionId()` is crossed at three
 * sites — /maia, the MaiaPresence sheet, /field/talk — and only one of them
 * ever read `isNew`. Hanging the seed off any single site would stay
 * timing-dependent; a stamp comparison does not care who arrives first, or how
 * many times.
 *
 * Returns the live Sanctuary value in force for `currentSessionId`.
 */
export function ensureSessionSanctuary(currentSessionId: string): boolean {
  if (typeof window === 'undefined') return false;

  // No canonical session means no boundary to enforce. Report the live value
  // untouched rather than seeding against an id we cannot stamp.
  if (!currentSessionId) return getSessionSanctuary();

  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    const settings = saved ? JSON.parse(saved) : {};

    // Same session — the member's override stands, reload or not.
    if (settings.sessionId === currentSessionId) {
      return settings.sanctuary === true;
    }

    // Different or absent provenance: whatever `sanctuary` holds is residue
    // from a previous session (or from before provenance existed) and has no
    // authority here. Seed from the default in both directions — stale
    // Sanctuary must not survive a Continuity default any more than stale
    // Continuity may survive a Sanctuary one.
    const seeded = getAccountSettings().defaultMemoryMode === 'sanctuary';
    settings.sanctuary = seeded;
    settings.sessionId = currentSessionId;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent('maia-settings-changed', { detail: settings })
    );
    return seeded;
  } catch (e) {
    console.error('[AccountSettings] Failed to establish session sanctuary:', e);
    return getSessionSanctuary();
  }
}
