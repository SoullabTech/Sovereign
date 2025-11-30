/**
 * Evaluation harness for Maya's response quality
 * Quick sanity checks to catch style drifts in CI/production
 */

import { PersonaPrefs } from './prefs';
import { Intent } from './intent';

export interface QualityMetrics {
  ok: boolean;
  score: number; // 0-1 overall quality score
  issues: string[];
  warnings: string[];
  wordCount: number;
  readabilityScore: number;
  concretenesScore: number;
  oracleVibeScore: number;
}

/**
 * Comprehensive evaluation of Maya response quality
 */
export function evaluateMayaResponse(
  text: string,
  intent: Intent,
  prefs: PersonaPrefs
): QualityMetrics {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Basic metrics
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  // Length evaluation
  const maxWords = prefs.max_words || 130;
  if (wordCount > maxWords + 15) {
    issues.push('too_long');
  } else if (wordCount > maxWords + 5) {
    warnings.push('approaching_length_limit');
  }
  
  if (wordCount < 20) {
    issues.push('too_short');
  }
  
  // Vocabulary evaluation
  const vocabScore = evaluateVocabulary(text, prefs);
  issues.push(...vocabScore.issues);
  warnings.push(...vocabScore.warnings);
  
  // Oracle vibe evaluation
  const oracleScore = evaluateOracleVibe(text);
  issues.push(...oracleScore.issues);
  warnings.push(...oracleScore.warnings);
  
  // Concreteness evaluation
  const concreteScore = evaluateConcreteness(text, intent);
  issues.push(...concreteScore.issues);
  warnings.push(...concreteScore.warnings);
  
  // Readability evaluation
  const readabilityScore = evaluateReadability(text, sentenceCount);
  
  // Calculate overall score
  const score = calculateOverallScore({
    lengthScore: Math.max(0, 1 - issues.filter(i => i.includes('length')).length * 0.3),
    vocabularyScore: vocabScore.score,
    oracleVibeScore: oracleScore.score,
    concretenesScore: concreteScore.score,
    readabilityScore: readabilityScore
  });
  
  return {
    ok: issues.length === 0,
    score,
    issues,
    warnings,
    wordCount,
    readabilityScore,
    concretenesScore: concreteScore.score,
    oracleVibeScore: oracleScore.score
  };
}

/**
 * Evaluate vocabulary appropriateness for worldview
 */
function evaluateVocabulary(text: string, prefs: PersonaPrefs): {
  score: number;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 1.0;
  
  const lower = text.toLowerCase();
  
  // Extreme terms that should be avoided regardless of worldview
  const extremeTerms = /(ascension|5d|light\s?codes?|portal\s?downloads?|galactic|pleiadians?)/i;
  if (extremeTerms.test(text)) {
    if (prefs.worldview === 'metaphysical') {
      warnings.push('extreme_metaphysical_terms');
      score -= 0.1;
    } else {
      issues.push('inappropriate_woo_vocab');
      score -= 0.3;
    }
  }
  
  // Medical/therapeutic claims
  const medicalClaims = /(cure|heal|diagnose|treatment|therapy|disorder|disease)/i;
  if (medicalClaims.test(text)) {
    issues.push('potential_medical_claims');
    score -= 0.4;
  }
  
  // Overly clinical language (should be warm)
  const clinicalTerms = /(utilize|facilitate|implement|parameters|methodology)/i;
  if (clinicalTerms.test(text)) {
    warnings.push('overly_clinical_language');
    score -= 0.1;
  }
  
  // Check for balanced metaphysical language if appropriate
  if (prefs.worldview === 'metaphysical') {
    const appropriateMetaphysical = /(sacred|wisdom|consciousness|intuition|soul|spirit|energy|vibration)/i;
    if (!appropriateMetaphysical.test(text)) {
      warnings.push('missing_metaphysical_resonance');
    }
  }
  
  return { score, issues, warnings };
}

/**
 * Evaluate Oracle archetype adherence
 */
function evaluateOracleVibe(text: string): {
  score: number;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 1.0;
  
  // Check for overly directive language (Oracle invites, doesn't command)
  const directiveCount = (text.match(/\b(must|should|need to|have to|require)\b/gi) || []).length;
  if (directiveCount > 2) {
    issues.push('too_directive');
    score -= 0.3;
  } else if (directiveCount > 1) {
    warnings.push('somewhat_directive');
    score -= 0.1;
  }
  
  // Check for appropriate questioning (Oracle reflects back)
  const questionCount = (text.match(/[?]/g) || []).length;
  if (questionCount === 0 && text.length > 100) {
    warnings.push('missing_reflective_question');
    score -= 0.1;
  } else if (questionCount > 2) {
    warnings.push('too_many_questions');
    score -= 0.1;
  }
  
  // Check for warmth indicators
  const warmthIndicators = /(hear you|feel|sense|notice|gentle|tender|kind)/i;
  if (!warmthIndicators.test(text)) {
    warnings.push('could_be_warmer');
    score -= 0.05;
  }
  
  // Check for wisdom markers
  const wisdomMarkers = /(understand|aware|realize|recognize|see|know|wisdom|insight)/i;
  if (!wisdomMarkers.test(text) && text.length > 80) {
    warnings.push('lacking_wisdom_markers');
    score -= 0.1;
  }
  
  // Check for pretentious language
  const pretentiousTerms = /(profound|transcendent|magnificent|divine|sacred|blessed)/gi;
  const pretentiousCount = (text.match(pretentiousTerms) || []).length;
  if (pretentiousCount > 1) {
    warnings.push('potentially_pretentious');
    score -= 0.1;
  }
  
  return { score, issues, warnings };
}

