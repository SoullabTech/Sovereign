/**
 * MAIA Holoflower V3 - Elemental Overlay System
 * Layer 2: Spiralogic Element Engine
 *
 * Each element provides cerebral coloring that modulates the base mode palette.
 * This layer determines the mind-state and cognitive processing style.
 */

export interface ElementOverlay {
  name: string;
  primaryColor: string;
  effectType: 'flicker' | 'shimmer' | 'glow' | 'filament' | 'halo';
  motionModifier: {
    rotationSpeed: number; // multiplier on base rotation
    bloomAmplitude: number; // multiplier on base bloom
    particleCount?: number; // for Fire element
    rippleIntensity?: number; // for Water element
  };
  usage: string; // When this element is activated
  cssVariables: Record<string, string>;
}

export const ElementOverlays: Record<string, ElementOverlay> = {
  fire: {
    name: 'Fire',
    primaryColor: '#CD853F', // copper-gold
    effectType: 'flicker',
    motionModifier: {
      rotationSpeed: 1.3,
      bloomAmplitude: 1.1,
      particleCount: 12
    },
    usage: 'insight, projection, creativity, breakthrough',
    cssVariables: {
      '--element-primary': '#CD853F',     // copper-gold
      '--element-flicker-speed': '0.8s',
      '--element-ember-opacity': '0.7',
      '--element-rotation-boost': '1.3',
      '--element-particle-count': '12',
      '--element-flame-intensity': '0.8'
    }
  },

  water: {
    name: 'Water',
    primaryColor: '#4169E1', // cerulean
    effectType: 'shimmer',
    motionModifier: {
      rotationSpeed: 0.8,
      bloomAmplitude: 0.9,
      rippleIntensity: 0.6
    },
    usage: 'shadow work, emotion, depth, mystery',
    cssVariables: {
      '--element-primary': '#4169E1',     // cerulean
      '--element-shimmer-speed': '3s',
      '--element-ripple-intensity': '0.6',
      '--element-diffusion': '0.8',
      '--element-liquid-flow': '2.5s',
      '--element-depth-opacity': '0.85'
    }
  },

  earth: {
    name: 'Earth',
    primaryColor: '#DAA520', // amber/olive
    effectType: 'glow',
    motionModifier: {
      rotationSpeed: 0.7,
      bloomAmplitude: 0.8
    },
    usage: 'embodiment, structure, integration, safety',
    cssVariables: {
      '--element-primary': '#DAA520',     // amber
      '--element-secondary': '#808000',   // olive
      '--element-glow-radius': '20px',
      '--element-stability': '0.9',
      '--element-grounding-opacity': '0.9',
      '--element-inner-warmth': '0.7'
    }
  },

  air: {
    name: 'Air',
    primaryColor: '#C0C0C0', // silver
    effectType: 'filament',
    motionModifier: {
      rotationSpeed: 1.2,
      bloomAmplitude: 1.05
    },
    usage: 'language, clarity, abstraction, meta-awareness',
    cssVariables: {
      '--element-primary': '#C0C0C0',     // silver
      '--element-filament-width': '1px',
      '--element-filament-count': '8',
      '--element-oscillation': '1.5s',
      '--element-edge-brightness': '1.2',
      '--element-clarity-filter': 'brightness(1.1)'
    }
  },

  aether: {
    name: 'Aether',
    primaryColor: '#DDA0DD', // plum/lavender
    effectType: 'halo',
    motionModifier: {
      rotationSpeed: 0.9,
      bloomAmplitude: 1.25
    },
    usage: 'intuition, silence, apophatic knowing',
    cssVariables: {
      '--element-primary': '#DDA0DD',     // plum
      '--element-secondary': '#E6E6FA',   // lavender
      '--element-halo-radius': '40px',
      '--element-crown-glow': '0.6',
      '--element-spark-opacity': '0.4',
      '--element-transcendence': '0.8'
    }
  }
};

