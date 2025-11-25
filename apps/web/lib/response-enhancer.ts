// lib/response-enhancer.ts
interface EnhancementContext {
  userInput: string;
  originalResponse: string;
  userId?: string;
  sessionHistory?: Array<{role: string, content: string}>;
  element?: string;
  archetype?: string;
}

interface EnhancedResponse {
  text: string;
  enhancements: string[];
  confidence: number;
  processingTime: number;
}

class ResponseEnhancer {
  private mayaPersonalityTouches: any[];
  private conversationalFillers: string[];
  private emotionalResonators: Record<string, string[]>;

  constructor() {
    this.mayaPersonalityTouches = [
      // Natural conversation starters and connectors
      { pattern: /^(.*?)$/g, replacement: (match: string, input: string) => {
        const starters = ['', 'You know, ', 'I think ', 'Maybe ', 'It seems like '];
        const connectors = ['', ' - ', ', ', '... '];

        // Add natural hesitations and thinking patterns occasionally
        if (Math.random() < 0.3) {
          const hesitations = ['hmm, ', 'well, ', 'I mean, ', 'actually, '];
          return hesitations[Math.floor(Math.random() * hesitations.length)] + input.toLowerCase();
        }

        return input;
      }},
    
    // Make questions more conversational
    { pattern: /What (do you think|are your thoughts) about/gi, replacement: 'What\'s your take on' },
    { pattern: /How do you feel about/gi, replacement: 'How are you feeling about' },
    { pattern: /Tell me about/gi, replacement: 'What\'s going on with' },
    
    // Soften direct statements
    { pattern: /You should/gi, replacement: 'You might want to' },
    { pattern: /You need to/gi, replacement: 'Maybe try' },
    { pattern: /It is important/gi, replacement: 'It might help' },
    
    // Add emotional warmth
      { pattern: /\. That sounds/gi, replacement: '. That really sounds' },
      { pattern: /I understand/gi, replacement: 'I totally get that' },
      { pattern: /That makes sense/gi, replacement: 'Yeah, that makes total sense' }
    ];

    this.conversationalFillers = [
      'you know', 'I mean', 'like', 'actually', 'honestly', 'totally', 'really'
    ];

    this.emotionalResonators = {
      joy: ['amazing', 'wonderful', 'fantastic', 'brilliant'],
      sadness: ['tough', 'heavy', 'difficult', 'hard'],
      anger: ['frustrating', 'annoying', 'maddening'],
      fear: ['scary', 'overwhelming', 'intense'],
      surprise: ['wild', 'crazy', 'unexpected', 'interesting']
    };
  }

  async enhanceResponse(context: EnhancementContext): Promise<EnhancedResponse> {
    const startTime = Date.now();
    let enhancedText = context.originalResponse;
    const enhancements: string[] = [];

    try {
      // 1. Apply Maya personality touches
      enhancedText = this.applyPersonalityTouches(enhancedText);
      if (enhancedText !== context.originalResponse) {
        enhancements.push('maya-personality');
      }

      // 2. Add conversational flow based on user input
      const flowEnhanced = this.improveConversationalFlow(
        enhancedText, 
        context.userInput, 
        context.sessionHistory
      );
      if (flowEnhanced !== enhancedText) {
        enhancedText = flowEnhanced;
        enhancements.push('conversational-flow');
      }

      // 3. Emotional resonance matching
      const emotionalEnhanced = this.addEmotionalResonance(
        enhancedText, 
        context.userInput
      );
      if (emotionalEnhanced !== enhancedText) {
        enhancedText = emotionalEnhanced;
        enhancements.push('emotional-resonance');
      }

      // 4. Length and pacing optimization
      const pacingEnhanced = this.optimizePacing(enhancedText);
      if (pacingEnhanced !== enhancedText) {
        enhancedText = pacingEnhanced;
        enhancements.push('pacing-optimization');
      }

      // 5. Context-aware responses
      if (context.sessionHistory && context.sessionHistory.length > 2) {
        const contextEnhanced = this.addContextualContinuity(
          enhancedText, 
          context.sessionHistory
        );
        if (contextEnhanced !== enhancedText) {
          enhancedText = contextEnhanced;
          enhancements.push('contextual-continuity');
        }
      }

      // Calculate confidence based on number of successful enhancements
      const confidence = Math.min(0.95, 0.7 + (enhancements.length * 0.05));
      const processingTime = Date.now() - startTime;

      return {
        text: enhancedText,
        enhancements,
        confidence,
        processingTime
      };

    } catch (error) {
      console.error('Response enhancement failed:', error);
      return {
        text: context.originalResponse, // Fallback to original
        enhancements: ['error-fallback'],
        confidence: 0.5,
        processingTime: Date.now() - startTime
      };
    }
  }

