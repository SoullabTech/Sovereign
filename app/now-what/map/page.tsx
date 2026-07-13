'use client';

/**
 * Now What? — Environment map, member clearance.
 *
 * The member's map of the rooms: what is open, what each door does.
 * Structure and routes live in the shared view — see
 * components/now-what/EnvironmentMapView.tsx for wiring, presence-tier
 * gates, and the TRUST_COPY gate note.
 */

import EnvironmentMapView from '@/components/now-what/EnvironmentMapView';

export default function NowWhatMapPage() {
  return <EnvironmentMapView viewer="member" />;
}
