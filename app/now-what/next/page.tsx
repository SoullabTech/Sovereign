'use client';

/**
 * Now What? — retired as a standalone room (ontology ratified 2026-08-05,
 * see docs/design/now-what/NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md
 * §2). "What may be next" merged into My Work ("What you chose to live").
 * This page only redirects so no existing link or bookmark silently
 * breaks; it renders nothing itself.
 */

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NextRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;

  useEffect(() => {
    const qs = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
    router.replace(`/now-what/work${qs}`);
  }, [router, fieldContext]);

  return null;
}

export default function NowWhatNextPage() {
  return (
    <Suspense fallback={null}>
      <NextRedirect />
    </Suspense>
  );
}
