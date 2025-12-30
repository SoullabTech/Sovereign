/**
 * SELFLET CHAIN TYPES
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type MessageType = 'letter' | 'symbolic_state' | 'future_projection' | 'wisdom_seed';
export type BoundaryType = 'micro' | 'breakthrough' | 'evolution' | 'transformation' | 'collective';

/**
 * Phase 2I: State for surfacing gating (cooldown, per-session limits)
 */
export interface UserSelfletState {
  lastSelfletTime: Date | null;
  lastSelfletTurn: number | null;
  countThisSession: number;
}

export interface SelfletNode {
  id: string;
  userId: string;
  phase: string;
  element: Element;
  archetypes: string[];
  dominantEmotions?: string[];
  parentSelfletId?: string;
  continuityScore: number;
  createdAt: Date;
  activeUntil?: Date;
  essenceEmbedding?: number[];
  essenceSummary?: string;
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

export interface SelfletMessage {
  id: string;
  fromSelfletId: string;
  toSelfletId?: string;
  messageType: MessageType;
  title?: string;
  content: string;
  symbolicObjects?: string[];
  ritualTrigger?: string;
  relevanceThemes?: string[];
  deliveredAt?: Date;
  receivedInterpretation?: string;
  deliveryContext?: Record<string, unknown>;
  createdAt: Date;
}

export interface SendMessageInput {
  fromSelfletId: string;
  toSelfletId?: string;
  messageType: MessageType;
  title?: string;
  content: string;
  symbolicObjects?: string[];
  ritualTrigger?: string;
  relevanceThemes?: string[];
  deliveryContext?: Record<string, unknown>;
}

export interface Reinterpretation {
  id: string;
  interpretingSelfletId: string;
  sourceSelfletId: string;
  sourceMessageId?: string;
  interpretation: string;
  emotionalResonance?: string;
  integrationDepth: number;
  translationNotes?: string;
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

export interface Metamorphosis {
  id: string;
  userId: string;
  selfletId: string;
  fromElement: Element;
  toElement: Element;
  symbol: string;
  interpretation?: string;
  discontinuityScore: number;
  translationNeeded: boolean;
  bridgingRitualCompleted: boolean;
  triggerContext?: string;
  createdAt: Date;
}

export const METAMORPHOSIS_SYMBOLS: Record<string, string> = {
  'fire->water': 'steam', 'fire->earth': 'ash', 'fire->air': 'smoke', 'fire->aether': 'light',
  'water->fire': 'steam', 'water->earth': 'mud', 'water->air': 'mist', 'water->aether': 'dew',
  'earth->fire': 'coal', 'earth->water': 'clay', 'earth->air': 'dust', 'earth->aether': 'crystal',
  'air->fire': 'lightning', 'air->water': 'rain', 'air->earth': 'seed', 'air->aether': 'breath',
  'aether->fire': 'spark', 'aether->water': 'essence', 'aether->earth': 'form', 'aether->air': 'spirit',
};

export function getMetamorphosisSymbol(from: Element, to: Element): string {
  return METAMORPHOSIS_SYMBOLS[`${from}->${to}`] || 'passage';
}

export interface BoundarySignal {
  type: BoundaryType;
  strength: number;
  trigger: string;
  suggestedElement?: Element;
  suggestedArchetypes?: string[];
  suggestedPhase?: string;
  requiresConfirmation: boolean;
}

export interface BoundaryDetectionInput {
  userId: string;
  currentSelflet?: SelfletNode;
  emotionalShift?: { from?: string; to: string; intensity: number; };
  elementalShift?: { from: Element; to: Element; };
  archetypalShift?: { from: string[]; to: string[]; };
  breakthroughDetected?: boolean;
  consciousnessLevelDelta?: number;
  sessionDurationMinutes?: number;
  breakthroughCountThisSession?: number;
}

export interface SelfletContext {
  currentSelflet?: SelfletNode;
  pendingMessages: SelfletMessage[];
  recentMetamorphosis?: Metamorphosis;
  chainContinuity?: number;
  contextSummary?: string;
}

export interface ReflectionPrompt {
  pastSelflet: SelfletNode;
  message: SelfletMessage;
  promptText: string;
  suggestedReflectionQuestions: string[];
}

export interface DialogueScript {
  selfletA: SelfletNode;
  selfletB: SelfletNode;
  openingLine: string;
  suggestedThemes: string[];
}

export interface MetamorphosisRitual {
  metamorphosis: Metamorphosis;
  ritualName: string;
  ritualDescription: string;
  bridgingPractice: string;
  symbolicAction?: string;
}

export interface ContinuityMetrics {
  userId?: string;
  overallCoherence: number;
  nodeCount: number;
  reinterpretationCount: number;
  metamorphosisCount: number;
  elementalJourney: Array<{ from: Element; to: Element; symbol: string; timestamp: Date }>;
  archetypalEvolution: Array<{ from: string[]; to: string[]; timestamp: Date }>;
  integrationStrength: number;
  growthVelocity: number;
}
