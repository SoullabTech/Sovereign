/**
 * Talk Mode Field Intelligence
 *
 * Detects element, phase, spiral scale, and user state from conversation context.
 * This runs UNDERNEATH the conversational surface to power Talk mode responses.
 */

import type { Element, Phase } from './talkModePhraseLibrary';
import type { WisdomField } from './wisdomFieldMoves';
import { selectWisdomField } from './wisdomFieldMoves';

export type SpiralScale = 'micro' | 'meso' | 'macro' | 'collective';

export type UserState =
  | 'clear'
  | 'confused'
  | 'overwhelmed'
  | 'dysregulated'
  | 'stuck-story'
  | 'processing'
  | 'identity-crisis'
  | 'anxious'
  | 'frozen'
  | 'energized'
  | 'seeking';

export interface FieldIntelligence {
  element: Element;
  phase: Phase;
  spiralScale: SpiralScale;
  userState: UserState;
  complexity: 'simple' | 'moderate' | 'complex' | 'profound';
  recommendedWisdomField: WisdomField;
  confidence: number; // 0-1
}

/**
 * Detect element from message content and keywords
 */
function detectElement(message: string, conversationHistory?: any[]): {
  element: Element;
  confidence: number;
} {
  const msg = message.toLowerCase();

  // Fire keywords: vision, future, passion, create, start, ignite, bold, launch
  const fireScore =
    (msg.match(/\b(vision|future|dream|create|start|ignite|bold|launch|passion|excite|new|begin)\b/g) || []).length;

  // Water keywords: feel, emotion, flow, transform, release, deep, process, shift
  const waterScore =
    (msg.match(/\b(feel|emotion|flow|transform|release|deep|process|shift|change|let go|surrender)\b/g) || []).length;

  // Earth keywords: build, structure, foundation, concrete, body, ground, physical, stable
  const earthScore =
    (msg.match(/\b(build|structure|foundation|concrete|body|ground|physical|stable|organize|routine)\b/g) || []).length;

  // Air keywords: think, understand, meaning, communicate, clarity, perspective, know, idea
  const airScore =
    (msg.match(/\b(think|understand|meaning|communicate|clarity|perspective|know|idea|concept|story)\b/g) || []).length;

  // Aether keywords: purpose, align, integrate, essence, sacred, whole, calling, vow
  const aetherScore =
    (msg.match(/\b(purpose|align|integrate|essence|sacred|whole|calling|vow|soul|spirit|true)\b/g) || []).length;

  const scores = {
    Fire: fireScore,
    Water: waterScore,
    Earth: earthScore,
    Air: airScore,
    Aether: aetherScore
  };

  const maxScore = Math.max(...Object.values(scores));
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  // If no strong signal, default to Air (thinking/processing)
  if (maxScore === 0) {
    return { element: 'Air', confidence: 0.3 };
  }

  const element = (Object.keys(scores) as Element[]).find(k => scores[k] === maxScore) || 'Air';
  const confidence = Math.min(maxScore / (total + 1), 0.9); // Cap at 0.9

  return { element, confidence };
}

/**
 * Detect phase from message content
 */
function detectPhase(message: string): {
  phase: Phase;
  confidence: number;
} {
  const msg = message.toLowerCase();

  // Intelligence phase: seeking clarity, understanding, seeing patterns
  const intelligenceScore =
    (msg.match(/\b(understand|see|know|realize|notice|wonder|question|why|what|pattern|sense)\b/g) || []).length;

  // Intention phase: choosing, deciding, committing, declaring
  const intentionScore =
    (msg.match(/\b(choose|decide|commit|want|need|should|direction|path|declare|vow)\b/g) || []).length;

  // Goal phase: doing, executing, building, making real
  const goalScore =
    (msg.match(/\b(do|make|build|create|execute|act|step|move|implement|start|begin)\b/g) || []).length;

  const scores = {
    Intelligence: intelligenceScore,
    Intention: intentionScore,
    Goal: goalScore
  };

  const maxScore = Math.max(...Object.values(scores));
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  // Default to Intelligence if unclear (most conversations start with sensemaking)
  if (maxScore === 0) {
    return { phase: 'Intelligence', confidence: 0.5 };
  }

  const phase = (Object.keys(scores) as Phase[]).find(k => scores[k] === maxScore) || 'Intelligence';
  const confidence = Math.min(maxScore / (total + 1), 0.9);

  return { phase, confidence };
}

/**
 * Detect spiral scale (micro/meso/macro/collective)
 */
function detectSpiralScale(message: string): {
  spiralScale: SpiralScale;
  confidence: number;
} {
  const msg = message.toLowerCase();

  // Micro: today, now, moment, immediate, right now
  const microScore =
    (msg.match(/\b(today|now|moment|immediate|right now|tonight|hour|minute)\b/g) || []).length;

  // Meso: week, month, project, relationship, season
  const mesoScore =
    (msg.match(/\b(week|month|project|relationship|season|quarter|phase|chapter)\b/g) || []).length;

  // Macro: year, life, career, identity, direction
  const macroScore =
    (msg.match(/\b(year|life|career|identity|direction|calling|vocation|path|journey)\b/g) || []).length;

  // Collective: community, culture, world, collective, shared
  const collectiveScore =
    (msg.match(/\b(community|culture|world|collective|shared|society|team|group)\b/g) || []).length;

  const scores = {
    micro: microScore,
    meso: mesoScore,
    macro: macroScore,
    collective: collectiveScore
  };

  const maxScore = Math.max(...Object.values(scores));
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  // Default to meso (most conversations are about projects/relationships/seasons)
  if (maxScore === 0) {
    return { spiralScale: 'meso', confidence: 0.4 };
  }

  const spiralScale = (Object.keys(scores) as SpiralScale[]).find(k => scores[k] === maxScore) || 'meso';
  const confidence = Math.min(maxScore / (total + 1), 0.8);

  return { spiralScale, confidence };
}

