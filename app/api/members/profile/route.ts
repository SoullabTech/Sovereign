export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * GET /api/members/profile
 * Get member profile by ID or username
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('id');
    const username = searchParams.get('username');

    if (!memberId && !username) {
      return NextResponse.json(
        { error: 'Member ID or username required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT
        m.id, m.username, m.name, m.email, m.passkey,
        m.avatar_url, m.bio, m.timezone,
        m.onboarded, m.created_at, m.last_sign_in,
        ms.circle_tier, ms.circle_amount, ms.circle_joined_at
      FROM members m
      LEFT JOIN member_settings ms ON m.id = ms.member_id
      WHERE ${memberId ? 'm.id = $1' : 'm.username = $1'}`,
      [memberId || username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const member = result.rows[0];

    // Mask passkey for security (show first 8 chars)
    const maskedPasskey = member.passkey
      ? `${member.passkey.substring(0, 8)}${'*'.repeat(Math.max(0, member.passkey.length - 8))}`
      : null;

    return NextResponse.json({
      id: member.id,
      username: member.username,
      name: member.name,
      email: member.email,
      passkey: maskedPasskey,
      avatarUrl: member.avatar_url,
      bio: member.bio,
      timezone: member.timezone,
      onboarded: member.onboarded,
      createdAt: member.created_at,
      lastSignIn: member.last_sign_in,
      membership: {
        tier: member.circle_tier || 'explorer',
        amount: member.circle_amount || 0,
        joinedAt: member.circle_joined_at,
      },
    });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/members/profile
 * Update member profile
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, name, email, bio, timezone } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    // Update members table
    const result = await query(
      `UPDATE members
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           bio = COALESCE($4, bio),
           timezone = COALESCE($5, timezone)
       WHERE id = $1
       RETURNING id, username, name, email, bio, timezone`,
      [memberId, name, email, bio, timezone]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error('[Profile API] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
