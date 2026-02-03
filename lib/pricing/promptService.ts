/**
 * Upgrade Prompt Service
 *
 * Handles recording and retrieving upgrade prompts.
 * Philosophy: Track enough to be helpful, not enough to be creepy.
 */

import { query } from '@/lib/db/postgres';
import {
  ThresholdResult,
  PromptType,
  shouldPromptStudioUpgrade,
  shouldPromptSupporter,
  checkFeatureGate,
  ThresholdContext,
  PractitionerTier,
  COOLDOWN_DAYS,
} from './thresholds';

// ============================================
// Types
// ============================================

export interface PromptRecord {
  id: string;
  memberId: string;
  promptType: PromptType;
  promptTrigger: string;
  promptContext: Record<string, unknown>;
  response: string | null;
  responseAt: Date | null;
  shownAt: Date;
  cooldownUntil: Date | null;
}

export interface UsageMetrics {
  sessionsThisMonth: number;
  activeClients: number;
  monthsActive: number;
  revenueThisMonth: number;
  journalEntriesThisMonth: number;
  conversationsThisMonth: number;
  daysActive: number;
}

// ============================================
// Prompt Recording
// ============================================

/**
 * Record that a prompt was shown to a user
 */
export async function recordPromptShown(
  memberId: string,
  result: ThresholdResult
): Promise<string> {
  const res = await query(
    `INSERT INTO upgrade_prompts (member_id, prompt_type, prompt_trigger, prompt_context, shown_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id`,
    [memberId, result.promptType, result.trigger, { message: result.message, softLimit: result.softLimit }]
  );
  return res.rows[0].id;
}

/**
 * Record user's response to a prompt
 */
export async function recordPromptResponse(
  promptId: string,
  response: 'upgraded' | 'dismissed' | 'later' | 'not_interested'
): Promise<void> {
  // Calculate cooldown based on response
  let cooldownDays: number = COOLDOWN_DAYS.after_show;
  if (response === 'dismissed' || response === 'later') {
    cooldownDays = COOLDOWN_DAYS.after_dismiss;
  } else if (response === 'not_interested') {
    cooldownDays = COOLDOWN_DAYS.after_not_interested;
  }

  await query(
    `UPDATE upgrade_prompts
     SET response = $1,
         response_at = NOW(),
         cooldown_until = NOW() + INTERVAL '${cooldownDays} days'
     WHERE id = $2`,
    [response, promptId]
  );
}

/**
 * Get the most recent prompt of a given type for a user
 */
export async function getLastPrompt(
  memberId: string,
  promptType?: PromptType
): Promise<PromptRecord | null> {
  let sql = `
    SELECT id, member_id, prompt_type, prompt_trigger, prompt_context,
           response, response_at, shown_at, cooldown_until
    FROM upgrade_prompts
    WHERE member_id = $1
  `;
  const params: (string | PromptType)[] = [memberId];

  if (promptType) {
    sql += ` AND prompt_type = $2`;
    params.push(promptType);
  }

  sql += ` ORDER BY shown_at DESC LIMIT 1`;

  const res = await query(sql, params);
  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    id: row.id,
    memberId: row.member_id,
    promptType: row.prompt_type,
    promptTrigger: row.prompt_trigger,
    promptContext: row.prompt_context,
    response: row.response,
    responseAt: row.response_at ? new Date(row.response_at) : null,
    shownAt: new Date(row.shown_at),
    cooldownUntil: row.cooldown_until ? new Date(row.cooldown_until) : null,
  };
}

/**
 * Check if user is currently in cooldown for prompts
 */
export async function isInCooldown(memberId: string): Promise<boolean> {
  const res = await query(
    `SELECT 1 FROM upgrade_prompts
     WHERE member_id = $1
     AND cooldown_until > NOW()
     LIMIT 1`,
    [memberId]
  );
  return res.rows.length > 0;
}

// ============================================
// Usage Metrics
// ============================================

/**
 * Get current usage metrics for a member
 */
