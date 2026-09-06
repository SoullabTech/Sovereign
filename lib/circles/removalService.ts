/**
 * Removal Service — FR-05, the boundary/safety act
 *
 * CIRCLE-04 · R2. Implements the removal contract ratified 2026-09-06.
 *
 * FR-05, in the founder's terms:
 *
 *   Removal is a BOUNDARY OR SAFETY ACTION, never an interpretive judgment.
 *   An ordinary member cannot remove another member. An authorized facilitator
 *   may enact removal only where an explicit Circle boundary or safety condition
 *   has been breached. Grounds must be recorded. Removal must cut access and
 *   revoke that member's Circle shares exactly as leaving does, must never alter
 *   or delete the member's original source material, and the removed member must
 *   have a route to request review by someone other than the person who enacted it.
 *
 * ⛔ WHAT THIS DELIBERATELY DOES NOT DO
 *
 * - It does not judge. `grounds` is recorded, never evaluated. Nothing in this
 *   module decides whether a removal was warranted; that is what the review route
 *   (CA-10, not built) is for, and why the evidence must exist from the first
 *   removal rather than being reconstructed later.
 * - It does not touch any other Circle. Removal is scoped to one field.
 * - It does not delete or alter the removed member's source material. Only the
 *   Circle-side representation is revoked, exactly as leaving does.
 *
 * ⚠️ KNOWN GAP, NOT REPAIRED HERE — there is no way to become a facilitator.
 * createCircle() assigns the creator 'helper'; joinWithInvite() assigns 'member';
 * no code path anywhere assigns 'facilitator'. So this contract is implemented
 * and falsifiable but unreachable in production until role assignment exists.
 * Widening the gate to 'helper' would make it reachable — and would be Jarvis
 * inventing the facilitator policy that FR-05 reserved to the founder. Recorded
 * as a finding instead. See docs/programme/JARVIS-CIRCLES-01_REPAIR_R2_*.md.
 */

import { transaction } from '@/lib/db/postgres';

/**
 * The minimal shape shared by a pg PoolClient and the `transaction()` handle.
 * Declared structurally so the verifier can drive the real removal semantics
 * inside its own rolled-back transaction, rather than asserting on source tokens.
 */
export interface RemovalClient {
  query(
    sql: string,
    params?: unknown[]
  ): Promise<{ rows: any[]; rowCount: number | null }>;
}

export interface RemoveMemberInput {
  circleId: string;
  /** The facilitator enacting the removal. */
  actingMemberId: string;
  /** The member being removed. */
  targetMemberId: string;
  /** Grounds sufficient for later independent review. Required. */
  grounds: string;
}

export interface RemovalRecord {
  id: string;
  circle_id: string;
  removed_member_id: string;
  removed_by: string;
  grounds: string;
  resulting_status: string;
  created_at: string;
}

/**
 * Perform the removal against an existing client.
 *
 * Every step runs on the SAME client, so authority check, revocation, status
 * change and the append-only record are one atomic unit. A state where
 * `member = removed` but `shares = still visible` must never be externally
 * observable, so the revocation and the status change cannot be separated.
 *
 * Throws, without partial effect (the caller's transaction rolls back):
 *   NOT_A_MEMBER        the actor holds no active membership in this Circle
 *   ROLE_INSUFFICIENT   the actor is not a facilitator
 *   SELF_REMOVAL        the actor targeted themselves — that is leaveCircle()
 *   TARGET_NOT_ACTIVE   the target holds no active membership in this Circle
 *   GROUNDS_REQUIRED    grounds were absent or blank
 */
export async function removeMemberWithClient(
  client: RemovalClient,
  input: RemoveMemberInput
): Promise<RemovalRecord> {
  const { circleId, actingMemberId, targetMemberId } = input;
  const grounds = (input.grounds ?? '').trim();

  // FR-05: an unexplained removal is the interpretive judgment FR-05 forbids.
  if (!grounds) {
    throw new Error('GROUNDS_REQUIRED');
  }

  // Self-removal is leaving, which carries different authority. Checked before
  // the role gate so a facilitator targeting themselves gets the accurate error.
  if (actingMemberId === targetMemberId) {
    throw new Error('SELF_REMOVAL');
  }

  // Authority: the actor must hold an ACTIVE facilitator membership in THIS
  // Circle. Role is held inside the Circle, never globally.
  const actor = await client.query(
    `SELECT role, status FROM circle_memberships
     WHERE circle_id = $1 AND member_id = $2`,
    [circleId, actingMemberId]
  );
  const actorRow = actor.rows[0];
  if (!actorRow || actorRow.status !== 'active') {
    throw new Error('NOT_A_MEMBER');
  }
  if (actorRow.role !== 'facilitator') {
    throw new Error('ROLE_INSUFFICIENT');
  }

  // The target must actually be in this Circle, and active.
  const target = await client.query(
    `SELECT status FROM circle_memberships
     WHERE circle_id = $1 AND member_id = $2`,
    [circleId, targetMemberId]
  );
  if (!target.rows[0] || target.rows[0].status !== 'active') {
    throw new Error('TARGET_NOT_ACTIVE');
  }

  // Revoke the removed member's active shares in THIS Circle only — identical
  // to leaveCircle()'s cascade. Sets revoked_at; the source item is untouched.
  await client.query(
    `UPDATE shared_artifacts
     SET revoked_at = NOW()
     WHERE circle_id = $1 AND shared_by = $2 AND revoked_at IS NULL`,
    [circleId, targetMemberId]
  );

  // Cut access. Scoped to this Circle; memberships elsewhere are untouched.
  await client.query(
    `UPDATE circle_memberships
     SET status = 'removed', updated_at = NOW()
     WHERE circle_id = $1 AND member_id = $2 AND status = 'active'`,
    [circleId, targetMemberId]
  );

  // The append-only record. Written last so it describes a completed act, and
  // in the same transaction so it cannot exist without one.
  const record = await client.query(
    `INSERT INTO circle_membership_removals
       (circle_id, removed_member_id, removed_by, grounds, resulting_status)
     VALUES ($1, $2, $3, $4, 'removed')
     RETURNING id, circle_id, removed_member_id, removed_by, grounds, resulting_status, created_at`,
    [circleId, targetMemberId, actingMemberId, grounds]
  );

  return record.rows[0] as RemovalRecord;
}

/**
 * Remove a member from a Circle. One atomic operation.
 */
export async function removeMember(input: RemoveMemberInput): Promise<RemovalRecord> {
  return transaction(async (tx) => removeMemberWithClient(tx as RemovalClient, input));
}

/**
 * Removals recorded for a member — the read the FR-05 review route will need.
 *
 * Exposed now so the evidence is reachable without reconstructing history when
 * that route is built. The route itself (CA-10) is not built, and this function
 * has no caller yet.
 */
export async function listRemovalsForMember(
  memberId: string,
  client?: RemovalClient
): Promise<RemovalRecord[]> {
  const sql = `SELECT id, circle_id, removed_member_id, removed_by, grounds, resulting_status, created_at
               FROM circle_membership_removals
               WHERE removed_member_id = $1
               ORDER BY created_at DESC`;
  if (client) {
    return (await client.query(sql, [memberId])).rows as RemovalRecord[];
  }
  const { query } = await import('@/lib/db/postgres');
  return (await query(sql, [memberId])).rows as RemovalRecord[];
}
