/**
 * RLM Security Module
 *
 * Enforces MAIA sovereignty constraints:
 * - No external cloud calls (except Anthropic API)
 * - Input sanitization
 * - Audit logging
 * - Rate limiting
 * - Tool guardrails
 */

import { pool } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

// Allowed domains for RLM requests
const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'rlm-service',      // Docker service name
  'api.anthropic.com', // Anthropic API only
];

// Dangerous patterns in tool inputs
const DANGEROUS_PATTERNS = [
  /\.\.\//g,           // Path traversal
  /;\s*rm\s+-/g,       // Shell injection
  /;\s*curl\s+/g,      // External fetches
  /;\s*wget\s+/g,      // External fetches
  /\$\(/g,             // Command substitution
  /`[^`]+`/g,          // Backtick execution
  /\|\s*sh\s*/g,       // Pipe to shell
  /\|\s*bash\s*/g,     // Pipe to bash
  />\s*\/etc\//g,      // Write to system dirs
  />\s*\/var\//g,      // Write to system dirs
];

// Max values for budget limits
const MAX_BUDGET_LIMITS = {
  maxRecursions: 20,
  maxToolCalls: 50,
  maxChunksRead: 100,
  timeoutMs: 300000,    // 5 minutes
  maxTokensPerCall: 8192,
};

// Rate limiting per user
const RATE_LIMITS = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
  maxConcurrent: 3,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface RLMSecurityContext {
  userId: string;
  sessionId?: string;
  ipAddress?: string;
  requestId: string;
}

export interface RLMAuditEntry {
  id?: string;
  requestId: string;
  userId: string;
  sessionId?: string;
  action: 'request' | 'tool_call' | 'completion' | 'error' | 'rate_limit';
  toolName?: string;
  toolInput?: string;
  corpusType?: string;
  budgetUsed?: {
    recursions: number;
    toolCalls: number;
    chunksRead: number;
    elapsedMs: number;
  };
  completedNormally?: boolean;
  errorMessage?: string;
  createdAt?: Date;
}

export interface SanitizedInput {
  isValid: boolean;
  sanitized: string;
  violations: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  message?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Input Sanitization
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sanitize tool input to prevent injection attacks
 */
export function sanitizeToolInput(input: string): SanitizedInput {
  const violations: string[] = [];
  let sanitized = input;

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      violations.push(`Blocked pattern: ${pattern.source}`);
      sanitized = sanitized.replace(pattern, '[BLOCKED]');
    }
  }

  // Check for null bytes (binary injection)
  if (input.includes('\x00')) {
    violations.push('Null byte injection blocked');
    sanitized = sanitized.replace(/\x00/g, '');
  }

  // Limit input length
  const MAX_INPUT_LENGTH = 10000;
  if (input.length > MAX_INPUT_LENGTH) {
    violations.push(`Input truncated from ${input.length} to ${MAX_INPUT_LENGTH}`);
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }

  return {
    isValid: violations.length === 0,
    sanitized,
    violations,
  };
}

/**
 * Validate vault path to prevent escapes
 */
export function validateVaultPath(basePath: string, requestedPath: string): boolean {
  const normalizedBase = basePath.replace(/\\/g, '/').replace(/\/+$/, '');
  const normalizedRequested = requestedPath.replace(/\\/g, '/');

  // Block path traversal
  if (normalizedRequested.includes('..')) {
    return false;
  }

  // Block absolute paths
  if (normalizedRequested.startsWith('/')) {
    return false;
  }

  // Block hidden files/directories
  if (normalizedRequested.includes('/.') || normalizedRequested.startsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Sanitize search query for vault search
 */
export function sanitizeSearchQuery(query: string): SanitizedInput {
  const violations: string[] = [];
  let sanitized = query;

  // Limit query length
  const MAX_QUERY_LENGTH = 500;
  if (query.length > MAX_QUERY_LENGTH) {
    violations.push(`Query truncated from ${query.length} to ${MAX_QUERY_LENGTH}`);
    sanitized = sanitized.slice(0, MAX_QUERY_LENGTH);
  }

  // Block potential regex DoS patterns (catastrophic backtracking)
  const regexDosPatterns = [
    /\([^)]*\+\)\+/,        // (a+)+
    /\([^)]*\*\)\*/,        // (a*)*
    /\([^)]*\?\)\+/,        // (a?)+
    /\.\*\.\*\.\*/,         // .*.*.*
  ];

  for (const pattern of regexDosPatterns) {
    if (pattern.test(query)) {
      violations.push('Potential regex DoS pattern blocked');
      // Convert to literal search
      sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      break;
    }
  }

  return {
    isValid: violations.length === 0,
    sanitized,
    violations,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Budget Validation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enforce budget limits within allowed maximums
 */
export function enforceBudgetLimits(budget: {
  maxRecursions?: number;
  maxToolCalls?: number;
  maxChunksRead?: number;
  timeoutMs?: number;
  maxTokensPerCall?: number;
}): typeof budget {
  return {
    maxRecursions: Math.min(budget.maxRecursions || 5, MAX_BUDGET_LIMITS.maxRecursions),
    maxToolCalls: Math.min(budget.maxToolCalls || 15, MAX_BUDGET_LIMITS.maxToolCalls),
    maxChunksRead: Math.min(budget.maxChunksRead || 30, MAX_BUDGET_LIMITS.maxChunksRead),
    timeoutMs: Math.min(budget.timeoutMs || 60000, MAX_BUDGET_LIMITS.timeoutMs),
    maxTokensPerCall: Math.min(budget.maxTokensPerCall || 4096, MAX_BUDGET_LIMITS.maxTokensPerCall),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Rate Limiting (In-Memory for now - could be Redis)
// ═══════════════════════════════════════════════════════════════════════════════

const rateLimitStore = new Map<string, { requests: number[]; concurrent: number }>();

/**
 * Check if request is within rate limits
 */
export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  const minuteAgo = now - 60000;
  const hourAgo = now - 3600000;

  // Get or create user's rate limit entry
  let entry = rateLimitStore.get(userId);
  if (!entry) {
    entry = { requests: [], concurrent: 0 };
    rateLimitStore.set(userId, entry);
  }

  // Clean old requests
  entry.requests = entry.requests.filter((t) => t > hourAgo);

  // Count recent requests
  const requestsLastMinute = entry.requests.filter((t) => t > minuteAgo).length;
  const requestsLastHour = entry.requests.length;

  // Check limits
  if (requestsLastMinute >= RATE_LIMITS.requestsPerMinute) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.requests[0] + 60000),
      message: `Rate limit exceeded: ${RATE_LIMITS.requestsPerMinute} requests per minute`,
    };
  }

  if (requestsLastHour >= RATE_LIMITS.requestsPerHour) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.requests[0] + 3600000),
      message: `Rate limit exceeded: ${RATE_LIMITS.requestsPerHour} requests per hour`,
    };
  }

  if (entry.concurrent >= RATE_LIMITS.maxConcurrent) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(now + 5000), // Check again in 5s
      message: `Concurrent request limit exceeded: ${RATE_LIMITS.maxConcurrent} max`,
    };
  }

  // Allow request
  entry.requests.push(now);
  entry.concurrent += 1;

  return {
    allowed: true,
    remaining: RATE_LIMITS.requestsPerMinute - requestsLastMinute - 1,
    resetAt: new Date(now + 60000),
  };
}

/**
 * Mark request as complete (decrement concurrent count)
 */
export function releaseRateLimit(userId: string): void {
  const entry = rateLimitStore.get(userId);
  if (entry && entry.concurrent > 0) {
    entry.concurrent -= 1;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Audit Logging
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Log RLM operation to database
 */
export async function logRLMAudit(entry: RLMAuditEntry): Promise<void> {
  if (!pool) {
    console.warn('[RLM Security] Database not available for audit logging');
    return;
  }

  try {
    await pool.query(
      `INSERT INTO rlm_audit_log (
        request_id,
        user_id,
        session_id,
        action,
        tool_name,
        tool_input,
        corpus_type,
        budget_recursions,
        budget_tool_calls,
        budget_chunks_read,
        budget_elapsed_ms,
        completed_normally,
        error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        entry.requestId,
        entry.userId,
        entry.sessionId || null,
        entry.action,
        entry.toolName || null,
        entry.toolInput ? entry.toolInput.slice(0, 1000) : null, // Truncate for DB
        entry.corpusType || null,
        entry.budgetUsed?.recursions || null,
        entry.budgetUsed?.toolCalls || null,
        entry.budgetUsed?.chunksRead || null,
        entry.budgetUsed?.elapsedMs || null,
        entry.completedNormally ?? null,
        entry.errorMessage?.slice(0, 500) || null,
      ]
    );
  } catch (error) {
    // Log but don't fail the request
    console.error('[RLM Security] Audit log failed:', error);
  }
}

