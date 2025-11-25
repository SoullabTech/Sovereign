/**
 * 🔮 Symbolic Predictor - MAIA's Intuitive Perception Engine
 *
 * Predicts phase transitions & tracks symbolic resonance
 * This is what gives MAIA "anticipatory intelligence"
 *
 * Design Principles:
 * - Phase prediction based on emotional trajectory + symbolic patterns
 * - Symbolic resonance decay (symbols fade unless reinforced)
 * - Internal reflection notes (MAIA's silent contemplation)
 * - Soft forecasting, not deterministic prediction
 */

import type { AINMemoryPayload, SymbolicThread } from './AINMemoryPayload';
import type { Archetype } from '@/lib/voice/conversation/AffectDetector';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import { detectSpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import { inferMoodAndArchetype } from '@/lib/voice/conversation/AffectDetector';

/**
 * Symbolic resonance score (0-1)
 * High resonance = symbol is "alive" in user's field
 */
export interface SymbolResonance {
  motif: string;
  score: number; // 0-1
  lastMentioned: Date;
  frequency: number; // Total occurrences
  peakIntensity: number; // Highest emotional intensity when mentioned
  associatedPhases: SpiralogicPhase[]; // Which phases this symbol appears in
}

/**
 * Phase transition forecast
 */
export interface PhaseVector {
  currentPhase: SpiralogicPhase;
  nextPhaseLikely: SpiralogicPhase;
  confidence: number; // 0-1
  reasoning: string; // Why this prediction
  timeToTransition?: number; // Estimated exchanges until transition
}

/**
 * MAIA's internal reflection
 * Silent contemplation between sessions
 */
export interface InternalReflection {
  timestamp: Date;
  phaseContext: SpiralogicPhase;
  observation: string; // Short note about what's emerging
  symbolsNoticed: string[]; // Key symbols in this reflection
  emotionalUndercurrent: string; // Subtle emotional pattern detected
}

/**
 * Phase transition patterns
 * Based on Spiralogic cycle logic + emotional flow
 */
const PHASE_TRANSITIONS: Record<SpiralogicPhase, {
  naturalNext: SpiralogicPhase;
  possibleJumps: SpiralogicPhase[];
  emotionalSignals: string[];
}> = {
  Fire: {
    naturalNext: 'Water',
    possibleJumps: ['Air', 'Aether'],
    emotionalSignals: ['exhausted', 'overwhelmed', 'need to slow down', 'tired']
  },
  Water: {
    naturalNext: 'Earth',
    possibleJumps: ['Fire', 'Air'],
    emotionalSignals: ['clarity', 'ready to move', 'grounded', 'stable']
  },
  Earth: {
    naturalNext: 'Air',
    possibleJumps: ['Fire', 'Aether'],
    emotionalSignals: ['perspective', 'seeing patterns', 'understanding', 'reframe']
  },
  Air: {
    naturalNext: 'Aether',
    possibleJumps: ['Fire', 'Earth'],
    emotionalSignals: ['integration', 'wholeness', 'synthesis', 'mystery']
  },
  Aether: {
    naturalNext: 'Fire',
    possibleJumps: ['Water', 'Earth'],
    emotionalSignals: ['new beginning', 'action', 'energy', 'initiative']
  }
};

/**
 * Symbol-to-Phase associations
 * Certain symbols naturally resonate with phases
 */
const SYMBOL_PHASE_MAP: Record<string, SpiralogicPhase[]> = {
  // Fire symbols
  'fire': ['Fire'],
  'flame': ['Fire'],
  'volcano': ['Fire'],
  'sun': ['Fire', 'Aether'],

  // Water symbols
  'river': ['Water'],
  'ocean': ['Water'],
  'lake': ['Water'],
  'rain': ['Water'],
  'tears': ['Water'],

  // Earth symbols
  'mountain': ['Earth', 'Aether'],
  'cave': ['Earth'],
  'stone': ['Earth'],
  'forest': ['Earth'],
  'root': ['Earth'],

  // Air symbols
  'wind': ['Air'],
  'sky': ['Air', 'Aether'],
  'bird': ['Air'],
  'feather': ['Air'],
  'breath': ['Air', 'Aether'],

  // Aether symbols
  'star': ['Aether'],
  'void': ['Aether'],
  'light': ['Aether'],
  'dream': ['Aether', 'Water'],
  'spiral': ['Aether']
};

/**
 * Predict next phase based on current state + trajectory
 */
export function predictNextPhase(
  memory: AINMemoryPayload,
  recentUserText?: string
): PhaseVector {
  const current = memory.currentPhase;
  const progress = (memory.spiralogicCycle as any).progressPercent || 0;
  const phaseConfig = PHASE_TRANSITIONS[current];

  // Default to natural progression
  let predictedPhase = phaseConfig.naturalNext;
  let confidence = 0.6; // Base confidence
  let reasoning = `Natural progression from ${current}`;

  // Check emotional signals for possible jump
  if (recentUserText) {
    const lower = recentUserText.toLowerCase();

    // Check for strong phase signals
    for (const jump of phaseConfig.possibleJumps) {
      const jumpConfig = PHASE_TRANSITIONS[jump];
      const signalCount = jumpConfig.emotionalSignals.filter(signal =>
        lower.includes(signal)
      ).length;

      if (signalCount > 0) {
        predictedPhase = jump;
        confidence = Math.min(0.9, 0.6 + (signalCount * 0.15));
        reasoning = `Emotional signals point toward ${jump}`;
        break;
      }
    }
  }

  // Check symbolic patterns
  const recentSymbols = memory.symbolicThreads
    .filter(t => Date.now() - t.lastInvoked.getTime() < 7 * 24 * 60 * 60 * 1000) // Last 7 days
    .map(t => t.motif);

  const symbolPhaseVotes: Record<SpiralogicPhase, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    Aether: 0
  };

  for (const symbol of recentSymbols) {
    const phases = SYMBOL_PHASE_MAP[symbol] || [];
    phases.forEach(phase => {
      symbolPhaseVotes[phase]++;
    });
  }

  // Find strongest symbolic pull (excluding current phase)
  let maxVotes = 0;
  let symbolicPhase: SpiralogicPhase | null = null;

  for (const [phase, votes] of Object.entries(symbolPhaseVotes)) {
    if (phase !== current && votes > maxVotes) {
      maxVotes = votes;
      symbolicPhase = phase as SpiralogicPhase;
    }
  }

  // If symbols strongly suggest different phase, adjust prediction
  if (symbolicPhase && maxVotes >= 3) {
    predictedPhase = symbolicPhase;
    confidence = Math.min(0.85, 0.5 + (maxVotes * 0.1));
    reasoning = `Symbolic patterns (${maxVotes} resonant motifs) point toward ${symbolicPhase}`;
  }

  // Estimate time to transition based on progress
  const timeToTransition = progress >= 80
    ? Math.ceil((100 - progress) / 2) // Fast (2% per exchange)
    : Math.ceil((100 - progress) / 5); // Slower estimate

  return {
    currentPhase: current,
    nextPhaseLikely: predictedPhase,
    confidence,
    reasoning,
    timeToTransition
  };
}

