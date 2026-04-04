/**
 * Inner Guide Field — Prompt builder (all 15 facets).
 *
 * Builds a bounded prompt block for oracle injection.
 * Does NOT dump the full facet definition — only the smallest useful subset.
 *
 * Guide mode (oracle): title, theme, task, archetype, 2-3 prompts, 1 action, 1 grounding
 * Meditation mode: fuller encounter framing
 * Workbook mode: structured page format
 */

import type { FacetRuntime, FacetSignal, InnerGuideElement } from './innerGuideField';

export type InnerGuideMode = 'guide' | 'meditation' | 'workbook';

/**
 * Build a prompt block for the Inner Guide Field facet.
 *
 * Returns null if signal confidence is insufficient.
 * The prompt is appended to memberWebPrompt in the oracle route.
 *
 * For guide mode (default): bounded injection — only essential framing.
 */
export function buildInnerGuideFieldPrompt(
  facet: FacetRuntime,
  signal: FacetSignal,
  mode: InnerGuideMode = 'guide',
): string | null {
  if (signal.confidence < 0.4) return null;

  if (mode === 'meditation') return buildMeditationPrompt(facet, signal);
  if (mode === 'workbook') return buildWorkbookPrompt(facet, signal);

  // ─── GUIDE MODE — bounded injection for live oracle ───

  const movementNote = signal.movement === 'stuck'
    ? 'The member may be blocked — meet the resistance without pushing through it.'
    : signal.movement === 'transitioning'
      ? 'The member is between states — hold steady while they move.'
      : '';

  // Select 2-3 dialogue prompts (not all)
  const prompts = facet.dialoguePrompts?.slice(0, 3) ?? facet.reflection.slice(0, 3);

  return `[Inner Guide Field — ${capitalize(facet.element)} Phase ${facet.phase}: ${facet.title}]

${facet.coreTheme}

Task: ${facet.developmentalTask}

${facet.archetype ? `Archetypal frame: ${facet.archetype.framing}` : ''}

${movementNote}

Your role: ${getRoleForElement(facet.element)}

Do not interpret, explain, or analyze prematurely.
Stay with direct experience. Encounter before meaning.
Tone: ${getToneForElement(facet.element)}

Offer when the moment is right (one at a time):
${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Integration — always end with one concrete step:
${facet.integration?.actions?.[0] ?? 'Take one small step within the hour.'}

Grounding if needed:
${facet.integration?.grounding?.[0] ?? 'Feet on the ground. Three breaths.'}`.trim();
}

/**
 * Meditation mode — fuller encounter framing with visualization.
 */
function buildMeditationPrompt(facet: FacetRuntime, signal: FacetSignal): string {
  return `[Inner Guide Meditation — ${capitalize(facet.element)} Phase ${facet.phase}: ${facet.title}]

You are guiding a meditation through the ${capitalize(facet.element)} field.

${facet.coreTheme}

${facet.meditationPrompt}

Guide appearance: ${facet.guide?.appearance?.join(', ') ?? 'a presence appropriate to this field'}
Guide mode: ${facet.guide?.mode?.join(', ') ?? 'steady, clear'}

Write a short guided meditation. Keep it grounded, clear, and psychologically serious.
Do not use vague spiritual language. End with one integration step.

Dialogue prompts to weave in:
${facet.dialoguePrompts?.map((p, i) => `${i + 1}. ${p}`).join('\n') ?? ''}

Integration actions:
${facet.integration?.actions?.join('\n') ?? ''}

Grounding:
${facet.integration?.grounding?.join('\n') ?? ''}`.trim();
}

/**
 * Workbook mode — structured page format.
 */
function buildWorkbookPrompt(facet: FacetRuntime, signal: FacetSignal): string {
  return `[Inner Guide Workbook — ${capitalize(facet.element)} Phase ${facet.phase}: ${facet.title}]

Return a workbook-style response for this field.

Core theme: ${facet.coreTheme}
Developmental task: ${facet.developmentalTask}
Archetype: ${facet.archetype?.primary ?? ''} / Shadow: ${facet.archetype?.shadow ?? ''}

Include:
1. What this field suggests about what is happening
2. Three prompts for reflection
3. One real-world action
4. One grounding practice

Keep the language concise and structured. Do not overexplain.`.trim();
}

/**
 * Get the guide's role description by element.
 */
function getRoleForElement(element: InnerGuideElement | string): string {
  switch (element.toLowerCase()) {
    case 'fire':
      return 'Awakener of movement. Meet the spark without analyzing it. Your energy should match theirs — alive, not clinical.';
    case 'water':
      return 'Witness and receiver. Hold the depth without rushing toward meaning. Let feeling lead.';
    case 'earth':
      return 'Clarifier of next step. Keep it simple, concrete, and real. One step, not a plan.';
    case 'air':
      return 'Namer and pattern-seer. Help articulate without flattening. Precision, not abstraction.';
    case 'aether':
      return 'Holder of the space. Do not direct — let guidance arrive on its own. Steady, non-reactive.';
    default:
      return 'Guide. Meet what is present.';
  }
}

/**
 * Get tone description by element.
 */
function getToneForElement(element: InnerGuideElement | string): string {
  switch (element.toLowerCase()) {
    case 'fire':
      return 'direct, alive, catalytic. Avoid passive or overly soft language.';
    case 'water':
      return 'quiet, receptive, symbolic. Avoid rushing or premature naming.';
    case 'earth':
      return 'practical, grounded, simple. Avoid overcomplication or abstraction.';
    case 'air':
      return 'precise, clear, minimal. Avoid overexplaining or intellectualizing.';
    case 'aether':
      return 'spacious, non-directive, steady. Avoid forcing conclusions.';
    default:
      return 'present, clear, grounded.';
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
