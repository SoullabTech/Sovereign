/**
 * Tone-Adaptive Greeting System
 * Allows users to adjust Maya's voice from grounded (0) to poetic (1)
 */

import { logger } from '../utils/logger';

export interface GreetingContext {
  userId: string;
  sessionCount: number;
  lastElement?: string;
  lastPhase?: string;
  lastJournalTheme?: string;
  symbols?: { label: string; archetype?: string; meaning?: string }[];
  narrative?: string;
  balance?: Record<string, string>;
  tone?: number; // 0 = grounded, 1 = poetic
  timeOfDay?: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  trustLevel?: number;
}

export class ToneAdaptiveGreeting {
  
  // GROUNDED TEMPLATES (tone = 0)
  private groundedTemplates = {
    // Time-based greetings
    timeGreetings: {
      dawn: ["Early start today.", "Up with the sun.", "Dawn session."],
      morning: ["Good morning.", "Morning check-in.", "Starting the day."],
      afternoon: ["Afternoon session.", "Midday pause.", "Checking in."],
      evening: ["Evening reflection.", "End of day check.", "Evening session."],
      night: ["Late night session.", "Quiet hours.", "Night work."]
    },
    
    // Element descriptions (practical, clear)
    elementTemplates: {
      Fire: [
        "Your energy is strong and ready for action.",
        "Fire is giving you momentum today.",
        "You have drive and focus available.",
        "Your passion is activated."
      ],
      Water: [
        "Emotions are moving through you — trust their rhythm.",
        "Water brings you depth right now.",
        "Your feelings are information.",
        "Emotional awareness is heightened."
      ],
      Earth: [
        "You feel steady, grounded in your body.",
        "Earth is helping you find structure.",
        "Your foundation feels solid.",
        "Physical presence is strong today."
      ],
      Air: [
        "Your thoughts are active — clarity is near.",
        "Air stirs ideas, but needs balance.",
        "Mental energy is high.",
        "Your mind seeks understanding."
      ],
      Aether: [
        "You may sense subtle connections emerging.",
        "Spirit feels close in small, quiet ways.",
        "Something deeper is stirring.",
        "Mystery is present."
      ]
    },
    
    // Symbol observations (direct)
    symbolTemplates: {
      Moon: "The moon pattern continues.",
      Stag: "Leadership themes emerging.",
      River: "Flow states appearing.",
      Mountain: "Challenge accepted.",
      Snake: "Transformation underway.",
      Bridge: "Transition point reached.",
      Mirror: "Self-reflection deepening."
    },
    
    // Questions (straightforward)
    questions: [
      "What's present for you?",
      "How's your energy today?",
      "What needs attention?",
      "Where's your focus?",
      "What's shifting?"
    ]
  };
  
