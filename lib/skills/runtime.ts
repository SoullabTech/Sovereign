/**
 * MAIA Skills Runtime
 *
 * Single entry point that orchestrates:
 * 1. Load skill metas (if not cached)
 * 2. Shortlist candidates
 * 3. Try each candidate (load definition, hard gate, execute)
 * 4. Return first success (or null if all fail)
 *
 * This is what MainOracleAgent calls.
 */

import path from 'node:path';
import type { SkillContext, SkillResult } from './types';
import { loadSkillMetas, loadSkillDefinition, loadPromptFile } from './loader';
import { shortlistSkills } from './selector';
import { executeSkill } from './executor';

/**
 * Main skill runtime entry point
 */
export async function runSkillRuntime(args: {
  skillsRoot: string;
  ctx: SkillContext;

  // Dependencies (injected by caller)
  renderWithModel: (system: string, user: string) => Promise<string>;
  refusalMessage: (keyOrReason: string) => string;
}): Promise<SkillResult | null> {
  const loaded = await loadSkillMetas(args.skillsRoot);
  const metas = loaded.map((x) => x.meta);

  // Shortlist candidates
  const candidates = shortlistSkills(metas, args.ctx, 5);
  if (!candidates.length) return null;

  // Try each candidate in order of score
  for (const cand of candidates) {
    const skillDir = loaded.find((x) => x.meta.id === cand.meta.id)?.dir;
    if (!skillDir) continue;

    const skill = await loadSkillDefinition(skillDir);

    const res = await executeSkill(skill, args.ctx, {
      refusalMessage: args.refusalMessage,

      // Code execution not implemented yet (Phase 2)
      runCodeSkill: async (s, ctx) => ({
        skillId: s.meta.id,
        version: s.meta.version,
        outcome: 'soft_fail',
        summary: 'code_execution_not_implemented',
        responseText: 'Code-based skills not enabled yet.',
      }),

      // Prompt-based execution
      renderPromptSkill: async (s, ctx) => {
        const startTime = Date.now();

        // Load prompts
        const system = await loadPromptFile(skillDir, s.promptTemplates?.system);
        const userTemplate = await loadPromptFile(skillDir, s.promptTemplates?.user);

        // Fill template variables
        const user = userTemplate
          .replaceAll('{{QUERY}}', ctx.queryText)
          .replaceAll('{{ELEMENT}}', ctx.state.element ?? '')
          .replaceAll('{{REALM}}', ctx.state.realm ?? '')
          .replaceAll('{{TIER}}', ctx.state.tierAllowed)
          .replaceAll('{{COGNITIVE_LEVEL}}', String(ctx.state.cognitiveLevel ?? ''))
          .replaceAll('{{NERVOUS_SYSTEM_STATE}}', ctx.state.nervousSystemState ?? '');

        // Render with model
        const responseText = await args.renderWithModel(system, user);

        const latencyMs = Date.now() - startTime;

        return {
          skillId: s.meta.id,
          version: s.meta.version,
          outcome: 'success',
          summary: 'ok',
          responseText,
          suggestedNextSkills: s.nextSkillHints ?? [],
          telemetry: {
            latencyMs,
            tokenEstimate: Math.ceil((system.length + user.length + responseText.length) / 4),
          },
        };
      },
    });

    // If hard_refusal, stop immediately and return the refusal
    if (res.outcome === 'hard_refusal') {
      return res;
    }

    // If soft_fail, try next candidate
    if (res.outcome === 'soft_fail') {
      continue;
    }

    // Success - return result
    return res;
  }

  // All candidates failed
  return null;
}

// Re-export for convenience
export { loadSkillMetas, syncSkillsToRegistry } from './loader';
export { shortlistSkills } from './selector';
export { executeSkill, hardGate } from './executor';
export { logSkillUsage, isSkillUnlocked, upsertSkillsRegistry } from './db';
