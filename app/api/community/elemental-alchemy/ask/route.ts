export const dynamic = 'force-static';
/**
 * ASK MAIA - ELEMENTAL ALCHEMY CONTEXT
 *
 * Provides contextual MAIA insights about book teachings.
 * Forwards to /api/between/chat with enriched elemental context.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ElementKey } from '@/lib/elemental-alchemy/assessmentQuestions';

interface AskMaiaRequest {
  teaching: string;
  question?: string;
  element: ElementKey;
  chapterNum: number;
  userId: string;
  chapterTitle?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AskMaiaRequest = await request.json();
    const { teaching, question, element, chapterNum, userId, chapterTitle } = body;

    if (!teaching || !element || !userId) {
      return NextResponse.json(
        { ok: false, error: 'teaching, element, and userId required' },
        { status: 400 }
      );
    }

    // Build the contextual message for MAIA
    const userQuestion = question?.trim() || 'How does this teaching apply to my life right now?';

    const contextualMessage = `
I'm reading from "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life" by Kelly Nezat.

**Current Chapter:** Chapter ${chapterNum}${chapterTitle ? ` - ${chapterTitle}` : ''}
**Element:** ${element.charAt(0).toUpperCase() + element.slice(1)}

**Teaching I'm reflecting on:**
"${teaching}"

**My question:**
${userQuestion}

Please share your insight, connecting this teaching to practical life wisdom. Keep your response conversational and grounded in the elemental framework.
    `.trim();

    // Get base URL for internal API call
    const baseUrl = request.nextUrl.origin;

    // Forward to main chat API with book context
    const chatResponse = await fetch(`${baseUrl}/api/between/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: contextualMessage,
        userId,
        mode: 'counsel', // Care voice for book guidance
        meta: {
          explorerId: userId,
          context: 'elemental-alchemy-book',
          bookChapter: chapterNum,
          element
        },
        sanctuary: false // Allow memory so insights can build on each other
      })
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('[Ask MAIA] Chat API error:', errorText);
      return NextResponse.json(
        { ok: false, error: 'Failed to get MAIA response' },
        { status: 500 }
      );
    }

    const chatData = await chatResponse.json();

    return NextResponse.json({
      ok: true,
      insight: chatData.message,
      element,
      chapterNum,
      teaching,
      question: userQuestion
    });

  } catch (err) {
    console.error('[Ask MAIA] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
