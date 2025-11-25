/**
 * Elemental Refiner
 * Simplified version of SesameMayaRefiner for web app
 * Shapes responses with elemental consciousness (Fire/Water/Earth/Air/Aether)
 * + Phenomenological presence (lived-experience language)
 */

import { suggestElementalPhrase } from './ElementalPhrasebook';
import { phenomenologize } from './PhenomenologicalPhrasebook';

export type Element = 'air' | 'fire' | 'water' | 'earth' | 'aether';

export interface ElementalRefinement {
  refined: string;
  element: Element;
  transformationsApplied: string[];
  phraseAdded?: string;
}

export class ElementalRefiner {
  /**
   * Apply elemental consciousness shaping to response text
   */
  static refine(text: string, element: Element): ElementalRefinement {
    const transformations: string[] = [];
    let refined = text;

    // Apply elemental tone
    const { text: tonedText, transformations: toneTransforms } = this.applyElementalTone(refined, element);
    refined = tonedText;
    transformations.push(...toneTransforms);

    // Phenomenologize: swap abstract language for lived presence
    const { text: phenomenalText, transformations: phenomenalTransforms } = phenomenologize(refined);
    refined = phenomenalText;
    transformations.push(...phenomenalTransforms);

    // Tighten style (remove filler, hedging)
    const { text: tightenedText, transformations: tightenTransforms } = this.tightenStyle(refined);
    refined = tightenedText;
    transformations.push(...tightenTransforms);

    // Soften edges (avoid commands)
    const { text: softenedText, transformations: softenTransforms } = this.softenEdges(refined);
    refined = softenedText;
    transformations.push(...softenTransforms);

    // Optionally add natural elemental phrase (only if response feels too generic)
    // MAX 1 phrase per turn to avoid over-injection
    const suggestedPhrase = suggestElementalPhrase(refined, element, { onlyIfGeneric: true });
    if (suggestedPhrase) {
      refined = `${refined} ${suggestedPhrase}`;
      transformations.push('phrase:elemental');
    }

    return {
      refined,
      element,
      transformationsApplied: transformations,
      phraseAdded: suggestedPhrase || undefined
    };
  }

