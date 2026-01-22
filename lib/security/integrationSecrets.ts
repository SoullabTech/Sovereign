/**
 * INTEGRATION SECRETS ENCRYPTION
 * ==============================
 * Simple AES-256-GCM encryption for practitioner integration configs
 * (API keys, credentials, etc.)
 *
 * Simpler than PHI encryption - no AAD context binding needed since
 * integration configs are per-practitioner and not cross-referenced.
 *
 * Key: INTEGRATIONS_ENCRYPTION_KEY (32 bytes, base64)
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Get the integration encryption key from environment
 * Must be 32 bytes (256 bits) encoded as base64
 */
function requireKey(): Buffer {
  const key = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Missing INTEGRATIONS_ENCRYPTION_KEY environment variable');
  }

  const buf = Buffer.from(key, 'base64');
  if (buf.length !== 32) {
    throw new Error('INTEGRATIONS_ENCRYPTION_KEY must be 32 bytes base64-encoded');
  }

  return buf;
}

/**
 * Encrypt an integration config object
 * Returns base64 string: iv (12 bytes) + authTag (16 bytes) + ciphertext
 */
export function encryptIntegrationConfig(obj: unknown): string {
  const key = requireKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: iv (12) + authTag (16) + ciphertext
  const payload = Buffer.concat([iv, authTag, ciphertext]);
  return payload.toString('base64');
}

/**
 * Decrypt an integration config
 * Input is base64 string from encryptIntegrationConfig
 */
export function decryptIntegrationConfig<T = unknown>(payload: string): T {
  const key = requireKey();
  const buf = Buffer.from(payload, 'base64');

  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted payload: too short');
  }

  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8')) as T;
}

/**
 * Check if the encryption key is configured
 */
export function isIntegrationEncryptionConfigured(): boolean {
  try {
    requireKey();
    return true;
  } catch {
    return false;
  }
}
