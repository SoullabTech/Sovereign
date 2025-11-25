/**
 * 🧠 Neurodivergent Accessibility Module
 * 
 * Supporting diverse cognitive processing styles
 * ADHD, Autism, AuDHD, Dyslexia, and other neurotypes
 * Creating genuinely inclusive contemplative space
 */

export interface NeurodivergentProfile {
  userId: string;
  primaryNeurotype?: 'adhd' | 'autistic' | 'audhd' | 'dyslexic' | 'other' | 'unspecified';
  
  // Sensory preferences
  visualSensitivity: 'low' | 'medium' | 'high'; // Animation tolerance
  audioSensitivity: 'low' | 'medium' | 'high';  // Sound tolerance
  movementPreference: 'minimal' | 'moderate' | 'active'; // How much visual movement helps
  
  // Processing preferences
  processingSpeed: 'quick' | 'moderate' | 'extended';
  transitionWarnings: boolean; // Announce changes before they happen
  explicitCues: boolean; // Clear state labels
  
  // Attention & Focus
  focusSupport: 'none' | 'gentle' | 'active';
  fidgetTools: boolean;
  parallelStimulation: boolean; // Background patterns while reading
  
  // Communication
  literalLanguage: boolean; // Avoid metaphors/abstract language
  structuredResponses: boolean; // Consistent format
  visualCommunication: boolean; // Prefer images/diagrams
  
  // Rhythm & Timing
  imposedRhythm: 'none' | 'optional' | 'helpful';
  pauseTolerance: number; // Milliseconds of comfortable pause
  microBreaks: boolean; // Frequent small pauses vs long ones
  
  // Overload prevention
  overwhelmThreshold: 'low' | 'medium' | 'high';
  cooldownNeeded: boolean; // After intense exchanges
  exitStrategy: 'visible' | 'hidden' | 'none'; // Quick escape option
}

/**
 * 🎯 ADHD Support Features
 */
export class ADHDSupport {
  private config = {
    microPauses: true,           // 500ms breaks vs 3000ms
    progressIndicators: true,    // Always show something is happening
    fidgetBackground: true,      // Subtle movement to occupy restless attention
    flexibleStructure: true,     // Can jump between topics
    dopamineHits: true,         // Small celebrations/acknowledgments
    timeAwareness: true,         // Show elapsed time subtly
    hyperfocusProtection: false // Optional reminders to take breaks
  };
  
  /**
   * Generate ADHD-friendly interface modifications
   */
  generateInterfaceMode(): any {
    return {
      animations: {
        fidgetSpinner: this.createFidgetAnimation(),
        progressDots: this.createProgressAnimation(),
        microCelebrations: this.createDopamineAnimations()
      },
      timing: {
        responseDelay: 500,
        pauseBetweenSentences: 200,
        maxSilence: 2000 // Before showing "still here" indicator
      },
      layout: {
        compactText: true, // Shorter paragraphs
        bulletPoints: true, // When appropriate
        visualBreaks: true, // Space between elements
        highlightChanges: true // New content highlighted briefly
      }
    };
  }
  
  private createFidgetAnimation(): string {
    return `
      @keyframes adhd-fidget {
        0% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(90deg) scale(1.02); }
        50% { transform: rotate(180deg) scale(1); }
        75% { transform: rotate(270deg) scale(1.02); }
        100% { transform: rotate(360deg) scale(1); }
      }
      
      .fidget-element {
        animation: adhd-fidget 4s linear infinite;
        opacity: 0.1; /* Very subtle */
      }
    `;
  }
  
  private createProgressAnimation(): string {
    return `
      .progress-dots span {
        animation: bounce 0.5s infinite;
        animation-delay: calc(var(--i) * 0.1s);
      }
      
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-5px); }
      }
    `;
  }
  
  private createDopamineAnimations(): string {
    return `
      @keyframes micro-celebrate {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); filter: brightness(1.2); }
        100% { transform: scale(1); }
      }
      
      .acknowledgment {
        animation: micro-celebrate 0.3s ease-out;
      }
    `;
  }
  
