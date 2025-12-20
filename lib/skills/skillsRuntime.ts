/**
 * Skills Runtime System
 *
 * MVP spine: load → select → gate → execute → log
 * No handwaving. Discrete, gated, logged, versioned.
 *
 * Created: 2025-12-20
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Pool } from 'pg';

// ==============================================================================
// TYPES
// ==============================================================================

export type SkillTier = 'FAST' | 'CORE' | 'DEEP';
export type SkillCategory = 'foundational' | 'lineage' | 'emergent';
export type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether';
export type Realm = 'UNDERWORLD' | 'MIDDLEWORLD' | 'UPPERWORLD_SYMBOLIC';
export type NervousSystemState = 'dorsal' | 'sympathetic' | 'window';
export type Stability = 'unstable' | 'developing' | 'stable';
export type SkillKind = 'prompt' | 'agent' | 'tool';

export interface SkillMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  tier: SkillTier;
  category: SkillCategory;
  kind: SkillKind;
  tags: string[];
  triggers?: string[];
  elements?: Element[];
  realms?: Realm[];
}

export interface SkillEligibility {
  minCognitiveLevel?: number;
  maxCognitiveLevel?: number;
  minStability?: number;
  maxSpiritualBypassing?: number;
  maxIntellectualBypassing?: number;
  minFieldCoherence?: number;
  allowedNervousSystemStates?: NervousSystemState[];
  allowedElements?: Element[];
  allowedRealms?: Realm[];
}

export interface SkillContraindications {
  nervousSystemStates?: NervousSystemState[];
  whenNotToUse?: string[];
  hardRefusalMessageKey?: string;
}

export interface SkillDefinition {
  meta: SkillMetadata;
  eligibility?: SkillEligibility;
  contraindications?: SkillContraindications;
  procedure?: Array<{ id: string; title: string; instruction: string }>;
  promptTemplates?: {
    system?: string;
    user?: string;
  };
  successCriteria?: string[];
  nextSkillHints?: string[];
}

export interface SkillContext {
  userId: string;
  sessionId: string;
  userInput: string;
  element?: Element;
  realm?: Realm;
  nervousSystemState?: NervousSystemState;
  cognitiveLevel?: number;
  spiritualBypassing?: number;
  intellectualBypassing?: number;
  fieldCoherence?: number;
  stability?: Stability;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface SkillResult {
  skillId: string;
  outcome: 'success' | 'soft_fail' | 'hard_refusal';
  response?: string;
  reasoning?: string;
  nextSkillHints?: string[];
  artifacts?: Record<string, any>;
  latencyMs: number;
}

// ==============================================================================
// CONFIGURATION
// ==============================================================================

const SKILLS_ROOT = path.join(process.cwd(), 'skills');
const DATABASE_URL = process.env.DATABASE_URL || '';

// Database connection pool
let dbPool: Pool | null = null;

function getDbPool(): Pool {
  if (!dbPool) {
    dbPool = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
    });
  }
  return dbPool;
}

// ==============================================================================
// LOADER
// ==============================================================================

/**
 * Load all skill metadata from filesystem
 * Returns array of {skillId, version, sha256, meta}
 */
export async function loadSkillMetas(): Promise<Array<{
  skillId: string;
  version: string;
  sha256: string;
  meta: SkillMetadata;
}>> {
  const skillDirs = await fs.readdir(SKILLS_ROOT);
  const metas: Array<{
    skillId: string;
    version: string;
    sha256: string;
    meta: SkillMetadata;
  }> = [];

  for (const dir of skillDirs) {
    const skillPath = path.join(SKILLS_ROOT, dir);
    const metaPath = path.join(skillPath, 'meta.json');

    try {
      const stat = await fs.stat(skillPath);
      if (!stat.isDirectory()) continue;

      // Read meta.json
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta: SkillMetadata = JSON.parse(metaContent);

      // Calculate SHA256 of skill.json for versioning
      const skillDefPath = path.join(skillPath, 'skill.json');
      const skillDefContent = await fs.readFile(skillDefPath, 'utf-8');
      const sha256 = crypto
        .createHash('sha256')
        .update(skillDefContent)
        .digest('hex');

      metas.push({
        skillId: meta.id,
        version: meta.version,
        sha256,
        meta,
      });
    } catch (err) {
      console.error(`Failed to load skill meta for ${dir}:`, err);
    }
  }

  return metas;
}

/**
 * Load full skill definition from filesystem
 */
