/**
 * 🌉 Neurodivergent Contemplative Integration
 * 
 * Bridging contemplative space design with neurodivergent accessibility
 * Recognizing that presence and flow can look radically different
 * for different neurotypes
 */

import { ContemplativeSpaceController } from '../contemplative-space/contemplativeSpaceDesign';
import { 
  NeurodivergentSupportController, 
  NeurodivergentProfile 
} from './neurodivergentAccessibility';

export interface NDContemplativeConfig {
  // Core recognition: contemplative ≠ slow/quiet for everyone
  contemplativeStyle: 'traditional' | 'active' | 'parallel' | 'micro' | 'intense';
  
  // Sensory configuration with granular control
  sensoryProfile: {
    visualIntensity: number; // 0-10 scale
    audioPresence: number;   // 0-10 scale
    hapticFeedback: number;  // 0-10 scale
    animationSpeed: number;  // 0.1x - 3x multiplier
    colorSaturation: number; // 0-100%
  };
  
  // Attention & Focus patterns
  attentionSupport: {
    fidgetMode: 'none' | 'subtle' | 'active' | 'intense';
    progressIndicators: 'hidden' | 'subtle' | 'clear' | 'detailed';
    pauseStructure: 'micro' | 'brief' | 'standard' | 'extended';
    skipPauses: boolean;
    parallelProcessing: boolean; // Multiple gentle inputs
  };
  
  // Predictability & Structure
  predictabilityNeeds: {
    explicitTimers: boolean;
    stateLabels: 'none' | 'minimal' | 'clear' | 'detailed';
    conversationMap: boolean; // Show structure preview
    consistentPatterns: boolean;
    transitionAlerts: boolean;
  };
  
  // Processing speed & style
  processingProfile: {
    speed: 'self-paced' | 'guided' | 'rapid' | 'variable';
    depth: 'surface' | 'moderate' | 'deep' | 'oscillating';
    linearity: 'linear' | 'branching' | 'web' | 'chaotic';
    breakStyle: 'none' | 'micro' | 'regular' | 'extended';
  };
}

/**
 * 🎨 Contemplative Style Generators
 * Different ways to achieve presence and flow
 */
export class NDContemplativeStyles {
  
  /**
   * Active Contemplation - Movement-based presence
   * For ADHD/hyperactive profiles
   */
  generateActiveContemplative(): any {
    return {
      interface: {
        constantMicroMovement: true,
        fidgetCorner: true, // Dedicated fidget space
        progressAnimation: 'bouncing-dots',
        breathingSpeed: 2, // Faster breath cycle
      },
      timing: {
        microPauses: [200, 300, 500], // Very brief
        rapidExchanges: true,
        noForcedSilence: true,
      },
      presence: {
        type: 'kinetic', // Presence through movement
        indicators: ['spinning', 'pulsing', 'flowing'],
      }
    };
  }
  
  /**
   * Parallel Contemplation - Multiple gentle streams
   * For complex processors
   */
  generateParallelContemplative(): any {
    return {
      interface: {
        multiLayered: true,
        backgroundPatterns: true, // Fractals, flows
        foregroundText: true,
        sidebarFidget: true,
      },
      streams: {
        primary: 'conversation',
        secondary: 'ambient-pattern',
        tertiary: 'breath-indicator',
      },
      coordination: {
        synchronized: false, // Each stream independent
        userControlled: true,
      }
    };
  }
  
  /**
   * Micro Contemplation - Tiny frequent pauses
   * For those who can't sustain long pauses
   */
  generateMicroContemplative(): any {
    return {
      pausePattern: {
        frequency: 'between-sentences',
        duration: 100, // Milliseconds
        accumulation: true, // Many micro = one macro
      },
      indicators: {
        subtle: true,
        cumulative: true, // Show pause accumulation
      }
    };
  }
  
  /**
   * Intense Contemplation - High stimulation presence
   * For sensory seekers
   */
  generateIntenseContemplative(): any {
    return {
      sensory: {
        highContrast: true,
        boldAnimations: true,
        strongHaptics: true,
        richSounds: true,
      },
      presence: {
        type: 'immersive',
        fullscreen: true,
        surround: true,
      }
    };
  }
}

