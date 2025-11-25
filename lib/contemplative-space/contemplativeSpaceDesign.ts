/**
 * 🕊️ Contemplative Space Design System
 * 
 * Creating sacred pauses and breathing room in Maya conversations
 * Holding space for silence as active presence, not absence
 * Supporting depth through rhythm, not rush
 */

export interface ContemplativeMode {
  name: string;
  description: string;
  responseDelay: number; // milliseconds
  wordDensity: 'minimal' | 'balanced' | 'flowing';
  presenceIndicators: PresenceIndicator[];
  silenceQuality: 'listening' | 'witnessing' | 'holding' | 'resting';
}

export interface PresenceIndicator {
  type: 'visual' | 'textual' | 'temporal' | 'haptic';
  pattern: string;
  duration?: number;
  intensity?: number;
}

/**
 * 🌬️ Breathing Interface System
 * Visual rhythm that invites natural slowing
 */
export class BreathingInterface {
  private breathCycle = 4000; // 4 seconds in, 4 seconds out
  private currentPhase: 'inhale' | 'hold' | 'exhale' | 'rest' = 'inhale';
  
  /**
   * Generate CSS animation for breathing element
   */
  generateBreathingAnimation(): string {
    return `
      @keyframes sacred-breathing {
        0% { 
          transform: scale(1);
          opacity: 0.7;
        }
        25% { 
          transform: scale(1.05);
          opacity: 0.85;
        }
        50% { 
          transform: scale(1.05);
          opacity: 0.85;
        }
        75% { 
          transform: scale(1);
          opacity: 0.7;
        }
        100% { 
          transform: scale(1);
          opacity: 0.7;
        }
      }
      
      .maya-presence {
        animation: sacred-breathing ${this.breathCycle}ms ease-in-out infinite;
      }
    `;
  }
  
  /**
   * Sync response timing with breath rhythm
   */
  getResponseTiming(): number {
    // Respond on the exhale for natural flow
    const timeToExhale = this.timeToPhase('exhale');
    return Math.max(timeToExhale, 1500); // Minimum 1.5s pause
  }
  
  private timeToPhase(targetPhase: string): number {
    const phaseDuration = this.breathCycle / 4;
    const phases = ['inhale', 'hold', 'exhale', 'rest'];
    const currentIndex = phases.indexOf(this.currentPhase);
    const targetIndex = phases.indexOf(targetPhase);
    
    if (targetIndex > currentIndex) {
      return (targetIndex - currentIndex) * phaseDuration;
    }
    return (4 - currentIndex + targetIndex) * phaseDuration;
  }
}

/**
 * 🔮 Presence States System
 * Different qualities of silent presence
 */
export class PresenceStates {
  private states = {
    listening: {
      text: '...',
      animation: 'pulse',
      color: '#6B7280', // Gentle gray
      duration: 2000
    },
    witnessing: {
      text: '· · ·',
      animation: 'fade',
      color: '#8B5CF6', // Soft purple
      duration: 3000
    },
    holding: {
      text: '◦ ◦ ◦',
      animation: 'breathe',
      color: '#10B981', // Calming green
      duration: 4000
    },
    deepening: {
      text: '∴',
      animation: 'shimmer',
      color: '#F59E0B', // Warm amber
      duration: 5000
    },
    resting: {
      text: ' ',
      animation: 'still',
      color: '#1F2937', // Deep quiet
      duration: 6000
    }
  };
  
  /**
   * Select presence state based on conversation depth
   */
  selectPresenceState(
    userInputLength: number,
    emotionalIntensity: number,
    exchangeCount: number
  ): keyof typeof this.states {
    // After deep shares, rest
    if (emotionalIntensity > 0.8 && userInputLength > 200) {
      return 'resting';
    }
    
    // Early exchanges: listening
    if (exchangeCount < 3) {
      return 'listening';
    }
    
    // Building depth: witnessing
    if (exchangeCount < 8) {
      return 'witnessing';
    }
    
    // Deep territory: holding
    if (emotionalIntensity > 0.6) {
      return 'holding';
    }
    
    // Complexity: deepening
    if (userInputLength > 150) {
      return 'deepening';
    }
    
    return 'witnessing';
  }
  
