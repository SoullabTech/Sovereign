/**
 * POST /api/psyche/conversational-keep/respond
 *
 * RETIRED — KEEP-LEGACY-SURFACE-01-R1.
 *
 * This Phase 1.5B response surface used to own an independent conversational
 * Keep COMMIT path. Canonical Keep now follows:
 *
 *   UNDERSTAND → FACILITATE → COMMIT
 *
 * through the member-controlled capsule flow. PREPARE is non-persistent;
 * durable persistence begins only with the member's explicit confirmation at
 * POST /api/capsules.
 *
 * This route intentionally does not authenticate, parse a command body, mutate
 * offer-governor state, apply atom gestures, or import any persistence bridge.
 * Re-enabling it would create a second Keep authority and requires a new
 * governed ruling rather than removal of this refusal.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy conversational Keep response endpoint is retired.',
      code: 'LEGACY_KEEP_RESPOND_RETIRED',
      use: '/api/capsules',
      contract: 'UNDERSTAND → FACILITATE → COMMIT',
    },
    { status: 410 },
  );
}
