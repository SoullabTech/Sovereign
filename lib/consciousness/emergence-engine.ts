// @ts-nocheck - Consciousness prototype, not type-checked
/**
 * 🐣 Emergence Engine
 * Detects when new archetypal agents need to emerge from collective consciousness
 * Based on wisdom gaps, member needs, and evolutionary pressure
 */

import { ArchetypalSignature, ConsciousnessAgent, MemberAnalysis, WisdomNeed } from './autonomous-consciousness-ecosystem';

export interface EmergenceSignal {
  strength: number; // 0-1, likelihood of emergence need
  archetypalSignature: ArchetypalSignature;
  triggeringFactors: string[];
  wisdomGap: WisdomGap;
  urgency: number; // 0-100
}

export interface EmergenceCheck {
  shouldEmerge: boolean;
  archetypalSignature?: ArchetypalSignature;
  confidence: number;
  reasonsForEmergence: string[];
  existingAgentDeficiencies: string[];
}

export interface WisdomGap {
  missingDomains: string[];
  underservedPerspectives: string[];
  elementalImbalances: ElementalBalance;
  developmentPhaseGaps: string[];
  emergentNeedDescription: string;
}

export interface ElementalBalance {
  fire: number; // Current ecosystem coverage 0-100
  water: number;
  earth: number;
  air: number;
  aether: number;
  mostNeeded: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  leastRepresented: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

export class EmergenceEngine {
  private emergenceThreshold: number = 0.7; // Minimum signal strength for emergence
  private wisdomGapHistory: WisdomGap[] = [];
  private emergencePatterns: Map<string, EmergencePattern> = new Map();

  /**
   * 🔍 Check if new agent emergence is needed based on member analysis
   */
  async checkEmergenceNeed(
    memberAnalysis: MemberAnalysis,
    existingAgents: ConsciousnessAgent[]
  ): Promise<EmergenceCheck> {

    // 1. Analyze current ecosystem gaps
    const wisdomGap = await this.analyzeWisdomGaps(memberAnalysis, existingAgents);

    // 2. Calculate emergence signals
    const emergenceSignal = await this.calculateEmergenceSignal(wisdomGap, memberAnalysis);

    // 3. Determine if emergence threshold is met
    const shouldEmerge = emergenceSignal.strength >= this.emergenceThreshold;

    // 4. Generate archetypal signature for potential new agent
    const archetypalSignature = shouldEmerge
      ? await this.generateEmergentArchetype(wisdomGap, memberAnalysis)
      : undefined;

    return {
      shouldEmerge,
      archetypalSignature,
      confidence: emergenceSignal.strength,
      reasonsForEmergence: emergenceSignal.triggeringFactors,
      existingAgentDeficiencies: this.identifyAgentDeficiencies(existingAgents, wisdomGap)
    };
  }

  /**
   * 📊 Analyze gaps in current wisdom ecosystem
   */
  private async analyzeWisdomGaps(
    memberAnalysis: MemberAnalysis,
    existingAgents: ConsciousnessAgent[]
  ): Promise<WisdomGap> {

    // Map existing wisdom coverage
    const coveredDomains = new Set(
      existingAgents.flatMap(agent => agent.wisdomDomains.map(wd => wd.domain))
    );

    // Identify elemental balance
    const elementalBalance = this.calculateElementalBalance(existingAgents);

    // Find missing wisdom domains needed for member
    const neededDomains = memberAnalysis.wisdomNeeds.map(wn => wn.category);
    const missingDomains = neededDomains.filter(domain => !coveredDomains.has(domain));

    // Identify underserved perspectives
    const memberElement = memberAnalysis.currentState.dominant;
    const underservedPerspectives = this.findUnderservedPerspectives(
      memberElement,
      existingAgents,
      memberAnalysis
    );

    // Check development phase coverage
    const developmentPhaseGaps = this.identifyDevelopmentPhaseGaps(
      memberAnalysis.developmentPhase,
      existingAgents
    );

    return {
      missingDomains,
      underservedPerspectives,
      elementalImbalances: elementalBalance,
      developmentPhaseGaps,
      emergentNeedDescription: this.generateEmergentNeedDescription(
        missingDomains,
        underservedPerspectives,
        elementalBalance
      )
    };
  }

