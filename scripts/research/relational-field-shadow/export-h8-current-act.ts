/**
 * H8 — Production Shadow Projection offline exporter.
 *
 * READ ONLY. Reconstructs the deterministic current-act projection for founder
 * adjudication. It never writes review, score, preference, memory, standing,
 * prompt, routing or promotion data back to MAIA.
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { query } from '../../../lib/db/postgres';
import {
  H8_CURRENT_ACT_ARCHITECTURE_VERSION,
  H8_CURRENT_ACT_MODEL_NAME,
} from '../../../lib/maia/relational-field-shadow/currentActProjection';
import type {
  CurrentActProjection,
  EvidenceManifestItem,
} from '../../../lib/maia/relational-field-shadow/types';

interface Row {
  runId: string;
  turnId: string;
  primaryResponseSha256: string;
  primaryResponse: string;
  memberInput: string;
  evidenceManifest: EvidenceManifestItem[];
  rawPlan: CurrentActProjection;
  createdAt: string;
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const arg = (name: string, fallback: string) =>
  process.argv.find((v) => v.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const limit = Math.max(1, Math.min(200, Number(arg('limit', '40')) || 40));
const outPath = arg('out', '/tmp/maia-h8-current-act-shadow.md');
const jsonPath = arg('json', '/tmp/maia-h8-current-act-shadow.json');

async function sourceTextByRowId(ids: readonly string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const result = await query<{ id: string; content: string }>(
    `SELECT id::text AS id, content
       FROM conversation_turns
      WHERE id::text = ANY($1::text[])`,
    [[...ids]],
  );
  return new Map((result.rows ?? []).map((row) => [row.id, row.content]));
}

async function main() {
  const result = await query<Row>(
    `SELECT s.id::text AS "runId",
            s.turn_id::text AS "turnId",
            s.primary_response_sha256 AS "primaryResponseSha256",
            s.primary_response_text AS "primaryResponse",
            s.evidence_manifest AS "evidenceManifest",
            s.raw_plan AS "rawPlan",
            t.user_text AS "memberInput",
            s.created_at::text AS "createdAt"
       FROM maia_relational_field_shadow_runs s
       JOIN maia_turns t ON t.id = s.turn_id
      WHERE s.status = 'rendered'
        AND s.architecture_version = $1
        AND s.model_name = $2
      ORDER BY s.created_at DESC
      LIMIT $3`,
    [H8_CURRENT_ACT_ARCHITECTURE_VERSION, H8_CURRENT_ACT_MODEL_NAME, limit],
  );

  const markdown: string[] = [
    '# H8 Production Shadow Projection — Founder Witness', '',
    '**Read-only offline adjudication. No runtime authority.**', '',
  ];
  const records: any[] = [];

  for (const [index, row] of (result.rows ?? []).entries()) {
    if (sha256(row.primaryResponse) !== row.primaryResponseSha256) {
      throw new Error(`primary_digest_mismatch:${row.runId}`);
    }

    const sourceIds = row.evidenceManifest
      .filter((item) => item.sourceKind === 'conversation_turn' && item.sourceRowId)
      .map((item) => item.sourceRowId!) as string[];
    const sourceText = await sourceTextByRowId(sourceIds);
    const textByEvidenceId = new Map<string, string>();
    for (const item of row.evidenceManifest) {
      if (item.current) textByEvidenceId.set(item.evidenceId, row.memberInput);
      else if (item.sourceRowId) textByEvidenceId.set(item.evidenceId, sourceText.get(item.sourceRowId) ?? '[source unavailable]');
    }

    const witnessId = `H8-${String(index + 1).padStart(3, '0')}`;
    markdown.push(`## ${witnessId}`, '', '**Current member act**', '', `> ${row.memberInput.replace(/\n/g, '\n> ')}`, '');
    markdown.push(`**Projection status:** \`${row.rawPlan.projectionStatus}\``, '');
    markdown.push(`**Direct anchor:** \`${row.rawPlan.anchorEvidenceId ?? 'none'}\``, '');
    markdown.push('**Selected relational field**', '');
    for (const evidenceId of row.rawPlan.selectedEvidenceIds) {
      const candidate = row.rawPlan.candidates.find((item) => item.evidenceId === evidenceId);
      markdown.push(
        `- **${evidenceId}** — ${candidate?.currentActRelation ?? 'UNKNOWN'} / ${candidate?.materialityClass ?? 'UNKNOWN'}`,
        `  - ${textByEvidenceId.get(evidenceId) ?? '[source unavailable]'}`,
      );
    }
    markdown.push('', '**Canonical MAIA response (comparison only)**', '', row.primaryResponse, '', '---', '');

    records.push({
      witnessId,
      runId: row.runId,
      turnId: row.turnId,
      createdAt: row.createdAt,
      projection: row.rawPlan,
      evidence: Object.fromEntries(textByEvidenceId),
      primaryResponseSha256: row.primaryResponseSha256,
    });
  }

  writeFileSync(outPath, `${markdown.join('\n')}\n`);
  writeFileSync(jsonPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)}\n`);
  console.log(JSON.stringify({ outPath, jsonPath, rows: records.length }, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
