/**
 * SyntheticEmergence Tracker
 * Tracks the quality and authenticity of what emerges from encounters
 * Distinguishes genuine novelty from mechanical combination
 */

import {
  SyntheticThird,
  SynapticGapDynamics,
  OthernessManifestations
} from '../types/daimonicFacilitation.js';

export interface EmergenceEvent {
  id: string;
  sourceGap: SynapticGapDynamics;
  emergentContent: string;
  timestamp: Date;
  synthesis: SyntheticThird;
}

export class SyntheticEmergenceTracker {
  private emergenceEvents: Map<string, EmergenceEvent> = new Map();
  private ongoingEmergences: Map<string, EmergenceEvent> = new Map();

  /**
   * Track emergences from all synaptic gaps
   */
  async trackEmergences(
    gaps: SynapticGapDynamics[], 
    manifestations: OthernessManifestations,
    userId: string
  ): Promise<EmergenceEvent[]> {
    const emergences: EmergenceEvent[] = [];

    for (const gap of gaps) {
      // Only track high-charge gaps that are likely to produce synthesis
      if (gap.gapCharge > 0.5) {
        const emergence = await this.analyzeGapForEmergence(gap, manifestations, userId);
        if (emergence) {
          emergences.push(emergence);
          this.emergenceEvents.set(emergence.id, emergence);
          
          // Track ongoing emergences
          if (emergence.synthesis.continuedDevelopment.ongoingEvolution) {
            this.ongoingEmergences.set(emergence.id, emergence);
          }
        }
      }
    }

    return emergences;
  }

