/**
 * Quota Middleware
 *
 * Reusable middleware for checking user quotas before expensive operations
 *
 * @module lib/middleware/quota-middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkQuota, logUsage, type UserQuota } from '@/lib/services/quota-service';

// ============================================================================
// AUTH HELPER
// ============================================================================

export async function getUserIdFromAuth(request: NextRequest): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// ============================================================================
// QUOTA CHECK MIDDLEWARE
// ============================================================================

export interface QuotaCheckResult {
  allowed: boolean;
  userId?: string;
  quota?: UserQuota;
  reason?: string;
  response?: NextResponse; // Pre-built error response
}

/**
 * Check if user is authenticated and has quota available
 * Returns { allowed: true, userId, quota } or { allowed: false, response }
 */
export async function checkUserQuota(request: NextRequest): Promise<QuotaCheckResult> {
  // Check authentication
  const userId = await getUserIdFromAuth(request);

  if (!userId) {
    return {
      allowed: false,
      reason: 'Unauthorized - authentication required',
      response: NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      ),
    };
  }

  // Check quota
  const quotaCheck = await checkQuota(userId);

  if (!quotaCheck.allowed) {
    return {
      allowed: false,
      userId,
      quota: quotaCheck.quota,
      reason: quotaCheck.reason,
      response: NextResponse.json(
        {
          error: quotaCheck.reason,
          quota: quotaCheck.quota,
          remaining: quotaCheck.remaining,
        },
        { status: 429 }
      ),
    };
  }

  return {
    allowed: true,
    userId,
    quota: quotaCheck.quota,
  };
}

// ============================================================================
// USAGE LOGGER
// ============================================================================

export interface LogUsageParams {
  userId: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  metadata?: Record<string, any>;
}

/**
 * Log usage without throwing - catches and logs errors
 */
export async function safeLogUsage(params: LogUsageParams): Promise<void> {
  try {
    await logUsage({
      userId: params.userId,
      operation: params.operation,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      totalTokens: params.inputTokens + params.outputTokens,
      metadata: params.metadata,
    });
  } catch (error) {
    console.error('Failed to log usage (non-fatal):', error);
    // Don't throw - usage logging should not break the main operation
  }
}

// ============================================================================
// TOKEN ESTIMATION HELPERS
// ============================================================================

/**
 * Estimate tokens from text (rough approximation)
 * Rule of thumb: ~4 characters per token
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate tokens from JSON object
 */
export function estimateTokensFromJson(obj: any): number {
  const jsonString = JSON.stringify(obj);
  return estimateTokens(jsonString);
}

// ============================================================================
// COMBINED MIDDLEWARE HELPER
// ============================================================================

export interface AuthAndQuotaResult {
  allowed: boolean;
  userId?: string;
  quota?: UserQuota;
  errorResponse?: NextResponse;
}

/**
 * One-shot auth + quota check for API routes
 * Usage:
 *
 * const check = await withAuthAndQuota(request);
 * if (!check.allowed) return check.errorResponse!;
 *
 * // Proceed with check.userId and check.quota
 */
export async function withAuthAndQuota(request: NextRequest): Promise<AuthAndQuotaResult> {
  const result = await checkUserQuota(request);

  if (!result.allowed) {
    return {
      allowed: false,
      errorResponse: result.response,
    };
  }

  return {
    allowed: true,
    userId: result.userId!,
    quota: result.quota,
  };
}

// ============================================================================
// OWNERSHIP VERIFICATION
// ============================================================================

export interface OwnershipCheckResult {
  isOwner: boolean;
  errorResponse?: NextResponse;
}

/**
 * Verify that a resource belongs to the user
 */
export function verifyOwnership(
  resourceUserId: string,
  requestUserId: string,
  resourceType: string = 'resource'
): OwnershipCheckResult {
  if (resourceUserId !== requestUserId) {
    return {
      isOwner: false,
      errorResponse: NextResponse.json(
        { error: `Forbidden - not your ${resourceType}` },
        { status: 403 }
      ),
    };
  }

  return { isOwner: true };
}
