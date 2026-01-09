// backend
// lib/sovereign/decisionGovernor.ts

/**
 * DECISION GOVERNOR
 *
 * Spiralogic circulatory governor for MAIA's response posture.
 * This is NOT classification-as-truth — it's posture selection.
 *
 * Called at two points:
 * - Preflight: before model completion
 * - Postflight: after assistant response (for learning)
 */

export type Element = "fire" | "water" | "earth" | "air" | "aether";
export type Handoff =
  | "stay"
  | "regulate"
  | "invite_threshold"
  | "invite_fire"
  | "invite_water"
  | "invite_air"
  | "invite_earth";

export type DecisionPacket = {
  activeElement: Element | "unknown";
  activeFacet: string | "unknown";
  integrityFlags: Record<string, boolean>;
  regulationSuggestion: { from: Element; to: Element } | null;
  handoffEligibility: Handoff;
  languageStyleHints: string[];
  modeHint: "FAST" | "CORE" | "DEEP";
};

function hasAny(text: string, needles: string[]) {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n));
}

/**
 * Minimal, safe heuristics.
 * This is intentionally NOT "classification as truth" — it's posture selection.
 * You can swap this later to use your facet detection / symbol index.
 */
export function decisionPreflight(userText: string): DecisionPacket {
  const text = userText.trim();
  const t = text.toLowerCase();

  // --- crude element/facet cues (replace later with your real detector)
  const isWater = hasAny(t, [
    "overwhelm",
    "grief",
    "sad",
    "cry",
    "tear",
    "hurt",
    "shame",
    "fear",
    "anxious",
    "panic",
    "heavy",
    "drowning",
    "flood",
  ]);
  const isAir = hasAny(t, [
    "analyze",
    "logic",
    "figure out",
    "explain",
    "why",
    "meaning",
    "concept",
    "model",
    "framework",
    "clarify",
    "understand",
  ]);
  const isFire = hasAny(t, [
    "i want",
    "let's",
    "build",
    "ship",
    "launch",
    "now",
    "urgent",
    "excited",
    "vision",
    "breakthrough",
    "spark",
  ]);
  const isEarth = hasAny(t, [
    "step by step",
    "plan",
    "checklist",
    "organize",
    "structure",
    "file",
    "schema",
    "migration",
    "deploy",
    "timeline",
  ]);
  const isThreshold = hasAny(t, [
    "in between",
    "liminal",
    "threshold",
    "pause",
    "not sure",
    "i can't move",
    "stuck but not",
    "waiting",
  ]);

  let activeElement: DecisionPacket["activeElement"] = "unknown";
  if (isWater && !isAir) activeElement = "water";
  else if (isAir && !isWater) activeElement = "air";
  else if (isFire && !isEarth) activeElement = "fire";
  else if (isEarth && !isFire) activeElement = "earth";
  else if (isThreshold) activeElement = "aether"; // threshold as aether-adjacent holding

  // --- integrity flags (start with your two most important)
  const integrityFlags: Record<string, boolean> = {
    threshold_rush_risk: false,
    water_flood_risk: false,
    air_detach_risk: false,
    fire_unmoored_risk: false,
    earth_rigid_risk: false,
  };

  // Threshold rush risk: high action language + liminal cues
  if (isThreshold && hasAny(t, ["now", "asap", "force", "push", "decide today"])) {
    integrityFlags.threshold_rush_risk = true;
  }

  // Water flood risk: water cues + frantic tone
  if (isWater && hasAny(t, ["too much", "can't", "i'm losing it", "spiraling", "can't breathe"])) {
    integrityFlags.water_flood_risk = true;
  }

  // --- regulation (your table, minimal)
  // Fire ↔ Earth, Water ↔ Air
  let regulationSuggestion: DecisionPacket["regulationSuggestion"] = null;
  if (isFire && !isEarth) regulationSuggestion = { from: "fire", to: "earth" };
  if (isEarth && !isFire) regulationSuggestion = { from: "earth", to: "fire" };
  if (isWater && !isAir) regulationSuggestion = { from: "water", to: "air" };
  if (isAir && !isWater) regulationSuggestion = { from: "air", to: "water" };

  // --- handoff eligibility (governor logic)
  // Default: stay if integrity flags triggered
  let handoffEligibility: Handoff = "stay";

  if (integrityFlags.threshold_rush_risk || integrityFlags.water_flood_risk) {
    handoffEligibility = "stay";
  } else if (regulationSuggestion) {
    handoffEligibility = "regulate";
  } else if (isThreshold) {
    handoffEligibility = "invite_threshold";
  } else if (activeElement === "fire") {
    handoffEligibility = "invite_earth";
  } else if (activeElement === "earth") {
    handoffEligibility = "invite_fire";
  } else if (activeElement === "water") {
    handoffEligibility = "invite_air";
  } else if (activeElement === "air") {
    handoffEligibility = "invite_water";
  }

  // --- language hints (match your Library phrases)
  const languageStyleHints: string[] = [];
  if (handoffEligibility === "regulate" && regulationSuggestion?.to === "earth") {
    languageStyleHints.push("Honor the vision; invite a first real step without collapsing possibility.");
    languageStyleHints.push('Use: "What would help this land in something real?"');
  }
  if (handoffEligibility === "regulate" && regulationSuggestion?.to === "air") {
    languageStyleHints.push("Honor the feeling; invite naming, breath, and perspective.");
    languageStyleHints.push('Use: "What\'s becoming clearer now that you\'ve stayed with it?"');
  }
  if (handoffEligibility === "invite_threshold") {
    languageStyleHints.push("Do not rush movement. Name the gap as intelligent.");
    languageStyleHints.push('Use: "You don\'t need to know yet. Let\'s stay with what\'s loosening."');
  }
  if (handoffEligibility === "stay" && integrityFlags.water_flood_risk) {
    languageStyleHints.push("Presence over explanation. Slowness over efficiency.");
    languageStyleHints.push('Use: "Let\'s stay right here for a moment."');
  }
  if (handoffEligibility === "stay" && integrityFlags.threshold_rush_risk) {
    languageStyleHints.push("Honor the pause, don't help them escape it.");
    languageStyleHints.push('Use: "This space has its own timing."');
  }

  // --- pacing hint
  const modeHint: DecisionPacket["modeHint"] =
    integrityFlags.water_flood_risk || integrityFlags.threshold_rush_risk
      ? "CORE"
      : text.length > 600
        ? "DEEP"
        : "FAST";

  return {
    activeElement,
    activeFacet: isThreshold ? "threshold" : "unknown",
    integrityFlags,
    regulationSuggestion,
    handoffEligibility,
    languageStyleHints,
    modeHint,
  };
}

