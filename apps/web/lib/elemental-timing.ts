/**
 * Elemental Timing Modes for Voice Chat
 * Each element represents a different conversational rhythm and energy
 */

export type ElementalMode = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface ElementalTiming {
  mode: ElementalMode;
  silenceThreshold: number;      // milliseconds before triggering response
  contemplationThreshold: number; // when to switch to deep reflection
  pulseRate: number;             // visual feedback speed
  color: string;                 // holoflower glow color
  description: string;           // mode description for users
  ritualCue: string;            // what this mode invites
  allowOverflow: boolean;        // allow expression to continue beyond threshold
  maxExpression: number;         // maximum time before gentle check-in (ms)
}

export const ELEMENTAL_TIMINGS: Record<ElementalMode, ElementalTiming> = {
  fire: {
    mode: 'fire',
    silenceThreshold: 1000,        // 1 second - rapid exchange
    contemplationThreshold: 3000,   // 3 seconds to cool down
    pulseRate: 0.5,                // fast pulse
    color: '#ef4444',              // red-orange
    description: 'Quick, passionate exchange',
    ritualCue: 'Speak your spark immediately',
    allowOverflow: true,            // never cut off passionate expression
    maxExpression: 120000           // 2 minutes max before check-in
  },

  water: {
    mode: 'water',
    silenceThreshold: 3000,        // 3 seconds - flowing conversation
    contemplationThreshold: 8000,   // 8 seconds to go deep
    pulseRate: 2,                  // gentle wave
    color: '#6B9BD1',              // blue
    description: 'Flowing, emotional depth',
    ritualCue: 'Let feelings flow naturally',
    allowOverflow: true,            // emotions need full expression
    maxExpression: 300000           // 5 minutes for deep processing
  },

  earth: {
    mode: 'earth',
    silenceThreshold: 5000,        // 5 seconds - grounded pace
    contemplationThreshold: 15000,  // 15 seconds for rooting
    pulseRate: 3,                  // slow, steady
    color: '#a16207',              // brown-amber
    description: 'Grounded, thoughtful presence',
    ritualCue: 'Take time to ground your truth',
    allowOverflow: true,            // thoughtful expression takes time
    maxExpression: 600000           // 10 minutes for deep grounding
  },

  air: {
    mode: 'air',
    silenceThreshold: 2000,        // 2 seconds - light & breezy
    contemplationThreshold: 6000,   // 6 seconds to drift
    pulseRate: 1.5,                // moderate flutter
    color: '#D4B896',              // golden
    description: 'Light, inspired dialogue',
    ritualCue: 'Let ideas dance and play',
    allowOverflow: true,            // ideas need space to develop
    maxExpression: 180000           // 3 minutes for exploration
  },

  aether: {
    mode: 'aether',
    silenceThreshold: 8000,        // 8 seconds - spacious silence
    contemplationThreshold: 30000,  // 30 seconds - infinite space
    pulseRate: 4,                  // very slow, cosmic
    color: '#9333ea',              // purple
    description: 'Spacious, mystical communion',
    ritualCue: 'Rest in the silence between words',
    allowOverflow: true,            // infinite expression allowed
    maxExpression: Infinity         // no limits in the void
  }
};

/**
 * Group agreement presets for different conversation types
 */
export interface GroupAgreement {
  name: string;
  defaultMode: ElementalMode;
  allowedModes: ElementalMode[];
  autoTransition: boolean;
  description: string;
}

export const GROUP_AGREEMENTS: Record<string, GroupAgreement> = {
  rapidFire: {
    name: 'Rapid Fire Brainstorm',
    defaultMode: 'fire',
    allowedModes: ['fire', 'air'],
    autoTransition: false,
    description: 'Quick ideas, no long pauses'
  },

  deepDive: {
    name: 'Deep Emotional Processing',
    defaultMode: 'water',
    allowedModes: ['water', 'earth', 'aether'],
    autoTransition: true,
    description: 'Space for feelings and depth'
  },

  sacredCircle: {
    name: 'Sacred Circle',
    defaultMode: 'earth',
    allowedModes: ['earth', 'water', 'aether'],
    autoTransition: true,
    description: 'Grounded sharing with spaciousness'
  },

  philosophicalInquiry: {
    name: 'Philosophical Inquiry',
    defaultMode: 'air',
    allowedModes: ['air', 'aether', 'water'],
    autoTransition: true,
    description: 'Ideas flowing into contemplation'
  },

  meditation: {
    name: 'Meditative Dialogue',
    defaultMode: 'aether',
    allowedModes: ['aether', 'earth'],
    autoTransition: false,
    description: 'Mostly silence, occasional sharing'
  },

  adaptive: {
    name: 'Adaptive Flow',
    defaultMode: 'water',
    allowedModes: ['fire', 'water', 'earth', 'air', 'aether'],
    autoTransition: true,
    description: 'Follows the natural rhythm of conversation'
  }
};