/**
 * 🔧 Sensory Adaptation Layer
 */
export class SensoryAdaptationLayer {
  
  /**
   * Adapt visual elements for sensory needs
   */
  adaptVisuals(intensity: number): any {
    if (intensity === 0) {
      // No animation, static only
      return {
        animations: 'none',
        transitions: 'none',
        movement: 'none',
        colors: 'monochrome'
      };
    } else if (intensity <= 3) {
      // Minimal, gentle
      return {
        animations: 'subtle-fade',
        transitions: '2s ease',
        movement: 'slow-breath',
        colors: 'muted-palette'
      };
    } else if (intensity <= 7) {
      // Standard contemplative
      return {
        animations: 'breathing',
        transitions: '1s ease',
        movement: 'rhythmic',
        colors: 'balanced'
      };
    } else {
      // High intensity
      return {
        animations: 'dynamic',
        transitions: '0.3s ease',
        movement: 'active',
        colors: 'vibrant'
      };
    }
  }
  
  /**
   * Create fidget elements for attention regulation
   */
  createFidgetElements(mode: 'subtle' | 'active' | 'intense'): any {
    const fidgets = {
      subtle: {
        cornerSpinner: true,
        opacity: 0.2,
        speed: 'slow'
      },
      active: {
        sidebarPatterns: true,
        interactiveElements: true,
        opacity: 0.5,
        speed: 'moderate'
      },
      intense: {
        fullBorderAnimation: true,
        multipleSpinners: true,
        opacity: 0.8,
        speed: 'fast',
        interactive: true
      }
    };
    
    return fidgets[mode];
  }
}

/**
 * ⏱️ Predictability Support System
 */
export class PredictabilitySupport {
  
  /**
   * Generate explicit state indicators
   */
  generateStateIndicators(level: 'minimal' | 'clear' | 'detailed'): any {
    const indicators = {
      minimal: {
        text: '...',
        description: null
      },
      clear: {
        text: 'Maya is listening',
        icon: '👂',
        description: null
      },
      detailed: {
        text: 'Maya is listening',
        icon: '👂',
        description: 'Processing your message',
        timeEstimate: '2-3 seconds',
        nextStep: 'Maya will respond'
      }
    };
    
    return indicators[level];
  }
  
  /**
   * Create conversation structure preview
   */
  generateConversationMap(): any {
    return {
      visual: `
        [You share] → [Maya listens: 2s] → [Maya responds] 
             ↓
        [You process] ← [Space held: variable] ← [Natural pause]
             ↓
        [Continue or complete]
      `,
      stages: [
        'Opening',
        'Exploration', 
        'Deepening (optional)',
        'Integration',
        'Natural completion'
      ],
      currentStage: 'highlighted',
      userControl: 'Can skip or extend any stage'
    };
  }
  
  /**
   * Transition warnings for state changes
   */
  generateTransitionWarning(nextState: string): string {
    return `Transitioning to ${nextState} in 3... 2... 1...`;
  }
}

/**
 * 🧠 Processing Style Adaptations
 */
export class ProcessingStyleAdapter {
  
  /**
   * Non-linear conversation support
   */
  enableBranchingConversation(): any {
    return {
      topicMap: true,        // Visual topic connections
      jumpPoints: true,      // Bookmarkable points
      returnPaths: true,     // Easy return to previous topics
      parallelThreads: true, // Multiple conversations at once
      noLinearityEnforced: true
    };
  }
  
  /**
   * Self-paced processing
   */
  enableSelfPacing(): any {
    return {
      userControlled: {
        responseTime: true,
        pauseLength: true,
        conversationSpeed: true,
        depth: true
      },
      indicators: {
        'Take your time': true,
        'No rush': true,
        'Ready when you are': true
      },
      noTimeouts: true,
      infinitePause: true
    };
  }
  
  /**
   * Rapid processing mode
   */
  enableRapidMode(): any {
    return {
      instantResponses: true,
      noPauses: true,
      conciseText: true,
      quickTransitions: true,
      highBandwidth: true,
      parallelProcessing: true
    };
  }
}

/**
 * 🎭 Flow State Variations
 * Recognizing different neurotypes achieve flow differently
 */
export class NDFlowStates {
  
