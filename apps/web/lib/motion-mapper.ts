// Motion Mapper - Maps Claude responses to sacred motion states
import { MotionState, CoherenceShift } from '@/components/motion/MotionOrchestrator';
import { OracleResponse } from './oracle-response';

interface MotionMapping {
  motionState: MotionState;
  coherenceLevel: number;
  coherenceShift: CoherenceShift;
  shadowPetals: string[];
  aetherStage?: 1 | 2 | 3;
  isBreakthrough: boolean;
}

// Keywords that map to specific motion states
const MOTION_KEYWORDS = {
  listening: ['witness', 'observe', 'notice', 'awareness', 'present'],
  processing: ['considering', 'exploring', 'examining', 'reflecting', 'sensing'],
  responding: ['guidance', 'invitation', 'practice', 'offering', 'suggestion'],
  breakthrough: ['clarity', 'revelation', 'breakthrough', 'transformation', 'awakening']
};

// Keywords that indicate coherence levels
const COHERENCE_KEYWORDS = {
  high: ['alignment', 'flow', 'harmony', 'resonance', 'integration', 'clarity'],
  medium: ['exploring', 'shifting', 'emerging', 'developing', 'unfolding'],
  low: ['confusion', 'stuck', 'resistance', 'tension', 'conflict', 'scattered']
};

// Shadow work indicators
const SHADOW_KEYWORDS = {
  fire: ['anger', 'rage', 'control', 'ego', 'domination', 'aggression'],
  water: ['avoidance', 'fear', 'overwhelm', 'victim', 'passive', 'drowning'],
  earth: ['rigidity', 'stagnation', 'materialistic', 'stubborn', 'heavy'],
  air: ['scattered', 'ungrounded', 'overthinking', 'disconnected', 'mental']
};

// Aether state keywords
const AETHER_KEYWORDS = {
  expansive: ['expansion', 'mystery', 'infinite', 'cosmos', 'boundless', 'opening'],
  contractive: ['contraction', 'focus', 'essence', 'core', 'centering', 'gathering'],
  stillness: ['stillness', 'silence', 'void', 'emptiness', 'peace', 'presence']
};

export function mapResponseToMotion(responseText: string): MotionMapping {
  const lower = responseText.toLowerCase();
  
  // Initialize default motion state
  let mapping: MotionMapping = {
    motionState: 'idle',
    coherenceLevel: 0.5,
    coherenceShift: 'stable',
    shadowPetals: [],
    isBreakthrough: false
  };

  // Detect motion state from keywords
  let maxScore = 0;
  let detectedState: MotionState = 'idle';
  
  for (const [state, keywords] of Object.entries(MOTION_KEYWORDS)) {
    const score = keywords.filter(keyword => lower.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedState = state as MotionState;
    }
  }
  mapping.motionState = detectedState;

  // Detect coherence level
  const highCoherenceScore = COHERENCE_KEYWORDS.high.filter(k => lower.includes(k)).length;
  const lowCoherenceScore = COHERENCE_KEYWORDS.low.filter(k => lower.includes(k)).length;
  const mediumCoherenceScore = COHERENCE_KEYWORDS.medium.filter(k => lower.includes(k)).length;
  
  if (highCoherenceScore > lowCoherenceScore && highCoherenceScore > mediumCoherenceScore) {
    mapping.coherenceLevel = 0.7 + Math.random() * 0.2; // 0.7-0.9
  } else if (lowCoherenceScore > highCoherenceScore) {
    mapping.coherenceLevel = 0.2 + Math.random() * 0.2; // 0.2-0.4
  } else {
    mapping.coherenceLevel = 0.4 + Math.random() * 0.3; // 0.4-0.7
  }

  // Detect coherence shift based on sentiment transitions
  if (lower.includes('rising') || lower.includes('improving') || lower.includes('opening')) {
    mapping.coherenceShift = 'rising';
  } else if (lower.includes('falling') || lower.includes('closing') || lower.includes('diminishing')) {
    mapping.coherenceShift = 'falling';
  }

  // Detect shadow petals
  for (const [element, keywords] of Object.entries(SHADOW_KEYWORDS)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      // Map element to specific facet IDs (stage 2 often represents shadow)
      mapping.shadowPetals.push(`${element}-${element === 'fire' ? 'transform' : 
                                              element === 'water' ? 'flow' :
                                              element === 'earth' ? 'nurture' :
                                              'communicate'}`);
    }
  }

  // Detect Aether state
  if (AETHER_KEYWORDS.expansive.some(k => lower.includes(k))) {
    mapping.aetherStage = 1;
  } else if (AETHER_KEYWORDS.contractive.some(k => lower.includes(k))) {
    mapping.aetherStage = 2;
  } else if (AETHER_KEYWORDS.stillness.some(k => lower.includes(k))) {
    mapping.aetherStage = 3;
  }

  // Detect breakthrough moments
  if (lower.includes('breakthrough') || lower.includes('revelation') || 
      lower.includes('awakening') || lower.includes('transformation')) {
    mapping.isBreakthrough = true;
    mapping.motionState = 'breakthrough';
    mapping.coherenceLevel = Math.max(0.85, mapping.coherenceLevel);
  }

  return mapping;
}

