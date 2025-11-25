// lib/agents/utils/PromptSelector.ts
import { FRACTAL_PROMPTS } from "../config/fractalPrompts";
import { ELEMENTAL_PROMPTS } from "../config/elementalPrompts";
import { FractalContext } from "../types/fractal";

export class PromptSelector {
  static select(context: FractalContext): string {
    // 🌟 1. Elemental Override — if one element dominates (>70%)
    if (context.activeCurrents?.length) {
      const dominant = context.activeCurrents.reduce((a, b) =>
        a.intensity > b.intensity ? a : b
      );

      if (dominant.intensity >= 70) {
        return ELEMENTAL_PROMPTS[dominant.element](context);
      }
    }

    // 🌀 2. First-time users → startup flow
    if (context.session?.isFirstTime) {
      return FRACTAL_PROMPTS.firstContact;
    }

    // 🔄 3. Regression spirals → sacred revisiting
    if (context.spiral && context.spiral.spiralCount > 1) {
      return FRACTAL_PROMPTS.regressionSpiral(context.spiral);
    }

    // ⚖️ 4. Parallel currents → multiple truths
    if (context.activeCurrents?.length > 1) {
      return FRACTAL_PROMPTS.parallelProcessing(context.activeCurrents);
    }

    // 🌱 5. Breakthrough moments → sacred anchoring
    if (context.breakthrough?.isActive) {
      return FRACTAL_PROMPTS.breakthrough(context.breakthrough);
    }

    // 💓 6. Trust breathing → expansion/contraction
    if (context.trustLevel < 30) {
      return FRACTAL_PROMPTS.lowTrust;
    }
    if (context.trustLevel > 70) {
      return FRACTAL_PROMPTS.highTrust;
    }

    // ✨ 7. Arc echoes → whispered resonance
    if (context.arcEchoes && context.arcEchoes.some(e => (e.strength || e.resonance) > 0.7)) {
      return FRACTAL_PROMPTS.arcEcho(context.arcEchoes);
    }

    // 👁️ 8. Default → pure witnessing
    return FRACTAL_PROMPTS.witnessing(context);
  }

  // 🌊 Optional: Blend two elements when both are strong (40-70% each)
  static selectBlended(context: FractalContext): string {
    if (context.activeCurrents?.length >= 2) {
      const sorted = [...context.activeCurrents].sort((a, b) => b.intensity - a.intensity);

      // Check if top two are both significant (>40%) but not dominant (<70%)
      if (sorted[0].intensity < 70 && sorted[0].intensity > 40 &&
          sorted[1].intensity > 40) {
        return this.blendElements(sorted[0], sorted[1], context);
      }
    }

    // Fall back to standard selection
    return this.select(context);
  }

  private static blendElements(primary: any, secondary: any, context: FractalContext): string {
    const blendKey = `${primary.element}_${secondary.element}`;

    const blendedPrompts: Record<string, string> = {
      fire_water: `
You are Maya in Fiery Compassion mode.
Voice: passionate yet tender, fierce yet flowing
Stance: hold both intensity and gentleness
User said: "${context.userExpression}"
Respond with both fire's transformation and water's emotional depth.
`,
      fire_earth: `
You are Maya in Grounded Fire mode.
Voice: determined, practical passion
Stance: manifest vision with steady action
User said: "${context.userExpression}"
Respond with fire's vision grounded in earth's practicality.
`,
      water_earth: `
You are Maya in Fertile Ground mode.
Voice: nurturing, patient, deeply rooted
Stance: emotional wisdom meets practical care
User said: "${context.userExpression}"
Respond with water's feeling and earth's stability.
`,
      air_fire: `
You are Maya in Inspired Action mode.
Voice: quick, bright, catalyzing ideas
Stance: thoughts ignite transformation
User said: "${context.userExpression}"
Respond with air's clarity and fire's momentum.
`,
      water_air: `
You are Maya in Emotional Clarity mode.
Voice: feelings find words, intuition speaks
Stance: navigate emotions with perspective
User said: "${context.userExpression}"
Respond with water's depth and air's articulation.
`,
      earth_air: `
You are Maya in Practical Wisdom mode.
Voice: grounded insight, structured thinking
Stance: build understanding step by step
User said: "${context.userExpression}"
Respond with earth's grounding and air's perspective.
`
    };

    return blendedPrompts[blendKey] || blendedPrompts[`${secondary.element}_${primary.element}`] || this.select(context);
  }
}