/**
 * SANCTUARY-SETTINGS-DISCONNECT-01 — new-session initialization of the live
 * Sanctuary authority from the member's account default.
 *
 * THE DEFECT THIS CLOSES
 *
 * `accountSettings.defaultMemoryMode` is documented "Default memory mode for new
 * sessions", and `getInitialSessionSettings()` as "Called when a new chat/session
 * is created". But that function is only reachable from the else-branch of a
 * guard on `maia_settings` being ABSENT — true once per browser, ever, because
 * `maia_settings` lives in localStorage and is cleared only on account deletion.
 *
 * Witnessed in production 2026-08-28: "Default Memory Mode → Sanctuary" showed a
 * check and "Sessions aren't saved. Speak freely.", persisted across reloads, and
 * every turn ran in Continuity — retrieving cross-session memory and persisting
 * verbatim speech to maia_turns.
 *
 * THE TEMPORAL MODEL
 *
 *   account default   how a NEW session begins
 *        ↓ (this module, at identity.isNew ONLY)
 *   live session      what is enforced right now
 *        ↓
 *   Quick Settings    may override THIS session — and must win, even against a
 *                     default that is still resolving
 *
 * A default determines how a session begins; it must never impersonate or
 * overrule the session's live authority.
 *
 * ─── V2 (Phase 2B) — four invariants V1 did not hold ────────────────────────
 *
 * A. NO PRE-INITIALIZATION TURN.
 *    V1's first act was an awaited fetch, so a new session ran under the PREVIOUS
 *    session's stale value until the server answered. If that stale value was
 *    Continuity and the account default was Sanctuary, a fast first turn escaped
 *    the boundary entirely. V2 closes Sanctuary SYNCHRONOUSLY before any await,
 *    then relaxes to Continuity only once the server authorizes it. The cost is a
 *    brief Sanctuary indicator on Continuity sessions; the alternative is a
 *    window in which the member's chosen boundary is not yet real.
 *
 * B. LIVE OVERRIDE WINS.
 *    A member can change Quick Settings while the fetch is in flight. V1 applied
 *    the resolved default unconditionally afterwards, silently discarding the
 *    newer, explicit choice. V2 snapshots what it asserted and re-reads the live
 *    value before relaxing; any divergence means someone else wrote, and the
 *    default stands down.
 *
 * C. FAIL-CLOSED MEANS ENFORCED.
 *    V1 wrapped parse, write and dispatch in one try/catch and returned the
 *    resolution regardless, so `source: 'fail_closed'` could be reported while
 *    the live conversation stayed in Continuity. V2 reports what actually
 *    happened — persisted, notified — and never claims a boundary it did not set.
 *
 * D. CACHE MUST HAVE IDENTITY PROVENANCE — and does not.
 *    `maia_account_settings` carries no member identity, so a cached default
 *    cannot be shown to belong to the current member. On a shared browser it may
 *    belong to someone else. The fallback is therefore REMOVED rather than
 *    repaired: precedence is server → fail-closed. Reinstating it requires
 *    stamping member identity into that store, which is a separate unit.
 */

export type MemoryMode = 'continuity' | 'sanctuary';

/** Where the applied value came from — recorded so a session can be explained. */
export type SanctuaryDefaultSource = 'server' | 'fail_closed';

export interface ApplyOutcome {
  /** The value survived into maia_settings (so a later mount reads it). */
  persisted: boolean;
  /** maia-settings-changed was dispatched (so a mounted component adopts it). */
  notified: boolean;
}

