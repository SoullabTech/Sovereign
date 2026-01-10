'use client';

/**
 * Birth Chart - Redirects to /astrology
 *
 * The birth chart functionality has been consolidated into /astrology.
 * This page now redirects to maintain backwards compatibility.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BirthChartPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/astrology');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand flex items-center justify-center">
      <div className="text-center">
        <div className="text-dune-amber animate-pulse">Redirecting to Blueprint...</div>
      </div>
    </div>
  );
}
