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
  participatoryReality: boolean;        // Phase 1: types + prompt blocks ready; oracle wiring pending
  participatoryJournalingLens: boolean; // Phase 2: journal theme tagging
  participatoryPractitioner: boolean;   // Phase 3: studio pattern cards
  relationalRouting: boolean;           // v1: intent-driven doorways after oracle responses
  worldDoorways: boolean;               // v1: world-entry doorways from MAIA conversation
  cmPractitionerEnvironment: boolean;   // CM practitioner perceptual field (4-layer composition)
  soullabStore: boolean;                // Store/offerings surface for product purchases
  promptLibrary: boolean;               // Weekly elemental theme activation via prompt library
  spatialMaiaShell: boolean;            // Spatial restructuring: left rail + right panel + minimal top bar
  ichingPatternLayer: boolean;          // Phase 1: silent facet→hexagram mapping + logging
  daoistVoiceLayer: boolean;            // Phase 2+: Daoist expression refinement on oracle output
  calendarConsciousness: boolean;       // Schedule awareness in MAIA responses (disclosure-filtered)
  founderConsole: boolean;              // MAIA Ops: founder operational command center at /founder
  trustObservation: boolean;            // Phase 3: behavioral signal capture for affinity weighting
}

const DEFAULT_FLAGS: FeatureFlags = {
  enhancedOracle: true,
  voiceIntegration: true,
  collectiveIntelligence: false,
  betaOnboarding: true,
  masteryVoice: true,
  sacredGeometry: true,
  maiaOrchestratorV2: false,  // Default off, opt-in for beta testers
  participatoryReality: false,        // Off until Phase 2 wiring complete
  participatoryJournalingLens: false, // Off until Phase 2
  participatoryPractitioner: false,   // Off until Phase 3
  relationalRouting: false,           // Off until v1 tested
  worldDoorways: true,               // On — core experience shift
  cmPractitionerEnvironment: false,   // Off until v1 tested
  soullabStore: false,                // Off until store verified in production
  promptLibrary: false,               // Off until first theme seeded and tested
  spatialMaiaShell: true,             // On — spatial shell is the primary experience
  ichingPatternLayer: false,           // Off — Phase 1: silent observation first
  daoistVoiceLayer: false,             // Off — Phase 2+: voice shaping after observation
  calendarConsciousness: false,        // Off — wiring deferred until disclosure proven stable
  founderConsole: false,               // Off — Phase 1 build in progress
  trustObservation: false,             // Off — Phase 3 observation, enable after migration applied
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
      // Migrate: if spatialMaiaShell was never explicitly set (or was set to false
      // before it became the default), upgrade it. Users who manually disabled it
      // after it became default will have _spatialShellExplicit = true.
      if (!parsed._spatialShellExplicit && parsed.spatialMaiaShell === false) {
        parsed.spatialMaiaShell = true;
      }
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