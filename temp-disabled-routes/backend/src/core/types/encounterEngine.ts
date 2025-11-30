/**
 * Encounter Engine Types
 * 
 * Defines interfaces for detecting and processing encounters - moments of
 * irreducibility, resistance, and surprise that indicate genuine engagement.
 */

export interface EncounterSignature {
  id: string;
  timestamp: string;
  userId: string;

  // Core encounter metrics (0-1 scale)
  irreducibility: number;  // How much can't be reduced to patterns
  resistance: number;      // User's resistance to easy answers
  surprise: number;        // Unexpected elements in interaction
  coherence: number;       // Overall coherence despite complexity

  // Encounter classification
  type: 'ordinary' | 'threshold' | 'liminal' | 'breakthrough';
  toneHint: 'measured' | 'spacious' | 'urgent' | 'gentle';

  // Safety assessment
  safetyLevel: 'green' | 'yellow' | 'orange' | 'red';
  safetyNotes: string[];

  // Emergent properties
  emergentTheme?: string;
  archetypeHint?: string;
}

export interface EncounterContext {
  userId: string;
  sessionHistory?: any[];
  currentStage?: string;
  recentCapacitySignals?: any[];
  userState?: {
    trust: number;
    stability: number;
    openness: number;
  };
}

export interface EncounterEngine {
  /**
   * Detect encounter signature from user input and context
   */
  detectEncounter(
    input: string, 
    context: EncounterContext
  ): Promise<EncounterSignature>;

  /**
   * Calibrate detection sensitivity based on user capacity
   */
  calibrateDetection?(
    userId: string,
    capacityMetrics: any
  ): Promise<void>;
}