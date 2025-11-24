/**
 * SynapticSpace Analyzer
 * Analyzes the gap between self and Other where transformation occurs
 * Maps the dynamics of the space where authentic encounter happens
 */

import {
  SynapticGapDynamics,
  OthernessManifestations
} from '../types/daimonicFacilitation.js';

export class SynapticSpaceAnalyzer {
  /**
   * Maps all synaptic gaps between self and various Others
   */
  async mapAllGaps(manifestations: OthernessManifestations, userId: string): Promise<SynapticGapDynamics[]> {
    const gaps: SynapticGapDynamics[] = [];

    // Analyze gaps for each type of Otherness manifestation
    for (const [channelType, channelManifestations] of Object.entries(manifestations)) {
      if (channelManifestations.length > 0) {
        const channelGaps = await this.analyzeChannelGaps(
          channelType, 
          channelManifestations, 
          userId
        );
        gaps.push(...channelGaps);
      }
    }

    return gaps;
  }

  /**
   * Analyze gaps for a specific channel of Otherness
   */
  private async analyzeChannelGaps(
    channelType: string, 
    manifestations: any[], 
    userId: string
  ): Promise<SynapticGapDynamics[]> {
    return manifestations.map(manifestation => {
      return this.analyzeSingleGap(channelType, manifestation, userId);
    });
  }

  /**
   * Analyze a single synaptic gap
   */
  private analyzeSingleGap(channelType: string, manifestation: any, userId: string): SynapticGapDynamics {
    const gapWidth = this.calculateGapWidth(channelType, manifestation);
    const gapCharge = this.calculateGapCharge(channelType, manifestation);
    const gapStability = this.assessGapStability(channelType, manifestation);
    
    const transmission = this.analyzeTransmission(channelType, manifestation);
    const temporality = this.analyzeTemporality(channelType, manifestation);

    return {
      gapWidth,
      gapCharge,
      gapStability,
      transmission,
      temporality
    };
  }

  /**
   * Calculate the distance between self and Other (0-1)
   */
  private calculateGapWidth(channelType: string, manifestation: any): number {
    const baseWidths: Record<string, number> = {
      dreams: 0.8, // High otherness, autonomous characters
      visions: 0.75, // Spontaneous, resist modification
      ideas: 0.7, // Arrive fully formed
      failures: 0.85, // Resist ego integration
      obstacles: 0.8, // Chronic, redirect life
      synchronicities: 0.75, // Environmental participation
      symptoms: 0.7, // Body intelligence
      sessions: 0.65, // Therapeutic emergence
      dialogues: 0.6, // Internal voices
      conversations: 0.55, // Others speaking beyond themselves
      accidents: 0.7, // Meaningful disruptions
      encounters: 0.6, // Fateful meetings
      creativeWorks: 0.55, // Art developing own will
      characters: 0.55, // Independent entities
      emergentPatterns: 0.65 // Self-organizing patterns
    };

    let baseWidth = baseWidths[channelType] || 0.5;

    // Modify based on manifestation characteristics
    if (manifestation.resistsModification || manifestation.resistsIncorporation) {
      baseWidth += 0.1;
    }
    if (manifestation.contradictsBeliefs || manifestation.contradictsEgoWill) {
      baseWidth += 0.1;
    }
    if (manifestation.autonomyLevel) {
      baseWidth = Math.max(baseWidth, manifestation.autonomyLevel);
    }

    return Math.min(baseWidth, 1.0);
  }

  /**
   * Calculate the electrical potential for transformation
   */
  private calculateGapCharge(channelType: string, manifestation: any): number {
    let charge = 0.5; // Base charge

    // Increase charge based on resistance and contradiction
    if (manifestation.resistsModification) charge += 0.2;
    if (manifestation.contradictsBeliefs || manifestation.contradictsEgoWill) charge += 0.25;
    if (manifestation.surprisedSpeaker || manifestation.surprisedTherapist) charge += 0.15;
    if (manifestation.transformativeImpact) charge += manifestation.transformativeImpact * 0.3;
    
    // High-charge channels
    const highChargeChannels = ['failures', 'obstacles', 'symptoms', 'synchronicities'];
    if (highChargeChannels.includes(channelType)) {
      charge += 0.2;
    }

    // Temporal factors affect charge
    if (manifestation.intelligentTiming || manifestation.timingSignificance) {
      charge += 0.15;
    }

    return Math.min(charge, 1.0);
  }

