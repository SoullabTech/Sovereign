import { notFound } from 'next/navigation';
import { doorwayById, doorwaysEnabled } from '@/lib/studios/doorways';
import { DoorwayJoin } from '@/components/studios/DoorwayJoin';
import { pathFromParam } from '@/lib/writersStudio/studioPaths';

/**
 * /doorway/[studio] — a Studio's own invitation sign-up (STUDIO-A-LA-CARTE-01 Phase 3).
 * Reached at writer./sound./guide./astrology.soullab.life/join via proxy.
 *
 * 404 unless STUDIO_DOORWAYS_ENABLED === 'true', read per request (force-dynamic) so the switch is a runtime setting,
 * not baked into the build. Web only: app/doorway is outside the iOS route allowlist (capacitor-patch-routes.sh).
 */
export const dynamic = 'force-dynamic';

export default async function DoorwayPage({ params, searchParams }: { params: Promise<{ studio: string }>; searchParams: Promise<{ path?: string }> }) {
  const { studio } = await params;
  const doorway = doorwayById(studio);
  if (!doorway || !doorwaysEnabled()) notFound();
  const requested = (await searchParams).path;
  const selectedPath = doorway.id === 'writer' && pathFromParam(requested)?.id === 'college-essay' ? 'college-essay' : undefined;
  return <DoorwayJoin studio={doorway.id} studioName={doorway.studioName} studioPath={doorway.studioPath} selectedPath={selectedPath} />;
}
