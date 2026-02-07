/**
 * Admin System Settings API
 *
 * GET - Retrieve all or specific settings
 * POST - Update a setting
 *
 * Currently no auth - labtools is internal/dev only
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

/** Whitelist safe fields from system_settings rows */
function pickSettingFields(row: Record<string, unknown>) {
  return {
    key: row.key,
    value: row.value,
    description: row.description,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
  };
}

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key');

    if (key) {
      // Get specific setting
      const result = await query(
        `SELECT key, value, description, updated_at, updated_by FROM system_settings WHERE key = $1`,
        [key]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }

      return NextResponse.json(pickSettingFields(result.rows[0]));
    }

    // Get all settings
    const result = await query(
      `SELECT key, value, description, updated_at, updated_by FROM system_settings ORDER BY key`
    );

    return NextResponse.json({ settings: result.rows.map(pickSettingFields) });
  } catch (error) {
    console.error('[admin/settings] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, updatedBy } = body;

    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO system_settings (key, value, updated_at, updated_by)
       VALUES ($1, $2::jsonb, NOW(), $3)
       ON CONFLICT (key)
       DO UPDATE SET value = $2::jsonb, updated_at = NOW(), updated_by = $3
       RETURNING key, value, updated_at, updated_by`,
      [key, JSON.stringify(value), updatedBy || 'admin']
    );

    console.log(`[admin/settings] Updated ${key} = ${JSON.stringify(value)} by ${updatedBy || 'admin'}`);

    return NextResponse.json(pickSettingFields(result.rows[0]));
  } catch (error) {
    console.error('[admin/settings] POST error:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