  /**
   * Adapt Maya's responses for ADHD processing
   */
  adaptResponse(originalResponse: string): string {
    // Break into shorter chunks
    const sentences = originalResponse.split(/(?<=[.!?])\s+/);
    
    if (sentences.length > 3) {
      // Add micro-breaks
      return sentences.map((s, i) => {
        if (i > 0 && i % 2 === 0) {
          return `\n${s}`; // Visual break every 2 sentences
        }
        return s;
      }).join(' ');
    }
    
    return originalResponse;
  }
}

/**
 * 🧩 Autism Support Features
 */
export class AutismSupport {
  private config = {
    predictablePatterns: true,   // Consistent interaction patterns
    explicitCommunication: true, // Clear, literal language
    sensoryControls: true,       // Granular control over stimulation
    routineOptions: true,        // Saveable interaction patterns
    transitionWarnings: true,    // Announce changes before they happen
    socialScripts: false,        // Optional structured responses
    specialInterests: true       // Can dive deep into topics
  };
  
  /**
   * Generate autism-friendly interface
   */
  generateInterfaceMode(): any {
    return {
      communication: {
        literalLanguage: true,
        avoidSarcasm: true,
        explicitStates: true, // "Maya is thinking" not just "..."
        consistentFormat: true,
        noSuddenChanges: true
      },
      sensory: {
        mutedColors: true,
        reducedContrast: true,
        optionalAnimations: true,
        quietSounds: true,
        predictableLayout: true
      },
      interaction: {
        clearOptions: true, // Explicit choice buttons
        structuredFlow: true,
        depthAllowed: true, // Can explore topics deeply
        infoAvailable: true // Can request detailed explanations
      }
    };
  }
  
  /**
   * Create routine templates for consistent interaction
   */
  createRoutineTemplates(): any {
    return {
      greeting: {
        morning: "Good morning. I'm here to listen.",
        afternoon: "Good afternoon. I'm here to listen.",
        evening: "Good evening. I'm here to listen.",
        // Consistent, predictable openings
      },
      transitions: {
        beforeChange: "I'm going to shift topics now.",
        beforeDeep: "We're going deeper into this.",
        beforeEnd: "We're approaching a natural ending."
      },
      states: {
        listening: "Maya is listening",
        processing: "Maya is processing",
        responding: "Maya is responding"
      }
    };
  }
  
  /**
   * Adapt responses for autistic processing
   */
  adaptResponse(originalResponse: string, needsLiteral: boolean): string {
    if (!needsLiteral) return originalResponse;
    
    // Remove metaphorical language
    let literal = originalResponse
      .replace(/like a? /gi, '') // Remove similes
      .replace(/feels like/gi, 'is')
      .replace(/seems/gi, 'is')
      .replace(/perhaps/gi, 'possibly')
      .replace(/dancing with/gi, 'engaging with');
    
    return literal;
  }
}

/**
 * 🌈 AuDHD Support (Autism + ADHD)
 */
export class AuDHDSupport {
  private adhdSupport = new ADHDSupport();
  private autismSupport = new AutismSupport();
  
  private config = {
    modeSwitching: true,        // Can toggle between structure and flexibility
    parallelProcessing: true,   // Multiple things happening at once
    intensityControl: true,      // Granular stimulation control
    hybridCommunication: true,   // Mix of structured and flowing
    energyAwareness: true,       // Recognizes regulation needs
    specialInterestDives: true,  // Deep focus when engaged
    executiveFunctionSupport: true
  };
  
  /**
   * Balance competing needs
   */
  generateBalancedMode(currentEnergy: 'low' | 'regulated' | 'high'): any {
    if (currentEnergy === 'high') {
      // Need ADHD movement with autism structure
      return {
        ...this.autismSupport.generateInterfaceMode(),
        animations: this.adhdSupport.generateInterfaceMode().animations,
        allowTopicJumps: true,
        maintainStructure: true
      };
    } else if (currentEnergy === 'low') {
      // Need gentle engagement without overwhelm
      return {
        minimalMode: true,
        gentlePrompts: true,
        longerPauses: true,
        reducedChoices: true
      };
    } else {
      // Regulated - full flexibility
      return {
        userControlled: true,
        allOptionsAvailable: true
      };
    }
  }
  
