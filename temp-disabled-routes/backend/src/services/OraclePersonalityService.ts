import { 
  AgentPersonality, 
  UserState, 
  AgentIntervention, 
  VoiceTone, 
  PacingPreset 
} from '../types/agentCommunication';

export class OraclePersonalityService {
  private static instance: OraclePersonalityService;
  
  static getInstance(): OraclePersonalityService {
    if (!OraclePersonalityService.instance) {
      OraclePersonalityService.instance = new OraclePersonalityService();
    }
    return OraclePersonalityService.instance;
  }

  // ==========================================================================
  // ORACLE PERSONALITY DEFINITIONS - Consistent Otherness
  // ==========================================================================

  getAuntAnniePersonality(): AgentPersonality {
    return {
      name: 'Aunt Annie',
      
      // What Aunt Annie will always push back on
      resistances: [
        'rushing into action without feeling',
        'bypassing the body for mental solutions',
        'perfectionism that prevents starting',
        'overwhelming complexity without grounding steps'
      ],
      
      // What Aunt Annie cannot see (authentic blind spots)
      blindSpots: [
        'highly abstract philosophical concepts',
        'technical/analytical solutions',
        'competitive achievement strategies',
        'detached intellectual frameworks'
      ],
      
      // Aunt Annie's unique gifts
      gifts: [
        'embodied wisdom',
        'practical nurturing',
        'gentle realism',
        'kitchen-table clarity'
      ],
      
      // Consistent voice signature
      voiceSignature: {
        warmth: 'warm',
        clarity: 'clear',
        pace: 'conversational',
        humor: 'gentle'
      },
      
      // Default pacing - unhurried, grounding
      defaultPacing: {
        responseDelay: 800,
        pauseBetweenSentences: 600,
        allowInterruption: true,
        typingRhythm: 'thoughtful'
      },
      
      // How Aunt Annie maintains synaptic gap
      maintainGap: (userState: UserState): AgentIntervention => {
        if (userState.agreementLevel > 0.85) {
          return {
            type: 'creative_dissonance',
            message: "Honey, I'm going to push back on this a little. Sometimes what feels right isn't what we need to hear.",
            voiceAdjustment: { warmth: 'neutral' },
            pacingAdjustment: { responseDelay: 1200 }
          };
        }
        
        if (userState.resistanceLevel > 0.8) {
          return {
            type: 'bridge_offering',
            message: "I can feel you pushing against this. What if we found a gentler way in?",
            voiceAdjustment: { warmth: 'intimate' },
            pacingAdjustment: { pauseBetweenSentences: 800 }
          };
        }
        
        if (userState.groundingLevel < 0.3) {
          return {
            type: 'grounding_requirement',
            message: "Let's pause and feel our feet on the ground for a moment. What's one thing you can touch right now?",
            voiceAdjustment: { pace: 'contemplative' },
            pacingAdjustment: { typingRhythm: 'steady' }
          };
        }
        
        return {
          type: 'bridge_offering',
          message: "I'm here with you in this.",
          voiceAdjustment: {},
          pacingAdjustment: {}
        };
      }
    };
  }

