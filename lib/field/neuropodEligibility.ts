// Neuropod Protocol Eligibility Assessment
// Determines which protocol tiers a user can access based on:
// 1. Medical exclusions (health profile)
// 2. Developmental requirements (Bloom level, field stability, bypassing)
// 3. Membership tier

export interface NeuropodEligibility {
  tier1Access: boolean;
  tier2Access: boolean;
  tier3Access: boolean;
  recommendedProtocols: string[];
  exclusionReason?: string;
}

export interface NeuropodProtocolMetadata {
  tier: 1 | 2 | 3;
  requiredBloomLevel: number;
  requiredFieldStability: number;
  maxBypassingScore: number;
  exclusionFlags: ('psychosis' | 'dissociation' | 'seizure' | 'pregnancy' | 'pacemaker')[];
}

// Protocol tier requirements (maps to database neuropod_protocol_definitions)
export const PROTOCOL_TIERS: Record<string, NeuropodProtocolMetadata> = {
  // ========== TIER 1: Low-Risk Clinical ==========
  // Minimal exclusions, strong-to-moderate evidence, all users

  'breath-paced-grounding': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: ['pacemaker'], // Minimal exclusion
  },

  'breath-paced-vibroacoustic': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: ['pacemaker', 'pregnancy'], // Vibroacoustic safety unclear
  },

  'vibroacoustic-stress-reduction': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: ['pacemaker', 'pregnancy'],
  },

  'vibroacoustic-sleep-prep': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: ['pacemaker', 'pregnancy'],
  },

  'alpha-relaxation': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: [],
  },

  'vibroacoustic-grounding': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: ['pacemaker', 'pregnancy'],
  },

  // ========== TIER 2: Research-Only (Moderate Risk) ==========
  // Bloom 3+, field stability 0.6+, moderate screening

  'assr-receptive-absorption': {
    tier: 2,
    requiredBloomLevel: 3.0,
    requiredFieldStability: 0.6,
    maxBypassingScore: 0.4, // High bypassing → Tier 2 blocked
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'], // ASSR entrainment risk
  },

  'assr-contemplative-theta': {
    tier: 2,
    requiredBloomLevel: 3.0,
    requiredFieldStability: 0.6,
    maxBypassingScore: 0.4,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },

  'assr-gamma-insight': {
    tier: 2,
    requiredBloomLevel: 4.0, // Higher Bloom for gamma work
    requiredFieldStability: 0.7,
    maxBypassingScore: 0.3,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },

  'assr-hypnagogic-doorway': {
    tier: 2,
    requiredBloomLevel: 4.0, // Hypnagogic state = altered state risk
    requiredFieldStability: 0.7,
    maxBypassingScore: 0.3,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },

  'vibroacoustic-attention-reset': {
    tier: 2,
    requiredBloomLevel: 2.0,
    requiredFieldStability: 0.5,
    maxBypassingScore: 0.5,
    exclusionFlags: ['pacemaker', 'pregnancy'],
  },

  'vibroacoustic-somatic-exploration': {
    tier: 2,
    requiredBloomLevel: 4.0, // Somatic = shadow/trauma territory
    requiredFieldStability: 0.7,
    maxBypassingScore: 0.3, // High bypassing = somatic avoidance risk
    exclusionFlags: ['psychosis', 'dissociation', 'pacemaker', 'pregnancy'],
  },

  // ========== TIER 3: Experimental (Do Not Touch Yet) ==========
  // High risk, no timeline, reserved for future

  'gamma-focus-40hz': {
    tier: 3,
    requiredBloomLevel: 5.0,
    requiredFieldStability: 0.8,
    maxBypassingScore: 0.2,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },

  'theta-absorption': {
    tier: 3,
    requiredBloomLevel: 5.0,
    requiredFieldStability: 0.8,
    maxBypassingScore: 0.2,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },

  'wind-up-crescendo': {
    tier: 3,
    requiredBloomLevel: 5.0,
    requiredFieldStability: 0.8,
    maxBypassingScore: 0.2,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },

  'annealing-pathway': {
    tier: 3,
    requiredBloomLevel: 5.0,
    requiredFieldStability: 0.8,
    maxBypassingScore: 0.2,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },
};

/**
 * Assess user's Neuropod protocol eligibility
 *
 * Three-tier gate system:
 * 1. Medical exclusions (health profile)
 * 2. Developmental requirements (Bloom, stability, bypassing)
 * 3. Membership tier access (Foundation/Explorer/Pioneer)
 *
 * @param bloomLevel - Current Bloom level (0-6)
 * @param fieldStability - Field stability score (0-1)
 * @param bypassingScore - Bypassing score (0-1, higher = more bypassing)
 * @param exclusionFlags - Set of medical exclusion flags
 * @param membershipTier - User's membership tier
 * @returns Eligibility assessment with recommended protocols
 */