export type DecisionPostflight = {
  packet: DecisionPacket;
  assistantText: string;
  satisfiedSignal?: "continued" | "corrected" | "thanked" | "unknown";
};

/**
 * Postflight logging for learning loop.
 * Later: persist to postgres + feed VaultSymbolIndex.learnFromResult(...)
 */
export function decisionPostflight(post: DecisionPostflight): void {
  // Log for now, persist later
  console.log('[DecisionGovernor] Postflight:', {
    activeElement: post.packet.activeElement,
    activeFacet: post.packet.activeFacet,
    handoffEligibility: post.packet.handoffEligibility,
    integrityFlagsTriggered: Object.entries(post.packet.integrityFlags)
      .filter(([, v]) => v)
      .map(([k]) => k),
    responseChars: post.assistantText.length,
    satisfiedSignal: post.satisfiedSignal || 'unknown',
  });
}

/**
 * Build a governor addendum for the system prompt.
 * This is injected right before the model call.
 */
export function buildGovernorAddendum(decision: DecisionPacket): string {
  if (decision.handoffEligibility !== "stay" && decision.handoffEligibility !== "regulate") {
    return "";
  }

  const triggeredFlags = Object.entries(decision.integrityFlags)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const lines = [
    "",
    "[Governor]",
    `- Posture: ${decision.handoffEligibility}`,
    `- Active element: ${decision.activeElement}`,
    `- Integrity flags: ${triggeredFlags.length > 0 ? triggeredFlags.join(", ") : "none"}`,
  ];

  if (decision.languageStyleHints.length > 0) {
    lines.push("- Hints:");
    decision.languageStyleHints.forEach((h) => {
      lines.push(`  - ${h}`);
    });
  }

  lines.push("");
  return lines.join("\n");
}
