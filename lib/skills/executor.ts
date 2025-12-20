/**
 * MAIA Skills Executor
 *
 * Hard gates + execution:
 * - Checks eligibility (cognitive level, bypassing, stability, nervous system)
 * - Checks contraindications (when NOT to run)
 * - Executes if gates pass (prompt/code/hybrid)
 * - Returns SkillResult with outcome
 */

import type { SkillContext, SkillDefinition, SkillResult } from './types';

/**
 * Hard gate check - returns { ok: true } if skill should execute,
 * { ok: false, reason: string } if it should be refused
 */
export function hardGate(
  skill: SkillDefinition,
  ctx: SkillContext
): { ok: boolean; reason?: string } {
  const e = skill.eligibility;
  const c = skill.contraindications;

  // Unlock requirement
  if (e.requiresUnlock) {
    // This should be checked before calling executeSkill
    // by querying skill_unlocks table
    return { ok: false, reason: 'requires_unlock' };
  }

  // Cognitive level requirement
  if (e.minCognitiveLevel != null && (ctx.state.cognitiveLevel ?? 0) < e.minCognitiveLevel) {
    return { ok: false, reason: 'below_min_cognitive' };
  }

  // Bypassing score requirement
  if (e.maxBypassingScore != null && (ctx.state.bypassingScore ?? 0) > e.maxBypassingScore) {
    return { ok: false, reason: 'bypassing_too_high' };
  }

  // Stability requirement
  if (e.requiredStability && (ctx.state.stability ?? 'unstable') !== e.requiredStability) {
    return { ok: false, reason: 'stability_requirement_not_met' };
  }

  // Nervous system state - allowed list
  if (e.allowedNervousSystemStates?.length && ctx.state.nervousSystemState) {
    if (!e.allowedNervousSystemStates.includes(ctx.state.nervousSystemState)) {
      return { ok: false, reason: 'nervous_system_state_not_allowed' };
    }
  }

  // CONTRAINDICATIONS

  // Nervous system state - blocked list
  if (c.nervousSystemStates?.length && ctx.state.nervousSystemState) {
    if (c.nervousSystemStates.includes(ctx.state.nervousSystemState)) {
      return { ok: false, reason: 'contra_nervous_system_state' };
    }
  }

  // Shadow risk flags
  if (c.shadowRiskFlags?.length && ctx.state.shadowRiskFlags?.length) {
    const hit = ctx.state.shadowRiskFlags.some((f) => c.shadowRiskFlags!.includes(f));
    if (hit) return { ok: false, reason: 'contra_shadow_risk' };
  }

  return { ok: true };
}

/**
 * Execute a skill (if gates pass)
 */
export async function executeSkill(
  skill: SkillDefinition,
  ctx: SkillContext,
  deps: {
    renderPromptSkill: (skill: SkillDefinition, ctx: SkillContext) => Promise<SkillResult>;
    runCodeSkill: (skill: SkillDefinition, ctx: SkillContext) => Promise<SkillResult>;
    refusalMessage: (keyOrReason: string) => string;
  }
): Promise<SkillResult> {
  const gate = hardGate(skill, ctx);

  if (!gate.ok) {
    const msgKey = skill.contraindications.hardRefusalMessageKey ?? (gate.reason ?? 'hard_refusal');
    return {
      skillId: skill.meta.id,
      version: skill.meta.version,
      outcome: 'hard_refusal',
      summary: gate.reason ?? 'hard_refusal',
      responseText: deps.refusalMessage(msgKey),
      suggestedNextSkills: skill.nextSkillHints ?? [],
    };
  }

  // Execute based on kind
  if (skill.meta.kind === 'code') return deps.runCodeSkill(skill, ctx);
  if (skill.meta.kind === 'prompt') return deps.renderPromptSkill(skill, ctx);

  // Hybrid defaults to prompt for now
  return deps.renderPromptSkill(skill, ctx);
}
