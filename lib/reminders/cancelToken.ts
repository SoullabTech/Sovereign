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
 * ROTATION (founder review, 2026-09-04). A rotation must never orphan links
 * already sitting in members' inboxes: cancellation is part of the member's
 * continuing authority over the act, so it outlives our key hygiene. Two
 * decisions make that safe:
 *
 *   1. A DEDICATED secret, SELF_ADDRESSED_RETURN_CANCEL_SECRET — never the
 *      general app secret, whose rotation cadence is driven by unrelated
 *      concerns and would silently revoke members' cancellation authority.
 *
 *   2. A VERSIONED keyring. Each row records cancel_token_version. The current
 *      secret signs new reminders; the previous secret stays readable for
 *      already-issued links until its reminders have all fired. Verification
 *      itself needs no secret at all — lookup is by stored hash — so rotation
 *      only ever affects DERIVING a token for an outbound email.
 *
 * Rotation procedure:
 *   - move the live value to SELF_ADDRESSED_RETURN_CANCEL_SECRET_PREVIOUS
 *     (with ..._PREVIOUS_VERSION = its old version number)
 *   - set the new value and bump SELF_ADDRESSED_RETURN_CANCEL_SECRET_VERSION
 *   - retire the previous key only once no undelivered reminder still carries
 *     its version (see scripts/ check in the witness record)
 *
 * A reminder whose version matches neither key fails CLOSED with the typed code
 * `cancel_secret_unavailable`. It is never sent: a message the member cannot
 * cancel is not one we may deliver.
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
  current: { version: number; secret: string };
  previous?: { version: number; secret: string };
}

function readKeyring(): Keyring | null {
  const secret = process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;

  const version = Number.parseInt(
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_VERSION ?? '1',
    10,
  );
  if (!Number.isInteger(version) || version < 1) return null;

  const prevSecret = process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_PREVIOUS;
  const prevVersion = Number.parseInt(
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_PREVIOUS_VERSION ?? '',
    10,
  );

  return {
    current: { version, secret },
    previous:
      prevSecret && prevSecret.length >= MIN_SECRET_LENGTH && Number.isInteger(prevVersion)
        ? { version: prevVersion, secret: prevSecret }
        : undefined,
  };
}

export function isCancelSecretConfigured(): boolean {
  return readKeyring() !== null;
}

/** The version new reminders are signed with. */
export function currentCancelTokenVersion(): number {
  const keyring = readKeyring();
  if (!keyring) throw new CancelSecretUnavailableError('cancel secret is not configured');
  return keyring.current.version;
}

/**
 * Derive the token for a reminder signed under `version`.
 *
 * Throws rather than falling back to the current key: silently re-signing with
 * a new secret would mint a token that does not match the stored hash, and the
 * member's link would fail at the moment they tried to use it.
 */
export function deriveCancelToken(reminderId: string, version: number): string {
  const keyring = readKeyring();
  if (!keyring) throw new CancelSecretUnavailableError('cancel secret is not configured');

  const key =
    keyring.current.version === version
      ? keyring.current.secret
      : keyring.previous?.version === version
        ? keyring.previous.secret
        : null;

  if (!key) {
    throw new CancelSecretUnavailableError(
      `no cancel secret for token version ${version} — rotate forward or restore the previous key`,
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
