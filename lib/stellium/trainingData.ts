/**
 * TRAINING DATA ACCESS LAYER
 *
 * CRUD for training source tables + build queries.
 * All queries use parameterized $1/$2 pattern via lib/db/postgres.ts.
 *
 * getActiveBuild() is the oracle hot path — single indexed row.
 */

import { query } from '@/lib/db/postgres';
import type {
  PersonaCorrection,
  PersonaExample,
  PersonaPreference,
  PersonaBuild,
  CreateCorrectionInput,
  CreateExampleInput,
  UpsertPreferenceInput,
  BuildDiff,
  TrainingLayer,
  PreferenceCategory,
} from './trainingTypes';

// ============================================
// CORRECTIONS
// ============================================

export async function listCorrections(
  personaId: string
): Promise<PersonaCorrection[]> {
  const result = await query(
    `SELECT * FROM persona_corrections
     WHERE persona_id = $1
     ORDER BY created_at DESC`,
    [personaId]
  );
  return result.rows as PersonaCorrection[];
}

export async function addCorrection(
  personaId: string,
  input: CreateCorrectionInput
): Promise<PersonaCorrection> {
  const result = await query(
    `INSERT INTO persona_corrections (persona_id, original_response, correction, context)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      personaId,
      input.original_response,
      input.correction,
      JSON.stringify(input.context ?? {}),
    ]
  );
  return result.rows[0] as PersonaCorrection;
}

export async function deleteCorrection(
  personaId: string,
  correctionId: string
): Promise<boolean> {
  const result = await query(
    `DELETE FROM persona_corrections
     WHERE id = $1 AND persona_id = $2`,
    [correctionId, personaId]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================
// EXAMPLES
// ============================================

export async function listExamples(
  personaId: string,
  layer?: TrainingLayer
): Promise<PersonaExample[]> {
  if (layer) {
    const result = await query(
      `SELECT * FROM persona_examples
       WHERE persona_id = $1 AND layer = $2
       ORDER BY created_at DESC`,
      [personaId, layer]
    );
    return result.rows as PersonaExample[];
  }

  const result = await query(
    `SELECT * FROM persona_examples
     WHERE persona_id = $1
     ORDER BY layer, created_at DESC`,
    [personaId]
  );
  return result.rows as PersonaExample[];
}

export async function addExample(
  personaId: string,
  input: CreateExampleInput
): Promise<PersonaExample> {
  const result = await query(
    `INSERT INTO persona_examples (persona_id, user_message, ideal_response, layer, tags)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      personaId,
      input.user_message,
      input.ideal_response,
      input.layer,
      input.tags ?? [],
    ]
  );
  return result.rows[0] as PersonaExample;
}

