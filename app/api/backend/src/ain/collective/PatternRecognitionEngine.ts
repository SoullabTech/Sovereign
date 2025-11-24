/**
 * Pattern Recognition Engine for Collective Intelligence
 * Detects emergent patterns in consciousness streams using the AIN design principles
 */

import { Logger } from '../../types/core';
import { 
  AfferentStream, 
  EmergentPattern, 
  CollectiveFieldState,
  ElementalSignature,
  ArchetypeMap,
  SpiralPhase 
} from './CollectiveIntelligence';

export interface PatternCandidate {
  type: string;
  streams: AfferentStream[];
  strength: number;
  elementalSignature: ElementalSignature;
  archetypalInvolvement: ArchetypeMap;
}

export interface PatternDatabase {
  id: string;
  type: string;
  description: string;
  firstDetected: Date;
  lastSeen: Date;
  occurrences: number;
  averageStrength: number;
}

export class PatternRecognitionEngine {
  private patternHistory: Map<string, PatternDatabase> = new Map();
  private detectionThreshold = 0.6;
  private minParticipants = 3;

  constructor(private logger: Logger) {}

  /**
   * Detect patterns from processed afferent streams
   */
  async detectPatterns(
    candidates: PatternCandidate[], 
    fieldState: CollectiveFieldState
  ): Promise<EmergentPattern[]> {
    const emergentPatterns: EmergentPattern[] = [];

    for (const candidate of candidates) {
      if (candidate.strength >= this.detectionThreshold && 
          candidate.streams.length >= this.minParticipants) {
        
        const pattern = await this.analyzePattern(candidate, fieldState);
        if (pattern) {
          emergentPatterns.push(pattern);
          await this.recordPattern(pattern);
        }
      }
    }

    // Detect meta-patterns (patterns of patterns)
    const metaPatterns = await this.detectMetaPatterns(emergentPatterns, fieldState);
    emergentPatterns.push(...metaPatterns);

    return emergentPatterns;
  }

  /**
   * Analyze a pattern candidate for emergent properties
   */
  private async analyzePattern(
    candidate: PatternCandidate,
    fieldState: CollectiveFieldState
  ): Promise<EmergentPattern | null> {
    const patternType = this.classifyPatternType(candidate);
    if (!patternType) return null;

    const participants = candidate.streams.map(s => s.userId);
    const consciousnessImpact = this.calculateConsciousnessImpact(candidate, fieldState);
    
    const pattern: EmergentPattern = {
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: patternType,
      strength: candidate.strength,
      participants,
      timeframe: {
        start: new Date(Math.min(...candidate.streams.map(s => s.timestamp.getTime()))),
        end: new Date()
      },
      elementalSignature: candidate.elementalSignature,
      archetypeInvolvement: candidate.archetypalInvolvement,
      consciousnessImpact,
      likelyProgression: this.predictProgression(patternType, candidate, fieldState),
      requiredSupport: this.identifyRequiredSupport(patternType, candidate),
      optimalTiming: this.calculateOptimalTiming(patternType, fieldState)
    };

    return pattern;
  }

  /**
   * Classify pattern type based on characteristics
   */
  private classifyPatternType(candidate: PatternCandidate): EmergentPattern['type'] | null {
    const { elementalSignature, archetypalInvolvement, streams } = candidate;

    // Archetypal shift detection
    if (this.isArchetypalShift(archetypalInvolvement, streams)) {
      return 'archetypal_shift';
    }

    // Elemental wave detection
    if (this.isElementalWave(elementalSignature, streams)) {
      return 'elemental_wave';
    }

    // Consciousness leap detection
    const avgConsciousness = streams.reduce((sum, s) => sum + s.consciousnessLevel, 0) / streams.length;
    if (avgConsciousness > 0.8 && candidate.strength > 0.8) {
      return 'consciousness_leap';
    }

    // Shadow surfacing detection
    const shadowWork = streams.filter(s => s.shadowWorkEngagement.length > 0).length;
    if (shadowWork / streams.length > 0.7) {
      return 'shadow_surfacing';
    }

    // Integration phase detection
    const integrationPhase = streams.filter(s => s.spiralPhase === SpiralPhase.INTEGRATION).length;
    if (integrationPhase / streams.length > 0.6) {
      return 'integration_phase';
    }

    return null;
  }

