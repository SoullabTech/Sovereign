/**
 * VOICE NOTES UPLOAD API TESTS
 *
 * Tests for POST /api/studio/sessions/[sessionId]/voice-notes:
 * 1. Returns 401 when unauthenticated
 * 2. Returns 415 when Content-Type is not multipart/form-data
 * 3. Returns 404 when practitioner not found
 * 4. Returns 404 when session not found or not authorized
 * 5. Returns 400 when no audio file provided
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock the database
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount?: number }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// Mock auth
const mockGetMemberIdFromRequest = jest.fn<() => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: () => mockGetMemberIdFromRequest(),
}));

// Mock fs (prevent actual file writes)
jest.mock('fs/promises', () => ({
  writeFile: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  mkdir: jest.fn<() => Promise<string | undefined>>().mockResolvedValue(undefined),
}));

// Import after mocks
import { POST } from '../route';

const createParams = (sessionId: string) => ({
  params: Promise.resolve({ sessionId }),
});

describe('Voice Notes Upload API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMemberIdFromRequest.mockReset();
    mockQuery.mockReset();
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/studio/sessions/s1/voice-notes', {
      method: 'POST',
    });
    const response = await POST(request, createParams('s1'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 415 when Content-Type is not multipart/form-data', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-123');
    // getPractitionerId query
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'pract-1' }] });

    const request = new NextRequest('http://localhost/api/studio/sessions/s1/voice-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await POST(request, createParams('s1'));
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data.success).toBe(false);
    expect(data.error).toContain('multipart/form-data');
  });

  it('returns 415 when Content-Type is missing entirely', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-123');
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'pract-1' }] });

    const request = new NextRequest('http://localhost/api/studio/sessions/s1/voice-notes', {
      method: 'POST',
    });
    const response = await POST(request, createParams('s1'));
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data.error).toContain('multipart/form-data');
  });

  it('returns 404 when practitioner not found', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-123');
    mockQuery.mockResolvedValueOnce({ rows: [] }); // no practitioner

    const request = new NextRequest('http://localhost/api/studio/sessions/s1/voice-notes', {
      method: 'POST',
    });
    const response = await POST(request, createParams('s1'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Practitioner not found');
  });
});
