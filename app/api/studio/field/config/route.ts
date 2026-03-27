import { NextRequest, NextResponse } from 'next/server';
import { requirePractitioner } from '@/lib/auth/getCurrentPractitioner';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

/**
 * GET /api/studio/field/config
 * Load the practitioner's field_config JSONB.
 */
export async function GET(request: NextRequest) {
  const auth = await requirePractitioner(request);
  if ('error' in auth) return auth.error;
  const { identity } = auth;

  try {
    const result = await query(
      `SELECT field_config, slug, name FROM practitioners WHERE id = $1`,
      [identity.practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      fieldConfig: row.field_config ?? null,
      slug: row.slug,
      name: row.name,
    });
  } catch (error) {
    console.error('[studio/field/config] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load field config' }, { status: 500 });
  }
}

/**
 * PATCH /api/studio/field/config
 * Merge-update the practitioner's field_config JSONB.
 * Only writes to practitioners.field_config — no cognition, overlay, or master build changes.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requirePractitioner(request);
  if ('error' in auth) return auth.error;
  const { identity } = auth;

  try {
    const body = await request.json();
    const { fieldConfig } = body;

    if (!fieldConfig || typeof fieldConfig !== 'object') {
      return NextResponse.json(
        { success: false, error: 'fieldConfig object is required' },
        { status: 400 }
      );
    }

    // JSONB deep merge: existing || patch = merged
    await query(
      `UPDATE practitioners
       SET field_config = COALESCE(field_config, '{}'::jsonb) || $1::jsonb,
           updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(fieldConfig), identity.practitionerId]
    );

    // Return the updated config
    const result = await query(
      `SELECT field_config FROM practitioners WHERE id = $1`,
      [identity.practitionerId]
    );

    console.log('[studio/field/config] PATCH', {
      practitioner: identity.practitionerSlug,
      keys: Object.keys(fieldConfig),
    });

    return NextResponse.json({
      success: true,
      fieldConfig: result.rows[0]?.field_config ?? null,
    });
  } catch (error) {
    console.error('[studio/field/config] PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update field config' }, { status: 500 });
  }
}
