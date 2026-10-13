import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export const dynamic = 'force-dynamic';

/**
 * Practitioner-owned Studio preferences.
 *
 * SECURITY: studio_settings is a GLOBAL key/value table containing platform
 * configuration and potentially API credentials. Do not read it here.
 *
 * This compatibility route retains the existing video_room_url response shape,
 * but reads/writes the authenticated practitioner's row only. Other keys have
 * no access path through this endpoint. The schema migration must be admitted
 * before this candidate may be deployed.
 */
const PRACTITIONER_KEY = 'video_room_url';
const MAX_URL_LENGTH = 2048;

function parseVideoRoomUrl(value: unknown): { ok: true; value: string | null } | { ok: false } {
  if (value === null || value === '') return { ok: true, value: null };
  if (typeof value !== 'string' || value.length > MAX_URL_LENGTH) return { ok: false };

  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
      return { ok: false };
    }
  } catch {
    return { ok: false };
  }

  return { ok: true, value: trimmed };
}

export async function GET(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Practitioner access required' }, { status: 401 });
  }

  const key = new URL(request.url).searchParams.get('key');
  // Do not disclose global settings, secret presence, or arbitrary named keys.
  if (key && key !== PRACTITIONER_KEY) {
    return NextResponse.json({ error: 'Setting unavailable' }, { status: 403 });
  }

  try {
    const result = await query<{ video_room_url: string | null }>(
      'SELECT video_room_url FROM practitioner_settings WHERE practitioner_id = $1',
      [identity.practitionerId],
    );

    const entry = { key: PRACTITIONER_KEY, value: result.rows[0]?.video_room_url ?? null };
    // Preserve historical GET /settings (array) and GET /settings?key=... (object).
    return NextResponse.json(key ? entry : [entry]);
  } catch (error) {
    console.error('[Studio Settings] Scoped GET failed:', error instanceof Error ? error.name : 'error');
    return NextResponse.json({ error: 'Unable to load practitioner preferences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Practitioner access required' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || typeof body.key !== 'string') {
    return NextResponse.json({ error: 'Invalid setting' }, { status: 400 });
  }
  if (body.key !== PRACTITIONER_KEY) {
    return NextResponse.json({ error: 'Setting unavailable' }, { status: 403 });
  }

  const candidate = parseVideoRoomUrl(body.value);
  if (!candidate.ok) {
    return NextResponse.json({ error: 'Video room must be a valid HTTPS URL (max 2048 characters)' }, { status: 400 });
  }

  try {
    await query(
      `INSERT INTO practitioner_settings (practitioner_id, video_room_url)
       VALUES ($1, $2)
       ON CONFLICT (practitioner_id)
       DO UPDATE SET video_room_url = EXCLUDED.video_room_url, updated_at = NOW()`,
      [identity.practitionerId, candidate.value],
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Settings] Scoped POST failed:', error instanceof Error ? error.name : 'error');
    return NextResponse.json({ error: 'Unable to save practitioner preferences' }, { status: 500 });
  }
}
