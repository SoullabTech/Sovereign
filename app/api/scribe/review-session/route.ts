export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 90;

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { buildSessionReviewPrompt, getCompletedSessionData, formatSessionForDisplay } from '@/lib/scribe/sessionReviewMode';

export async function POST(req: NextRequest) {
  try {
    const {
      reviewedSessionId,
      currentSessionId,
      question,
      questionNumber,
      lens,
      clientName,
    } = await req.json();

    if (!reviewedSessionId || !question) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: reviewedSessionId and question' },
        { status: 400 }
      );
    }

    console.log(`🔍 Session Review: ${reviewedSessionId} | Q${questionNumber || 1} | lens=${lens || 'core'}`);

    const { prompt, meta } = await buildSessionReviewPrompt(
      {
        reviewedSessionId,
        currentSessionId: currentSessionId || 'review-session',
        questionNumber: questionNumber || 1,
        lens: lens || 'core',
        clientName: clientName || undefined,
      },
      question
    );

    console.log(`[SessionReview] ${meta.segmentCount} segments, sampled=${meta.segmentsSampled}, phantom=${meta.phantomPrefixRemoved ? 'stripped' : 'none'}`);

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: '', // prompt is self-contained
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 3000,
      temperature: 0.7,
    });

    const responseText = llmResponse.text;

    return NextResponse.json({
      success: true,
      response: responseText,
      reviewedSessionId,
      questionNumber: questionNumber || 1,
      _meta: meta,
    });
  } catch (error: any) {
    console.error('❌ Session review error:', error);

    // Return success:false so the client can show a user-friendly message
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process review question',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }
    const sessionData = await getCompletedSessionData(sessionId);
    return NextResponse.json({
      sessionId: sessionData.sessionId,
      startTime: sessionData.startTime,
      duration: sessionData.duration,
      displayText: formatSessionForDisplay(sessionData),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
