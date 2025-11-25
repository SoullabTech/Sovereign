/**
 * Feature Flags with SSR Safety
 * Prevents server/client hydration mismatches
 */

export interface FeatureFlags {
  enhancedOracle: boolean;
  voiceIntegration: boolean;
  collectiveIntelligence: boolean;
  betaOnboarding: boolean;
  masteryVoice: boolean;
  sacredGeometry: boolean;
  maiaOrchestratorV2: boolean;  // New orchestrator architecture
}

const DEFAULT_FLAGS: FeatureFlags = {
  enhancedOracle: true,
  voiceIntegration: true,
  collectiveIntelligence: false,
  betaOnboarding: true,
  masteryVoice: true,
  sacredGeometry: true,
  maiaOrchestratorV2: false,  // Default off, opt-in for beta testers
};

/**
 * Get feature flags with SSR safety
 * Returns default flags on server-side to prevent hydration issues
 */
export const getFeatureFlags = (): FeatureFlags => {
  // Return server-side defaults during SSR
  if (typeof window === 'undefined') {
    return DEFAULT_FLAGS;
  }
  
  try {
    const stored = localStorage.getItem('spiralogic-feature-flags');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all flags are present
      return { ...DEFAULT_FLAGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load feature flags from localStorage:', error);
  }
  
  return DEFAULT_FLAGS;
};

/**
 * Update feature flags (browser-only)
 */
export const setFeatureFlags = (flags: Partial<FeatureFlags>): void => {
  if (typeof window === 'undefined') {
    return; // Skip on server-side
  }
  
  try {
    const current = getFeatureFlags();
    const updated = { ...current, ...flags };
    localStorage.setItem('spiralogic-feature-flags', JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save feature flags to localStorage:', error);
  }
};

/**
 * Check if a specific feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return getFeatureFlags()[feature];
};

/**
 * Hook for React components to use feature flags
 * Prevents hydration issues by using client-side only state
 */
import { useEffect, useState } from 'react';

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
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
    flags: isClient ? flags : DEFAULT_FLAGS,
    updateFlags,
    isClient,
  };
};

/**
 * Development utilities
 */
export const enableAllFeatures = (): void => {
  const allEnabled = Object.keys(DEFAULT_FLAGS).reduce((acc, key) => {
    acc[key as keyof FeatureFlags] = true;
    return acc;
  }, {} as FeatureFlags);
  
  setFeatureFlags(allEnabled);
};

export const resetFeatureFlags = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('spiralogic-feature-flags');
  }
};