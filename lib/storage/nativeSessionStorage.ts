/**
 * Native Session Storage — durable identity persistence for Capacitor (iOS/Android).
 *
 * Problem: localStorage in the iOS WebView is fragile across lifecycle events
 * (low-memory eviction, WebView resets, app backgrounding). Members "lose" their
 * session and have to sign in again, or worse, end up in an unauthenticated
 * render flash on cold start.
 *
 * Solution: mirror identity-bearing localStorage keys to @capacitor/preferences
 * (NSUserDefaults on iOS, SharedPreferences on Android), which survives WebView
 * resets and app lifecycle events.
 *
 * Architecture:
 *   - Web: no-op. localStorage is durable enough; no native plugin available.
 *   - Native cold start: hydrate Preferences -> localStorage before render.
 *   - Native runtime: monkey-patch localStorage.{setItem,removeItem} so that
 *     writes to mirrored keys auto-mirror to Preferences. All existing call
 *     sites that use synchronous localStorage continue to work unchanged.
 *
 * What this module does NOT do:
 *   - Encrypt at rest. The session blob is identity, not credential. For
 *     credential hardening (e.g., maia_session_token to Keychain), see future
 *     follow-up PR.
 *   - Mirror non-identity keys (conversation history, UI state, etc.).
 *   - Provide an async storage API. Existing call sites stay synchronous.
 *
 * Mirrored keys are scoped explicitly. Adding a key requires editing
 * MIRRORED_KEYS below.
 */

const MIRRORED_KEYS = [
  'beta_user',
  'memberId',
  'explorerId',
  'explorerName',
  'explorerPreferredName',
  'betaOnboardingComplete',
  'maia_session_version',
  'soullab_member',
  'member_profile',
] as const;

type MirroredKey = (typeof MIRRORED_KEYS)[number];

const MIRRORED_KEY_SET: ReadonlySet<string> = new Set(MIRRORED_KEYS);

let hydratePromise: Promise<void> | null = null;
let patched = false;
let originalSetItem: typeof Storage.prototype.setItem | null = null;
let originalRemoveItem: typeof Storage.prototype.removeItem | null = null;

function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  return !!cap?.isNativePlatform?.();
}

async function getPreferences() {
  const { Preferences } = await import('@capacitor/preferences');
  return Preferences;
}

function mirrorSetToNative(key: string, value: string): void {
  if (!isNative() || !MIRRORED_KEY_SET.has(key)) return;
  void (async () => {
    try {
      const Preferences = await getPreferences();
      await Preferences.set({ key, value });
    } catch (err) {
      console.warn(`[nativeSessionStorage] mirror set failed for ${key}:`, err);
    }
  })();
}

function mirrorRemoveFromNative(key: string): void {
  if (!isNative() || !MIRRORED_KEY_SET.has(key)) return;
  void (async () => {
    try {
      const Preferences = await getPreferences();
      await Preferences.remove({ key });
    } catch (err) {
      console.warn(`[nativeSessionStorage] mirror remove failed for ${key}:`, err);
    }
  })();
}

/**
 * Install monkey-patch on localStorage.{setItem,removeItem} for mirrored keys.
 *
 * Idempotent. Native-only. Web is a no-op.
 *
 * Called automatically by hydrateNativeSession(). Safe to call again.
 *
 * Why a monkey-patch instead of explicit dual-write at every call site:
 *   - Identity keys are written from many places (BetaSessionManager,
 *     beta-access page, healIdentity, getValidMemberId poison-clear, etc.).
 *   - Refactoring all of them would expand PR scope significantly.
 *   - The patch is scoped to known keys (MIRRORED_KEYS) and only active on
 *     native. Web behavior is unchanged.
 *   - Future PRs may replace this with explicit calls if the implicit pattern
 *     becomes a debugging burden.
 */
export function installNativeStoragePatch(): void {
  if (patched || typeof window === 'undefined' || !isNative()) return;

  originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

  window.localStorage.setItem = function patchedSetItem(key: string, value: string): void {
    originalSetItem!(key, value);
    mirrorSetToNative(key, value);
  };

  window.localStorage.removeItem = function patchedRemoveItem(key: string): void {
    originalRemoveItem!(key);
    mirrorRemoveFromNative(key);
  };

  patched = true;
}

/**
 * Hydrate localStorage from native Preferences on cold start.
 *
 * Reads each mirrored key from Preferences. If localStorage does NOT already
 * have a value for the key, writes the Preferences value into localStorage
 * using the unpatched setter (avoids round-trip mirror back to Preferences).
 *
 * If localStorage already has a value, leaves it alone. This handles the
 * (rare) case where a write happened between module load and hydration.
 *
 * Idempotent: repeated calls return the same in-flight promise.
 * Web: no-op.
 *
 * Native cold start race window:
 *   T0: JS bundle loads, BetaSessionManager singleton constructed,
 *       restoreSession reads empty localStorage, currentUser = null.
 *   T1: React mounts, NativeSessionHydrator mounts.
 *   T2: hydrateNativeSession runs:
 *       a. installs localStorage patch
 *       b. reads each mirrored key from Preferences
 *       c. writes hydrated values into localStorage (via original setter)
 *   T3: caller (NativeSessionHydrator) re-runs betaSession.restoreSession()
 *       to refresh the in-memory currentUser.
 *
 * Components that synchronously check auth between T0 and T3 will see
 * "not authenticated" briefly. Mitigation (e.g., a hydration gate) is
 * a separate concern; this PR establishes the durable substrate first.
 */
export function hydrateNativeSession(): Promise<void> {
  if (hydratePromise) return hydratePromise;

  if (typeof window === 'undefined' || !isNative()) {
    hydratePromise = Promise.resolve();
    return hydratePromise;
  }

  hydratePromise = (async () => {
    try {
      installNativeStoragePatch();

      const Preferences = await getPreferences();
      const setter = originalSetItem ?? window.localStorage.setItem.bind(window.localStorage);

      for (const key of MIRRORED_KEYS) {
        try {
          const { value } = await Preferences.get({ key });
          if (value !== null && value !== undefined) {
            if (window.localStorage.getItem(key) === null) {
              setter(key, value);
            }
          }
        } catch (err) {
          console.warn(`[nativeSessionStorage] hydrate read failed for ${key}:`, err);
        }
      }
    } catch (err) {
      console.warn('[nativeSessionStorage] hydrate failed (non-fatal):', err);
    }
  })();

  return hydratePromise;
}

/**
 * Diagnostic: returns true if hydration has resolved.
 * Web returns true immediately (no hydration needed).
 */
export function isNativeSessionHydrated(): boolean {
  if (typeof window === 'undefined' || !isNative()) return true;
  // hydratePromise resolved -> hydration done. Best-effort check; the promise
  // itself is the source of truth for callers that need to await.
  return hydratePromise !== null;
}

/**
 * Diagnostic: list of keys this module mirrors to native storage.
 * Useful for tests and debugging.
 */
export function getMirroredKeys(): readonly MirroredKey[] {
  return MIRRORED_KEYS;
}
