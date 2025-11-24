/**
 * Integration Failure Tracker
 * Honors when synthesis fails or remains incomplete
 * Tracks the value of unintegrated material and failed attempts
 */

import {
  IntegrationFailure,
  OthernessManifestations,
  SynapticGapDynamics,
  EmergenceEvent
} from '../types/daimonicFacilitation.js';

export interface FailureEvent {
  id: string;
  userId: string;
  failureType: 'refusal' | 'incomprehension' | 'overwhelm' | 'premature';
  sourceType: 'manifestation' | 'gap' | 'emergence';
  sourceId: string;
  failureDetails: IntegrationFailure;
  timestamp: Date;
  ongoingValue: number; // How valuable the failure remains over time
}

export interface UnintegratedRepository {
  userId: string;
  persistentOtherness: Map<string, any>;
  ongoingResistances: Map<string, any>;
  protectedMysteries: Map<string, any>;
  lastUpdated: Date;
}

export class IntegrationFailureTracker {
  private failureEvents: Map<string, FailureEvent> = new Map();
  private unintegratedRepositories: Map<string, UnintegratedRepository> = new Map();
  private protectedTensions: Map<string, Set<string>> = new Map();

  /**
   * Track integration failures across all daimonic encounters
   */
  async trackIntegrationFailures(
    userId: string,
    manifestations: OthernessManifestations,
    gaps: SynapticGapDynamics[],
    emergences: EmergenceEvent[]
  ): Promise<FailureEvent[]> {
    const failures: FailureEvent[] = [];

    // Track failures in manifestations
    const manifestationFailures = await this.trackManifestationFailures(userId, manifestations);
    failures.push(...manifestationFailures);

    // Track failures in synaptic gaps
    const gapFailures = await this.trackGapFailures(userId, gaps);
    failures.push(...gapFailures);

    // Track failures in synthetic emergences
    const emergenceFailures = await this.trackEmergenceFailures(userId, emergences);
    failures.push(...emergenceFailures);

    // Update unintegrated repository
    await this.updateUnintegratedRepository(userId, failures);

    return failures;
  }

  /**
   * Track failures in otherness manifestations
   */
  private async trackManifestationFailures(
    userId: string,
    manifestations: OthernessManifestations
  ): Promise<FailureEvent[]> {
    const failures: FailureEvent[] = [];

    // Check each manifestation type for integration failures
    for (const [channelType, channelManifestations] of Object.entries(manifestations)) {
      for (const manifestation of channelManifestations) {
        const failure = this.analyzeManifestationIntegration(manifestation, channelType);
        
        if (failure) {
          const failureEvent: FailureEvent = {
            id: `failure_manifest_${manifestation.id}`,
            userId,
            failureType: failure.failureType,
            sourceType: 'manifestation',
            sourceId: manifestation.id,
            failureDetails: failure,
            timestamp: new Date(),
            ongoingValue: this.calculateOngoingValue(failure)
          };

          failures.push(failureEvent);
          this.failureEvents.set(failureEvent.id, failureEvent);
        }
      }
    }

    return failures;
  }

  /**
   * Analyze integration status of a single manifestation
   */
  private analyzeManifestationIntegration(manifestation: any, channelType: string): IntegrationFailure | null {
    // Look for signs of integration failure
    const hasIntegrationFailure = this.detectIntegrationFailure(manifestation, channelType);
    
    if (!hasIntegrationFailure) return null;

    const failureType = this.classifyFailureType(manifestation, channelType);
    const whatRemainsForeign = this.identifyForeignElements(manifestation, channelType);
    const value = this.assessFailureValue(manifestation, channelType, failureType);
    const guidance = this.generateFailureGuidance(manifestation, channelType, failureType);

    return {
      failureType,
      whatRemainsForeign,
      value,
      guidance
    };
  }

