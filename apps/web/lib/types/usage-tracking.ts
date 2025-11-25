/**
 * Usage Tracking Type Definitions
 *
 * Types for MAIA's usage monitoring, quota enforcement, and analytics system.
 * Tracks every API request with token usage, costs, and performance metrics.
 *
 * @module lib/types/usage-tracking
 * @see USAGE-MONITORING-COMPLETE.md
 */

// ============================================================================
// USAGE LOG ENTRY
// ============================================================================

/**
 * Request types that can be logged
 */
export type RequestType =
  | 'chat-text'
  | 'chat-voice'
  | 'tts'
  | 'journal'
  | 'reflection'
  | 'fire-query'
  | 'air-query'
  | 'drawer-open'
  | 'madeleine-trigger';

/**
 * Error types for failed requests
 */
export type ErrorType =
  | 'rate_limit'
  | 'timeout'
  | 'api_error'
  | 'quota_exceeded'
  | 'invalid_request'
  | 'server_error'
  | 'other';

/**
 * Entry logged for every API request.
 * Captures tokens, costs, performance, and success status.
 */
export interface UsageLogEntry {
  /** Unique identifier for this log entry */
  id?: string;

  /** User who made the request */
  userId: string;

  /** User's display name (optional) */
  userName?: string;

  // ─────────────────────────────────────────────────────────────────────
  // REQUEST DETAILS
  // ─────────────────────────────────────────────────────────────────────

  /** API endpoint called (e.g., '/api/between/chat') */
  endpoint: string;

  /** Type of request */
  requestType: RequestType;

  // ─────────────────────────────────────────────────────────────────────
  // TOKEN USAGE
  // ─────────────────────────────────────────────────────────────────────

  /** Input tokens consumed */
  inputTokens: number;

  /** Output tokens generated */
  outputTokens: number;

  /** Total tokens (computed: input + output) */
  totalTokens?: number;

  // ─────────────────────────────────────────────────────────────────────
  // COST CALCULATION
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Cost for input tokens in cents
   * Sonnet 4: $3/1M tokens = 0.0003¢ per token
   */
  inputCost: number;

  /**
   * Cost for output tokens in cents
   * Sonnet 4: $15/1M tokens = 0.0015¢ per token
   */
  outputCost: number;

  /** Total cost in cents (computed: input + output) */
  totalCost?: number;

  // ─────────────────────────────────────────────────────────────────────
  // PERFORMANCE METRICS
  // ─────────────────────────────────────────────────────────────────────

  /** Time from request to response (milliseconds) */
  responseTimeMs: number;

  /** Time spent waiting in queue (milliseconds) */
  queueWaitTimeMs?: number;

  // ─────────────────────────────────────────────────────────────────────
  // REQUEST METADATA
  // ─────────────────────────────────────────────────────────────────────

  /** Model used (e.g., 'claude-sonnet-4-20250514') */
  modelUsed: string;

  /** Whether this was a voice mode interaction */
  isVoiceMode?: boolean;

  /** THE BETWEEN field depth during this request (0-1) */
  fieldDepth?: number;

  // ─────────────────────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────────────────────

  /** Whether the request succeeded */
  success: boolean;

  /** Error message if request failed */
  errorMessage?: string;

  /** Error type classification */
  errorType?: ErrorType;

  // ─────────────────────────────────────────────────────────────────────
  // TIMESTAMPS
  // ─────────────────────────────────────────────────────────────────────

  createdAt?: Date;
}

// ============================================================================
// USER QUOTAS
// ============================================================================

/**
 * User tier levels determining quota limits
 */
export type UserTier =
  | 'beta'      // Early access testers
  | 'standard'  // Regular subscribers
  | 'premium'   // Higher limits
  | 'unlimited' // No limits (special partners)
  | 'therapist' // Practitioner tier with HIPAA
  | 'enterprise'; // Organization tier

/**
 * Per-user quota limits and current usage.
 * Resets daily at midnight UTC.
 */
export interface UserQuota {
  id?: string;
  userId: string;
  userName?: string;