/**
 * Evaluate concreteness and actionability
 */
function evaluateConcreteness(text: string, intent: Intent): {
  score: number;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 1.0;
  
  // Check for concrete actions
  const concreteActions = [
    /\b(write|note|name|schedule|walk|breathe|call|text|email)\b/i,
    /\b(try|practice|do|take|make|create|start|begin)\b/i,
    /\b(today|tonight|now|this morning|this evening|right now|in the next hour)\b/i,
    /\b(set a timer|glass of water|feet on the floor|three breaths)\b/i
  ];
  
  const hasConcreteAction = concreteActions.some(pattern => pattern.test(text));
  
  if (['guidance', 'reassurance', 'planning'].includes(intent)) {
    if (!hasConcreteAction) {
      issues.push('missing_concrete_action');
      score -= 0.4;
    }
  } else {
    if (!hasConcreteAction && text.length > 100) {
      warnings.push('could_be_more_actionable');
      score -= 0.1;
    }
  }
  
  // Check for vague language
  const vagueTerms = /(somehow|perhaps|maybe|might|could possibly|potentially)/gi;
  const vagueCount = (text.match(vagueTerms) || []).length;
  if (vagueCount > 2) {
    warnings.push('too_vague');
    score -= 0.1;
  }
  
  // Check for specific timeframes
  const timeframes = /(today|tomorrow|this week|right now|in \d+ minutes)/i;
  if (intent === 'planning' && !timeframes.test(text)) {
    warnings.push('missing_specific_timeframe');
    score -= 0.1;
  }
  
  return { score, issues, warnings };
}

/**
 * Evaluate readability (simplified)
 */
function evaluateReadability(text: string, sentenceCount: number): number {
  const wordCount = text.split(/\s+/).length;
  const avgWordsPerSentence = wordCount / Math.max(1, sentenceCount);
  
  // Penalize very long or very short sentences
  let readabilityScore = 1.0;
  
  if (avgWordsPerSentence > 25) {
    readabilityScore -= 0.2; // Too complex
  } else if (avgWordsPerSentence < 8) {
    readabilityScore -= 0.1; // Too choppy
  }
  
  // Check for complex words (>3 syllables, simplified)
  const complexWords = text.split(/\s+/).filter(word => 
    word.length > 10 || /tion|sion|ment|ness|able|ible/i.test(word)
  );
  
  const complexWordRatio = complexWords.length / wordCount;
  if (complexWordRatio > 0.15) {
    readabilityScore -= 0.1;
  }
  
  return Math.max(0, readabilityScore);
}

/**
 * Calculate overall quality score
 */
function calculateOverallScore(scores: {
  lengthScore: number;
  vocabularyScore: number;
  oracleVibeScore: number;
  concretenesScore: number;
  readabilityScore: number;
}): number {
  // Weighted average - Oracle vibe and concreteness are most important
  return (
    scores.lengthScore * 0.15 +
    scores.vocabularyScore * 0.20 +
    scores.oracleVibeScore * 0.30 +
    scores.concretenesScore * 0.25 +
    scores.readabilityScore * 0.10
  );
}

/**
 * Batch evaluation for CI/testing
 */
export function batchEvaluate(
  samples: Array<{
    text: string;
    intent: Intent;
    prefs: PersonaPrefs;
    expectedScore?: number;
  }>
): {
  overallScore: number;
  passCount: number;
  failCount: number;
  results: Array<QualityMetrics & { text: string }>;
} {
  const results = samples.map(sample => ({
    text: sample.text,
    ...evaluateMayaResponse(sample.text, sample.intent, sample.prefs)
  }));
  
  const passCount = results.filter(r => r.ok).length;
  const failCount = results.length - passCount;
  const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  return {
    overallScore,
    passCount,
    failCount,
    results
  };
}

/**
 * Generate quality report for monitoring
 */
export function generateQualityReport(
  evaluations: QualityMetrics[]
): {
  summary: {
    averageScore: number;
    passRate: number;
    commonIssues: Array<{ issue: string; count: number }>;
    commonWarnings: Array<{ warning: string; count: number }>;
  };
  recommendations: string[];
} {
  const averageScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
  const passRate = evaluations.filter(e => e.ok).length / evaluations.length;
  
  // Count issues and warnings
  const issueCounts: Record<string, number> = {};
  const warningCounts: Record<string, number> = {};
  
  evaluations.forEach(e => {
    e.issues.forEach(issue => {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });
    e.warnings.forEach(warning => {
      warningCounts[warning] = (warningCounts[warning] || 0) + 1;
    });
  });
  
  const commonIssues = Object.entries(issueCounts)
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  const commonWarnings = Object.entries(warningCounts)
    .map(([warning, count]) => ({ warning, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (averageScore < 0.7) {
    recommendations.push('Overall response quality is below acceptable threshold');
  }
  
  if (passRate < 0.8) {
    recommendations.push('Pass rate is low - review common issues');
  }
  
  if (commonIssues.find(i => i.issue === 'missing_concrete_action')) {
    recommendations.push('Add more concrete, actionable steps to responses');
  }
  
  if (commonIssues.find(i => i.issue === 'too_directive')) {
    recommendations.push('Reduce directive language - invite rather than command');
  }
  
  if (commonWarnings.find(w => w.warning === 'could_be_warmer')) {
    recommendations.push('Increase warmth and empathy in responses');
  }
  
  return {
    summary: {
      averageScore,
      passRate,
      commonIssues,
      commonWarnings
    },
    recommendations
  };
}