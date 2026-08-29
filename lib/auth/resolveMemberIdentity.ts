/**
 * DESKTOP-MAIA-IDENTITY-HYDRATION-01 — server identity is authoritative.
 *
 * THE RULE, as ruled:
 *
 *     When `/maia` has a valid server session, server identity is
 *     authoritative. localStorage may CACHE identity; it may never
 *     ORIGINATE authenticated identity.
 *
 * ⛔ WHAT THIS REPLACES, and why the old shape was an inversion rather than a
 * missing feature. `getInitialUserData()` in `app/maia/page.tsx` asked:
 *
 *     does localStorage hold an id?
 *       no  → { id: 'guest', name: 'Friend' }
 *       yes → ask the server ABOUT THAT CLAIMED ID
 *
 * Every branch was gated on localStorage, and the one server call passed the
 * claimed id as a query parameter. The client asserted who it was; it never
 * asked. A browser holding a perfectly valid `maia_session` cookie but no
 * localStorage — a fresh profile, cleared site data, or Desktop's deliberately
 * non-persistent `maia-platform` partition — resolved to `guest` / `Friend`.
 *
 * That was never only a label. It returned `id: 'guest'`, which is how a
 * signed-in member's surface came to make requests as `soul_guest`.
 *
 * ⛔ WHY A MODULE AND NOT A PATCH IN THE PAGE. The rule is one sentence and the
 * page is 2,000 lines. Put here, the rule can be exercised directly — including
 * the cases that matter most and are hardest to reach through a React tree: a
 * server that says no, a server that cannot be reached, and a cache that
 * disagrees with an explicit verdict.
 *
 * ⛔ THREE OUTCOMES, NEVER TWO. `error` is not folded into `unauthenticated`.
 * Converting an unreachable server into "you are a guest" is precisely how an
 * authenticated member silently becomes `soul_guest` — the defect this module
 * exists to remove, reintroduced one level down. A caller must be able to tell
 * "the server says you are not signed in" from "we could not ask".
 */

/**
 * The resolution lifecycle. `resolving` is the caller's initial state and is
 * never returned by the resolver — it exists so a surface can WAIT rather than
 * render as a guest while the question is still open.
 */
export type IdentityState = 'resolving' | 'authenticated' | 'unauthenticated' | 'error';

export interface ResolvedIdentity {
  state: Exclude<IdentityState, 'resolving'>;
  /** The server's member id. Null unless `state === 'authenticated'`. */
  memberId: string | null;
  /** preferredName › name › username, in that order. */
  displayName: string | null;
  username: string | null;
  /** The server's own reason when it declined, or a transport failure label. */
  reason: string | null;
  /** Which credential the server says carried the session: cookie | header | none. */
  credentialSource: string | null;
}

const TIMEOUT_MS = 6000;
/** One retry. A transient failure should not need a member to do anything. */
const ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;

/** localStorage keys this module is permitted to WRITE. It reads none of them. */
const CACHE_KEYS = { id: 'explorerId', name: 'explorerName', preferred: 'explorerPreferredName' };

interface Deps {
  fetchImpl?: (path: string, init?: RequestInit) => Promise<Response>;
  sleep?: (ms: number) => Promise<void>;
  attempts?: number;
  now?: () => number;
}

/**
 * A name we are willing to show. The server can legitimately hold a username
 * that is a UUID or a placeholder, and displaying either is worse than
 * displaying nothing — the surface has its own greeting for an absent name.
 */
function usableName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  if (v.toLowerCase() === 'friend' || v.toLowerCase() === 'guest') return null;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) return null;
  return v;
}

/**
 * Ask the server who this member is.
 *
 * ⛔ Never throws. A caller that has to wrap this in try/catch would be free to
 * decide, in the catch, that the member is a guest.
 */
export async function resolveMemberIdentity(deps: Deps = {}): Promise<ResolvedIdentity> {
  // ⛔ apiFetch is imported LAZILY and by RELATIVE path. Relative because this
  // module must be loadable by a plain test runner with no `@/` alias, and lazy
  // so exercising the rule never has to drag in the whole HTTP layer — a test
  // that has to stub a transport graph is a test people stop writing.
  const doFetch = deps.fetchImpl || (async (p: string, i?: RequestInit) => {
    const { apiFetch } = await import('../http/apiBase');
    return apiFetch(p, i);
  });
  const sleep = deps.sleep || ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const attempts = deps.attempts ?? ATTEMPTS;

  const failure = (reason: string): ResolvedIdentity => ({
    state: 'error', memberId: null, displayName: null, username: null,
    reason, credentialSource: null,
  });

  let lastReason = 'unreachable';

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let data: any = null;
    try {
      // apiFetch, NOT bare fetch: on native a relative /api/* path resolves to
      // capacitor://localhost and never reaches the server, and apiFetch is
      // what attaches `x-session-token`.
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
      try {
        const res = await doFetch('/api/auth/whoami', {
          method: 'GET',
          ...(controller ? { signal: controller.signal } : {}),
        });
        // ⛔ A 5xx is a failure to ASK, not an answer. Only a parsed body with an
        // explicit `authed` field is treated as the server having spoken.
        if (!res || !res.ok) { lastReason = `http_${res ? res.status : 'none'}`; }
        else data = await res.json().catch(() => null);
      } finally {
        if (timer) clearTimeout(timer);
      }
    } catch {
      lastReason = 'unreachable';
    }

    if (data && typeof data === 'object' && typeof data.authed === 'boolean') {
      if (data.authed === true && typeof data.memberId === 'string' && data.memberId) {
        const displayName =
          usableName(data.preferredName) || usableName(data.name) || usableName(data.username);
        cacheIdentity(data.memberId, displayName);
        return {
          state: 'authenticated',
          memberId: data.memberId,
          displayName,
          username: typeof data.username === 'string' ? data.username : null,
          reason: null,
          credentialSource: data.credentialSource ?? null,
        };
      }
      // ⛔ An EXPLICIT verdict. The caller's guest/onboarding path may decide
      // what an actual guest experiences, but nothing cached may promote this
      // back into an authenticated identity.
      if (data.authed === false) {
        return {
          state: 'unauthenticated',
          memberId: null, displayName: null, username: null,
          reason: data.reason ?? null,
          credentialSource: data.credentialSource ?? null,
        };
      }
      // authed true but no memberId: the server contradicted itself. Not a
      // guest — an error, so the surface says so instead of quietly demoting.
      lastReason = 'authed_without_member';
    }

    if (attempt < attempts) await sleep(RETRY_DELAY_MS);
  }

  return failure(lastReason);
}

/**
 * Write the resolved identity into the localStorage keys the rest of the app
 * still reads.
 *
 * ⛔ A CACHE, downstream of the verdict — never an input to it. This module
 * reads none of these keys, which is the structural half of "localStorage may
 * never originate authenticated identity".
 *
 * ⛔ It does not DELETE on an unauthenticated verdict. A verdict is authority
 * over what we display now; deleting would make a single expired-session
 * response destroy local state a member may still need to recover, and an
 * offline boot must never be able to erase someone's device.
 */
function cacheIdentity(memberId: string, displayName: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEYS.id, memberId);
    if (displayName) {
      localStorage.setItem(CACHE_KEYS.name, displayName);
      localStorage.setItem(CACHE_KEYS.preferred, displayName);
    }
  } catch { /* a full or blocked store must not break arrival */ }
}
