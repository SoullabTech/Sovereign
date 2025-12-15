// backend: lib/learning/opusAxiomLoggingService.ts

import { getPool } from '../database/postgres';

type OpusSeverity = 'gold' | 'warning' | 'violation' | 'info';

interface OpusAxiomEval {
  id: string;
  label?: string;
  severity: OpusSeverity;
  ok: boolean;
  notes?: string[];
}

interface OpusAxiomSummary {
  isGold: boolean;
  passed: number;
  warnings: number;
  violations: number;
  ruptureDetected: boolean;
  warningsDetected: boolean;
  evaluations: OpusAxiomEval[];
  notes: string[];
}

interface LogOpusAxiomsParams {
  turnId: number | null;
  sessionId?: string;
  userId?: string | null;
  facet?: string | null;
  element?: string | null;
  opusAxioms: OpusAxiomSummary;
}

export async function logOpusAxiomsForTurn(params: LogOpusAxiomsParams) {
  const {
    turnId,
    sessionId,
    userId,
    facet,
    element,
    opusAxioms,
  } = params;

  try {
    const pool = getPool();

    await pool.query(
      `
      INSERT INTO opus_axiom_turns (
        turn_id,
        session_id,
        user_id,
        facet,
        element,
        is_gold,
        warnings,
        violations,
        rupture_detected,
        axioms
      )
      VALUES (
        $1::bigint,
        $2::text,
        $3::text,
        $4::text,
        $5::text,
        $6::boolean,
        $7::int,
        $8::int,
        $9::boolean,
        $10::jsonb
      )
      `,
      [
        turnId,
        sessionId ?? null,
        userId ?? null,
        facet ?? null,
        element ?? null,
        opusAxioms.isGold,
        opusAxioms.warnings,
        opusAxioms.violations,
        opusAxioms.ruptureDetected,
        JSON.stringify(opusAxioms),
      ]
    );
  } catch (err) {
    console.error('❌ [OpusAxioms] Failed to log turn', {
      error: err,
      turnId,
      sessionId,
      facet,
      element,
    });
  }
}
