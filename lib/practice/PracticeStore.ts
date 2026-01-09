/**
 * Practice Sessions - PostgreSQL Storage
 *
 * For solo practitioners (coaches, guides, healers, therapists)
 * MAIA as developmental mentor
 */

import { query } from '@/lib/db/postgres';

// Types

export interface PracticeSession {
  id: string;
  practitioner_id: string | null;
  title: string | null;
  client_alias: string | null;
  modalities_tagged: string[];
  session_type: 'individual' | 'couple' | 'group' | 'self_practice';
  started_at: string;
  ended_at: string | null;
  total_duration_ms: number | null;
  processing_status: 'recording' | 'processing' | 'transcribing' | 'analyzing' | 'complete' | 'error';
  recording_path: string | null;
  transcript_path: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Computed
  segment_count?: number;
  insight_count?: number;
}

export interface PracticeTranscriptSegment {
  id: string;
  session_id: string;
  speaker: string;
  speaker_confidence: number | null;
  start_ms: number;
  end_ms: number;
  text: string;
  transcription_confidence: number | null;
  language: string;
  is_final: boolean;
  created_at: string;
}

export type InsightType =
  | 'modality_used' | 'client_response' | 'session_arc' | 'energy_shift'
  | 'modality_opportunity' | 'blind_spot' | 'growth_edge' | 'experiment_suggestion'
  | 'practitioner_pattern' | 'strength_spotted'
  | 'client_resource' | 'client_pattern' | 'resistance_noted' | 'breakthrough_moment'
  | 'cross_session_thread' | 'reflection_question';

