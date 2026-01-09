/**
 * Practice Worlds - PostgreSQL Storage
 *
 * Pluggable interpretive lenses for multi-world practitioner support.
 * Each "world" = a modality/framework that produces its own insights + experiments.
 */

import { query } from '@/lib/db/postgres';

// Types

export interface PracticeWorld {
  id: string;
  code: string;
  display_name: string;
  description: string | null;
  domain: 'body' | 'mind' | 'relational' | 'creative' | 'spiritual' | 'integrative';
  insight_types: string[];
  experiment_types: string[];
  vocabulary: string[];
  is_system: boolean;
  is_active: boolean;
  requires_training: boolean;
  icon_name: string | null;
  color_theme: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PractitionerWorld {
  id: string;
  practitioner_id: string;
  world_id: string;
  proficiency_level: 'exploring' | 'practicing' | 'proficient' | 'mastery';
  is_enabled: boolean;
  auto_suggest: boolean;
  sessions_using_world: number;
  last_used_at: string | null;
  first_enabled_at: string;
  learning_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  world?: PracticeWorld;
}

export interface WorldInsightType {
  id: string;
  world_id: string;
  code: string;
  display_name: string;
  description: string | null;
  detection_markers: string[];
  prompt_template: string | null;
  icon_name: string | null;
  significance_default: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface WorldExperiment {
  id: string;
  world_id: string;
  code: string;
  title: string;
  description: string;
  trigger_conditions: string | null;
  difficulty_level: 'accessible' | 'intermediate' | 'advanced';
  instructions: string | null;
  what_to_notice: string | null;
  reflection_prompts: string[] | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SessionWorld {
  id: string;
  session_id: string;
  world_id: string;
  usage_type: 'detected' | 'explicit' | 'suggested' | 'missed';
  segment_refs: string[] | null;
  marker_count: number;
  created_at: string;
  // Joined fields
  world?: PracticeWorld;
}

// World Registry CRUD

export async function getAllWorlds(opts?: {
  domain?: string;
  activeOnly?: boolean;
}): Promise<PracticeWorld[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (opts?.domain) {
    conditions.push(`domain = $${paramIndex++}`);
    values.push(opts.domain);
  }
  if (opts?.activeOnly !== false) {
    conditions.push('is_active = TRUE');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query<PracticeWorld>(`
    SELECT * FROM practice_worlds
    ${whereClause}
    ORDER BY sort_order ASC, display_name ASC
  `, values);

  return result.rows;
}

export async function getWorld(worldId: string): Promise<PracticeWorld | null> {
  const result = await query<PracticeWorld>(`
    SELECT * FROM practice_worlds WHERE id = $1
  `, [worldId]);

  return result.rows[0] || null;
}

export async function getWorldByCode(code: string): Promise<PracticeWorld | null> {
  const result = await query<PracticeWorld>(`
    SELECT * FROM practice_worlds WHERE code = $1
  `, [code]);

  return result.rows[0] || null;
}

// Practitioner's Worlds

export async function getPractitionerWorlds(
  practitionerId: string,
  opts?: { enabledOnly?: boolean }
): Promise<PractitionerWorld[]> {
  let whereClause = 'WHERE pw.practitioner_id = $1';
  if (opts?.enabledOnly !== false) {
    whereClause += ' AND pw.is_enabled = TRUE';
  }

  const result = await query<PractitionerWorld & PracticeWorld>(`
    SELECT pw.*,
      w.code, w.display_name, w.description, w.domain,
      w.insight_types, w.experiment_types, w.vocabulary,
      w.is_system, w.is_active, w.requires_training,
      w.icon_name, w.color_theme, w.sort_order as world_sort_order
    FROM practitioner_worlds pw
    JOIN practice_worlds w ON w.id = pw.world_id
    ${whereClause}
    ORDER BY w.sort_order ASC
  `, [practitionerId]);

  // Reshape to nest world data
  return result.rows.map(row => ({
    id: row.id,
    practitioner_id: row.practitioner_id,
    world_id: row.world_id,
    proficiency_level: row.proficiency_level,
    is_enabled: row.is_enabled,
    auto_suggest: row.auto_suggest,
    sessions_using_world: row.sessions_using_world,
    last_used_at: row.last_used_at,
    first_enabled_at: row.first_enabled_at,
    learning_notes: row.learning_notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    world: {
      id: row.world_id,
      code: row.code,
      display_name: row.display_name,
      description: row.description,
      domain: row.domain,
      insight_types: row.insight_types,
      experiment_types: row.experiment_types,
      vocabulary: row.vocabulary,
      is_system: row.is_system,
      is_active: row.is_active,
      requires_training: row.requires_training,
      icon_name: row.icon_name,
      color_theme: row.color_theme,
      sort_order: row.sort_order,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }));
}

export async function enableWorldForPractitioner(params: {
  practitionerId: string;
  worldId: string;
  proficiencyLevel?: PractitionerWorld['proficiency_level'];
}): Promise<PractitionerWorld> {
  const result = await query<PractitionerWorld>(`
    INSERT INTO practitioner_worlds (practitioner_id, world_id, proficiency_level)
    VALUES ($1, $2, $3)
    ON CONFLICT (practitioner_id, world_id) DO UPDATE SET
      is_enabled = TRUE,
      proficiency_level = COALESCE($3, practitioner_worlds.proficiency_level),
      updated_at = NOW()
    RETURNING *
  `, [
    params.practitionerId,
    params.worldId,
    params.proficiencyLevel || 'exploring'
  ]);

  return result.rows[0];
}

export async function disableWorldForPractitioner(
  practitionerId: string,
  worldId: string
): Promise<PractitionerWorld | null> {
  const result = await query<PractitionerWorld>(`
    UPDATE practitioner_worlds
    SET is_enabled = FALSE, updated_at = NOW()
    WHERE practitioner_id = $1 AND world_id = $2
    RETURNING *
  `, [practitionerId, worldId]);

  return result.rows[0] || null;
}

export async function updatePractitionerWorld(
  practitionerId: string,
  worldId: string,
  updates: Partial<Pick<PractitionerWorld,
    'proficiency_level' | 'auto_suggest' | 'learning_notes'
  >>
): Promise<PractitionerWorld | null> {
  const setClauses: string[] = ['updated_at = NOW()'];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.proficiency_level !== undefined) {
    setClauses.push(`proficiency_level = $${paramIndex++}`);
    values.push(updates.proficiency_level);
  }
  if (updates.auto_suggest !== undefined) {
    setClauses.push(`auto_suggest = $${paramIndex++}`);
    values.push(updates.auto_suggest);
  }
  if (updates.learning_notes !== undefined) {
    setClauses.push(`learning_notes = $${paramIndex++}`);
    values.push(updates.learning_notes);
  }

  values.push(practitionerId, worldId);

  const result = await query<PractitionerWorld>(`
    UPDATE practitioner_worlds
    SET ${setClauses.join(', ')}
    WHERE practitioner_id = $${paramIndex++} AND world_id = $${paramIndex}
    RETURNING *
  `, values);

  return result.rows[0] || null;
}

export async function incrementWorldUsage(
  practitionerId: string,
  worldId: string
): Promise<void> {
  await query(`
    UPDATE practitioner_worlds
    SET sessions_using_world = sessions_using_world + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE practitioner_id = $1 AND world_id = $2
  `, [practitionerId, worldId]);
}

// World Insight Types

export async function getWorldInsightTypes(worldId: string): Promise<WorldInsightType[]> {
  const result = await query<WorldInsightType>(`
    SELECT * FROM world_insight_types
    WHERE world_id = $1 AND is_active = TRUE
    ORDER BY sort_order ASC
  `, [worldId]);

  return result.rows;
}

export async function getAllInsightTypesForWorlds(worldIds: string[]): Promise<WorldInsightType[]> {
  if (worldIds.length === 0) return [];

  const result = await query<WorldInsightType>(`
    SELECT * FROM world_insight_types
    WHERE world_id = ANY($1) AND is_active = TRUE
    ORDER BY sort_order ASC
  `, [worldIds]);

  return result.rows;
}

// World Experiments

export async function getWorldExperiments(
  worldId: string,
  opts?: { difficultyLevel?: WorldExperiment['difficulty_level'] }
): Promise<WorldExperiment[]> {
  let whereClause = 'WHERE world_id = $1 AND is_active = TRUE';
  const values: unknown[] = [worldId];

  if (opts?.difficultyLevel) {
    whereClause += ' AND difficulty_level = $2';
    values.push(opts.difficultyLevel);
  }

  const result = await query<WorldExperiment>(`
    SELECT * FROM world_experiments
    ${whereClause}
    ORDER BY sort_order ASC
  `, values);

  return result.rows;
}

export async function getExperimentsForPractitioner(
  practitionerId: string,
  opts?: { maxDifficulty?: WorldExperiment['difficulty_level'] }
): Promise<Array<WorldExperiment & { world_code: string; world_name: string }>> {
  // Get experiments from enabled worlds, filtered by practitioner's proficiency
  const difficultyMap: Record<string, number> = {
    'accessible': 1,
    'intermediate': 2,
    'advanced': 3
  };

  const proficiencyToDifficulty: Record<string, number> = {
    'exploring': 1,      // accessible only
    'practicing': 2,     // up to intermediate
    'proficient': 3,     // all levels
    'mastery': 3         // all levels
  };

  const maxDiff = opts?.maxDifficulty
    ? difficultyMap[opts.maxDifficulty]
    : 3;

  const result = await query<WorldExperiment & { world_code: string; world_name: string; proficiency_level: string }>(`
    SELECT e.*, w.code as world_code, w.display_name as world_name, pw.proficiency_level
    FROM world_experiments e
    JOIN practice_worlds w ON w.id = e.world_id
    JOIN practitioner_worlds pw ON pw.world_id = w.id AND pw.practitioner_id = $1
    WHERE pw.is_enabled = TRUE
      AND e.is_active = TRUE
      AND w.is_active = TRUE
    ORDER BY w.sort_order ASC, e.sort_order ASC
  `, [practitionerId]);

  // Filter by proficiency-appropriate difficulty
  return result.rows.filter(exp => {
    const expDiff = difficultyMap[exp.difficulty_level];
    const allowedDiff = Math.min(
      proficiencyToDifficulty[exp.proficiency_level],
      maxDiff
    );
    return expDiff <= allowedDiff;
  });
}

// Session Worlds (tracking which worlds were used in a session)

export async function recordSessionWorld(params: {
  sessionId: string;
  worldId: string;
  usageType: SessionWorld['usage_type'];
  segmentRefs?: string[];
  markerCount?: number;
}): Promise<SessionWorld> {
  const result = await query<SessionWorld>(`
    INSERT INTO session_worlds (session_id, world_id, usage_type, segment_refs, marker_count)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (session_id, world_id) DO UPDATE SET
      usage_type = CASE
        WHEN $3 = 'explicit' THEN 'explicit'
        WHEN session_worlds.usage_type = 'explicit' THEN 'explicit'
        ELSE $3
      END,
      segment_refs = COALESCE(
        array_cat(session_worlds.segment_refs, $4::uuid[]),
        $4::uuid[]
      ),
      marker_count = session_worlds.marker_count + COALESCE($5, 0)
    RETURNING *
  `, [
    params.sessionId,
    params.worldId,
    params.usageType,
    params.segmentRefs ? `{${params.segmentRefs.join(',')}}` : null,
    params.markerCount ?? 0
  ]);

  return result.rows[0];
}

export async function getSessionWorlds(sessionId: string): Promise<SessionWorld[]> {
  const result = await query<SessionWorld & PracticeWorld>(`
    SELECT sw.*,
      w.code, w.display_name, w.description, w.domain,
      w.icon_name, w.color_theme
    FROM session_worlds sw
    JOIN practice_worlds w ON w.id = sw.world_id
    WHERE sw.session_id = $1
    ORDER BY sw.marker_count DESC
  `, [sessionId]);

  return result.rows.map(row => ({
    id: row.id,
    session_id: row.session_id,
    world_id: row.world_id,
    usage_type: row.usage_type,
    segment_refs: row.segment_refs,
    marker_count: row.marker_count,
    created_at: row.created_at,
    world: {
      id: row.world_id,
      code: row.code,
      display_name: row.display_name,
      description: row.description,
      domain: row.domain,
      insight_types: [],
      experiment_types: [],
      vocabulary: [],
      is_system: true,
      is_active: true,
      requires_training: false,
      icon_name: row.icon_name,
      color_theme: row.color_theme,
      sort_order: 0,
      created_at: row.created_at,
      updated_at: row.created_at
    }
  }));
}

// World Detection (for MAIA to detect which worlds are present in text)

export async function detectWorldsInText(
  text: string,
  enabledWorldIds?: string[]
): Promise<Array<{ worldId: string; worldCode: string; markerCount: number; matchedMarkers: string[] }>> {
  // Get all active worlds (or just enabled ones if specified)
  let worldsQuery = `
    SELECT id, code, vocabulary FROM practice_worlds
    WHERE is_active = TRUE
  `;
  const values: unknown[] = [];

  if (enabledWorldIds && enabledWorldIds.length > 0) {
    worldsQuery += ' AND id = ANY($1)';
    values.push(enabledWorldIds);
  }

  const worlds = await query<{ id: string; code: string; vocabulary: string[] }>(
    worldsQuery,
    values
  );

  const lowerText = text.toLowerCase();
  const results: Array<{
    worldId: string;
    worldCode: string;
    markerCount: number;
    matchedMarkers: string[];
  }> = [];

  for (const world of worlds.rows) {
    const matchedMarkers: string[] = [];

    for (const marker of world.vocabulary) {
      if (lowerText.includes(marker.toLowerCase())) {
        matchedMarkers.push(marker);
      }
    }

    if (matchedMarkers.length > 0) {
      results.push({
        worldId: world.id,
        worldCode: world.code,
        markerCount: matchedMarkers.length,
        matchedMarkers
      });
    }
  }

  // Sort by marker count descending
  return results.sort((a, b) => b.markerCount - a.markerCount);
}

// MAIA Mentor: Get suggested world for a client/session context

export async function suggestWorldForContext(params: {
  practitionerId: string;
  transcriptSample: string;
  excludeWorlds?: string[];
}): Promise<{
  suggestedWorld: PracticeWorld | null;
  reason: string;
  alternativeWorlds: PracticeWorld[];
}> {
  // Get practitioner's enabled worlds
  const practitionerWorlds = await getPractitionerWorlds(params.practitionerId);
  const enabledWorldIds = practitionerWorlds
    .filter(pw => !params.excludeWorlds?.includes(pw.world_id))
    .map(pw => pw.world_id);

  if (enabledWorldIds.length === 0) {
    return {
      suggestedWorld: null,
      reason: 'No enabled worlds available',
      alternativeWorlds: []
    };
  }

  // Detect worlds in the transcript
  const detected = await detectWorldsInText(params.transcriptSample, enabledWorldIds);

  if (detected.length === 0) {
    // No clear markers - suggest based on what practitioner uses least
    const leastUsed = practitionerWorlds
      .filter(pw => enabledWorldIds.includes(pw.world_id))
      .sort((a, b) => a.sessions_using_world - b.sessions_using_world)[0];

    return {
      suggestedWorld: leastUsed?.world || null,
      reason: leastUsed
        ? `You haven't explored ${leastUsed.world?.display_name} much yet — could this client benefit from that lens?`
        : 'Consider what world might serve this client',
      alternativeWorlds: []
    };
  }

  // Get full world data for top detected
  const topWorld = await getWorld(detected[0].worldId);
  const alternativeWorlds = await Promise.all(
    detected.slice(1, 3).map(d => getWorld(d.worldId))
  );

  return {
    suggestedWorld: topWorld,
    reason: `Detected ${detected[0].markerCount} ${topWorld?.display_name} markers: ${detected[0].matchedMarkers.slice(0, 3).join(', ')}`,
    alternativeWorlds: alternativeWorlds.filter((w): w is PracticeWorld => w !== null)
  };
}
