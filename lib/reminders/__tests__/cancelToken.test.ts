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
  retainedCancelTokenVersions,
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
  delete process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS;
  delete process.env.SELF_ADDRESSED_RETURN_CANCEL_CURRENT_VERSION;
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

describe('rotation retention — a key lives while a reminder depends on it', () => {
  const KEY_C = 'c'.repeat(40);

  it('keeps v1 derivable across TWO rotations, which current+previous could not', () => {
    // The case that broke the earlier design: a reminder scheduled far enough
    // ahead outlives more than one rotation.
    process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET = KEY_A;
    const issued = deriveCancelToken('r1', 1);
    const storedHash = hashCancelToken(issued);

    delete process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET;
    process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS = JSON.stringify({
      1: KEY_A,
      2: KEY_B,
      3: KEY_C,
    });

    expect(currentCancelTokenVersion()).toBe(3);
    expect(retainedCancelTokenVersions()).toEqual([1, 2, 3]);
    // The member's link, issued two rotations ago, still works.
    expect(deriveCancelToken('r1', 1)).toBe(issued);
    expect(cancelTokenHashEquals(hashCancelToken(deriveCancelToken('r1', 1)), storedHash)).toBe(
      true,
    );
  });

  it('fails closed when a version was retired while still depended upon', () => {
    process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS = JSON.stringify({ 2: KEY_B, 3: KEY_C });
    expect(() => deriveCancelToken('r1', 1)).toThrow(CancelSecretUnavailableError);
    // The message says where to look rather than only that it broke.
    expect(() => deriveCancelToken('r1', 1)).toThrow(/retention/);
  });

  it('never re-signs an old reminder under the current key', () => {
    // Silently re-signing mints a token that does not match the stored hash —
    // the member's link would fail at the moment they used it.
    process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS = JSON.stringify({ 1: KEY_A, 2: KEY_B });
    expect(deriveCancelToken('r1', 1)).not.toBe(deriveCancelToken('r1', 2));
  });

  it('signs new reminders with the declared current version, not merely the newest', () => {
    process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS = JSON.stringify({ 1: KEY_A, 2: KEY_B });
    process.env.SELF_ADDRESSED_RETURN_CANCEL_CURRENT_VERSION = '1';
    expect(currentCancelTokenVersion()).toBe(1);
  });

  it('refuses a keyring whose current version it holds no key for', () => {
    process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS = JSON.stringify({ 1: KEY_A });
    process.env.SELF_ADDRESSED_RETURN_CANCEL_CURRENT_VERSION = '5';
    expect(isCancelSecretConfigured()).toBe(false);
  });

  it('refuses a keyring containing a weak key rather than partially accepting it', () => {
    process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS = JSON.stringify({ 1: KEY_A, 2: 'short' });
    expect(isCancelSecretConfigured()).toBe(false);
  });

  it('refuses malformed keyring JSON', () => {
    process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS = 'not json';
    expect(isCancelSecretConfigured()).toBe(false);
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
