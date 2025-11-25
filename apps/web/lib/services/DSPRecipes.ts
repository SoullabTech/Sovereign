/**
 * Concrete DSP Recipes for Voice Masks
 * Prioritizing perceptibility over perfection
 * All values are production-ready and tested for distinctiveness
 */

export interface DSPRecipe {
  // IMMEDIATE (OpenAI native)
  openai: {
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed: number; // 0.25-4.0
  };

  // PHASE 1: Basic DSP (ffmpeg/sox compatible)
  basic: {
    pitch: number; // semitones (-12 to +12)
    tempo: number; // multiplier (0.5-2.0)
    volume: number; // dB (-20 to +10)
  };

  // PHASE 2: EQ Profile (5-band parametric)
  eq: {
    hz_60: number;   // Sub bass (-12 to +12 dB)
    hz_250: number;  // Bass/warmth
    hz_1k: number;   // Presence/body
    hz_4k: number;   // Clarity/edge
    hz_12k: number;  // Air/sparkle
  };

  // PHASE 3: Spatial Effects
  spatial: {
    reverb: {
      type: string;
      roomSize: number; // 0-100
      damping: number; // 0-100 (high freq absorption)
      wetLevel: number; // 0-100 (dry/wet mix)
      preDelay: number; // ms (0-200)
    };
    delay?: {
      time: number; // ms
      feedback: number; // 0-1
      mix: number; // 0-1
    };
  };

  // PHASE 4: Character Effects
  character: {
    breathiness: number; // 0-1 (noise gate + high freq boost)
    warmth: number; // 0-1 (tube saturation simulation)
    crispness: number; // 0-1 (transient shaping)
    smoothness: number; // 0-1 (compression ratio)
  };

  // Perceptual description
  signature: string;
}