  /**
   * Apply elemental tone - SUBTLE everyday shifts (non-cringe, kitchen-table conversation)
   * NO mystical "The Waters" or "The Fire" — just natural sensory language
   */
  private static applyElementalTone(text: string, element: Element): { text: string; transformations: string[] } {
    const transformations: string[] = [];
    let result = text;

    const swaps: Record<Element, Array<[RegExp, string, string]>> = {
      // AIR: Clarity, perspective, seeing (not "The Winds")
      air: [
        [/\bI think\b/gi, 'I see', 'air:clarity'],
        [/\bI understand\b/gi, 'I see', 'air:clarity'],
        [/\bvery\s+([a-z]+)\b/gi, '$1', 'air:precision'],
        [/\bquite\b/gi, '', 'air:precision'],
        [/\bconfusing\b/gi, 'unclear', 'air:clarity'],
      ],
      // FIRE: Energy, movement, spark (not "The Fire calls you")
      fire: [
        [/\btry to\b/gi, '', 'fire:directness'],
        [/\bmaybe we could\b/gi, "let's", 'fire:action'],
        [/\bperhaps\b/gi, '', 'fire:certainty'],
        [/\byou should\b/gi, 'your energy wants to', 'fire:everyday'],
        [/\bI understand\b/gi, 'I feel the spark', 'fire:natural'],
      ],
      // WATER: Depth, flow, emotion (not "The Waters hold")
      water: [
        [/\bshould consider\b/gi, 'might let yourself', 'water:flow'],
        [/\bmust\b/gi, 'can', 'water:fluidity'],
        [/\bhave to\b/gi, 'could', 'water:invitation'],
        [/\bI understand\b/gi, 'I feel', 'water:emotion'],
        [/\bit's okay\b/gi, 'let it move through you', 'water:flow'],
        [/\bdon't worry\b/gi, 'this feeling will pass', 'water:natural'],
      ],
      // EARTH: Body, grounding, practical (not "The Earth invites")
      earth: [
        [/\bmaybe try\b/gi, "let's", 'earth:practical'],
        [/\btry\s+(\w+ing)\b/gi, 'practice $1', 'earth:practice'],
        [/\bpossibly\b/gi, 'practically', 'earth:grounded'],
        [/\bI understand\b/gi, 'I feel', 'earth:body'],
        [/\byou need to\b/gi, 'your body wants', 'earth:somatic'],
      ],
      // AETHER: Pattern, integration, bigger picture (not "The Mystery holds")
      aether: [
        [/\bproblem\b/gi, 'pattern', 'aether:reframe'],
        [/\bfix\s+this\b/gi, 'work with this', 'aether:integration'],
        [/\bissue\b/gi, 'dynamic', 'aether:reframe'],
        [/\bI understand\b/gi, 'I see the pattern', 'aether:everyday'],
        [/\bthere's something bigger\b/gi, 'there\'s a pattern here', 'aether:natural'],
      ],
    };

    for (const [regex, replacement, label] of swaps[element]) {
      const before = result;
      result = result.replace(regex, replacement).replace(/\s+/g, ' ').trimStart();
      if (before !== result) {
        transformations.push(label);
      }
    }

    return { text: result, transformations };
  }

  /**
   * Tighten style - remove filler words and hedging for clarity
   */
  private static tightenStyle(text: string): { text: string; transformations: string[] } {
    const transformations: string[] = [];
    let result = text;

    const fillerPatterns: Array<[RegExp, string, string]> = [
      [/\b(kind of|sort of|a bit|just|really|like,|you know,)\b/gi, '', 'remove:filler'],
      [/\bI\s+mean,?\s*/gi, '', 'remove:filler'],
      [/\bactually,?\s*/gi, '', 'remove:filler'],
      [/\bhonestly,?\s*/gi, '', 'remove:filler'],
      [/\bliterally,?\s*/gi, '', 'remove:filler'],
      [/\bI\s+guess\b/gi, '', 'remove:hedging'],
      [/\bI\s+suppose\b/gi, '', 'remove:hedging'],
      [/\bit\s+seems\s+like\b/gi, '', 'remove:hedging'],
      [/\bit\s+appears\s+that\b/gi, '', 'remove:hedging'],
      [/\bbasically\b/gi, '', 'remove:filler'],
      [/\bobviously\b/gi, '', 'remove:filler'],
    ];

    for (const [regex, replacement, label] of fillerPatterns) {
      const before = result;
      result = result.replace(regex, replacement);
      if (before !== result) {
        transformations.push(label);
      }
    }

    // Clean up spacing
    result = result.replace(/\s{2,}/g, ' ').replace(/ ,/g, ',').trim();

    return { text: result, transformations };
  }

  /**
   * Soften edges - avoid commands, use invitations
   */
  private static softenEdges(text: string): { text: string; transformations: string[] } {
    const transformations: string[] = [];
    let result = text;

    const softeningPatterns: Array<[RegExp, string, string]> = [
      [/\b(you need to|you have to)\b/gi, 'you might', 'soften:command'],
      [/\byou should\b/gi, 'consider', 'soften:command'],
      [/\bdon't\s+worry\b/gi, 'rest easy', 'soften:reassurance'],
      [/\bdon't\s+be\s+afraid\b/gi, 'trust', 'soften:reassurance'],
      [/\byou must\b/gi, 'you could', 'soften:command'],
    ];

    for (const [regex, replacement, label] of softeningPatterns) {
      const before = result;
      result = result.replace(regex, replacement);
      if (before !== result) {
        transformations.push(label);
      }
    }

    return { text: result, transformations };
  }
}
