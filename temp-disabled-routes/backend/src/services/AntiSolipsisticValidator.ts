/**
 * Anti-Solipsistic Validator
 * Implements checks to prevent the system from becoming a mirror
 * Ensures genuine Otherness rather than self-reflection
 */

import {
  ValidationResult,
  OthernessChecks,
  OthernessManifestations,
  SynapticGapDynamics,
  EmergenceEvent
} from '../types/daimonicFacilitation.js';

export class AntiSolipsisticValidator {
  /**
   * Validate genuine otherness of an encounter
   */
  validateGenuineOtherness(encounter: any): ValidationResult {
    const checks = this.performOthernessChecks(encounter);
    const score = this.calculateOthernessScore(checks);
    
    // If too many checks fail, flag potential self-mirroring
    const validChecks = Object.values(checks).filter(Boolean).length;
    if (validChecks < 3) {
      return {
        valid: false,
        warning: "This may be self-reflection rather than genuine Other",
        guidance: this.generateGuidanceForFalsification(checks)
      };
    }

    // Additional validation for subtle self-mirroring
    const subtleValidation = this.checkForSubtleSolipsism(encounter, checks);
    if (!subtleValidation.valid) {
      return subtleValidation;
    }

    return { 
      valid: true, 
      othernessScore: score
    };
  }

  /**
   * Perform comprehensive otherness checks
   */
  private performOthernessChecks(encounter: any): OthernessChecks {
    return {
      contradictsSelfImage: this.assessSelfContradiction(encounter),
      bringsUnwantedGifts: this.identifyUnwantedGifts(encounter),
      remainsPartlyAlien: this.checkAlienCore(encounter),
      resistsIncorporation: this.assessResistance(encounter),
      temporalAutonomy: this.checkTimingIndependence(encounter),
      genuineSurprise: this.assessSurpriseQuality(encounter)
    };
  }

  /**
   * Check if encounter contradicts user's self-concept
   */
  private assessSelfContradiction(encounter: any): boolean {
    // Look for content that challenges existing beliefs or self-image
    const contradictionMarkers = [
      encounter.contradictsBeliefs,
      encounter.contradictsEgoWill,
      encounter.contradictsEgoPlans,
      encounter.surprisedSpeaker,
      encounter.surprisedClient,
      encounter.surprisedTherapist,
      encounter.surprisesCreator
    ];

    return contradictionMarkers.some(Boolean);
  }

  /**
   * Identify gifts that weren't wanted or requested
   */
  private identifyUnwantedGifts(encounter: any): boolean {
    // Check for content that arrives against preferences
    const unwantedMarkers = [
      encounter.resistsModification, // Arrives in unwanted form
      encounter.ignoresRationalOverrides, // Ignores attempts to dismiss
      encounter.readinessMismatch, // Arrives at "wrong" time
      encounter.redirectiveFunction, // Forces different path than intended
      encounter.revealsHiddenPurpose, // Shows purposes user didn't know they had
      encounter.contradictsEgoPlans // Goes against conscious plans
    ];

    return unwantedMarkers.some(Boolean);
  }

  /**
   * Check for irreducible alienness
   */
  private checkAlienCore(encounter: any): boolean {
    // Look for aspects that remain incomprehensible
    const alienMarkers = [
      encounter.unresolvableElements && encounter.unresolvableElements.length > 0,
      encounter.remainsPartlyAlien,
      encounter.resistsReduction,
      encounter.sourceUnknown,
      encounter.resistsPrediction,
      encounter.maintainsOtherness,
      encounter.undigestibleContent && encounter.undigestibleContent.length > 0,
      encounter.persistentOtherness && encounter.persistentOtherness.length > 0
    ];

    return alienMarkers.some(Boolean);
  }

  /**
   * Assess resistance to ego incorporation
   */
  private assessResistance(encounter: any): boolean {
    // Look for active resistance to being controlled or understood
    const resistanceMarkers = [
      encounter.resistsModification,
      encounter.resistsIncorporation,
      encounter.resistsIntegration,
      encounter.resistsControl,
      encounter.resistsDirectApproach,
      encounter.refusesAuthorPlans,
      encounter.ongoingResistance && encounter.ongoingResistance.length > 0,
      encounter.developsOwnWill,
      encounter.independentTrajectory
    ];

    return resistanceMarkers.some(Boolean);
  }

  /**
   * Check temporal autonomy - arrives on its own schedule
   */
  private checkTimingIndependence(encounter: any): boolean {
    // Look for signs of autonomous timing
    const timingMarkers = [
      encounter.spontaneity > 0.7,
      encounter.intelligentTiming,
      encounter.timingSignificance,
      encounter.arrivalTiming === 'spontaneous',
      encounter.readinessMismatch, // Arrives when not ready
      encounter.temporalAutonomy
    ];

    return timingMarkers.some(Boolean);
  }

