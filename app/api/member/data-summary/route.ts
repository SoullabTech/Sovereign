/**
 * Member Data Summary API
 *
 * Returns a summary of all data MAIA holds for a member.
 * Part of sovereignty/transparency commitment.
 *
 * GET /api/member/data-summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

interface DataSummary {
  memberId: string;
  memberSince: string | null;
  conversations: {
    totalSessions: number;
    totalMessages: number;
    oldestSession: string | null;
    newestSession: string | null;
  };
  patterns: {
    recognized: number;
    themes: string[];
  };
  settings: {
    personalPreferences: boolean;
    elementalProfile: boolean;
    journalEntries: number;
  };
  storage: {
    estimatedSizeKB: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get member ID from header or cookie
    const memberId = request.headers.get('x-member-id') ||
      request.cookies.get('member_id')?.value;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get member info
    const memberResult = await query(
      `SELECT id, created_at, name, onboarded FROM members WHERE id = $1`,
      [memberId]
    );

    const member = memberResult.rows[0];
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get conversation statistics
    const conversationStats = await query(
      `SELECT
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(*) as total_messages,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
       FROM conversation_turns
       WHERE member_id = $1`,
      [memberId]
    );

    const convStats = conversationStats.rows[0] || {
      total_sessions: 0,
      total_messages: 0,
      oldest: null,
      newest: null
    };

    // Get member settings
    const settingsResult = await query(
      `SELECT settings FROM member_settings WHERE member_id = $1`,
      [memberId]
    );

    const settings = settingsResult.rows[0]?.settings || {};
    const hasPreferences = !!(settings.personalPreferences || settings.voice_preferences);
    const hasElemental = !!(settings.elemental_profile || settings.facet_profile);

    // Count journal entries if they exist
    let journalCount = 0;
    try {
      const journalResult = await query(
        `SELECT COUNT(*) as count FROM journal_entries WHERE member_id = $1`,
        [memberId]
      );
      journalCount = parseInt(journalResult.rows[0]?.count || '0', 10);
    } catch {
      // Journal table may not exist
    }

    // Estimate storage size (rough estimate based on message count)
    const avgMessageSize = 500; // bytes
    const estimatedSize = Math.round(
      (parseInt(convStats.total_messages, 10) * avgMessageSize) / 1024
    );

    const summary: DataSummary = {
      memberId,
      memberSince: member.created_at,
      conversations: {
        totalSessions: parseInt(convStats.total_sessions, 10) || 0,
        totalMessages: parseInt(convStats.total_messages, 10) || 0,
        oldestSession: convStats.oldest,
        newestSession: convStats.newest,
      },
      patterns: {
        recognized: 0, // Will be populated when pattern service is connected
        themes: [],
      },
      settings: {
        personalPreferences: hasPreferences,
        elementalProfile: hasElemental,
        journalEntries: journalCount,
      },
      storage: {
        estimatedSizeKB: estimatedSize,
      },
    };

    return NextResponse.json({
      success: true,
      data: summary,
      sovereignty: {
        exportAvailable: true,
        deleteAvailable: true,
        sanctuaryModeAvailable: true,
        note: 'You own this data. Export or delete it anytime.',
      },
    });
  } catch (error) {
    console.error('[Data Summary] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data summary' },
      { status: 500 }
    );
  }
}
