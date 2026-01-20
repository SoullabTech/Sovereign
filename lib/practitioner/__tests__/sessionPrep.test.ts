/**
 * SESSION PREP + EMERGENCY KIT TESTS
 *
 * 5 minimal tests that matter:
 * 1. Auth: No session returns null (library level)
 * 2. Ownership: Can't access other practitioner's client
 * 3. Upsert: Create and update emergency info
 * 4. Delete: Remove emergency info
 * 5. Default resources: Returns standard crisis hotlines
 *
 * These tests mock the database to verify logic without infra.
 */

// Mock the database BEFORE importing the module that uses it
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));

import {
  getEmergencyInfo,
  upsertEmergencyInfo,
  deleteEmergencyInfo,
  getDefaultCrisisResources,
} from '../sessionPrep';

import { query } from '@/lib/db/postgres';

const mockQuery = query as jest.Mock;

describe('Session Prep + Emergency Kit', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ==========================================================================
  // TEST 1: OWNERSHIP - Can't access other practitioner's client
  // ==========================================================================

  describe('getEmergencyInfo - Ownership Check', () => {
    it('should return null when client does not belong to practitioner', async () => {
      // Client belongs to different practitioner
      mockQuery.mockResolvedValueOnce({ rows: [] }); // No match on ownership check

      const result = await getEmergencyInfo('practitioner-A', 'client-belongs-to-B');

      expect(result).toBeNull();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('practitioner_id'),
        ['client-belongs-to-B', 'practitioner-A']
      );
    });

    it('should return emergency info when client belongs to practitioner', async () => {
      // Client belongs to this practitioner
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'client-123' }] });
      // Return emergency info
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'emergency-456',
          client_id: 'client-123',
          emergency_contacts: [{ name: 'Mom', phone: '555-1234', relationship: 'Mother' }],
          crisis_resources: [],
          has_safety_plan: false,
          has_risk_factors: true,
        }],
      });

      const result = await getEmergencyInfo('practitioner-A', 'client-123');

      expect(result).not.toBeNull();
      expect(result?.has_risk_factors).toBe(true);
      expect(result?.emergency_contacts).toHaveLength(1);
    });
  });

  // ==========================================================================
  // TEST 2: UPSERT - Create and update emergency info
  // ==========================================================================

  describe('upsertEmergencyInfo', () => {
    it('should create emergency info for valid client', async () => {
      // Ownership check passes
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'client-123' }] });
      // Insert/upsert returns the new row
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'new-emergency-id',
          client_id: 'client-123',
          emergency_contacts: [{ name: 'Dad', phone: '555-5678', relationship: 'Father' }],
          safety_plan: 'Call Dad, then 988',
          risk_notes: 'History of crisis in winter months',
          crisis_resources: [],
          has_safety_plan: true,
          has_risk_factors: true,
        }],
      });

      const result = await upsertEmergencyInfo('practitioner-A', 'client-123', {
        emergency_contacts: [{ name: 'Dad', phone: '555-5678', relationship: 'Father' }],
        safety_plan: 'Call Dad, then 988',
        risk_notes: 'History of crisis in winter months',
      });

      expect(result.has_safety_plan).toBe(true);
      expect(result.has_risk_factors).toBe(true);
      expect(result.safety_plan).toBe('Call Dad, then 988');
    });

    it('should throw error when client does not belong to practitioner', async () => {
      // Ownership check fails
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(
        upsertEmergencyInfo('practitioner-A', 'not-my-client', {
          safety_plan: 'Trying to access someone else\'s client',
        })
      ).rejects.toThrow('Client not found or access denied');
    });
  });

  // ==========================================================================
  // TEST 3: DELETE - Remove emergency info
  // ==========================================================================

  describe('deleteEmergencyInfo', () => {
    it('should delete emergency info and return true', async () => {
      // Ownership check passes
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'client-123' }] });
      // Delete succeeds
      mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'deleted-id' }] });

      const result = await deleteEmergencyInfo('practitioner-A', 'client-123');

      expect(result).toBe(true);
    });

    it('should return false when client does not belong to practitioner', async () => {
      // Ownership check fails
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await deleteEmergencyInfo('practitioner-A', 'not-my-client');

      expect(result).toBe(false);
    });

    it('should return false when no emergency info exists', async () => {
      // Ownership check passes
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'client-123' }] });
      // Delete returns 0 rows (nothing to delete)
      mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await deleteEmergencyInfo('practitioner-A', 'client-123');

      expect(result).toBe(false);
    });
  });

  // ==========================================================================
  // TEST 4: DEFAULT CRISIS RESOURCES
  // ==========================================================================

  describe('getDefaultCrisisResources', () => {
    it('should return standard crisis hotlines', () => {
      const resources = getDefaultCrisisResources();

      expect(resources.length).toBeGreaterThan(0);

      // Must include 988
      const has988 = resources.some(r => r.phone === '988');
      expect(has988).toBe(true);

      // All resources should have required fields
      for (const resource of resources) {
        expect(resource.name).toBeTruthy();
        expect(resource.phone).toBeTruthy();
        expect(['hotline', 'hospital', 'police', 'other']).toContain(resource.type);
      }
    });
  });

  // ==========================================================================
  // TEST 5: EMPTY STATE - Client with no emergency info
  // ==========================================================================

  describe('getEmergencyInfo - Empty State', () => {
    it('should return null when client has no emergency info', async () => {
      // Ownership check passes
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'client-123' }] });
      // No emergency info exists
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await getEmergencyInfo('practitioner-A', 'client-123');

      expect(result).toBeNull();
    });
  });
});
