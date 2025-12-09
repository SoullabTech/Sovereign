/**
 * 🫁 Field Breathing Hook - Living Interface Foundation
 *
 * Creates an ambient breathing field that makes the entire MAIA interface
 * feel alive and responsive to natural rhythms. This is the foundational
 * layer that all other consciousness-responsive elements build upon.
 *
 * The interface itself becomes a living organism that breathes with:
 * - Heart rate variability (60-80 BPM)
 * - Natural breathing cycles (4-4-4-4, 4-7-8, box breathing)
 * - Circadian rhythms (dawn, day, dusk, night)
 * - Lunar cycles and seasonal awareness
 * - User's emotional field state
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Element, SpiralogicCell } from '@/lib/consciousness/spiralogic-core';

// ====================================================================
// BREATHING FIELD INTERFACES
// ====================================================================

export interface BreathingFieldState {
  // Core rhythms
  heartBeat: number;           // Current heart rate (BPM)
  breathCycle: BreathPhase;    // Current breathing phase
  breathRate: number;          // Breaths per minute (12-20 normal range)

  // Natural cycles
  circadianPhase: CircadianPhase;
  lunarPhase: number;          // 0-1 (new moon to full moon)
  seasonalEnergy: number;      // 0-1 (winter rest to summer peak)

  // Consciousness field
  dominantElement: Element;
  fieldIntensity: number;      // 0-1 (calm to intense)
  shadowActivity: number;      // 0-1 (integrated to emerging)
  creativeTension: number;     // 0-1 (stable to enantiodromia)

  // Interface breathing
  ambientPulse: number;        // Current ambient pulse strength
  fieldFrequency: number;      // Hz of field oscillation
  breathingSynchronized: boolean;
}

export interface BreathPattern {
  name: string;
  inhale: number;             // Seconds
  hold: number;               // Seconds
  exhale: number;             // Seconds
  pause: number;              // Seconds
  cycles: number;             // How many cycles
  elementalResonance: Element[];
}

export type BreathPhase = 'inhaling' | 'holding_in' | 'exhaling' | 'holding_out';
export type CircadianPhase = 'dawn' | 'morning' | 'day' | 'evening' | 'dusk' | 'night' | 'deep_night';

// ====================================================================
// BREATH PATTERNS LIBRARY
// ====================================================================

export const BREATH_PATTERNS: Record<string, BreathPattern> = {
  natural: {
    name: 'Natural Breathing',
    inhale: 4,
    hold: 0,
    exhale: 4,
    pause: 1,
    cycles: Infinity,
    elementalResonance: ['Air', 'Water']
  },
  box: {
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    cycles: Infinity,
    elementalResonance: ['Earth', 'Air']
  },
  fire_breath: {
    name: 'Fire Breath',
    inhale: 1,
    hold: 0,
    exhale: 1,
    pause: 0,
    cycles: 20,
    elementalResonance: ['Fire']
  },
  deep_calm: {
    name: 'Deep Calm',
    inhale: 4,
    hold: 7,
    exhale: 8,
    pause: 2,
    cycles: Infinity,
    elementalResonance: ['Water', 'Earth']
  },
  creative_activation: {
    name: 'Creative Activation',
    inhale: 6,
    hold: 2,
    exhale: 4,
    pause: 1,
    cycles: Infinity,
    elementalResonance: ['Fire', 'Air']
  }
};

// ====================================================================
// FIELD BREATHING HOOK
// ====================================================================

export function useFieldBreathing(
  currentPhase?: SpiralogicCell,
  userBreathingPattern?: string
) {
  const [breathingState, setBreathingState] = useState<BreathingFieldState>({
    heartBeat: 72,
    breathCycle: 'inhaling',
    breathRate: 16,
    circadianPhase: getCircadianPhase(),
    lunarPhase: getLunarPhase(),
    seasonalEnergy: getSeasonalEnergy(),
    dominantElement: currentPhase?.element || 'Air',
    fieldIntensity: 0.3,
    shadowActivity: 0.2,
    creativeTension: 0.1,
    ambientPulse: 0.5,
    fieldFrequency: 0.2,
    breathingSynchronized: true
  });

  const breathPatternRef = useRef(userBreathingPattern || 'natural');
  const cycleStartTime = useRef(Date.now());
  const animationFrame = useRef<number>();

  // ====================================================================
  // CORE BREATHING CYCLE MANAGEMENT
  // ====================================================================

  const updateBreathingCycle = useCallback(() => {
    const now = Date.now();
    const pattern = BREATH_PATTERNS[breathPatternRef.current];
    const cycleTime = now - cycleStartTime.current;

    const totalCycleLength = (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause) * 1000;
    const cycleProgress = (cycleTime % totalCycleLength) / totalCycleLength;

    // Determine current breath phase
    let currentPhase: BreathPhase;
    let phaseProgress: number;

    const inhaleEnd = pattern.inhale / (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause);
    const holdEnd = (pattern.inhale + pattern.hold) / (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause);
    const exhaleEnd = (pattern.inhale + pattern.hold + pattern.exhale) / (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause);

    if (cycleProgress < inhaleEnd) {
      currentPhase = 'inhaling';
      phaseProgress = cycleProgress / inhaleEnd;
    } else if (cycleProgress < holdEnd) {
      currentPhase = 'holding_in';
      phaseProgress = (cycleProgress - inhaleEnd) / (holdEnd - inhaleEnd);
    } else if (cycleProgress < exhaleEnd) {
      currentPhase = 'exhaling';
      phaseProgress = (cycleProgress - holdEnd) / (exhaleEnd - holdEnd);
    } else {
      currentPhase = 'holding_out';
      phaseProgress = (cycleProgress - exhaleEnd) / (1 - exhaleEnd);
    }

    // Generate ambient pulse based on breathing
    const ambientPulse = generateAmbientPulse(currentPhase, phaseProgress, breathingState);

    setBreathingState(prev => ({
      ...prev,
      breathCycle: currentPhase,
      ambientPulse,
      fieldFrequency: calculateFieldFrequency(prev)
    }));

    // Schedule next update
    animationFrame.current = requestAnimationFrame(updateBreathingCycle);
  }, [breathingState]);

  // ====================================================================
  // AMBIENT FIELD CALCULATIONS
  // ====================================================================

  const generateAmbientPulse = useCallback((
    phase: BreathPhase,
    progress: number,
    state: BreathingFieldState
  ): number => {
    let basePulse = 0.5;

    // Breathing influence
    switch (phase) {
      case 'inhaling':
        basePulse = 0.3 + (progress * 0.4); // 0.3 → 0.7
        break;
      case 'holding_in':
        basePulse = 0.7 + (Math.sin(progress * Math.PI * 4) * 0.1); // Gentle oscillation
        break;
      case 'exhaling':
        basePulse = 0.7 - (progress * 0.4); // 0.7 → 0.3
        break;
      case 'holding_out':
        basePulse = 0.3 + (Math.sin(progress * Math.PI * 2) * 0.1); // Gentle oscillation
        break;
    }

    // Elemental influence
    const elementalMultiplier = getElementalPulseMultiplier(state.dominantElement);
    basePulse *= elementalMultiplier;

    // Circadian influence
    const circadianMultiplier = getCircadianPulseMultiplier(state.circadianPhase);
    basePulse *= circadianMultiplier;

    // Field state influence
    const fieldInfluence =
      (state.fieldIntensity * 0.3) +
      (state.shadowActivity * 0.2) +
      (state.creativeTension * 0.1);

    return Math.max(0.1, Math.min(1.0, basePulse + fieldInfluence));
  }, []);

  const calculateFieldFrequency = useCallback((state: BreathingFieldState): number => {
    const baseFreq = 60 / state.heartBeat; // Heart rate in Hz

    // Elemental modification
    let elementalMod = 1.0;
    switch (state.dominantElement) {
      case 'Fire': elementalMod = 1.3; break;
      case 'Water': elementalMod = 0.8; break;
      case 'Earth': elementalMod = 0.6; break;
      case 'Air': elementalMod = 1.1; break;
    }

    return baseFreq * elementalMod * (0.8 + state.fieldIntensity * 0.4);
  }, []);

  // ====================================================================
  // CONSCIOUSNESS FIELD UPDATES
  // ====================================================================

  const updateFieldFromPhase = useCallback((phase: SpiralogicCell) => {
    setBreathingState(prev => {
      const newIntensity = calculateIntensityFromPhase(phase);
      const newShadowActivity = calculateShadowActivity(phase);
      const newCreativeTension = calculateCreativeTension(phase);

      return {
        ...prev,
        dominantElement: phase.element,
        fieldIntensity: newIntensity,
        shadowActivity: newShadowActivity,
        creativeTension: newCreativeTension
      };
    });
  }, []);

  // ====================================================================
  // NATURAL CYCLE AWARENESS
  // ====================================================================

  const updateNaturalCycles = useCallback(() => {
    const newCircadianPhase = getCircadianPhase();
    const newLunarPhase = getLunarPhase();
    const newSeasonalEnergy = getSeasonalEnergy();

    setBreathingState(prev => ({
      ...prev,
      circadianPhase: newCircadianPhase,
      lunarPhase: newLunarPhase,
      seasonalEnergy: newSeasonalEnergy,
      heartBeat: calculateNaturalHeartRate(newCircadianPhase, prev.fieldIntensity)
    }));
  }, []);

  // ====================================================================
  // LIFECYCLE MANAGEMENT
  // ====================================================================

  useEffect(() => {
    // Start breathing cycle
    cycleStartTime.current = Date.now();
    updateBreathingCycle();

    // Update natural cycles every minute
    const naturalCycleInterval = setInterval(updateNaturalCycles, 60000);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      clearInterval(naturalCycleInterval);
    };
  }, [updateBreathingCycle, updateNaturalCycles]);

  // Update when consciousness phase changes
  useEffect(() => {
    if (currentPhase) {
      updateFieldFromPhase(currentPhase);
    }
  }, [currentPhase, updateFieldFromPhase]);

  // Update breathing pattern
  useEffect(() => {
    if (userBreathingPattern && BREATH_PATTERNS[userBreathingPattern]) {
      breathPatternRef.current = userBreathingPattern;
      cycleStartTime.current = Date.now(); // Reset cycle
    }
  }, [userBreathingPattern]);

  // ====================================================================
  // PUBLIC INTERFACE
  // ====================================================================

  const setBreathingPattern = useCallback((patternName: string) => {
    if (BREATH_PATTERNS[patternName]) {
      breathPatternRef.current = patternName;
      cycleStartTime.current = Date.now();
    }
  }, []);

  const syncToUserBreath = useCallback(() => {
    cycleStartTime.current = Date.now();
    setBreathingState(prev => ({
      ...prev,
      breathingSynchronized: true
    }));
  }, []);

  const getBreathingCSS = useCallback(() => {
    const { ambientPulse, fieldFrequency, dominantElement } = breathingState;

    return {
      '--ambient-pulse': ambientPulse.toString(),
      '--field-frequency': `${fieldFrequency}s`,
      '--elemental-hue': getElementalHue(dominantElement),
      '--breathing-scale': (0.98 + ambientPulse * 0.04).toString(),
      '--breathing-opacity': (0.85 + ambientPulse * 0.15).toString()
    } as React.CSSProperties;
  }, [breathingState]);

  return {
    breathingState,
    breathingPattern: breathPatternRef.current,
    setBreathingPattern,
    syncToUserBreath,
    getBreathingCSS,
    availablePatterns: Object.keys(BREATH_PATTERNS)
  };
}

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

function getCircadianPhase(): CircadianPhase {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'evening';
  if (hour >= 19 && hour < 21) return 'dusk';
  if (hour >= 21 || hour < 2) return 'night';
  return 'deep_night';
}

function getLunarPhase(): number {
  // Simplified lunar phase calculation (0 = new moon, 1 = full moon)
  const lunarCycle = 29.53; // days
  const knownNewMoon = new Date('2024-01-11').getTime(); // Known new moon
  const now = Date.now();
  const daysSinceNewMoon = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = (daysSinceNewMoon % lunarCycle) / lunarCycle;
  return Math.abs(0.5 - phase) * 2; // 0 at new/full, 1 at quarters
}

function getSeasonalEnergy(): number {
  // 0 = winter solstice (rest), 1 = summer solstice (peak energy)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const seasonalCycle = Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2);
  return (seasonalCycle + 1) / 2; // Normalize to 0-1
}

function calculateIntensityFromPhase(phase: SpiralogicCell): number {
  const baseIntensity = phase.phase === 2 ? 0.8 : phase.phase === 1 ? 0.4 : 0.6;
  const elementalMod = phase.element === 'Fire' ? 0.2 : phase.element === 'Water' ? -0.1 : 0;
  return Math.max(0.1, Math.min(1.0, baseIntensity + elementalMod));
}

function calculateShadowActivity(phase: SpiralogicCell): number {
  // Water-2 (shadow work) has high shadow activity
  if (phase.element === 'Water' && phase.phase === 2) return 0.9;
  if (phase.element === 'Water') return 0.5;
  if (phase.phase === 2) return 0.4; // All phase 2 has some shadow
  return 0.2;
}

function calculateCreativeTension(phase: SpiralogicCell): number {
  // Fire-1 and Air-3 tend to have high creative tension
  if (phase.element === 'Fire' && phase.phase === 1) return 0.8;
  if (phase.element === 'Air' && phase.phase === 3) return 0.7;
  return 0.3;
}

function getElementalPulseMultiplier(element: Element): number {
  switch (element) {
    case 'Fire': return 1.2;
    case 'Water': return 0.9;
    case 'Earth': return 0.8;
    case 'Air': return 1.1;
    default: return 1.0;
  }
}

function getCircadianPulseMultiplier(phase: CircadianPhase): number {
  switch (phase) {
    case 'dawn': return 1.1;
    case 'morning': return 1.2;
    case 'day': return 1.0;
    case 'evening': return 0.9;
    case 'dusk': return 0.8;
    case 'night': return 0.7;
    case 'deep_night': return 0.6;
    default: return 1.0;
  }
}

function calculateNaturalHeartRate(phase: CircadianPhase, intensity: number): number {
  let baseRate = 70;

  switch (phase) {
    case 'dawn': baseRate = 65; break;
    case 'morning': baseRate = 72; break;
    case 'day': baseRate = 75; break;
    case 'evening': baseRate = 70; break;
    case 'dusk': baseRate = 68; break;
    case 'night': baseRate = 65; break;
    case 'deep_night': baseRate = 60; break;
  }

  return baseRate + (intensity * 15); // Intensity can add up to 15 BPM
}

function getElementalHue(element: Element): string {
  switch (element) {
    case 'Fire': return '15'; // Red-orange
    case 'Water': return '210'; // Blue
    case 'Earth': return '120'; // Green
    case 'Air': return '200'; // Light blue
    default: return '180';
  }
}