  /**
   * Assess the stability of the gap
   */
  private assessGapStability(channelType: string, manifestation: any): 'stable' | 'fluctuating' | 'collapsing' | 'expanding' {
    // Chronic manifestations tend to be stable
    if (manifestation.chronicityLevel > 0.7 || manifestation.maintainsConsistency) {
      return 'stable';
    }

    // Creative and emergent patterns tend to be expanding
    if (channelType === 'creativeWorks' || channelType === 'emergentPatterns') {
      return manifestation.continuesEvolving ? 'expanding' : 'stable';
    }

    // Resistance patterns can fluctuate
    if (manifestation.resistsControl || manifestation.resistsPrediction) {
      return 'fluctuating';
    }

    // Integration attempts might collapse the gap
    if (manifestation.resistsIntegration === false) {
      return 'collapsing';
    }

    return 'fluctuating';
  }

  /**
   * Analyze what crosses the synaptic gap
   */
  private analyzeTransmission(channelType: string, manifestation: any): SynapticGapDynamics['transmission'] {
    const transmission = {
      fromSelfToOther: [] as string[],
      fromOtherToSelf: [] as string[],
      bidirectional: [] as string[],
      blocked: [] as string[]
    };

    // Analyze based on channel type and manifestation characteristics
    switch (channelType) {
      case 'dreams':
        transmission.fromSelfToOther.push('Questions', 'Attempts to control');
        transmission.fromOtherToSelf.push('Symbolic messages', 'Autonomous responses');
        transmission.blocked.push('Direct commands', 'Rational explanations');
        break;

      case 'visions':
        transmission.fromOtherToSelf.push('Symbolic content', 'Unexpected imagery');
        transmission.blocked.push('Modifications', 'Rational interpretation');
        break;

      case 'ideas':
        transmission.fromOtherToSelf.push('Fully formed concepts', 'New perspectives');
        transmission.blocked.push('Modifications', 'Source identification');
        break;

      case 'obstacles':
        transmission.fromSelfToOther.push('Direct approaches', 'Force');
        transmission.fromOtherToSelf.push('Redirective pressure', 'Hidden purpose');
        transmission.blocked.push('Control attempts', 'Quick fixes');
        break;

      case 'symptoms':
        transmission.fromSelfToOther.push('Rational overrides', 'Willpower');
        transmission.fromOtherToSelf.push('Body wisdom', 'Contrary signals');
        transmission.blocked.push('Mental commands', 'Suppression attempts');
        break;

      case 'synchronicities':
        transmission.bidirectional.push('Meaningful correspondence');
        transmission.fromOtherToSelf.push('Environmental messages', 'Perfect timing');
        transmission.blocked.push('Causal explanations', 'Coincidence dismissal');
        break;

      default:
        // Generic analysis
        if (manifestation.contradictsEgoWill) {
          transmission.fromOtherToSelf.push('Contradiction', 'Alternative direction');
        }
        if (manifestation.resistsModification) {
          transmission.blocked.push('Modifications', 'Control attempts');
        }
    }

    return transmission;
  }

