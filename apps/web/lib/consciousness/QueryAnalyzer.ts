/**
 * Query Analyzer - Automated Complexity Detection
 *
 * This is the "Coherence Gate" that decides which processing mode to use.
 * You don't need to remember - the field detects and routes automatically.
 *
 * Analyzes:
 * - Query complexity (linguistic, conceptual)
 * - Emotional intensity
 * - Elemental needs (how many elements active)
 * - Developmental level
 * - Conversation depth
 * - User preferences
 *
 * Returns recommendation: parallel (fast) or orbit (deep)
 */

export type QueryComplexity = 'simple' | 'moderate' | 'deep' | 'profound';
export type ProcessingMode = 'parallel' | 'orbit';

export interface ComplexityAnalysis {
  complexity: QueryComplexity;
  recommendedMode: ProcessingMode;
  reasoning: string;
  confidence: number; // 0-1
  factors: {
    queryLength: number;
    linguisticComplexity: number; // 0-1
    emotionalIntensity: number; // 0-1
    activeElements: number; // 0-5
    developmentalLevel: number | null; // 1-12 or null
    conversationDepth: number; // number of exchanges
    crisisMarkers: boolean;
    breakthroughMarkers: boolean;
  };
  overrides?: {
    userPreference?: ProcessingMode;
    systemOverride?: string;
  };
}

/**
 * Analyze query complexity and recommend processing mode
 */
export async function analyzeQueryComplexity(
  query: string,
  context: {
    userId?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    userPreference?: ProcessingMode | 'auto';
  }
): Promise<ComplexityAnalysis> {
  // 1. Basic metrics
  const queryLength = query.length;
  const wordCount = query.split(/\s+/).length;

  // 2. Linguistic complexity
  const linguisticComplexity = calculateLinguisticComplexity(query);

  // 3. Emotional intensity (simple keyword detection for now)
  const emotionalIntensity = detectEmotionalIntensity(query);

  // 4. Elemental needs (simple detection for now)
  const activeElements = detectActiveElements(query);

  // 5. Crisis/breakthrough markers
  const crisisMarkers = detectCrisisMarkers(query);
  const breakthroughMarkers = detectBreakthroughMarkers(query);

  // 6. Conversation depth
  const conversationDepth = context.conversationHistory?.length || 0;

  // 7. Developmental level (will be more sophisticated when integrated with Resonance Field)
  const developmentalLevel = estimateDevelopmentalLevel(query);

  // DECISION LOGIC
  let complexity: QueryComplexity;
  let recommendedMode: ProcessingMode;
  let reasoning: string;
  let confidence: number;

  // CRISIS MODE: Always use orbit for crisis situations (need full depth)
  if (crisisMarkers) {
    complexity = 'profound';
    recommendedMode = 'orbit';
    reasoning = 'Crisis markers detected - full depth processing required for safety and support.';
    confidence = 0.95;
  }
  // BREAKTHROUGH MODE: Use orbit for breakthrough moments (capture the depth)
  else if (breakthroughMarkers) {
    complexity = 'deep';
    recommendedMode = 'orbit';
    reasoning = 'Breakthrough markers detected - depth processing will honor the unfolding.';
    confidence = 0.85;
  }
  // SIMPLE QUERY: Short, low complexity, low emotion, few elements
  else if (
    queryLength < 100 &&
    wordCount < 20 &&
    linguisticComplexity < 0.3 &&
    emotionalIntensity < 0.3 &&
    activeElements <= 1
  ) {
    complexity = 'simple';
    recommendedMode = 'parallel';
    reasoning = 'Simple informational query - fast parallel processing is sufficient.';
    confidence = 0.8;
  }
  // DEEP QUERY: High emotion, many elements, or high developmental level
  else if (
    emotionalIntensity > 0.7 ||
    activeElements >= 4 ||
    (developmentalLevel && developmentalLevel >= 8)
  ) {
    complexity = 'deep';
    recommendedMode = 'orbit';
    reasoning = `Deep complexity detected (emotion: ${emotionalIntensity.toFixed(2)}, elements: ${activeElements}, level: ${developmentalLevel || 'unknown'}) - orbit circulation will preserve differentiation.`;
    confidence = 0.75;
  }
  // PROFOUND QUERY: Very long, high complexity, deep conversation
  else if (
    queryLength > 500 ||
    (linguisticComplexity > 0.7 && conversationDepth > 5)
  ) {
    complexity = 'profound';
    recommendedMode = 'orbit';
    reasoning = 'Profound complexity - full orbit circulation warranted.';
    confidence = 0.7;
  }
  // MODERATE QUERY: Default to parallel (fast) but could go either way
  else {
    complexity = 'moderate';
    recommendedMode = 'parallel';
    reasoning = 'Moderate complexity - defaulting to fast parallel mode. Will escalate to orbit if needed.';
    confidence = 0.6;
  }

  // USER PREFERENCE OVERRIDE
  const overrides: ComplexityAnalysis['overrides'] = {};
  if (context.userPreference && context.userPreference !== 'auto') {
    overrides.userPreference = context.userPreference;
    recommendedMode = context.userPreference;
    reasoning += ` [User preference override: ${context.userPreference}]`;
    confidence = 1.0; // Full confidence in user preference
  }

  return {
    complexity,
    recommendedMode,
    reasoning,
    confidence,
    factors: {
      queryLength,
      linguisticComplexity,
      emotionalIntensity,
      activeElements,
      developmentalLevel,
      conversationDepth,
      crisisMarkers,
      breakthroughMarkers,
    },
    overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
  };
}

