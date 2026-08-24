/**
 * Structured refusal for an unauthenticated or mismatched-identity request.
 *
 * ⛔ NOT an auth authority. This module decides nothing about identity — it only
 * shapes the refusal that `getMemberIdFromRequest` / `requireMemberId` have
 * already decided on. The single auth authority remains those helpers.
 *
 * Why it exists: AUTH-01 §1A (AUTH EXPERIENCE INVARIANT — NO DEAD-END ERRORS)
 * requires that a member-facing failure carry three things — what happened,
 * whether retry can help, and what the member can do now. A bare
 * `{ error: 'Unauthorized' }` carries none of them, so a client receiving it can
 * only render a terminal red box.
 *
 * The field names mirror the contract `/api/members/email-code` already returns
 * (`error` · `reason` · `retryable`), so clients learn one shape, not two.
 */
import { NextResponse } from 'next/server';

export type AuthFailureReason =
  | 'auth_required'        // no verified credential presented
  | 'identity_mismatch';   // a credential was presented, but the identity claim disagreed

const COPY: Record<AuthFailureReason, string> = {
  auth_required:
    'Please sign in to continue.',
  // Deliberately not "you did something wrong": a mismatch is most often a stale
  // client after a member switched accounts, not an attack the member committed.
  identity_mismatch:
    'This session no longer matches your account. Please sign in again.',
};

/**
 * 401 with a recovery action. `retryable: false` because repeating the same
 * request without a new credential cannot succeed — per §1A rule 6, "try again"
 * is never offered where it cannot help. The honest next act is re-authentication.
 */
export function unauthenticatedResponse(
  reason: AuthFailureReason = 'auth_required',
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json(
    {
      error: COPY[reason],
      reason,
      retryable: false,
      action: { type: 'reauthenticate', href: '/signin' },
    },
    { status: 401, ...(headers ? { headers } : {}) }
  );
}
