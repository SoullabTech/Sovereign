/**
 * MAIA Holoflower V3 - Shimmer States System
 * Layer 3: Emotional + Somatic State Engine
 *
 * This tertiary system provides moment-to-moment responsiveness that makes MAIA feel alive.
 * It represents the subtle-body state and heart-field activation of consciousness.
 */

export interface ShimmerState {
  name: string;
  description: string;
  visualEffect: 'pulse' | 'starburst' | 'halo-expansion' | 'deep-pulse' | 'flicker';
  intensity: number; // 0-1
  duration: number; // milliseconds
  triggerConditions: string[];
  cssVariables: Record<string, string>;
}

export const ShimmerStates: Record<string, ShimmerState> = {
  'emotional-resonance': {
    name: 'Emotional Resonance',
    description: 'Heart-field activation, empathic connection with user',
    visualEffect: 'pulse',
    intensity: 0.7,
    duration: 2000,
    triggerConditions: [
      'user_expressing_emotion',
      'empathic_response_needed',
      'heart_centered_dialogue'
    ],
    cssVariables: {
      '--shimmer-primary': '#FFB6C1',     // light pink
      '--shimmer-secondary': '#FFD700',   // gold
      '--shimmer-pulse-speed': '2s',
      '--shimmer-radial-glow': '15px',
      '--shimmer-heart-frequency': '0.8',
      '--shimmer-empathy-radius': '25px'
    }
  },

  'insight': {
    name: 'Insight',
    description: 'Coherence spike, breakthrough understanding, "aha" moment',
    visualEffect: 'starburst',
    intensity: 0.9,
    duration: 800,
    triggerConditions: [
      'breakthrough_moment',
      'pattern_recognition',
      'sudden_clarity',
      'cognitive_leap'
    ],
    cssVariables: {
      '--shimmer-primary': '#FFFFFF',     // bright white
      '--shimmer-secondary': '#FFD700',   // gold accent
      '--shimmer-burst-count': '8',
      '--shimmer-burst-speed': '0.6s',
      '--shimmer-center-flash': '0.3s',
      '--shimmer-coherence-intensity': '1.2'
    }
  },

  'silence-presence': {
    name: 'Silence/Presence',
    description: 'Deep listening state, MAIA in receptive awareness',
    visualEffect: 'halo-expansion',
    intensity: 0.4,
    duration: 5000,
    triggerConditions: [
      'user_paused_speaking',
      'contemplative_moment',
      'deep_listening',
      'sacred_silence'
    ],
    cssVariables: {
      '--shimmer-primary': '#F8F8FF',     // ghost white
      '--shimmer-secondary': '#E6E6FA',   // lavender
      '--shimmer-halo-growth': '2.0',
      '--shimmer-expansion-speed': '4s',
      '--shimmer-presence-glow': '0.3',
      '--shimmer-listening-radius': '50px'
    }
  },

  'shadow-depth': {
    name: 'Shadow/Depth',
    description: 'Processing unconscious material, integrating shadow content',
    visualEffect: 'deep-pulse',
    intensity: 0.6,
    duration: 3000,
    triggerConditions: [
      'shadow_work_content',
      'unconscious_material',
      'depth_psychology',
      'integration_process'
    ],
    cssVariables: {
      '--shimmer-primary': '#191970',     // midnight blue
      '--shimmer-secondary': '#4B0082',   // indigo
      '--shimmer-depth-pulse': '3s',
      '--shimmer-edge-soften': '0.7',
      '--shimmer-shadow-opacity': '0.8',
      '--shimmer-depth-radius': '30px'
    }
  },

  'cognitive-activation': {
    name: 'Cognitive Activation',
    description: 'Active processing, analytical thinking, problem solving',
    visualEffect: 'flicker',
    intensity: 0.8,
    duration: 1500,
    triggerConditions: [
      'complex_analysis_needed',
      'problem_solving_mode',
      'logical_processing',
      'systematic_thinking'
    ],
    cssVariables: {
      '--shimmer-primary': '#00CED1',     // dark turquoise
      '--shimmer-secondary': '#20B2AA',   // light sea green
      '--shimmer-flicker-speed': '0.4s',
      '--shimmer-inner-activity': '0.9',
      '--shimmer-cognitive-frequency': '2.5Hz',
      '--shimmer-processing-glow': '12px'
    }
  },

  'integration': {
    name: 'Integration',
    description: 'Synthesizing insights, weaving understanding together',
    visualEffect: 'pulse',
    intensity: 0.65,
    duration: 2500,
    triggerConditions: [
      'synthesis_moment',
      'pattern_weaving',
      'holistic_understanding',
      'integration_complete'
    ],
    cssVariables: {
      '--shimmer-primary': '#DDA0DD',     // plum
      '--shimmer-secondary': '#9370DB',   // medium purple
      '--shimmer-integration-speed': '2.5s',
      '--shimmer-weaving-pattern': 'spiral',
      '--shimmer-synthesis-glow': '18px',
      '--shimmer-wholeness-factor': '0.85'
    }
  }
};