export const ELEMENTAL_DSP_RECIPES: Record<string, DSPRecipe> = {
  // 🔥 FIRE - Sharp, bright, energetic
  'element-fire': {
    openai: { voice: 'nova', speed: 1.15 },
    basic: {
      pitch: +2, // Slightly higher
      tempo: 1.08,
      volume: +3 // More present
    },
    eq: {
      hz_60: -6,   // Less rumble
      hz_250: -2,  // Slightly less body
      hz_1k: +3,   // More presence
      hz_4k: +6,   // Sharp clarity
      hz_12k: +4   // Bright sparkle
    },
    spatial: {
      reverb: {
        type: 'bright-room',
        roomSize: 25,
        damping: 20, // Less absorption = brighter
        wetLevel: 15,
        preDelay: 10
      }
    },
    character: {
      breathiness: 0.1,
      warmth: 0.2,
      crispness: 0.9, // Very crisp
      smoothness: 0.3
    },
    signature: 'Bright, energetic, sharp edges, minimal reverb'
  },

  // 💧 WATER - Deep, flowing, emotional
  'element-water': {
    openai: { voice: 'shimmer', speed: 0.85 },
    basic: {
      pitch: -4, // Deeper
      tempo: 0.92,
      volume: 0
    },
    eq: {
      hz_60: +4,   // Deep undertones
      hz_250: +6,  // Warm body
      hz_1k: -2,   // Softer presence
      hz_4k: -6,   // Muted clarity
      hz_12k: -8   // No harshness
    },
    spatial: {
      reverb: {
        type: 'underwater-cave',
        roomSize: 85,
        damping: 70, // High absorption
        wetLevel: 45, // Very wet
        preDelay: 80
      },
      delay: {
        time: 150,
        feedback: 0.3,
        mix: 0.2
      }
    },
    character: {
      breathiness: 0.4,
      warmth: 0.8,
      crispness: 0.2,
      smoothness: 0.9 // Very smooth
    },
    signature: 'Deep, warm, flowing, heavy reverb tail'
  },

  // 🌍 EARTH - Grounded, steady, solid
  'element-earth': {
    openai: { voice: 'onyx', speed: 0.82 },
    basic: {
      pitch: -6, // Much deeper
      tempo: 0.88,
      volume: +2
    },
    eq: {
      hz_60: +8,   // Strong foundation
      hz_250: +6,  // Full body
      hz_1k: +2,   // Present
      hz_4k: -2,   // Slightly muted
      hz_12k: -6   // No air
    },
    spatial: {
      reverb: {
        type: 'small-studio',
        roomSize: 15,
        damping: 50,
        wetLevel: 8, // Very dry
        preDelay: 5
      }
    },
    character: {
      breathiness: 0,
      warmth: 0.6,
      crispness: 0.5,
      smoothness: 0.7
    },
    signature: 'Deep, dry, steady, minimal effects'
  },

  // 💨 AIR - Light, quick, ethereal
  'element-air': {
    openai: { voice: 'alloy', speed: 1.1 },
    basic: {
      pitch: +4, // Higher
      tempo: 1.05,
      volume: -2 // Lighter presence
    },
    eq: {
      hz_60: -10,  // No bass
      hz_250: -4,  // Light body
      hz_1k: 0,    // Neutral
      hz_4k: +4,   // Clear
      hz_12k: +8   // Lots of air
    },
    spatial: {
      reverb: {
        type: 'open-space',
        roomSize: 60,
        damping: 30,
        wetLevel: 35,
        preDelay: 40
      },
      delay: {
        time: 80,
        feedback: 0.15,
        mix: 0.15
      }
    },
    character: {
      breathiness: 0.6, // Very breathy
      warmth: 0.2,
      crispness: 0.7,
      smoothness: 0.4
    },
    signature: 'Light, airy, ethereal, floating quality'
  },

  // ✨ AETHER - Mystical, shimmering, otherworldly
  'element-aether': {
    openai: { voice: 'echo', speed: 0.95 },
    basic: {
      pitch: +1,
      tempo: 0.95,
      volume: 0
    },
    eq: {
      hz_60: -4,
      hz_250: +2,
      hz_1k: +4,    // Mystical presence
      hz_4k: +2,
      hz_12k: +6    // Shimmer
    },
    spatial: {
      reverb: {
        type: 'cathedral',
        roomSize: 95,
        damping: 40,
        wetLevel: 50,
        preDelay: 100
      },
      delay: {
        time: 333, // Mystical timing
        feedback: 0.25,
        mix: 0.3
      }
    },
    character: {
      breathiness: 0.3,
      warmth: 0.5,
      crispness: 0.6,
      smoothness: 0.8
    },
    signature: 'Mystical, shimmering, cathedral reverb, slight modulation'
  },

  // 🌑 SHADOW - Dark, whispered, intimate
  'element-shadow': {
    openai: { voice: 'onyx', speed: 0.75 },
    basic: {
      pitch: -8, // Very deep
      tempo: 0.85,
      volume: -5 // Quieter, intimate
    },
    eq: {
      hz_60: +2,
      hz_250: +4,
      hz_1k: -4,    // Recessed
      hz_4k: -8,    // Dark
      hz_12k: -12   // No brightness
    },
    spatial: {
      reverb: {
        type: 'close-room',
        roomSize: 10,
        damping: 80,
        wetLevel: 20,
        preDelay: 2
      }
    },
    character: {
      breathiness: 0.8, // Very breathy/whispered
      warmth: 0.7,
      crispness: 0.1,
      smoothness: 0.9
    },
    signature: 'Dark, intimate, whispered, heavy low-pass filter'
  }
};

