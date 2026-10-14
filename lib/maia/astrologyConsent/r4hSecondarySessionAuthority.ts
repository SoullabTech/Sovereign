/**
 * ASTRO-R4H: secondary MAIA/learning consumers may only read a member's
 * conversation using an independently verified, active server session.
 * A request body's member ID or an imported meta field is never authority.
 */
import { assertR4gOrdinarySession } from './r4gOrdinarySessionGate';

export class R4hSecondaryAuthenticationRefused extends Error {
  constructor() {
    super('R4H_SECONDARY_AUTHENTICATION_REQUIRED');
    this.name = 'R4hSecondaryAuthenticationRefused';
  }
}

export type R4hVerifiedSession = {
  memberId: string;
  revoked: boolean;
  expiresAt: Date;
} | null;

export async function assertR4hSecondarySession(args: {
  sessionId: string;
  claimedMemberId?: unknown;
  resolveSession: () => Promise<R4hVerifiedSession>;
}): Promise<string> {
  // Never query any protected registry or model if caller supplies no session.
  if (!args.sessionId || typeof args.sessionId !== 'string') {
    throw new R4hSecondaryAuthenticationRefused();
  }
  const verified = await args.resolveSession();
  if (!verified || !verified.memberId || verified.revoked ||
      !(verified.expiresAt instanceof Date) ||
      !Number.isFinite(verified.expiresAt.getTime()) ||
      verified.expiresAt.getTime() <= Date.now()) {
    throw new R4hSecondaryAuthenticationRefused();
  }
  if (typeof args.claimedMemberId === 'string' &&
      args.claimedMemberId.trim() &&
      args.claimedMemberId.trim() !== verified.memberId) {
    throw new R4hSecondaryAuthenticationRefused();
  }
  await assertR4gOrdinarySession(args.sessionId);
  return verified.memberId;
}
