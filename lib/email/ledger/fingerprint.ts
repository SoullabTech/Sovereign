/**
 * RECIPIENT FINGERPRINT — keyed, versioned, one-way.
 * =================================================
 *
 * WHY NOT `memberRef()`.
 *   `lib/privacy/memberRef.ts` is unsalted truncated SHA-256, and it is correct for
 *   what it does: a member id is a UUID carrying ~122 bits of entropy, so an
 *   unsalted digest of one is not reversible.
 *
 *   An email address is not a UUID. The practical space of real addresses is small
 *   and enumerable — an unsalted SHA-256 of `someone@gmail.com` falls to a
 *   dictionary attack in seconds. The helper is safe for its intended input and
 *   unsafe for this one, and this is a DURABLE table rather than an ephemeral log
 *   window, so the exposure differs too.
 *
 *   Hence: keyed HMAC, with a key held only by the server and rotatable by version.
 *
 * WHAT THIS IS NOT.
 *   Pseudonymous, not anonymous. The same address yields the same fingerprint under
 *   one key version — that is the point, and it means a fingerprint is still
 *   member-linked data governed by the ledger's 90-day retention. Do not describe
 *   ledger rows as "anonymised". The 13-month aggregates carry no fingerprint at
 *   all; that is what makes them safe to keep.
 */

import { createHmac } from 'crypto';

/** Present only so a rotation is legible rather than silent. */
export interface RecipientFingerprint {
  fingerprint: string;
  keyVersion: number;
}

/**
 * Normalise before hashing so trivial variants of one address agree.
 *
 * Case-folded and trimmed only. Deliberately NOT gmail-style dot-stripping or
 * plus-tag removal: those are provider-specific policies, and applying them would
 * merge addresses the member may consider distinct — an over-reach for a table
 * whose job is to observe, not to decide who is who.
 */
export function normalizeRecipient(email: string): string {
  return email.trim().toLowerCase();
}

function keyMaterial(): string | null {
  const key = process.env.EMAIL_LEDGER_FINGERPRINT_KEY;
  if (!key || key.length < 32) return null;
  return key;
}

function keyVersion(): number {
  const raw = process.env.EMAIL_LEDGER_FINGERPRINT_KEY_VERSION;
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function isFingerprintConfigured(): boolean {
  return keyMaterial() !== null;
}

/**
 * Fingerprint one recipient address.
 *
 * Returns `null` when no key is configured — and that is the correct behaviour:
 * an unkeyed fallback would silently write the exact unsalted digest this module
 * exists to avoid. A ledger row with no fingerprint is a small loss of
 * attribution; a reversible one is a privacy failure that outlives the row.
 */
export function fingerprintRecipient(email: string): RecipientFingerprint | null {
  const key = keyMaterial();
  if (!key) return null;

  const fingerprint = createHmac('sha256', key)
    .update(normalizeRecipient(email))
    .digest('hex');

  return { fingerprint, keyVersion: keyVersion() };
}
