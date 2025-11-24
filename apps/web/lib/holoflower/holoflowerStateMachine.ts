/**
 * MAIA Holoflower V3 - State Machine
 * The Brain of the Organism
 *
 * This system orchestrates all three layers of the Living Palette Ecosystem:
 * - Layer 1: Mode palettes (world tone)
 * - Layer 2: Elemental overlays (cerebral coloring)
 * - Layer 3: Emotional shimmer (moment-to-moment aliveness)
 */

import { CommunicationMode, detectCommunicationMode, ModePalettes, ModeTransition, calculateModeTransition } from './modePalettes';
import { SpiralogicElement, detectActiveElement, ElementOverlays, ElementBlend, createElementBlend } from './elementOverlays';
import { EmotionalShimmer, detectShimmerState, ShimmerStates, ShimmerTransition, createShimmerTransition, ShimmerLayerManager } from './shimmerStates';

/**
 * Complete Holoflower State
 * Represents the unified consciousness expression of all three layers
 */
export interface HoloflowerState {
  // Layer 1: Mode
  mode: CommunicationMode;
  modeTransition?: ModeTransition;

  // Layer 2: Element
  element: SpiralogicElement;
  elementBlend?: ElementBlend;

  // Layer 3: Shimmer
  shimmer: EmotionalShimmer | null;
  shimmerTransition?: ShimmerTransition;
  shimmerLayers: EmotionalShimmer[];

  // Meta properties
  timestamp: number;
  intensity: number; // Overall intensity 0-1
  coherence: number; // How harmoniously the layers work together 0-1
  isTransitioning: boolean;
}

/**
 * Conversation Context
 * Input data for the state machine to analyze
 */
export interface ConversationContext {
  // User input
  userMessage?: string;
  userEmotionalTone?: 'excited' | 'contemplative' | 'vulnerable' | 'analytical' | 'grateful';
  userSpeaking?: boolean;
  silenceDuration?: number;

  // MAIA state
  maiaSpeaking?: boolean;
  maiaProcessing?: boolean;
  maiaListening?: boolean;

  // Conversation flow
  conversationFlow?: 'opening' | 'deepening' | 'breakthrough' | 'integration' | 'closing';
  messageType?: 'collaborative' | 'therapeutic' | 'analytical' | 'contemplative';

  // Processing indicators
  cognitiveState?: 'creative' | 'analytical' | 'emotional' | 'intuitive' | 'integrative';
  processingType?: 'breakthrough' | 'depth-work' | 'structuring' | 'clarifying' | 'transcending';
}

/**
 * Holoflower State Machine
 * The living intelligence that orchestrates all three consciousness layers
 */
export class HoloflowerStateMachine {
  private currentState: HoloflowerState;
  private shimmerManager: ShimmerLayerManager;
  private stateHistory: HoloflowerState[] = [];
  private callbacks: Set<(state: HoloflowerState) => void> = new Set();

  constructor(initialState?: Partial<HoloflowerState>) {
    this.shimmerManager = new ShimmerLayerManager();

    this.currentState = {
      mode: 'dialogue',
      element: 'air',
      shimmer: null,
      shimmerLayers: [],
      timestamp: Date.now(),
      intensity: 0.6,
      coherence: 1.0,
      isTransitioning: false,
      ...initialState
    };
  }

