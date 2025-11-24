import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { logMaiaStyleJournal, getRecentStyleJournal, type StyleJournalEntryInput } from '@/lib/ain/maia-style-journal';

/**
 * 🌸 MAIA Style Practice Journal API
 *
 * POST: Log a new style practice entry
 * GET: Retrieve recent journal entries
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const entry: StyleJournalEntryInput = {
      userId: body.userId || null,
      sessionId: body.sessionId || null,
      awarenessLevel: body.awarenessLevel,
      awarenessConfidence: body.awarenessConfidence,
      styleBefore: body.styleBefore,
      styleAfter: body.styleAfter,
      autoAdjustmentEnabled: body.autoAdjustmentEnabled ?? true,
      changed: body.changed ?? false,
      changeReason: body.changeReason,
      dominantSource: body.dominantSource,
      sourceMix: body.sourceMix,
      requestSnippet: body.requestSnippet,
      responseSnippet: body.responseSnippet,
    };

    await logMaiaStyleJournal(entry);

    return NextResponse.json({
      success: true,
      message: "Style practice entry logged successfully"
    });
  } catch (error) {
    console.error('🌸 [API] Failed to log style practice entry:', error);
    return NextResponse.json(
      { error: 'Failed to log style practice entry' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const entries = await getRecentStyleJournal(userId, limit);

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length
    });
  } catch (error) {
    console.error('🌸 [API] Failed to get style journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve style journal entries' },
      { status: 500 }
    );
  }
}