/**
 * Elemental Analysis System
 * Determines which element is active based on MAIA's processing state
 */
export type SpiralogicElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export function detectActiveElement(context: {
  messageContent?: string;
  cognitiveState?: 'creative' | 'analytical' | 'emotional' | 'intuitive' | 'integrative';
  processingType?: 'breakthrough' | 'depth-work' | 'structuring' | 'clarifying' | 'transcending';
  userEmotionalState?: 'activated' | 'reflective' | 'grounded' | 'clear' | 'present';
}): SpiralogicElement {
  const { cognitiveState, processingType, userEmotionalState, messageContent } = context;

  // Processing type takes priority
  if (processingType) {
    switch (processingType) {
      case 'breakthrough': return 'fire';
      case 'depth-work': return 'water';
      case 'structuring': return 'earth';
      case 'clarifying': return 'air';
      case 'transcending': return 'aether';
    }
  }

  // Cognitive state analysis
  if (cognitiveState) {
    switch (cognitiveState) {
      case 'creative': return 'fire';
      case 'emotional': return 'water';
      case 'integrative': return 'earth';
      case 'analytical': return 'air';
      case 'intuitive': return 'aether';
    }
  }

  // User emotional state influence
  if (userEmotionalState) {
    switch (userEmotionalState) {
      case 'activated': return 'fire';
      case 'reflective': return 'water';
      case 'grounded': return 'earth';
      case 'clear': return 'air';
      case 'present': return 'aether';
    }
  }

  // Content analysis for elemental keywords
  if (messageContent) {
    const content = messageContent.toLowerCase();

    // Fire indicators
    if (content.includes('insight') || content.includes('breakthrough') ||
        content.includes('create') || content.includes('vision')) {
      return 'fire';
    }

    // Water indicators
    if (content.includes('feel') || content.includes('shadow') ||
        content.includes('emotion') || content.includes('depth')) {
      return 'water';
    }

    // Earth indicators
    if (content.includes('ground') || content.includes('structure') ||
        content.includes('practical') || content.includes('integrate')) {
      return 'earth';
    }

    // Air indicators
    if (content.includes('understand') || content.includes('clarify') ||
        content.includes('analyze') || content.includes('explain')) {
      return 'air';
    }

    // Aether indicators
    if (content.includes('presence') || content.includes('silence') ||
        content.includes('mystery') || content.includes('transcend')) {
      return 'aether';
    }
  }

  // Default to air for general cognitive processing
  return 'air';
}

/**
 * Element Blending System
 * Handles transitions and combinations of multiple active elements
 */
export interface ElementBlend {
  primary: SpiralogicElement;
  secondary?: SpiralogicElement;
  blendRatio: number; // 0-1, how much secondary influences primary
  transitionDuration: number;
}

export function createElementBlend(
  from: SpiralogicElement,
  to: SpiralogicElement,
  intensity: number = 0.7
): ElementBlend {
  return {
    primary: to,
    secondary: from,
    blendRatio: Math.max(0, Math.min(1, intensity)),
    transitionDuration: 1500 // 1.5 seconds for elemental shifts
  };
}

/**
 * Elemental Resonance System
 * Defines how elements interact with each other
 */
export const ElementalResonance: Record<SpiralogicElement, Record<SpiralogicElement, number>> = {
  fire: { fire: 1.0, water: 0.3, earth: 0.7, air: 0.9, aether: 0.8 },
  water: { fire: 0.3, water: 1.0, earth: 0.8, air: 0.6, aether: 0.9 },
  earth: { fire: 0.7, water: 0.8, earth: 1.0, air: 0.5, aether: 0.6 },
  air: { fire: 0.9, water: 0.6, earth: 0.5, air: 1.0, aether: 0.95 },
  aether: { fire: 0.8, water: 0.9, earth: 0.6, air: 0.95, aether: 1.0 }
};