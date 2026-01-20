/**
 * RLM Processing API
 *
 * Proxies requests to the RLM Python microservice for
 * recursive corpus-as-environment processing.
 *
 * Security features:
 * - Input sanitization
 * - Rate limiting
 * - Budget enforcement
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  validateRLMRequest,
  releaseRateLimit,
  logRLMAudit,
  sanitizeToolInput,
} from '@/lib/rlm/security';

export const dynamic = 'force-dynamic';

const RLM_SERVICE_URL = process.env.RLM_SERVICE_URL || 'http://rlm:8080';

interface RecursiveQuery {
  prompt: string;
  corpus?: string[];
  corpusType?: 'general' | 'codebase' | 'docs' | 'transcript' | 'vault';
  maxRecursions?: number;
  maxToolCalls?: number;
  maxChunksRead?: number;
  timeoutMs?: number;
  maxTokens?: number;
  toolsEnabled?: string[];
  vaultPath?: string;
  userId?: string;
  sessionId?: string;
}

interface RecursiveResult {
  answer: string;
  reasoningTrace: Array<{
    depth: number;
    stopReason: string;
    contentTypes: string[];
  }>;
  toolCalls: number;
  recursionDepth: number;
  chunksAccessed: number[];
  confidence: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID().slice(0, 8);
  let userId = 'anonymous';

  try {
    const body: RecursiveQuery = await request.json();

    // Extract user context
    userId = body.userId || 'anonymous';
    const sessionId = body.sessionId;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Security validation
    const securityResult = await validateRLMRequest(
      { userId, sessionId, ipAddress, requestId },
      body.corpus,
      {
        maxRecursions: body.maxRecursions,
        maxToolCalls: body.maxToolCalls,
        maxChunksRead: body.maxChunksRead,
        timeoutMs: body.timeoutMs,
      }
    );

    if (!securityResult.allowed) {
      return NextResponse.json(
        {
          error: 'Security check failed',
          violations: securityResult.violations,
          rateLimit: {
            remaining: securityResult.rateLimit.remaining,
            resetAt: securityResult.rateLimit.resetAt,
          },
        },
        { status: 429 }
      );
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizeToolInput(body.prompt);
    if (!sanitizedPrompt.isValid) {
      console.warn(`[RLM API] Prompt sanitized: ${sanitizedPrompt.violations.join(', ')}`);
    }

    // Transform to Python service format (snake_case) with enforced budget
    const rlmRequest = {
      prompt: sanitizedPrompt.sanitized,
      corpus: body.corpus || [],
      corpus_type: body.corpusType || 'general',
      tools_enabled: body.toolsEnabled || ['search', 'read', 'navigate'],
      vault_path: body.vaultPath,
      budget: {
        max_recursions: securityResult.enforcedBudget.maxRecursions,
        max_tool_calls: securityResult.enforcedBudget.maxToolCalls,
        max_chunks_read: securityResult.enforcedBudget.maxChunksRead,
        timeout_ms: securityResult.enforcedBudget.timeoutMs,
        max_tokens_per_call: securityResult.enforcedBudget.maxTokensPerCall,
      },
    };

    const response = await fetch(`${RLM_SERVICE_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rlmRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[RLM API] Service error:', error);
      return NextResponse.json(
        { error: 'RLM service error', details: error },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Transform to TypeScript format (camelCase)
    const transformedResult: RecursiveResult = {
      answer: result.answer,
      reasoningTrace: result.reasoning_trace,
      toolCalls: result.tool_calls,
      recursionDepth: result.recursion_depth,
      chunksAccessed: result.chunks_accessed,
      confidence: result.confidence,
    };

    // Log successful completion
    await logRLMAudit({
      requestId,
      userId,
      action: 'completion',
      corpusType: body.corpusType || 'general',
      budgetUsed: {
        recursions: transformedResult.recursionDepth,
        toolCalls: transformedResult.toolCalls,
        chunksRead: transformedResult.chunksAccessed.length,
        elapsedMs: 0, // Could track this if needed
      },
      completedNormally: true,
    });

    // Release rate limit slot
    releaseRateLimit(userId);

    return NextResponse.json({
      success: true,
      data: transformedResult,
    });
  } catch (error) {
    console.error('[RLM API] Error:', error);

    // Log error
    await logRLMAudit({
      requestId,
      userId,
      action: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      completedNormally: false,
    });

    // Release rate limit slot on error too
    releaseRateLimit(userId);

    // Check if RLM service is unreachable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'RLM service unavailable',
          hint: 'Ensure RLM container is running',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process RLM request' },
      { status: 500 }
    );
  }
}
