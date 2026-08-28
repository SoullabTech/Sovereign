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
// Member ownership of the consent-bearing default
// ─────────────────────────────────────────────────────────────────────────────
//
// `defaultMemoryMode` is the only field here with a member-scoped server
// record (`members_settings.default_memory_mode`). Everything else — voice,
// prosody, tooltips — has always been device-local and is left exactly as it
// was (no ownership gate, no discard).
//
// The cache was write-through only: updateMaiaSetting PUT it to the server,
// and nothing ever read it back, so a signed-in member could inherit the
// previous member's default on a shared device. This stamp records whose
// default is cached, so an unprovable one is never served as this member's
// choice. Held in its own key so saveAccountSettings() stays unaware of it.

const OWNER_KEY = 'maia_account_settings_owner';

/**
 * The signed-in member, by the same reference every surface already uses
 * (`beta_user.id`, falling back to the passkey). Null when signed out or
 * unreadable — in which case ownership cannot be proven either way.
 */
function currentMemberRef(): string | null {
  try {
    const raw = localStorage.getItem('beta_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || user?.passkey || null;
  } catch {
    return null;
  }
}

/**
 * True only when the cached `defaultMemoryMode` is provably this member's.
 * An absent stamp is NOT proof: before this existed the cache was unattributed,
 * and an unattributed value may be the previous member's.
 */
function ownsCachedDefault(): boolean {
  const me = currentMemberRef();
  if (!me) return false;
  return localStorage.getItem(OWNER_KEY) === me;
}

function stampDefaultOwner(memberRef?: string | null): void {
  const owner = memberRef || currentMemberRef();
  if (owner) localStorage.setItem(OWNER_KEY, owner);
}

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
    const merged = {
      ...DEFAULT_ACCOUNT_SETTINGS,
      ...parsed,
      voice: { ...DEFAULT_ACCOUNT_SETTINGS.voice, ...parsed.voice },
      memory: { ...DEFAULT_ACCOUNT_SETTINGS.memory, ...parsed.memory },
      display: { ...DEFAULT_ACCOUNT_SETTINGS.display, ...parsed.display },
    };

    // Ownership gate — the consent-bearing field only. An unowned or foreign
    // cached default is not this member's choice, so it is not served as one;
    // they get the documented system default, exactly as a member arriving on
    // a fresh device would, until hydration establishes their real value.
    if (!ownsCachedDefault()) {
      merged.defaultMemoryMode = DEFAULT_ACCOUNT_SETTINGS.defaultMemoryMode;
    }

    return merged;
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


// ─────────────────────────────────────────────────────────────────────────────
// Member-scoped hydration (SANCTUARY-MEMBER-SCOPE-01)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adopt the authenticated member's server-backed `defaultMemoryMode` as the
 * local default, and record that it is theirs.
 *
 * `serverDefaultMemoryMode` comes from `GET /api/members/settings` →
 * `maia.defaultMemoryMode`. A missing or unrecognised value means the server
 * did not answer for this field: the stamp is NOT written, so the ownership
 * gate keeps returning the system default rather than promoting whatever the
 * device happens to be holding.
 *
 * Touches the one consent-bearing field. Unrelated local settings keep their
 * existing device-local semantics.
 */
export function hydrateAccountSettingsForMember(
  memberRef: string,
  serverDefaultMemoryMode: unknown,
): void {
  if (typeof window === 'undefined' || !memberRef) return;

  if (serverDefaultMemoryMode !== 'continuity' && serverDefaultMemoryMode !== 'sanctuary') {
    // Unresolved. Leave the cache unowned — an unproven default must not be
    // silently adopted as this member's choice.
    console.warn('[AccountSettings] No server defaultMemoryMode for member; cache stays unowned');
    return;
  }

  const current = getAccountSettings(); // already gated, so never leaks a foreign value
  saveAccountSettings({ ...current, defaultMemoryMode: serverDefaultMemoryMode });
  stampDefaultOwner(memberRef);
}

/**
 * Fetch-and-adopt, for surfaces that do not already hold the settings payload.
 * Resolves to the member's default in force, and never throws — a failed
 * hydration leaves the cache unowned and the gate serving the system default.
 */
export async function loadMemberDefaultMemoryMode(
  memberRef: string,
  fetcher: (url: string) => Promise<Response>,
): Promise<AccountSettings['defaultMemoryMode']> {
  try {
    const res = await fetcher(`/api/members/settings?memberId=${encodeURIComponent(memberRef)}`);
    if (res.ok) {
      const data = await res.json();
      hydrateAccountSettingsForMember(memberRef, data?.maia?.defaultMemoryMode);
    } else {
      console.warn('[AccountSettings] Member settings fetch failed:', res.status);
    }
  } catch (e) {
    console.warn('[AccountSettings] Member settings hydration error:', e);
  }
  return getAccountSettings().defaultMemoryMode;
}

/** Record that the current member owns the cached default (they just set it). */
export function claimDefaultMemoryModeOwnership(memberRef?: string | null): void {
  if (typeof window === 'undefined') return;
  stampDefaultOwner(memberRef);
}