  /** User's tier level */
  userTier: UserTier;

  // ─────────────────────────────────────────────────────────────────────
  // DAILY LIMITS
  // ─────────────────────────────────────────────────────────────────────

  /** Maximum messages per day */
  dailyMessageLimit: number;

  /** Maximum tokens per day */
  dailyTokenLimit: number;

  /** Maximum cost per day (in cents) */
  dailyCostLimitCents: number;

  // ─────────────────────────────────────────────────────────────────────
  // RATE LIMITING
  // ─────────────────────────────────────────────────────────────────────

  /** Maximum requests per minute */
  requestsPerMinute: number;

  /** Maximum requests per hour */
  requestsPerHour: number;

  // ─────────────────────────────────────────────────────────────────────
  // CURRENT USAGE (Reset Daily)
  // ─────────────────────────────────────────────────────────────────────

  /** Messages sent today */
  currentDailyMessages: number;

  /** Tokens consumed today */
  currentDailyTokens: number;

  /** Cost accumulated today (in cents) */
  currentDailyCostCents: number;

  /** When quotas were last reset */
  lastResetAt: Date;

  // ─────────────────────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────────────────────

  /** Whether this user is active */
  isActive: boolean;

  /** Whether this user is blocked */
  isBlocked: boolean;

  /** Reason for blocking (if applicable) */
  blockReason?: string;

  // ─────────────────────────────────────────────────────────────────────
  // TIMESTAMPS
  // ─────────────────────────────────────────────────────────────────────

  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// SYSTEM USAGE SUMMARY
// ============================================================================

/**
 * Daily aggregated system-wide statistics.
 * Used for admin dashboard and monitoring.
 */
export interface SystemUsageSummary {
  id?: string;

  /** Date this summary covers */
  summaryDate: Date;

  // ─────────────────────────────────────────────────────────────────────
  // REQUEST COUNTS
  // ─────────────────────────────────────────────────────────────────────

  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;

  /** Success rate percentage */
  successRate?: number;

  // ─────────────────────────────────────────────────────────────────────
  // TOKEN USAGE
  // ─────────────────────────────────────────────────────────────────────

  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens?: number;

  // ─────────────────────────────────────────────────────────────────────
  // COST
  // ─────────────────────────────────────────────────────────────────────

  /** Total cost in cents for this day */
  totalCostCents: number;

  /** Total cost in USD (computed) */
  totalCostUSD?: number;

  // ─────────────────────────────────────────────────────────────────────
  // PERFORMANCE
  // ─────────────────────────────────────────────────────────────────────

  /** Average response time in milliseconds */
  avgResponseTimeMs: number;

  /** Average queue wait time in milliseconds */
  avgQueueWaitTimeMs: number;

  // ─────────────────────────────────────────────────────────────────────
  // USER STATS
  // ─────────────────────────────────────────────────────────────────────

  /** Number of unique users active this day */
  uniqueUsers: number;

  /** Number of new users who started this day */
  newUsers: number;

  // ─────────────────────────────────────────────────────────────────────
  // MODEL DISTRIBUTION
  // ─────────────────────────────────────────────────────────────────────

  /** Requests using Sonnet 4 */
  sonnet4Requests: number;

  /** Requests using other models */
  otherModelRequests: number;

  // ─────────────────────────────────────────────────────────────────────
  // TIMESTAMPS
  // ─────────────────────────────────────────────────────────────────────

  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// QUOTA CHECK RESULT
// ============================================================================

/**
 * Result of checking if a user can make a request
 */
export interface QuotaCheckResult {
  /** Whether the request is allowed */
  allowed: boolean;

  /** Reason if request is denied */
  reason?: string;

  /** Current quota state (optional) */
  quota?: UserQuota;

  /** Remaining capacity */
  remaining?: {
    messages: number;
    tokens: number;
    costCents: number;
  };
}

// ============================================================================
// USAGE SUMMARY (For Admin Dashboard)
// ============================================================================

/**
 * Summary of a user's usage over a time period
 */
export interface UsageSummary {
  userId: string;
  period: string;

