/**
 * Invitations — the bridge between practitioner work and member sovereignty.
 *
 * Closes the false affordance CF-D2 named: `field_program_positions.stated_by`
 * has carried 'practitioner_seeded' since 20260712000001, the UI described it
 * to members, and no writer ever existed.
 *
 * ── What this service refuses to do, structurally ───────────────────────────
 *
 *   Larry's invitation  →  Larry        (attribution permanent)
 *   Member's meaning    →  the member   (no link back)
 *   ⛔ NEVER MERGED
 *
 * There is no function here that writes an invitation reference onto member
 * material, and none may be added. An insight a member writes after receiving
 * an invitation is theirs; the practitioner created the conditions, not the
 * meaning (CF-D5c). The practitioner sees their own rows, plus whatever the
 * member independently chose to share. The two are never joined.
 *
 * There is also no completion state anywhere in this file. An invitation is an
 * offer, not an assignment (CF-D2a).
 */

import { query } from '@/lib/db/postgres';
import { getAuthoredField } from '@/lib/practiceField/programAuthoringService';
import { sanitizeSlug } from '@/lib/practiceField/programPositionService';

export const INVITATION_MAX_LENGTH = 2000;

export type InvitationResponse = 'accepted' | 'declined';

/** An invitation as the authoring practitioner sees it. */
export interface AuthoredInvitation {
  id: string;
  fieldSlug: string;
  programSlug: string;
  body: string;
  addressedToMemberId: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  /** Counts of member gestures. Never a completion rate — there is no completion. */
  acceptedCount: number;
  declinedCount: number;
}

/** An invitation as the member receives it. */
export interface ReceivedInvitation {
  id: string;
  /** The practitioner's words, verbatim. Never paraphrased. */
  body: string;
  /**
   * Who wrote it. Always present — an authored object may not lose its source
   * (CF-D5c). Rendering this without attribution is absorption, not neutrality.
   */
  authoredBy: string;
  offeredAt: string;
  /** The member's own standing answer, or null if they have not answered. */
  myResponse: InvitationResponse | null;
}

interface AuthoredRow {
  id: string;
  field_slug: string;
  program_slug: string;
  body: string;
  addressed_to_member_id: string | null;
  withdrawn_at: string | null;
  created_at: string;
  accepted_count: string;
  declined_count: string;
}

interface ReceivedRow {
  id: string;
  body: string;
  author_name: string | null;
  created_at: string;
  my_response: InvitationResponse | null;
}

export class InvitationError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'InvitationError';
  }
}

/**
 * Create an invitation. Authority comes from authoring a field — the same gate
 * that governs programs and materials. A member who authors no field cannot
 * offer anything to anyone.
 */
export async function createInvitation(params: {
  practitionerId: string;
  programSlug?: string | null;
  body: string;
  addressedToMemberId?: string | null;
}): Promise<AuthoredInvitation> {
  const body = params.body?.trim() ?? '';
  if (!body) {
    throw new InvitationError('An invitation needs words.', 400);
  }
  if (body.length > INVITATION_MAX_LENGTH) {
    throw new InvitationError(
      `An invitation is at most ${INVITATION_MAX_LENGTH} characters.`,
      400,
    );
  }

  const field = await getAuthoredField(params.practitionerId);
  if (!field) {
    throw new InvitationError('Only a field author can offer an invitation.', 403);
  }

  const programSlug = params.programSlug ? sanitizeSlug(params.programSlug) : 'general';

  const res = await query<AuthoredRow>(
    `INSERT INTO field_invitations
       (field_slug, program_slug, authored_by_practitioner_id, body, addressed_to_member_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, field_slug, program_slug, body, addressed_to_member_id,
               withdrawn_at, created_at, '0' AS accepted_count, '0' AS declined_count`,
    [
      field.fieldSlug,
      programSlug,
      params.practitionerId,
      body,
      params.addressedToMemberId ?? null,
    ],
  );

  return toAuthored(res.rows[0]);
}

/**
 * Withdraw an offer. Soft by design: an existing member response is the
 * member's act, and withdrawing the offer must not erase that they answered.
 * Only the author may withdraw — the ownership check is in the WHERE clause,
 * not in a caller-side branch.
 */
export async function withdrawInvitation(params: {
  practitionerId: string;
  invitationId: string;
}): Promise<void> {
  const res = await query(
    `UPDATE field_invitations
        SET withdrawn_at = NOW(), updated_at = NOW()
      WHERE id = $1
        AND authored_by_practitioner_id = $2
        AND withdrawn_at IS NULL`,
    [params.invitationId, params.practitionerId],
  );
  if (res.rowCount === 0) {
    throw new InvitationError('No open invitation of yours with that id.', 404);
  }
}