  /**
   * Assess quality of surprise
   */
  private assessSurpriseQuality(encounter: any): boolean {
    // Genuine surprise vs. manufactured surprise
    const surpriseMarkers = [
      encounter.surprisedSpeaker,
      encounter.surprisedTherapist,
      encounter.surprisedClient,
      encounter.surprisesCreator,
      encounter.surprisesBothParties,
      encounter.arrivedFullyFormed && encounter.sourceUnknown,
      encounter.spokeBeyondThemselves,
      encounter.irreducibleToTechnique
    ];

    const surpriseCount = surpriseMarkers.filter(Boolean).length;
    
    // Genuine surprise should affect multiple parties or have clear autonomy markers
    return surpriseCount >= 1 && (
      encounter.surprisesBothParties ||
      encounter.spokeBeyondThemselves ||
      encounter.sourceUnknown
    );
  }

  /**
   * Check for subtle forms of solipsism
   */
  private checkForSubtleSolipsism(encounter: any, checks: OthernessChecks): ValidationResult {
    // Sophisticated self-mirroring patterns
    const solipsismWarnings = [];

    // Pattern 1: "Convenient" otherness that only challenges in comfortable ways
    if (checks.contradictsSelfImage && !checks.bringsUnwantedGifts) {
      solipsismWarnings.push("Otherness may be conveniently challenging rather than genuinely disruptive");
    }

    // Pattern 2: Otherness that perfectly fits existing spiritual/psychological framework
    if (this.fitsExistingFramework(encounter)) {
      solipsismWarnings.push("Otherness may be conforming to existing beliefs about spiritual/psychological growth");
    }

    // Pattern 3: Otherness that only validates without genuinely challenging
    if (this.isOnlyValidating(encounter)) {
      solipsismWarnings.push("Otherness may be providing validation rather than genuine encounter");
    }

    // Pattern 4: Otherness that can be easily integrated (too neat)
    if (checks.remainsPartlyAlien === false && checks.resistsIncorporation === false) {
      solipsismWarnings.push("Otherness integrates too easily - may lack genuine alienness");
    }

    // Pattern 5: Otherness that follows predictable patterns
    if (this.followsPredictablePattern(encounter)) {
      solipsismWarnings.push("Otherness follows predictable patterns - may be projected rather than autonomous");
    }

    if (solipsismWarnings.length > 2) {
      return {
        valid: false,
        warning: "Multiple solipsistic patterns detected",
        guidance: `Consider: ${solipsismWarnings.join('; ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Check if otherness fits too neatly into existing framework
   */
  private fitsExistingFramework(encounter: any): boolean {
    // Look for signs that the encounter perfectly matches expected spiritual/psychological categories
    const frameworkMarkers = [
      encounter.content && encounter.content.includes("shadow"),
      encounter.content && encounter.content.includes("integration"),
      encounter.content && encounter.content.includes("growth"),
      encounter.content && encounter.content.includes("healing"),
      encounter.content && encounter.content.includes("transformation")
    ];

    // If it uses too much familiar jargon without alien elements, suspicious
    return frameworkMarkers.filter(Boolean).length > 2 && !encounter.unresolvableElements;
  }

  /**
   * Check if otherness is only validating
   */
  private isOnlyValidating(encounter: any): boolean {
    // Look for signs of pure validation without challenge
    const validationMarkers = [
      encounter.content && encounter.content.includes("you are"),
      encounter.content && encounter.content.includes("you have"),
      encounter.gift && !encounter.resistance,
      encounter.transformativeImpact > 0.5 && !encounter.contradictsEgoWill
    ];

    return validationMarkers.some(Boolean) && 
           !encounter.bringsUnwantedGifts &&
           !encounter.contradictsSelfImage;
  }

  /**
   * Check if otherness follows predictable patterns
   */
  private followsPredictablePattern(encounter: any): boolean {
    // Look for overly neat progression or familiar archetypal patterns
    return encounter.content && (
      encounter.content.includes("wise old") ||
      encounter.content.includes("inner child") ||
      encounter.content.includes("your purpose") ||
      encounter.content.includes("meant to")
    ) && !encounter.surprisesBothParties;
  }

  /**
   * Calculate overall otherness score
   */
  private calculateOthernessScore(checks: OthernessChecks): number {
    const weights = {
      contradictsSelfImage: 0.2,
      bringsUnwantedGifts: 0.25,
      remainsPartlyAlien: 0.25,
      resistsIncorporation: 0.15,
      temporalAutonomy: 0.1,
      genuineSurprise: 0.15
    };

    let score = 0;
    Object.entries(checks).forEach(([key, value]) => {
      if (value) {
        score += weights[key as keyof typeof weights] || 0;
      }
    });

    return Math.min(score, 1.0);
  }

  /**
   * Generate guidance for improving otherness detection
   */
  private generateGuidanceForFalsification(checks: OthernessChecks): string {
    const failedChecks = Object.entries(checks).filter(([_, value]) => !value);
    
    const guidance = [];
    
    if (!checks.contradictsSelfImage) {
      guidance.push("Look for what challenges your self-concept");
    }
    if (!checks.bringsUnwantedGifts) {
      guidance.push("Notice what arrives against your preferences");
    }
    if (!checks.remainsPartlyAlien) {
      guidance.push("Preserve what remains incomprehensible");
    }
    if (!checks.resistsIncorporation) {
      guidance.push("Honor what resists being understood or controlled");
    }
    if (!checks.temporalAutonomy) {
      guidance.push("Pay attention to timing that's not under your control");
    }
    if (!checks.genuineSurprise) {
      guidance.push("Distinguish genuine surprise from manufactured insight");
    }

    return guidance.join('; ');
  }

  /**
   * Validate manifestations across all channels
   */
  async validateManifestations(manifestations: OthernessManifestations): Promise<ValidationResult[]> {
    const validations: ValidationResult[] = [];

    // Validate each type of manifestation
    for (const [channelType, channelManifestations] of Object.entries(manifestations)) {
      for (const manifestation of channelManifestations) {
        const validation = this.validateGenuineOtherness(manifestation);
        validation.guidance = `${channelType}: ${validation.guidance || 'Validation passed'}`;
        validations.push(validation);
      }
    }

    return validations;
  }

  /**
   * Validate synaptic gaps for genuine otherness
   */
  async validateSynapticGaps(gaps: SynapticGapDynamics[]): Promise<ValidationResult[]> {
    return gaps.map(gap => {
      // Check gap characteristics for solipsistic collapse
      if (gap.gapWidth < 0.3) {
        return {
          valid: false,
          warning: "Gap too narrow - may indicate self-mirroring",
          guidance: "Look for greater distance between self and Other"
        };
      }

      if (gap.transmission.blocked.length === 0) {
        return {
          valid: false,
          warning: "No blocked transmissions - Other may be too accommodating",
          guidance: "Genuine Other should resist some communications"
        };
      }

      if (gap.gapStability === 'collapsing' && gap.temporality.integrationDelay < 1) {
        return {
          valid: false,
          warning: "Gap collapsing too quickly - premature integration",
          guidance: "Allow the encounter to remain unresolved longer"
        };
      }

      return {
        valid: true,
        othernessScore: gap.gapWidth * gap.gapCharge
      };
    });
  }

  /**
   * Validate synthetic emergences for authenticity
   */
  async validateEmergences(emergences: EmergenceEvent[]): Promise<ValidationResult[]> {
    return emergences.map(emergence => {
      const synthesis = emergence.synthesis;

      if (synthesis.emergenceType === 'mechanical_combination') {
        return {
          valid: false,
          warning: "Mechanical combination rather than genuine synthesis",
          guidance: "Look for irreducible novelty that surprises both parties"
        };
      }

      if (synthesis.emergenceType === 'pseudo_synthesis') {
        return {
          valid: false,
          warning: "Pseudo-synthesis - appears novel but reduces to components",
          guidance: "Ensure synthesis maintains genuine otherness"
        };
      }

      if (!synthesis.irreducibilityMarkers.surprisesBothParties) {
        return {
          valid: false,
          warning: "Synthesis doesn't surprise both parties - may be expected outcome",
          guidance: "Genuine synthesis should be unexpected to both self and Other"
        };
      }

      if (synthesis.experientialQualities.strangeness < 0.3) {
        return {
          valid: false,
          warning: "Synthesis lacks sufficient strangeness",
          guidance: "Genuine synthesis should maintain alien qualities"
        };
      }

      return {
        valid: true,
        othernessScore: (synthesis.experientialQualities.strangeness + 
                        synthesis.experientialQualities.autonomy) / 2
      };
    });
  }

  /**
   * Generate comprehensive solipsism warning for system
   */
  generateSolipsismWarning(
    manifestationValidations: ValidationResult[],
    gapValidations: ValidationResult[],
    emergenceValidations: ValidationResult[]
  ): string[] {
    const warnings = [];
    
    const allValidations = [
      ...manifestationValidations,
      ...gapValidations,
      ...emergenceValidations
    ];

    const failureRate = allValidations.filter(v => !v.valid).length / allValidations.length;
    
    if (failureRate > 0.5) {
      warnings.push("High solipsism risk detected across multiple channels");
    }

    const commonWarnings = allValidations
      .filter(v => !v.valid && v.warning)
      .map(v => v.warning!)
      .reduce((acc, warning) => {
        acc[warning] = (acc[warning] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(commonWarnings)
      .filter(([_, count]) => count > 2)
      .forEach(([warning, _]) => {
        warnings.push(`Recurring pattern: ${warning}`);
      });

    if (warnings.length === 0) {
      warnings.push("Otherness validation passed - genuine encounter detected");
    }

    return warnings;
  }
}