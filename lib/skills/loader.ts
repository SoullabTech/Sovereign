/**
 * MAIA Skills Loader
 *
 * Progressive disclosure:
 * - Boot: Load all meta.json files (fast, lightweight)
 * - Runtime: Load full skill.json on-demand
 * - Execution: Load prompts/tools as needed
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { SkillDefinition, SkillMetadata } from './types';

export interface LoadedSkillMeta {
  meta: SkillMetadata;
  dir: string;
  sha256: string;
}

/**
 * Calculate SHA-256 hash of a file for integrity checking
 */
async function sha256File(filePath: string): Promise<string> {
  const buf = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * Load all skill metadata files from the skills directory
 * This runs at boot - lightweight, fast, builds skill index
 */
export async function loadSkillMetas(skillsRoot: string): Promise<LoadedSkillMeta[]> {
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((d) => path.join(skillsRoot, d.name));

  const metas: LoadedSkillMeta[] = [];

  for (const dir of dirs) {
    const metaPath = path.join(dir, 'meta.json');
    try {
      const raw = await fs.readFile(metaPath, 'utf8');
      const meta = JSON.parse(raw) as SkillMetadata;
      const sha = await sha256File(metaPath);
      metas.push({ meta, dir, sha256: sha });
    } catch (error) {
      // Ignore folders without meta.json or malformed JSON
      console.warn(`Failed to load skill metadata from ${dir}:`, error);
    }
  }

  return metas;
}

/**
 * Load full skill definition from skill.json
 * This runs on-demand when a skill is selected for execution
 */
export async function loadSkillDefinition(skillDir: string): Promise<SkillDefinition> {
  const defPath = path.join(skillDir, 'skill.json');
  const raw = await fs.readFile(defPath, 'utf8');
  return JSON.parse(raw) as SkillDefinition;
}

/**
 * Load a prompt file from the skill directory
 * This runs during execution when prompts are needed
 */
export async function loadPromptFile(skillDir: string, relPath?: string): Promise<string> {
  if (!relPath) return '';
  const p = path.join(skillDir, relPath);
  return fs.readFile(p, 'utf8');
}

/**
 * Sync skill metadata to database registry
 * Call this at boot to ensure DB is in sync with filesystem
 */
export async function syncSkillsToRegistry(
  metas: LoadedSkillMeta[],
  db: {
    query: (sql: string, params: any[]) => Promise<any>;
  }
): Promise<void> {
  for (const { meta, sha256 } of metas) {
    await db.query(
      `
      INSERT INTO skills_registry (skill_id, version, sha256, enabled, trust_level, meta)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (skill_id)
      DO UPDATE SET
        version = EXCLUDED.version,
        sha256 = EXCLUDED.sha256,
        meta = EXCLUDED.meta,
        updated_at = NOW()
      `,
      [
        meta.id,
        meta.version,
        sha256,
        true, // enabled by default
        meta.category === 'foundational' ? 5 : 1, // foundational skills get high trust
        JSON.stringify(meta),
      ]
    );
  }
}
