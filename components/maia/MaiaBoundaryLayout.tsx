'use client';

/**
 * MaiaBoundaryLayout — Lightweight shell for boundary routes
 *
 * Renders the left rail so navigation persists when users move
 * to Studio, Astrology, Lab Tools, or Circles. Stays thin:
 * only shared chrome (left rail + container), no page-specific logic.
 */

import { useRouter } from 'next/navigation';
import { MaiaLeftRail } from './MaiaLeftRail';
import { MAIA_WORLDS, RAIL_WIDTH_PX } from '@/lib/navigation/maiaNav';
import type { MaiaWorldId, BoundaryId } from '@/lib/navigation/types';

interface MaiaBoundaryLayoutProps {
  boundary: BoundaryId;
  children: React.ReactNode;
}

export function MaiaBoundaryLayout({ boundary, children }: MaiaBoundaryLayoutProps) {
  const router = useRouter();

  const handleWorldChange = (world: MaiaWorldId) => {
    const worldDef = MAIA_WORLDS.find(w => w.id === world);
    if (worldDef) {
      router.push(worldDef.route);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0d0b]">
      <MaiaLeftRail
        activeWorld={null}
        activeBoundary={boundary}
        calmMode={false}
        calmCeiling={false}
        onWorldChange={handleWorldChange}
      />
      <div style={{ paddingLeft: RAIL_WIDTH_PX }}>
        {children}
      </div>
    </div>
  );
}
