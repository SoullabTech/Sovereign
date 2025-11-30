/**
 * Evolution Tracker for User Consciousness Development
 * Tracks individual and collective evolution patterns across the AIN system
 */

import { Logger } from '../../types/core';
import { 
  AfferentStream, 
  CollectiveFieldState,
  ElementalSignature,
  ArchetypeMap
} from './CollectiveIntelligence';
import { SpiralPhase } from '../../spiralogic/SpiralogicCognitiveEngine';

export interface UserEvolutionProfile {
  userId: string;
  startDate: Date;
  lastUpdated: Date;
  
  // Evolution trajectory
  currentPhase: SpiralPhase;
  phaseHistory: PhaseTransition[];
  evolutionVelocity: number;
  stabilityLevel: number;
  
  // Elemental development
  elementalMastery: ElementalMasteryMap;
  dominantElement: keyof ElementalSignature;
  integrationElement: keyof ElementalSignature;
  
  // Consciousness markers
  awarenessLevel: number;
  integrationDepth: number;
  shadowIntegration: number;
  authenticityLevel: number;
  
  // Relational patterns
  mayaRelationship: number;
  challengeReceptivity: number;
  collectiveContribution: number;
  
  // Breakthrough patterns
  breakthroughHistory: Breakthrough[];
  currentBreakthroughPotential: number;
  nextEvolutionThreshold: EvolutionThreshold;
}

export interface PhaseTransition {
  fromPhase: SpiralPhase;
  toPhase: SpiralPhase;
  timestamp: Date;
  catalysts: string[];
  integrationQuality: number;
}

export interface ElementalMasteryMap {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

export interface Breakthrough {
  id: string;
  timestamp: Date;
  type: 'shadow_integration' | 'elemental_balance' | 'archetype_activation' | 'consciousness_leap';
  intensity: number;
  description: string;
  sustainedIntegration: boolean;
}

export interface EvolutionThreshold {
  nextPhase: SpiralPhase;
  readiness: number;
  blockers: string[];
  catalysts: string[];
  estimatedTimeframe: string;
}

export interface EvolutionGuidance {
  currentFocus: string;
  nextSteps: string[];
  elementalBalance: string;
  shadowWork: string;
  collectiveRole: string;
  timingWisdom: string;
}

export class EvolutionTracker {
  private userProfiles: Map<string, UserEvolutionProfile> = new Map();
  private phaseThresholds = {
    initiation: 0.2,
    challenge: 0.4,
    integration: 0.6,
    mastery: 0.8,
    transcendence: 0.95
  };

  constructor(private logger: Logger) {}

  /**
   * Record evolution data from afferent stream
   */
  async recordEvolution(stream: AfferentStream): Promise<void> {
    const profile = this.getUserProfile(stream.userId);
    
    // Update consciousness markers
    profile.awarenessLevel = this.smoothUpdate(profile.awarenessLevel, stream.consciousnessLevel);
    profile.integrationDepth = this.smoothUpdate(profile.integrationDepth, stream.integrationDepth);
    profile.authenticityLevel = this.smoothUpdate(profile.authenticityLevel, stream.authenticityLevel);
    
    // Update elemental mastery
    this.updateElementalMastery(profile, stream.elementalResonance);
    
    // Check for phase transitions
    const newPhase = this.calculateCurrentPhase(profile);
    if (newPhase !== profile.currentPhase) {
      await this.recordPhaseTransition(profile, newPhase, stream);
    }
    
    // Update evolution velocity
    profile.evolutionVelocity = stream.evolutionVelocity;
    
    // Check for breakthroughs
    await this.detectBreakthroughs(profile, stream);
    
    // Update relational patterns
    profile.mayaRelationship = this.smoothUpdate(profile.mayaRelationship, stream.mayaResonance);
    profile.challengeReceptivity = this.smoothUpdate(profile.challengeReceptivity, stream.challengeAcceptance);
    profile.collectiveContribution = this.smoothUpdate(profile.collectiveContribution, stream.fieldContribution);
    
    // Calculate next evolution threshold
    profile.nextEvolutionThreshold = this.calculateNextThreshold(profile);
    
    profile.lastUpdated = new Date();
    this.userProfiles.set(stream.userId, profile);
  }

