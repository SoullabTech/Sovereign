/**
 * MAIA SKILLS SYSTEM
 *
 * Skills are organized collections of procedural expertise that:
 * - Can be invoked by any agent (innerGuide, bard, ganesha, etc.)
 * - Are state-gated (cognitive level, element, bypassing, nervous system)
 * - Evolve through use and feedback
 * - Can be shared across the AIN network
 *
 * Unlike traditional tools, skills:
 * - Know when NOT to run (contraindications)
 * - Can be "earned" through developmental progression
 * - Are packaged as versioned folders (git-friendly)
 * - Support prompt-based, code-based, or hybrid execution
 */

import type { SpiralogicElement } from '../consciousness/spiralogic-12-phases';
import type { AgentArchetype } from '../consciousness/maia-path-revelation';

// ═══════════════════════════════════════════════════════════════════════════════
// CORE SKILL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SkillTier = 'FAST' | 'CORE' | 'DEEP';
export type SkillCategory = 'foundational' | 'lineage' | 'emergent';
export type SkillKind = 'prompt' | 'code' | 'hybrid';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type Realm = 'UNDERWORLD' | 'MIDDLEWORLD' | 'UPPERWORLD_SYMBOLIC';

export type NervousSystemState = 'dorsal' | 'sympathetic' | 'window';
export type Stability = 'unstable' | 'developing' | 'stable';

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL METADATA (loaded at boot)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillMetadata {
  id: string;
  name: string;
  version: string;
  description: string;

  // Processing tier (FAST/CORE/DEEP)
  tier: SkillTier;

  // Category (foundational/lineage/emergent)
  category: SkillCategory;

  // Execution type
  kind: SkillKind;

  // Discovery
  tags?: string[];
  triggers?: string[]; // Keywords that suggest this skill

  // Elemental/realm affinity
  elements?: Element[];
  realms?: Realm[];

  // Which agents can invoke this skill
  invokableBy?: AgentArchetype[];

  // Threefold mission alignment
  mission?: ('tuneIn' | 'organize' | 'actualize')[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL ELIGIBILITY (state-gated access)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillEligibility {
  // Cognitive development gates
  minCognitiveLevel?: number; // Bloom's levels 1-6
  maxBypassingScore?: number; // 0-1, max spiritual/intellectual bypassing allowed
  requiredStability?: Stability;

  // Nervous system safety gates
  allowedNervousSystemStates?: NervousSystemState[];

  // Spiralogic gates
  appropriateRealms?: Realm[];
  appropriateElements?: Element[];

  // Shadow integration gates
  shadowIntegrationRequired?: boolean;

  // Earned skills (emergent category)
  requiresUnlock?: boolean;
  minUnlockLevel?: number;

  // Agent-specific requirements
  requiresAgent?: AgentArchetype[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL CONTRAINDICATIONS (explicit refusal logic)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillContraindications {
  // Nervous system states where skill is unsafe
  nervousSystemStates?: NervousSystemState[];

  // Shadow risk flags that block execution
  shadowRiskFlags?: string[];

  // Explicit "do not use if..." statements
  whenNotToUse?: string[];

  // Message key for mythic boundary messaging
  hardRefusalMessageKey?: string; // maps to fieldSafetyCopy.ts
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL PROCEDURE (how to execute)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillToolRef {
  id: string; // e.g., "detect-risk", "summarize"
  entry: string; // file path inside skill folder
  timeoutMs?: number;
}

export interface SkillProcedureStep {
  id: string;
  title: string;
  instruction: string;
  usesTools?: string[]; // tool ids
  produces?: string[]; // keys written into working memory
}

export interface SkillPromptTemplates {
  system?: string; // path in skill folder
  user?: string; // path in skill folder
  rubric?: string; // path in skill folder
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL DEFINITION (full spec, loaded on-demand)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillDefinition {
  meta: SkillMetadata;
  eligibility: SkillEligibility;
  contraindications: SkillContraindications;

  procedure: SkillProcedureStep[];

  promptTemplates?: SkillPromptTemplates;
  tools?: SkillToolRef[];

  successCriteria?: string[];
  nextSkillHints?: string[]; // skill ids to suggest after completion

  // AIN integration: can this skill be shared across the network?
  ainShareable?: boolean;
  ainRequirements?: {
    minFieldCoherence?: number;
    elementalBalance?: Record<Element, number>;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL CONTEXT (runtime state when invoking a skill)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillContext {
  // User identity
  userId: string;
  sessionId: string;

  // Query
  queryText: string;

  // Agent invoking the skill
  invokingAgent?: AgentArchetype;

  // Current threefold mission phase
  mission?: 'tuneIn' | 'organize' | 'actualize';

  // User state (from cognitive profile + field router)
  state: {
    tierAllowed: SkillTier;
    cognitiveLevel?: number;
    bypassingScore?: number;
    stability?: Stability;
    nervousSystemState?: NervousSystemState;

    element?: Element;
    realm?: Realm;

    safetyFlags?: string[];
    shadowRiskFlags?: string[];
  };

  // Working memory (skill can read/write)
  memory?: Record<string, unknown>;

  // AIN field state
  fieldState?: {
    coherence: number;
    evolution: number;
    elementalBalance: Record<Element, number>;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL RESULT (what the skill produces)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillResult {
  skillId: string;
  version: string;

  outcome: 'success' | 'soft_fail' | 'hard_refusal';
  summary: string;

  // The actual response text (MAIA voices this)
  responseText: string;

  // Artifacts produced
  artifacts?: Record<string, unknown>;

  // Suggested next skills
  suggestedNextSkills?: string[];

  // Telemetry
  telemetry?: {
    latencyMs?: number;
    toolCalls?: number;
    tokenEstimate?: number;
  };

  // For feedback loop
  feedbackRequest?: {
    question: string;
    options: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL EVOLUTION (how skills improve over time)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillUsageEvent {
  id: string;
  userId: string;
  sessionId: string;
  skillId: string;
  version: string;
  tier: SkillTier;
  outcome: 'success' | 'soft_fail' | 'hard_refusal';
  latencyMs?: number;
  inputHash: string;
  stateSnapshot: Partial<SkillContext['state']>;
  artifacts: Record<string, unknown>;
  createdAt: Date;
}

export interface SkillFeedback {
  id: string;
  userId: string;
  skillId: string;
  version: string;
  rating?: number; // -1, 0, +1 or 1-5
  tags?: string[];
  notes?: string;
  createdAt: Date;
}

export interface SkillUnlock {
  userId: string;
  skillId: string;
  unlocked: boolean;
  unlockedAt?: Date;
  unlockReason?: string; // "stable_level_4", "shadow_integration", etc.
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL REGISTRY (Postgres + filesystem)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillRegistryEntry {
  skillId: string;
  version: string;
  sha256?: string; // hash of skill.json for integrity
  enabled: boolean;
  trustLevel: number; // 1-5, for rollout control
  meta: SkillMetadata; // denormalized for fast queries
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AIN SKILL SHARING (network-level coordination)
// ═══════════════════════════════════════════════════════════════════════════════

export interface AINSkillShare {
  skillId: string;
  version: string;
  sharedBy: string; // userId or 'system'
  fieldCoherenceAtShare: number;
  elementalSignature: Record<Element, number>;
  usageCount: number;
  successRate: number;
  sharedAt: Date;
}

export interface AINSkillRequest {
  requestedBy: string; // elemental service (fire, water, earth, air, aether)
  skillId?: string; // specific skill, or...
  capability: string; // ...request by capability description
  context: Partial<SkillContext>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export const SKILL_TIERS: Record<SkillTier, number> = {
  FAST: 1,
  CORE: 2,
  DEEP: 3,
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  'foundational',
  'lineage',
  'emergent',
];

export const SKILL_KINDS: SkillKind[] = ['prompt', 'code', 'hybrid'];

export const NERVOUS_SYSTEM_STATES: NervousSystemState[] = [
  'dorsal',
  'sympathetic',
  'window',
];

export const STABILITY_LEVELS: Stability[] = ['unstable', 'developing', 'stable'];

export const REALMS: Realm[] = [
  'UNDERWORLD',
  'MIDDLEWORLD',
  'UPPERWORLD_SYMBOLIC',
];

export const ELEMENTS: Element[] = ['fire', 'water', 'earth', 'air', 'aether'];
