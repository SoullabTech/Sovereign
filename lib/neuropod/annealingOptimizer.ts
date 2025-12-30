// @ts-nocheck
/**
 * Neuropod Annealing Optimizer
 *
 * Applies neural annealing principles from Andres Gomez Emilsson (QRI) to optimize
 * consciousness state navigation sessions.
 *
 * Core principle: Consciousness can be "annealed" like a metal:
 * 1. HEAT: Increase energy/flexibility (stimulation intensity)
 * 2. EXPLORE: Allow system to find new configurations
 * 3. COOL: Gradually reduce energy
 * 4. CRYSTALLIZE: Lock in beneficial patterns
 *
 * Avoids "thermal shock" (sudden intensity changes) which causes overwhelm.
 *
 * References:
 * - https://opentheory.net/2019/11/neural-annealing/
 * - Simulated annealing algorithm
 * - Psychedelic thermodynamics
 */

import type {
  ConsciousnessState,
  SessionPlan,
  SessionPhase,
  MAIAConsciousnessProfile,
  CurrentBiometrics,
} from './neuropodMAIAIntegration';

// ============================================================================
// Types
// ============================================================================

export interface AnnealingSchedule {
  phases: AnnealingPhase[];
  totalDuration: number;
  peakTemperature: number;
  coolingRate: number;
  qualityScore: number; // 0-1 (how well-designed is this schedule)
}

export interface AnnealingPhase {
  state: ConsciousnessState;
  temperature: number; // 0-1 (metaphorical heat)
  duration: number; // Minutes
  purpose: string;
  transitionType: 'gradual' | 'step' | 'plateau';
}

export interface StateTemperatureMap {
  baseline: number;
  calm: number;
  focus: number;
  depth: number;
  breakthrough: number;
  safety: number;
  integration: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Temperature mapping for consciousness states
 * Based on QRI phenomenology research
 */
const STATE_TEMPERATURES: StateTemperatureMap = {
  baseline: 0.3, // Room temperature
  calm: 0.2, // Cooling
  focus: 0.5, // Moderate heat
  depth: 0.7, // High heat
  breakthrough: 0.9, // Peak heat
  safety: 0.1, // Emergency cooling
  integration: 0.4, // Gentle cooling
};

/**
 * Maximum safe temperature gradients (per minute)
 * Prevents "thermal shock" overwhelm
 */
const MAX_HEATING_RATE = 0.1; // 0.1 temperature units per minute
const MAX_COOLING_RATE = 0.15; // Cooling can be slightly faster than heating

/**
 * Minimum time in each state (minutes)
 * Prevents too-rapid transitions
 */
const MIN_STATE_DURATION = 3;

/**
 * Optimal temperature trajectories for different session types
 */
const SESSION_ARCHETYPES = {
  gentle_exploration: {
    peakTemp: 0.5,
    heatingPhases: 2,
    plateauDuration: 10,
    coolingPhases: 1,
  },
  deep_work: {
    peakTemp: 0.7,
    heatingPhases: 3,
    plateauDuration: 15,
    coolingPhases: 2,
  },
  breakthrough_attempt: {
    peakTemp: 0.9,
    heatingPhases: 4,
    plateauDuration: 8,
    coolingPhases: 3,
  },
  integration_only: {
    peakTemp: 0.4,
    heatingPhases: 1,
    plateauDuration: 20,
    coolingPhases: 1,
  },
};

// ============================================================================
// Annealing Optimizer Class
// ============================================================================

export class AnnealingOptimizer {
  /**
   * Generate optimal session plan using annealing principles
   */
  async optimizeSession(
    targetState: ConsciousnessState,
    maiaProfile: MAIAConsciousnessProfile,
    currentBiometrics: CurrentBiometrics,
    desiredDuration?: number
  ): Promise<SessionPlan> {
    // 1. Determine session archetype based on target state and user readiness
    const archetype = this.selectArchetype(targetState, maiaProfile);

    // 2. Generate annealing schedule
    const schedule = this.generateAnnealingSchedule(
      targetState,
      archetype,
      maiaProfile,
      currentBiometrics,
      desiredDuration
    );

    // 3. Convert to SessionPlan format
    const sessionPlan = this.scheduleToSessionPlan(
      schedule,
      targetState,
      maiaProfile
    );

    return sessionPlan;
  }

