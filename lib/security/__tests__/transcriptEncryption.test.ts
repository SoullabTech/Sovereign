/**
 * Transcript PHI Encryption Tests
 *
 * HIPAA Sprint 7 Phase 3A
 *
 * Tests for:
 * - Encrypt/decrypt round-trip
 * - PHI accessor helpers
 * - stripEncryptedColumns sanitization
 * - Context binding (AAD)
 */
import {
  encryptTranscriptText,
  decryptTranscriptText,
  getEncryptedColumnsForInsert,
  readTranscriptText,
  decryptTranscriptSegmentRow,
  decryptTranscriptSegments,
  isPHIEncryptionEnabled,
  type TranscriptSegmentRow,
} from '../phiAccessors/transcripts';
import { stripEncryptedColumns, clearKeyCache } from '../phiEncryption';

// Store original env
let originalKey: string | undefined;

// Valid 32-byte key in hex format (64 hex chars)
const TEST_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('Transcript PHI Encryption', () => {
  beforeAll(() => {
    // Save original env and set test key
    originalKey = process.env.PHI_ENCRYPTION_KEY;
    // 32-byte test key in hex format (64 hex chars = 32 bytes)
    process.env.PHI_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    // Clear key cache to pick up test key
    clearKeyCache();
  });

  afterAll(() => {
    // Restore original env
    if (originalKey !== undefined) {
      process.env.PHI_ENCRYPTION_KEY = originalKey;
    } else {
      delete process.env.PHI_ENCRYPTION_KEY;
    }
    // Clear key cache after tests
    clearKeyCache();
  });

  describe('isPHIEncryptionEnabled', () => {
    test('should return true when key is set', () => {
      expect(isPHIEncryptionEnabled()).toBe(true);
    });

    test('should return false when key is not set', () => {
      const saved = process.env.PHI_ENCRYPTION_KEY;
      delete process.env.PHI_ENCRYPTION_KEY;
      expect(isPHIEncryptionEnabled()).toBe(false);
      process.env.PHI_ENCRYPTION_KEY = saved;
    });
  });

  describe('encryptTranscriptText / decryptTranscriptText', () => {
    const testCtx = {
      table: 'supervision_transcript_segments' as const,
      rowId: 'seg-001',
      sessionId: 'sess-001',
      practitionerId: 'prac-001',
    };

    test('should encrypt and decrypt text round-trip', () => {
      const originalText = 'Client expressed deep sadness about family separation.';
      const { text_enc, text_enc_meta } = encryptTranscriptText(originalText, testCtx);

      // Encrypted text should be different from original
      expect(text_enc).not.toBe(originalText);
      expect(text_enc.length).toBeGreaterThan(0);

      // Metadata should be valid JSON
      const meta = JSON.parse(text_enc_meta);
      expect(meta.iv).toBeDefined();
      expect(meta.tag).toBeDefined();
      expect(meta.kid).toBeDefined();
      expect(meta.v).toBeDefined();

      // Decrypt should return original
      const decrypted = decryptTranscriptText(text_enc, text_enc_meta, testCtx);
      expect(decrypted).toBe(originalText);
    });

    test('should handle empty string', () => {
      const { text_enc, text_enc_meta } = encryptTranscriptText('', testCtx);
      const decrypted = decryptTranscriptText(text_enc, text_enc_meta, testCtx);
      expect(decrypted).toBe('');
    });

    test('should handle unicode and special characters', () => {
      const originalText = 'Client said: "I feel like I\'m stuck 🌀 in a spiral of despair."';
      const { text_enc, text_enc_meta } = encryptTranscriptText(originalText, testCtx);
      const decrypted = decryptTranscriptText(text_enc, text_enc_meta, testCtx);
      expect(decrypted).toBe(originalText);
    });

    test('should handle long text', () => {
      const originalText = 'A'.repeat(10000);
      const { text_enc, text_enc_meta } = encryptTranscriptText(originalText, testCtx);
      const decrypted = decryptTranscriptText(text_enc, text_enc_meta, testCtx);
      expect(decrypted).toBe(originalText);
    });

    test('should produce different ciphertext for same plaintext (unique IV)', () => {
      const originalText = 'Same text';
      const { text_enc: enc1 } = encryptTranscriptText(originalText, testCtx);
      const { text_enc: enc2 } = encryptTranscriptText(originalText, testCtx);
      expect(enc1).not.toBe(enc2);
    });

    test('should fail decryption with wrong context', () => {
      const originalText = 'Secret transcript text';
      const { text_enc, text_enc_meta } = encryptTranscriptText(originalText, testCtx);

      const wrongCtx = {
        ...testCtx,
        rowId: 'wrong-row',
      };

      expect(() => decryptTranscriptText(text_enc, text_enc_meta, wrongCtx)).toThrow();
    });
  });

  describe('getEncryptedColumnsForInsert', () => {
    test('should return textEnc and textEncMeta', () => {
      const ctx = {
        table: 'practice_transcript_segments' as const,
        rowId: 'seg-002',
        sessionId: 'sess-002',
      };
      const result = getEncryptedColumnsForInsert('Test text', ctx);

      expect(result.textEnc).toBeDefined();
      expect(result.textEncMeta).toBeDefined();
      expect(typeof result.textEnc).toBe('string');
      expect(typeof result.textEncMeta).toBe('string');
    });
  });

  describe('readTranscriptText', () => {
    const baseCtx = {
      table: 'supervision_transcript_segments' as const,
      sessionId: 'sess-003',
    };

    test('should prefer encrypted text when available', () => {
      const originalText = 'Original transcript segment';
      const fullCtx = { ...baseCtx, rowId: 'seg-003' };
      const { text_enc, text_enc_meta } = encryptTranscriptText(originalText, fullCtx);

      const row: TranscriptSegmentRow = {
        id: 'seg-003',
        session_id: 'sess-003',
        text: 'Old plaintext that should be ignored',
        text_enc,
        text_enc_meta,
      };

      const result = readTranscriptText(row, baseCtx);
      expect(result).toBe(originalText);
    });

    test('should fall back to plaintext when encrypted not available', () => {
      const row: TranscriptSegmentRow = {
        id: 'seg-004',
        session_id: 'sess-003',
        text: 'Plaintext fallback',
      };

      const result = readTranscriptText(row, baseCtx);
      expect(result).toBe('Plaintext fallback');
    });

    test('should return empty string when no text available', () => {
      const row: TranscriptSegmentRow = {
        id: 'seg-005',
        session_id: 'sess-003',
      };

      const result = readTranscriptText(row, baseCtx);
      expect(result).toBe('');
    });
  });

  describe('decryptTranscriptSegmentRow', () => {
    const baseCtx = {
      table: 'supervision_transcript_segments' as const,
      sessionId: 'sess-006',
    };

    test('should decrypt and strip encrypted columns', () => {
      const originalText = 'Decrypted segment text';
      const fullCtx = { ...baseCtx, rowId: 'seg-006' };
      const { text_enc, text_enc_meta } = encryptTranscriptText(originalText, fullCtx);

      const row: TranscriptSegmentRow = {
        id: 'seg-006',
        session_id: 'sess-006',
        speaker: 'THERAPIST',
        start_ms: 1000,
        end_ms: 5000,
        text: 'ignored',
        text_enc,
        text_enc_meta,
      };

      const result = decryptTranscriptSegmentRow(row, baseCtx);

      // Text should be decrypted
      expect(result.text).toBe(originalText);

      // Encrypted columns should be stripped
      expect(result.text_enc).toBeUndefined();
      expect(result.text_enc_meta).toBeUndefined();

      // Other columns preserved
      expect(result.speaker).toBe('THERAPIST');
      expect(result.start_ms).toBe(1000);
    });
  });

  describe('decryptTranscriptSegments', () => {
    const baseCtx = {
      table: 'practice_transcript_segments' as const,
      sessionId: 'sess-007',
    };

    test('should process multiple rows', () => {
      const rows: TranscriptSegmentRow[] = [];

      for (let i = 0; i < 3; i++) {
        const fullCtx = { ...baseCtx, rowId: `seg-00${i + 7}` };
        const text = `Segment ${i + 1} content`;
        const { text_enc, text_enc_meta } = encryptTranscriptText(text, fullCtx);

        rows.push({
          id: `seg-00${i + 7}`,
          session_id: 'sess-007',
          text: 'ignored',
          text_enc,
          text_enc_meta,
        });
      }

      const result = decryptTranscriptSegments(rows, baseCtx);

      expect(result).toHaveLength(3);
      expect(result[0].text).toBe('Segment 1 content');
      expect(result[1].text).toBe('Segment 2 content');
      expect(result[2].text).toBe('Segment 3 content');

      // All should have encrypted columns stripped
      result.forEach(row => {
        expect(row.text_enc).toBeUndefined();
        expect(row.text_enc_meta).toBeUndefined();
      });
    });
  });
});

