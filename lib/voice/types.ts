// lib/voice/types.ts
// Core types for voice interaction and collective listening

export type Element = "fire" | "water" | "earth" | "air" | "aether";
export type PresenceMode = "conversation" | "meditation" | "guided" | "ritual" | "listening";
export type TrustBreath = "in" | "out" | "hold";

/**
 * Individual utterance - stays local unless explicitly consented
 * Contains full transcript and personal context
 */
export interface PersonalUtterance {
  id: string;
  userId: string;
  ts: number;
  mode: PresenceMode;
  text: string;                                              // Raw transcript (stays local)
  elementBlend: Partial<Record<Element, number>>;           // Detected elements 0-1
  intents: string[];                                        // "reflect", "ask", "process", etc.
  silenceMsBefore: number;                                  // For presence analytics
  emotionalContext?: {
    valence: number;                                         // -1 to 1
    arousal: number;                                         // 0 to 1
  };
}

/**
 * Symbolic signal - privacy-safe for collective
 * No personal content, only archetypal patterns
 */
export interface SymbolicSignal {
  teamId: string;
  anonId: string;                                           // Session ID, not user
  ts: number;
  mode: PresenceMode;
  elements: Array<{
    name: Element;
    intensity: number;                                       // 0-1
  }>;
  motifs: string[];                                         // Controlled vocabulary
  affect: {
    valence: -1 | 0 | 1;                                   // Coarse sentiment
    arousal: 0 | 1 | 2;                                    // Energy level
  };
  trustBreath: TrustBreath;                                // Expansion/contraction
  spiralFlag?: boolean;                                    // Revisiting pattern
}

/**
 * Collective snapshot - group resonance state
 */
export interface CollectiveSnapshot {
  teamId: string;
  window: {
    from: number;
    to: number;
  };
  topMotifs: Array<{
    key: string;
    count: number;
  }>;
  elements: Array<{
    name: Element;
    avg: number;
  }>;
  trustBreath: Record<TrustBreath, number>;
  resonanceField: {
    coherence: number;                                      // 0-1 field harmony
    emergence: boolean;                                     // New pattern detected
    tension?: string;                                       // If opposing forces
  };
}

/**
 * Mic session configuration
 */
export interface MicSessionConfig {
  mode: PresenceMode;
  wakeWord: string;                                        // "Hello Maya" etc.
  alwaysOn: boolean;                                       // True for conversation/meditation
  silenceGraceMs: number;                                  // How long to wait in silence
  vadSensitivity?: number;                                 // 0-1, default 0.5
  noiseSupression?: boolean;                               // Filter background
}

/**
 * Voice activity detection event
 */
export interface VADEvent {
  type: "speech-start" | "speech-end" | "silence";
  timestamp: number;
  confidence: number;
}

/**
 * Wake word detection result
 */
export interface WakeWordResult {
  detected: boolean;
  confidence: number;
  keyword?: string;
  timestamp?: number;
}

/**
 * Orchestrator insight - mythic translation of collective
 */
export interface OrchestratorInsight {
  type: "resonance" | "emergence" | "tension" | "coherence";
  message: string;                                         // Poetic, not analytical
  elements: Element[];                                     // Active elements
  strength: number;                                        // 0-1 intensity
  personalMirror?: string;                                 // Individual reflection
  patterns?: any;                                          // Collective patterns detected
  timestamp?: number;                                      // When insight occurred
}

/**
 * Mic session - manages voice capture for collective listening
 */
export class MicSession {
  private sessionId: string;
  private config: MicSessionConfig;
  private isActive: boolean = false;

  constructor(config: MicSessionConfig) {
    this.config = config;
    this.sessionId = `mic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async start(onUtterance: (utterance: PersonalUtterance) => void): Promise<void> {
    console.log('[MicSession] Starting with config:', this.config);
    this.isActive = true;
    // Actual mic implementation would go here
    // For beta, this is a placeholder
  }

  stop(): void {
    console.log('[MicSession] Stopping');
    this.isActive = false;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  isListening(): boolean {
    return this.isActive;
  }
}

/**
 * Symbol extractor - converts personal utterances to privacy-safe symbols
 */
export const symbolExtractor = {
  toSymbolic(utterance: PersonalUtterance): Omit<SymbolicSignal, 'teamId'> {
    // Extract symbolic patterns without personal content
    // In production, this would use NLP for proper extraction
    const elements: Array<{ name: Element; intensity: number }> = [
      { name: 'air', intensity: 0.7 },
      { name: 'fire', intensity: 0.3 }
    ];

    return {
      anonId: utterance.id,
      ts: utterance.ts,
      mode: utterance.mode,
      elements,
      motifs: ['exploration', 'presence'],
      affect: {
        valence: utterance.emotionalContext?.valence ?
          (utterance.emotionalContext.valence > 0.3 ? 1 : utterance.emotionalContext.valence < -0.3 ? -1 : 0) : 0,
        arousal: utterance.emotionalContext?.arousal ?
          (utterance.emotionalContext.arousal > 0.66 ? 2 : utterance.emotionalContext.arousal > 0.33 ? 1 : 0) : 0
      },
      trustBreath: 'in',
      spiralFlag: false
    };
  },

  resetSession() {
    console.log('[SymbolExtractor] Session reset');
  }
};

/**
 * Aetheric orchestrator - synthesizes collective insights
 */
export const aethericOrchestrator = {
  synthesize(signals: SymbolicSignal[]): OrchestratorInsight | null {
    if (signals.length < 2) return null;

    // Calculate collective patterns
    const elementCounts = new Map<Element, number>();
    signals.forEach(signal => {
      signal.elements.forEach(elem => {
        elementCounts.set(elem.name, (elementCounts.get(elem.name) || 0) + elem.intensity);
      });
    });

    const dominantElement = Array.from(elementCounts.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'aether';

    return {
      type: 'resonance',
      message: 'The collective field shows curiosity and openness.',
      elements: [dominantElement],
      strength: 0.72,
      patterns: {
        coherence: 0.72,
        emergence: true
      },
      timestamp: Date.now()
    };
  }
};