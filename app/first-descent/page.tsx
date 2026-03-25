'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * First Descent — disabled.
 * Redirects to /maia.
 */
export default function FirstDescentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maia');
  }, [router]);

  return null;
}
