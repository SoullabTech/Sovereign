'use client';

import { useEffect } from 'react';
import { logFeatureFlags } from '@/lib/features/flags';

/**
 * Client-side component to log feature flags on app startup.
 * Renders nothing - just logs to console for TestFlight debugging.
 */
export default function FlagsDebug() {
  useEffect(() => {
    logFeatureFlags();
  }, []);
  return null;
}
