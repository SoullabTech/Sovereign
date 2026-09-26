/**
 * MAIA Clinical Supervision - PostgreSQL Storage
 *
 * All supervision data stored in local PostgreSQL.
 * HIPAA compliant - no cloud storage.
 *
 * SECURITY: Transcript text is PHI - encrypted at rest (Phase 3A)
 * See: docs/security/phi-free-text.md
 */

import { query } from '@/lib/db/postgres';
import { randomUUID } from 'crypto';
import type { CaptureIntegrityRecord } from '@/lib/studio/captureIntegrity';
import {
  getEncryptedColumnsForInsert,
  decryptTranscriptSegments,
  type TranscriptSegmentRow,
} from '@/lib/security/phiAccessors/transcripts';

// Types
export interface SupervisionSession {
  id: string;
  practitioner_id: string | null;
  case_id: string | null;
  session_type: 'individual' | 'group' | 'peer' | 'consultation' | 'team_meeting' | 'reading' | 'scribe' | 'live_scribe';
  title: string | null;
  started_at: string;
  ended_at: string | null;
  recording_path: string | null;
  transcript_path: string | null;
  processing_status: 'recording' | 'processing' | 'transcribing' | 'analyzing' | 'complete' | 'error';
  total_duration_ms: number | null;
  speaker_count: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Computed fields (from listSessions query)
  transcript_count?: number;
}