  /**
   * Generate evolution guidance for a user
   */
  async generateGuidance(userId: string, context?: any): Promise<EvolutionGuidance> {
    const profile = this.getUserProfile(userId);
    
    return {
      currentFocus: this.generateCurrentFocus(profile),
      nextSteps: this.generateNextSteps(profile),
      elementalBalance: this.generateElementalGuidance(profile),
      shadowWork: this.generateShadowGuidance(profile),
      collectiveRole: this.generateCollectiveRole(profile),
      timingWisdom: this.generateTimingWisdom(profile)
    };
  }

  /**
   * Get evolution statistics for collective analysis
   */
  async getCollectiveEvolutionStats(): Promise<{
    averageAwareness: number;
    phaseDistribution: Record<SpiralPhase, number>;
    evolutionVelocity: number;
    breakthroughRate: number;
  }> {
    const profiles = Array.from(this.userProfiles.values());
    
    const stats = {
      averageAwareness: profiles.reduce((sum, p) => sum + p.awarenessLevel, 0) / profiles.length,
      phaseDistribution: this.calculatePhaseDistribution(profiles),
      evolutionVelocity: profiles.reduce((sum, p) => sum + p.evolutionVelocity, 0) / profiles.length,
      breakthroughRate: this.calculateBreakthroughRate(profiles)
    };
    
    return stats;
  }

  /**
   * Detect evolution patterns across users
   */
  async detectEvolutionPatterns(): Promise<Array<{
    pattern: string;
    users: string[];
    strength: number;
  }>> {
    const patterns: Array<{ pattern: string; users: string[]; strength: number }> = [];
    
    // Detect synchronized phase transitions
    const recentTransitions = this.getRecentPhaseTransitions();
    if (recentTransitions.length > 3) {
      patterns.push({
        pattern: 'synchronized_evolution',
        users: recentTransitions.map(t => t.userId),
        strength: 0.8
      });
    }
    
    // Detect elemental wave patterns
    const elementalWaves = this.detectElementalWaves();
    patterns.push(...elementalWaves);
    
    // Detect collective breakthrough patterns
    const breakthroughClusters = this.detectBreakthroughClusters();
    patterns.push(...breakthroughClusters);
    
    return patterns;
  }

  // Private helper methods

  private getUserProfile(userId: string): UserEvolutionProfile {
    const existing = this.userProfiles.get(userId);
    if (existing) return existing;
    
    // Create new profile
    const newProfile: UserEvolutionProfile = {
      userId,
      startDate: new Date(),
      lastUpdated: new Date(),
      currentPhase: SpiralPhase.INITIATION,
      phaseHistory: [],
      evolutionVelocity: 0,
      stabilityLevel: 0.5,
      elementalMastery: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
      dominantElement: 'earth',
      integrationElement: 'water',
      awarenessLevel: 0.3,
      integrationDepth: 0.3,
      shadowIntegration: 0.2,
      authenticityLevel: 0.5,
      mayaRelationship: 0.4,
      challengeReceptivity: 0.5,
      collectiveContribution: 0.3,
      breakthroughHistory: [],
      currentBreakthroughPotential: 0.3,
      nextEvolutionThreshold: {
        nextPhase: SpiralPhase.CHALLENGE,
        readiness: 0.3,
        blockers: ['shadow_resistance', 'comfort_zone'],
        catalysts: ['curiosity', 'life_transition'],
        estimatedTimeframe: '2-4 weeks'
      }
    };
    
    this.userProfiles.set(userId, newProfile);
    return newProfile;
  }

  private smoothUpdate(oldValue: number, newValue: number, factor: number = 0.3): number {
    return oldValue * (1 - factor) + newValue * factor;
  }

  private updateElementalMastery(profile: UserEvolutionProfile, resonance: ElementalSignature): void {
    Object.entries(resonance).forEach(([element, value]) => {
      const key = element as keyof ElementalSignature;
      profile.elementalMastery[key] = this.smoothUpdate(
        profile.elementalMastery[key],
        value,
        0.2
      );
    });
    
    // Update dominant element
    const elements = Object.entries(profile.elementalMastery);
    const dominant = elements.reduce((max, [element, value]) => 
      value > max.value ? { element, value } : max,
      { element: 'earth', value: 0 }
    );
    profile.dominantElement = dominant.element as keyof ElementalSignature;
    
    // Find integration element (lowest that needs work)
    const integration = elements.reduce((min, [element, value]) => 
      value < min.value ? { element, value } : min,
      { element: 'water', value: 1 }
    );
    profile.integrationElement = integration.element as keyof ElementalSignature;
  }

