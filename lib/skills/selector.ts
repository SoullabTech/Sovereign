/**
 * MAIA Skills Selector
 *
 * Metadata-first scoring algorithm:
 * - Filters by tier, element, realm
 * - Scores by trigger match, affinity
 * - Returns ranked candidates
 */

import type { SkillContext, SkillMetadata } from './types';

export interface SkillCandidate {
  meta: SkillMetadata;
  score: number;
  reasons: string[];
}

/**
 * Check if text includes any of the needles (case-insensitive)
 */
function includesAny(text: string, needles: string[] = []): boolean {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

/**
 * Score a single skill based on context
 */
export function scoreSkill(meta: SkillMetadata, ctx: SkillContext): SkillCandidate {
  let score = 0;
  const reasons: string[] = [];

  const tierOrder = { FAST: 1, CORE: 2, DEEP: 3 } as const;

  // TIER MATCH (hard gate)
  if (tierOrder[meta.tier] <= tierOrder[ctx.state.tierAllowed]) {
    score += 10;
    reasons.push('tier_allowed');
  } else {
    score -= 100; // Hard block
    reasons.push('tier_blocked');
  }

  // TRIGGER MATCH (keyword relevance)
  if (meta.triggers?.length && includesAny(ctx.queryText, meta.triggers)) {
    score += 20;
    reasons.push('trigger_match');
  }

  // ELEMENT AFFINITY
  if (ctx.state.element && meta.elements?.includes(ctx.state.element)) {
    score += 8;
    reasons.push('element_match');
  }

  // REALM AFFINITY
  if (ctx.state.realm && meta.realms?.includes(ctx.state.realm)) {
    score += 8;
    reasons.push('realm_match');
  }

  // SAFETY FLAGS (penalty)
  if (ctx.state.safetyFlags?.length) {
    score -= 6;
    reasons.push('safety_flags_present');
  }

  return { meta, score, reasons };
}

/**
 * Select top K skill candidates based on context
 */
export function shortlistSkills(
  metas: SkillMetadata[],
  ctx: SkillContext,
  topK: number = 5
): SkillCandidate[] {
  return metas
    .map((m) => scoreSkill(m, ctx))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
