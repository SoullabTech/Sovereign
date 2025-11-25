/**
 * Usage Tracking Middleware
 *
 * Logs all API requests to the database for monitoring and rate limiting.
 * Integrates with the Claude queue system to track wait times and costs.
 */

import { createClient } from '@supabase/supabase-js';

interface UsageLogEntry {
  userId: string;
  userName?: string;
  endpoint: string;
  requestType: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  responseTimeMs: number;
  queueWaitTimeMs: number;
  modelUsed: string;
  isVoiceMode: boolean;
  success: boolean;
  errorMessage?: string;
  errorType?: string;
  fieldDepth?: number;
}

interface UserQuota {
  userId: string;
  dailyMessageLimit: number;
  dailyTokenLimit: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  currentDailyMessages: number;
  currentDailyTokens: number;
  currentDailyCostCents: number;
  isBlocked: boolean;
  blockReason?: string;
}

class UsageTracker {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️  [USAGE TRACKER] Supabase credentials missing - usage tracking disabled');
      this.supabase = null;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
  }

  /**
   * Calculate token costs based on Claude Sonnet 4 pricing
   * Input: $3 per 1M tokens = 0.0003 cents per token
   * Output: $15 per 1M tokens = 0.0015 cents per token
   */
  private calculateCost(inputTokens: number, outputTokens: number) {
    const inputCostPerToken = 0.0003; // cents
    const outputCostPerToken = 0.0015; // cents

    return {
      inputCost: inputTokens * inputCostPerToken,
      outputCost: outputTokens * outputCostPerToken,
      totalCost: (inputTokens * inputCostPerToken) + (outputTokens * outputCostPerToken)
    };
  }

  /**
   * Log a request to the database
   */
  async logRequest(entry: UsageLogEntry): Promise<boolean> {
    if (!this.supabase) {
      console.warn('⚠️  [USAGE TRACKER] Supabase not initialized - skipping log');
      return false;
    }

    try {
      const { error } = await this.supabase
        .from('user_usage_logs')
        .insert({
          user_id: entry.userId,
          user_name: entry.userName,
          endpoint: entry.endpoint,
          request_type: entry.requestType,
          input_tokens: entry.inputTokens,
          output_tokens: entry.outputTokens,
          input_cost: entry.inputCost,
          output_cost: entry.outputCost,
          response_time_ms: entry.responseTimeMs,
          queue_wait_time_ms: entry.queueWaitTimeMs,
          model_used: entry.modelUsed,
          is_voice_mode: entry.isVoiceMode,
          field_depth: entry.fieldDepth,
          success: entry.success,
          error_message: entry.errorMessage,
          error_type: entry.errorType,
        });

      if (error) {
        console.error('❌ [USAGE TRACKER] Failed to log request:', error);
        return false;
      }

      // Update user quota counters
      await this.updateUserQuota(
        entry.userId,
        entry.inputTokens + entry.outputTokens,
        entry.inputCost + entry.outputCost
      );

      console.log(`✅ [USAGE TRACKER] Logged request for ${entry.userId}: ${entry.inputTokens + entry.outputTokens} tokens, $${((entry.inputCost + entry.outputCost) / 100).toFixed(4)}`);
      return true;

    } catch (error) {
      console.error('❌ [USAGE TRACKER] Exception logging request:', error);
      return false;
    }
  }

  /**
   * Update user quota counters
   */
  private async updateUserQuota(
    userId: string,
    tokens: number,
    costCents: number
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      // First, ensure the user record exists
      const { data: existing } = await this.supabase
        .from('user_usage_quotas')
        .select('current_daily_messages, current_daily_tokens, current_daily_cost_cents')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existing) {
        // Create new record with initial values
        await this.supabase
          .from('user_usage_quotas')
          .insert({
            user_id: userId,
            user_name: userId,
            user_tier: 'beta',
            daily_message_limit: 100,
            daily_token_limit: 50000,
            daily_cost_limit_cents: 50,
            requests_per_minute: 10,
            requests_per_hour: 100,
            current_daily_messages: 1,
            current_daily_tokens: tokens,
            current_daily_cost_cents: costCents,
            is_active: true,
            is_blocked: false
          });
      } else {
        // Update existing record by incrementing values
        await this.supabase
          .from('user_usage_quotas')
          .update({
            current_daily_messages: (existing.current_daily_messages || 0) + 1,
            current_daily_tokens: (existing.current_daily_tokens || 0) + tokens,
            current_daily_cost_cents: (existing.current_daily_cost_cents || 0) + costCents,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }

    } catch (error) {
      console.error('❌ [USAGE TRACKER] Exception updating quota:', error);
    }
  }

  /**
   * Check if user has exceeded quotas
   */
  async checkQuota(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    quota?: UserQuota;
  }> {
    if (!this.supabase) {
      // If tracking disabled, allow all requests
      return { allowed: true };
    }

    try {
      const { data, error } = await this.supabase
        .from('user_usage_quotas')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist yet - create default quota and allow
          await this.createDefaultQuota(userId);
          return { allowed: true };
        }
        console.error('❌ [USAGE TRACKER] Error checking quota:', error);
        return { allowed: true }; // Fail open
      }

      const quota = data as UserQuota;

      // Check if user is blocked
      if (quota.isBlocked) {
        console.warn(`🚫 [USAGE TRACKER] User ${userId} is blocked: ${quota.blockReason}`);
        return {
          allowed: false,
          reason: quota.blockReason || 'User is blocked',
          quota
        };
      }

      // Check daily message limit
      if (quota.currentDailyMessages >= quota.dailyMessageLimit) {
        console.warn(`⚠️  [USAGE TRACKER] User ${userId} exceeded daily message limit (${quota.dailyMessageLimit})`);
        return {
          allowed: false,
          reason: `Daily message limit reached (${quota.dailyMessageLimit} messages)`,
          quota
        };
      }

      // Check daily token limit
      if (quota.currentDailyTokens >= quota.dailyTokenLimit) {
        console.warn(`⚠️  [USAGE TRACKER] User ${userId} exceeded daily token limit (${quota.dailyTokenLimit})`);
        return {
          allowed: false,
          reason: `Daily token limit reached (${quota.dailyTokenLimit} tokens)`,
          quota
        };
      }

      // Check daily cost limit
      const costLimitCents = 50; // Default $0.50/day
      if (quota.currentDailyCostCents >= costLimitCents) {
        console.warn(`⚠️  [USAGE TRACKER] User ${userId} exceeded daily cost limit ($${(costLimitCents / 100).toFixed(2)})`);
        return {
          allowed: false,
          reason: `Daily cost limit reached ($${(costLimitCents / 100).toFixed(2)})`,
          quota
        };
      }

      return { allowed: true, quota };

    } catch (error) {
      console.error('❌ [USAGE TRACKER] Exception checking quota:', error);
      return { allowed: true }; // Fail open to prevent blocking users on errors
    }
  }

  /**
   * Create default quota for new user
   */
  private async createDefaultQuota(userId: string): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('user_usage_quotas')
        .insert({
          user_id: userId,
          user_name: userId,
          user_tier: 'beta',
          daily_message_limit: 100,
          daily_token_limit: 50000,
          daily_cost_limit_cents: 50,
          requests_per_minute: 10,
          requests_per_hour: 100,
          is_active: true,
          is_blocked: false
        });

      if (error) {
        console.error('❌ [USAGE TRACKER] Failed to create default quota:', error);
      } else {
        console.log(`✅ [USAGE TRACKER] Created default quota for ${userId}`);
      }

    } catch (error) {
      console.error('❌ [USAGE TRACKER] Exception creating default quota:', error);
    }
  }

  /**
   * Get user usage summary
   */
  async getUserSummary(userId: string, days: number = 7): Promise<any> {
    if (!this.supabase) {
      return null;
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('user_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [USAGE TRACKER] Error fetching user summary:', error);
        return null;
      }

      // Calculate aggregates
      const totalRequests = data.length;
      const successfulRequests = data.filter((r: any) => r.success).length;
      const totalTokens = data.reduce((sum: number, r: any) => sum + (r.input_tokens + r.output_tokens), 0);
      const totalCost = data.reduce((sum: number, r: any) => sum + (r.input_cost + r.output_cost), 0);
      const avgResponseTime = data.reduce((sum: number, r: any) => sum + r.response_time_ms, 0) / totalRequests || 0;

      return {
        userId,
        period: `Last ${days} days`,
        totalRequests,
        successfulRequests,
        failedRequests: totalRequests - successfulRequests,
        successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(1) + '%' : '0%',
        totalTokens,
        totalCostUSD: (totalCost / 100).toFixed(4),
        avgResponseTimeMs: Math.round(avgResponseTime),
        logs: data
      };

    } catch (error) {
      console.error('❌ [USAGE TRACKER] Exception fetching user summary:', error);
      return null;
    }
  }

  /**
   * Get system-wide summary
   */
  async getSystemSummary(days: number = 7): Promise<any> {
    if (!this.supabase) {
      return null;
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('user_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('❌ [USAGE TRACKER] Error fetching system summary:', error);
        return null;
      }

      // Calculate aggregates
      const totalRequests = data.length;
      const successfulRequests = data.filter((r: any) => r.success).length;
      const uniqueUsers = new Set(data.map((r: any) => r.user_id)).size;
      const totalTokens = data.reduce((sum: number, r: any) => sum + (r.input_tokens + r.output_tokens), 0);
      const totalCost = data.reduce((sum: number, r: any) => sum + (r.input_cost + r.output_cost), 0);
      const avgResponseTime = data.reduce((sum: number, r: any) => sum + r.response_time_ms, 0) / totalRequests || 0;
      const avgQueueWait = data.reduce((sum: number, r: any) => sum + r.queue_wait_time_ms, 0) / totalRequests || 0;

      return {
        period: `Last ${days} days`,
        totalRequests,
        successfulRequests,
        failedRequests: totalRequests - successfulRequests,
        successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(1) + '%' : '0%',
        uniqueUsers,
        totalTokens,
        totalCostUSD: (totalCost / 100).toFixed(4),
        avgResponseTimeMs: Math.round(avgResponseTime),
        avgQueueWaitMs: Math.round(avgQueueWait),
        requestsPerDay: (totalRequests / days).toFixed(1),
        costPerDay: ((totalCost / 100) / days).toFixed(4)
      };

    } catch (error) {
      console.error('❌ [USAGE TRACKER] Exception fetching system summary:', error);
      return null;
    }
  }
}

// Export singleton instance
export const usageTracker = new UsageTracker();

// Export types
export type { UsageLogEntry, UserQuota };