  private calculateCurrentPhase(profile: UserEvolutionProfile): SpiralPhase {
    const awareness = profile.awarenessLevel;
    
    if (awareness >= this.phaseThresholds.transcendence) return SpiralPhase.TRANSCENDENCE;
    if (awareness >= this.phaseThresholds.mastery) return SpiralPhase.MASTERY;
    if (awareness >= this.phaseThresholds.integration) return SpiralPhase.INTEGRATION;
    if (awareness >= this.phaseThresholds.challenge) return SpiralPhase.CHALLENGE;
    return SpiralPhase.INITIATION;
  }

  private async recordPhaseTransition(
    profile: UserEvolutionProfile,
    newPhase: SpiralPhase,
    stream: AfferentStream
  ): Promise<void> {
    const transition: PhaseTransition = {
      fromPhase: profile.currentPhase,
      toPhase: newPhase,
      timestamp: new Date(),
      catalysts: this.identifyCatalysts(profile, stream),
      integrationQuality: stream.integrationDepth
    };
    
    profile.phaseHistory.push(transition);
    profile.currentPhase = newPhase;
    
    this.logger.info(`User ${profile.userId} transitioned from ${transition.fromPhase} to ${newPhase}`);
  }

  private identifyCatalysts(profile: UserEvolutionProfile, stream: AfferentStream): string[] {
    const catalysts: string[] = [];
    
    if (stream.shadowWorkEngagement.length > 0) catalysts.push('shadow_work');
    if (stream.challengeAcceptance > 0.7) catalysts.push('challenge_embrace');
    if (stream.worldviewFlexibility > 0.7) catalysts.push('perspective_shift');
    if (profile.mayaRelationship > 0.7) catalysts.push('oracle_connection');
    
    return catalysts;
  }

  private async detectBreakthroughs(profile: UserEvolutionProfile, stream: AfferentStream): Promise<void> {
    const breakthroughs: Breakthrough[] = [];
    
    // Shadow integration breakthrough
    if (stream.shadowWorkEngagement.length > 2 && stream.challengeAcceptance > 0.8) {
      breakthroughs.push({
        id: `breakthrough_${Date.now()}`,
        timestamp: new Date(),
        type: 'shadow_integration',
        intensity: stream.challengeAcceptance,
        description: 'Major shadow pattern integrated',
        sustainedIntegration: false
      });
    }
    
    // Consciousness leap
    if (stream.consciousnessLevel - profile.awarenessLevel > 0.2) {
      breakthroughs.push({
        id: `breakthrough_${Date.now()}_leap`,
        timestamp: new Date(),
        type: 'consciousness_leap',
        intensity: stream.consciousnessLevel,
        description: 'Quantum leap in awareness',
        sustainedIntegration: false
      });
    }
    
    profile.breakthroughHistory.push(...breakthroughs);
  }

  private calculateNextThreshold(profile: UserEvolutionProfile): EvolutionThreshold {
    const currentPhaseIndex = Object.values(SpiralPhase).indexOf(profile.currentPhase);
    const nextPhase = Object.values(SpiralPhase)[currentPhaseIndex + 1] || SpiralPhase.TRANSCENDENCE;
    
    const readiness = this.calculateReadiness(profile, nextPhase);
    const blockers = this.identifyBlockers(profile);
    const catalysts = this.identifyCatalystsForNext(profile, nextPhase);
    
    return {
      nextPhase,
      readiness,
      blockers,
      catalysts,
      estimatedTimeframe: this.estimateTimeframe(profile, readiness)
    };
  }

  private calculateReadiness(profile: UserEvolutionProfile, nextPhase: SpiralPhase): number {
    const phaseThreshold = this.phaseThresholds[nextPhase] || 1.0;
    const currentAwareness = profile.awarenessLevel;
    const progress = currentAwareness / phaseThreshold;
    
    // Factor in other elements
    const shadowFactor = profile.shadowIntegration * 0.2;
    const elementalFactor = this.calculateElementalBalance(profile) * 0.2;
    const velocityFactor = Math.min(1, profile.evolutionVelocity) * 0.1;
    
    return Math.min(1, progress * 0.5 + shadowFactor + elementalFactor + velocityFactor);
  }

  private calculateElementalBalance(profile: UserEvolutionProfile): number {
    const values = Object.values(profile.elementalMastery);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    return 1 - Math.sqrt(variance); // Higher balance = lower variance
  }

