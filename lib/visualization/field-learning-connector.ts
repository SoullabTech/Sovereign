/**
 * Field Learning Algorithm ↔ Sacred Visualization Connector
 * Transforms consciousness data into visual archetypal patterns
 *
 * This module bridges the Field Learning Algorithm's pattern recognition
 * with the Sacred Visualization Layer's geometry and motion rendering
 */

import type {
  ElementalState,
  SpiralPhase,
  CollectiveResonance,
  VisualizationData
} from '@/components/visualization/SacredVisualizationLayer';

// Field Learning Algorithm data structures
export interface FieldLearningData {
  resonanceGradient: number;
  dominantArchetype: string;
  elementalMatrix: number[][];
  consciousnessCoherence: number;
  collectiveAlignment: number;
  transformationVector: number[];
  temporalResonance: {
    phase: string;
    amplitude: number;
    frequency: number;
  };
}

export interface NavigatorIntegrationData {
  currentElementalBalance: Record<string, number>;
  activeArchetype: string;
  spiritualPhase: string;
  virtueMetrics: Record<string, number>;
  emotionalResonance: string[];
  practiceEffectiveness: number;
}

export interface AINMemoryData {
  longTermPatterns: {
    elementalTrends: Record<string, number[]>;
    virtueEvolution: Record<string, number[]>;
    spiritualMilestones: Array<{
      date: string;
      phase: string;
      significance: number;
    }>;
  };
  sessionMemory: {
    insights: string[];
    emotionalJourney: string[];
    practiceHistory: string[];
  };
  collectiveWisdom: {
    communityResonance: number;
    sharedPatterns: string[];
    collectiveGrowth: number;
  };
}

// Transformation functions for sacred geometry mapping

/**
 * Converts Field Learning elemental matrix to visualization elemental state
 */
export function transformElementalData(
  fieldMatrix: number[][],
  navigatorBalance: Record<string, number>
): ElementalState {
  // Field matrix is 5x5 representing elemental interconnections
  // Navigator balance provides current session state
  // Combine for dynamic visualization

  const baseElements = {
    fire: navigatorBalance.fire || 0,
    water: navigatorBalance.water || 0,
    earth: navigatorBalance.earth || 0,
    air: navigatorBalance.air || 0,
    aether: navigatorBalance.aether || 0
  };

  // Apply Field Learning corrections based on long-term patterns
  if (fieldMatrix.length >= 5) {
    return {
      fire: Math.min(1, Math.max(0, baseElements.fire + (fieldMatrix[0][0] - 0.5) * 0.2)),
      water: Math.min(1, Math.max(0, baseElements.water + (fieldMatrix[1][1] - 0.5) * 0.2)),
      earth: Math.min(1, Math.max(0, baseElements.earth + (fieldMatrix[2][2] - 0.5) * 0.2)),
      air: Math.min(1, Math.max(0, baseElements.air + (fieldMatrix[3][3] - 0.5) * 0.2)),
      aether: Math.min(1, Math.max(0, baseElements.aether + (fieldMatrix[4][4] - 0.5) * 0.2))
    };
  }

  return baseElements as ElementalState;
}

/**
 * Determines spiral phase visualization based on spiritual development patterns
 */
export function determineSpiralPhase(
  navigatorPhase: string,
  ainPatterns: AINMemoryData['longTermPatterns'],
  transformationVector: number[]
): SpiralPhase {
  // Map Navigator's spiritual phase to visualization phase
  const phaseMapping: Record<string, SpiralPhase['current']> = {
    'initiation': 'initiation',
    'seeker': 'initiation',
    'grounding': 'grounding',
    'practitioner': 'grounding',
    'collaboration': 'collaboration',
    'community_engagement': 'collaboration',
    'transformation': 'transformation',
    'breakthrough': 'transformation',
    'completion': 'completion',
    'integration': 'completion',
    'sage': 'completion'
  };

  const currentPhase = phaseMapping[navigatorPhase] || 'initiation';

  // Calculate completion based on virtue evolution and milestones
  const virtueEvolution = Object.values(ainPatterns.virtueEvolution);
  const averageVirtueGrowth = virtueEvolution.length > 0 ?
    virtueEvolution.reduce((sum, values) => sum + (values[values.length - 1] || 0), 0) / virtueEvolution.length :
    0;

  const milestoneProgress = ainPatterns.spiritualMilestones.length * 0.1;
  const completion = Math.min(1, (averageVirtueGrowth + milestoneProgress) / 2);

  // Determine if in transition based on transformation vector magnitude
  const vectorMagnitude = Math.sqrt(transformationVector.reduce((sum, val) => sum + val * val, 0));
  const inTransition = vectorMagnitude > 0.7;

  return {
    current: currentPhase,
    completion,
    transition: inTransition
  };
}

