'use client';

/**
 * Retired placeholder (ontology ruling D-E, 2026-08-05): the member house
 * does not advertise unfinished software. The Reflections capability remains
 * held behind its recorded gates; when it ships it gets a room. Until then
 * this route redirects home so no door opens onto an explanation of absence.
 */

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function Redirect() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const ctx = params?.get('fieldContext');
    router.replace(`/now-what${ctx ? `?fieldContext=${encodeURIComponent(ctx)}` : ''}`);
  }, [router, params]);
  return null;
}

export default function ReflectionsRedirect() {
  return (
    <Suspense fallback={null}>
      <Redirect />
    </Suspense>
  );
}
