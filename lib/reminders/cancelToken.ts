/**
 * Cancel-token handling for SELF-ADDRESSED-RETURN-01 Tier 1.
 *
 * Ruling §8.8: stop must be reachable from INSIDE the delivered message. Email
 * cannot authenticate inline, so a capability token is the minimum mechanism.
 *
 * DERIVED, NOT STORED. The database stores only a hash (spec §6.1), but the
 * worker must put a WORKING token in the email at send time, long after
 * creation. A random token cannot satisfy both — it would have to be stored to
 * be recoverable. So:
 *
 *     token  = base64url(HMAC-SHA256(cancel_secret, reminder_id))
 *     column = sha256(token)
 *
 * A database dump — a backup, a leaked replica, an operator with read access —
 * cannot produce a working cancellation link without the application secret.
 *
 * ROTATION AND RETENTION (founder review, 2026-09-04). A rotation must never
 * orphan links already sitting in members' inboxes: cancellation is part of the
 * member's continuing authority over the act, so it outlives our key hygiene.
 *
 * `current + previous` is NOT sufficient — it holds across exactly one
 * rotation, and a reminder scheduled far enough ahead can outlive two. So the
 * keyring retains MANY versions, and the retention rule is:
 *
 *     A cancel key may be retired only when no live reminder depends on
 *     that version.
 *
 * Member cancellation authority decides when a key may disappear, not
 * infrastructure hygiene. `scripts/check-cancel-key-retention.ts` answers which
 * versions are still depended upon; retiring a key it still names is the one
 * way to strand a member's link.
 *
 * Verification itself needs no secret at all — lookup is by stored hash — so
 * rotation only ever affects DERIVING a token for an outbound email. A reminder
 * whose version is no longer in the keyring fails CLOSED with the typed code
 * `cancel_secret_unavailable`: a message the member cannot cancel is not one we
 * may deliver.
 *
 * Configuration, in precedence order:
 *   SELF_ADDRESSED_RETURN_CANCEL_KEYS            JSON {"1":"…","2":"…"} — all retained versions
 *   SELF_ADDRESSED_RETURN_CANCEL_CURRENT_VERSION which version signs new reminders
 * or, for a single-key deployment:
 *   SELF_ADDRESSED_RETURN_CANCEL_SECRET          the one key
 *   SELF_ADDRESSED_RETURN_CANCEL_SECRET_VERSION  its version (default 1)
 *
  * The capability is CANCEL-ONLY. Presenting a token removes a scheduled
 * delivery; it can never read delivery_text, the schedule, or anything else.
 */

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const MIN_SECRET_LENGTH = 32;

export class CancelSecretUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CancelSecretUnavailableError';
  }
}

interface Keyring {
  currentVersion: number;
  keys: Map<number, string>;
}

function parseKeyMap(raw: string): Map<number, string> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  const keys = new Map<number, string>();
  for (const [version, secret] of Object.entries(parsed as Record<string, unknown>)) {
    const v = Number.parseInt(version, 10);
    if (!Number.isInteger(v) || v < 1) return null;
    if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH) return null;
    keys.set(v, secret);
  }
  return keys.size > 0 ? keys : null;
}

function readKeyring(): Keyring | null {
  const raw = process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS;
  if (raw) {
    const keys = parseKeyMap(raw);
    if (!keys) return null;
    const declared = Number.parseInt(
      process.env.SELF_ADDRESSED_RETURN_CANCEL_CURRENT_VERSION ?? '',
      10,
    );
    // Default to the highest retained version rather than guessing 1, so a
    // keyring without an explicit current version still signs with the newest.
    const currentVersion = Number.isInteger(declared)
      ? declared
      : Math.max(...Array.from(keys.keys()));
    // Fail closed: signing with a version we hold no key for would mint tokens
    // that never match their stored hash.
    if (!keys.has(currentVersion)) return null;
    return { currentVersion, keys };
  }

  // Single-key deployment.
  const secret = process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  const version = Number.parseInt(
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_VERSION ?? '1',
    10,
  );
  if (!Number.isInteger(version) || version < 1) return null;
  return { currentVersion: version, keys: new Map([[version, secret]]) };
}

export function isCancelSecretConfigured(): boolean {
  return readKeyring() !== null;
}

/** The version new reminders are signed with. */
export function currentCancelTokenVersion(): number {
  const keyring = readKeyring();
  if (!keyring) throw new CancelSecretUnavailableError('cancel secret is not configured');
  return keyring.currentVersion;
}

/** Every version the keyring can still derive — what retention is checked against. */
export function retainedCancelTokenVersions(): number[] {
  const keyring = readKeyring();
  if (!keyring) return [];
  return Array.from(keyring.keys.keys()).sort((a, b) => a - b);
}

/**
 * Derive the token for a reminder signed under `version`.
 *
 * Throws rather than falling back to the current key: silently re-signing with
 * a newer secret would mint a token that does not match the stored hash, and
 * the member's link would fail at the moment they tried to use it.
 */
export function deriveCancelToken(reminderId: string, version: number): string {
  const keyring = readKeyring();
  if (!keyring) throw new CancelSecretUnavailableError('cancel secret is not configured');

  const key = keyring.keys.get(version);
  if (!key) {
    throw new CancelSecretUnavailableError(
      `no cancel key retained for token version ${version} — it was retired while a live ` +
        'reminder still depended on it (see scripts/check-cancel-key-retention.ts)',
    );
  }

  return createHmac('sha256', key).update(reminderId, 'utf8').digest('base64url');
}

export function hashCancelToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/**
 * Constant-time comparison of two hex digests. Lookup is by hash, so the
 * database does the matching; this exists for paths comparing a presented token
 * against an already-fetched hash, where `===` would leak timing information
 * about how much of the digest matched.
 */
export function cancelTokenHashEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