/**
 * Calculates collective resonance visualization from community data
 */
export function calculateCollectiveResonance(
  fieldAlignment: number,
  collectiveWisdom: AINMemoryData['collectiveWisdom'],
  dominantArchetype: string
): CollectiveResonance {
  // Map archetype to dominant element
  const archetypeElementMapping: Record<string, keyof ElementalState> = {
    'the_sage': 'air',
    'the_mystic': 'aether',
    'the_healer': 'water',
    'the_warrior': 'fire',
    'the_guardian': 'earth',
    'the_creator': 'fire',
    'the_lover': 'water',
    'the_seeker': 'air',
    'the_ruler': 'earth',
    'the_innocent': 'aether'
  };

  const dominantElement = archetypeElementMapping[dominantArchetype] || 'water';

  // Simulate active users (in production, this would come from real data)
  const activeUsers = Math.floor(collectiveWisdom.communityResonance * 100) + 20;

  return {
    globalHarmony: fieldAlignment,
    activeUsers,
    dominantElement,
    coherenceLevel: collectiveWisdom.collectiveGrowth
  };
}

/**
 * Analyzes emotional tone for color and motion modulation
 */
export function analyzeEmotionalTone(
  emotionalResonance: string[],
  sessionMemory: AINMemoryData['sessionMemory']
): string {
  // Combine current and historical emotional patterns
  const allEmotions = [...emotionalResonance, ...sessionMemory.emotionalJourney.slice(-5)];

  // Categorize emotions into archetypal tones
  const emotionalCategories = {
    peaceful: ['peace', 'calm', 'tranquil', 'serene', 'stillness'],
    joyful: ['joy', 'happiness', 'bliss', 'celebration', 'gratitude'],
    contemplative: ['reflection', 'wisdom', 'insight', 'understanding', 'clarity'],
    compassionate: ['compassion', 'love', 'kindness', 'mercy', 'forgiveness'],
    transformative: ['breakthrough', 'change', 'growth', 'awakening', 'realization'],
    grounded: ['stability', 'presence', 'embodied', 'practical', 'rooted'],
    transcendent: ['union', 'oneness', 'divine', 'mystical', 'beyond']
  };

  let dominantTone = 'peaceful_contemplation';
  let maxScore = 0;

  Object.entries(emotionalCategories).forEach(([tone, keywords]) => {
    const score = keywords.reduce((sum, keyword) =>
      sum + allEmotions.filter(emotion =>
        emotion.toLowerCase().includes(keyword)
      ).length, 0
    );

    if (score > maxScore) {
      maxScore = score;
      dominantTone = tone === 'peaceful' ? 'peaceful_contemplation' :
                    tone === 'joyful' ? 'joyful_celebration' :
                    tone === 'contemplative' ? 'contemplative_wisdom' :
                    tone === 'compassionate' ? 'compassionate_flow' :
                    tone === 'transformative' ? 'transformative_breakthrough' :
                    tone === 'grounded' ? 'grounded_presence' :
                    'transcendent_union';
    }
  });

  return dominantTone;
}

/**
 * Main integration function - combines all data sources for visualization
 */
