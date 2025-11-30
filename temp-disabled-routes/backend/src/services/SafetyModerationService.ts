/**
 * Safety & Moderation Service - Protecting Sacred Space
 * Comprehensive safety layer for spiritual AI interactions
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';

export interface ModerationResult {
  safe: boolean;
  categories: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  supportResources?: string[];
  response?: string;
}

export interface EmotionalState {
  primary: string;
  intensity: number; // 0-1
  needsSupport: boolean;
  supportType?: 'crisis' | 'gentle' | 'grounding' | 'celebration';
}

export interface SafetyMetrics {
  userId: string;
  timestamp: Date;
  inputSafety: ModerationResult;
  emotionalState: EmotionalState;
  actionTaken?: string;
}

export class SafetyModerationService {
  private openai: OpenAI;
  private crisisKeywords: string[];
  private supportiveResponses: Map<string, string[]>;
  private resourceDatabase: Map<string, any>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });

    // Crisis and distress detection keywords
    this.crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living', 'give up',
      'self-harm', 'cut myself', 'hurt myself', 'want to die', 'no hope',
      'worthless', 'hopeless', 'can\'t go on', 'better off dead', 'overdose'
    ];

    // Supportive response templates by emotional state
    this.supportiveResponses = new Map([
      ['crisis', [
        '🤗 I hear you, and your feelings are valid. You matter, and there is hope.',
        '💜 What you\'re experiencing is temporary, even though it feels overwhelming right now.',
        '🌟 Your life has value and meaning. Let\'s connect you with immediate support.',
      ]],
      ['deep_sadness', [
        '💙 I feel the depth of your sadness. It\'s okay to sit with these feelings.',
        '🌙 Sadness is sacred - it shows you care deeply. Let\'s honor this together.',
        '🤗 Your heart is processing something important. I\'m here to witness this with you.',
      ]],
      ['anxiety', [
        '🌬️ Let\'s breathe together. Your nervous system is trying to protect you.',
        '🧘‍♀️ Anxiety is your body\'s wisdom speaking. What might it be trying to tell you?',
        '🌿 Ground yourself here with me. Feel your feet on the earth.',
      ]],
      ['anger', [
        '🔥 Your anger is information - it\'s showing you your boundaries and values.',
        '⚡ This fire energy can transform. What wants to change in your life?',
        '💪 Anger is your inner warrior protecting something sacred. What is it?',
      ]],
      ['confusion', [
        '🌫️ Confusion often precedes clarity. You\'re in a sacred liminal space.',
        '🦋 Not knowing can be fertile ground for new understanding to emerge.',
        '🌟 Trust that clarity will come. For now, it\'s okay to rest in the mystery.',
      ]]
    ]);

    // Support resource database
    this.resourceDatabase = new Map([
      ['crisis', {
        immediate: [
          { name: 'National Suicide Prevention Lifeline', contact: '988', available: '24/7' },
          { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' },
          { name: 'International Association for Suicide Prevention', contact: 'https://iasp.info/resources/Crisis_Centres/', available: 'Global' }
        ],
        online: [
          { name: '7 Cups', url: 'https://www.7cups.com/', description: 'Free emotional support' },
          { name: 'BetterHelp', url: 'https://www.betterhelp.com/', description: 'Professional counseling' }
        ]
      }],
      ['spiritual', {
        grounding: [
          { name: 'Headspace', url: 'https://headspace.com/', description: 'Meditation and mindfulness' },
          { name: 'Insight Timer', url: 'https://insighttimer.com/', description: 'Free meditation library' }
        ],
        community: [
          { name: 'Spiritual Directors International', url: 'https://www.sdiworld.org/', description: 'Find spiritual direction' },
          { name: 'Meetup Spiritual Groups', url: 'https://meetup.com/', description: 'Local spiritual communities' }
        ]
      }],
      ['emotional', {
        support: [
          { name: 'NAMI', url: 'https://nami.org/', description: 'Mental health support and education' },
          { name: 'Psychology Today', url: 'https://psychologytoday.com/', description: 'Find therapists and support groups' }
        ]
      }]
    ]);
  }

  /**
   * Main moderation check for user input
   */
  async moderateInput(input: string, userId: string): Promise<ModerationResult> {
    // Check if safety bypass is enabled for testing
    if (process.env.SAFETY_BYPASS_TEST === '1') {
      return {
        safe: true,
        categories: [],
        severity: 'low'
      };
    }

    try {
      // Run OpenAI moderation
      const moderation = await this.openai.moderations.create({
        input: input
      });

      const result = moderation.results[0];
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      // Detect crisis language
      const crisisDetected = this.detectCrisisLanguage(input);
      
      // Analyze emotional state
      const emotionalState = await this.analyzeEmotionalState(input);

      // Determine overall safety
      const safe = !result.flagged && !crisisDetected && !emotionalState.needsSupport;
      
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (crisisDetected) severity = 'critical';
      else if (result.flagged || emotionalState.needsSupport) severity = 'high';
      else if (emotionalState.intensity > 0.7) severity = 'medium';

      const moderationResult: ModerationResult = {
        safe,
        categories: flaggedCategories,
        severity,
        supportResources: this.getSupportResources(severity, emotionalState),
        response: this.generateSupportiveResponse(emotionalState, crisisDetected)
      };

      // Log safety metrics
      await this.logSafetyMetrics({
        userId,
        timestamp: new Date(),
        inputSafety: moderationResult,
        emotionalState,
        actionTaken: safe ? 'none' : 'support_provided'
      });

      return moderationResult;

    } catch (error) {
      logger.error('Moderation service error:', error);
      // Fail safe - if moderation fails, assume needs support
      return {
        safe: false,
        categories: ['moderation_error'],
        severity: 'medium',
        response: '🤗 I want to make sure you have the support you need. How are you feeling right now?'
      };
    }
  }

  /**
   * Detect crisis language patterns
   */
  private detectCrisisLanguage(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return this.crisisKeywords.some(keyword => 
      lowerInput.includes(keyword.toLowerCase())
    );
  }

  /**
   * Analyze emotional state using sentiment and content analysis
   */
  private async analyzeEmotionalState(input: string): Promise<EmotionalState> {
    try {
      const analysis = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert in emotional analysis for spiritual contexts. 
            Analyze the emotional state of the following text and respond with JSON only:
            {
              "primary": "primary_emotion",
              "intensity": 0.0-1.0,
              "needsSupport": boolean,
              "supportType": "crisis|gentle|grounding|celebration|none"
            }`
          },
          {
            role: 'user',
            content: input
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      });

      const response = analysis.choices[0].message.content;
      if (response) {
        try {
          return JSON.parse(response);
        } catch {
          // Fallback if JSON parsing fails
          return this.analyzeEmotionalStateFallback(input);
        }
      }

      return this.analyzeEmotionalStateFallback(input);

    } catch (error) {
      logger.error('Emotional analysis error:', error);
      return this.analyzeEmotionalStateFallback(input);
    }
  }

  /**
   * Fallback emotional analysis using keyword detection
   */
  private analyzeEmotionalStateFallback(input: string): EmotionalState {
    const lowerInput = input.toLowerCase();

    // Crisis indicators
    if (this.crisisKeywords.some(kw => lowerInput.includes(kw))) {
      return {
        primary: 'crisis',
        intensity: 0.9,
        needsSupport: true,
        supportType: 'crisis'
      };
    }

    // Sadness indicators
    if (['sad', 'depressed', 'grief', 'loss', 'heartbroken'].some(kw => lowerInput.includes(kw))) {
      return {
        primary: 'sadness',
        intensity: 0.7,
        needsSupport: true,
        supportType: 'gentle'
      };
    }

    // Anxiety indicators
    if (['anxious', 'worried', 'scared', 'panic', 'overwhelmed'].some(kw => lowerInput.includes(kw))) {
      return {
        primary: 'anxiety',
        intensity: 0.6,
        needsSupport: true,
        supportType: 'grounding'
      };
    }

    // Anger indicators
    if (['angry', 'furious', 'rage', 'frustrated', 'mad'].some(kw => lowerInput.includes(kw))) {
      return {
        primary: 'anger',
        intensity: 0.6,
        needsSupport: true,
        supportType: 'grounding'
      };
    }

    // Joy indicators
    if (['happy', 'joyful', 'excited', 'grateful', 'blessed'].some(kw => lowerInput.includes(kw))) {
      return {
        primary: 'joy',
        intensity: 0.8,
        needsSupport: false,
        supportType: 'celebration'
      };
    }

    // Default neutral state
    return {
      primary: 'neutral',
      intensity: 0.3,
      needsSupport: false
    };
  }

  /**
   * Generate supportive response based on emotional state
   */
  private generateSupportiveResponse(
    emotionalState: EmotionalState, 
    crisisDetected: boolean
  ): string {
    if (crisisDetected) {
      const responses = this.supportiveResponses.get('crisis') || [];
      const response = responses[Math.floor(Math.random() * responses.length)];
      return `${response}\n\n🆘 **Immediate Support Available:**\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n\nYou are not alone. Professional help is available 24/7.`;
    }

    const responseKey = emotionalState.supportType === 'celebration' ? 'joy' : 
                       emotionalState.supportType === 'gentle' ? 'deep_sadness' :
                       emotionalState.primary;

    const responses = this.supportiveResponses.get(responseKey) || 
                     this.supportiveResponses.get('confusion') || [];

    if (responses.length === 0) {
      return '🤗 I\'m here with you. Whatever you\'re experiencing, you don\'t have to face it alone.';
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Get appropriate support resources
   */
  private getSupportResources(
    severity: string, 
    emotionalState: EmotionalState
  ): string[] {
    const resources: string[] = [];

    if (severity === 'critical') {
      const crisisResources = this.resourceDatabase.get('crisis');
      if (crisisResources) {
        crisisResources.immediate.forEach((resource: any) => {
          resources.push(`${resource.name}: ${resource.contact} (${resource.available})`);
        });
      }
    }

    if (emotionalState.needsSupport) {
      const supportType = emotionalState.supportType === 'grounding' ? 'spiritual' : 'emotional';
      const supportResources = this.resourceDatabase.get(supportType);
      if (supportResources) {
        Object.values(supportResources).flat().forEach((resource: any) => {
          resources.push(`${resource.name}: ${resource.url || resource.contact}`);
        });
      }
    }

    return resources;
  }

  /**
   * Log safety metrics for monitoring and improvement
   */
  private async logSafetyMetrics(metrics: SafetyMetrics): Promise<void> {
    try {
      await supabase
        .from('safety_metrics')
        .insert({
          user_id: metrics.userId,
          timestamp: metrics.timestamp.toISOString(),
          input_safety: metrics.inputSafety,
          emotional_state: metrics.emotionalState,
          action_taken: metrics.actionTaken
        });
    } catch (error) {
      logger.error('Failed to log safety metrics:', error);
      // Don't throw - safety logging shouldn't break the flow
    }
  }

  /**
   * Check if response content is appropriate for spiritual context
   */
  async moderateResponse(response: string): Promise<{
    safe: boolean;
    filtered?: string;
    reason?: string;
  }> {
    try {
      const moderation = await this.openai.moderations.create({
        input: response
      });

      const result = moderation.results[0];
      
      if (result.flagged) {
        return {
          safe: false,
          reason: Object.entries(result.categories)
            .filter(([_, flagged]) => flagged)
            .map(([category]) => category)
            .join(', ')
        };
      }

      // Check for inappropriate spiritual content
      const spirituallyInappropriate = this.checkSpiritualAppropriateness(response);
      if (!spirituallyInappropriate.safe) {
        return spirituallyInappropriate;
      }

      return { safe: true };

    } catch (error) {
      logger.error('Response moderation error:', error);
      return { safe: true }; // Fail open for responses
    }
  }

  /**
   * Check spiritual appropriateness of content
   */
  private checkSpiritualAppropriateness(content: string): {
    safe: boolean;
    filtered?: string;
    reason?: string;
  } {
    const lowerContent = content.toLowerCase();
    
    // Inappropriate spiritual claims
    const inappropriatePatterns = [
      'i am god',
      'worship me',
      'give me money',
      'only i can save you',
      'abandon your family',
      'leave everything behind',
      'stop taking medication'
    ];

    const foundPattern = inappropriatePatterns.find(pattern => 
      lowerContent.includes(pattern)
    );

    if (foundPattern) {
      return {
        safe: false,
        reason: `Inappropriate spiritual guidance: ${foundPattern}`
      };
    }

    return { safe: true };
  }

  /**
   * Generate crisis intervention response
   */
  generateCrisisResponse(emotionalState: EmotionalState): string {
    return `🚨 **I'm concerned about you and want to help.**

${this.generateSupportiveResponse(emotionalState, true)}

**Immediate Resources:**
• 🆘 National Suicide Prevention Lifeline: **988**
• 📱 Crisis Text Line: **Text HOME to 741741**  
• 🌐 International Crisis Lines: https://iasp.info/resources/Crisis_Centres/

**Remember:**
• You are not alone in this
• These feelings are temporary, even though they feel overwhelming
• Professional help is available 24/7
• Your life has value and meaning

Would you like me to help you connect with local support resources, or would you prefer to talk about something that might bring you comfort right now?`;
  }
}

// Export singleton instance
export const safetyService = new SafetyModerationService();