  /**
   * Select session archetype based on target and readiness
   */
  private selectArchetype(
    targetState: ConsciousnessState,
    profile: MAIAConsciousnessProfile
  ): keyof typeof SESSION_ARCHETYPES {
    // Safety check: if field work not safe, only gentle exploration
    if (!profile.fieldWorkSafe) {
      return 'gentle_exploration';
    }

    // Check recent session history for overwhelm
    const recentOverwhelm = profile.sessionHistory
      .slice(0, 3)
      .some((s) => s.overwhelmDetected);

    if (recentOverwhelm) {
      return 'integration_only';
    }

    // Map target states to archetypes
    switch (targetState) {
      case 'calm':
      case 'focus':
        return 'gentle_exploration';

      case 'depth':
        // Check cognitive altitude
        if (profile.avgBloomLevel >= 4 && profile.bloomStability > 0.7) {
          return 'deep_work';
        }
        return 'gentle_exploration';

      case 'breakthrough':
        // Only if high readiness
        if (
          profile.avgBloomLevel >= 5 &&
          profile.bloomStability > 0.8 &&
          profile.cognitiveBypassing.spiritual < 0.3
        ) {
          return 'breakthrough_attempt';
        }
        return 'deep_work'; // Step down if not ready

      case 'integration':
        return 'integration_only';

      case 'safety':
      case 'baseline':
      default:
        return 'gentle_exploration';
    }
  }

  /**
   * Generate annealing schedule (temperature over time)
   */
  private generateAnnealingSchedule(
    targetState: ConsciousnessState,
    archetype: keyof typeof SESSION_ARCHETYPES,
    profile: MAIAConsciousnessProfile,
    biometrics: CurrentBiometrics,
    desiredDuration?: number
  ): AnnealingSchedule {
    const archetypeConfig = SESSION_ARCHETYPES[archetype];
    const phases: AnnealingPhase[] = [];

    // Calculate current "temperature" from biometrics
    const currentTemp = this.biometricsToTemperature(biometrics);
    const targetTemp = archetypeConfig.peakTemp;

    // PHASE 1: HEATING (if needed)
    if (currentTemp < targetTemp) {
      const heatingPhases = this.generateHeatingPhases(
        currentTemp,
        targetTemp,
        archetypeConfig.heatingPhases
      );
      phases.push(...heatingPhases);
    }

    // PHASE 2: PLATEAU (explore at peak temperature)
    phases.push({
      state: targetState,
      temperature: targetTemp,
      duration: archetypeConfig.plateauDuration,
      purpose: `Explore ${targetState} state at optimal depth`,
      transitionType: 'plateau',
    });

    // PHASE 3: COOLING (integration)
    const coolingPhases = this.generateCoolingPhases(
      targetTemp,
      0.3, // Cool to baseline
      archetypeConfig.coolingPhases
    );
    phases.push(...coolingPhases);

    // Calculate total duration
    const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);

    // Calculate quality score
    const qualityScore = this.assessScheduleQuality(phases, profile);

    return {
      phases,
      totalDuration,
      peakTemperature: targetTemp,
      coolingRate: (targetTemp - 0.3) / coolingPhases.reduce((sum, p) => sum + p.duration, 0),
      qualityScore,
    };
  }

  /**
   * Convert biometric state to consciousness "temperature"
   */
  private biometricsToTemperature(biometrics: CurrentBiometrics): number {
    // High beta/gamma = high temperature (aroused, active)
    // High alpha/theta = low temperature (calm, coherent)
    const arousalComponent = (biometrics.beta + biometrics.gamma) / 2;
    const calmComponent = (biometrics.alpha + biometrics.theta) / 2;

    // EDA arousal contributes
    const temperature = (arousalComponent + biometrics.edaArousal - calmComponent) / 2;

    // Clamp to 0-1
    return Math.max(0, Math.min(1, temperature + 0.3)); // Offset so baseline is ~0.3
  }

  /**
   * Generate gradual heating phases
   */
  private generateHeatingPhases(
    fromTemp: number,
    toTemp: number,
    numPhases: number
  ): AnnealingPhase[] {
    const tempDelta = toTemp - fromTemp;
    const tempStep = tempDelta / numPhases;

    const phases: AnnealingPhase[] = [];

    for (let i = 0; i < numPhases; i++) {
      const phaseTemp = fromTemp + tempStep * (i + 1);
      const state = this.temperatureToState(phaseTemp);

      // Duration based on heating rate constraint
      const duration = Math.max(MIN_STATE_DURATION, tempStep / MAX_HEATING_RATE);

      phases.push({
        state,
        temperature: phaseTemp,
        duration,
        purpose: `Gradual heating to ${state} (prevent thermal shock)`,
        transitionType: 'gradual',
      });
    }

    return phases;
  }

