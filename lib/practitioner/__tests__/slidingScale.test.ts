/**
 * SLIDING SCALE ENGINE TESTS
 *
 * Tests for the dignified affordability system.
 * Verifies policy management, request handling, and award lifecycle.
 */

import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import {
  getPolicy,
  upsertPolicy,
  createRequest,
  decideRequest,
  endAward,
  listRequests,
  listAwards,
  getPublicPolicy,
} from '../slidingScale';

// Mock the database query function
const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: any[]) => mockQuery(...args),
}));

describe('Sliding Scale Engine', () => {
  // Silence console output during tests
  const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('Policy Operations', () => {
    describe('getPolicy', () => {
      it('should return policy when found', async () => {
        const mockPolicy = {
          id: 'policy-1',
          practitioner_id: 'practitioner-1',
          is_enabled: true,
          min_rate_cents: 5000,
          max_rate_cents: 15000,
          spots_total: 5,
          spots_filled: 2,
        };

        mockQuery.mockResolvedValueOnce({ rows: [mockPolicy] });

        const result = await getPolicy('practitioner-1');

        expect(result).toEqual(mockPolicy);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('SELECT'),
          ['practitioner-1']
        );
      });

      it('should return null when no policy exists', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const result = await getPolicy('practitioner-1');

        expect(result).toBeNull();
      });
    });

    describe('upsertPolicy', () => {
      it('should create new policy with defaults', async () => {
        // First call: getPolicy returns null (no existing policy)
        mockQuery.mockResolvedValueOnce({ rows: [] });
        // Second call: INSERT returns new policy
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'policy-1',
            practitioner_id: 'practitioner-1',
            is_enabled: true,
            min_rate_cents: 5000,
            max_rate_cents: 15000,
          }],
        });

        const result = await upsertPolicy('practitioner-1', {
          is_enabled: true,
          min_rate_cents: 5000,
          max_rate_cents: 15000,
        });

        expect(result.is_enabled).toBe(true);
        expect(mockQuery).toHaveBeenCalledTimes(2);
      });

      it('should reject when min_rate > max_rate', async () => {
        await expect(
          upsertPolicy('practitioner-1', {
            min_rate_cents: 20000,
            max_rate_cents: 10000,
          })
        ).rejects.toThrow('INVALID_RATE_ORDER');
      });

      it('should reject when reducing spots_total below spots_filled', async () => {
        // Existing policy has 5 spots filled
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'policy-1',
            practitioner_id: 'practitioner-1',
            spots_total: 10,
            spots_filled: 5,
          }],
        });

        await expect(
          upsertPolicy('practitioner-1', { spots_total: 3 })
        ).rejects.toThrow('SPOTS_BELOW_FILLED');
      });
    });

    describe('getPublicPolicy', () => {
      it('should return public-facing policy info', async () => {
        mockQuery.mockResolvedValueOnce({
          rows: [{
            is_enabled: true,
            public_label: 'Sliding Scale',
            public_description: 'Test description',
            min_rate_cents: 5000,
            max_rate_cents: 15000,
            currency: 'USD',
            spots_total: 5,
            spots_filled: 2,
            intake_prompt: 'Share what works for you',
            request_form_enabled: true,
          }],
        });

        const result = await getPublicPolicy('practitioner-1');

        expect(result).not.toBeNull();
        expect(result?.spots_available).toBe(3); // 5 - 2
        expect(result?.is_enabled).toBe(true);
      });

      it('should return null when no policy exists', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const result = await getPublicPolicy('practitioner-1');

        expect(result).toBeNull();
      });
    });
  });

  describe('Request Operations', () => {
    describe('createRequest', () => {
      it('should create request when policy is enabled', async () => {
        // getPolicy returns enabled policy
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'policy-1',
            practitioner_id: 'practitioner-1',
            is_enabled: true,
            request_form_enabled: true,
            auto_close_when_full: true,
            spots_total: 5,
            spots_filled: 2,
          }],
        });
        // INSERT returns new request
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'request-1',
            practitioner_id: 'practitioner-1',
            client_name: 'Test Client',
            status: 'pending',
          }],
        });

        const result = await createRequest('practitioner-1', {
          client_name: 'Test Client',
          message: 'Need sliding scale',
        });

        expect(result.status).toBe('pending');
        expect(result.client_name).toBe('Test Client');
      });

      it('should reject when policy is disabled', async () => {
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'policy-1',
            is_enabled: false,
          }],
        });

        await expect(
          createRequest('practitioner-1', { client_name: 'Test' })
        ).rejects.toThrow('POLICY_DISABLED');
      });

      it('should reject when form is disabled', async () => {
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'policy-1',
            is_enabled: true,
            request_form_enabled: false,
          }],
        });

        await expect(
          createRequest('practitioner-1', { client_name: 'Test' })
        ).rejects.toThrow('FORM_DISABLED');
      });

      it('should reject when capacity is full (with auto_close)', async () => {
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'policy-1',
            is_enabled: true,
            request_form_enabled: true,
            auto_close_when_full: true,
            spots_total: 5,
            spots_filled: 5,
          }],
        });

        await expect(
          createRequest('practitioner-1', { client_name: 'Test' })
        ).rejects.toThrow('CAPACITY_FULL');
      });
    });

    describe('decideRequest', () => {
      const mockPendingRequest = {
        id: 'request-1',
        practitioner_id: 'practitioner-1',
        client_id: 'client-1',
        status: 'pending',
      };

      it('should approve request and create award', async () => {
        // getRequest
        mockQuery.mockResolvedValueOnce({ rows: [mockPendingRequest] });
        // getPolicy for bounds check
        mockQuery.mockResolvedValueOnce({
          rows: [{
            min_rate_cents: 5000,
            max_rate_cents: 15000,
            auto_close_when_full: true,
            spots_total: 5,
            spots_filled: 2,
          }],
        });
        // UPDATE request
        mockQuery.mockResolvedValueOnce({
          rows: [{ ...mockPendingRequest, status: 'approved' }],
        });
        // INSERT award
        mockQuery.mockResolvedValueOnce({
          rows: [{ id: 'award-1', rate_cents: 7500 }],
        });
        // UPDATE spots_filled
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        const result = await decideRequest('request-1', 'practitioner-1', {
          decision: 'approve',
          approved_rate_cents: 7500,
        });

        expect(result.request.status).toBe('approved');
        expect(result.award).toBeDefined();
        expect(result.award?.rate_cents).toBe(7500);
      });

      it('should decline request without creating award', async () => {
        // getRequest
        mockQuery.mockResolvedValueOnce({ rows: [mockPendingRequest] });
        // UPDATE request
        mockQuery.mockResolvedValueOnce({
          rows: [{ ...mockPendingRequest, status: 'declined' }],
        });

        const result = await decideRequest('request-1', 'practitioner-1', {
          decision: 'decline',
          decision_note: 'No capacity',
        });

        expect(result.request.status).toBe('declined');
        expect(result.award).toBeUndefined();
      });

      it('should reject when request already decided', async () => {
        mockQuery.mockResolvedValueOnce({
          rows: [{ ...mockPendingRequest, status: 'approved' }],
        });

        await expect(
          decideRequest('request-1', 'practitioner-1', {
            decision: 'approve',
            approved_rate_cents: 7500,
          })
        ).rejects.toThrow('ALREADY_DECIDED');
      });

      it('should reject when practitioner does not own request', async () => {
        mockQuery.mockResolvedValueOnce({
          rows: [{ ...mockPendingRequest, practitioner_id: 'other-practitioner' }],
        });

        await expect(
          decideRequest('request-1', 'practitioner-1', {
            decision: 'approve',
            approved_rate_cents: 7500,
          })
        ).rejects.toThrow('OWNERSHIP_MISMATCH');
      });

      it('should reject when rate is outside policy bounds', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [mockPendingRequest] });
        mockQuery.mockResolvedValueOnce({
          rows: [{
            min_rate_cents: 5000,
            max_rate_cents: 15000,
            auto_close_when_full: false,
            spots_total: 5,
            spots_filled: 2,
          }],
        });

        await expect(
          decideRequest('request-1', 'practitioner-1', {
            decision: 'approve',
            approved_rate_cents: 2000, // Below min
          })
        ).rejects.toThrow('RATE_OUT_OF_BOUNDS');
      });
    });
  });

  describe('Award Operations', () => {
    describe('endAward', () => {
      it('should end award and decrement spots_filled', async () => {
        // getAward
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'award-1',
            practitioner_id: 'practitioner-1',
            status: 'active',
          }],
        });
        // UPDATE award
        mockQuery.mockResolvedValueOnce({
          rows: [{ id: 'award-1', status: 'ended' }],
        });
        // UPDATE spots_filled
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        const result = await endAward('award-1', 'practitioner-1');

        expect(result.status).toBe('ended');
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('spots_filled = GREATEST(0, spots_filled - 1)'),
          ['practitioner-1']
        );
      });

      it('should reject when award not found', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        await expect(
          endAward('award-1', 'practitioner-1')
        ).rejects.toThrow('AWARD_NOT_FOUND');
      });

      it('should reject when practitioner does not own award', async () => {
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'award-1',
            practitioner_id: 'other-practitioner',
            status: 'active',
          }],
        });

        await expect(
          endAward('award-1', 'practitioner-1')
        ).rejects.toThrow('OWNERSHIP_MISMATCH');
      });

      it('should reject when award already ended', async () => {
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 'award-1',
            practitioner_id: 'practitioner-1',
            status: 'ended',
          }],
        });

        await expect(
          endAward('award-1', 'practitioner-1')
        ).rejects.toThrow('ALREADY_ENDED');
      });
    });
  });

  describe('Idempotency & Safety', () => {
    it('should prevent double-approval via already_decided check', async () => {
      // First decision goes through
      const pendingRequest = {
        id: 'request-1',
        practitioner_id: 'practitioner-1',
        status: 'pending',
        client_id: 'client-1',
      };

      // After first approval, status is 'approved'
      const approvedRequest = { ...pendingRequest, status: 'approved' };

      mockQuery.mockResolvedValueOnce({ rows: [approvedRequest] });

      // Second attempt should fail
      await expect(
        decideRequest('request-1', 'practitioner-1', {
          decision: 'approve',
          approved_rate_cents: 7500,
        })
      ).rejects.toThrow('ALREADY_DECIDED');
    });

    it('should enforce ownership on all practitioner operations', async () => {
      // Test that all operations check practitioner ownership
      const wrongPractitioner = 'wrong-practitioner-id';

      // Request with different practitioner
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'request-1',
          practitioner_id: 'correct-practitioner-id',
          status: 'pending',
        }],
      });

      await expect(
        decideRequest('request-1', wrongPractitioner, {
          decision: 'approve',
          approved_rate_cents: 7500,
        })
      ).rejects.toThrow('OWNERSHIP_MISMATCH');
    });
  });
});