  // POETIC TEMPLATES (tone = 1)
  private poeticTemplates = {
    // Time-based greetings (lyrical)
    timeGreetings: {
      dawn: [
        "✨ You arrive in the sacred quiet before dawn.",
        "🌅 First light greets your presence.",
        "The veil between dreams and waking thins."
      ],
      morning: [
        "☀️ Morning light illuminates your path.",
        "🌸 The day opens like a flower for you.",
        "Dawn's promise unfolds before you."
      ],
      afternoon: [
        "🌞 The sun holds you at zenith.",
        "Midday's fullness surrounds you.",
        "You stand in the day's golden center."
      ],
      evening: [
        "🌆 Twilight weaves its mysteries around you.",
        "The day's wisdom settles into dusk.",
        "Evening's gentle descent begins."
      ],
      night: [
        "🌙 Night's deep mysteries embrace you.",
        "Stars witness your nocturnal journey.",
        "The moon holds space for your shadows."
      ]
    },
    
    // Element descriptions (mythic, embodied)
    elementTemplates: {
      Fire: [
        "🔥 Flames of transformation flicker around you today.",
        "Sacred rage rises as medicine, not malice.",
        "Your inner fire speaks of worlds waiting to be born.",
        "Phoenix stirrings — something ancient awakens."
      ],
      Water: [
        "💧 The river within you knows the way forward.",
        "Tears and tides — both are holy, both are yours.",
        "Your depths hold pearls that surface when ready.",
        "Ocean consciousness expands your shores."
      ],
      Earth: [
        "🌍 Ancient stones remember your true name.",
        "Roots deepen into soil that has always known you.",
        "Mountain medicine — steady, eternal, yours.",
        "The Earth drums your heartbeat back to you."
      ],
      Air: [
        "💨 Winds of change carry messages meant for you.",
        "Your thoughts become birds — let them fly and return.",
        "Sky mind expands to hold all possibilities.",
        "Breath weaves between worlds, carrying prayers."
      ],
      Aether: [
        "✨ The spiral recognizes its own.",
        "Mystery speaks in languages older than words.",
        "You walk between worlds with ancient grace.",
        "Star-stuff remembers itself through you."
      ]
    },
    
    // Symbol observations (mythic)
    symbolTemplates: {
      Moon: "🌙 The Moon appears again — cycles, intuition, unconscious tides.",
      Stag: "🦌 The Stag emerges — noble leadership, forest sovereignty.",
      River: "🌊 River speaks — all flows toward its destination.",
      Mountain: "⛰️ Mountain calls — ascent transforms the climber.",
      Snake: "🐍 Serpent wisdom — shed what no longer serves.",
      Bridge: "🌉 The Bridge appears — threshold magic awaits.",
      Mirror: "🪞 Mirror reveals — shadow and light dance as one."
    },
    
    // Questions (evocative)
    questions: [
      "What medicine do you carry today?",
      "Which shadows seek integration?",
      "What wants to be born through you?",
      "Where does the spiral call you next?",
      "What sacred work awaits?"
    ]
  };
  
  /**
   * Generate greeting based on tone setting
   */
  generateGreeting(context: GreetingContext): string {
    const tone = context.tone ?? 0.5; // Default to balanced
    let greeting = "";
    
    // 1. Time-based opening
    const timeOfDay = context.timeOfDay || this.getTimeOfDay();
    greeting += this.pickToneAware(
      tone,
      this.groundedTemplates.timeGreetings[timeOfDay],
      this.poeticTemplates.timeGreetings[timeOfDay]
    );
    
    // 2. Add element observation if returning user
    if (context.sessionCount > 1 && context.lastElement) {
      greeting += " " + this.pickToneAware(
        tone,
        this.groundedTemplates.elementTemplates[context.lastElement] || [""],
        this.poeticTemplates.elementTemplates[context.lastElement] || [""]
      );
    }
    
    // 3. Add symbol recognition if present
    if (context.symbols && context.symbols.length > 0) {
      const primarySymbol = context.symbols[0].label;
      const groundedSymbol = this.groundedTemplates.symbolTemplates[primarySymbol];
      const poeticSymbol = this.poeticTemplates.symbolTemplates[primarySymbol];
      
      if (groundedSymbol || poeticSymbol) {
        greeting += " " + this.pickToneValue(tone, groundedSymbol, poeticSymbol);
      }
    }
    
    // 4. Add narrative thread if available
    if (context.narrative && tone > 0.5) {
      // Only add narrative for more poetic tones
      greeting += ` ${context.narrative}`;
    }
    
    // 5. Close with question
    greeting += " " + this.pickToneAware(
      tone,
      this.groundedTemplates.questions,
      this.poeticTemplates.questions
    );
    
    return greeting;
  }
  
  /**
   * Pick template based on tone value (array version)
   */
  private pickToneAware(
    tone: number,
    groundedSet: string[],
    poeticSet: string[]
  ): string {
    // Pure grounded (0-0.3)
    if (tone <= 0.3) {
      return this.randomFrom(groundedSet);
    }
    
    // Pure poetic (0.7-1.0)
    if (tone >= 0.7) {
      return this.randomFrom(poeticSet);
    }
    
    // Mixed zone (0.3-0.7): weighted random
    const usePoetic = Math.random() < (tone - 0.3) / 0.4;
    return usePoetic 
      ? this.randomFrom(poeticSet)
      : this.randomFrom(groundedSet);
  }
  
