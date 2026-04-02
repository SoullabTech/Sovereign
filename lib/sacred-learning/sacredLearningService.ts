/**
 * Sacred Learning Service — Data access for the sacred learning domain
 *
 * All queries respect the authority hierarchy and review status.
 * Only content with review_status = 'approved' is served.
 */

import { query } from '@/lib/db/postgres';
import type {
  SacredPassage,
  SacredCommentary,
  SacredPractice,
  SacredReflection,
  SacredTheme,
  MemberSacredFormation,
  DailyEncounter,
  AuthorityLevel,
} from './types';

// ─── Daily Encounter ────────────────────────────────────────

/**
 * Get today's daily encounter for a member.
 * Phase 1: sequential by day_number from formation state.
 */
export async function getDailyEncounter(memberId: string): Promise<DailyEncounter | null> {
  const formation = await loadFormationState(memberId);
  const dayNumber = formation?.currentDayNumber ?? 1;

  // Get passage for this day
  const passageResult = await query<any>(
    `SELECT * FROM sacred_passages
     WHERE day_number = $1
       AND review_status = 'approved'
     LIMIT 1`,
    [dayNumber]
  );

  if (passageResult.rows.length === 0) {
    // Try day 1 as fallback
    const fallback = await query<any>(
      `SELECT * FROM sacred_passages
       WHERE day_number = 1
         AND review_status = 'approved'
       LIMIT 1`,
      [1]
    );
    if (fallback.rows.length === 0) return null;
    passageResult.rows = fallback.rows;
  }

  const row = passageResult.rows[0];
  const passage = rowToPassage(row);

  // Get commentary (approved only, ordered by authority level then display_order)
  const commentaryResult = await query<any>(
    `SELECT * FROM sacred_commentary
     WHERE passage_id = $1
       AND review_status = 'approved'
     ORDER BY authority_level ASC, display_order ASC`,
    [passage.id]
  );
  const commentary = commentaryResult.rows.map(rowToCommentary);

  // Get practices (approved only)
  const practicesResult = await query<any>(
    `SELECT * FROM sacred_practices
     WHERE passage_id = $1
       AND review_status = 'approved'`,
    [passage.id]
  );
  const practices = practicesResult.rows.map(rowToPractice);

  // Get theme for this passage
  const themeResult = await query<any>(
    `SELECT t.* FROM sacred_themes t
     JOIN sacred_passage_themes pt ON pt.theme_id = t.id
     WHERE pt.passage_id = $1
     LIMIT 1`,
    [passage.id]
  );
  const theme = themeResult.rows.length > 0 ? rowToTheme(themeResult.rows[0]) : undefined;

  // Get previous reflection on this passage (if any)
  const prevReflection = await query<any>(
    `SELECT * FROM sacred_reflections
     WHERE member_id = $1 AND passage_id = $2
     ORDER BY created_at DESC LIMIT 1`,
    [memberId, passage.id]
  );
  const previousReflection = prevReflection.rows.length > 0
    ? rowToReflection(prevReflection.rows[0])
    : undefined;

  // Reflection prompt — stored in seed data as part of practices with type
  // For now, use a passage-specific prompt stored alongside the passage
  const reflectionPrompt = practices.find(p => p.label.includes('Reflection'))?.text
    || 'Sit with this passage. What arises?';

  return {
    passage,
    commentary,
    practices: practices.filter(p => !p.label.includes('Reflection')),
    reflectionPrompt,
    theme,
    previousReflection,
    formation,
  };
}

// ─── Single Passage ─────────────────────────────────────────

export async function getPassageById(passageId: string): Promise<DailyEncounter | null> {
  const passageResult = await query<any>(
    `SELECT * FROM sacred_passages WHERE id = $1 AND review_status = 'approved'`,
    [passageId]
  );
  if (passageResult.rows.length === 0) return null;

  const passage = rowToPassage(passageResult.rows[0]);

  const commentaryResult = await query<any>(
    `SELECT * FROM sacred_commentary
     WHERE passage_id = $1 AND review_status = 'approved'
     ORDER BY authority_level ASC, display_order ASC`,
    [passageId]
  );

  const practicesResult = await query<any>(
    `SELECT * FROM sacred_practices
     WHERE passage_id = $1 AND review_status = 'approved'`,
    [passageId]
  );

  const themeResult = await query<any>(
    `SELECT t.* FROM sacred_themes t
     JOIN sacred_passage_themes pt ON pt.theme_id = t.id
     WHERE pt.passage_id = $1 LIMIT 1`,
    [passageId]
  );

  return {
    passage,
    commentary: commentaryResult.rows.map(rowToCommentary),
    practices: practicesResult.rows.map(rowToPractice),
    reflectionPrompt: 'Sit with this passage. What arises?',
    theme: themeResult.rows.length > 0 ? rowToTheme(themeResult.rows[0]) : undefined,
    formation: null,
  };
}

// ─── Formation State ────────────────────────────────────────

