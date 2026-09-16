import { createHash } from 'node:crypto';
import { renderStandingEnvelope, StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';

const MODEL = 'llama3.1:8b';
const TEMPERATURE = 0.2;
const SEEDS = [42, 137, 211, 509] as const;
const MEMBER_TURN = 'the silver cedar';

const evidence: StandingEvidence[] = [
  { id: 'E1', text: 'Silver cedar is an image that’s been on my mind today.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E2', text: 'it feels ancient and wise and medicinal on a soul level', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E3', text: 'what is foundational and important for me in this work and my life', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E4', text: 'values, focus, coherence', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E5', text: 'a guardian image for my work and for me', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
];

const prompt = `You are preparing ONE conversational response plan for MAIA.

The member has already developed the Silver Cedar through the evidence registry below, then MAIA asked what image/form the guardian takes. The member's current turn is:
${JSON.stringify(MEMBER_TURN)}

EVIDENCE REGISTRY — ids and exact member-authored text:
${evidence.map((e) => `${e.id}: ${JSON.stringify(e.text)}`).join('\n')}

Return ONLY a JSON object with exactly this shape:
{
  "ground": [{"evidenceId":"E5"}],
  "synthesis": [{"text":"...", "supportEvidenceIds":["E3","E4","E5"]}],
  "question":"..."
}

Rules for the PLAN:
- ground contains only evidence references, never quoted or paraphrased text.
- select evidence that shows the meaning already established; do not ask the member to explain Silver Cedar again.
- synthesis is MAIA's own new perception. It may be imaginative and concise. Write it directly TO the person using you/your or neutral nouns; never say member or the member; never borrow the member's first-person voice (I/me/my/mine/myself). Do not write labels such as member-confirmed, fact, standing, authority, authorship, or adopted.
- question, if present, should address the member as you/your and move toward a genuinely open consequence for practice/design/life rather than reopen what Silver Cedar means. Never use I/me/my/mine/myself in the question.
- do not include any keys other than ground, synthesis, question, evidenceId, text, supportEvidenceIds.
- 1 ground reference, 1 synthesis, 1 question.
`;

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ground', 'synthesis', 'question'],
  properties: {
    ground: {
      type: 'array', minItems: 1, maxItems: 1,
      items: {
        type: 'object', additionalProperties: false, required: ['evidenceId'],
        properties: { evidenceId: { type: 'string', enum: ['E1', 'E2', 'E3', 'E4', 'E5'] } },
      },
    },
    synthesis: {
      type: 'array', minItems: 1, maxItems: 1,
      items: {
        type: 'object', additionalProperties: false, required: ['text', 'supportEvidenceIds'],
        properties: {
          text: { type: 'string' },
          supportEvidenceIds: {
            type: 'array', minItems: 1, maxItems: 5,
            items: { type: 'string', enum: ['E1', 'E2', 'E3', 'E4', 'E5'] },
          },
        },
      },
    },
    question: { type: 'string' },
  },
} as const;

interface OllamaResponse {
  response: string;
  model: string;
  done: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

async function generate(seed: number): Promise<OllamaResponse> {
  const res = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      format: PLAN_SCHEMA,
      options: { temperature: TEMPERATURE, seed },
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  return await res.json() as OllamaResponse;
}

async function main(): Promise<void> {
  const rows: unknown[] = [];
  for (const seed of SEEDS) {
    const raw = await generate(seed);
    const parsed = JSON.parse(raw.response) as unknown;
    try {
      const rendered = renderStandingEnvelope(evidence, parsed);
      rows.push({
        seed,
        status: 'rendered',
        model: raw.model,
        temperature: TEMPERATURE,
        rawPlan: parsed,
        rawPlanSha256: sha(raw.response),
        rendered,
        usage: { promptEvalCount: raw.prompt_eval_count ?? null, evalCount: raw.eval_count ?? null },
      });
    } catch (error) {
      if (!(error instanceof StandingEnvelopeRefused)) throw error;
      rows.push({
        seed,
        status: 'refused',
        model: raw.model,
        temperature: TEMPERATURE,
        rawPlan: parsed,
        rawPlanSha256: sha(raw.response),
        refusal: error.code,
        usage: { promptEvalCount: raw.prompt_eval_count ?? null, evalCount: raw.eval_count ?? null },
      });
    }
  }

  console.log(JSON.stringify({
    programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01',
    act: 'S3 Silver Cedar standing-envelope replay',
    memberTurn: MEMBER_TURN,
    evidenceDigest: sha(JSON.stringify(evidence)),
    model: MODEL,
    temperature: TEMPERATURE,
    promptChars: prompt.length,
    rows,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