export async function getUsageMetrics(memberId: string): Promise<UsageMetrics> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Practitioner metrics
  const practitionerRes = await query(
    `SELECT
       COALESCE(SUM(sessions_completed), 0) as sessions,
       COALESCE(MAX(active_clients), 0) as clients,
       COALESCE(SUM(revenue_cents), 0) as revenue
     FROM practitioner_usage_metrics
     WHERE member_id = $1
     AND period_start >= $2`,
    [memberId, monthStart]
  );

  // Member metrics
  const memberRes = await query(
    `SELECT
       COALESCE(SUM(journal_entries), 0) as journals,
       COALESCE(SUM(conversations_count), 0) as conversations
     FROM member_usage_metrics
     WHERE member_id = $1
     AND period_start >= $2`,
    [memberId, monthStart]
  );

  // Account age
  const ageRes = await query(
    `SELECT created_at FROM members WHERE id = $1`,
    [memberId]
  );

  const createdAt = ageRes.rows[0]?.created_at ? new Date(ageRes.rows[0].created_at) : now;
  const daysActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const monthsActive = Math.floor(daysActive / 30);

  return {
    sessionsThisMonth: parseInt(practitionerRes.rows[0]?.sessions || '0'),
    activeClients: parseInt(practitionerRes.rows[0]?.clients || '0'),
    monthsActive,
    revenueThisMonth: parseInt(practitionerRes.rows[0]?.revenue || '0'),
    journalEntriesThisMonth: parseInt(memberRes.rows[0]?.journals || '0'),
    conversationsThisMonth: parseInt(memberRes.rows[0]?.conversations || '0'),
    daysActive,
  };
}

/**
 * Increment a usage metric
 */
export async function incrementUsageMetric(
  memberId: string,
  metric: keyof UsageMetrics,
  amount: number = 1
): Promise<void> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const practitionerMetrics = ['sessionsThisMonth', 'activeClients', 'revenueThisMonth'];
  const memberMetrics = ['journalEntriesThisMonth', 'conversationsThisMonth'];

  const columnMap: Record<string, string> = {
    sessionsThisMonth: 'sessions_completed',
    activeClients: 'active_clients',
    revenueThisMonth: 'revenue_cents',
    journalEntriesThisMonth: 'journal_entries',
    conversationsThisMonth: 'conversations_count',
  };

  const column = columnMap[metric];
  if (!column) return;

  if (practitionerMetrics.includes(metric)) {
    await query(
      `INSERT INTO practitioner_usage_metrics (member_id, period_start, period_end, ${column})
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (member_id, period_start, period_end)
       DO UPDATE SET ${column} = practitioner_usage_metrics.${column} + $4`,
      [memberId, periodStart, periodEnd, amount]
    );
  } else if (memberMetrics.includes(metric)) {
    await query(
      `INSERT INTO member_usage_metrics (member_id, period_start, period_end, ${column})
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (member_id, period_start, period_end)
       DO UPDATE SET ${column} = member_usage_metrics.${column} + $4`,
      [memberId, periodStart, periodEnd, amount]
    );
  }
}

// ============================================
// Main Detection Function
// ============================================

/**
 * Check if a user should see an upgrade prompt
 *
 * This is the main entry point for threshold detection.
 * Call this when:
 * - User opens dashboard
 * - User completes a session
 * - User accesses a potentially gated feature
 */
export async function checkForUpgradePrompt(
  memberId: string,
  practitionerTier: PractitionerTier,
  supporterSince: Date | null,
  attemptedFeature?: string
): Promise<ThresholdResult | null> {
  // Check cooldown first
  if (await isInCooldown(memberId)) {
    return null;
  }

  // Check feature gate first (most specific)
  if (attemptedFeature) {
    const featureResult = checkFeatureGate(attemptedFeature, practitionerTier, supporterSince);
    if (featureResult) return featureResult;
  }

  // Get usage metrics
  const metrics = await getUsageMetrics(memberId);

  // Get last prompt info
  const lastPrompt = await getLastPrompt(memberId);
  const lastPromptAt = lastPrompt?.shownAt || null;
  const lastResponse = lastPrompt?.response || null;

  const context: ThresholdContext = {
    sessionsThisMonth: metrics.sessionsThisMonth,
    activeClients: metrics.activeClients,
    monthsActive: metrics.monthsActive,
    revenueThisMonth: metrics.revenueThisMonth,
    journalEntriesThisMonth: metrics.journalEntriesThisMonth,
    conversationsThisMonth: metrics.conversationsThisMonth,
    daysActive: metrics.daysActive,
  };

  // Check practitioner upgrade (Earn → Studio)
  if (practitionerTier === 'earn') {
    const studioResult = shouldPromptStudioUpgrade(practitionerTier, context, lastPromptAt, lastResponse);
    if (studioResult) return studioResult;
  }

  // Check member upgrade (Free → Supporter)
  if (!supporterSince && !practitionerTier) {
    const supporterResult = shouldPromptSupporter(supporterSince, context, lastPromptAt, lastResponse);
    if (supporterResult) return supporterResult;
  }

  return null;
}