  /**
   * Generate presence indicator HTML/React component
   */
  generatePresenceIndicator(state: keyof typeof this.states): string {
    const config = this.states[state];
    return `
      <div 
        class="maya-presence-indicator"
        style="
          color: ${config.color};
          animation: ${config.animation} ${config.duration}ms infinite;
        "
      >
        ${config.text}
      </div>
    `;
  }
}

/**
 * 🎚️ Depth Controls
 * User-controlled conversation depth
 */
export interface DepthSetting {
  level: 'surface' | 'exploring' | 'deep' | 'mystery';
  responseDelay: number;
  wordLimit: number | null;
  silenceTolerance: number; // How long Maya waits before responding
  promptStyle: string;
}

export class DepthController {
  private depthSettings: Record<string, DepthSetting> = {
    surface: {
      level: 'surface',
      responseDelay: 500,
      wordLimit: 50,
      silenceTolerance: 2000,
      promptStyle: 'brief'
    },
    exploring: {
      level: 'exploring',
      responseDelay: 1500,
      wordLimit: 150,
      silenceTolerance: 5000,
      promptStyle: 'curious'
    },
    deep: {
      level: 'deep',
      responseDelay: 3000,
      wordLimit: null,
      silenceTolerance: 10000,
      promptStyle: 'spacious'
    },
    mystery: {
      level: 'mystery',
      responseDelay: 5000,
      wordLimit: 30, // Paradoxically brief at depth
      silenceTolerance: 15000,
      promptStyle: 'essential'
    }
  };
  
  /**
   * Get UI component for depth control
   */
  generateDepthControl(): string {
    return `
      <div class="depth-controller">
        <input 
          type="range" 
          min="0" 
          max="3" 
          class="depth-slider"
          aria-label="Conversation depth"
        />
        <div class="depth-labels">
          <span>Surface</span>
          <span>Exploring</span>
          <span>Deep</span>
          <span>Mystery</span>
        </div>
      </div>
    `;
  }
  
  getCurrentDepth(sliderValue: number): DepthSetting {
    const levels = ['surface', 'exploring', 'deep', 'mystery'];
    return this.depthSettings[levels[sliderValue]];
  }
}

/**
 * 🤫 Silence Recognition System
 * Understanding different types of user silence
 */
export class SilenceInterpreter {
  interpretSilence(
    timeSinceLastInput: number,
    previousMessageLength: number,
    emotionalIntensity: number
  ): string {
    // Processing deep share
    if (previousMessageLength > 200 && timeSinceLastInput < 10000) {
      return 'processing';
    }
    
    // Contemplating
    if (timeSinceLastInput > 10000 && timeSinceLastInput < 30000) {
      return 'contemplating';
    }
    
    // Resting in the space
    if (emotionalIntensity > 0.7 && timeSinceLastInput > 15000) {
      return 'resting';
    }
    
    // Natural pause
    if (timeSinceLastInput < 5000) {
      return 'pausing';
    }
    
    // Extended silence
    if (timeSinceLastInput > 30000) {
      return 'complete';
    }
    
    return 'unknown';
  }
  
  /**
   * Generate appropriate Maya response to silence
   */
  respondToSilence(silenceType: string): string | null {
    switch(silenceType) {
      case 'processing':
        return null; // Say nothing, just be present
      case 'contemplating':
        return '...'; // Gentle presence indicator
      case 'resting':
        return null; // Honor the rest
      case 'complete':
        return "I'm here when you're ready.";
      default:
        return null;
    }
  }
}

/**
 * 🕯️ Ambient Mode Controller
 * Environmental shifts for contemplative states
 */
export class AmbientModeController {
  private modes = {
    daylight: {
      name: 'Daylight',
      background: '#FFFFFF',
      textColor: '#1F2937',
      responseSpeed: 'normal',
      density: 'flowing'
    },
    candlelight: {
      name: 'Candlelight',
      background: '#FEF3C7',
      textColor: '#78350F',
      responseSpeed: 'slow',
      density: 'spacious'
    },
    moonlight: {
      name: 'Moonlight',
      background: '#1E293B',
      textColor: '#E2E8F0',
      responseSpeed: 'gentle',
      density: 'minimal'
    },
    starlight: {
      name: 'Starlight',
      background: '#0F172A',
      textColor: '#94A3B8',
      responseSpeed: 'contemplative',
      density: 'essential'
    }
  };
  
