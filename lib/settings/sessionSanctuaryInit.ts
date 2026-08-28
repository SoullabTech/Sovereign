/**
 * SANCTUARY-SETTINGS-DISCONNECT-01 — new-session initialization of the live
 * Sanctuary authority from the member's account default.
 *
 * THE DEFECT THIS CLOSES
 *
 * `accountSettings.defaultMemoryMode` is documented as "Default memory mode for
 * new sessions", and `getInitialSessionSettings()` as "Called when a new
 * chat/session is created". But that function is only ever invoked from the
 * else-branch of a guard on the ABSENCE of `maia_settings`
 * (QuickSettingsSheet, ChatGPTStyleInput, SacredChatInput). `maia_settings`
 * lives in localStorage and is never cleared on sign-out — only on account
 * deletion — so after a member's very first visit the account default can
 * never reach the live authority again.
 *
 * Result, witnessed in production 2026-08-28: the member selects
 * "Default Memory Mode → Sanctuary", the card shows a check and reads
 * "Sessions aren't saved. Speak freely.", the selection persists across
 * reloads — and every turn ran in Continuity, retrieving cross-session memory
 * and persisting verbatim speech to maia_turns.
 *
 * THE TEMPORAL MODEL THIS PRESERVES
 *
 *   account default        how a NEW session begins
 *          ↓ (this module, at identity.isNew only)
 *   live session state     what is enforced right now
 *          ↓
 *   Quick Settings         may override THIS session, and must not be
 *                          overwritten for the rest of it
 *
 * A default determines how a session begins; it must not impersonate the
 * session's live authority. So this runs at exactly one boundary — the
 * canonical new-session event (`getOrCreateMaiaSessionId().isNew`, calendar-day
 * rotation) — and never on reload, re-render, or "New Conversation" within the
 * same session.
 *
 * WHY THE SERVER IS AUTHORITATIVE
 *
 * `defaultMemoryMode` is an account-level preference stored server-side in
 * member_settings.default_memory_mode and served by GET /api/members/settings
 * as `maia.defaultMemoryMode`. Reading only localStorage would begin a second
 * device in the wrong privacy mode — for a Class A boundary that is not
 * acceptable. Local `maia_account_settings` is a cache, not the source.
 */

import { ACCOUNT_SETTINGS_STORAGE_KEY } from './accountSettings';

export type MemoryMode = 'continuity' | 'sanctuary';

/** Where the applied value came from — recorded so a session can be explained. */
export type SanctuaryDefaultSource =
  | 'server'
  | 'local_cache'
  | 'fail_closed';

export interface SanctuaryDefaultResolution {
  sanctuary: boolean;
  source: SanctuaryDefaultSource;
}

/**
 * Decide the starting Sanctuary state for a new session.
 *
 * `cachedMode` must be the mode EXPLICITLY stored by the member, not a value
 * synthesized from defaults. `getAccountSettings()` merges
 * DEFAULT_ACCOUNT_SETTINGS and would hand back 'continuity' for a member who
 * has never chosen — indistinguishable from a deliberate choice of Continuity.
 * On a fresh device that is precisely the case that must fail closed, so the
 * caller reads the raw stored value and passes `null` when absent.
 */
export function resolveSessionSanctuary(input: {
  serverMode: MemoryMode | null;
  cachedMode: MemoryMode | null;
}): SanctuaryDefaultResolution {
  if (input.serverMode) {
    return { sanctuary: input.serverMode === 'sanctuary', source: 'server' };
  }
  if (input.cachedMode) {
    return { sanctuary: input.cachedMode === 'sanctuary', source: 'local_cache' };
  }
  // No authoritative value and no member-authored cache. Beginning a session in
  // Continuity here would retrieve cross-session memory and persist the turn on
  // a guess. The safe guess is the one that retains nothing.
  return { sanctuary: true, source: 'fail_closed' };
}

/** Read the member's explicitly stored account default, or null if unset. */
export function readCachedMemoryMode(): MemoryMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const mode = parsed?.defaultMemoryMode;
    return mode === 'sanctuary' || mode === 'continuity' ? mode : null;
  } catch {
    return null;
  }
}

/**
 * Write the resolved value into the live authority, preserving every other
 * field of `maia_settings` — the object is shared with Quick Settings, the
 * voice HUD and the settings panel, and this initialization owns exactly one
 * key of it.
 *
 * Also dispatches `maia-settings-changed` so an already-mounted
 * OracleConversation adopts the value without waiting for a remount. The event
 * detail carries the full object because that listener reads `detail.sanctuary`.
 */
export function applySessionSanctuary(sanctuary: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('maia_settings');
    const current = raw ? JSON.parse(raw) : {};
    const next = { ...current, sanctuary };
    localStorage.setItem('maia_settings', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: next }));
  } catch {
    // Never block session creation on a settings write.
  }
}

/**
 * Fetch the account default from the server. Returns null on any failure so the
 * caller falls through to cache, then to fail-closed. Deliberately quiet: a
 * network error must not surface as a broken session.
 *
 * The `memberId` query param is the route's documented fallback, not its primary
 * identification — GET /api/members/settings resolves the session first and only
 * reads the param when that is absent. It is passed anyway because that is the
 * path AccountSettings already uses, and because on Capacitor the cookie is not
 * sent cross-origin; there, dropping it would turn a resolvable default into a
 * fail-closed guess on every new session.
 */
export async function fetchServerMemoryMode(
  fetcher: (url: string) => Promise<Response>,
  memberId: string,
): Promise<MemoryMode | null> {
  try {
    const res = await fetcher(
      `/api/members/settings?memberId=${encodeURIComponent(memberId)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const mode = data?.maia?.defaultMemoryMode;
    return mode === 'sanctuary' || mode === 'continuity' ? mode : null;
  } catch {
    return null;
  }
}

/**
 * Full initialization for one new canonical session.
 *
 * ONLY call this when `getOrCreateMaiaSessionId()` reported `isNew: true`.
 * Calling it on a restored session would overwrite a deliberate Quick Settings
 * override with the account default — the "default impersonating live state"
 * failure this unit exists to prevent.
 *
 * Scoped to authenticated members: without a memberId there is no account
 * default to apply, so the live authority is left exactly as it is rather than
 * guessing on behalf of an account we cannot identify.
 */
export async function initializeSessionSanctuary(args: {
  memberId: string | null | undefined;
  fetcher: (url: string) => Promise<Response>;
}): Promise<SanctuaryDefaultResolution | null> {
  if (!args.memberId) return null;

  const serverMode = await fetchServerMemoryMode(args.fetcher, args.memberId);
  const resolution = resolveSessionSanctuary({
    serverMode,
    cachedMode: readCachedMemoryMode(),
  });

  applySessionSanctuary(resolution.sanctuary);
  return resolution;
}
