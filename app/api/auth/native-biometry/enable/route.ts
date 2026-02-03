/**
 * Enable Native Biometry
 *
 * POST /api/auth/native-biometry/enable
 *
 * Marks a trusted device as having native biometry (Face ID/Touch ID) enabled.
 * Called after the user successfully authenticates with biometry locally
 * and confirms they want to use it for future sign-ins.
 *
 * Flow:
 * 1. User is signed in with password (device already trusted)
 * 2. User enables biometry in settings or after sign-in
 * 3. Client prompts Face ID/Touch ID locally
 * 4. If successful, client calls this endpoint
 * 5. Server marks the device as biometry-enabled
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    // Get member ID from header (required for native apps)
    const memberId = request.headers.get('x-member-id');
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required', code: 'NO_MEMBER_ID' },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(memberId)) {
      return NextResponse.json(
        { error: 'Invalid member ID format', code: 'INVALID_MEMBER_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { deviceId, biometryType } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID required', code: 'NO_DEVICE_ID' },
        { status: 400 }
      );
    }

    // Verify device exists and belongs to this member
    const deviceResult = await query(
      `SELECT id, device_name, biometry_enabled
       FROM trusted_devices
       WHERE id = $1 AND member_id = $2`,
      [deviceId, memberId]
    );

    if (deviceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Device not found or not trusted', code: 'DEVICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const device = deviceResult.rows[0];

    // Enable biometry on this device
    await query(
      `UPDATE trusted_devices
       SET biometry_enabled = TRUE,
           biometry_type = $1,
           biometry_enabled_at = NOW()
       WHERE id = $2`,
      [biometryType || 'unknown', deviceId]
    );

    // Update member's preferred auth method if not already set
    await query(
      `UPDATE members
       SET preferred_auth_method = 'biometry'
       WHERE id = $1 AND (preferred_auth_method IS NULL OR preferred_auth_method = 'password')`,
      [memberId]
    );

    console.log(`[NativeBiometry] Enabled ${biometryType || 'biometry'} for member ${memberId} on device ${device.device_name || deviceId}`);

    return NextResponse.json({
      success: true,
      message: 'Biometry enabled for this device',
      device: {
        id: device.id,
        name: device.device_name,
        biometryEnabled: true,
        biometryType: biometryType || 'unknown'
      }
    });

  } catch (error) {
    console.error('[NativeBiometry] Enable error:', error);
    return NextResponse.json(
      { error: 'Failed to enable biometry', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if biometry is enabled for a device
 */
export async function GET(request: NextRequest) {
  try {
    const memberId = request.headers.get('x-member-id');
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT biometry_enabled, biometry_type, biometry_enabled_at
       FROM trusted_devices
       WHERE id = $1 AND member_id = $2`,
      [deviceId, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const device = result.rows[0];

    return NextResponse.json({
      biometryEnabled: device.biometry_enabled || false,
      biometryType: device.biometry_type,
      enabledAt: device.biometry_enabled_at
    });

  } catch (error) {
    console.error('[NativeBiometry] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check biometry status' },
      { status: 500 }
    );
  }
}