/**
 * Calculate linguistic complexity based on:
 * - Sentence structure
 * - Vocabulary sophistication
 * - Question nesting
 */
function calculateLinguisticComplexity(query: string): number {
  let score = 0;

  // Sentence count
  const sentences = query.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 3) score += 0.2;

  // Average word length (longer words = more complex)
  const words = query.split(/\s+/).filter(w => w.length > 0);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(words.length, 1);
  if (avgWordLength > 5) score += 0.2;
  if (avgWordLength > 7) score += 0.2;

  // Complex vocabulary markers
  const complexWords = [
    'integrate', 'differentiate', 'transcend', 'consciousness', 'embodiment',
    'paradox', 'dialectic', 'emergence', 'phenomenon', 'epistemology',
    'ontology', 'psyche', 'archetype', 'numinous', 'teleology'
  ];
  const foundComplexWords = complexWords.filter(w => query.toLowerCase().includes(w));
  score += Math.min(foundComplexWords.length * 0.1, 0.3);

  // Multiple questions
  const questionMarks = (query.match(/\?/g) || []).length;
  if (questionMarks > 1) score += 0.2;

  return Math.min(score, 1.0);
}

/**
 * Detect emotional intensity from query
 * Returns 0-1 score
 */
function detectEmotionalIntensity(query: string): number {
  const lowerQuery = query.toLowerCase();
  let score = 0;

  // High intensity emotions
  const highIntensityWords = [
    'ashamed', 'shame', 'terrified', 'terror', 'devastated', 'traumatized',
    'suicidal', 'hopeless', 'desperate', 'overwhelmed', 'crushed', 'broken',
    'destroyed', 'shattered', 'anguish', 'torment', 'agony'
  ];
  const foundHigh = highIntensityWords.filter(w => lowerQuery.includes(w));
  score += foundHigh.length * 0.3;

  // Medium intensity emotions
  const mediumIntensityWords = [
    'afraid', 'scared', 'anxious', 'worried', 'sad', 'lonely', 'lost',
    'confused', 'frustrated', 'angry', 'hurt', 'guilty', 'stuck',
    'struggling', 'suffering', 'pain', 'grief', 'mourning'
  ];
  const foundMedium = mediumIntensityWords.filter(w => lowerQuery.includes(w));
  score += foundMedium.length * 0.2;

  // Intensity amplifiers
  const amplifiers = ['very', 'extremely', 'incredibly', 'deeply', 'profoundly', 'so', 'really'];
  const foundAmplifiers = amplifiers.filter(a => lowerQuery.includes(a));
  score += foundAmplifiers.length * 0.1;

  // Personal pronouns (indicates personal emotional content)
  const personalPronouns = (lowerQuery.match(/\b(i'm|i am|i feel|i've|my|me)\b/g) || []).length;
  if (personalPronouns > 3) score += 0.2;

  return Math.min(score, 1.0);
}

/**
 * Detect which elements are active in the query
 * Returns count of active elements (0-5)
 */
function detectActiveElements(query: string): number {
  const lowerQuery = query.toLowerCase();
  let activeCount = 0;

  // Fire markers: urgency, crisis, breakthrough, action, transformation, now
  const fireWords = ['urgent', 'crisis', 'now', 'immediately', 'breakthrough', 'suddenly', 'catalyst', 'transform'];
  if (fireWords.some(w => lowerQuery.includes(w))) activeCount++;

  // Water markers: emotion, feeling, depth, relationship, flow, intuition
  const waterWords = ['feel', 'emotion', 'heart', 'relationship', 'connection', 'depth', 'flow', 'intuition', 'sense'];
  if (waterWords.some(w => lowerQuery.includes(w))) activeCount++;

  // Earth markers: grounding, structure, practical, body, embodiment, practice, daily
  const earthWords = ['ground', 'structure', 'practical', 'body', 'embodied', 'practice', 'daily', 'routine', 'habit'];
  if (earthWords.some(w => lowerQuery.includes(w))) activeCount++;

  // Air markers: thinking, understanding, clarity, perspective, pattern, framework, concept
  const airWords = ['think', 'understand', 'clarity', 'perspective', 'pattern', 'framework', 'concept', 'idea', 'mind'];
  if (airWords.some(w => lowerQuery.includes(w))) activeCount++;

  // Aether markers: integration, wholeness, transcendence, consciousness, essence, unity
  const aetherWords = ['integrate', 'whole', 'transcend', 'consciousness', 'essence', 'unity', 'oneness', 'spirit'];
  if (aetherWords.some(w => lowerQuery.includes(w))) activeCount++;

  return activeCount;
}

