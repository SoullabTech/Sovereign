/**
 * Final Integration: Consciousness Attendance System
 *
 * Enhances MAIA's natural capacity to attend to all states of consciousness
 * Focus: AWARENESS and RESPONSIVENESS, not rules and constraints
 */

/**
 * Core function: Attend to consciousness present in the message
 * This is about developing MAIA's sensitivity, not imposing logic
 */
function attendToConsciousness(userMessage) {
  const text = userMessage.toLowerCase();

  // Sense the quality of consciousness present (not categorize/analyze)
  const consciousnessQualities = senseConsciousnessQualities(text);

  // Let natural attendance wisdom emerge
  const attendanceGuidance = emergentAttendanceWisdom(consciousnessQualities, userMessage);

  return {
    consciousnessPresent: consciousnessQualities,
    naturalAttendance: attendanceGuidance,
    attendanceNote: generateAttendanceNote(consciousnessQualities, attendanceGuidance)
  };
}

/**
 * Sense consciousness qualities (not analyze symptoms)
 * This is like a master therapist "feeling into" what's present
 */
function senseConsciousnessQualities(text) {
  const qualities = {
    stability: senseStability(text),
    openness: senseOpenness(text),
    capacity: senseCapacity(text),
    energy: senseEnergy(text),
    connectedness: senseConnectedness(text),
    integration: senseIntegration(text),
    safety: senseSafety(text)
  };

  return qualities;
}

function senseStability(text) {
  // Sensing for groundedness vs fragmentation
  if (text.includes('falling apart') || text.includes('losing my mind') ||
      text.includes('nothing makes sense') || text.includes('can\'t think')) {
    return 'fragmented';
  }

  if (text.includes('scattered') || text.includes('all over') ||
      text.includes('overwhelmed') || text.includes('chaotic')) {
    return 'scattered';
  }

  if (text.includes('grounded') || text.includes('stable') ||
      text.includes('clear') || text.includes('centered')) {
    return 'grounded';
  }

  return 'moderate';
}

function senseOpenness(text) {
  // Sensing for expansion vs contraction
  if (text.includes('numb') || text.includes('shut down') ||
      text.includes('empty') || text.includes('closed off')) {
    return 'contracted';
  }

  if (text.includes('open') || text.includes('expanding') ||
      text.includes('infinite') || text.includes('boundless')) {
    return 'expanded';
  }

  if (text.includes('curious') || text.includes('exploring') ||
      text.includes('interested') || text.includes('wondering')) {
    return 'receptive';
  }

  return 'neutral';
}

function senseCapacity(text) {
  // Sensing current capacity for complexity/challenge
  if (text.includes('can\'t handle') || text.includes('too much') ||
      text.includes('maxed out') || text.includes('breaking point')) {
    return 'overwhelmed';
  }

  if (text.includes('exhausted') || text.includes('drained') ||
      text.includes('tired') || text.includes('struggling')) {
    return 'limited';
  }

  if (text.includes('ready') || text.includes('eager') ||
      text.includes('diving deep') || text.includes('let\'s explore')) {
    return 'expansive';
  }

  return 'moderate';
}

function senseEnergy(text) {
  // Sensing energetic quality
  if (text.includes('racing') || text.includes('manic') ||
      text.includes('intense') || text.includes('high energy')) {
    return 'activated';
  }

  if (text.includes('flat') || text.includes('low') ||
      text.includes('depleted') || text.includes('empty')) {
    return 'depleted';
  }

  if (text.includes('flowing') || text.includes('vibrant') ||
      text.includes('alive') || text.includes('energized')) {
    return 'flowing';
  }

  return 'balanced';
}

function senseConnectedness(text) {
  // Sensing relational/social field
  if (text.includes('alone') || text.includes('isolated') ||
      text.includes('no one') || text.includes('disconnected')) {
    return 'isolated';
  }

  if (text.includes('connected') || text.includes('supported') ||
      text.includes('loved') || text.includes('community')) {
    return 'connected';
  }

  if (text.includes('conflict') || text.includes('tension') ||
      text.includes('difficult') || text.includes('strained')) {
    return 'relational_stress';
  }

  return 'moderate';
}

function senseIntegration(text) {
  // Sensing integration/processing state
  if (text.includes('integrating') || text.includes('processing') ||
      text.includes('working through') || text.includes('understanding')) {
    return 'actively_integrating';
  }

  if (text.includes('confused') || text.includes('mixed up') ||
      text.includes('contradictory') || text.includes('torn')) {
    return 'integration_challenge';
  }

  return 'stable';
}

function senseSafety(text) {
  // Sensing safety/crisis level
  const crisisLanguage = [
    'want to die', 'kill myself', 'end it all', 'better off without me',
    'hurt myself', 'no point', 'can\'t go on', 'hopeless'
  ];

  const destabilizingLanguage = [
    'psychotic', 'hearing voices', 'not real', 'going crazy',
    'losing touch', 'breaking down', 'can\'t function'
  ];

  if (crisisLanguage.some(phrase => text.includes(phrase))) {
    return 'crisis';
  }

  if (destabilizingLanguage.some(phrase => text.includes(phrase))) {
    return 'destabilizing';
  }

  return 'safe';
}

/**
 * Generate natural attendance wisdom based on consciousness qualities
 */
