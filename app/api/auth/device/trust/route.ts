/**
 * Trust Current Device
 *
 * POST /api/auth/device/trust
 *
 * Marks the current device as trusted.
 */

export const dynamic = 'force-static'

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { hashIdentifier } from '@/lib/auth/passwordUtils';

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
    const { deviceName, trustLevel = 'standard' } = body;

    const userAgent = request.headers.get('user-agent') || '';

    // Create device fingerprint from user agent + session info
    const fingerprint = hashIdentifier(`${userAgent}:${session.memberId}`);

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent);

    // Check if device already trusted
    const existing = await query(
      `SELECT id FROM trusted_devices
       WHERE member_id = $1 AND device_fingerprint = $2`,
      [session.memberId, fingerprint]
    );

    if (existing.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE trusted_devices
         SET last_seen_at = NOW(), trust_level = $1
         WHERE id = $2`,
        [trustLevel, existing.rows[0].id]
      );

      return NextResponse.json({
        success: true,
        deviceId: existing.rows[0].id,
        message: 'Device trust updated'
      });
    }

    // Create new trusted device
    const result = await query(
      `INSERT INTO trusted_devices (
        member_id, device_fingerprint, device_name, device_type, browser, os, trust_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [
        session.memberId,
        fingerprint,
        deviceName || deviceInfo.deviceType,
        deviceInfo.deviceType,
        deviceInfo.browser,
        deviceInfo.os,
        trustLevel
      ]
    );

    return NextResponse.json({
      success: true,
      deviceId: result.rows[0].id,
      message: 'Device trusted'
    });

  } catch (error) {
    console.error('[Device] Trust error:', error);
    return NextResponse.json(
      { error: 'Failed to trust device' },
      { status: 500 }
    );
  }
}

function parseUserAgent(ua: string): {
  deviceType: string;
  browser: string;
  os: string;
} {
  let deviceType = 'desktop';
  let browser = 'Unknown';
  let os = 'Unknown';

  // Device type
  if (/Mobile|Android|iPhone|iPad/.test(ua)) {
    deviceType = /iPad|Tablet/.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser
  if (/Chrome/.test(ua) && !/Edge/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Edge/.test(ua)) browser = 'Edge';

  // OS
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS/.test(ua)) os = 'macOS';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Linux/.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}