describe('stripEncryptedColumns', () => {
  test('should remove *_enc columns from object', () => {
    const data = {
      id: 'msg-001',
      body: 'plain body',
      body_enc: 'encrypted-body',
      body_enc_meta: { iv: '123', tag: '456' },
      other_field: 'kept',
    };

    const result = stripEncryptedColumns(data);

    expect(result.id).toBe('msg-001');
    expect(result.body).toBe('plain body');
    expect(result.other_field).toBe('kept');
    expect(result.body_enc).toBeUndefined();
    expect(result.body_enc_meta).toBeUndefined();
  });

  test('should handle nested objects', () => {
    const data = {
      id: 'parent',
      nested: {
        text: 'plain text',
        text_enc: 'encrypted-text',
        text_enc_meta: { iv: 'abc' },
      },
    };

    const result = stripEncryptedColumns(data);

    expect(result.nested.text).toBe('plain text');
    expect(result.nested.text_enc).toBeUndefined();
    expect(result.nested.text_enc_meta).toBeUndefined();
  });

  test('should handle arrays', () => {
    const data = [
      { id: '1', text: 'a', text_enc: 'enc-a' },
      { id: '2', text: 'b', text_enc: 'enc-b' },
    ];

    const result = stripEncryptedColumns(data);

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('a');
    expect(result[0].text_enc).toBeUndefined();
    expect(result[1].text).toBe('b');
    expect(result[1].text_enc).toBeUndefined();
  });

  test('should handle null and undefined', () => {
    expect(stripEncryptedColumns(null)).toBeNull();
    expect(stripEncryptedColumns(undefined)).toBeUndefined();
  });

  test('should handle primitives', () => {
    expect(stripEncryptedColumns('string')).toBe('string');
    expect(stripEncryptedColumns(123)).toBe(123);
    expect(stripEncryptedColumns(true)).toBe(true);
  });
});

