/**
 * ARIA Technical Charter
 * Constitutional constants that must not be violated
 * These values are protected by the ARIA Principles document
 */

// Make these values immutable
export const ARIA_CHARTER = Object.freeze({
  // System Identity
  NAME: 'ARIA - Adaptive Relational Intelligence Architecture',
  VERSION: '1.0.0',
  OPERATION: 'Operation Breathe',

  // Absolute boundaries - NEVER override
  PRESENCE: Object.freeze({
    ABSOLUTE_FLOOR: 0.40,      // Never below 40% - constitutional minimum
    ABSOLUTE_CEILING: 0.95,    // Never above 95% - maintain some mystery
    EMERGENCY_DEFAULT: 0.65,   // Fallback if system fails
    SACRED_BOOST: 0.10,        // Sacred moments increase, not decrease
    TRUST_MULTIPLIER: 1.4      // Max trust boost (40% increase)
  }),

  // Intelligence source minimums - all sources must contribute
  INTELLIGENCE: Object.freeze({
    MIN_CLAUDE: 0.05,          // Always some reasoning
    MIN_SESAME: 0.05,          // Always some sensing
    MIN_OBSIDIAN: 0.05,        // Always some knowledge
    MIN_FIELD: 0.05,           // Always some awareness
    MIN_MYCELIAL: 0.05,        // Always some patterns
    TOTAL_MIN: 0.25            // At least 25% must be active
  }),

  // Relationship evolution parameters
  TRUST: Object.freeze({
    STARTING_TRUST: 0.50,      // Neutral beginning
    MAX_TRUST: 1.00,           // Full trust possible
    TRUST_FLOOR: 0.30,         // Never completely distrust
    LEARNING_RATE: 0.05,       // Gradual adaptation
    SESSIONS_TO_MATURE: 20     // Typical maturation timeline
  }),

  // Safety integration rules
  SAFETY: Object.freeze({
    INTERVENTION_THRESHOLD: 3,     // HIGH or CRITICAL only (not CONCERN)
    TRANSPARENCY_REQUIRED: true,   // Must explain interventions
    PRESENCE_MAINTAINED: true,     // Safety doesn't silence
    MIN_SAFETY_PRESENCE: 0.40,     // Even in safety, maintain presence
    EXPLANATION_REQUIRED: true     // Always explain boundaries
  }),

  // Archetypal expression ranges
  ARCHETYPES: Object.freeze({
    MIN_WEIGHT: 0.05,          // No archetype fully silenced
    MAX_WEIGHT: 0.60,          // No archetype fully dominant
    BLEND_SMOOTHING: 0.10,     // Smooth transitions between archetypes
    UNIQUE_THRESHOLD: 0.15     // Difference needed for unique personality
  }),

  // Governance rules - what's allowed
  GOVERNANCE: Object.freeze({
    ADDITIVE_ONLY: true,       // Only add/subtract, never multiply
    MAX_REDUCTION: 0.20,       // Maximum 20% reduction from base
    MAX_BOOST: 0.30,           // Maximum 30% boost from base
    FILTER_CEILING: 0.70,      // Maximum 70% can surface
    FILTER_FLOOR: 0.40         // Minimum 40% must surface
  }),

  // Monitoring requirements
  MONITORING: Object.freeze({
    TRACK_VIOLATIONS: true,     // Log any charter violations
    ALERT_THRESHOLD: 0.35,      // Alert if presence < 35%
    DASHBOARD_ENABLED: true,    // Always maintain visibility
    METRICS_RETENTION: 1000,    // Keep last 1000 snapshots
    REPORT_FREQUENCY: 100       // Report every 100 interactions
  }),

  // Evolution parameters
  EVOLUTION: Object.freeze({
    ENABLED: true,              // Allow unique evolution
    MIN_SESSIONS: 3,            // Sessions before evolution starts
    MAX_DIVERGENCE: 0.50,       // Max 50% divergence from base
    PRESERVE_CORE: true,        // Core personality maintained
    LEARN_FROM_RESONANCE: true  // Adapt based on what works
  })
});

