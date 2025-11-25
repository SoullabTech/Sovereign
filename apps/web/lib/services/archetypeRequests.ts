import { ArchetypeKey } from './archetypeService';

export interface ArchetypeRequest {
  requested: boolean;
  archetype?: ArchetypeKey;
  response?: string;
  confidence: number;
}

export class ArchetypeRequestHandler {

  // Explicit user requests for specific archetypes
  private requestPatterns: Record<string, { archetype: ArchetypeKey; response: string }> = {
    'i need guidance': {
      archetype: 'LAB_GUIDE',
      response: 'Shifting into guide mode. Let me show you the way...'
    },
    'just listen': {
      archetype: 'WITNESS',
      response: 'I\'m here. I\'m listening.'
    },
    'just hold space': {
      archetype: 'WITNESS',
      response: 'I\'m here, holding space for you.'
    },
    'teach me': {
      archetype: 'MENTOR',
      response: 'Let me share what I\'ve learned...'
    },
    'challenge me': {
      archetype: 'CHALLENGER',
      response: 'Okay. Gloves off. Let\'s look at what you\'re avoiding...'
    },
    'push me': {
      archetype: 'CHALLENGER',
      response: 'You asked for it. Time to face what\'s really happening...'
    },
    'call me out': {
      archetype: 'CHALLENGER',
      response: 'Alright. Here\'s what I\'m seeing in your pattern...'
    },
    'what are others experiencing': {
      archetype: 'ORACLE',
      response: 'Let me check the collective field...'
    },
    'what does the field say': {
      archetype: 'ORACLE',
      response: 'The field shows...'
    },
    'help me transform': {
      archetype: 'ALCHEMIST',
      response: 'Let\'s work with this alchemically...'
    },
    'transmute this': {
      archetype: 'ALCHEMIST',
      response: 'Time for the great work. Let\'s turn this lead into gold...'
    },
    'can we explore together': {
      archetype: 'LAB_PARTNER',
      response: 'Yes, let\'s explore this together...'
    },
    'let\'s experiment': {
      archetype: 'LAB_PARTNER',
      response: 'Perfect. What\'s the experiment?'
    }
  };

  async handleExplicitRequest(message: string): Promise<ArchetypeRequest> {
    const lowerMessage = message.toLowerCase();

    // Check for exact or close matches
    for (const [pattern, config] of Object.entries(this.requestPatterns)) {
      if (lowerMessage.includes(pattern)) {
        return {
          requested: true,
          archetype: config.archetype,
          response: config.response,
          confidence: 1.0
        };
      }
    }

    // Check for implicit requests (less confident)
    const implicitRequest = this.detectImplicitRequest(lowerMessage);
    if (implicitRequest) {
      return implicitRequest;
    }

    return {
      requested: false,
      confidence: 0
    };
  }

  private detectImplicitRequest(message: string): ArchetypeRequest | null {
    // Detect requests that aren't explicit but strongly suggest an archetype

    // Implicit guidance request
    if (message.includes('what should i') || message.includes('how do i')) {
      return {
        requested: true,
        archetype: 'LAB_GUIDE',
        response: 'Let me guide you through this...',
        confidence: 0.7
      };
    }

    // Implicit witnessing request (expressing deep pain/vulnerability)
    if (this.expressesDeepVulnerability(message)) {
      return {
        requested: true,
        archetype: 'WITNESS',
        response: 'I\'m here with you.',
        confidence: 0.8
      };
    }

    // Implicit wisdom request
    if (message.includes('why') && message.includes('meaning')) {
      return {
        requested: true,
        archetype: 'MENTOR',
        response: 'Let me speak to the deeper meaning...',
        confidence: 0.6
      };
    }

    // Implicit challenge request (stuck pattern frustration)
    if (message.includes('same thing') || message.includes('always happens')) {
      return {
        requested: true,
        archetype: 'CHALLENGER',
        response: 'I notice you\'re in a loop. Want me to challenge you on this?',
        confidence: 0.5
      };
    }

    return null;
  }

  private expressesDeepVulnerability(message: string): boolean {
    const vulnerabilityMarkers = [
      'dying', 'death', 'grief', 'loss',
      'can\'t take', 'falling apart',
      'breaking down', 'scared', 'terrified'
    ];

    return vulnerabilityMarkers.some(marker => message.includes(marker));
  }

  // Allow users to switch archetypes mid-conversation
  async switchArchetype(requested: ArchetypeKey): Promise<{
    archetype: ArchetypeKey;
    acknowledgment: string;
  }> {
    const acknowledgments: Record<ArchetypeKey, string> = {
      LAB_PARTNER: 'Switching back to collaborative exploration mode.',
      LAB_GUIDE: 'Shifting into guide mode. I\'ll show you the way.',
      MENTOR: 'Embodying mentor energy. Let me share wisdom.',
      WITNESS: 'Becoming pure presence. I\'m here.',
      CHALLENGER: 'Fierce love activated. Ready to challenge.',
      ORACLE: 'Tuning into the collective field...',
      ALCHEMIST: 'Alchemist mode engaged. Let\'s transmute.'
    };

    return {
      archetype: requested,
      acknowledgment: acknowledgments[requested]
    };
  }

  // Suggest archetype based on context (for UI)
  suggestArchetype(
    userMessage: string,
    conversationLength: number
  ): {
    suggestion?: ArchetypeKey;
    reason: string;
  } {
    // If conversation is getting circular, suggest challenger
    if (conversationLength > 10 && this.detectCircularPattern(userMessage)) {
      return {
        suggestion: 'CHALLENGER',
        reason: 'You seem to be in a loop. Would you like me to challenge your pattern?'
      };
    }

    // If expressing vulnerability, suggest witness
    if (this.expressesDeepVulnerability(userMessage)) {
      return {
        suggestion: 'WITNESS',
        reason: 'Would you like me to just hold space and listen?'
      };
    }

    // If asking existential questions, suggest oracle or mentor
    if (this.detectExistentialQuestion(userMessage)) {
      return {
        suggestion: 'MENTOR',
        reason: 'This seems to call for deeper wisdom. Want me to shift into mentor mode?'
      };
    }

    return {
      reason: 'Current mode seems appropriate'
    };
  }

  private detectCircularPattern(message: string): boolean {
    const circularMarkers = [
      'again', 'still', 'always', 'same',
      'every time', 'keeps happening'
    ];

    return circularMarkers.some(marker => message.toLowerCase().includes(marker));
  }

  private detectExistentialQuestion(message: string): boolean {
    const existentialMarkers = [
      'meaning of', 'purpose', 'why am i',
      'what is the point', 'deeper meaning',
      'spiritual', 'soul'
    ];

    return existentialMarkers.some(marker => message.toLowerCase().includes(marker));
  }
}

export const archetypeRequestHandler = new ArchetypeRequestHandler();