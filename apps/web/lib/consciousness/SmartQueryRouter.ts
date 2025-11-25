/**
 * Smart Query Router
 *
 * Analyzes query complexity and routes to appropriate processing path:
 * - Fast Path: Simple conversational exchanges (2-4s)
 * - Progressive: Substantive queries with wisdom injection (5-10s)
 * - Deep: Complex queries requiring full 6-layer processing (15-25s)
 */

export type QueryComplexity = 'simple' | 'substantive' | 'deep';

export interface QueryAnalysis {
  complexity: QueryComplexity;
  confidence: number;
  indicators: string[];
  reasoning: string;
}

/**
 * Keywords indicating different complexity levels
 */
const COMPLEXITY_INDICATORS = {
  simple: [
    'hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'okay', 'yes', 'no',
    'good', 'nice', 'cool', 'great', 'sure', 'yeah', 'right',
    'how are you', 'what\'s up', 'how\'s it going'
  ],

  substantive: [
    'explain', 'why', 'how do', 'what is', 'tell me about', 'help me understand',
    'struggling', 'feeling', 'need', 'want', 'trying to', 'working on',
    'question', 'wondering', 'confused', 'stuck', 'challenge', 'issue'
  ],

  deep: [
    'transformation', 'shadow', 'integration', 'awakening', 'consciousness',
    'breakthrough', 'healing', 'trauma', 'pattern', 'cycle', 'spiral',
    'fire phase', 'water phase', 'earth phase', 'air phase', 'aether',
    'elemental', 'alchemy', 'spiralogic', 'soul', 'psyche', 'archetype',
    'deeply', 'profoundly', 'fundamentally', 'existential'
  ]
};

/**
 * Analyze query to determine complexity and routing
 */
export function analyzeQueryComplexity(query: string, conversationHistory: any[] = []): QueryAnalysis {
  const lowerQuery = query.toLowerCase();
  const wordCount = query.split(/\s+/).length;
  const hasQuestion = query.includes('?');
  const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1;

  const indicators: string[] = [];
  let complexity: QueryComplexity = 'substantive'; // Default
  let confidence = 0.5;
  let reasoning = '';

  // Check for simple queries
  const simpleMatches = COMPLEXITY_INDICATORS.simple.filter(indicator =>
    lowerQuery.includes(indicator)
  );

  if (simpleMatches.length > 0 && wordCount < 15 && !hasQuestion) {
    complexity = 'simple';
    confidence = 0.8;
    indicators.push(...simpleMatches);
    reasoning = 'Short conversational exchange without questions';
  }

  // Check for deep queries
  const deepMatches = COMPLEXITY_INDICATORS.deep.filter(indicator =>
    lowerQuery.includes(indicator)
  );

  if (deepMatches.length > 1) {
    complexity = 'deep';
    confidence = 0.9;
    indicators.push(...deepMatches);
    reasoning = 'Multiple consciousness/transformation keywords detected';
  } else if (deepMatches.length === 1 && (wordCount > 30 || hasMultipleQuestions)) {
    complexity = 'deep';
    confidence = 0.85;
    indicators.push(...deepMatches);
    reasoning = 'Consciousness keyword + long/complex query';
  }

  // Check for substantive queries
  const substantiveMatches = COMPLEXITY_INDICATORS.substantive.filter(indicator =>
    lowerQuery.includes(indicator)
  );

  if (substantiveMatches.length > 0 && complexity !== 'deep' && complexity !== 'simple') {
    complexity = 'substantive';
    confidence = 0.75;
    indicators.push(...substantiveMatches);
    reasoning = 'Question/exploration detected, needs wisdom context';
  }

  // Adjust based on word count
  if (wordCount > 50 && complexity === 'simple') {
    complexity = 'substantive';
    confidence = 0.7;
    reasoning += ' (upgraded due to length)';
  }

  if (wordCount > 100) {
    complexity = 'deep';
    confidence = 0.8;
    reasoning += ' (upgraded due to significant length)';
  }

  // Consider conversation history
  if (conversationHistory.length > 5) {
    // In established conversation, lean toward deeper processing
    if (complexity === 'simple' && wordCount > 5) {
      complexity = 'substantive';
      confidence = 0.65;
      reasoning += ' (context: established conversation)';
    }
  }

  console.log(`🎯 [QUERY ROUTER] Complexity: ${complexity} (confidence: ${confidence.toFixed(2)})`);
  console.log(`   Reasoning: ${reasoning}`);
  console.log(`   Indicators: ${indicators.join(', ') || 'none'}`);

  return {
    complexity,
    confidence,
    indicators,
    reasoning
  };
}

/**
 * Determine if query should use fast path
 */
export function shouldUseFastPath(query: string, conversationHistory: any[] = []): boolean {
  const analysis = analyzeQueryComplexity(query, conversationHistory);
  return analysis.complexity === 'simple' && analysis.confidence > 0.7;
}

/**
 * Determine if query should use progressive injection
 */
export function shouldUseProgressiveInjection(query: string, conversationHistory: any[] = []): boolean {
  const analysis = analyzeQueryComplexity(query, conversationHistory);
  return analysis.complexity === 'substantive';
}

/**
 * Determine if query should use full 6-layer processing
 */
export function shouldUseDeepProcessing(query: string, conversationHistory: any[] = []): boolean {
  const analysis = analyzeQueryComplexity(query, conversationHistory);
  return analysis.complexity === 'deep';
}
