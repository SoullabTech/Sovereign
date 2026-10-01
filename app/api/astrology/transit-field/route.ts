/**
 * Transit Field API — the current sky meeting one natal chart.
 *
 * POST /api/astrology/transit-field
 *   body: { natal: Array<{ point: string; longitude: number }> }
 *   → calculated activations only (see lib/astrology/transitField.ts).
 *
 * The natal points are used for this calculation and not stored or logged.
 * No interpretation is produced here.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculateTransitField, type NatalPointInput } from '@/lib/astrology/transitField';

const MAX_POINTS = 32;

function parseNatal(value: unknown): NatalPointInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_POINTS) return null;
  const points: NatalPointInput[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const { point, longitude } = item as { point?: unknown; longitude?: unknown };
    if (typeof point !== 'string' || point.length > 40) return null;
    if (typeof longitude !== 'number' || !Number.isFinite(longitude)) return null;
    points.push({ point, longitude });
  }
  return points;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const natal = parseNatal(body?.natal);
  if (!natal) {
    return NextResponse.json({ success: false, error: 'natal points required' }, { status: 400 });
  }

  try {
    const field = calculateTransitField(natal, new Date());
    return NextResponse.json({ success: true, field });
  } catch {
    // Deliberately no natal data in the log line.
    console.error('[TransitField] calculation failed');
    return NextResponse.json({ success: false, error: 'Could not calculate the transit field' }, { status: 500 });
  }
}
