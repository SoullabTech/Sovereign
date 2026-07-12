'use client';

/**
 * Now What? — the room. Isolated reference embodiment (founder direction
 * 2026-07-06): the client experience lives in its own namespace
 * (app/now-what/*, /api/now-what/*) and does not modify framework surfaces.
 * The workshop loop here may earn its way into the shared architecture
 * through observation, not by direct integration.
 *
 * Query params:
 *   phase        — Spiralogic arc phase for the guided conversation (default fire_1)
 *   fieldContext — opaque field identifier (drives return detection + facilitator grouping)
 *   program      — program door within the field (catalog spec: the retreat link
 *                  carries the retreat door). Scopes the position block only;
 *                  the whole field stays composed either way.
 */

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { NowWhatRoom } from '@/components/now-what/NowWhatRoom';

function NowWhatRoomInner() {
  const params = useSearchParams();
  const phase = params?.get('phase') ?? 'fire_1';
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const program = params?.get('program') ?? undefined;

  return (
    <div className="min-h-screen bg-[#062a42] text-slate-200">
      <NowWhatRoom phase={phase} fieldContext={fieldContext} program={program} />
    </div>
  );
}

export default function NowWhatRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#062a42] flex items-center justify-center">
        <p className="text-slate-500 text-sm font-light">Opening the room…</p>
      </div>
    }>
      <NowWhatRoomInner />
    </Suspense>
  );
}