export function assessNeuropodEligibility(
  bloomLevel: number,
  fieldStability: number,
  bypassingScore: number,
  exclusionFlags: Set<string>,
  membershipTier: 'foundation' | 'explorer' | 'pioneer'
): NeuropodEligibility {
  const recommendedProtocols: string[] = [];
  let tier1Access = true;
  let tier2Access = false;
  let tier3Access = false;
  let exclusionReason: string | undefined;

  // Membership tier access
  const membershipTierAccess = {
    foundation: { tier1: true, tier2: false, tier3: false },
    explorer: { tier1: true, tier2: true, tier3: false },
    pioneer: { tier1: true, tier2: true, tier3: false }, // Tier 3 not offered yet
  };

  // Check each protocol for eligibility
  for (const [protocolId, metadata] of Object.entries(PROTOCOL_TIERS)) {
    // Skip if membership tier doesn't grant access
    if (metadata.tier === 2 && !membershipTierAccess[membershipTier].tier2) {
      continue;
    }
    if (metadata.tier === 3 && !membershipTierAccess[membershipTier].tier3) {
      continue;
    }

    // Check medical exclusions
    let medicallyExcluded = false;
    for (const flag of metadata.exclusionFlags) {
      if (exclusionFlags.has(flag)) {
        medicallyExcluded = true;
        if (metadata.tier === 1) {
          tier1Access = false;
          exclusionReason = `Medical exclusion: ${flag} - contact healthcare provider for Neuropod clearance`;
        }
        break;
      }
    }

    if (medicallyExcluded) {
      continue;
    }

    // Check developmental requirements
    if (
      bloomLevel >= metadata.requiredBloomLevel &&
      fieldStability >= metadata.requiredFieldStability &&
      bypassingScore <= metadata.maxBypassingScore
    ) {
      // Eligible for this protocol
      recommendedProtocols.push(protocolId);

      // Update tier access flags
      if (metadata.tier === 2) {
        tier2Access = true;
      }
      if (metadata.tier === 3) {
        tier3Access = true;
      }
    }
  }

  // Contextual recommendations based on field state
  if (recommendedProtocols.length > 0) {
    // Low field stability → recommend grounding
    if (fieldStability < 0.4) {
      const groundingProtocols = recommendedProtocols.filter(
        (id) => id.includes('grounding') || id.includes('breath-paced')
      );
      if (groundingProtocols.length > 0) {
        // Move grounding protocols to front
        recommendedProtocols.sort((a, b) => {
          const aIsGrounding = a.includes('grounding') || a.includes('breath-paced');
          const bIsGrounding = b.includes('grounding') || b.includes('breath-paced');
          if (aIsGrounding && !bIsGrounding) return -1;
          if (!aIsGrounding && bIsGrounding) return 1;
          return 0;
        });
      }
    }

    // High Bloom + high stability + low bypassing → recommend depth work
    if (bloomLevel >= 4.0 && fieldStability > 0.7 && bypassingScore < 0.3) {
      const depthProtocols = recommendedProtocols.filter(
        (id) => id.includes('assr') || id.includes('somatic')
      );
      if (depthProtocols.length > 0) {
        // Prioritize depth protocols
        recommendedProtocols.sort((a, b) => {
          const aIsDepth = a.includes('assr') || a.includes('somatic');
          const bIsDepth = b.includes('assr') || b.includes('somatic');
          if (aIsDepth && !bIsDepth) return -1;
          if (!aIsDepth && bIsDepth) return 1;
          return 0;
        });
      }
    }

    // Limit recommendations to top 3-5 most relevant
    if (recommendedProtocols.length > 5) {
      recommendedProtocols.splice(5);
    }
  }

  return {
    tier1Access,
    tier2Access,
    tier3Access,
    recommendedProtocols,
    exclusionReason,
  };
}

/**
 * Get human-readable description of why a protocol is restricted
 */
export function getProtocolRestrictionReason(
  protocolId: string,
  bloomLevel: number,
  fieldStability: number,
  bypassingScore: number,
  exclusionFlags: Set<string>
): string | null {
  const metadata = PROTOCOL_TIERS[protocolId];
  if (!metadata) {
    return 'Protocol not found';
  }

  // Check medical exclusions first
  for (const flag of metadata.exclusionFlags) {
    if (exclusionFlags.has(flag)) {
      return `Medical exclusion: ${flag}. Please consult with a healthcare provider before using this protocol.`;
    }
  }

  // Check developmental requirements
  if (bloomLevel < metadata.requiredBloomLevel) {
    return `This protocol requires Bloom level ${metadata.requiredBloomLevel}+ (you're at ${bloomLevel.toFixed(1)}). Continue engaging with complexity and pattern recognition.`;
  }

  if (fieldStability < metadata.requiredFieldStability) {
    return `This protocol requires field stability ${(metadata.requiredFieldStability * 100).toFixed(0)}%+ (you're at ${(fieldStability * 100).toFixed(0)}%). Focus on grounding and regulation practices first.`;
  }

  if (bypassingScore > metadata.maxBypassingScore) {
    return `This protocol requires bypassing score below ${(metadata.maxBypassingScore * 100).toFixed(0)}% (you're at ${(bypassingScore * 100).toFixed(0)}%). The system detects spiritual/intellectual bypassing patterns - work with Middleworld integration first.`;
  }

  // No restrictions - user is eligible
  return null;
}

/**
 * Get mythic messaging for protocol restriction
 * Returns developmentally-attuned language that holds dignity
 */
export function getMythicRestrictionMessage(
  bloomLevel: number,
  membershipTier: 'foundation' | 'explorer' | 'pioneer'
): string {
  if (bloomLevel < 2.0) {
    return `You're in an important phase of gathering knowledge and building foundations. The deeper protocols await, but your current work is essential preparation. Continue exploring the basics with curiosity.`;
  }

  if (bloomLevel >= 2.0 && bloomLevel < 3.0) {
    return `Your field is in an essential phase of deepening understanding. The research protocols are gated not to exclude, but to protect - they work best when the field is ready. Keep engaging with complexity.`;
  }

  if (bloomLevel >= 3.0 && bloomLevel < 4.0) {
    return `The advanced protocols await your pattern-weaving. You're close. Keep noticing patterns, analyzing architecture, and building coherent mental models. The gate will open when the field shows readiness.`;
  }

  if (membershipTier === 'foundation') {
    return `You've reached the developmental threshold for advanced protocols. Consider upgrading to Explorer tier to access ASSR entrainment and depth work.`;
  }

  // Bloom 4+, eligible tier, but still restricted for some reason
  return `Continue your practice with patience. The protocols will become available as your nervous system demonstrates readiness through biometric markers.`;
}
