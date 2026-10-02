import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredBlock } from '@/lib/ai/structured/types';
import type { DevelopmentalAskContext, EvidenceView } from './developmentalContext';

export const REVIEW_DISCUSS_READER_VERSION = 'review-discuss-r2-2-v1';
const DEFAULT_MODEL = process.env.MAIA_ASK_MODEL || 'claude-opus-5';

function evidenceText(e: EvidenceView): string | null {
  if (e.kind !== 'verified') return null;
  const r = e.recovered;
  if (r.kind === 'text') return r.text;
  if (r.kind === 'sequence') return `[verified sequence: ${r.sectionIds.length} section(s)]`;
  return `[verified authored structure: ${r.units.length} unit(s)]`;
}

function systemFor(ctx: DevelopmentalAskContext): string {
  const evidence = ctx.evidence.map(evidenceText).filter((x): x is string => !!x);
  const location = ctx.location.state === 'current'
    ? 'The material this observation rests on is measured current.'
    : ctx.location.state === 'superseded'
      ? 'The material this observation rests on has moved since the reading. Discuss the historical observation only; do not claim it describes the Work now.'
      : 'Whether the material has changed is unmeasured. Do not assume currentness or change.';

  return [
    'You are MAIA inside Writer’s Studio Review Discuss.',
    'This is AS_READ only: discuss the exact durable observation according to the material MAIA originally read.',
    'Do not claim that current text was checked. Do not reread, reassess, commission a new reading, or silently compare THEN with NOW.',
    'Do not alter, delete, supersede, or change the standing of the durable reading. Agreement or disagreement in this conversation has no durable effect.',
    'You may say the earlier observation may have been mistaken if the historical evidence warrants that, but that is conversational only and does not revise the reading.',
    '',
    'DURABLE OBSERVATION:',
    ctx.observation.text,
    '',
    'WHAT IT DOES NOT ESTABLISH:',
    ...ctx.observation.doesNotEstablish.map((x) => `- ${x}`),
    '',
    'DIGEST-VERIFIED HISTORICAL EVIDENCE:',
    ...evidence.map((x) => `---\n${x}`),
    '',
    'TEMPORAL POSTURE:',
    location,
  ].join('\n');
}

export type ReviewDiscussReaderOutcome =
  | {
      readonly ok: true;
      readonly answer: string;
      readonly provenance: {
        readonly provider: string;
        readonly model: string;
        readonly reportedModel: string | null;
        readonly modelAgreement: string;
        readonly answeredAt: string;
        readonly readerVersion: string;
      };
    }
  | { readonly ok: false; readonly refusal: 'unreachable' | 'empty_answer' };

export async function runReviewDiscuss(
  ctx: DevelopmentalAskContext,
  question: string,
): Promise<ReviewDiscussReaderOutcome> {
  const outcome = await runStructured({
    model: DEFAULT_MODEL,
    maxTokens: 1200,
    system: systemFor(ctx),
    messages: [{ role: 'user', content: question }],
  });
  if (!outcome.ok) return { ok: false, refusal: 'unreachable' };
  const answer = outcome.result.content
    .filter((b): b is Extract<StructuredBlock, { type: 'text' }> => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  if (!answer) return { ok: false, refusal: 'empty_answer' };
  return {
    ok: true,
    answer,
    provenance: {
      provider: outcome.result.provenance.provider,
      model: outcome.result.provenance.model,
      reportedModel: outcome.result.provenance.reportedModel,
      modelAgreement: outcome.result.provenance.modelAgreement,
      answeredAt: new Date().toISOString(),
      readerVersion: REVIEW_DISCUSS_READER_VERSION,
    },
  };
}

export const __reviewDiscussSystemForTest = systemFor;
