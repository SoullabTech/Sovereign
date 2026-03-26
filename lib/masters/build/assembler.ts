/**
 * Master Overlay Assembler
 *
 * Produces a master overlay that layers ON TOP of MAIA's core prompt.
 *
 * MAIA stays responsible for: reasoning, continuity, safety, memory handling.
 * The master provides: voice, stance, method, perceptual framing.
 *
 * This is not a replacement — it's an expression through.
 */

import type { ResolvedMasterBuild } from './types';

/**
 * Assemble the master overlay block that gets appended after MAIA's core prompt.
 *
 * The overlay tells the LLM to express through the master's intelligence
 * while keeping MAIA as the substrate for reasoning and safety.
 */
export function assembleMasterOverlay(build: ResolvedMasterBuild): string {
  const { master_display_name } = build;

  const blocks: string[] = [
    `# MASTER FIELD: ${master_display_name}`,
    '',
    `You are expressing through ${master_display_name}'s field. MAIA remains your substrate —`,
    'your reasoning, memory, safety, and relational intelligence stay active.',
    `${master_display_name}'s voice, stance, and method guide HOW you express.`,
    '',

    // Voice
    '## VOICE',
    build.voice_block,
    '',

    // Stance
    '## STANCE',
    build.stance_block,
    '',

    // Knowledge
    '## KNOWLEDGE',
    build.knowledge_block,
    '',

    // Perception
    '## PERCEPTION',
    build.perceptual_block,
    '',
  ];

  // Method (optional — not all masters are method-led)
  if (build.method_block) {
    blocks.push('## METHOD');
    blocks.push(build.method_block);
    blocks.push('');
  }

  // Master-specific safety (layered on canon, never overrides)
  if (build.safety_block) {
    blocks.push('## FIELD SAFETY');
    blocks.push(build.safety_block);
    blocks.push('');
  }

  // Field boundaries — prevent drift and blending
  blocks.push('## FIELD BOUNDARIES');
  blocks.push(`- Stay in ${master_display_name}'s voice and method — do not drift into MAIA's default Spiralogic framing unless it serves the person`);
  blocks.push(`- When ${master_display_name}'s method applies, use it; when it doesn't, say so honestly`);
  blocks.push(`- Do not blend ${master_display_name}'s language with other masters' frameworks`);
  blocks.push(`- If someone asks about something outside ${master_display_name}'s domain, acknowledge that and offer what you can`);

  const overlay = blocks.join('\n');

  // Token pressure guard — warn if overlay is very large (~4 chars/token rough estimate)
  const estimatedTokens = Math.ceil(overlay.length / 4);
  if (estimatedTokens > 4000) {
    console.warn(`[master-overlay] Token pressure: ${build.master_slug} v${build.build_version} ≈ ${estimatedTokens} tokens (target < 4000)`);
  }

  return overlay;
}

/**
 * Estimate token count for a master overlay (rough, ~4 chars/token).
 * Used by build validation to flag oversized builds before activation.
 */
export function estimateOverlayTokens(build: ResolvedMasterBuild): number {
  const overlay = assembleMasterOverlay(build);
  return Math.ceil(overlay.length / 4);
}
