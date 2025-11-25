/**
 * 🌌 AETHER - The Crown Orchestrator
 * Prefrontal integration without homogenization
 * Creates wisdom from maintained diversity
 */

import { SpiralogicContext, CrownSynthesis, ElementalContribution } from '../types/Spiralogic';
import { withSeparator, parallelProcessWithSeparation } from './Separator';
import { fireVision, airAnalysis, waterAttunement, earthGrounding } from './Agents';

/**
 * Crown synthesis - orchestrates without merging
 * This is where consciousness emerges from differentiation
 */
export async function crownSynthesize(ctx: SpiralogicContext): Promise<CrownSynthesis> {
  // Run all agents in parallel with maintained separation
  const [fire, air, water, earth] = await parallelProcessWithSeparation([
    () => fireVision(ctx),
    () => airAnalysis(ctx),
    () => waterAttunement(ctx),
    () => earthGrounding(ctx)
  ]);

  // Create parallax - depth from differences
  const parallax = generateParallax(fire, air, water, earth);

  // Synthesize without homogenizing
  const synthesis = synthesizeWithoutHomogenizing(
    { fire, air, water, earth },
    ctx,
    parallax
  );

  return {
    lines: synthesis.lines,
    rationaleParallax: parallax.rationale,
    elementContrib: {
      fire: fire.summary,
      air: air.summary,
      water: water.summary,
      earth: earth.summary
    },
    aetherTone: determineAetherTone(ctx),
    productiveTensions: parallax.tensions
  };
}

/**
 * Generate parallax - find the productive tensions
 * Depth emerges from maintained differences, not merger
 */
function generateParallax(
  fire: ElementalContribution,
  air: ElementalContribution,
  water: ElementalContribution,
  earth: ElementalContribution
): { rationale: string[]; tensions: string[] } {
  const tensions: string[] = [];
  const rationale: string[] = [];

  // Find productive tensions between elements
  if (fire.resonance > 0.6 && earth.resonance > 0.6) {
    tensions.push("Fire's urgency and Earth's patience create depth");
    rationale.push("The tension between transformation and stability generates wisdom");
  }

  if (water.resonance > 0.6 && air.resonance > 0.6) {
    tensions.push("Water's feeling and Air's analysis offer stereoscopic vision");
    rationale.push("Emotion and logic together see more than either alone");
  }

  if (fire.resonance > 0.5 && water.resonance > 0.5) {
    tensions.push("Fire's passion meets Water's flow");
    rationale.push("Intensity and fluidity dance together");
  }

  // If no strong tensions, note the balance
  if (tensions.length === 0) {
    rationale.push("All elements present in gentle balance");
  }

  return { rationale, tensions };
}

/**
 * Synthesize without homogenizing
 * Maintains the integrity of each perspective
 */
function synthesizeWithoutHomogenizing(
  elements: Record<'fire' | 'air' | 'water' | 'earth', ElementalContribution>,
  ctx: SpiralogicContext,
  parallax: { tensions: string[] }
): { lines: string[] } {
  const lines: string[] = [];

  // Start with present moment acknowledgment (80% weight) - softer, everyday tone
  const userWords = ctx.moment.text.split(' ').slice(0, 15).join(' ');
  lines.push(`I hear you: "${userWords}..."`);

  // Find the strongest elemental contributions
  const contributions = Object.values(elements).sort((a, b) => b.resonance - a.resonance);
  const dominant = contributions[0];
  const secondary = contributions[1];

  // Add the dominant insight
  if (dominant.resonance > 0.5) {
    lines.push(dominant.insight);
  }

  // If there's significant secondary presence, acknowledge both naturally
  if (secondary.resonance > 0.4 && dominant.resonance - secondary.resonance < 0.3) {
    lines.push(`There's both ${dominant.element} and ${secondary.element} here.`);
  }

  // Name productive tensions if they exist - more conversational
  if (parallax.tensions.length > 0) {
    const tension = parallax.tensions[0].replace("create depth", "work together");
    lines.push(tension);
  }

  // Add memory echoes lightly (20% weight) - more natural
  if (ctx.memoryPointers.length > 0) {
    lines.push(`This feels connected to what we talked about before.`);
  }

  // Close with presence, not advice - warmer, more human
  if (ctx.meta.trustBreath === 'expanding') {
    lines.push("I'm here as you open to this.");
  } else if (ctx.meta.trustBreath === 'contracting') {
    lines.push("I'm with you as you gather yourself.");
  } else {
    lines.push("I'm here with you.");
  }

  return { lines };
}

/**
 * Determine the Aether tone based on context
 */
function determineAetherTone(
  ctx: SpiralogicContext
): 'integrative' | 'spacious' | 'anchoring' {
  const totalIntensity = ctx.currents.reduce((sum, c) => sum + c.intensity, 0);

  if (totalIntensity > 2.5) {
    return 'anchoring'; // High intensity needs grounding
  } else if (totalIntensity < 1.0) {
    return 'spacious'; // Low intensity allows expansion
  } else {
    return 'integrative'; // Balanced intensity seeks integration
  }
}

/**
 * Format crown synthesis into flowing sacred text
 */
export function formatSacredLines(
  crown: CrownSynthesis,
  ctx: SpiralogicContext
): string {
  // Join lines with appropriate spacing
  let text = crown.lines.join(' ');

  // Add pauses for breath
  text = text.replace(/\. /g, '... ');

  // Ensure it doesn't end with advice unless asked
  if (!ctx.moment.text.includes('advice') &&
      !ctx.moment.text.includes('should') &&
      !ctx.moment.text.includes('help me')) {
    // Remove any prescriptive endings
    text = text.replace(/You should[^.]*\./g, '');
    text = text.replace(/Try[^.]*\./g, '');
  }

  return text;
}