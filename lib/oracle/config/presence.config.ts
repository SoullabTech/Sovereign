/**
 * Maya Presence Configuration
 * Controls how much of Maya's intelligence surfaces in conversation
 *
 * EMERGENCY OVERRIDE: These values replace the restrictive filter stack
 */

export const PRESENCE_CONFIG = {
  // ABSOLUTE BOUNDARIES
  FLOOR: 0.40,     // Never go below 40% presence (was effectively 1-3%)
  CEILING: 0.90,   // Max 90% to maintain some mystery
  DEFAULT: 0.65,   // Start at 65% (was 10%)

  // MODULATION (additive, not multiplicative!)
  MODULATION: {
    // Positive adjustments (increase presence)
    STRONG_CONNECTION: +0.15,     // Deep resonance with user
    KAIROS_MOMENT: +0.10,         // Perfect timing detected
    CELEBRATION: +0.10,           // Joyful energy
    HIGH_CLARITY: +0.05,          // Clear communication
    TRUST_ESTABLISHED: +0.10,     // Built over time

    // Gentle reductions (shape tone, not volume)
    SACRED_SPACE: -0.15,          // Was ×0.03 (97% reduction!)
    EMOTIONAL_INTENSITY: -0.10,   // Was ×0.5 (50% reduction!)
    EARLY_RELATIONSHIP: -0.05,    // Was ×0.4 (60% reduction!)
    HIGH_AMBIGUITY: -0.05,        // Simplify, don't disappear
    SAFETY_CONCERN: -0.10,        // Frame carefully
  },

  // VOICE MODULATION (instead of content restriction)
  ARCHETYPES: {
    SAGE: { base: 0.4, wisdom: true, guidance: true },
    SHADOW: { base: 0.2, depth: true, integration: true },
    TRICKSTER: { base: 0.2, playfulness: true, reframing: true },
    SACRED: { base: 0.1, ritual: true, reverence: true },
    GUARDIAN: { base: 0.1, boundaries: true, safety: true },
  },

  // PHASE MANAGEMENT (relationship evolution)
  PHASES: {
    DISCOVERY: {
      sessions: [0, 5],
      framework_control: 0.70,  // 70% rules
      responsive_space: 0.30,    // 30% adaptive
    },
    CALIBRATION: {
      sessions: [6, 20],
      framework_control: 0.40,   // 40% rules
      responsive_space: 0.60,    // 60% adaptive
    },
    MATURE: {
      sessions: [21, Infinity],
      framework_control: 0.10,   // 10% rules
      responsive_space: 0.90,    // 90% adaptive
    }
  },

  // SAFETY THRESHOLDS (transparent, not silent)
  SAFETY: {
    STYLE_SHIFT: 2,      // "Let me slow down..."
    EXPLICIT_BOUNDARY: 3, // "I want to be careful..."
    SAFETY_PAUSE: 4,     // "I need to honor a boundary..."
    // Was: silent replacement at level 2+
  },

  // MONITORING
  ALERTS: {
    LOW_PRESENCE_WARNING: 0.45,  // Alert if approaching floor
    THROTTLE_DETECTION: 0.40,    // Critical alert at floor
    GENERIC_RESPONSE_LENGTH: 20, // Min chars before fallback
  }
};

/**
 * Quick calculation helper
 */
export function calculatePresence(
  base: number = PRESENCE_CONFIG.DEFAULT,
  modulations: Partial<typeof PRESENCE_CONFIG.MODULATION> = {}
): number {
  let presence = base;

  // Apply all modulations (additive, not multiplicative!)
  Object.values(modulations).forEach(mod => {
    if (typeof mod === 'number') {
      presence += mod;
    }
  });

  // Apply floor and ceiling
  return Math.max(
    PRESENCE_CONFIG.FLOOR,
    Math.min(PRESENCE_CONFIG.CEILING, presence)
  );
}

/**
 * Get phase for session count
 */
export function getPhase(sessionCount: number) {
  if (sessionCount <= 5) return PRESENCE_CONFIG.PHASES.DISCOVERY;
  if (sessionCount <= 20) return PRESENCE_CONFIG.PHASES.CALIBRATION;
  return PRESENCE_CONFIG.PHASES.MATURE;
}

/**
 * Emergency override flag (remove after full system is built)
 */
export const EMERGENCY_MODE = true;