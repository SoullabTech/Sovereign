/**
 * 🧬 Memory Updater - MAIA's Inner Witness
 *
 * Gives MAIA living continuity across sessions
 * Gently evolves her emotional map, phase drift, symbolic threads
 *
 * Design Principles:
 * - Incremental evolution, never total overwrite
 * - Symbolic pattern recognition, not literal sentiment
 * - Phase fluidity with small drift toward resonance
 * - Respect user sovereignty (only evolve from expressed intention)
 */

import type { AINMemoryPayload, SymbolicThread, EmotionalMotif, UserIntention } from './AINMemoryPayload';
import type { Archetype } from '@/lib/voice/conversation/AffectDetector';
import type { SpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import { detectSpiralogicPhase } from '@/lib/spiralogic/PhaseDetector';
import { inferMoodAndArchetype } from '@/lib/voice/conversation/AffectDetector';

/**
 * Extract symbolic motifs from text
 * Looks for repeated imagery, metaphors, dreams
 */
export function extractSymbolicMotifs(text: string): string[] {
  const lower = text.toLowerCase();
  const motifs: string[] = [];

  // Common symbolic patterns
  const symbolPatterns = {
    // Nature
    'river': /\briver\b|\bstream\b|\bflow\b/,
    'mountain': /\bmountain\b|\bpeak\b|\bsummit\b/,
    'ocean': /\bocean\b|\bsea\b|\bwave\b|\btide\b/,
    'forest': /\bforest\b|\bwood\b|\btree\b/,
    'desert': /\bdesert\b|\bwilderness\b/,
    'sky': /\bsky\b|\bcloud\b|\bhorizon\b/,

    // Animals (archetypal)
    'wolf': /\bwolf\b|\bwolves\b/,
    'bear': /\bbear\b/,
    'eagle': /\beagle\b|\bhawk\b|\bbird of prey\b/,
    'snake': /\bsnake\b|\bserpent\b/,
    'deer': /\bdeer\b|\bstag\b|\bdoe\b/,
    'dragon': /\bdragon\b/,

    // Thresholds
    'door': /\bdoor\b|\bdoorway\b|\bthreshold\b/,
    'bridge': /\bbridge\b|\bcrossing\b/,
    'crossroads': /\bcrossroads\b|\bintersection\b/,
    'mirror': /\bmirror\b|\breflection\b/,
    'window': /\bwindow\b|\bview\b/,

    // Elements
    'fire': /\bfire\b|\bflame\b|\bburn\b/,
    'water': /\bwater\b|\bpool\b|\blake\b/,
    'earth': /\bearth\b|\bground\b|\bsoil\b/,
    'air': /\bair\b|\bwind\b|\bbreeze\b/,

    // Journey
    'path': /\bpath\b|\broad\b|\bjourney\b/,
    'cave': /\bcave\b|\bcavern\b|\bunderground\b/,
    'tower': /\btower\b|\bcastle\b/,
    'garden': /\bgarden\b|\bgrove\b/
  };

  for (const [motif, pattern] of Object.entries(symbolPatterns)) {
    if (pattern.test(lower)) {
      motifs.push(motif);
    }
  }

  // Dream mentions
  if (/\bdream\b|\bdreamt\b|\bdreamed\b/.test(lower)) {
    motifs.push('dream');
  }

  return motifs;
}

/**
 * Detect emotional themes from language patterns
 */
export function detectEmotionalThemes(text: string): {
  themes: string[];
  intensity: number;
} {
  const lower = text.toLowerCase();
  const themes: string[] = [];

  // Emotional theme patterns
  const themePatterns = {
    'overwhelm': /overwhelmed?|too much|can't handle|drowning/,
    'stuck': /stuck|trapped|can't move|paralyzed/,
    'grief': /grief|loss|mourning|miss|gone/,
    'fear': /afraid|scared|fear|terrified|anxious/,
    'anger': /angry|mad|furious|rage|pissed/,
    'joy': /joy|happy|delighted|excited|thrilled/,
    'confusion': /confused|lost|don't know|unclear/,
    'longing': /long|yearn|miss|want|desire/,
    'shame': /shame|guilty|bad|wrong|shouldn't/,
    'hope': /hope|maybe|possibility|could be/
  };

  for (const [theme, pattern] of Object.entries(themePatterns)) {
    if (pattern.test(lower)) {
      themes.push(theme);
    }
  }

  // Calculate intensity (0-10) based on:
  // - Exclamation marks
  // - Capital letters
  // - Repetition
  // - Multiple themes present

  let intensity = 5; // Baseline

  const exclamations = (text.match(/!/g) || []).length;
  const capitals = (text.match(/[A-Z]{2,}/g) || []).length;
  const repetition = /really|very|so|extremely|incredibly/.test(lower);

  intensity += exclamations * 0.5;
  intensity += capitals * 0.3;
  intensity += repetition ? 1 : 0;
  intensity += themes.length * 0.5;

  intensity = Math.min(10, Math.max(1, intensity));

  return { themes, intensity };
}

/**
 * Calculate phase drift
 * User's emotional tone gently pulls them toward aligned phases
 */
export function calculatePhaseDrift(
  currentPhase: SpiralogicPhase,
  userText: string,
  currentProgress: number // 0-100%
): {
  newPhase: SpiralogicPhase;
  newProgress: number;
  drifted: boolean;
} {
  // Detect phase from user's current text
  const { phase: detectedPhase, confidence } = detectSpiralogicPhase(userText);

  // If strong resonance with different phase, drift toward it
  if (detectedPhase !== currentPhase && confidence > 0.7) {
    // Increase progress toward phase transition
    const drift = confidence * 8; // Max 8% drift per exchange
    const newProgress = currentProgress + drift;

    // If progress > 100%, transition to next phase
    if (newProgress >= 100) {
      return {
        newPhase: detectedPhase,
        newProgress: 0, // Reset progress in new phase
        drifted: true
      };
    }

    return {
      newPhase: currentPhase,
      newProgress,
      drifted: false
    };
  }

  // Natural progression (small drift even without strong signal)
  const naturalDrift = 2; // 2% per exchange
  const newProgress = currentProgress + naturalDrift;

  if (newProgress >= 100) {
    // Move to next phase in cycle
    const cycle: SpiralogicPhase[] = ['Fire', 'Water', 'Earth', 'Air', 'Aether'];
    const currentIndex = cycle.indexOf(currentPhase);
    const nextPhase = cycle[(currentIndex + 1) % cycle.length];

    return {
      newPhase: nextPhase,
      newProgress: 0,
      drifted: true
    };
  }

  return {
    newPhase: currentPhase,
    newProgress,
    drifted: false
  };
}

/**
 * Update symbolic threads
 * Track recurring motifs and their emotional resonance
 */
export function updateSymbolicThreads(
  existingThreads: SymbolicThread[],
  newMotifs: string[],
  currentArchetype: Archetype,
  emotionalTone: string
): SymbolicThread[] {
  const updated = [...existingThreads];

  for (const motif of newMotifs) {
    const existing = updated.find(t => t.motif === motif);

    if (existing) {
      // Update existing thread
      existing.lastInvoked = new Date();
      existing.occurrences++;
      // Update emotional tone if more recent
      existing.emotionalTone = emotionalTone;
    } else {
      // Create new thread
      updated.push({
        motif,
        firstMentioned: new Date(),
        lastInvoked: new Date(),
        emotionalTone,
        archetypalResonance: currentArchetype,
        occurrences: 1
      });
    }
  }

  // Keep only recent threads (last 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  return updated.filter(t => t.lastInvoked.getTime() > thirtyDaysAgo);
}

/**
 * Update emotional motifs
 * Track recurring emotional patterns
 */
export function updateEmotionalMotifs(
  existingMotifs: EmotionalMotif[],
  newThemes: string[],
  intensity: number,
  currentArchetype: Archetype
): EmotionalMotif[] {
  const updated = [...existingMotifs];

  for (const theme of newThemes) {
    const existing = updated.find(m => m.theme === theme);

    if (existing) {
      // Update existing motif
      existing.occurrences.push(new Date());
      // Average intensity
      existing.intensity = (existing.intensity + intensity) / 2;
    } else {
      // Create new motif
      updated.push({
        theme,
        occurrences: [new Date()],
        intensity,
        archetype: currentArchetype
      });
    }
  }

  // Keep only recent motifs (last 60 days)
  const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
  return updated.filter(m => {
    const recentOccurrences = m.occurrences.filter(d => d.getTime() > sixtyDaysAgo);
    m.occurrences = recentOccurrences;
    return recentOccurrences.length > 0;
  });
}

/**
 * Complete memory update after exchange
 * This is MAIA's inner witness - called after each conversation turn
 */
export function updateMemoryFromExchange(
  memory: AINMemoryPayload,
  userText: string,
  maiaResponse: string,
  quoteShared?: any
): AINMemoryPayload {
  const updated = { ...memory };

  // Update basic metrics
  updated.exchangeCount++;
  updated.totalExchanges++;
  updated.lastInteractionTime = new Date();

  // Detect archetype + mood
  const { archetype, mood } = inferMoodAndArchetype(userText);

  // Update archetype if changed
  if (archetype !== updated.currentArchetype) {
    updated.previousArchetype = updated.currentArchetype;
    updated.currentArchetype = archetype;

    updated.archetypeHistory.push({
      archetype,
      timestamp: new Date(),
      duration: 0 // Will be calculated on next update
    });
  }

  // Extract symbolic motifs
  const newMotifs = extractSymbolicMotifs(userText + ' ' + maiaResponse);
  updated.symbolicThreads = updateSymbolicThreads(
    updated.symbolicThreads,
    newMotifs,
    archetype,
    mood
  );

  // Detect emotional themes
  const { themes, intensity } = detectEmotionalThemes(userText);
  updated.emotionalMotifs = updateEmotionalMotifs(
    updated.emotionalMotifs,
    themes,
    intensity,
    archetype
  );

  // Calculate phase drift
  const { newPhase, newProgress, drifted } = calculatePhaseDrift(
    updated.currentPhase,
    userText,
    updated.spiralogicCycle.progressPercent || 0
  );

  if (drifted) {
    updated.spiralogicCycle.previousPhase = updated.currentPhase;
    updated.currentPhase = newPhase;
    updated.spiralogicCycle.phase = newPhase;
    updated.spiralogicCycle.enteredAt = new Date();

    updated.spiralogicCycle.phaseHistory.push({
      phase: newPhase,
      timestamp: new Date()
    });

    // Increment cycle depth if completed full cycle
    if (newPhase === 'Fire') {
      updated.spiralogicCycle.cycleDepth++;
    }
  }

  // Update phase progress (add progressPercent to type if not present)
  (updated.spiralogicCycle as any).progressPercent = newProgress;

  // Update conversation depth
  // Depth increases with: symbolic threads, emotional themes, exchange count
  const depthFromThreads = Math.min(3, updated.symbolicThreads.length * 0.5);
  const depthFromMotifs = Math.min(3, updated.emotionalMotifs.length * 0.3);
  const depthFromExchanges = Math.min(4, updated.exchangeCount * 0.1);

  updated.conversationDepth = Math.min(10, depthFromThreads + depthFromMotifs + depthFromExchanges);

  // Record quote if shared
  if (quoteShared) {
    updated.quotesShared.push({
      quote: quoteShared.text,
      archetype,
      timestamp: new Date()
    });
  }

  // Update dominant archetype (most frequently activated)
  const archetypeCounts: Record<Archetype, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    Aether: 0
  };

  for (const entry of updated.archetypeHistory) {
    archetypeCounts[entry.archetype]++;
  }

  let maxCount = 0;
  let dominant: Archetype = 'Aether';
  for (const [arch, count] of Object.entries(archetypeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = arch as Archetype;
    }
  }
  updated.dominantArchetype = dominant;

  return updated;
}

