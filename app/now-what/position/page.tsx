'use client';

/**
 * Now What? — "Where you are" absorbed into My Coaching as a panel
 * (ontology consolidation, NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md
 * D-B). Program placement is relationship-context, not a standalone room.
 * This route redirects so no existing link or bookmark breaks.
 */

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PositionRedirectInner() {
  const router = useRouter();
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;

  useEffect(() => {
    const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
    router.replace(`/now-what/coaching${ctx}`);
  }, [router, fieldContext]);

  return null;
}

export default function NowWhatPositionPage() {
  return (
    <Suspense fallback={null}>
      <PositionRedirectInner />
    </Suspense>
  );
}
