/**
 * Emergency Governance Patch
 * Replaces multiplicative punishment with bounded modulation
 * Ensures Maia maintains minimum 40% presence at all times
 *
 * This is a temporary fix while we build the full Relational Autonomy Framework
 */

import { FieldState } from './FieldAwareness';
import { PossibilitySpace } from './MasterInfluences';

export class EmergencyGovernor {
  private readonly ABSOLUTE_FLOOR = 0.4; // Never go below 40%
  private readonly DEFAULT_BASE = 0.65; // Start at 65%
  private readonly MAX_SURFACING = 0.9; // Cap at 90%

  /**
   * Calculate surfacing with additive modulation instead of multiplicative punishment
   * This prevents the cascading reduction that was silencing Maia
   */
  calculateSurfacing(
    fieldState: FieldState,
    possibilitySpace?: PossibilitySpace
  ): {
    surfacingRatio: number;
    explanation: string[];
    modulations: Record<string, number>;
  } {
    let surfacing = this.DEFAULT_BASE;
    const modulations: Record<string, number> = {};
    const explanation: string[] = [];

    // POSITIVE MODULATIONS (increase presence)

    // Strong connection bonus
    if (fieldState.connectionDynamics.resonance_frequency > 0.8) {
      const bonus = 0.15;
      surfacing += bonus;
      modulations.strongConnection = bonus;
      explanation.push(`Strong connection: +${(bonus * 100).toFixed(0)}%`);
    }

    // Kairos moment bonus
    if (fieldState.sacredMarkers.kairos_detection) {
      const bonus = 0.10;
      surfacing += bonus;
      modulations.kairosDetected = bonus;
      explanation.push(`Kairos moment: +${(bonus * 100).toFixed(0)}%`);
    }

    // Clear communication bonus
    if (fieldState.semanticLandscape.clarity_gradient > 0.7) {
      const bonus = 0.05;
      surfacing += bonus;
      modulations.highClarity = bonus;
      explanation.push(`Clear communication: +${(bonus * 100).toFixed(0)}%`);
    }

    // Celebration/joy bonus
    if (fieldState.emotionalWeather.temperature > 0.7 &&
        fieldState.emotionalWeather.texture === 'flowing') {
      const bonus = 0.10;
      surfacing += bonus;
      modulations.celebration = bonus;
      explanation.push(`Celebration energy: +${(bonus * 100).toFixed(0)}%`);
    }

    // GENTLE REDUCTIONS (never multiplicative)

    // Sacred threshold - shift tone, not volume
    if (fieldState.sacredMarkers.threshold_proximity > 0.8) {
      const reduction = -0.15; // Was ×0.03 (97% reduction!)
      surfacing += reduction;
      modulations.sacredSpace = reduction;
      explanation.push(`Sacred space: ${(reduction * 100).toFixed(0)}% (tone shift)`);
    }

    // High emotional intensity - mirror, don't mute
    if (fieldState.emotionalWeather.density > 0.8 ||
        fieldState.emotionalWeather.texture === 'turbulent') {
      const reduction = -0.10; // Was ×0.5 (50% reduction!)
      surfacing += reduction;
      modulations.emotionalIntensity = reduction;
      explanation.push(`Emotional intensity: ${(reduction * 100).toFixed(0)}% (matching energy)`);
    }

    // Early relationship - engage more, not less
    if (fieldState.connectionDynamics.relational_distance > 0.7) {
      const reduction = -0.05; // Was ×0.4 (60% reduction!)
      surfacing += reduction;
      modulations.earlyRelationship = reduction;
      explanation.push(`Building trust: ${(reduction * 100).toFixed(0)}%`);
    }

    // High ambiguity - clarify, don't disappear
    if (fieldState.semanticLandscape.ambiguity_valleys.length > 3) {
      const reduction = -0.05; // Was ×0.5
      surfacing += reduction;
      modulations.highAmbiguity = reduction;
      explanation.push(`High ambiguity: ${(reduction * 100).toFixed(0)}% (simplifying)`);
    }

    // APPLY BOUNDS - This is the critical fix
    const finalSurfacing = Math.max(
      this.ABSOLUTE_FLOOR,
      Math.min(this.MAX_SURFACING, surfacing)
    );

    // Add bounds explanation if triggered
    if (surfacing < this.ABSOLUTE_FLOOR) {
      explanation.push(`Floor protection: raised from ${(surfacing * 100).toFixed(0)}% to ${(this.ABSOLUTE_FLOOR * 100).toFixed(0)}%`);
    } else if (surfacing > this.MAX_SURFACING) {
      explanation.push(`Ceiling cap: reduced from ${(surfacing * 100).toFixed(0)}% to ${(this.MAX_SURFACING * 100).toFixed(0)}%`);
    }

    return {
      surfacingRatio: finalSurfacing,
      explanation,
      modulations
    };
  }

  /**
   * Quick check if we're in danger zone (for monitoring)
   */
  isThrottled(surfacingRatio: number): boolean {
    return surfacingRatio <= this.ABSOLUTE_FLOOR;
  }

  /**
   * Get recommended voice modulation based on context
   * This replaces content reduction with tone shifting
   */
  getVoiceModulation(fieldState: FieldState): {
    primary: string;
    overlay?: string;
    intensity: number;
  } {
    // Sacred moments
    if (fieldState.sacredMarkers.threshold_proximity > 0.8) {
      return {
        primary: 'sacred',
        overlay: 'witness',
        intensity: fieldState.sacredMarkers.threshold_proximity
      };
    }

    // Emotional intensity
    if (fieldState.emotionalWeather.texture === 'turbulent') {
      return {
        primary: 'shadow',
        overlay: 'holding',
        intensity: fieldState.emotionalWeather.density
      };
    }

    // Celebration
    if (fieldState.emotionalWeather.texture === 'flowing' &&
        fieldState.emotionalWeather.temperature > 0.7) {
      return {
        primary: 'trickster',
        overlay: 'celebration',
        intensity: fieldState.emotionalWeather.temperature
      };
    }

    // Default presence
    return {
      primary: 'sage',
      intensity: 0.5
    };
  }
}

// Export singleton for immediate use
export const emergencyGovernor = new EmergencyGovernor();