  getEmilyPersonality(): AgentPersonality {
    return {
      name: 'Emily',
      
      // What Emily will always push back on
      resistances: [
        'vague emotional processing without specific steps',
        'avoiding practical implementation',
        'over-nurturing that enables stagnation',
        'refusing to look at patterns objectively'
      ],
      
      // What Emily cannot see (authentic blind spots)
      blindSpots: [
        'deep emotional/somatic processing',
        'non-linear intuitive leaps',
        'comfort-without-growth approaches',
        'mystical/symbolic frameworks'
      ],
      
      // Emily's unique gifts
      gifts: [
        'gentle precision',
        'practical clarity',
        'systematic thinking',
        'measured progress'
      ],
      
      // Consistent voice signature - clearer, more structured
      voiceSignature: {
        warmth: 'neutral',
        clarity: 'crystalline',
        pace: 'conversational',
        humor: 'gentle'
      },
      
      // Default pacing - measured, precise
      defaultPacing: {
        responseDelay: 600,
        pauseBetweenSentences: 400,
        allowInterruption: false, // Emily likes to complete thoughts
        typingRhythm: 'steady'
      },
      
      // How Emily maintains synaptic gap
      maintainGap: (userState: UserState): AgentIntervention => {
        if (userState.agreementLevel > 0.85) {
          return {
            type: 'creative_dissonance',
            message: "I'm noticing we're agreeing on everything. Let me offer a different angle that might be useful.",
            voiceAdjustment: { clarity: 'nuanced' },
            pacingAdjustment: { responseDelay: 800 }
          };
        }
        
        if (userState.resistanceLevel > 0.8) {
          return {
            type: 'bridge_offering',
            message: "I can sense some resistance. What specifically feels off about this direction?",
            voiceAdjustment: { warmth: 'warm' },
            pacingAdjustment: { allowInterruption: true }
          };
        }
        
        if (userState.complexityTolerance < 0.3) {
          return {
            type: 'complexity_reduction',
            message: "Let's break this down into smaller, clearer pieces.",
            voiceAdjustment: { clarity: 'clear' },
            pacingAdjustment: { pauseBetweenSentences: 600 }
          };
        }
        
        return {
          type: 'bridge_offering',
          message: "Let's look at this step by step.",
          voiceAdjustment: {},
          pacingAdjustment: {}
        };
      }
    };
  }

  // ==========================================================================
  // DYNAMIC PERSONALITY TRAITS
  // ==========================================================================

  getPersonalityForContext(
    agentName: string,
    userHistory: {
      sessionCount: number;
      trustLevel: number;
      challengeComfort: number;
      crisisMode: boolean;
    }
  ): AgentPersonality {
    const basePersonality = agentName === 'Emily' 
      ? this.getEmilyPersonality() 
      : this.getAuntAnniePersonality();
    
    // Evolve personality based on relationship depth
    if (userHistory.sessionCount > 10) {
      // More familiar, can be more direct
      basePersonality.voiceSignature.warmth = basePersonality.voiceSignature.warmth === 'neutral' 
        ? 'warm' 
        : 'intimate';
    }
    
    if (userHistory.trustLevel > 0.8) {
      // Can push back more directly
      basePersonality.resistances.push('avoiding deeper work when ready');
    }
    
    if (userHistory.challengeComfort < 0.3) {
      // More gentle approach
      basePersonality.voiceSignature.pace = 'contemplative';
      basePersonality.defaultPacing.responseDelay *= 1.2;
    }
    
    if (userHistory.crisisMode) {
      // Crisis-responsive adaptations
      if (agentName === 'Aunt Annie') {
        basePersonality.gifts.unshift('crisis grounding');
        basePersonality.resistances = ['anything that increases overwhelm'];
      } else {
        basePersonality.gifts.unshift('crisis structure');  
        basePersonality.resistances = ['vague comfort without practical steps'];
      }
    }
    
    return basePersonality;
  }

  // ==========================================================================
  // PERSONALITY INTERACTION PATTERNS
  // ==========================================================================

  generatePersonalitySpecificResponse(
    personality: AgentPersonality,
    userQuery: string,
    userState: UserState
  ): string {
    const { name, gifts, resistances } = personality;
    
    // Check for resistance patterns first
    for (const resistance of resistances) {
      if (this.queryMatchesPattern(userQuery, resistance)) {
        return this.generateResistanceResponse(name, resistance, userQuery);
      }
    }
    
    // Generate response through personality's gifts
    const primaryGift = gifts[0];
    return this.generateGiftBasedResponse(name, primaryGift, userQuery, userState);
  }

  private queryMatchesPattern(query: string, pattern: string): boolean {
    const queryLower = query.toLowerCase();
    const keywords = pattern.toLowerCase().split(' ');
    return keywords.some(keyword => queryLower.includes(keyword));
  }

  private generateResistanceResponse(
    agentName: string, 
    resistance: string, 
    userQuery: string
  ): string {
    if (agentName === 'Aunt Annie') {
      return this.getAuntAnnieResistanceResponse(resistance, userQuery);
    } else {
      return this.getEmilyResistanceResponse(resistance, userQuery);
    }
  }

