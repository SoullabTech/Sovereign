// Motion State Schema: Embodied feedback through rhythm and resonance
// McGilchrist's right-hemisphere primacy - attention over abstraction

export type CoherenceLevel = "low" | "medium" | "high" | "breakthrough";
export type EmotionalTone = "calm" | "intense" | "reflective" | "expansive" | "contracted";
export type BreathingPattern = "shallow" | "steady" | "deep" | "held" | "released";

export interface MotionState {
  // Core resonance
  coherence: CoherenceLevel;
  coherenceValue: number; // 0-1 for smooth transitions
  
  // Shadow dynamics
  shadowPetals: string[];        // Dimmed/blurred petals
  shadowIntensity: number;       // 0-1, affects blur amount
  
  // Transcendent states
  aetherStage?: 1 | 2 | 3;      // Expansive, Contractive, Stillness
  aetherIntensity?: number;      // 0-1, center pulse strength
  
  // Voice synchronization
  voiceSync?: {
    amplitude: number;          // 0-1, breathing depth
    tempo: number;              // BPM, rhythm pace
    emotion: EmotionalTone;
    pattern: BreathingPattern;
  };
  
  // Elemental flows
  elementalCurrent: {
    primary: "fire" | "water" | "earth" | "air" | "aether";
    secondary?: "fire" | "water" | "earth" | "air";
    transition: boolean;        // True during element shifts
  };
  
  // Motion qualities
  animation: {
    pulseSpeed: number;         // Seconds per cycle
    pulseIntensity: number;     // Scale multiplier
    jitter: number;             // Chaos/uncertainty (0-1)
    glow: number;               // Luminosity (0-1)
    ripple: boolean;            // Outward waves on breakthrough
  };
  
  // Temporal dynamics
  momentum: "accelerating" | "steady" | "decelerating" | "paused";
  phase: "inhale" | "hold" | "exhale" | "pause";
}

// Motion presets for different states
export const MOTION_PRESETS: Record<CoherenceLevel, Partial<MotionState['animation']>> = {
  low: {
    pulseSpeed: 6,
    pulseIntensity: 1.02,
    jitter: 0.3,
    glow: 0.3,
    ripple: false
  },
  medium: {
    pulseSpeed: 4,
    pulseIntensity: 1.05,
    jitter: 0.1,
    glow: 0.5,
    ripple: false
  },
  high: {
    pulseSpeed: 3,
    pulseIntensity: 1.08,
    jitter: 0,
    glow: 0.7,
    ripple: false
  },
  breakthrough: {
    pulseSpeed: 2,
    pulseIntensity: 1.15,
    jitter: 0,
    glow: 1,
    ripple: true
  }
};

// Emotional tone mappings for motion
export const EMOTION_MOTIONS: Record<EmotionalTone, Partial<MotionState['animation']>> = {
  calm: {
    pulseSpeed: 5,
    pulseIntensity: 1.03,
    jitter: 0
  },
  intense: {
    pulseSpeed: 2,
    pulseIntensity: 1.12,
    jitter: 0.2
  },
  reflective: {
    pulseSpeed: 6,
    pulseIntensity: 1.04,
    jitter: 0.05
  },
  expansive: {
    pulseSpeed: 4,
    pulseIntensity: 1.1,
    jitter: 0
  },
  contracted: {
    pulseSpeed: 7,
    pulseIntensity: 0.95,
    jitter: 0.1
  }
};

// Aether motion signatures
export const AETHER_MOTIONS = {
  1: { // Expansive
    pulseSpeed: 8,
    pulseIntensity: 1.2,
    glow: 0.9,
    description: "Vast breathing, dissolving boundaries"
  },
  2: { // Contractive
    pulseSpeed: 10,
    pulseIntensity: 0.9,
    glow: 0.4,
    description: "Drawing inward, witnessing pause"
  },
  3: { // Stillness
    pulseSpeed: 15,
    pulseIntensity: 1.0,
    glow: 0.6,
    description: "Perfect pause, zero point"
  }
};

// Calculate motion state from multiple inputs
export function calculateMotionState(
  coherenceValue: number,
  shadowPetals: string[],
  aetherDetected: boolean,
  voiceData?: any,
  elementalBalance?: Record<string, number>
): MotionState {
  // Determine coherence level
  let coherence: CoherenceLevel = "medium";
  if (coherenceValue < 0.3) coherence = "low";
  else if (coherenceValue > 0.9) coherence = "breakthrough";
  else if (coherenceValue > 0.6) coherence = "high";
  
  // Get primary element
  const primary = elementalBalance 
    ? Object.entries(elementalBalance).reduce((a, b) => a[1] > b[1] ? a : b)[0] as any
    : "fire";
  
  // Determine momentum based on recent changes
  const momentum = coherenceValue > 0.5 ? "accelerating" : 
                   coherenceValue < 0.3 ? "decelerating" : "steady";
  
  // Calculate animation parameters
  const baseAnimation = MOTION_PRESETS[coherence];
  const emotionModifier = voiceData?.emotion 
    ? EMOTION_MOTIONS[voiceData.emotion as EmotionalTone] 
    : {};
  
  return {
    coherence,
    coherenceValue,
    shadowPetals,
    shadowIntensity: shadowPetals.length / 12, // Ratio of shadowed petals
    aetherStage: aetherDetected ? 1 : undefined,
    aetherIntensity: aetherDetected ? 0.8 : undefined,
    voiceSync: voiceData,
    elementalCurrent: {
      primary,
      transition: false
    },
    animation: {
      ...baseAnimation,
      ...emotionModifier,
      pulseSpeed: baseAnimation?.pulseSpeed || 4,
      pulseIntensity: baseAnimation?.pulseIntensity || 1.05,
      jitter: baseAnimation?.jitter || 0.1,
      glow: baseAnimation?.glow || 0.5,
      ripple: baseAnimation?.ripple || false
    },
    momentum,
    phase: "inhale"
  };
}

// Smooth transition between motion states
export function interpolateMotionStates(
  current: MotionState,
  target: MotionState,
  factor: number = 0.1
): MotionState {
  return {
    ...target,
    coherenceValue: current.coherenceValue + (target.coherenceValue - current.coherenceValue) * factor,
    shadowIntensity: current.shadowIntensity + (target.shadowIntensity - current.shadowIntensity) * factor,
    animation: {
      ...target.animation,
      pulseSpeed: current.animation.pulseSpeed + (target.animation.pulseSpeed - current.animation.pulseSpeed) * factor,
      pulseIntensity: current.animation.pulseIntensity + (target.animation.pulseIntensity - current.animation.pulseIntensity) * factor,
      jitter: current.animation.jitter + (target.animation.jitter - current.animation.jitter) * factor,
      glow: current.animation.glow + (target.animation.glow - current.animation.glow) * factor
    }
  };
}