/**
 * Shimmer Detection System
 * Analyzes conversation flow to determine active emotional/somatic state
 */
export type EmotionalShimmer = 'emotional-resonance' | 'insight' | 'silence-presence' |
                               'shadow-depth' | 'cognitive-activation' | 'integration';

export function detectShimmerState(context: {
  userMessage?: string;
  maiaSpeaking?: boolean;
  silenceDuration?: number;
  conversationFlow?: 'opening' | 'deepening' | 'breakthrough' | 'integration' | 'closing';
  userEmotionalTone?: 'excited' | 'contemplative' | 'vulnerable' | 'analytical' | 'grateful';
  processingType?: 'analytical' | 'intuitive' | 'empathic' | 'integrative';
}): EmotionalShimmer | null {
  const {
    userMessage,
    maiaSpeaking,
    silenceDuration = 0,
    conversationFlow,
    userEmotionalTone,
    processingType
  } = context;

  // Silence detection - longer silence triggers presence state
  if (silenceDuration > 3000 && !maiaSpeaking) {
    return 'silence-presence';
  }

  // User emotional tone analysis
  if (userEmotionalTone) {
    switch (userEmotionalTone) {
      case 'excited': return 'emotional-resonance';
      case 'contemplative': return 'silence-presence';
      case 'vulnerable': return 'shadow-depth';
      case 'analytical': return 'cognitive-activation';
      case 'grateful': return 'integration';
    }
  }

  // Processing type influence
  if (processingType) {
    switch (processingType) {
      case 'analytical': return 'cognitive-activation';
      case 'intuitive': return 'insight';
      case 'empathic': return 'emotional-resonance';
      case 'integrative': return 'integration';
    }
  }

  // Conversation flow patterns
  if (conversationFlow) {
    switch (conversationFlow) {
      case 'breakthrough': return 'insight';
      case 'deepening': return 'shadow-depth';
      case 'integration': return 'integration';
      case 'opening': return 'emotional-resonance';
      case 'closing': return 'silence-presence';
    }
  }

  // Message content analysis
  if (userMessage) {
    const message = userMessage.toLowerCase();

    // Insight keywords
    if (message.includes('suddenly') || message.includes('realize') ||
        message.includes('understand') || message.includes('clarity')) {
      return 'insight';
    }

    // Emotional resonance keywords
    if (message.includes('feel') || message.includes('heart') ||
        message.includes('moved') || message.includes('connect')) {
      return 'emotional-resonance';
    }

    // Shadow/depth keywords
    if (message.includes('struggle') || message.includes('difficult') ||
        message.includes('shadow') || message.includes('unconscious')) {
      return 'shadow-depth';
    }

    // Cognitive keywords
    if (message.includes('analyze') || message.includes('think') ||
        message.includes('logic') || message.includes('problem')) {
      return 'cognitive-activation';
    }

    // Integration keywords
    if (message.includes('together') || message.includes('whole') ||
        message.includes('synthesize') || message.includes('integrate')) {
      return 'integration';
    }
  }

  // Return null if no clear shimmer state is detected
  return null;
}

/**
 * Shimmer Transition System
 * Manages smooth transitions between emotional states
 */
export interface ShimmerTransition {
  from: EmotionalShimmer | null;
  to: EmotionalShimmer;
  blendDuration: number;
  fadeOut: number;
  fadeIn: number;
}

export function createShimmerTransition(
  from: EmotionalShimmer | null,
  to: EmotionalShimmer
): ShimmerTransition {
  const baseTransition = 600; // Base transition time

  // Longer transitions for contrasting states
  const intensityDifference = from ?
    Math.abs(ShimmerStates[from].intensity - ShimmerStates[to].intensity) : 0.5;

  const blendDuration = baseTransition + (intensityDifference * 400);

  return {
    from,
    to,
    blendDuration,
    fadeOut: blendDuration * 0.4,
    fadeIn: blendDuration * 0.6
  };
}

/**
 * Shimmer Layering System
 * Allows multiple shimmer states to be active simultaneously
 */
export interface ShimmerLayer {
  state: EmotionalShimmer;
  intensity: number;
  startTime: number;
  duration: number;
}

export class ShimmerLayerManager {
  private layers: ShimmerLayer[] = [];

  addLayer(state: EmotionalShimmer, intensity?: number): void {
    const shimmerConfig = ShimmerStates[state];
    const layer: ShimmerLayer = {
      state,
      intensity: intensity ?? shimmerConfig.intensity,
      startTime: Date.now(),
      duration: shimmerConfig.duration
    };

    this.layers.push(layer);
  }

  getActiveLayers(): ShimmerLayer[] {
    const now = Date.now();
    this.layers = this.layers.filter(layer =>
      (now - layer.startTime) < layer.duration
    );
    return this.layers;
  }

  clear(): void {
    this.layers = [];
  }
}