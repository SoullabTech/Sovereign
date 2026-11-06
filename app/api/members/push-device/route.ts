// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Register / remove the calling member's iOS device for push (P1, dark).
 *
 * The member is identified by a verified session credential, never by anything
 * in the body. Registering a device is the member's own act; it consents to no
 * particular notification and nothing sends to it yet.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const HEADERS = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const TOKEN = /^[0-9a-fA-F]{32,400}$/;
const APP_ID = /^[A-Za-z0-9.-]{3,120}$/;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: HEADERS });
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return json({ stub: true });
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return json({ error: 'Session required', code: 'NO_SESSION' }, 401);

    const body = (await request.json().catch(() => null)) as
      | { token?: unknown; environment?: unknown; appId?: unknown }
      | null;
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const environment = body?.environment;
    const appId = typeof body?.appId === 'string' ? body.appId.trim() : 'life.soullab.maia';

    if (!TOKEN.test(token)) return json({ error: 'A valid device token is required' }, 400);
    if (environment !== 'sandbox' && environment !== 'production') {
      return json({ error: 'environment must be sandbox or production' }, 400);
    }
    if (!APP_ID.test(appId)) return json({ error: 'A valid app id is required' }, 400);

    // A token names one physical device. A registration that is ACTIVE under another
    // member is never taken over: the guard sits inside the upsert, so there is no read
    // to race. A device changes hands lawfully only after the previous holder removed it
    // (sign-out) or Apple declared the token dead, which both leave it revoked.
    const result = await query<{ id: string }>(
      `INSERT INTO member_push_devices (member_id, platform, environment, token, app_id)
       VALUES ($1, 'ios', $2, $3, $4)
       ON CONFLICT (platform, environment, token)
       DO UPDATE SET member_id = EXCLUDED.member_id, app_id = EXCLUDED.app_id,
                     last_seen_at = now(), revoked_at = NULL, revoked_reason = NULL
        WHERE member_push_devices.member_id = EXCLUDED.member_id
           OR member_push_devices.revoked_at IS NOT NULL
       RETURNING id`,
      [memberId, environment, token.toLowerCase(), appId],
    );
    if (result.rows.length === 0) {
      return json(
        { error: 'This device is registered to another member. Sign out there first.', code: 'DEVICE_REGISTERED_ELSEWHERE' },
        409,
      );
    }
    return json({ success: true });
  } catch (error) {
    console.error('[PUSH-DEVICE] register failed');
    return json({ error: 'Could not register this device' }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return json({ stub: true });
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return json({ error: 'Session required', code: 'NO_SESSION' }, 401);

    const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
    const token = typeof body?.token === 'string' ? body.token.trim().toLowerCase() : '';
    if (!TOKEN.test(token)) return json({ error: 'A valid device token is required' }, 400);

    // Only the member's own registration can be removed.
    await query(
      `UPDATE member_push_devices SET revoked_at = now(), revoked_reason = 'member_removed'
        WHERE member_id = $1 AND token = $2 AND revoked_at IS NULL`,
      [memberId, token],
    );
    return json({ success: true });
  } catch (error) {
    console.error('[PUSH-DEVICE] remove failed');
    return json({ error: 'Could not remove this device' }, 500);
  }
}
