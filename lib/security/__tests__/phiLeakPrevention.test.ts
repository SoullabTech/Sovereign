/**
 * PHI LEAK PREVENTION TRIPWIRE TESTS
 *
 * These tests verify that encrypted PHI columns (*_enc, *_enc_meta)
 * never leak into API responses or data layer outputs.
 *
 * The invariant: encrypted columns are used for storage/decryption only.
 * They must NEVER appear in the output shape of data layer functions.
 *
 * @see docs/security/phi-columns.md - "Do Not Break These Invariants"
 */

import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';

// ============================================================================
// Test utilities
// ============================================================================

/**
 * Recursively check if an object contains any keys ending in _enc or _enc_meta
 */
function containsEncryptedColumns(obj: unknown, path = ''): string[] {
  const violations: string[] = [];

  if (obj === null || obj === undefined) {
    return violations;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      violations.push(...containsEncryptedColumns(item, `${path}[${index}]`));
    });
    return violations;
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const currentPath = path ? `${path}.${key}` : key;

      // Check if key ends with _enc or _enc_meta
      if (key.endsWith('_enc') || key.endsWith('_enc_meta')) {
        violations.push(currentPath);
      }

      // Recurse into nested objects
      violations.push(...containsEncryptedColumns(value, currentPath));
    }
  }

  return violations;
}

/**
 * Assert that an object contains no encrypted columns
 */
function assertNoEncryptedColumns(obj: unknown, context: string) {
  const violations = containsEncryptedColumns(obj);
  if (violations.length > 0) {
    throw new Error(
      `PHI LEAK DETECTED in ${context}:\n` +
      `Found encrypted columns in output: ${violations.join(', ')}\n` +
      `These columns must never appear in API responses or data layer outputs.`
    );
  }
}

// ============================================================================
// Mock setup
// ============================================================================

const mockQuery = jest.fn();
const mockInsertOne = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: any[]) => mockQuery(...args),
  insertOne: (...args: any[]) => mockInsertOne(...args),
}));

// Mock encryption functions to avoid key requirements in tests
// Note: stripEncryptedColumns is imported directly from the real module in some files
jest.mock('@/lib/security/phiEncryption', () => {
  // Use the real stripEncryptedColumns implementation
  const actual = jest.requireActual('@/lib/security/phiEncryption');
  return {
    encryptForDB: jest.fn().mockReturnValue({
      ciphertext: 'encrypted-data',
      meta: { kid: 'test', iv: 'test-iv' },
    }),
    decryptFromDB: jest.fn().mockImplementation(
      (ciphertext: string, meta: any, context: any) => 'decrypted-value'
    ),
    stripEncryptedColumns: actual.stripEncryptedColumns,
  };
});

// ============================================================================
// Test data
// ============================================================================

const MOCK_CLIENT_ROW_WITH_ENC = {
  id: 'client-123',
  practitioner_id: 'practitioner-456',
  name: 'Test Client',
  preferred_name: 'Testy',
  email: 'test@example.com',
  // These should NEVER appear in output
  name_enc: 'encrypted-blob-abc',
  name_enc_meta: { kid: 'k1', iv: 'iv123' },
  preferred_name_enc: 'encrypted-blob-def',
  preferred_name_enc_meta: { kid: 'k1', iv: 'iv456' },
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
};

const MOCK_SESSION_ROW_WITH_ENC = {
  id: 'session-123',
  practitioner_id: 'practitioner-456',
  client_id: 'client-123',
  session_type: 'individual',
  scheduled_at: '2024-01-15T10:00:00Z',
  status: 'scheduled',
  // Joined client fields with encrypted columns
  client_name: 'Test Client',
  client_preferred_name: 'Testy',
  client_name_enc: 'encrypted-blob-abc',
  client_name_enc_meta: { kid: 'k1', iv: 'iv123' },
  client_preferred_name_enc: 'encrypted-blob-def',
  client_preferred_name_enc_meta: { kid: 'k1', iv: 'iv456' },
};

