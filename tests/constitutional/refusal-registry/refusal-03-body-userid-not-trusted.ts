import type { RefusalCheck } from './harness';

/**
 * Refusal 03 — Request identity is never taken from a client-asserted claim.
 *
 * The identity resolver derives the member id ONLY from a validated
 * auth_sessions credential (session cookie or x-session-token). A bare
 * x-member-id / maia_member_id claim is honoured only if it matches the verified
 * session; a mismatch is rejected as impersonation. No request body is read.
 */

const RESOLVER = 'lib/auth/getMemberFromRequest.ts';

export const check: RefusalCheck = {
  id: 'R03',
  refusal: 'Request identity is never trusted from a client-asserted claim (body userId / bare header)',
  grade: 'A',
  enforcedBy: 'lib/auth/getMemberFromRequest.ts — identity resolved only from auth_sessions token',
  evidence: 'verifiedMemberId ← memberIdForSessionToken (:39,:46); no-session → null (:51-53); impersonation guard (:63-68)',
  violationAttempted: 'find identity being assigned from a non-session source, a missing no-session/impersonation guard, or a request-body read in the resolver',
  passingAuthorizes: 'the identity resolver derives member id only from a validated session credential',
  passingDoesNotAuthorize: 'that every route USES this resolver — route-level adoption is a separate check; this proves only the resolver never trusts a bare claim',
  hostileForkMustChange: 'make the resolver assign identity from the request body / a bare header, or delete the impersonation guard — visible diff',

  run(io) {
    const src = io.read(RESOLVER);

    // 1. Every assignment to verifiedMemberId comes from the session-token lookup (or null).
    const assigns = [...src.matchAll(/verifiedMemberId\s*=\s*([^;]+);/g)].map((m) => m[1].trim());
    const bad = assigns.filter((a) => !/memberIdForSessionToken|null/.test(a));
    if (assigns.length === 0) {
      io.fail('No verifiedMemberId assignment found', 'resolver shape changed — re-audit');
    } else if (bad.length === 0) {
      io.pass('Identity assigned only from session token / null', `${assigns.length} assignments`);
    } else {
      io.fail('Identity assigned from a non-session source', bad.join(' | '));
    }

    // 2. No verified session → returns null (never falls through to a claim).
    if (/if\s*\(\s*!verifiedMemberId\s*\)\s*\{[^}]*return\s+null/.test(src)) {
      io.pass('Returns null when there is no verified session');
    } else {
      io.fail('Missing "no verified session → null" guard');
    }

    // 3. Mismatched identity claim is rejected as impersonation.
    //    Structural match: the `claimedMemberId !== verifiedMemberId` guard block
    //    returns null at its first exit. (Non-greedy up to the first `return null`
    //    inside the block — robust to the console.warn text between them.)
    if (/claimedMemberId\s*!==\s*verifiedMemberId\s*\)\s*\{[\s\S]*?return\s+null/.test(src)) {
      io.pass('Rejects mismatched identity claim (impersonation guard)');
    } else {
      io.fail('Missing impersonation-rejection guard');
    }

    // 4. The resolver never reads a request body / json payload for identity.
    if (/\.json\s*\(\s*\)|request\.body|req\.body|body\.userId/.test(src)) {
      io.fail('Request body referenced in identity resolver', 'possible body-derived identity');
    } else {
      io.pass('No request body read in identity resolver');
    }
  },
};
