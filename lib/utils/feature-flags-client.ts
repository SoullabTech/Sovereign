'use client';

import { useEffect, useState } from 'react';
import { type FeatureFlags, getFeatureFlags, setFeatureFlags } from './feature-flags';

/**
 * Hook for React components to use feature flags
 * Prevents hydration issues by using client-side only state
 */
export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setFlags(getFeatureFlags());
  }, []);

  const updateFlags = (newFlags: Partial<FeatureFlags>) => {
    if (isClient) {
      setFeatureFlags(newFlags);
      setFlags(prev => ({ ...prev, ...newFlags }));
    }
  };

  return {
    flags: isClient ? flags : getFeatureFlags(),
    updateFlags,
    isClient,
  };
};