/**
 * Get audit log for a user
 */
export async function getRLMAuditLog(
  userId: string,
  limit: number = 100
): Promise<RLMAuditEntry[]> {
  if (!pool) {
    return [];
  }

  try {
    const result = await pool.query(
      `SELECT * FROM rlm_audit_log
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      requestId: row.request_id,
      userId: row.user_id,
      sessionId: row.session_id,
      action: row.action,
      toolName: row.tool_name,
      toolInput: row.tool_input,
      corpusType: row.corpus_type,
      budgetUsed: row.budget_recursions
        ? {
            recursions: row.budget_recursions,
            toolCalls: row.budget_tool_calls,
            chunksRead: row.budget_chunks_read,
            elapsedMs: row.budget_elapsed_ms,
          }
        : undefined,
      completedNormally: row.completed_normally,
      errorMessage: row.error_message,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('[RLM Security] Failed to fetch audit log:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Network Validation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a URL is allowed for RLM operations
 */
export function isAllowedDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validate that request is from internal network
 */
export function validateInternalRequest(ipAddress?: string): boolean {
  if (!ipAddress) return true; // Allow if no IP (local dev)

  const internalPatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^::1$/,
    /^localhost$/i,
    /^::ffff:127\./,
  ];

  return internalPatterns.some((p) => p.test(ipAddress));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Security Wrapper
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Complete security check for RLM request
 */
export async function validateRLMRequest(
  context: RLMSecurityContext,
  corpus?: string[],
  budget?: Parameters<typeof enforceBudgetLimits>[0]
): Promise<{
  allowed: boolean;
  enforcedBudget: ReturnType<typeof enforceBudgetLimits>;
  violations: string[];
  rateLimit: RateLimitResult;
}> {
  const violations: string[] = [];

  // Check internal network
  if (!validateInternalRequest(context.ipAddress)) {
    violations.push('Request from external network blocked');
  }

  // Check rate limit
  const rateLimit = checkRateLimit(context.userId);
  if (!rateLimit.allowed) {
    violations.push(rateLimit.message || 'Rate limit exceeded');
  }

  // Enforce budget limits
  const enforcedBudget = enforceBudgetLimits(budget || {});

  // Validate corpus if provided
  if (corpus) {
    for (let i = 0; i < corpus.length; i++) {
      const result = sanitizeToolInput(corpus[i]);
      if (!result.isValid) {
        violations.push(`Corpus chunk ${i}: ${result.violations.join(', ')}`);
      }
    }
  }

  // Log the request
  await logRLMAudit({
    requestId: context.requestId,
    userId: context.userId,
    sessionId: context.sessionId,
    action: violations.length > 0 ? 'error' : 'request',
    corpusType: corpus ? 'provided' : 'none',
    errorMessage: violations.length > 0 ? violations.join('; ') : undefined,
  });

  return {
    allowed: violations.length === 0 && rateLimit.allowed,
    enforcedBudget,
    violations,
    rateLimit,
  };
}
