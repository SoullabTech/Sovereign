/**
 * ASTRO-R4F / isolated source candidate.
 * Send once permits ONLY that exact text in the approved conversation.
 */
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';

export const R4F_GRANT_LIFETIME_MS = 5 * 60_000;
export const R4F_MAX_PASSAGE_UTF8_BYTES = 12_000;
export const R4F_SCOPE = 'conversation_only' as const;

export type R4fGrant = {
  memberId: string;
  sessionId: string;
  textHmacSha256: string;
  tokenSha256: string;
  issuedAt: Date;
  expiresAt: Date;
  state: 'issued' | 'consumed' | 'revoked';
};

export function sha256Exact(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function hmacPassageExact(value: string, key: string): string {
  if (typeof key !== 'string' || Buffer.byteLength(key, 'utf8') < 32) {
    throw new Error('R4F_PASSAGE_HMAC_KEY_UNAVAILABLE');
  }
  return createHmac('sha256', key).update(value, 'utf8').digest('hex');
}

export function isValidMemberPassage(value: unknown): value is string {
  return typeof value === 'string' &&
    value.trim().length > 0 &&
    Buffer.byteLength(value, 'utf8') <= R4F_MAX_PASSAGE_UTF8_BYTES &&
    !value.includes('\u0000');
}

export function mintR4fOpaqueGrant(): {
  token: string; tokenSha256: string; sessionId: string;
} {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenSha256: sha256Exact(token), sessionId: randomUUID() };
}

export function isR4fGrantEligible(
  grant: R4fGrant,
  attempt: {
    memberId: string;
    token: string;
    text: string;
    now: Date;
    currentlyOptedIn: boolean;
    digestKey: string;
  },
): boolean {
  if (!attempt.currentlyOptedIn || grant.state !== 'issued') return false;
  if (!isValidMemberPassage(attempt.text)) return false;
  if (!attempt.memberId || attempt.memberId !== grant.memberId) return false;
  if (!Number.isFinite(attempt.now.getTime()) ||
      !Number.isFinite(grant.expiresAt.getTime()) ||
      attempt.now.getTime() >= grant.expiresAt.getTime()) return false;
  return sha256Exact(attempt.token) === grant.tokenSha256 &&
         hmacPassageExact(attempt.text, attempt.digestKey) === grant.textHmacSha256;
}

export function mayRecallProtectedPassage(args: {
  protectedOrigin: boolean;
  sourceSessionId: string;
  destinationSessionId: string;
  separatelyAuthorized: boolean;
}): boolean {
  if (!args.protectedOrigin) return true;
  if (!args.sourceSessionId || !args.destinationSessionId) return false;
  if (args.sourceSessionId === args.destinationSessionId) return true;
  return args.separatelyAuthorized === true;
}

// No server-issued reauthorization mechanism is approved in this candidate.
export function canR4fAuthorizeCrossSessionRecall(): false { return false; }
