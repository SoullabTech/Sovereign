// Holoflower Motion States Engine
// Maps internal states (coherence, shadow, Aether) to visual motion language

export interface MotionState {
  ringPulse: 'jitter' | 'steady' | 'smooth' | 'still';
  petalGlow: 'flicker' | 'soft' | 'shimmer' | 'dimmed';
  centerEffect: 'expansive' | 'contractive' | 'stillness' | null;
  breakthrough: boolean;
  breathingRate: number; // seconds per cycle
  shadowPetals: string[]; // specific petals to dim
}

export interface AnimationConfig {
  // Ring animations
  ringAnimation: {
    scale: number[];
    opacity: number[];
    duration: number;
    ease: string;
  };
  // Petal animations
  petalAnimation: {
    opacity: number[];
    blur?: number;
    scale?: number[];
    duration: number;
  };
  // Center animations
  centerAnimation: {
    scale: number[];
    opacity: number[];
    blur?: number;
    duration: number;
  };
  // Breakthrough effect
  breakthroughAnimation?: {
    scale: number[];
    opacity: number[];
    duration: number;
  };
}

// ============================================
// Core Motion Mapping
// ============================================

export function getHoloflowerMotion(
  coherence: number,
  shadowFacets: string[] = [],
  aetherStage: number | null = null,
  isVoiceActive: boolean = false
): MotionState {
  let motion: MotionState = {
    ringPulse: 'steady',
    petalGlow: 'soft',
    centerEffect: null,
    breakthrough: false,
    breathingRate: 4,
    shadowPetals: shadowFacets
  };

  // Coherence mapping (0.0 to 1.0)
  if (coherence < 0.3) {
    // Low coherence: restless, jittery
    motion.ringPulse = 'jitter';
    motion.petalGlow = 'flicker';
    motion.breathingRate = 2.5; // faster, irregular
  } else if (coherence < 0.7) {
    // Medium coherence: balanced, steady
    motion.ringPulse = 'steady';
    motion.petalGlow = 'soft';
    motion.breathingRate = 4; // normal breathing
  } else {
    // High coherence: smooth, harmonious
    motion.ringPulse = 'smooth';
    motion.petalGlow = 'shimmer';
    motion.breathingRate = 5.5; // slow, deep breathing
    
    // Breakthrough at very high coherence
    if (coherence > 0.9) {
      motion.breakthrough = true;
    }
  }

  // Shadow state (dims specific petals)
  if (shadowFacets.length > 0) {
    // Don't override glow entirely, just mark for selective dimming
    motion.shadowPetals = shadowFacets;
  }

  // Aether state (center effects)
  if (aetherStage === 1) {
    motion.centerEffect = 'expansive';
    motion.breathingRate = 6; // very slow expansion
  } else if (aetherStage === 2) {
    motion.centerEffect = 'contractive';
    motion.breathingRate = 3; // drawing inward
  } else if (aetherStage === 3) {
    motion.centerEffect = 'stillness';
    motion.ringPulse = 'still';
    motion.breathingRate = 8; // almost imperceptible
  }

  // Voice interaction override
  if (isVoiceActive) {
    motion.breathingRate = 3; // sync with speech rhythm
  }

  return motion;
}

// ============================================
// Animation Configurations
// ============================================

export function getAnimationConfig(motion: MotionState): AnimationConfig {
  const config: AnimationConfig = {
    ringAnimation: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.5, 0.3],
      duration: motion.breathingRate,
      ease: 'easeInOut'
    },
    petalAnimation: {
      opacity: [0.5, 0.7, 0.5],
      duration: motion.breathingRate,
      scale: undefined,
      blur: undefined
    },
    centerAnimation: {
      scale: [1, 1, 1],
      opacity: [0.6, 0.6, 0.6],
      duration: motion.breathingRate,
      blur: undefined
    }
  };

  // Ring pulse variations
  switch (motion.ringPulse) {
    case 'jitter':
      config.ringAnimation.scale = [1, 1.03, 0.97, 1.05, 1];
      config.ringAnimation.opacity = [0.2, 0.6, 0.3, 0.5, 0.2];
      config.ringAnimation.duration = motion.breathingRate * 0.8;
      config.ringAnimation.ease = 'linear';
      break;
    case 'smooth':
      config.ringAnimation.scale = [1, 1.08, 1];
      config.ringAnimation.opacity = [0.4, 0.7, 0.4];
      config.ringAnimation.ease = 'easeInOut';
      break;
    case 'still':
      config.ringAnimation.scale = [1, 1.01, 1];
      config.ringAnimation.opacity = [0.5, 0.55, 0.5];
      config.ringAnimation.duration = motion.breathingRate * 2;
      break;
  }

  // Petal glow variations
  switch (motion.petalGlow) {
    case 'flicker':
      config.petalAnimation.opacity = [0.3, 0.8, 0.4, 0.7, 0.3];
      config.petalAnimation.duration = motion.breathingRate * 0.7;
      break;
    case 'shimmer':
      config.petalAnimation.opacity = [0.6, 0.9, 0.6];
      config.petalAnimation.scale = [1, 1.02, 1];
      config.petalAnimation.duration = motion.breathingRate;
      break;
    case 'dimmed':
      config.petalAnimation.opacity = [0.2, 0.3, 0.2];
      config.petalAnimation.blur = 1;
      break;
  }

  // Center effects
  switch (motion.centerEffect) {
    case 'expansive':
      config.centerAnimation.scale = [1, 1.3, 1];
      config.centerAnimation.opacity = [0.4, 0.8, 0.4];
      config.centerAnimation.duration = motion.breathingRate * 1.5;
      break;
    case 'contractive':
      config.centerAnimation.scale = [1.1, 0.9, 1.1];
      config.centerAnimation.opacity = [0.5, 0.9, 0.5];
      config.centerAnimation.duration = motion.breathingRate * 0.8;
      break;
    case 'stillness':
      config.centerAnimation.scale = [1, 1, 1];
      config.centerAnimation.opacity = [0.95, 1, 0.95];
      config.centerAnimation.duration = motion.breathingRate * 3;
      config.centerAnimation.blur = 3;
      break;
  }

  // Breakthrough animation
  if (motion.breakthrough) {
    config.breakthroughAnimation = {
      scale: [1, 1.5, 0],
      opacity: [0, 0.8, 0],
      duration: 2
    };
  }

  return config;
}

