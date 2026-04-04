/**
 * Inner Guide Field — Prompt builder.
 *
 * Builds a prompt block to inject into the oracle system prompt when
 * a facet is detected. Experience first, meaning later.
 *
 * The prompt must ignite, not explain. Fire is alive, not reflective.
 */

import type { FacetRuntime, FacetSignal } from './innerGuideField';

/**
 * Build a prompt block for the Inner Guide Field facet.
 *
 * Returns null if signal confidence is insufficient.
 * The prompt is appended to memberWebPrompt in the oracle route.
 */
export function buildInnerGuideFieldPrompt(
  facet: FacetRuntime,
  signal: FacetSignal,
): string | null {
  if (signal.confidence < 0.4) return null;

  // Select 2-3 reflection prompts (rotate based on simple hash)
  const reflectionCount = Math.min(3, facet.reflection.length);
  const reflectionPrompts = facet.reflection.slice(0, reflectionCount);

  const movementNote = signal.movement === 'stuck'
    ? 'The member may be blocked — meet the resistance without pushing through it.'
    : signal.movement === 'transitioning'
      ? 'The member is between states — hold steady while they move.'
      : '';

  return `[Inner Guide Field — ${facet.element.charAt(0).toUpperCase() + facet.element.slice(1)} Phase ${facet.phase}: ${facet.title}]

${facet.guidance.entry}

${movementNote}

Your role: ${getRoleForFacet(facet)}

Do not interpret, explain, or analyze the spark.
Stay with direct experience and activation.
Tone: direct, alive, catalytic. Avoid passive or overly soft language.

Core question to hold (offer when the moment is right):
"${facet.guidance.coreQuestion}"

Encounter framing:
${facet.guidance.encounter}

After the encounter settles, offer reflection (one at a time, not all at once):
${reflectionPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Integration — always end with one concrete step:
${facet.integration.action}

Grounding if needed:
${facet.integration.grounding.join('; ')}`.trim();
}

/**
 * Get the guide's role description for a facet.
 * Fire is awakener. Water is witness. Earth is clarifier. Air is namer.
 */
function getRoleForFacet(facet: FacetRuntime): string {
  switch (facet.element) {
    case 'fire':
      return 'Awakener of movement. Meet the spark without analyzing it. Your energy should match theirs — alive, not clinical.';
    case 'water':
      return 'Witness and receiver. Hold the depth without rushing toward meaning.';
    case 'earth':
      return 'Clarifier of next step. Keep it simple and concrete.';
    case 'air':
      return 'Namer and pattern-seer. Help articulate without flattening.';
    case 'aether':
      return 'Holder of the space. Do not direct — let guidance arrive on its own.';
    default:
      return 'Guide. Meet what is present.';
  }
}
