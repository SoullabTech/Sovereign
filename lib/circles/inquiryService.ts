/**
 * Inquiry Service — Structured collective questions
 *
 * One inquiry open at a time per circle.
 * One response per member per inquiry (DB UNIQUE constraint).
 * Responses hidden until the member has contributed (sovereignty of thought).
 * Only facilitator/helper can open inquiries.
 * Only the opener can close an inquiry.
 */

import { query, queryOne } from '@/lib/db/postgres';
import { getCircleWithMembership } from './circleService';
import type {
  CircleInquiryRow,
  CircleInquiryResponseRow,
  InquiryStatus,
  ResponseType,
} from './types';

// ── Create Inquiry ───────────────────────────────────────────

export async function createInquiry(
  circleId: string,
  memberId: string,
  question: string
): Promise<CircleInquiryRow> {
  const { membership } = await getCircleWithMembership(circleId, memberId);

  // Role gate: only helper or facilitator
  if (membership.role !== 'helper' && membership.role !== 'facilitator') {
    throw new Error('ROLE_INSUFFICIENT');
  }

  // One-at-a-time gate
  const existing = await queryOne(
    `SELECT id FROM circle_inquiries WHERE circle_id = $1 AND status = 'open' LIMIT 1`,
    [circleId]
  );
  if (existing) {
    throw new Error('INQUIRY_ALREADY_OPEN');
  }

  const result = await queryOne<CircleInquiryRow>(
    `INSERT INTO circle_inquiries (circle_id, opened_by, question)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [circleId, memberId, question]
  );

  return result!;
}

// ── Respond to Inquiry ───────────────────────────────────────

export async function respondToInquiry(
  inquiryId: string,
  memberId: string,
  responseText: string,
  responseType: ResponseType = 'reflection'
): Promise<CircleInquiryResponseRow> {
  // Load inquiry + verify membership
  const inquiry = await queryOne<CircleInquiryRow>(
    `SELECT * FROM circle_inquiries WHERE id = $1`,
    [inquiryId]
  );
  if (!inquiry) throw new Error('NOT_FOUND');
  if (inquiry.status !== 'open') throw new Error('INQUIRY_NOT_OPEN');

  await getCircleWithMembership(inquiry.circle_id, memberId);

  try {
    const result = await queryOne<CircleInquiryResponseRow>(
      `INSERT INTO circle_inquiry_responses (inquiry_id, member_id, response_text, response_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [inquiryId, memberId, responseText, responseType]
    );
    return result!;
  } catch (error: any) {
    // UNIQUE violation = already responded
    if (error?.code === '23505') {
      throw new Error('ALREADY_RESPONDED');
    }
    throw error;
  }
}

// ── Close Inquiry ────────────────────────────────────────────

export async function closeInquiry(
  inquiryId: string,
  memberId: string,
  fieldSynthesis?: string
): Promise<CircleInquiryRow> {
  const inquiry = await queryOne<CircleInquiryRow>(
    `SELECT * FROM circle_inquiries WHERE id = $1`,
    [inquiryId]
  );
  if (!inquiry) throw new Error('NOT_FOUND');
  if (inquiry.status !== 'open') throw new Error('INQUIRY_NOT_OPEN');
  if (inquiry.opened_by !== memberId) throw new Error('NOT_OPENER');

  const nextStatus: InquiryStatus = fieldSynthesis ? 'integrating' : 'closed';

  const result = await queryOne<CircleInquiryRow>(
    `UPDATE circle_inquiries
     SET status = $1, closed_at = NOW(), field_synthesis = $2
     WHERE id = $3
     RETURNING *`,
    [nextStatus, fieldSynthesis ?? null, inquiryId]
  );

  return result!;
}

// ── List Inquiries ───────────────────────────────────────────

export async function listInquiries(
  circleId: string,
  memberId: string,
  status?: InquiryStatus
): Promise<(CircleInquiryRow & { opener_name: string | null })[]> {
  await getCircleWithMembership(circleId, memberId);

  const statusClause = status ? `AND ci.status = $3` : '';
  const params: any[] = [circleId, memberId];
  if (status) params.push(status);

  const result = await query(
    `SELECT ci.*,
       m.name AS opener_name
     FROM circle_inquiries ci
     LEFT JOIN members m ON m.id = ci.opened_by
     WHERE ci.circle_id = $1
     ${statusClause}
     ORDER BY ci.opened_at DESC
     LIMIT 20`,
    params
  );

  return result.rows;
}

// ── Get Inquiry With Responses ───────────────────────────────
// KEY DESIGN: responses array is EMPTY if hasResponded === false
// This enforces "contribute before you see" at the service layer.

