export interface DaimonicDetected {
  userIdHash: string;
  ts: string;
  liminal: { 
    weight: number; 
    label: 'dawn' | 'dusk' | 'midnight' | 'transition' | 'none' 
  };
  spiritSoul: { 
    pull: 'spirit' | 'soul' | 'integrated'; 
    notes?: string 
  };
  trickster: { 
    risk: number; 
    reasons: string[] // 'contradiction', 'promise', 'wink', 'test'
  };
  bothAnd: { 
    signature: boolean; 
    guidance: string 
  };
  elements: Partial<Record<'fire' | 'water' | 'earth' | 'air' | 'aether', number>>;
  phaseHint?: string;
  expert?: boolean;
}

export interface CollectiveDaimonicSnapshot {
  timestamp: string;
  fieldIntensity: number;          // 0–1
  collectiveMyth: string;          // human phrase
  culturalCompensation: string;    // "balancing abstraction with embodiment"
  tricksterPrevalence: number;     // 0–1
  bothAndRate: number;             // 0–1
  activeElements: Array<'fire' | 'water' | 'earth' | 'air' | 'aether'>;
}

export interface DaimonicNarrativeExtras {
  opening?: string;
  insights?: string[];
  tricksterCaution?: string;
  closing?: string;
  microPrompts?: string[];
  practiceHints?: string[];
}

export interface DaimonicChip {
  type: 'threshold' | 'trickster' | 'both-and' | 'integration';
  label: string;
  color: 'amber' | 'blue' | 'purple' | 'green';
  action?: string;
}

export interface VoicePreset {
  name: string;
  pace: 'normal' | 'measured' | 'soft' | 'spacious';
  tone: 'neutral' | 'grounded' | 'thoughtful' | 'warm';
  pauses: boolean;
  humor?: 'gentle' | 'none';
}

export type DaimonicEvent = 
  | { type: 'daimonic.experience.detected'; payload: DaimonicDetected }
  | { type: 'collective.daimonic.snapshot'; payload: CollectiveDaimonicSnapshot };