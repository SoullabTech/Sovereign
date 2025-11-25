/**
 * Developmental Context Builder
 * Provides MAIA with awareness of user's consciousness development metrics
 * This allows her to work with users on their actual measured patterns
 */

import { attendingQualityCalculator, type AttendingQualityMetrics } from './AttendingQualityEngine';
import { shiftPatternStorage, type ShiftPatternMetrics } from './ShiftPatternTracker';

export interface DevelopmentalContext {
  // Raw metrics
  attending: AttendingQualityMetrics | null;
  shifts: ShiftPatternMetrics | null;

  // Natural language summary for AI context
  narrativeSummary: string;

  // Specific patterns to highlight
  keyPatterns: string[];

  // Suggested practices based on current state
  suggestedPractices: string[];
}

/**
 * Get developmental context for a user
 * This is what MAIA can "see" about the user's consciousness journey
 */
export async function getDevelopmentalContext(userId: string): Promise<DevelopmentalContext> {
  try {
    // Check if running in browser environment
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      // Server-side: Return empty context
      console.log('[DevelopmentalContext] Running on server - IndexedDB not available');
      return {
        attending: null,
        shifts: null,
        narrativeSummary: 'No developmental data available yet. This will populate as you engage with practices and track metrics.',
        keyPatterns: [],
        suggestedPractices: []
      };
    }

    // Fetch metrics with timeout protection
    const metricsPromise = Promise.all([
      attendingQualityCalculator.getMetrics(userId, 30),
      shiftPatternStorage.calculateMetrics(userId, 30)
    ]);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Metrics timeout')), 3000)
    );

    const [attending, shifts] = await Promise.race([
      metricsPromise,
      timeoutPromise
    ]) as [AttendingQualityMetrics, ShiftPatternMetrics];

    // Build narrative summary
    const narrativeSummary = buildNarrativeSummary(attending, shifts);

    // Extract key patterns
    const keyPatterns = extractKeyPatterns(attending, shifts);

    // Generate practice suggestions
    const suggestedPractices = generatePracticeSuggestions(attending, shifts);

    return {
      attending,
      shifts,
      narrativeSummary,
      keyPatterns,
      suggestedPractices
    };

  } catch (err) {
    console.error('[DevelopmentalContext] Error fetching metrics:', err);

    // Return empty context on error
    return {
      attending: null,
      shifts: null,
      narrativeSummary: 'No developmental data available yet. This will populate as you engage with practices and track metrics.',
      keyPatterns: [],
      suggestedPractices: []
    };
  }
}

/**
 * Build natural language summary of user's developmental state
 * This goes into MAIA's system prompt so she can reference it
 */
function buildNarrativeSummary(
  attending: AttendingQualityMetrics,
  shifts: ShiftPatternMetrics
): string {
  const parts: string[] = [];

  // Attending quality summary
  if (attending.history.length > 0) {
    parts.push(`Current Attending Quality: Coherence ${attending.currentCoherence}%, Presence ${attending.currentPresence}%, Overall ${attending.currentOverall}%.`);

    if (attending.trajectory === 'improving') {
      parts.push(`Trajectory is improving - deepening presence and integration.`);
    } else if (attending.trajectory === 'declining') {
      parts.push(`Trajectory is declining - may benefit from returning to foundational practices.`);
    } else {
      parts.push(`Trajectory is stable.`);
    }

    parts.push(`Weekly averages: Coherence ${attending.weeklyAverage.coherence}%, Presence ${attending.weeklyAverage.presence}%, Overall ${attending.weeklyAverage.overall}%.`);
  }

  // Shift patterns summary
  if (shifts.totalShifts > 0) {
    parts.push(`\n\nConsciousness Shifts: ${shifts.totalShifts} total shifts detected over the past 30 days.`);
    parts.push(`${shifts.attendedPercentage}% of shifts were consciously attended (vs. happening unconsciously).`);
    parts.push(`Average shift magnitude: ${shifts.avgMagnitude}%.`);

    if (shifts.dominantDirection && shifts.dominantDirection !== 'none') {
      parts.push(`Gravitating toward ${shifts.dominantDirection} - this is the dominant consciousness state being accessed.`);
    }

    if (shifts.lastShift) {
      const lastShiftDesc = `Last shift: ${shifts.lastShift.fromState} → ${shifts.lastShift.toState} (${shifts.lastShift.wasAttended ? 'attended' : 'unattended'}).`;
      parts.push(lastShiftDesc);
    }
  } else {
    parts.push(`\n\nNo consciousness shifts tracked yet. Shifts will be detected through ritual work, conversation breakthroughs, and state changes.`);
  }

  return parts.join(' ');
}

