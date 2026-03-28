/**
 * Shared Breath Engine — Timing, phase logic, and visual state
 *
 * Used by: Regulation Minute, Breathwork, Coherence
 * Pure functions — no React, no side effects.
 */

// =============================================================================
// TYPES
// =============================================================================

export type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

export interface BreathCycleConfig {
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

export interface PhaseState {
  phase: BreathPhase;
  phaseElapsed: number;
  phaseDuration: number;
  /** 0-1 progress within the current phase */
  phaseProgress: number;
}

export interface BreathStep {
  phase: BreathPhase;
  seconds: number;
}

// =============================================================================
// SEQUENCE BUILDING
// =============================================================================

/** Build the active steps for a breath cycle (skipping zero-duration phases). */
export function getBreathSequence(config: BreathCycleConfig): BreathStep[] {
  const sequence: BreathStep[] = [];
  if (config.inhale > 0) sequence.push({ phase: 'inhale', seconds: config.inhale });
  if (config.holdIn > 0) sequence.push({ phase: 'holdIn', seconds: config.holdIn });
  if (config.exhale > 0) sequence.push({ phase: 'exhale', seconds: config.exhale });
  if (config.holdOut > 0) sequence.push({ phase: 'holdOut', seconds: config.holdOut });
  return sequence;
}

/** Total seconds for one complete breath cycle. */
export function getCycleLength(config: BreathCycleConfig): number {
  return config.inhale + config.holdIn + config.exhale + config.holdOut;
}

// =============================================================================
// PHASE RESOLUTION
// =============================================================================

/** Determine which phase is active at a given elapsed time. */
export function getPhaseAtSecond(
  config: BreathCycleConfig,
  elapsedSeconds: number,
): PhaseState {
  const sequence = getBreathSequence(config);
  const cycleLength = getCycleLength(config);

  if (cycleLength === 0 || sequence.length === 0) {
    return { phase: 'inhale', phaseElapsed: 0, phaseDuration: 1, phaseProgress: 0 };
  }

  const cycleSecond = elapsedSeconds % cycleLength;
  let cursor = 0;

  for (const step of sequence) {
    const nextCursor = cursor + step.seconds;
    if (cycleSecond < nextCursor) {
      const elapsed = cycleSecond - cursor;
      return {
        phase: step.phase,
        phaseElapsed: elapsed,
        phaseDuration: step.seconds,
        phaseProgress: elapsed / step.seconds,
      };
    }
    cursor = nextCursor;
  }

  // Fallback (shouldn't happen with correct math)
  const last = sequence[sequence.length - 1];
  return { phase: last.phase, phaseElapsed: 0, phaseDuration: last.seconds, phaseProgress: 0 };
}

/** Count completed breath cycles at a given elapsed time. */
export function getCompletedCycles(config: BreathCycleConfig, elapsedSeconds: number): number {
  const cycleLength = getCycleLength(config);
  if (cycleLength === 0) return 0;
  return Math.floor(elapsedSeconds / cycleLength);
}

// =============================================================================
// PHASE DISPLAY
// =============================================================================

/** User-facing prompt for each phase. */
export function getPhasePrompt(phase: BreathPhase): string {
  switch (phase) {
    case 'inhale': return 'Breathe in';
    case 'holdIn': return 'Hold';
    case 'exhale': return 'Breathe out';
    case 'holdOut': return 'Pause';
  }
}

/** Short format for protocol timing display (e.g., "4-7-8-0"). */
export function formatProtocolTiming(config: BreathCycleConfig): string {
  return `${config.inhale}-${config.holdIn}-${config.exhale}-${config.holdOut}`;
}

// =============================================================================
// ORB ANIMATION — visual breathing feedback
// =============================================================================

/** Calculate the visual scale for the breathing orb (0.6 → 1.0). */
export function getOrbScale(phase: BreathPhase, phaseProgress: number): number {
  switch (phase) {
    case 'inhale':  return 0.6 + 0.4 * phaseProgress;       // 0.6 → 1.0
    case 'holdIn':  return 1.0;                              // stay full
    case 'exhale':  return 1.0 - 0.4 * phaseProgress;       // 1.0 → 0.6
    case 'holdOut': return 0.6;                              // stay small
    default:        return 0.6;
  }
}

/** Calculate orb opacity for visual breathing feedback. */
export function getOrbOpacity(phase: BreathPhase, phaseProgress: number): number {
  switch (phase) {
    case 'inhale':  return 0.3 + 0.4 * phaseProgress;
    case 'holdIn':  return 0.7 + 0.1 * Math.sin(phaseProgress * Math.PI * 2);
    case 'exhale':  return 0.7 - 0.4 * phaseProgress;
    case 'holdOut': return 0.3;
    default:        return 0.3;
  }
}
