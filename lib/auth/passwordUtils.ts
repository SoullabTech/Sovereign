/**
 * Password utilities with bcrypt
 * ================================
 * ONLY APPROVED PASSWORD HASHING ENTRYPOINT
 *
 * Handles:
 * - bcrypt hashing for new passwords (cost 12)
 * - SHA256 verification for legacy passwords
 * - Auto-detection of hash algorithm from prefix
 * - Transparent upgrade from SHA256 → bcrypt on signin
 *
 * DO NOT use crypto.createHash('sha256') for passwords elsewhere.
 * All password operations MUST go through this module.
 */

import bcrypt from 'bcrypt';
import { createHash } from 'crypto';

const BCRYPT_COST = 12;

export interface VerifyResult {
  ok: boolean;
  needsUpgrade: boolean;
}

/**
 * Hash a new password with bcrypt
 * This is the ONLY way to create new password hashes
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Detect if a hash is bcrypt based on prefix
 * bcrypt hashes start with $2a$, $2b$, or $2y$
 */
function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$/.test(hash);
}

/**
 * Verify a password against a hash
 * Auto-detects bcrypt vs legacy SHA256 based on hash format
 *
 * @returns { ok: true if password matches, needsUpgrade: true if SHA256 }
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<VerifyResult> {
  if (isBcryptHash(storedHash)) {
    const ok = await bcrypt.compare(password, storedHash);
    return { ok, needsUpgrade: false };
  }

  // Legacy SHA256 verification
  const legacyHash = hashPasswordLegacy(password);
  const ok = legacyHash === storedHash;
  return { ok, needsUpgrade: ok }; // Only flag upgrade if password was correct
}

/**
 * Legacy SHA256 hashing (for verifying old passwords ONLY)
 * DO NOT use for new passwords - use hashPassword() instead
 * @internal
 */
function hashPasswordLegacy(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}

/**
 * Generate a secure random token (for sessions, magic links, etc.)
 */
export function generateSecureToken(length: number = 32): string {
  const { randomBytes } = require('crypto');
  return randomBytes(length).toString('hex');
}

/**
 * Hash an identifier for rate limiting (IP, email)
 * We don't want to store raw IPs/emails in the rate limit table
 */
export function hashIdentifier(identifier: string): string {
  return createHash('sha256').update(identifier).digest('hex').substring(0, 16);
}
