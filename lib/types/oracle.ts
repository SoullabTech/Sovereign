// Oracle Intelligence Type Definitions

export type Element = 'air' | 'fire' | 'water' | 'earth' | 'aether';
export type EnergyState = 'dense' | 'emerging' | 'radiant';
export type VoiceGuide = 'oracle' | 'maya' | 'guide';
export type Mood = 'dense' | 'heavy' | 'neutral' | 'emerging' | 'light' | 'radiant';
export type InteractionType = 'click' | 'hover' | 'wild_draw' | 'guided';
export type EntryType = 'petal_reflection' | 'wild_draw' | 'dream_log' | 'ritual_note' | 'free_form';
export type CompletionState = 'started' | 'partial' | 'complete';

export interface OracleProfile {
  id: string;
  userId: string;
  currentEnergyState: EnergyState;
  preferredVoice: VoiceGuide;
  autoPlayVoice: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Petal {
  id: number;
  element: Element;
  number: number;
  name: string;
  message: string;
  color: string;
  position: {
    angle: number;
    radius: number;
  };
  state: EnergyState;
}

export interface PetalInteraction {
  id: string;
  userId: string;
  petalId: number;
  element: Element;
  petalNumber: number;
  petalName: string;
  petalState: EnergyState;
  message?: string;
  voicePlayed: boolean;
  interactionType: InteractionType;
  createdAt: Date;
}

export interface SacredCheckIn {
  id: string;
  userId: string;
  mood: Mood;
  symbol: string;
  energyBefore?: string;
  energyAfter?: string;
  notes?: string;
  createdAt: Date;
}

export interface OracleJournalEntry {
  id: string;
  userId: string;
  petalInteractionId?: string;
  checkinId?: string;
  entryType: EntryType;
  title?: string;
  content: string;
  element?: Element;
  voiceContext?: string;
  tags?: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WildPetalDraw {
  id: string;
  userId: string;
  petalId: number;
  element: Element;
  petalName: string;
  message: string;
  voicePlayed: boolean;
  journalEntryId?: string;
  createdAt: Date;
}

export interface RitualCompletion {
  id: string;
  userId: string;
  ritualName: string;
  element?: Element;
  petalId?: number;
  durationMinutes?: number;
  notes?: string;
  completionState: CompletionState;
  createdAt: Date;
}

export interface UserPetalPattern {
  userId: string;
  element: Element;
  interactionCount: number;
  avgEnergyLevel: number;
  lastInteraction: Date;
}

export interface UserEnergyJourney {
  userId: string;
  day: Date;
  mood: Mood;
  checkinCount: number;
  symbols: string[];
}