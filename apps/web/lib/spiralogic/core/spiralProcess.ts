/**
 * Spiral Process - Core Spiralogic Movement Pattern
 * Implements the fundamental spiral dynamics of expansion/contraction
 */

export type Polarity = 'expansion' | 'contraction' | 'stillness';

export interface SpiralState {
  phase: number; // 0-2π representing position in spiral
  radius: number; // Distance from center
  polarity: Polarity;
  velocity: number;
  cycles: number; // Number of complete spirals
  depth: number; // Depth of consciousness exploration
}

export interface SpiralStep {
  state: SpiralState;
  vector: {
    direction: number; // Angle in radians
    magnitude: number;
  };
  insights: string[];
}

/**
 * Initialize a new spiral journey
 */
export function initializeSpiral(): SpiralState {
  return {
    phase: 0,
    radius: 1,
    polarity: 'expansion',
    velocity: 0.1,
    cycles: 0,
    depth: 0
  };
}

/**
 * Take one step in the spiral process
 */
export function spiralStep(state: SpiralState, intention?: string): SpiralStep {
  // Calculate new phase position
  const phaseIncrement = state.velocity * (state.polarity === 'expansion' ? 1 : -0.5);
  let newPhase = (state.phase + phaseIncrement) % (2 * Math.PI);
  
  // Track complete cycles
  let cycles = state.cycles;
  if (state.phase > newPhase && state.polarity === 'expansion') {
    cycles++;
  }
  
  // Adjust radius based on polarity
  let newRadius = state.radius;
  if (state.polarity === 'expansion') {
    newRadius = state.radius * 1.05; // Golden ratio approximation
  } else if (state.polarity === 'contraction') {
    newRadius = state.radius * 0.95;
  }
  
  // Determine polarity shift
  const newPolarity = determinePolarity(newPhase, cycles, intention);
  
  // Calculate depth of exploration
  const depth = calculateDepth(cycles, newRadius, state.velocity);
  
  // Generate insights based on spiral position
  const insights = generateSpiralInsights(newPhase, newPolarity, cycles);
  
  const newState: SpiralState = {
    phase: newPhase,
    radius: newRadius,
    polarity: newPolarity,
    velocity: adjustVelocity(state.velocity, newPolarity, depth),
    cycles,
    depth
  };
  
  return {
    state: newState,
    vector: {
      direction: newPhase,
      magnitude: newRadius * state.velocity
    },
    insights
  };
}

/**
 * Determine polarity based on phase and intention
 */
function determinePolarity(phase: number, cycles: number, intention?: string): Polarity {
  // Natural rhythm: expand for 3/4 of cycle, contract for 1/4
  const normalizedPhase = phase / (2 * Math.PI);
  
  if (intention?.includes('rest') || intention?.includes('pause')) {
    return 'stillness';
  }
  
  if (intention?.includes('expand') || intention?.includes('grow')) {
    return 'expansion';
  }
  
  if (intention?.includes('reflect') || intention?.includes('integrate')) {
    return 'contraction';
  }
  
  // Natural oscillation
  if (normalizedPhase < 0.75) {
    return 'expansion';
  } else {
    return 'contraction';
  }
}

/**
 * Calculate depth of consciousness based on spiral dynamics
 */
function calculateDepth(cycles: number, radius: number, velocity: number): number {
  // Depth increases with cycles but decreases with excessive speed
  const cycleDepth = Math.log(cycles + 1);
  const radiusDepth = Math.log(radius);
  const velocityFactor = 1 / (1 + velocity * 2); // Slower = deeper
  
  return (cycleDepth + radiusDepth) * velocityFactor;
}

/**
 * Adjust velocity based on polarity and depth
 */
function adjustVelocity(currentVelocity: number, polarity: Polarity, depth: number): number {
  if (polarity === 'stillness') {
    return 0;
  }
  
  if (polarity === 'contraction') {
    // Slow down during contraction for integration
    return currentVelocity * 0.7;
  }
  
  // Natural acceleration during expansion, modulated by depth
  const depthFactor = 1 / (1 + depth * 0.1);
  return Math.min(currentVelocity * 1.1 * depthFactor, 1);
}

/**
 * Generate insights based on spiral position
 */
function generateSpiralInsights(phase: number, polarity: Polarity, cycles: number): string[] {
  const insights: string[] = [];
  const normalizedPhase = phase / (2 * Math.PI);
  
  // Phase-based insights
  if (normalizedPhase < 0.25) {
    insights.push('New beginnings are emerging from the center');
  } else if (normalizedPhase < 0.5) {
    insights.push('Momentum is building toward manifestation');
  } else if (normalizedPhase < 0.75) {
    insights.push('Full expression is unfolding');
  } else {
    insights.push('Return and integration are calling');
  }
  
  // Polarity-based insights
  switch (polarity) {
    case 'expansion':
      insights.push('Opening to new possibilities');
      break;
    case 'contraction':
      insights.push('Drawing wisdom inward');
      break;
    case 'stillness':
      insights.push('Resting in the center of the spiral');
      break;
  }
  
  // Cycle-based insights
  if (cycles > 0 && cycles % 3 === 0) {
    insights.push(`Completing ${cycles} cycles - a trinity of experience`);
  }
  if (cycles > 7) {
    insights.push('Deep spiral mastery is emerging');
  }
  
  return insights;
}

/**
 * Create a toroidal flow by connecting spiral endpoints
 */
export function toroidalFlow(state: SpiralState): {
  innerFlow: SpiralState;
  outerFlow: SpiralState;
  connection: string;
} {
  // Inner flow moves toward center
  const innerFlow: SpiralState = {
    ...state,
    polarity: 'contraction',
    radius: state.radius * 0.618, // Golden ratio
    velocity: state.velocity * 1.2
  };
  
  // Outer flow moves toward periphery
  const outerFlow: SpiralState = {
    ...state,
    polarity: 'expansion',
    radius: state.radius * 1.618, // Golden ratio
    velocity: state.velocity * 0.8
  };
  
  const connection = state.cycles > 3
    ? 'Deep toroidal coherence established'
    : 'Toroidal flow is forming';
  
  return {
    innerFlow,
    outerFlow,
    connection
  };
}

/**
 * Apply feedback loop to spiral state
 */
export function feedbackLoop(
  state: SpiralState,
  feedback: any
): { state: SpiralState; integration: string } {
  // Feedback affects velocity and polarity
  let newVelocity = state.velocity;
  let newPolarity = state.polarity;
  
  if (feedback.resistance) {
    newVelocity *= 0.8;
    newPolarity = 'contraction';
  } else if (feedback.resonance) {
    newVelocity *= 1.2;
    newPolarity = 'expansion';
  } else if (feedback.completion) {
    newPolarity = 'stillness';
  }
  
  const newState: SpiralState = {
    ...state,
    velocity: Math.max(0, Math.min(1, newVelocity)),
    polarity: newPolarity,
    depth: state.depth + 0.1
  };
  
  const integration = feedback.completion
    ? 'Spiral cycle complete - integration achieved'
    : feedback.resonance
    ? 'Resonance amplifying spiral movement'
    : 'Feedback integrated into spiral flow';
  
  return {
    state: newState,
    integration
  };
}