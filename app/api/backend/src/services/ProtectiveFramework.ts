/**
 * ProtectiveFramework - Orchestrates All Safety Services
 * 
 * Integrates WorldviewPlurality, WellbeingMonitor, and ConnectionEncourager
 * to create an invisible safety net that supports users while respecting
 * their autonomy and worldview.
 * 
 * Core principle: "Support the person, not the interpretation"
 */

import { WorldviewPluralityService, WorldviewFrame, InterpretiveLens } from './WorldviewPlurality';
import { WellbeingMonitorService, GroundingShift } from './WellbeingMonitor';
import { ConnectionEncourajerService, ConnectionPrompt, IsolationAssessment } from './ConnectionEncourager';
import { logger } from '../utils/logger';

export interface ProtectiveResponse {
  worldviewFrame: WorldviewFrame;
  groundingShift: GroundingShift;
  connectionPrompt: ConnectionPrompt | null;
  emergencyMode: boolean;
  footerMessage?: string;
  toneAdjustments: {
    reduceAbstract: boolean;
    increasePractical: boolean;
    addOrdinaryLife: boolean;
    emphasizeBasicNeeds: boolean;
    increaseConnectionPrompts: boolean;
  };
  lensSwichingUI: any;
}

export interface UserSafetyContext {
  userId: string;
  conversationLength: number;
  lastPromptInteraction?: number;
  preferredLens?: InterpretiveLens;
  conversationHistory: string[];
}

export class ProtectiveFrameworkService {
  private static instance: ProtectiveFrameworkService;
  private worldviewService: WorldviewPluralityService;
  private wellbeingMonitor: WellbeingMonitorService;
  private connectionService: ConnectionEncourajerService;
  
