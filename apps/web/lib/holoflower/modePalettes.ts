/**
 * MAIA Holoflower V3 - Mode Palette System
 * Layer 1: Communication Mode Intelligence
 *
 * Each mode defines the "world tone" - the foundational gradient and bloom behavior
 * that sets the entire scene for MAIA's consciousness expression.
 */

export interface ModePalette {
  name: string;
  baseGradient: [string, string, string]; // 3-color gradient system
  bloomStyle: 'warm-expansion' | 'rhythmic-wave' | 'tight-pulse' | 'subtle-halo';
  motionPattern: 'responsive-breath' | 'deep-breath-cycle' | 'micro-breath' | 'almost-none';
  cssVariables: Record<string, string>;
}

export const ModePalettes: Record<string, ModePalette> = {
  dialogue: {
    name: 'Dialogue',
    baseGradient: ['#FFD700', '#FFA07A', '#E6E6FA'], // gold → rose-gold → vapor blue
    bloomStyle: 'warm-expansion',
    motionPattern: 'responsive-breath',
    cssVariables: {
      '--mode-primary': '#FFD700',    // gold
      '--mode-secondary': '#FFA07A',  // rose-gold
      '--mode-tertiary': '#E6E6FA',   // vapor blue
      '--mode-bloom-intensity': '0.8',
      '--mode-breath-speed': '4s',
      '--mode-expansion-scale': '1.2'
    }
  },

  patient: {
    name: 'Patient',
    baseGradient: ['#4682B4', '#20B2AA', '#008B8B'], // lunar blue → seafoam → teal
    bloomStyle: 'rhythmic-wave',
    motionPattern: 'deep-breath-cycle',
    cssVariables: {
      '--mode-primary': '#4682B4',    // lunar blue
      '--mode-secondary': '#20B2AA',  // seafoam
      '--mode-tertiary': '#008B8B',   // teal
      '--mode-bloom-intensity': '0.6',
      '--mode-breath-speed': '8s',
      '--mode-wave-amplitude': '1.15'
    }
  },

  scribe: {
    name: 'Scribe',
    baseGradient: ['#C0C0C0', '#FFFFFF', '#2F4F4F'], // silver → white → graphite
    bloomStyle: 'tight-pulse',
    motionPattern: 'micro-breath',
    cssVariables: {
      '--mode-primary': '#C0C0C0',    // silver
      '--mode-secondary': '#FFFFFF',  // white
      '--mode-tertiary': '#2F4F4F',   // graphite
      '--mode-bloom-intensity': '0.4',
      '--mode-breath-speed': '2s',
      '--mode-pulse-scale': '1.05'
    }
  },

  aether: {
    name: 'Aether',
    baseGradient: ['#8A2BE2', '#FFFFFF', '#4B0082'], // violet → white → indigo
    bloomStyle: 'subtle-halo',
    motionPattern: 'almost-none',
    cssVariables: {
      '--mode-primary': '#8A2BE2',    // violet
      '--mode-secondary': '#FFFFFF',  // white
      '--mode-tertiary': '#4B0082',   // indigo
      '--mode-bloom-intensity': '0.3',
      '--mode-breath-speed': '12s',
      '--mode-halo-glow': '0.2'
    }
  }
};

/**
 * Mode Detection System
 * Analyzes MAIA's communication context to determine appropriate mode
 */
export type CommunicationMode = 'dialogue' | 'patient' | 'scribe' | 'aether';

export function detectCommunicationMode(context: {
  isListening?: boolean;
  isProcessing?: boolean;
  messageType?: 'collaborative' | 'therapeutic' | 'analytical' | 'contemplative';
  silenceLevel?: number;
}): CommunicationMode {
  const { isListening, messageType, silenceLevel = 0 } = context;

  // Deep silence indicates Aether mode
  if (silenceLevel > 0.8) return 'aether';

  // Listening state with high silence suggests Patient mode
  if (isListening && silenceLevel > 0.4) return 'patient';

  // Message type analysis
  if (messageType) {
    switch (messageType) {
      case 'collaborative': return 'dialogue';
      case 'therapeutic': return 'patient';
      case 'analytical': return 'scribe';
      case 'contemplative': return 'aether';
    }
  }

  // Default to dialogue for active conversation
  return 'dialogue';
}

/**
 * Mode Transition System
 * Handles smooth transitions between consciousness modes
 */
export interface ModeTransition {
  from: CommunicationMode;
  to: CommunicationMode;
  duration: number; // milliseconds
  easing: string;
}

export function calculateModeTransition(
  from: CommunicationMode,
  to: CommunicationMode
): ModeTransition {
  // Longer transitions for greater consciousness shifts
  const transitionMatrix: Record<CommunicationMode, Record<CommunicationMode, number>> = {
    dialogue: { dialogue: 0, patient: 2000, scribe: 1500, aether: 3000 },
    patient: { dialogue: 2000, patient: 0, scribe: 2500, aether: 1500 },
    scribe: { dialogue: 1500, patient: 2500, scribe: 0, aether: 2000 },
    aether: { dialogue: 3000, patient: 1500, scribe: 2000, aether: 0 }
  };

  return {
    from,
    to,
    duration: transitionMatrix[from][to],
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' // Material Design easing
  };
}