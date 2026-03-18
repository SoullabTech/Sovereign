/**
 * Change Council — I Ching-Enriched AIN Consultation
 *
 * Wraps the AIN consultation engine for change navigation.
 * The I Ching hexagram becomes part of the council context,
 * enriching the deliberation with oracular wisdom.
 *
 * The council is primary. The I Ching supports.
 */

import { consult } from '@/lib/ain/consultation';
import type { ConsultationRequest, ConsultationResult } from '@/lib/ain/types';
import type { ChangeContext, ChangeIterationContext } from './types';
import type { DecisionInputBundle } from '@/lib/studio/practitioner/types';
import { getChangeTypeConfig, buildChangeQuestion, mapUrgency } from './changeTypes';
import { getHexagram } from '@/lib/iching/lookup';

/**
 * Run AIN consultation for a change, tuned by change type
 * and enriched with I Ching hexagram context.
 *
 * When iterationContext is provided, the council sees the arc:
 * prior tensions, recommendation, insights, and what happened since.
 *
 * When inputBundle is provided, the council receives segmented evidence
 * from client inquiry, field signals, and practitioner observations.
 * The Changes prompt constraints apply intervention design framing:
 * smallest next intervention, success signals, risk/caution, observation window.
 */
export async function consultChangeCouncil(
  change: ChangeContext,
  iterationContext?: ChangeIterationContext,
  inputBundle?: DecisionInputBundle,
  councilBias?: string
): Promise<ConsultationResult> {
  const config = getChangeTypeConfig(change.changeType);

  // Look up hexagram context if one has been cast
  let hexagramContext: { name: string; judgment: string; image: string } | undefined;
  if (change.hexagramNumber) {
    const hex = getHexagram(change.hexagramNumber);
    if (hex) {
      hexagramContext = {
        name: `${hex.english} (${hex.name})`,
        judgment: hex.judgment,
        image: hex.image,
      };
    }
  }

  const question = buildChangeQuestion(change, config, hexagramContext, iterationContext, inputBundle, councilBias);

  const request: ConsultationRequest = {
    council: config.council,
    question,
    context: {
      urgency: mapUrgency(change.urgency),
      topicHints: [...config.topicHints, 'change', 'transition', 'i-ching'],
    },
    constraints: {
      maxFramings: config.maxFramings,
      preferDomains: config.preferDomains,
      requireFramings: config.requireFramings,
    },
  };

  return consult(request);
}
