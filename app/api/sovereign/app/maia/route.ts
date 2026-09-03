// backend: app/api/sovereign/app/maia/route.ts
//
// ═════════════════════════════════════════════════════════════════════════════
// STATUS:        STRUCTURALLY RETIRED — CMT-01 Step 3, 2026-09-03
// SUCCESSOR:     /api/sovereign/app/maia/list  (app/api/sovereign/app/maia/list/route.ts)
// SPEC:          docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §2
// ═════════════════════════════════════════════════════════════════════════════
//
// WHY THIS ROUTE IS RETIRED RATHER THAN CONVERGED
//
// This route assembled its own MAIA — its own context, its own gating, its own
// path into cognition — and reached `getMaiaResponse()` at two call sites that
// passed through none of the governed construction the live ingress uses. Under
// the canonical turn architecture a route has exactly two permitted
// dispositions: CONVERGED or STRUCTURALLY RETIRED. Never "dormant but still
// independently assembling MAIA."
//
// The evidence for retirement, recorded in the spec's migration record:
//
//   * no first-party client calls this path — every supported surface calls
//     /list;
//   * the remaining server-side references originate from deprecated routes,
//     one of them already HTTP 410;
//   * a 30-day production witness (`maia-caddy`, `--since 720h`, exact path,
//     excluding /list) returned zero matching entries in the retained logs.
//
// That is bounded operational evidence, not a claim the route was never called.
// It is why this is an EXPLICIT 410 and not a deleted file: an unexpected
// external caller gets an intelligible refusal that names the successor, never
// a mysterious 404.
//
// WHAT WAS REMOVED
//
// Both cognition call sites, every intelligence loader, the relational
// observation writes, the session and cognitive-profile machinery. Nothing
// here reads member memory, nothing here reaches cognition, and nothing here
// can be re-wired without the CMT-01 certification suite noticing — the
// cognition call-site closed set is pinned at four, and this file is asserted
// to contain none.
//
// Do not add conversation logic here. Do not "temporarily" restore the old
// handler. The successor is /list, and the seam is where convergence happens.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SUCCESSOR = '/api/sovereign/app/maia/list';

const RETIRED = {
  error: 'ROUTE_RETIRED',
  code: 'ROUTE_RETIRED',
  message:
    'This endpoint has been structurally retired. It assembled MAIA context outside the canonical turn seam and no longer reaches cognition.',
  successor: SUCCESSOR,
  retiredAt: '2026-09-03',
  authority: 'docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §2',
} as const;

function retired() {
  return NextResponse.json(RETIRED, {
    status: 410, // Gone — deliberately, with a pointer, never a 404
    headers: {
      'X-Route-Retired': '2026-09-03',
      'X-Recommended-Endpoint': SUCCESSOR,
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST() {
  return retired();
}

export async function GET() {
  return retired();
}