export async function loadSkillDefinition(skillId: string): Promise<SkillDefinition | null> {
  const skillPath = path.join(SKILLS_ROOT, skillId);
  const skillDefPath = path.join(skillPath, 'skill.json');

  try {
    const content = await fs.readFile(skillDefPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to load skill definition for ${skillId}:`, err);
    return null;
  }
}

/**
 * Load prompt template file
 */
export async function loadPromptFile(skillId: string, templatePath: string): Promise<string> {
  const fullPath = path.join(SKILLS_ROOT, skillId, templatePath);
  return await fs.readFile(fullPath, 'utf-8');
}

// ==============================================================================
// SELECTOR
// ==============================================================================

/**
 * Score a skill's relevance to current context (0-1)
 */
export function scoreSkill(
  skill: SkillDefinition,
  context: SkillContext
): number {
  let score = 0;

  // Tier alignment (FAST for low cognitive load, DEEP for high)
  if (context.cognitiveLevel !== undefined) {
    if (skill.meta.tier === 'FAST' && context.cognitiveLevel <= 3) score += 0.3;
    if (skill.meta.tier === 'CORE' && context.cognitiveLevel >= 3 && context.cognitiveLevel <= 5) score += 0.3;
    if (skill.meta.tier === 'DEEP' && context.cognitiveLevel >= 5) score += 0.3;
  }

  // Element alignment
  if (context.element && skill.meta.elements?.includes(context.element)) {
    score += 0.2;
  }

  // Realm alignment
  if (context.realm && skill.meta.realms?.includes(context.realm)) {
    score += 0.2;
  }

  // Trigger word matching
  if (skill.meta.triggers) {
    const inputLower = context.userInput.toLowerCase();
    const matchedTriggers = skill.meta.triggers.filter(t =>
      inputLower.includes(t.toLowerCase())
    );
    if (matchedTriggers.length > 0) {
      score += 0.3;
    }
  }

  return Math.min(score, 1.0);
}

/**
 * Shortlist top N skills for current context
 */
export async function shortlistSkills(
  context: SkillContext,
  maxSkills: number = 3
): Promise<Array<{ skill: SkillDefinition; score: number }>> {
  const metas = await loadSkillMetas();
  const scored: Array<{ skill: SkillDefinition; score: number }> = [];

  for (const meta of metas) {
    const skillDef = await loadSkillDefinition(meta.skillId);
    if (!skillDef) continue;

    const score = scoreSkill(skillDef, context);
    if (score > 0) {
      scored.push({ skill: skillDef, score });
    }
  }

  // Sort by score descending, take top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSkills);
}

// ==============================================================================
// GATING
// ==============================================================================

/**
 * Hard gate: check contraindications
 * Returns null if safe to proceed, or refusal message if not
 */
export function hardGate(
  skill: SkillDefinition,
  context: SkillContext
): string | null {
  const { contraindications } = skill;
  if (!contraindications) return null;

  // Nervous system state contraindications
  if (
    contraindications.nervousSystemStates &&
    context.nervousSystemState &&
    contraindications.nervousSystemStates.includes(context.nervousSystemState)
  ) {
    return `This skill (${skill.meta.name}) is contraindicated for your current nervous system state (${context.nervousSystemState}). Let's try a different approach.`;
  }

  // Field coherence minimum
  if (skill.eligibility?.minFieldCoherence && context.fieldCoherence !== undefined) {
    if (context.fieldCoherence < skill.eligibility.minFieldCoherence) {
      return `Your field coherence is currently too low for this skill. Let's focus on grounding first.`;
    }
  }

  // Cognitive level gates
  if (skill.eligibility?.minCognitiveLevel && context.cognitiveLevel !== undefined) {
    if (context.cognitiveLevel < skill.eligibility.minCognitiveLevel) {
      return `This skill requires a higher cognitive level. Let's build foundations first.`;
    }
  }

  // Bypassing gates
  if (skill.eligibility?.maxSpiritualBypassing && context.spiritualBypassing !== undefined) {
    if (context.spiritualBypassing > skill.eligibility.maxSpiritualBypassing) {
      return `High spiritual bypassing detected. Let's work on integration first.`;
    }
  }

  return null; // No contraindications, safe to proceed
}

/**
 * Check if skill is unlocked for user
 */
export async function isSkillUnlocked(userId: string, skillId: string): Promise<boolean> {
  const db = getDbPool();
  const result = await db.query(
    'SELECT is_skill_unlocked($1, $2) as unlocked',
    [userId, skillId]
  );
  return result.rows[0]?.unlocked ?? false;
}

// ==============================================================================
// EXECUTION
// ==============================================================================

/**
 * Execute skill (for prompt-based skills, returns formatted prompt)
 */
export async function executeSkill(
  skill: SkillDefinition,
  context: SkillContext
): Promise<SkillResult> {
  const startTime = Date.now();

  try {
    // Hard gate check
    const refusal = hardGate(skill, context);
    if (refusal) {
      const latencyMs = Date.now() - startTime;
      return {
        skillId: skill.meta.id,
        outcome: 'hard_refusal',
        response: refusal,
        latencyMs,
      };
    }

    // Check if unlocked
    const unlocked = await isSkillUnlocked(context.userId, skill.meta.id);
    if (!unlocked) {
      const latencyMs = Date.now() - startTime;
      return {
        skillId: skill.meta.id,
        outcome: 'hard_refusal',
        response: `This skill (${skill.meta.name}) is not yet unlocked for you.`,
        latencyMs,
      };
    }

    // Execute based on skill kind
    if (skill.meta.kind === 'prompt') {
      // Load prompt templates
      let systemPrompt = '';
      let userPrompt = '';

      if (skill.promptTemplates?.system) {
        systemPrompt = await loadPromptFile(skill.meta.id, skill.promptTemplates.system);
      }

      if (skill.promptTemplates?.user) {
        userPrompt = await loadPromptFile(skill.meta.id, skill.promptTemplates.user);
      }

      // Simple variable substitution
      const vars: Record<string, string> = {
        userInput: context.userInput,
        element: context.element || 'unknown',
        realm: context.realm || 'MIDDLEWORLD',
        nervousSystemState: context.nervousSystemState || 'unknown',
      };

      Object.keys(vars).forEach(key => {
        systemPrompt = systemPrompt.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]);
        userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]);
      });

      const latencyMs = Date.now() - startTime;

      return {
        skillId: skill.meta.id,
        outcome: 'success',
        response: systemPrompt, // Return system prompt for now
        artifacts: {
          systemPrompt,
          userPrompt,
          procedure: skill.procedure,
        },
        nextSkillHints: skill.nextSkillHints,
        latencyMs,
      };
    }

    // Unsupported skill kind
    const latencyMs = Date.now() - startTime;
    return {
      skillId: skill.meta.id,
      outcome: 'soft_fail',
      response: `Skill kind "${skill.meta.kind}" not yet implemented.`,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    console.error(`Skill execution error for ${skill.meta.id}:`, err);
    return {
      skillId: skill.meta.id,
      outcome: 'soft_fail',
      response: 'Skill execution failed unexpectedly.',
      latencyMs,
    };
  }
}

