/**
 * AIN Shape Telemetry
 *
 * Logs structural evaluation of MAIA responses (mirror/bridge/permission/nextStep).
 * Stores STRUCTURE ONLY - never raw user input or assistant text.
 *
 * Enable in prod via: AIN_SHAPE_TELEMETRY=1
 */

import { query } from './postgres';

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
  route?: string;
  processingProfile?: string;
  model?: string;
  explorerId?: string;
  sessionId?: string;
};

export async function logAINShapeTelemetry(row: AINShapeTelemetryRow): Promise<void> {
  const {
    pass,
    score,
    flags,
    route = 'maiaService',
    processingProfile,
    model,
    explorerId,
    sessionId
  } = row;

  await query(
    `
    INSERT INTO ain_shape_telemetry
      (pass, score, mirror, bridge, permission, next_step, menu_mode, route, processing_profile, model, explorer_id, session_id)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
    [
      pass,
      score,
      flags.mirror,
      flags.bridge,
      flags.permission,
      flags.nextStep,
      flags.menuMode,
      route,
      processingProfile ?? null,
      model ?? null,
      explorerId ?? null,
      sessionId ?? null
    ]
  );
}
