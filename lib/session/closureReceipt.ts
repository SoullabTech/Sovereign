/**
 * Original MAIA app: content-free client projection of R2 closure receipts.
 *
 * The server owns authentication, authorization, per-turn Sanctuary custody,
 * deletion manifests, and true closure. This file NEVER grants those rights.
 *
 * An older server may return { ok:true, sanctuary:true }; that shape does not
 * attest any S5/R20 erasure and MUST NOT be treated as a verified close.
 */

/**
 * New versioned route intentionally has NO legacy POST implementation.
 * Even a misconfigured build-time flag must not fall through to the older
 * mode-based whole-session purge route. A source-owner approved R2 handler is
 * required at this exact path before closing can be enabled.
 */
export const QUALIFIED_R2_CLOSE_PATH = '/api/sovereign/session/finalize-r2' as const;

export type ClosureExpectation = 'continuity' | 'sanctuary';

export type ClosureAssessment =
  | { kind: 'continuity_closed'; sessionId: string }
  | { kind: 'sanctuary_erasure_pending'; sessionId: string }
  | { kind: 'refused'; reason: 'CLOSE_REFUSED' }
  | { kind: 'unavailable'; reason: 'CLOSE_UNAVAILABLE' }
  | { kind: 'unverified'; reason: 'RECEIPT_NOT_VERIFIED' };

export type ClosureDisplayState =
  | 'ready'
  | 'requesting'
  | 'continuity_closed'
  | 'sanctuary_erasure_pending'
  | 'refused'
  | 'unavailable'
  | 'unverified';

const SESSION_ID = /^session_[a-zA-Z0-9_-]{1,92}$/;
const MEMBER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Classify the response WITHOUT trusting HTTP status alone. Only two exact
 * R2 shapes qualify, and neither one says Sanctuary erasure has finished.
 */
export function assessClosureResponse(
  status: number,
  raw: unknown,
  expectedSessionId: string,
  expectedPrivacy: ClosureExpectation,
): ClosureAssessment {
  if (status === 401 || status === 403 || status === 404 || status === 409 ||
      status === 400 || status === 428) {
    return { kind: 'refused', reason: 'CLOSE_REFUSED' };
  }
  if (status === 503 || status >= 500 || status <= 0) {
    return { kind: 'unavailable', reason: 'CLOSE_UNAVAILABLE' };
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { kind: 'unverified', reason: 'RECEIPT_NOT_VERIFIED' };
  }
  const body = raw as Record<string, unknown>;
  if (!SESSION_ID.test(expectedSessionId) ||
      body.sessionId !== expectedSessionId ||
      body.erasureConfirmed !== false ||
      body.mode !== expectedPrivacy) {
    return { kind: 'unverified', reason: 'RECEIPT_NOT_VERIFIED' };
  }

  // No code path in this client declares Sanctuary erased. A later, separately
  // attested R20 erasure protocol must be designed before that is possible.
  if (expectedPrivacy === 'sanctuary' &&
      status === 202 &&
      body.ok === false &&
      body.code === 'ERASURE_WITNESS_PENDING' &&
      body.state === 'erasure_pending' &&
      body.closureConfirmed === false) {
    return { kind: 'sanctuary_erasure_pending', sessionId: expectedSessionId };
  }
  if (expectedPrivacy === 'continuity' &&
      status === 200 &&
      body.ok === true &&
      body.code === 'SESSION_CLOSED' &&
      body.state === 'completed' &&
      body.closureConfirmed === true) {
    return { kind: 'continuity_closed', sessionId: expectedSessionId };
  }
  return { kind: 'unverified', reason: 'RECEIPT_NOT_VERIFIED' };
}

export type PendingClosureHint = Readonly<{
  version: 1;
  sessionId: string;
  claimedMemberId: string;
  expectedPrivacy: ClosureExpectation;
  state: 'request_unverified' | 'sanctuary_erasure_pending';
  createdAt: string;
}>;

// This is a local, CONTENT-FREE recovery pointer, NEVER proof of the
// authenticated actor, successful closure, or completed erasure.
function hintKey(claimedMemberId: string, sessionId: string): string | null {
  if (!MEMBER_ID.test(claimedMemberId) || !SESSION_ID.test(sessionId)) return null;
  return `maia_closure_hint_v1:${claimedMemberId.toLowerCase()}:${sessionId}`;
}

/** False means nothing was safely stored; caller must not start the request. */
export function preserveClosureHint(
  storage: Pick<Storage, 'setItem'>,
  hint: PendingClosureHint,
): boolean {
  const key = hintKey(hint.claimedMemberId, hint.sessionId);
  if (!key || hint.version !== 1 ||
      (hint.expectedPrivacy !== 'continuity' && hint.expectedPrivacy !== 'sanctuary') ||
      (hint.state !== 'request_unverified' && hint.state !== 'sanctuary_erasure_pending') ||
      !Number.isFinite(Date.parse(hint.createdAt))) return false;
  try {
    storage.setItem(key, JSON.stringify(hint));
    return true;
  } catch {
    return false;
  }
}