export interface SessionInsight {
  id: string;
  session_id: string;
  insight_type: InsightType;
  content: string;
  timestamp_ms: number | null;
  timestamp_end_ms: number | null;
  segment_refs: string[] | null;
  significance: number | null;
  modality_tag: string | null;
  model_used: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

export type GrowthType =
  | 'pattern_identified' | 'strength_developing' | 'edge_emerging'
  | 'modality_expanding' | 'style_evolution' | 'client_type_affinity';

export interface PractitionerGrowth {
  id: string;
  practitioner_id: string;
  growth_type: GrowthType;
  observation: string;
  session_refs: string[] | null;
  first_noticed_at: string | null;
  confidence: number | null;
  acknowledged: boolean;
  practitioner_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsightPreferences {
  id: string;
  practitioner_id: string;
  enabled_insights: string[];
  modality_vocabulary: string[];
  insight_depth: 'light' | 'balanced' | 'deep';
  created_at: string;
  updated_at: string;
}

// Session CRUD

export async function createSession(params: {
  practitionerId?: string;
  title?: string;
  clientAlias?: string;
  modalitiesTagged?: string[];
  sessionType?: PracticeSession['session_type'];
  notes?: string;
  tags?: string[];
}): Promise<PracticeSession> {
  const result = await query<PracticeSession>(`
    INSERT INTO practice_sessions (
      practitioner_id, title, client_alias, modalities_tagged,
      session_type, notes, tags
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [
    params.practitionerId || null,
    params.title || null,
    params.clientAlias || null,
    params.modalitiesTagged || [],
    params.sessionType || 'individual',
    params.notes || null,
    params.tags || []
  ]);

  return result.rows[0];
}

export async function getSession(sessionId: string): Promise<PracticeSession | null> {
  const result = await query<PracticeSession>(`
    SELECT * FROM practice_sessions WHERE id = $1
  `, [sessionId]);

  return result.rows[0] || null;
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Pick<PracticeSession,
    'ended_at' | 'recording_path' | 'transcript_path' | 'processing_status' |
    'total_duration_ms' | 'modalities_tagged' | 'notes' | 'tags' | 'title' | 'client_alias'
  >>
): Promise<PracticeSession | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const fieldMap: Record<string, string> = {
    ended_at: 'ended_at',
    recording_path: 'recording_path',
    transcript_path: 'transcript_path',
    processing_status: 'processing_status',
    total_duration_ms: 'total_duration_ms',
    modalities_tagged: 'modalities_tagged',
    notes: 'notes',
    tags: 'tags',
    title: 'title',
    client_alias: 'client_alias'
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if ((updates as Record<string, unknown>)[key] !== undefined) {
      setClauses.push(`${column} = $${paramIndex++}`);
      values.push((updates as Record<string, unknown>)[key]);
    }
  }

  if (setClauses.length === 0) return getSession(sessionId);

  values.push(sessionId);

  const result = await query<PracticeSession>(`
    UPDATE practice_sessions
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  return result.rows[0] || null;
}

export async function stopSession(sessionId: string): Promise<PracticeSession | null> {
  const result = await query<PracticeSession>(`
    UPDATE practice_sessions
    SET ended_at = NOW(), processing_status = 'processing'
    WHERE id = $1 AND ended_at IS NULL
    RETURNING *
  `, [sessionId]);

  return result.rows[0] || null;
}

export async function listSessions(params: {
  practitionerId?: string;
  clientAlias?: string;
  limit?: number;
  offset?: number;
}): Promise<PracticeSession[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (params.practitionerId) {
    conditions.push(`practitioner_id = $${paramIndex++}`);
    values.push(params.practitionerId);
  }
  if (params.clientAlias) {
    conditions.push(`client_alias = $${paramIndex++}`);
    values.push(params.clientAlias);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = params.limit || 50;
  const offset = params.offset || 0;

  values.push(limit, offset);

  const result = await query<PracticeSession>(`
    SELECT s.*,
      (SELECT COUNT(*)::int FROM practice_transcript_segments seg WHERE seg.session_id = s.id) AS segment_count,
      (SELECT COUNT(*)::int FROM session_insights i WHERE i.session_id = s.id) AS insight_count
    FROM practice_sessions s
    ${whereClause}
    ORDER BY s.started_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `, values);

  return result.rows;
}

// Transcript Segments

export async function addTranscriptSegment(params: {
  sessionId: string;
  speaker: string;
  speakerConfidence?: number;
  startMs: number;
  endMs: number;
  text: string;
  transcriptionConfidence?: number;
  language?: string;
  isFinal?: boolean;
}): Promise<PracticeTranscriptSegment> {
  const result = await query<PracticeTranscriptSegment>(`
    INSERT INTO practice_transcript_segments (
      session_id, speaker, speaker_confidence, start_ms, end_ms,
      text, transcription_confidence, language, is_final
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    params.sessionId,
    params.speaker,
    params.speakerConfidence ?? null,
    params.startMs,
    params.endMs,
    params.text,
    params.transcriptionConfidence ?? null,
    params.language || 'en',
    params.isFinal ?? true
  ]);

  return result.rows[0];
}

export async function getTranscriptSegments(
  sessionId: string,
  opts?: { afterMs?: number; limit?: number }
): Promise<PracticeTranscriptSegment[]> {
  const afterMs = opts?.afterMs ?? -1;
  const limit = Math.min(Math.max(opts?.limit ?? 200, 1), 1000);

  const result = await query<PracticeTranscriptSegment>(`
    SELECT *
    FROM practice_transcript_segments
    WHERE session_id = $1
      AND COALESCE(end_ms, start_ms, 0) > $2
    ORDER BY COALESCE(end_ms, start_ms, 0) ASC, created_at ASC
    LIMIT $3
  `, [sessionId, afterMs, limit]);

  return result.rows;
}

export async function getFullTranscript(sessionId: string): Promise<PracticeTranscriptSegment[]> {
  const result = await query<PracticeTranscriptSegment>(`
    SELECT * FROM practice_transcript_segments
    WHERE session_id = $1 AND is_final = TRUE
    ORDER BY start_ms ASC
  `, [sessionId]);

  return result.rows;
}

// Session Insights

export async function addInsight(params: {
  sessionId: string;
  insightType: InsightType;
  content: string;
  timestampMs?: number;
  timestampEndMs?: number;
  segmentRefs?: string[];
  significance?: number;
  modalityTag?: string;
  modelUsed?: string;
  processingTimeMs?: number;
}): Promise<SessionInsight> {
  const result = await query<SessionInsight>(`
    INSERT INTO session_insights (
      session_id, insight_type, content, timestamp_ms, timestamp_end_ms,
      segment_refs, significance, modality_tag, model_used, processing_time_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [
    params.sessionId,
    params.insightType,
    params.content,
    params.timestampMs ?? null,
    params.timestampEndMs ?? null,
    params.segmentRefs ? `{${params.segmentRefs.join(',')}}` : null,
    params.significance ?? null,
    params.modalityTag ?? null,
    params.modelUsed ?? null,
    params.processingTimeMs ?? null
  ]);

  return result.rows[0];
}

export async function getSessionInsights(
  sessionId: string,
  insightType?: InsightType
): Promise<SessionInsight[]> {
  if (insightType) {
    const result = await query<SessionInsight>(`
      SELECT * FROM session_insights
      WHERE session_id = $1 AND insight_type = $2
      ORDER BY timestamp_ms ASC NULLS LAST, created_at ASC
    `, [sessionId, insightType]);
    return result.rows;
  }

  const result = await query<SessionInsight>(`
    SELECT * FROM session_insights
    WHERE session_id = $1
    ORDER BY timestamp_ms ASC NULLS LAST, created_at ASC
  `, [sessionId]);

  return result.rows;
}

export async function getInsightsGroupedByType(sessionId: string): Promise<Record<string, SessionInsight[]>> {
  const insights = await getSessionInsights(sessionId);
  const grouped: Record<string, SessionInsight[]> = {};

  for (const insight of insights) {
    if (!grouped[insight.insight_type]) {
      grouped[insight.insight_type] = [];
    }
    grouped[insight.insight_type].push(insight);
  }

  return grouped;
}

// Practitioner Growth

export async function addGrowthObservation(params: {
  practitionerId: string;
  growthType: GrowthType;
  observation: string;
  sessionRefs?: string[];
  confidence?: number;
}): Promise<PractitionerGrowth> {
  const result = await query<PractitionerGrowth>(`
    INSERT INTO practitioner_growth (
      practitioner_id, growth_type, observation, session_refs,
      first_noticed_at, confidence
    ) VALUES ($1, $2, $3, $4, NOW(), $5)
    RETURNING *
  `, [
    params.practitionerId,
    params.growthType,
    params.observation,
    params.sessionRefs ? `{${params.sessionRefs.join(',')}}` : null,
    params.confidence ?? null
  ]);

  return result.rows[0];
}

export async function getGrowthObservations(
  practitionerId: string,
  opts?: { acknowledged?: boolean; limit?: number }
): Promise<PractitionerGrowth[]> {
  let whereClause = 'WHERE practitioner_id = $1';
  const values: unknown[] = [practitionerId];
  let paramIndex = 2;

  if (opts?.acknowledged !== undefined) {
    whereClause += ` AND acknowledged = $${paramIndex++}`;
    values.push(opts.acknowledged);
  }

  const limit = opts?.limit || 50;
  values.push(limit);

  const result = await query<PractitionerGrowth>(`
    SELECT * FROM practitioner_growth
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex}
  `, values);

  return result.rows;
}

export async function acknowledgeGrowth(
  growthId: string,
  notes?: string
): Promise<PractitionerGrowth | null> {
  const result = await query<PractitionerGrowth>(`
    UPDATE practitioner_growth
    SET acknowledged = TRUE, practitioner_notes = COALESCE($2, practitioner_notes)
    WHERE id = $1
    RETURNING *
  `, [growthId, notes || null]);

  return result.rows[0] || null;
}

// Insight Preferences

export async function getInsightPreferences(practitionerId: string): Promise<InsightPreferences | null> {
  const result = await query<InsightPreferences>(`
    SELECT * FROM practitioner_insight_preferences
    WHERE practitioner_id = $1
  `, [practitionerId]);

  return result.rows[0] || null;
}

export async function upsertInsightPreferences(params: {
  practitionerId: string;
  enabledInsights?: string[];
  modalityVocabulary?: string[];
  insightDepth?: 'light' | 'balanced' | 'deep';
}): Promise<InsightPreferences> {
  const result = await query<InsightPreferences>(`
    INSERT INTO practitioner_insight_preferences (
      practitioner_id, enabled_insights, modality_vocabulary, insight_depth
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (practitioner_id) DO UPDATE SET
      enabled_insights = COALESCE($2, practitioner_insight_preferences.enabled_insights),
      modality_vocabulary = COALESCE($3, practitioner_insight_preferences.modality_vocabulary),
      insight_depth = COALESCE($4, practitioner_insight_preferences.insight_depth),
      updated_at = NOW()
    RETURNING *
  `, [
    params.practitionerId,
    params.enabledInsights || null,
    params.modalityVocabulary || null,
    params.insightDepth || 'balanced'
  ]);

  return result.rows[0];
}

// Modality Vocabulary

export async function getModalityVocabulary(): Promise<Array<{
  code: string;
  display_name: string;
  category: string;
  is_system: boolean;
}>> {
  const result = await query(`
    SELECT code, display_name, category, is_system
    FROM modality_vocabulary
    ORDER BY category, display_name
  `, []);

  return result.rows;
}

// Cross-session queries for MAIA mentoring

export async function getRecentSessionsForGrowthAnalysis(
  practitionerId: string,
  limit: number = 10
): Promise<Array<{ session: PracticeSession; insights: SessionInsight[] }>> {
  const sessions = await listSessions({ practitionerId, limit });

  const results = await Promise.all(
    sessions.map(async (session) => ({
      session,
      insights: await getSessionInsights(session.id)
    }))
  );

  return results;
}

export async function getClientJourney(
  practitionerId: string,
  clientAlias: string
): Promise<PracticeSession[]> {
  const result = await query<PracticeSession>(`
    SELECT s.*,
      (SELECT COUNT(*)::int FROM session_insights i WHERE i.session_id = s.id) AS insight_count
    FROM practice_sessions s
    WHERE practitioner_id = $1 AND client_alias = $2
    ORDER BY started_at ASC
  `, [practitionerId, clientAlias]);

  return result.rows;
}