  private applyPersonalityTouches(text: string): string {
    let enhanced = text;
    
    for (const touch of this.mayaPersonalityTouches) {
      if (typeof touch.replacement === 'function') {
        enhanced = enhanced.replace(touch.pattern, touch.replacement as any);
      } else {
        enhanced = enhanced.replace(touch.pattern, touch.replacement);
      }
    }
    
    return enhanced;
  }

  private improveConversationalFlow(
    response: string, 
    userInput: string, 
    history?: Array<{role: string, content: string}>
  ): string {
    // Add natural connectors based on user input type
    if (userInput.includes('?')) {
      // User asked a question
      if (!response.toLowerCase().includes('yeah') && !response.toLowerCase().includes('well')) {
        const responseStarters = ['Well, ', 'Hmm, ', 'I think '];
        const starter = responseStarters[Math.floor(Math.random() * responseStarters.length)];
        return starter.toLowerCase() + response;
      }
    }

    // If user shared something emotional, add acknowledgment
    const emotionalKeywords = ['feel', 'feeling', 'upset', 'happy', 'sad', 'angry', 'excited', 'worried'];
    if (emotionalKeywords.some(keyword => userInput.toLowerCase().includes(keyword))) {
      if (!response.toLowerCase().includes('that') && !response.toLowerCase().includes('sounds')) {
        return `That sounds ${response.toLowerCase()}`;
      }
    }

    return response;
  }

  private addEmotionalResonance(response: string, userInput: string): string {
    // Simple emotion detection and matching
    const userEmotion = this.detectEmotion(userInput);
    
    if (userEmotion && this.emotionalResonators[userEmotion]) {
      const resonators = this.emotionalResonators[userEmotion];
      const resonator = resonators[Math.floor(Math.random() * resonators.length)];
      
      // Add emotional resonance if not already present
      if (!response.toLowerCase().includes(resonator)) {
        // Insert resonator naturally into response
        return response.replace(/\b(that|this|it)\b/i, `$1 ${resonator}`);
      }
    }
    
    return response;
  }

  private detectEmotion(text: string): keyof typeof this.emotionalResonators | null {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('amazing')) {
      return 'joy';
    }
    if (lowerText.includes('sad') || lowerText.includes('down') || lowerText.includes('depressed')) {
      return 'sadness';
    }
    if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('frustrated')) {
      return 'anger';
    }
    if (lowerText.includes('scared') || lowerText.includes('afraid') || lowerText.includes('worried')) {
      return 'fear';
    }
    if (lowerText.includes('wow') || lowerText.includes('surprising') || lowerText.includes('unexpected')) {
      return 'surprise';
    }
    
    return null;
  }

  private optimizePacing(response: string): string {
    // Ensure responses aren't too long or too short
    if (response.length > 100) {
      // Break up long sentences with natural pauses
      return response.replace(/(\w+),\s+(\w+)/g, '$1... $2');
    } else if (response.length < 20) {
      // Add a conversational filler to very short responses
      const fillers = ['you know?', 'right?', 'I think.', 'for sure.'];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      return `${response} ${filler}`;
    }
    
    return response;
  }

  private addContextualContinuity(
    response: string, 
    history: Array<{role: string, content: string}>
  ): string {
    // Look for patterns in recent conversation
    const recentUserMessages = history
      .filter(msg => msg.role === 'user')
      .slice(-3)
      .map(msg => msg.content);
    
    // If user has been asking multiple questions, acknowledge the pattern
    const questionCount = recentUserMessages.filter(msg => msg.includes('?')).length;
    if (questionCount >= 2 && !response.includes('questions')) {
      return `${response} You've got a lot on your mind, huh?`;
    }
    
    // If conversation has been going on a while, add continuity
    if (history.length > 8 && Math.random() < 0.2) {
      const continuityPhrases = [
        'Like we were talking about...',
        'Going back to what you said...',
        'Building on that...'
      ];
      const phrase = continuityPhrases[Math.floor(Math.random() * continuityPhrases.length)];
      return `${phrase} ${response.toLowerCase()}`;
    }
    
    return response;
  }
}

// Export singleton instance
// Lazy-load singleton to avoid initialization issues
let _responseEnhancer: ResponseEnhancer | null = null;

export const responseEnhancer = {
  enhanceResponse: async (context: EnhancementContext): Promise<EnhancedResponse> => {
    if (!_responseEnhancer) {
      _responseEnhancer = new ResponseEnhancer();
    }
    return _responseEnhancer.enhanceResponse(context);
  }
};