describe('PHI Leak Prevention', () => {
  beforeAll(() => {
    process.env.PHI_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    clearKeyCache();
  });

  afterAll(() => {
    clearKeyCache();
  });

  test('should never include *_enc in serialized output', () => {
    const ctx = {
      table: 'supervision_transcript_segments' as const,
      rowId: 'leak-test',
      sessionId: 'sess-leak',
    };

    const sensitive = 'Patient disclosed suicidal ideation with specific plan.';
    const { text_enc, text_enc_meta } = encryptTranscriptText(sensitive, ctx);

    const row: TranscriptSegmentRow = {
      id: 'leak-test',
      session_id: 'sess-leak',
      speaker: 'CLIENT',
      text: 'will be replaced',
      text_enc,
      text_enc_meta,
    };

    const sanitized = decryptTranscriptSegmentRow(row, {
      table: 'supervision_transcript_segments',
      sessionId: 'sess-leak',
    });

    const json = JSON.stringify(sanitized);

    // Should not contain any encrypted fields
    expect(json).not.toContain('_enc');
    expect(json).not.toContain('text_enc');
    expect(json).not.toContain('text_enc_meta');

    // Should contain decrypted content
    expect(json).toContain(sensitive);
  });

  test('should prevent ciphertext from API response', () => {
    const mockApiResponse = {
      success: true,
      data: {
        segments: [
          {
            id: 'seg-1',
            session_id: 'sess-1',
            speaker: 'THERAPIST',
            text: 'How are you feeling today?',
            text_enc: 'SHOULD_NOT_APPEAR',
            text_enc_meta: { iv: 'SHOULD_NOT_APPEAR' },
          },
        ],
      },
    };

    const sanitized = stripEncryptedColumns(mockApiResponse);
    const json = JSON.stringify(sanitized);

    expect(json).not.toContain('SHOULD_NOT_APPEAR');
    expect(json).not.toContain('text_enc');
    expect(json).toContain('How are you feeling today?');
  });
});