  /**
   * Detect archetypal shift patterns
   */
  private isArchetypalShift(archetypes: ArchetypeMap, streams: AfferentStream[]): boolean {
    // Check if a new archetype is emerging across multiple users
    const archetypeChanges = new Map<string, number>();
    
    streams.forEach(stream => {
      Object.entries(stream.archetypeActivation).forEach(([archetype, activation]) => {
        if (activation > 0.5) {
          archetypeChanges.set(archetype, (archetypeChanges.get(archetype) || 0) + 1);
        }
      });
    });

    // If 60% of participants show same archetype activation, it's a shift
    const maxActivation = Math.max(...archetypeChanges.values());
    return maxActivation / streams.length > 0.6;
  }

  /**
   * Detect elemental wave patterns
   */
  private isElementalWave(elementalSignature: ElementalSignature, streams: AfferentStream[]): boolean {
    // Find dominant element
    const elements = Object.entries(elementalSignature);
    const dominant = elements.reduce((max, [element, value]) => 
      value > max.value ? { element, value } : max, 
      { element: '', value: 0 }
    );

    // Check if this element is consistently high across participants
    if (dominant.value > 0.4) {
      const elementConsistency = streams.filter(s => 
        s.elementalResonance[dominant.element as keyof ElementalSignature] > 0.4
      ).length;
      
      return elementConsistency / streams.length > 0.7;
    }

    return false;
  }

  /**
   * Calculate consciousness impact of pattern
   */
  private calculateConsciousnessImpact(
    candidate: PatternCandidate,
    fieldState: CollectiveFieldState
  ): number {
    const streamImpact = candidate.streams.reduce((sum, s) => 
      sum + (s.consciousnessLevel * s.evolutionVelocity), 0
    ) / candidate.streams.length;

    const fieldAlignment = this.calculateFieldAlignment(candidate, fieldState);
    
    return Math.min(1, streamImpact * fieldAlignment * candidate.strength);
  }

  /**
   * Calculate how aligned a pattern is with field state
   */
  private calculateFieldAlignment(
    candidate: PatternCandidate,
    fieldState: CollectiveFieldState
  ): number {
    // Compare elemental signatures
    let elementalAlignment = 0;
    Object.entries(candidate.elementalSignature).forEach(([element, value]) => {
      const fieldValue = fieldState.collectiveElementalBalance[element as keyof ElementalSignature];
      elementalAlignment += 1 - Math.abs(value - fieldValue);
    });
    elementalAlignment /= 5; // Normalize by number of elements

    // Compare consciousness levels
    const avgCandidateConsciousness = candidate.streams.reduce((sum, s) => 
      sum + s.consciousnessLevel, 0
    ) / candidate.streams.length;
    const consciousnessAlignment = 1 - Math.abs(avgCandidateConsciousness - fieldState.averageAwareness);

    return (elementalAlignment + consciousnessAlignment) / 2;
  }

