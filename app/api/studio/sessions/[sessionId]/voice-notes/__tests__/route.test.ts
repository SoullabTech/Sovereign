/**
 * VOICE NOTES API TESTS
 *
 * Tests for POST /api/studio/sessions/[sessionId]/voice-notes:
 * 1. 415 when Content-Type is not multipart/form-data
 * 2. 401 when not authenticated
 * 3. 400 when no file provided (multipart but empty)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the database
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rowCount?: number; rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
}));

// Mock the auth function
const mockGetMemberIdFromRequest = jest.fn<() => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: () => mockGetMemberIdFromRequest(),
}));

// Import after mocks are set up
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('Voice Notes API - Content-Type Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMemberIdFromRequest.mockReset();
    mockQuery.mockReset();
  });

  const createParams = (sessionId: string) => ({
    params: Promise.resolve({ sessionId }),
  });

  describe('POST /api/studio/sessions/[sessionId]/voice-notes', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetMemberIdFromRequest.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/studio/sessions/test-session/voice-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request, createParams('test-session'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 415 when Content-Type is application/json (not multipart)', async () => {
      mockGetMemberIdFromRequest.mockResolvedValue('member-123');

      // Mock practitioner lookup
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'practitioner-123' }],
      });

      const request = new NextRequest('http://localhost/api/studio/sessions/test-session/voice-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request, createParams('test-session'));
      const data = await response.json();

      expect(response.status).toBe(415);
      expect(data.success).toBe(false);
      expect(data.error).toContain('multipart/form-data');
      expect(data.error).toContain('Do not set Content-Type manually');
    });

    it('should return 415 when Content-Type is text/plain', async () => {
      mockGetMemberIdFromRequest.mockResolvedValue('member-123');

      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'practitioner-123' }],
      });

      const request = new NextRequest('http://localhost/api/studio/sessions/test-session/voice-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'hello',
      });

      const response = await POST(request, createParams('test-session'));
      const data = await response.json();

      expect(response.status).toBe(415);
      expect(data.error).toContain('multipart/form-data');
    });

    it('should return 415 when Content-Type header is missing', async () => {
      mockGetMemberIdFromRequest.mockResolvedValue('member-123');

      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'practitioner-123' }],
      });

      const request = new NextRequest('http://localhost/api/studio/sessions/test-session/voice-notes', {
        method: 'POST',
      });

      const response = await POST(request, createParams('test-session'));
      const data = await response.json();

      expect(response.status).toBe(415);
      expect(data.error).toContain('multipart/form-data');
    });

    it('should return 404 when practitioner not found', async () => {
      mockGetMemberIdFromRequest.mockResolvedValue('member-123');

      // No practitioner found
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const request = new NextRequest('http://localhost/api/studio/sessions/test-session/voice-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary' },
      });

      const response = await POST(request, createParams('test-session'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Practitioner not found');
    });
  });
});

describe('Voice Notes API - Error Messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMemberIdFromRequest.mockReset();
    mockQuery.mockReset();
  });

  it('415 error message is actionable for developers', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-123');
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'practitioner-123' }] });

    const request = new NextRequest('http://localhost/api/studio/sessions/test/voice-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: 'fake' }),
    });

    const response = await POST(request, { params: Promise.resolve({ sessionId: 'test' }) });
    const data = await response.json();

    // The error message should tell developers exactly what to do
    expect(data.error).toBe('Expected multipart/form-data (FormData upload). Do not set Content-Type manually.');
  });
});
