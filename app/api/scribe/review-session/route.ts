export const dynamic = 'force-dynamic';
// app/api/scribe/review-session/route.ts
// API endpoint for conversational interrogation of completed sessions

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import Anthropic from '@anthropic-ai/sdk';
import { buildSessionReviewPrompt } from '@/lib/scribe/sessionReviewMode';

// Skip during static export (Capacitor builds)

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for complex queries

export async function POST(req: NextRequest) {
  try {
    const {
      reviewedSessionId,
      currentSessionId,
      question,
      questionNumber,
      lens,
    } = await req.json();

    // Validate required parameters
    if (!reviewedSessionId || !question) {
      return NextResponse.json(
        { error: 'Missing required parameters: reviewedSessionId and question' },
        { status: 400 }
      );
    }

    console.log(`🔍 Session Review: ${reviewedSessionId} | Question ${questionNumber || 1}`);

    // Build prompt with full session context (returns prompt + quality metadata)
    const t0 = Date.now();
    const { prompt, meta } = await buildSessionReviewPrompt(
      {
        reviewedSessionId,
        currentSessionId: currentSessionId || 'review-session',
        questionNumber: questionNumber || 1,
        lens: lens || 'core',
      },
      question
    );

    // Call Claude for response
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    const usage = message.usage;
    const elapsedMs = Date.now() - t0;

    console.log(
      `✅ Session review done | ${elapsedMs}ms | in=${usage.input_tokens}tok out=${usage.output_tokens}tok | lens=${meta.lens} clean=${(meta.cleanliness * 100).toFixed(0)}%`
    );

    return NextResponse.json({
      success: true,
      response: responseText,
      reviewedSessionId,
      questionNumber: questionNumber || 1,
      // Provenance + quality metadata (for debug panel / telemetry)
      _meta: {
        ...meta,
        elapsedMs,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
      },
    });
  } catch (error: any) {
    console.error('❌ Error in session review:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process review question',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Allow GET to retrieve completed session info for review
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    const { getCompletedSessionData, formatSessionForDisplay } = await import(
      '@/lib/scribe/sessionReviewMode'
    );

    const sessionData = await getCompletedSessionData(sessionId);
    const displayText = formatSessionForDisplay(sessionData);

    return NextResponse.json({
      sessionId: sessionData.sessionId,
      userId: sessionData.userId,
      startTime: sessionData.startTime,
      duration: sessionData.duration,
      segmentCount: sessionData.segmentCount,
      displayText,
    });
  } catch (error: any) {
    console.error('❌ Error retrieving session data:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to retrieve session data',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
