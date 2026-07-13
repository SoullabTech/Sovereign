'use client';

/**
 * Studio — the practitioner's map of his own environment.
 *
 * Larry authored this environment, but authorship doesn't confer intuition:
 * this page makes his own architecture visible to him — which rooms exist,
 * which are open, what each does for his clients.
 *
 * Clearance: STRUCTURE ONLY (presence tier 1). The practitioner sees the
 * structure of holding, never what's held. Tiers 2 (anonymous aliveness)
 * and 3 (who holds a position row) are sitting-gated — see the presence-tier
 * note in components/now-what/EnvironmentMapView.tsx before rendering
 * anything beyond rooms and doors here.
 */

import EnvironmentMapView from '@/components/now-what/EnvironmentMapView';

export default function StudioEnvironmentPage() {
  return <EnvironmentMapView viewer="practitioner" />;
}
