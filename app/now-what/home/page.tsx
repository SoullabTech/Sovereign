'use client';

/**
 * Retired shadow route (five-room ontology, 2026-08-05): this was a legacy
 * duplicate Client Home with zero inbound links, superseded by the
 * environment root `/now-what`. Caught by the disk→registry test on its
 * first run. One home, one route.
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

export default function LegacyHomeRedirect() {
  return (
    <Suspense fallback={null}>
      <Redirect />
    </Suspense>
  );
}