/**
 * Detect user state from message content and tone
 */
function detectUserState(message: string): {
  userState: UserState;
  confidence: number;
} {
  const msg = message.toLowerCase();

  // Patterns for different states
  const statePatterns: Record<UserState, RegExp[]> = {
    'overwhelmed': [
      /\b(overwhelm|too much|can't|all over|spinning|chaos|scattered)\b/,
      /\b(don't know where|so many|everything)\b/
    ],
    'dysregulated': [
      /\b(anxious|panic|freeze|shut down|can't think|numb)\b/,
      /\b(heart racing|shaking|collapsed)\b/
    ],
    'stuck-story': [
      /\b(always|never|every time|same pattern|again|keeps happening)\b/,
      /\b(story|narrative|belief|convince)\b/
    ],
    'confused': [
      /\b(confused|unclear|not sure|don't understand|lost|foggy)\b/,
      /\b(what does|why is|how do)\b/
    ],
    'processing': [
      /\b(feel|feeling|sense|noticing|aware|realize)\b/,
      /\b(process|working through|sitting with)\b/
    ],
    'identity-crisis': [
      /\b(who am i|identity|don't know myself|lost myself|not me)\b/,
      /\b(role|mask|persona|authentic)\b/
    ],
    'anxious': [
      /\b(worried|anxious|nervous|afraid|scared|fear)\b/,
      /\b(what if|might|could)\b/
    ],
    'frozen': [
      /\b(stuck|paralyzed|can't move|frozen|immobile)\b/,
      /\b(can't decide|can't act)\b/
    ],
    'energized': [
      /\b(excited|energized|ready|motivated|pumped)\b/,
      /\b(let's go|want to|can't wait)\b/
    ],
    'seeking': [
      /\b(looking for|seeking|need|want|searching)\b/,
      /\b(help|guidance|direction|clarity)\b/
    ],
    'clear': [
      /\b(clear|know|understand|see|get it|ready)\b/,
      /\b(confident|certain|sure)\b/
    ]
  };

  // Score each state
  const scores: Record<UserState, number> = {
    clear: 0,
    confused: 0,
    overwhelmed: 0,
    dysregulated: 0,
    'stuck-story': 0,
    processing: 0,
    'identity-crisis': 0,
    anxious: 0,
    frozen: 0,
    energized: 0,
    seeking: 0
  };

  for (const [state, patterns] of Object.entries(statePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(msg)) {
        scores[state as UserState]++;
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  // Default to 'seeking' if unclear (most people come seeking something)
  if (maxScore === 0) {
    return { userState: 'seeking', confidence: 0.4 };
  }

  const userState = (Object.keys(scores) as UserState[]).find(k => scores[k] === maxScore) || 'seeking';
  const confidence = Math.min(maxScore / (total + 1), 0.85);

  return { userState, confidence };
}

/**
 * Detect message complexity
 */
function detectComplexity(message: string): 'simple' | 'moderate' | 'complex' | 'profound' {
  const words = message.trim().split(/\s+/).length;
  const sentences = message.split(/[.!?]+/).length;
  const hasPhilosophical = /\b(meaning|purpose|existence|truth|reality|consciousness)\b/i.test(message);
  const hasEmotional = /\b(feel|emotion|heart|pain|love|fear|grief)\b/i.test(message);

  if (words <= 10) return 'simple';
  if (words > 50 && hasPhilosophical) return 'profound';
  if (words > 30 && (hasPhilosophical || hasEmotional)) return 'complex';
  return 'moderate';
}

/**
 * Main field intelligence analyzer
 */
export function analyzeFieldIntelligence(
  message: string,
  conversationHistory?: any[]
): FieldIntelligence {
  const elementDetection = detectElement(message, conversationHistory);
  const phaseDetection = detectPhase(message);
  const scaleDetection = detectSpiralScale(message);
  const stateDetection = detectUserState(message);
  const complexity = detectComplexity(message);

  // Select appropriate wisdom field
  const recommendedWisdomField = selectWisdomField({
    element: elementDetection.element,
    phase: phaseDetection.phase,
    userState: stateDetection.userState,
    complexity
  });

  // Average confidence across detections
  const confidence = (
    elementDetection.confidence +
    phaseDetection.confidence +
    scaleDetection.confidence +
    stateDetection.confidence
  ) / 4;

  return {
    element: elementDetection.element,
    phase: phaseDetection.phase,
    spiralScale: scaleDetection.spiralScale,
    userState: stateDetection.userState,
    complexity,
    recommendedWisdomField,
    confidence
  };
}

/**
 * Get field intelligence summary for logging/debugging
 */
export function getFieldIntelligenceSummary(intelligence: FieldIntelligence): string {
  return `${intelligence.element}-${intelligence.phase} | ${intelligence.spiralScale} | ${intelligence.userState} | ${intelligence.complexity} | conf:${(intelligence.confidence * 100).toFixed(0)}%`;
}
