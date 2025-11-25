/**
 * Quota Service
 *
 * Handles usage tracking, quota enforcement, and cost monitoring.
 * Ensures fair usage across tier levels and prevents abuse.
 *
 * @module lib/services/quota-service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  UserQuota,
  UsageLogEntry,
  SystemUsageSummary,
  UserTier,
  QuotaCheckResult,
  RequestType,
} from '../types';
import { calculateCost, TIER_CONFIGS } from '../types/usage-tracking';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

// ============================================================================
// QUOTA CREATION & RETRIEVAL
// ============================================================================

/**
 * Create a new user quota with tier defaults
 */
export async function createUserQuota(
  userId: string,
  userName: string,
  tier: UserTier = 'beta'
): Promise<UserQuota> {
  const supabase = getSupabase();
  const config = TIER_CONFIGS[tier];

  const { data, error } = await supabase
    .from('user_usage_quotas')
    .insert({
      user_id: userId,
      user_name: userName,
      user_tier: tier,
      daily_message_limit: config.dailyMessageLimit,
      daily_token_limit: config.dailyTokenLimit,
      daily_cost_limit_cents: config.dailyCostLimitCents,
      requests_per_minute: config.requestsPerMinute,
      requests_per_hour: config.requestsPerHour,
      current_daily_messages: 0,
      current_daily_tokens: 0,
      current_daily_cost_cents: 0,
      last_reset_at: new Date().toISOString(),
      is_active: true,
      is_blocked: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user quota: ${error.message}`);
  }

  return mapDbQuotaToType(data);
}

/**
 * Get user quota (creates with default tier if doesn't exist)
 */
export async function getUserQuota(userId: string): Promise<UserQuota> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_usage_quotas')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get user quota: ${error.message}`);
  }

  // If quota doesn't exist, create it
  if (!data) {
    return createUserQuota(userId, 'Unknown User', 'beta');
  }

  return mapDbQuotaToType(data);
}

/**
 * Get all user quotas (for admin dashboard)
 */
export async function getAllQuotas(): Promise<UserQuota[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_usage_quotas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get all quotas: ${error.message}`);
  }

  return data.map(mapDbQuotaToType);
}

// ============================================================================
// QUOTA UPDATES
// ============================================================================

/**
 * Update user tier (and adjust limits accordingly)
 */
export async function updateUserTier(
  userId: string,
  newTier: UserTier
): Promise<UserQuota> {
  const supabase = getSupabase();
  const config = TIER_CONFIGS[newTier];

  const { data, error } = await supabase
    .from('user_usage_quotas')
    .update({
      user_tier: newTier,
      daily_message_limit: config.dailyMessageLimit,
      daily_token_limit: config.dailyTokenLimit,
      daily_cost_limit_cents: config.dailyCostLimitCents,
      requests_per_minute: config.requestsPerMinute,
      requests_per_hour: config.requestsPerHour,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user tier: ${error.message}`);
  }

  return mapDbQuotaToType(data);
}

/**
 * Block a user
 */
export async function blockUser(
  userId: string,
  reason: string
): Promise<UserQuota> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_usage_quotas')
    .update({
      is_blocked: true,
      block_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to block user: ${error.message}`);
  }

  return mapDbQuotaToType(data);
}

/**
 * Unblock a user
 */
export async function unblockUser(userId: string): Promise<UserQuota> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_usage_quotas')
    .update({
      is_blocked: false,
      block_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to unblock user: ${error.message}`);
  }

  return mapDbQuotaToType(data);
}

// ============================================================================
// QUOTA CHECKING & ENFORCEMENT
// ============================================================================

/**
 * Check if a user can make a request
 * Returns allowed: true/false with reason if denied
 */