  // Request stats
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: string;

  // Token stats
  totalTokens: number;

  // Cost stats
  totalCostUSD: string;

  // Performance stats
  avgResponseTimeMs: number;

  // Quota info
  quota?: UserQuota;

  /** Quota status: ok, warning, critical, exceeded */
  quotaStatus: 'ok' | 'warning' | 'critical' | 'exceeded';
}

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

/**
 * Default quota configuration for each tier
 */
export interface TierConfig {
  tier: UserTier;
  dailyMessageLimit: number;
  dailyTokenLimit: number;
  dailyCostLimitCents: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  features: string[];
}

/**
 * Standard tier configurations
 */
export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  beta: {
    tier: 'beta',
    dailyMessageLimit: 100,
    dailyTokenLimit: 50000,
    dailyCostLimitCents: 50, // $0.50/day
    requestsPerMinute: 10,
    requestsPerHour: 100,
    features: ['basic', 'bardic-memory', 'fire-queries', 'air-queries'],
  },
  standard: {
    tier: 'standard',
    dailyMessageLimit: 50,
    dailyTokenLimit: 30000,
    dailyCostLimitCents: 30, // $0.30/day
    requestsPerMinute: 5,
    requestsPerHour: 50,
    features: ['basic', 'bardic-memory'],
  },
  premium: {
    tier: 'premium',
    dailyMessageLimit: 500,
    dailyTokenLimit: 200000,
    dailyCostLimitCents: 200, // $2.00/day
    requestsPerMinute: 20,
    requestsPerHour: 500,
    features: ['basic', 'bardic-memory', 'fire-queries', 'air-queries', 'virtue-ledger', 'priority-support'],
  },
  unlimited: {
    tier: 'unlimited',
    dailyMessageLimit: 999999,
    dailyTokenLimit: 999999999,
    dailyCostLimitCents: 999999,
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    features: ['all'],
  },
  therapist: {
    tier: 'therapist',
    dailyMessageLimit: 1000,
    dailyTokenLimit: 500000,
    dailyCostLimitCents: 500, // $5.00/day
    requestsPerMinute: 30,
    requestsPerHour: 1000,
    features: ['basic', 'bardic-memory', 'fire-queries', 'air-queries', 'virtue-ledger', 'sacred-witness', 'hipaa-compliance', 'multi-client', 'priority-support'],
  },
  enterprise: {
    tier: 'enterprise',
    dailyMessageLimit: 10000,
    dailyTokenLimit: 5000000,
    dailyCostLimitCents: 5000, // $50.00/day
    requestsPerMinute: 100,
    requestsPerHour: 5000,
    features: ['all', 'white-label', 'custom-integration', 'dedicated-support', 'sla'],
  },
};

// ============================================================================
// PRICING CONSTANTS
// ============================================================================

/**
 * Anthropic Claude Sonnet 4 pricing (as of January 2025)
 */
export const SONNET_4_PRICING = {
  /** Cost per input token in cents */
  INPUT_COST_PER_TOKEN: 0.0003, // $3 per 1M tokens

  /** Cost per output token in cents */
  OUTPUT_COST_PER_TOKEN: 0.0015, // $15 per 1M tokens

  /** Model identifier */
  MODEL_ID: 'claude-sonnet-4-20250514',
} as const;

/**
 * Calculate cost for a request
 */
export function calculateCost(inputTokens: number, outputTokens: number): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
} {
  const inputCost = inputTokens * SONNET_4_PRICING.INPUT_COST_PER_TOKEN;
  const outputCost = outputTokens * SONNET_4_PRICING.OUTPUT_COST_PER_TOKEN;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: Number(inputCost.toFixed(4)),
    outputCost: Number(outputCost.toFixed(4)),
    totalCost: Number(totalCost.toFixed(4)),
  };
}

/**
 * Format cents as USD string
 */
export function formatCostUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format success rate as percentage
 */
export function formatSuccessRate(successful: number, total: number): string {
  if (total === 0) return '0%';
  return `${((successful / total) * 100).toFixed(1)}%`;
}