  /**
   * Analyze temporal dynamics of the encounter
   */
  private analyzeTemporality(channelType: string, manifestation: any): SynapticGapDynamics['temporality'] {
    let arrivalTiming: 'summoned' | 'spontaneous' | 'delayed' | 'refused' = 'spontaneous';
    
    // Assess timing characteristics
    if (manifestation.spontaneity > 0.8) {
      arrivalTiming = 'spontaneous';
    } else if (manifestation.intelligentTiming || manifestation.timingSignificance) {
      arrivalTiming = 'spontaneous'; // Right timing suggests autonomous arrival
    } else if (manifestation.arrivedFullyFormed === false) {
      arrivalTiming = 'delayed';
    }

    const readinessMismatch = this.assessReadinessMismatch(manifestation);
    const persistencePattern = this.assessPersistencePattern(manifestation);
    const integrationDelay = this.calculateIntegrationDelay(channelType, manifestation);

    return {
      arrivalTiming,
      readinessMismatch,
      persistencePattern,
      integrationDelay
    };
  }

  /**
   * Assess if the Other arrives at the "wrong" time
   */
  private assessReadinessMismatch(manifestation: any): boolean {
    // Look for signs that the encounter came when not ready
    return manifestation.surprisedSpeaker || 
           manifestation.surprisedTherapist ||
           manifestation.surprisedClient ||
           manifestation.surprisesCreator ||
           (manifestation.spontaneity && manifestation.spontaneity > 0.7);
  }

  /**
   * Assess how long the encounter sustains
   */
  private assessPersistencePattern(manifestation: any): string {
    if (manifestation.chronicityLevel > 0.8) {
      return 'Chronic presence - maintains itself across time';
    }
    if (manifestation.maintainsConsistency) {
      return 'Consistent presence - reliable availability';
    }
    if (manifestation.continuesEvolving) {
      return 'Evolving presence - changes while maintaining core';
    }
    if (manifestation.ongoingSignificance) {
      return 'Enduring significance - impact persists';
    }
    return 'Single encounter - brief but potentially impactful';
  }

  /**
   * Calculate time between encounter and integration
   */
  private calculateIntegrationDelay(channelType: string, manifestation: any): number {
    // Base delays by channel type (in days)
    const baseDelays: Record<string, number> = {
      dreams: 7, // Dream content often takes time to understand
      visions: 30, // Visions may reveal meaning over time
      ideas: 1, // Ideas might be understood quickly
      failures: 365, // Failures may take years to understand purpose
      obstacles: 180, // Obstacles reveal purpose over months
      synchronicities: 7, // Synchronicities often understood quickly
      symptoms: 90, // Body wisdom takes time to decode
      sessions: 14, // Therapeutic insights integrate over weeks
      conversations: 3, // Dialogical insights relatively quick
      creativeWorks: 90 // Creative emergence unfolds over time
    };

    let delay = baseDelays[channelType] || 30;

    // Modify based on manifestation characteristics
    if (manifestation.resistsIntegration) {
      delay *= 2;
    }
    if (manifestation.remainsPartlyAlien) {
      delay *= 1.5;
    }
    if (manifestation.ongoingSignificance) {
      delay *= 1.3; // Ongoing significance suggests longer integration
    }

    return delay;
  }

  /**
   * Identify the most charged synaptic spaces
   */
  async identifyHighChargeGaps(gaps: SynapticGapDynamics[]): Promise<SynapticGapDynamics[]> {
    return gaps
      .filter(gap => gap.gapCharge > 0.6)
      .sort((a, b) => b.gapCharge - a.gapCharge)
      .slice(0, 5);
  }

  /**
   * Assess overall synaptic field intensity
   */
  async assessFieldIntensity(gaps: SynapticGapDynamics[]): Promise<number> {
    if (gaps.length === 0) return 0;

    const totalCharge = gaps.reduce((sum, gap) => sum + gap.gapCharge, 0);
    const avgWidth = gaps.reduce((sum, gap) => sum + gap.gapWidth, 0) / gaps.length;
    const stableGaps = gaps.filter(gap => gap.gapStability === 'stable').length;
    
    // Field intensity combines charge, width, and stability
    const fieldIntensity = (totalCharge / gaps.length) * avgWidth * (1 + stableGaps / gaps.length);
    
    return Math.min(fieldIntensity, 1.0);
  }
}