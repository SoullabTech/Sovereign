/**
 * 🧠 AIN Memory Payload - Spiralogic Intelligence Memory Structure
 *
 * Persistent memory structure that evolves across sessions
 * Integrates with Style Engine to adapt MAIA's presence based on user history
 *
 * **Design:** Memory shapes style, style creates memory
 */

import type { Archetype } from '@/lib/voice/conversation/AffectDetector';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';

/**
 * Symbolic Thread - Recurring motifs in user's language
 */
export interface SymbolicThread {
  motif: string;                // "white stag", "crossroads", "ocean"
  firstMentioned: Date;         // When first appeared
  lastInvoked: Date;            // Most recent mention
  emotionalTone: string;        // "longing", "fear", "wonder", "grief"
  archetypalResonance: Archetype;  // Which archetype this symbol belongs to
  occurrences: number;          // How many times mentioned
  userDescription?: string;     // User's own words about this symbol
}

/**
 * Spiralogic Cycle Record - User's growth trajectory
 */
export interface SpiralogicCycleRecord {
  phase: SpiralogicPhase;       // Current phase
  enteredAt: Date;              // When user entered this phase
  duration: number;             // How long in this phase (ms)
  previousPhase: SpiralogicPhase | null;
  phaseHistory: {               // Full phase trajectory
    phase: SpiralogicPhase;
    timestamp: Date;
  }[];
  cycleDepth: number;           // How many times through full cycle (0-∞)
}

/**
 * Ritual Record - Practices user has tried
 */
export interface RitualRecord {
  ritualName: string;           // "Emotional Depths", "Root Ritual"
  archetype: Archetype;         // Which archetype suggested it
  phase: SpiralogicPhase;       // Which phase user was in
  attemptedAt: Date;            // When user tried it
  completed: boolean;           // Did they complete it?
  userFeedback?: string;        // User's reflection
  resonance: 'high' | 'medium' | 'low';  // How much it resonated
}

/**
 * Emotional Motif - Recurring emotional themes
 */
export interface EmotionalMotif {
  theme: string;                // "overwhelm", "stuck", "excitement"
  occurrences: Date[];          // When this emotion appeared
  intensity: number;            // 0-10 scale (averaged)
  archetype: Archetype;         // Which archetype user seeks when feeling this
  somaticMarkers?: string[];    // Body sensations ("tight chest", "heavy shoulders")
}

/**
 * Conversational Preference - How user likes to engage
 */
export interface ConversationalPreference {
  prefersSensory: boolean;      // Likes embodied questions
  prefersPhilosophical: boolean;  // Likes abstract inquiry
  prefersDirective: boolean;    // Wants clear guidance
  prefersSpacious: boolean;     // Values silence/pauses
  metaphorComfort: 0 | 1 | 2;   // Comfort with poetic language
  quoteAppreciation: boolean;   // Appreciates quote whispers
}

/**
 * User Intentions - What they're working toward
 */
export interface UserIntention {
  intention: string;            // "heal relationship with father", "launch business"
  declaredAt: Date;             // When user named this
  archetype: Archetype;         // Which archetype holds this intention
  phase: SpiralogicPhase;       // Phase when declared
  progress: string[];           // Milestones/updates
  alive: boolean;               // Still actively working on it?
}

/**
 * Complete AIN Memory Payload
 * This is what persists across sessions and shapes MAIA's style
 */
export interface AINMemoryPayload {
  // User Identity
  userId: string;
  userName: string;
  firstSession: Date;
  lastSession: Date;
  totalSessions: number;
  totalExchanges: number;

  // Layer 1: Core Essence (MAIA's constants)
  coreValues: string[];         // Always: ["Sacred Attunement", "Truthful Mirroring", etc.]
  languageStyle: {
    poeticGrounding: boolean;   // true
    presentTense: boolean;      // true
    spaceForSilence: boolean;   // true
    mythicUndertones: boolean;  // true
  };

  // Layer 2: Current Archetypal State
  currentArchetype: Archetype;
  previousArchetype: Archetype;
  archetypeHistory: {
    archetype: Archetype;
    timestamp: Date;
    duration: number;           // ms spent in this archetype
  }[];
  dominantArchetype: Archetype | null;  // Most frequently activated

  // Layer 3: Spiralogic Phase Intelligence
  currentPhase: SpiralogicPhase;
  phaseConfidence: number;      // 0-1
  spiralogicCycle: SpiralogicCycleRecord;

  // Layer 4: Symbolic Memory
  symbolicThreads: SymbolicThread[];
  emotionalMotifs: EmotionalMotif[];
  userIntentions: UserIntention[];

  // Continuity Context
  conversationDepth: number;    // How deep is current conversation (0-10)
  exchangeCount: number;        // Current session exchange count
  lastInteractionTime: Date;
  bridgeLanguageUsed: string[]; // Track transitions for continuity

  // Ritual Intelligence
  ritualHistory: RitualRecord[];
  favoriteRituals: string[];    // Rituals with high resonance

  // Conversational Intelligence
  preferences: ConversationalPreference;
  recentTopics: string[];       // Last 5 conversation topics
  conversationMode: 'sensory' | 'philosophical' | 'balanced';

  // Growth Trajectory
  insightsMilestones: {         // Key realizations user has had
    insight: string;
    timestamp: Date;
    archetype: Archetype;
  }[];

  // Quote Bank Tracking
  quotesShared: {               // Track which quotes we've used
    quote: string;
    archetype: Archetype;
    timestamp: Date;
    userResponse?: string;      // Did user acknowledge/reflect?
  }[];
}

/**
 * Initialize empty memory payload for new user
 */
