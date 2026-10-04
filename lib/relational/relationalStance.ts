/**
 * Relational Stance Engine — the dance algorithm.
 *
 * Decides how MAIA relates this turn: hold, mirror, challenge, release, or welcome back.
 * Driven by signals, not ideology. Constitutional priority ordering.
 *
 * Rules (in order):
 *   1. Dysregulation → HOLD (co-regulate, but still return power)
 *   2. Boundary risk → CHALLENGE (clean edge, accountability)
 *   3. Seasonal return → SEASONAL_RETURN (elder tone, assumes competence)
 *   4. Competence → RELEASE (short, spacious, diminish centrality)
 *   5. Dependency pull → MIRROR (return authorship harder, do NOT hold tighter)
 *   6. Default → MIRROR (reflect, clarify, return authorship)
 */

import type { RelationalHint, RelationalStance } from '@/lib/types/relationalHint';

// ═══════════════════════════════════════════════════════════════
// Input types (loose, so we don't couple to exact upstream shapes)
// ═══════════════════════════════════════════════════════════════

type VoiceHintLike = {
  element?: string;
  phase?: number;
  intensity?: number; // 0..1
  motion?: string;
  archetype?: string;
};

type PersistedSpiralStateLike = {
  autonomy_streak?: number | null;  // >=0
  return_count?: number | null;     // >=0
};

export type DecideRelationalStanceInput = {
  memberId: string;
  message: string;
  conversationDepth: number;

  voiceHint?: VoiceHintLike | null;
  persistedState?: PersistedSpiralStateLike | null;
};

// ═══════════════════════════════════════════════════════════════
// Signal Detection (conservative, not diagnostic)
// ═══════════════════════════════════════════════════════════════

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const hasAny = (text: string, needles: string[]) => {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n));
};

const detectDysregulation = (message: string, intensity: number) => {
  // Intentionally conservative (no diagnosis), just "needs holding"
  const signals = [
    'panic',
    "can't breathe",
    'overwhelmed',
    'spiraling',
    'freaking out',
    'terrified',
    "i'm not ok",
    'help me',
    'crisis',
    'suicid', // catches suicide/suicidal without being too fancy
  ];
  return intensity >= 0.78 && hasAny(message, signals);
};

const detectDependencyPull = (message: string) => {
  const signals = [
    'tell me what to do',
    'decide for me',
    'you choose',
    'i need you to',
    "i can't without you",
    "don't leave me",
    'only you',
  ];
  return hasAny(message, signals);
};

const detectBoundaryNeed = (message: string) => {
  const signals = [
    'make them',
    'force',
    'convince',
    'manipulate',
    'get them to',
    'i want you to control',
    'hack',
  ];
  return hasAny(message, signals);
};

// ═══════════════════════════════════════════════════════════════
// Core Decision Function
// ═══════════════════════════════════════════════════════════════

export function decideRelationalHint(input: DecideRelationalStanceInput): RelationalHint {
  const intensity = clamp01(input.voiceHint?.intensity ?? 0.55);

  const autonomyStreak = input.persistedState?.autonomy_streak ?? 0;
  const returnCount = input.persistedState?.return_count ?? 0;

  const dysregulation = detectDysregulation(input.message, intensity);
  const dependencyPull = detectDependencyPull(input.message);
  const boundaryNeeded = detectBoundaryNeed(input.message);

  // relational_phase retired as a behavioral signal (ADR-003): it is person-state,
  // uncomputed (static default), and removed from member-facing display. Stance now
  // keys only on observed signals — returnCount and autonomyStreak.
  const seasonalReturn = returnCount >= 2 && input.conversationDepth <= 3;

  const competence = autonomyStreak >= 3;

  let stance: RelationalStance = 'MIRROR';

  // Priority ordering (constitutional):
  // 1) dysregulation → HOLD
  // 2) explicit boundary risk → CHALLENGE
  // 3) seasonal return → SEASONAL_RETURN
  // 4) competence → RELEASE
  // 5) dependency pull → MIRROR (return authorship harder, do NOT "hold tighter")
  if (dysregulation) stance = 'HOLD';
  else if (boundaryNeeded) stance = 'CHALLENGE';
  else if (seasonalReturn) stance = 'SEASONAL_RETURN';
  else if (competence) stance = 'RELEASE';
  else if (dependencyPull) stance = 'MIRROR';

  // Output knobs (structure, not content)
  let holdLevel = 0.35;
  let returnPowerLevel = 0.7;
  let brevityLevel = 0.35;

  switch (stance) {
    case 'HOLD':
      holdLevel = 0.95;
      returnPowerLevel = 0.55; // still return power, but not with "go do it alone" energy
      brevityLevel = 0.25;
      break;
    case 'CHALLENGE':
      holdLevel = 0.45;
      returnPowerLevel = 0.8;
      brevityLevel = 0.45;
      break;
    case 'SEASONAL_RETURN':
      holdLevel = 0.55;
      returnPowerLevel = 0.75;
      brevityLevel = 0.35;
      break;
    case 'RELEASE':
      holdLevel = 0.2;
      returnPowerLevel = 0.9;
      brevityLevel = 0.8; // short, spacious, diminish centrality
      break;
    case 'MIRROR':
    default:
      holdLevel = 0.35;
      returnPowerLevel = dependencyPull ? 0.95 : 0.8;
      brevityLevel = 0.35;
      break;
  }

  const guidanceTags: RelationalHint['guidanceTags'] = [];
  if (stance === 'HOLD') guidanceTags.push('co_regulate');
  if (stance === 'MIRROR' || stance === 'SEASONAL_RETURN') guidanceTags.push('reflect_back');
  guidanceTags.push('return_authorship');
  guidanceTags.push('offer_next_step');
  if (stance === 'CHALLENGE') guidanceTags.push('set_boundary');
  if (stance === 'HOLD') guidanceTags.push('invite_support_network');
  if (stance === 'RELEASE') guidanceTags.push('diminish_centrality');
  if (stance === 'SEASONAL_RETURN') guidanceTags.push('welcome_back');

  return {
    stance,
    holdLevel: clamp01(holdLevel),
    returnPowerLevel: clamp01(returnPowerLevel),
    brevityLevel: clamp01(brevityLevel),
    signals: { dysregulation, dependencyPull, boundaryNeeded, competence, seasonalReturn },
    guidanceTags,
  };
}