/**
 * Extract key patterns worth highlighting in conversation
 */
function extractKeyPatterns(
  attending: AttendingQualityMetrics,
  shifts: ShiftPatternMetrics
): string[] {
  const patterns: string[] = [];

  // High unattended shift rate
  if (shifts.attendedPercentage < 40) {
    patterns.push(`Most shifts happening unconsciously (${shifts.attendedPercentage}% attended) - opportunity to increase awareness during transitions`);
  }

  // High attended rate
  if (shifts.attendedPercentage > 70) {
    patterns.push(`Strong metacognitive awareness - ${shifts.attendedPercentage}% of shifts are consciously witnessed`);
  }

  // Declining trajectory
  if (attending.trajectory === 'declining') {
    patterns.push('Attending quality declining - may indicate stress, burnout, or need for rest and integration');
  }

  // Improving trajectory
  if (attending.trajectory === 'improving') {
    patterns.push('Attending quality improving - practices are working, consciousness is stabilizing');
  }

  // Low coherence specifically
  if (attending.currentCoherence < 50) {
    patterns.push(`Low coherence (${attending.currentCoherence}%) - awareness may be fragmented or disintegrated`);
  }

  // Low presence specifically
  if (attending.currentPresence < 50) {
    patterns.push(`Low presence (${attending.currentPresence}%) - consciousness may be ungrounded or dissociated from body`);
  }

  // High coherence and presence
  if (attending.currentCoherence > 75 && attending.currentPresence > 75) {
    patterns.push('High coherence and presence - consciousness is well-integrated and embodied');
  }

  // Dominant direction pattern
  if (shifts.dominantDirection && shifts.dominantDirection !== 'none') {
    patterns.push(`Dominant direction toward ${shifts.dominantDirection} - examine what this element represents in current life phase`);
  }

  return patterns;
}

/**
 * Generate practice suggestions based on current metrics
 */
function generatePracticeSuggestions(
  attending: AttendingQualityMetrics,
  shifts: ShiftPatternMetrics
): string[] {
  const suggestions: string[] = [];

  // Low attending percentage
  if (shifts.attendedPercentage < 50) {
    suggestions.push('Journaling at state transitions to increase awareness');
    suggestions.push('Set intention to notice when consciousness shifts');
    suggestions.push('Ritual work to mark significant transitions');
  }

  // Low coherence
  if (attending.currentCoherence < 60) {
    suggestions.push('HRV coherence training (breathwork)');
    suggestions.push('Integration practices (journaling, reflection)');
    suggestions.push('Shadow work to acknowledge fragmented aspects');
  }

  // Low presence
  if (attending.currentPresence < 60) {
    suggestions.push('Fascial release work for embodiment');
    suggestions.push('Grounding practices (walking, earthing, body scanning)');
    suggestions.push('Earth element rituals');
  }

  // Declining trajectory
  if (attending.trajectory === 'declining') {
    suggestions.push('Return to foundational practices');
    suggestions.push('Check for stress, sleep, nutrition factors');
    suggestions.push('Consider rest and integration period');
  }

  // High performance - push edges
  if (attending.currentOverall > 80 && shifts.attendedPercentage > 70) {
    suggestions.push('Explore edge states and breakthrough work');
    suggestions.push('Deepen existing practices');
    suggestions.push('Consider teaching/mentoring others');
  }

  return suggestions;
}

/**
 * Format developmental context as MAIA system prompt injection
 * This is what you'd add to her context
 */
export function formatForSystemPrompt(context: DevelopmentalContext): string {
  if (!context.attending && !context.shifts) {
    return `## Developmental Metrics\n\nNo data available yet. User is just beginning their tracked journey.`;
  }

  let prompt = `## User's Developmental Metrics\n\n`;
  prompt += `${context.narrativeSummary}\n\n`;

  if (context.keyPatterns.length > 0) {
    prompt += `### Key Patterns Detected:\n`;
    context.keyPatterns.forEach(pattern => {
      prompt += `- ${pattern}\n`;
    });
    prompt += `\n`;
  }

  if (context.suggestedPractices.length > 0) {
    prompt += `### Suggested Practices:\n`;
    context.suggestedPractices.forEach(practice => {
      prompt += `- ${practice}\n`;
    });
    prompt += `\n`;
  }

  prompt += `You can reference these metrics in conversation when relevant. If the user asks about their development, patterns, or progress, use this data to provide specific, personalized guidance.`;

  return prompt;
}

/**
 * Helper to check if user has developmental data
 */
export function hasDevelopmentalData(context: DevelopmentalContext): boolean {
  return (
    (context.attending?.history.length ?? 0) > 0 ||
    (context.shifts?.totalShifts ?? 0) > 0
  );
}