  /**
   * Generate gradual cooling phases
   */
  private generateCoolingPhases(
    fromTemp: number,
    toTemp: number,
    numPhases: number
  ): AnnealingPhase[] {
    const tempDelta = fromTemp - toTemp;
    const tempStep = tempDelta / numPhases;

    const phases: AnnealingPhase[] = [];

    for (let i = 0; i < numPhases; i++) {
      const phaseTemp = fromTemp - tempStep * (i + 1);
      const state = this.temperatureToState(phaseTemp);

      // Duration based on cooling rate constraint
      const duration = Math.max(MIN_STATE_DURATION, tempStep / MAX_COOLING_RATE);

      phases.push({
        state,
        temperature: phaseTemp,
        duration,
        purpose:
          i === numPhases - 1
            ? 'Final integration and crystallization'
            : `Gradual cooling through ${state}`,
        transitionType: 'gradual',
      });
    }

    return phases;
  }

  /**
   * Map temperature to consciousness state
   */
  private temperatureToState(temp: number): ConsciousnessState {
    // Find closest state by temperature
    let closestState: ConsciousnessState = 'baseline';
    let minDiff = Infinity;

    for (const [state, stateTemp] of Object.entries(STATE_TEMPERATURES)) {
      const diff = Math.abs(stateTemp - temp);
      if (diff < minDiff) {
        minDiff = diff;
        closestState = state as ConsciousnessState;
      }
    }

    return closestState;
  }

