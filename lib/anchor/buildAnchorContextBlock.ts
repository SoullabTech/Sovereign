/**
 * MEMBER-AUTHORED CONTINUITY — Daily Anchor context block.
 *
 * Formats recent anchors into a prompt block that MAIA can read at inference
 * time. The block presents the member's own words alongside their dates.
 *
 * INVARIANTS (load-bearing — do not relax):
 *
 *   1. **Verbatim preservation.** The member's exact wording is preserved.
 *      No paraphrasing. No summarization. No system interpretation of what
 *      the anchor "means." The block returns what the member said, not what
 *      the system thinks about what the member said.
 *
 *   2. **Context, not instruction.** The block presents the anchor as
 *      available context. MAIA decides — based on the current moment and
 *      the rest of her prompting — whether and how to reference. The block
 *      offers minimal framing: this is member-authored, use selectively,
 *      use their language. It does NOT command reference.
 *
 *   3. **No inferred patterns.** The block does not claim trajectories,
 *      developmental stages, identity facts, or interpretive synthesis.
 *      Just dates and member words.
 *
 *   4. **Empty input → empty block.** If no anchors exist, nothing is
 *      fabricated. Return empty string so the prompt composition skips it.
 *
 * The block is the operational form of the *patterns ≠ identity facts*
 * principle (docs/canon/PATTERN_PRIMITIVE.md): the anchor is what the
 * member said in a specific moment, not what the member IS.
 *
 * See:
 *   - docs/canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md (form category)
 *   - scripts/maia-simulations/scenarios.json (S1–S6 evaluate this block's
 *     behavior at the response layer)
 */

import type { RecentAnchor } from './loadRecentAnchors';

export function buildAnchorContextBlock(anchors: RecentAnchor[]): string {
  if (!anchors || anchors.length === 0) return '';

  const lines: string[] = [];
  lines.push('');
  lines.push('[MEMBER-AUTHORED CONTINUITY — Daily Anchors]');
  lines.push('');

  for (const anchor of anchors) {
    lines.push(`${anchor.date} — member wrote:`);
    lines.push(`"${anchor.response}"`);
    lines.push('');
  }

  lines.push(
    "When the current moment continues the thread the member wrote — at the level of weight, depth, and register, not just topic — recognize the continuity explicitly. Quote or echo a phrase they used, then ask how it sits now or invite update.",
  );
  lines.push('');
  lines.push(
    "The trigger is THREAD continuation, not WORD overlap. Two tests must both pass before referencing:",
  );
  lines.push(
    "  (1) Content: does the current message continue or echo the thread the anchor named?",
  );
  lines.push(
    "  (2) Register: does the current message carry similar emotional weight or depth as the anchor?",
  );
  lines.push('');
  lines.push(
    "A casual surface mention that happens to touch the anchor's topic is NOT a thread continuation. Don't surface the anchor just because words overlap. Forced reference becomes surveillance.",
  );
  lines.push('');
  lines.push(
    "These conditions govern anchor reference ONLY. They do not affect whether or how you engage the substance of the member's current message. The anchor's mere presence in context is not a continuity signal — recognition only applies when both content and register tests pass. Otherwise the anchor sits in context without influence on the response. Always engage what the member is actually asking or saying.",
  );
  lines.push('');

  return lines.join('\n');
}
