export const dynamic = 'error';

/**
 * Update member's preferred name
 * Called when user says "Call me X" in conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const { userId, preferredName } = await request.json();

    if (!userId || !preferredName) {
      return NextResponse.json(
        { error: 'User ID and preferred name required' },
        { status: 400 }
      );
    }

    // Update preferred name in database
    const result = await query(
      `UPDATE members SET preferred_name = $1 WHERE id = $2
       RETURNING id, username, name, preferred_name`,
      [preferredName.trim(), userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = result.rows[0];

    return NextResponse.json({
      success: true,
      preferredName: member.preferred_name
    });
  } catch (error) {
    console.error('[MEMBERS] Update preferred name error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferred name' },
      { status: 500 }
    );
  }
}
