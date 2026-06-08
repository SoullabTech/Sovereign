/**
 * Admin Substrate Monitor — read-only GET endpoint.
 *
 * Surfaces:
 *   - Static substrate inventory (lib/maia/substrateMap.ts)
 *   - Live runtime evidence (in-process ring buffer)
 *   - Derived capability claim status (correlation of the two)
 *
 * Authority: docs/architecture/MEMORY_SUBSTRATE_DIVERGENCE_MAP_2026-05-23.md
 *
 * No mutations. No member content. Process-local ring buffer — restart resets.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ACTIVE_SUBSTRATE,
  BYPASSED_SUBSTRATE,
  IMPOVERISHED_ROUTES,
  CAPABILITY_CLAIMS,
  type CapabilityStatus,
  type CapabilityClaim,
  type RuntimeEvidenceShape,
} from '@/lib/maia/substrateMap';
import {
  getRecentRuntimeTurns,
  getSubstrateActivity,
  getRuntimeSummary,
  type LayerObservation,
} from '@/lib/maia/substrateObservability';
import { buildProviderCognition } from '@/lib/maia/providerCognition';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 401 });
  }

  try {
    const [recentTurns, activity, summary] = await Promise.all([
      getRecentRuntimeTurns(50),
      getSubstrateActivity(),
      getRuntimeSummary(),
    ]);

    const claims = CAPABILITY_CLAIMS.map((claim) => ({
      ...claim,
      status: deriveStatus(claim, activity),
      lastObserved: claim.evidenceKey ? activity[claim.evidenceKey]?.lastSeen ?? null : null,
      observation: claim.evidenceKey ? activity[claim.evidenceKey] ?? null : null,
    }));

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      runtime: {
        summary,
        recentTurns,
      },
      // Cognition routing evidence — surfaced as its own lane, deliberately NOT a
      // memory-substrate claim. Provider fallback is not a memory-layer capability.
      providerCognition: buildProviderCognition(recentTurns, summary),
      activity,
      consumption: {
        active: ACTIVE_SUBSTRATE,
        bypassed: BYPASSED_SUBSTRATE,
        impoverishedRoutes: IMPOVERISHED_ROUTES,
      },
      claims,
    });
  } catch (error) {
    console.error('[admin/maia/substrate] error:', error);
    return NextResponse.json(
      { error: 'Failed to read substrate state' },
      { status: 500 },
    );
  }
}

function deriveStatus(
  claim: CapabilityClaim,
  activity: Record<string, LayerObservation>,
): CapabilityStatus {
  if (claim.staticStatus) return claim.staticStatus;
  if (claim.modules.length === 0) return 'not-built';
  if (claim.consumers.length === 0) return 'built-unwired';
  if (!claim.evidenceKey) return 'wired-unobserved';

  const key = claim.evidenceKey as keyof RuntimeEvidenceShape;
  const obs = activity[key];
  if (!obs || obs.okCount === 0) return 'wired-unobserved';
  if (obs.observedUnderAuthMember) return 'live-member-use';
  return 'observed-runtime';
}
