/**
 * Invite Service — Manage circle invite tokens
 *
 * Regenerating an invite revokes all previous tokens.
 * Only the circle creator can generate invites.
 */

import { query, queryOne } from '@/lib/db/postgres';
import type { CircleInviteRow } from './types';

function makeInviteToken(): string {
  return `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`.slice(0, 48);
}

/**
 * Regenerate invite token for a circle.
 * Revokes all existing tokens. Only the circle creator can do this.
 */
export async function regenerateInvite(circleId: string, memberId: string) {
  // Verify the member is the circle creator
  const circle = await queryOne(
    `SELECT id, created_by FROM circles WHERE id = $1`,
    [circleId]
  );

  if (!circle || circle.created_by !== memberId) {
    throw new Error('FORBIDDEN');
  }

  // Revoke all existing tokens
  await query(
    `UPDATE circle_invites
     SET revoked_at = NOW()
     WHERE circle_id = $1 AND revoked_at IS NULL`,
    [circleId]
  );

  // Create new token
  const token = makeInviteToken();

  const result = await queryOne<CircleInviteRow>(
    `INSERT INTO circle_invites (circle_id, created_by, token)
     VALUES ($1, $2, $3)
     RETURNING token, created_at`,
    [circleId, memberId, token]
  );

  return result;
}

/** The minimal shape shared by a pg client and the `transaction()` handle. */
export interface InviteClient {
  query(sql: string, params?: unknown[]): Promise<{ rows: any[]; rowCount: number | null }>;
}

/**
 * Join a circle using an invite token, against an existing client.
 *
 * ⭐ AN INVITATION IS PERMISSION TO APPROACH A THRESHOLD. IT IS NOT AUTHORITY TO
 * ERASE PRIOR RELATIONAL HISTORY. (I-01, founder ruling 2026-09-07.)
 *
 * The defect this closes: a generic Circle invitation had enough authority to
 * overwrite a recorded removal. The upsert below used to set `status='active'`
 * unconditionally, so
 *
 *     removed membership  +  still-valid generic invite  →  active
 *
 * which contradicts FR-05's requirement that removal cut access. A removal is a
 * facilitator boundary or safety act with recorded grounds; a bearer token held
 * by anyone does not outrank it.
 *
 * ⛔ NOT fixed by revoking the token. The token is CIRCLE-WIDE — revoking it
 * because one person is ineligible would withdraw the invitation from everyone
 * else. The ineligible member is refused; the invitation is untouched and every
 * other invitee is unaffected.
 *
 * ⛔ `left` is NOT `removed`. Voluntary departure is a different standing, and
 * whether a departed member may rejoin through a current invitation stays open
 * (CA-08 / D-I8, I7). This function deliberately does not change that behavior.
 *
 * Reinstatement after removal requires a future explicit governance act. That
 * act is NOT built here.
 *
 * Throws:
 *   INVALID_INVITE           no such token, or revoked
 *   REINSTATEMENT_REQUIRED   this member's standing in this Circle is `removed`
 */
export async function joinWithInviteWithClient(
  client: InviteClient,
  token: string,
  memberId: string,
  consentMode: 'manual' | 'not_now'
) {
  const invite = (
    await client.query(
      `SELECT circle_id, revoked_at FROM circle_invites WHERE token = $1`,
      [token]
    )
  ).rows[0] as Pick<CircleInviteRow, 'circle_id' | 'revoked_at'> | undefined;

  if (!invite || invite.revoked_at) {
    throw new Error('INVALID_INVITE');
  }

  // Standing outranks invitation. Checked before any write, so a refused join
  // leaves the membership row and the removal record exactly as they were.
  const standing = (
    await client.query(
      `SELECT status FROM circle_memberships WHERE circle_id = $1 AND member_id = $2`,
      [invite.circle_id, memberId]
    )
  ).rows[0] as { status: string } | undefined;

  if (standing?.status === 'removed') {
    throw new Error('REINSTATEMENT_REQUIRED');
  }

  await client.query(
    `INSERT INTO circle_memberships (circle_id, member_id, role, status, consent_mode, consented_at)
     VALUES ($1, $2, 'member', 'active', $3, NOW())
     ON CONFLICT (circle_id, member_id)
     DO UPDATE SET status = 'active', consent_mode = $3, consented_at = NOW()`,
    [invite.circle_id, memberId, consentMode]
  );

  return invite.circle_id as string;
}

/**
 * Join a circle using an invite token.
 */
export async function joinWithInvite(
  token: string,
  memberId: string,
  consentMode: 'manual' | 'not_now'
) {
  const { transaction } = await import('@/lib/db/postgres');
  return transaction(async (tx) =>
    joinWithInviteWithClient(tx as InviteClient, token, memberId, consentMode)
  );
}
