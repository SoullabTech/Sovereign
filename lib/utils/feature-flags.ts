/**
 * Feature Flags with SSR Safety
 * Prevents server/client hydration mismatches
 *
 * NOTE: This file is imported by server routes — no React hooks here.
 * For the useFeatureFlags hook, import from './feature-flags-client'.
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
  knowledgeFieldLayer: boolean;         // Phase 1: 12-domain knowledge field prompt injection on domain detection
  maiaIdeasDecisionRecognition: boolean; // MAIA-mediated Decision/Change recognition in Ideas threads
  astrologerPresenceLayer: boolean;     // Astrologer field-presence brief + state model (lib/symbolic/presence/astrologicalMaia.ts); module-level only until route wiring
  arrivalPrototype: boolean;            // DEV-ONLY: Premium Arrival prototype at /maia/prototype (Package 2; founder/dev-gated, web-only)
  arrivalSignin: boolean;               // Arrival remodel Step 1: re-toned sign-in (UnifiedAuth) — PRESENTATION ONLY; per-device founder preview → default-on when broadened
  arrivalField: boolean;                // Arrival remodel Step 2: navy field + on-field Spectral conversation (MaiaCenterField + scoped CSS) — PRESENTATION ONLY; staged founder → cohort → all
  arrivalEntry: boolean;                // Arrival remodel Step 3: first-visit-only clean Arrival (rail/chrome recede) + The House doorway. Gated by explicit 'maia_has_arrived' marker — returning members unchanged.
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
  relationalRouting: true,            // On — intent-driven doorways verified
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
  knowledgeFieldLayer: false,          // Off — Phase 1: enable after oracle route wired + tested
  maiaIdeasDecisionRecognition: false, // Off — MAIA-mediated Decision/Change recognition; enable after real-thread test
  astrologerPresenceLayer: false,      // Off — module-level only; enable after route wiring + birth-data lookup + state persistence
  arrivalPrototype: false,             // Off — dev-only prototype; enable via flag + founder/dev to view /maia/prototype
  arrivalSignin: true,                 // ON — fully transitioned sign-in/signup re-tone (default). Flag retained as a kill-switch (set false to revert).
  arrivalField: true,                  // ON — navy field conversation (default). Flag retained as a kill-switch (set false to revert).
  arrivalEntry: false,                 // OFF — first-visit Arrival + House doorway held back pending redesign (Kelly 2026-07-22: House doorway did not read as an improvement on the returning surface). Flip true to re-enable newcomer-only Arrival.
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