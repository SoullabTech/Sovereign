/**
 * PHI Encryption Tests
 *
 * Verifies:
 * 1. Round-trip encryption/decryption
 * 2. AAD context binding (tampering detection)
 * 3. Key rotation support
 * 4. Search hash consistency
 * 5. Database helpers
 */

import {
  encryptPHI,
  decryptPHI,
  encryptForDB,
  decryptFromDB,
  serialize,
  deserialize,
  isEncrypted,
  hashForSearch,
  needsReencryption,
  generateKey,
  clearKeyCache,
  PHIContext,
  EncryptedPHI,
} from '../phiEncryption';

// Set up test key before tests
beforeAll(() => {
  // Generate a valid 32-byte test key (base64 encoded)
  process.env.PHI_ENCRYPTION_KEY = '+TZo517/ctbOw6AgFrgXlAEdPgaeieYQgxW6fVmXiJI=';
  process.env.PHI_ENCRYPTION_KEY_ID = 'test1';
  clearKeyCache();
});

afterEach(() => {
  clearKeyCache();
});

const testContext: PHIContext = {
  table: 'client_messages',
  column: 'body',
  rowId: '123e4567-e89b-12d3-a456-426614174000',
  ownerId: 'practitioner-abc',
};

describe('PHI Encryption', () => {
  describe('encryptPHI / decryptPHI', () => {
    it('should round-trip encrypt and decrypt text', () => {
      const plaintext = 'Patient reported feeling anxious during session.';

      const encrypted = encryptPHI(plaintext, testContext);
      const decrypted = decryptPHI(encrypted, testContext);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext (random IV)', () => {
      const plaintext = 'Same message twice';

      const encrypted1 = encryptPHI(plaintext, testContext);
      const encrypted2 = encryptPHI(plaintext, testContext);

      expect(encrypted1.c).not.toBe(encrypted2.c);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should handle empty string', () => {
      const plaintext = '';

      const encrypted = encryptPHI(plaintext, testContext);
      const decrypted = decryptPHI(encrypted, testContext);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode and special characters', () => {
      const plaintext = 'Patient feels better today. Notes: \u2764 \u{1F600} "quoted" & <special>';

      const encrypted = encryptPHI(plaintext, testContext);
      const decrypted = decryptPHI(encrypted, testContext);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long text', () => {
      const plaintext = 'A'.repeat(100000); // 100KB

      const encrypted = encryptPHI(plaintext, testContext);
      const decrypted = decryptPHI(encrypted, testContext);

      expect(decrypted).toBe(plaintext);
    });

    it('should include key ID in encrypted blob', () => {
      const encrypted = encryptPHI('test', testContext);

      expect(encrypted.kid).toBe('test1');
      expect(encrypted.v).toBe(1);
    });
  });

  describe('AAD context binding', () => {
    it('should fail decryption with wrong table', () => {
      const encrypted = encryptPHI('secret data', testContext);

      const wrongContext = { ...testContext, table: 'different_table' };

      expect(() => decryptPHI(encrypted, wrongContext)).toThrow(
        'PHI decryption failed'
      );
    });

    it('should fail decryption with wrong column', () => {
      const encrypted = encryptPHI('secret data', testContext);

      const wrongContext = { ...testContext, column: 'different_column' };

      expect(() => decryptPHI(encrypted, wrongContext)).toThrow(
        'PHI decryption failed'
      );
    });

    it('should fail decryption with wrong rowId', () => {
      const encrypted = encryptPHI('secret data', testContext);

      const wrongContext = { ...testContext, rowId: 'different-row-id' };

      expect(() => decryptPHI(encrypted, wrongContext)).toThrow(
        'PHI decryption failed'
      );
    });

    it('should fail decryption with wrong ownerId', () => {
      const encrypted = encryptPHI('secret data', testContext);

      const wrongContext = { ...testContext, ownerId: 'different-owner' };

      expect(() => decryptPHI(encrypted, wrongContext)).toThrow(
        'PHI decryption failed'
      );
    });

    it('should fail decryption with tampered ciphertext', () => {
      const encrypted = encryptPHI('secret data', testContext);

      // Tamper with ciphertext
      const tamperedBlob: EncryptedPHI = {
        ...encrypted,
        c: Buffer.from('tampered').toString('base64'),
      };

      expect(() => decryptPHI(tamperedBlob, testContext)).toThrow(
        'PHI decryption failed'
      );
    });

    it('should fail decryption with tampered auth tag', () => {
      const encrypted = encryptPHI('secret data', testContext);

      // Tamper with auth tag
      const tamperedBlob: EncryptedPHI = {
        ...encrypted,
        tag: Buffer.from('0'.repeat(16)).toString('base64'),
      };

      expect(() => decryptPHI(tamperedBlob, testContext)).toThrow(
        'PHI decryption failed'
      );
    });
  });

  describe('Database helpers', () => {
    it('encryptForDB should return separate ciphertext and meta', () => {
      const plaintext = 'Patient update';

      const { ciphertext, meta } = encryptForDB(plaintext, testContext);

      expect(typeof ciphertext).toBe('string');
      expect(meta.iv).toBeDefined();
      expect(meta.tag).toBeDefined();
      expect(meta.kid).toBe('test1');
      expect(meta.v).toBe(1);
      expect(meta.encrypted_at).toBeDefined();
    });

    it('decryptFromDB should reverse encryptForDB', () => {
      const plaintext = 'Patient update';

      const { ciphertext, meta } = encryptForDB(plaintext, testContext);
      const decrypted = decryptFromDB(ciphertext, meta, testContext);

      expect(decrypted).toBe(plaintext);
    });

    it('serialize/deserialize should round-trip', () => {
      const blob = encryptPHI('test data', testContext);

      const serialized = serialize(blob);
      const deserialized = deserialize(serialized);

      expect(deserialized).toEqual(blob);
    });

    it('isEncrypted should detect encrypted data', () => {
      const blob = encryptPHI('test', testContext);
      const serialized = serialize(blob);

      expect(isEncrypted(serialized)).toBe(true);
      expect(isEncrypted('plain text')).toBe(false);
      expect(isEncrypted('')).toBe(false);
      expect(isEncrypted('{}')).toBe(false);
    });
  });

  describe('Search hash', () => {
    it('should produce consistent hash for same value', () => {
      const value = 'john.doe@example.com';

      const hash1 = hashForSearch(value, testContext);
      const hash2 = hashForSearch(value, testContext);

      expect(hash1).toBe(hash2);
    });

    it('should be case-insensitive', () => {
      const hash1 = hashForSearch('John.Doe@Example.COM', testContext);
      const hash2 = hashForSearch('john.doe@example.com', testContext);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different contexts', () => {
      const value = 'same-value';

      const hash1 = hashForSearch(value, testContext);
      const hash2 = hashForSearch(value, { ...testContext, table: 'other_table' });

      expect(hash1).not.toBe(hash2);
    });

    it('should return 32-character hex string', () => {
      const hash = hashForSearch('test@test.com', testContext);

      expect(hash).toMatch(/^[a-f0-9]{32}$/);
    });
  });

  describe('Key rotation', () => {
    it('needsReencryption should detect old key', () => {
      const blob = encryptPHI('test', testContext);

      expect(needsReencryption(blob)).toBe(false);

      // Simulate old key
      const oldBlob: EncryptedPHI = { ...blob, kid: 'old-key' };
      expect(needsReencryption(oldBlob)).toBe(true);
    });

    it('should support multiple keys for decryption', () => {
      const originalKey = '+TZo517/ctbOw6AgFrgXlAEdPgaeieYQgxW6fVmXiJI=';
      const secondKey = 'TQtd9x16jGdQ3t9rhWc77MFUwr/jkc6dvaVBuHWAxLc=';

      // Start with original key
      process.env.PHI_ENCRYPTION_KEY = originalKey;
      process.env.PHI_ENCRYPTION_KEY_ID = 'test1';
      clearKeyCache();

      // Encrypt with current key (test1)
      const blob = encryptPHI('secret', testContext);

      // Switch to new current key, keep old key available
      process.env.PHI_ENCRYPTION_KEY = secondKey;
      process.env.PHI_ENCRYPTION_KEY_ID = 'k2';
      process.env.PHI_ENCRYPTION_KEY_test1 = originalKey;
      clearKeyCache();

      // Should still decrypt with old key (blob.kid = test1)
      const decrypted = decryptPHI(blob, testContext);
      expect(decrypted).toBe('secret');

      // Restore original key for other tests
      process.env.PHI_ENCRYPTION_KEY = originalKey;
      process.env.PHI_ENCRYPTION_KEY_ID = 'test1';
      delete process.env.PHI_ENCRYPTION_KEY_test1;
      clearKeyCache();
    });
  });

  describe('generateKey', () => {
    it('should generate valid 32-byte base64 key', () => {
      const key = generateKey();

      // Base64 of 32 bytes = 44 characters (with padding)
      expect(key.length).toBe(44);
      expect(key.endsWith('=')).toBe(true);

      // Should be valid base64
      const decoded = Buffer.from(key, 'base64');
      expect(decoded.length).toBe(32);
    });
  });
});