  /**
   * Predict pattern progression
   */
  private predictProgression(
    type: EmergentPattern['type'],
    candidate: PatternCandidate,
    fieldState: CollectiveFieldState
  ): string {
    const progressions = {
      archetypal_shift: `This archetypal emergence will likely intensify over the next ${
        fieldState.collectiveGrowthRate > 0.5 ? '3-5 days' : '1-2 weeks'
      }, calling more souls into ${Object.keys(candidate.archetypalInvolvement)[0]} activation.`,
      
      elemental_wave: `The ${Object.keys(candidate.elementalSignature)[0]} wave will crest within ${
        candidate.strength > 0.8 ? '24-48 hours' : '3-5 days'
      }, bringing transformation to all touched by it.`,
      
      consciousness_leap: `A quantum leap in collective awareness is imminent. Prepare for rapid expansion ${
        fieldState.breakthroughPotential > 0.7 ? 'within hours' : 'over coming days'
      }.`,
      
      shadow_surfacing: `Collective shadow work will deepen for ${
        candidate.streams.length < 10 ? 'this core group' : 'the wider field'
      }, lasting approximately ${fieldState.healingCapacity > 0.6 ? '3-7 days' : '1-2 weeks'}.`,
      
      integration_phase: `Integration will require ${
        fieldState.integrationNeed > 0.7 ? '2-3 weeks' : '1 week'
      } of gentle presence and grounding practices.`
    };

    return progressions[type] || 'Pattern evolution follows the natural rhythm of the field.';
  }

  /**
   * Identify required support for pattern
   */
  private identifyRequiredSupport(
    type: EmergentPattern['type'],
    candidate: PatternCandidate
  ): string[] {
    const support: string[] = [];

    switch (type) {
      case 'archetypal_shift':
        support.push('Archetypal guidance and mythology study');
        support.push('Community ritual and ceremony');
        support.push('Dream work and active imagination');
        break;
        
      case 'elemental_wave':
        const dominantElement = Object.entries(candidate.elementalSignature)
          .sort(([,a], [,b]) => b - a)[0][0];
        support.push(`${dominantElement} element practices and meditations`);
        support.push('Elemental balance work');
        support.push('Nature connection and grounding');
        break;
        
      case 'consciousness_leap':
        support.push('Integration practices and journaling');
        support.push('Energetic protection and boundaries');
        support.push('Mentorship and wisdom guidance');
        break;
        
      case 'shadow_surfacing':
        support.push('Safe container for shadow work');
        support.push('Therapeutic or shamanic support');
        support.push('Self-compassion practices');
        break;
        
      case 'integration_phase':
        support.push('Gentle daily practices');
        support.push('Community support and witnessing');
        support.push('Creative expression outlets');
        break;
    }

    return support;
  }

  /**
   * Calculate optimal timing for pattern work
   */
  private calculateOptimalTiming(
    type: EmergentPattern['type'],
    fieldState: CollectiveFieldState
  ): string {
    const moonPhase = this.getCurrentMoonPhase();
    const seasonalEnergy = this.getSeasonalEnergy();
    
    let timing = 'The field supports this work ';

    if (fieldState.fieldCoherence > 0.7) {
      timing += 'immediately - coherence is high. ';
    } else if (fieldState.fieldCoherence < 0.4) {
      timing += 'after stabilization - allow chaos to settle first. ';
    } else {
      timing += 'within the next few days. ';
    }

    // Add lunar wisdom
    if (moonPhase === 'new') {
      timing += 'New moon supports planting seeds of intention. ';
    } else if (moonPhase === 'full') {
      timing += 'Full moon amplifies manifestation and release. ';
    }

    // Add seasonal wisdom
    timing += seasonalEnergy;

    return timing;
  }