// SPECIFIC MAYA MASK RECIPES
export const MAYA_MASK_DSP_RECIPES: Record<string, DSPRecipe> = {
  'maya-threshold': {
    openai: { voice: 'nova', speed: 1.02 },
    basic: {
      pitch: 0,
      tempo: 1.0,
      volume: +2
    },
    eq: {
      hz_60: -4,
      hz_250: 0,
      hz_1k: +3,    // Clear presence
      hz_4k: +4,    // Alert clarity
      hz_12k: +2
    },
    spatial: {
      reverb: {
        type: 'doorway', // Liminal space
        roomSize: 30,
        damping: 35,
        wetLevel: 18,
        preDelay: 15
      }
    },
    character: {
      breathiness: 0.2,
      warmth: 0.5,
      crispness: 0.8, // Very clear
      smoothness: 0.6
    },
    signature: 'Clear guide at the edge - alert but inviting'
  },

  'maya-deep-waters': {
    openai: { voice: 'shimmer', speed: 0.88 },
    basic: {
      pitch: -3,
      tempo: 0.92,
      volume: +1
    },
    eq: {
      hz_60: +6,    // Ocean depths
      hz_250: +8,   // Maternal warmth
      hz_1k: +2,
      hz_4k: -4,    // Softer
      hz_12k: -6
    },
    spatial: {
      reverb: {
        type: 'underwater-temple',
        roomSize: 75,
        damping: 65,
        wetLevel: 40,
        preDelay: 60
      },
      delay: {
        time: 200,
        feedback: 0.35,
        mix: 0.25
      }
    },
    character: {
      breathiness: 0.35,
      warmth: 0.85, // Very warm
      crispness: 0.3,
      smoothness: 0.9
    },
    signature: 'Oceanic mother - deep compassion and shadow holding'
  },

  'maya-spiral': {
    openai: { voice: 'alloy', speed: 0.95 },
    basic: {
      pitch: +1,
      tempo: 0.97,
      volume: 0
    },
    eq: {
      hz_60: -2,
      hz_250: +3,
      hz_1k: +5,    // Hypnotic presence
      hz_4k: +1,
      hz_12k: +3
    },
    spatial: {
      reverb: {
        type: 'spiral-chamber',
        roomSize: 50,
        damping: 45,
        wetLevel: 30,
        preDelay: 33
      },
      delay: {
        time: 375, // Golden ratio timing
        feedback: 0.382, // Fibonacci
        mix: 0.236
      }
    },
    character: {
      breathiness: 0.25,
      warmth: 0.6,
      crispness: 0.7,
      smoothness: 0.75
    },
    signature: 'Hypnotic integration - cyclical and transformative'
  }
};

// Helper: Get complete recipe for a mask
export function getCompleteRecipe(maskId: string): DSPRecipe | null {
  // Check specific masks first
  if (MAYA_MASK_DSP_RECIPES[maskId]) {
    return MAYA_MASK_DSP_RECIPES[maskId];
  }

  // Check elemental recipes
  const elementalKey = maskId.split('-').pop();
  if (elementalKey && ELEMENTAL_DSP_RECIPES[`element-${elementalKey}`]) {
    return ELEMENTAL_DSP_RECIPES[`element-${elementalKey}`];
  }

  return null;
}

// Helper: Get ffmpeg command for basic DSP
export function getFFmpegCommand(recipe: DSPRecipe): string {
  const { basic, eq } = recipe;

  const filters = [
    `asetrate=44100*${basic.tempo}`, // Tempo change
    `aresample=44100`, // Resample back
    `pitch=shift=${basic.pitch}`, // Pitch shift
    `volume=${basic.volume}dB`, // Volume adjust
    // EQ bands
    `equalizer=f=60:g=${eq.hz_60}:t=o:w=0.5`,
    `equalizer=f=250:g=${eq.hz_250}:t=o:w=0.7`,
    `equalizer=f=1000:g=${eq.hz_1k}:t=o:w=1`,
    `equalizer=f=4000:g=${eq.hz_4k}:t=o:w=0.8`,
    `equalizer=f=12000:g=${eq.hz_12k}:t=o:w=0.6`
  ];

  return filters.join(',');
}

// Helper: Latency-aware processing decision
export function shouldProcessRealtime(maskId: string): boolean {
  const recipe = getCompleteRecipe(maskId);
  if (!recipe) return true; // No processing needed

  // Only do realtime for simple recipes
  const isSimple =
    Math.abs(recipe.basic.pitch) <= 4 &&
    recipe.spatial.reverb.wetLevel <= 20;

  return isSimple;
}