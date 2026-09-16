import { createHash } from 'node:crypto';
import { renderTurnForCognition, type CanonicalTurn, type TierStrategy } from '../../../lib/maia/canonical-turn';
import { projectStandingTurn, renderStandingProjectionForModel, type StandingProjection } from './standing-projection';

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

export interface StandingShadowComparison {
  readonly turnId: string;
  readonly tier: TierStrategy['tier'];
  readonly userInput: string;
  readonly currentSystemPrompt: string;
  readonly shadowSystemPrompt: string;
  readonly currentPromptDigest: string;
  readonly shadowPromptDigest: string;
  readonly projection: StandingProjection;
  readonly preflight: {
    readonly sameParticipantOrder: boolean;
    readonly sameParticipantTexts: boolean;
    readonly sameFloorBlocks: boolean;
    readonly currentContainsEveryParticipant: boolean;
    readonly shadowContainsEveryParticipant: boolean;
  };
}

export function buildStandingShadowComparison(
  turn: CanonicalTurn,
  strategy: TierStrategy,
): StandingShadowComparison {
  const current = renderTurnForCognition(turn, strategy);
  const projection = projectStandingTurn(turn, strategy);
  const shadowSystemPrompt = renderStandingProjectionForModel(turn, strategy, projection);

  const sameParticipantOrder =
    JSON.stringify(current.participantOrder) === JSON.stringify(projection.participantOrder);
  const participantEntries = projection.entries.filter((e) => e.kind === 'participant');
  const currentContainsEveryParticipant = participantEntries.every((e) => current.systemPrompt.includes(e.text));
  const shadowContainsEveryParticipant = participantEntries.every((e) => shadowSystemPrompt.includes(e.text));
  const sameParticipantTexts = currentContainsEveryParticipant && shadowContainsEveryParticipant;
  const floorTexts = turn.floor.blocks.map((b) => b.text);
  const sameFloorBlocks = floorTexts.every((text) =>
    current.systemPrompt.includes(text) && shadowSystemPrompt.includes(text),
  );

  const preflight = {
    sameParticipantOrder,
    sameParticipantTexts,
    sameFloorBlocks,
    currentContainsEveryParticipant,
    shadowContainsEveryParticipant,
  } as const;

  if (!Object.values(preflight).every(Boolean)) {
    throw new Error(`standing shadow preflight failed: ${JSON.stringify(preflight)}`);
  }

  return {
    turnId: turn.turnId,
    tier: strategy.tier,
    userInput: turn.encounter.input,
    currentSystemPrompt: current.systemPrompt,
    shadowSystemPrompt,
    currentPromptDigest: sha256(current.systemPrompt),
    shadowPromptDigest: sha256(shadowSystemPrompt),
    projection,
    preflight,
  };
}
