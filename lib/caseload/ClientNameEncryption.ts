/**
 * CLIENT NAME ENCRYPTION SERVICE
 *
 * Handles encryption/decryption of client names in the caseload system.
 * Uses AES-256-GCM encryption (matching SecurityLayer.ts pattern).
 *
 * Per-practitioner key derivation from master key ensures:
 * - Client names are encrypted at rest
 * - Each practitioner has unique encryption keys
 * - Migration path from plain text to encrypted
 */

import crypto from 'crypto';

// Constants matching SecurityLayer.ts
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const ITERATIONS = 100000;

export interface EncryptedClientName {
  encrypted: string;
  iv: string;
  authTag: string;
  version: number;
  practitionerSalt: string;
}

// Key cache to avoid repeated derivation
const keyCache = new Map<string, Buffer>();

/**
 * Get the master encryption key from environment
 */
function getMasterKey(): Buffer {
  const masterKeyHex = process.env.CASELOAD_MASTER_KEY;
  if (!masterKeyHex) {
    throw new Error('CASELOAD_MASTER_KEY environment variable not set');
  }

  // Validate it's a 256-bit (32-byte) hex string
  if (masterKeyHex.length !== 64) {
    throw new Error('CASELOAD_MASTER_KEY must be a 64-character hex string (256 bits)');
  }

  return Buffer.from(masterKeyHex, 'hex');
}

/**
 * Derive a practitioner-specific encryption key
 * Uses PBKDF2 with practitioner's salt for key derivation
 */
export function derivePractitionerKey(
  practitionerId: string,
  practitionerSalt: string
): Buffer {
  const cacheKey = `${practitionerId}:${practitionerSalt}`;

  // Check cache first
  if (keyCache.has(cacheKey)) {
    return keyCache.get(cacheKey)!;
  }

  const masterKey = getMasterKey();
  const saltBuffer = Buffer.from(practitionerSalt, 'hex');

  // Combine practitioner ID with master key for PBKDF2
  const keyMaterial = Buffer.concat([
    masterKey,
    Buffer.from(practitionerId, 'utf8'),
  ]);

  const derivedKey = crypto.pbkdf2Sync(
    keyMaterial,
    saltBuffer,
    ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );

  // Cache the derived key
  keyCache.set(cacheKey, derivedKey);

  return derivedKey;
}

/**
 * Generate a new salt for a practitioner
 */
export function generatePractitionerSalt(): string {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

/**
 * Encrypt a client name
 */
export function encryptClientName(
  clientName: string,
  practitionerId: string,
  practitionerSalt: string
): EncryptedClientName {
  const key = derivePractitionerKey(practitionerId, practitionerSalt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(clientName, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    version: 1,
    practitionerSalt,
  };
}

/**
 * Decrypt a client name
 */
export function decryptClientName(
  encryptedData: EncryptedClientName,
  practitionerId: string
): string {
  const key = derivePractitionerKey(practitionerId, encryptedData.practitionerSalt);
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Serialize encrypted client name for database storage
 */
export function serializeEncryptedName(data: EncryptedClientName): string {
  return JSON.stringify(data);
}

/**
 * Deserialize encrypted client name from database
 * Returns null if the data is plain text (migration case)
 */
export function deserializeEncryptedName(stored: string): EncryptedClientName | null {
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    // Check if it has the required encryption fields
    if (parsed.encrypted && parsed.iv && parsed.authTag && parsed.version) {
      return parsed as EncryptedClientName;
    }
    return null;
  } catch {
    // Not JSON, must be plain text (migration case)
    return null;
  }
}

/**
 * Check if stored data is encrypted or plain text
 */
export function isEncrypted(stored: string): boolean {
  return deserializeEncryptedName(stored) !== null;
}

/**
 * Decrypt client name from stored format
 * Handles both encrypted and plain text (migration) cases
 */
export function decryptStoredClientName(
  stored: string,
  practitionerId: string
): string {
  const encryptedData = deserializeEncryptedName(stored);

  if (encryptedData) {
    return decryptClientName(encryptedData, practitionerId);
  }

  // Plain text - return as is (migration case)
  return stored;
}

/**
 * Encrypt and serialize a client name for storage
 */
export function encryptForStorage(
  clientName: string,
  practitionerId: string,
  practitionerSalt: string
): string {
  const encrypted = encryptClientName(clientName, practitionerId, practitionerSalt);
  return serializeEncryptedName(encrypted);
}

/**
 * Re-encrypt a client name with a new IV (for updates)
 * Always generates a new IV for security
 */
export function reencryptClientName(
  clientName: string,
  practitionerId: string,
  practitionerSalt: string
): string {
  return encryptForStorage(clientName, practitionerId, practitionerSalt);
}

/**
 * Clear the key cache (useful for testing or key rotation)
 */
export function clearKeyCache(): void {
  keyCache.clear();
}

/**
 * Export for use in CaseStore and other modules
 */
export const ClientNameEncryption = {
  generatePractitionerSalt,
  encryptClientName,
  decryptClientName,
  serializeEncryptedName,
  deserializeEncryptedName,
  isEncrypted,
  decryptStoredClientName,
  encryptForStorage,
  reencryptClientName,
  clearKeyCache,
};

export default ClientNameEncryption;
