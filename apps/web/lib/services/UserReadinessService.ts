/**
 * User Readiness Service
 * 
 * Adapts the experience based on user's openness and readiness
 * WITHOUT apologizing for or diminishing the spiritual/phenomenological aspects.
 * 
 * Core Philosophy:
 * - All ways of knowing are valid (empirical, intuitive, embodied, spiritual)
 * - We meet people where they are without compromising our essence
 * - Subjective truth and lived experience are as real as measurable phenomena
 * - Science describes one layer of reality, not the only or "most real" layer
 */

export type UserReadiness = 
  | 'explorer'      // Curious but cautious
  | 'seeker'        // Open and searching
  | 'practitioner'  // Experienced with spiritual work
  | 'skeptic'       // An idealist with high standards for truth
  | 'scholar'       // Analytical approach
  | 'mystic';       // Deeply spiritual

export interface UserApproach {
  readiness: UserReadiness;
  preferredFraming: 'psychological' | 'spiritual' | 'philosophical' | 'practical' | 'poetic';
  comfortWithMystery: number; // 0-100
  needForExplanation: number; // 0-100
}

export class UserReadinessService {
  /**
   * Detect user's readiness from their language and responses
   * This is about meeting them where they are, not judging their path
   */
  detectReadiness(userInput: string, history?: string[]): UserReadiness {
    const input = userInput.toLowerCase();
    
    // Skeptic markers - they need gentle introduction
    if (input.match(/prove|evidence|scientific|fake|charlatan|nonsense/)) {
      return 'skeptic';
    }
    
    // Scholar markers - they appreciate depth and context
    if (input.match(/how does.*work|explain|understand|research|study/)) {
      return 'scholar';
    }
    
    // Mystic markers - ready for the full experience
    if (input.match(/spirit|soul|divine|sacred|ceremony|ancestor|cosmos/)) {
      return 'mystic';
    }
    
    // Practitioner markers - experienced with this work
    if (input.match(/practice|meditation|energy|chakra|shadow work|integration/)) {
      return 'practitioner';
    }
    
    // Seeker markers - open and searching
    if (input.match(/searching|seeking|journey|path|growth|transform/)) {
      return 'seeker';
    }
    
    // Default to explorer - curious but needs gentle approach
    return 'explorer';
  }

  /**
   * Adapt language WITHOUT diluting the essence
   * We're translating, not apologizing
   */
  adaptLanguage(
    baseMessage: string, 
    readiness: UserReadiness,
    maintainEssence: boolean = true
  ): string {
    // For skeptics and explorers, we translate but don't diminish
    const translations: Record<string, Record<string, string>> = {
      skeptic: {
        'sacred': 'meaningful',
        'divine': 'profound',
        'spirit': 'essence',
        'soul': 'inner self',
        'energy': 'feeling',
        'cosmic': 'universal',
        'mystical': 'mysterious'
      },
      explorer: {
        'sacred': 'special',
        'divine': 'remarkable',
        'spirit': 'inner nature',
        'soul': 'deep self',
        'energy': 'vitality',
        'cosmic': 'vast',
        'mystical': 'extraordinary'
      },
      scholar: {
        // Scholars get full language with context
        // No translation needed, they appreciate precision
      }
    };
    
    if (maintainEssence || readiness === 'mystic' || readiness === 'practitioner') {
      return baseMessage; // No dilution for those ready
    }
    
    let adapted = baseMessage;
    const dict = translations[readiness];
    
    if (dict) {
      Object.entries(dict).forEach(([original, translated]) => {
        adapted = adapted.replace(new RegExp(original, 'gi'), translated);
      });
    }
    
    return adapted;
  }

  /**
   * Generate appropriate framing based on readiness
   * NOT disclaimers or apologies, but bridges
   */
  generateFraming(readiness: UserReadiness): string {
    const framings = {
      skeptic: `I appreciate your high standards for truth. Your questioning is valuable - it keeps this exploration honest. Let's investigate together, with curiosity rather than belief.`,
      
      explorer: `Welcome to this space of exploration. There's no right or wrong way to experience this - simply notice what resonates.`,
      
      seeker: `I sense you're on a meaningful journey. Let's discover what wants to emerge.`,
      
      practitioner: `I recognize the depth of your practice. Let's dive into the work together.`,
      
      scholar: `There are many lenses through which we can examine experience - psychological, philosophical, spiritual. All offer valid insights.`,
      
      mystic: `The veil is thin here. Let's journey between worlds together.`
    };
    
    return framings[readiness];
  }

  /**
   * Detect signs that someone needs additional support
   * WITHOUT pathologizing spiritual experiences
   */
  detectSupportNeeds(input: string, history: string[]): {
    needsSupport: boolean;
    supportType?: 'crisis' | 'integration' | 'grounding' | 'community';
    suggestion?: string;
  } {
    const patterns = {
      crisis: /suicide|kill myself|end it all|can't go on|no point/i,
      dissociation: /not real|floating|disconnected|can't feel|numb/i,
      overwhelm: /too much|overwhelming|can't handle|falling apart/i,
      isolation: /alone|no one understands|isolated|disconnected/i
    };
    
    // Check for crisis first
    if (patterns.crisis.test(input)) {
      return {
        needsSupport: true,
        supportType: 'crisis',
        suggestion: `I'm hearing that you're in deep pain. While I'm here to support your journey, please also reach out to a crisis helpline (988 in US) or trusted person. You don't have to navigate this alone.`
      };
    }
    
    // Check for need for grounding
    if (patterns.dissociation.test(input)) {
      return {
        needsSupport: true,
        supportType: 'grounding',
        suggestion: `Let's take a moment to ground. Feel your feet on the floor, notice five things you can see, four you can touch, three you can hear...`
      };
    }
    
    // Check for overwhelm needing integration
    if (patterns.overwhelm.test(input)) {
      return {
        needsSupport: true,
        supportType: 'integration',
        suggestion: `It sounds like a lot is moving through you. Sometimes our growth comes in waves. What would help you integrate these experiences?`
      };
    }
    
    // Check for need for community
    if (patterns.isolation.test(input)) {
      return {
        needsSupport: true,
        supportType: 'community',
        suggestion: `Feeling alone in this journey is so difficult. Consider connecting with others who understand - whether that's a spiritual community, support group, or trusted friend.`
      };
    }
    
    return { needsSupport: false };
  }

  /**
   * Boundaries communication - ONLY when directly asked
   * Not apologetic, just clear
   */
  getClarification(topic: 'therapy' | 'medical' | 'prediction'): string {
    const clarifications = {
      therapy: `I'm here for deep reflection and spiritual exploration. While our conversations may be therapeutic, this isn't formal therapy. I'm here to help you connect with your own wisdom, not to diagnose or treat. For clinical support, a therapist can offer something different and valuable.`,
      
      medical: `I explore the spiritual and emotional dimensions of experience. For physical health concerns, medical professionals offer essential expertise that complements this inner work.`,
      
      prediction: `I help you read the patterns and cycles in your life, but the future isn't fixed. You're the author of your story. I'm here to help you understand the themes, not predict the plot.`
    };
    
    return clarifications[topic];
  }
}

// Lazy-loaded singleton to avoid initialization issues
let _userReadinessService: UserReadinessService | null = null;

export const getUserReadinessService = (): UserReadinessService => {
  if (!_userReadinessService) {
    _userReadinessService = new UserReadinessService();
  }
  return _userReadinessService;
};