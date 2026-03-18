/**
 * Greeting Router — the orchestrator.
 *
 * Takes raw signals, scores all lanes, picks the best,
 * chooses style, renders the greeting.
 *
 * This is the single entry point for generating a structured greeting.
 *
 * Usage:
 *   const greeting = chooseGreeting(signals, { voiceArchetype: 'puck' });
 *   // greeting.line1 = "Good evening, Kelly."
 *   // greeting.line2 = "Still on the voice tuning adventure, or starting a new one?"
 *   // greeting.lane = "continuity"
 *   // greeting.style = "playful"
 *   // greeting.safety = { usedMemory: true, sanctuary: false, reason: "continuity: recent theme" }
 */

import type { Greeting, GreetingLane } from './types';
import type { GreetingSignals } from './greetingScoring';
import { scoreLane } from './greetingScoring';
import { chooseGreetingStyle } from './greetingStyle';
import { renderGreeting } from './greetingRender';
import type { GreetingStyle } from './types';

const LANES: GreetingLane[] = [
  'continuity',
  'threshold',
  'gentle_recall',
  'intention',
  'identity',
];

/**
 * Choose and render a structured greeting.
 *
 * This is the main entry point. Everything else is internal.
 */
export function chooseGreeting(
  signals: GreetingSignals,
  opts?: {
    memberGreetingStyle?: GreetingStyle | null;
    voiceArchetype?: string | null;
  },
): Greeting {
  // 1. Score all lanes
  const scores = {} as Record<GreetingLane, number>;
  for (const lane of LANES) {
    scores[lane] = scoreLane(lane, signals);
  }

  // 2. Pick highest-scoring lane
  let bestLane: GreetingLane = 'identity';
  let bestScore = -Infinity;
  for (const lane of LANES) {
    if (scores[lane] > bestScore) {
      bestScore = scores[lane];
      bestLane = lane;
    }
  }

  // 3. Choose style
  const { style, source: styleSource } = chooseGreetingStyle(signals, {
    memberPreference: opts?.memberGreetingStyle,
    voiceArchetype: opts?.voiceArchetype,
  });

  // 4. Render
  const greeting = renderGreeting(bestLane, style, signals);

  // 5. Attach debug info
  greeting.debug = {
    candidateScores: scores,
    chosenScore: bestScore,
    styleSource,
  };

  console.log(`[greeting] lane=${bestLane} style=${style} source=${styleSource} score=${bestScore.toFixed(2)} memory=${greeting.safety.usedMemory} sanctuary=${signals.sanctuary}`);

  return greeting;
}

// Re-export types for convenience
export type { Greeting, GreetingLane, GreetingStyle, GreetingSignals };
