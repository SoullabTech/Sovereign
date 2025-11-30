export interface AgentScore {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

export function scoreQuery(input: string): AgentScore {
  const lowered = input.toLowerCase();
  const scores: AgentScore = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

  if (
    lowered.includes("fire") ||
    lowered.includes("ignite") ||
    lowered.includes("spark")
  ) {
    scores.fire += 10;
  }
  if (
    lowered.includes("water") ||
    lowered.includes("flow") ||
    lowered.includes("tear") ||
    lowered.includes("emotional")
  ) {
    scores.water += 10;
  }
  if (
    lowered.includes("earth") ||
    lowered.includes("ground") ||
    lowered.includes("stable") ||
    lowered.includes("roots")
  ) {
    scores.earth += 10;
  }
  if (
    lowered.includes("air") ||
    lowered.includes("wind") ||
    lowered.includes("breeze") ||
    lowered.includes("thought")
  ) {
    scores.air += 10;
  }
  // Default catch-all adjustment for Aether.
  scores.aether += 5;

  return scores;
}
