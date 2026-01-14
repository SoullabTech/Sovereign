// Production requires force-dynamic for per-user database access
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
        m.birth_date, m.birth_time, m.birth_location_lat, m.birth_location_lng,
        m.birth_location_name, m.birth_timezone,
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
      // Birth data for astrology
      // Format date as YYYY-MM-DD for HTML date input compatibility
      birthData: member.birth_date ? {
        date: typeof member.birth_date === 'string'
          ? member.birth_date.split('T')[0]
          : new Date(member.birth_date).toISOString().split('T')[0],
        time: member.birth_time,
        location: member.birth_location_lat && member.birth_location_lng ? {
          lat: parseFloat(member.birth_location_lat),
          lng: parseFloat(member.birth_location_lng),
          name: member.birth_location_name,
          timezone: member.birth_timezone,
        } : null,
      } : null,
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
    const { memberId, name, email, bio, timezone, birthData } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    // Build SET clauses dynamically
    const setClauses: string[] = [];
    const values: unknown[] = [memberId];
    let paramIndex = 2;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (bio !== undefined) {
      setClauses.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (timezone !== undefined) {
      setClauses.push(`timezone = $${paramIndex++}`);
      values.push(timezone);
    }

    // Birth data fields
    if (birthData !== undefined) {
      if (birthData === null) {
        // Clear birth data
        setClauses.push(`birth_date = NULL, birth_time = NULL, birth_location_lat = NULL, birth_location_lng = NULL, birth_location_name = NULL, birth_timezone = NULL`);
      } else {
        if (birthData.date !== undefined) {
          setClauses.push(`birth_date = $${paramIndex++}`);
          values.push(birthData.date);
        }
        if (birthData.time !== undefined) {
          setClauses.push(`birth_time = $${paramIndex++}`);
          values.push(birthData.time);
        }
        if (birthData.location !== undefined) {
          if (birthData.location === null) {
            setClauses.push(`birth_location_lat = NULL, birth_location_lng = NULL, birth_location_name = NULL, birth_timezone = NULL`);
          } else {
            if (birthData.location.lat !== undefined) {
              setClauses.push(`birth_location_lat = $${paramIndex++}`);
              values.push(birthData.location.lat);
            }
            if (birthData.location.lng !== undefined) {
              setClauses.push(`birth_location_lng = $${paramIndex++}`);
              values.push(birthData.location.lng);
            }
            if (birthData.location.name !== undefined) {
              setClauses.push(`birth_location_name = $${paramIndex++}`);
              values.push(birthData.location.name);
            }
            if (birthData.location.timezone !== undefined) {
              setClauses.push(`birth_timezone = $${paramIndex++}`);
              values.push(birthData.location.timezone);
            }
          }
        }
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update members table
    const result = await query(
      `UPDATE members
       SET ${setClauses.join(', ')}
       WHERE id = $1
       RETURNING id, username, name, email, bio, timezone,
                 birth_date, birth_time, birth_location_lat, birth_location_lng,
                 birth_location_name, birth_timezone`,
      values
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