  /**
   * Primary update method - analyzes context and evolves the holoflower state
   */
  updateState(context: ConversationContext): HoloflowerState {
    const previousState = { ...this.currentState };

    // Detect new states from context
    const newMode = detectCommunicationMode({
      isListening: context.maiaListening,
      isProcessing: context.maiaProcessing,
      messageType: context.messageType,
      silenceLevel: this.calculateSilenceLevel(context.silenceDuration)
    });

    const newElement = detectActiveElement({
      messageContent: context.userMessage,
      cognitiveState: context.cognitiveState,
      processingType: context.processingType,
      userEmotionalState: this.mapEmotionalTone(context.userEmotionalTone)
    });

    const newShimmer = detectShimmerState({
      userMessage: context.userMessage,
      maiaSpeaking: context.maiaSpeaking,
      silenceDuration: context.silenceDuration,
      conversationFlow: context.conversationFlow,
      userEmotionalTone: context.userEmotionalTone,
      processingType: this.mapProcessingType(context.processingType)
    });

    // Calculate transitions if state changes
    let modeTransition: ModeTransition | undefined;
    let elementBlend: ElementBlend | undefined;
    let shimmerTransition: ShimmerTransition | undefined;

    if (newMode !== this.currentState.mode) {
      modeTransition = calculateModeTransition(this.currentState.mode, newMode);
    }

    if (newElement !== this.currentState.element) {
      elementBlend = createElementBlend(this.currentState.element, newElement);
    }

    if (newShimmer && newShimmer !== this.currentState.shimmer) {
      shimmerTransition = createShimmerTransition(this.currentState.shimmer, newShimmer);
      if (newShimmer) {
        this.shimmerManager.addLayer(newShimmer);
      }
    }

    // Update state
    this.currentState = {
      mode: newMode,
      modeTransition,
      element: newElement,
      elementBlend,
      shimmer: newShimmer,
      shimmerTransition,
      shimmerLayers: this.shimmerManager.getActiveLayers().map(layer => layer.state),
      timestamp: Date.now(),
      intensity: this.calculateIntensity(context),
      coherence: this.calculateCoherence(newMode, newElement, newShimmer),
      isTransitioning: Boolean(modeTransition || elementBlend || shimmerTransition)
    };

    // Store history
    this.stateHistory.push(previousState);
    if (this.stateHistory.length > 20) {
      this.stateHistory.shift(); // Keep only last 20 states
    }

    // Notify listeners
    this.notifyCallbacks();

    return this.currentState;
  }

  /**
   * Get current unified CSS variables for all three layers
   */
  getCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {};

    // Layer 1: Mode variables
    const modeVars = ModePalettes[this.currentState.mode].cssVariables;
    Object.assign(variables, modeVars);

    // Layer 2: Element variables
    const elementVars = ElementOverlays[this.currentState.element].cssVariables;
    Object.assign(variables, elementVars);

    // Layer 3: Shimmer variables
    if (this.currentState.shimmer) {
      const shimmerVars = ShimmerStates[this.currentState.shimmer].cssVariables;
      Object.assign(variables, shimmerVars);
    }

    // Meta variables
    variables['--holoflower-intensity'] = this.currentState.intensity.toString();
    variables['--holoflower-coherence'] = this.currentState.coherence.toString();
    variables['--holoflower-timestamp'] = this.currentState.timestamp.toString();