  /**
   * Detect if integration has failed
   */
  private detectIntegrationFailure(manifestation: any, channelType: string): boolean {
    // Check for resistance to integration markers
    const failureMarkers = [
      manifestation.resistsIntegration,
      manifestation.remainsPartlyAlien,
      manifestation.unresolvableElements && manifestation.unresolvableElements.length > 0,
      manifestation.ongoingResistance && manifestation.ongoingResistance.length > 0,
      manifestation.resistsModification,
      manifestation.sourceUnknown && channelType === 'ideas',
      manifestation.chronicityLevel > 0.8 && channelType === 'obstacles',
      manifestation.persistentOtherness && manifestation.persistentOtherness.length > 0
    ];

    return failureMarkers.some(Boolean);
  }

  /**
   * Classify type of integration failure
   */
  private classifyFailureType(manifestation: any, channelType: string): 'refusal' | 'incomprehension' | 'overwhelm' | 'premature' {
    // Active resistance suggests refusal
    if (manifestation.resistsIntegration || manifestation.resistsModification) {
      return 'refusal';
    }

    // Mysterious/alien content suggests incomprehension
    if (manifestation.remainsPartlyAlien || manifestation.sourceUnknown || 
        (manifestation.unresolvableElements && manifestation.unresolvableElements.length > 0)) {
      return 'incomprehension';
    }

    // High intensity/charge suggests overwhelm
    if (manifestation.transformativeImpact > 0.8 || manifestation.intensityLevel > 0.8) {
      return 'overwhelm';
    }

    // Quick resolution with ongoing issues suggests premature integration
    return 'premature';
  }

  /**
   * Identify what remains foreign/unintegrated
   */
  private identifyForeignElements(manifestation: any, channelType: string): IntegrationFailure['whatRemainsForeign'] {
    const undigestibleContent: string[] = [];
    const persistentOtherness: string[] = [];
    const ongoingResistance: string[] = [];

    // Extract undigestible content
    if (manifestation.unresolvableElements) {
      undigestibleContent.push(...manifestation.unresolvableElements);
    }
    if (manifestation.content && manifestation.remainsPartlyAlien) {
      undigestibleContent.push("Core content maintains alien quality");
    }

    // Extract persistent otherness
    if (manifestation.persistentOtherness) {
      persistentOtherness.push(...manifestation.persistentOtherness);
    }
    if (manifestation.autonomousCharacters) {
      persistentOtherness.push(...manifestation.autonomousCharacters.map((char: string) => `Autonomous character: ${char}`));
    }
    if (manifestation.sourceUnknown) {
      persistentOtherness.push("Unknown source maintains mystery");
    }

    // Extract ongoing resistance
    if (manifestation.ongoingResistance) {
      ongoingResistance.push(...manifestation.ongoingResistance);
    }
    if (manifestation.resistsDirectApproach) {
      ongoingResistance.push("Resists direct approaches to understanding");
    }
    if (manifestation.developmentalAutonomy) {
      ongoingResistance.push("Develops according to its own logic");
    }

    return {
      undigestibleContent,
      persistentOtherness,
      ongoingResistance
    };
  }

  /**
   * Assess the value of integration failure
   */
  private assessFailureValue(manifestation: any, channelType: string, failureType: 'refusal' | 'incomprehension' | 'overwhelm' | 'premature'): IntegrationFailure['value'] {
    const maintainsTension = this.assessTensionMaintenance(manifestation, failureType);
    const preventsInflation = this.assessInflationPrevention(manifestation, failureType);
    const ensuresHumility = this.assessHumilityPreservation(manifestation, failureType);
    const protectsOtherness = this.assessOthernessProtection(manifestation, failureType);

    return {
      maintainsTension,
      preventsInflation,
      ensuresHumility,
      protectsOtherness
    };
  }

  /**
   * Assess if failure maintains creative tension
   */
  private assessTensionMaintenance(manifestation: any, failureType: string): boolean {
    return failureType === 'refusal' || failureType === 'incomprehension' ||
           manifestation.resistsResolution || 
           manifestation.chronicityLevel > 0.7;
  }

  /**
   * Assess if failure prevents ego inflation
   */
  private assessInflationPrevention(manifestation: any, failureType: string): boolean {
    return failureType === 'incomprehension' || failureType === 'overwhelm' ||
           manifestation.remainsPartlyAlien ||
           manifestation.sourceUnknown ||
           manifestation.surprisedSpeaker;
  }

