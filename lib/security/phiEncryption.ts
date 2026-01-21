/**
 * PHI ENCRYPTION SERVICE
 * ======================
 * SINGLE SOURCE OF TRUTH FOR ALL PHI ENCRYPTION
 *
 * Uses AES-256-GCM with:
 * - Random IV per encryption
 * - Authenticated Additional Data (AAD) for context binding
 * - Key versioning for rotation support
 * - Search hash for exact-match queries (non-reversible)
 *
 * HIPAA Sprint 7 Phase 2A
 */

import crypto from 'crypto';

// ============================================================================
// CONSTANTS
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

// ============================================================================
// TYPES
// ============================================================================

/**
 * Associated Authenticated Data - binds ciphertext to context
 * Prevents ciphertext from being moved between rows/columns
 */
export interface PHIContext {
  table: string;
  column: string;
  rowId: string;
  ownerId?: string; // practitioner_id or member_id
}

/**
 * Encrypted blob with all metadata needed for decryption
 */
export interface EncryptedPHI {
  /** Base64-encoded ciphertext */
  c: string;
  /** Base64-encoded IV/nonce */
  iv: string;
  /** Base64-encoded auth tag */
  tag: string;
  /** Key ID for rotation support */
  kid: string;
  /** Schema version */
  v: number;
}

/**
 * Metadata stored alongside encrypted column
 */
export interface PHIEncryptionMeta {
  iv: string;
  tag: string;
  kid: string;
  v: number;
  encrypted_at: string;
}

// ============================================================================
// KEY MANAGEMENT
// ============================================================================

interface KeyEntry {
  key: Buffer;
  id: string;
}

// Cache for parsed keys
let keyCache: Map<string, Buffer> | null = null;
let currentKeyId: string | null = null;

/**
 * Get the current encryption key from environment
 */
function getCurrentKey(): KeyEntry {
  if (!currentKeyId) {
    currentKeyId = process.env.PHI_ENCRYPTION_KEY_ID || 'k1';
  }

  const key = getKeyById(currentKeyId);
  return { key, id: currentKeyId };
}

/**
 * Get a specific key by ID (for decryption with old keys)
 */
function getKeyById(keyId: string): Buffer {
  if (!keyCache) {
    keyCache = new Map();
    loadKeys();
  }

  const key = keyCache.get(keyId);
  if (!key) {
    throw new Error(`PHI encryption key not found: ${keyId}`);
  }

  return key;
}

/**
 * Load all keys from environment
 * Supports multiple keys for rotation: PHI_ENCRYPTION_KEY, PHI_ENCRYPTION_KEY_k2, etc.
 */
function loadKeys(): void {
  // Primary key
  const primaryKey = process.env.PHI_ENCRYPTION_KEY;
  if (!primaryKey) {
    throw new Error('PHI_ENCRYPTION_KEY environment variable not set');
  }

  const primaryKeyId = process.env.PHI_ENCRYPTION_KEY_ID || 'k1';
  keyCache!.set(primaryKeyId, parseKey(primaryKey, 'PHI_ENCRYPTION_KEY'));

  // Additional rotated keys (PHI_ENCRYPTION_KEY_k2, PHI_ENCRYPTION_KEY_test1, etc.)
  // Excludes PHI_ENCRYPTION_KEY_ID which is the key ID selector, not a key
  for (const [envKey, envValue] of Object.entries(process.env)) {
    if (envKey === 'PHI_ENCRYPTION_KEY_ID') continue; // Skip the key ID selector
    const match = envKey.match(/^PHI_ENCRYPTION_KEY_([a-z0-9]+)$/i);
    if (match && envValue) {
      const keyId = match[1];
      keyCache!.set(keyId, parseKey(envValue, envKey));
    }
  }
}

/**
 * Parse a key from base64 or hex format
 */
function parseKey(keyStr: string, envName: string): Buffer {
  let keyBuffer: Buffer;

  // Try base64 first (recommended format)
  if (keyStr.length === 44 && keyStr.endsWith('=')) {
    keyBuffer = Buffer.from(keyStr, 'base64');
  } else if (keyStr.length === 64) {
    // Hex format (legacy compatibility)
    keyBuffer = Buffer.from(keyStr, 'hex');
  } else {
    throw new Error(`${envName} must be 32 bytes (44 chars base64 or 64 chars hex)`);
  }

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`${envName} must be exactly 32 bytes (256 bits)`);
  }

  return keyBuffer;
}

// ============================================================================
// ENCRYPTION / DECRYPTION
// ============================================================================

/**
 * Encrypt PHI with context binding
 *
 * @param plaintext - The PHI to encrypt
 * @param context - Context for AAD (table, column, rowId, ownerId)
 * @returns Encrypted blob with metadata
 */
export function encryptPHI(plaintext: string, context: PHIContext): EncryptedPHI {
  const { key, id: keyId } = getCurrentKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  // Build AAD from context (prevents ciphertext swapping)
  const aad = buildAAD(context);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  cipher.setAAD(aad);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    c: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: authTag.toString('base64'),
    kid: keyId,
    v: 1,
  };
}

/**
 * Decrypt PHI with context verification
 *
 * @param blob - Encrypted blob from encryptPHI
 * @param context - Same context used for encryption
 * @returns Decrypted plaintext
 * @throws Error if decryption fails or context doesn't match
 */
