/**
 * PORTAL INVITE UTILITIES
 *
 * Code generation, hashing, and password utilities for client portal access.
 * Invite codes are shown once to the practitioner, then only stored as hashes.
 */

import crypto from 'crypto';

/**
 * Generate a human-friendly invite code
 * Format: STAR-XXXX-XXXX-XXXX (easy to read over phone/email)
 */
export function generateInviteCode(): string {
  const a = crypto.randomBytes(2).toString('hex').toUpperCase();
  const b = crypto.randomBytes(2).toString('hex').toUpperCase();
  const c = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `STAR-${a}-${b}-${c}`;
}

/**
 * Hash an invite code for secure storage
 * Uses SHA256 with an optional pepper from environment
 */
export function hashInviteCode(code: string): string {
  const pepper = process.env.PORTAL_INVITE_PEPPER || 'maia-sovereign-portal';
  const normalized = code.trim().toUpperCase();
  return crypto.createHash('sha256').update(`${pepper}:${normalized}`).digest('hex');
}

/**
 * Hash a password for storage using scrypt
 * Returns format: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  try {
    const check = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(check, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Validate invite code format
 * Expected: STAR-XXXX-XXXX-XXXX (letters and numbers)
 */
export function isValidInviteCodeFormat(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return /^STAR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized);
}
