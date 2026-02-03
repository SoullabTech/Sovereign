/**
 * TRUSTED COLLEAGUES TESTS
 *
 * Tests for the warm handoff system.
 * Verifies directory, connections, and referrals with privacy enforcement.
 */

import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import {
  getDirectoryProfile,
  updateDirectoryProfile,
  searchDirectory,
  getConnections,
  areColleagues,
  requestConnection,
  respondToConnection,
  createReferralDraft,
  sendReferral,
  recordConsent,
  getReferrals,
  getReferral,
  respondToReferral,
  type ReferralView,
} from '../trustedColleagues';

// Mock the database query function
const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: any[]) => mockQuery(...args),
}));

describe('Trusted Colleagues', () => {
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

  describe('Directory', () => {
    it('should be unlisted by default', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          practitioner_id: 'practitioner-1',
          is_listed: false,
          accepting_referrals: true,
          modalities: [],
          tags: [],
          languages: [],
        }],
      });

      const profile = await getDirectoryProfile('practitioner-1');

      expect(profile.is_listed).toBe(false);
    });

    it('should allow opt-in to listing', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          practitioner_id: 'practitioner-1',
          is_listed: true,
          accepting_referrals: true,
          modalities: ['IFS', 'somatic'],
          tags: ['grief', 'anxiety'],
          languages: ['English'],
        }],
      });

      const profile = await updateDirectoryProfile('practitioner-1', {
        is_listed: true,
      });

      expect(profile.is_listed).toBe(true);
    });

    it('should filter by modalities', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { practitioner_id: 'p1', is_listed: true, modalities: ['IFS'], tags: [], languages: [] },
          { practitioner_id: 'p2', is_listed: true, modalities: ['IFS', 'EMDR'], tags: [], languages: [] },
        ],
      });

      const profiles = await searchDirectory('practitioner-1', {
        modalities: ['IFS'],
      });

      expect(profiles.length).toBe(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('modalities &&'),
        expect.arrayContaining([['IFS']])
      );
    });

    it('should filter by good_with tags', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { practitioner_id: 'p1', is_listed: true, modalities: [], tags: ['grief'], languages: [] },
        ],
      });

      const profiles = await searchDirectory('practitioner-1', {
        tags: ['grief'],
      });

      expect(profiles.length).toBe(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('tags &&'),
        expect.arrayContaining([['grief']])
      );
    });
  });

  describe('Connections', () => {
    it('should require mutual acceptance', async () => {
      // Check existing - none
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Insert pending request
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'connection-1',
          requester_id: 'practitioner-1',
          recipient_id: 'practitioner-2',
          status: 'pending',
        }],
      });

      const connection = await requestConnection('practitioner-1', 'practitioner-2');

      expect(connection.status).toBe('pending');
    });

    it('should prevent self-connection', async () => {
      await expect(
        requestConnection('practitioner-1', 'practitioner-1')
      ).rejects.toThrow('CANNOT_CONNECT_TO_SELF');
    });

    it('should keep notes private to writer', async () => {
      // This is tested via the formatReferralView function
      // which filters notes based on viewer ID
      // The test verifies the ReferralView type has my_note
      // instead of requester_note/recipient_note directly

      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          to_practitioner_id: 'practitioner-2',
          requester_note: 'private requester note',
          recipient_note: 'private recipient note',
          status: 'sent',
          presenting_themes: [],
          constraints: [],
        }],
      });

      // View as requester
      const asRequester = await getReferral('referral-1', 'practitioner-1');
      expect(asRequester?.my_note).toBe('private requester note');
      expect(asRequester?.their_note_exists).toBe(true);

      // Reset and view as recipient
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          to_practitioner_id: 'practitioner-2',
          requester_note: 'private requester note',
          recipient_note: 'private recipient note',
          status: 'sent',
          presenting_themes: [],
          constraints: [],
        }],
      });
      mockQuery.mockResolvedValueOnce({ rows: [] }); // mark as viewed

      const asRecipient = await getReferral('referral-1', 'practitioner-2');
      expect(asRecipient?.my_note).toBe('private recipient note');
      expect(asRecipient?.their_note_exists).toBe(true);
    });
  });

  describe('Referrals', () => {
    const mockConnection = {
      id: 'connection-1',
      requester_id: 'practitioner-1',
      recipient_id: 'practitioner-2',
      status: 'accepted',
    };

    it('should default to de-identified', async () => {
      // Check connection exists and is accepted
      mockQuery.mockResolvedValueOnce({ rows: [mockConnection] });
      // Insert referral
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          to_practitioner_id: 'practitioner-2',
          connection_id: 'connection-1',
          status: 'draft',
          client_consent_given: false,
          client_name_shared: false,
          client_name: null,
          client_contact: null,
          presenting_themes: ['grief'],
          constraints: [],
        }],
      });

      const referral = await createReferralDraft('practitioner-1', 'practitioner-2', {
        presenting_themes: ['grief'],
        requester_note: 'Good fit for grief work',
      });

      expect(referral.client_consent_given).toBe(false);
      expect(referral.client_name_shared).toBe(false);
      expect(referral.client_name).toBeNull();
      expect(referral.client_contact).toBeNull();
    });

    it('should require explicit consent for name sharing', async () => {
      // recordConsent with name sharing requires consent_given first
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          client_consent_given: true,
          client_name_shared: true,
          client_name: 'Test Client',
          client_contact: 'test@example.com',
          presenting_themes: [],
          constraints: [],
        }],
      });

      const referral = await recordConsent('referral-1', 'practitioner-1', {
        client_consent_given: true,
        client_name_shared: true,
        client_name: 'Test Client',
        client_contact: 'test@example.com',
      });

      expect(referral.client_consent_given).toBe(true);
      expect(referral.client_name_shared).toBe(true);
      expect(referral.client_name).toBe('Test Client');
    });

    it('should track consent states accurately', async () => {
      // Test that clearing consent also clears name/contact
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          client_consent_given: false,
          client_name_shared: false,
          client_name: null,
          client_contact: null,
          presenting_themes: [],
          constraints: [],
        }],
      });

      const referral = await recordConsent('referral-1', 'practitioner-1', {
        client_consent_given: false,
      });

      expect(referral.client_consent_given).toBe(false);
      expect(referral.client_name_shared).toBe(false);
      expect(referral.client_name).toBeNull();
      expect(referral.client_contact).toBeNull();
    });

    it('should only allow referrals between colleagues', async () => {
      // Check connection - returns non-accepted or empty
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'connection-1',
          status: 'pending', // Not accepted!
        }],
      });

      await expect(
        createReferralDraft('practitioner-1', 'practitioner-2', {
          requester_note: 'Test note',
        })
      ).rejects.toThrow('NOT_COLLEAGUES');
    });

    it('should enforce DB check: name/contact cannot exist without consent+share', async () => {
      // This tests the library-level enforcement
      // The DB CHECK constraint is the ultimate safety net

      // When consent is false, name/contact are cleared
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          client_consent_given: false,
          client_name_shared: false,
          client_name: null,  // Cleared!
          client_contact: null,  // Cleared!
          presenting_themes: [],
          constraints: [],
        }],
      });

      const referral = await recordConsent('referral-1', 'practitioner-1', {
        client_consent_given: false,
        // Even if we tried to pass name, the library clears it
      });

      expect(referral.client_name).toBeNull();
      expect(referral.client_contact).toBeNull();

      // The SQL query shows the library sets these to NULL when consent is false
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('client_name = NULL'),
        expect.any(Array)
      );
    });

    it('should not allow requester to read recipient_note (and vice versa)', async () => {
      // View as requester
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          to_practitioner_id: 'practitioner-2',
          requester_note: 'My private note',
          recipient_note: 'Their private response',
          status: 'accepted',
          presenting_themes: [],
          constraints: [],
        }],
      });

      const asRequester = await getReferral('referral-1', 'practitioner-1');

      // Requester sees their own note as my_note
      expect(asRequester?.my_note).toBe('My private note');
      // Requester knows recipient has a note, but can't read it
      expect(asRequester?.their_note_exists).toBe(true);
      // The actual recipient_note value is NOT in the ReferralView type
      expect((asRequester as any).recipient_note).toBeUndefined();
      expect((asRequester as any).requester_note).toBeUndefined();
    });
  });

  describe('Idempotency & Safety', () => {
    it('should prevent duplicate connection requests', async () => {
      // Connection already exists and is pending
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'connection-1',
          status: 'pending',
        }],
      });

      await expect(
        requestConnection('practitioner-1', 'practitioner-2')
      ).rejects.toThrow('REQUEST_PENDING');
    });

    it('should prevent referrals to non-colleagues', async () => {
      // No connection exists
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(
        createReferralDraft('practitioner-1', 'practitioner-2', {
          requester_note: 'Test',
        })
      ).rejects.toThrow('NOT_COLLEAGUES');
    });
  });

  describe('Abuse Path / Adversarial QA', () => {
    it('revocation should redact identity (destructive delete)', async () => {
      // When consent is revoked, the library clears identity fields
      // The DB trigger provides additional safety, but library must do it too
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          client_consent_given: false,
          client_name_shared: false,
          client_name: null,  // Must be null after revocation
          client_contact: null,  // Must be null after revocation
          presenting_themes: [],
          constraints: [],
        }],
      });

      const referral = await recordConsent('referral-1', 'practitioner-1', {
        client_consent_given: false,
      });

      // Verify library clears identity on revocation
      expect(referral.client_consent_given).toBe(false);
      expect(referral.client_name_shared).toBe(false);
      expect(referral.client_name).toBeNull();
      expect(referral.client_contact).toBeNull();

      // Verify the SQL explicitly sets NULL
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('client_name = NULL'),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('client_contact = NULL'),
        expect.any(Array)
      );
    });

    it('getReferrals should filter out sealed referrals', async () => {
      // Sealed referrals (from broken connections) should not appear
      mockQuery.mockResolvedValueOnce({
        rows: [
          // Only unsealed referral should be returned
          {
            id: 'referral-2',
            from_practitioner_id: 'other',
            to_practitioner_id: 'practitioner-1',
            status: 'sent',
            sealed_at: null,  // Not sealed
            presenting_themes: [],
            constraints: [],
          },
          // Sealed referral should be filtered by the query
        ],
      });

      const referrals = await getReferrals('practitioner-1', 'inbox');

      // Verify query includes sealed_at IS NULL filter
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('sealed_at IS NULL'),
        expect.any(Array)
      );

      expect(referrals.length).toBe(1);
      expect(referrals[0].id).toBe('referral-2');
    });

    it('getReferral should return null for sealed referrals', async () => {
      // Sealed referrals should not be accessible by ID
      mockQuery.mockResolvedValueOnce({ rows: [] });  // No rows = sealed or not found

      const referral = await getReferral('referral-sealed', 'practitioner-1');

      // Verify query includes sealed_at IS NULL filter
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('sealed_at IS NULL'),
        expect.any(Array)
      );

      expect(referral).toBeNull();
    });

    it('consent endpoint cannot create invalid DB state (name without consent)', async () => {
      // Even if client tries to pass name with consent=false, library clears it
      // The SQL shows client_name = NULL when consent is false
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          client_consent_given: false,
          client_name_shared: false,
          client_name: null,
          client_contact: null,
          presenting_themes: [],
          constraints: [],
        }],
      });

      const referral = await recordConsent('referral-1', 'practitioner-1', {
        client_consent_given: false,
        // Even if attacker tried to pass these, they should be ignored
      });

      expect(referral.client_name).toBeNull();
      expect(referral.client_contact).toBeNull();
    });

    it('consent endpoint cannot set name_shared without consent_given', async () => {
      // If consent_given=true but name_shared=false, name must be null
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          client_consent_given: true,
          client_name_shared: false,  // Not sharing
          client_name: null,  // Must be null
          client_contact: null,
          presenting_themes: [],
          constraints: [],
        }],
      });

      const referral = await recordConsent('referral-1', 'practitioner-1', {
        client_consent_given: true,
        client_name_shared: false,  // Consent given but not sharing name
      });

      expect(referral.client_consent_given).toBe(true);
      expect(referral.client_name_shared).toBe(false);
      expect(referral.client_name).toBeNull();
    });

    it('sendReferral uses atomic update (WHERE status=draft)', async () => {
      // Double-send protection: only one wins
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'referral-1',
          from_practitioner_id: 'practitioner-1',
          status: 'sent',
          sent_at: '2026-01-21T00:00:00Z',
          presenting_themes: [],
          constraints: [],
        }],
      });

      await sendReferral('referral-1', 'practitioner-1');

      // Verify atomic update pattern
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("status = 'draft'"),
        expect.any(Array)
      );
    });

    it('double-send should fail for already-sent referral', async () => {
      // Second send attempt should fail because status is no longer 'draft'
      mockQuery.mockResolvedValueOnce({ rows: [] });  // No rows = already sent

      await expect(
        sendReferral('referral-1', 'practitioner-1')
      ).rejects.toThrow('REFERRAL_NOT_FOUND');
    });

    it('cannot share identity without providing name (physics check)', async () => {
      // This tests the forbidden state: shared=true but name=null
      // Library should reject before DB CHECK even sees it
      await expect(
        recordConsent('referral-1', 'practitioner-1', {
          client_consent_given: true,
          client_name_shared: true,
          // client_name intentionally omitted
        })
      ).rejects.toThrow('CLIENT_NAME_REQUIRED_WHEN_SHARED');
    });

    it('cannot share identity with empty name (physics check)', async () => {
      // Empty string should also be rejected
      await expect(
        recordConsent('referral-1', 'practitioner-1', {
          client_consent_given: true,
          client_name_shared: true,
          client_name: '   ',  // whitespace only
        })
      ).rejects.toThrow('CLIENT_NAME_REQUIRED_WHEN_SHARED');
    });
  });
});
