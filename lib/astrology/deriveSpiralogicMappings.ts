/**
 * deriveSpiralogicMappings
 *
 * Maps verified natal chart data into Spiralogic elemental system.
 * Must only be called after calculateNatalChart has been run.
 * Do not compute astrology here — consume verified NatalChart output.
 */

import type { NatalChart, ZodiacElement } from './calculateNatalChart';

export interface SpiralogicMapping {
  dominantElement: ZodiacElement;
  underactiveElement: ZodiacElement;
  elementalDistribution: Record<ZodiacElement, number>;
  sunSign: string;
  moonSign: string;
  ascendantSign: string | null;
  calculationMode: string;
  // Context for prompt generation
  astrologyContextBlock: string;
  spiralogicContextBlock: string;
}

export function deriveSpiralogicMappings(
  chart: NatalChart,
  activeTransits: string[],
  lifeStage?: string,
): SpiralogicMapping {
  const { sun, moon, ascendant, elementalDistribution, dominantElement, underactiveElement, calculationMode } = chart;

  const astrologyContextBlock = [
    calculationMode === 'full'
      ? [
          `Sun: ${sun.sign} (${sun.element}, ${elementalDistribution[sun.element]}% elemental weight)`,
          `Moon: ${moon.sign} (${moon.element}, ${elementalDistribution[moon.element]}% elemental weight)`,
          `Ascendant: ${ascendant!.sign} (${ascendant!.element}, strong angular weight)`,
        ].join('\n')
      : [
          `Sun: ${sun.sign} (${sun.element}, ${elementalDistribution[sun.element]}% elemental weight)`,
          `Moon: ${moon.sign} (${moon.element}, ${elementalDistribution[moon.element]}% elemental weight)`,
          `Ascendant: not calculated (coordinates not provided)`,
        ].join('\n'),
    `Elemental distribution — Fire: ${elementalDistribution.fire}% | Water: ${elementalDistribution.water}% | Earth: ${elementalDistribution.earth}% | Air: ${elementalDistribution.air}%`,
    `Dominant element: ${dominantElement}`,
    `Underactive element: ${underactiveElement}`,
    `Calculation mode: ${calculationMode}`,
  ].join('\n');

  const spiralogicContextBlock = [
    'Life-cycle transits active now:',
    ...activeTransits.map((t, i) => `${i + 1}. ${t}`),
    lifeStage ? `\nLife stage: ${lifeStage}` : '',
  ].filter(Boolean).join('\n');

  return {
    dominantElement,
    underactiveElement,
    elementalDistribution,
    sunSign: sun.sign,
    moonSign: moon.sign,
    ascendantSign: ascendant?.sign ?? null,
    calculationMode,
    astrologyContextBlock,
    spiralogicContextBlock,
  };
}