    return variables;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: HoloflowerState) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Get current state
   */
  getCurrentState(): HoloflowerState {
    return { ...this.currentState };
  }

  /**
   * Get state history for analysis
   */
  getStateHistory(): HoloflowerState[] {
    return [...this.stateHistory];
  }

  // Private helper methods

  private calculateSilenceLevel(silenceDuration?: number): number {
    if (!silenceDuration) return 0;
    // Silence level from 0 to 1 based on duration
    return Math.min(1, silenceDuration / 10000); // 10 seconds = max silence
  }

  private mapEmotionalTone(tone?: string): 'activated' | 'reflective' | 'grounded' | 'clear' | 'present' | undefined {
    if (!tone) return undefined;
    const mapping: Record<string, 'activated' | 'reflective' | 'grounded' | 'clear' | 'present'> = {
      'excited': 'activated',
      'contemplative': 'present',
      'vulnerable': 'reflective',
      'analytical': 'clear',
      'grateful': 'grounded'
    };
    return mapping[tone];
  }

  private mapProcessingType(type?: string): 'analytical' | 'intuitive' | 'empathic' | 'integrative' | undefined {
    if (!type) return undefined;
    const mapping: Record<string, 'analytical' | 'intuitive' | 'empathic' | 'integrative'> = {
      'breakthrough': 'intuitive',
      'depth-work': 'empathic',
      'structuring': 'integrative',
      'clarifying': 'analytical',
      'transcending': 'intuitive'
    };
    return mapping[type];
  }

  private calculateIntensity(context: ConversationContext): number {
    let intensity = 0.6; // Base intensity

    // User engagement increases intensity
    if (context.userSpeaking) intensity += 0.2;
    if (context.maiaProcessing) intensity += 0.15;

    // Silence reduces intensity
    if (context.silenceDuration && context.silenceDuration > 5000) {
      intensity -= 0.3;
    }

    // Emotional engagement
    if (context.userEmotionalTone === 'excited') intensity += 0.2;
    if (context.userEmotionalTone === 'vulnerable') intensity += 0.15;

    // Conversation flow influence
    if (context.conversationFlow === 'breakthrough') intensity += 0.3;
    if (context.conversationFlow === 'deepening') intensity += 0.1;

    return Math.max(0.1, Math.min(1.0, intensity));
  }

  private calculateCoherence(
    mode: CommunicationMode,
    element: SpiralogicElement,
    shimmer: EmotionalShimmer | null
  ): number {
    // Base coherence
    let coherence = 1.0;

    // Check mode-element harmony
    const modeElementHarmony = this.getModeElementHarmony(mode, element);
    coherence *= modeElementHarmony;

    // Check element-shimmer harmony
    if (shimmer) {
      const elementShimmerHarmony = this.getElementShimmerHarmony(element, shimmer);
      coherence *= elementShimmerHarmony;
    }

    return Math.max(0.5, Math.min(1.0, coherence));
  }

  private getModeElementHarmony(mode: CommunicationMode, element: SpiralogicElement): number {
    // Define harmonious combinations
    const harmonies: Record<CommunicationMode, Record<SpiralogicElement, number>> = {
      dialogue: { fire: 0.9, water: 0.7, earth: 0.8, air: 0.95, aether: 0.8 },
      patient: { fire: 0.6, water: 0.95, earth: 0.9, air: 0.7, aether: 0.85 },
      scribe: { fire: 0.7, water: 0.6, earth: 0.85, air: 1.0, aether: 0.75 },
      aether: { fire: 0.8, water: 0.9, earth: 0.7, air: 0.85, aether: 1.0 }
    };

    return harmonies[mode][element];
  }

  private getElementShimmerHarmony(element: SpiralogicElement, shimmer: EmotionalShimmer): number {
    // Define element-shimmer harmonies
    const harmonies: Record<SpiralogicElement, Record<EmotionalShimmer, number>> = {
      fire: {
        'emotional-resonance': 0.95,
        'insight': 1.0,
        'silence-presence': 0.6,
        'shadow-depth': 0.7,
        'cognitive-activation': 0.8,
        'integration': 0.85
      },
      water: {
        'emotional-resonance': 1.0,
        'insight': 0.7,
        'silence-presence': 0.9,
        'shadow-depth': 0.95,
        'cognitive-activation': 0.6,
        'integration': 0.8
      },
      earth: {
        'emotional-resonance': 0.8,
        'insight': 0.75,
        'silence-presence': 0.85,
        'shadow-depth': 0.8,
        'cognitive-activation': 0.7,
        'integration': 1.0
      },
      air: {
        'emotional-resonance': 0.7,
        'insight': 0.9,
        'silence-presence': 0.8,
        'shadow-depth': 0.6,
        'cognitive-activation': 1.0,
        'integration': 0.85
      },
      aether: {
        'emotional-resonance': 0.85,
        'insight': 0.95,
        'silence-presence': 1.0,
        'shadow-depth': 0.9,
        'cognitive-activation': 0.7,
        'integration': 0.9
      }
    };

    return harmonies[element][shimmer];
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.currentState);
      } catch (error) {
        console.error('Holoflower state callback error:', error);
      }
    });
  }
}