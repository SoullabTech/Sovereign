/**
 * Spiral Journey Types
 * Defines the structure for tracking user's elemental spiral progression
 */

export interface MemoryLog {
  sessionId: string;
  userId: string;
  timestamp: string;
  content: string;
  phase?: string;
  element?: string;
  practices?: string[];
  symbols?: string[];
  emotionalTone?: string;
  transformationMarker?: boolean;
}

export interface SpiralNode {
  sessionId: string;
  timestamp?: string;
  phase: string;
  element: string;
  symbols: string[];
  snippet: string;
  practices: string[];
  balance?: 'dominant' | 'balanced' | 'underactive';
  transformation?: boolean;
}

export interface ElementalBalance {
  Fire: 'dominant' | 'balanced' | 'underactive';
  Water: 'dominant' | 'balanced' | 'underactive';
  Earth: 'dominant' | 'balanced' | 'underactive';
  Air: 'dominant' | 'balanced' | 'underactive';
  Aether: 'dominant' | 'balanced' | 'underactive';
}

export interface SpiralJourney {
  userId: string;
  nodes: SpiralNode[];
  balance: ElementalBalance;
  narrative: string;
  currentPhase?: string;
  dominantElement?: string;
  recurringSymbols?: string[];
  transformationPoints?: number[];
  journeyArc?: 'initiation' | 'descent' | 'transformation' | 'integration' | 'return';
}

export interface SymbolDictionary {
  [key: string]: {
    names: string[];
    element: string;
    meaning: string;
    transformationPotential: number;
  };
}

export interface SpiralAnalysis {
  elementalProgression: string[];
  phaseTransitions: Array<{
    from: string;
    to: string;
    catalyst: string;
  }>;
  symbolEvolution: Array<{
    symbol: string;
    appearances: number;
    contexts: string[];
  }>;
  coherenceScore: number;
  nextLikelyPhase: string;
  suggestedPractices: string[];
}