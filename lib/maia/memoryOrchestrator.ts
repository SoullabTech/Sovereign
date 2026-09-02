/**
 * Memory Orchestrator — Coordination Logic
 *
 * The runtime decision layer for how memory participates in each response.
 *
 * Placed between route-level memory loading and final system prompt assembly.
 * The orchestrator does NOT own memory storage or retrieval — it coordinates
 * what the route has already loaded, decides what matters for this turn,
 * assigns roles and strength, detects contradiction / reinforcement, and
 * produces a compact prompt block.
 *
 * DESIGN:
 *   - Pure & synchronous: no DB reads, no async work
 *   - Stateless: each call evaluates the current turn only
 *   - Minimal surface: one input type, one output type
 *   - Graceful: missing inputs do not throw; plan degrades to no-memory
 *   - Non-invasive: prompt block is subtle, compact, and never exposes raw
 *     prior memory text
 *
 * NOT IN THIS FIRST VERSION:
 *   - Semantic retrieval (Phase 2)
 *   - Somatic memory (Phase 2)
 *   - Morphic pattern inference (Phase 2)
 *   - 7-stage evolution mapping (Phase 3)
 *   - Reinforcement writeback (Phase 3)
 *
 * Candidate flags (semantic/somatic/morphic) are EXPOSED as part of the plan
 * so later layers can plug in without re-inspecting the message.
 */

import type {
  MemoryOrchestratorInput,
  MemoryInfluencePlan,
  MemorySource,
  MemorySourceRole,
  MemoryInfluenceStrength,
} from './types/memoryOrchestrator';

// ═══════════════════════════════════════════════════════════════════════════
// Detection helpers (regex-based, conservative)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect active contradiction / reversal signals in the current message.
 * When true, the orchestrator should LOWER the weight of prior stabilized
 * memory rather than remove it entirely.
 */