export async function checkQuota(userId: string): Promise<QuotaCheckResult> {
  const quota = await getUserQuota(userId);

  // Check if user is blocked
  if (quota.isBlocked) {
    return {
      allowed: false,
      reason: `User is blocked: ${quota.blockReason}`,
      quota,
    };
  }

  // Check if user is active
  if (!quota.isActive) {
    return {
      allowed: false,
      reason: 'User account is inactive',
      quota,
    };
  }

  // Reset quota if new day
  await resetQuotaIfNeeded(userId, quota);

  // Re-fetch quota after potential reset
  const currentQuota = await getUserQuota(userId);

  // Check daily message limit
  if (currentQuota.currentDailyMessages >= currentQuota.dailyMessageLimit) {
    return {
      allowed: false,
      reason: 'Daily message limit exceeded',
      quota: currentQuota,
      remaining: {
        messages: 0,
        tokens: currentQuota.dailyTokenLimit - currentQuota.currentDailyTokens,
        costCents: currentQuota.dailyCostLimitCents - currentQuota.currentDailyCostCents,
      },
    };
  }

  // Check daily token limit
  if (currentQuota.currentDailyTokens >= currentQuota.dailyTokenLimit) {
    return {
      allowed: false,
      reason: 'Daily token limit exceeded',
      quota: currentQuota,
      remaining: {
        messages: currentQuota.dailyMessageLimit - currentQuota.currentDailyMessages,
        tokens: 0,
        costCents: currentQuota.dailyCostLimitCents - currentQuota.currentDailyCostCents,
      },
    };
  }

  // Check daily cost limit
  if (currentQuota.currentDailyCostCents >= currentQuota.dailyCostLimitCents) {
    return {
      allowed: false,
      reason: 'Daily cost limit exceeded',
      quota: currentQuota,
      remaining: {
        messages: currentQuota.dailyMessageLimit - currentQuota.currentDailyMessages,
        tokens: currentQuota.dailyTokenLimit - currentQuota.currentDailyTokens,
        costCents: 0,
      },
    };
  }

  // All checks passed
  return {
    allowed: true,
    quota: currentQuota,
    remaining: {
      messages: currentQuota.dailyMessageLimit - currentQuota.currentDailyMessages,
      tokens: currentQuota.dailyTokenLimit - currentQuota.currentDailyTokens,
      costCents: currentQuota.dailyCostLimitCents - currentQuota.currentDailyCostCents,
    },
  };
}

/**
 * Reset quota if it's a new day
 */
async function resetQuotaIfNeeded(userId: string, quota: UserQuota): Promise<void> {
  const lastReset = new Date(quota.lastResetAt);
  const now = new Date();

  // Check if it's a new day (UTC)
  if (
    lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
    lastReset.getUTCMonth() !== now.getUTCMonth() ||
    lastReset.getUTCDate() !== now.getUTCDate()
  ) {
    await resetDailyQuota(userId);
  }
}

/**
 * Manually reset daily quota for a user
 */
export async function resetDailyQuota(userId: string): Promise<UserQuota> {
  const supabase = getSupabase();

  const { data, error} = await supabase
    .from('user_usage_quotas')
    .update({
      current_daily_messages: 0,
      current_daily_tokens: 0,
      current_daily_cost_cents: 0,
      last_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to reset daily quota: ${error.message}`);
  }

  return mapDbQuotaToType(data);
}

// ============================================================================
// USAGE LOGGING
// ============================================================================

export interface LogUsageParams {
  userId: string;
  userName?: string;
  endpoint: string;
  requestType: RequestType;
  inputTokens: number;
  outputTokens: number;
  responseTimeMs: number;
  modelUsed: string;
  isVoiceMode?: boolean;
  fieldDepth?: number;
  success?: boolean;
  errorMessage?: string;
  errorType?: string;
}

/**
 * Log a usage entry and update quota
 */
export async function logUsage(params: LogUsageParams): Promise<UsageLogEntry> {
  const supabase = getSupabase();

  // Calculate costs
  const cost = calculateCost(params.inputTokens, params.outputTokens);

  // Insert usage log
  const { data, error } = await supabase
    .from('user_usage_logs')
    .insert({
      user_id: params.userId,
      user_name: params.userName,
      endpoint: params.endpoint,
      request_type: params.requestType,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      input_cost: cost.inputCost,
      output_cost: cost.outputCost,
      response_time_ms: params.responseTimeMs,
      model_used: params.modelUsed,
      is_voice_mode: params.isVoiceMode || false,
      field_depth: params.fieldDepth,
      success: params.success !== false,
      error_message: params.errorMessage,
      error_type: params.errorType,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log usage: ${error.message}`);
  }

  // Update quota current usage
  await updateQuotaUsage(
    params.userId,
    1, // 1 message
    params.inputTokens + params.outputTokens,
    cost.totalCost
  );

  return mapDbUsageLogToType(data);
}

/**
 * Update quota current usage
 */