  /**
   * Analyze a synaptic gap for potential synthesis emergence
   */
  private async analyzeGapForEmergence(
    gap: SynapticGapDynamics, 
    manifestations: OthernessManifestations,
    userId: string
  ): Promise<EmergenceEvent | null> {
    // Check if conditions are right for synthesis
    if (!this.areSynthesisConditionsMet(gap)) {
      return null;
    }

    const emergentContent = await this.identifyEmergentContent(gap, manifestations);
    if (!emergentContent) {
      return null;
    }

    const synthesis = this.analyzeSynthesis(gap, emergentContent, manifestations);
    
    return {
      id: `emergence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceGap: gap,
      emergentContent,
      timestamp: new Date(),
      synthesis
    };
  }

  /**
   * Check if conditions are met for genuine synthesis
   */
  private areSynthesisConditionsMet(gap: SynapticGapDynamics): boolean {
    // Synthesis requires sufficient gap width (otherness)
    if (gap.gapWidth < 0.4) return false;
    
    // Synthesis requires sufficient charge (transformative potential)
    if (gap.gapCharge < 0.5) return false;

    // Synthesis requires bidirectional transmission or from-Other transmission
    const hasTransmission = gap.transmission.bidirectional.length > 0 || 
                           gap.transmission.fromOtherToSelf.length > 0;
    if (!hasTransmission) return false;

    // Synthesis less likely if gap is collapsing (integration too quick)
    if (gap.gapStability === 'collapsing') return false;

    return true;
  }

  /**
   * Identify emergent content from gap dynamics
   */
  private async identifyEmergentContent(
    gap: SynapticGapDynamics,
    manifestations: OthernessManifestations
  ): Promise<string | null> {
    // Look for content that emerges from the intersection
    const fromOther = gap.transmission.fromOtherToSelf;
    const bidirectional = gap.transmission.bidirectional;
    
    if (fromOther.length === 0 && bidirectional.length === 0) {
      return null;
    }

    // Construct emergent content description
    let content = "Synthesis emerging from encounter: ";
    
    if (bidirectional.length > 0) {
      content += `Mutual exchange of ${bidirectional.join(', ')} creates `;
    }
    
    if (fromOther.length > 0) {
      content += `receiving ${fromOther.join(', ')} while offering resistance/engagement produces `;
    }

    content += "something neither party possessed alone.";

    return content;
  }

  /**
   * Analyze the quality of synthesis
   */
  private analyzeSynthesis(
    gap: SynapticGapDynamics,
    emergentContent: string,
    manifestations: OthernessManifestations
  ): SyntheticThird {
    const emergenceType = this.classifyEmergenceType(gap, emergentContent);
    const irreducibilityMarkers = this.assessIrreducibility(gap, emergentContent);
    const experientialQualities = this.assessExperientialQualities(gap);
    const continuedDevelopment = this.assessContinuedDevelopment(gap);

    return {
      emergenceType,
      irreducibilityMarkers,
      experientialQualities,
      continuedDevelopment
    };
  }

  /**
   * Classify the type of emergence
   */
  private classifyEmergenceType(
    gap: SynapticGapDynamics, 
    emergentContent: string
  ): 'genuine_novel' | 'mechanical_combination' | 'pseudo_synthesis' | 'compromise' {
    // Genuine novelty markers
    if (gap.gapWidth > 0.7 && gap.gapCharge > 0.7 && gap.gapStability === 'expanding') {
      return 'genuine_novel';
    }

    // Mechanical combination (low otherness, predictable)
    if (gap.gapWidth < 0.5 && gap.transmission.blocked.length === 0) {
      return 'mechanical_combination';
    }

    // Pseudo synthesis (appears novel but reduces to components)
    if (gap.gapWidth > 0.5 && gap.gapStability === 'collapsing') {
      return 'pseudo_synthesis';
    }

    // Compromise (reduces tension rather than transcending it)
    if (gap.transmission.blocked.length > gap.transmission.fromOtherToSelf.length) {
      return 'compromise';
    }

    return 'genuine_novel';
  }

  /**
   * Assess irreducibility markers
   */
  private assessIrreducibility(gap: SynapticGapDynamics, emergentContent: string): SyntheticThird['irreducibilityMarkers'] {
    const cannotReverseEngineer = gap.gapWidth > 0.6 && gap.transmission.blocked.length > 0;
    const containsNovelProperties = gap.gapCharge > 0.6 && gap.transmission.bidirectional.length > 0;
    const surprisesBothParties = gap.temporality.readinessMismatch;
    const independentTrajectory = gap.gapStability === 'expanding' || gap.gapStability === 'fluctuating';

    return {
      cannotReverseEngineer,
      containsNovelProperties,
      surprisesBothParties,
      independentTrajectory
    };
  }

  /**
   * Assess experiential qualities
   */
  private assessExperientialQualities(gap: SynapticGapDynamics): SyntheticThird['experientialQualities'] {
    // Aliveness correlates with gap charge and bidirectional flow
    const aliveness = Math.min(gap.gapCharge + (gap.transmission.bidirectional.length * 0.2), 1.0);
    
    // Strangeness correlates with gap width and blocked transmissions
    const strangeness = Math.min(gap.gapWidth + (gap.transmission.blocked.length * 0.1), 1.0);
    
    // Fertility correlates with stability and ongoing development potential
    const fertility = gap.gapStability === 'expanding' ? 0.8 :
                     gap.gapStability === 'stable' ? 0.6 :
                     gap.gapStability === 'fluctuating' ? 0.7 : 0.3;
    
    // Autonomy correlates with independence from both parties
    const autonomy = Math.min(gap.gapWidth * gap.gapCharge, 1.0);

    return {
      aliveness,
      strangeness,
      fertility,
      autonomy
    };
  }

  /**
   * Assess continued development potential
   */
  private assessContinuedDevelopment(gap: SynapticGapDynamics): SyntheticThird['continuedDevelopment'] {
    const ongoingEvolution = gap.gapStability === 'expanding' || gap.gapStability === 'fluctuating';
    
    const spawnsNewSyntheses = gap.gapCharge > 0.7 && gap.transmission.bidirectional.length > 0;
    
    const maintainsOtherness = gap.transmission.blocked.length > 0 && gap.gapWidth > 0.5;
    
    // Recognition delay based on complexity and strangeness
    const recognitionDelay = gap.temporality.integrationDelay * (gap.gapWidth * gap.transmission.blocked.length);

    return {
      ongoingEvolution,
      spawnsNewSyntheses,
      maintainsOtherness,
      recognitionDelay
    };
  }

  /**
   * Track the afterlife of synthetic emergences
   */
  async trackEmergenceAfterlife(emergenceId: string): Promise<SyntheticThird['continuedDevelopment'] | null> {
    const emergence = this.emergenceEvents.get(emergenceId);
    if (!emergence) return null;

    // Re-assess development based on time elapsed
    const timeElapsed = Date.now() - emergence.timestamp.getTime();
    const daysElapsed = timeElapsed / (1000 * 60 * 60 * 24);

    const synthesis = emergence.synthesis;
    
    // Update based on observed evolution
    const updatedDevelopment = {
      ...synthesis.continuedDevelopment,
      ongoingEvolution: daysElapsed < synthesis.continuedDevelopment.recognitionDelay,
      spawnsNewSyntheses: this.hasSpawnedNewSyntheses(emergenceId),
      maintainsOtherness: this.stillMaintainsOtherness(emergence, daysElapsed)
    };

    return updatedDevelopment;
  }

  /**
   * Check if emergence has spawned new syntheses
   */
  private hasSpawnedNewSyntheses(parentEmergenceId: string): boolean {
    // Look for other emergences that reference this one as a source
    for (const [id, emergence] of this.emergenceEvents) {
      if (id !== parentEmergenceId && 
          emergence.emergentContent.includes(parentEmergenceId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if emergence still maintains otherness
   */
  private stillMaintainsOtherness(emergence: EmergenceEvent, daysElapsed: number): boolean {
    // If integration delay hasn't passed, likely still maintains otherness
    if (daysElapsed < emergence.synthesis.continuedDevelopment.recognitionDelay) {
      return true;
    }

    // Check original otherness markers
    return emergence.sourceGap.gapWidth > 0.6 && 
           emergence.sourceGap.transmission.blocked.length > 0;
  }

  /**
   * Get genuine synthetic emergences (filter out mechanical combinations)
   */
  async getGenuineEmergences(userId: string): Promise<EmergenceEvent[]> {
    const allEmergences = Array.from(this.emergenceEvents.values());
    
    return allEmergences.filter(emergence => {
      return emergence.synthesis.emergenceType === 'genuine_novel' &&
             emergence.synthesis.irreducibilityMarkers.containsNovelProperties &&
             emergence.synthesis.experientialQualities.strangeness > 0.5;
    });
  }

  /**
   * Identify failed or incomplete syntheses
   */
  async getFailedSyntheses(userId: string): Promise<EmergenceEvent[]> {
    const allEmergences = Array.from(this.emergenceEvents.values());
    
    return allEmergences.filter(emergence => {
      return emergence.synthesis.emergenceType === 'compromise' ||
             emergence.synthesis.emergenceType === 'pseudo_synthesis' ||
             !emergence.synthesis.irreducibilityMarkers.surprisesBothParties;
    });
  }

  /**
   * Get ongoing emergences that continue to develop
   */
  async getOngoingEmergences(userId: string): Promise<EmergenceEvent[]> {
    const ongoing: EmergenceEvent[] = [];
    
    for (const [id, emergence] of this.ongoingEmergences) {
      const afterlife = await this.trackEmergenceAfterlife(id);
      if (afterlife && afterlife.ongoingEvolution) {
        ongoing.push(emergence);
      } else {
        // Remove from ongoing if no longer evolving
        this.ongoingEmergences.delete(id);
      }
    }
    
    return ongoing;
  }

  /**
   * Assess overall synthetic capacity
   */
  async assessSyntheticCapacity(userId: string): Promise<number> {
    const allEmergences = Array.from(this.emergenceEvents.values());
    if (allEmergences.length === 0) return 0;

    const genuineCount = allEmergences.filter(e => 
      e.synthesis.emergenceType === 'genuine_novel'
    ).length;

    const avgQuality = allEmergences.reduce((sum, emergence) => {
      const qualities = emergence.synthesis.experientialQualities;
      return sum + (qualities.aliveness + qualities.strangeness + qualities.fertility + qualities.autonomy) / 4;
    }, 0) / allEmergences.length;

    return (genuineCount / allEmergences.length) * avgQuality;
  }
}