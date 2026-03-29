'use client';

import { useState, useEffect } from 'react';

const VISIT_KEY = 'maia_field_visits';
const THRESHOLD = 3;

/**
 * Temporary orientation block shown above the hero for a member's first few visits.
 * Fades out permanently after THRESHOLD visits.
 */
export function FirstVisitOrientation() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem(VISIT_KEY) ?? '0', 10);
    if (count < THRESHOLD) {
      setVisible(true);
      localStorage.setItem(VISIT_KEY, String(count + 1));
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="text-center space-y-6 pb-8 border-b border-white/5">
      <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
        This space reflects what has been unfolding for you over time.
      </p>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-white/30">
        <span>See what&apos;s present</span>
        <span className="text-white/10">&middot;</span>
        <span>Notice what&apos;s emerging</span>
        <span className="text-white/10">&middot;</span>
        <span>Continue where you left off</span>
      </div>
    </div>
  );
}
