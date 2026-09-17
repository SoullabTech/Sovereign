import { query } from '@/lib/db/postgres';
import type { ShadowEvidenceRow } from './types';

/**
 * Research-evidence sink only. This module deliberately has no read path into
 * MAIA cognition, routing, memory, standing or model selection.
 */
export async function persistRelationalFieldShadowEvidence(row: ShadowEvidenceRow): Promise<void> {
  await query(
    `INSERT INTO maia_relational_field_shadow_runs (
       turn_id, exchange_id, architecture_version, model_name, deterministic_seed,
       status, processing_profile, origin_route, primary_stage, primary_response_sha256, primary_response_text,
       current_evidence_id, evidence_manifest, packet_digest, prompt_sha256, basis_evidence_ids, raw_plan,
       raw_plan_sha256, shadow_response_text, rendered_digest, refusal_code,
       error_code, generation_ms, total_ms
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16::text[],$17::jsonb,
       $18,$19,$20,$21,$22,$23,$24
     )
     ON CONFLICT (turn_id, model_name, architecture_version) DO NOTHING`,
    [
      row.turnId, row.exchangeId, row.architectureVersion, row.modelName,
      row.deterministicSeed, row.status, row.processingProfile, row.originRoute ?? null,
      row.primaryStage, row.primaryResponseSha256, row.primaryResponseText, row.currentEvidenceId,
      JSON.stringify(row.evidenceManifest), row.packetDigest, row.promptSha256 ?? null,
      [...row.basisEvidenceIds], row.rawPlan ? JSON.stringify(row.rawPlan) : null,
      row.rawPlanSha256 ?? null, row.shadowResponseText ?? null, row.renderedDigest ?? null,
      row.refusalCode ?? null, row.errorCode ?? null, row.generationMs ?? null, row.totalMs,
    ],
  );
}
