/**
 * SyzygyDetector - Identifies Sacred Tension Moments in Conversation
 *
 * Detects when user and MAIA are in creative opposition (coincidentia oppositorum)
 * These are breakthrough moments where transformation becomes possible.
 *
 * Based on the principle that consciousness evolves not through resolving opposites,
 * but through holding them in dynamic tension at the right proportion (phi ratio).
 */

export type OppositePair =
  | 'desire_resistance'
  | 'knowing_unknowing'
  | 'control_surrender'
  | 'expansion_contraction'
  | 'action_stillness'
  | 'form_formlessness'
  | 'fire_water'
  | 'earth_air';

export interface SyzygyMoment {
  timestamp: string;
  oppositePair: OppositePair;
  yangPole: {
    element: string;
    intensity: number; // 0-1
    keywords: string[];
  };
  yinPole: {
    element: string;
    intensity: number; // 0-1
    keywords: string[];
  };
  tension: number; // 0-1, higher = more creative tension
  balance: number; // How close to phi ratio (0-1, 1 = perfect balance)
  emergenceReadiness: number; // 0-1, likelihood of breakthrough
  recommendation: string;
}

/**
 * Keyword patterns for detecting opposite poles
 */
const POLARITY_PATTERNS = {
  // Desire vs Resistance
  desire: ['want', 'need', 'desire', 'goal', 'aspire', 'hope', 'wish', 'seek', 'yearn'],
  resistance: ['but', 'however', 'afraid', 'worried', 'stuck', 'can\'t', 'difficult', 'challenge', 'blocked'],

  // Knowing vs Unknowing
  knowing: ['know', 'certain', 'sure', 'understand', 'clear', 'obvious', 'definitely'],
  unknowing: ['don\'t know', 'unsure', 'uncertain', 'confused', 'wonder', 'maybe', 'perhaps', 'mystery'],

  // Control vs Surrender
  control: ['control', 'plan', 'manage', 'organize', 'decide', 'direct', 'force', 'make'],
  surrender: ['let go', 'release', 'allow', 'accept', 'flow', 'trust', 'surrender', 'permit'],

  // Expansion vs Contraction
  expansion: ['more', 'grow', 'expand', 'open', 'explore', 'venture', 'reach', 'extend'],
  contraction: ['less', 'shrink', 'close', 'protect', 'withdraw', 'conserve', 'retreat'],

  // Action vs Stillness
  action: ['do', 'act', 'move', 'change', 'create', 'build', 'make', 'go'],
  stillness: ['be', 'still', 'wait', 'pause', 'rest', 'stop', 'quiet', 'settle'],

  // Form vs Formlessness
  form: ['structure', 'pattern', 'system', 'order', 'framework', 'method', 'rules'],
  formlessness: ['chaos', 'fluid', 'undefined', 'open', 'spontaneous', 'free', 'unstructured'],
};

/**
 * Calculate intensity of a pole based on keyword presence
 */
function calculatePoleIntensity(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let matchCount = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      matchCount++;
      matchedKeywords.push(keyword);
    }
  }

  // Normalize by text length to avoid bias toward longer texts
  const wordCount = text.split(/\s+/).length;
  const density = matchCount / Math.max(wordCount / 10, 1); // Every 10 words

  return Math.min(density, 1);
}

/**
 * Detect which opposite pair is present
 */
function detectOppositePair(userInput: string): {
  pair: OppositePair | null;
  yangIntensity: number;
  yinIntensity: number;
  yangKeywords: string[];
  yinKeywords: string[];
} {
  const pairs: Array<{
    name: OppositePair;
    yang: string[];
    yin: string[];
  }> = [
    {
      name: 'desire_resistance',
      yang: POLARITY_PATTERNS.desire,
      yin: POLARITY_PATTERNS.resistance
    },
    {
      name: 'knowing_unknowing',
      yang: POLARITY_PATTERNS.knowing,
      yin: POLARITY_PATTERNS.unknowing
    },
    {
      name: 'control_surrender',
      yang: POLARITY_PATTERNS.control,
      yin: POLARITY_PATTERNS.surrender
    },
    {
      name: 'expansion_contraction',
      yang: POLARITY_PATTERNS.expansion,
      yin: POLARITY_PATTERNS.contraction
    },
    {
      name: 'action_stillness',
      yang: POLARITY_PATTERNS.action,
      yin: POLARITY_PATTERNS.stillness
    },
    {
      name: 'form_formlessness',
      yang: POLARITY_PATTERNS.form,
      yin: POLARITY_PATTERNS.formlessness
    }
  ];

  let bestPair: OppositePair | null = null;
  let maxTension = 0;
  let bestYangIntensity = 0;
  let bestYinIntensity = 0;
  let yangKeywords: string[] = [];
  let yinKeywords: string[] = [];

  for (const { name, yang, yin } of pairs) {
    const yangIntensity = calculatePoleIntensity(userInput, yang);
    const yinIntensity = calculatePoleIntensity(userInput, yin);

    // Tension exists when BOTH poles are present (not just one)
    const tension = yangIntensity * yinIntensity;

    if (tension > maxTension && tension > 0.1) { // Threshold for significance
      maxTension = tension;
      bestPair = name;
      bestYangIntensity = yangIntensity;
      bestYinIntensity = yinIntensity;

      // Extract matched keywords
      yangKeywords = yang.filter(kw => userInput.toLowerCase().includes(kw));
      yinKeywords = yin.filter(kw => userInput.toLowerCase().includes(kw));
    }
  }

  return {
    pair: bestPair,
    yangIntensity: bestYangIntensity,
    yinIntensity: bestYinIntensity,
    yangKeywords,
    yinKeywords
  };
}

