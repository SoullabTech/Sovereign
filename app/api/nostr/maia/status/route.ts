export const dynamic = 'force-dynamic';

/**
 * GET /api/nostr/maia/status
 *
 * Phase 4 readiness check for MAIA Nostr identity.
 * No auth required — only returns public information (pubkeys, not privkeys).
 *
 * Returns readiness state for all configured service roles.
 * Use this to verify Phase 4 activation before calling /api/nostr/maia/reflect.
 */

import { NextResponse } from 'next/server';
import { checkPhase4Readiness, getServicePubkey, getMaiaRootPubkey, loadActiveDelegation } from '@/lib/nostr/maiaIdentity';
import type { MaiaServiceRole } from '@/lib/nostr/maiaIdentity';

const ALL_ROLES: MaiaServiceRole[] = ['oracle', 'support', 'retreat', 'practitioner_bridge'];

export async function GET() {
  const rootPubkey = getMaiaRootPubkey();

  const roles: Record<string, unknown> = {};

  for (const role of ALL_ROLES) {
    const readiness = await checkPhase4Readiness(role);
    const servicePubkey = getServicePubkey(role);
    const delegation = readiness.delegationCertActive
      ? await loadActiveDelegation(role)
      : null;

    roles[role] = {
      ready:                   readiness.ready,
      serviceKeyConfigured:    readiness.serviceKeyConfigured,
      delegationCertActive:    readiness.delegationCertActive,
      rootPubkeyConfigured:    readiness.rootPubkeyConfigured,
      // Public key info — safe to expose
      servicePubkey:           servicePubkey ?? null,
      delegationValidUntil:    delegation ? new Date(delegation.validUntil * 1000).toISOString() : null,
      delegationConditions:    delegation?.conditions ?? null,
    };
  }

  const anyReady = ALL_ROLES.some(r => (roles[r] as { ready: boolean }).ready);

  return NextResponse.json({
    phase4Active: anyReady,
    rootPubkey: rootPubkey ?? null,
    roles,
    checkedAt: new Date().toISOString(),
  });
}
