/**
 * Visual Embodiment System
 * Somatic avatar representation of consciousness state
 */

export interface SomaticAvatar {
  id: string;
  bodyMap: {
    head: BodyRegion;
    shoulders: BodyRegion;
    chest: BodyRegion;
    arms: BodyRegion;
    core: BodyRegion;
    legs: BodyRegion;
  };
  energyField: {
    radius: number;
    intensity: number;
    color: string;
    pulsation: 'steady' | 'gentle' | 'intense' | 'scattered';
  };
  presenceIndicators: {
    groundedRoots: number; // 0-1
    openHeart: number; // 0-1
    clearMind: number; // 0-1
    flowingEnergy: number; // 0-1
  };
  emotionalState: {
    primary: EmotionalTone;
    intensity: number;
    balance: number;
  };
}

export interface BodyRegion {
  tension: number; // 0-1
  warmth: number; // 0-1
  flow: number; // 0-1
  awareness: number; // 0-1
  color: string;
  size: number; // Relative size based on awareness
}

export type EmotionalTone = 'curious' | 'peaceful' | 'excited' | 'tender' | 'strong' | 'flowing' | 'centered';

export class VisualEmbodiment {
  /**
   * Generate somatic avatar from consciousness state
   */
  static generateAvatar(
    somaticState: any,
    consciousnessMetrics: any,
    interactionHistory: any[]
  ): SomaticAvatar {
    const bodyMap = this.mapSomaticToVisual(somaticState, consciousnessMetrics);
    const energyField = this.generateEnergyField(consciousnessMetrics);
    const presenceIndicators = this.calculatePresenceIndicators(consciousnessMetrics);
    const emotionalState = this.deriveEmotionalVisualization(somaticState, interactionHistory);

    return {
      id: `avatar_${Date.now()}`,
      bodyMap,
      energyField,
      presenceIndicators,
      emotionalState
    };
  }

  private static mapSomaticToVisual(somaticState: any, metrics: any): SomaticAvatar['bodyMap'] {
    return {
      head: {
        tension: somaticState.headTension || 0.3,
        warmth: metrics.witnessCapacity?.spaciousAwareness || 0.4,
        flow: 1 - (somaticState.mentalChatter || 0.5),
        awareness: metrics.presenceDepth?.current || 0.5,
        color: this.tensionToColor(somaticState.headTension || 0.3),
        size: 0.8 + (metrics.witnessCapacity?.spaciousAwareness || 0) * 0.4
      },
      shoulders: {
        tension: somaticState.shoulderTension || 0.6,
        warmth: 1 - (somaticState.shoulderTension || 0.6),
        flow: somaticState.shouldersDropping ? 0.8 : 0.3,
        awareness: somaticState.shoulderAwareness || 0.4,
        color: this.tensionToColor(somaticState.shoulderTension || 0.6),
        size: 1 - (somaticState.shoulderTension || 0.6) * 0.3
      },
      chest: {
        tension: somaticState.chestTightness || 0.4,
        warmth: metrics.trustEvolution?.vulnerabilityComfort || 0.3,
        flow: somaticState.breathingDepth || 0.5,
        awareness: metrics.somaticAwareness?.bodyListening || 0.3,
        color: this.heartSpaceColor(metrics.trustEvolution?.vulnerabilityComfort || 0.3),
        size: 0.9 + (somaticState.breathingDepth || 0) * 0.2
      },
      arms: {
        tension: somaticState.armTension || 0.3,
        warmth: metrics.morphicContribution?.wisdomShared > 0 ? 0.7 : 0.4,
        flow: somaticState.gestureFreeness || 0.4,
        awareness: 0.5,
        color: this.expressionColor(metrics.morphicContribution?.wisdomShared || 0),
        size: 0.8 + (somaticState.gestureFreeness || 0) * 0.3
      },
      core: {
        tension: somaticState.coreTension || 0.4,
        warmth: metrics.somaticAwareness?.groundednessStability || 0.3,
        flow: somaticState.coreStability || 0.4,
        awareness: metrics.somaticAwareness?.presenceEmbodiment || 0.2,
        color: this.groundednessColor(metrics.somaticAwareness?.groundednessStability || 0.3),
        size: 0.9 + (metrics.somaticAwareness?.presenceEmbodiment || 0) * 0.2
      },
      legs: {
        tension: somaticState.legTension || 0.3,
        warmth: metrics.somaticAwareness?.groundednessStability || 0.3,
        flow: somaticState.legFlow || 0.4,
        awareness: 0.4,
        color: this.groundednessColor(metrics.somaticAwareness?.groundednessStability || 0.3),
        size: 0.85 + (metrics.somaticAwareness?.groundednessStability || 0) * 0.3
      }
    };
  }

