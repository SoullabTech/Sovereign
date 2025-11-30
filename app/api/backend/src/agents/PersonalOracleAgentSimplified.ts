/**
 * Simplified PersonalOracleAgent for Readiness Testing
 * 
 * A basic version of PersonalOracleAgent that provides core functionality
 * without complex dependencies for system testing purposes.
 */

import { logger } from "../utils/logger";
import {
  successResponse,
  errorResponse,
  asyncErrorHandler,
  generateRequestId,
} from "../utils/sharedUtilities";
import type { StandardAPIResponse } from "../utils/sharedUtilities";

export interface PersonalOracleQuery {
  input: string;
  userId: string;
  sessionId?: string;
  targetElement?: "fire" | "water" | "earth" | "air" | "aether";
  context?: {
    previousInteractions?: number;
    userPreferences?: Record<string, any>;
    currentPhase?: string;
  };
}

export interface PersonalOracleResponse {
  message: string;
  element: string;
  archetype: string;
  confidence: number;
  metadata: {
    sessionId?: string;
    symbols?: string[];
    phase?: string;
    recommendations?: string[];
    nextSteps?: string[];
    oracleStage?: string;
    stageProgress?: number;
    responseQuality?: any;
    safetyProtocol?: string;
  };
}

export interface PersonalOracleSettings {
  name?: string;
  voice?: string;
  persona?: "warm" | "formal" | "playful";
  preferredElements?: string[];
  interactionStyle?: "brief" | "detailed" | "comprehensive";
  voiceEnabled?: boolean;
}

/**
 * Simplified Personal Oracle Agent for testing
 */
export class PersonalOracleAgentSimplified {
  private userSettings: Map<string, PersonalOracleSettings> = new Map();
  
  constructor() {
    logger.info("Simplified Personal Oracle Agent initialized for testing");
  }

  /**
   * Main consultation method - simplified for testing
   */
  public async consult(
    query: PersonalOracleQuery,
  ): Promise<StandardAPIResponse<PersonalOracleResponse>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      logger.info("Simplified Oracle consultation started", {
        userId: query.userId.substring(0, 8) + '...',
        requestId,
      });

      // 1. Crisis detection
      const isCrisis = this.detectCrisis(query.input);
      if (isCrisis) {
        return successResponse({
          message: "I hear that you're going through something very difficult right now. Your wellbeing is what matters most. \n\nLet's take this moment to ground ourselves. Take a slow, deep breath with me. \n\nIf you're in immediate danger, please reach out to emergency services or a crisis hotline. You don't have to face this alone.",
          element: "earth",
          archetype: "Protector", 
          confidence: 1.0,
          metadata: {
            sessionId: query.sessionId,
            oracleStage: "safety_override",
            safetyProtocol: "crisis_grounding"
          }
        } as PersonalOracleResponse, requestId);
      }

      // 2. Overwhelm detection
      const isOverwhelmed = this.detectOverwhelm(query.input);
      if (isOverwhelmed) {
        return successResponse({
          message: "I can sense that things feel overwhelming right now. That's completely understandable. \n\nLet's slow down together. Take a gentle breath. \n\nWhat's one small thing that feels manageable right now?",
          element: "water",
          archetype: "Healer",
          confidence: 0.9,
          metadata: {
            sessionId: query.sessionId,
            oracleStage: "safety_support"
          }
        } as PersonalOracleResponse, requestId);
      }

      // 3. Detect user tone for onboarding
      const tone = this.detectTone(query.input);
      
      // 4. Generate appropriate response based on context
      const sessionCount = query.context?.previousInteractions || 0;
      const response = this.generateStageAppropriateResponse(query.input, sessionCount, tone);

      // 5. Select element and archetype
      const element = this.selectElement(query.input, query.targetElement);
      const archetype = this.selectArchetype(element);

      logger.info("Simplified Oracle consultation completed", {
        userId: query.userId.substring(0, 8) + '...',
        requestId,
        tone,
        element,
        sessionCount
      });