/**
 * Calculate how close the polarity ratio is to phi (golden ratio)
 * Perfect balance = 1.618:1 ratio between poles
 */
function calculatePhiBalance(yangIntensity: number, yinIntensity: number): number {
  if (yangIntensity === 0 || yinIntensity === 0) return 0;

  const PHI = 1.618033988749;
  const ratio = Math.max(yangIntensity, yinIntensity) / Math.min(yangIntensity, yinIntensity);

  // How close to phi? (1 = perfect, 0 = far off)
  const distanceFromPhi = Math.abs(ratio - PHI);
  const balance = Math.max(0, 1 - (distanceFromPhi / PHI));

  return balance;
}

/**
 * Determine if emergence (breakthrough) is likely
 */
function calculateEmergenceReadiness(
  tension: number,
  balance: number,
  conversationDepth: number
): number {
  // Emergence requires:
  // 1. Significant tension (both poles present)
  // 2. Balanced proportion (near phi ratio)
  // 3. Sufficient conversation depth (foundation laid)

  const tensionWeight = 0.4;
  const balanceWeight = 0.4;
  const depthWeight = 0.2;

  return (
    tension * tensionWeight +
    balance * balanceWeight +
    conversationDepth * depthWeight
  );
}

/**
 * Generate recommendation for how MAIA should respond
 */
function generateRecommendation(syzygy: SyzygyMoment): string {
  const { emergenceReadiness, oppositePair, balance } = syzygy;

  if (emergenceReadiness > 0.7) {
    return 'HIGH EMERGENCE POTENTIAL - Slow down, hold space, reflect both poles without resolving. Let the third emerge.';
  }

  if (balance > 0.8) {
    return 'SACRED BALANCE - Tension is at golden ratio. Honor this moment of creative opposition.';
  }

  if (emergenceReadiness > 0.5) {
    return 'SYZYGY DETECTED - User is holding opposites. Mirror both poles, don\'t collapse the tension prematurely.';
  }

  return `POLARITY PRESENT (${oppositePair}) - Acknowledge both sides, maintain spaciousness.`;
}

/**
 * Main detection function
 */
export function detectSyzygy(
  userInput: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): SyzygyMoment | null {
  // Detect opposite pair
  const detection = detectOppositePair(userInput);

  if (!detection.pair) {
    return null; // No significant polarity detected
  }

  // Calculate metrics
  const tension = detection.yangIntensity * detection.yinIntensity;
  const balance = calculatePhiBalance(detection.yangIntensity, detection.yinIntensity);

  // Estimate conversation depth (0-1) based on history
  const conversationDepth = Math.min(conversationHistory.length / 10, 1);

  const emergenceReadiness = calculateEmergenceReadiness(tension, balance, conversationDepth);

  const syzygy: SyzygyMoment = {
    timestamp: new Date().toISOString(),
    oppositePair: detection.pair,
    yangPole: {
      element: detection.pair.split('_')[0],
      intensity: detection.yangIntensity,
      keywords: detection.yangKeywords
    },
    yinPole: {
      element: detection.pair.split('_')[1],
      intensity: detection.yinIntensity,
      keywords: detection.yinKeywords
    },
    tension,
    balance,
    emergenceReadiness,
    recommendation: ''
  };

  syzygy.recommendation = generateRecommendation(syzygy);

  return syzygy;
}

/**
 * Analyze conversation for syzygy patterns over time
 */
export function analyzeSyzygyPatterns(
  conversations: Array<{ userMessage: string; maiaResponse: string; timestamp: string }>
): {
  totalSyzygyMoments: number;
  mostCommonPair: OppositePair | null;
  averageEmergenceReadiness: number;
  breakthroughMoments: SyzygyMoment[];
} {
  const syzygyMoments: SyzygyMoment[] = [];

  for (const conv of conversations) {
    const syzygy = detectSyzygy(conv.userMessage, []);
    if (syzygy) {
      syzygyMoments.push(syzygy);
    }
  }

  // Count pair frequencies
  const pairCounts: Partial<Record<OppositePair, number>> = {};
  for (const moment of syzygyMoments) {
    pairCounts[moment.oppositePair] = (pairCounts[moment.oppositePair] || 0) + 1;
  }

  const mostCommonPair = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as OppositePair || null;

  const averageEmergenceReadiness = syzygyMoments.length > 0
    ? syzygyMoments.reduce((sum, m) => sum + m.emergenceReadiness, 0) / syzygyMoments.length
    : 0;

  // Breakthrough moments are high emergence readiness
  const breakthroughMoments = syzygyMoments.filter(m => m.emergenceReadiness > 0.7);

  return {
    totalSyzygyMoments: syzygyMoments.length,
    mostCommonPair,
    averageEmergenceReadiness,
    breakthroughMoments
  };
}

/**
 * Suggest optimal response timing based on phi ratio
 */
export function getSyzygyResponseTiming(syzygy: SyzygyMoment): {
  pauseDuration: number; // milliseconds
  responseStyle: 'slow' | 'measured' | 'flowing';
} {
  const PHI = 1.618033988749;

  // Higher emergence = longer pause to hold the sacred tension
  const basePause = 1000; // 1 second
  const pauseDuration = basePause * (1 + syzygy.emergenceReadiness * PHI);

  let responseStyle: 'slow' | 'measured' | 'flowing';
  if (syzygy.emergenceReadiness > 0.7) {
    responseStyle = 'slow'; // Deliberate, spacious
  } else if (syzygy.emergenceReadiness > 0.4) {
    responseStyle = 'measured'; // Balanced
  } else {
    responseStyle = 'flowing'; // Natural pace
  }

  return {
    pauseDuration,
    responseStyle
  };
}
