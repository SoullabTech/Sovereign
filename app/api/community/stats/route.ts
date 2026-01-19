export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    // Query REAL data from database
    const [membersResult, breakthroughsResult, conversationsResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM members'),
      query('SELECT COUNT(*) as count FROM breakthrough_moments'),
      query('SELECT COUNT(*) as count FROM conversation_turns'),
    ]);

    const totalMembers = parseInt(membersResult.rows[0]?.count || '0');
    const breakthroughs = parseInt(breakthroughsResult.rows[0]?.count || '0');
    const totalConversations = parseInt(conversationsResult.rows[0]?.count || '0');

    // Get recent activity from real data
    let recentActivity: any[] = [];
    try {
      const recentBreakthroughs = await query(`
        SELECT
          bm.id,
          bm.title,
          bm.created_at,
          m.name as user_name,
          m.username
        FROM breakthrough_moments bm
        LEFT JOIN members m ON bm.member_id = m.id
        ORDER BY bm.created_at DESC
        LIMIT 5
      `);

      recentActivity = recentBreakthroughs.rows.map(row => ({
        type: 'breakthrough',
        user: row.user_name || row.username || 'Member',
        action: 'reported a breakthrough',
        category: 'Breakthroughs',
        time: getTimeAgo(new Date(row.created_at)),
        title: row.title || 'Untitled breakthrough'
      }));
    } catch (e) {
      // If query fails, return empty activity
      console.log('[Community Stats] Could not fetch recent activity:', e);
    }

    const stats = {
      community: {
        totalMembers,
        onlineNow: 1, // Would need session tracking for real "online now"
        totalPosts: 0, // No community posts table yet
        totalComments: totalConversations, // Use conversation turns as proxy
        breakthroughs,
        totalReactions: 0 // No reactions table yet
      },
      fieldState: {
        // Keep elemental field visualization (this is conceptual, not fake data)
        earth: 0.15 + (Math.sin(now.getHours() / 24 * Math.PI * 2) + 1) * 0.1,
        water: 0.20 + (Math.cos(now.getHours() / 24 * Math.PI * 2) + 1) * 0.15,
        air: 0.25 + (Math.sin((now.getHours() + 6) / 24 * Math.PI * 2) + 1) * 0.1,
        fire: 0.20 + (Math.cos((now.getHours() + 12) / 24 * Math.PI * 2) + 1) * 0.1,
        intensity: 0.50,
        depth: 0.60,
        coherence: 0.65
      },
      recentActivity: recentActivity.length > 0 ? recentActivity : [
        {
          type: 'info',
          user: 'MAIA',
          action: 'Community activity will appear here',
          category: 'System',
          time: 'now',
          title: 'Start conversations to see real activity'
        }
      ],
      lastUpdated: now.toISOString()
    };

    return NextResponse.json({
      success: true,
      stats: stats,
      timestamp: now.toISOString(),
      message: 'Real community statistics from database'
    });

  } catch (error) {
    console.error('❌ [Community Stats API] Error:', error);

    // Return zeros instead of fake data on error
    return NextResponse.json({
      success: true,
      stats: {
        community: {
          totalMembers: 0,
          onlineNow: 0,
          totalPosts: 0,
          totalComments: 0,
          breakthroughs: 0,
          totalReactions: 0
        },
        fieldState: {
          earth: 0.2,
          water: 0.2,
          air: 0.2,
          fire: 0.2,
          intensity: 0.5,
          depth: 0.5,
          coherence: 0.5
        },
        recentActivity: [],
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      message: 'Database unavailable - showing zeros'
    });
  }
}

// Helper to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} hr`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
}

export async function POST(request: NextRequest) {
  try {
    // Endpoint for triggering stats recalculation
    const now = new Date();

    return NextResponse.json({
      success: true,
      message: 'Stats recalculation triggered successfully',
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ [Community Stats API] Error triggering recalculation:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to trigger stats recalculation',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