export interface SanctuaryDefaultResolution {
  sanctuary: boolean;
  source: SanctuaryDefaultSource;
  /** False when a member override landed while the default was resolving (B2). */
  applied: boolean;
  /**
   * C2 — enforcement means the LIVE conversation adopted the value.
   *
   * By the time this initializer runs, OracleConversation is already mounted and
   * holds `isSanctuary` in React state. It adopts external changes ONLY through
   * `maia-settings-changed`; a successful localStorage write does not reach it —
   * that write is read at MOUNT, which has already happened. So persistence is
   * durability for the next mount, not enforcement for this conversation, and
   * `persisted || notified` was too permissive: it reported a live boundary from
   * a write no live component would ever read.
   */
  enforced: boolean;
  /** True when a member-authoritative write landed and the default stood down. */
  overriddenByMember: boolean;
}

/**
 * Decide the starting Sanctuary state for a new session.
 *
 * There is deliberately no local-cache branch — see (D) above. An unrecognized or
 * absent server value fails closed rather than assuming Continuity, because
 * beginning in Continuity on a guess retrieves cross-session memory and persists
 * the turn. The safe guess is the one that retains nothing.
 */
export function resolveSessionSanctuary(input: {
  serverMode: MemoryMode | null;
}): { sanctuary: boolean; source: SanctuaryDefaultSource } {
  if (input.serverMode) {
    return { sanctuary: input.serverMode === 'sanctuary', source: 'server' };
  }
  return { sanctuary: true, source: 'fail_closed' };
}

/** Read the live authority as it currently stands, or null if unreadable. */
export function readLiveSanctuary(): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('maia_settings');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.sanctuary === 'boolean' ? parsed.sanctuary : null;
  } catch {
    return null;
  }
}

/**
 * Write the value into the live authority and announce it.
 *
 * Persist and notify are attempted INDEPENDENTLY. In V1 a single try/catch meant
 * a malformed `maia_settings` threw during parse and skipped both — leaving the
 * conversation in Continuity while the caller reported fail_closed. Here a parse
 * failure still results in a write and a dispatch.
 *
 * On unparseable existing settings the object is replaced rather than merged.
 * Nothing usable is lost — it could not be read — and a privacy boundary is not
 * withheld to preserve bytes that no reader can interpret.
 */
export function applySessionSanctuary(sanctuary: boolean): ApplyOutcome {
  if (typeof window === 'undefined') return { persisted: false, notified: false };

  let base: Record<string, unknown> = {};
  try {
    const raw = localStorage.getItem('maia_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') base = parsed;
    }
  } catch {
    // Corrupt object: fall through with {} rather than abandoning the write.
  }

  const next = { ...base, sanctuary };

  let persisted = false;
  try {
    localStorage.setItem('maia_settings', JSON.stringify(next));
    persisted = true;
  } catch {
    // Quota, private mode, or a disabled store. The dispatch below can still
    // reach a mounted OracleConversation, so enforcement is not yet lost.
  }

  let notified = false;
  try {
    window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: next }));
    notified = true;
  } catch {
    // Nothing further to try.
  }

  return { persisted, notified };
}

/**
 * Fetch the account default from the server. Returns null on any failure so the
 * caller fails closed. Deliberately quiet: a network error must not surface as a
 * broken session.
 *
 * The `memberId` query param is the route's documented fallback, not its primary
 * identification — GET /api/members/settings resolves the session first. It is
 * passed because that is the path AccountSettings already uses, and because on
 * Capacitor the cookie is not sent cross-origin; dropping it there would turn a
 * resolvable default into a fail-closed guess on every new session.
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
 * A2 — close the boundary BEFORE the conversation surface can accept a turn.
 *
 * V2 closed Sanctuary before the initializer's first `await`, which was not
 * early enough. `/maia` mounts, renders OracleConversation, and only THEN awaits
 * `getInitialUserData()` before it can even ask whether the session is new. The
 * conversation is live across that await, and `handleTextMessage` carries no
 * readiness guard — so a fast first turn could still escape under the previous
 * session's stale Continuity.
 *
 * `peekMaiaSessionId()` reads the session without minting one, and returns null
 * in exactly the cases where `getOrCreateMaiaSessionId()` would mint: absent, or
 * belonging to a previous calendar day. So a synchronous peek is enough to know
 * a new session is imminent, before any network work and before any child
 * component exists.
 *
 * Called from a `useState` initializer in app/maia/page.tsx, which React runs
 * during the parent's render — strictly before OracleConversation renders or
 * mounts. Nothing can send a turn before this has run.
 *
 * Deliberately pessimistic: it closes without knowing the member's default. The
 * default can only ever RELAX it afterwards, and only on the server's authority.
 */
