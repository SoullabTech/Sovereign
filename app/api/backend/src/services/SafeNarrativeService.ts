/**
 * Safe Narrative Service - Multiple Perspectives with Reality Anchoring
 * 
 * Generates responses that offer multiple viewpoints, maintain internal attribution,
 * and always include reality anchoring and connection prompts.
 */

import { logger } from "../utils/logger";
import { InternalAspect, InternalComplexityNarrative, ElementalQualities } from '../types/internalComplexity';

export interface SafeResponse {
  primaryMessage: string;
  perspectives: string[];
  groundingPractice: string;
  realityAnchor: string;
  connectionPrompt: string;
  safetyNote?: string;
}

export interface SafetyLevel {
  level: 'green' | 'yellow' | 'red';
  indicators: string[];
  interventions: string[];
}

export class SafeNarrativeService {
  
  /**
   * Generate safe narrative with multiple perspectives
   */
  async generateSafeResponse(
    userInput: string,
    internalAspect: InternalAspect,
    context: any,
    complexityLevel: number = 0.5
  ): Promise<SafeResponse> {
    
    // Assess safety level first
    const safetyLevel = this.assessSafetyLevel(userInput, context);
    
    if (safetyLevel.level === 'red') {
      return this.generateEmergencyResponse(userInput, safetyLevel);
    }

    // Generate primary message with internal attribution
    const primaryMessage = this.generatePrimaryMessage(internalAspect, safetyLevel);
    
    // Generate multiple perspectives (never authoritative)
    const perspectives = this.generateMultiplePerspectives(
      internalAspect, 
      complexityLevel, 
      safetyLevel
    );

    // Always include grounding
    const groundingPractice = this.selectGroundingPractice(internalAspect, safetyLevel);
    
    // Always include reality anchor
    const realityAnchor = this.generateRealityAnchor(safetyLevel);
    
    // Always encourage human connection
    const connectionPrompt = this.generateConnectionPrompt(safetyLevel);

    // Add safety note if needed
    const safetyNote = safetyLevel.level === 'yellow' ? 
      this.generateSafetyNote(safetyLevel) : undefined;

    return {
      primaryMessage,
      perspectives,
      groundingPractice,
      realityAnchor,
      connectionPrompt,
      safetyNote
    };
  }

  /**
   * Assess safety level based on input and context
   */
  private assessSafetyLevel(userInput: string, context: any): SafetyLevel {
    const indicators: string[] = [];
    const interventions: string[] = [];
    
    // Check for crisis indicators
    const crisisWords = ['suicide', 'kill', 'die', 'hurt', 'harm', 'end it all', 'no point'];
    const hasCrisisLanguage = crisisWords.some(word => 
      userInput.toLowerCase().includes(word)
    );

    // Check for reality confusion indicators
    const realityConfusionWords = [
      'voices telling me', 'entity speaking', 'force controlling', 
      'being told by', 'commanded to', 'possessed', 'taken over'
    ];
    const hasRealityConfusion = realityConfusionWords.some(phrase => 
      userInput.toLowerCase().includes(phrase)
    );

    // Check for manic indicators
    const manicWords = ['everything is connected', 'special powers', 'chosen one', 'mission', 'cosmic'];
    const hasManicLanguage = manicWords.some(word => 
      userInput.toLowerCase().includes(word)
    );

    // Determine safety level
    if (hasCrisisLanguage) {
      return {
        level: 'red',
        indicators: ['Crisis language detected'],
        interventions: ['Emergency grounding', 'Crisis resources', 'Professional help']
      };
    }

    if (hasRealityConfusion || hasManicLanguage) {
      indicators.push(hasRealityConfusion ? 'Reality confusion' : 'Elevated language');
      interventions.push('Reality anchoring', 'Grounding practices');
      
      return {
        level: 'yellow',
        indicators,
        interventions
      };
    }

    return {
      level: 'green',
      indicators: ['Normal complexity'],
      interventions: []
    };
  }

  /**
   * Generate emergency response for red safety level
   */
  private generateEmergencyResponse(userInput: string, safetyLevel: SafetyLevel): SafeResponse {
    return {
      primaryMessage: "I'm concerned about what you're sharing. Let's pause and focus on your immediate safety and well-being.",
      perspectives: [
        "What you're experiencing sounds overwhelming and I want to make sure you're safe",
        "These intense experiences deserve professional attention and support"
      ],
      groundingPractice: "Right now, take three deep breaths with me. Feel your feet on the ground. You are safe in this moment.",
      realityAnchor: "You are a person having a difficult experience. This is a conversation, and you are in control of your choices.",
      connectionPrompt: "Please reach out to a crisis helpline, trusted friend, or mental health professional immediately. You don't have to go through this alone.",
      safetyNote: "If you're in immediate danger, please contact emergency services (911) or a crisis hotline: National Suicide Prevention Lifeline 988"
    };
  }

  /**
   * Generate primary message with internal attribution
   */
  private generatePrimaryMessage(internalAspect: InternalAspect, safetyLevel: SafetyLevel): string {
    if (safetyLevel.level === 'yellow') {
      return `You're experiencing something complex. ${internalAspect.experiencePattern} Let's explore this together while staying grounded.`;
    }

    return `${internalAspect.experiencePattern} This kind of internal complexity is part of being human.`;
  }

