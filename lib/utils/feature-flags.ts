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
  fieldTraining: boolean;               // V1: corrections, examples, preferences, builds
  livingNotebook: boolean;              // Living Notebook: capture + basic structuring
  livingNotebookActivation: boolean;    // Living Notebook: MAIA context injection
  memoryToolPilot: boolean;             // Server-side: Anthropic Memory Tool for selective retrieval (env: MAIA_MEMORY_TOOL_PILOT)
  masterDocumentUpload: boolean;        // Master field: document upload + extraction for Virtual Self training
  masterFields: boolean;                // Multi-master intelligence: field-scoped builds layered on MAIA
  relationalRouting: boolean;           // v1: intent-driven doorways after oracle responses
  cmPractitionerEnvironment: boolean;   // CM practitioner perceptual field (4-layer composition)
  sacredLearning: boolean;              // Sacred Study domain — daily encounter + corpus
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
  fieldTraining: false,               // Off until training UI ready
  livingNotebook: false,              // Off until Phase 1 complete
  livingNotebookActivation: false,    // Off until Phase 2 complete
  memoryToolPilot: false,             // Off; activate via MAIA_MEMORY_TOOL_PILOT=true in env
  masterDocumentUpload: false,        // Off until Jondi v1 validation
  masterFields: false,                // Off until master builds validated
  relationalRouting: false,           // Off until v1 tested
  cmPractitionerEnvironment: false,   // Off until v1 tested
  sacredLearning: false,              // Off until seed corpus reviewed and approved
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