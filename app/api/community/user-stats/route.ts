export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ success: true, stats: { posts: 0, comments: 0, hearts: 0, breakthroughs: 0, memories: 0 } });
  }
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

    // Real community stats from community_posts table
    let communityPosts = 0;
    let communityComments = 0;
    let heartsReceived = 0;
    try {
      const [postsResult, commentsResult, heartsResult] = await Promise.all([
        query('SELECT COUNT(*) as count FROM community_posts WHERE user_id = $1', [userId]),
        query('SELECT COUNT(*) as count FROM community_comments WHERE user_id = $1', [userId]).catch(() => ({ rows: [{ count: '0' }] })),
        query('SELECT COALESCE(SUM(heart_count), 0) as count FROM community_posts WHERE user_id = $1', [userId]),
      ]);
      communityPosts = parseInt(postsResult.rows[0]?.count || '0');
      communityComments = parseInt(commentsResult.rows[0]?.count || '0');
      heartsReceived = parseInt(heartsResult.rows[0]?.count || '0');
    } catch {
      // Tables may not exist yet — graceful zero
    }

    return NextResponse.json({
      success: true,
      stats: {
        posts: communityPosts,
        comments: communityComments,
        hearts: heartsReceived,
        breakthroughs: breakthroughs,
        memories: memories,
        conversations: conversations // MAIA conversation turns (separate from community comments)
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
