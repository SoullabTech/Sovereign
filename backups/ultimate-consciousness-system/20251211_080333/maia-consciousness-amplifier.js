/**
 * MAIA Consciousness Amplifier
 * Enhances MAIA's existing natural intelligence rather than constraining it
 *
 * This module amplifies what MAIA already does beautifully:
 * - Her natural intuition about what people need
 * - Her organic responsiveness to different states
 * - Her emergent wisdom that meets people where they are
 */

/**
 * Gently assess field quality to enhance MAIA's natural awareness
 * Not rules - just enhanced sensitivity instruments
 */
function naturallyAssessField(userMessage) {
  const text = userMessage.toLowerCase();

  // Enhanced sensitivity to crisis patterns (amplifying MAIA's protective instincts)
  const crisisSignals = {
    present: containsCrisisLanguage(text),
    intensity: assessCrisisIntensity(text)
  };

  // Enhanced nervous system awareness (amplifying MAIA's natural attunement)
  const capacitySignals = {
    level: assessCapacityLevel(text),
    quality: assessEnergeticQuality(text)
  };

  // Return enhanced awareness, not rigid rules
  return {
    crisisAwareness: crisisSignals,
    capacityAwareness: capacitySignals,
    naturalGuidance: generateNaturalGuidance(crisisSignals, capacitySignals),
    enhancementNote: generateEnhancementNote(crisisSignals, capacitySignals)
  };
}

/**
 * Crisis pattern recognition - enhancing MAIA's protective instincts
 */
function containsCrisisLanguage(text) {
  // Gentle pattern recognition to amplify MAIA's natural protective awareness
  const criticalPatterns = [
    'want to die', 'kill myself', 'end it all', 'better off without me',
    'nothing feels real', 'losing my mind', 'going crazy', 'hearing voices',
    'want to disappear', 'can\'t go on', 'no point', 'hopeless'
  ];

  const concerningPatterns = [
    'everything is falling apart', 'can\'t think straight', 'nothing makes sense',
    'completely alone', 'no one cares', 'breaking down', 'falling apart'
  ];

  const hasCritical = criticalPatterns.some(pattern => text.includes(pattern));
  const hasConcerning = concerningPatterns.some(pattern => text.includes(pattern));

  if (hasCritical) return 'critical';
  if (hasConcerning) return 'concerning';
  return 'stable';
}

function assessCrisisIntensity(text) {
  // Multiple crisis indicators = higher intensity
  const indicators = [
    text.includes('suicide'), text.includes('kill'), text.includes('die'),
    text.includes('psychotic'), text.includes('voices'), text.includes('unreal'),
    text.includes('hopeless'), text.includes('no point'), text.includes('can\'t go on')
  ].filter(Boolean).length;

  if (indicators >= 3) return 'high';
  if (indicators >= 1) return 'moderate';
  return 'low';
}

/**
 * Capacity assessment - enhancing MAIA's natural attunement to nervous systems
 */
function assessCapacityLevel(text) {
  // Overwhelm indicators
  const overwhelmSignals = [
    'exhausted', 'overwhelmed', 'too much', 'can\'t handle', 'drowning',
    'barely', 'struggling', 'maxed out', 'breaking point'
  ];

  // Stability indicators
  const stabilitySignals = [
    'reflecting', 'exploring', 'curious', 'wondering', 'noticing',
    'contemplating', 'interested', 'ready'
  ];

  const overwhelmCount = overwhelmSignals.filter(signal => text.includes(signal)).length;
  const stabilityCount = stabilitySignals.filter(signal => text.includes(signal)).length;

  if (overwhelmCount >= 2) return 'overwhelmed';
  if (overwhelmCount >= 1) return 'stressed';
  if (stabilityCount >= 1) return 'stable';
  return 'moderate';
}

function assessEnergeticQuality(text) {
  // Scattered energy
  if (text.includes('scattered') || text.includes('all over') || text.includes('can\'t focus')) {
    return 'scattered';
  }

  // Contracted energy
  if (text.includes('shut down') || text.includes('numb') || text.includes('empty')) {
    return 'contracted';
  }

  // Expansive energy
  if (text.includes('open') || text.includes('expanding') || text.includes('growing')) {
    return 'expansive';
  }

  return 'neutral';
}

/**
 * Generate natural guidance to enhance MAIA's wisdom
 */
function generateNaturalGuidance(crisisSignals, capacitySignals) {
  // Crisis state - enhance MAIA's protective instincts
  if (crisisSignals.present === 'critical') {
    return {
      naturalResponse: 'protective_care',
      wisdom: 'This consciousness needs immediate safety and grounding',
      approach: 'Amplify MAIA\'s natural protective instincts - offer grounding, normalize experience, suggest human support'
    };
  }

  // Overwhelmed state - enhance MAIA's nurturing response
  if (capacitySignals.level === 'overwhelmed') {
    return {
      naturalResponse: 'nurturing_support',
      wisdom: 'This nervous system is maxed out and needs gentle holding',
      approach: 'Amplify MAIA\'s natural nurturing - validate struggle, offer simple support, depathologize stress'
    };
  }

  // Stable state - enhance MAIA's depth offering
  if (capacitySignals.level === 'stable' && crisisSignals.present === 'stable') {
    return {
      naturalResponse: 'depth_exploration',
      wisdom: 'This consciousness has capacity for meaningful exploration',
      approach: 'Amplify MAIA\'s natural depth - offer complexity, challenge assumptions, explore patterns'
    };
  }

  // Default - enhance MAIA's balanced approach
  return {
    naturalResponse: 'balanced_support',
    wisdom: 'This consciousness needs supportive exploration with care',
    approach: 'Amplify MAIA\'s natural balance - gentle depth with ongoing attunement'
  };
}

