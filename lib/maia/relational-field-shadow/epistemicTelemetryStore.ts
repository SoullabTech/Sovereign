import { query } from '@/lib/db/postgres';
import type { EpistemicJoinShadowTelemetry } from '../../ain/epistemic-join/shadow/relationalField';

export interface EpistemicShadowTelemetryRecord {
  readonly turnId: number;
  readonly modelName: string;
  readonly architectureVersion: string;
  readonly telemetry: EpistemicJoinShadowTelemetry;
}

/**
 * I4 structural telemetry only. This sink has no read path and no semantic
 * payload fields. It is called only after the ordinary shadow evidence row
 * has already been stored.
 */
export async function persistEpistemicJoinShadowTelemetry(
  record: EpistemicShadowTelemetryRecord,
): Promise<void> {
  const t = record.telemetry;
  await query(
    `INSERT INTO maia_epistemic_join_integration_shadow_runs (
       turn_id, model_name, architecture_version, status,
       proposal_count, evaluated_count, admitted_standing_counts,
       refusal_code_counts, representation_closed, error_count
     ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)
     ON CONFLICT (turn_id, model_name, architecture_version) DO NOTHING`,
    [
      record.turnId,
      record.modelName,
      record.architectureVersion,
      t.status,
      t.proposalCount,
      t.evaluatedCount,
      JSON.stringify(t.admittedStandingCounts),
      JSON.stringify(t.refusalCodeCounts),
      t.representationClosed,
      t.errorCount,
    ],
  );
}
