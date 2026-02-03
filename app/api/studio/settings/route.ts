import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

/**
 * GET /api/studio/settings
 * Get studio settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const result = await sql`
        SELECT key, value FROM studio_settings WHERE key = ${key}
      `;
      return NextResponse.json(result[0] || null);
    }

    // Return all settings (mask sensitive values)
    const settings = await sql`
      SELECT key,
        CASE
          WHEN key LIKE '%token%' OR key LIKE '%secret%' OR key LIKE '%api_key%'
          THEN CASE WHEN value IS NOT NULL THEN '••••••••' ELSE NULL END
          ELSE value
        END as value,
        updated_at
      FROM studio_settings
    `;

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/studio/settings
 * Update a studio setting
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'key is required' },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO studio_settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = ${value},
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}