  /**
   * Assess if failure ensures humility
   */
  private assessHumilityPreservation(manifestation: any, failureType: string): boolean {
    return failureType === 'incomprehension' || failureType === 'overwhelm' ||
           manifestation.unresolvableElements?.length > 0 ||
           manifestation.resistsControl;
  }

  /**
   * Assess if failure protects otherness
   */
  private assessOthernessProtection(manifestation: any, failureType: string): boolean {
    return failureType === 'refusal' ||
           manifestation.resistsIncorporation ||
           manifestation.maintainsOtherness ||
           manifestation.developmentalAutonomy;
  }

  /**
   * Track failures in synaptic gaps
   */
  private async trackGapFailures(userId: string, gaps: SynapticGapDynamics[]): Promise<FailureEvent[]> {
    const failures: FailureEvent[] = [];

    for (const gap of gaps) {
      // Check if gap represents integration failure
      if (gap.gapStability === 'stable' && gap.transmission.blocked.length > 0) {
        const failure = this.analyzeGapFailure(gap);
        
        if (failure) {
          const failureEvent: FailureEvent = {
            id: `failure_gap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            failureType: failure.failureType,
            sourceType: 'gap',
            sourceId: 'gap_stable_blocked',
            failureDetails: failure,
            timestamp: new Date(),
            ongoingValue: this.calculateOngoingValue(failure)
          };

          failures.push(failureEvent);
          this.failureEvents.set(failureEvent.id, failureEvent);
        }
      }
    }

    return failures;
  }

  /**
   * Analyze gap for integration failure
   */
  private analyzeGapFailure(gap: SynapticGapDynamics): IntegrationFailure | null {
    // Stable gaps with blocked transmissions indicate ongoing integration challenges
    if (gap.gapStability !== 'stable' || gap.transmission.blocked.length === 0) {
      return null;
    }

    const failureType: 'refusal' | 'incomprehension' | 'overwhelm' | 'premature' = 
      gap.transmission.blocked.length > gap.transmission.fromOtherToSelf.length ? 'refusal' : 'incomprehension';

    const whatRemainsForeign = {
      undigestibleContent: gap.transmission.blocked,
      persistentOtherness: gap.transmission.fromOtherToSelf,
      ongoingResistance: ["Gap maintains stable otherness", "Transmission remains blocked"]
    };

    const value = {
      maintainsTension: true,
      preventsInflation: gap.gapWidth > 0.6,
      ensuresHumility: gap.transmission.blocked.length > 0,
      protectsOtherness: gap.gapWidth > 0.5
    };

    const guidance = [
      "Honor the stable gap as valuable space",
      "Don't force transmission across blocked channels",
      "Value the ongoing tension as creative potential",
      "Recognize that some distances are meant to be maintained"
    ];

    return {
      failureType,
      whatRemainsForeign,
      value,
      guidance
    };
  }

  /**
   * Track failures in synthetic emergences
   */
  private async trackEmergenceFailures(userId: string, emergences: EmergenceEvent[]): Promise<FailureEvent[]> {
    const failures: FailureEvent[] = [];

    for (const emergence of emergences) {
      const failure = this.analyzeEmergenceFailure(emergence);
      
      if (failure) {
        const failureEvent: FailureEvent = {
          id: `failure_emergence_${emergence.id}`,
          userId,
          failureType: failure.failureType,
          sourceType: 'emergence',
          sourceId: emergence.id,
          failureDetails: failure,
          timestamp: new Date(),
          ongoingValue: this.calculateOngoingValue(failure)
        };

        failures.push(failureEvent);
        this.failureEvents.set(failureEvent.id, failureEvent);
      }
    }

    return failures;
  }

  /**
   * Analyze emergence for integration failure
   */
  private analyzeEmergenceFailure(emergence: EmergenceEvent): IntegrationFailure | null {
    const synthesis = emergence.synthesis;

    // Check for integration failure markers in synthesis
    const hasFailure = synthesis.emergenceType === 'compromise' ||
                      synthesis.emergenceType === 'pseudo_synthesis' ||
                      !synthesis.continuedDevelopment.maintainsOtherness;

    if (!hasFailure) return null;

    const failureType = synthesis.emergenceType === 'compromise' ? 'premature' :
                       synthesis.emergenceType === 'pseudo_synthesis' ? 'premature' : 'incomprehension';

    const whatRemainsForeign = {
      undigestibleContent: synthesis.continuedDevelopment.maintainsOtherness ? 
        ["Synthetic otherness"] : [],
      persistentOtherness: synthesis.irreducibilityMarkers.containsNovelProperties ? 
        ["Novel properties"] : [],
      ongoingResistance: synthesis.continuedDevelopment.ongoingEvolution ? 
        ["Continues evolving independently"] : []
    };

    const value = {
      maintainsTension: synthesis.experientialQualities.strangeness > 0.5,
      preventsInflation: !synthesis.irreducibilityMarkers.surprisesBothParties,
      ensuresHumility: synthesis.experientialQualities.autonomy > 0.5,
      protectsOtherness: synthesis.continuedDevelopment.maintainsOtherness
    };

    const guidance = this.generateEmergenceFailureGuidance(synthesis, failureType);

    return {
      failureType,
      whatRemainsForeign,
      value,
      guidance
    };
  }

  /**
   * Generate guidance for holding integration failures
   */
  private generateFailureGuidance(manifestation: any, channelType: string, failureType: string): string[] {
    const guidance: string[] = [];

    switch (failureType) {
      case 'refusal':
        guidance.push("Respect the refusal as wisdom");
        guidance.push("Don't force what doesn't want to be integrated");
        guidance.push("Value the ongoing resistance as protection");
        break;

      case 'incomprehension':
        guidance.push("Preserve the mystery as valuable");
        guidance.push("Not everything is meant to be understood");
        guidance.push("Let it remain foreign while staying in relationship");
        break;

      case 'overwhelm':
        guidance.push("Take time to metabolize slowly");
        guidance.push("Integration happens in its own time");
        guidance.push("Value partial integration over forced completion");
        break;

      case 'premature':
        guidance.push("Notice what was integrated too quickly");
        guidance.push("Allow the tension to re-emerge");
        guidance.push("Honor the complexity that was bypassed");
        break;
    }

    // Add channel-specific guidance
    switch (channelType) {
      case 'dreams':
        guidance.push("Let dream images maintain their symbolic power");
        break;
      case 'obstacles':
        guidance.push("Honor the obstacle's redirective function");
        break;
      case 'symptoms':
        guidance.push("Listen to what the body continues to say");
        break;
    }

    return guidance;
  }

  /**
   * Generate guidance for emergence failures
   */
  private generateEmergenceFailureGuidance(synthesis: any, failureType: string): string[] {
    const guidance: string[] = [];

    if (failureType === 'premature') {
      guidance.push("Allow the synthesis to decompose back into tension");
      guidance.push("Honor what was lost in premature resolution");
    }

    if (synthesis.experientialQualities.strangeness < 0.3) {
      guidance.push("Look for the alien elements that were domesticated");
    }

    if (!synthesis.continuedDevelopment.maintainsOtherness) {
      guidance.push("Find what otherness was lost in integration");
    }

    return guidance;
  }

  /**
   * Calculate ongoing value of failure
   */
  private calculateOngoingValue(failure: IntegrationFailure): number {
    const valueFactors = [
      failure.value.maintainsTension ? 0.25 : 0,
      failure.value.preventsInflation ? 0.25 : 0,
      failure.value.ensuresHumility ? 0.25 : 0,
      failure.value.protectsOtherness ? 0.25 : 0
    ];

    return valueFactors.reduce((sum, factor) => sum + factor, 0);
  }

  /**
   * Update unintegrated repository for user
   */
  private async updateUnintegratedRepository(userId: string, failures: FailureEvent[]): Promise<void> {
    let repository = this.unintegratedRepositories.get(userId);
    
    if (!repository) {
      repository = {
        userId,
        persistentOtherness: new Map(),
        ongoingResistances: new Map(),
        protectedMysteries: new Map(),
        lastUpdated: new Date()
      };
    }

    // Update repository with new failures
    for (const failure of failures) {
      const details = failure.failureDetails;
      
      // Add persistent otherness
      for (const otherness of details.whatRemainsForeign.persistentOtherness) {
        repository.persistentOtherness.set(`${failure.sourceId}_${otherness}`, {
          content: otherness,
          source: failure.sourceType,
          failureType: failure.failureType,
          value: failure.ongoingValue,
          timestamp: failure.timestamp
        });
      }

      // Add ongoing resistances
      for (const resistance of details.whatRemainsForeign.ongoingResistance) {
        repository.ongoingResistances.set(`${failure.sourceId}_${resistance}`, {
          content: resistance,
          source: failure.sourceType,
          protectedValue: details.value,
          timestamp: failure.timestamp
        });
      }

      // Add protected mysteries
      for (const mystery of details.whatRemainsForeign.undigestibleContent) {
        repository.protectedMysteries.set(`${failure.sourceId}_${mystery}`, {
          content: mystery,
          source: failure.sourceType,
          guidance: details.guidance,
          timestamp: failure.timestamp
        });
      }
    }

    repository.lastUpdated = new Date();
    this.unintegratedRepositories.set(userId, repository);
  }

  /**
   * Get user's unintegrated repository
   */
  async getUnintegratedRepository(userId: string): Promise<UnintegratedRepository | null> {
    return this.unintegratedRepositories.get(userId) || null;
  }

  /**
   * Get valuable failures (those with high ongoing value)
   */
  async getValuableFailures(userId: string): Promise<FailureEvent[]> {
    const userFailures = Array.from(this.failureEvents.values())
      .filter(failure => failure.userId === userId);

    return userFailures
      .filter(failure => failure.ongoingValue > 0.6)
      .sort((a, b) => b.ongoingValue - a.ongoingValue);
  }

  /**
   * Get chronic integration failures
   */
  async getChronicFailures(userId: string): Promise<FailureEvent[]> {
    const userFailures = Array.from(this.failureEvents.values())
      .filter(failure => failure.userId === userId);

    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    return userFailures.filter(failure => 
      failure.timestamp.getTime() < thirtyDaysAgo &&
      failure.ongoingValue > 0.5
    );
  }

  /**
   * Honor integration failure as guidance
   */
  async honorFailureAsGuidance(failureId: string): Promise<string[]> {
    const failure = this.failureEvents.get(failureId);
    if (!failure) return [];

    const guidance = [...failure.failureDetails.guidance];

    // Add meta-guidance about honoring the failure
    guidance.push("This integration failure serves your wholeness");
    guidance.push("Not everything is meant to be resolved");
    guidance.push("Some tensions are more valuable than their resolution");

    if (failure.failureDetails.value.protectsOtherness) {
      guidance.push("This failure protects genuine otherness from domestication");
    }

    if (failure.failureDetails.value.maintainsTension) {
      guidance.push("This failure maintains creative tension that generates new possibilities");
    }

    return guidance;
  }

  /**
   * Generate narrative about integration failures
   */
  async generateFailureNarrative(userId: string): Promise<string> {
    const repository = await this.getUnintegratedRepository(userId);
    if (!repository) return "No integration patterns detected.";

    const persistentCount = repository.persistentOtherness.size;
    const resistanceCount = repository.ongoingResistances.size;
    const mysteryCount = repository.protectedMysteries.size;

    let narrative = `Your psyche maintains ${persistentCount} areas of persistent otherness, ${resistanceCount} ongoing resistances, and ${mysteryCount} protected mysteries. `;

    if (persistentCount > 0) {
      narrative += "These foreign elements serve as ongoing sources of wisdom and challenge to ego assumptions. ";
    }

    if (resistanceCount > 0) {
      narrative += "Your resistances protect essential aspects of your nature from premature integration. ";
    }

    if (mysteryCount > 0) {
      narrative += "Your mysteries maintain the sacred unknown that keeps you growing. ";
    }

    narrative += "Integration failure, in your case, is integration success.";

    return narrative;
  }
}