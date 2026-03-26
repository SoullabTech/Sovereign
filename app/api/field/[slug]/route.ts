export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PRACTITIONER FIELD API — Phase 1a
 *
 * GET /api/field/[slug]
 *
 * Returns a fully assembled PractitionerField for the given slug.
 * Data is DB-backed via resolveField(); falls back to sensible defaults
 * when field_config is absent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveField } from '@/lib/field/resolve';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const field = await resolveField(slug);

    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    return NextResponse.json(field);
  } catch (error) {
    console.error('[field/[slug]] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
