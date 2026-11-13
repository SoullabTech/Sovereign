import { notFound } from 'next/navigation';
import { doorwayById, doorwaysEnabled } from '@/lib/studios/doorways';
import { DoorwayJoin } from '@/components/studios/DoorwayJoin';

/**
 * /doorway/[studio] — a Studio's own invitation sign-up (STUDIO-A-LA-CARTE-01 Phase 3).
 * Reached at writer./sound./guide./astrology.soullab.life/join via proxy.
 *
 * 404 unless STUDIO_DOORWAYS_ENABLED === 'true', read per request (force-dynamic) so the switch is a runtime setting,
 * not baked into the build. Web only: app/doorway is outside the iOS route allowlist (capacitor-patch-routes.sh).
 */
export const dynamic = 'force-dynamic';

export default async function DoorwayPage({ params }: { params: Promise<{ studio: string }> }) {
  const { studio } = await params;
  const doorway = doorwayById(studio);
  if (!doorway || !doorwaysEnabled()) notFound();
  return <DoorwayJoin studio={doorway.id} studioName={doorway.studioName} studioPath={doorway.studioPath} />;
}
