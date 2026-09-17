export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export const revalidate = false;

/**
 * W1 / SPM-F5 — legacy sovereignty deletion retirement.
 *
 * This route is intentionally addressable so old clients receive an explicit,
 * truthful retirement response instead of falling through to a destructive
 * implementation or a fabricated success response.
 *
 * It performs no identity lookup, no database read, no queue write, and no
 * deletion. The current account-control surface lives at /account/settings.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'legacy_sovereignty_retired',
      message: 'This legacy deletion endpoint is retired and performs no deletion.',
      accountChanged: false,
      nextStep: 'account_settings',
    },
    { status: 410 },
  );
}
