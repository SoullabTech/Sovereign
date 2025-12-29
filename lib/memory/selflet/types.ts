/**
 * SELFLET CHAIN TYPES
 *
 * Temporal identity modeling based on Michael Levin's "selflet" concept.
 * Treats identity as a chain of distinct selves sending messages across time.
 *
 * Core ideas:
 * - Each selflet is a snapshot of consciousness at a specific moment
 * - Memories are "messages" from past selves requiring interpretation
 * - Radical transitions (metamorphosis) require translation, not just recall
 * - Current actions are messages to future selves
 */

// ═══════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type MessageType = 'letter' | 'symbolic_state' | 'future_projection' | 'wisdom_seed';

export type BoundaryType = 'micro' | 'breakthrough' | 'evolution' | 'transformation' | 'collective';

// ═══════════════════════════════════════════════════════════════
// SELFLET NODE
// ═══════════════════════════════════════════════════════════════

export interface SelfletNode {
  id: string;
  userId: string;

  // Temporal identity signature (Spiralogic alignment)
  phase: string;             // e.g., "Fire 1", "Water 3"
  element: Element;
  archetypes: string[];      // e.g., ["Sage", "Empath"]
  dominantEmotions?: string[];

  // Continuity tracking
  parentSelfletId?: string;
  continuityScore: number;   // 0-1, coherence with parent

  // Timestamps
  createdAt: Date;
  activeUntil?: Date;        // null = current active selflet

  // Semantic search
  essenceEmbedding?: number[];
  essenceSummary?: string;   // Human-readable essence snapshot
}

export interface CreateSelfletInput {
  userId: string;
  phase: string;
  element: Element;
  archetypes: string[];
  dominantEmotions?: string[];
  essenceSummary?: string;
  parentSelfletId?: string;
  continuityScore?: number;
}

// ═══════════════════════════════════════════════════════════════
// SELFLET MESSAGES
// ═══════════════════════════════════════════════════════════════

export interface SelfletMessage {
  id: string;
  fromSelfletId: string;
  toSelfletId?: string;      // null = addressed to any future self

  // Message content
  messageType: MessageType;
  title?: string;
  content: string;
  symbolicObjects?: string[];   // e.g., ["phoenix", "candle flame"]
  ritualTrigger?: string;       // e.g., "Full Moon in Aries"

  // Delivery tracking
  deliveredAt?: Date;
  receivedInterpretation?: string;

  // Context for MAIA's intuition
  deliveryContext?: DeliveryContext;
  relevanceThemes?: string[];

  createdAt: Date;
}

export interface DeliveryContext {
  // Conditions under which MAIA should surface this message
  elementalAlignment?: Element[];   // Deliver when user is in these elements
  emotionalStates?: string[];       // Deliver when these emotions present
  themeMatch?: string[];            // Deliver when these themes come up
  minimumDaysSince?: number;        // Wait at least this many days
  seasonalTrigger?: string;         // e.g., "spring_equinox", "winter_solstice"
}

export interface SendMessageInput {
  fromSelfletId: string;
  toSelfletId?: string;          // null = to future self
  messageType: MessageType;
  title?: string;
  content: string;
  symbolicObjects?: string[];
  ritualTrigger?: string;
  deliveryContext?: DeliveryContext;
  relevanceThemes?: string[];
}

// ═══════════════════════════════════════════════════════════════
// REINTERPRETATIONS
// ═══════════════════════════════════════════════════════════════

export interface Reinterpretation {
  id: string;
  interpretingSelfletId: string;
  sourceSelfletId: string;
  sourceMessageId?: string;

  interpretation: string;
  emotionalResonance?: string;   // How it lands now (e.g., "warmth", "grief")
  integrationDepth: number;      // 0-1

  translationNotes?: string;     // What had to be "translated" for new context

  createdAt: Date;
}

export interface RecordReinterpretationInput {
  interpretingSelfletId: string;
  sourceSelfletId: string;
  sourceMessageId?: string;
  interpretation: string;
  emotionalResonance?: string;
  integrationDepth?: number;
  translationNotes?: string;
}

// ═══════════════════════════════════════════════════════════════
// METAMORPHOSIS
// ═══════════════════════════════════════════════════════════════

export interface Metamorphosis {
  id: string;
  userId: string;
  selfletId: string;

