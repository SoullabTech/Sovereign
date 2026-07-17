/**
 * Authorization tests for /api/scribe/assemble-transcript (security patch
 * 2026-07-17, sibling of PR #622 on review-session).
 *
 * The route triggers transcript assembly for a supervision session and returns
 * assembly metadata (turnCount, rawSegmentCount) — enough to confirm a
 * session's existence and size. Before this patch any authenticated member
 * could trigger assembly for any supervision session id. These tests pin:
 * - the Docker-internal bypass (deliberate: port 3000 is compose-internal and
 *   the normal path /api/supervision/session/stop → runAssembly has no member
 *   identity)
 * - external calls: server-side identity, then ownership through the
 *   supervision_sessions.metadata->>'scribeSessionId' → scribe_sessions
 *   member_id link, with identical non-revealing 404s for nonexistent,
 *   unowned, and unlinked sessions
 * - audit logging on grant and denial (identifiers only)
 */
import { NextRequest } from 'next/server';

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';
const UNKNOWN_SESSION = '44444444-4444-4444-8444-444444444444';

const mockGetMemberIdFromRequest = jest.fn();
const mockQuery = jest.fn();
const mockLogAudit = jest.fn(async () => {});
const mockRunAssembly = jest.fn(async () => ({
  turnCount: 12,
  rawSegmentCount: 40,
  phantomRemoved: 1,
}));

jest.mock('@/lib/scribe/scribeAuth', () => ({
  getMemberIdFromRequest: (...a: unknown[]) => mockGetMemberIdFromRequest(...a),
  isValidUUID: (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: unknown[]) => mockQuery(...a),
}));
jest.mock('@/lib/security/auditLog', () => ({
  logAudit: (...a: unknown[]) => mockLogAudit(...a),
}));
jest.mock('@/lib/supervision/transcriptAssembler', () => ({
  runAssembly: (...a: unknown[]) => mockRunAssembly(...a),
}));

import { POST } from '../route';

/** External request: carries x-forwarded-for, as every Caddy-proxied call does. */
function externalReq(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/scribe/assemble-transcript', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.7',
    },
  });
}

/** Docker-internal request: localhost host, no x-forwarded-for. */
function internalReq(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/scribe/assemble-transcript', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', host: 'localhost:3000' },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Docker-internal bypass', () => {
  it('internal call (no x-forwarded-for, localhost host) → 200 without auth or ownership checks', async () => {
    const res = await POST(internalReq({ sessionId: SESSION_ID }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.turnCount).toBe(12);
    expect(mockGetMemberIdFromRequest).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockRunAssembly).toHaveBeenCalledWith(SESSION_ID);
  });
});

describe('external authorization', () => {
  it('unauthenticated → 401, no assembly, audit logged', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    const res = await POST(externalReq({ sessionId: SESSION_ID }));
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.code).toBe('AUTH_REQUIRED');
    expect(mockRunAssembly).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'failure',
        reason: 'unauthenticated',
        resourceId: SESSION_ID,
        userId: 'anonymous',
      }),
    );
  });

  it('authenticated owner (linked scribe session matches member) → 200, audit success', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockQuery.mockResolvedValue({ rows: [{ id: SESSION_ID }] });
    const res = await POST(externalReq({ sessionId: SESSION_ID }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('scribe_sessions'), [
      SESSION_ID,
      OWNER,
    ]);
    expect(mockRunAssembly).toHaveBeenCalledWith(SESSION_ID);
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'success', userId: OWNER, resourceId: SESSION_ID }),
    );
  });

  it('authenticated non-owner / unlinked / nonexistent → identical 404 body, no assembly', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    mockQuery.mockResolvedValue({ rows: [] });

    const resUnowned = await POST(externalReq({ sessionId: SESSION_ID }));
    const bodyUnowned = await resUnowned.json();
    const resUnknown = await POST(externalReq({ sessionId: UNKNOWN_SESSION }));
    const bodyUnknown = await resUnknown.json();

    expect(resUnowned.status).toBe(404);
    expect(resUnknown.status).toBe(404);
    expect(bodyUnowned).toEqual(bodyUnknown); // non-revealing: cannot distinguish
    expect(mockRunAssembly).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'failure', reason: 'not_owner_or_nonexistent' }),
    );
  });

  it('malformed session id → same 404 shape, denied before any DB work', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(OWNER);
    const res = await POST(externalReq({ sessionId: "1' OR '1'='1" }));
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.code).toBe('SESSION_NOT_FOUND');
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockRunAssembly).not.toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'failure', reason: 'malformed_session_id' }),
    );
  });

  it('missing sessionId → 400 before auth work', async () => {
    const res = await POST(externalReq({}));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.code).toBe('MISSING_SESSION_ID');
    expect(mockRunAssembly).not.toHaveBeenCalled();
  });

  it('audit logger failure does not mask the denial', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    mockLogAudit.mockRejectedValueOnce(new Error('audit sink down'));
    const res = await POST(externalReq({ sessionId: SESSION_ID }));
    expect(res.status).toBe(401);
  });
});