export function decryptPHI(blob: EncryptedPHI, context: PHIContext): string {
  const key = getKeyById(blob.kid);
  const iv = Buffer.from(blob.iv, 'base64');
  const authTag = Buffer.from(blob.tag, 'base64');
  const ciphertext = Buffer.from(blob.c, 'base64');

  // Rebuild AAD from context
  const aad = buildAAD(context);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAAD(aad);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (error) {
    // Don't expose crypto details in error
    throw new Error('PHI decryption failed: invalid ciphertext or context mismatch');
  }
}

/**
 * Build Associated Authenticated Data from context
 * This binds the ciphertext to its intended location
 */
function buildAAD(context: PHIContext): Buffer {
  const parts = [
    context.table,
    context.column,
    context.rowId,
    context.ownerId || '',
  ];
  return Buffer.from(parts.join(':'), 'utf8');
}

// ============================================================================
// DATABASE HELPERS
// ============================================================================

/**
 * Encrypt for database storage (returns ciphertext + meta separately)
 *
 * Use this pattern for shadow columns:
 * - Store ciphertext in `column_enc` (TEXT/BYTEA)
 * - Store meta in `column_enc_meta` (JSONB)
 */
export function encryptForDB(
  plaintext: string,
  context: PHIContext
): { ciphertext: string; meta: PHIEncryptionMeta } {
  const blob = encryptPHI(plaintext, context);

  return {
    ciphertext: blob.c,
    meta: {
      iv: blob.iv,
      tag: blob.tag,
      kid: blob.kid,
      v: blob.v,
      encrypted_at: new Date().toISOString(),
    },
  };
}

/**
 * Decrypt from database storage
 */
export function decryptFromDB(
  ciphertext: string,
  meta: PHIEncryptionMeta,
  context: PHIContext
): string {
  const blob: EncryptedPHI = {
    c: ciphertext,
    iv: meta.iv,
    tag: meta.tag,
    kid: meta.kid,
    v: meta.v,
  };

  return decryptPHI(blob, context);
}

/**
 * Serialize encrypted blob to single JSON string
 * Use when you want to store everything in one column
 */
export function serialize(blob: EncryptedPHI): string {
  return JSON.stringify(blob);
}

/**
 * Deserialize encrypted blob from JSON string
 */
export function deserialize(stored: string): EncryptedPHI | null {
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (parsed.c && parsed.iv && parsed.tag && parsed.kid && parsed.v) {
      return parsed as EncryptedPHI;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a stored value is encrypted
 */
export function isEncrypted(stored: string): boolean {
  return deserialize(stored) !== null;
}

// ============================================================================
// SEARCH HASH (Non-Reversible)
// ============================================================================

/**
 * Generate a non-reversible hash for exact-match search
 *
 * Use case: Find if a specific value exists without exposing the value
 * NOT for partial/fuzzy search (that requires encrypted search schemes)
 *
 * @param value - The PHI value to hash
 * @param context - Context to prevent rainbow table attacks across tables
 * @returns Hex string hash (first 32 chars of SHA-256)
 */
export function hashForSearch(value: string, context: PHIContext): string {
  const salt = `${context.table}:${context.column}:${process.env.PHI_SEARCH_SALT || 'phi-search'}`;
  const normalized = value.toLowerCase().trim();

  return crypto
    .createHmac('sha256', salt)
    .update(normalized)
    .digest('hex')
    .substring(0, 32);
}

// ============================================================================
// DATA LAYER SANITIZATION
// ============================================================================

/**
 * SECURITY: Strip all encrypted columns before data leaves the data layer
 *
 * Call this on every row/object before returning from data access functions.
 * Removes *_enc and *_enc_meta columns to prevent encrypted blobs from
 * leaking to UI/API/logs/exports.
 *
 * Works recursively on nested objects and arrays.
 *
 * @param data - Row object, array of rows, or nested structure
 * @returns Sanitized copy with encrypted columns removed
 */
export function stripEncryptedColumns<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => stripEncryptedColumns(item)) as T;
  }

  if (typeof data !== 'object') {
    return data;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    // Skip encrypted columns
    if (key.endsWith('_enc') || key.endsWith('_enc_meta')) {
      continue;
    }

    // Recursively process nested objects/arrays
    if (value !== null && typeof value === 'object') {
      result[key] = stripEncryptedColumns(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

// ============================================================================
// KEY ROTATION HELPERS
// ============================================================================

/**
 * Check if a blob needs re-encryption (old key version)
 */
export function needsReencryption(blob: EncryptedPHI): boolean {
  const currentKeyId = process.env.PHI_ENCRYPTION_KEY_ID || 'k1';
  return blob.kid !== currentKeyId;
}

/**
 * Re-encrypt with current key (for key rotation)
 */
export function reencrypt(blob: EncryptedPHI, context: PHIContext): EncryptedPHI {
  const plaintext = decryptPHI(blob, context);
  return encryptPHI(plaintext, context);
}

// ============================================================================
// TESTING / DEVELOPMENT
// ============================================================================

/**
 * Clear key cache (for testing)
 */
export function clearKeyCache(): void {
  keyCache = null;
  currentKeyId = null;
}

/**
 * Generate a new random encryption key (for setup)
 * Returns base64-encoded 32-byte key
 */
export function generateKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const PHIEncryption = {
  encryptPHI,
  decryptPHI,
  encryptForDB,
  decryptFromDB,
  serialize,
  deserialize,
  isEncrypted,
  hashForSearch,
  stripEncryptedColumns,
  needsReencryption,
  reencrypt,
  clearKeyCache,
  generateKey,
};

export default PHIEncryption;
