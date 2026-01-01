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
  };

  /** Memory depth when in continuity mode */
  memory: {
    depth: 'minimal' | 'moderate' | 'deep';
  };

  /** Default archetype/presence */
  archetype: ArchetypeId;

  /** Default conversation style */
  conversationMode: ConversationMode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
  defaultMemoryMode: 'continuity', // Most users want memory; Sanctuary is opt-in
  voice: {
    openaiVoice: 'shimmer',
    speed: 0.95,
  },
  memory: {
    depth: 'moderate',
  },
  archetype: 'AUTO' as ArchetypeId,
  conversationMode: 'her',
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