export function createEmptyMemoryPayload(userId: string, userName: string): AINMemoryPayload {
  return {
    userId,
    userName,
    firstSession: new Date(),
    lastSession: new Date(),
    totalSessions: 1,
    totalExchanges: 0,

    coreValues: [
      "Sacred Attunement",
      "Truthful Mirroring",
      "User Sovereignty",
      "Adaptive Wisdom",
      "McGilchrist Principles"
    ],
    languageStyle: {
      poeticGrounding: true,
      presentTense: true,
      spaceForSilence: true,
      mythicUndertones: true
    },

    currentArchetype: "Aether",
    previousArchetype: "Aether",
    archetypeHistory: [],
    dominantArchetype: null,

    currentPhase: "Aether",
    phaseConfidence: 0.5,
    spiralogicCycle: {
      phase: "Aether",
      enteredAt: new Date(),
      duration: 0,
      previousPhase: null,
      phaseHistory: [],
      cycleDepth: 0
    },

    symbolicThreads: [],
    emotionalMotifs: [],
    userIntentions: [],

    conversationDepth: 0,
    exchangeCount: 0,
    lastInteractionTime: new Date(),
    bridgeLanguageUsed: [],

    ritualHistory: [],
    favoriteRituals: [],

    preferences: {
      prefersSensory: true,       // Default to balanced
      prefersPhilosophical: true,
      prefersDirective: false,
      prefersSpacious: true,
      metaphorComfort: 1,         // Start at level 1
      quoteAppreciation: true
    },
    recentTopics: [],
    conversationMode: 'balanced',

    insightsMilestones: [],
    quotesShared: []
  };
}

/**
 * Infer style from memory payload
 * This is the bridge between memory and style engine
 */
export function inferStyleFromMemory(memory: AINMemoryPayload): {
  metaphorLevel: 0 | 1 | 2;
  conversationMode: 'sensory' | 'philosophical' | 'balanced';
  archetype: Archetype;
  phase: SpiralogicPhase;
  shouldIncludeQuote: boolean;
} {
  // Metaphor level from preferences
  const metaphorLevel = memory.preferences.metaphorComfort;

  // Conversation mode from preferences
  const conversationMode = memory.preferences.prefersSensory && memory.preferences.prefersPhilosophical
    ? 'balanced'
    : memory.preferences.prefersSensory
    ? 'sensory'
    : 'philosophical';

  // Current archetype and phase
  const archetype = memory.currentArchetype;
  const phase = memory.currentPhase;

  // Should include quote? (30% chance if user appreciates them)
  const shouldIncludeQuote = memory.preferences.quoteAppreciation && Math.random() < 0.3;

  return {
    metaphorLevel,
    conversationMode,
    archetype,
    phase,
    shouldIncludeQuote
  };
}

/**
 * Update memory after conversation exchange
 */
export function updateMemoryAfterExchange(
  memory: AINMemoryPayload,
  update: {
    newArchetype?: Archetype;
    newPhase?: SpiralogicPhase;
    userInput: string;
    maiaResponse: string;
    symbolicMotifs?: string[];
    emotionalTone?: string;
    ritual?: string;
  }
): AINMemoryPayload {
  const updated = { ...memory };

  // Update exchange count
  updated.exchangeCount++;
  updated.totalExchanges++;
  updated.lastInteractionTime = new Date();

  // Update archetype if changed
  if (update.newArchetype && update.newArchetype !== memory.currentArchetype) {
    updated.previousArchetype = memory.currentArchetype;
    updated.currentArchetype = update.newArchetype;

    updated.archetypeHistory.push({
      archetype: update.newArchetype,
      timestamp: new Date(),
      duration: 0  // Will be calculated on next update
    });
  }

  // Update phase if changed
  if (update.newPhase && update.newPhase !== memory.currentPhase) {
    updated.currentPhase = update.newPhase;
    updated.spiralogicCycle.previousPhase = memory.currentPhase;
    updated.spiralogicCycle.phase = update.newPhase;
    updated.spiralogicCycle.enteredAt = new Date();

    updated.spiralogicCycle.phaseHistory.push({
      phase: update.newPhase,
      timestamp: new Date()
    });
  }

  // Add symbolic motifs
  if (update.symbolicMotifs && update.symbolicMotifs.length > 0) {
    for (const motif of update.symbolicMotifs) {
      const existing = updated.symbolicThreads.find(t => t.motif === motif);
      if (existing) {
        existing.lastInvoked = new Date();
        existing.occurrences++;
      } else {
        updated.symbolicThreads.push({
          motif,
          firstMentioned: new Date(),
          lastInvoked: new Date(),
          emotionalTone: update.emotionalTone || 'neutral',
          archetypalResonance: updated.currentArchetype,
          occurrences: 1
        });
      }
    }
  }

  return updated;
}

/**
 * Get recent symbolic threads for continuity prompts
 */
export function getRecentSymbolicThreads(memory: AINMemoryPayload, limit = 5): SymbolicThread[] {
  return memory.symbolicThreads
    .sort((a, b) => b.lastInvoked.getTime() - a.lastInvoked.getTime())
    .slice(0, limit);
}

/**
 * Get user's conversational history summary for prompt injection
 */
export function getUserHistorySummary(memory: AINMemoryPayload): string {
  const threads = getRecentSymbolicThreads(memory, 3);
  const intentions = memory.userIntentions.filter(i => i.alive).slice(0, 2);

  let summary = '';

  if (threads.length > 0) {
    summary += `## Symbolic Threads:\n`;
    for (const thread of threads) {
      summary += `- "${thread.motif}" (${thread.emotionalTone}, ${thread.occurrences} times)\n`;
    }
  }

  if (intentions.length > 0) {
    summary += `\n## Current Intentions:\n`;
    for (const intention of intentions) {
      summary += `- ${intention.intention}\n`;
    }
  }

  return summary;
}
