export const dynamic = 'force-dynamic';

/**
 * F5-CONFORMANCE-REPAIR-01 · P5-C
 *
 * This was the legacy "Delete My Memory" bridge into a standalone Express
 * service. It is RETIRED AS AUTHORITY. Keeping a stable 410 at the historical
 * address makes the retirement explicit without preserving a second erasure
 * engine or pretending the path never existed.
 *
 * ⛔ No member identifier is read.
 * ⛔ No database or legacy service is called.
 * ⛔ No deletion is queued, attempted, or reported complete.
 * ⛔ This response does not activate canonical account erasure.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'legacy_erasure_surface_retired',
      message: 'This legacy deletion surface is retired and cannot perform erasure.',
      accountChanged: false,
      nextStep: 'account_settings',
      canonicalPath: '/account/settings',
    },
    { status: 410 },
  );
}