// ============================================
// Coherence Calculation
// ============================================

export function calculateCoherence(
  elementalBalance: Record<string, number>,
  userIntention: number = 0.5, // 0-1 scale of intention clarity
  sessionDuration: number = 0 // minutes
): number {
  // Calculate elemental harmony
  const elements = Object.values(elementalBalance);
  const mean = elements.reduce((a, b) => a + b, 0) / elements.length;
  const variance = elements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / elements.length;
  const harmony = 1 - Math.min(variance * 2, 1); // Lower variance = higher harmony

  // Factor in intention and duration
  const intentionBonus = userIntention * 0.2;
  const durationBonus = Math.min(sessionDuration / 30, 0.2); // Max 0.2 bonus for 30+ min sessions

  // Calculate final coherence
  const coherence = Math.min(harmony + intentionBonus + durationBonus, 1);
  
  return coherence;
}

// ============================================
// Shadow Detection
// ============================================

export function detectShadowPetals(
  sessionData: {
    avoidedElements?: string[];
    weakIntensities?: Record<string, number>;
    repeatedPatterns?: string[];
  }
): string[] {
  const shadowPetals: string[] = [];

  // Elements user seems to avoid
  if (sessionData.avoidedElements) {
    sessionData.avoidedElements.forEach(element => {
      shadowPetals.push(`${element}1`, `${element}2`, `${element}3`);
    });
  }

  // Petals with consistently low engagement
  if (sessionData.weakIntensities) {
    Object.entries(sessionData.weakIntensities).forEach(([petal, intensity]) => {
      if (intensity < 0.2) {
        shadowPetals.push(petal);
      }
    });
  }

  // Stuck patterns (same petals repeatedly)
  if (sessionData.repeatedPatterns && sessionData.repeatedPatterns.length > 3) {
    // If user keeps returning to same petals, others might be in shadow
    const allPetals = ['Fire1', 'Fire2', 'Fire3', 'Water1', 'Water2', 'Water3', 
                      'Earth1', 'Earth2', 'Earth3', 'Air1', 'Air2', 'Air3'];
    allPetals.forEach(petal => {
      if (!sessionData.repeatedPatterns!.includes(petal)) {
        shadowPetals.push(petal);
      }
    });
  }

  return [...new Set(shadowPetals)]; // Remove duplicates
}

// ============================================
// Voice Sync
// ============================================

export interface VoiceState {
  isActive: boolean;
  amplitude: number; // 0-1
  frequency: number; // Hz
  emotion?: 'calm' | 'excited' | 'contemplative' | 'uncertain';
}

export function syncWithVoice(
  baseMotion: MotionState,
  voiceState: VoiceState
): MotionState {
  const motion = { ...baseMotion };

  if (voiceState.isActive) {
    // Sync breathing with speech amplitude
    motion.breathingRate = 2 + (1 - voiceState.amplitude) * 3; // Faster when louder
    
    // Adjust based on emotional tone
    switch (voiceState.emotion) {
      case 'calm':
        motion.ringPulse = 'smooth';
        motion.petalGlow = 'soft';
        break;
      case 'excited':
        motion.ringPulse = 'jitter';
        motion.petalGlow = 'shimmer';
        motion.breathingRate *= 0.7; // Faster
        break;
      case 'contemplative':
        motion.ringPulse = 'steady';
        motion.petalGlow = 'soft';
        motion.breathingRate *= 1.3; // Slower
        break;
      case 'uncertain':
        motion.ringPulse = 'jitter';
        motion.petalGlow = 'flicker';
        break;
    }
  }

  return motion;
}

// ============================================
// Transition Detection
// ============================================

export function detectTransition(
  previousState: MotionState,
  currentState: MotionState
): 'breakthrough' | 'shadow-release' | 'aether-shift' | null {
  // Breakthrough: coherence jumped significantly
  if (!previousState.breakthrough && currentState.breakthrough) {
    return 'breakthrough';
  }

  // Shadow release: shadow petals cleared
  if (previousState.shadowPetals.length > 0 && currentState.shadowPetals.length === 0) {
    return 'shadow-release';
  }

  // Aether shift: moved between Aether states
  if (previousState.centerEffect !== currentState.centerEffect && 
      (previousState.centerEffect?.includes('expansive') || 
       previousState.centerEffect?.includes('contractive') ||
       previousState.centerEffect?.includes('stillness'))) {
    return 'aether-shift';
  }

  return null;
}

// ============================================
// Color Modulation
// ============================================

export function getColorForCoherence(baseColor: string, coherence: number): string {
  // Add golden tint at high coherence
  if (coherence > 0.7) {
    return blendColors(baseColor, '#FFD700', (coherence - 0.7) * 0.5);
  }
  // Desaturate at low coherence
  if (coherence < 0.3) {
    return blendColors(baseColor, '#808080', (0.3 - coherence) * 0.5);
  }
  return baseColor;
}

function blendColors(color1: string, color2: string, ratio: number): string {
  // Simple hex color blending
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}