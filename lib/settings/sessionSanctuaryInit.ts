/**
 * SANCTUARY-DEFAULT-RESOLVE-01 — resolving the member's account Sanctuary
 * default for a new session.
 *
 * RESOLVER INFRASTRUCTURE ONLY. Nothing here is wired to a call site yet. It
 * decides what a new session's Sanctuary state *should* be; deciding *when* to
 * apply it, and gating dispatch until that is known, belong to
 * SANCTUARY-INIT-GATE-01 and are deliberately not in this unit.
 *
 * THE DEFECT THIS SERVES
 *
 * `defaultMemoryMode` is documented as governing new sessions, and
 * `getInitialSessionSettings()` as being "called when a new chat/session is
 * created". But the only paths that invoke it are guarded on `maia_settings`
 * being ABSENT — true once per browser, ever, since that key is never cleared
 * on sign-out. So after a member's first visit the account default could never
 * reach the live authority again. Witnessed in production 2026-08-28: MAIA
 * Settings showed Sanctuary selected and read "Sessions aren't saved. Speak
 * freely," while every turn ran in Continuity, retrieved cross-session memory,
 * and persisted verbatim speech.
 *
 * WHY THE SERVER IS AUTHORITATIVE
 *
 * `defaultMemoryMode` is an account-level preference held server-side and
 * served by GET /api/members/settings as `maia.defaultMemoryMode`. Reading only
 * localStorage would begin a second device in the wrong privacy mode — the
 * member's standing choice would simply not exist there. Local
 * `maia_account_settings` is a cache, not the source.
 *
 * WHY A SYNTHESIZED DEFAULT IS NOT A MEMBER CHOICE
 *
 * The single most important distinction in this file. `getAccountSettings()`
 * merges DEFAULT_ACCOUNT_SETTINGS, whose `defaultMemoryMode` is `'continuity'`.
 * Reading through that merge makes "never chose" look identical to "chose
 * Continuity" — and on a fresh device that is exactly the case that must not
 * resolve to Continuity. So the cache is read RAW, and absence is reported as
 * absence.
 *
 * An unresolved preference must never be treated as though the member chose it.
 *
 * ORDERING IS NOT OUTCOME
 *
 * `resolveSessionSanctuary` returning Sanctuary on failure makes the *decision*
 * safe. It does not by itself make initialization fail closed: a turn that
 * dispatches before resolution completes has already retrieved and persisted,
 * and a later write of `sanctuary: true` cannot retract it. Callers must not
 * treat this module as sufficient — the dispatch gate is a separate unit.
 *
 * Design donated by candidate 612633255; replayed here from current canonical
 * rather than merged, per founder ruling.
 */

import { ACCOUNT_SETTINGS_STORAGE_KEY } from './accountSettings';

export type MemoryMode = 'continuity' | 'sanctuary';

/** Where the resolved value came from, so a session can be explained afterwards. */
export type SanctuaryDefaultSource = 'server' | 'local_cache' | 'fail_closed';

export interface SanctuaryDefaultResolution {
  sanctuary: boolean;
  source: SanctuaryDefaultSource;
}

/** The live session key. Not a new authority — the one Quick Settings already writes. */
export const LIVE_SESSION_SETTINGS_KEY = 'maia_settings';

/**
 * Decide the starting Sanctuary state for a new session.
 *
 * `cachedMode` must be the mode the member EXPLICITLY stored — pass `null` when
 * absent or unrecognized. Do not pass the result of `getAccountSettings()`; see
 * the note on synthesized defaults above.
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
  // Neither an authoritative value nor a member-authored cache. Beginning in
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
    const mode = JSON.parse(raw)?.defaultMemoryMode;
    return mode === 'sanctuary' || mode === 'continuity' ? mode : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the account default from the server. Returns null on any failure so the
 * caller falls through to cache, then to fail-closed. Deliberately quiet: a
 * network error must not surface as a broken session.
 *
 * `memberId` is the route's documented fallback rather than its primary
 * identification — the route resolves the session first. It is passed anyway
 * because on Capacitor the cookie is not sent cross-origin, and dropping it
 * there would turn a resolvable default into a fail-closed guess every time.
 */
export async function fetchServerMemoryMode(
  fetcher: (url: string) => Promise<Response>,
  memberId: string,
): Promise<MemoryMode | null> {
  try {
    const res = await fetcher(`/api/members/settings?memberId=${encodeURIComponent(memberId)}`);
    if (!res.ok) return null;
    const mode = (await res.json())?.maia?.defaultMemoryMode;
    return mode === 'sanctuary' || mode === 'continuity' ? mode : null;
  } catch {
    return null;
  }
}

/**
 * Write a resolved value into the existing live authority, preserving every
 * other field — `maia_settings` is shared with Quick Settings, the voice HUD
 * and the settings panel, and this owns exactly one key of it. No new authority
 * is created and none is retired.
 *
 * Dispatches `maia-settings-changed` so an already-mounted OracleConversation
 * adopts the value without a remount, exactly as a Quick Settings toggle does.
 *
 * UNWIRED IN THIS UNIT. Provided so the gate unit has a tested writer; calling
 * it anywhere other than a genuine new-session boundary would let a default
 * overwrite a member's live override mid-encounter.
 */
export function applySessionSanctuary(sanctuary: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LIVE_SESSION_SETTINGS_KEY);
    const next = { ...(raw ? JSON.parse(raw) : {}), sanctuary };
    localStorage.setItem(LIVE_SESSION_SETTINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: next }));
  } catch {
    // Never block session creation on a settings write.
  }
}

/**
 * Resolve the account default for one new session, without applying it.
 *
 * Returns null for an unauthenticated visitor: with no member there is no
 * account default, and guessing on behalf of an account we cannot identify
 * would be inventing consent rather than reading it.
 *
 * Application is deliberately NOT performed here. A caller that resolves and
 * applies in one non-blocking call has an ordering hazard, not a safe default —
 * see ORDERING IS NOT OUTCOME above. SANCTUARY-INIT-GATE-01 owns the sequence.
 */
export async function resolveSessionSanctuaryForMember(args: {
  memberId: string | null | undefined;
  fetcher: (url: string) => Promise<Response>;
}): Promise<SanctuaryDefaultResolution | null> {
  if (!args.memberId) return null;
  const serverMode = await fetchServerMemoryMode(args.fetcher, args.memberId);
  return resolveSessionSanctuary({ serverMode, cachedMode: readCachedMemoryMode() });
}