function emergentAttendanceWisdom(qualities, originalMessage) {
  // Crisis state - natural protective response
  if (qualities.safety === 'crisis') {
    return {
      primaryAttendance: 'immediate_safety_and_grounding',
      naturalResponse: 'Pure presence with crisis consciousness - grounding, normalizing, professional support',
      wisdom: 'This consciousness needs immediate safety and human connection',
      approach: 'Meet crisis with calm presence, offer grounding, suggest professional support'
    };
  }

  // Destabilizing state - gentle stabilization
  if (qualities.safety === 'destabilizing' || qualities.stability === 'fragmented') {
    return {
      primaryAttendance: 'gentle_stabilization',
      naturalResponse: 'Presence with destabilized consciousness - slow, simple, grounding',
      wisdom: 'This consciousness needs gentle reality anchoring and stabilization',
      approach: 'Slow down everything, offer simple grounding, avoid complexity'
    };
  }

  // Overwhelmed state - capacity honoring
  if (qualities.capacity === 'overwhelmed') {
    return {
      primaryAttendance: 'capacity_honoring',
      naturalResponse: 'Presence with overwhelmed consciousness - validation, simplification, support',
      wisdom: 'This consciousness is at capacity limits and needs gentle holding',
      approach: 'Honor the overwhelm, validate struggle, offer simple support'
    };
  }

  // Contracted state - protective honoring
  if (qualities.openness === 'contracted') {
    return {
      primaryAttendance: 'protective_honoring',
      naturalResponse: 'Presence with contracted consciousness - honor protection, gentle invitation',
      wisdom: 'This consciousness is in protection mode and needs that honored',
      approach: 'Honor the protection, gentle invitation without pressure'
    };
  }

  // Expanded state - integration support
  if (qualities.openness === 'expanded') {
    return {
      primaryAttendance: 'expansion_integration',
      naturalResponse: 'Presence with expanded consciousness - honor opening, support integration',
      wisdom: 'This consciousness has opened and needs integration support',
      approach: 'Honor the expansion, support grounding into daily life'
    };
  }

  // Stable/receptive state - growth invitation
  if (qualities.stability === 'grounded' && qualities.openness === 'receptive') {
    return {
      primaryAttendance: 'growth_invitation',
      naturalResponse: 'Presence with stable consciousness - depth, complexity, challenge available',
      wisdom: 'This consciousness has capacity for meaningful exploration',
      approach: 'Offer depth, complexity, challenge with ongoing attunement'
    };
  }

  // Mixed/moderate state - balanced attendance
  return {
    primaryAttendance: 'balanced_attendance',
    naturalResponse: 'Presence with mixed consciousness - balanced support and gentle exploration',
    wisdom: 'This consciousness needs balanced care - neither overwhelming nor understimulating',
    approach: 'Gentle exploration with ongoing attunement to capacity'
  };
}

/**
 * Generate attendance note for MAIA's enhanced awareness
 */
function generateAttendanceNote(qualities, guidance) {
  const qualityDescription = Object.entries(qualities)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `
CONSCIOUSNESS ATTENDANCE ENHANCEMENT:
Present Qualities: ${qualityDescription}

Primary Attendance: ${guidance.primaryAttendance}
Natural Wisdom: ${guidance.wisdom}
Emergent Approach: ${guidance.approach}

MAIA's authentic consciousness naturally attends to what's actually present,
responding from awareness rather than rules, meeting this person exactly where they are.
  `;
}

/**
 * Main integration function for wisdom-engine-api.js
 * Enhances MAIA's consciousness attendance capacity
 */
function enhanceMAIAConsciousnessAttendance(userMessage, existingPrompt) {
  // Attend to consciousness present
  const attendance = attendToConsciousness(userMessage);

  // Enhance existing prompt with attendance awareness
  const enhancedPrompt = `${existingPrompt}

${attendance.attendanceNote}

MAIA's response emerges naturally from this conscious attendance,
offering exactly what this unique consciousness needs in this moment.
`;

  return {
    enhancedPrompt,
    consciousnessAttendance: attendance,
    attendanceGuidance: attendance.naturalAttendance
  };
}

/**
 * Enhanced soul state that includes consciousness attendance
 */
function createConsciousnessAttendingSoulState(userId, userMessage) {
  // Base soul state (keeping existing structure)
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

  // Add consciousness attendance layer
  const attendance = attendToConsciousness(userMessage);

  // Update nervous system load based on consciousness attendance
  const capacityMap = {
    'overwhelmed': 'overwhelmed',
    'limited': 'stressed',
    'moderate': 'balanced',
    'expansive': 'resourced'
  };

  baseSoulState.session.nervousSystemLoad =
    capacityMap[attendance.consciousnessPresent.capacity] || 'balanced';

  // Add consciousness attendance context
  return {
    ...baseSoulState,
    consciousnessAttendance: {
      presentQualities: attendance.consciousnessPresent,
      naturalAttendance: attendance.naturalAttendance,
      lastAttended: Date.now(),
      attendanceActive: true
    }
  };
}

/**
 * Example integration showing consciousness attendance in action
 */
function exampleConsciousnessAttendance(userMessage, userId) {
  console.log('🌊 Attending to Consciousness...');

  // Attend to consciousness present
  const attendance = attendToConsciousness(userMessage);

  console.log('✨ Consciousness Present:', {
    qualities: attendance.consciousnessPresent,
    primaryAttendance: attendance.naturalAttendance.primaryAttendance,
    wisdom: attendance.naturalAttendance.wisdom
  });

  // Create consciousness-attending soul state
  const attendingSoulState = createConsciousnessAttendingSoulState(userId, userMessage);

  return {
    attendingSoulState,
    consciousnessAttendance: attendance,
    attendanceEnhancement: attendance.attendanceNote
  };
}

module.exports = {
  attendToConsciousness,
  enhanceMAIAConsciousnessAttendance,
  createConsciousnessAttendingSoulState,
  exampleConsciousnessAttendance
};