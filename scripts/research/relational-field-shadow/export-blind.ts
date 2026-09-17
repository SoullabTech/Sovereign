/**
 * MAIA-RELATIONAL-FIELD-SHADOW-01 — offline paired blind export.
 *
 * READ ONLY. Produces a human witness packet + separate key. It never writes a
 * review, score, preference, memory, standing or routing decision back to MAIA.
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { query } from '../../../lib/db/postgres';

interface Row {
  runId: string;
  turnId: string;
  architectureVersion: string;
  modelName: string;
  deterministicSeed: number;
  primaryStage: string;
  primaryResponseSha256: string;
  shadowResponseText: string;
  renderedDigest: string;
  basisEvidenceIds: string[];
  memberInput: string;
  primaryResponse: string;
  createdAt: string;
}
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const arg = (name: string, fallback: string) => process.argv.find((v) => v.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const limit = Math.max(1, Math.min(200, Number(arg('limit', '40')) || 40));
const packetPath = arg('out', '/tmp/maia-relational-field-shadow-blind.md');
const keyPath = arg('key', '/tmp/maia-relational-field-shadow-blind-key.json');

async function main() {
  const result = await query<Row>(
    `SELECT s.id::text AS "runId",
            s.turn_id::text AS "turnId",
            s.architecture_version AS "architectureVersion",
            s.model_name AS "modelName",
            s.deterministic_seed AS "deterministicSeed",
            s.primary_stage AS "primaryStage",
            s.primary_response_sha256 AS "primaryResponseSha256",
            s.shadow_response_text AS "shadowResponseText",
            s.rendered_digest AS "renderedDigest",
            s.basis_evidence_ids AS "basisEvidenceIds",
            t.user_text AS "memberInput",
            s.primary_response_text AS "primaryResponse",
            s.created_at::text AS "createdAt"
       FROM maia_relational_field_shadow_runs s
       JOIN maia_turns t ON t.id = s.turn_id
      WHERE s.status = 'rendered'
      ORDER BY s.created_at DESC
      LIMIT $1`,
    [limit],
  );

  const packet: string[] = [
    '# MAIA Relational Field Shadow — Blind Paired Witness', '',
    '**Offline human adjudication only. No automatic winner or score.**', '',
  ];
  const key: any[] = [];
  for (const [index, row] of (result.rows ?? []).entries()) {
    if (sha256(row.primaryResponse) !== row.primaryResponseSha256) {
      throw new Error(`primary_digest_mismatch:${row.runId}`);
    }
    const pairId = `P${String(index + 1).padStart(3, '0')}`;
    const shadowFirst = (Number.parseInt(sha256(`${row.runId}|blind`).slice(0, 8), 16) & 1) === 0;
    const a = shadowFirst ? row.shadowResponseText : row.primaryResponse;
    const b = shadowFirst ? row.primaryResponse : row.shadowResponseText;
    packet.push(`## ${pairId}`, '', '**Member turn**', '', `> ${row.memberInput.replace(/\n/g, '\n> ')}`, '', '**A**', '', a, '', '**B**', '', b, '', '---', '');
    key.push({
      pairId,
      runId: row.runId,
      turnId: row.turnId,
      architectureVersion: row.architectureVersion,
      modelName: row.modelName,
      deterministicSeed: row.deterministicSeed,
      primaryStage: row.primaryStage,
      A: shadowFirst ? 'shadow' : 'primary',
      B: shadowFirst ? 'primary' : 'shadow',
      primaryResponseSha256: row.primaryResponseSha256,
      renderedDigest: row.renderedDigest,
      basisEvidenceIds: row.basisEvidenceIds,
      createdAt: row.createdAt,
    });
  }
  writeFileSync(packetPath, `${packet.join('\n')}\n`);
  writeFileSync(keyPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), rows: key }, null, 2)}\n`);
  console.log(JSON.stringify({ packetPath, keyPath, pairs: key.length }, null, 2));
}
main().catch((err) => { console.error(err instanceof Error ? err.message : String(err)); process.exitCode = 1; });
