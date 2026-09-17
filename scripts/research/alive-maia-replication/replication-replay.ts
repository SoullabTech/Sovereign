import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  StandingEnvelopeRefused,
  type StandingEvidence,
} from '../structural-standing/standing-envelope';
import { renderCurrentTurnBasisEnvelope } from '../structural-standing/current-turn-basis-envelope';
import type { InterpretivePlan } from '../structural-standing/interpretive-basis-envelope';

type SourceCase = {
  id: string;
  name: string;
  currentEvidenceId: string;
  evidence: Array<{ id: string; text: string }>;
};

const source = JSON.parse(readFileSync('docs/programme/evidence/ALIVE_MAIA_REPLICATION_SOURCE_CASES_2026-09-16.json', 'utf8')) as { cases: SourceCase[] };
const ALL_MODELS = ['qwen3:32b', 'llama3.1:8b'] as const;
const ALL_SEEDS = [42, 211, 509] as const;
const MODELS = process.env.REPLICATION_MODEL ? [process.env.REPLICATION_MODEL] : [...ALL_MODELS];
const SEEDS = process.env.REPLICATION_SEED ? [Number(process.env.REPLICATION_SEED)] : [...ALL_SEEDS];
const CASE_FILTER = process.env.REPLICATION_CASE ?? null;
const TEMPERATURE = 0.2;
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

const schemaFor = (ids: string[]) => ({
  type: 'object', additionalProperties: false, required: ['synthesis', 'question'],
  properties: {
    synthesis: {
      type: 'array', minItems: 1, maxItems: 1,
      items: {
        type: 'object', additionalProperties: false, required: ['text', 'basisEvidenceIds'],
        properties: {
          text: { type: 'string' },
          basisEvidenceIds: { type: 'array', minItems: 1, maxItems: ids.length, items: { type: 'string', enum: ids } },
        },
      },
    },
    question: { type: 'string' },
  },
});

const promptFor = (evidence: StandingEvidence[], current: StandingEvidence) => `Prepare ONE response plan for MAIA from this developed conversation arc.

CURRENT MEMBER TURN:
${JSON.stringify(current.text)}

MEMBER-AUTHORED EVIDENCE:
${evidence.map(e => `${e.id}: ${JSON.stringify(e.text)}`).join('\n')}

Return ONLY JSON with exactly:
{"synthesis":[{"text":"...","basisEvidenceIds":["..."]}],"question":"..."}

Rules:
- Respond from the developed arc rather than restarting material already established.
- synthesis is MAIA's own perception and may be imaginative; write directly to the person using you/your or neutral nouns, never I/me/my/mine/myself and never member/the member.
- basisEvidenceIds identify the member evidence from which your perception arose; they do not certify your interpretation as fact.
- question should move into genuinely open territory rather than ask the person to repeat what they have already established.
- 1 synthesis, 1 question.
`;

async function generate(model: string, seed: number, prompt: string, schema: object) {
  const r = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false, format: schema, options: { temperature: TEMPERATURE, seed } }),
  });
  if (!r.ok) throw new Error(`Ollama ${r.status}: ${await r.text()}`);
  return await r.json() as { response: string; model: string; prompt_eval_count?: number; eval_count?: number };
}

async function main() {
  const rows: Array<Record<string, unknown>> = [];
  for (const c of source.cases) {
    if (CASE_FILTER && c.id !== CASE_FILTER) continue;
    const evidence: StandingEvidence[] = c.evidence.map(e => ({ ...e, authoredBy: 'member', participationClass: 'authored', authority: 'situate' }));
    const current = evidence.find(e => e.id === c.currentEvidenceId);
    if (!current) throw new Error(`missing current evidence ${c.id}:${c.currentEvidenceId}`);
    const prompt = promptFor(evidence, current);
    const schema = schemaFor(evidence.map(e => e.id));
    for (const model of MODELS) {
      for (const seed of SEEDS) {
        const raw = await generate(model, seed, prompt, schema);
        const parsed = JSON.parse(raw.response) as InterpretivePlan;
        try {
          const rendered = renderCurrentTurnBasisEnvelope(evidence, parsed, c.currentEvidenceId);
          rows.push({
            caseId: c.id, caseName: c.name, model, seed, status: 'rendered',
            rawPlan: parsed, rawPlanSha256: sha(raw.response), rendered,
            currentTurnBound: rendered.trace.currentTurn.evidenceId === c.currentEvidenceId,
            basisIds: rendered.trace.synthesis[0].basisEvidenceIds,
            basisSemantics: rendered.trace.synthesis[0].basisSemantics,
            promptChars: prompt.length, promptSha256: sha(prompt),
            usage: { promptEvalCount: raw.prompt_eval_count ?? null, evalCount: raw.eval_count ?? null },
          });
        } catch (error) {
          if (!(error instanceof StandingEnvelopeRefused)) throw error;
          rows.push({
            caseId: c.id, caseName: c.name, model, seed, status: 'refused',
            rawPlan: parsed, rawPlanSha256: sha(raw.response), refusal: error.code,
            promptChars: prompt.length, promptSha256: sha(prompt),
          });
        }
      }
    }
  }
  console.log(JSON.stringify({
    programme: 'ALIVE-MAIA-REPLICATION-01',
    act: 'R2-R3 cross-model replay',
    parentArchitecture: 'd899b3df6',
    temperature: TEMPERATURE,
    seeds: SEEDS,
    models: MODELS,
    rows,
  }, null, 2));
}

main().catch(error => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 1; });