export function enrichOracleResponse(
  baseResponse: Partial<OracleResponse>,
  responseText: string
): OracleResponse {
  const motionMapping = mapResponseToMotion(responseText);
  
  return {
    ...baseResponse,
    text: responseText,
    motionState: motionMapping.motionState,
    coherenceLevel: motionMapping.coherenceLevel,
    coherenceShift: motionMapping.coherenceShift,
    shadowPetals: motionMapping.shadowPetals,
    isBreakthrough: motionMapping.isBreakthrough,
    aetherState: motionMapping.aetherStage ? {
      stage: motionMapping.aetherStage,
      intensity: motionMapping.coherenceLevel
    } : undefined,
    primaryFacetId: baseResponse.primaryFacetId || 'fire-ignite',
    reflection: baseResponse.reflection || '',
    practice: baseResponse.practice || ''
  };
}

// Advanced motion mapping based on conversation context
export function mapConversationToMotion(
  currentQuery: string,
  previousResponses: OracleResponse[],
  checkIns: Record<string, number>
): MotionMapping {
  const baseMapping = mapResponseToMotion(currentQuery);
  
  // Analyze conversation trajectory
  if (previousResponses.length > 0) {
    const recentCoherence = previousResponses.slice(-3)
      .map(r => r.coherenceLevel || 0.5)
      .reduce((sum, val) => sum + val, 0) / Math.min(3, previousResponses.length);
    
    // Detect coherence trends
    if (baseMapping.coherenceLevel > recentCoherence + 0.15) {
      baseMapping.coherenceShift = 'rising';
    } else if (baseMapping.coherenceLevel < recentCoherence - 0.15) {
      baseMapping.coherenceShift = 'falling';
    }
  }
  
  // Factor in check-ins for shadow detection
  const activeCheckIns = Object.entries(checkIns)
    .filter(([_, intensity]) => intensity > 0.5)
    .map(([facetId]) => facetId);
  
  // If high-intensity check-ins don't align with current response theme,
  // they might indicate shadow work
  const elementCounts: Record<string, number> = {};
  activeCheckIns.forEach(facetId => {
    const element = facetId.split('-')[0];
    elementCounts[element] = (elementCounts[element] || 0) + 1;
  });
  
  // Detect imbalances
  const maxElement = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (maxElement && maxElement[1] > 2) {
    // Strong emphasis on one element might indicate shadow in others
    const shadowElements = ['fire', 'water', 'earth', 'air']
      .filter(e => e !== maxElement[0]);
    
    shadowElements.forEach(element => {
      if (!baseMapping.shadowPetals.includes(`${element}-flow`)) {
        baseMapping.shadowPetals.push(`${element}-flow`);
      }
    });
  }
  
  return baseMapping;
}