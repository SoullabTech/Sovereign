// app/api/scribe/review-session/route.ts
// API endpoint for conversational interrogation of completed sessions

import { NextRequest, NextResponse } from 'next/server';
import { getLLM } from '@/lib/ai/providerRouter';
import { buildSessionReviewPrompt } from '@/lib/scribe/sessionReviewMode';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for complex queries

export async function POST(req: NextRequest) {
  try {
    // SOVEREIGNTY ENFORCEMENT: Block this route in sovereign mode
    if (process.env.SOVEREIGN_MODE === 'true') {
      return NextResponse.json(
        { error: 'Session review route disabled in SOVEREIGN_MODE' },
        { status: 403 }
      );
    }

    const {
      reviewedSessionId,
      currentSessionId,
      question,
      questionNumber,
    } = await req.json();

    // Validate required parameters
    if (!reviewedSessionId || !question) {
      return NextResponse.json(
        { error: 'Missing required parameters: reviewedSessionId and question' },
        { status: 400 }
      );
    }

    console.log(`🔍 Session Review: ${reviewedSessionId} | Question ${questionNumber || 1}`);

    // Build prompt with full session context
    const prompt = await buildSessionReviewPrompt(
      {
        reviewedSessionId,
        currentSessionId: currentSessionId || 'review-session',
        questionNumber: questionNumber || 1,
      },
      question
    );

    // Use providerRouter (respects sovereignty flags)
    const llm = getLLM('chat');

    const responseText = await llm.generateText(prompt, {
      maxTokens: 2000,
      temperature: 0.7
    });

    console.log(`✅ Session review response generated (${responseText.length} chars)`);

    return NextResponse.json({
      success: true,
      response: responseText,
      reviewedSessionId,
      questionNumber: questionNumber || 1,
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
      exchangeCount: sessionData.conversationHistory.length,
      hasSummary: !!sessionData.summary,
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
