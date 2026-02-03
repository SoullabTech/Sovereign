'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Birth Chart - Redirects to /patterns
 *
 * Legacy route. Astrology is now nested under Patterns
 * as one symbolic system among many.
 */
export default function BirthChartPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/patterns');
  }, [router]);

  return null;
}