export function bootCloseSanctuaryIfNewSession(
  peek: () => string | null,
): { closed: boolean; outcome: ApplyOutcome | null } {
  if (typeof window === 'undefined') return { closed: false, outcome: null };
  if (peek() !== null) return { closed: false, outcome: null };
  return { closed: true, outcome: applySessionSanctuary(true) };
}

/**
 * Full initialization for one new canonical session.
 *
 * ONLY call this when `getOrCreateMaiaSessionId()` reported `isNew: true`.
 * Calling it on a restored session would overwrite a deliberate Quick Settings
 * override with the account default.
 *
 * Scoped to authenticated members: with no memberId there is no account default
 * to apply, so the live authority is left untouched rather than invented.
 */
export async function initializeSessionSanctuary(args: {
  memberId: string | null | undefined;
  fetcher: (url: string) => Promise<Response>;
}): Promise<SanctuaryDefaultResolution | null> {
  if (!args.memberId) return null;

  // Idempotent re-close. bootCloseSanctuaryIfNewSession() has normally already
  // done this during render; repeating it costs one write and guarantees the
  // boundary regardless of how this function is reached.
  const closed = applySessionSanctuary(true);
  const asserted = true;

  // (B2) OVERRIDE PROVENANCE — observe WRITES, not values.
  //
  // V2 compared the final boolean against what it asserted, which misses the
  // sequence that matters: member turns Sanctuary OFF then back ON while the
  // fetch is in flight. The final value equals the asserted value, so V2 saw
  // "no override" and relaxed to Continuity — destroying a deliberate, newer
  // choice. The question is not "is the value different" but "did a
  // member-authoritative write happen while we were resolving".
  //
  // Every member-authoritative writer (QuickSettingsSheet, VoiceHUD, the
  // settings panel) dispatches `maia-settings-changed` on write. Listening for
  // it is therefore a provenance signal that requires modifying none of them —
  // which matters, because Quick Settings is not defective and must not be
  // touched by this unit. The listener is attached AFTER our own close above, so
  // our own dispatch cannot be mistaken for a member action.
  let memberWrote = false;
  const onMemberWrite = () => { memberWrote = true; };
  try {
    window.addEventListener('maia-settings-changed', onMemberWrite);
  } catch {
    // No event target: fall back to the value comparison below, which is weaker
    // but better than nothing.
  }

  let serverMode: MemoryMode | null;
  try {
    serverMode = await fetchServerMemoryMode(args.fetcher, args.memberId);
  } finally {
    try { window.removeEventListener('maia-settings-changed', onMemberWrite); } catch { /* noop */ }
  }
  const resolved = resolveSessionSanctuary({ serverMode });

  // A write we did not make, or a value we did not assert: either way a newer
  // authority exists and this default stands down.
  const live = readLiveSanctuary();
  if (memberWrote || (live !== null && live !== asserted)) {
    return {
      ...resolved,
      applied: false,
      enforced: closed.notified,
      overriddenByMember: true,
    };
  }

  // Already in the resolved state — no second write, no redundant event.
  if (resolved.sanctuary === asserted) {
    return { ...resolved, applied: true, enforced: closed.notified, overriddenByMember: false };
  }

  const relaxed = applySessionSanctuary(resolved.sanctuary);
  return {
    ...resolved,
    applied: true,
    // (C2) The mounted conversation adopts changes only via the event.
    enforced: relaxed.notified,
    overriddenByMember: false,
  };
}
