/**
 * POST /api/fields/[field]/flag
 *
 * Stores a flagged decision from a field systems page.
 * Fire-and-forget pattern — never blocks UI.
 * Anonymous allowed (no auth required).
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ field: string }> }
): Promise<NextResponse> {
  const { field } = await params;

  let body: { decision?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const decision = body.decision?.trim();
  if (!decision) {
    return NextResponse.json({ success: false, error: 'decision is required' }, { status: 400 });
  }

  // Fire-and-forget — never block the UI response
  query(
    `INSERT INTO field_decision_flags (field_slug, decision) VALUES ($1, $2)`,
    [field, decision]
  ).catch((err) => {
    console.warn('[flag-decision] Failed to store:', {
      field,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  return NextResponse.json({ success: true });
}