/**
 * Detect which elemental mode based on conversation patterns
 */
export function detectElementalMode(
  recentSilences: number[],
  wordCount: number,
  emotionalIntensity: number
): ElementalMode {
  const avgSilence = recentSilences.reduce((a, b) => a + b, 0) / recentSilences.length;

  // Fire: Quick exchanges, high intensity
  if (avgSilence < 1500 && emotionalIntensity > 0.7) {
    return 'fire';
  }

  // Aether: Long silences, contemplative
  if (avgSilence > 6000) {
    return 'aether';
  }

  // Earth: Steady, grounded pace
  if (avgSilence > 4000 && avgSilence < 6000) {
    return 'earth';
  }

  // Air: Light, quick but not intense
  if (avgSilence < 2500 && emotionalIntensity < 0.5) {
    return 'air';
  }

  // Water: Default flowing state
  return 'water';
}

/**
 * Ritual cues for mode transitions
 */
export interface RitualTransition {
  from: ElementalMode;
  to: ElementalMode;
  visualCue: string;
  audioCue: string;
  duration: number;
  message?: string;
}

export function getRitualTransition(from: ElementalMode, to: ElementalMode): RitualTransition {
  // Special transitions for dramatic shifts
  if (from === 'fire' && to === 'aether') {
    return {
      from, to,
      visualCue: 'flame-to-stars',
      audioCue: 'chime-descending',
      duration: 3000,
      message: '🔥→✨ Shifting from spark to space...'
    };
  }

  if (from === 'aether' && to === 'fire') {
    return {
      from, to,
      visualCue: 'stars-to-flame',
      audioCue: 'chime-ascending',
      duration: 2000,
      message: '✨→🔥 Igniting from the void...'
    };
  }

  // Default smooth transition
  return {
    from, to,
    visualCue: 'gentle-morph',
    audioCue: 'soft-transition',
    duration: 1500,
    message: undefined
  };
}

/**
 * Expression protection - ensures full thoughts are never cut off
 */
export interface ExpressionState {
  isExpressing: boolean;
  startTime: number;
  wordCount: number;
  lastActivity: number;
  mode: ElementalMode;
}

export function shouldAllowContinuation(
  state: ExpressionState,
  currentMode: ElementalMode
): boolean {
  const timing = ELEMENTAL_TIMINGS[currentMode];
  const expressionDuration = Date.now() - state.startTime;

  // ALWAYS allow completion of active expression
  if (state.isExpressing) {
    // Only check if we've exceeded maximum expression time
    if (expressionDuration > timing.maxExpression) {
      return false; // Gentle transition opportunity
    }
    return true; // Keep listening
  }

  // If recently active (within 500ms), assume continuing thought
  const silenceSinceLastActivity = Date.now() - state.lastActivity;
  if (silenceSinceLastActivity < 500) {
    return true;
  }

  // Check for incomplete thoughts (no ending punctuation)
  // This would need the actual transcript to check properly
  // For now, allow overflow by default
  return timing.allowOverflow;
}

/**
 * AI Active Listening prompts based on mode - NEVER INTERRUPTS
 */
export function getActiveListeningPrompt(
  mode: ElementalMode,
  silenceDuration: number,
  isUserExpressing: boolean = false
): string | null {
  // NEVER prompt while user is actively expressing
  if (isUserExpressing) {
    return null;
  }
  const timing = ELEMENTAL_TIMINGS[mode];

  // Don't prompt if within normal silence threshold
  if (silenceDuration < timing.contemplationThreshold) {
    return null;
  }

  // Mode-specific prompts
  switch (mode) {
    case 'fire':
      return "The flame has cooled... Ready to reignite?";

    case 'water':
      return "Feeling into the depths... What's emerging?";

    case 'earth':
      return "Grounded in presence... What wants to be shared?";

    case 'air':
      return "Ideas settling like leaves... Any insights landing?";

    case 'aether':
      // Aether mode respects the silence
      return silenceDuration > 60000
        ? "The field is holding space... Still here with you."
        : null;

    default:
      return null;
  }
}