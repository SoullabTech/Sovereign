/**
 * Authorization tests for /api/scribe/review-session (security patch 2026-07-17).
 *
 * The route returns client-session transcript content, so every access must be
 * server-side authorized. These tests pin the full denial matrix and the
 * non-revealing response shapes. DB and LLM are mocked — what is under test is
 * the route's authorization behavior, not the helpers' SQL (verifySessionOwnership
 * is exercised by the sibling scribe routes' usage and its own WHERE clause:
 * id = $1 AND member_id = $2).
 *
 * Structural notes pinned here:
 * - scribe_sessions.member_id is NOT NULL → anonymous/guest sessions cannot
 *   exist; "member review" and "practitioner review" are the same owner check
 *   (a practitioner's session carries their own member id).
 * - Expired/revoked tokens: getMemberIdFromRequest → validateSession resolves
 *   them to null, which lands in the unauthenticated branch tested below.
 */
import { NextRequest } from 'next/server';

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';
const UNKNOWN_SESSION = '44444444-4444-4444-8444-444444444444';

const mockGetMemberIdFromRequest = jest.fn();
const mockVerifySessionOwnership = jest.fn();
const mockLogAudit = jest.fn(async () => {});
const mockBuildPrompt = jest.fn(async () => ({
  prompt: 'SELF-CONTAINED PROMPT',
  meta: { segmentCount: 2, segmentsSampled: false, phantomPrefixRemoved: false },
}));
const mockGenerateSimple = jest.fn(async () => ({ text: 'REVIEW TEXT' }));
// Default: a diarized 2-speaker transcript. Tests override per-case to pin the
// single-undiarized-stream provenance flag.
const mockLoadReviewTurns = jest.fn(async () => ({
  session: { id: SESSION_ID, container: 'practitioner', title: null, startedAt: new Date('2026-07-17'), durationMin: 60, memoryPolicy: 'sealed' },
  turns: [
    { index: 0, speaker: 'practitioner', text: 'hello', tsLabel: '0:00', startMs: 0 },
    { index: 1, speaker: 'client', text: 'hi', tsLabel: '0:05', startMs: 5000 },
  ],
  markersText: 'No markers placed.',
  assembled: true,
  phantomRemoved: null,
}));

