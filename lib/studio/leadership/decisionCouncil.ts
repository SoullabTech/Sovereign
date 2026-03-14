/**
 * Decision Council — Situation-Aware Consultation Service
 *
 * Wraps the AIN consultation engine for practitioner decision support.
 * The practitioner chooses a situation type (field orientation),
 * and the council tunes its framings accordingly.
 *
 * This is a practitioner-facing tool. The client never sees the raw output.
 */

import { consult } from '@/lib/ain/consultation';
import type { ConsultationRequest, ConsultationResult } from '@/lib/ain/types';
import type { DecisionContext, IterationContext } from './types';
import type { DecisionInputBundle } from '@/lib/studio/practitioner/types';
import { getSituationConfig, buildSituationQuestion, mapTimePressure } from './situationTypes';

/**
 * Run AIN consultation for a decision, tuned by situation type.
 *
 * Uses the situation type to select the right council, framings,
 * and question structure. Falls back to 'individual' if no type specified.
 *
 * When iterationContext is provided, the council sees the arc:
 * prior tensions, recommendation, insights, and what happened since.
 *
 * When inputBundle is provided, the council receives segmented evidence from
 * client inquiry, field signals, and practitioner observations — reducing
 * projection and increasing synthesis precision.
 */
export async function consultDecisionCouncil(
  decision: DecisionContext,
  iterationContext?: IterationContext,
  inputBundle?: DecisionInputBundle,
  councilBias?: string
): Promise<ConsultationResult> {
  const config = getSituationConfig(decision.situationType);
  const question = buildSituationQuestion(decision, config, iterationContext, inputBundle, councilBias);

  const request: ConsultationRequest = {
    council: config.council,
    question,
    context: {
      urgency: mapTimePressure(decision.timePressure),
      topicHints: config.topicHints,
    },
    constraints: {
      maxFramings: config.maxFramings,
      preferDomains: config.preferDomains,
      requireFramings: config.requireFramings,
    },
  };

  return consult(request);
}