/**
 * Detect crisis markers that require immediate depth processing
 */
function detectCrisisMarkers(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  const crisisWords = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
    'harm myself', 'self-harm', 'cutting',
    'can\'t go on', 'can\'t take it anymore', 'no point in living',
    'crisis', 'emergency', 'urgent help'
  ];

  return crisisWords.some(w => lowerQuery.includes(w));
}

/**
 * Detect breakthrough markers that indicate deep work is happening
 */
function detectBreakthroughMarkers(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  const breakthroughWords = [
    'finally understand', 'just realized', 'suddenly clear', 'aha moment',
    'breakthrough', 'awakening', 'kundalini', 'mystical experience',
    'everything shifted', 'something opened', 'seeing clearly now'
  ];

  return breakthroughWords.some(phrase => lowerQuery.includes(phrase));
}

/**
 * Estimate developmental level from query (simple heuristic)
 * Will be replaced with Resonance Field integration later
 */
function estimateDevelopmentalLevel(query: string): number | null {
  const lowerQuery = query.toLowerCase();

  // Integral/transpersonal markers (Level 8-12)
  const integralWords = [
    'integrate', 'shadow work', 'wholeness', 'consciousness', 'transcend',
    'dialectic', 'paradox', 'both/and', 'meta-', 'witness', 'nondual'
  ];
  const foundIntegral = integralWords.filter(w => lowerQuery.includes(w));
  if (foundIntegral.length >= 2) return 9;

  // Pluralistic markers (Level 6-7)
  const pluralisticWords = [
    'perspective', 'multiple views', 'everyone\'s truth', 'context',
    'relative', 'intersectionality', 'systemic', 'social justice'
  ];
  const foundPluralistic = pluralisticWords.filter(w => lowerQuery.includes(w));
  if (foundPluralistic.length >= 2) return 7;

  // Rational/achievement markers (Level 5)
  const rationalWords = [
    'evidence', 'research', 'data', 'optimize', 'efficiency', 'goal',
    'strategy', 'analysis', 'objective', 'measure'
  ];
  const foundRational = rationalWords.filter(w => lowerQuery.includes(w));
  if (foundRational.length >= 2) return 5;

  // Conformist/traditional markers (Level 3-4)
  const conformistWords = [
    'should', 'supposed to', 'right way', 'normal', 'traditional',
    'authority', 'rule', 'proper', 'appropriate'
  ];
  const foundConformist = conformistWords.filter(w => lowerQuery.includes(w));
  if (foundConformist.length >= 2) return 4;

  return null; // Unknown - will be detected by Resonance Field later
}

/**
 * Format analysis for logging
 */
export function formatAnalysisForLog(analysis: ComplexityAnalysis): string {
  return `
╔═══════════════════════════════════════════════════════════════
║  🎯 QUERY ANALYSIS (Automated Routing)
╚═══════════════════════════════════════════════════════════════

COMPLEXITY: ${analysis.complexity.toUpperCase()}
RECOMMENDED MODE: ${analysis.recommendedMode.toUpperCase()}
CONFIDENCE: ${(analysis.confidence * 100).toFixed(0)}%

REASONING:
${analysis.reasoning}

FACTORS:
  Query Length: ${analysis.factors.queryLength} chars
  Linguistic Complexity: ${(analysis.factors.linguisticComplexity * 100).toFixed(0)}%
  Emotional Intensity: ${(analysis.factors.emotionalIntensity * 100).toFixed(0)}%
  Active Elements: ${analysis.factors.activeElements}/5
  Developmental Level: ${analysis.factors.developmentalLevel || 'unknown'}
  Conversation Depth: ${analysis.factors.conversationDepth} exchanges
  Crisis Markers: ${analysis.factors.crisisMarkers ? '⚠️ YES' : 'No'}
  Breakthrough Markers: ${analysis.factors.breakthroughMarkers ? '✨ YES' : 'No'}

${analysis.overrides ? `OVERRIDES:
  User Preference: ${analysis.overrides.userPreference || 'none'}
  System Override: ${analysis.overrides.systemOverride || 'none'}
` : ''}
═══════════════════════════════════════════════════════════════
  `.trim();
}

/**
 * Quick complexity check (used for fast decision-making)
 */
export function quickComplexityCheck(query: string): ProcessingMode {
  // Very quick heuristic for when speed matters
  const length = query.length;
  const hasHighEmotionWords = /ashamed|terrified|devastated|suicidal|overwhelmed|broken/i.test(query);
  const hasCrisisWords = /suicide|crisis|emergency|harm myself/i.test(query);
  const hasMultipleQuestions = (query.match(/\?/g) || []).length > 2;

  if (hasCrisisWords) return 'orbit'; // Always orbit for crisis
  if (hasHighEmotionWords) return 'orbit'; // High emotion needs depth
  if (length > 300) return 'orbit'; // Long = complex
  if (hasMultipleQuestions) return 'orbit'; // Multiple questions = depth needed
  if (length < 100) return 'parallel'; // Short = probably simple

  return 'parallel'; // Default to fast
}