jest.mock('@/lib/scribe/scribeAuth', () => ({
  getMemberIdFromRequest: (...a: unknown[]) => mockGetMemberIdFromRequest(...a),
  verifySessionOwnership: (...a: unknown[]) => mockVerifySessionOwnership(...a),
  isValidUUID: (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
}));
jest.mock('@/lib/security/auditLog', () => ({
  logAudit: (...a: unknown[]) => mockLogAudit(...a),
}));
jest.mock('@/lib/scribe/sessionReviewMode', () => ({
  buildSessionReviewPrompt: (...a: unknown[]) => mockBuildPrompt(...a),
  // Small transcript → the route takes the SIMPLE (single-call) path, so these
  // authorization tests exercise buildSessionReviewPrompt + generateSimple as
  // before. The staged long-session path has its own suite (stagedReview.test).
  loadReviewTurns: (...a: unknown[]) => mockLoadReviewTurns(...(a as [])),
  getCompletedSessionData: jest.fn(async () => ({
    sessionId: SESSION_ID,
    startTime: '2026-07-17T00:00:00Z',
    duration: 60,
  })),
  formatSessionForDisplay: jest.fn(() => 'FULL TRANSCRIPT TEXT'),
}));
jest.mock('@/lib/consciousness/LLMProvider', () => ({
  getLLMProvider: () => ({ generateSimple: (...a: unknown[]) => mockGenerateSimple(...a) }),
}));

import { POST, GET } from '../route';

function postReq(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/scribe/review-session', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}
function getReq(sessionId: string): NextRequest {
  return new NextRequest(
    `http://localhost/api/scribe/review-session?sessionId=${sessionId}`,
  );
}

const ownedSession = (overrides: Record<string, unknown> = {}) => ({
  id: SESSION_ID,
  member_id: OWNER,
  container: 'practitioner',
  consent_status: 'confirmed',
  memory_policy: 'sealed',
  transcript_enabled: true,
  is_active: false,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST authorization', () => {
  it('authenticated authorized owner (practitioner reviewing their own session) → 200 with review', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession());
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'overview' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.response).toBe('REVIEW TEXT');
    expect(mockVerifySessionOwnership).toHaveBeenCalledWith(SESSION_ID, OWNER);
    expect(mockBuildPrompt).toHaveBeenCalled();
  });

  it('authenticated authorized member → same owner path (member_id IS the owner identity)', async () => {
    // There is no separate member-review path: scribe ownership is member_id
    // equality, and practitioners hold member ids. This test pins that the
    // authorization call is exact-id, not role-based.
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession({ container: 'solo' }));
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'overview' }));
    expect(res.status).toBe(200);
    expect(mockVerifySessionOwnership).toHaveBeenCalledWith(SESSION_ID, OWNER);
  });

  it('unauthenticated → 401, no session data touched, audit logged', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'overview' }));
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body).toEqual({ success: false, error: 'Authentication required' });
    expect(mockVerifySessionOwnership).not.toHaveBeenCalled();
    expect(mockBuildPrompt).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'failure', reason: 'unauthenticated', resourceId: SESSION_ID }),
    );
  });

  it('revoked or expired token → resolves to unauthenticated → 401', async () => {
    // validateSession returns null for expired/revoked tokens; the route sees
    // the same null as a missing token.
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'q' }));
    expect(res.status).toBe(401);
  });

  it.each([
    ['wrong practitioner', OTHER],
    ['wrong member', OTHER],
    ['cross-tenant caller', OTHER],
  ])('%s → 404 with non-revealing body, transcript never loaded', async (_label, caller) => {
    mockGetMemberIdFromRequest.mockResolvedValue(caller);
    mockVerifySessionOwnership.mockResolvedValue(null); // WHERE id AND member_id → no row
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'overview' }));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body).toEqual({ success: false, error: 'Not found' });
    expect(mockBuildPrompt).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'failure', reason: 'not_owner_or_nonexistent', userId: caller }),
    );
  });

  it('guessed/copied id (valid UUID, nonexistent) is indistinguishable from unauthorized', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(null);
    const nonexistent = await POST(postReq({ reviewedSessionId: UNKNOWN_SESSION, question: 'q' }));
    const nonexistentBody = await nonexistent.json();

    mockVerifySessionOwnership.mockResolvedValue(null);
    const unauthorized = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'q' }));
    const unauthorizedBody = await unauthorized.json();

    expect(nonexistent.status).toBe(404);
    expect(unauthorized.status).toBe(404);
    // Identical bodies — the response never confirms whether a session exists.
    expect(nonexistentBody).toEqual(unauthorizedBody);
  });

  it.each([
    ['pending', 'pending'],
    ['declined', 'declined'],
    ['absent (null)', null],
    ['absent (undefined)', undefined],
    ['legacy "accepted"', 'accepted'],
    ['unknown "revoked"', 'revoked'],
    ['empty string', ''],
  ])(
    'consent allowlist: %s → denied even for the owner, transcript never loaded',
    async (_label, consentStatus) => {
      // DENY BY DEFAULT: only the affirmative 'confirmed' state permits review.
      mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
      mockVerifySessionOwnership.mockResolvedValue(ownedSession({ consent_status: consentStatus }));
      const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'q' }));
      const body = await res.json();
      expect(res.status).toBe(403);
      expect(body).toEqual({ success: false, error: 'Review is not available for this session' });
      expect(mockBuildPrompt).not.toHaveBeenCalled();
      expect(mockLogAudit).toHaveBeenCalledWith(
        expect.objectContaining({ result: 'failure', reason: 'consent_not_confirmed' }),
      );
    },
  );

  it('consent allowlist: confirmed → allowed (the only affirmative state)', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession({ consent_status: 'confirmed' }));
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'q' }));
    expect(res.status).toBe(200);
  });

  it('malformed session id → 404 shape, denied before any identity or DB work', async () => {
    const res = await POST(postReq({ reviewedSessionId: 'not-a-uuid; DROP TABLE', question: 'q' }));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body).toEqual({ success: false, error: 'Not found' });
    expect(mockGetMemberIdFromRequest).not.toHaveBeenCalled();
    expect(mockVerifySessionOwnership).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'failure', reason: 'malformed_session_id' }),
    );
  });

  it('denial responses leak no transcript metadata', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OTHER);
    mockVerifySessionOwnership.mockResolvedValue(null);
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'q' }));
    const body = await res.json();
    // Exactly the two denial keys — no _meta, no response, no segment counts,
    // no phase, no session fields.
    expect(Object.keys(body).sort()).toEqual(['error', 'success']);
  });

  it('anonymous/guest sessions cannot exist (structural): authorization is exact member_id equality', async () => {
    // scribe_sessions.member_id is NOT NULL (migration 20260126000001) — there
    // is no guest owner to authorize. Pin that the route always passes the
    // authenticated id, never a wildcard.
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession());
    await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'q' }));
    expect(mockVerifySessionOwnership).toHaveBeenCalledTimes(1);
    expect(mockVerifySessionOwnership.mock.calls[0][1]).toBe(OWNER);
  });

  it('grant is audit-logged with identifiers only', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession());
    await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'secret client content' }));
    const successEntry = mockLogAudit.mock.calls
      .map(c => c[0] as Record<string, unknown>)
      .find(e => e.result === 'success');
    expect(successEntry).toBeDefined();
    expect(successEntry).toEqual(
      expect.objectContaining({ userId: OWNER, resource: 'scribe_transcript', resourceId: SESSION_ID }),
    );
    // The question (which may contain client material) is never logged.
    expect(JSON.stringify(successEntry)).not.toContain('secret client content');
  });
});