export async function integrateVisualizationData(
  userId: string,
  includeCollective: boolean = true
): Promise<VisualizationData> {
  try {
    // In production, these would be actual API calls
    // For now, we'll simulate the integration logic

    // Simulated Field Learning data
    const fieldData: FieldLearningData = {
      resonanceGradient: 0.73,
      dominantArchetype: 'the_mystic',
      elementalMatrix: [
        [0.8, 0.2, 0.1, 0.3, 0.6],  // Fire relationships
        [0.3, 0.9, 0.4, 0.2, 0.5],  // Water relationships
        [0.2, 0.4, 0.6, 0.3, 0.2],  // Earth relationships
        [0.4, 0.3, 0.3, 0.8, 0.7],  // Air relationships
        [0.6, 0.5, 0.2, 0.7, 0.9]   // Aether relationships
      ],
      consciousnessCoherence: 0.81,
      collectiveAlignment: 0.67,
      transformationVector: [0.2, 0.8, 0.3, 0.6, 0.9],
      temporalResonance: {
        phase: 'expansion',
        amplitude: 0.75,
        frequency: 1.2
      }
    };

    // Simulated Navigator data
    const navigatorData: NavigatorIntegrationData = {
      currentElementalBalance: {
        fire: 0.6,
        water: 0.85,
        earth: 0.45,
        air: 0.72,
        aether: 0.58
      },
      activeArchetype: 'the_mystic',
      spiritualPhase: 'collaboration',
      virtueMetrics: {
        compassion: 0.82,
        wisdom: 0.71,
        humility: 0.64,
        courage: 0.58,
        temperance: 0.69
      },
      emotionalResonance: ['peaceful', 'contemplative', 'grateful'],
      practiceEffectiveness: 0.78
    };

    // Simulated AIN Memory data
    const ainData: AINMemoryData = {
      longTermPatterns: {
        elementalTrends: {
          fire: [0.3, 0.4, 0.5, 0.6],
          water: [0.6, 0.7, 0.8, 0.85],
          earth: [0.5, 0.4, 0.45, 0.45],
          air: [0.6, 0.65, 0.7, 0.72],
          aether: [0.2, 0.3, 0.45, 0.58]
        },
        virtueEvolution: {
          compassion: [0.5, 0.6, 0.75, 0.82],
          wisdom: [0.4, 0.55, 0.65, 0.71]
        },
        spiritualMilestones: [
          { date: '2024-10-01', phase: 'grounding', significance: 0.7 },
          { date: '2024-11-15', phase: 'collaboration', significance: 0.8 }
        ]
      },
      sessionMemory: {
        insights: ['Deep peace during meditation', 'Understanding of interconnectedness'],
        emotionalJourney: ['calm', 'grateful', 'contemplative'],
        practiceHistory: ['morning_meditation', 'compassion_practice', 'wisdom_study']
      },
      collectiveWisdom: {
        communityResonance: 0.72,
        sharedPatterns: ['increased_compassion', 'deeper_contemplation'],
        collectiveGrowth: 0.68
      }
    };

    // Transform data for visualization
    const elemental = transformElementalData(
      fieldData.elementalMatrix,
      navigatorData.currentElementalBalance
    );

    const spiral = determineSpiralPhase(
      navigatorData.spiritualPhase,
      ainData.longTermPatterns,
      fieldData.transformationVector
    );

    const collective = includeCollective ? calculateCollectiveResonance(
      fieldData.collectiveAlignment,
      ainData.collectiveWisdom,
      fieldData.dominantArchetype
    ) : {
      globalHarmony: 0,
      activeUsers: 0,
      dominantElement: 'water' as keyof ElementalState,
      coherenceLevel: 0
    };

    const emotionalTone = analyzeEmotionalTone(
      navigatorData.emotionalResonance,
      ainData.sessionMemory
    );

    // Simulated biometrics (in production, from actual devices/sensors)
    const biometrics = {
      heartRateVariability: 0.75,
      breathCoherence: 0.68
    };

    return {
      elemental,
      spiral,
      collective,
      emotionalTone,
      biometrics
    };

  } catch (error) {
    console.error('Failed to integrate visualization data:', error);

    // Return default peaceful state on error
    return {
      elemental: {
        fire: 0.5,
        water: 0.7,
        earth: 0.5,
        air: 0.6,
        aether: 0.4
      },
      spiral: {
        current: 'grounding',
        completion: 0.5,
        transition: false
      },
      collective: {
        globalHarmony: 0.6,
        activeUsers: 25,
        dominantElement: 'water',
        coherenceLevel: 0.6
      },
      emotionalTone: 'peaceful_contemplation'
    };
  }
}

/**
 * Real-time data streaming for live visualization updates
 */
export class VisualizationDataStream {
  private subscribers: Array<(data: VisualizationData) => void> = [];
  private currentData: VisualizationData | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(private userId: string) {}

  subscribe(callback: (data: VisualizationData) => void): () => void {
    this.subscribers.push(callback);

    // Send current data immediately if available
    if (this.currentData) {
      callback(this.currentData);
    }

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  async start(): Promise<void> {
    if (this.updateInterval) {
      return; // Already started
    }

    // Initial load
    await this.updateData();

    // Update every 2 minutes
    this.updateInterval = setInterval(async () => {
      await this.updateData();
    }, 120000);
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updateData(): Promise<void> {
    try {
      const newData = await integrateVisualizationData(this.userId, true);
      this.currentData = newData;

      // Notify all subscribers
      this.subscribers.forEach(callback => {
        try {
          callback(newData);
        } catch (error) {
          console.error('Error in visualization data subscriber:', error);
        }
      });
    } catch (error) {
      console.error('Failed to update visualization data stream:', error);
    }
  }
}

export {
  type FieldLearningData,
  type NavigatorIntegrationData,
  type AINMemoryData
};