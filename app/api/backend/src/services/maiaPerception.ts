/**
 * MAIA Perception Integration
 *
 * "Drawing in data, exhaling presence"
 *
 * This integrates the Spiralogic atmosphere with MAIA's
 * existing conversation context, enriching her perception
 * without controlling her response.
 *
 * This is consecration, not construction.
 */

import { BirthChartContext, formatBirthChartForPrompt } from './birthChartContext';
import { perceiveAtmosphere, generateAtmosphericGuidance, isPatternRipe } from './spiralogicAtmosphere';

/**
 * Enriched perception context for MAIA
 * Contains both technical data and atmospheric guidance
 */
export interface MAIAPerceptionContext {
  // Birth chart (technical)
  birthChart: BirthChartContext;
  birthChartPrompt: string;

  // Atmospheric enrichment (felt)
  atmosphericGuidance: string;

  // Pattern ripeness (sensed)
  patternRipe: boolean;

  // For reference (not for speaking)
  _internalContext?: {
    elementalQuality: string;
    breath: string;
    tone: string;
    imbalance?: any;
  };
}

/**
 * Create enriched perception context for MAIA
 *
 * This is the main integration point—where technical birth chart data
 * meets Spiralogic atmospheric awareness.
 */
export async function createPerceptionContext(
  userMessage: string,
  birthChartContext: BirthChartContext
): Promise<MAIAPerceptionContext> {
  // 1. Detect atmosphere from message + chart
  const atmosphere = perceiveAtmosphere(userMessage, birthChartContext);

  // 2. Generate atmospheric guidance (shapes perception)
  const atmosphericGuidance = generateAtmosphericGuidance(atmosphere);

  // 3. Format birth chart (technical context)
  const birthChartPrompt = formatBirthChartForPrompt(birthChartContext);

  // 4. Check if pattern is ripe for naming
  const patternRipe = isPatternRipe(userMessage);

  // 5. Return enriched context
  return {
    birthChart: birthChartContext,
    birthChartPrompt,
    atmosphericGuidance,
    patternRipe,
    _internalContext: {
      elementalQuality: atmosphere.elementalQuality,
      breath: atmosphere.breath,
      tone: atmosphere.tone,
      imbalance: atmosphere.imbalance,
    },
  };
}

/**
 * Format perception context for MAIA's system prompt
 *
 * This combines birth chart data with atmospheric guidance
 * in a way that enriches perception without forcing behavior.
 */
export function formatPerceptionForPrompt(perception: MAIAPerceptionContext): string {
  const parts: string[] = [];

  // 1. Birth chart (if available)
  if (perception.birthChart.hasBirthChart && perception.birthChartPrompt) {
    parts.push(perception.birthChartPrompt);
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  // 2. Atmospheric guidance (always available)
  parts.push(perception.atmosphericGuidance);

  // 3. Pattern ripeness note (if ripe)
  if (perception.patternRipe) {
    parts.push('');
    parts.push('**The user is inviting understanding.**');
    parts.push('They\'re asking to see the pattern. If you sense it\'s ready, you may name it.');
    parts.push('But only if the bell truly rings.');
  }

  return parts.join('\n');
}

/**
 * Example usage:
 *
 * ```typescript
 * // In PersonalOracleAgent, when building MAIA's context:
 *
 * const birthChart = await getBirthChartContext(userId);
 * const perception = await createPerceptionContext(userMessage, birthChart);
 * const perceptionPrompt = formatPerceptionForPrompt(perception);
 *
 * // Add to MAIA's system prompt:
 * const systemPrompt = `
 *   ${baseMAIAPrompt}
 *
 *   ${perceptionPrompt}
 * `;
 *
 * // MAIA now breathes through Spiralogic atmosphere
 * // Her perception is enriched
 * // Her response emerges from attunement
 * ```
 */