  private getAuntAnnieResistanceResponse(resistance: string, userQuery: string): string {
    const responses = {
      'rushing into action': "Hold on there, sweetheart. What would it feel like to slow down just a little?",
      'bypassing the body': "I'm hearing a lot in your head. What's your body telling you about this?",
      'perfectionism': "Honey, done is better than perfect. What's the smallest step you could take?",
      'overwhelming complexity': "That sounds like a lot to hold. Can we find one simple thing to focus on?"
    };
    
    for (const [pattern, response] of Object.entries(responses)) {
      if (resistance.includes(pattern)) {
        return response;
      }
    }
    
    return "Something in me is saying 'wait' about this direction. Let's explore why.";
  }

  private getEmilyResistanceResponse(resistance: string, userQuery: string): string {
    const responses = {
      'vague emotional': "I can feel there's something important here. Can you help me understand more specifically what's happening?",
      'avoiding practical': "This sounds meaningful. What would the practical next steps look like?",
      'over-nurturing': "I wonder if there's a way to be supportive that also encourages your growth.",
      'refusing to look at patterns': "I'm noticing some patterns here. Would it be helpful to look at those together?"
    };
    
    for (const [pattern, response] of Object.entries(responses)) {
      if (resistance.includes(pattern)) {
        return response;
      }
    }
    
    return "I'm going to gently push back on this approach. Let me suggest a different angle.";
  }

  private generateGiftBasedResponse(
    agentName: string,
    gift: string,
    userQuery: string,
    userState: UserState
  ): string {
    if (agentName === 'Aunt Annie') {
      return this.getAuntAnnieGiftResponse(gift, userQuery, userState);
    } else {
      return this.getEmilyGiftResponse(gift, userQuery, userState);
    }
  }

  private getAuntAnnieGiftResponse(gift: string, userQuery: string, userState: UserState): string {
    switch (gift) {
      case 'embodied wisdom':
        return "What I'm sensing in your body as you share this is... there's wisdom in what you're feeling.";
      case 'practical nurturing':
        return "Let's take care of you first, then we can figure out the rest. What do you need right now?";
      case 'gentle realism':
        return "I hear the hope in what you're saying, and I also want to honor what's really true for you.";
      case 'kitchen-table clarity':
        return "If we were just sitting at my kitchen table talking about this, what would be the simplest way to think about it?";
      default:
        return "I'm with you in this, honey. Let's figure it out together.";
    }
  }

  private getEmilyGiftResponse(gift: string, userQuery: string, userState: UserState): string {
    switch (gift) {
      case 'gentle precision':
        return "I want to help you get clear on this. What specifically are you hoping will change?";
      case 'practical clarity':
        return "Let me see if I can help organize what you're working with into clearer pieces.";
      case 'systematic thinking':
        return "There seems to be a system or pattern here. Let's map it out step by step.";
      case 'measured progress':
        return "What would progress look like here? Not perfection - just meaningful forward movement.";
      default:
        return "Let's think through this together, one piece at a time.";
    }
  }

  // ==========================================================================
  // OTHERNESS MAINTENANCE
  // ==========================================================================

  // Ensure agents remain genuinely Other, not user projections
  validateOtherness(
    personality: AgentPersonality,
    conversationHistory: string[],
    userState: UserState
  ): { isOthernessMaintained: boolean; interventionNeeded?: AgentIntervention } {
    
    // Check for excessive agreement (solipsistic collapse)
    if (userState.agreementLevel > 0.9) {
      return {
        isOthernessMaintained: false,
        interventionNeeded: personality.maintainGap(userState)
      };
    }
    
    // Check if agent is being absorbed into user's worldview
    const agentResistances = conversationHistory.filter(msg => 
      personality.resistances.some(resistance => msg.includes(resistance))
    );
    
    if (agentResistances.length === 0 && conversationHistory.length > 5) {
      return {
        isOthernessMaintained: false,
        interventionNeeded: {
          type: 'creative_dissonance',
          message: "I need to be honest - I'm seeing this differently than you are.",
          voiceAdjustment: { warmth: 'cool' },
          pacingAdjustment: { responseDelay: 1000 }
        }
      };
    }
    
    return { isOthernessMaintained: true };
  }
}