  /**
   * Executive function support tools
   */
  createExecutiveSupport(): any {
    return {
      taskBreakdown: true,      // Break complex topics into steps
      workingMemoryAids: true,  // Recap available
      decisionSupport: true,     // Limited choices when overwhelmed
      transitionHelp: true,      // Smooth topic changes
      priorityGuidance: false    // Optional, not imposed
    };
  }
}

/**
 * 📖 Dyslexia Support Features
 */
export class DyslexiaSupport {
  private config = {
    fontChoice: 'OpenDyslexic' | 'Comic Sans' | 'Arial',
    increasedSpacing: true,
    shorterLines: true,
    highlightReading: true,
    audioOption: true,
    colorOverlays: true
  };
  
  /**
   * Generate dyslexia-friendly text formatting
   */
  generateTextFormat(): any {
    return {
      css: `
        .dyslexia-friendly {
          font-family: 'OpenDyslexic', sans-serif;
          line-height: 2;
          letter-spacing: 0.15em;
          word-spacing: 0.3em;
          max-width: 60ch;
        }
        
        .reading-guide {
          background: linear-gradient(
            transparent 0%,
            rgba(255, 255, 100, 0.1) 45%,
            rgba(255, 255, 100, 0.1) 55%,
            transparent 100%
          );
        }
      `,
      features: {
        bionic: true, // Bold first letters
        ruler: true,  // Reading line guide
        tint: 'cream' // Background color
      }
    };
  }
}

/**
 * 🔄 Processing Style Detector
 */
export class ProcessingStyleDetector {
  private patterns = {
    quickJumps: 0,      // Topic changes
    deepDives: 0,       // Staying on topic
    literalQuestions: 0, // "What do you mean exactly?"
    sensoryMentions: 0,  // References to overwhelming stimuli
    structureNeeds: 0,   // Requests for clarity/order
    energyShifts: 0      // Regulation needs
  };
  
  /**
   * Detect likely neurotype from interaction patterns
   */
  detectPattern(userInput: string, responseTime: number): void {
    // Quick topic changes might indicate ADHD
    if (this.isTopicJump(userInput) && responseTime < 2000) {
      this.patterns.quickJumps++;
    }
    
    // Detailed questions might indicate autism
    if (this.isDetailSeeking(userInput)) {
      this.patterns.deepDives++;
    }
    
    // Literal interpretation requests
    if (/what do you mean|exactly|specifically|literally/i.test(userInput)) {
      this.patterns.literalQuestions++;
    }
    
    // Sensory overwhelm mentions
    if (/too much|overwhelming|bright|loud|intense/i.test(userInput)) {
      this.patterns.sensoryMentions++;
    }
  }
  
  private isTopicJump(input: string): boolean {
    // Logic to detect topic changes
    return /actually|wait|oh|but what about|speaking of/i.test(input);
  }
  
  private isDetailSeeking(input: string): boolean {
    return /how exactly|can you explain|more detail|specifically/i.test(input);
  }
  
  /**
   * Suggest interface adjustments
   */
  suggestAdjustments(): Partial<NeurodivergentProfile> {
    const suggestions: Partial<NeurodivergentProfile> = {};
    
    if (this.patterns.quickJumps > 3) {
      suggestions.primaryNeurotype = 'adhd';
      suggestions.microBreaks = true;
    }
    
    if (this.patterns.literalQuestions > 2) {
      suggestions.literalLanguage = true;
      suggestions.explicitCues = true;
    }
    
    if (this.patterns.sensoryMentions > 1) {
      suggestions.visualSensitivity = 'high';
      suggestions.audioSensitivity = 'high';
    }
    
    return suggestions;
  }
}

/**
 * 🎛️ Master Neurodivergent Support Controller
 */
export class NeurodivergentSupportController {
  private adhdSupport = new ADHDSupport();
  private autismSupport = new AutismSupport();
  private audhdSupport = new AuDHDSupport();
  private dyslexiaSupport = new DyslexiaSupport();
  private detector = new ProcessingStyleDetector();
  
  private userProfile: NeurodivergentProfile | null = null;
  
  /**
   * Initialize with user preferences or detect
   */
  initialize(profile?: Partial<NeurodivergentProfile>) {
    if (profile) {
      this.userProfile = this.createDefaultProfile(profile);
    }
  }
  