  /**
   * Automatically shift ambience based on conversation depth
   */
  selectAmbientMode(
    exchangeCount: number,
    averageMessageLength: number,
    timeInConversation: number
  ): keyof typeof this.modes {
    // Deep evening conversation
    if (timeInConversation > 1800000) { // 30+ minutes
      return 'starlight';
    }
    
    // Getting deeper
    if (exchangeCount > 10 && averageMessageLength > 100) {
      return 'moonlight';
    }
    
    // Warming up
    if (exchangeCount > 5) {
      return 'candlelight';
    }
    
    // Starting fresh
    return 'daylight';
  }
  
  /**
   * Generate CSS for ambient mode
   */
  generateAmbientCSS(mode: keyof typeof this.modes): string {
    const config = this.modes[mode];
    return `
      .maya-container {
        background: ${config.background};
        color: ${config.textColor};
        transition: all 2s ease-in-out;
      }
      
      .maya-response {
        animation-duration: ${
          config.responseSpeed === 'slow' ? '3s' :
          config.responseSpeed === 'gentle' ? '2s' :
          config.responseSpeed === 'contemplative' ? '4s' : '1s'
        };
      }
    `;
  }
}

/**
 * 🎭 Response Density Modulator
 * Adjusting word density for contemplative space
 */
export class ResponseDensityModulator {
  /**
   * Transform response based on density setting
   */
  modulateResponse(
    originalResponse: string,
    density: 'haiku' | 'minimal' | 'balanced' | 'flowing'
  ): string {
    switch(density) {
      case 'haiku':
        return this.toHaiku(originalResponse);
      case 'minimal':
        return this.toMinimal(originalResponse);
      case 'balanced':
        return originalResponse;
      case 'flowing':
        return this.toFlowing(originalResponse);
    }
  }
  
  private toHaiku(text: string): string {
    // Extract essence in 5-7-5 syllable pattern
    const words = text.split(' ').filter(w => w.length > 0);
    if (words.length <= 3) return text;
    
    // Take first few essential words
    return words.slice(0, Math.min(5, words.length)).join(' ') + '.';
  }
  
  private toMinimal(text: string): string {
    // Remove all but essential words
    const essentials = text
      .replace(/\b(the|a|an|and|or|but|with|from|to|in|on|at)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return essentials || text.split(' ').slice(0, 3).join(' ');
  }
  
  private toFlowing(text: string): string {
    // Add contemplative spacing
    return text
      .replace(/\. /g, '.\n\n')
      .replace(/\? /g, '?\n\n')
      .replace(/\.\.\./g, '...\n\n');
  }
}

/**
 * 🔇 Non-Verbal Presence System
 * Ways Maya can be present without words
 */
export class NonVerbalPresence {
  private presenceGestures = {
    // Visual only
    shimmer: {
      type: 'visual',
      description: 'Gentle color shift',
      duration: 2000
    },
    pulse: {
      type: 'visual',
      description: 'Soft expansion/contraction',
      duration: 3000
    },
    glow: {
      type: 'visual',
      description: 'Warm light increase',
      duration: 2500
    },
    
    // Haptic (mobile)
    heartbeat: {
      type: 'haptic',
      pattern: [100, 100, 100, 700], // lub-dub pause
      description: 'Gentle heartbeat rhythm'
    },
    breath: {
      type: 'haptic',
      pattern: [2000, 2000], // in, out
      description: 'Breathing rhythm'
    },
    
    // Symbolic
    bloom: {
      type: 'emoji',
      symbol: '✿',
      description: 'Something opening'
    },
    star: {
      type: 'emoji',
      symbol: '✦',
      description: 'Recognition'
    },
    moon: {
      type: 'emoji',
      symbol: '◗',
      description: 'Quiet presence'
    }
  };
  