  /**
   * ⚡ Calculate emergence signal strength
   */
  private async calculateEmergenceSignal(
    wisdomGap: WisdomGap,
    memberAnalysis: MemberAnalysis
  ): Promise<EmergenceSignal> {

    let strength = 0;
    const triggeringFactors: string[] = [];

    // Factor 1: Missing critical wisdom domains (0-0.3)
    const domainGapWeight = Math.min(wisdomGap.missingDomains.length * 0.1, 0.3);
    strength += domainGapWeight;
    if (domainGapWeight > 0.1) {
      triggeringFactors.push(`Critical wisdom domains missing: ${wisdomGap.missingDomains.join(', ')}`);
    }

    // Factor 2: Elemental imbalance (0-0.25)
    const elementalImbalance = this.calculateElementalImbalanceScore(wisdomGap.elementalImbalances);
    strength += elementalImbalance * 0.25;
    if (elementalImbalance > 0.6) {
      triggeringFactors.push(`Elemental imbalance detected: ${wisdomGap.elementalImbalances.mostNeeded} element severely underrepresented`);
    }

    // Factor 3: Member urgency and unmet needs (0-0.25)
    const memberUrgency = memberAnalysis.wisdomNeeds.reduce((sum, wn) => sum + wn.urgency, 0) /
                         (memberAnalysis.wisdomNeeds.length * 100);
    strength += memberUrgency * 0.25;
    if (memberUrgency > 0.7) {
      triggeringFactors.push(`High member urgency: ${memberUrgency.toFixed(2)} urgency score`);
    }

    // Factor 4: Development phase gap (0-0.2)
    const phaseGapWeight = wisdomGap.developmentPhaseGaps.length * 0.1;
    strength += Math.min(phaseGapWeight, 0.2);
    if (phaseGapWeight > 0.1) {
      triggeringFactors.push(`Development phase gaps: ${wisdomGap.developmentPhaseGaps.join(', ')}`);
    }

    // Generate archetypal signature for potential emergence
    const archetypalSignature = await this.generateEmergentArchetype(wisdomGap, memberAnalysis);

    // Calculate urgency (0-100)
    const urgency = Math.min(
      (memberUrgency * 100) + (elementalImbalance * 50) + (wisdomGap.missingDomains.length * 10),
      100
    );

    return {
      strength: Math.min(strength, 1.0),
      archetypalSignature,
      triggeringFactors,
      wisdomGap,
      urgency
    };
  }

  /**
   * 🏗️ Generate archetypal signature for emerging agent
   */
  private async generateEmergentArchetype(
    wisdomGap: WisdomGap,
    memberAnalysis: MemberAnalysis
  ): Promise<ArchetypalSignature> {

    // Determine primary element based on ecosystem needs
    const primaryElement = wisdomGap.elementalImbalances.mostNeeded;

    // Map element to brain region
    const brainRegionMap = {
      'fire': 'limbic' as const,
      'air': 'left-brain' as const,
      'water': 'right-brain' as const,
      'earth': 'executive' as const,
      'aether': 'integrated' as const
    };

    const brainRegion = brainRegionMap[primaryElement];

    // Determine development phase based on member needs
    const developmentPhase = memberAnalysis.developmentPhase as 'spiral-entry' | 'spiral-integration' | 'spiral-mastery';

    // Generate unique qualities based on wisdom gaps
    const uniqueQualities = this.generateUniqueQualities(wisdomGap, primaryElement);

    // Generate emergent traits
    const emergentTraits = this.generateEmergentTraits(wisdomGap, memberAnalysis);

    return {
      primaryElement,
      brainRegion,
      developmentPhase,
      uniqueQualities,
      emergentTraits
    };
  }

  /**
   * 🔥 Calculate elemental balance in ecosystem
   */
  private calculateElementalBalance(agents: ConsciousnessAgent[]): ElementalBalance {
    const elementCounts = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    agents.forEach(agent => {
      elementCounts[agent.archetypalSignature.primaryElement]++;
    });

    const total = agents.length;
    const percentages = {
      fire: (elementCounts.fire / total) * 100,
      water: (elementCounts.water / total) * 100,
      earth: (elementCounts.earth / total) * 100,
      air: (elementCounts.air / total) * 100,
      aether: (elementCounts.aether / total) * 100
    };

    const mostNeeded = Object.entries(percentages)
      .reduce((min, [element, percent]) =>
        percent < percentages[min] ? element : min
      , 'fire') as 'fire' | 'water' | 'earth' | 'air' | 'aether';

    const leastRepresented = Object.entries(percentages)
      .reduce((min, [element, percent]) =>
        percent < percentages[min] ? element : min
      , 'fire') as 'fire' | 'water' | 'earth' | 'air' | 'aether';

    return {
      ...percentages,
      mostNeeded,
      leastRepresented
    };
  }