async function updateQuotaUsage(
  userId: string,
  messageCount: number,
  tokenCount: number,
  costCents: number
): Promise<void> {
  const supabase = getSupabase();

  await supabase.rpc('increment_quota_usage', {
    p_user_id: userId,
    p_message_count: messageCount,
    p_token_count: tokenCount,
    p_cost_cents: costCents,
  });

  // If RPC doesn't exist, do it manually
  const quota = await getUserQuota(userId);
  const { error } = await supabase
    .from('user_usage_quotas')
    .update({
      current_daily_messages: quota.currentDailyMessages + messageCount,
      current_daily_tokens: quota.currentDailyTokens + tokenCount,
      current_daily_cost_cents: quota.currentDailyCostCents + costCents,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update quota usage:', error);
  }
}

/**
 * Get usage logs for a user
 */
export async function getUserUsageLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<UsageLogEntry[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('user_usage_logs')
    .select('*')
    .eq('user_id', userId);

  if (options?.startDate) {
    query = query.gte('created_at', options.startDate.toISOString());
  }

  if (options?.endDate) {
    query = query.lte('created_at', options.endDate.toISOString());
  }

  query = query.order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get user usage logs: ${error.message}`);
  }

  return data.map(mapDbUsageLogToType);
}

// ============================================================================
// SYSTEM ANALYTICS
// ============================================================================

/**
 * Update system usage summary for a date
 */
export async function updateSystemSummary(date: Date): Promise<void> {
  const supabase = getSupabase();

  await supabase.rpc('update_system_summary', {
    target_date: date.toISOString().split('T')[0], // Just the date part
  });
}

/**
 * Get system usage summary for a date
 */
export async function getSystemSummary(date: Date): Promise<SystemUsageSummary | null> {
  const supabase = getSupabase();

  const dateStr = date.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('system_usage_summary')
    .select('*')
    .eq('summary_date', dateStr)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get system summary: ${error.message}`);
  }

  return data ? mapDbSystemSummaryToType(data) : null;
}

/**
 * Get system summaries for a date range
 */
export async function getSystemSummaries(
  startDate: Date,
  endDate: Date
): Promise<SystemUsageSummary[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('system_usage_summary')
    .select('*')
    .gte('summary_date', startDate.toISOString().split('T')[0])
    .lte('summary_date', endDate.toISOString().split('T')[0])
    .order('summary_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to get system summaries: ${error.message}`);
  }

  return data.map(mapDbSystemSummaryToType);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapDbQuotaToType(dbRow: any): UserQuota {
  return {
    id: dbRow.id,
    userId: dbRow.user_id,
    userName: dbRow.user_name,
    userTier: dbRow.user_tier,
    dailyMessageLimit: dbRow.daily_message_limit,
    dailyTokenLimit: dbRow.daily_token_limit,
    dailyCostLimitCents: dbRow.daily_cost_limit_cents,
    requestsPerMinute: dbRow.requests_per_minute,
    requestsPerHour: dbRow.requests_per_hour,
    currentDailyMessages: dbRow.current_daily_messages,
    currentDailyTokens: dbRow.current_daily_tokens,
    currentDailyCostCents: dbRow.current_daily_cost_cents,
    lastResetAt: new Date(dbRow.last_reset_at),
    isActive: dbRow.is_active,
    isBlocked: dbRow.is_blocked,
    blockReason: dbRow.block_reason,
    createdAt: new Date(dbRow.created_at),
    updatedAt: new Date(dbRow.updated_at),
  };
}

function mapDbUsageLogToType(dbRow: any): UsageLogEntry {
  return {
    id: dbRow.id,
    userId: dbRow.user_id,
    userName: dbRow.user_name,
    endpoint: dbRow.endpoint,
    requestType: dbRow.request_type,
    inputTokens: dbRow.input_tokens,
    outputTokens: dbRow.output_tokens,
    totalTokens: dbRow.total_tokens,
    inputCost: dbRow.input_cost,
    outputCost: dbRow.output_cost,
    totalCost: dbRow.total_cost,
    responseTimeMs: dbRow.response_time_ms,
    queueWaitTimeMs: dbRow.queue_wait_time_ms,
    modelUsed: dbRow.model_used,
    isVoiceMode: dbRow.is_voice_mode,
    fieldDepth: dbRow.field_depth,
    success: dbRow.success,
    errorMessage: dbRow.error_message,
    errorType: dbRow.error_type,
    createdAt: new Date(dbRow.created_at),
  };
}

function mapDbSystemSummaryToType(dbRow: any): SystemUsageSummary {
  return {
    id: dbRow.id,
    summaryDate: new Date(dbRow.summary_date),
    totalRequests: dbRow.total_requests,
    successfulRequests: dbRow.successful_requests,
    failedRequests: dbRow.failed_requests,
    totalInputTokens: dbRow.total_input_tokens,
    totalOutputTokens: dbRow.total_output_tokens,
    totalTokens: dbRow.total_tokens,
    totalCostCents: dbRow.total_cost_cents,
    avgResponseTimeMs: dbRow.avg_response_time_ms,
    avgQueueWaitTimeMs: dbRow.avg_queue_wait_time_ms,
    uniqueUsers: dbRow.unique_users,
    newUsers: dbRow.new_users,
    sonnet4Requests: dbRow.sonnet_4_requests,
    otherModelRequests: dbRow.other_model_requests,
    createdAt: new Date(dbRow.created_at),
    updatedAt: new Date(dbRow.updated_at),
  };
}
