/**
 * AUTH-RETURN-01 — durable email-code challenge state machine.
 *
 * A new challenge does not invalidate an older accepted code until the new
 * message has been accepted by the configured SMTP server. A timeout is
 * recorded as ambiguous and is never retried automatically. Verification locks
 * and claims one accepted challenge exactly once. Raw codes are never stored.
 */

import {
  createHash,
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import type { TransactionClient } from '@/lib/db/postgres';
import { issueRegistrationProof } from './registrationProof';

export const EMAIL_CODE_PURPOSE = 'authenticate' as const;
export const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
export const EMAIL_CODE_MAX_ATTEMPTS = 5;

export type EmailChallengeStatus =
  | 'pending'
  | 'accepted'
  | 'refused'
  | 'ambiguous'
  | 'superseded'
  | 'claimed'
  | 'expired';

export type EmailCodeErrorCode =
  | 'AUTH_CODE_CONFIGURATION_REQUIRED'
  | 'AUTH_CODE_REQUEST_KEY_REQUIRED'
  | 'AUTH_CODE_UNAVAILABLE'
  | 'AUTH_CODE_INCORRECT'
  | 'AUTH_CODE_EXPIRED'
  | 'AUTH_CODE_ATTEMPTS_EXHAUSTED'
  | 'AUTH_CODE_STATE_CONFLICT';

export class EmailCodeError extends Error {
  constructor(readonly code: EmailCodeErrorCode, message: string) {
    super(message);
    this.name = 'EmailCodeError';
  }
}

export type EmailCodeClient = Pick<TransactionClient, 'query'>;

interface ChallengeRow {
  id: string;
  email: string;
  member_id: string | null;
  purpose: string;
  code_digest: string;
  request_key_digest: string;
  status: EmailChallengeStatus;
  provider: string | null;
  provider_message_id: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string | Date;
  expires_at: string | Date;
  settled_at: string | Date | null;
  claimed_at: string | Date | null;
}

export interface EmailChallengeView {
  id: string;
  email: string;
  memberId: string | null;
  memberName: string | null;
  status: EmailChallengeStatus;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  provider: string | null;
  providerMessageId: string | null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function requirePepper(explicit?: string): string {
  const pepper = (explicit ?? process.env.AUTH_CODE_PEPPER ?? '').trim();
  if (pepper.length < 32) {
    throw new EmailCodeError(
      'AUTH_CODE_CONFIGURATION_REQUIRED',
      'AUTH_CODE_PEPPER must be configured with at least 32 characters',
    );
  }
  return pepper;
}

export function emailCodeDigest(input: {
  challengeId: string;
  email: string;
  code: string;
  pepper?: string;
}): string {
  return createHmac('sha256', requirePepper(input.pepper))
    .update(`${EMAIL_CODE_PURPOSE}\0${input.challengeId}\0${normalizeEmail(input.email)}\0${input.code}`, 'utf8')
    .digest('hex');
}

export function authRequestKeyDigest(requestKey: string): string {
  return createHash('sha256').update(requestKey, 'utf8').digest('hex');
}

function validateRequestKey(value: string): string {
  const key = value.trim();
  if (key.length < 16 || key.length > 200 || /[\u0000-\u001f\u007f]/.test(key)) {
    throw new EmailCodeError(
      'AUTH_CODE_REQUEST_KEY_REQUIRED',
      'A stable authentication request key is required',
    );
  }
  return key;
}

function challengeView(row: ChallengeRow, memberName: string | null = null): EmailChallengeView {
  return {
    id: row.id,
    email: row.email,
    memberId: row.member_id,
    memberName,
    status: row.status,
    attempts: Number(row.attempts),
    maxAttempts: Number(row.max_attempts),
    expiresAt: new Date(row.expires_at),
    provider: row.provider,
    providerMessageId: row.provider_message_id,
  };
}

async function lockEmail(client: EmailCodeClient, email: string): Promise<void> {
  await client.query(
    `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
    [`AUTH-RETURN-01:${normalizeEmail(email)}`],
  );
}

export async function beginEmailChallenge(
  client: EmailCodeClient,
  input: { email: string; requestKey: string; now?: Date; pepper?: string },
): Promise<
  | { created: true; code: string; challenge: EmailChallengeView }
  | { created: false; challenge: EmailChallengeView }
> {
  const email = normalizeEmail(input.email);
  const requestKey = validateRequestKey(input.requestKey);
  requirePepper(input.pepper);
  await lockEmail(client, email);

  const now = input.now ?? new Date();
  const requestDigest = authRequestKeyDigest(requestKey);
  const existingResult = await client.query(
    `SELECT c.*, m.name AS member_name
       FROM auth_email_challenges c
       LEFT JOIN members m ON m.id = c.member_id
      WHERE c.email = $1 AND c.purpose = $2 AND c.request_key_digest = $3
      LIMIT 1`,
    [email, EMAIL_CODE_PURPOSE, requestDigest],
  );
  if (existingResult.rows[0]) {
    const existing = existingResult.rows[0] as ChallengeRow & { member_name?: string | null };
    const existingExpiry = new Date(existing.expires_at).getTime();
    if (existing.status === 'accepted' && (!Number.isFinite(existingExpiry) || existingExpiry <= now.getTime())) {
      const expiredResult = await client.query(
        `UPDATE auth_email_challenges
            SET status = 'expired', settled_at = COALESCE(settled_at, NOW())
          WHERE id = $1 AND status = 'accepted'
          RETURNING *`,
        [existing.id],
      );
      const expired = expiredResult.rows[0] as ChallengeRow | undefined;
      if (!expired) {
        throw new EmailCodeError('AUTH_CODE_STATE_CONFLICT', 'Authentication challenge state changed');
      }
      // The route reports a consumed request key and asks for an explicit new
      // request. An expired accepted key never reports success or resends mail.
      return { created: false, challenge: challengeView(expired, existing.member_name ?? null) };
    }
    return { created: false, challenge: challengeView(existing, existing.member_name ?? null) };
  }

  const memberResult = await client.query(
    `SELECT id, name FROM members WHERE LOWER(email) = $1 LIMIT 1`,
    [email],
  );
  const member = memberResult.rows[0] as { id?: string; name?: string | null } | undefined;
  const id = randomUUID();
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const expiresAt = new Date(now.getTime() + EMAIL_CODE_TTL_MS);
  const digest = emailCodeDigest({ challengeId: id, email, code, pepper: input.pepper });

  const inserted = await client.query(
    `INSERT INTO auth_email_challenges (
       id, email, member_id, purpose, code_digest, request_key_digest,
       status, attempts, max_attempts, created_at, expires_at
     ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0, $7, $8, $9)
     RETURNING *`,
    [
      id,
      email,
      member?.id ?? null,
      EMAIL_CODE_PURPOSE,
      digest,
      requestDigest,
      EMAIL_CODE_MAX_ATTEMPTS,
      now.toISOString(),
      expiresAt.toISOString(),
    ],
  );
  const row = inserted.rows[0] as ChallengeRow;
  return { created: true, code, challenge: challengeView(row, member?.name ?? null) };
}

export async function settleEmailChallengeAccepted(
  client: EmailCodeClient,
  input: { challengeId: string; provider: string; providerMessageId: string },
): Promise<EmailChallengeView> {
  // Acquire the same subject lock as issuance and verification before any row
  // lock. Otherwise two accepted sends can each miss the other's uncommitted
  // state, or deadlock while trying to supersede each other's locked rows.
  const subjectResult = await client.query(
    `SELECT email FROM auth_email_challenges WHERE id = $1`,
    [input.challengeId],
  );
  const subject = subjectResult.rows[0] as { email: string } | undefined;
  if (!subject) {
    throw new EmailCodeError('AUTH_CODE_UNAVAILABLE', 'Authentication challenge is unavailable');
  }
  await lockEmail(client, subject.email);

  const locked = await client.query(
    `SELECT * FROM auth_email_challenges WHERE id = $1 FOR UPDATE`,
    [input.challengeId],
  );
  const row = locked.rows[0] as ChallengeRow | undefined;
  if (!row) {
    throw new EmailCodeError('AUTH_CODE_UNAVAILABLE', 'Authentication challenge is unavailable');
  }
  if (row.email !== subject.email) {
    throw new EmailCodeError('AUTH_CODE_STATE_CONFLICT', 'Authentication challenge subject changed');
  }
  if (row.status === 'accepted') return challengeView(row);
  if (row.status !== 'pending') {
    throw new EmailCodeError('AUTH_CODE_STATE_CONFLICT', 'Authentication challenge cannot be accepted from its current state');
  }

  const accepted = await client.query(
    `UPDATE auth_email_challenges
        SET status = 'accepted', provider = $2, provider_message_id = $3, settled_at = NOW()
      WHERE id = $1 AND status = 'pending'
      RETURNING *`,
    [input.challengeId, input.provider, input.providerMessageId],
  );
  const updated = accepted.rows[0] as ChallengeRow | undefined;
  if (!updated) {
    throw new EmailCodeError('AUTH_CODE_STATE_CONFLICT', 'Authentication challenge acceptance raced');
  }

  // The older accepted code remains live until this update succeeds. Only now
  // does the newly delivered challenge supersede it.
  await client.query(
    `UPDATE auth_email_challenges
        SET status = 'superseded', settled_at = COALESCE(settled_at, NOW())
      WHERE email = $1 AND purpose = $2 AND status = 'accepted' AND id <> $3`,
    [updated.email, EMAIL_CODE_PURPOSE, updated.id],
  );
  return challengeView(updated);
}

export async function settleEmailChallengeFailure(
  client: EmailCodeClient,
  input: { challengeId: string; ambiguous: boolean; provider?: string },
): Promise<void> {
  await client.query(
    `UPDATE auth_email_challenges
        SET status = $2, provider = $3, settled_at = NOW()
      WHERE id = $1 AND status = 'pending'`,
    [input.challengeId, input.ambiguous ? 'ambiguous' : 'refused', input.provider ?? null],
  );
}

function safeEqualHex(left: string, right: string): boolean {
  try {
    const a = Buffer.from(left, 'hex');
    const b = Buffer.from(right, 'hex');
    return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type EmailCodeVerification =
  | { kind: 'existing-member'; challengeId: string; memberId: string }
  | {
      kind: 'registration-required';
      challengeId: string;
      email: string;
      registrationProof: string;
      registrationProofExpiresAt: Date;
    }
  | {
      kind: 'refused';
      code: EmailCodeErrorCode;
      message: string;
    };

export async function verifyEmailCode(
  client: EmailCodeClient,
  input: { email: string; code: string; now?: Date; pepper?: string },
): Promise<EmailCodeVerification> {
  const email = normalizeEmail(input.email);
  const code = input.code.trim();
  if (!/^\d{6}$/.test(code)) {
    return { kind: 'refused', code: 'AUTH_CODE_INCORRECT', message: 'Authentication code is incorrect' };
  }
  requirePepper(input.pepper);
  await lockEmail(client, email);

  const now = input.now ?? new Date();
  const challengeResult = await client.query(
    `SELECT *
       FROM auth_email_challenges
      WHERE email = $1 AND purpose = $2 AND status = 'accepted'
      ORDER BY settled_at DESC NULLS LAST, created_at DESC
      LIMIT 1
      FOR UPDATE`,
    [email, EMAIL_CODE_PURPOSE],
  );
  const challenge = challengeResult.rows[0] as ChallengeRow | undefined;
  if (!challenge) {
    return { kind: 'refused', code: 'AUTH_CODE_UNAVAILABLE', message: 'No active authentication code is available' };
  }

  const expiresAt = new Date(challenge.expires_at);
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    await client.query(
      `UPDATE auth_email_challenges SET status = 'expired', settled_at = COALESCE(settled_at, NOW())
        WHERE id = $1 AND status = 'accepted'`,
      [challenge.id],
    );
    // Expected refusals are values so the caller's transaction commits the
    // state change. Throwing here would roll it back with the refusal.
    return { kind: 'refused', code: 'AUTH_CODE_EXPIRED', message: 'Authentication code has expired' };
  }

  const actualDigest = emailCodeDigest({
    challengeId: challenge.id,
    email,
    code,
    pepper: input.pepper,
  });
  if (!safeEqualHex(actualDigest, challenge.code_digest)) {
    const nextAttempts = Number(challenge.attempts) + 1;
    const exhausted = nextAttempts >= Number(challenge.max_attempts);
    await client.query(
      `UPDATE auth_email_challenges
          SET attempts = $2, status = CASE WHEN $3 THEN 'expired' ELSE status END
        WHERE id = $1 AND status = 'accepted'`,
      [challenge.id, nextAttempts, exhausted],
    );
    return {
      kind: 'refused',
      code: exhausted ? 'AUTH_CODE_ATTEMPTS_EXHAUSTED' : 'AUTH_CODE_INCORRECT',
      message: exhausted ? 'Authentication code attempts are exhausted' : 'Authentication code is incorrect',
    };
  }

  const claimed = await client.query(
    `UPDATE auth_email_challenges
        SET status = 'claimed', claimed_at = NOW()
      WHERE id = $1 AND status = 'accepted'
      RETURNING id`,
    [challenge.id],
  );
  if (claimed.rows.length !== 1) {
    throw new EmailCodeError('AUTH_CODE_STATE_CONFLICT', 'Authentication code was claimed concurrently');
  }

  // Resolve membership at claim time, not issue time. A parallel legitimate
  // registration may have created the member after the email was sent.
  const memberResult = await client.query(
    `SELECT id FROM members WHERE LOWER(email) = $1 LIMIT 1`,
    [email],
  );
  const memberId = (memberResult.rows[0] as { id?: string } | undefined)?.id;
  if (memberId) {
    return { kind: 'existing-member', challengeId: challenge.id, memberId };
  }

  const proof = await issueRegistrationProof(client, {
    challengeId: challenge.id,
    email,
    now,
  });
  return {
    kind: 'registration-required',
    challengeId: challenge.id,
    email,
    registrationProof: proof.proof,
    registrationProofExpiresAt: proof.expiresAt,
  };
}
