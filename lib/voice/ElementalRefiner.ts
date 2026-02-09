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
   * @param mode - 'talk' skips tightenStyle to preserve natural filler words
   */
  static refine(text: string, element: Element, mode?: 'talk' | 'care' | 'scribe'): ElementalRefinement {
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

    // Tighten style — SKIP for Talk mode (natural filler = warmth in conversation)
    if (mode !== 'talk') {
      const { text: tightenedText, transformations: tightenTransforms } = this.tightenStyle(refined);
      refined = tightenedText;
      transformations.push(...tightenTransforms);
    }

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
      // FIRE: Energy, movement, spark — only structural tightening, no alien swaps
      fire: [
        [/\btry to\b/gi, '', 'fire:directness'],
        [/\bmaybe we could\b/gi, "let's", 'fire:action'],
        [/\bperhaps\b/gi, '', 'fire:certainty'],
      ],
      // WATER: Depth, flow, emotion — only soften commands, don't replace feelings
      water: [
        [/\bshould consider\b/gi, 'might let yourself', 'water:flow'],
        [/\bmust\b/gi, 'can', 'water:fluidity'],
        [/\bhave to\b/gi, 'could', 'water:invitation'],
      ],
      // EARTH: Body, grounding, practical — only structural tightening
      earth: [
        [/\bmaybe try\b/gi, "let's", 'earth:practical'],
        [/\btry\s+(\w+ing)\b/gi, 'practice $1', 'earth:practice'],
      ],
      // AETHER: Pattern, integration — only genuine reframes
      aether: [
        [/\bfix\s+this\b/gi, 'work with this', 'aether:integration'],
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

    // Only strip truly dead hedging — keep warmth words (just, kind of, actually, honestly)
    const fillerPatterns: Array<[RegExp, string, string]> = [
      [/\bit\s+appears\s+that\b/gi, '', 'remove:hedging'],
      [/\bit\s+seems\s+like\b/gi, '', 'remove:hedging'],
      [/\bI\s+suppose\b/gi, '', 'remove:hedging'],
      [/\bobviously\b/gi, '', 'remove:filler'],
      [/\bliterally,?\s*/gi, '', 'remove:filler'],
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
