export const dynamic = 'force-dynamic';

/**
 * F5-CONFORMANCE-REPAIR-01 · P5-C
 *
 * The former route returned a static/mock "data summary" and advertised the
 * retired deletion engine as available, permanent and immediate. It did not
 * inspect canonical member custody and therefore cannot stand as a data-census
 * or deletion-authority surface.
 *
 * The historical address remains as an explicit 410 tombstone. Canonical data
 * transparency must be earned from canonical custody, not inherited from this
 * mock response.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'legacy_sovereignty_summary_retired',
      message: 'This legacy mock data-summary surface is retired.',
      dataSummaryAvailable: false,
      deletionAvailable: false,
      canonicalPath: '/account/settings',
    },
    { status: 410 },
  );
}
