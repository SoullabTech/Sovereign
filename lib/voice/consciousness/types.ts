/**
 * Type definitions for MAIA Enhanced Voice Analysis System
 */

export interface VoiceAnalysisResult {
  userId: string;
  timestamp: Date;
  prosodyMetrics: ProsodyMetrics;
  breathPattern: BreathPattern;
  tremorAnalysis: TremorAnalysis;
  consciousnessIndicators: ConsciousnessIndicators;
  biofeedbackMetrics: BiofeedbackMetrics;
  elementalMapping: ElementalMapping;
  deviationFromBaseline: number;
  recommendations: string[];
  confidenceScore: number;
}

export interface ProsodyMetrics {
  fundamentalFrequency: number; // Hz - pitch
  formantSpacing: number; // Hz - vocal tract resonance
  spectralCentroid: number; // Hz - voice brightness/darkness
  jitter: number; // % - frequency variation
  shimmer: number; // % - amplitude variation
  harmonicNoiseRatio: number; // 0-1 - voice quality
}

export interface BreathPattern {
  inhaleRate: number; // Breaths per minute
  exhaleRate: number; // Breaths per minute
  pauseDuration: number; // Average seconds between words
  oxygenationLevel: number; // 0-1 - inferred from voice quality
}

export interface TremorAnalysis {
  present: boolean;
  frequency: number; // Hz of tremor oscillation
  intensity: number; // 0-1 scale
  type: 'emotional' | 'neurological' | 'fatigue' | 'unknown';
  confidence: number; // 0-1 confidence in detection
}

export interface ConsciousnessIndicators {
  coherence: number; // 0-1 - voice-thought alignment
  presence: number; // 0-1 - awareness level in voice
  integration: number; // 0-1 - elemental balance in expression
  flowState: number; // 0-1 - effortless natural expression
  authenticExpression: number; // 0-1 - genuine vs. performed patterns
}

export interface BiofeedbackMetrics {
  stressLevel: number; // 0-1 - physiological stress indicators
  arousalLevel: number; // 0-1 - sympathetic activation
  vagalTone: number; // 0-1 - parasympathetic strength
  hrvEstimate: number; // 0-1 - heart rate variability estimate
  oxygenationStatus: number; // 0-1 - breathing efficiency
  autonomicBalance: number; // 0-1 - sympathetic/parasympathetic balance
}

export interface ElementalMapping {
  elementalBalance: {
    fire: number; // 0-1 - passionate expression
    water: number; // 0-1 - emotional flow
    earth: number; // 0-1 - grounded presence
    air: number; // 0-1 - clear communication
    aether: number; // 0-1 - integrated expression
  };
  dominantElement: string;
  recommendations: string[];
}

export interface ConsciousnessState {
  level: 'scattered' | 'focused' | 'present' | 'flow' | 'transcendent';
  stability: number; // 0-1
  coherence: number; // 0-1
  integration: number; // 0-1
  timestamp: Date;
}

export interface VoiceSignature {
  userId: string;
  baselineProsody: ProsodyMetrics;
  baselineStress: number;
  baselineBreathPattern: BreathPattern;
  establishedAt: Date;
  sampleCount: number;
}

// Integration types for existing MAIA infrastructure
export interface MAIAVoiceIntegration {
  affectDetection: any; // From existing AffectDetector
  elementalRouting: any; // From existing ElementalVoiceOrchestrator
  transcription: {
    text: string;
    confidence: number;
    timestamps: number[];
  };
  enhancedAnalysis: VoiceAnalysisResult;
}

// Real-time processing types
export interface VoiceProcessingPipeline {
  stage: 'input' | 'analysis' | 'integration' | 'output';
  latency: number; // milliseconds
  confidence: number;
  error?: string;
}

export interface RealTimeVoiceMetrics {
  currentProsody: Partial<ProsodyMetrics>;
  breathStatus: 'inhaling' | 'exhaling' | 'pause';
  stressLevel: number;
  consciousnessLevel: number;
  elementalBalance: Partial<ElementalMapping['elementalBalance']>;
}

// Bio-feedback integration types
export interface BiofeedbackDevice {
  type: 'hrv' | 'eeg' | 'breath' | 'gsr' | 'temperature';
  connected: boolean;
  lastReading: number;
  timestamp: Date;
}

export interface MultiModalMetrics {
  voice: VoiceAnalysisResult;
  biofeedback?: {
    [deviceType: string]: BiofeedbackDevice;
  };
  visual?: any; // For future visual analysis
  contextual?: {
    environment: string;
    timeOfDay: string;
    sessionType: string;
  };
}

// Recommendations and guidance types
export interface PersonalizedGuidance {
  immediate: string[]; // Actions for right now
  session: string[]; // Practices for this conversation
  ongoing: string[]; // Longer-term development
  elemental: string[]; // Element-specific recommendations
}

export interface VoiceCoaching {
  technique: string;
  instruction: string;
  targetMetric: keyof ConsciousnessIndicators;
  expectedImprovement: number;
  timeframe: 'immediate' | 'session' | 'weekly' | 'monthly';
}

// Database/storage types
export interface VoiceAnalysisRecord {
  id: string;
  userId: string;
  sessionId: string;
  analysis: VoiceAnalysisResult;
  interventions: VoiceCoaching[];
  outcomes: {
    beforeMetrics: Partial<ConsciousnessIndicators>;
    afterMetrics: Partial<ConsciousnessIndicators>;
    improvement: number;
  };
  createdAt: Date;
}

// Event types for real-time updates
export interface VoiceAnalysisEvent {
  type: 'analysis_complete' | 'consciousness_shift' | 'stress_spike' | 'flow_achieved';
  data: Partial<VoiceAnalysisResult>;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Configuration types
export interface VoiceAnalysisConfig {
  sensitivity: number; // 0-1 - how sensitive to changes
  analysisDepth: 'basic' | 'standard' | 'comprehensive';
  realTimeUpdates: boolean;
  biofeedbackIntegration: boolean;
  personalizedBaselines: boolean;
  elementalMapping: boolean;
}