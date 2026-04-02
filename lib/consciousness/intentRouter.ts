// lib/consciousness/intentRouter.ts
// Relational Routing v1 — field-level intent detection + doorway generation
// Deterministic keyword matching. No model calls. No side effects.

import type { MaiaIntent, IntentRoute, MaiaUiAction } from '@/lib/types/ai';

// --- Lead-in pools (randomly selected to prevent pattern fatigue) ---

const LEAD_IN_POOLS: Record<Exclude<MaiaIntent, 'unknown'>, string[]> = {
  journal_entry: [
    'This wants to be written down.',
    'There\'s more here than a conversation can hold.',
    'This might land differently on the page.',
  ],
  reflection_mark: [
    'Something important just happened.',
    'That one landed.',
    'Worth holding onto.',
  ],
  idea_emergence: [
    'There\'s something forming here.',
    'An idea is taking shape.',
    'Something wants to come through.',
  ],
  decision_point: [
    'This might be a decision point.',
    'There\'s a choice taking shape here.',
    'Something here wants to be clarified.',
  ],
  change_process: [
    'Something is shifting.',
    'There\'s movement happening.',
    'This feels like a turning point.',
  ],
  pattern_encounter: [
    'Something keeps returning here\u2026 almost the same shape each time.',
    'There\u2019s a pattern in this\u2026 it\u2019s not the first time.',
    'This has a shape to it\u2026 something you\u2019ve circled before.',
  ],
  journey_recognition: [
    'You\u2019ve been moving through this for longer than this conversation\u2026',
    'There\u2019s a longer arc here\u2026 this didn\u2019t start today.',
    'Something has been unfolding\u2026 quietly, across time.',
  ],
  depth_emergence: [
    'There may be more beneath this\u2026 something that hasn\u2019t surfaced yet.',
    'Something deeper is stirring here\u2026 not quite words yet.',
    'This touches something beyond the surface\u2026 worth staying with.',
  ],
};

// --- Keyword patterns per intent ---

const INTENT_KEYWORDS: Record<Exclude<MaiaIntent, 'unknown'>, string[]> = {
  journal_entry: ['journal', 'write', 'put this down', 'write about', 'get this out'],
  reflection_mark: ['important', 'remember', 'hold onto', 'significant', 'that landed', 'meaningful'],
  idea_emergence: ['idea', 'forming', 'emerging', 'what if', 'imagine', 'could we', 'thinking about'],
  decision_point: ['decide', 'decision', 'choose', 'which way', "don't know what to do", 'torn between', 'should i', 'weigh', 'options'],
  change_process: ['change', 'shifting', 'transform', 'letting go', 'moving on', 'turning point', 'transition', 'evolving'],
  pattern_encounter: ['pattern', 'loop', 'again', 'stuck', 'keep doing', 'repeating', 'cycle', 'same thing', 'over and over', 'habit', 'recurring'],
  journey_recognition: ['been through', 'journey', 'growing', 'over time', 'looking back', 'how far', 'progress', 'evolution', 'where i was', 'different now', 'changed'],
  depth_emergence: ['meaning', 'soul', 'sacred', 'beneath', 'deeper', 'spiritual', 'symbol', 'dream', 'mystery', 'why am i here', 'existential', 'divine', 'purpose'],
};

// --- Detection ---

export interface IntentDetectionResult {
  intent: MaiaIntent;
  confidence: number;
}

/**
 * Detect intent from the conversational field (user + MAIA response).
 * Reads both sides to capture what happened, not just what was typed.
 */
export function detectIntent(field: {
  userInput: string;
  maiaResponse: string;
}): IntentDetectionResult {
  // Short inputs = noise. Suppress.
  if (field.userInput.length < 20) {
    return { intent: 'unknown', confidence: 0 };
  }

  const text = (field.userInput + ' ' + field.maiaResponse).toLowerCase();

  let bestIntent: MaiaIntent = 'unknown';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as MaiaIntent;
    }
  }

  // Confidence threshold: must have at least 1 keyword hit
  if (bestScore < 1) {
    return { intent: 'unknown', confidence: 0 };
  }

  // Suppress during active questioning (confidence 1 + user asking a question)
  if (bestScore === 1 && field.userInput.trim().endsWith('?')) {
    return { intent: 'unknown', confidence: 0 };
  }

  return { intent: bestIntent, confidence: bestScore };
}

// --- Routing ---

export function getIntentRoute(intent: MaiaIntent): IntentRoute {
  switch (intent) {
    case 'journal_entry':
      return { intent, capability: 'journal', openUi: 'panel' };
    case 'reflection_mark':
      return { intent, capability: 'reflection', openUi: 'card' };
    case 'idea_emergence':
      return { intent, capability: 'ideas', openUi: 'panel' };
    case 'decision_point':
      return { intent, capability: 'decisions', openUi: 'panel' };
    case 'change_process':
      return { intent, capability: 'changes', openUi: 'panel' };
    case 'pattern_encounter':
      return { intent, capability: 'patterns', openUi: 'panel' };
    case 'journey_recognition':
      return { intent, capability: 'journey', openUi: 'panel' };
    case 'depth_emergence':
      return { intent, capability: 'depth', openUi: 'panel' };
    default:
      return { intent, capability: 'conversation', openUi: 'none' };
  }
}

// --- UI Action ---

const ACTION_LABELS: Record<Exclude<MaiaIntent, 'unknown'>, string> = {
  journal_entry: 'Write this out',
  reflection_mark: 'Mark this moment',
  idea_emergence: 'Develop this idea',
  decision_point: 'Enter Decision Space',
  change_process: 'Track this change',
  pattern_encounter: 'Step into this pattern',
  journey_recognition: 'See where you\u2019ve been',
  depth_emergence: 'Go deeper',
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildUiAction(
  route: IntentRoute,
  confidence: number,
): MaiaUiAction {
  if (route.intent === 'unknown' || route.openUi === 'none') {
    return { type: 'none' };
  }

  const intent = route.intent as Exclude<MaiaIntent, 'unknown'>;

  const typeMap: Record<Exclude<MaiaIntent, 'unknown'>, MaiaUiAction['type']> = {
    journal_entry: 'open_journal',
    reflection_mark: 'open_reflection',
    idea_emergence: 'open_ideas',
    decision_point: 'open_decisions',
    change_process: 'open_changes',
    pattern_encounter: 'enter_patterns',
    journey_recognition: 'enter_journey',
    depth_emergence: 'enter_depth',
  };

  const WORLD_INTENTS: Set<string> = new Set([
    'pattern_encounter', 'journey_recognition', 'depth_emergence',
  ]);

  return {
    type: typeMap[intent],
    label: ACTION_LABELS[intent],
    leadIn: pickRandom(LEAD_IN_POOLS[intent]),
    confidence,
    isWorldDoorway: WORLD_INTENTS.has(intent),
  };
}
