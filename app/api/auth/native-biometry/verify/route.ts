/**
 * Native Biometry Verification
 *
 * POST /api/auth/native-biometry/verify
 *
 * Verifies that the device is trusted and creates a new session.
 * Called after successful local Face ID/Touch ID authentication on native apps.
 *
 * Flow:
 * 1. Client prompts Face ID/Touch ID locally
 * 2. If successful, client calls this endpoint with device ID
 * 3. Server validates device is trusted for this member
 * 4. Server creates new session and returns member data
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createSession, setSessionCookie } from '@/lib/auth/serverSessions';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

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

    // Verify member exists
    const memberResult = await query(
      `SELECT id, username, name, preferred_name, onboarded, tier,
              has_webauthn, preferred_auth_method
       FROM members WHERE id = $1`,
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found', code: 'MEMBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];

    // Verify device is trusted for this member
    const deviceResult = await query(
      `SELECT id, device_name, device_type, trust_level, expires_at,
              biometry_enabled, biometry_type
       FROM trusted_devices
       WHERE id = $1 AND member_id = $2`,
      [deviceId, memberId]
    );

    if (deviceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Device not trusted. Sign in with password first.', code: 'DEVICE_NOT_FOUND' },
        { status: 403 }
      );
    }

    const device = deviceResult.rows[0];

    // Check if device trust has expired
    if (device.expires_at && new Date(device.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Device trust expired. Sign in with password again.', code: 'DEVICE_EXPIRED' },
        { status: 403 }
      );
    }

    // Update device last seen and sign-in count
    await query(
      `UPDATE trusted_devices
       SET last_seen_at = NOW(),
           sign_in_count = sign_in_count + 1,
           last_ip = $1::inet
       WHERE id = $2`,
      [getClientIP(request), deviceId]
    );

    // Create new session
    const session = await createSession({
      memberId,
      deviceId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    });

    // Set session cookie
    await setSessionCookie(session.sessionToken, session.expiresAt);

    // Log the biometric sign-in
    console.log(`[NativeBiometry] Sign-in via ${biometryType || 'biometry'} for member ${memberId} on device ${deviceId}`);

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        username: member.username,
        name: member.name,
        preferredName: resolveMemberDisplayName(member),
        onboarded: member.onboarded,
        tier: member.tier || 'free',
        hasWebauthn: member.has_webauthn || false,
        preferredAuthMethod: member.preferred_auth_method || 'password'
      },
      session: {
        token: session.sessionToken,
        expiresAt: session.expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('[NativeBiometry] Verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Extract client IP from request headers
 */
function getClientIP(request: NextRequest): string | null {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return null;
}