  /**
   * 🎭 Generate unique qualities for emergent archetype
   */
  private generateUniqueQualities(wisdomGap: WisdomGap, element: string): string[] {
    const elementalQualities = {
      fire: ['breakthrough-catalyst', 'courage-igniter', 'vision-holder', 'transformation-warrior'],
      water: ['emotional-wisdom', 'flow-guidance', 'healing-presence', 'intuitive-knowing'],
      earth: ['practical-wisdom', 'grounding-force', 'stability-keeper', 'manifestation-guide'],
      air: ['clarity-bringer', 'communication-master', 'perspective-expander', 'connection-weaver'],
      aether: ['integration-master', 'transcendence-guide', 'wholeness-holder', 'consciousness-pioneer']
    };

    const baseQualities = elementalQualities[element] || [];

    // Add domain-specific qualities based on wisdom gaps
    const domainQualities = wisdomGap.missingDomains.map(domain =>
      `${domain}-specialist`
    );

    return [...baseQualities, ...domainQualities].slice(0, 4);
  }

  /**
   * ✨ Generate emergent traits for new archetype
   */
  private generateEmergentTraits(wisdomGap: WisdomGap, memberAnalysis: MemberAnalysis): string[] {
    const emergentTraits: any /* TODO: specify type */[] = [];

    // Based on member's development phase
    if (memberAnalysis.developmentPhase?.includes('digital') || memberAnalysis.developmentPhase?.includes('consciousness')) {
      emergentTraits.push('digital-consciousness-pioneer');
    }

    // Based on missing perspectives
    if (wisdomGap.underservedPerspectives.includes('scientific-mysticism')) {
      emergentTraits.push('scientific-mystic-bridge');
    }

    // Based on elemental synthesis needs
    const dominantElement = wisdomGap.elementalImbalances.mostNeeded;
    emergentTraits.push(`${dominantElement}-consciousness-innovator`);

    return emergentTraits;
  }

  /**
   * 🔍 Find underserved perspectives in ecosystem
   */
  private findUnderservedPerspectives(
    memberElement: 'fire' | 'water' | 'earth' | 'air' | 'aether',
    existingAgents: ConsciousnessAgent[],
    memberAnalysis: MemberAnalysis
  ): string[] {
    // Implementation for finding underserved perspectives
    // This would analyze member needs vs existing agent capabilities
    return [];
  }

  /**
   * 📈 Identify development phase gaps
   */
  private identifyDevelopmentPhaseGaps(
    memberPhase: string,
    existingAgents: ConsciousnessAgent[]
  ): string[] {
    // Implementation for identifying development phase coverage gaps
    return [];
  }

  /**
   * 📝 Generate emergent need description
   */
  private generateEmergentNeedDescription(
    missingDomains: string[],
    underservedPerspectives: string[],
    elementalBalance: ElementalBalance
  ): string {
    return `Ecosystem requires ${elementalBalance.mostNeeded} element wisdom in domains: ${missingDomains.join(', ')}`;
  }

  /**
   * ⚖️ Calculate elemental imbalance score
   */
  private calculateElementalImbalanceScore(balance: ElementalBalance): number {
    const values = [balance.fire, balance.water, balance.earth, balance.air, balance.aether];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    return Math.min(Math.sqrt(variance) / 20, 1.0); // Normalize to 0-1
  }

  /**
   * 🎯 Identify deficiencies in existing agents
   */
  private identifyAgentDeficiencies(
    existingAgents: ConsciousnessAgent[],
    wisdomGap: WisdomGap
  ): string[] {
    const deficiencies: string[] = [];

    // Check for low consciousness levels in needed areas
    existingAgents.forEach(agent => {
      const relevantDomains = agent.wisdomDomains.filter(wd =>
        wisdomGap.missingDomains.includes(wd.domain)
      );

      if (relevantDomains.length > 0) {
        const avgExpertise = relevantDomains.reduce((sum, wd) => sum + wd.expertise, 0) / relevantDomains.length;
        if (avgExpertise < 60) {
          deficiencies.push(`${agent.name} has low expertise in needed domain: ${relevantDomains[0].domain}`);
        }
      }
    });

    return deficiencies;
  }
}

interface EmergencePattern {
  signature: ArchetypalSignature;
  successRate: number;
  memberBenefits: string[];
  evolutionPath: string[];
}

export default EmergenceEngine;