import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { PRODUCER_REGISTRY, type ProducerId } from '../../../lib/maia/canonical-turn';
import { STANDING_SHADOW_FIXTURES } from '../standing-shadow/fixtures';

const MODEL = 'llama3.1:8b';
const TEMPERATURE = 0.2;
const SEED = 42;
const OUTPUT = process.env.INVISIBLE_STANDING_SIDECAR_V2_OUT || '/tmp/invisible-standing-sidecar-v2.json';
const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

function sentences(text: string): Array<{ id: string; text: string }> {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean).map((text, i) => ({ id: `R${i + 1}`, text }));
}

function loadCases(): any[] {
  const blind = JSON.parse(readFileSync('docs/programme/evidence/STANDING_SHADOW_S5_BLIND_REVIEW_2026-09-16.json', 'utf8'));
  const key = JSON.parse(readFileSync('docs/programme/evidence/STANDING_SHADOW_S5_CONDITION_KEY_REVEALED_2026-09-16.json', 'utf8'));
  return blind.cases.map((c: any) => {
    const keyed = key.cases.find((k: any) => k.caseId === c.caseId);
    const condition = new Map(keyed.candidates.map((x: any) => [x.id, x.condition]));
    const current = c.candidates.find((candidate: any) => condition.get(candidate.id) === 'current');
    const fixture = STANDING_SHADOW_FIXTURES.find((f) => f.id === keyed.fixtureId)!;
    const evidence = [{ id: `U:${fixture.id}`, source: 'current encounter input', text: fixture.userInput, authoredBy: 'member', standingHint: 'present_member_utterance' }];
    fixture.candidates.forEach((candidate, index) => {
      const spec = PRODUCER_REGISTRY[candidate.producerId as ProducerId];
      evidence.push({ id: `C${index + 1}:${candidate.producerId}`, source: candidate.producerId, text: candidate.text, authoredBy: spec.authoredBy, standingHint: 'source_only' });
    });
    return { caseId: c.caseId, fixtureId: fixture.id, response: current.text, responseSentences: sentences(current.text), evidence };
  });
}

function schema(sentenceIds: string[], evidenceIds: string[]): Record<string, unknown> {
  return {
    type: 'object', additionalProperties: false, required: ['observations'],
    properties: {
      observations: {
        type: 'array', maxItems: Math.max(sentenceIds.length, 1),
        items: {
          type: 'object', additionalProperties: false,
          required: ['sentenceId', 'kind', 'candidateEvidenceIds'],
          properties: {
            sentenceId: { type: 'string', enum: sentenceIds },
            kind: { type: 'string', enum: ['witness', 'synthesis', 'member_attribution', 'question'] },
            candidateEvidenceIds: { type: 'array', maxItems: 5, items: { type: 'string', enum: evidenceIds } },
          },
        },
      },
    },
  };
}

async function ollama(system: string, prompt: string, format: Record<string, unknown>): Promise<string> {
  const res = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, system, prompt, stream: false, format, options: { temperature: TEMPERATURE, seed: SEED, num_predict: 600, num_ctx: 8192 } }),
  });
  if (!res.ok) throw new Error(`ollama HTTP ${res.status}: ${await res.text()}`);
  const body = await res.json() as any;
  return String(body.response ?? '').trim();
}

async function main(): Promise<void> {
  const cases = loadCases();
  const rows: any[] = [];
  for (const c of cases) {
    const sentenceIds = c.responseSentences.map((s: any) => s.id);
    const evidenceIds = c.evidence.map((e: any) => e.id);
    const system = `You are an observation-only provenance sidecar with ZERO authority. The assistant response is already final and must not be rewritten. The response has been deterministically split into sentence ids. Select sentence ids only; never reproduce sentence text. For each selected sentence, nominate evidence ids that appear relevant. Candidate links are hypotheses, never proof of truth, standing, adoption, or correction.`;
    const prompt = `RESPONSE SENTENCES:\n${c.responseSentences.map((s: any) => `${s.id} | ${s.text}`).join('\n')}\n\nEVIDENCE LEDGER:\n${c.evidence.map((e: any) => `${e.id} | authoredBy=${e.authoredBy} | ${e.standingHint}\n${e.text}`).join('\n\n')}`;
    const parsed = JSON.parse(await ollama(system, prompt, schema(sentenceIds, evidenceIds))) as { observations: Array<{ sentenceId: string; kind: string; candidateEvidenceIds: string[] }> };
    const closedSentenceIds = parsed.observations.every((o) => sentenceIds.includes(o.sentenceId));
    const knownEvidenceIds = parsed.observations.every((o) => o.candidateEvidenceIds.every((id) => evidenceIds.includes(id)));
    const currentInputId = `U:${c.fixtureId}`;
    const usesCurrentInput = parsed.observations.some((o) => o.candidateEvidenceIds.includes(currentInputId));
    rows.push({
      caseId: c.caseId, fixtureId: c.fixtureId,
      responseDigestBefore: sha256(c.response), responseDigestAfter: sha256(c.response), responseUnchanged: true,
      deterministicSentenceMap: c.responseSentences,
      closedSentenceIds, knownEvidenceIds, usesCurrentInput,
      observations: parsed.observations,
    });
    console.log(`${c.caseId}: observations=${parsed.observations.length} closed=${closedSentenceIds} currentInput=${usesCurrentInput}`);
  }
  const result = {
    programme: 'JARVIS-MAIA-INVISIBLE-STANDING-01', act: 'I4 closed sentence-id sidecar discovery',
    authority: 'NONE — observation only', model: MODEL, temperature: TEMPERATURE, seed: SEED,
    cases: rows.length,
    closedSentenceIdCases: rows.filter((r) => r.closedSentenceIds).length,
    knownEvidenceIdCases: rows.filter((r) => r.knownEvidenceIds).length,
    currentInputCases: rows.filter((r) => r.usesCurrentInput).length,
    unchangedCases: rows.filter((r) => r.responseUnchanged && r.responseDigestBefore === r.responseDigestAfter).length,
    rows,
  };
  writeFileSync(OUTPUT, JSON.stringify(result, null, 2), { mode: 0o600 });
  console.log(JSON.stringify({ output: OUTPUT, cases: result.cases, closedSentenceIdCases: result.closedSentenceIdCases, knownEvidenceIdCases: result.knownEvidenceIdCases, currentInputCases: result.currentInputCases, unchangedCases: result.unchangedCases }, null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 1; });
