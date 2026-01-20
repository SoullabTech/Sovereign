/**
 * Password utilities with bcrypt
 *
 * Handles:
 * - bcrypt hashing for new passwords (cost 12)
 * - SHA256 verification for legacy passwords
 * - Transparent upgrade from SHA256 → bcrypt on signin
 */

import bcrypt from 'bcrypt';
import { createHash } from 'crypto';

const BCRYPT_COST = 12;

/**
 * Hash a new password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Verify a password against a hash
 * Handles both bcrypt and legacy SHA256 hashes
 */
export async function verifyPassword(
  password: string,
  hash: string,
  algo: 'bcrypt' | 'sha256' = 'sha256'
): Promise<boolean> {
  if (algo === 'bcrypt') {
    return bcrypt.compare(password, hash);
  }

  // Legacy SHA256 verification
  const legacyHash = hashPasswordLegacy(password);
  return legacyHash === hash;
}

/**
 * Legacy SHA256 hashing (for verifying old passwords)
 * DO NOT use for new passwords
 */
export function hashPasswordLegacy(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'maia-sovereign-salt';
  return createHash('sha256').update(password + salt).digest('hex');
}

/**
 * Check if a password needs to be upgraded from SHA256 to bcrypt
 */
export function needsUpgrade(algo: string | null | undefined): boolean {
  return !algo || algo === 'sha256';
}

/**
 * Upgrade a password hash from SHA256 to bcrypt
 * Call this after successful signin with a SHA256 password
 *
 * @returns New bcrypt hash and 'bcrypt' algo
 */
export async function upgradePasswordHash(password: string): Promise<{
  hash: string;
  algo: 'bcrypt';
}> {
  const hash = await hashPassword(password);
  return { hash, algo: 'bcrypt' };
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
