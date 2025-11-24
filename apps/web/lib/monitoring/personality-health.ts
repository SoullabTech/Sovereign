// frontend
// apps/web/lib/monitoring/personality-health.ts

/**
 * MAIA Personality Health Monitoring
 * Tracks and analyzes MAIA's responses for personality consistency,
 * emotional coherence, and potential degradation patterns.
 * Used for development monitoring and auto-recovery.
 */

export interface PersonalityMetrics {
  /**
   * Coherence score (0-1) for response consistency
   */
  coherence: number;

  /**
   * Emotional stability score (0-1)
   */
  emotionalStability: number;

  /**
   * Response relevance score (0-1)
   */
  relevance: number;

  /**
   * Language quality score (0-1)
   */
  languageQuality: number;

  /**
   * Overall health score (0-1)
   */
  overallHealth: number;

  /**
   * Any detected anomalies
   */
  anomalies: string[];

  /**
   * Recommendations for improvement
   */
  recommendations: string[];
}

export interface HealthAlert {
  level: 'info' | 'warning' | 'error';
  message: string;
  metrics: PersonalityMetrics;
  timestamp: Date;
}

/**
 * Pattern indicators for personality health assessment
 */
const HEALTH_PATTERNS = {
  // Positive indicators
  coherentResponse: /\b(understand|sense|feel|aware)\b.*\b(you|your|yours)\b/gi,
  empathicLanguage: /\b(with you|alongside|together|support)\b/gi,
  wisdomMarkers: /\b(perhaps|might|could|consider|reflect)\b/gi,

  // Warning indicators
  repetitivePhases: /\b(I am|I'm|I will|I can)\b.*\b(I am|I'm|I will|I can)\b/gi,
  genericResponses: /\b(of course|certainly|indeed|absolutely)\b.*\b(of course|certainly|indeed|absolutely)\b/gi,

  // Error indicators
  incoherentStructure: /\b(but but|and and|the the|a a)\b/gi,
  contradictoryStatements: /\b(always|never)\b.*\b(sometimes|maybe|perhaps)\b/gi,
} as const;

/**
 * Analyze MAIA's response for personality health metrics
 */
function analyzeResponse(responseText: string): PersonalityMetrics {
  const text = responseText.toLowerCase();

  // Basic coherence analysis
  const coherentMatches = (text.match(HEALTH_PATTERNS.coherentResponse) || []).length;
  const incoherentMatches = (text.match(HEALTH_PATTERNS.incoherentStructure) || []).length;
  const coherence = Math.max(0, Math.min(1, (coherentMatches - incoherentMatches * 2) / Math.max(1, text.length / 100)));

  // Emotional stability analysis
  const empathicMatches = (text.match(HEALTH_PATTERNS.empathicLanguage) || []).length;
  const contradictoryMatches = (text.match(HEALTH_PATTERNS.contradictoryStatements) || []).length;
  const emotionalStability = Math.max(0, Math.min(1, (empathicMatches - contradictoryMatches) / Math.max(1, text.length / 200)));

  // Relevance and wisdom analysis
  const wisdomMatches = (text.match(HEALTH_PATTERNS.wisdomMarkers) || []).length;
  const genericMatches = (text.match(HEALTH_PATTERNS.genericResponses) || []).length;
  const relevance = Math.max(0, Math.min(1, (wisdomMatches - genericMatches) / Math.max(1, text.length / 150)));

  // Language quality (simple heuristics)
  const avgSentenceLength = text.split(/[.!?]+/).reduce((acc, sentence) => {
    return acc + sentence.trim().split(' ').length;
  }, 0) / Math.max(1, text.split(/[.!?]+/).length);

  const languageQuality = Math.max(0, Math.min(1,
    avgSentenceLength > 5 && avgSentenceLength < 30 ? 0.8 : 0.4
  ));

  // Overall health calculation
  const overallHealth = (coherence + emotionalStability + relevance + languageQuality) / 4;

  // Detect anomalies
  const anomalies: string[] = [];
  if (coherence < 0.3) anomalies.push('Low coherence detected');
  if (emotionalStability < 0.4) anomalies.push('Emotional instability detected');
  if (relevance < 0.3) anomalies.push('Generic or irrelevant response pattern');
  if (languageQuality < 0.4) anomalies.push('Poor language structure');
  if (incoherentMatches > 0) anomalies.push('Incoherent text patterns found');

  // Generate recommendations
  const recommendations: string[] = [];
  if (coherence < 0.6) recommendations.push('Improve response coherence and logical flow');
  if (emotionalStability < 0.6) recommendations.push('Enhance emotional consistency');
  if (relevance < 0.6) recommendations.push('Increase response specificity and relevance');
  if (languageQuality < 0.6) recommendations.push('Improve sentence structure and clarity');

  return {
    coherence,
    emotionalStability,
    relevance,
    languageQuality,
    overallHealth,
    anomalies,
    recommendations,
  };
}