const MOCK_MESSAGE_ROW_WITH_ENC = {
  id: 'message-123',
  practitioner_id: 'practitioner-456',
  client_id: 'client-123',
  direction: 'inbound',
  subject: 'Test Subject',
  body: 'Test body',
  // These should NEVER appear in output
  body_enc: 'encrypted-body-blob',
  body_enc_meta: { kid: 'k1', iv: 'iv789' },
  subject_enc: 'encrypted-subject-blob',
  subject_enc_meta: { kid: 'k1', iv: 'iv012' },
  client_name: 'Test Client',
  client_name_enc: 'encrypted-blob-abc',
  client_name_enc_meta: { kid: 'k1', iv: 'iv123' },
};

const MOCK_CASE_NOTE_ROW_WITH_ENC = {
  id: 'note-123',
  case_id: 'case-456',
  practitioner_id: 'practitioner-456',
  note_type: 'session',
  session_date: '2024-01-15',
  session_duration_minutes: 60,
  content: 'Test note content with sensitive clinical info',
  // These should NEVER appear in output
  content_enc: 'encrypted-content-blob',
  content_enc_meta: { kid: 'k1', iv: 'iv-content' },
  interventions_used: ['CBT', 'mindfulness'],
  themes_observed: ['anxiety', 'relationships'],
  element_focus: 'water',
  spiral_movement: 'ascending',
  maia_analysis: null,
  pattern_markers: [],
  linked_capture_session_id: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

const MOCK_EMERGENCY_INFO_ROW_WITH_ENC = {
  id: 'emergency-123',
  client_id: 'client-123',
  emergency_contacts: [{ name: 'John Doe', phone: '555-1234', relationship: 'spouse' }],
  safety_plan: 'Call therapist, then 988 hotline, then ER',
  medications: 'Lexapro 10mg daily, Xanax 0.5mg PRN',
  medical_conditions: 'Anxiety disorder, PTSD',
  risk_notes: 'History of SI 2023, currently stable',
  crisis_resources: [{ name: '988', phone: '988', type: 'hotline' }],
  has_safety_plan: true,
  has_risk_factors: true,
  // These should NEVER appear in output
  safety_plan_enc: 'encrypted-safety-plan',
  safety_plan_enc_meta: { kid: 'k1', iv: 'iv-safety' },
  medications_enc: 'encrypted-medications',
  medications_enc_meta: { kid: 'k1', iv: 'iv-meds' },
  medical_conditions_enc: 'encrypted-conditions',
  medical_conditions_enc_meta: { kid: 'k1', iv: 'iv-conditions' },
  risk_notes_enc: 'encrypted-risk-notes',
  risk_notes_enc_meta: { kid: 'k1', iv: 'iv-risk' },
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

const MOCK_CONSULTATION_ROW_WITH_ENC = {
  id: 'consultation-123',
  practitioner_id: 'practitioner-456',
  case_id: 'case-789',
  consultation_type: 'pattern_analysis',
  practitioner_query: 'What themes are emerging with this client?',
  context_provided: { case: { id: 'case-789' }, patterns: null },
  maia_response: '{"case_summary": "Test summary", "themes_emerging": ["anxiety"]}',
  practitioner_rating: 4,
  practitioner_feedback: 'Very helpful insights',
  model_used: 'deepseek-r1',
  tokens_used: 500,
  // These should NEVER appear in output
  practitioner_query_enc: 'encrypted-query',
  practitioner_query_enc_meta: { kid: 'k1', iv: 'iv-query' },
  context_provided_enc: 'encrypted-context',
  context_provided_enc_meta: { kid: 'k1', iv: 'iv-context' },
  maia_response_enc: 'encrypted-response',
  maia_response_enc_meta: { kid: 'k1', iv: 'iv-response' },
  practitioner_feedback_enc: 'encrypted-feedback',
  practitioner_feedback_enc_meta: { kid: 'k1', iv: 'iv-feedback' },
  created_at: '2024-01-15T10:00:00Z',
};

// ============================================================================
// Tests
// ============================================================================

describe('PHI Leak Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
    mockInsertOne.mockReset();
  });

  describe('containsEncryptedColumns helper', () => {
    it('should detect _enc columns at top level', () => {
      const obj = { name: 'test', name_enc: 'encrypted' };
      const violations = containsEncryptedColumns(obj);
      expect(violations).toContain('name_enc');
    });

    it('should detect _enc_meta columns', () => {
      const obj = { name_enc_meta: { kid: 'k1' } };
      const violations = containsEncryptedColumns(obj);
      expect(violations).toContain('name_enc_meta');
    });

    it('should detect nested encrypted columns', () => {
      const obj = { client: { name_enc: 'encrypted' } };
      const violations = containsEncryptedColumns(obj);
      expect(violations).toContain('client.name_enc');
    });

    it('should detect encrypted columns in arrays', () => {
      const obj = { clients: [{ name_enc: 'encrypted' }] };
      const violations = containsEncryptedColumns(obj);
      expect(violations).toContain('clients[0].name_enc');
    });

    it('should return empty array for clean objects', () => {
      const obj = { name: 'test', email: 'test@example.com' };
      const violations = containsEncryptedColumns(obj);
      expect(violations).toHaveLength(0);
    });
  });

  describe('Client data layer', () => {
    it('getClients should never return *_enc columns', async () => {
      // Mock returns row WITH encrypted columns
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }] }) // count query
        .mockResolvedValueOnce({ rows: [MOCK_CLIENT_ROW_WITH_ENC] }); // data query

      const { getClients } = await import('@/lib/stellium/clients');
      const result = await getClients('practitioner-456');

      // Verify no encrypted columns leak
      assertNoEncryptedColumns(result, 'getClients');

      // Verify we still get the decrypted name
      expect(result.clients[0]).toHaveProperty('name');
    });

    it('getClient should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_CLIENT_ROW_WITH_ENC] });

      const { getClient } = await import('@/lib/stellium/clients');
      const result = await getClient('practitioner-456', 'client-123');

      assertNoEncryptedColumns(result, 'getClient');
    });
  });

  describe('Session data layer', () => {
    it('getSessions should never return *_enc columns in client data', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [MOCK_SESSION_ROW_WITH_ENC] });

      const { getSessions } = await import('@/lib/stellium/sessions');
      const result = await getSessions('practitioner-456');

      assertNoEncryptedColumns(result, 'getSessions');
    });

    it('getUpcomingSessions should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_SESSION_ROW_WITH_ENC] });

      const { getUpcomingSessions } = await import('@/lib/stellium/sessions');
      const result = await getUpcomingSessions('practitioner-456');

      assertNoEncryptedColumns(result, 'getUpcomingSessions');
    });
  });

  describe('decryptJoinedClientFields sanitization', () => {
    it('should return object without *_enc columns', async () => {
      // This tests the helper function directly
      const { decryptJoinedClientFields } = await import('@/lib/stellium/clients');

      const row = {
        client_id: 'client-123',
        client_name: 'Test Client',
        client_name_enc: 'encrypted-blob',
        client_name_enc_meta: { kid: 'k1' },
        client_preferred_name: 'Testy',
        client_preferred_name_enc: 'encrypted-blob-2',
        client_preferred_name_enc_meta: { kid: 'k1' },
      };

      const result = decryptJoinedClientFields(row, 'practitioner-456');

      // Result should only contain decrypted fields
      expect(result).toHaveProperty('client_name');
      expect(result).toHaveProperty('client_preferred_name');

      // Result should NOT contain encrypted columns
      assertNoEncryptedColumns(result, 'decryptJoinedClientFields');
    });
  });

  describe('Message data layer', () => {
    it('getMessage should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_MESSAGE_ROW_WITH_ENC] });

      const { getMessage } = await import('@/lib/practitioner/messages');
      const result = await getMessage('practitioner-456', 'message-123');

      assertNoEncryptedColumns(result, 'getMessage');

      // Verify we still get the body
      expect(result).toHaveProperty('body');
    });

    it('getClientThread should never return *_enc columns', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [MOCK_CLIENT_ROW_WITH_ENC] }) // client query
        .mockResolvedValueOnce({ rows: [MOCK_MESSAGE_ROW_WITH_ENC] }) // messages query
        .mockResolvedValueOnce({ rows: [{ id: 'policy-1' }] }) // policy query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }); // unread count query

      const { getClientThread } = await import('@/lib/practitioner/messages');
      const result = await getClientThread('practitioner-456', 'client-123');

      assertNoEncryptedColumns(result, 'getClientThread');

      // Verify structure is preserved
      expect(result).toHaveProperty('client');
      expect(result).toHaveProperty('messages');
    });

    it('getUnreviewedSafetyConcerns should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_MESSAGE_ROW_WITH_ENC] });

      const { getUnreviewedSafetyConcerns } = await import('@/lib/practitioner/messages');
      const result = await getUnreviewedSafetyConcerns('practitioner-456');

      assertNoEncryptedColumns(result, 'getUnreviewedSafetyConcerns');

      // Should be an array
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Case notes data layer (Wave 2)', () => {
    it('getNote should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_CASE_NOTE_ROW_WITH_ENC] });

      const { getNote } = await import('@/lib/caseload/CaseStore');
      const result = await getNote('note-123', 'practitioner-456');

      assertNoEncryptedColumns(result, 'getNote');

      // Verify we still get the content (Stage B: decrypted from _enc)
      expect(result).toHaveProperty('content');
      expect(typeof result?.content).toBe('string');
    });

    it('listNotes should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_CASE_NOTE_ROW_WITH_ENC, MOCK_CASE_NOTE_ROW_WITH_ENC] });

      const { listNotes } = await import('@/lib/caseload/CaseStore');
      const result = await listNotes('case-456', 'practitioner-456');

      assertNoEncryptedColumns(result, 'listNotes');

      // Should be an array with content
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('content');
    });

    it('createNote should never return *_enc columns', async () => {
      mockInsertOne.mockResolvedValueOnce(MOCK_CASE_NOTE_ROW_WITH_ENC);

      const { createNote } = await import('@/lib/caseload/CaseStore');
      const result = await createNote('case-456', 'practitioner-456', {
        note_type: 'session',
        content: 'Test note content',
      });

      assertNoEncryptedColumns(result, 'createNote');

      // Verify we still get the content
      expect(result).toHaveProperty('content');
    });

    it('updateNote should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_CASE_NOTE_ROW_WITH_ENC] });

      const { updateNote } = await import('@/lib/caseload/CaseStore');
      const result = await updateNote('note-123', 'practitioner-456', {
        content: 'Updated content',
      });

      assertNoEncryptedColumns(result, 'updateNote');

      // Verify we still get the content
      expect(result).toHaveProperty('content');
    });

    it('updateNoteAnalysis should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_CASE_NOTE_ROW_WITH_ENC] });

      const { updateNoteAnalysis } = await import('@/lib/caseload/CaseStore');
      const result = await updateNoteAnalysis('note-123', 'practitioner-456', {
        patterns_observed: ['test'],
        analyzed_at: '2024-01-15T10:00:00Z',
      }, ['pattern1']);

      assertNoEncryptedColumns(result, 'updateNoteAnalysis');

      // Verify we still get the content
      expect(result).toHaveProperty('content');
    });
  });

  describe('Emergency info data layer (Wave 2)', () => {
    it('getEmergencyInfo should never return *_enc columns', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'client-123' }] }) // client check
        .mockResolvedValueOnce({ rows: [MOCK_EMERGENCY_INFO_ROW_WITH_ENC] }); // emergency info

      const { getEmergencyInfo } = await import('@/lib/practitioner/sessionPrep');
      const result = await getEmergencyInfo('practitioner-456', 'client-123');

      assertNoEncryptedColumns(result, 'getEmergencyInfo');

      // Verify we still get the fields (Stage B: decrypted from _enc)
      expect(result).toHaveProperty('safety_plan');
      expect(typeof result?.safety_plan).toBe('string');
      expect(result).toHaveProperty('medications');
      expect(result).toHaveProperty('medical_conditions');
      expect(result).toHaveProperty('risk_notes');
    });

    it('upsertEmergencyInfo should never return *_enc columns', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'client-123' }] }) // client check
        .mockResolvedValueOnce({ rows: [MOCK_EMERGENCY_INFO_ROW_WITH_ENC] }); // upsert result

      const { upsertEmergencyInfo } = await import('@/lib/practitioner/sessionPrep');
      const result = await upsertEmergencyInfo('practitioner-456', 'client-123', {
        safety_plan: 'Updated safety plan',
        medications: 'Updated medications',
        medical_conditions: 'Updated conditions',
        risk_notes: 'Updated risk notes',
      });

      assertNoEncryptedColumns(result, 'upsertEmergencyInfo');

      // Verify we still get the plaintext fields
      expect(result).toHaveProperty('safety_plan');
      expect(result).toHaveProperty('medications');
      expect(result).toHaveProperty('medical_conditions');
      expect(result).toHaveProperty('risk_notes');
    });
  });

  describe('MAIA consultations data layer (Wave 2)', () => {
    it('CaseConsultationService.list should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_CONSULTATION_ROW_WITH_ENC] });

      const { CaseConsultationService } = await import('@/lib/caseload/CaseConsultationService');
      const result = await CaseConsultationService.list({
        caseId: 'case-789',
        memberId: 'practitioner-456',
      });

      assertNoEncryptedColumns(result, 'CaseConsultationService.list');

      // Verify we still get the plaintext fields
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('practitioner_query');
      expect(result[0]).toHaveProperty('maia_response');
      expect(result[0]).toHaveProperty('practitioner_feedback');
    });

    it('CaseConsultationService.get should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_CONSULTATION_ROW_WITH_ENC] });

      const { CaseConsultationService } = await import('@/lib/caseload/CaseConsultationService');
      const result = await CaseConsultationService.get({
        consultationId: 'consultation-123',
        memberId: 'practitioner-456',
      });

      assertNoEncryptedColumns(result, 'CaseConsultationService.get');

      // Verify we still get the fields (Stage B: decrypted from _enc)
      expect(result).toHaveProperty('practitioner_query');
      expect(typeof result?.practitioner_query).toBe('string');
      expect(result).toHaveProperty('maia_response');
      expect(result).toHaveProperty('context_provided');
    });

    it('CaseConsultationService.rate should never return *_enc columns', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [MOCK_CONSULTATION_ROW_WITH_ENC] });

      const { CaseConsultationService } = await import('@/lib/caseload/CaseConsultationService');
      const result = await CaseConsultationService.rate({
        consultationId: 'consultation-123',
        memberId: 'practitioner-456',
        rating: 5,
        feedback: 'Great consultation',
      });

      assertNoEncryptedColumns(result, 'CaseConsultationService.rate');

      // Verify we still get the plaintext fields
      expect(result).toHaveProperty('practitioner_feedback');
      expect(result).toHaveProperty('practitioner_rating');
    });
  });

  describe('Practitioner client notes accessor (encrypted-from-birth)', () => {
    // phiEncryption is mocked file-wide here, so this suite tests the LEAK
    // invariant only: ciphertext must never reach the output shape. The real
    // AAD round-trip (a different defect) runs against real crypto in
    // practitionerClientNotes.test.ts.
    const RAW_ROW = {
      id: 'note-123',
      client_id: 'client-123',
      practitioner_id: 'practitioner-456',
      content_enc: 'encrypted-data',
      content_enc_meta: { kid: 'test', iv: 'test-iv' },
      note_date: '2026-07-30',
      created_at: '2026-07-30T00:00:00.000Z',
      updated_at: '2026-07-30T00:00:00.000Z',
    };

    it('decryptClientNoteRow should never return *_enc columns', () => {
      const {
        decryptClientNoteRow,
      } = require('@/lib/security/phiAccessors/practitionerClientNotes');

      const note = decryptClientNoteRow(RAW_ROW);

      assertNoEncryptedColumns(note, 'decryptClientNoteRow');
      expect(note).not.toBeNull();
      expect(note).toHaveProperty('content');
      expect(note).toHaveProperty('noteDate');
    });

    it('decryptClientNoteRows should never return *_enc columns', () => {
      const {
        decryptClientNoteRows,
      } = require('@/lib/security/phiAccessors/practitionerClientNotes');

      const notes = decryptClientNoteRows([RAW_ROW, { ...RAW_ROW, id: 'note-456' }]);

      assertNoEncryptedColumns(notes, 'decryptClientNoteRows');
      expect(notes).toHaveLength(2);
    });

    it('sanitizeClientNoteRow should strip ciphertext from a raw row', () => {
      const {
        sanitizeClientNoteRow,
      } = require('@/lib/security/phiAccessors/practitionerClientNotes');

      assertNoEncryptedColumns(sanitizeClientNoteRow(RAW_ROW), 'sanitizeClientNoteRow');
    });
  });

  describe('stripEncryptedColumns helper', () => {
    it('should remove all *_enc and *_enc_meta keys', () => {
      // Import the real function
      const { stripEncryptedColumns } = require('@/lib/security/phiEncryption');

      const input = {
        id: '123',
        name: 'Test',
        name_enc: 'encrypted-blob',
        name_enc_meta: { kid: 'k1' },
        preferred_name_enc: 'blob',
        preferred_name_enc_meta: { kid: 'k1' },
        body_enc: 'encrypted-body',
        body_enc_meta: { kid: 'k1' },
      };

      const result = stripEncryptedColumns(input);

      expect(result).toEqual({
        id: '123',
        name: 'Test',
      });
      assertNoEncryptedColumns(result, 'stripEncryptedColumns');
    });

    it('should work recursively on nested objects', () => {
      const { stripEncryptedColumns } = require('@/lib/security/phiEncryption');

      const input = {
        client: {
          name: 'Test',
          name_enc: 'blob',
          name_enc_meta: { kid: 'k1' },
        },
      };

      const result = stripEncryptedColumns(input);

      expect(result.client.name).toBe('Test');
      assertNoEncryptedColumns(result, 'stripEncryptedColumns nested');
    });

    it('should work on arrays', () => {
      const { stripEncryptedColumns } = require('@/lib/security/phiEncryption');

      const input = [
        { id: '1', name_enc: 'blob' },
        { id: '2', body_enc: 'blob' },
      ];

      const result = stripEncryptedColumns(input);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '1' });
      expect(result[1]).toEqual({ id: '2' });
      assertNoEncryptedColumns(result, 'stripEncryptedColumns array');
    });
  });

  describe('Invariant: encrypted columns are internal only', () => {
    it('TRIPWIRE: any new data layer function must not expose *_enc columns', () => {
      // This is a documentation test - it always passes but serves as a reminder
      // When adding new data layer functions, add a test case here
      const testedFunctions = [
        // Wave 1: Client identity
        'getClients',
        'getClient',
        'getSessions',
        'getUpcomingSessions',
        'decryptJoinedClientFields',
        // Wave 1: Messages
        'getMessage',
        'getClientThread',
        'getUnreviewedSafetyConcerns',
        // Wave 2: Case notes
        'getNote',
        'listNotes',
        'createNote',
        'updateNote',
        'updateNoteAnalysis',
        // Wave 2: Emergency info
        'getEmergencyInfo',
        'upsertEmergencyInfo',
        // Wave 2: MAIA consultations
        'CaseConsultationService.list',
        'CaseConsultationService.get',
        'CaseConsultationService.rate',
        // Utilities
        'stripEncryptedColumns',
      ];

      // If you're adding a new function that handles PHI data,
      // add it to this list AND add a test case above
      expect(testedFunctions.length).toBeGreaterThan(0);
    });
  });
});