  /**
   * ADHD Flow - Through stimulation and movement
   */
  adhdFlow(): any {
    return {
      achieved_through: 'stimulation',
      requirements: {
        novelty: true,
        challenge: true,
        immediacy: true,
        multimodal: true
      },
      maintain_with: {
        variation: true,
        microRewards: true,
        movement: true
      }
    };
  }
  
  /**
   * Autistic Flow - Through pattern and depth
   */
  autisticFlow(): any {
    return {
      achieved_through: 'deep-dive',
      requirements: {
        specialInterest: true,
        minimalInterruption: true,
        predictableEnvironment: true,
        sensoryComfort: true
      },
      maintain_with: {
        consistency: true,
        depth: true,
        noForcedTransitions: true
      }
    };
  }
  
  /**
   * AuDHD Flow - Oscillating between modes
   */
  audhFlow(): any {
    return {
      achieved_through: 'oscillation',
      requirements: {
        flexibleStructure: true,
        intensityVariation: true,
        choiceAvailability: true,
        modeShifting: true
      },
      maintain_with: {
        responsiveSystem: true,
        energyMatching: true,
        noRigidity: true
      }
    };
  }
}

/**
 * 🔄 Master ND-Contemplative Integration Controller
 */
export class NDContemplativeIntegration {
  private contemplativeSpace: ContemplativeSpaceController;
  private ndSupport: NeurodivergentSupportController;
  private styles = new NDContemplativeStyles();
  private sensory = new SensoryAdaptationLayer();
  private predictability = new PredictabilitySupport();
  private processing = new ProcessingStyleAdapter();
  private flowStates = new NDFlowStates();
  
  private currentConfig: NDContemplativeConfig | null = null;
  
  constructor() {
    this.contemplativeSpace = new ContemplativeSpaceController();
    this.ndSupport = new NeurodivergentSupportController();
  }
  
  /**
   * Initialize with user's ND profile
   */
  initialize(profile: NeurodivergentProfile) {
    this.ndSupport.initialize(profile);
    this.currentConfig = this.generateConfigFromProfile(profile);
  }
  
  /**
   * Generate contemplative config from ND profile
   */
  private generateConfigFromProfile(profile: NeurodivergentProfile): NDContemplativeConfig {
    return {
      contemplativeStyle: this.determineStyle(profile),
      sensoryProfile: {
        visualIntensity: profile.visualSensitivity === 'high' ? 2 : 
                        profile.visualSensitivity === 'low' ? 8 : 5,
        audioPresence: profile.audioSensitivity === 'high' ? 1 : 
                      profile.audioSensitivity === 'low' ? 8 : 5,
        hapticFeedback: 5,
        animationSpeed: profile.processingSpeed === 'quick' ? 2 : 1,
        colorSaturation: profile.visualSensitivity === 'high' ? 30 : 70
      },
      attentionSupport: {
        fidgetMode: profile.fidgetTools ? 'active' : 'none',
        progressIndicators: profile.explicitCues ? 'clear' : 'subtle',
        pauseStructure: profile.microBreaks ? 'micro' : 'standard',
        skipPauses: profile.pauseTolerance < 1000,
        parallelProcessing: profile.parallelStimulation
      },
      predictabilityNeeds: {
        explicitTimers: profile.transitionWarnings,
        stateLabels: profile.explicitCues ? 'clear' : 'minimal',
        conversationMap: profile.structuredResponses,
        consistentPatterns: profile.primaryNeurotype === 'autistic',
        transitionAlerts: profile.transitionWarnings
      },
      processingProfile: {
        speed: profile.processingSpeed === 'quick' ? 'rapid' : 
               profile.processingSpeed === 'extended' ? 'self-paced' : 'guided',
        depth: 'moderate',
        linearity: profile.primaryNeurotype === 'adhd' ? 'branching' : 'linear',
        breakStyle: profile.microBreaks ? 'micro' : 'regular'
      }
    };
  }
  
  /**
   * Determine contemplative style from neurotype
   */
  private determineStyle(profile: NeurodivergentProfile): NDContemplativeConfig['contemplativeStyle'] {
    switch(profile.primaryNeurotype) {
      case 'adhd':
        return profile.movementPreference === 'active' ? 'active' : 'micro';
      case 'autistic':
        return profile.imposedRhythm === 'none' ? 'traditional' : 'parallel';
      case 'audhd':
        return 'parallel'; // Best of both
      default:
        return 'traditional';
    }
  }
  
