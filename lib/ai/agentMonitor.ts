/**
 * Agent Monitor — Logging helpers for bounded agent execution
 *
 * Observability only. No automatic feedback into agent behavior.
 * Every agent run must call logAgentRunStart before and logAgentRunComplete after.
 */

import { query } from '@/lib/db/postgres'

// ── Types ──

export type AgentRunStatus = 'started' | 'completed' | 'partial' | 'failed'
export type HumanReviewStatus = 'pending' | 'approved' | 'revised' | 'rejected'

export type AgentRunFlag =
  | 'retry_used'
  | 'max_attempts_reached'
  | 'schema_invalid'
  | 'zero_passages'
  | 'generic_tone_high'
  | 'high_rejection_rate'
  | 'parse_failure'
  | 'runtime_error'

export interface AgentRunOutputSummary {
  passagesExtracted?: number
  passagesRejected?: number
  draftsSaved?: number
  schemaValid?: boolean
  genericToneScore?: number | null
  bannedPatternHits?: number
  repeatedPhraseHits?: number
}

// ── Logging helpers ──

export async function logAgentRunStart(input: {
  agentName: string
  sourceType: string
  sourceId: string
  sourceTitle?: string
  modelUsed?: string
  orchestrationMode?: string
  maxAttempts?: number
}): Promise<string> {
  const result = await query(
    `INSERT INTO agent_runs (
      agent_name, source_type, source_id, source_title,
      status, attempt_count, max_attempts,
      model_used, orchestration_mode
    )
    VALUES ($1, $2, $3, $4, 'started', 1, $5, $6, $7)
    RETURNING id`,
    [
      input.agentName,
      input.sourceType,
      input.sourceId,
      input.sourceTitle ?? null,
      input.maxAttempts ?? 1,
      input.modelUsed ?? null,
      input.orchestrationMode ?? null,
    ]
  )

  return result.rows[0]?.id as string
}

export async function logAgentRunEvent(input: {
  agentRunId: string
  eventType: string
  payload?: Record<string, unknown>
}): Promise<void> {
  await query(
    `INSERT INTO agent_run_events (agent_run_id, event_type, payload)
     VALUES ($1, $2, $3::jsonb)`,
    [
      input.agentRunId,
      input.eventType,
      JSON.stringify(input.payload ?? {}),
    ]
  )
}

export async function logAgentRunComplete(input: {
  agentRunId: string
  status: AgentRunStatus
  attemptCount: number
  retryCount: number
  durationMs: number
  outputSummary?: AgentRunOutputSummary
  flags?: AgentRunFlag[]
  errorText?: string | null
}): Promise<void> {
  const isFlagged = (input.flags?.length ?? 0) > 0

  await query(
    `UPDATE agent_runs
     SET
       status = $2,
       attempt_count = $3,
       retry_count = $4,
       duration_ms = $5,
       output_summary = $6::jsonb,
       flags = $7::jsonb,
       is_flagged = $8,
       error_text = $9,
       completed_at = NOW(),
       updated_at = NOW()
     WHERE id = $1`,
    [
      input.agentRunId,
      input.status,
      input.attemptCount,
      input.retryCount,
      input.durationMs,
      JSON.stringify(input.outputSummary ?? {}),
      JSON.stringify(input.flags ?? []),
      isFlagged,
      input.errorText ?? null,
    ]
  )
}

export async function updateAgentRunHumanReview(input: {
  agentRunId: string
  humanReviewStatus: HumanReviewStatus
  humanReviewNotes?: string
}): Promise<void> {
  await query(
    `UPDATE agent_runs
     SET
       human_review_status = $2,
       human_review_notes = $3,
       updated_at = NOW()
     WHERE id = $1`,
    [
      input.agentRunId,
      input.humanReviewStatus,
      input.humanReviewNotes ?? null,
    ]
  )
}

// ── Deterministic flagging ──

export function computeAgentFlags(input: {
  attemptCount: number
  maxAttempts: number
  schemaValid: boolean
  passagesExtracted: number
  passagesRejected: number
  genericToneScore?: number | null
  parseFailure?: boolean
  runtimeError?: boolean
}): AgentRunFlag[] {
  const flags: AgentRunFlag[] = []

  if (input.attemptCount > 1) flags.push('retry_used')
  if (input.attemptCount >= input.maxAttempts && input.attemptCount > 1) {
    flags.push('max_attempts_reached')
  }
  if (!input.schemaValid) flags.push('schema_invalid')
  if (input.passagesExtracted === 0) flags.push('zero_passages')
  if ((input.genericToneScore ?? 0) >= 4) flags.push('generic_tone_high')
  if (
    input.passagesExtracted > 0 &&
    input.passagesRejected / input.passagesExtracted > 0.5
  ) {
    flags.push('high_rejection_rate')
  }
  if (input.parseFailure) flags.push('parse_failure')
  if (input.runtimeError) flags.push('runtime_error')

  return flags
}