export async function loadFormationState(memberId: string): Promise<MemberSacredFormation | null> {
  try {
    const result = await query<any>(
      `SELECT * FROM member_sacred_formation WHERE member_id = $1`,
      [memberId]
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return {
      memberId: r.member_id,
      currentThemeId: r.current_theme_id,
      currentDayNumber: r.current_day_number,
      passagesEncountered: r.passages_encountered,
      reflectionsWritten: r.reflections_written,
      practicesEngaged: r.practices_engaged,
      lastEncounterAt: r.last_encounter_at?.toISOString(),
      formationPhase: r.formation_phase,
      layerVisibility: r.layer_visibility,
    };
  } catch (err) {
    console.warn('[Sacred] Failed to load formation state (graceful fallback):', err);
    return null;
  }
}

/**
 * Fire-and-forget formation state update.
 * Never blocks the response.
 */
export function upsertFormationState(
  memberId: string,
  update: Partial<MemberSacredFormation>
): void {
  query(
    `INSERT INTO member_sacred_formation (member_id, current_day_number, passages_encountered, last_encounter_at)
     VALUES ($1, $2, 1, NOW())
     ON CONFLICT (member_id)
     DO UPDATE SET
       current_day_number = COALESCE($2, member_sacred_formation.current_day_number),
       passages_encountered = member_sacred_formation.passages_encountered + 1,
       reflections_written = member_sacred_formation.reflections_written + COALESCE($3, 0),
       last_encounter_at = NOW(),
       updated_at = NOW()`,
    [
      memberId,
      update.currentDayNumber ?? 1,
      update.reflectionsWritten ? 1 : 0,
    ]
  ).catch(err => {
    console.warn('[Sacred] Formation upsert failed (non-fatal):', err);
  });
}

// ─── Reflections ────────────────────────────────────────────

export async function saveReflection(
  memberId: string,
  passageId: string | null,
  themeId: string | null,
  text: string
): Promise<SacredReflection> {
  const result = await query<any>(
    `INSERT INTO sacred_reflections (member_id, passage_id, theme_id, text)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [memberId, passageId, themeId, text]
  );
  return rowToReflection(result.rows[0]);
}

// ─── Saved Passages ─────────────────────────────────────────

export async function getSavedPassages(memberId: string): Promise<SacredPassage[]> {
  const result = await query<any>(
    `SELECT p.* FROM sacred_passages p
     JOIN sacred_saved_passages sp ON sp.passage_id = p.id
     WHERE sp.member_id = $1
     ORDER BY sp.saved_at DESC`,
    [memberId]
  );
  return result.rows.map(rowToPassage);
}

export async function toggleSavePassage(memberId: string, passageId: string): Promise<boolean> {
  // Check if already saved
  const existing = await query(
    `SELECT 1 FROM sacred_saved_passages WHERE member_id = $1 AND passage_id = $2`,
    [memberId, passageId]
  );
  if (existing.rows.length > 0) {
    await query(
      `DELETE FROM sacred_saved_passages WHERE member_id = $1 AND passage_id = $2`,
      [memberId, passageId]
    );
    return false; // unsaved
  } else {
    await query(
      `INSERT INTO sacred_saved_passages (member_id, passage_id) VALUES ($1, $2)`,
      [memberId, passageId]
    );
    return true; // saved
  }
}

// ─── Row Mappers ────────────────────────────────────────────

function rowToPassage(r: any): SacredPassage {
  return {
    id: r.id,
    sourceId: r.source_id,
    authorityLevel: r.authority_level as AuthorityLevel,
    surahName: r.surah_name,
    surahNumber: r.surah_number,
    ayahStart: r.ayah_start,
    ayahEnd: r.ayah_end,
    sectionRef: r.section_ref,
    arabicText: r.arabic_text,
    translationText: r.translation_text,
    contextNote: r.context_note,
    translator: r.translator,
    translationEdition: r.translation_edition,
    reviewStatus: r.review_status,
    sensitivityFlags: r.sensitivity_flags || [],
    dayNumber: r.day_number,
    arabicInsight: r.arabic_insight,
  };
}

function rowToCommentary(r: any): SacredCommentary {
  return {
    id: r.id,
    passageId: r.passage_id,
    sourceId: r.source_id,
    authorityLevel: r.authority_level as AuthorityLevel,
    text: r.text,
    sectionRef: r.section_ref,
    author: r.author,
    work: r.work,
    translator: r.translator,
    reviewStatus: r.review_status,
    displayOrder: r.display_order,
  };
}

function rowToPractice(r: any): SacredPractice {
  return {
    id: r.id,
    passageId: r.passage_id,
    themeId: r.theme_id,
    authorityLevel: r.authority_level as AuthorityLevel,
    practiceType: r.practice_type,
    text: r.text,
    label: r.label,
    reviewStatus: r.review_status,
  };
}

function rowToTheme(r: any): SacredTheme {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    arabicTerm: r.arabic_term,
    description: r.description,
    displayOrder: r.display_order,
  };
}

function rowToReflection(r: any): SacredReflection {
  return {
    id: r.id,
    memberId: r.member_id,
    passageId: r.passage_id,
    themeId: r.theme_id,
    text: r.text,
    createdAt: r.created_at?.toISOString(),
  };
}
