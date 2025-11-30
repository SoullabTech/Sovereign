/**
 * Priority Resolver
 * Decides which subsystem leads while maintaining unified presence
 * All subsystems report their claims; resolver chooses one clear voice
 */

export interface OrchestrationClaim {
  subsystem: string;           // e.g., 'catastrophicGuard', 'loopingProtocol'
  priority?: number;           // weight (lower = more urgent)
  confidence: number;          // 0-1 confidence in this response
  reason?: string;             // optional explanation for logs
  response: string;            // candidate response text
  metadata?: {
    elemental?: string;        // elemental tone to maintain
    urgency?: number;          // urgency level 0-1
    depth?: 'surface' | 'moderate' | 'deep';
  };
}

export interface OrchestrationDecision {
  leader: string;              // chosen subsystem
  response: string;            // what user hears
  fallback?: string;           // optional backup
  confidence: number;          // overall confidence in decision
  log: {
    reason?: string;
    claims: OrchestrationClaim[];
    decisionPath: string[];    // for debugging
  };
}

// Priority values (lower = higher precedence)
const PRIORITY_ORDER: Record<string, number> = {
  catastrophicGuard: 0,        // Always wins
  explicitBoundary: 1,         // User resistance
  urgency: 2,                  // Time pressure
  loopingProtocol: 3,          // Clarity seeking
  contemplativeSpace: 4,       // Sacred pause
  elementalResonance: 5,       // Tonal adjustment
  storyWeaver: 6,              // Narrative layer
  defaultWitness: 99           // Fallback
};

/**
 * Resolve multiple subsystem claims into single unified response
 */
export function resolvePriority(claims: OrchestrationClaim[]): OrchestrationDecision {
  const decisionPath: string[] = [];

  // Handle empty claims
  if (!claims.length) {
    decisionPath.push('No claims received, using default witness');
    return {
      leader: 'defaultWitness',
      response: "I'm here with you.",
      confidence: 0.5,
      log: {
        reason: 'No subsystem claims',
        claims: [],
        decisionPath
      }
    };
  }

  // Normalize claims with priorities
  const normalizedClaims = claims.map(claim => ({
    ...claim,
    priority: claim.priority ?? PRIORITY_ORDER[claim.subsystem] ?? 99
  }));

  decisionPath.push(`Received ${normalizedClaims.length} claims`);

  // Special handling for catastrophic - it always wins if present
  const catastrophic = normalizedClaims.find(c => c.subsystem === 'catastrophicGuard');
  if (catastrophic) {
    decisionPath.push('Catastrophic guard triggered - immediate priority');
    return {
      leader: 'catastrophicGuard',
      response: catastrophic.response,
      confidence: 1.0, // Always confident in safety responses
      log: {
        reason: catastrophic.reason || 'Safety priority',
        claims: normalizedClaims,
        decisionPath
      }
    };
  }

  // Sort by priority (lower value = higher priority)
  const sortedClaims = [...normalizedClaims].sort((a, b) => {
    // If priorities are equal, use confidence as tiebreaker
    if (a.priority === b.priority) {
      return b.confidence - a.confidence;
    }
    return a.priority - b.priority;
  });

  decisionPath.push(`Sorted claims by priority: ${sortedClaims.map(c => c.subsystem).join(', ')}`);

  // Apply confidence threshold
  const confidentClaims = sortedClaims.filter(c => c.confidence >= 0.3);

  if (confidentClaims.length === 0) {
    decisionPath.push('No confident claims, using highest confidence');
    // If no claims meet confidence threshold, use the most confident one
    const bestByConfidence = sortedClaims.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    return {
      leader: bestByConfidence.subsystem,
      response: bestByConfidence.response,
      confidence: bestByConfidence.confidence,
      fallback: "I'm present with you.",
      log: {
        reason: `Low confidence fallback (${bestByConfidence.confidence.toFixed(2)})`,
        claims: normalizedClaims,
        decisionPath
      }
    };
  }

  // Select the highest priority claim that meets confidence threshold
  const leader = confidentClaims[0];
  decisionPath.push(`Selected leader: ${leader.subsystem} (priority: ${leader.priority}, confidence: ${leader.confidence.toFixed(2)})`);

  // Check if we should blend in elemental resonance
  const elementalClaim = normalizedClaims.find(c => c.subsystem === 'elementalResonance');
  let finalResponse = leader.response;

  if (elementalClaim && leader.subsystem !== 'elementalResonance') {
    // Blend elemental tone into the response if not the leader
    decisionPath.push('Blending elemental resonance into response');
    // The actual blending would happen in a separate function
    // For now, we just note it in metadata
  }

  return {
    leader: leader.subsystem,
    response: finalResponse,
    confidence: leader.confidence,
    fallback: "I'm present with you.",
    log: {
      reason: leader.reason || `${leader.subsystem} has priority`,
      claims: normalizedClaims,
      decisionPath
    }
  };
}

/**
 * Compose unified presence from multiple supporting systems
 * This allows harmonization when appropriate
 */
export function composeWithSupport(
  decision: OrchestrationDecision,
  supportingSystems: string[] = []
): OrchestrationDecision {
  // If no supporting systems requested, return as-is
  if (supportingSystems.length === 0) {
    return decision;
  }

  const supportingClaims = decision.log.claims.filter(c =>
    supportingSystems.includes(c.subsystem)
  );

  if (supportingClaims.length === 0) {
    return decision;
  }

  // Here we would blend supporting elements into the response
  // For example, adding elemental tone or contemplative spacing
  // This is simplified for now

  decision.log.decisionPath.push(
    `Added support from: ${supportingClaims.map(c => c.subsystem).join(', ')}`
  );

  return decision;
}

/**
 * Apply confidence governor - falls back to witness if confidence too low
 */
export function applyConfidenceGovernor(
  decision: OrchestrationDecision,
  threshold: number = 0.4
): OrchestrationDecision {
  if (decision.confidence >= threshold) {
    return decision;
  }

  decision.log.decisionPath.push(
    `Confidence ${decision.confidence.toFixed(2)} below threshold ${threshold}, falling back to witness`
  );

  return {
    ...decision,
    leader: 'defaultWitness',
    response: decision.fallback || "I'm here with you.",
    log: {
      ...decision.log,
      reason: `Low confidence fallback from ${decision.leader}`
    }
  };
}