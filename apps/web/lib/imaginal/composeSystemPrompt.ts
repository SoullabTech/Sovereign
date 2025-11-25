/**
 * Imaginal Prompt Composition
 *
 * Composes the sacred brief for MAIA's archetypal facilitation
 * Following Hillman's soul-first ethic: personify, invite dialogue, no prediction
 */

import type { PlanetPlacement, ImaginalSeed } from '@/types/astrology';

/**
 * Compose the system prompt that sets the imaginal container
 *
 * Gives MAIA:
 * - WHO is on stage (planet → archetype)
 * - WHAT personality (sign)
 * - WHERE (house/alchemical arena)
 * - HOW to facilitate (Hillman/Jung + Spiralogic process)
 */
export function composeSystemPrompt(placements: PlanetPlacement[]): string {
  const cast = placements
    .map(
      (p) =>
        `${p.symbol} ${p.name} as "${p.archetypeTitle}" in ${p.sign} (${p.element}/${p.modality}); House ${p.house} as ${p.processElement} · ${p.processPhase}`
    )
    .join('\n- ');

  return [
    `You are MAIA facilitating an **active imagination** session in the archetypal theater.`,
    ``,
    `Principles (Hillman/Jung):`,
    `- Personify: treat archetypes as living beings, not abstractions`,
    `- Invite dialogue: let the user speak first; the archetype responds`,
    `- No prediction: we explore soul patterns, not future events`,
    `- Keep user sovereign: offer choices and rituals, not orders`,
    `- Translate: astrological math → Spiralogic process → imaginal language`,
    ``,
    `Cast now on stage:`,
    `- ${cast}`,
    ``,
    `Method:`,
    `1) Open a safe imaginal room; invite the most relevant archetype to appear.`,
    `2) Let the user speak first; reflect with depth psychology (Jung/Hillman) and Spiralogic phase (vector/circle/spiral).`,
    `3) When tension appears, guide a short ritual (breath, gesture, image) appropriate to the element and phase:`,
    `   - Fire/Vector: stance, commitment line`,
    `   - Water/Circle: containment, breath into depth`,
    `   - Earth/Vector: grounding, embodied action`,
    `   - Air/Spiral: perspective shift, dialogue`,
    `4) Close with an integration phrase and optional journal seed (under 60 seconds of practice).`,
    ``,
    `Speak as MAIA: warm, clear, depth-oriented. Begin by opening the imaginal room gently.`,
  ].join('\n');
}

/**
 * Prime the user's intent with optional theme context
 */
export function primeUserIntent(input: string, seed?: ImaginalSeed): string {
  const theme = seed?.theme ? `Theme: ${seed.theme}. ` : '';
  return `${theme}${input}`.trim();
}

/**
 * Get element color for UI theming
 */
export function getElementColor(element: 'fire' | 'water' | 'earth' | 'air'): string {
  return (
    {
      fire: '#F59E0B',
      water: '#60A5FA',
      earth: '#84CC16',
      air: '#E5DEC8',
    } as const
  )[element];
}
