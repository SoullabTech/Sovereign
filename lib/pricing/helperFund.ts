/**
 * Helper Fund Service
 *
 * Manages the Helper Fund - scholarships for emerging practitioners
 * and contributions from thriving practitioners.
 *
 * Philosophy:
 * - Stewardship flows in both directions
 * - Those with capacity support those building it
 * - Dignity preserved - no public markers, no shame
 */

import { query } from '@/lib/db/postgres';

// ============================================
// Types
// ============================================

export interface HelperFundApplication {
  id: string;
  memberId: string;
  situation: string;
  durationRequested: '3_months' | '6_months' | 'ongoing';
  supportType: 'waived' | 'reduced' | 'full_scholarship';
  status: 'pending' | 'approved' | 'declined' | 'expired';
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  scholarshipStart: Date | null;
  scholarshipEnd: Date | null;
  submittedAt: Date;
}

export interface HelperFundContribution {
  id: string;
  memberId: string;
  amountCents: number;
  currency: string;
  source: 'practitioner' | 'client_roundup' | 'direct';
  isRecurring: boolean;
  status: 'active' | 'paused' | 'cancelled';
  pausedUntil: Date | null;
  createdAt: Date;
}

export interface HelperFundStats {
  activeContributors: number;
  monthlyContributionsCents: number;
  activeScholarships: number;
  pendingApplications: number;
  totalDistributedCents: number;
}

// ============================================
// Applications
// ============================================

/**
 * Submit a Helper Fund scholarship application
 */
export async function submitHelperFundApplication(
  memberId: string,
  situation: string,
  durationRequested: '3_months' | '6_months' | 'ongoing',
  supportType: 'waived' | 'reduced' | 'full_scholarship'
): Promise<string> {
  const res = await query(
    `INSERT INTO helper_fund_applications
     (member_id, situation, duration_requested, support_type, status, submitted_at)
     VALUES ($1, $2, $3, $4, 'pending', NOW())
     RETURNING id`,
    [memberId, situation, durationRequested, supportType]
  );
  return res.rows[0].id;
}

/**
 * Get application status for a member
 */
export async function getApplicationStatus(
  memberId: string
): Promise<HelperFundApplication | null> {
  const res = await query(
    `SELECT id, member_id, situation, duration_requested, support_type,
            status, reviewed_by, reviewed_at, review_notes,
            scholarship_start, scholarship_end, submitted_at
     FROM helper_fund_applications
     WHERE member_id = $1
     ORDER BY submitted_at DESC
     LIMIT 1`,
    [memberId]
  );

  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    id: row.id,
    memberId: row.member_id,
    situation: row.situation,
    durationRequested: row.duration_requested,
    supportType: row.support_type,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
    reviewNotes: row.review_notes,
    scholarshipStart: row.scholarship_start ? new Date(row.scholarship_start) : null,
    scholarshipEnd: row.scholarship_end ? new Date(row.scholarship_end) : null,
    submittedAt: new Date(row.submitted_at),
  };
}

/**
 * Approve a Helper Fund application (admin only)
 */
export async function approveApplication(
  applicationId: string,
  reviewerId: string,
  durationMonths: number,
  notes?: string
): Promise<void> {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + durationMonths);

  await query(
    `UPDATE helper_fund_applications
     SET status = 'approved',
         reviewed_by = $1,
         reviewed_at = NOW(),
         review_notes = $2,
         scholarship_start = $3,
         scholarship_end = $4
     WHERE id = $5`,
    [reviewerId, notes || null, startDate, endDate, applicationId]
  );
}

/**
 * Decline a Helper Fund application (admin only)
 */
export async function declineApplication(
  applicationId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  await query(
    `UPDATE helper_fund_applications
     SET status = 'declined',
         reviewed_by = $1,
         reviewed_at = NOW(),
         review_notes = $2
     WHERE id = $3`,
    [reviewerId, notes || null, applicationId]
  );
}

/**
 * Check if member has active scholarship
 */
