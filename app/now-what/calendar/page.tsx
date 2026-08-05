'use client';

/**
 * Now What? — My Calendar retired as a room (ontology consolidation,
 * NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md §2). Upcoming
 * conversations now live in My Coaching; commitments live in My Work.
 * This route redirects so no existing link or bookmark breaks.
 */

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CalendarRedirectInner() {
  const router = useRouter();
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;

  useEffect(() => {
    const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
    router.replace(`/now-what/coaching${ctx}`);
  }, [router, fieldContext]);

  return null;
}

export default function CalendarRoomPage() {
  return (
    <Suspense fallback={null}>
      <CalendarRedirectInner />
    </Suspense>
  );
}