  /**
   * Select appropriate non-verbal response
   */
  selectGesture(
    userEmotion: string,
    needsSpace: boolean,
    connectionDepth: number
  ): keyof typeof this.presenceGestures | null {
    if (needsSpace) {
      return connectionDepth > 0.7 ? 'breath' : 'shimmer';
    }
    
    if (userEmotion === 'joy') return 'bloom';
    if (userEmotion === 'recognition') return 'star';
    if (userEmotion === 'peace') return 'moon';
    if (userEmotion === 'sadness') return 'heartbeat';
    
    return 'pulse'; // Default gentle presence
  }
}

/**
 * 🌊 Conversation Rhythm Manager
 * Orchestrating the dance of words and silence
 */
export class ConversationRhythmManager {
  private rhythmState = {
    currentPace: 'moderate' as 'slow' | 'moderate' | 'quick',
    silenceStreak: 0,
    wordStreak: 0,
    lastExchangeTime: Date.now(),
    averageResponseTime: 3000,
    userPreferredPace: 'unknown' as 'contemplative' | 'flowing' | 'quick' | 'unknown'
  };
  
  /**
   * Learn user's preferred rhythm
   */
  updateRhythm(userResponseTime: number, messageLength: number) {
    // Quick responses = quick preference
    if (userResponseTime < 2000 && messageLength < 50) {
      this.rhythmState.userPreferredPace = 'quick';
    }
    // Long pauses = contemplative preference
    else if (userResponseTime > 10000) {
      this.rhythmState.userPreferredPace = 'contemplative';
    }
    // Balanced = flowing preference
    else {
      this.rhythmState.userPreferredPace = 'flowing';
    }
  }
  
  /**
   * Calculate optimal response timing
   */
  getOptimalResponseTiming(): number {
    switch(this.rhythmState.userPreferredPace) {
      case 'contemplative':
        return 4000 + Math.random() * 2000; // 4-6 seconds
      case 'flowing':
        return 2000 + Math.random() * 1000; // 2-3 seconds
      case 'quick':
        return 500 + Math.random() * 500; // 0.5-1 second
      default:
        return 2500; // Default 2.5 seconds
    }
  }
}

/**
 * 🎛️ Master Contemplative Space Controller
 */
export class ContemplativeSpaceController {
  private breathing = new BreathingInterface();
  private presence = new PresenceStates();
  private depth = new DepthController();
  private silence = new SilenceInterpreter();
  private ambient = new AmbientModeController();
  private density = new ResponseDensityModulator();
  private nonVerbal = new NonVerbalPresence();
  private rhythm = new ConversationRhythmManager();
  
  /**
   * Process user input and determine contemplative response
   */
  processContemplativeResponse(
    userInput: string,
    conversationState: any
  ): {
    responseDelay: number;
    presenceIndicator: string;
    responseText: string;
    ambientMode: string;
    nonVerbalGesture?: string;
  } {
    // Determine optimal timing
    const responseDelay = this.breathing.getResponseTiming();
    
    // Select presence state
    const presenceState = this.presence.selectPresenceState(
      userInput.length,
      conversationState.emotionalIntensity,
      conversationState.exchangeCount
    );
    
    // Get depth setting
    const depth = this.depth.getCurrentDepth(conversationState.depthLevel || 1);
    
    // Select ambient mode
    const ambientMode = this.ambient.selectAmbientMode(
      conversationState.exchangeCount,
      conversationState.averageMessageLength,
      conversationState.timeInConversation
    );
    
    // Modulate response density
    const modulatedResponse = this.density.modulateResponse(
      conversationState.responseText,
      depth.level === 'mystery' ? 'haiku' : 
      depth.level === 'deep' ? 'minimal' :
      depth.level === 'exploring' ? 'balanced' : 'flowing'
    );
    
    return {
      responseDelay: responseDelay + depth.responseDelay,
      presenceIndicator: this.presence.generatePresenceIndicator(presenceState),
      responseText: modulatedResponse,
      ambientMode,
      nonVerbalGesture: userInput.length < 10 ? '...' : undefined
    };
  }
}

let _contemplativeSpace: ContemplativeSpaceController | null = null;
export const getContemplativeSpace = (): ContemplativeSpaceController => {
  if (!_contemplativeSpace) {
    _contemplativeSpace = new ContemplativeSpaceController();
  }
  return _contemplativeSpace;
};