export async function hasActiveScholarship(memberId: string): Promise<boolean> {
  const res = await query(
    `SELECT 1 FROM helper_fund_applications
     WHERE member_id = $1
     AND status = 'approved'
     AND scholarship_end > NOW()
     LIMIT 1`,
    [memberId]
  );
  return res.rows.length > 0;
}

// ============================================
// Contributions
// ============================================

/**
 * Create a new Helper Fund contribution
 */
export async function createContribution(
  memberId: string,
  amountCents: number,
  source: 'practitioner' | 'client_roundup' | 'direct',
  isRecurring: boolean,
  stripePaymentId?: string,
  stripeSubscriptionId?: string
): Promise<string> {
  const res = await query(
    `INSERT INTO helper_fund_contributions
     (member_id, amount_cents, currency, source, is_recurring, stripe_payment_id, stripe_subscription_id, status)
     VALUES ($1, $2, 'USD', $3, $4, $5, $6, 'active')
     RETURNING id`,
    [memberId, amountCents, source, isRecurring, stripePaymentId || null, stripeSubscriptionId || null]
  );
  return res.rows[0].id;
}

/**
 * Pause a recurring contribution
 */
export async function pauseContribution(
  contributionId: string,
  pauseDays: number
): Promise<void> {
  const pauseUntil = new Date();
  pauseUntil.setDate(pauseUntil.getDate() + pauseDays);

  await query(
    `UPDATE helper_fund_contributions
     SET status = 'paused',
         paused_until = $1
     WHERE id = $2`,
    [pauseUntil, contributionId]
  );
}

/**
 * Cancel a contribution
 */
export async function cancelContribution(contributionId: string): Promise<void> {
  await query(
    `UPDATE helper_fund_contributions
     SET status = 'cancelled',
         cancelled_at = NOW()
     WHERE id = $1`,
    [contributionId]
  );
}

/**
 * Get member's active contribution
 */
export async function getMemberContribution(
  memberId: string
): Promise<HelperFundContribution | null> {
  const res = await query(
    `SELECT id, member_id, amount_cents, currency, source,
            is_recurring, status, paused_until, created_at
     FROM helper_fund_contributions
     WHERE member_id = $1
     AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`,
    [memberId]
  );

  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    id: row.id,
    memberId: row.member_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    source: row.source,
    isRecurring: row.is_recurring,
    status: row.status,
    pausedUntil: row.paused_until ? new Date(row.paused_until) : null,
    createdAt: new Date(row.created_at),
  };
}

// ============================================
// Statistics
// ============================================

/**
 * Get Helper Fund statistics (for public page)
 */
export async function getHelperFundStats(): Promise<HelperFundStats> {
  // Active contributors
  const contributorsRes = await query(
    `SELECT COUNT(DISTINCT member_id) as count
     FROM helper_fund_contributions
     WHERE status = 'active'`
  );

  // Monthly contributions (current month)
  const monthlyRes = await query(
    `SELECT COALESCE(SUM(amount_cents), 0) as total
     FROM helper_fund_contributions
     WHERE status = 'active'
     AND is_recurring = true`
  );

  // Active scholarships
  const scholarshipsRes = await query(
    `SELECT COUNT(*) as count
     FROM helper_fund_applications
     WHERE status = 'approved'
     AND scholarship_end > NOW()`
  );

  // Pending applications
  const pendingRes = await query(
    `SELECT COUNT(*) as count
     FROM helper_fund_applications
     WHERE status = 'pending'`
  );

  // Total distributed (all time)
  const distributedRes = await query(
    `SELECT COUNT(*) * 3500 as total
     FROM helper_fund_applications
     WHERE status = 'approved'`
    // Rough estimate: each scholarship ≈ $35 Studio fee
  );

  return {
    activeContributors: parseInt(contributorsRes.rows[0]?.count || '0'),
    monthlyContributionsCents: parseInt(monthlyRes.rows[0]?.total || '0'),
    activeScholarships: parseInt(scholarshipsRes.rows[0]?.count || '0'),
    pendingApplications: parseInt(pendingRes.rows[0]?.count || '0'),
    totalDistributedCents: parseInt(distributedRes.rows[0]?.total || '0'),
  };
}
