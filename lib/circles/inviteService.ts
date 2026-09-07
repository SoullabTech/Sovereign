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
 * ⭐ A RECORDED REMOVAL STANDING OUTRANKS A GENERIC INVITATION. An invitation is
 * permission to approach a threshold. It is not authority to erase prior
 * relational history. (FR-18, founder ruling 2026-09-07.)
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

  // ⭐ THE AUTHORITY IS THE MUTATION, NOT A PRECHECK.
  //
  // An earlier candidate read the standing first and refused if it was
  // `removed`, then upserted `status='active'` unconditionally. That is a
  // time-of-check/time-of-use gap, and the founder rejected it before the
  // verifier was ever run: `transaction()` is an ordinary BEGIN with no row
  // lock and no stronger isolation, so a removal committing between the read
  // and the write left the invitation free to overwrite it —
  //
  //     JOIN reads standing = active
  //                                REMOVAL commits: status = removed, record written
  //     JOIN writes  status = active          ← the generic invitation wins
  //
  // A precheck establishes only *this person was not removed a moment ago*.
  // FR-18 requires the stronger statement: **a generic invitation may not
  // overwrite a removal standing at the membership mutation boundary.**
  //
  // So the rule lives in the upsert itself. `ON CONFLICT ... DO UPDATE` takes a
  // row lock and re-evaluates its WHERE against the latest committed version of
  // the conflicting row, which is exactly the boundary the rule belongs at.
  //
  // ⛔ Do not reintroduce a standing SELECT as the refusal path. If a cheap
  // early exit is ever wanted, it may only ever be advisory — the guarded
  // mutation must remain the authority.
  //
  // Zero rows returned ⟺ a membership row exists whose status is `removed`:
  // the insert path always returns, and the update path returns unless the
  // guard excluded it.
  const admitted = await client.query(
    `INSERT INTO circle_memberships (circle_id, member_id, role, status, consent_mode, consented_at)
     VALUES ($1, $2, 'member', 'active', $3, NOW())
     ON CONFLICT (circle_id, member_id)
     DO UPDATE SET status = 'active', consent_mode = $3, consented_at = NOW()
     WHERE circle_memberships.status <> 'removed'
     RETURNING circle_id`,
    [invite.circle_id, memberId, consentMode]
  );

  if (admitted.rows.length === 0) {
    throw new Error('REINSTATEMENT_REQUIRED');
  }

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
