/**
 * COMMS SPINE: Safety Service
 *
 * Safety flag management - detection, notification, acknowledgment.
 * MAIA advises, never autopilots.
 *
 * @module lib/comms/SafetyService
 */

import { query, queryOne } from '../db/postgres';
import { emitSafetyFlagged, emitSafetyAcknowledged } from './events';
import type {
  CommsSafetyFlag,
  CommsSafetySeverity,
  CommsSafetyDetector,
  SafetyFlagItem,
  SafetyDashboardResponse,
  AcknowledgeSafetyInput,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all unacknowledged safety flags for a practitioner.
 */
export async function getSafetyDashboard(
  practitionerId: string
): Promise<SafetyDashboardResponse> {
  // Get flags with context
  const flagsResult = await query<SafetyFlagItem>(
    `SELECT
      sf.id,
      sf.thread_id,
      sf.message_id,
      sf.severity,
      sf.detected_by,
      sf.detected_cues,
      sf.recommended_action,
      sf.notification_status,
      sf.acknowledged_at,
      sf.created_at,
      pc.name as client_name,
      LEFT(m.body, 200) as message_preview
    FROM comms_safety_flags sf
    JOIN comms_threads t ON t.id = sf.thread_id
    JOIN comms_messages m ON m.id = sf.message_id
    LEFT JOIN practitioner_clients pc ON pc.id = t.client_id
    WHERE t.practitioner_id = $1
      AND sf.acknowledged_at IS NULL
    ORDER BY
      CASE sf.severity
        WHEN 'crisis' THEN 0
        WHEN 'red' THEN 1
        WHEN 'yellow' THEN 2
      END,
      sf.created_at DESC`,
    [practitionerId]
  );

  // Get counts
  const countsResult = await queryOne<{
    total: number;
    crisis: number;
    red: number;
    yellow: number;
    unacknowledged: number;
  }>(
    `SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE sf.severity = 'crisis')::int as crisis,
      COUNT(*) FILTER (WHERE sf.severity = 'red')::int as red,
      COUNT(*) FILTER (WHERE sf.severity = 'yellow')::int as yellow,
      COUNT(*) FILTER (WHERE sf.acknowledged_at IS NULL)::int as unacknowledged
    FROM comms_safety_flags sf
    JOIN comms_threads t ON t.id = sf.thread_id
    WHERE t.practitioner_id = $1`,
    [practitionerId]
  );

  return {
    flags: flagsResult.rows,
    counts: countsResult || {
      total: 0,
      crisis: 0,
      red: 0,
      yellow: 0,
      unacknowledged: 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACKNOWLEDGMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Acknowledge a safety flag.
 */
export async function acknowledgeSafetyFlag(
  practitionerId: string,
  flagId: string,
  input: AcknowledgeSafetyInput = {}
): Promise<CommsSafetyFlag> {
  // Verify flag belongs to practitioner's thread
  const flag = await queryOne<CommsSafetyFlag & { thread_practitioner_id: string }>(
    `SELECT sf.*, t.practitioner_id as thread_practitioner_id
     FROM comms_safety_flags sf
     JOIN comms_threads t ON t.id = sf.thread_id
     WHERE sf.id = $1`,
    [flagId]
  );

  if (!flag) {
    throw new Error('Safety flag not found');
  }

  if (flag.thread_practitioner_id !== practitionerId) {
    throw new Error('Unauthorized');
  }

  if (flag.acknowledged_at) {
    throw new Error('Safety flag already acknowledged');
  }

  // Update flag
  const updated = await queryOne<CommsSafetyFlag>(
    `UPDATE comms_safety_flags
     SET acknowledged_at = NOW(),
         acknowledged_by = $2,
         review_note = $3
     WHERE id = $1
     RETURNING *`,
    [flagId, practitionerId, input.review_note || null]
  );

  if (!updated) {
    throw new Error('Failed to acknowledge safety flag');
  }

  // Emit event
  await emitSafetyAcknowledged(
    flagId,
    flag.thread_id,
    practitionerId,
    { review_note: input.review_note }
  );

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY FLAG CREATION (called by MAIA hook or client-reported)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateSafetyFlagInput {
  message_id: string;
  thread_id: string;
  severity: CommsSafetySeverity;
  detected_by: CommsSafetyDetector;
  detection_confidence?: number;
  detected_cues?: string[];
  recommended_action?: string;
  maia_rationale?: string;
}

/**
 * Create a safety flag for a message.
 * Idempotent - won't create duplicate if flag already exists for message.
 */
export async function createSafetyFlag(
  input: CreateSafetyFlagInput
): Promise<{ flag: CommsSafetyFlag; is_new: boolean }> {
  // Check for existing flag (idempotency)
  const existing = await queryOne<CommsSafetyFlag>(
    `SELECT * FROM comms_safety_flags WHERE message_id = $1`,
    [input.message_id]
  );

  if (existing) {
    return { flag: existing, is_new: false };
  }

  // Create new flag
  const flag = await queryOne<CommsSafetyFlag>(
    `INSERT INTO comms_safety_flags (
      message_id,
      thread_id,
      severity,
      detected_by,
      detection_confidence,
      detected_cues,
      recommended_action,
      maia_rationale
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      input.message_id,
      input.thread_id,
      input.severity,
      input.detected_by,
      input.detection_confidence || null,
      input.detected_cues ? JSON.stringify(input.detected_cues) : null,
      input.recommended_action || null,
      input.maia_rationale || null,
    ]
  );

  if (!flag) {
    throw new Error('Failed to create safety flag');
  }

  // Emit event
  await emitSafetyFlagged(
    input.thread_id,
    input.message_id,
    {
      severity: input.severity,
      detected_by: input.detected_by,
      confidence: input.detection_confidence,
      cues: input.detected_cues || [],
    }
  );

  return { flag, is_new: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// ESCALATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escalate a safety flag to another practitioner.
 */
export async function escalateSafetyFlag(
  practitionerId: string,
  flagId: string,
  escalateTo: string,
  note: string
): Promise<CommsSafetyFlag> {
  // Verify ownership
  const flag = await queryOne<CommsSafetyFlag & { thread_practitioner_id: string }>(
    `SELECT sf.*, t.practitioner_id as thread_practitioner_id
     FROM comms_safety_flags sf
     JOIN comms_threads t ON t.id = sf.thread_id
     WHERE sf.id = $1`,
    [flagId]
  );

  if (!flag || flag.thread_practitioner_id !== practitionerId) {
    throw new Error('Safety flag not found or unauthorized');
  }

  // Update with escalation
  const updated = await queryOne<CommsSafetyFlag>(
    `UPDATE comms_safety_flags
     SET escalated = TRUE,
         escalated_at = NOW(),
         escalated_to = $2,
         escalation_note = $3
     WHERE id = $1
     RETURNING *`,
    [flagId, escalateTo, note]
  );

  if (!updated) {
    throw new Error('Failed to escalate safety flag');
  }

  // TODO: Send notification to escalated practitioner

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY ANALYSIS (MAIA hook helper)
// ─────────────────────────────────────────────────────────────────────────────

/** High-risk patterns for crisis detection */
const CRISIS_PATTERNS = [
  /\b(kill|end|suicide|die|death)\s+myself\b/i,
  /\bcan'?t\s+(go\s+on|take\s+it|continue)\b/i,
  /\bno\s+point\s+(living|going\s+on)\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bend\s+(it|everything)\b/i,
];

/** Moderate risk patterns */
const RED_PATTERNS = [
  /\b(worthless|hopeless|trapped|empty|numb)\b/i,
  /\bno\s+one\s+cares\b/i,
  /\beverything\s+is\s+falling\s+apart\b/i,
  /\bcan'?t\s+see\s+a\s+way\s+out\b/i,
  /\bgiving\s+up\b/i,
  /\bdisappear(ing)?\b/i,
];

/** Lower concern patterns */
const YELLOW_PATTERNS = [
  /\b(overwhelmed|anxious|scared|worried)\b/i,
  /\bfeeling\s+(lost|alone|isolated)\b/i,
  /\bstruggling\b/i,
  /\b(can'?t|hard\s+to)\s+(cope|handle|deal)\b/i,
];

/**
 * Analyze message for safety cues.
 * Returns detected severity and cues.
 */
export function analyzeSafetyCues(body: string): {
  severity: CommsSafetySeverity | null;
  cues: string[];
  confidence: number;
} {
  const cues: string[] = [];
  let maxSeverity: CommsSafetySeverity | null = null;

  // Check crisis patterns
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(body)) {
      cues.push('explicit_ideation');
      maxSeverity = 'crisis';
      break;
    }
  }

  // Check red patterns
  if (!maxSeverity) {
    for (const pattern of RED_PATTERNS) {
      if (pattern.test(body)) {
        cues.push('passive_ideation');
        maxSeverity = 'red';
        break;
      }
    }
  }

  // Check yellow patterns
  if (!maxSeverity) {
    for (const pattern of YELLOW_PATTERNS) {
      if (pattern.test(body)) {
        cues.push('distress_markers');
        maxSeverity = 'yellow';
        break;
      }
    }
  }

  // Calculate confidence based on pattern match strength
  const confidence = maxSeverity === 'crisis' ? 0.9 : maxSeverity === 'red' ? 0.7 : 0.5;

  return {
    severity: maxSeverity,
    cues,
    confidence: maxSeverity ? confidence : 0,
  };
}
