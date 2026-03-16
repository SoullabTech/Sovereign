/**
 * AIN Shape Telemetry
 *
 * Logs structural evaluation of MAIA responses (mirror/bridge/permission/nextStep).
 * Stores STRUCTURE ONLY - never raw user input or assistant text.
 *
 * Enable in prod via: AIN_SHAPE_TELEMETRY=1
 */

import { query } from './postgres';
import type { ConversationFlowTelemetry } from '@/lib/consciousness/flowTelemetry';

export type AINShapeTelemetryRow = {
  pass: boolean;
  score: number;
  flags: {
    mirror: boolean;
    bridge: boolean;
    permission: boolean;
    nextStep: boolean;
    menuMode: boolean;
  };
  menuSignals?: Record<string, boolean | number> | null;
  route?: string;
  processingProfile?: string;
  model?: string;
  explorerId?: string;
  sessionId?: string;
  // Optional flow telemetry — populated when oracle route runs state resolver
  flowTelemetry?: ConversationFlowTelemetry | null;
};

export async function logAINShapeTelemetry(row: AINShapeTelemetryRow): Promise<void> {
  const {
    pass,
    score,
    flags,
    menuSignals,
    route = 'maiaService',
    processingProfile,
    model,
    explorerId,
    sessionId,
    flowTelemetry,
  } = row;

  // Guard: require valid sessionId to prevent orphan rows
  const normalizedSessionId = (sessionId ?? '').trim();
  if (!normalizedSessionId) {
    console.warn('[AINShapeTelemetry] Skipping write: no sessionId', {
      route,
      processingProfile,
      explorerId,
    });
    return;
  }

  const ft = flowTelemetry ?? null;

  await query(
    `
    INSERT INTO ain_shape_telemetry
      (pass, score, mirror, bridge, permission, next_step, menu_mode, menu_signals,
       route, processing_profile, model, explorer_id, session_id,
       flow_outcome, flow_confidence, flow_reason,
       state_resolver_fired, resolver_rule, resolver_confidence,
       clarification_blocked, model_asked_clarification, clarification_was_needed, repair_signal)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
       $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    `,
    [
      pass,
      score,
      flags.mirror,
      flags.bridge,
      flags.permission,
      flags.nextStep,
      flags.menuMode,
      menuSignals ? JSON.stringify(menuSignals) : null,
      route,
      processingProfile ?? null,
      model ?? null,
      explorerId ?? null,
      normalizedSessionId,
      // Flow telemetry (nullable — populated from oracle route only)
      ft?.flowOutcome ?? null,
      ft?.flowConfidence ?? null,
      ft?.flowReason ?? null,
      ft?.stateResolverFired ?? null,
      ft?.resolverRule ?? null,
      ft?.resolverConfidence ?? null,
      ft?.clarificationBlocked ?? null,
      ft?.modelAskedClarification ?? null,
      ft?.clarificationWasNeeded ?? null,
      ft?.repairSignal ?? null,
    ]
  );
}