function detectContradiction(message: string): boolean {
  const m = message.toLowerCase();
  return /\b(second-?guess(?:ing)?|reconsider(?:ing)?|not sure anymore|maybe i was wrong|i thought i was clear but now|i'?m no longer sure|changed my mind|going back and forth|this has changed)\b/.test(m);
}

/**
 * Detect reinforcement / consolidation signals — a deepening of an existing
 * pattern rather than a brand-new breakthrough.
 */
function detectReinforcement(message: string): boolean {
  const m = message.toLowerCase();
  // Clearer articulation of a decision that had been deliberated
  const clearerArticulation = /\b(i'?m clearer now|i know this is right|even though (i )?feel|i don'?t need help deciding|i just need (help|the words)|help me (say|communicate|frame|articulate))\b/.test(m);
  // Emotional differentiation from decision
  const emotionalDifferentiation = /\b(i know the decision is right,? but (i )?(still )?(feel|have))\b/.test(m);
  // Holding contradiction without collapse
  const heldComplexity = /\b(both (parts|things) are real|hold(ing)? both|without needing to resolve)\b/.test(m);
  return clearerArticulation || emotionalDifferentiation || heldComplexity;
}

/**
 * Phase 2 readiness flag — current message looks like it could benefit from
 * semantic retrieval. Flag only; no retrieval performed.
 */
function detectSemanticCandidate(message: string): boolean {
  const m = message.toLowerCase();
  return /\b(last time|the other (time|day)|like (before|last)|similar to|recurring|recurrent|repeated|i keep|same (kind|thing|pattern)|this reminds me|pattern (in|across))\b/.test(m);
}

/**
 * Phase 2 readiness flag — current message contains user-reported body-state
 * language. Flag only; no somatic retrieval performed.
 */
function detectSomaticCandidate(message: string): boolean {
  const m = message.toLowerCase();
  const region = /\b(chest|throat|stomach|gut|belly|jaw|shoulders?|back|heart area|hands?|arms?|legs?|head)\b/.test(m);
  const sensation = /\b(tight|heavy|constricted|buzzing|numb|frozen|shaky|tender|open|relaxed|shallow breath|can'?t breathe|pressure|knot|ache|collapsed|activated|restless|grounded|settled|body says)\b/.test(m);
  return region && sensation;
}

/**
 * Phase 2 readiness flag — current message references recurrence, cycle,
 * archetype, or repeated life structure. Flag only; no morphic retrieval
 * performed.
 */
function detectMorphicCandidate(message: string): boolean {
  const m = message.toLowerCase();
  const recurrence = /\b(this keeps happening|same pattern|i end up here|same lesson|cycle|loop|recurring|return|old story|old wound|why does this always|same (kind of )?(relationship|person|conflict|dynamic))\b/.test(m);
  const archetypal = /\b(threshold|initiation|descent|rebirth|archetype|shadow|trickster|orphan|sovereign|seeker|hero's? journey)\b/.test(m);
  return recurrence || archetypal;
}

// ═══════════════════════════════════════════════════════════════════════════
// Prompt block construction
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build the compact prompt block for the selected plan.
 *
 * Rules:
 *   - Never surface raw prior user text or quote past conversations
 *   - Never include identifying detail or content from developmental memory
 *   - Keep to directional/role language, not retrieval language
 *   - Respect contradiction: when contradictionDetected is true, explicitly
 *     instruct the model to hold prior direction loosely
 *   - Degrade to empty string when shouldUseMemory is false
 */
function buildMemoryPromptBlock(
  plan: Omit<MemoryInfluencePlan, 'promptBlock'>,
  input: MemoryOrchestratorInput,
): string {
  if (!plan.shouldUseMemory || plan.selectedSources.length === 0) {
    return '';
  }

  const lines: string[] = ['', '## MEMORY INFLUENCE (runtime plan)'];

  // Opening framing tied to overall strength
  if (plan.influenceStrength === 'high') {
    lines.push('Let remembered direction meaningfully shape tone and pacing, without surfacing prior content explicitly.');
  } else if (plan.influenceStrength === 'medium') {
    lines.push('Let remembered direction subtly shape tone and pacing. Do not surface prior content explicitly.');
  } else if (plan.influenceStrength === 'low') {
    lines.push('Use remembered direction very lightly as a background prime. Stay led by the current turn.');
  }

  // Per-source lines — each is generic directional guidance, never raw content
  const roleLines: string[] = [];

  if (plan.selectedSources.includes('conversation_history')) {
    roleLines.push('- In-session continuity is the primary carrier of the arc; honor what has already been said this session without recapping.');
  }

  if (plan.selectedSources.includes('developmental_memory')) {
    // P3 — the narrowing below is not defensive style; it is the only way to
    // reach `directional_cue` at all. The excluded arm of the union has no such
    // property, so removing this guard does not "let more through" — it stops
    // the file compiling.
    const dm = (input.recentDevelopmentalMemories ?? []).find(
      (d) => d.participation === 'admitted',
    );
    if (dm && dm.participation === 'admitted' && dm.directional_cue) {
      // Only pass a pre-distilled directional cue if the caller provided one
      roleLines.push(`- Prior developmental direction: ${dm.directional_cue}. Use as a background prime only, not as content to reference.`);
    } else {
      roleLines.push('- A prior developmental memory is present; let it bias direction subtly, do not cite it.');
    }
  }

  if (plan.selectedSources.includes('spiral_state')) {
    const sp = input.spiralState;
    const el = sp?.dominant_element;
    const ph = sp?.phase;
    if (el && ph) {
      roleLines.push(`- Current state context: ${el}/${ph}. Let this inform elemental tone lightly; do not over-attach.`);
    } else {
      roleLines.push('- Spiral state is available; let it inform elemental tone lightly.');
    }
  }

  if (plan.selectedSources.includes('relationship_anamnesis')) {
    roleLines.push('- Relational field context is present; carry it as atmosphere, not as content.');
  }

  if (plan.selectedSources.includes('theme_signals')) {
    roleLines.push('- Thematic pattern signals are present; hold them as soft cues only, do not name themes explicitly.');
  }

  if (plan.selectedSources.includes('member_live_context')) {
    roleLines.push('- Live member context is available; honor what is already known without re-asking basic questions.');
  }

  if (roleLines.length > 0) {
    lines.push('');
    lines.push(...roleLines);
  }

  // Contradiction handling — explicit guidance to loosen prior direction
  if (plan.contradictionDetected) {
    lines.push('');
    lines.push('- CONTRADICTION DETECTED in current turn. Loosen the weight of any prior stabilized direction; meet the current state as primary. Do not force the old frame onto new input.');
  }

  // Reinforcement handling — subtle, non-gamified
  if (plan.reinforcementCandidate) {
    lines.push('');
    lines.push('- Current turn looks like consolidation or deepening of an existing direction, not a new breakthrough. Support embodiment and authorship; do not celebrate or over-frame.');
  }

  lines.push('');
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Main entry point
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a MemoryInfluencePlan from available runtime inputs.
 *
 * Decision rules (first version):
 *
 *   1. Conversation history → continuity (usually strongest in-session)
 *   2. Developmental memory → directional_prime (if present, compressed)
 *   3. Spiral state → state_context (light)
 *   4. Relationship anamnesis → relational_field (when present)
 *   5. Theme signals → pattern_cue (low weight by default)
 *   6. Member live context → continuity-adjacent (avoid re-asking known info)
 *
 * Strength starts from number of active sources and is dampened by
 * contradiction.
 */
export function buildMemoryInfluencePlan(
  input: MemoryOrchestratorInput,
): MemoryInfluencePlan {
  const message = input.message ?? '';
  const reasoning: string[] = [];

  const selectedSources: MemorySource[] = [];
  const sourceRoles: Partial<Record<MemorySource, MemorySourceRole>> = {};

  // 1. Conversation history
  const historyLen = Array.isArray(input.conversationHistory)
    ? input.conversationHistory.length
    : 0;
  if (historyLen > 0) {
    selectedSources.push('conversation_history');
    sourceRoles.conversation_history = 'continuity';
    reasoning.push(`conversation_history: ${historyLen} prior turns present → continuity`);
  }

  // 2. Developmental memory — ADMITTED snapshots only.
  //
  // P3: an excluded snapshot does not become a source, does not take a role,
  // and does not count toward influence strength. Exclusion means it does not
  // participate — not that it participates more quietly.
  const allDms = input.recentDevelopmentalMemories ?? [];
  const dms = allDms.filter(
    (d): d is Extract<typeof d, { participation: 'admitted' }> =>
      d.participation === 'admitted',
  );
  const excludedDmCount = allDms.length - dms.length;
  if (excludedDmCount > 0) {
    reasoning.push(
      `developmental_memory: ${excludedDmCount} snapshot(s) excluded by participation gate → not composed`,
    );
  }
  if (dms.length > 0) {
    selectedSources.push('developmental_memory');
    sourceRoles.developmental_memory = 'directional_prime';
    const top = dms[0];
    reasoning.push(
      `developmental_memory: ${dms.length} snapshot(s), top significance=${top.significance?.toFixed?.(2) ?? top.significance} → directional_prime`,
    );
  }

  // 3. Spiral state
  if (input.spiralState && (input.spiralState.dominant_element || input.spiralState.phase)) {
    selectedSources.push('spiral_state');
    sourceRoles.spiral_state = 'state_context';
    reasoning.push(
      `spiral_state: ${input.spiralState.dominant_element ?? '?'}/${input.spiralState.phase ?? '?'} → state_context`,
    );
  }

  // 4. Relationship anamnesis
  if (input.hasRelationshipAnamnesis) {
    selectedSources.push('relationship_anamnesis');
    sourceRoles.relationship_anamnesis = 'relational_field';
    reasoning.push('relationship_anamnesis: present → relational_field');
  }

  // 5. Theme signals — ADMITTED only (P3, same rule as developmental memory).
  const allThemes = input.recentThemeSignals ?? [];
  const themes = allThemes.filter((t) => t.participation === 'admitted');
  const excludedThemeCount = allThemes.length - themes.length;
  if (excludedThemeCount > 0) {
    reasoning.push(
      `theme_signals: ${excludedThemeCount} signal(s) excluded by participation gate → not composed`,
    );
  }
  if (themes.length > 0) {
    selectedSources.push('theme_signals');
    sourceRoles.theme_signals = 'pattern_cue';
    reasoning.push(`theme_signals: ${themes.length} recent signal(s) → pattern_cue (low weight)`);
  }

  // 6. Member live context
  if (input.hasMemberLiveContext) {
    selectedSources.push('member_live_context');
    sourceRoles.member_live_context = 'continuity';
    reasoning.push('member_live_context: present → continuity-adjacent');
  }

  // Contradiction + reinforcement detection
  const contradictionDetected = detectContradiction(message);
  const reinforcementCandidate = detectReinforcement(message);
  if (contradictionDetected) reasoning.push('contradiction: detected → lowering prior-memory dominance');
  if (reinforcementCandidate) reasoning.push('reinforcement: candidate detected (consolidation, not novelty)');

  // Phase 2 readiness flags
  const semanticCandidate = detectSemanticCandidate(message);
  const somaticCandidate = detectSomaticCandidate(message);
  const morphicCandidate = detectMorphicCandidate(message);
  if (semanticCandidate) reasoning.push('semantic candidate: current turn resembles a recurrence/similarity query (flag only)');
  if (somaticCandidate) reasoning.push('somatic candidate: current turn contains body-state language (flag only)');
  if (morphicCandidate) reasoning.push('morphic candidate: current turn references recurrence/archetypal motif (flag only)');

  // Strength calculation:
  //   - Base: number of active sources
  //   - Contradiction caps at low (don't let prior memory dominate new state)
  //   - No sources → none
  let strength: MemoryInfluenceStrength;
  if (selectedSources.length === 0) {
    strength = 'none';
  } else if (contradictionDetected) {
    strength = 'low';
  } else if (selectedSources.length >= 4) {
    strength = 'high';
  } else if (selectedSources.length >= 2) {
    strength = 'medium';
  } else {
    strength = 'low';
  }
  reasoning.push(`strength: ${strength} (sources=${selectedSources.length})`);

  const shouldUseMemory = selectedSources.length > 0;

  const planMinusBlock: Omit<MemoryInfluencePlan, 'promptBlock'> = {
    shouldUseMemory,
    selectedSources,
    sourceRoles,
    influenceStrength: strength,
    contradictionDetected,
    reinforcementCandidate,
    semanticCandidate,
    somaticCandidate,
    morphicCandidate,
    reasoning,
  };

  const promptBlock = buildMemoryPromptBlock(planMinusBlock, input);

  return { ...planMinusBlock, promptBlock };
}

/**
 * Compact log payload for telemetry / debug output.
 * Does not include reasoning (too verbose) or promptBlock (too big).
 */
export function summarizePlanForLog(plan: MemoryInfluencePlan): Record<string, unknown> {
  return {
    sources: plan.selectedSources,
    strength: plan.influenceStrength,
    contradiction: plan.contradictionDetected,
    reinforcement: plan.reinforcementCandidate,
    semantic: plan.semanticCandidate,
    somatic: plan.somaticCandidate,
    morphic: plan.morphicCandidate,
  };
}