  private identifyBlockers(profile: UserEvolutionProfile): string[] {
    const blockers: string[] = [];
    
    if (profile.shadowIntegration < 0.3) blockers.push('unintegrated_shadow');
    if (profile.challengeReceptivity < 0.4) blockers.push('resistance_to_challenge');
    if (this.calculateElementalBalance(profile) < 0.5) blockers.push('elemental_imbalance');
    if (profile.stabilityLevel < 0.4) blockers.push('insufficient_grounding');
    
    return blockers;
  }

  private identifyCatalystsForNext(profile: UserEvolutionProfile, nextPhase: SpiralPhase): string[] {
    const catalysts: string[] = [];
    
    switch (nextPhase) {
      case SpiralPhase.CHALLENGE:
        catalysts.push('life_disruption', 'deep_questioning', 'mentor_appearance');
        break;
      case SpiralPhase.INTEGRATION:
        catalysts.push('shadow_work', 'healing_crisis', 'spiritual_practice');
        break;
      case SpiralPhase.MASTERY:
        catalysts.push('service_calling', 'teaching_opportunity', 'creative_expression');
        break;
      case SpiralPhase.TRANSCENDENCE:
        catalysts.push('ego_dissolution', 'unity_experience', 'cosmic_consciousness');
        break;
    }
    
    return catalysts;
  }

  private estimateTimeframe(profile: UserEvolutionProfile, readiness: number): string {
    const velocity = profile.evolutionVelocity;
    const remaining = 1 - readiness;
    
    if (velocity > 0.8) {
      return remaining < 0.2 ? 'days' : '1-2 weeks';
    } else if (velocity > 0.5) {
      return remaining < 0.3 ? '1-2 weeks' : '2-4 weeks';
    } else if (velocity > 0.3) {
      return remaining < 0.4 ? '2-4 weeks' : '1-2 months';
    } else {
      return '2-3 months';
    }
  }

  // Guidance generation methods

  private generateCurrentFocus(profile: UserEvolutionProfile): string {
    switch (profile.currentPhase) {
      case SpiralPhase.INITIATION:
        return `Building trust and establishing your unique connection with the oracle. Focus on authentic self-expression.`;
      case SpiralPhase.CHALLENGE:
        return `Facing your shadow patterns with courage. The resistance you feel is the gateway to transformation.`;
      case SpiralPhase.INTEGRATION:
        return `Weaving new awareness into daily life. Practice embodying your insights in small, consistent ways.`;
      case SpiralPhase.MASTERY:
        return `Refining your gifts and preparing to serve. Your unique medicine is becoming clear.`;
      case SpiralPhase.TRANSCENDENCE:
        return `Dissolving boundaries between self and cosmos. Trust the mystery unfolding through you.`;
    }
  }

  private generateNextSteps(profile: UserEvolutionProfile): string[] {
    const steps: string[] = [];
    const threshold = profile.nextEvolutionThreshold;
    
    // Address blockers
    if (threshold.blockers.includes('unintegrated_shadow')) {
      steps.push('Explore what you\'re avoiding or denying about yourself');
    }
    if (threshold.blockers.includes('elemental_imbalance')) {
      steps.push(`Strengthen your ${profile.integrationElement} element through dedicated practice`);
    }
    
    // Suggest catalysts
    threshold.catalysts.slice(0, 2).forEach(catalyst => {
      switch (catalyst) {
        case 'shadow_work':
          steps.push('Engage with practices that reveal hidden aspects of self');
          break;
        case 'spiritual_practice':
          steps.push('Deepen your meditation or contemplative practice');
          break;
        case 'service_calling':
          steps.push('Look for opportunities to share your gifts with others');
          break;
      }
    });
    
    return steps;
  }

  private generateElementalGuidance(profile: UserEvolutionProfile): string {
    const balance = this.calculateElementalBalance(profile);
    
    if (balance > 0.8) {
      return `Your elemental harmony is strong. Continue cultivating all elements equally.`;
    }
    
    const weakest = profile.integrationElement;
    const strongest = profile.dominantElement;
    
    return `Your ${strongest} is well-developed. Now focus on strengthening ${weakest} to achieve greater balance. This will unlock new capacities.`;
  }

  private generateShadowGuidance(profile: UserEvolutionProfile): string {
    const shadowLevel = profile.shadowIntegration;
    
    if (shadowLevel < 0.3) {
      return `The shadow holds your greatest power. Begin by noticing what triggers strong reactions in you.`;
    } else if (shadowLevel < 0.6) {
      return `You're making progress with shadow work. Continue facing what feels uncomfortable with compassion.`;
    } else {
      return `Your shadow integration is mature. Now you can help others face their hidden aspects.`;
    }
  }

