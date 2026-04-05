/**
 * Agent Monitor — Query helpers for admin UI
 *
 * Read-only queries for the agent monitor page.
 */

import { query } from '@/lib/db/postgres'

export interface AgentRunRow {
  id: string
  agent_name: string
  source_type: string
  source_id: string
  source_title: string | null
  status: string
  attempt_count: number
  max_attempts: number
  retry_count: number
  duration_ms: number | null
  model_used: string | null
  orchestration_mode: string | null
  output_summary: Record<string, unknown>
  flags: string[]
  is_flagged: boolean
  human_review_status: string
  human_review_notes: string | null
  error_text: string | null
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface AgentRunEventRow {
  id: string
  agent_run_id: string
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

export interface AgentRunSummaryCounts {
  total: number
  flagged: number
  failed: number
  pending_review: number
}

export async function getAgentRuns(filters?: {
  agentName?: string
  status?: string
  flaggedOnly?: boolean
  humanReviewStatus?: string
  sourceType?: string
  limit?: number
}): Promise<AgentRunRow[]> {
  const conditions: string[] = []
  const params: unknown[] = []
  let paramIndex = 1

  if (filters?.agentName) {
    conditions.push(`agent_name = $${paramIndex++}`)
    params.push(filters.agentName)
  }
  if (filters?.status) {
    conditions.push(`status = $${paramIndex++}`)
    params.push(filters.status)
  }
  if (filters?.flaggedOnly) {
    conditions.push(`is_flagged = true`)
  }
  if (filters?.humanReviewStatus) {
    conditions.push(`human_review_status = $${paramIndex++}`)
    params.push(filters.humanReviewStatus)
  }
  if (filters?.sourceType) {
    conditions.push(`source_type = $${paramIndex++}`)
    params.push(filters.sourceType)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = filters?.limit ?? 50

  const result = await query(
    `SELECT * FROM agent_runs ${where} ORDER BY created_at DESC LIMIT ${limit}`,
    params
  )

  return result.rows as AgentRunRow[]
}

export async function getAgentRunById(id: string): Promise<AgentRunRow | null> {
  const result = await query(
    `SELECT * FROM agent_runs WHERE id = $1`,
    [id]
  )

  return (result.rows[0] as AgentRunRow) ?? null
}

export async function getAgentRunEvents(agentRunId: string): Promise<AgentRunEventRow[]> {
  const result = await query(
    `SELECT * FROM agent_run_events WHERE agent_run_id = $1 ORDER BY created_at ASC`,
    [agentRunId]
  )

  return result.rows as AgentRunEventRow[]
}

export async function getAgentRunSummaryCounts(): Promise<AgentRunSummaryCounts> {
  const result = await query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE is_flagged = true)::int AS flagged,
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
      COUNT(*) FILTER (WHERE human_review_status = 'pending')::int AS pending_review
    FROM agent_runs
  `)

  const row = result.rows[0] as AgentRunSummaryCounts | undefined
  return row ?? { total: 0, flagged: 0, failed: 0, pending_review: 0 }
}