export interface TranscriptSegment {
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

export interface SupervisionInsight {
  id: string;
  session_id: string;
  insight_type: 'pattern' | 'countertransference' | 'intervention' | 'stuck_point' | 'rupture' | 'attunement' | 'transference' | 'documentation' | 'recommendation';
  content: string;
  segment_refs: string[] | null;
  time_range_start_ms: number | null;
  time_range_end_ms: number | null;
  significance: number | null;
  model_used: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

export interface SupervisionJob {
  id: string;
  session_id: string;
  job_type: 'transcribe' | 'diarize' | 'analyze_patterns' | 'analyze_countertransference' | 'analyze_interventions' | 'detect_ruptures' | 'generate_documentation' | 'generate_summary';
  status: 'pending' | 'processing' | 'complete' | 'error' | 'cancelled';
  priority: number;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

// Session CRUD

export async function createSession(params: {
  practitionerId?: string;
  caseId?: string;
  sessionType?: SupervisionSession['session_type'];
  title?: string;
  metadata?: Record<string, unknown>;
}): Promise<SupervisionSession> {
  const result = await query<SupervisionSession>(`
    INSERT INTO supervision_sessions (
      practitioner_id, case_id, session_type, title, metadata
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [
    params.practitionerId || null,
    params.caseId || null,
    params.sessionType || 'consultation',
    params.title || null,
    JSON.stringify(params.metadata || {})
  ]);

  return result.rows[0];
}

export async function getSession(sessionId: string): Promise<SupervisionSession | null> {
  const result = await query<SupervisionSession>(`
    SELECT * FROM supervision_sessions WHERE id = $1
  `, [sessionId]);

  return result.rows[0] || null;
}

export async function getActiveSession(practitionerId: string): Promise<SupervisionSession | null> {
  const result = await query<SupervisionSession>(`
    SELECT * FROM supervision_sessions
    WHERE practitioner_id = $1 AND ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1
  `, [practitionerId]);

  return result.rows[0] || null;
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Pick<SupervisionSession, 'ended_at' | 'recording_path' | 'transcript_path' | 'processing_status' | 'total_duration_ms' | 'speaker_count' | 'metadata'>>
): Promise<SupervisionSession | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.ended_at !== undefined) {
    setClauses.push(`ended_at = $${paramIndex++}`);
    values.push(updates.ended_at);
  }
  if (updates.recording_path !== undefined) {
    setClauses.push(`recording_path = $${paramIndex++}`);
    values.push(updates.recording_path);
  }
  if (updates.transcript_path !== undefined) {
    setClauses.push(`transcript_path = $${paramIndex++}`);
    values.push(updates.transcript_path);
  }
  if (updates.processing_status !== undefined) {
    setClauses.push(`processing_status = $${paramIndex++}`);
    values.push(updates.processing_status);
  }
  if (updates.total_duration_ms !== undefined) {
    setClauses.push(`total_duration_ms = $${paramIndex++}`);
    values.push(updates.total_duration_ms);
  }
  if (updates.speaker_count !== undefined) {
    setClauses.push(`speaker_count = $${paramIndex++}`);
    values.push(updates.speaker_count);
  }
  if (updates.metadata !== undefined) {
    setClauses.push(`metadata = $${paramIndex++}`);
    values.push(JSON.stringify(updates.metadata));
  }

  if (setClauses.length === 0) return getSession(sessionId);

  values.push(sessionId);

  const result = await query<SupervisionSession>(`
    UPDATE supervision_sessions
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  return result.rows[0] || null;
}

export async function stopSession(sessionId: string): Promise<SupervisionSession | null> {
  const result = await query<SupervisionSession>(`
    UPDATE supervision_sessions
    SET ended_at = NOW(), processing_status = 'processing'
    WHERE id = $1 AND ended_at IS NULL
    RETURNING *
  `, [sessionId]);

  return result.rows[0] || null;
}

export async function listSessions(params: {
  practitionerId?: string;
  caseId?: string;
  limit?: number;
  offset?: number;
}): Promise<SupervisionSession[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (params.practitionerId) {
    conditions.push(`practitioner_id = $${paramIndex++}`);
    values.push(params.practitionerId);
  }
  if (params.caseId) {
    conditions.push(`case_id = $${paramIndex++}`);
    values.push(params.caseId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = params.limit || 50;
  const offset = params.offset || 0;

  values.push(limit, offset);

  const result = await query<SupervisionSession>(`
    SELECT s.*,
      (SELECT COUNT(*)::int FROM supervision_transcript_segments seg WHERE seg.session_id = s.id) AS transcript_count
    FROM supervision_sessions s
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
  practitionerId?: string;
  chunkIndex?: number;
}): Promise<TranscriptSegment> {
  const segmentId = randomUUID();
  const chunkIndex = params.chunkIndex ?? -1;

  // SECURITY: PHI encryption - plaintext + encrypted columns
  const { textEnc, textEncMeta } = getEncryptedColumnsForInsert(params.text, {
    table: 'supervision_transcript_segments',
    rowId: segmentId,
    sessionId: params.sessionId,
    practitionerId: params.practitionerId,
  });

  const result = await query<TranscriptSegment>(`
    INSERT INTO supervision_transcript_segments (
      id, session_id, speaker, speaker_confidence, start_ms, end_ms,
      text, text_enc, text_enc_meta, transcription_confidence, language, is_final, chunk_index
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (session_id, chunk_index) WHERE chunk_index >= 0 DO NOTHING
    RETURNING id, session_id, speaker, speaker_confidence, start_ms, end_ms,
              text, transcription_confidence, language, is_final, created_at
  `, [
    segmentId,
    params.sessionId,
    params.speaker,
    params.speakerConfidence ?? null,
    params.startMs,
    params.endMs,
    params.text,
    textEnc,
    textEncMeta,
    params.transcriptionConfidence ?? null,
    params.language || 'en',
    params.isFinal ?? true,
    chunkIndex,
  ]);

  return result.rows[0];
}

/**
 * Get the tail of the last finalized transcript segment for a session.
 * Used as a Whisper context prompt to reduce repeated openings across chunks.
 *
 * `speaker` scopes the lookup to one capture lane. Under dual-channel capture
 * the two lanes transcribe independently, so seeding Whisper with the tail of
 * the OTHER speaker's sentence actively degrades the transcript — it primes
 * the model to continue a sentence this audio never contained. Callers on a
 * known lane must pass it; omitting it preserves the whole-session behaviour
 * used by single-channel (mic-only) sessions.
 */
export async function getLastChunkTail(
  sessionId: string,
  speaker?: string,
): Promise<string | null> {
  const result = await query<{ text: string }>(`
    SELECT text FROM supervision_transcript_segments
    WHERE session_id = $1 AND is_final = true
      AND ($2::text IS NULL OR speaker = $2)
    ORDER BY end_ms DESC
    LIMIT 1
  `, [sessionId, speaker ?? null]);

  if (!result.rows[0]?.text) return null;
  return result.rows[0].text.slice(-80) || null;
}

/**
 * Capture integrity for a session, by supervision session id.
 *
 * Returns null when the session predates integrity monitoring. Callers must
 * keep that distinct from "monitored and clean" — one means nothing is known,
 * the other is a positive finding.
 */
export async function getCaptureIntegrity(
  sessionId: string,
): Promise<CaptureIntegrityRecord | null> {
  const result = await query<{ metadata: Record<string, unknown> | null }>(
    `SELECT metadata FROM supervision_sessions WHERE id = $1 LIMIT 1`,
    [sessionId],
  );
  return (result.rows[0]?.metadata?.captureIntegrity as CaptureIntegrityRecord) ?? null;
}

/**
 * Capture integrity for a SCRIBE session id.
 *
 * The Session Room writes integrity onto the supervision session, but review
 * and export address a session by its scribe id. The two are joined through
 * supervision_sessions.metadata->>'scribeSessionId' — the same linkage
 * sessionReviewMode uses. Without this hop the exported transcript silently
 * loses the warning, which is the whole failure this is meant to prevent.
 */
export async function getCaptureIntegrityByScribeSessionId(
  scribeSessionId: string,
): Promise<CaptureIntegrityRecord | null> {
  const result = await query<{ metadata: Record<string, unknown> | null }>(
    `SELECT metadata FROM supervision_sessions
     WHERE metadata->>'scribeSessionId' = $1
     ORDER BY started_at DESC
     LIMIT 1`,
    [scribeSessionId],
  );
  return (result.rows[0]?.metadata?.captureIntegrity as CaptureIntegrityRecord) ?? null;
}

/**
 * Fetch the most recent finalized transcript-segment texts for a session.
 * Used by the pre-persistence phantom-duplicate guard to compare a newly
 * transcribed chunk against the texts produced by recent prior chunks.
 *
 * `speaker` scopes the comparison to one capture lane. Cross-lane comparison
 * would treat genuine overlap as duplication: two people both saying "yeah"
 * or "right" within a few seconds is ordinary conversation, and dropping the
 * second one deletes a real turn.
 */
export async function getRecentTranscriptTexts(
  sessionId: string,
  limit: number = 5,
  speaker?: string,
): Promise<string[]> {
  const result = await query<{ text: string }>(`
    SELECT text FROM supervision_transcript_segments
    WHERE session_id = $1 AND is_final = true
      AND ($3::text IS NULL OR speaker = $3)
    ORDER BY end_ms DESC
    LIMIT $2
  `, [sessionId, Math.min(Math.max(limit, 1), 20), speaker ?? null]);
  return result.rows.map(r => r.text).filter((t): t is string => !!t);
}

export async function getTranscript(
  sessionId: string,
  practitionerId?: string
): Promise<TranscriptSegment[]> {
  // SECURITY: Select all columns including encrypted for decrypt
  const result = await query<TranscriptSegmentRow>(`
    SELECT id, session_id, speaker, speaker_confidence, start_ms, end_ms,
           text, text_enc, text_enc_meta, transcription_confidence, language, is_final, created_at
    FROM supervision_transcript_segments
    WHERE session_id = $1 AND is_final = TRUE
    ORDER BY start_ms ASC
  `, [sessionId]);

  // SECURITY: Decrypt and strip encrypted columns before returning
  return decryptTranscriptSegments(result.rows, {
    table: 'supervision_transcript_segments',
    sessionId,
    practitionerId,
  }) as unknown as TranscriptSegment[];
}

export async function getRecentTranscript(
  sessionId: string,
  lastMs: number,
  practitionerId?: string
): Promise<TranscriptSegment[]> {
  // SECURITY: Select all columns including encrypted for decrypt
  // Note: lastMs is an epoch timestamp (ms) — filter by created_at, not start_ms.
  // start_ms is a recording-relative offset (small integer); comparing it to epoch
  // timestamps would overflow PostgreSQL INTEGER and return wrong results.
  const result = await query<TranscriptSegmentRow>(`
    SELECT id, session_id, speaker, speaker_confidence, start_ms, end_ms,
           text, text_enc, text_enc_meta, transcription_confidence, language, is_final, created_at
    FROM supervision_transcript_segments
    WHERE session_id = $1 AND is_final = TRUE
      AND created_at >= to_timestamp($2::double precision / 1000)
    ORDER BY start_ms ASC
  `, [sessionId, lastMs]);

  // SECURITY: Decrypt and strip encrypted columns before returning
  return decryptTranscriptSegments(result.rows, {
    table: 'supervision_transcript_segments',
    sessionId,
    practitionerId,
  }) as unknown as TranscriptSegment[];
}

/**
 * Get transcript segments with cursor-based pagination for live polling.
 * Uses end_ms as cursor (more monotonic for streaming).
 */
export async function getTranscriptSegments(
  sessionId: string,
  opts?: { afterMs?: number; limit?: number }
): Promise<TranscriptSegment[]> {
  const afterMs = opts?.afterMs ?? -1;
  const limit = Math.min(Math.max(opts?.limit ?? 200, 1), 1000);

  const result = await query<TranscriptSegment>(
    `
    SELECT *
    FROM supervision_transcript_segments
    WHERE session_id = $1
      AND COALESCE(end_ms, start_ms, 0) > $2
    ORDER BY COALESCE(end_ms, start_ms, 0) ASC, created_at ASC
    LIMIT $3
    `,
    [sessionId, afterMs, limit]
  );

  return result.rows;
}

// Insights

export async function addInsight(params: {
  sessionId: string;
  insightType: SupervisionInsight['insight_type'];
  content: string;
  segmentRefs?: string[];
  timeRangeStartMs?: number;
  timeRangeEndMs?: number;
  significance?: number;
  modelUsed?: string;
  processingTimeMs?: number;
}): Promise<SupervisionInsight> {
  const result = await query<SupervisionInsight>(`
    INSERT INTO supervision_insights (
      session_id, insight_type, content, segment_refs,
      time_range_start_ms, time_range_end_ms, significance,
      model_used, processing_time_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    params.sessionId,
    params.insightType,
    params.content,
    params.segmentRefs ? `{${params.segmentRefs.join(',')}}` : null,
    params.timeRangeStartMs ?? null,
    params.timeRangeEndMs ?? null,
    params.significance ?? null,
    params.modelUsed ?? null,
    params.processingTimeMs ?? null
  ]);

  return result.rows[0];
}

export async function getInsights(sessionId: string, type?: SupervisionInsight['insight_type']): Promise<SupervisionInsight[]> {
  if (type) {
    const result = await query<SupervisionInsight>(`
      SELECT * FROM supervision_insights
      WHERE session_id = $1 AND insight_type = $2
      ORDER BY created_at DESC
    `, [sessionId, type]);
    return result.rows;
  }

  const result = await query<SupervisionInsight>(`
    SELECT * FROM supervision_insights
    WHERE session_id = $1
    ORDER BY created_at DESC
  `, [sessionId]);

  return result.rows;
}

/**
 * Get insights since a given timestamp (for SSE streaming).
 * Uses created_at as cursor.
 */
export async function getInsightsSince(
  sessionId: string,
  opts?: { afterTs?: number; limit?: number }
): Promise<SupervisionInsight[]> {
  const afterTs = opts?.afterTs ?? 0;
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);

  // Convert afterTs (epoch ms) to timestamp for comparison
  const afterDate = new Date(afterTs).toISOString();

  const result = await query<SupervisionInsight>(`
    SELECT * FROM supervision_insights
    WHERE session_id = $1
      AND created_at > $2
    ORDER BY created_at ASC
    LIMIT $3
  `, [sessionId, afterDate, limit]);

  return result.rows;
}

// Jobs Queue

export async function enqueueJob(params: {
  sessionId: string;
  jobType: SupervisionJob['job_type'];
  priority?: number;
  inputData?: Record<string, unknown>;
}): Promise<SupervisionJob> {
  const result = await query<SupervisionJob>(`
    INSERT INTO supervision_jobs (
      session_id, job_type, priority, input_data
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
    RETURNING *
  `, [
    params.sessionId,
    params.jobType,
    params.priority ?? 5,
    JSON.stringify(params.inputData || {})
  ]);

  return result.rows[0];
}

export async function claimNextJob(): Promise<SupervisionJob | null> {
  const result = await query<SupervisionJob>(`
    UPDATE supervision_jobs
    SET status = 'processing', started_at = NOW(), locked_at = NOW(), attempts = attempts + 1
    WHERE id = (
      SELECT id FROM supervision_jobs
      WHERE status = 'pending' AND attempts < max_attempts
      ORDER BY priority ASC, created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *
  `, []);

  return result.rows[0] || null;
}

export async function completeJob(jobId: string, outputData?: Record<string, unknown>): Promise<void> {
  await query(`
    UPDATE supervision_jobs
    SET status = 'complete', completed_at = NOW(), output_data = $2
    WHERE id = $1
  `, [jobId, JSON.stringify(outputData || {})]);
}

export async function failJob(jobId: string, error: string): Promise<void> {
  await query(`
    UPDATE supervision_jobs
    SET status = CASE WHEN attempts >= max_attempts THEN 'error' ELSE 'pending' END,
        last_error = $2, locked_at = NULL
    WHERE id = $1
  `, [jobId, error]);
}

export async function getJobsForSession(sessionId: string): Promise<SupervisionJob[]> {
  const result = await query<SupervisionJob>(`
    SELECT * FROM supervision_jobs
    WHERE session_id = $1
    ORDER BY created_at ASC
  `, [sessionId]);

  return result.rows;
}
