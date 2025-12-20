/**
 * MAIA Skills Database Glue
 *
 * Connects skill runtime to Postgres:
 * - Registry sync (filesystem → DB)
 * - Unlock checks
 * - Usage logging
 *
 * Uses direct Postgres pool (lib/db.ts)
 */

import type { SkillMetadata, SkillContext, SkillResult } from './types';
import { query } from '@/lib/db';
import crypto from 'node:crypto';

/**
 * Sync skill metadata from filesystem to skills_registry table
 * (Called at boot or after skill file changes)
 */
export async function upsertSkillsRegistry(
  metas: Array<{ meta: SkillMetadata; sha256: string }>
): Promise<void> {
  const rows = metas.map((m) => ({
    skill_id: m.meta.id,
    version: m.meta.version,
    sha256: m.sha256,
    enabled: m.meta.enabled ?? true,
    trust_level: m.meta.trustLevel ?? 1,
    meta: {
      category: m.meta.category,
      tier: m.meta.tier,
      kind: m.meta.kind,
      title: m.meta.title,
      description: m.meta.description,
      triggers: m.meta.triggers,
      elements: m.meta.elements,
      realms: m.meta.realms,
    },
  }));

  try {
    for (const row of rows) {
      await query(
        `
        INSERT INTO skills_registry (skill_id, version, sha256, enabled, trust_level, meta, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (skill_id) DO UPDATE
        SET version = EXCLUDED.version,
            sha256 = EXCLUDED.sha256,
            enabled = EXCLUDED.enabled,
            trust_level = EXCLUDED.trust_level,
            meta = EXCLUDED.meta,
            updated_at = NOW()
        `,
        [
          row.skill_id,
          row.version,
          row.sha256,
          row.enabled,
          row.trust_level,
          JSON.stringify(row.meta),
        ]
      );
    }
    console.log(`✅ Synced ${rows.length} skills to registry`);
  } catch (error) {
    console.error('❌ Failed to sync skills_registry:', error);
    throw error;
  }
}

/**
 * Get list of enabled skill IDs from registry
 * (For filtering available skills at runtime)
 */
export async function getEnabledSkillIds(): Promise<string[]> {
  try {
    const result = await query<{ skill_id: string }>(
      `SELECT skill_id FROM skills_registry WHERE enabled = true`
    );
    return result.rows.map((row) => row.skill_id);
  } catch (error) {
    console.error('❌ Failed to fetch enabled skills:', error);
    return [];
  }
}

/**
 * Check if user has unlocked a specific skill
 * (Foundational skills always unlocked, emergent require unlock)
 */
export async function isSkillUnlocked(
  userId: string,
  skillId: string
): Promise<boolean> {
  try {
    const result = await query<{ unlocked: boolean }>(
      `SELECT is_skill_unlocked($1, $2) as unlocked`,
      [userId, skillId]
    );
    return result.rows[0]?.unlocked ?? false;
  } catch (error) {
    console.error('❌ Failed to check skill unlock:', error);
    return false;
  }
}

/**
 * Log skill usage to skill_usage_events table
 * (Called after every skill execution)
 */
export async function logSkillUsage(
  result: SkillResult,
  ctx: SkillContext
): Promise<void> {
  const inputHash = crypto
    .createHash('sha256')
    .update(ctx.queryText)
    .digest('hex')
    .slice(0, 16);

  try {
    await query(
      `SELECT log_skill_usage($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        ctx.userId,
        ctx.sessionId,
        result.skillId,
        result.version,
        ctx.state.tierAllowed,
        result.outcome,
        result.telemetry?.latencyMs ?? null,
        inputHash,
        JSON.stringify(ctx.state),
        JSON.stringify(result.artifacts ?? {}),
      ]
    );
    console.log(`📊 Logged skill usage: ${result.skillId} (${result.outcome})`);
  } catch (error) {
    console.error('❌ Failed to log skill usage:', error);
    // Don't throw - logging failure shouldn't break user flow
  }
}

/**
 * Unlock a skill for a user
 * (Called when developmental gate is passed)
 */
export async function unlockSkill(
  userId: string,
  skillId: string,
  reason: string = 'manual'
): Promise<boolean> {
  try {
    await query(
      `SELECT unlock_skill($1, $2, $3)`,
      [userId, skillId, reason]
    );
    console.log(`🔓 Unlocked skill ${skillId} for user ${userId} (${reason})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to unlock skill:', error);
    return false;
  }
}