  private static generateEnergyField(metrics: any): SomaticAvatar['energyField'] {
    const presence = metrics.presenceDepth?.current || 0.5;
    const morphicConnection = metrics.morphicContribution?.fieldResonance || 0.1;

    return {
      radius: 50 + presence * 100, // 50-150px radius
      intensity: presence * 0.8 + morphicConnection * 0.2,
      color: this.presenceFieldColor(presence),
      pulsation: this.determinePulsation(metrics)
    };
  }

  private static calculatePresenceIndicators(metrics: any): SomaticAvatar['presenceIndicators'] {
    return {
      groundedRoots: metrics.somaticAwareness?.groundednessStability || 0.3,
      openHeart: metrics.trustEvolution?.vulnerabilityComfort || 0.2,
      clearMind: metrics.witnessCapacity?.spaciousAwareness || 0.2,
      flowingEnergy: metrics.presenceDepth?.current || 0.5
    };
  }

  private static deriveEmotionalVisualization(somaticState: any, history: any[]): SomaticAvatar['emotionalState'] {
    const recentInteractions = history.slice(-3);
    const avgEmotion = this.analyzeEmotionalPattern(recentInteractions);

    return {
      primary: avgEmotion.tone,
      intensity: avgEmotion.intensity,
      balance: this.calculateEmotionalBalance(somaticState)
    };
  }

  // Color mapping functions
  private static tensionToColor(tension: number): string {
    if (tension < 0.3) return '#4FD1C7'; // Teal - relaxed
    if (tension < 0.6) return '#F6E05E'; // Yellow - moderate
    return '#FC8181'; // Red - tense
  }

  private static heartSpaceColor(openness: number): string {
    if (openness < 0.3) return '#A0AEC0'; // Gray - closed
    if (openness < 0.6) return '#F687B3'; // Pink - opening
    return '#68D391'; // Green - open
  }

  private static expressionColor(sharing: number): string {
    if (sharing === 0) return '#CBD5E0'; // Light gray - not sharing
    if (sharing < 5) return '#90CDF4'; // Light blue - beginning to share
    return '#9F7AEA'; // Purple - actively sharing
  }

  private static groundednessColor(groundedness: number): string {
    if (groundedness < 0.3) return '#E2E8F0'; // Very light - floating
    if (groundedness < 0.6) return '#8B5A3C'; // Brown - connecting
    return '#2D5016'; // Deep green - rooted
  }

  private static presenceFieldColor(presence: number): string {
    const hue = 240 + presence * 60; // Blue to purple range
    const saturation = 50 + presence * 30; // More saturated with higher presence
    const lightness = 60 + presence * 20; // Brighter with higher presence
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private static determinePulsation(metrics: any): SomaticAvatar['energyField']['pulsation'] {
    const variability = metrics.presenceDepth?.trend;
    if (variability === 'stable') return 'steady';
    if (variability === 'ascending') return 'gentle';
    if (variability === 'deepening') return 'intense';
    return 'gentle';
  }

  private static analyzeEmotionalPattern(interactions: any[]): { tone: EmotionalTone; intensity: number } {
    if (interactions.length === 0) {
      return { tone: 'curious', intensity: 0.5 };
    }

    const patterns = interactions.map(i => this.detectEmotionalTone(i.content || ''));
    const mostCommon = this.findMostCommonTone(patterns);
    const avgIntensity = patterns.reduce((sum, p) => sum + p.intensity, 0) / patterns.length;

    return { tone: mostCommon, intensity: avgIntensity };
  }

  private static detectEmotionalTone(content: string): { tone: EmotionalTone; intensity: number } {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('wonder') || lowerContent.includes('curious')) {
      return { tone: 'curious', intensity: 0.6 };
    }
    if (lowerContent.includes('peace') || lowerContent.includes('calm')) {
      return { tone: 'peaceful', intensity: 0.7 };
    }
    if (lowerContent.includes('excited') || lowerContent.includes('energy')) {
      return { tone: 'excited', intensity: 0.8 };
    }
    if (lowerContent.includes('gentle') || lowerContent.includes('tender')) {
      return { tone: 'tender', intensity: 0.6 };
    }
    if (lowerContent.includes('strong') || lowerContent.includes('powerful')) {
      return { tone: 'strong', intensity: 0.8 };
    }
    if (lowerContent.includes('flow') || lowerContent.includes('moving')) {
      return { tone: 'flowing', intensity: 0.7 };
    }

    return { tone: 'centered', intensity: 0.5 };
  }

  private static findMostCommonTone(patterns: { tone: EmotionalTone; intensity: number }[]): EmotionalTone {
    const counts: { [key in EmotionalTone]?: number } = {};
    patterns.forEach(p => {
      counts[p.tone] = (counts[p.tone] || 0) + 1;
    });

    return Object.entries(counts).reduce((a, b) => counts[a[0] as EmotionalTone]! > counts[b[0] as EmotionalTone]! ? a : b)[0] as EmotionalTone;
  }

