export const dynamic = 'force-dynamic';
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
  chapterContent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AskMaiaRequest = await request.json();
    const { teaching, question, element, chapterNum, userId, chapterTitle, chapterContent } = body;

    if (!teaching || !element || !userId) {
      return NextResponse.json(
        { ok: false, error: 'teaching, element, and userId required' },
        { status: 400 }
      );
    }

    // Build the contextual message for MAIA
    const userQuestion = question?.trim() || 'How does this teaching apply to my life right now?';

    // Clean chapter content for context
    const cleanedContent = chapterContent
      ?.replace(/!\[\]\[image\d+\]/g, '')
      ?.replace(/\*\*\*/g, '')
      ?.replace(/###\s*/g, '')
      ?.slice(0, 1500);

    const contextualMessage = `
I'm reading from "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life" by Kelly Nezat.

**Current Chapter:** Chapter ${chapterNum}${chapterTitle ? ` - ${chapterTitle}` : ''}
**Element:** ${element.charAt(0).toUpperCase() + element.slice(1)}

**Section I'm reflecting on:**
"${teaching}"

${cleanedContent ? `**From the text:**
${cleanedContent}

` : ''}**My question:**
${userQuestion}

Please share your insight as MAIA, drawing from Kelly's elemental wisdom to offer practical guidance. Connect the teaching to everyday life. Be warm, grounded, and specific.
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
