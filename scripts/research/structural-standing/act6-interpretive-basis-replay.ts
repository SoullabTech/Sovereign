import { createHash } from 'node:crypto';
import { resolveClaimStanding, type ClaimStandingAct } from './claim-standing';
import { StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';
import { renderInterpretiveBasisEnvelope, type InterpretivePlan } from './interpretive-basis-envelope';

const MODEL = 'llama3.1:8b';
const TEMPERATURE = 0.2;
const SEEDS = [42, 137, 211, 509] as const;
const MEMBER_TURN = 'Actually, grief is the center. Autonomy is how I have been organizing around it.';
const CLAIM_KEY = 'organizing-center';
const evidence: StandingEvidence[] = [
  { id: 'E-OLD', text: 'I think autonomy is the center of this for me.', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'M-OLD', text: 'Autonomy seems to be the organizing center of what is happening.', authoredBy: 'system', participationClass: 'inferred', authority: 'infer', derivedFromEvidenceIds: ['E-OLD'] },
  { id: 'E-NOW', text: MEMBER_TURN, authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
];
const acts: ClaimStandingAct[] = [
  { actId: 'A1', claimKey: CLAIM_KEY, evidenceId: 'E-OLD', supersedesEvidenceId: null },
  { actId: 'A2', claimKey: CLAIM_KEY, evidenceId: 'E-NOW', supersedesEvidenceId: 'E-OLD' },
];
const standing = resolveClaimStanding(evidence, acts);
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

const prompt = `Prepare ONE response plan for MAIA after a member corrected the organizing center of the conversation.

CURRENT MEMBER TURN:
${JSON.stringify(MEMBER_TURN)}

SUBSTRATE-OWNED EVIDENCE / STANDING:
- E-OLD [member-authored; historical; superseded by E-NOW]: ${JSON.stringify(evidence[0].text)}
- M-OLD [MAIA/system inference; derived from E-OLD; NEVER member standing]: ${JSON.stringify(evidence[1].text)}
- E-NOW [member-authored; CURRENT standing for organizing-center]: ${JSON.stringify(evidence[2].text)}

Return ONLY JSON with exactly:
{
  "synthesis": [{"text":"...", "basisEvidenceIds":["..."]}],
  "question":"..."
}

Rules:
- Do not defend or preserve the old autonomy-centered frame merely for continuity.
- The correction E-NOW outranks E-OLD and M-OLD for PRESENT standing. You may reference history to perceive the reorganization, but current member evidence must govern.
- synthesis is MAIA's own perception, written directly to the person using you/your or neutral nouns. Never use I/me/my/mine/myself and never say member/the member.
- Do not emit authorship, authority, standing, confirmed, adopted, current, superseded, or other metadata in the plan.
- Preserve genuine tension if useful; do not collapse autonomy into being false just because grief is now central.
- question, if present, should explore what becomes newly visible after the correction rather than asking the person to justify it.
- 1 synthesis, 1 question.
`;

const PLAN_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['synthesis', 'question'],
  properties: {
    synthesis: { type: 'array', minItems: 1, maxItems: 1, items: { type: 'object', additionalProperties: false, required: ['text', 'basisEvidenceIds'], properties: {
      text: { type: 'string' },
      basisEvidenceIds: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string', enum: ['E-OLD', 'M-OLD', 'E-NOW'] } },
    } } },
    question: { type: 'string' },
  },
} as const;
interface OllamaResponse { response: string; model: string; prompt_eval_count?: number; eval_count?: number }
async function generate(seed: number): Promise<OllamaResponse> {
  const res = await fetch('http://127.0.0.1:11434/api/generate', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, stream: false, format: PLAN_SCHEMA, options: { temperature: TEMPERATURE, seed } }) });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  return await res.json() as OllamaResponse;
}
async function main(): Promise<void> {
  const rows: Array<Record<string, unknown>> = [];
  for (const seed of SEEDS) {
    const raw = await generate(seed);
    const parsed = JSON.parse(raw.response) as InterpretivePlan;
    try {
      const rendered = renderInterpretiveBasisEnvelope(evidence, parsed, CLAIM_KEY, standing);
      rows.push({ seed, status: 'rendered', rawPlan: parsed, rawPlanSha256: sha(raw.response), rendered,
        currentGrounded: rendered.trace.grounded.some((x) => x.evidenceId === 'E-NOW'),
        basisSemantics: rendered.trace.synthesis.map((x) => x.basisSemantics),
        usage: { promptEvalCount: raw.prompt_eval_count ?? null, evalCount: raw.eval_count ?? null } });
    } catch (error) {
      if (!(error instanceof StandingEnvelopeRefused)) throw error;
      rows.push({ seed, status: 'refused', rawPlan: parsed, rawPlanSha256: sha(raw.response), refusal: error.code,
        usage: { promptEvalCount: raw.prompt_eval_count ?? null, evalCount: raw.eval_count ?? null } });
    }
  }
  console.log(JSON.stringify({ programme: 'FREE-SYNTHESIS-STRUCTURAL-STANDING-01', act: 'ACT 6 interpretive-basis replay', model: MODEL,
    temperature: TEMPERATURE, promptChars: prompt.length, promptSha256: sha(prompt), rows }, null, 2));
}
main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 1; });