export function readClosureHint(
  storage: Pick<Storage, 'getItem'>,
  claimedMemberId: string,
  sessionId: string,
): PendingClosureHint | null {
  const key = hintKey(claimedMemberId, sessionId);
  if (!key) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw || raw.length > 1100) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const v = parsed as Record<string, unknown>;
    if (v.version !== 1 || v.sessionId !== sessionId ||
        v.claimedMemberId !== claimedMemberId ||
        (v.expectedPrivacy !== 'continuity' && v.expectedPrivacy !== 'sanctuary') ||
        (v.state !== 'request_unverified' && v.state !== 'sanctuary_erasure_pending') ||
        typeof v.createdAt !== 'string' ||
        !Number.isFinite(Date.parse(v.createdAt))) return null;
    return v as PendingClosureHint;
  } catch {
    return null;
  }
}

/** Only a verified Continuity close can clear its own recovery hint. */
/**
 * A browser-stored pending marker is NEVER a signed or authenticated R20
 * receipt. Reopen as UNVERIFIED; the current server must be consulted before
 * claiming any active pending deletion or completed closure state.
 */
export function displayStateForRestoredClosureHint(
  hint: PendingClosureHint | null,
): ClosureDisplayState {
  return hint ? 'unverified' : 'ready';
}

export function clearConfirmedContinuityHint(
  storage: Pick<Storage, 'removeItem'>,
  claimedMemberId: string,
  sessionId: string,
): void {
  const key = hintKey(claimedMemberId, sessionId);
  if (!key) return;
  try { storage.removeItem(key); } catch { /* recovery hint remains held */ }
}


/**
 * All client-side close requests pass this controlled seam.
 *
 * It is NOT the authenticated server's release decision. The build-time gate
 * remains OFF until the canonical owner independently certifies the real R2
 * endpoint, its owner checks, R3 transaction and R20 erasure protection.
 * No request is made if content-free crash recovery cannot be recorded.
 */
export async function requestQualifiedClosure(args: {
  enabled: boolean;
  claimedMemberId: string;
  currentMemberClaim: string;
  sessionId: string;
  expectedPrivacy: ClosureExpectation;
  storage: Pick<Storage, 'setItem' | 'removeItem'>;
  send: (payload: {
    memberId: string;
    sessionId: string;
    isSanctuary: boolean;
    endedAt: string;
  }) => Promise<{ status: number; json: () => Promise<unknown> }>;
  requestTime?: string;
}): Promise<ClosureAssessment> {
  if (!args.enabled) {
    return { kind: 'unavailable', reason: 'CLOSE_UNAVAILABLE' };
  }
  if (!MEMBER_ID.test(args.claimedMemberId) ||
      args.claimedMemberId !== args.currentMemberClaim ||
      !SESSION_ID.test(args.sessionId)) {
    return { kind: 'unverified', reason: 'RECEIPT_NOT_VERIFIED' };
  }
  const requestedAt = args.requestTime ?? new Date().toISOString();
  const hint: PendingClosureHint = {
    version: 1,
    sessionId: args.sessionId,
    claimedMemberId: args.claimedMemberId,
    expectedPrivacy: args.expectedPrivacy,
    state: 'request_unverified',
    createdAt: requestedAt,
  };
  if (!preserveClosureHint(args.storage, hint)) {
    return { kind: 'unavailable', reason: 'CLOSE_UNAVAILABLE' };
  }

  try {
    const response = await args.send({
      memberId: args.claimedMemberId,
      sessionId: args.sessionId,
      isSanctuary: args.expectedPrivacy === 'sanctuary',
      endedAt: requestedAt,
    });
    const raw = await response.json().catch(() => null);
    const assessment = assessClosureResponse(
      response.status, raw, args.sessionId, args.expectedPrivacy,
    );

    if (assessment.kind === 'continuity_closed') {
      clearConfirmedContinuityHint(
        args.storage, args.claimedMemberId, args.sessionId,
      );
    } else if (assessment.kind === 'sanctuary_erasure_pending') {
      if (!preserveClosureHint(args.storage, {
        ...hint, state: 'sanctuary_erasure_pending',
      })) {
        // Could not preserve the authoritative pending status locally.
        // Server custody may exist, but UI must remain unverified.
        return { kind: 'unverified', reason: 'RECEIPT_NOT_VERIFIED' };
      }
    }
    return assessment;
  } catch {
    // The HTTP request might have committed before transport failed. Never
    // retry automatically or treat a missing reply as deletion/closure proof.
    return { kind: 'unavailable', reason: 'CLOSE_UNAVAILABLE' };
  }
}
