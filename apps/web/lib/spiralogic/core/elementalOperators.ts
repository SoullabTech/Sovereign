/**
 * Elemental Operators - Core Spiralogic Transformations
 * Each element represents a fundamental mode of consciousness transformation
 */

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

export interface ElementalState {
  dominant: Element;
  balance: Record<Element, number>;
  intensity: number;
  evolution: number; // 0-1, tracks user's progression
}

export interface TransformationResult {
  state: any;
  element: Element;
  metadata: {
    timestamp: number;
    intensity: number;
    insights: string[];
  };
}

/**
 * Fire: Activation, novelty, breakthrough, passion
 */
export function ignite(state: any): TransformationResult {
  return {
    state: {
      ...state,
      activation: (state.activation || 0) + 0.3,
      novelty: Math.random() * 0.5 + 0.5,
      temperature: 'rising',
      momentum: 'accelerating'
    },
    element: 'Fire',
    metadata: {
      timestamp: Date.now(),
      intensity: 0.8,
      insights: [
        'New pathways are opening',
        'Creative potential is igniting',
        'Breakthrough energy is building'
      ]
    }
  };
}

/**
 * Water: Flow, emotional resonance, dissolution, receptivity
 */
export function flow(state: any): TransformationResult {
  return {
    state: {
      ...state,
      fluidity: (state.fluidity || 0) + 0.4,
      emotionalDepth: Math.min((state.emotionalDepth || 0) + 0.2, 1),
      temperature: 'cooling',
      momentum: 'flowing'
    },
    element: 'Water',
    metadata: {
      timestamp: Date.now(),
      intensity: 0.6,
      insights: [
        'Emotions are finding their natural flow',
        'Resistance is dissolving',
        'Deep currents are revealing themselves'
      ]
    }
  };
}

/**
 * Earth: Grounding, structure, embodiment, manifestation
 */
export function ground(state: any): TransformationResult {
  return {
    state: {
      ...state,
      stability: (state.stability || 0) + 0.5,
      embodiment: Math.min((state.embodiment || 0) + 0.3, 1),
      temperature: 'stabilizing',
      momentum: 'rooting'
    },
    element: 'Earth',
    metadata: {
      timestamp: Date.now(),
      intensity: 0.7,
      insights: [
        'Foundation is strengthening',
        'Vision is taking form',
        'Practical wisdom is emerging'
      ]
    }
  };
}

/**
 * Air: Clarity, perspective, mental agility, communication
 */
export function clarify(state: any): TransformationResult {
  return {
    state: {
      ...state,
      clarity: Math.min((state.clarity || 0) + 0.4, 1),
      perspective: 'expanding',
      temperature: 'refreshing',
      momentum: 'lifting'
    },
    element: 'Air',
    metadata: {
      timestamp: Date.now(),
      intensity: 0.5,
      insights: [
        'New perspectives are emerging',
        'Mental fog is clearing',
        'Connections are becoming visible'
      ]
    }
  };
}

/**
 * Aether: Integration, synthesis, wholeness, transcendence
 */
export function integrate(state: any): TransformationResult {
  return {
    state: {
      ...state,
      wholeness: Math.min((state.wholeness || 0) + 0.3, 1),
      synthesis: true,
      temperature: 'harmonizing',
      momentum: 'centering',
      elementalBalance: balanceElements(state)
    },
    element: 'Aether',
    metadata: {
      timestamp: Date.now(),
      intensity: 0.9,
      insights: [
        'All elements are coming into harmony',
        'A new wholeness is emerging',
        'Integration is completing'
      ]
    }
  };
}

/**
 * Apply elemental transformation based on detected element
 */
export function applyElementalOperator(state: any, element: Element): TransformationResult {
  switch (element) {
    case 'Fire':
      return ignite(state);
    case 'Water':
      return flow(state);
    case 'Earth':
      return ground(state);
    case 'Air':
      return clarify(state);
    case 'Aether':
      return integrate(state);
    default:
      return integrate(state);
  }
}

/**
 * Detect dominant element from user input/state
 */
export function detectElement(input: string, state?: any): Element {
  const lowerInput = input.toLowerCase();
  
  // Fire indicators
  if (/breakthrough|passion|create|new|transform|ignite|burn|spark/.test(lowerInput)) {
    return 'Fire';
  }
  
  // Water indicators
  if (/feel|emotion|flow|dissolve|release|surrender|gentle|soft/.test(lowerInput)) {
    return 'Water';
  }
  
  // Earth indicators
  if (/ground|stable|practical|manifest|build|structure|body|physical/.test(lowerInput)) {
    return 'Earth';
  }
  
  // Air indicators
  if (/think|understand|clarity|perspective|mental|idea|concept|vision/.test(lowerInput)) {
    return 'Air';
  }
  
  // Aether indicators
  if (/whole|integrate|unity|transcend|sacred|divine|complete|synthesis/.test(lowerInput)) {
    return 'Aether';
  }
  
  // Default based on state evolution
  if (state?.evolution > 0.8) return 'Aether';
  if (state?.evolution > 0.6) return 'Air';
  if (state?.evolution > 0.4) return 'Earth';
  if (state?.evolution > 0.2) return 'Water';
  
  return 'Fire';
}

/**
 * Balance all elements in the state
 */
function balanceElements(state: any): Record<Element, number> {
  const currentBalance = state.elementalBalance || {};
  return {
    Fire: currentBalance.Fire || 0.2,
    Water: currentBalance.Water || 0.2,
    Earth: currentBalance.Earth || 0.2,
    Air: currentBalance.Air || 0.2,
    Aether: currentBalance.Aether || 0.2
  };
}

/**
 * Create initial elemental state for a user
 */
export function createInitialElementalState(): ElementalState {
  return {
    dominant: 'Fire',
    balance: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.2,
      Aether: 0.1
    },
    intensity: 0.5,
    evolution: 0
  };
}

/**
 * Update elemental state based on interaction
 */
export function updateElementalState(
  current: ElementalState,
  element: Element,
  intensity: number = 0.5
): ElementalState {
  const newBalance = { ...current.balance };
  
  // Increase the activated element
  newBalance[element] = Math.min(newBalance[element] + intensity * 0.1, 1);
  
  // Slightly decrease others to maintain balance
  Object.keys(newBalance).forEach(el => {
    if (el !== element) {
      newBalance[el as Element] = Math.max(newBalance[el as Element] - 0.02, 0);
    }
  });
  
  // Normalize to sum to 1
  const sum = Object.values(newBalance).reduce((a, b) => a + b, 0);
  Object.keys(newBalance).forEach(el => {
    newBalance[el as Element] /= sum;
  });
  
  // Evolution increases with Aether activation
  const evolution = element === 'Aether' 
    ? Math.min(current.evolution + 0.05, 1)
    : current.evolution + 0.01;
  
  return {
    dominant: element,
    balance: newBalance,
    intensity: intensity,
    evolution
  };
}