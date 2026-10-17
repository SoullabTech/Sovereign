/**
 * R1J — Actual Writer's Studio Apply/Undo preflight, READ ONLY and held.
 *
 * The user gesture checks the real authenticated, consented owner/Work
 * readiness endpoint BEFORE any legacy editorial mutation. That endpoint
 * proves only legacy manuscript ownership; its HTTP status, a beta flag,
 * or a forged response body can NEVER mint protected author authority.
 *
 * This intentionally does NOT release a production editorial provider,
 * write, KMS/key, protected approval, or replay token. One separately
 * reviewed source change will be needed to mount such an authority.
 */
import { apiFetch } from '@/lib/http/apiBase';

export const R1J_REAL_MEMBER_AUTHOR_ACTIONS_RELEASED = false as const;
export const R1J_PROTOCOL = 'soullab.ws.r1j.real-member-author-action.held.v1' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type R1JGesture = 'apply' | 'undo';
export type R1JPreflight = Readonly<{
  readonly kind: 'held';
  readonly action: R1JGesture;
  readonly authorized: false;
  readonly reason: 'no_manuscript_scope' | 'protected_writer_held' |
    'session_not_verified' | 'scope_not_available' |
    'readiness_unavailable' | 'read_only_is_not_authority';
  readonly message: string;
  readonly releaseApproved: false;
}>;

const held = (action: R1JGesture, reason: R1JPreflight['reason']): R1JPreflight => {
  const noAction = action === 'apply' ? 'No suggestion was applied.' : 'No Undo was performed.';
  return {
    kind: 'held', action, authorized: false, reason, releaseApproved: false,
    message: reason === 'session_not_verified'
      ? 'Please sign in again before editing. ' + noAction
      : reason === 'no_manuscript_scope'
        ? 'Open your manuscript before reviewing this edit. ' + noAction
        : reason === 'readiness_unavailable'
          ? 'Secure editing could not be verified right now. ' + noAction
          : 'Secure editorial ' + (action === 'apply' ? 'Apply' : 'Undo') +
            ' is not available for this Work yet. ' + noAction,
  };
};

/**
 * Exactly one authenticated metadata GET; no content body, author token,
 * alternative wording or mutable action is sent. EVEN AN HTTP 200 WITH A
 * forged "canApply" or "releaseApproved" remains an authorization refusal.
 */
export async function preflightRealAuthorActionR1J(
  manuscriptId: string | null | undefined,
  action: R1JGesture,
): Promise<R1JPreflight> {
  if (!manuscriptId || !UUID.test(manuscriptId)) return held(action, 'no_manuscript_scope');
  try {
    const response = await apiFetch(
      '/api/sovereign/writers-studio/manuscripts/' + encodeURIComponent(manuscriptId) + '/protected-readiness',
      { method: 'GET', cache: 'no-store', credentials: 'include' },
    );
    if (response.status === 401) return held(action, 'session_not_verified');
    if (response.status === 404 || response.status === 403) return held(action, 'scope_not_available');
    if (response.status === 423) return held(action, 'protected_writer_held');
    if (response.status === 503 || response.status === 500) return held(action, 'readiness_unavailable');
    // No read-only response (including 200) can supply a write capability.
    return held(action, 'read_only_is_not_authority');
  } catch {
    return held(action, 'readiness_unavailable');
  }
}
