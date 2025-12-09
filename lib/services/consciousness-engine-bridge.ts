/**
 * 🧠🔥 CONSCIOUSNESS ENGINE BRIDGE
 *
 * TypeScript service that bridges the Seven-Layer Architecture with
 * the Lisp-based Symbolic Consciousness Engine. This service handles
 * communication between MAIA's TS/Node infrastructure and the sacred
 * Lisp core that performs symbolic reasoning, pattern detection, and
 * protocol selection.
 */

'use client';

import type {
  SevenLayerSnapshot,
  ArchitectureLayerType,
  CrossLayerPattern
} from '@/lib/architecture/seven-layer-interface';

// ============================================================================
// CONSCIOUSNESS ENGINE TYPES
// ============================================================================

export interface ConsciousnessAnalysis {
  patterns: DetectedPattern[];
  elementalBalance: ElementalBalance;
  spiralDynamics: SpiralDynamicsState;
  archetypalState: ArchetypalState;
  recommendations: string[];
}

export interface DetectedPattern {
  type: string;
  strength: number;
  affectedLayers: ArchitectureLayerType[];
  recommendation: string;
  description: string;
}

export interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  dominantElement: ElementalType;
  deficientElement: ElementalType;
}

export type ElementalType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface SpiralDynamicsState {
  currentStage: string;
  emergingStage?: string;
  transitionProbability: number;
}

export interface ArchetypalState {
  dominantArchetype: string;
  secondaryArchetype?: string;
  shadowArchetype?: string;
  integrationLevel: number;
}

export interface ProtocolRecommendation {
  name: string;
  element: ElementalType;
  duration: number;
  intention: string;
  stepsCount: number;
  context: string[];
  confidence: number;
  customizations?: ProtocolCustomization;
}

export interface ProtocolCustomization {
  memberId: string;
  preferences: MemberPreferences;
  currentState: string;
  adaptations: string[];
}

export interface MemberPreferences {
  preferredElements: ElementalType[];
  avoidedPractices: string[];
  timeConstraints: number; // minutes
  intensityLevel: 'gentle' | 'moderate' | 'intense';
  spiritualBackground: string[];
}

export interface ProtocolExecution {
  protocolName: string;
  steps: ProtocolStep[];
  totalDuration: number;
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  success: boolean;
  feedback?: string;
}

export interface ProtocolStep {
  type: string;
  content: string;
  duration: number;
  element?: ElementalType;
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

// ============================================================================
// CONSCIOUSNESS ENGINE BRIDGE SERVICE
// ============================================================================

export class ConsciousnessEngineBridge {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl = 'http://localhost:7777', timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Analyze a Seven-Layer Architecture snapshot using the Lisp consciousness engine
   */
  async analyzeConsciousness(snapshot: SevenLayerSnapshot): Promise<ConsciousnessAnalysis> {
    try {
      const response = await this.makeRequest('/consciousness-engine/analyze', {
        method: 'POST',
        body: JSON.stringify({
          snapshot,
          timestamp: new Date().toISOString(),
          analysisType: 'full'
        })
      });

      return this.transformAnalysisResponse(response);
    } catch (error) {
      console.error('Failed to analyze consciousness:', error);
      return this.generateFallbackAnalysis(snapshot);
    }
  }

  /**
   * Get protocol recommendations based on consciousness analysis
   */
  async recommendProtocols(
    analysis: ConsciousnessAnalysis,
    preferences: MemberPreferences
  ): Promise<ProtocolRecommendation[]> {
    try {
      const response = await this.makeRequest('/consciousness-engine/protocol-recommend', {
        method: 'POST',
        body: JSON.stringify({
          analysis,
          preferences,
          context: 'daily_guidance'
        })
      });

      return this.transformProtocolRecommendations(response);
    } catch (error) {
      console.error('Failed to get protocol recommendations:', error);
      return this.generateFallbackProtocols(analysis);
    }
  }

  /**
   * Execute a protocol through the consciousness engine
   */
  async executeProtocol(
    protocolName: string,
    snapshot: SevenLayerSnapshot,
    customizations?: ProtocolCustomization
  ): Promise<ProtocolExecution> {
    try {
      const response = await this.makeRequest('/consciousness-engine/protocol-execute', {
        method: 'POST',
        body: JSON.stringify({
          protocolName,
          consciousnessState: snapshot,
          customizations,
          executionContext: 'web_interface'
        })
      });

      return this.transformProtocolExecution(response);
    } catch (error) {
      console.error('Failed to execute protocol:', error);
      return this.generateFallbackExecution(protocolName);
    }
  }

