/**
 * renderTurnForCognition — the ONE renderer. Spec §6.5.
 *
 * Tiers vary cognition strategy (scaffolding, brevity, repair instructions). They may not
 * add or remove participants and they may not touch the floor. Floor blocks with
 * position 'first' open the prompt; admitted participants follow in registry order;
 * floor blocks with position 'last' close it — humility last of all — so the standing
 * discipline governs every signal above it (appendAllContextAddenda ordering, preserved).
 *
 * M1 standing: zero live callers. Becomes the tier prompt seam at M3.
 */

import { PRODUCER_IDS } from './producerRegistry';
import { CanonicalTurnRefused, type CanonicalTurn } from './types';

export interface TierStrategy {
  readonly tier: 'FAST' | 'CORE' | 'DEEP';
  /** Strategy-owned scaffolding placed between the opening floor and the participants. */
  readonly scaffold?: string;
  /** Repair-pass instruction appended after the participants, before the closing floor. */
  readonly repairInstruction?: string;
}

export interface RenderedPrompt {
  readonly systemPrompt: string;
  readonly tier: TierStrategy['tier'];
  readonly participantOrder: readonly string[];
}

export function renderTurnForCognition(turn: CanonicalTurn, strategy: TierStrategy): RenderedPrompt {
  if (!Object.isFrozen(turn)) throw new CanonicalTurnRefused('not_frozen');

  const first = turn.floor.blocks.filter((b) => b.position === 'first').map((b) => b.text);
  const last = turn.floor.blocks.filter((b) => b.position === 'last').map((b) => b.text);
  if (first.length === 0 || last.length === 0) throw new CanonicalTurnRefused('floor_missing');

  const order = new Map(PRODUCER_IDS.map((id, i) => [id, i] as const));
  const participants = [...turn.participation.admitted].sort(
    (a, b) => (order.get(a.producerId) ?? 0) - (order.get(b.producerId) ?? 0),
  );

  const parts: string[] = [
    ...first,
    ...(strategy.scaffold ? [strategy.scaffold] : []),
    ...participants.map((p) => p.text),
    ...(strategy.repairInstruction ? [strategy.repairInstruction] : []),
    ...last,
  ];

  return {
    systemPrompt: parts.filter((s) => s && s.trim().length > 0).join('\n\n'),
    tier: strategy.tier,
    participantOrder: participants.map((p) => p.producerId),
  };
}
