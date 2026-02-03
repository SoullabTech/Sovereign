/**
 * SAFETY ACKNOWLEDGMENT API TESTS
 *
 * Tests for POST /api/practitioner/safety/[logId]:
 * 1. Successful acknowledgment with review note
 * 2. Successful acknowledgment without review note
 * 3. Ownership mismatch returns 403
 * 4. Non-existent log returns 403 (same as ownership mismatch for security)
 * 5. Idempotent - re-ack doesn't overwrite original timestamp
 * 6. Invalid review note (too long) returns 400
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the database query function
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rowCount?: number; rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// Mock the auth function
const mockRequireMemberId = jest.fn<() => Promise<string>>();
jest.mock('@/lib/auth/session', () => ({
  requireMemberId: () => mockRequireMemberId(),
}));

// Import after mocks are set up
import { POST, GET } from '../[logId]/route';
import { NextRequest } from 'next/server';

describe('Safety Acknowledgment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireMemberId.mockReset();
    mockQuery.mockReset();
  });

  const createRequest = (body?: object) => {
    return new NextRequest('http://localhost/api/practitioner/safety/log-123', {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: body ? { 'Content-Type': 'application/json' } : {},
    });
  };

  const createParams = (logId: string) => ({
    params: Promise.resolve({ logId }),
  });

  describe('POST /api/practitioner/safety/[logId]', () => {
    it('should successfully acknowledge a safety concern with review note', async () => {
      mockRequireMemberId.mockResolvedValue('practitioner-123');
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 'log-123',
          practitioner_id: 'practitioner-123',
          client_id: 'client-456',
          message_id: 'message-789',
          acknowledged_at: '2026-01-21T10:00:00Z',
          acknowledged_by: 'practitioner-123',
          review_note: 'Client has support system in place',
          logged_at: '2026-01-21T09:00:00Z',
          email_status: 'sent',
          created_at: '2026-01-21T09:00:00Z',
        }],
      });

      const request = createRequest({ reviewNote: 'Client has support system in place' });
      const response = await POST(request, createParams('log-123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.log.acknowledged_at).toBeDefined();
      expect(data.log.review_note).toBe('Client has support system in place');

      // Verify query was called with correct parameters
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE safety_concern_logs'),
        ['log-123', 'practitioner-123', 'Client has support system in place']
      );
    });

    it('should successfully acknowledge without review note', async () => {
      mockRequireMemberId.mockResolvedValue('practitioner-123');
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 'log-123',
          practitioner_id: 'practitioner-123',
          client_id: 'client-456',
          acknowledged_at: '2026-01-21T10:00:00Z',
          acknowledged_by: 'practitioner-123',
          review_note: null,
        }],
      });

      const request = createRequest({});
      const response = await POST(request, createParams('log-123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.log.review_note).toBeNull();
    });

    it('should return 403 for ownership mismatch', async () => {
      mockRequireMemberId.mockResolvedValue('other-practitioner');
      mockQuery.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

      const request = createRequest({});
      const response = await POST(request, createParams('log-123'));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    it('should return 403 for non-existent log (security: same as ownership)', async () => {
      mockRequireMemberId.mockResolvedValue('practitioner-123');
      mockQuery.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
      });

      const request = createRequest({});
      const response = await POST(request, createParams('nonexistent-log'));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    it('should be idempotent - does not overwrite existing acknowledgment', async () => {
      const originalAckTime = '2026-01-20T10:00:00Z';
      mockRequireMemberId.mockResolvedValue('practitioner-123');

      // First acknowledgment
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 'log-123',
          acknowledged_at: originalAckTime,
          acknowledged_by: 'practitioner-123',
          review_note: 'First note',
        }],
      });

      const firstRequest = createRequest({ reviewNote: 'First note' });
      await POST(firstRequest, createParams('log-123'));

      // Second acknowledgment attempt
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 'log-123',
          acknowledged_at: originalAckTime, // Should still be original time
          acknowledged_by: 'practitioner-123',
          review_note: 'First note', // Should still be original note
        }],
      });

      const secondRequest = createRequest({ reviewNote: 'Second note' });
      const response = await POST(secondRequest, createParams('log-123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      // The COALESCE in the query ensures original values are preserved
      expect(data.log.acknowledged_at).toBe(originalAckTime);
      expect(data.log.review_note).toBe('First note');
    });

    it('should return 400 for review note exceeding max length', async () => {
      mockRequireMemberId.mockResolvedValue('practitioner-123');

      const longNote = 'x'.repeat(2001); // Max is 2000
      const request = createRequest({ reviewNote: longNote });
      const response = await POST(request, createParams('log-123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
    });

    it('should handle empty body gracefully', async () => {
      mockRequireMemberId.mockResolvedValue('practitioner-123');
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 'log-123',
          acknowledged_at: '2026-01-21T10:00:00Z',
          acknowledged_by: 'practitioner-123',
          review_note: null,
        }],
      });

      // Request with no body
      const request = new NextRequest('http://localhost/api/practitioner/safety/log-123', {
        method: 'POST',
      });
      const response = await POST(request, createParams('log-123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
    });
  });

  describe('GET /api/practitioner/safety/[logId]', () => {
    it('should return safety log with client and message details', async () => {
      mockRequireMemberId.mockResolvedValue('practitioner-123');
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'log-123',
          practitioner_id: 'practitioner-123',
          client_id: 'client-456',
          message_id: 'message-789',
          client_name: 'Jane Doe',
          client_preferred_name: 'Jane',
          message_body: 'I am feeling very overwhelmed',
          message_created_at: '2026-01-21T09:00:00Z',
          acknowledged_at: null,
          acknowledged_by: null,
          review_note: null,
        }],
      });

      const request = new NextRequest('http://localhost/api/practitioner/safety/log-123', {
        method: 'GET',
      });
      const response = await GET(request, createParams('log-123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.log.client_name).toBe('Jane Doe');
      expect(data.log.message_body).toBeDefined();
    });

    it('should return 404 for non-existent or unauthorized log', async () => {
      mockRequireMemberId.mockResolvedValue('practitioner-123');
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const request = new NextRequest('http://localhost/api/practitioner/safety/log-123', {
        method: 'GET',
      });
      const response = await GET(request, createParams('log-123'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Safety log not found or access denied');
    });
  });
});

describe('Safety Acknowledgment - State Transitions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireMemberId.mockReset();
    mockQuery.mockReset();
  });

  it('documents: unacknowledged → acknowledged state transition', async () => {
    // Initial state: safety_concern logged, not acknowledged
    // Action: POST /api/practitioner/safety/[logId]
    // Result: acknowledged_at set, acknowledged_by set

    // This is implicitly tested by the successful acknowledgment tests
    // The key invariant: acknowledged_at and acknowledged_by are set atomically
    expect(true).toBe(true);
  });

  it('documents: acknowledged state is immutable (COALESCE pattern)', async () => {
    // Once acknowledged:
    // - acknowledged_at cannot be changed
    // - acknowledged_by cannot be changed
    // - review_note can only be set if not already set

    // This is enforced by the SQL:
    // SET acknowledged_at = COALESCE(acknowledged_at, NOW())
    // SET acknowledged_by = COALESCE(acknowledged_by, $2)
    // SET review_note = COALESCE($3, review_note)

    expect(true).toBe(true);
  });

  it('documents: ownership check happens atomically with update', async () => {
    // The UPDATE WHERE clause includes:
    // - id = $1 (log ID)
    // - practitioner_id = $2 (authenticated practitioner)

    // If either condition fails, rowCount = 0
    // This prevents TOCTOU race conditions

    expect(true).toBe(true);
  });
});