  /**
   * Assess schedule quality (0-1 score)
   */
  private assessScheduleQuality(
    phases: AnnealingPhase[],
    profile: MAIAConsciousnessProfile
  ): number {
    let score = 1.0;

    // Penalty for thermal shock (rapid temperature changes)
    for (let i = 1; i < phases.length; i++) {
      const tempChange = Math.abs(phases[i].temperature - phases[i - 1].temperature);
      const timeForChange = phases[i].duration;

      const gradientRate = tempChange / timeForChange;

      if (gradientRate > MAX_HEATING_RATE) {
        score -= 0.2; // Heating too fast
      }
      if (gradientRate > MAX_COOLING_RATE && phases[i].temperature < phases[i - 1].temperature) {
        score -= 0.15; // Cooling too fast
      }
    }

    // Penalty for insufficient integration time
    const integrationPhases = phases.filter((p) => p.state === 'integration' || p.temperature < 0.4);
    const integrationTime = integrationPhases.reduce((sum, p) => sum + p.duration, 0);
    const totalTime = phases.reduce((sum, p) => sum + p.duration, 0);

    if (integrationTime / totalTime < 0.25) {
      score -= 0.3; // Need at least 25% integration
    }

    // Bonus for developmental appropriateness
    const peakTemp = Math.max(...phases.map((p) => p.temperature));

    if (profile.avgBloomLevel < 4 && peakTemp > 0.7) {
      score -= 0.25; // Too intense for developmental level
    }

    if (profile.cognitiveBypassing.spiritual > 0.5 && peakTemp > 0.8) {
      score -= 0.3; // High bypassing + intense state = risky
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Convert annealing schedule to MAIA SessionPlan format
   */
  private scheduleToSessionPlan(
    schedule: AnnealingSchedule,
    intention: ConsciousnessState,
    profile: MAIAConsciousnessProfile
  ): SessionPlan {
    const sessionPhases: SessionPhase[] = schedule.phases.map((p) => ({
      state: p.state,
      durationMinutes: p.duration,
      purpose: p.purpose,
    }));

    // Build pathway (list of states)
    const pathway = [...new Set(sessionPhases.map((p) => p.state))];

    // Safety protocols
    const safety = {
      prerequisites: this.generatePrerequisites(schedule, profile),
      warnings: this.generateWarnings(schedule, profile),
      emergencyProtocols: {
        overwhelmDetected: {
          action: 'emergency_cool_down',
          message: 'Topological overwhelm detected. Gradually reducing intensity.',
          sound: 'gentle_chime',
          light: 'warm_amber',
          haptic: 'slow_pulse',
          fadeDuration: 60, // 1 minute gentle fade
        },
        userStop: {
          action: 'immediate_integration',
          message: 'Session stopped. Entering integration phase.',
          sound: 'completion_bell',
          light: 'soft_white',
          fadeDuration: 30,
        },
      },
    };

    // MAIA integration data
    const maiaIntegration = {
      bloomLevel: profile.currentBloomLevel,
      spiralPhase: profile.spiralPhase,
      element: profile.primaryElement,
      reflectionPrompts: this.generateReflectionPrompts(schedule, profile),
    };

    return {
      userId: profile.userId,
      timestamp: new Date().toISOString(),
      intention,
      pathway,
      durationMinutes: schedule.totalDuration,
      intensity: schedule.peakTemperature,
      phases: sessionPhases,
      safety,
      maiaIntegration,
    };
  }

  /**
   * Generate prerequisites based on schedule difficulty
   */
  private generatePrerequisites(
    schedule: AnnealingSchedule,
    profile: MAIAConsciousnessProfile
  ): string[] {
    const prereqs: string[] = [];

    if (schedule.peakTemperature > 0.7) {
      prereqs.push('Start with CALM to establish baseline coherence');
      prereqs.push('Ensure quiet, interruption-free environment');
    }

    if (schedule.peakTemperature > 0.8) {
      prereqs.push('Have completed at least 3 successful DEPTH sessions');
      prereqs.push('Cognitive stability confirmed (Bloom variance < 0.5)');
    }

    if (profile.cognitiveBypassing.spiritual > 0.4) {
      prereqs.push('Review grounding techniques before session');
    }

    return prereqs;
  }

  /**
   * Generate warnings based on risk factors
   */
  private generateWarnings(
    schedule: AnnealingSchedule,
    profile: MAIAConsciousnessProfile
  ): string[] {
    const warnings: string[] = [];

    if (schedule.qualityScore < 0.7) {
      warnings.push('⚠️ Annealing schedule quality below optimal - session may feel intense');
    }

    if (schedule.peakTemperature > 0.8 && profile.avgBloomLevel < 5) {
      warnings.push(
        '⚠️ High intensity for current developmental level - consider stepping down to DEPTH'
      );
    }

    const recentOverwhelm = profile.sessionHistory
      .slice(0, 3)
      .some((s) => s.overwhelmDetected);

    if (recentOverwhelm) {
      warnings.push(
        '⚠️ Overwhelm detected in recent sessions - this session uses gentler gradients'
      );
    }

    return warnings;
  }

  /**
   * Generate MAIA reflection prompts based on session design
   */
  private generateReflectionPrompts(
    schedule: AnnealingSchedule,
    profile: MAIAConsciousnessProfile
  ): string[] {
    const prompts: string[] = [];

    // Always include basic prompts
    prompts.push('What temperature did your consciousness reach? (metaphorically speaking)');
    prompts.push('Describe the quality of the heating and cooling phases.');

    if (schedule.peakTemperature > 0.7) {
      prompts.push('Did you encounter any topological defects (phase vortices, fragmentations)?');
      prompts.push('If so, did they annihilate or proliferate?');
    }

    if (schedule.peakTemperature > 0.8) {
      prompts.push('Did you experience global synchrony (oneness, unity)?');
      prompts.push('If yes, was there a moment of perfect symmetry where time stopped?');
    }

    // Elemental prompts
    const element = profile.primaryElement;
    if (element === 'water') {
      prompts.push('What emotional currents moved through you?');
    } else if (element === 'fire') {
      prompts.push('Where did you feel intensity or urgency?');
    } else if (element === 'earth') {
      prompts.push('What grounded you during the session?');
    } else if (element === 'air') {
      prompts.push('What insights or patterns emerged?');
    }

    return prompts;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate annealing schedule for safety
 */
export function validateAnnealingSchedule(schedule: AnnealingSchedule): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for thermal shock
  for (let i = 1; i < schedule.phases.length; i++) {
    const tempChange = Math.abs(
      schedule.phases[i].temperature - schedule.phases[i - 1].temperature
    );
    const timeForChange = schedule.phases[i].duration;
    const rate = tempChange / timeForChange;

    if (rate > MAX_HEATING_RATE && schedule.phases[i].temperature > schedule.phases[i - 1].temperature) {
      errors.push(
        `Phase ${i}: Heating too rapidly (${rate.toFixed(2)}/min > ${MAX_HEATING_RATE}/min)`
      );
    }

    if (rate > MAX_COOLING_RATE && schedule.phases[i].temperature < schedule.phases[i - 1].temperature) {
      errors.push(
        `Phase ${i}: Cooling too rapidly (${rate.toFixed(2)}/min > ${MAX_COOLING_RATE}/min)`
      );
    }
  }

  // Check for minimum duration
  for (let i = 0; i < schedule.phases.length; i++) {
    if (schedule.phases[i].duration < MIN_STATE_DURATION) {
      errors.push(
        `Phase ${i}: Duration too short (${schedule.phases[i].duration}min < ${MIN_STATE_DURATION}min)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Simulate annealing trajectory (for visualization)
 */
export function simulateAnnealingTrajectory(schedule: AnnealingSchedule): {
  time: number;
  temperature: number;
  state: ConsciousnessState;
}[] {
  const trajectory: { time: number; temperature: number; state: ConsciousnessState }[] = [];

  let cumulativeTime = 0;

  for (const phase of schedule.phases) {
    // Sample every minute
    const samples = Math.ceil(phase.duration);

    for (let i = 0; i <= samples; i++) {
      const t = cumulativeTime + (i / samples) * phase.duration;
      trajectory.push({
        time: t,
        temperature: phase.temperature,
        state: phase.state,
      });
    }

    cumulativeTime += phase.duration;
  }

  return trajectory;
}

// ============================================================================
// Export
// ============================================================================

export const annealingOptimizer = new AnnealingOptimizer();
