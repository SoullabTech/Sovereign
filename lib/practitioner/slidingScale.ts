/**
 * SLIDING SCALE ENGINE
 *
 * Dignified affordability system for practitioners.
 * "No income verification. No uploads. No power games."
 *
 * Core operations:
 * - Policy management (get, upsert)
 * - Request handling (list, get, decide)
 * - Award management (create, end)
 */

import { query } from '@/lib/db/postgres';

// =============================================================================
// TYPES
// =============================================================================

export interface SlidingScalePolicy {
  id: string;
  practitioner_id: string;
  is_enabled: boolean;
  public_label: string | null;
  public_description: string | null;
  min_rate_cents: number;
  max_rate_cents: number;
  session_length_minutes: number;
  currency: string;
  spots_total: number;
  spots_filled: number;
  request_form_enabled: boolean;
  auto_close_when_full: boolean;
  intake_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface SlidingScaleRequest {
  id: string;
  practitioner_id: string;
  client_id: string | null;
  portal_token_id: string | null;
  client_email: string | null;
  client_name: string | null;
  requested_rate_cents: number | null;
  preferred_range_min_cents: number | null;
  preferred_range_max_cents: number | null;
  message: string | null;
  status: 'pending' | 'approved' | 'declined' | 'withdrawn' | 'expired';
  decision_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}

export interface SlidingScaleAward {
  id: string;
  practitioner_id: string;
  request_id: string;
  client_id: string | null;
  rate_cents: number;
  status: 'active' | 'paused' | 'ended';
  starts_at: string;
  ends_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface PolicyInput {
  is_enabled?: boolean;
  public_label?: string;
  public_description?: string;
  min_rate_cents?: number;
  max_rate_cents?: number;
  session_length_minutes?: number;
  currency?: string;
  spots_total?: number;
  request_form_enabled?: boolean;
  auto_close_when_full?: boolean;
  intake_prompt?: string;
}

export interface RequestInput {
  client_id?: string;
  portal_token_id?: string;
  client_email?: string;
  client_name?: string;
  requested_rate_cents?: number;
  preferred_range_min_cents?: number;
  preferred_range_max_cents?: number;
  message?: string;
}

export interface DecisionInput {
  decision: 'approve' | 'decline';
  approved_rate_cents?: number;
  decision_note?: string;
}

// =============================================================================
// POLICY OPERATIONS
// =============================================================================

/**
 * Get a practitioner's sliding scale policy
 */
export async function getPolicy(
  practitionerId: string
): Promise<SlidingScalePolicy | null> {
  const result = await query<SlidingScalePolicy>(
    `SELECT * FROM sliding_scale_policies WHERE practitioner_id = $1`,
    [practitionerId]
  );
  return result.rows[0] || null;
}

/**
 * Create or update a practitioner's sliding scale policy
 */
export async function upsertPolicy(
  practitionerId: string,
  input: PolicyInput
): Promise<SlidingScalePolicy> {
  // Validate rate order if both provided
  if (
    input.min_rate_cents !== undefined &&
    input.max_rate_cents !== undefined &&
    input.min_rate_cents > input.max_rate_cents
  ) {
    throw new Error('INVALID_RATE_ORDER');
  }

  const existing = await getPolicy(practitionerId);

  if (existing) {
    // Validate spots_total not below spots_filled
    if (
      input.spots_total !== undefined &&
      input.spots_total < existing.spots_filled
    ) {
      throw new Error('SPOTS_BELOW_FILLED');
    }

    // Update
    const result = await query<SlidingScalePolicy>(
      `UPDATE sliding_scale_policies SET
        is_enabled = COALESCE($2, is_enabled),
        public_label = COALESCE($3, public_label),
        public_description = COALESCE($4, public_description),
        min_rate_cents = COALESCE($5, min_rate_cents),
        max_rate_cents = COALESCE($6, max_rate_cents),
        session_length_minutes = COALESCE($7, session_length_minutes),
        currency = COALESCE($8, currency),
        spots_total = COALESCE($9, spots_total),
        request_form_enabled = COALESCE($10, request_form_enabled),
        auto_close_when_full = COALESCE($11, auto_close_when_full),
        intake_prompt = COALESCE($12, intake_prompt)
      WHERE practitioner_id = $1
      RETURNING *`,
      [
        practitionerId,
        input.is_enabled ?? null,
        input.public_label ?? null,
        input.public_description ?? null,
        input.min_rate_cents ?? null,
        input.max_rate_cents ?? null,
        input.session_length_minutes ?? null,
        input.currency ?? null,
        input.spots_total ?? null,
        input.request_form_enabled ?? null,
        input.auto_close_when_full ?? null,
        input.intake_prompt ?? null,
      ]
    );
    return result.rows[0];
  } else {
    // Create
    const result = await query<SlidingScalePolicy>(
      `INSERT INTO sliding_scale_policies (
        practitioner_id,
        is_enabled,
        public_label,
        public_description,
        min_rate_cents,
        max_rate_cents,
        session_length_minutes,
        currency,
        spots_total,
        request_form_enabled,
        auto_close_when_full,
        intake_prompt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        practitionerId,
        input.is_enabled ?? false,
        input.public_label ?? 'Sliding scale availability',
        input.public_description ?? null,
        input.min_rate_cents ?? 0,
        input.max_rate_cents ?? 0,
        input.session_length_minutes ?? 60,
        input.currency ?? 'USD',
        input.spots_total ?? 0,
        input.request_form_enabled ?? true,
        input.auto_close_when_full ?? true,
        input.intake_prompt ??
          'If cost is a barrier, share what feels sustainable right now—briefly is fine.',
      ]
    );
    return result.rows[0];
  }
}

/**
 * Get public-facing policy info for a portal
 */
export async function getPublicPolicy(
  practitionerId: string
): Promise<{
  is_enabled: boolean;
  public_label: string | null;
  public_description: string | null;
  min_rate_cents: number;
  max_rate_cents: number;
  currency: string;
  spots_available: number;
  intake_prompt: string | null;
  request_form_enabled: boolean;
} | null> {
  const result = await query<SlidingScalePolicy>(
    `SELECT * FROM sliding_scale_policies WHERE practitioner_id = $1`,
    [practitionerId]
  );
  const policy = result.rows[0];

  if (!policy) return null;

  return {
    is_enabled: policy.is_enabled,
    public_label: policy.public_label,
    public_description: policy.public_description,
    min_rate_cents: policy.min_rate_cents,
    max_rate_cents: policy.max_rate_cents,
    currency: policy.currency,
    spots_available: Math.max(0, policy.spots_total - policy.spots_filled),
    intake_prompt: policy.intake_prompt,
    request_form_enabled: policy.request_form_enabled,
  };
}

// =============================================================================
// REQUEST OPERATIONS
// =============================================================================

/**
 * List requests for a practitioner
 */
export async function listRequests(
  practitionerId: string,
  options: {
    status?: 'pending' | 'approved' | 'declined' | 'withdrawn' | 'expired';
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ requests: SlidingScaleRequest[]; total: number }> {
  const { status, limit = 50, offset = 0 } = options;

  let whereClause = 'WHERE practitioner_id = $1';
  const params: (string | number)[] = [practitionerId];

  if (status) {
    params.push(status);
    whereClause += ` AND status = $${params.length}`;
  }

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM sliding_scale_requests ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.count || '0', 10);

  // Get requests
  params.push(limit, offset);
  const result = await query<SlidingScaleRequest>(
    `SELECT * FROM sliding_scale_requests
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { requests: result.rows, total };
}

/**
 * Get pending request counts for a practitioner
 */
export async function getPendingCount(practitionerId: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM sliding_scale_requests
     WHERE practitioner_id = $1 AND status = 'pending'`,
    [practitionerId]
  );
  return parseInt(result.rows[0]?.count || '0', 10);
}

/**
 * Get a specific request
 */
export async function getRequest(
  requestId: string
): Promise<SlidingScaleRequest | null> {
  const result = await query<SlidingScaleRequest>(
    `SELECT * FROM sliding_scale_requests WHERE id = $1`,
    [requestId]
  );
  return result.rows[0] || null;
}

/**
 * Create a new request (from portal)
 */
export async function createRequest(
  practitionerId: string,
  input: RequestInput
): Promise<SlidingScaleRequest> {
  // Check if policy is enabled and accepting requests
  const policy = await getPolicy(practitionerId);

  if (!policy || !policy.is_enabled) {
    throw new Error('POLICY_DISABLED');
  }

  if (!policy.request_form_enabled) {
    throw new Error('FORM_DISABLED');
  }

  // Check capacity
  if (
    policy.auto_close_when_full &&
    policy.spots_filled >= policy.spots_total
  ) {
    throw new Error('CAPACITY_FULL');
  }

  const result = await query<SlidingScaleRequest>(
    `INSERT INTO sliding_scale_requests (
      practitioner_id,
      client_id,
      portal_token_id,
      client_email,
      client_name,
      requested_rate_cents,
      preferred_range_min_cents,
      preferred_range_max_cents,
      message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      practitionerId,
      input.client_id ?? null,
      input.portal_token_id ?? null,
      input.client_email ?? null,
      input.client_name ?? null,
      input.requested_rate_cents ?? null,
      input.preferred_range_min_cents ?? null,
      input.preferred_range_max_cents ?? null,
      input.message ?? null,
    ]
  );

  return result.rows[0];
}

/**
 * Decide on a request (approve or decline)
 */
export async function decideRequest(
  requestId: string,
  reviewerId: string,
  input: DecisionInput
): Promise<{
  request: SlidingScaleRequest;
  award?: SlidingScaleAward;
}> {
  // Get the request
  const request = await getRequest(requestId);
  if (!request) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  // Check if already decided
  if (request.status !== 'pending') {
    throw new Error('ALREADY_DECIDED');
  }

  // Verify the reviewer owns this request
  if (request.practitioner_id !== reviewerId) {
    throw new Error('OWNERSHIP_MISMATCH');
  }

  if (input.decision === 'decline') {
    // Decline: just update status
    const result = await query<SlidingScaleRequest>(
      `UPDATE sliding_scale_requests
       SET status = 'declined',
           decision_note = $2,
           reviewed_at = NOW(),
           reviewed_by = $3
       WHERE id = $1
       RETURNING *`,
      [requestId, input.decision_note ?? null, reviewerId]
    );
    return { request: result.rows[0] };
  }

  // Approve: need rate and capacity check
  if (input.approved_rate_cents === undefined) {
    throw new Error('RATE_REQUIRED');
  }

  // Get policy for bounds check
  const policy = await getPolicy(reviewerId);
  if (!policy) {
    throw new Error('NO_POLICY');
  }

  // Validate rate is within bounds
  if (
    input.approved_rate_cents < policy.min_rate_cents ||
    input.approved_rate_cents > policy.max_rate_cents
  ) {
    throw new Error('RATE_OUT_OF_BOUNDS');
  }

  // Check capacity
  if (
    policy.auto_close_when_full &&
    policy.spots_filled >= policy.spots_total
  ) {
    throw new Error('CAPACITY_FULL');
  }

  // Transaction: update request, create award, increment spots_filled
  // Using a simple approach since we don't have transaction support
  // In production, wrap this in a proper transaction

  // 1. Update request
  const requestResult = await query<SlidingScaleRequest>(
    `UPDATE sliding_scale_requests
     SET status = 'approved',
         decision_note = $2,
         reviewed_at = NOW(),
         reviewed_by = $3
     WHERE id = $1
     RETURNING *`,
    [requestId, input.decision_note ?? null, reviewerId]
  );

  // 2. Create award
  const awardResult = await query<SlidingScaleAward>(
    `INSERT INTO sliding_scale_awards (
      practitioner_id,
      request_id,
      client_id,
      rate_cents
    ) VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [reviewerId, requestId, request.client_id, input.approved_rate_cents]
  );

  // 3. Increment spots_filled
  await query(
    `UPDATE sliding_scale_policies
     SET spots_filled = spots_filled + 1
     WHERE practitioner_id = $1`,
    [reviewerId]
  );

  return {
    request: requestResult.rows[0],
    award: awardResult.rows[0],
  };
}

// =============================================================================
// AWARD OPERATIONS
// =============================================================================

/**
 * List active awards for a practitioner
 */
export async function listAwards(
  practitionerId: string,
  options: {
    status?: 'active' | 'paused' | 'ended';
    limit?: number;
  } = {}
): Promise<SlidingScaleAward[]> {
  const { status = 'active', limit = 100 } = options;

  const result = await query<SlidingScaleAward>(
    `SELECT * FROM sliding_scale_awards
     WHERE practitioner_id = $1 AND status = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [practitionerId, status, limit]
  );

  return result.rows;
}

/**
 * Get a specific award
 */
export async function getAward(awardId: string): Promise<SlidingScaleAward | null> {
  const result = await query<SlidingScaleAward>(
    `SELECT * FROM sliding_scale_awards WHERE id = $1`,
    [awardId]
  );
  return result.rows[0] || null;
}

/**
 * End an award
 */
export async function endAward(
  awardId: string,
  practitionerId: string
): Promise<SlidingScaleAward> {
  // Get the award
  const award = await getAward(awardId);
  if (!award) {
    throw new Error('AWARD_NOT_FOUND');
  }

  // Verify ownership
  if (award.practitioner_id !== practitionerId) {
    throw new Error('OWNERSHIP_MISMATCH');
  }

  // Check if already ended
  if (award.status === 'ended') {
    throw new Error('ALREADY_ENDED');
  }

  // Transaction: update award, decrement spots_filled
  const result = await query<SlidingScaleAward>(
    `UPDATE sliding_scale_awards
     SET status = 'ended',
         ends_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [awardId]
  );

  // Decrement spots_filled (ensure it doesn't go negative)
  await query(
    `UPDATE sliding_scale_policies
     SET spots_filled = GREATEST(0, spots_filled - 1)
     WHERE practitioner_id = $1`,
    [practitionerId]
  );

  return result.rows[0];
}

/**
 * Get counts for dashboard display
 */
export async function getDashboardCounts(
  practitionerId: string
): Promise<{
  pending_requests: number;
  active_awards: number;
  spots_available: number;
}> {
  const [pendingResult, activeResult, policyResult] = await Promise.all([
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM sliding_scale_requests
       WHERE practitioner_id = $1 AND status = 'pending'`,
      [practitionerId]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM sliding_scale_awards
       WHERE practitioner_id = $1 AND status = 'active'`,
      [practitionerId]
    ),
    getPolicy(practitionerId),
  ]);

  const pending = parseInt(pendingResult.rows[0]?.count || '0', 10);
  const active = parseInt(activeResult.rows[0]?.count || '0', 10);
  const spots = policyResult
    ? Math.max(0, policyResult.spots_total - policyResult.spots_filled)
    : 0;

  return {
    pending_requests: pending,
    active_awards: active,
    spots_available: spots,
  };
}
