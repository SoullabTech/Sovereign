export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export const revalidate = false;

/**
 * W1 / SPM-F5 — legacy sovereignty data-summary retirement.
 *
 * The former implementation returned fabricated account-data counts and
 * advertised deletion as available, permanent, and immediate for any path id.
 * This endpoint now reports only that the legacy surface is retired.
 *
 * It does not read account data, echo the requested user id, or make any
 * deletion-availability claim.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'legacy_sovereignty_retired',
      message: 'This legacy data-summary endpoint is retired.',
      accountChanged: false,
      nextStep: 'account_settings',
    },
    { status: 410 },
  );
}