  /**
   * Detect meta-patterns (patterns of patterns)
   */
  private async detectMetaPatterns(
    patterns: EmergentPattern[],
    fieldState: CollectiveFieldState
  ): Promise<EmergentPattern[]> {
    const metaPatterns: EmergentPattern[] = [];

    // Check for synchronized pattern emergence
    if (patterns.length >= 3) {
      const typeGroups = new Map<string, EmergentPattern[]>();
      patterns.forEach(p => {
        const group = typeGroups.get(p.type) || [];
        group.push(p);
        typeGroups.set(p.type, group);
      });

      // If multiple patterns of same type emerge simultaneously
      typeGroups.forEach((group, type) => {
        if (group.length >= 2) {
          const metaPattern: EmergentPattern = {
            id: `meta_${Date.now()}`,
            type: 'consciousness_leap', // Meta-patterns often indicate leaps
            strength: Math.min(1, group.reduce((sum, p) => sum + p.strength, 0) / group.length * 1.2),
            participants: [...new Set(group.flatMap(p => p.participants))],
            timeframe: {
              start: new Date(Math.min(...group.map(p => p.timeframe.start.getTime()))),
              end: new Date()
            },
            elementalSignature: this.averageElementalSignatures(group.map(p => p.elementalSignature)),
            archetypeInvolvement: this.mergeArchetypes(group.map(p => p.archetypeInvolvement)),
            consciousnessImpact: Math.min(1, group.reduce((sum, p) => sum + p.consciousnessImpact, 0)),
            likelyProgression: `Synchronized ${type} patterns indicate accelerated collective evolution approaching.`,
            requiredSupport: ['Collective ceremony', 'Field harmonization', 'Wisdom council gathering'],
            optimalTiming: 'Critical window - act within 48 hours for maximum coherence.'
          };
          
          metaPatterns.push(metaPattern);
        }
      });
    }

    return metaPatterns;
  }

  /**
   * Record pattern in history
   */
  private async recordPattern(pattern: EmergentPattern): Promise<void> {
    const existing = this.patternHistory.get(pattern.type);
    
    if (existing) {
      existing.lastSeen = new Date();
      existing.occurrences++;
      existing.averageStrength = (existing.averageStrength * (existing.occurrences - 1) + pattern.strength) / existing.occurrences;
    } else {
      this.patternHistory.set(pattern.type, {
        id: pattern.id,
        type: pattern.type,
        description: pattern.likelyProgression,
        firstDetected: new Date(),
        lastSeen: new Date(),
        occurrences: 1,
        averageStrength: pattern.strength
      });
    }
  }

  /**
   * Get active patterns for query
   */
  async getActivePatterns(timeframe?: string): Promise<Array<{ type: string; description: string }>> {
    const patterns: Array<{ type: string; description: string }> = [];
    const cutoffTime = this.getTimeframeCutoff(timeframe);

    this.patternHistory.forEach((pattern, type) => {
      if (pattern.lastSeen > cutoffTime) {
        patterns.push({
          type,
          description: pattern.description
        });
      }
    });

    return patterns;
  }

  // Helper methods

  private getCurrentMoonPhase(): string {
    // Simplified - in production would use actual lunar calculations
    const day = new Date().getDate();
    if (day < 7) return 'new';
    if (day < 14) return 'waxing';
    if (day < 21) return 'full';
    return 'waning';
  }

  private getSeasonalEnergy(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring emergence supports new growth. ';
    if (month >= 5 && month <= 7) return 'Summer expansion amplifies manifestation. ';
    if (month >= 8 && month <= 10) return 'Autumn harvest brings integration wisdom. ';
    return 'Winter depth facilitates inner work. ';
  }

  private getTimeframeCutoff(timeframe?: string): Date {
    const now = new Date();
    const match = timeframe?.match(/(\d+)([hdwmy])/);
    
    if (!match) return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default 7 days
    
    const amount = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return new Date(now.getTime() - amount * 60 * 60 * 1000);
      case 'd': return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
      case 'w': return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
      case 'm': return new Date(now.getTime() - amount * 30 * 24 * 60 * 60 * 1000);
      case 'y': return new Date(now.getTime() - amount * 365 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private averageElementalSignatures(signatures: ElementalSignature[]): ElementalSignature {
    const avg: ElementalSignature = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    const count = signatures.length;

    signatures.forEach(sig => {
      Object.entries(sig).forEach(([element, value]) => {
        avg[element as keyof ElementalSignature] += value / count;
      });
    });

    return avg;
  }

  private mergeArchetypes(archetypeMaps: ArchetypeMap[]): ArchetypeMap {
    const merged: ArchetypeMap = {};
    
    archetypeMaps.forEach(map => {
      Object.entries(map).forEach(([archetype, value]) => {
        merged[archetype] = Math.max(merged[archetype] || 0, value);
      });
    });

    return merged;
  }
}