/**
 * Update symbolic resonance after each exchange
 * Symbols gain strength when mentioned, decay over time
 */
export function updateSymbolResonance(
  memory: AINMemoryPayload,
  userText: string
): Map<string, SymbolResonance> {
  const resonanceMap = new Map<string, SymbolResonance>();
  const now = Date.now();

  // Convert symbolic threads to resonance scores
  for (const thread of memory.symbolicThreads) {
    const daysSinceLastMention = (now - thread.lastInvoked.getTime()) / (24 * 60 * 60 * 1000);

    // Decay formula: score drops 10% per day
    const decayFactor = Math.pow(0.9, daysSinceLastMention);

    // Base score from frequency (normalized)
    const frequencyScore = Math.min(1.0, thread.occurrences * 0.2);

    // Recency bonus (mentioned recently = higher resonance)
    const recencyBonus = daysSinceLastMention < 1 ? 0.3 :
                         daysSinceLastMention < 3 ? 0.15 :
                         daysSinceLastMention < 7 ? 0.05 : 0;

    // Final resonance score
    const score = Math.min(1.0, (frequencyScore * decayFactor) + recencyBonus);

    // Get associated phases for this symbol
    const associatedPhases = SYMBOL_PHASE_MAP[thread.motif] || [];

    resonanceMap.set(thread.motif, {
      motif: thread.motif,
      score,
      lastMentioned: thread.lastInvoked,
      frequency: thread.occurrences,
      peakIntensity: 0.5, // Could track from emotional motifs later
      associatedPhases
    });
  }

  // Check if any new symbols appear in current text
  const lower = userText.toLowerCase();
  for (const [symbol, phases] of Object.entries(SYMBOL_PHASE_MAP)) {
    const pattern = new RegExp(`\\b${symbol}\\b`, 'i');
    if (pattern.test(lower)) {
      const existing = resonanceMap.get(symbol);
      if (existing) {
        // Boost existing symbol
        existing.score = Math.min(1.0, existing.score + 0.2);
        existing.lastMentioned = new Date();
        existing.frequency++;
      } else {
        // New symbol just appeared
        resonanceMap.set(symbol, {
          motif: symbol,
          score: 0.5, // Medium initial resonance
          lastMentioned: new Date(),
          frequency: 1,
          peakIntensity: 0.5,
          associatedPhases: phases
        });
      }
    }
  }

  return resonanceMap;
}