/** What the authoring practitioner has offered. Their own rows only. */
export async function listAuthoredInvitations(
  practitionerId: string,
): Promise<AuthoredInvitation[]> {
  const res = await query<AuthoredRow>(
    `SELECT i.id, i.field_slug, i.program_slug, i.body, i.addressed_to_member_id,
            i.withdrawn_at, i.created_at,
            COALESCE(SUM(CASE WHEN r.response = 'accepted' THEN 1 ELSE 0 END), 0)::text
              AS accepted_count,
            COALESCE(SUM(CASE WHEN r.response = 'declined' THEN 1 ELSE 0 END), 0)::text
              AS declined_count
       FROM field_invitations i
       LEFT JOIN field_invitation_responses r ON r.invitation_id = i.id
      WHERE i.authored_by_practitioner_id = $1
      GROUP BY i.id
      ORDER BY i.created_at DESC
      LIMIT 200`,
    [practitionerId],
  );
  return res.rows.map(toAuthored);
}

/**
 * What is open to this member: offers addressed to them, plus offers open to
 * anyone standing in the program. Withdrawn offers stop appearing UNLESS the
 * member already answered — their own act does not vanish because the offer did.
 *
 * The practitioner's name is joined here, at read time, for render-time
 * attribution. It is never written onto anything the member authors.
 */
export async function listInvitationsForMember(params: {
  memberId: string;
  fieldSlug: string;
  programSlug?: string | null;
}): Promise<ReceivedInvitation[]> {
  const programSlug = params.programSlug ? sanitizeSlug(params.programSlug) : 'general';

  const res = await query<ReceivedRow>(
    `SELECT i.id, i.body, m.name AS author_name, i.created_at,
            r.response AS my_response
       FROM field_invitations i
       JOIN members m ON m.id = i.authored_by_practitioner_id
       LEFT JOIN field_invitation_responses r
              ON r.invitation_id = i.id AND r.member_id = $1
      WHERE i.field_slug = $2
        AND i.program_slug = $3
        AND (i.addressed_to_member_id IS NULL OR i.addressed_to_member_id = $1)
        AND (i.withdrawn_at IS NULL OR r.response IS NOT NULL)
      ORDER BY i.created_at DESC
      LIMIT 100`,
    [params.memberId, params.fieldSlug, programSlug],
  );

  return res.rows.map((r) => ({
    id: r.id,
    body: r.body,
    // Falls back to a role word rather than rendering an unattributed practice.
    authoredBy: r.author_name ?? 'your practitioner',
    offeredAt: r.created_at,
    myResponse: r.my_response,
  }));
}

/**
 * The member's gesture. Upsert, because a member may change their mind — a
 * declined invitation is not a closed door, and an accepted one is not a
 * commitment they owe anybody.
 *
 * ⛔ Takes no content parameter, and must never gain one. Meaning the member
 *    makes belongs in their own material, unlinked (CF-D5c).
 */
export async function respondToInvitation(params: {
  memberId: string;
  invitationId: string;
  response: InvitationResponse;
}): Promise<{ response: InvitationResponse }> {
  if (params.response !== 'accepted' && params.response !== 'declined') {
    throw new InvitationError('A response is accepted or declined.', 400);
  }

  // Only reachable invitations may be answered: open, and either addressed to
  // this member or open to the program they stand in.
  const visible = await query<{ id: string }>(
    `SELECT i.id
       FROM field_invitations i
      WHERE i.id = $1
        AND i.withdrawn_at IS NULL
        AND (i.addressed_to_member_id IS NULL OR i.addressed_to_member_id = $2)
        AND EXISTS (
          SELECT 1 FROM field_program_positions p
           WHERE p.member_id = $2
             AND p.field_slug = i.field_slug
             AND p.program_slug = i.program_slug
        )`,
    [params.invitationId, params.memberId],
  );
  if (visible.rows.length === 0) {
    throw new InvitationError('That invitation is not open to you.', 404);
  }

  await query(
    `INSERT INTO field_invitation_responses (invitation_id, member_id, response)
     VALUES ($1, $2, $3)
     ON CONFLICT (invitation_id, member_id)
     DO UPDATE SET response = EXCLUDED.response, responded_at = NOW()`,
    [params.invitationId, params.memberId, params.response],
  );

  return { response: params.response };
}

function toAuthored(r: AuthoredRow): AuthoredInvitation {
  return {
    id: r.id,
    fieldSlug: r.field_slug,
    programSlug: r.program_slug,
    body: r.body,
    addressedToMemberId: r.addressed_to_member_id,
    withdrawnAt: r.withdrawn_at,
    createdAt: r.created_at,
    acceptedCount: Number(r.accepted_count ?? 0),
    declinedCount: Number(r.declined_count ?? 0),
  };
}
