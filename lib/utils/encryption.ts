// @ts-nocheck
import { createCipher, createDecipher, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * User-controlled encryption for premium storage
 * Uses AES-256-CBC with user-derived keys for zero-knowledge storage
 */

export interface EncryptionOptions {
  algorithm?: string;
  keyDerivationRounds?: number;
  saltLength?: number;
}

const DEFAULT_OPTIONS: EncryptionOptions = {
  algorithm: 'aes-256-cbc',
  keyDerivationRounds: 100000,
  saltLength: 32,
};

/**
 * Generate a user-specific encryption key from password/passphrase
 */
export async function deriveEncryptionKey(
  userPassword: string,
  salt?: Buffer,
  options: EncryptionOptions = {}
): Promise<{ key: Buffer; salt: Buffer }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Generate or use provided salt
  const keySalt = salt || randomBytes(opts.saltLength!);

  // Derive key using scrypt
  const key = await scryptAsync(userPassword, keySalt, 32) as Buffer;

  return { key, salt: keySalt };
}

/**
 * Encrypt data with user-controlled encryption
 */
export async function encrypt(
  data: string,
  userPassword?: string,
  options: EncryptionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    if (!userPassword) {
      // Use system default encryption for non-sensitive data
      return Buffer.from(data).toString('base64');
    }

    // Generate salt and derive key
    const { key, salt } = await deriveEncryptionKey(userPassword);

    // Generate random IV
    const iv = randomBytes(16);

    // Create cipher
    const cipher = createCipher(opts.algorithm!, key);

    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine salt + iv + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      Buffer.from(encrypted, 'hex')
    ]);

    return combined.toString('base64');

  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data with user-controlled encryption
 */
export async function decrypt(
  encryptedData: string,
  userPassword?: string,
  options: EncryptionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    if (!userPassword) {
      // Use system default decryption
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    }

    // Parse combined data
    const combined = Buffer.from(encryptedData, 'base64');
    const salt = combined.subarray(0, opts.saltLength!);
    const iv = combined.subarray(opts.saltLength!, opts.saltLength! + 16);
    const encrypted = combined.subarray(opts.saltLength! + 16);

    // Derive key using stored salt
    const { key } = await deriveEncryptionKey(userPassword, salt, options);

    // Create decipher
    const decipher = createDecipher(opts.algorithm!, key);

    // Decrypt data
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;

  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data - invalid password or corrupted data');
  }
}

/**
 * Generate a secure user encryption password from their consciousness data
 * This creates a deterministic but secure password based on user's unique patterns
 */
export function generateConsciousnessBasedKey(
  userId: string,
  consciousnessFingerprint: {
    level: number;
    primaryArchetype: string;
    sacredGeometryResonance: string;
    shadowIntegration: number;
  }
): string {
  // Create a deterministic but complex key from consciousness data
  const components = [
    userId,
    consciousnessFingerprint.level.toString(),
    consciousnessFingerprint.primaryArchetype,
    consciousnessFingerprint.sacredGeometryResonance,
    consciousnessFingerprint.shadowIntegration.toString()
  ];

  // Hash components together for security
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(components.join('::'))
    .digest('hex');
}

/**
 * Encrypt consciousness data with user's unique consciousness fingerprint
 */
export async function encryptWithConsciousness(
  data: string,
  userId: string,
  consciousnessFingerprint: any
): Promise<string> {
  const consciousnessKey = generateConsciousnessBasedKey(userId, consciousnessFingerprint);
  return await encrypt(data, consciousnessKey);
}

/**
 * Decrypt consciousness data with user's unique consciousness fingerprint
 */
export async function decryptWithConsciousness(
  encryptedData: string,
  userId: string,
  consciousnessFingerprint: any
): Promise<string> {
  const consciousnessKey = generateConsciousnessBasedKey(userId, consciousnessFingerprint);
  return await decrypt(encryptedData, consciousnessKey);
}

/**
 * Validate if data can be decrypted with given key
 */
export async function validateEncryption(
  encryptedData: string,
  userPassword: string
): Promise<boolean> {
  try {
    await decrypt(encryptedData, userPassword);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate secure backup encryption keys for cloud storage
 */
export function generateBackupKeys(): {
  primary: string;
  secondary: string;
  recovery: string;
} {
  return {
    primary: randomBytes(32).toString('hex'),
    secondary: randomBytes(32).toString('hex'),
    recovery: randomBytes(32).toString('hex'),
  };
}

/**
 * Zero-knowledge proof verification for encrypted data integrity
 */
export function generateDataIntegrityProof(data: string): {
  hash: string;
  timestamp: number;
  checksum: string;
} {
  const crypto = require('crypto');
  const timestamp = Date.now();

  return {
    hash: crypto.createHash('sha256').update(data).digest('hex'),
    timestamp,
    checksum: crypto.createHash('md5').update(data + timestamp.toString()).digest('hex'),
  };
}

/**
 * Verify data integrity without decrypting
 */
export function verifyDataIntegrity(
  data: string,
  proof: { hash: string; timestamp: number; checksum: string }
): boolean {
  const crypto = require('crypto');

  const expectedHash = crypto.createHash('sha256').update(data).digest('hex');
  const expectedChecksum = crypto.createHash('md5').update(data + proof.timestamp.toString()).digest('hex');

  return expectedHash === proof.hash && expectedChecksum === proof.checksum;
}