/**
 * Monitor MAIA's response and assess personality health.
 * Used in development to detect degradation and trigger auto-recovery.
 */
export function monitorMAIAResponse(responseText: string): PersonalityMetrics {
  if (process.env.NODE_ENV !== 'development') {
    // Only run in development mode
    return {
      coherence: 1,
      emotionalStability: 1,
      relevance: 1,
      languageQuality: 1,
      overallHealth: 1,
      anomalies: [],
      recommendations: [],
    };
  }

  const metrics = analyzeResponse(responseText);

  // Log health assessment
  console.group('🧠 [MAIA Personality Health Monitor]');
  console.log('Response length:', responseText.length);
  console.log('Health metrics:', {
    coherence: Math.round(metrics.coherence * 100) + '%',
    emotionalStability: Math.round(metrics.emotionalStability * 100) + '%',
    relevance: Math.round(metrics.relevance * 100) + '%',
    languageQuality: Math.round(metrics.languageQuality * 100) + '%',
    overallHealth: Math.round(metrics.overallHealth * 100) + '%',
  });

  if (metrics.anomalies.length > 0) {
    console.warn('⚠️ Anomalies detected:', metrics.anomalies);
  }

  if (metrics.recommendations.length > 0) {
    console.info('💡 Recommendations:', metrics.recommendations);
  }

  // Alert on severe degradation
  if (metrics.overallHealth < 0.3) {
    console.error('🚨 SEVERE: MAIA personality health critically low!');
  } else if (metrics.overallHealth < 0.5) {
    console.warn('⚠️ WARNING: MAIA personality health degraded');
  }

  console.groupEnd();

  return metrics;
}

/**
 * Generate health alert based on metrics
 */
export function generateHealthAlert(metrics: PersonalityMetrics): HealthAlert | null {
  if (metrics.overallHealth >= 0.7) {
    return null; // Healthy, no alert needed
  }

  let level: 'info' | 'warning' | 'error' = 'info';
  let message = 'MAIA personality health nominal';

  if (metrics.overallHealth < 0.3) {
    level = 'error';
    message = `CRITICAL: MAIA personality health severely degraded (${Math.round(metrics.overallHealth * 100)}%)`;
  } else if (metrics.overallHealth < 0.5) {
    level = 'warning';
    message = `WARNING: MAIA personality health degraded (${Math.round(metrics.overallHealth * 100)}%)`;
  } else {
    level = 'info';
    message = `INFO: MAIA personality health below optimal (${Math.round(metrics.overallHealth * 100)}%)`;
  }

  return {
    level,
    message,
    metrics,
    timestamp: new Date(),
  };
}

/**
 * Personality health history tracking (in-memory for development)
 */
let healthHistory: PersonalityMetrics[] = [];
const MAX_HISTORY_SIZE = 50;

/**
 * Add metrics to health history
 */
export function recordHealthMetrics(metrics: PersonalityMetrics): void {
  healthHistory.unshift(metrics);
  if (healthHistory.length > MAX_HISTORY_SIZE) {
    healthHistory = healthHistory.slice(0, MAX_HISTORY_SIZE);
  }
}

/**
 * Get recent health trend
 */
export function getHealthTrend(samples = 10): {
  trend: 'improving' | 'stable' | 'degrading';
  averageHealth: number;
  recentHealth: number;
} {
  if (healthHistory.length < 2) {
    return {
      trend: 'stable',
      averageHealth: healthHistory[0]?.overallHealth || 1,
      recentHealth: healthHistory[0]?.overallHealth || 1,
    };
  }

  const recentSamples = healthHistory.slice(0, Math.min(samples, healthHistory.length));
  const averageHealth = recentSamples.reduce((sum, m) => sum + m.overallHealth, 0) / recentSamples.length;
  const recentHealth = recentSamples.slice(0, 3).reduce((sum, m) => sum + m.overallHealth, 0) / Math.min(3, recentSamples.length);

  const trend = recentHealth > averageHealth + 0.1 ? 'improving' :
                 recentHealth < averageHealth - 0.1 ? 'degrading' : 'stable';

  return { trend, averageHealth, recentHealth };
}

/**
 * Clear health history (for testing or reset)
 */
export function clearHealthHistory(): void {
  healthHistory = [];
}