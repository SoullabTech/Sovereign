export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId required'
      }, { status: 400 });
    }

    // Query real stats for this user
    const [
      breakthroughsResult,
      conversationsResult,
      memoriesResult
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM breakthrough_moments WHERE user_id = $1', [userId]),
      query('SELECT COUNT(*) as count FROM conversation_turns WHERE user_id = $1', [userId]),
      query('SELECT COUNT(*) as count FROM developmental_memories WHERE user_id = $1', [userId])
    ]);

    const breakthroughs = parseInt(breakthroughsResult.rows[0]?.count || '0');
    const conversations = parseInt(conversationsResult.rows[0]?.count || '0');
    const memories = parseInt(memoriesResult.rows[0]?.count || '0');

    // "Posts" could be community posts (if table exists) - for now use 0
    // "Comments" = conversation turns (interactions with MAIA)
    // "Hearts" = reactions given (if table exists) - for now use 0
    // "Breakthroughs" = breakthrough_moments

    return NextResponse.json({
      success: true,
      stats: {
        posts: 0, // No community posts table yet
        comments: conversations, // Conversation turns with MAIA
        hearts: 0, // No reactions table yet
        breakthroughs: breakthroughs,
        memories: memories // Bonus: developmental memories
      },
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [User Stats API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user stats'
    }, { status: 500 });
  }
}
