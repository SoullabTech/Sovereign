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

    // Phase 1 — load the session content. A failure here means the data could not be
    // loaded (session missing / transcript lookup failed), distinct from a model failure.
    let prompt: string;
    let meta: Awaited<ReturnType<typeof buildSessionReviewPrompt>>['meta'];
    try {
      ({ prompt, meta } = await buildSessionReviewPrompt(
        {
          reviewedSessionId,
          currentSessionId: currentSessionId || 'review-session',
          questionNumber: questionNumber || 1,
          lens: lens || 'core',
          clientName: clientName || undefined,
        },
        question
      ));
    } catch (loadError: any) {
      console.error('❌ Session review load error:', loadError);
      return NextResponse.json(
        { success: false, phase: 'load', error: loadError.message || 'Failed to load session data' },
        { status: 500 }
      );
    }

    console.log(`[SessionReview] ${meta.segmentCount} segments, sampled=${meta.segmentsSampled}, phantom=${meta.phantomPrefixRemoved ? 'stripped' : 'none'}`);

    // Phase 2 — generate the review. A failure here is a model/provider failure; the
    // session data already loaded, so the UI must not claim it "couldn't load the data".
    let responseText: string;
    try {
      const llmResponse = await getLLMProvider().generateSimple({
        tier: 'core',
        // Session Review is a long-context clinical/practitioner synthesis (often
        // hundreds of turns). The local core model is too slow (~197s on a 373-turn
        // review) and too shallow for this surface, so this route opts out of
        // LOCAL_TIER_ENABLED and uses Claude. Ordinary core/fast routes stay local-first.
        forceClaude: true,
        systemPrompt: '', // prompt is self-contained
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 3000,
        temperature: 0.7,
      });
      responseText = llmResponse.text;
    } catch (genError: any) {
      console.error('❌ Session review generation error:', genError);
      return NextResponse.json(
        { success: false, phase: 'generation', error: genError.message || 'Failed to generate the review' },
        { status: 503 }
      );
    }

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