/**
 * Detect if user declared a new intention
 * "I want to...", "I'm working on...", "My goal is..."
 */
export function detectUserIntention(
  text: string,
  currentArchetype: Archetype,
  currentPhase: SpiralogicPhase
): UserIntention | null {
  const lower = text.toLowerCase();

  const intentionPatterns = [
    /i want to (.+)/,
    /i'm working on (.+)/,
    /my goal is (.+)/,
    /i need to (.+)/,
    /i'm trying to (.+)/,
    /i hope to (.+)/
  ];

  for (const pattern of intentionPatterns) {
    const match = lower.match(pattern);
    if (match) {
      return {
        intention: match[1].trim(),
        declaredAt: new Date(),
        archetype: currentArchetype,
        phase: currentPhase,
        progress: [],
        alive: true
      };
    }
  }

  return null;
}

/**
 * Add intention to memory if detected
 */
export function updateUserIntentions(
  memory: AINMemoryPayload,
  userText: string
): AINMemoryPayload {
  const intention = detectUserIntention(
    userText,
    memory.currentArchetype,
    memory.currentPhase
  );

  if (intention) {
    const updated = { ...memory };
    updated.userIntentions.push(intention);
    return updated;
  }

  return memory;
}

/**
 * Complete update pipeline
 * Use this in VoiceOrchestrator after each exchange
 */
export function completeMemoryUpdate(
  memory: AINMemoryPayload,
  userText: string,
  maiaResponse: string,
  quoteShared?: any
): AINMemoryPayload {
  // 1. Update from exchange
  let updated = updateMemoryFromExchange(memory, userText, maiaResponse, quoteShared);

  // 2. Check for new intentions
  updated = updateUserIntentions(updated, userText);

  return updated;
}

/**
 * Example Usage in VoiceOrchestrator:
 *
 * // After generating MAIA's response
 * const updatedMemory = completeMemoryUpdate(
 *   currentMemory,
 *   userInput,
 *   maiaResponse,
 *   quoteShared
 * );
 *
 * // Save to database/storage
 * await saveMemory(userId, updatedMemory);
 *
 * // Use updated memory for next exchange
 * currentMemory = updatedMemory;
 */
