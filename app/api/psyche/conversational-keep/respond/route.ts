/**
 * POST /api/psyche/conversational-keep/respond
 *
 * KEEP-LEGACY-SURFACE-01-R1 — RETIRED.
 *
 * This Phase 1.5B endpoint formerly accepted legacy Keep affordance responses
 * and could mint or mutate member memory through applyConversationalKeepResult.
 * The canonical Keep contract now lives in the capsule flow:
 *
 *   UNDERSTAND -> FACILITATE -> member CONFIRM -> POST /api/capsules
 *
 * Keep this route as an explicit refusal so stale clients fail closed. Do not
 * add persistence, mutation, feature flags, or compatibility behavior here.
 */
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy conversational Keep response endpoint retired.',
      code: 'LEGACY_KEEP_RESPOND_RETIRED',
      use: '/api/capsules',
    },
    { status: 410 },
  );
}
