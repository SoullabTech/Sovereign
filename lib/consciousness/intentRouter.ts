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
};

// --- Hard triggers: phrases that ALWAYS produce a doorway (bypass scoring) ---

const HARD_TRIGGERS: Record<Exclude<MaiaIntent, 'unknown'>, string[]> = {
  journal_entry: ['i want to write this', 'i want to journal', 'i should journal', 'write this out', 'write this down'],
  reflection_mark: ['that felt important', 'i want to remember this', 'that one landed', 'worth holding onto'],
  idea_emergence: ['i have an idea', 'idea forming', 'an idea is forming', 'develop this idea', 'there\'s something forming'],
  decision_point: ['i need to decide', 'i need to make a decision', 'make a decision', 'help me decide'],
  change_process: ['something is shifting', 'going through a change', 'i feel a shift', 'something is changing'],
};

// --- Keyword patterns per intent (softer signals, scored) ---

const INTENT_KEYWORDS: Record<Exclude<MaiaIntent, 'unknown'>, string[]> = {
  journal_entry: ['journal', 'write', 'put this down', 'write about', 'get this out'],
  reflection_mark: ['important', 'remember', 'hold onto', 'significant', 'that landed', 'meaningful'],
  idea_emergence: ['idea', 'forming', 'emerging', 'what if', 'imagine', 'could we', 'thinking about'],
  decision_point: ['decide', 'decision', 'choose', 'which way', "don't know what to do", 'torn between', 'should i', 'weigh', 'options'],
  change_process: ['change', 'shifting', 'transform', 'letting go', 'moving on', 'turning point', 'transition', 'evolving'],
};

// --- Detection ---

export interface IntentDetectionResult {
  intent: MaiaIntent;
  confidence: number;
}

/**
 * Detect intent primarily from user input. MAIA response is secondary signal only.
 * Hard triggers bypass scoring — these are the phrases that should ALWAYS fire.
 */
export function detectIntent(field: {
  userInput: string;
  maiaResponse: string;
}): IntentDetectionResult {
  const userText = field.userInput.toLowerCase().trim();

  // --- Hard triggers: exact phrase match on user input only ---
  for (const [intent, phrases] of Object.entries(HARD_TRIGGERS)) {
    for (const phrase of phrases) {
      if (userText.includes(phrase)) {
        return { intent: intent as MaiaIntent, confidence: 10 };
      }
    }
  }

  // --- Soft detection: keyword scoring, user-weighted ---
  // Very short inputs (< 10 chars) with no hard trigger = skip
  if (userText.length < 10) {
    return { intent: 'unknown', confidence: 0 };
  }

  let bestIntent: MaiaIntent = 'unknown';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      // User input keywords count double
      if (userText.includes(keyword)) {
        score += 2;
      }
      // MAIA response keywords count single (supporting signal only)
      else if (field.maiaResponse.toLowerCase().includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as MaiaIntent;
    }
  }

  // Confidence threshold: must have at least 2 score (= 1 user keyword)
  if (bestScore < 2) {
    return { intent: 'unknown', confidence: 0 };
  }

  // Suppress during active questioning (low confidence + user asking a question)
  if (bestScore <= 2 && field.userInput.trim().endsWith('?')) {
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
  };

  return {
    type: typeMap[intent],
    label: ACTION_LABELS[intent],
    leadIn: pickRandom(LEAD_IN_POOLS[intent]),
    confidence,
  };
}