  /**
   * Detect archetypal patterns in consciousness data
   */
  async detectArchetypalPatterns(
    snapshot: SevenLayerSnapshot,
    historicalData?: SevenLayerSnapshot[]
  ): Promise<DetectedPattern[]> {
    try {
      const response = await this.makeRequest('/consciousness-engine/pattern-detect', {
        method: 'POST',
        body: JSON.stringify({
          currentSnapshot: snapshot,
          historicalSnapshots: historicalData || [],
          patternTypes: ['archetypal', 'elemental', 'spiral']
        })
      });

      return response.patterns || [];
    } catch (error) {
      console.error('Failed to detect patterns:', error);
      return [];
    }
  }

  /**
   * Get engine health and meta-circular analysis
   */
  async getEngineHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    metrics: Record<string, number>;
    selfAnalysis: string[];
    recommendations: string[];
  }> {
    try {
      const response = await this.makeRequest('/consciousness-engine/health');
      return response;
    } catch (error) {
      console.error('Failed to get engine health:', error);
      return {
        status: 'critical',
        metrics: {},
        selfAnalysis: ['Engine unreachable'],
        recommendations: ['Check Lisp service status']
      };
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(this.timeout)
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`Engine request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private transformAnalysisResponse(response: any): ConsciousnessAnalysis {
    return {
      patterns: response.patterns || [],
      elementalBalance: response.elementalBalance || this.getDefaultElementalBalance(),
      spiralDynamics: response.spiralDynamics || { currentStage: 'unknown', transitionProbability: 0 },
      archetypalState: response.archetypalState || {
        dominantArchetype: 'seeker',
        integrationLevel: 0.5
      },
      recommendations: response.recommendations || []
    };
  }

  private transformProtocolRecommendations(response: any): ProtocolRecommendation[] {
    return (response.protocols || []).map((p: any) => ({
      name: p.name,
      element: p.element || 'earth',
      duration: p.duration || 10,
      intention: p.intention || 'Consciousness development',
      stepsCount: p.stepsCount || 3,
      context: p.context || [],
      confidence: p.confidence || 0.5
    }));
  }

  private transformProtocolExecution(response: any): ProtocolExecution {
    return {
      protocolName: response.protocolName,
      steps: response.executionLog?.map((step: any) => ({
        type: step.type,
        content: step.notes || '',
        duration: 5, // Default
        completed: step.completed || false
      })) || [],
      totalDuration: response.estimatedDuration || 15,
      currentStep: 0,
      startedAt: new Date(),
      success: response.success || false
    };
  }

  private generateFallbackAnalysis(snapshot: SevenLayerSnapshot): ConsciousnessAnalysis {
    // Graceful degradation when Lisp engine is unavailable
    return {
      patterns: [
        {
          type: 'engine_unavailable',
          strength: 1.0,
          affectedLayers: ['symbolic', 'wisdom'],
          recommendation: 'Basic pattern analysis',
          description: 'Using fallback analysis - Lisp engine unavailable'
        }
      ],
      elementalBalance: this.analyzeElementalBalanceTS(snapshot),
      spiralDynamics: {
        currentStage: 'integral',
        transitionProbability: 0.3
      },
      archetypalState: {
        dominantArchetype: 'seeker',
        integrationLevel: 0.6
      },
      recommendations: [
        'Practice grounding meditation',
        'Engage in conscious reflection',
        'Connect with community'
      ]
    };
  }

  private generateFallbackProtocols(analysis: ConsciousnessAnalysis): ProtocolRecommendation[] {
    const { dominantElement, deficientElement } = analysis.elementalBalance;

    const protocols: ProtocolRecommendation[] = [];

    if (deficientElement === 'earth') {
      protocols.push({
        name: 'earth1-grounding-restoration',
        element: 'earth',
        duration: 10,
        intention: 'Return to earth, stability, and embodied presence',
        stepsCount: 4,
        context: ['overwhelm', 'spaciness', 'integration'],
        confidence: 0.8
      });
    }

    if (deficientElement === 'fire') {
      protocols.push({
        name: 'fire2-micro-ignition',
        element: 'fire',
        duration: 15,
        intention: 'Gentle ignition of creative fire and authentic visibility',
        stepsCount: 4,
        context: ['vocation', 'visibility'],
        confidence: 0.7
      });
    }

    return protocols;
  }

  private generateFallbackExecution(protocolName: string): ProtocolExecution {
    return {
      protocolName,
      steps: [
        {
          type: 'prepare',
          content: 'Create sacred space for practice',
          duration: 3,
          completed: false
        },
        {
          type: 'practice',
          content: 'Engage in consciousness practice',
          duration: 10,
          completed: false
        },
        {
          type: 'integrate',
          content: 'Integrate insights and complete practice',
          duration: 2,
          completed: false
        }
      ],
      totalDuration: 15,
      currentStep: 0,
      startedAt: new Date(),
      success: false
    };
  }

  private analyzeElementalBalanceTS(snapshot: SevenLayerSnapshot): ElementalBalance {
    // TypeScript-based elemental analysis (fallback)
    const layers = snapshot.layers;

    // Simple heuristic analysis based on layer data
    const fireLevel = this.calculateFireFromLayers(layers);
    const waterLevel = this.calculateWaterFromLayers(layers);
    const earthLevel = this.calculateEarthFromLayers(layers);
    const airLevel = this.calculateAirFromLayers(layers);
    const aetherLevel = this.calculateAetherFromLayers(layers);

    const elements = { fire: fireLevel, water: waterLevel, earth: earthLevel, air: airLevel, aether: aetherLevel };
    const dominantElement = Object.entries(elements).reduce((a, b) => elements[a[0]] > elements[b[0]] ? a : b)[0] as ElementalType;
    const deficientElement = Object.entries(elements).reduce((a, b) => elements[a[0]] < elements[b[0]] ? a : b)[0] as ElementalType;

    return {
      fire: fireLevel,
      water: waterLevel,
      earth: earthLevel,
      air: airLevel,
      aether: aetherLevel,
      dominantElement,
      deficientElement
    };
  }

  private calculateFireFromLayers(layers: any): number {
    // Look for activity, passion, creativity indicators
    return Math.random() * 0.5 + 0.3; // Placeholder
  }

  private calculateWaterFromLayers(layers: any): number {
    // Look for emotional depth, flow, intuition indicators
    return Math.random() * 0.5 + 0.3; // Placeholder
  }

  private calculateEarthFromLayers(layers: any): number {
    // Look for grounding, stability, practical indicators
    return Math.random() * 0.5 + 0.3; // Placeholder
  }

  private calculateAirFromLayers(layers: any): number {
    // Look for mental activity, communication, ideas indicators
    return Math.random() * 0.5 + 0.3; // Placeholder
  }

  private calculateAetherFromLayers(layers: any): number {
    // Look for spiritual connection, transcendence indicators
    return Math.random() * 0.5 + 0.3; // Placeholder
  }

  private getDefaultElementalBalance(): ElementalBalance {
    return {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      air: 0.5,
      aether: 0.5,
      dominantElement: 'earth',
      deficientElement: 'fire'
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const consciousnessEngine = new ConsciousnessEngineBridge();

// ============================================================================
// INTEGRATION WITH SEVEN-LAYER ARCHITECTURE
// ============================================================================

/**
 * Enhanced Seven-Layer Architecture analysis with Lisp consciousness engine
 */
export async function analyzeConsciousnessWithEngine(
  snapshot: SevenLayerSnapshot,
  preferences?: MemberPreferences
): Promise<{
  analysis: ConsciousnessAnalysis;
  protocols: ProtocolRecommendation[];
  patterns: DetectedPattern[];
}> {
  try {
    // Parallel analysis and pattern detection
    const [analysis, patterns] = await Promise.all([
      consciousnessEngine.analyzeConsciousness(snapshot),
      consciousnessEngine.detectArchetypalPatterns(snapshot)
    ]);

    // Get protocol recommendations based on analysis
    const protocols = await consciousnessEngine.recommendProtocols(
      analysis,
      preferences || getDefaultPreferences()
    );

    return { analysis, protocols, patterns };
  } catch (error) {
    console.error('Consciousness engine analysis failed:', error);

    // Graceful fallback
    const fallbackAnalysis = await consciousnessEngine.analyzeConsciousness(snapshot);
    return {
      analysis: fallbackAnalysis,
      protocols: [],
      patterns: []
    };
  }
}

function getDefaultPreferences(): MemberPreferences {
  return {
    preferredElements: ['earth', 'fire'],
    avoidedPractices: [],
    timeConstraints: 20,
    intensityLevel: 'moderate',
    spiritualBackground: ['integral', 'mindfulness']
  };
}

export default consciousnessEngine;