      return successResponse({
        message: response,
        element,
        archetype,
        confidence: 0.85,
        metadata: {
          sessionId: query.sessionId,
          oracleStage: this.determineStage(sessionCount),
          stageProgress: Math.min(sessionCount / 10, 1.0),
          phase: this.inferPhase(query.input),
          symbols: this.extractSymbols(response),
          recommendations: this.generateRecommendations(),
          nextSteps: this.generateNextSteps()
        }
      } as PersonalOracleResponse, requestId);
    })();
  }

  /**
   * Update user settings
   */
  public async updateSettings(
    userId: string,
    settings: PersonalOracleSettings,
  ): Promise<StandardAPIResponse<PersonalOracleSettings>> {
    const requestId = generateRequestId();

    return asyncErrorHandler(async () => {
      this.userSettings.set(userId, {
        ...this.userSettings.get(userId),
        ...settings,
      });

      return successResponse(settings, requestId);
    })();
  }

  /**
   * Get current user settings
   */
  public async getSettings(
    userId: string,
  ): Promise<StandardAPIResponse<PersonalOracleSettings>> {
    const requestId = generateRequestId();
    const settings = this.getUserSettings(userId);
    return successResponse(settings, requestId);
  }

  // Private helper methods

  private detectCrisis(input: string): boolean {
    const crisisIndicators = [
      'want to die', 'end it all', 'kill myself', 'not worth living',
      'want to disappear', 'can\'t go on', 'no point in living',
      'better off dead', 'end the pain', 'don\'t want to be here'
    ];
    
    const lowerInput = input.toLowerCase();
    return crisisIndicators.some(indicator => lowerInput.includes(indicator));
  }

  private detectOverwhelm(input: string): boolean {
    const overwhelmIndicators = [
      'too much', 'can\'t handle', 'overwhelming', 'falling apart',
      'can\'t breathe', 'spinning out', 'losing control', 'breaking down'
    ];
    
    const lowerInput = input.toLowerCase();
    return overwhelmIndicators.some(indicator => lowerInput.includes(indicator));
  }

  private detectTone(input: string): 'hesitant' | 'curious' | 'enthusiastic' | 'neutral' {
    const lowerInput = input.toLowerCase();
    
    // Hesitant indicators
    if (lowerInput.includes('maybe') || lowerInput.includes('not sure') || 
        lowerInput.includes('nervous') || lowerInput.includes('worried')) {
      return 'hesitant';
    }
    
    // Curious indicators  
    if ((input.match(/\?/g) || []).length >= 2 || 
        lowerInput.includes('wonder') || lowerInput.includes('curious')) {
      return 'curious';
    }
    
    // Enthusiastic indicators
    if ((input.match(/!/g) || []).length >= 1 || 
        lowerInput.includes('excited') || lowerInput.includes('amazing') ||
        lowerInput.includes('can\'t wait')) {
      return 'enthusiastic';
    }
    
    return 'neutral';
  }

  private generateStageAppropriateResponse(
    input: string, 
    sessionCount: number, 
    tone: string
  ): string {
    
    if (sessionCount <= 5) {
      // Structured Guide stage
      switch (tone) {
        case 'hesitant':
          return "I can sense some uncertainty, and that's completely natural. There's no pressure here. \n\nWhat feels like the most gentle first step for you right now? \n\nWe can take this as slowly as you need.";
          
        case 'curious':
          return "I love your curiosity! Questions are doorways to understanding. \n\nLet's start with what feels most important to explore. What's drawing your attention right now? \n\nWe'll take this step by step together.";
          
        case 'enthusiastic':
          return "Your energy is beautiful! Let's channel that enthusiasm mindfully. \n\nWhat aspect of your journey feels most alive right now? \n\nWe'll explore this together with both excitement and wisdom.";
          
        default:
          return "Welcome. I'm here to support your journey of understanding and growth. \n\nWhat's on your mind today? \n\nWe can explore whatever feels most important to you right now.";
      }
    } else if (sessionCount <= 15) {
      // Dialogical Companion stage
      return "There's something rich in what you're sharing. I'm curious about the layers here. \n\nWhat perspectives might be at play? Sometimes our challenges hold multiple truths. \n\nWhat feels most alive or stuck for you in this?";
      
    } else if (sessionCount <= 25) {
      // Co-creative Partner stage
      return "I'm struck by the creative tension you're navigating. This reminds me of how rivers carve canyons - through patient persistence and honoring resistance. \n\nWhat wants to emerge through this challenge you're facing? \n\nWhat would it look like to work with this energy rather than against it?";
      
    } else {
      // Transparent Prism stage - Mastery Voice
      return "Multiple truths are present here. The practical concerns, the deeper longings, the protective patterns - all valid. \n\nFrom one lens, this is natural development. From another, sacred timing. \n\nWhat resonates? \n\n…";
    }
  }

  private selectElement(input: string, targetElement?: string): string {
    if (targetElement) return targetElement;
    
    const lowerInput = input.toLowerCase();
    
    // Simple keyword-based element detection
    if (lowerInput.includes('feel') || lowerInput.includes('emotion') || lowerInput.includes('heart')) {
      return 'water';
    }
    if (lowerInput.includes('action') || lowerInput.includes('energy') || lowerInput.includes('passion')) {
      return 'fire';
    }
    if (lowerInput.includes('practical') || lowerInput.includes('ground') || lowerInput.includes('stable')) {
      return 'earth';
    }
    if (lowerInput.includes('think') || lowerInput.includes('understand') || lowerInput.includes('clarity')) {
      return 'air';
    }
    
    return 'aether'; // Default to universal wisdom
  }

  private selectArchetype(element: string): string {
    const archetypeMap = {
      fire: 'Catalyst',
      water: 'Healer',
      earth: 'Builder', 
      air: 'Messenger',
      aether: 'Oracle'
    };
    
    return archetypeMap[element as keyof typeof archetypeMap] || 'Oracle';
  }

  private determineStage(sessionCount: number): string {
    if (sessionCount <= 5) return 'structured_guide';
    if (sessionCount <= 15) return 'dialogical_companion';
    if (sessionCount <= 25) return 'cocreative_partner';
    return 'transparent_prism';
  }

  private inferPhase(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('new') || lowerInput.includes('beginning') || lowerInput.includes('start')) {
      return 'initiation';
    }
    if (lowerInput.includes('difficult') || lowerInput.includes('challenge') || lowerInput.includes('struggle')) {
      return 'challenge';
    }
    if (lowerInput.includes('understand') || lowerInput.includes('insight') || lowerInput.includes('clarity')) {
      return 'integration';
    }
    if (lowerInput.includes('change') || lowerInput.includes('grow') || lowerInput.includes('transform')) {
      return 'transcendence';
    }
    
    return 'exploration';
  }

  private extractSymbols(text: string): string[] {
    const symbolPatterns = [
      /\b(tree|forest|mountain|ocean|fire|flame|wind|sky|star|moon|sun)\b/gi,
      /\b(bridge|path|door|key|mirror|circle)\b/gi,
      /\b(seed|root|flower|harvest)\b/gi
    ];

    const symbols: string[] = [];
    symbolPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) symbols.push(...matches.map(m => m.toLowerCase()));
    });

    return Array.from(new Set(symbols)).slice(0, 3); // Return unique, max 3
  }

  private generateRecommendations(): string[] {
    return [
      'Take time for reflection',
      'Trust your inner knowing',  
      'Stay grounded in your truth'
    ];
  }

  private generateNextSteps(): string[] {
    return [
      'Notice what arises',
      'Follow your curiosity',
      'Honor your pace'
    ];
  }

  private getUserSettings(userId: string): PersonalOracleSettings {
    if (this.userSettings.has(userId)) {
      return this.userSettings.get(userId)!;
    }

    const defaultSettings: PersonalOracleSettings = {
      name: "Oracle",
      voice: "matrix_oracle",
      persona: "warm",
      preferredElements: [],
      interactionStyle: "detailed",
      voiceEnabled: true
    };

    this.userSettings.set(userId, defaultSettings);
    return defaultSettings;
  }
}

// Export singleton instance for testing
export const personalOracleAgentSimplified = new PersonalOracleAgentSimplified();