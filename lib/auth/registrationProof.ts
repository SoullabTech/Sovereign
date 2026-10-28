/**
 * AUTH-RETURN-01 — purpose-bound, one-use registration proof.
 *
 * The raw proof is returned once to the browser and is never stored. PostgreSQL
 * retains only a SHA-256 digest. Consumption happens inside the same transaction
 * that creates the member and the verified server session, so any later failure
 * rolls the proof back to unused rather than leaving a half-created identity.
 */

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { TransactionClient } from '@/lib/db/postgres';

export const REGISTRATION_PROOF_PURPOSE = 'register-email' as const;
export const REGISTRATION_PROOF_TTL_MS = 15 * 60 * 1000;

export type RegistrationProofErrorCode =
  | 'REGISTRATION_PROOF_INVALID'
  | 'REGISTRATION_PROOF_EXPIRED'
  | 'REGISTRATION_PROOF_CONSUMED'
  | 'REGISTRATION_PROOF_REVOKED'
  | 'REGISTRATION_PROOF_EMAIL_MISMATCH'
  | 'REGISTRATION_PROOF_RACE';

export class RegistrationProofError extends Error {
  constructor(readonly code: RegistrationProofErrorCode, message: string) {
    super(message);
    this.name = 'RegistrationProofError';
  }
}

export type RegistrationProofClient = Pick<TransactionClient, 'query'>;

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function registrationProofDigest(proof: string): string {
  return createHash('sha256').update(proof, 'utf8').digest('hex');
}

export async function issueRegistrationProof(
  client: RegistrationProofClient,
  input: { challengeId: string; email: string; now?: Date },
): Promise<{ proof: string; proofId: string; expiresAt: Date }> {
  const email = normalizeAuthEmail(input.email);
  const now = input.now ?? new Date();
  const expiresAt = new Date(now.getTime() + REGISTRATION_PROOF_TTL_MS);
  const proof = randomBytes(32).toString('base64url');
  const proofId = randomUUID();

  await client.query(
    `INSERT INTO auth_registration_proofs (
       id, challenge_id, email, purpose, proof_digest, expires_at
     ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      proofId,
      input.challengeId,
      email,
      REGISTRATION_PROOF_PURPOSE,
      registrationProofDigest(proof),
      expiresAt.toISOString(),
    ],
  );

  return { proof, proofId, expiresAt };
}

/** Validate proof authority while retaining its row lock until transaction end. */
export async function lockRegistrationProof(
  client: RegistrationProofClient,
  input: { proof: string; email: string; now?: Date },
): Promise<{ proofId: string; challengeId: string }> {
  const raw = typeof input.proof === 'string' ? input.proof.trim() : '';
  if (!/^[A-Za-z0-9_-]{40,160}$/.test(raw)) {
    throw new RegistrationProofError('REGISTRATION_PROOF_INVALID', 'Registration proof is invalid');
  }

  const email = normalizeAuthEmail(input.email);
  const lookup = await client.query(
    `SELECT id, challenge_id, email, purpose, expires_at, consumed_at, revoked_at
       FROM auth_registration_proofs
      WHERE proof_digest = $1
      FOR UPDATE`,
    [registrationProofDigest(raw)],
  );

  const row = lookup.rows[0] as Record<string, unknown> | undefined;
  if (!row || row.purpose !== REGISTRATION_PROOF_PURPOSE) {
    throw new RegistrationProofError('REGISTRATION_PROOF_INVALID', 'Registration proof is invalid');
  }
  if (normalizeAuthEmail(String(row.email ?? '')) !== email) {
    throw new RegistrationProofError('REGISTRATION_PROOF_EMAIL_MISMATCH', 'Registration proof does not match this email');
  }
  if (row.revoked_at) {
    throw new RegistrationProofError('REGISTRATION_PROOF_REVOKED', 'Registration proof has been revoked');
  }
  if (row.consumed_at) {
    throw new RegistrationProofError('REGISTRATION_PROOF_CONSUMED', 'Registration proof has already been used');
  }

  const now = input.now ?? new Date();
  const expiresAt = new Date(String(row.expires_at));
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    throw new RegistrationProofError('REGISTRATION_PROOF_EXPIRED', 'Registration proof has expired');
  }

  return { proofId: String(row.id), challengeId: String(row.challenge_id) };
}

export async function consumeRegistrationProof(
  client: RegistrationProofClient,
  input: { proof: string; email: string; memberId: string; now?: Date },
): Promise<{ proofId: string; challengeId: string }> {
  const proof = await lockRegistrationProof(client, input);
  const consumed = await client.query(
    `UPDATE auth_registration_proofs
        SET consumed_at = NOW(), consumed_by_member_id = $2
      WHERE id = $1 AND consumed_at IS NULL AND revoked_at IS NULL
      RETURNING id`,
    [proof.proofId, input.memberId],
  );
  if (consumed.rows.length !== 1) {
    throw new RegistrationProofError('REGISTRATION_PROOF_RACE', 'Registration proof was consumed concurrently');
  }

  return proof;
}