  fromElement: Element;
  toElement: Element;
  symbol?: string;              // e.g., "steam" (fire→water), "ash", "light"
  interpretation?: string;      // User's meaning-making

  discontinuityScore?: number;  // 0-1, how radical the shift
  translationNeeded: boolean;
  bridgingRitualCompleted: boolean;

  triggerContext?: any;

  createdAt: Date;
}

export interface DetectMetamorphosisInput {
  userId: string;
  newElement: Element;
  previousElement?: Element;
}

// ═══════════════════════════════════════════════════════════════
// BOUNDARY DETECTION
// ═══════════════════════════════════════════════════════════════

export interface BoundarySignal {
  type: BoundaryType;
  strength: number;              // 0-1
  trigger: string;               // What caused detection
  suggestedElement?: Element;
  suggestedArchetypes?: string[];
  suggestedPhase?: string;
  requiresConfirmation: boolean; // Should MAIA ask user?
}

export interface BoundaryDetectionInput {
  userId: string;
  currentSelflet?: SelfletNode;

  // Signals from current interaction
  emotionalShift?: {
    from?: string;
    to: string;
    intensity: number;           // 0-1
  };
  breakthroughDetected?: boolean;
  consciousnessLevelDelta?: number;
  archetypalShift?: {
    from?: string[];
    to: string[];
  };
  elementalShift?: {
    from?: Element;
    to: Element;
  };

  // Session context
  sessionDurationMinutes?: number;
  breakthroughCountThisSession?: number;
}

// ═══════════════════════════════════════════════════════════════
// CONTINUITY METRICS
// ═══════════════════════════════════════════════════════════════

export interface ContinuityMetrics {
  userId: string;

  overallCoherence: number;      // 0-1
  nodeCount: number;
  reinterpretationCount: number;
  metamorphosisCount: number;

  elementalJourney: ElementalTransition[];
  archetypalEvolution: ArchetypalTransition[];

  // Derived insights
  integrationStrength: number;   // How well past selves are integrated
  growthVelocity: number;        // Rate of transformation
}

export interface ElementalTransition {
  from: Element;
  to: Element;
  symbol?: string;
  timestamp: Date;
}

export interface ArchetypalTransition {
  from: string[];
  to: string[];
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// MAIA RITUAL INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface ReflectionPrompt {
  pastSelflet: SelfletNode;
  message: SelfletMessage;
  promptText: string;            // MAIA's framing of the message
  suggestedReflectionQuestions: string[];
}

export interface DialogueScript {
  selfletA: SelfletNode;
  selfletB: SelfletNode;
  openingLine: string;           // MAIA's facilitation
  suggestedThemes: string[];
}

export interface MetamorphosisRitual {
  metamorphosis: Metamorphosis;
  ritualName: string;
  ritualDescription: string;
  bridgingPractice: string;      // Suggested practice
  symbolicAction?: string;       // Optional symbolic action
}

// ═══════════════════════════════════════════════════════════════
// MAIA CONTEXT INJECTION
// ═══════════════════════════════════════════════════════════════

export interface SelfletContext {
  currentSelflet?: SelfletNode;
  pendingMessages: SelfletMessage[];
  recentMetamorphosis?: Metamorphosis;
  chainContinuity: number;

  // For MAIA's prompt injection
  contextSummary: string;        // Human-readable summary for prompt
}

// ═══════════════════════════════════════════════════════════════
// ELEMENTAL SYMBOLS (for metamorphosis)
// ═══════════════════════════════════════════════════════════════

export const METAMORPHOSIS_SYMBOLS: Record<string, string> = {
  'fire->water': 'steam',
  'fire->earth': 'ash',
  'fire->air': 'smoke',
  'water->fire': 'vapor',
  'water->earth': 'mud',
  'water->air': 'mist',
  'earth->fire': 'lava',
  'earth->water': 'spring',
  'earth->air': 'dust',
  'air->fire': 'lightning',
  'air->water': 'rain',
  'air->earth': 'pollen',
  'fire->aether': 'light',
  'water->aether': 'reflection',
  'earth->aether': 'mountain',
  'air->aether': 'breath',
  'aether->fire': 'spark',
  'aether->water': 'tears',
  'aether->earth': 'seed',
  'aether->air': 'whisper',
};

export function getMetamorphosisSymbol(from: Element, to: Element): string {
  return METAMORPHOSIS_SYMBOLS[`${from}->${to}`] || 'transformation';
}