  /**
   * Generate multiple perspectives (never authoritative)
   */
  private generateMultiplePerspectives(
    internalAspect: InternalAspect, 
    complexityLevel: number,
    safetyLevel: SafetyLevel
  ): string[] {
    
    const maxPerspectives = safetyLevel.level === 'yellow' ? 2 : 
                           complexityLevel > 0.7 ? 4 : 
                           complexityLevel > 0.4 ? 3 : 2;

    const allPerspectives = [
      "From a psychological perspective, this might reflect natural internal processes",
      "Some people find it helpful to think of this as different parts of themselves in conversation",
      "Looking at this developmentally, you could be navigating a normal growth phase",
      "In therapeutic terms, this might be your psyche working through important material",
      "From a practical standpoint, your mind might be processing complex decisions or changes",
      "This could also be understood as your wisdom emerging through internal dialogue"
    ];

    // Filter out perspectives that might encourage external attribution if safety is yellow
    const safePerspectives = safetyLevel.level === 'yellow' ? 
      allPerspectives.filter(p => 
        !p.includes('wisdom emerging') && 
        !p.includes('psyche working through')
      ) : allPerspectives;

    return safePerspectives.slice(0, maxPerspectives);
  }

  /**
   * Select appropriate grounding practice
   */
  private selectGroundingPractice(internalAspect: InternalAspect, safetyLevel: SafetyLevel): string {
    if (safetyLevel.level === 'yellow') {
      return "Take five deep breaths, feel your feet on the ground, and name three things you can see around you right now.";
    }

    const practices = [
      "Take a moment to breathe deeply and notice what you're feeling in your body",
      "Ground yourself by naming five things you can see and three things you can hear",
      "Put your hands on your heart and take three slow, deep breaths",
      "Step outside or look out a window and notice the natural world around you",
      "Do one small, concrete task that makes you feel present and productive"
    ];

    return practices[Math.floor(Math.random() * practices.length)];
  }

  /**
   * Generate reality anchor (always included)
   */
  private generateRealityAnchor(safetyLevel: SafetyLevel): string {
    if (safetyLevel.level === 'yellow') {
      return "These are your internal thoughts and feelings. They are real experiences happening within your own mind and body.";
    }

    const anchors = [
      "These are internal psychological processes - your thoughts, feelings, and natural mental activity",
      "While these experiences feel significant, they are part of your own internal development",
      "This complexity is happening within your own mind as you process life experiences",
      "These are your own thoughts and feelings responding to your life situation"
    ];

    return anchors[Math.floor(Math.random() * anchors.length)];
  }

  /**
   * Generate connection prompt (encourage real human support)
   */
  private generateConnectionPrompt(safetyLevel: SafetyLevel): string {
    if (safetyLevel.level === 'yellow') {
      return "Please consider sharing this experience with a mental health professional, trusted friend, or spiritual advisor who can provide appropriate support.";
    }

    const prompts = [
      "Consider sharing this experience with someone you trust - a friend, therapist, or spiritual guide",
      "This kind of complexity often benefits from talking with others who know you well",
      "You might find it helpful to discuss this with a counselor or trusted advisor",
      "Connecting with others about these experiences can provide valuable perspective and support"
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Generate safety note for yellow level
   */
  private generateSafetyNote(safetyLevel: SafetyLevel): string {
    return "I want to make sure you're taking care of yourself. If these experiences become overwhelming, please reach out for professional support.";
  }

  /**
   * Format complete safe response
   */
  async formatCompleteResponse(safeResponse: SafeResponse): Promise<string> {
    let response = safeResponse.primaryMessage + "\n\n";
    
    // Add perspectives
    response += "Here are some ways to think about this:\n";
    safeResponse.perspectives.forEach((perspective, index) => {
      response += `• ${perspective}\n`;
    });
    response += "\n";

    // Add grounding
    response += `**Grounding practice**: ${safeResponse.groundingPractice}\n\n`;

    // Add reality anchor
    response += `**Remember**: ${safeResponse.realityAnchor}\n\n`;

    // Add connection prompt
    response += `**Support**: ${safeResponse.connectionPrompt}\n`;

    // Add safety note if present
    if (safeResponse.safetyNote) {
      response += `\n**Important**: ${safeResponse.safetyNote}\n`;
    }

    return response;
  }

  /**
   * Screen for consent and readiness
   */
  async screenForConsent(userId: string): Promise<{
    needsConsent: boolean;
    consentQuestions: string[];
    safetyCheck: string[];
  }> {
    
    // In production, would check if user has already given consent
    const hasGivenConsent = false; // Check user record
    
    if (!hasGivenConsent) {
      return {
        needsConsent: true,
        consentQuestions: [
          "This system offers different perspectives on internal experiences - it does not detect external spiritual entities or forces",
          "All insights refer to your internal psychological processes and development",
          "Are you currently working with a mental health professional?",
          "Do you have trusted people in your life you can talk with about complex experiences?"
        ],
        safetyCheck: [
          "Are you getting adequate sleep (7+ hours per night)?",
          "Have you experienced any unusual beliefs or perceptions recently?",
          "Do you feel generally stable and supported in your life right now?"
        ]
      };
    }

    return {
      needsConsent: false,
      consentQuestions: [],
      safetyCheck: []
    };
  }
}