export async function deleteExample(
  personaId: string,
  exampleId: string
): Promise<boolean> {
  const result = await query(
    `DELETE FROM persona_examples
     WHERE id = $1 AND persona_id = $2`,
    [exampleId, personaId]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================
// PREFERENCES
// ============================================

export async function listPreferences(
  personaId: string,
  category?: PreferenceCategory
): Promise<PersonaPreference[]> {
  if (category) {
    const result = await query(
      `SELECT * FROM persona_preferences
       WHERE persona_id = $1 AND category = $2 AND active = TRUE
       ORDER BY category, key`,
      [personaId, category]
    );
    return result.rows as PersonaPreference[];
  }

  const result = await query(
    `SELECT * FROM persona_preferences
     WHERE persona_id = $1 AND active = TRUE
     ORDER BY category, key`,
    [personaId]
  );
  return result.rows as PersonaPreference[];
}

export async function upsertPreference(
  personaId: string,
  input: UpsertPreferenceInput
): Promise<PersonaPreference> {
  // Deactivate existing active preference with same key+category, then insert new.
  // Uses the unique partial index to prevent duplicates.
  await query(
    `UPDATE persona_preferences
     SET active = FALSE, updated_at = NOW()
     WHERE persona_id = $1 AND category = $2 AND key = $3 AND active = TRUE`,
    [personaId, input.category, input.key]
  );

  const result = await query(
    `INSERT INTO persona_preferences (persona_id, category, key, value)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [personaId, input.category, input.key, input.value]
  );
  return result.rows[0] as PersonaPreference;
}

export async function deactivatePreference(
  personaId: string,
  prefId: string
): Promise<boolean> {
  const result = await query(
    `UPDATE persona_preferences
     SET active = FALSE, updated_at = NOW()
     WHERE id = $1 AND persona_id = $2`,
    [prefId, personaId]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================
// BUILDS
// ============================================

/**
 * Oracle hot path — returns the single active build for a persona.
 * Indexed: idx_persona_builds_active (persona_id, is_active) WHERE is_active = TRUE
 */
export async function getActiveBuild(
  personaId: string
): Promise<PersonaBuild | null> {
  const result = await query(
    `SELECT * FROM persona_builds
     WHERE persona_id = $1 AND is_active = TRUE
     LIMIT 1`,
    [personaId]
  );
  return (result.rows[0] as PersonaBuild) ?? null;
}

export async function listBuilds(
  personaId: string
): Promise<PersonaBuild[]> {
  const result = await query(
    `SELECT * FROM persona_builds
     WHERE persona_id = $1
     ORDER BY version DESC`,
    [personaId]
  );
  return result.rows as PersonaBuild[];
}

export async function getLatestVersion(
  personaId: string
): Promise<number> {
  const result = await query(
    `SELECT COALESCE(MAX(version), 0) AS max_version
     FROM persona_builds
     WHERE persona_id = $1`,
    [personaId]
  );
  return parseInt(result.rows[0]?.max_version ?? '0', 10);
}

export async function insertBuild(
  personaId: string,
  build: {
    version: number;
    voice_block: string | null;
    stance_block: string | null;
    knowledge_block: string | null;
    system_prompt_block: string;
    base_system_block: string | null;
    build_input_summary: Record<string, unknown>;
    validation_status?: string;
  }
): Promise<PersonaBuild> {
  const result = await query(
    `INSERT INTO persona_builds (
      persona_id, version, voice_block, stance_block, knowledge_block,
      system_prompt_block, base_system_block, build_input_summary,
      is_active, validation_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, $9)
    RETURNING *`,
    [
      personaId,
      build.version,
      build.voice_block,
      build.stance_block,
      build.knowledge_block,
      build.system_prompt_block,
      build.base_system_block,
      JSON.stringify(build.build_input_summary),
      build.validation_status ?? 'draft',
    ]
  );
  return result.rows[0] as PersonaBuild;
}

/**
 * Activate a validated build. The DB trigger deactivates others.
 */
export async function activateBuild(
  personaId: string,
  buildId: string
): Promise<PersonaBuild | null> {
  const result = await query(
    `UPDATE persona_builds
     SET is_active = TRUE
     WHERE id = $1 AND persona_id = $2 AND validation_status = 'validated'
     RETURNING *`,
    [buildId, personaId]
  );
  return (result.rows[0] as PersonaBuild) ?? null;
}

/**
 * Update validation status on a build.
 */
export async function updateBuildValidation(
  personaId: string,
  buildId: string,
  status: 'validated' | 'rejected',
  issues: string[] = []
): Promise<PersonaBuild | null> {
  const result = await query(
    `UPDATE persona_builds
     SET validation_status = $1, validation_issues = $2
     WHERE id = $3 AND persona_id = $4
     RETURNING *`,
    [status, issues, buildId, personaId]
  );
  return (result.rows[0] as PersonaBuild) ?? null;
}

// ============================================
// BUILD DIFF (what's new since last build)
// ============================================

export async function getBuildDiff(
  personaId: string
): Promise<BuildDiff> {
  const latestBuild = await query(
    `SELECT created_at, version FROM persona_builds
     WHERE persona_id = $1
     ORDER BY version DESC LIMIT 1`,
    [personaId]
  );

  const lastBuildAt = latestBuild.rows[0]?.created_at ?? null;
  const lastBuildVersion = latestBuild.rows[0]?.version
    ? parseInt(latestBuild.rows[0].version, 10)
    : null;

  // If no build exists, count everything
  const sinceClause = lastBuildAt
    ? `AND created_at > $2`
    : '';
  const sinceParams = lastBuildAt ? [personaId, lastBuildAt] : [personaId];

  const [corrections, examples, preferences] = await Promise.all([
    query(
      `SELECT COUNT(*) AS count FROM persona_corrections
       WHERE persona_id = $1 ${sinceClause}`,
      sinceParams
    ),
    query(
      `SELECT layer, COUNT(*) AS count FROM persona_examples
       WHERE persona_id = $1 ${sinceClause}
       GROUP BY layer`,
      sinceParams
    ),
    query(
      `SELECT category, COUNT(*) AS count FROM persona_preferences
       WHERE persona_id = $1 AND active = TRUE ${sinceClause.replace('created_at', 'updated_at')}
       GROUP BY category`,
      sinceParams
    ),
  ]);

  const exampleCounts = { voice: 0, stance: 0, knowledge: 0 };
  for (const row of examples.rows) {
    const layer = row.layer as TrainingLayer;
    exampleCounts[layer] = parseInt(row.count, 10);
  }

  const prefCounts = { voice: 0, stance: 0, boundary: 0 };
  for (const row of preferences.rows) {
    const cat = row.category as PreferenceCategory;
    prefCounts[cat] = parseInt(row.count, 10);
  }

  return {
    corrections_since: parseInt(corrections.rows[0]?.count ?? '0', 10),
    examples_since: exampleCounts,
    preferences_since: prefCounts,
    last_build_at: lastBuildAt,
    last_build_version: lastBuildVersion,
  };
}