// ==============================================================================
// LOGGER
// ==============================================================================

/**
 * Log skill usage to database
 */
export async function logSkillUsage(
  context: SkillContext,
  result: SkillResult,
  skillVersion: string,
  skillTier: SkillTier
): Promise<void> {
  const db = getDbPool();

  const stateSnapshot = {
    element: context.element,
    realm: context.realm,
    nervousSystemState: context.nervousSystemState,
    cognitiveLevel: context.cognitiveLevel,
    spiritualBypassing: context.spiritualBypassing,
    intellectualBypassing: context.intellectualBypassing,
    fieldCoherence: context.fieldCoherence,
    stability: context.stability,
  };

  try {
    await db.query(
      `SELECT log_skill_usage($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        context.userId,
        context.sessionId,
        result.skillId,
        skillVersion,
        skillTier,
        result.outcome,
        result.latencyMs,
        null, // input_hash (could implement later)
        JSON.stringify(stateSnapshot),
        JSON.stringify(result.artifacts || {}),
      ]
    );
  } catch (err) {
    console.error('Failed to log skill usage:', err);
  }
}

// ==============================================================================
// RUNTIME
// ==============================================================================

/**
 * Main runtime: load → select → gate → execute → log
 */
export async function runSkillRuntime(
  context: SkillContext
): Promise<SkillResult | null> {
  try {
    // 1. Select: Get top-ranked skill
    const shortlist = await shortlistSkills(context, 1);
    if (shortlist.length === 0) {
      return null; // No relevant skills
    }

    const { skill } = shortlist[0];

    // 2. Execute (includes gating)
    const result = await executeSkill(skill, context);

    // 3. Log
    await logSkillUsage(context, result, skill.meta.version, skill.meta.tier);

    return result;
  } catch (err) {
    console.error('Skills runtime error:', err);
    return null;
  }
}

// ==============================================================================
// REGISTRY SYNC
// ==============================================================================

/**
 * Sync filesystem skills to database registry
 */
export async function syncSkillsRegistry(): Promise<void> {
  const db = getDbPool();
  const metas = await loadSkillMetas();

  for (const { skillId, version, sha256, meta } of metas) {
    try {
      await db.query(
        `INSERT INTO skills_registry (skill_id, version, sha256, meta, enabled, trust_level)
         VALUES ($1, $2, $3, $4, true, 1)
         ON CONFLICT (skill_id) DO UPDATE
         SET version = EXCLUDED.version,
             sha256 = EXCLUDED.sha256,
             meta = EXCLUDED.meta,
             updated_at = NOW()`,
        [skillId, version, sha256, JSON.stringify(meta)]
      );

      console.log(`Synced skill to registry: ${skillId} v${version}`);
    } catch (err) {
      console.error(`Failed to sync skill ${skillId}:`, err);
    }
  }
}
