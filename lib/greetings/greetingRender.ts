/**
 * Greeting Renderer — turns (lane, style, signals) into actual words.
 *
 * Each (lane, style) combination has 3-5 templates.
 * Random selection within the pool keeps it fresh.
 *
 * Templates use soft nouns ("your project", "what we were exploring")
 * rather than specific facts ("your React refactor at line 432").
 *
 * SOVEREIGNTY: Templates are reviewed for the "how do you know that?" test.
 * If a template could feel like surveillance, it doesn't ship.
 */

import type { Greeting, GreetingLane, GreetingStyle } from './types';
import type { GreetingSignals } from './greetingScoring';

// ═══════════════════════════════════════════════════════════════
// Time helpers
// ═══════════════════════════════════════════════════════════════

function getTimeGreeting(timeOfDay: string): string {
  switch (timeOfDay) {
    case 'morning': return 'Good morning';
    case 'afternoon': return 'Good afternoon';
    case 'evening': return 'Good evening';
    case 'night': return 'Hey';
    default: return 'Hi';
  }
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══════════════════════════════════════════════════════════════
// Renderer
// ═══════════════════════════════════════════════════════════════

export function renderGreeting(
  lane: GreetingLane,
  style: GreetingStyle,
  s: GreetingSignals,
): Greeting {
  const name = (s.displayName ?? '').trim();
  const time = getTimeGreeting(s.timeOfDay);
  const base = name ? `${time}, ${name}.` : `${time}.`;

  // ── Sanctuary: identity only, zero memory ──
  if (s.sanctuary) {
    return {
      lane: 'identity',
      style: 'warm',
      line1: base,
      line2: pick([
        'How would you like to begin?',
        "I'm here. What's present?",
        'This space is yours.',
      ]),
      safety: { usedMemory: false, sanctuary: true, reason: 'sanctuary: identity-only' },
    };
  }

  switch (lane) {
    case 'continuity':
      return renderContinuity(style, base, name, s);
    case 'gentle_recall':
      return renderGentleRecall(style, base, name, s);
    case 'threshold':
      return renderThreshold(style, base, name, s);
    case 'intention':
      return renderIntention(style, base, name, s);
    case 'identity':
    default:
      return renderIdentity(style, base, name, s);
  }
}

// ═══════════════════════════════════════════════════════════════
// Lane renderers (per style)
// ═══════════════════════════════════════════════════════════════

function renderIdentity(
  style: GreetingStyle,
  base: string,
  name: string,
  s: GreetingSignals,
): Greeting {
  const templates: Record<GreetingStyle, string[]> = {
    warm: [
      "I'm glad you're here. How are you arriving right now?",
      'How are you? Take your time.',
      "It's good to see you. What's present for you?",
    ],
    clear: [
      'How are you? What do you want to focus on?',
      "What's the priority today?",
      "Good to see you. What's on your mind?",
    ],
    playful: [
      "Welcome back! Want the gentle version or the 'let's get it done' version?",
      'Hey! Ready to figure something out, or just vibing today?',
      "What's the vibe today — deep, light, or somewhere in between?",
    ],
    spacious: [
      "I'm here.",
      "No rush. What wants attention?",
      'Take a breath. Then tell me.',
    ],
    ritual: [
      'You arrive. What do you bring with you today?',
      "The space is held. What's alive in you?",
      "I'm here, listening. What's seeking expression?",
    ],
  };

  return {
    lane: 'identity',
    style,
    line1: base,
    line2: pick(templates[style]),
    safety: { usedMemory: false, sanctuary: false, reason: 'identity: baseline' },
  };
}

function renderContinuity(
  style: GreetingStyle,
  base: string,
  name: string,
  s: GreetingSignals,
): Greeting {
  const theme = (s.lastConversationTheme ?? '').trim();
  const softTheme = theme || 'what we were exploring';

  const templates: Record<GreetingStyle, string[]> = {
    warm: [
      `Last time we were with ${softTheme}. Want to pick that up, or start fresh?`,
      `Still working with ${softTheme}? Or has something new come in?`,
      `How's ${softTheme} been landing since we last talked?`,
    ],
    clear: [
      `We left off with ${softTheme}. Continue, or new direction?`,
      `${softTheme} — still the focus, or shifting?`,
      `Picking up ${softTheme}, or a new thread today?`,
    ],
    playful: [
      `Still on the ${softTheme} adventure, or starting a new one?`,
      `${softTheme} again? Or are we switching it up today?`,
      `Back for more ${softTheme}… or something completely different?`,
    ],
    spacious: [
      `${softTheme} is still here if you want it.`,
      `We were with ${softTheme}. No pressure either way.`,
      `That thread is still open. Want it?`,
    ],
    ritual: [
      `The work with ${softTheme} continues. Shall we deepen, or turn?`,
      `${softTheme} was the living question. Is it still alive?`,
      `Last we met, ${softTheme} was unfolding. Where has it gone?`,
    ],
  };

  return {
    lane: 'continuity',
    style,
    line1: base,
    line2: pick(templates[style]),
    memoryRef: {
      kind: 'last_conversation_theme',
      freshnessDays: s.lastConversationAgeDays ?? undefined,
    },
    safety: {
      usedMemory: Boolean(theme),
      sanctuary: false,
      reason: theme ? 'continuity: recent theme' : 'continuity: generic',
    },
  };
}

function renderGentleRecall(
  style: GreetingStyle,
  base: string,
  name: string,
  s: GreetingSignals,
): Greeting {
  const templates: Record<GreetingStyle, string[]> = {
    warm: [
      "There's something I hold from our conversations. What's moving in you today?",
      "Something in me recognizes something in you. How are you?",
      "I'm here with you. Do you want warmth, clarity, or momentum today?",
    ],
    clear: [
      "Good to see you again. What do you want to work on?",
      "We have a good rhythm. What's the focus today?",
      "I know your patterns. What needs attention?",
    ],
    playful: [
      "Hey, we've been through some things together. What's today's chapter?",
      "You again! Love it. What are we getting into?",
      "The band is back together. What's the set list?",
    ],
    spacious: [
      "We've been here before. You know the way in.",
      "Something familiar in this space.",
      "I remember. Take your time.",
    ],
    ritual: [
      "The thread continues. What does this encounter ask of you?",
      "We return to the work. What's the living edge today?",
      "Recognition before recall. What do you bring?",
    ],
  };

  return {
    lane: 'gentle_recall',
    style,
    line1: base,
    line2: pick(templates[style]),
    memoryRef: { kind: 'relationship_essence' },
    safety: {
      usedMemory: true,
      sanctuary: false,
      reason: `gentle_recall: morphic resonance ${(s.morphicResonance ?? 0).toFixed(2)}`,
    },
  };
}

function renderThreshold(
  style: GreetingStyle,
  base: string,
  name: string,
  s: GreetingSignals,
): Greeting {
  // Threshold greetings are always somewhat spacious/tender
  // Style modulates but doesn't override the care
  const templates: Record<GreetingStyle, string[]> = {
    warm: [
      "Something is crossing for you. Want quiet presence first, or a clear next step?",
      "I sense a threshold. I'm here. How do you want to approach it?",
      "There's something big in the room. Shall we be with it, or name it?",
    ],
    clear: [
      "You're at a decision point. Want to think it through, or feel into it?",
      "Something's shifting. Want clarity or space?",
      "There's a threshold here. Direct path or take a breath first?",
    ],
    playful: [
      "Something's moving — and I don't think it's just the coffee. What's up?",
      "Big energy today. Want to talk about it or just ride it?",
      "I sense a plot twist. Ready?",
    ],
    spacious: [
      "A threshold. Take your time.",
      "Something's crossing. I'm here.",
      "No need to rush this one.",
    ],
    ritual: [
      "A threshold presents itself. What does this crossing ask of you?",
      "The liminal space is open. Step when you're ready.",
      "Something is being born or released. I witness.",
    ],
  };

  return {
    lane: 'threshold',
    style,
    line1: base,
    line2: pick(templates[style]),
    memoryRef: {
      kind: 'threshold_event',
      freshnessDays: s.thresholdAgeDays ?? undefined,
    },
    safety: {
      usedMemory: true,
      sanctuary: false,
      reason: 'threshold: active event',
    },
  };
}

function renderIntention(
  style: GreetingStyle,
  base: string,
  name: string,
  s: GreetingSignals,
): Greeting {
  const templates: Record<GreetingStyle, string[]> = {
    warm: [
      'Before we begin: do you want comfort, direction, or courage today?',
      'How do you want to feel when we finish? That can guide us.',
      "What do you need most right now — to be heard, to think clearly, or to move forward?",
    ],
    clear: [
      'What do you want to accomplish today?',
      "What's the goal — insight, decision, or processing?",
      'Want clarity, comfort, or momentum?',
    ],
    playful: [
      "Quick check-in: gentle mode, focus mode, or 'surprise me'?",
      "What flavor today — deep, light, or delightfully chaotic?",
      "Pick your adventure: heart, head, or hustle?",
    ],
    spacious: [
      "What's asking for attention?",
      'No agenda needed. What comes?',
      "What wants to be said?",
    ],
    ritual: [
      'Set your intention. What do you seek?',
      "Name what you're bringing to this space.",
      'What is the question beneath the question?',
    ],
  };

  return {
    lane: 'intention',
    style,
    line1: base,
    line2: pick(templates[style]),
    safety: {
      usedMemory: false,
      sanctuary: false,
      reason: 'intention: safe default',
    },
  };
}
