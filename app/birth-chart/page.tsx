'use client';

/**
 * Birth Chart Page
 * Redirects to /journey which contains the birth chart calculator
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BirthChartPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/journey');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] flex items-center justify-center">
      <div className="text-center">
        <div className="text-[#D4B896] text-lg">Redirecting to Birth Chart Calculator...</div>
      </div>
    </div>
  );
}
