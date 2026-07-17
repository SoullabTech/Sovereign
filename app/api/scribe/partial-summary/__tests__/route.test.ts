/**
 * Authorization tests for /api/scribe/partial-summary (security pass
 * 2026-07-17, sibling of PR #622 on review-session).
 *
 * Identity + ownership gating already existed on this route; the pass added
 * audit logging on grant/denial, a UUID pre-check, and pins the non-revealing
 * 404 shape. The route returns transcript-derived content (an LLM summary of
 * scribe_transcript_entries + scribe_markers), so the full denial matrix is
 * pinned here.
 */
import { NextRequest } from 'next/server';

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';
const UNKNOWN_SESSION = '44444444-4444-4444-8444-444444444444';

const mockGetMemberIdFromRequest = jest.fn();
const mockVerifySessionOwnership = jest.fn();
const mockQuery = jest.fn();
const mockLogAudit = jest.fn(async () => {});
const mockGenerateSimple = jest.fn(async () => ({ text: 'SUMMARY TEXT' }));

jest.mock('@/lib/scribe/scribeAuth', () => ({
  getMemberIdFromRequest: (...a: unknown[]) => mockGetMemberIdFromRequest(...a),
  verifySessionOwnership: (...a: unknown[]) => mockVerifySessionOwnership(...a),
  isValidUUID: (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: unknown[]) => mockQuery(...a),
}));
jest.mock('@/lib/security/auditLog', () => ({
  logAudit: (...a: unknown[]) => mockLogAudit(...a),
}));
jest.mock('@/lib/consciousness/LLMProvider', () => ({
  getLLMProvider: () => ({ generateSimple: (...a: unknown[]) => mockGenerateSimple(...a) }),
}));

import { POST } from '../route';

function postReq(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/scribe/partial-summary', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const ownedSession = (overrides: Record<string, unknown> = {}) => ({
  id: SESSION_ID,
  member_id: OWNER,
  container: 'solo',
  consent_status: 'confirmed',
  is_active: true,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST authorization', () => {
  it('authenticated owner with confirmed consent → 200 with summary, audit success', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession());
    mockQuery.mockResolvedValue({
      rows: [{ speaker: 'self', content: 'hello', spoken_at: '2026-07-17T00:00:00Z' }],
    });
    const res = await POST(postReq({ sessionId: SESSION_ID, minutes: 5 }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.summary).toBe('SUMMARY TEXT');
    expect(mockVerifySessionOwnership).toHaveBeenCalledWith(SESSION_ID, OWNER);
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'success', userId: OWNER, resourceId: SESSION_ID }),
    );
  });

  it('unauthenticated → 401, no ownership or transcript queries, audit logged', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    const res = await POST(postReq({ sessionId: SESSION_ID }));
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.code).toBe('AUTH_REQUIRED');
    expect(mockVerifySessionOwnership).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'failure',
        reason: 'unauthenticated',
        userId: 'anonymous',
        resourceId: SESSION_ID,
      }),
    );
  });

  it('non-owner and nonexistent sessions → identical 404 bodies (non-revealing)', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(null);

    const resUnowned = await POST(postReq({ sessionId: SESSION_ID }));
    const bodyUnowned = await resUnowned.json();
    const resUnknown = await POST(postReq({ sessionId: UNKNOWN_SESSION }));
    const bodyUnknown = await resUnknown.json();

    expect(resUnowned.status).toBe(404);
    expect(resUnknown.status).toBe(404);
    expect(bodyUnowned).toEqual(bodyUnknown);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockGenerateSimple).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'failure', reason: 'not_owner_or_nonexistent' }),
    );
  });

  it('malformed session id → same 404 shape, denied before ownership lookup', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    const res = await POST(postReq({ sessionId: 'not-a-uuid' }));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.code).toBe('SESSION_NOT_FOUND');
    expect(mockVerifySessionOwnership).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'failure', reason: 'malformed_session_id' }),
    );
  });

  it('owner but consent not confirmed → 400, no transcript read, audit failure', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockVerifySessionOwnership.mockResolvedValue(ownedSession({ consent_status: 'pending' }));
    const res = await POST(postReq({ sessionId: SESSION_ID }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.code).toBe('CONSENT_REQUIRED');
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockGenerateSimple).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'failure', reason: 'consent_not_confirmed' }),
    );
  });

  it('missing sessionId → 400', async () => {
    const res = await POST(postReq({}));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.code).toBe('MISSING_SESSION_ID');
  });

  it('audit logger failure does not mask the denial', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    mockLogAudit.mockRejectedValueOnce(new Error('audit sink down'));
    const res = await POST(postReq({ sessionId: SESSION_ID }));
    expect(res.status).toBe(401);
  });
});
