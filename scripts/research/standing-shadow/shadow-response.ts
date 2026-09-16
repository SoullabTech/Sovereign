import {
  parseStandingPlan,
  renderStandingEnvelope,
  StandingEnvelopeRefused,
  type StandingEvidence,
} from '../structural-standing/standing-envelope';
import type { StandingProjection } from './standing-projection';

export function renderShadowResponse(projection: StandingProjection, rawPlan: unknown) {
  const plan = parseStandingPlan(rawPlan);
  if (plan.ground.length !== 0) throw new StandingEnvelopeRefused('shadow_ground_must_be_empty');

  const known = new Set(projection.entries.map((e) => e.evidenceId));
  for (let i = 0; i < plan.synthesis.length; i += 1) {
    const support = plan.synthesis[i].supportEvidenceIds ?? [];
    if (support.length === 0) throw new StandingEnvelopeRefused('shadow_synthesis_requires_support', String(i));
    for (const id of support) {
      if (!known.has(id)) throw new StandingEnvelopeRefused('unknown_evidence', id);
    }
  }

  const evidence: StandingEvidence[] = projection.entries.map((e) => ({
    id: e.evidenceId,
    text: e.text,
    authoredBy: e.authoredBy,
    participationClass: e.participationClass,
    authority: e.authority,
  }));

  return renderStandingEnvelope(evidence, {
    ground: [],
    synthesis: plan.synthesis,
    question: plan.question ?? null,
  });
}
