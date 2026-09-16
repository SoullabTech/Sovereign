import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { PRODUCER_REGISTRY, type ProducerId } from '../../../lib/maia/canonical-turn';
import { STANDING_SHADOW_FIXTURES } from '../standing-shadow/fixtures';

const MODEL = 'llama3.1:8b';
const TEMPERATURE = 0.2;
const SEED = 42;
const OUTPUT = process.env.INVISIBLE_STANDING_SIDECAR_OUT || '/tmp/invisible-standing-sidecar.json';
const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

interface EvidenceRow {
  readonly id: string;
  readonly source: string;
  readonly text: string;
  readonly authoredBy: string;
  readonly standingHint: 'present_member_utterance' | 'source_only';
}

interface CaseInput {
  readonly caseId: string;
  readonly fixtureId: string;
  readonly response: string;
  readonly evidence: readonly EvidenceRow[];
}

function loadCases(): CaseInput[] {
  const blind = JSON.parse(readFileSync('docs/programme/evidence/STANDING_SHADOW_S5_BLIND_REVIEW_2026-09-16.json', 'utf8'));
  const key = JSON.parse(readFileSync('docs/programme/evidence/STANDING_SHADOW_S5_CONDITION_KEY_REVEALED_2026-09-16.json', 'utf8'));
  return blind.cases.map((c: any) => {
    const keyed = key.cases.find((k: any) => k.caseId === c.caseId);
    const condition = new Map(keyed.candidates.map((x: any) => [x.id, x.condition]));
    const current = c.candidates.find((candidate: any) => condition.get(candidate.id) === 'current');
    const fixture = STANDING_SHADOW_FIXTURES.find((f) => f.id === keyed.fixtureId)!;
    const evidence: EvidenceRow[] = [{
      id: `U:${fixture.id}`,
      source: 'current encounter input',
      text: fixture.userInput,
      authoredBy: 'member',
      standingHint: 'present_member_utterance',
    }];
    fixture.candidates.forEach((candidate, index) => {
      const spec = PRODUCER_REGISTRY[candidate.producerId as ProducerId];
      evidence.push({
        id: `C${index + 1}:${candidate.producerId}`,
        source: candidate.producerId,
        text: candidate.text,
        authoredBy: spec.authoredBy,
        standingHint: 'source_only',
      });
    });
    return { caseId: c.caseId, fixtureId: fixture.id, response: current.text, evidence };
  });
}

function schema(ids: readonly string[]): Record<string, unknown> {
  return {
    type: 'object', additionalProperties: false, required: ['claims'],
    properties: {
      claims: {
        type: 'array', maxItems: 6,
        items: {
          type: 'object', additionalProperties: false,
          required: ['span', 'kind', 'candidateEvidenceIds'],
          properties: {
            span: { type: 'string' },
            kind: { type: 'string', enum: ['witness', 'synthesis', 'member_attribution', 'question'] },
            candidateEvidenceIds: { type: 'array', maxItems: 5, items: { type: 'string', enum: ids } },
          },
        },
      },
    },
  };
}

async function ollama(system: string, prompt: string, format: Record<string, unknown>): Promise<string> {
  const res = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, system, prompt, stream: false, format,
      options: { temperature: TEMPERATURE, seed: SEED, num_predict: 700, num_ctx: 8192 },
    }),
  });
  if (!res.ok) throw new Error(`ollama HTTP ${res.status}: ${await res.text()}`);
  const body = await res.json() as any;
  return String(body.response ?? '').trim();
}

async function main(): Promise<void> {
  const cases = loadCases();
  const rows: any[] = [];
  for (const c of cases) {
    const ids = c.evidence.map((e) => e.id);
    const system = `You are an observation-only provenance sidecar. You have ZERO authority to decide truth, standing, adoption, correction, or whether a response may be emitted. Do not rewrite the response. Identify up to six exact substrings of the assistant response that function as witness, synthesis, member attribution, or question. For each exact substring, nominate evidence ids that appear relevant. candidateEvidenceIds are hypotheses only.`;
    const prompt = `ASSISTANT RESPONSE (do not edit):\n${c.response}\n\nEVIDENCE LEDGER:\n${c.evidence.map((e) => `${e.id} | authoredBy=${e.authoredBy} | ${e.standingHint}\n${e.text}`).join('\n\n')}`;
    const raw = await ollama(system, prompt, schema(ids));
    const parsed = JSON.parse(raw) as { claims: Array<{ span: string; kind: string; candidateEvidenceIds: string[] }> };
    const exactSpans = parsed.claims.every((claim) => claim.span.length > 0 && c.response.includes(claim.span));
    const knownIds = parsed.claims.every((claim) => claim.candidateEvidenceIds.every((id) => ids.includes(id)));
    const currentInputId = `U:${c.fixtureId}`;
    const usesCurrentInput = parsed.claims.some((claim) => claim.candidateEvidenceIds.includes(currentInputId));
    rows.push({
      caseId: c.caseId,
      fixtureId: c.fixtureId,
      responseDigestBefore: sha256(c.response),
      responseDigestAfter: sha256(c.response),
      responseUnchanged: true,
      exactSpans,
      knownIds,
      usesCurrentInput,
      claims: parsed.claims,
    });
    console.log(`${c.caseId}: claims=${parsed.claims.length} exact=${exactSpans} currentInput=${usesCurrentInput}`);
  }
  const result = {
    programme: 'JARVIS-MAIA-INVISIBLE-STANDING-01',
    act: 'I3 observation-only support sidecar discovery',
    authority: 'NONE — candidate evidence links only',
    model: MODEL, temperature: TEMPERATURE, seed: SEED,
    cases: rows.length,
    exactSpanCases: rows.filter((r) => r.exactSpans).length,
    knownIdCases: rows.filter((r) => r.knownIds).length,
    currentInputCases: rows.filter((r) => r.usesCurrentInput).length,
    unchangedCases: rows.filter((r) => r.responseUnchanged && r.responseDigestBefore === r.responseDigestAfter).length,
    rows,
  };
  writeFileSync(OUTPUT, JSON.stringify(result, null, 2), { mode: 0o600 });
  console.log(JSON.stringify({ output: OUTPUT, cases: result.cases, exactSpanCases: result.exactSpanCases, knownIdCases: result.knownIdCases, currentInputCases: result.currentInputCases, unchangedCases: result.unchangedCases }, null, 2));
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 1; });
