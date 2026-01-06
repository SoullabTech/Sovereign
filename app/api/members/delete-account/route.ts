export const dynamic = 'force-static';


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * POST /api/members/delete-account
 * Permanently delete member account and all associated data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, confirmUsername } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    // Verify member exists and confirmation matches
    const memberResult = await query(
      `SELECT username FROM members WHERE id = $1`,
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const actualUsername = memberResult.rows[0].username;

    // Require username confirmation for safety
    if (confirmUsername !== actualUsername) {
      return NextResponse.json(
        { error: 'Username confirmation does not match' },
        { status: 400 }
      );
    }

    // Delete all associated data (cascading deletes handle most)
    await Promise.all([
      // Delete settings (should cascade, but explicit for safety)
      query(`DELETE FROM member_settings WHERE member_id = $1`, [memberId]),
      // Delete sessions
      query(`DELETE FROM member_sessions WHERE member_id = $1`, [memberId]),
      // Delete developmental memories
      query(`DELETE FROM developmental_memories WHERE user_id = $1`, [memberId]).catch(() => {}),
      // Delete Google credentials
      query(`DELETE FROM google_calendar_credentials WHERE user_id = $1`, [memberId]).catch(() => {}),
      // Delete memory links
      query(`DELETE FROM memory_links WHERE user_id = $1`, [memberId]).catch(() => {}),
    ]);

    // Finally delete the member record
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data permanently deleted',
    });
  } catch (error) {
    console.error('[Delete Account API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