  /**
   * Generate adapted contemplative interface
   */
  generateAdaptedInterface(): any {
    if (!this.currentConfig) return {};
    
    const style = this.currentConfig.contemplativeStyle;
    
    // Get base contemplative style
    let baseStyle;
    switch(style) {
      case 'active':
        baseStyle = this.styles.generateActiveContemplative();
        break;
      case 'parallel':
        baseStyle = this.styles.generateParallelContemplative();
        break;
      case 'micro':
        baseStyle = this.styles.generateMicroContemplative();
        break;
      case 'intense':
        baseStyle = this.styles.generateIntenseContemplative();
        break;
      default:
        baseStyle = {}; // Traditional
    }
    
    // Apply sensory adaptations
    const sensoryAdaptations = this.sensory.adaptVisuals(
      this.currentConfig.sensoryProfile.visualIntensity
    );
    
    // Add fidget elements if needed
    const fidgetElements = this.currentConfig.attentionSupport.fidgetMode !== 'none' ?
      this.sensory.createFidgetElements(this.currentConfig.attentionSupport.fidgetMode) : {};
    
    // Add predictability support
    const predictabilityFeatures = {
      stateIndicators: this.predictability.generateStateIndicators(
        this.currentConfig.predictabilityNeeds.stateLabels as any
      ),
      conversationMap: this.currentConfig.predictabilityNeeds.conversationMap ?
        this.predictability.generateConversationMap() : null
    };
    
    // Combine all adaptations
    return {
      ...baseStyle,
      sensory: sensoryAdaptations,
      fidget: fidgetElements,
      predictability: predictabilityFeatures,
      processing: this.getProcessingAdaptations()
    };
  }
  
  /**
   * Get processing style adaptations
   */
  private getProcessingAdaptations(): any {
    if (!this.currentConfig) return {};
    
    const speed = this.currentConfig.processingProfile.speed;
    
    switch(speed) {
      case 'rapid':
        return this.processing.enableRapidMode();
      case 'self-paced':
        return this.processing.enableSelfPacing();
      default:
        return {};
    }
  }
  
  /**
   * Real-time adaptation based on user state
   */
  adaptToCurrentState(energyLevel: 'low' | 'regulated' | 'high', overwhelm: boolean): any {
    if (overwhelm) {
      return this.ndSupport.activateOverwhelmProtocol();
    }
    
    // Adjust intensity based on energy
    if (this.currentConfig) {
      if (energyLevel === 'low') {
        this.currentConfig.sensoryProfile.visualIntensity = Math.max(0, this.currentConfig.sensoryProfile.visualIntensity - 3);
      } else if (energyLevel === 'high') {
        this.currentConfig.attentionSupport.fidgetMode = 'active';
      }
    }
    
    return this.generateAdaptedInterface();
  }
  
  /**
   * Check if user is achieving their version of flow
   */
  assessFlowState(profile: NeurodivergentProfile, interactionMetrics: any): boolean {
    switch(profile.primaryNeurotype) {
      case 'adhd':
        // Flow through engagement and stimulation
        return interactionMetrics.responseTime < 2000 && 
               interactionMetrics.topicVariation > 3;
               
      case 'autistic':
        // Flow through depth and consistency
        return interactionMetrics.topicDepth > 5 && 
               interactionMetrics.environmentChanges === 0;
               
      case 'audhd':
        // Flow through balanced oscillation
        return interactionMetrics.modeShifts > 0 && 
               interactionMetrics.sustainedEngagement > 10;
               
      default:
        // Traditional flow metrics
        return interactionMetrics.sustainedEngagement > 15;
    }
  }
}

/**
 * Export configured instance
 */
let _ndContemplativeIntegration: NDContemplativeIntegration | null = null;
export const getNdContemplativeIntegration = (): NDContemplativeIntegration => {
  if (!_ndContemplativeIntegration) {
    _ndContemplativeIntegration = new NDContemplativeIntegration();
  }
  return _ndContemplativeIntegration;
};