/**
 * CANCEL TOKEN — derivation, hashing, and the rotation lifecycle.
 *
 * Cancellation is part of the member's continuing authority over the act, so it
 * has to survive our key hygiene. These tests pin the two properties that make
 * that true: a rotation does not orphan links already in members' inboxes, and
 * a key we can no longer derive fails CLOSED rather than sending a message the
 * member cannot stop.
 *
 * Spec: docs/specs/SELF-ADDRESSED-RETURN-01_TIER1_SPEC_2026-09-04.md §6.1
 */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  CancelSecretUnavailableError,
  cancelTokenHashEquals,
  currentCancelTokenVersion,
  deriveCancelToken,
  hashCancelToken,
  isCancelSecretConfigured,
} from '../cancelToken';

const KEY_A = 'a'.repeat(40);
const KEY_B = 'b'.repeat(40);
const ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ENV };
  delete process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET;
  delete process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_VERSION;
  delete process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_PREVIOUS;
  delete process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_PREVIOUS_VERSION;
});
afterEach(() => {
  process.env = ENV;
});

describe('configuration fails closed', () => {
  it('reports unconfigured when the secret is absent', () => {
    expect(isCancelSecretConfigured()).toBe(false);
  });

  it('refuses a short secret rather than accepting a weak one', () => {
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET = 'too-short';
    expect(isCancelSecretConfigured()).toBe(false);
  });

  it('throws rather than deriving a token with no key', () => {
    expect(() => deriveCancelToken('r1', 1)).toThrow(CancelSecretUnavailableError);
  });

  it('does not fall back to the general app secret', () => {
    process.env.APP_SECRET = KEY_A;
    process.env.NEXTAUTH_SECRET = KEY_A;
    expect(isCancelSecretConfigured()).toBe(false);
  });
});

describe('derivation', () => {
  beforeEach(() => {
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET = KEY_A;
  });

  it('is deterministic, so the worker can recompute it at send time', () => {
    expect(deriveCancelToken('r1', 1)).toBe(deriveCancelToken('r1', 1));
  });

  it('differs per reminder', () => {
    expect(deriveCancelToken('r1', 1)).not.toBe(deriveCancelToken('r2', 1));
  });

  it('is not recoverable from the stored hash', () => {
    const token = deriveCancelToken('r1', 1);
    const stored = hashCancelToken(token);
    expect(stored).not.toContain(token);
    expect(stored).toHaveLength(64);
  });

  it('defaults to version 1', () => {
    expect(currentCancelTokenVersion()).toBe(1);
  });
});

describe('rotation does not orphan links already sent', () => {
  it('still derives a v1 token after rotating to v2', () => {
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET = KEY_A;
    const issued = deriveCancelToken('r1', 1);
    const storedHash = hashCancelToken(issued);

    // Rotate: A becomes previous@1, B becomes current@2.
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET = KEY_B;
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_VERSION = '2';
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_PREVIOUS = KEY_A;
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_PREVIOUS_VERSION = '1';

    expect(currentCancelTokenVersion()).toBe(2);
    // The already-issued link is still reproducible — the member can still cancel.
    expect(deriveCancelToken('r1', 1)).toBe(issued);
    expect(cancelTokenHashEquals(hashCancelToken(deriveCancelToken('r1', 1)), storedHash)).toBe(true);
    // New reminders sign under the new key.
    expect(deriveCancelToken('r1', 2)).not.toBe(issued);
  });

  it('refuses to re-sign a v1 reminder with the current key once v1 is retired', () => {
    // Silently re-signing would mint a token that does not match the stored
    // hash — the member's link would fail at the moment they used it.
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET = KEY_B;
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_VERSION = '2';

    expect(() => deriveCancelToken('r1', 1)).toThrow(CancelSecretUnavailableError);
  });
});

describe('hash comparison', () => {
  it('matches identical digests and rejects different ones', () => {
    const h = hashCancelToken('t');
    expect(cancelTokenHashEquals(h, h)).toBe(true);
    expect(cancelTokenHashEquals(h, hashCancelToken('u'))).toBe(false);
  });

  it('returns false rather than throwing on a length mismatch', () => {
    expect(cancelTokenHashEquals(hashCancelToken('t'), 'short')).toBe(false);
  });
});
