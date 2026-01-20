/**
 * List Trusted Devices
 *
 * GET /api/auth/device/list
 *
 * Returns all trusted devices for the current member.
 */

export const dynamic = 'force-static'

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT id, device_name, device_type, browser, os, trust_level,
              last_seen_at, created_at
       FROM trusted_devices
       WHERE member_id = $1
       ORDER BY last_seen_at DESC`,
      [session.memberId]
    );

    const devices = result.rows.map(row => ({
      id: row.id,
      deviceName: row.device_name,
      deviceType: row.device_type,
      browser: row.browser,
      os: row.os,
      trustLevel: row.trust_level,
      lastSeenAt: row.last_seen_at,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ devices });

  } catch (error) {
    console.error('[Device] List error:', error);
    return NextResponse.json(
      { error: 'Failed to list devices' },
      { status: 500 }
    );
  }
}