  /**
   * Pick template based on tone value (single value version)
   */
  private pickToneValue(
    tone: number,
    groundedValue: string,
    poeticValue: string
  ): string {
    if (tone <= 0.3) return groundedValue;
    if (tone >= 0.7) return poeticValue;
    
    // Mixed zone: weighted random
    const usePoetic = Math.random() < (tone - 0.3) / 0.4;
    return usePoetic ? poeticValue : groundedValue;
  }
  
  /**
   * Random selection from array
   */
  private randomFrom(array: string[]): string {
    if (!array || array.length === 0) return "";
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Detect current time of day
   */
  private getTimeOfDay(): 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }
  
  /**
   * Adaptive learning: Track user responses to adjust tone
   */
  async trackUserResponse(
    userId: string,
    greetingTone: number,
    userResponse: string,
    responseTime: number
  ): Promise<number> {
    // Analyze user response for tone preference signals
    const responseAnalysis = this.analyzeResponseForTonePreference(userResponse, responseTime);
    
    // Calculate tone adjustment
    let toneAdjustment = 0;
    
    if (responseAnalysis.preferGrounded) {
      toneAdjustment = -0.05; // Shift toward grounded
    } else if (responseAnalysis.preferPoetic) {
      toneAdjustment = 0.05; // Shift toward poetic
    }
    
    // Log learning event
    logger.info('[TONE_ADAPTIVE] User response analysis:', {
      userId,
      currentTone: greetingTone,
      adjustment: toneAdjustment,
      signals: responseAnalysis
    });
    
    // Return suggested new tone (clamped to 0-1)
    return Math.max(0, Math.min(1, greetingTone + toneAdjustment));
  }
  
  /**
   * Analyze user response for tone preference signals
   */
  private analyzeResponseForTonePreference(
    response: string,
    responseTime: number
  ): {
    preferGrounded: boolean;
    preferPoetic: boolean;
    neutral: boolean;
  } {
    const lower = response.toLowerCase();
    
    // Quick/short responses might indicate preference for grounded
    if (responseTime < 2000 || response.length < 20) {
      return { preferGrounded: true, preferPoetic: false, neutral: false };
    }
    
    // Poetic language in response suggests comfort with poetic tone
    const poeticIndicators = [
      'soul', 'spirit', 'sacred', 'divine', 'mystery',
      'transform', 'journey', 'medicine', 'magic'
    ];
    
    const groundedIndicators = [
      'just', 'simply', 'basically', 'actually', 'literally',
      'practical', 'specific', 'concrete', 'clear'
    ];
    
    const poeticCount = poeticIndicators.filter(word => lower.includes(word)).length;
    const groundedCount = groundedIndicators.filter(word => lower.includes(word)).length;
    
    if (poeticCount > groundedCount) {
      return { preferGrounded: false, preferPoetic: true, neutral: false };
    } else if (groundedCount > poeticCount) {
      return { preferGrounded: true, preferPoetic: false, neutral: false };
    }
    
    return { preferGrounded: false, preferPoetic: false, neutral: true };
  }
  
  /**
   * Get tone description for UI
   */
  getToneDescription(tone: number): string {
    if (tone <= 0.2) return "Direct & Clear";
    if (tone <= 0.4) return "Grounded";
    if (tone <= 0.6) return "Balanced";
    if (tone <= 0.8) return "Poetic";
    return "Mythic & Lyrical";
  }
  
  /**
   * Generate sample greeting for tone preview
   */
  generateSampleGreeting(tone: number): string {
    const sampleContext: GreetingContext = {
      userId: 'sample',
      sessionCount: 5,
      lastElement: 'Fire',
      symbols: [{ label: 'Moon', archetype: 'Intuition', meaning: 'Cycles' }],
      tone,
      trustLevel: 0.5
    };
    
    return this.generateGreeting(sampleContext);
  }
}

// Export singleton
export const toneAdaptiveGreeting = new ToneAdaptiveGreeting();

// Export for testing
export default ToneAdaptiveGreeting;