describe('recording-provenance flag (_meta.singleSpeakerSource, audit 2026-07-19)', () => {
  // The review UI shows a "speaker attribution not available" notice gated on
  // this flag — provenance-derived from the transcript, never a constant.
  const singleSpeakerLoad = (turnCount: number) => ({
    session: { id: SESSION_ID, container: 'practitioner', title: null, startedAt: new Date('2026-07-17'), durationMin: 60, memoryPolicy: 'sealed' },
    turns: Array.from({ length: turnCount }, (_, i) => ({
      index: i, speaker: 'Speaker 1', text: `turn ${i}`, tsLabel: `0:${String(i).padStart(2, '0')}`, startMs: i * 1000,
    })),
    markersText: 'No markers placed.',
    assembled: true,
    phantomRemoved: null,
  });

  beforeEach(() => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession());
  });

  it('undiarized transcript (simple path) → _meta.singleSpeakerSource true', async () => {
    mockLoadReviewTurns.mockResolvedValueOnce(singleSpeakerLoad(2) as never);
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'overview' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body._meta.singleSpeakerSource).toBe(true);
  });

  it('diarized transcript (simple path) → _meta.singleSpeakerSource false', async () => {
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'overview' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body._meta.singleSpeakerSource).toBe(false);
  });

  it('undiarized long session (staged path) → flag present on the processing response', async () => {
    mockLoadReviewTurns.mockResolvedValueOnce(singleSpeakerLoad(130) as never); // >120 → staged
    const res = await POST(postReq({ reviewedSessionId: SESSION_ID, question: 'overview' }));
    const body = await res.json();
    expect(res.status).toBe(202);
    expect(body._meta.staged).toBe(true);
    expect(body._meta.singleSpeakerSource).toBe(true);
  });
});

describe('GET authorization (returns the full formatted transcript)', () => {
  it('unauthenticated → 401 without transcript', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    const res = await GET(getReq(SESSION_ID));
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(JSON.stringify(body)).not.toContain('FULL TRANSCRIPT TEXT');
  });

  it('wrong owner → non-revealing 404', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OTHER);
    mockVerifySessionOwnership.mockResolvedValue(null);
    const res = await GET(getReq(SESSION_ID));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body).toEqual({ success: false, error: 'Not found' });
  });

  it('malformed id → non-revealing 404', async () => {
    const res = await GET(getReq('12345'));
    expect(res.status).toBe(404);
  });

  it('authorized owner → 200 with transcript', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession());
    const res = await GET(getReq(SESSION_ID));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.displayText).toBe('FULL TRANSCRIPT TEXT');
  });
});
