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
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: any[]) => mockQuery(...args),
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

// ============================================================================
// Tests
// ============================================================================

describe('PHI Leak Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
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
        'getClients',
        'getClient',
        'getSessions',
        'getUpcomingSessions',
        'decryptJoinedClientFields',
        // Added in PHI hardening pass
        'getMessage',
        'getClientThread',
        'getUnreviewedSafetyConcerns',
        'stripEncryptedColumns',
      ];

      // If you're adding a new function that handles client data,
      // add it to this list AND add a test case above
      expect(testedFunctions.length).toBeGreaterThan(0);
    });
  });
});