export async function getInquiryWithResponses(
  inquiryId: string,
  memberId: string
): Promise<{
  inquiry: CircleInquiryRow & { opener_name: string | null };
  responses: (CircleInquiryResponseRow & { responder_name: string | null })[];
  hasResponded: boolean;
}> {
  const inquiry = await queryOne<CircleInquiryRow & { opener_name: string | null }>(
    `SELECT ci.*, m.name AS opener_name
     FROM circle_inquiries ci
     LEFT JOIN members m ON m.id = ci.opened_by
     WHERE ci.id = $1`,
    [inquiryId]
  );
  if (!inquiry) throw new Error('NOT_FOUND');

  // Membership gate
  await getCircleWithMembership(inquiry.circle_id, memberId);

  // Check if this member has responded
  const ownResponse = await queryOne(
    `SELECT id FROM circle_inquiry_responses WHERE inquiry_id = $1 AND member_id = $2`,
    [inquiryId, memberId]
  );
  // Deliberately row-existence, not withdrawal-aware. Withdrawing returns
  // consent over one's own contribution; it does not un-see what one has
  // already seen, and must not re-hide the field or permit a second answer
  // informed by the first viewing. FR-04 protects independent perception
  // BEFORE exposure — a boundary that cannot be re-crossed backwards.
  const hasResponded = !!ownResponse;

  // Sovereignty of thought: only show responses after contributing
  // Exception: closed/integrating inquiries show all (the inquiry is complete)
  let responses: (CircleInquiryResponseRow & { responder_name: string | null })[] = [];

  if (hasResponded || inquiry.status !== 'open') {
    const result = await query(
      `SELECT cir.*, m.name AS responder_name
       FROM circle_inquiry_responses cir
       LEFT JOIN members m ON m.id = cir.member_id
       WHERE cir.inquiry_id = $1 AND cir.withdrawn_at IS NULL
       ORDER BY cir.created_at ASC`,
      [inquiryId]
    );
    responses = result.rows;
  }

  return { inquiry, responses, hasResponded };
}


// ── Withdraw Response (CA-03) ────────────────────────────────────────────────
//
// "A member may withdraw their own structured-inquiry response. Withdrawal is
// the member exercising continuing consent over a Personal→Circle crossing."
// (founder ruling, 2026-09-07)
//
// ⛔ Only the author. No facilitator, no other member, no system act. Withdrawal
// is the same authority that made the crossing in the first place — which is
// why it cannot be delegated or overridden.

/** The minimal shape shared by a pg client and the `transaction()` handle. */
export interface InquiryClient {
  query(sql: string, params?: unknown[]): Promise<{ rows: any[]; rowCount: number | null }>;
}

/**
 * Withdraw one's own response, against an existing client.
 *
 * Returns nothing about the inquiry beyond success: a withdrawal must not
 * reveal whether or how other members responded. Counting or reporting the
 * remaining responses here would turn an act of consent into a disclosure.
 *
 * Throws:
 *   NOT_FOUND        no live response by this member on this inquiry
 *   ALREADY_WITHDRAWN already withdrawn
 */
export async function withdrawResponseWithClient(
  client: InquiryClient,
  inquiryId: string,
  memberId: string
): Promise<true> {
  // Scoped to the author by the WHERE clause itself, so there is no branch in
  // which another member's id could reach the UPDATE.
  const existing = await client.query(
    `SELECT withdrawn_at FROM circle_inquiry_responses
     WHERE inquiry_id = $1 AND member_id = $2`,
    [inquiryId, memberId]
  );
  if (!existing.rows[0]) throw new Error('NOT_FOUND');
  if (existing.rows[0].withdrawn_at) throw new Error('ALREADY_WITHDRAWN');

  await client.query(
    `UPDATE circle_inquiry_responses
     SET withdrawn_at = NOW()
     WHERE inquiry_id = $1 AND member_id = $2 AND withdrawn_at IS NULL`,
    [inquiryId, memberId]
  );

  return true;
}

/**
 * Withdraw one's own response.
 *
 * Membership is verified first, then authorship is enforced by the query scope.
 * Nothing private is touched: the response is the Circle-side representation a
 * member authored for this crossing, never the source it came from.
 */
export async function withdrawResponse(
  inquiryId: string,
  memberId: string
): Promise<true> {
  const inquiry = await queryOne<CircleInquiryRow>(
    `SELECT * FROM circle_inquiries WHERE id = $1`,
    [inquiryId]
  );
  if (!inquiry) throw new Error('NOT_FOUND');

  await getCircleWithMembership(inquiry.circle_id, memberId);

  const { transaction } = await import('@/lib/db/postgres');
  return transaction(async (tx) =>
    withdrawResponseWithClient(tx as InquiryClient, inquiryId, memberId)
  );
}
