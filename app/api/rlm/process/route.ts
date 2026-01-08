/**
 * RLM Processing API
 *
 * Proxies requests to the RLM Python microservice for
 * recursive corpus-as-environment processing.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RLM_SERVICE_URL = process.env.RLM_SERVICE_URL || 'http://rlm:8080';

interface RecursiveQuery {
  prompt: string;
  corpus?: string[];
  corpusType?: 'general' | 'codebase' | 'docs' | 'transcript';
  maxRecursions?: number;
  maxTokens?: number;
  toolsEnabled?: string[];
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
  try {
    const body: RecursiveQuery = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Transform to Python service format (snake_case)
    const rlmRequest = {
      prompt: body.prompt,
      corpus: body.corpus || [],
      corpus_type: body.corpusType || 'general',
      max_recursions: body.maxRecursions || 5,
      max_tokens: body.maxTokens || 4096,
      tools_enabled: body.toolsEnabled || ['search', 'read', 'navigate'],
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

    return NextResponse.json({
      success: true,
      data: transformedResult,
    });
  } catch (error) {
    console.error('[RLM API] Error:', error);

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