/**
 * Generate internal reflection
 * MAIA's silent contemplation between sessions
 */
export function generateInternalReflection(
  memory: AINMemoryPayload,
  phaseVector: PhaseVector,
  symbolResonance: Map<string, SymbolResonance>
): InternalReflection {
  const phase = memory.currentPhase;

  // Get top 3 resonant symbols
  const topSymbols = Array.from(symbolResonance.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.motif);

  // Detect emotional undercurrent from recent motifs
  const recentEmotions = memory.emotionalMotifs
    .filter(m => {
      const recentOccurrence = m.occurrences.find(d =>
        Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000
      );
      return recentOccurrence !== undefined;
    })
    .map(m => m.theme);

  const dominantEmotion = recentEmotions[0] || 'neutral';

  // Generate observation based on phase + symbols + prediction
  let observation = '';

  if (phaseVector.confidence > 0.7) {
    // Strong prediction
    observation = `Movement toward ${phaseVector.nextPhaseLikely} is becoming clear.`;

    if (topSymbols.length > 0) {
      observation += ` The symbols (${topSymbols.join(', ')}) are beginning to cluster.`;
    }
  } else if (topSymbols.length >= 2) {
    // Symbolic activity
    observation = `Recurring imagery: ${topSymbols.join(', ')}. These motifs are weaving together.`;
  } else if (memory.exchangeCount < 5) {
    // Early conversation
    observation = `Early stages. Presence and patience.`;
  } else {
    // Neutral observation
    observation = `Holding space in ${phase}. Watching for what wants to emerge.`;
  }

  return {
    timestamp: new Date(),
    phaseContext: phase,
    observation,
    symbolsNoticed: topSymbols,
    emotionalUndercurrent: dominantEmotion
  };
}

/**
 * Get most resonant symbols (for use in conversation)
 * Returns top N symbols with score > threshold
 */
export function getMostResonantSymbols(
  resonanceMap: Map<string, SymbolResonance>,
  count: number = 3,
  threshold: number = 0.5
): SymbolResonance[] {
  return Array.from(resonanceMap.values())
    .filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

/**
 * Check if symbol should be echoed in conversation
 * Returns true if symbol is highly resonant and wasn't just mentioned
 */
export function shouldEchoSymbol(
  symbol: string,
  resonanceMap: Map<string, SymbolResonance>,
  lastEchoedSymbol?: string,
  minResonance: number = 0.7
): boolean {
  const resonance = resonanceMap.get(symbol);
  if (!resonance) return false;

  // Don't echo if we just echoed it
  if (lastEchoedSymbol === symbol) return false;

  // Echo if highly resonant + not mentioned very recently (let it marinate)
  const hoursSinceLastMention = (Date.now() - resonance.lastMentioned.getTime()) / (60 * 60 * 1000);

  return resonance.score >= minResonance && hoursSinceLastMention > 2;
}

/**
 * Complete prediction update
 * Call this after each memory update
 */
export function completeSymbolicPrediction(
  memory: AINMemoryPayload,
  userText: string
): {
  phaseVector: PhaseVector;
  symbolResonance: Map<string, SymbolResonance>;
  internalReflection: InternalReflection;
} {
  // 1. Predict next phase
  const phaseVector = predictNextPhase(memory, userText);

  // 2. Update symbolic resonance
  const symbolResonance = updateSymbolResonance(memory, userText);

  // 3. Generate internal reflection
  const internalReflection = generateInternalReflection(
    memory,
    phaseVector,
    symbolResonance
  );

  return {
    phaseVector,
    symbolResonance,
    internalReflection
  };
}

/**
 * Example Usage in VoiceOrchestrator:
 *
 * // After memory update
 * const prediction = completeSymbolicPrediction(updatedMemory, userInput);
 *
 * // Use phase vector for subtle guidance
 * if (prediction.phaseVector.confidence > 0.8) {
 *   console.log('📊 Phase transition likely:', prediction.phaseVector.nextPhaseLikely);
 * }
 *
 * // Check for resonant symbols to echo
 * const resonantSymbols = getMostResonantSymbols(prediction.symbolResonance);
 * if (resonantSymbols.length > 0) {
 *   console.log('🔮 Active symbols:', resonantSymbols.map(s => s.motif));
 * }
 *
 * // Log internal reflection (for debugging or UI)
 * console.log('💭 MAIA reflects:', prediction.internalReflection.observation);
 *
 * // Save reflection to memory if desired
 * await saveReflection(userId, prediction.internalReflection);
 */