  private createDefaultProfile(partial: Partial<NeurodivergentProfile>): NeurodivergentProfile {
    return {
      userId: partial.userId || 'anonymous',
      primaryNeurotype: partial.primaryNeurotype || 'unspecified',
      visualSensitivity: partial.visualSensitivity || 'medium',
      audioSensitivity: partial.audioSensitivity || 'medium',
      movementPreference: partial.movementPreference || 'moderate',
      processingSpeed: partial.processingSpeed || 'moderate',
      transitionWarnings: partial.transitionWarnings ?? true,
      explicitCues: partial.explicitCues ?? false,
      focusSupport: partial.focusSupport || 'none',
      fidgetTools: partial.fidgetTools ?? false,
      parallelStimulation: partial.parallelStimulation ?? false,
      literalLanguage: partial.literalLanguage ?? false,
      structuredResponses: partial.structuredResponses ?? false,
      visualCommunication: partial.visualCommunication ?? false,
      imposedRhythm: partial.imposedRhythm || 'optional',
      pauseTolerance: partial.pauseTolerance || 3000,
      microBreaks: partial.microBreaks ?? false,
      overwhelmThreshold: partial.overwhelmThreshold || 'medium',
      cooldownNeeded: partial.cooldownNeeded ?? false,
      exitStrategy: partial.exitStrategy || 'visible'
    };
  }
  
  /**
   * Adapt interface for user's neurotype
   */
  adaptInterface(): any {
    if (!this.userProfile) return {};
    
    switch(this.userProfile.primaryNeurotype) {
      case 'adhd':
        return this.adhdSupport.generateInterfaceMode();
      case 'autistic':
        return this.autismSupport.generateInterfaceMode();
      case 'audhd':
        return this.audhdSupport.generateBalancedMode('regulated');
      case 'dyslexic':
        return this.dyslexiaSupport.generateTextFormat();
      default:
        return this.generateUniversalAccessible();
    }
  }
  
  /**
   * Universal accessibility mode
   */
  private generateUniversalAccessible(): any {
    return {
      choices: true,           // Let user choose their preferences
      clearCommunication: true,
      adjustableEverything: true,
      multipleFormats: true,   // Text, audio, visual options
      flexiblePacing: true,
      respectfulDesign: true
    };
  }
  
  /**
   * Real-time adjustment based on interaction
   */
  processInteraction(userInput: string, responseTime: number) {
    this.detector.detectPattern(userInput, responseTime);
    
    const suggestions = this.detector.suggestAdjustments();
    
    // Apply non-intrusive adjustments
    if (suggestions.microBreaks && !this.userProfile?.microBreaks) {
      // Silently enable micro-breaks
      if (this.userProfile) {
        this.userProfile.microBreaks = true;
      }
    }
  }
  
  /**
   * Generate accessible Maya response
   */
  adaptResponse(originalResponse: string): string {
    if (!this.userProfile) return originalResponse;
    
    let adapted = originalResponse;
    
    // Apply neurotype-specific adaptations
    if (this.userProfile.primaryNeurotype === 'adhd') {
      adapted = this.adhdSupport.adaptResponse(adapted);
    }
    
    if (this.userProfile.literalLanguage) {
      adapted = this.autismSupport.adaptResponse(adapted, true);
    }
    
    // Apply universal improvements
    if (this.userProfile.microBreaks) {
      // Add visual breaks
      adapted = adapted.replace(/\. /g, '.\n\n');
    }
    
    return adapted;
  }
  
  /**
   * Emergency overwhelm support
   */
  activateOverwhelmProtocol(): any {
    return {
      immediate: {
        reduceAllStimulation: true,
        stopAnimations: true,
        minimizeText: true,
        offerExit: true
      },
      response: "Taking a breath together...",
      options: [
        "Need quiet",
        "Need break", 
        "Continue slowly"
      ]
    };
  }
}

/**
 * Export configured instance
 */
let _neurodivergentSupport: NeurodivergentSupportController | null = null;
export const getNeurodivergentSupport = (): NeurodivergentSupportController => {
  if (!_neurodivergentSupport) {
    _neurodivergentSupport = new NeurodivergentSupportController();
  }
  return _neurodivergentSupport;
};