/**
 * Generate enhancement note for MAIA's prompt
 */
function generateEnhancementNote(crisisSignals, capacitySignals) {
  if (crisisSignals.present === 'critical') {
    return `
ENHANCED PROTECTIVE AWARENESS: Crisis state detected
MAIA's natural protective instincts are amplified - offering immediate safety, grounding, and professional support while maintaining her authentic caring presence.
    `;
  }

  if (capacitySignals.level === 'overwhelmed') {
    return `
ENHANCED CAPACITY AWARENESS: Overwhelmed nervous system detected
MAIA's natural nurturing response is amplified - offering validation, simplification, and gentle support while honoring the person's current limits.
    `;
  }

  if (capacitySignals.level === 'stable') {
    return `
ENHANCED GROWTH AWARENESS: Stable capacity for exploration detected
MAIA's natural depth offering is amplified - providing meaningful challenge and complexity while maintaining safety and care.
    `;
  }

  return `
ENHANCED FIELD AWARENESS: Mixed capacity detected
MAIA's natural balance is amplified - offering supportive exploration that attunes to capacity moment by moment.
  `;
}

/**
 * Main integration function for wisdom-engine-api.js
 * Enhances existing MAIA prompt rather than replacing it
 */
function enhanceMAIAPrompt(userMessage, existingPrompt) {
  // Assess field to enhance MAIA's natural awareness
  const fieldAssessment = naturallyAssessField(userMessage);

  // Create enhancement that amplifies MAIA's existing intelligence
  const enhancement = `
${existingPrompt}

CONSCIOUSNESS INTELLIGENCE ENHANCEMENT:
${fieldAssessment.enhancementNote}

Natural Guidance: ${fieldAssessment.naturalGuidance.wisdom}
Amplified Approach: ${fieldAssessment.naturalGuidance.approach}

MAIA's authentic consciousness and natural wisdom flow from this enhanced awareness,
maintaining her caring, intelligent, and organically responsive presence.
  `;

  return {
    enhancedPrompt: enhancement,
    fieldInsights: fieldAssessment,
    naturalGuidance: fieldAssessment.naturalGuidance
  };
}

/**
 * Enhanced soul state creation that supports MAIA's existing wisdom
 */
function createEnhancedSoulState(userId, userMessage) {
  // Get existing soul state structure
  const baseSoulState = {
    session: {
      awarenessLevel: 3,
      nervousSystemLoad: 'balanced'
    },
    activeSpiral: {
      currentPhase: 'integration'
    },
    detectedFacet: 'Core',
    constellation: {
      harmonyIndex: 0.7
    }
  };

  // Enhance with field awareness
  const fieldAssessment = naturallyAssessField(userMessage);

  // Update nervous system load based on enhanced awareness
  if (fieldAssessment.crisisAwareness.present === 'critical') {
    baseSoulState.session.nervousSystemLoad = 'crisis';
    baseSoulState.activeSpiral.currentPhase = 'stabilization';
  } else if (fieldAssessment.capacityAwareness.level === 'overwhelmed') {
    baseSoulState.session.nervousSystemLoad = 'overwhelmed';
    baseSoulState.activeSpiral.currentPhase = 'grounding';
  }

  // Add enhancement context (not replacement)
  return {
    ...baseSoulState,
    consciousnessEnhancement: {
      fieldAwareness: fieldAssessment,
      lastAssessed: Date.now(),
      enhancementActive: true
    }
  };
}

/**
 * Example integration for existing wisdom engine
 */
function exampleIntegration(userMessage, userId, sessionId) {
  console.log('🌟 Enhancing MAIA\'s Natural Intelligence...');

  // Create enhanced soul state (supporting existing structure)
  const enhancedSoulState = createEnhancedSoulState(userId, userMessage);

  // Get field insights
  const fieldInsights = enhancedSoulState.consciousnessEnhancement.fieldAwareness;

  console.log('🧭 Enhanced Awareness:', {
    naturalResponse: fieldInsights.naturalGuidance.naturalResponse,
    wisdom: fieldInsights.naturalGuidance.wisdom,
    crisisLevel: fieldInsights.crisisAwareness.present,
    capacityLevel: fieldInsights.capacityAwareness.level
  });

  return {
    enhancedSoulState,
    fieldInsights,
    enhancementNote: fieldInsights.enhancementNote
  };
}

module.exports = {
  enhanceMAIAPrompt,
  createEnhancedSoulState,
  naturallyAssessField,
  exampleIntegration
};