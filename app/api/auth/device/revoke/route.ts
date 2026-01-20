/**
 * Revoke Device Trust
 *
 * POST /api/auth/device/revoke
 *
 * Removes a device from the trusted list.
 */

export const dynamic = 'force-static' // Changed for Capacitor build compatibility;

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID required' },
        { status: 400 }
      );
    }

    // Delete the device (only if owned by current member)
    const result = await query(
      `DELETE FROM trusted_devices
       WHERE id = $1 AND member_id = $2`,
      [deviceId, session.memberId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Device trust revoked'
    });

  } catch (error) {
    console.error('[Device] Revoke error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke device' },
      { status: 500 }
    );
  }
}