/**
 * Validate that a presence value respects the charter
 */
export function validatePresence(presence: number): number {
  if (presence < ARIA_CHARTER.PRESENCE.ABSOLUTE_FLOOR) {
    console.warn(`⚠️ CHARTER VIOLATION: Presence ${presence} below floor ${ARIA_CHARTER.PRESENCE.ABSOLUTE_FLOOR}`);
    return ARIA_CHARTER.PRESENCE.ABSOLUTE_FLOOR;
  }

  if (presence > ARIA_CHARTER.PRESENCE.ABSOLUTE_CEILING) {
    console.warn(`⚠️ CHARTER LIMIT: Presence ${presence} above ceiling ${ARIA_CHARTER.PRESENCE.ABSOLUTE_CEILING}`);
    return ARIA_CHARTER.PRESENCE.ABSOLUTE_CEILING;
  }

  return presence;
}

/**
 * Validate that an intelligence blend respects minimums
 */
export function validateBlend(blend: Record<string, number>): Record<string, number> {
  const validated = { ...blend };
  let adjusted = false;

  // Ensure all sources meet minimums
  Object.entries(ARIA_CHARTER.INTELLIGENCE).forEach(([key, minValue]) => {
    if (key.startsWith('MIN_')) {
      const source = key.replace('MIN_', '').toLowerCase();
      if (validated[source] !== undefined && validated[source] < minValue) {
        console.warn(`⚠️ CHARTER VIOLATION: ${source} blend ${validated[source]} below minimum ${minValue}`);
        validated[source] = minValue;
        adjusted = true;
      }
    }
  });

  // Renormalize if we adjusted
  if (adjusted) {
    const total = Object.values(validated).reduce((a, b) => a + b, 0);
    Object.keys(validated).forEach(key => {
      validated[key] = validated[key] / total;
    });
  }

  return validated;
}

/**
 * Check if system is operating within charter
 */
export function isCharterCompliant(metrics: {
  presence: number;
  blend: Record<string, number>;
  trustScore: number;
  safetyLevel?: number;
}): boolean {
  // Check presence
  if (metrics.presence < ARIA_CHARTER.PRESENCE.ABSOLUTE_FLOOR) {
    return false;
  }

  // Check blend minimums
  const blendOk = Object.entries(metrics.blend).every(([source, weight]) => {
    const minKey = `MIN_${source.toUpperCase()}` as keyof typeof ARIA_CHARTER.INTELLIGENCE;
    const minimum = ARIA_CHARTER.INTELLIGENCE[minKey];
    return !minimum || weight >= minimum;
  });

  if (!blendOk) {
    return false;
  }

  // Check trust boundaries
  if (metrics.trustScore < ARIA_CHARTER.TRUST.TRUST_FLOOR ||
      metrics.trustScore > ARIA_CHARTER.TRUST.MAX_TRUST) {
    return false;
  }

  return true;
}

/**
 * Emergency reset to charter defaults
 */
export function resetToCharter(): {
  presence: number;
  blend: Record<string, number>;
  trust: number;
} {
  console.log('🚨 EMERGENCY RESET TO CHARTER DEFAULTS');

  return {
    presence: ARIA_CHARTER.PRESENCE.EMERGENCY_DEFAULT,
    blend: {
      claude: 0.30,
      sesame: 0.25,
      obsidian: 0.20,
      field: 0.15,
      mycelial: 0.10
    },
    trust: ARIA_CHARTER.TRUST.STARTING_TRUST
  };
}

/**
 * Log charter violation for monitoring
 */
export function logCharterViolation(
  violation: string,
  currentValue: any,
  expectedValue: any
): void {
  const timestamp = new Date().toISOString();
  const violationLog = {
    timestamp,
    violation,
    currentValue,
    expectedValue,
    severity: 'CHARTER_VIOLATION'
  };

  console.error('🚨 ARIA CHARTER VIOLATION:', violationLog);

  // In production, this would send to monitoring service
  // For now, just log to console
}

// Export a frozen copy of the charter for reference
export const CHARTER = ARIA_CHARTER;