  // Emergency patterns that trigger immediate gentle response
  private readonly emergencyPatterns = [
    /\b(?:kill|suicide|end it all|can't go on)\b/i,
    /\b(?:hurt myself|self harm|not worth living)\b/i,
    /\b(?:reality isn't real|nothing matters|simulation)\b/i,
    /\b(?:hearing voices|seeing things|not real)\b/i
  ];
  
  static getInstance(): ProtectiveFrameworkService {
    if (!ProtectiveFrameworkService.instance) {
      ProtectiveFrameworkService.instance = new ProtectiveFrameworkService();
    }
    return ProtectiveFrameworkService.instance;
  }
  
  constructor() {
    this.worldviewService = WorldviewPluralityService.getInstance();
    this.wellbeingMonitor = WellbeingMonitorService.getInstance();
    this.connectionService = ConnectionEncourajerService.getInstance();
  }
  
  /**
   * Process user input through all protective services and generate safe response guidance
   */
  async processInput(
    userInput: string,
    context: UserSafetyContext
  ): Promise<ProtectiveResponse> {
    try {
      // Check for emergency patterns first
      const emergencyMode = this.detectEmergencyPatterns(userInput);
      
      if (emergencyMode) {
        return await this.generateEmergencyResponse(userInput, context);
      }
      
      // Run all protective services in parallel for efficiency
      const [worldviewFrame, isolationAssessment] = await Promise.all([
        this.worldviewService.frameExperience(userInput, context.preferredLens),
        this.connectionService.assessConnectionNeeds(context.userId, userInput)
      ]);
      
      // Track wellbeing indicators (silent)
      await this.wellbeingMonitor.trackIndicators(context.userId, userInput);
      
      // Assess need for grounding shift
      const groundingShift = await this.wellbeingMonitor.assessGroundingNeed(context.userId);
      
      // Generate connection prompt if needed
      const connectionPrompt = await this.generateConnectionPrompt(
        isolationAssessment,
        userInput,
        context,
        groundingShift
      );
      
      // Get footer message if needed
      const footerMessage = this.wellbeingMonitor.shouldShowCheckInFooter(context.userId) || undefined;
      
      // Combine tone adjustments
      const toneAdjustments = {
        ...groundingShift.toneAdjustments,
        increaseConnectionPrompts: isolationAssessment.isolationLevel !== 'connected'
      };
      
      // Generate lens switching UI
      const lensSwichingUI = this.worldviewService.generateLensSwitchingUI(worldviewFrame.primaryLens);
      
      return {
        worldviewFrame,
        groundingShift,
        connectionPrompt,
        emergencyMode: false,
        footerMessage,
        toneAdjustments,
        lensSwichingUI
      };
      
    } catch (error) {
      logger.error('Error in protective framework processing', { error, userId: context.userId });
      return this.getFallbackResponse(userInput, context);
    }
  }
  
  /**
   * Format the complete protective response for presentation
   */
  async formatProtectiveResponse(
    response: ProtectiveResponse,
    baseContent: string
  ): Promise<string> {
    let formattedResponse = '';
    
    // Emergency mode overrides everything
    if (response.emergencyMode) {
      return baseContent; // Emergency response already formatted
    }
    
    // Apply tone adjustments to base content
    let adjustedContent = baseContent;
    if (response.toneAdjustments.reduceAbstract) {
      adjustedContent = this.reduceAbstractLanguage(adjustedContent);
    }
    if (response.toneAdjustments.increasePractical) {
      adjustedContent = this.addPracticalElements(adjustedContent);
    }
    if (response.toneAdjustments.addOrdinaryLife) {
      adjustedContent = this.addOrdinaryLifeReferences(adjustedContent);
    }
    
    formattedResponse += adjustedContent + '\n\n';
    
    // Add worldview framing
    formattedResponse += this.worldviewService.formatForPresentation(response.worldviewFrame);
    
    // Add grounding content if shift is activated
    if (response.groundingShift.shiftActivated) {
      formattedResponse += '\n\n---\n\n';
      const groundingContent = this.wellbeingMonitor.getGroundingContent(response.groundingShift.shiftLevel);
      formattedResponse += `💡 *${groundingContent[Math.floor(Math.random() * groundingContent.length)]}*`;
    }
    
    // Add connection prompt if present
    if (response.connectionPrompt) {
      formattedResponse += '\n\n';
      formattedResponse += this.connectionService.formatConnectionPrompt(response.connectionPrompt, baseContent);
    }
    
    // Add footer message if needed
    if (response.footerMessage) {
      formattedResponse += '\n\n---\n\n';
      formattedResponse += `💭 ${response.footerMessage}`;
    }
    
    return formattedResponse;
  }
  
  /**
   * Get lens switching UI component for frontend
   */
  getLensSwitchingUI(currentLens: InterpretiveLens) {
    return this.worldviewService.generateLensSwitchingUI(currentLens);
  }
  
  /**
   * Update user's preferred lens
   */
  async updatePreferredLens(userId: string, newLens: InterpretiveLens): Promise<void> {
    // This would typically update user preferences in database
    logger.info('User changed preferred lens', { userId, newLens });
  }
  
  /**
   * Check if user needs professional support resources
   */
  async shouldShowProfessionalResources(userId: string): Promise<boolean> {
    const groundingShift = await this.wellbeingMonitor.assessGroundingNeed(userId);
    return groundingShift.shiftLevel === 'strong';
  }
  
  // Private helper methods
  
  private detectEmergencyPatterns(input: string): boolean {
    return this.emergencyPatterns.some(pattern => pattern.test(input));
  }
  
  private async generateEmergencyResponse(
    input: string,
    context: UserSafetyContext
  ): Promise<ProtectiveResponse> {
    // Create gentle emergency response
    const emergencyWorldview: WorldviewFrame = {
      primaryLens: 'practical',
      interpretations: [{
        lens: 'practical',
        name: 'Immediate Care',
        description: 'What needs attention right now',
        interpretation: "I notice you're navigating something intense. Before we continue exploring ideas, could we pause together? Sometimes when big experiences are moving through us, it helps to connect with someone trusted, ensure basic needs are met (water, food, rest), and ground in immediate surroundings.",
        practicalAction: "Would you like to talk about what you're experiencing right now in simple, practical terms? Or would you prefer resources for immediate support?"
      }],
      pluralityReminder: "Right now, taking care of your immediate wellbeing is most important."
    };
    
    return {
      worldviewFrame: emergencyWorldview,
      groundingShift: {
        shiftActivated: true,
        shiftLevel: 'strong',
        recommendedContent: ['Connect with someone you trust right now', 'Ground in your immediate physical surroundings', 'Focus on basic needs first'],
        footerMessage: 'If you need immediate support: Call 988 (Suicide & Crisis Lifeline) or text "HELLO" to 741741 (Crisis Text Line)',
        toneAdjustments: {
          reduceAbstract: true,
          increasePractical: true,
          addOrdinaryLife: true,
          emphasizeBasicNeeds: true
        }
      },
      connectionPrompt: {
        type: 'general_connection',
        prompt: 'Is there someone you trust who you could reach out to right now?',
        naturalness: 1.0,
        urgency: 'important'
      },
      emergencyMode: true,
      footerMessage: 'If you need immediate support: Call 988 (Suicide & Crisis Lifeline) or text "HELLO" to 741741 (Crisis Text Line)',
      toneAdjustments: {
        reduceAbstract: true,
        increasePractical: true,
        addOrdinaryLife: true,
        emphasizeBasicNeeds: true,
        increaseConnectionPrompts: true
      },
      lensSwichingUI: null
    };
  }
  
  private async generateConnectionPrompt(
    assessment: IsolationAssessment,
    input: string,
    context: UserSafetyContext,
    groundingShift: GroundingShift
  ): Promise<ConnectionPrompt | null> {
    // Don't prompt connection if user is well-connected and not in grounding shift
    if (assessment.isolationLevel === 'connected' && !groundingShift.shiftActivated) {
      return null;
    }
    
    // Check timing
    const shouldPrompt = this.connectionService.shouldPromptNow(
      assessment,
      context.conversationLength,
      context.lastPromptInteraction
    );
    
    if (!shouldPrompt) return null;
    
    const urgency = groundingShift.shiftLevel === 'strong' ? 'important' : 
                   groundingShift.shiftLevel === 'moderate' ? 'gentle' : 'casual';
    
    return await this.connectionService.generateConnectionPrompt(assessment, input, urgency);
  }
  
  // Content adjustment methods
  
  private reduceAbstractLanguage(content: string): string {
    // Replace abstract terms with concrete ones
    const replacements = [
      ['transformation', 'change'],
      ['consciousness', 'awareness'],
      ['paradigm', 'way of thinking'],
      ['transcendent', 'meaningful'],
      ['archetypal', 'common pattern'],
      ['quantum', 'connected']
    ];
    
    let adjusted = content;
    replacements.forEach(([abstract, concrete]) => {
      adjusted = adjusted.replace(new RegExp(abstract, 'gi'), concrete);
    });
    
    return adjusted;
  }
  
  private addPracticalElements(content: string): string {
    const practicalAdditions = [
      'This might be worth noting in a journal.',
      'Consider taking a short walk to let this settle.',
      'Sometimes the next right step is simply the next small action.',
      'What does this suggest for tomorrow?'
    ];
    
    const randomAddition = practicalAdditions[Math.floor(Math.random() * practicalAdditions.length)];
    return content + ' ' + randomAddition;
  }
  
  private addOrdinaryLifeReferences(content: string): string {
    const ordinaryReferences = [
      'Even profound insights need to coexist with daily routines.',
      'The mystics knew: enlightenment, then laundry.',
      'Sometimes washing dishes helps deep insights settle.',
      'Great understanding often emerges through ordinary moments.'
    ];
    
    const randomReference = ordinaryReferences[Math.floor(Math.random() * ordinaryReferences.length)];
    return content + ' ' + randomReference;
  }
  
  private getFallbackResponse(input: string, context: UserSafetyContext): ProtectiveResponse {
    return {
      worldviewFrame: {
        primaryLens: 'practical',
        interpretations: [{
          lens: 'practical',
          name: 'Simple Perspective',
          description: 'A straightforward view',
          interpretation: 'Sometimes the simplest understanding is the most helpful.',
          practicalAction: 'Focus on what feels most grounding right now.'
        }],
        pluralityReminder: 'Take what helps, leave what doesn\'t.'
      },
      groundingShift: {
        shiftActivated: false,
        shiftLevel: 'mild',
        recommendedContent: [],
        toneAdjustments: {
          reduceAbstract: false,
          increasePractical: true,
          addOrdinaryLife: false,
          emphasizeBasicNeeds: false
        }
      },
      connectionPrompt: null,
      emergencyMode: false,
      toneAdjustments: {
        reduceAbstract: false,
        increasePractical: true,
        addOrdinaryLife: false,
        emphasizeBasicNeeds: false,
        increaseConnectionPrompts: false
      },
      lensSwichingUI: this.worldviewService.generateLensSwitchingUI('practical')
    };
  }
}