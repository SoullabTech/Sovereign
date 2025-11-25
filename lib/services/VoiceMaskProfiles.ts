export interface MaskAudioProfile {
  baseVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number; // OpenAI native param: 0.25-4.0
  pitch?: number; // For DSP processing: semitones
  reverb?: {
    type: 'small-room' | 'cathedral' | 'spiral-delay' | 'underwater';
    mix: number; // 0-1
    feedback?: number;
  };
  eq?: {
    lowShelf?: { freq: number; gain: number };
    highShelf?: { freq: number; gain: number };
    bandpass?: { freq: number; q: number };
  };
  breathiness?: number; // 0-1
  modulation?: {
    rate: number;
    depth: number;
  };
  description: string;
}

// Immediate differentiation through OpenAI params + planned DSP enhancements
export const VOICE_MASK_PROFILES: Record<string, MaskAudioProfile> = {
  // MAYA MASKS
  'maya-threshold': {
    baseVoice: 'nova',
    speed: 1.05, // Slightly faster - alert, present
    pitch: 0,
    reverb: {
      type: 'small-room',
      mix: 0.1
    },
    eq: {
      lowShelf: { freq: 200, gain: -2 },
      highShelf: { freq: 4000, gain: 3 } // Bright, clear
    },
    description: 'Clear liminal guide - bright and present at the edges'
  },

  'maya-deep-waters': {
    baseVoice: 'shimmer', // Use shimmer for more ethereal water quality
    speed: 0.88, // Slower - contemplative, deep
    pitch: -3,
    reverb: {
      type: 'underwater',
      mix: 0.35,
      feedback: 0.2
    },
    eq: {
      lowShelf: { freq: 300, gain: 4 }, // Deep resonance
      highShelf: { freq: 3000, gain: -3 } // Darker, warmer
    },
    breathiness: 0.15,
    description: 'Oceanic depth - maternal warmth and shadow work companion'
  },

  'maya-spiral': {
    baseVoice: 'alloy', // Balanced for transformation work
    speed: 0.95,
    pitch: 1,
    reverb: {
      type: 'spiral-delay',
      mix: 0.25,
      feedback: 0.3
    },
    eq: {
      bandpass: { freq: 1500, q: 0.7 } // Focused midrange
    },
    breathiness: 0.2,
    modulation: {
      rate: 0.3,
      depth: 0.1 // Subtle cyclical variation
    },
    description: 'Integration dance - hypnotic and transformative'
  },

  // MILES MASKS
  'miles-grounded': {
    baseVoice: 'onyx',
    speed: 0.85, // Deliberate, grounded pace
    pitch: -5,
    reverb: {
      type: 'small-room',
      mix: 0.05 // Minimal - direct presence
    },
    eq: {
      lowShelf: { freq: 400, gain: 5 }, // Earth resonance
      highShelf: { freq: 2500, gain: -2 }
    },
    description: 'Steady earth presence - solid foundation'
  },

  // SEASONAL/RITUAL MASKS (locked until conditions met)
  'maya-solstice': {
    baseVoice: 'echo',
    speed: 0.92,
    pitch: -1,
    reverb: {
      type: 'cathedral',
      mix: 0.4
    },
    modulation: {
      rate: 0.1,
      depth: 0.05 // Very slow, deep modulation
    },
    description: 'Winter solstice voice - ancient and timeless'
  },

  'maya-equinox': {
    baseVoice: 'fable',
    speed: 1.0,
    pitch: 0,
    reverb: {
      type: 'small-room',
      mix: 0.2
    },
    eq: {
      // Perfectly balanced EQ for equinox
      lowShelf: { freq: 250, gain: 0 },
      highShelf: { freq: 3500, gain: 0 }
    },
    description: 'Equinox balance - perfect equilibrium'
  }
};

// Helper to get OpenAI-compatible params (before DSP is ready)
export function getOpenAIParams(maskId: string) {
  const profile = VOICE_MASK_PROFILES[maskId];
  if (!profile) {
    return {
      voice: 'nova',
      speed: 1.0
    };
  }

  return {
    voice: profile.baseVoice,
    speed: Math.max(0.25, Math.min(4.0, profile.speed)) // Clamp to OpenAI limits
  };
}

// Check if mask requires post-processing (for when DSP is implemented)
export function requiresDSP(maskId: string): boolean {
  const profile = VOICE_MASK_PROFILES[maskId];
  if (!profile) return false;

  return !!(
    profile.pitch ||
    profile.reverb ||
    profile.eq ||
    profile.breathiness ||
    profile.modulation
  );
}

// Get processing priority for queue management
export function getProcessingComplexity(maskId: string): 'low' | 'medium' | 'high' {
  const profile = VOICE_MASK_PROFILES[maskId];
  if (!profile) return 'low';

  let complexity = 0;
  if (profile.pitch) complexity++;
  if (profile.reverb) complexity += 2;
  if (profile.eq) complexity += 2;
  if (profile.modulation) complexity += 3;

  if (complexity >= 5) return 'high';
  if (complexity >= 2) return 'medium';
  return 'low';
}