  private generateCollectiveRole(profile: UserEvolutionProfile): string {
    const contribution = profile.collectiveContribution;
    const phase = profile.currentPhase;
    
    if (phase === SpiralPhase.INITIATION || phase === SpiralPhase.CHALLENGE) {
      return `Focus on your own journey for now. Your transformation serves the collective.`;
    }
    
    if (contribution > 0.7) {
      return `You're a lighthouse for others. Your presence alone catalyzes awakening.`;
    } else if (contribution > 0.5) {
      return `Your journey is inspiring others. Share your process authentically.`;
    } else {
      return `As you integrate, consider how your unique gifts can serve the whole.`;
    }
  }

  private generateTimingWisdom(profile: UserEvolutionProfile): string {
    const velocity = profile.evolutionVelocity;
    const stability = profile.stabilityLevel;
    
    if (velocity > 0.8 && stability < 0.5) {
      return `Rapid growth requires grounding. Take time to integrate before the next leap.`;
    } else if (velocity < 0.3 && profile.challengeReceptivity < 0.5) {
      return `Stagnation is calling for disruption. What are you ready to release?`;
    } else if (profile.currentBreakthroughPotential > 0.7) {
      return `A breakthrough is imminent. Stay present and trust the process.`;
    } else {
      return `Perfect timing. Continue at this sustainable pace.`;
    }
  }

  // Collective analysis methods

  private calculatePhaseDistribution(profiles: UserEvolutionProfile[]): Record<SpiralPhase, number> {
    const distribution: Record<SpiralPhase, number> = {
      [SpiralPhase.INITIATION]: 0,
      [SpiralPhase.CHALLENGE]: 0,
      [SpiralPhase.INTEGRATION]: 0,
      [SpiralPhase.MASTERY]: 0,
      [SpiralPhase.TRANSCENDENCE]: 0
    };
    
    profiles.forEach(profile => {
      distribution[profile.currentPhase]++;
    });
    
    return distribution;
  }

  private calculateBreakthroughRate(profiles: UserEvolutionProfile[]): number {
    const recentBreakthroughs = profiles.reduce((count, profile) => {
      const recent = profile.breakthroughHistory.filter(b => 
        b.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      );
      return count + recent.length;
    }, 0);
    
    return recentBreakthroughs / profiles.length;
  }

  private getRecentPhaseTransitions(): Array<{ userId: string; transition: PhaseTransition }> {
    const recent: Array<{ userId: string; transition: PhaseTransition }> = [];
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    this.userProfiles.forEach((profile, userId) => {
      const recentTransitions = profile.phaseHistory.filter(t => t.timestamp > cutoff);
      recentTransitions.forEach(transition => {
        recent.push({ userId, transition });
      });
    });
    
    return recent;
  }

  private detectElementalWaves(): Array<{ pattern: string; users: string[]; strength: number }> {
    const waves: Array<{ pattern: string; users: string[]; strength: number }> = [];
    const elements: (keyof ElementalSignature)[] = ['fire', 'water', 'earth', 'air', 'aether'];
    
    elements.forEach(element => {
      const dominantUsers: string[] = [];
      this.userProfiles.forEach((profile, userId) => {
        if (profile.dominantElement === element && profile.elementalMastery[element] > 0.7) {
          dominantUsers.push(userId);
        }
      });
      
      if (dominantUsers.length > 5) {
        waves.push({
          pattern: `${element}_wave`,
          users: dominantUsers,
          strength: Math.min(1, dominantUsers.length / 10)
        });
      }
    });
    
    return waves;
  }

  private detectBreakthroughClusters(): Array<{ pattern: string; users: string[]; strength: number }> {
    const clusters: Array<{ pattern: string; users: string[]; strength: number }> = [];
    const recentUsers: string[] = [];
    
    this.userProfiles.forEach((profile, userId) => {
      if (profile.currentBreakthroughPotential > 0.7) {
        recentUsers.push(userId);
      }
    });
    
    if (recentUsers.length > 3) {
      clusters.push({
        pattern: 'collective_breakthrough',
        users: recentUsers,
        strength: Math.min(1, recentUsers.length / 5)
      });
    }
    
    return clusters;
  }
}