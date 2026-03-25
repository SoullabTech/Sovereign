/**
 * Persona Export — sovereignty portability
 *
 * GET /api/fields/[slug]/training/export → JSON bundle of all training data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFieldBySlug } from '@/lib/masters/registry';
import { getPersona } from '@/lib/stellium/personas';
import { exportPersonaBundle } from '@/lib/stellium/personaExport';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const field = getFieldBySlug(slug);
    if (!field?.practitionerId) {
      return NextResponse.json(
        { error: 'No practitioner linked to this field' },
        { status: 404 }
      );
    }

    const persona = await getPersona(field.practitionerId);
    if (!persona) {
      return NextResponse.json(
        { error: 'No persona found' },
        { status: 404 }
      );
    }

    const bundle = await exportPersonaBundle(field.practitionerId, persona.id);

    return NextResponse.json(bundle, {
      headers: {
        'Content-Disposition': `attachment; filename="persona-${slug}-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    console.error('[Export API] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Export failed' },
      { status: 500 }
    );
  }
}