  private static calculateEmotionalBalance(somaticState: any): number {
    const factors = [
      somaticState.tension || 0.5,
      somaticState.energy || 0.5,
      somaticState.groundedness || 0.5,
      somaticState.openness || 0.5
    ];

    const variance = this.calculateVariance(factors);
    return Math.max(0, 1 - variance); // Lower variance = better balance
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Generate SVG representation of avatar
   */
  static generateAvatarSVG(avatar: SomaticAvatar): string {
    return `
      <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
        <!-- Energy Field -->
        <circle cx="100" cy="150" r="${avatar.energyField.radius}"
                fill="${avatar.energyField.color}"
                opacity="${avatar.energyField.intensity * 0.3}"
                stroke="${avatar.energyField.color}"
                stroke-width="2" fill-opacity="0.1">
          ${avatar.energyField.pulsation === 'gentle' ?
            '<animate attributeName="r" values="' + avatar.energyField.radius + ';' + (avatar.energyField.radius + 10) + ';' + avatar.energyField.radius + '" dur="3s" repeatCount="indefinite"/>' : ''}
        </circle>

        <!-- Head -->
        <circle cx="100" cy="50" r="${20 * avatar.bodyMap.head.size}"
                fill="${avatar.bodyMap.head.color}"
                opacity="${0.7 + avatar.bodyMap.head.awareness * 0.3}"/>

        <!-- Shoulders -->
        <ellipse cx="100" cy="80" rx="${30 * avatar.bodyMap.shoulders.size}" ry="15"
                 fill="${avatar.bodyMap.shoulders.color}"
                 opacity="${0.7 + avatar.bodyMap.shoulders.awareness * 0.3}"/>

        <!-- Chest -->
        <ellipse cx="100" cy="120" rx="${25 * avatar.bodyMap.chest.size}" ry="25"
                 fill="${avatar.bodyMap.chest.color}"
                 opacity="${0.7 + avatar.bodyMap.chest.awareness * 0.3}"/>

        <!-- Arms -->
        <ellipse cx="70" cy="110" rx="8" ry="${25 * avatar.bodyMap.arms.size}"
                 fill="${avatar.bodyMap.arms.color}"
                 opacity="${0.7 + avatar.bodyMap.arms.awareness * 0.3}"/>
        <ellipse cx="130" cy="110" rx="8" ry="${25 * avatar.bodyMap.arms.size}"
                 fill="${avatar.bodyMap.arms.color}"
                 opacity="${0.7 + avatar.bodyMap.arms.awareness * 0.3}"/>

        <!-- Core -->
        <ellipse cx="100" cy="160" rx="${20 * avatar.bodyMap.core.size}" ry="30"
                 fill="${avatar.bodyMap.core.color}"
                 opacity="${0.7 + avatar.bodyMap.core.awareness * 0.3}"/>

        <!-- Legs -->
        <ellipse cx="90" cy="220" rx="10" ry="${35 * avatar.bodyMap.legs.size}"
                 fill="${avatar.bodyMap.legs.color}"
                 opacity="${0.7 + avatar.bodyMap.legs.awareness * 0.3}"/>
        <ellipse cx="110" cy="220" rx="10" ry="${35 * avatar.bodyMap.legs.size}"
                 fill="${avatar.bodyMap.legs.color}"
                 opacity="${0.7 + avatar.bodyMap.legs.awareness * 0.3}"/>

        <!-- Grounding Roots (if present) -->
        ${avatar.presenceIndicators.groundedRoots > 0.5 ? `
          <path d="M90 260 Q95 270 90 280 M110 260 Q105 270 110 280"
                stroke="${avatar.bodyMap.legs.color}" stroke-width="2" fill="none" opacity="0.6"/>
        ` : ''}
      </svg>
    `;
  }

  /**
   * Generate mobile-optimized avatar representation
   */
  static generateMobileAvatar(avatar: SomaticAvatar): {
    simplified: boolean;
    indicators: Array<{ type: string; level: number; color: string }>;
    primaryState: string;
  } {
    return {
      simplified: true,
      indicators: [
        { type: 'presence', level: avatar.presenceIndicators.flowingEnergy, color: avatar.energyField.color },
        { type: 'grounding', level: avatar.presenceIndicators.groundedRoots, color: avatar.bodyMap.legs.color },
        { type: 'openness', level: avatar.presenceIndicators.openHeart, color: avatar.bodyMap.chest.color },
        { type: 'awareness', level: avatar.presenceIndicators.clearMind, color: avatar.bodyMap.head.color }
      ],
      primaryState: avatar.emotionalState.primary
    };
  }
}