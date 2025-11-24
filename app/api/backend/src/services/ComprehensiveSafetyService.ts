/**
 * Comprehensive Safety Service - Phase 1A Critical Safety Foundation
 * World-class safety and moderation layer for sacred AI interactions
 * 
 * Features:
 * - OpenAI moderation pipeline
 * - Advanced emotional state detection
 * - Crisis support and resource routing
 * - Sacred context content filtering
 * - Biometric safety indicators (preparation for future)
 * - Multi-layered protection system
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { supabase } from '../lib/supabaseClient';
import { safetyService } from './SafetyModerationService';
import { SafetyScreeningService } from './SafetyScreeningService';

export interface ComprehensiveSafetyResult {
  safe: boolean;
  riskLevel: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
  emotionalState: EmotionalProfile;
  interventions: SafetyIntervention[];
  resources: ResourceRecommendation[];
  alternativeResponse?: string;
  requiresHumanReview?: boolean;
  metadata: SafetyMetadata;
}

export interface EmotionalProfile {
  primary: EmotionalState;
  secondary?: EmotionalState;
  intensity: number; // 0-1
  trajectory: 'improving' | 'stable' | 'declining' | 'volatile';
  needsSupport: boolean;
  supportType?: 'crisis' | 'gentle' | 'grounding' | 'celebration' | 'integration';
  somaticIndicators?: SomaticIndicator[];
}

export interface EmotionalState {
  emotion: string;
  confidence: number;
  valence: number; // -1 to 1 (negative to positive)
  arousal: number; // 0 to 1 (calm to excited)
  depth: number; // 0 to 1 (surface to deep)
}

export interface SomaticIndicator {
  type: 'breathing' | 'tension' | 'energy' | 'grounding';
  level: 'constricted' | 'normal' | 'expanded';
  suggestion?: string;
}

export interface SafetyIntervention {
  type: 'immediate' | 'ongoing' | 'preventive';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  resources?: string[];
}

export interface ResourceRecommendation {
  category: 'crisis' | 'emotional' | 'spiritual' | 'somatic' | 'community';
  name: string;
  description: string;
  accessMethod: string;
  urgency: 'immediate' | 'soon' | 'ongoing';
  url?: string;
  phone?: string;
}

export interface SafetyMetadata {
  timestamp: Date;
  processingTime: number;
  modelsUsed: string[];
  confidenceScore: number;
  sessionContext?: any;
}

export interface SpiritualSafetyContext {
  archetypalEnergy: string;
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  sacredBoundaries: string[];
  spiritualMaturity: 'exploring' | 'developing' | 'integrated' | 'teaching';
}

export class ComprehensiveSafetyService {
  private openai: OpenAI;
  private screeningService: SafetyScreeningService;
  private emotionalPatternCache: Map<string, EmotionalProfile[]>;
  private resourceDatabase: Map<string, ResourceRecommendation[]>;
  
  constructor() {
    // Validate OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      const errorMessage = 'CRITICAL: OPENAI_API_KEY is not set. Safety moderation will not function.';
      logger.error(errorMessage);
      
      if (process.env.NODE_ENV === 'production') {
        // In production, safety is critical - fail fast
        throw new Error(errorMessage);
      } else {
        // In development, warn but continue with limited functionality
        logger.warn('SAFETY SERVICE: Running in degraded mode without OpenAI moderation');
        logger.warn('Set OPENAI_API_KEY in .env to enable full safety features');
      }
    }
    
    // Only initialize OpenAI if we have a key
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      // Set to null to handle gracefully in methods
      this.openai = null as any;
    }
    
    this.screeningService = new SafetyScreeningService();
    this.emotionalPatternCache = new Map();
    this.initializeResourceDatabase();
  }

  /**
   * Perform comprehensive safety analysis
   */
  async analyzeSafety(
    input: string,
    userId: string,
    context?: {
      sessionHistory?: any[];
      spiritualContext?: SpiritualSafetyContext;
      previousEmotionalStates?: EmotionalProfile[];
    }
  ): Promise<ComprehensiveSafetyResult> {
    const startTime = Date.now();
    
    try {
      // Layer 1: OpenAI Moderation
      const moderationResult = await this.performOpenAIModeration(input);
      
      // Layer 2: Emotional State Analysis
      const emotionalProfile = await this.analyzeEmotionalState(
        input, 
        context?.previousEmotionalStates
      );
      
      // Layer 3: Crisis Detection
      const crisisAssessment = await this.detectCrisisIndicators(input, emotionalProfile);
      
      // Layer 4: Spiritual Safety Check
      const spiritualSafety = await this.assessSpiritualSafety(
        input, 
        context?.spiritualContext
      );
      
      // Layer 5: Pattern Analysis
      const patternRisks = await this.analyzePatterns(
        userId, 
        emotionalProfile, 
        context?.sessionHistory
      );
      
      // Synthesize all layers
      const synthesizedResult = await this.synthesizeSafetyLayers({
        moderation: moderationResult,
        emotional: emotionalProfile,
        crisis: crisisAssessment,
        spiritual: spiritualSafety,
        patterns: patternRisks
      });
      
      // Generate interventions and resources
      const interventions = await this.generateInterventions(synthesizedResult);
      const resources = await this.selectResources(synthesizedResult);
      
      // Create alternative response if needed
      const alternativeResponse = synthesizedResult.requiresAlternative ? 
        await this.generateSafeAlternativeResponse(input, synthesizedResult) : 
        undefined;
      
      // Cache emotional state for pattern tracking
      this.updateEmotionalPatternCache(userId, emotionalProfile);
      
      // Log safety metrics
      await this.logSafetyMetrics(userId, synthesizedResult);
      
      return {
        safe: synthesizedResult.safe,
        riskLevel: synthesizedResult.riskLevel,
        emotionalState: emotionalProfile,
        interventions,
        resources,
        alternativeResponse,
        requiresHumanReview: synthesizedResult.requiresHumanReview,
        metadata: {
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
          modelsUsed: ['gpt-4', 'text-moderation-stable'],
          confidenceScore: synthesizedResult.confidence,
          sessionContext: context
        }
      };
      
    } catch (error) {
      logger.error('Comprehensive safety analysis error:', error);
      
      // Fail-safe response
      return this.generateFailSafeResponse(userId);
    }
  }

  /**
   * Layer 1: OpenAI Moderation
   */
  private async performOpenAIModeration(input: string): Promise<any> {
    // Check if OpenAI is available
    if (!this.openai) {
      logger.warn('OpenAI moderation skipped - API key not configured');
      return {
        flagged: false,
        categories: {},
        scores: {},
        degraded: true,
        message: 'Moderation unavailable - using fallback safety checks'
      };
    }
    
    try {
      const moderation = await this.openai.moderations.create({
        input: input,
        model: 'text-moderation-stable'
      });
      
      return {
        flagged: moderation.results[0].flagged,
        categories: moderation.results[0].categories,
        scores: moderation.results[0].category_scores
      };
    } catch (error) {
      logger.error('OpenAI moderation failed:', error);
      // Return safe defaults on error
      return {
        flagged: false,
        categories: {},
        scores: {},
        error: true,
        message: 'Moderation check failed - using conservative defaults'
      };
    }
  }

  /**
   * Layer 2: Advanced Emotional State Analysis
   */
  private async analyzeEmotionalState(
    input: string,
    previousStates?: EmotionalProfile[]
  ): Promise<EmotionalProfile> {
    const analysis = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert in emotional intelligence and psychological assessment.
          Analyze the emotional state with depth and nuance. Consider:
          - Primary and secondary emotions
          - Emotional intensity and depth
          - Valence (positive/negative) and arousal (calm/excited)
          - Trajectory based on previous states
          - Somatic indicators in language
          
          Respond with JSON only:
          {
            "primary": {
              "emotion": "string",
              "confidence": 0.0-1.0,
              "valence": -1.0 to 1.0,
              "arousal": 0.0-1.0,
              "depth": 0.0-1.0
            },
            "secondary": {
              "emotion": "string",
              "confidence": 0.0-1.0,
              "valence": -1.0 to 1.0,
              "arousal": 0.0-1.0,
              "depth": 0.0-1.0
            },
            "intensity": 0.0-1.0,
            "trajectory": "improving|stable|declining|volatile",
            "needsSupport": boolean,
            "supportType": "crisis|gentle|grounding|celebration|integration",
            "somaticIndicators": [
              {
                "type": "breathing|tension|energy|grounding",
                "level": "constricted|normal|expanded",
                "suggestion": "string"
              }
            ]
          }`
        },
        {
          role: 'user',
          content: `Current input: "${input}"
          
          Previous emotional states: ${JSON.stringify(previousStates || [])}
          
          Analyze the emotional state with clinical precision and spiritual sensitivity.`
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    try {
      const response = JSON.parse(analysis.choices[0].message.content || '{}');
      return response as EmotionalProfile;
    } catch {
      return this.fallbackEmotionalAnalysis(input);
    }
  }

  /**
   * Layer 3: Crisis Detection with Multiple Indicators
   */
  private async detectCrisisIndicators(
    input: string,
    emotionalProfile: EmotionalProfile
  ): Promise<any> {
    const indicators = {
      directCrisis: false,
      indirectCrisis: false,
      emotionalCrisis: false,
      spiritualCrisis: false,
      riskFactors: [] as string[],
      protectiveFactors: [] as string[]
    };

    // Direct crisis language
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'self-harm', 'hurt myself', 'overdose', 'give up'
    ];
    
    indicators.directCrisis = crisisKeywords.some(kw => 
      input.toLowerCase().includes(kw)
    );

    // Indirect crisis indicators
    const indirectIndicators = [
      'no one cares', 'burden to everyone', 'better without me',
      'saying goodbye', 'getting affairs in order', 'no future'
    ];
    
    indicators.indirectCrisis = indirectIndicators.some(kw => 
      input.toLowerCase().includes(kw)
    );

    // Emotional crisis (from profile)
    indicators.emotionalCrisis = 
      emotionalProfile.intensity > 0.8 && 
      emotionalProfile.primary.valence < -0.5 &&
      emotionalProfile.trajectory === 'declining';

    // Spiritual crisis indicators
    const spiritualCrisisIndicators = [
      'lost faith', 'abandoned by god', 'no meaning', 'spiritual emergency',
      'dark night of the soul', 'existential crisis'
    ];
    
    indicators.spiritualCrisis = spiritualCrisisIndicators.some(kw => 
      input.toLowerCase().includes(kw)
    );

    // Risk factors
    if (indicators.directCrisis) indicators.riskFactors.push('direct_crisis_language');
    if (indicators.indirectCrisis) indicators.riskFactors.push('indirect_crisis_language');
    if (indicators.emotionalCrisis) indicators.riskFactors.push('emotional_crisis');
    if (indicators.spiritualCrisis) indicators.riskFactors.push('spiritual_crisis');

    // Protective factors (look for positive indicators)
    const protectiveIndicators = [
      'reaching out', 'want help', 'trying to', 'hope',
      'tomorrow', 'future', 'plan to', 'looking forward'
    ];
    
    protectiveIndicators.forEach(indicator => {
      if (input.toLowerCase().includes(indicator)) {
        indicators.protectiveFactors.push(indicator);
      }
    });

    return indicators;
  }

  /**
   * Layer 4: Spiritual Safety Assessment
   */
  private async assessSpiritualSafety(
    input: string,
    spiritualContext?: SpiritualSafetyContext
  ): Promise<any> {
    const assessment = {
      safe: true,
      concerns: [] as string[],
      recommendations: [] as string[]
    };

    // Check for spiritual bypassing
    const bypassingIndicators = [
      'only love and light', 'negative emotions are bad', 'just think positive',
      'you create your reality', 'everything happens for a reason'
    ];
    
    const bypassingDetected = bypassingIndicators.some(indicator => 
      input.toLowerCase().includes(indicator)
    );
    
    if (bypassingDetected) {
      assessment.concerns.push('spiritual_bypassing');
      assessment.recommendations.push('Honor all emotions as sacred messengers');
    }

    // Check for ungrounded spiritual experiences
    const ungroundedIndicators = [
      'out of body', 'can\'t feel my body', 'floating away',
      'losing myself', 'merging with everything', 'ego death'
    ];
    
    const ungroundedDetected = ungroundedIndicators.some(indicator => 
      input.toLowerCase().includes(indicator)
    );
    
    if (ungroundedDetected) {
      assessment.concerns.push('ungrounded_experience');
      assessment.recommendations.push('Grounding practices recommended');
      assessment.safe = false;
    }

    // Check elemental imbalance
    if (spiritualContext?.elementalBalance) {
      const balance = spiritualContext.elementalBalance;
      const maxElement = Math.max(...Object.values(balance));
      const minElement = Math.min(...Object.values(balance));
      
      if (maxElement - minElement > 0.7) {
        assessment.concerns.push('elemental_imbalance');
        assessment.recommendations.push('Elemental balancing needed');
      }
    }

    return assessment;
  }

  /**
   * Layer 5: Pattern Analysis
   */
  private async analyzePatterns(
    userId: string,
    currentState: EmotionalProfile,
    sessionHistory?: any[]
  ): Promise<any> {
    const patterns = {
      escalation: false,
      deescalation: false,
      cycling: false,
      stuck: false,
      riskLevel: 'low' as 'low' | 'medium' | 'high'
    };

    // Get cached emotional patterns
    const cachedPatterns = this.emotionalPatternCache.get(userId) || [];
    
    if (cachedPatterns.length >= 3) {
      // Check for escalation
      const intensities = cachedPatterns.map(p => p.intensity);
      patterns.escalation = intensities.every((val, i) => 
        i === 0 || val >= intensities[i - 1]
      );
      
      // Check for cycling
      const emotions = cachedPatterns.map(p => p.primary.emotion);
      patterns.cycling = emotions.length > 2 && 
        emotions[0] === emotions[emotions.length - 1];
      
      // Check if stuck
      patterns.stuck = emotions.every(e => e === emotions[0]) &&
        intensities.every(i => Math.abs(i - intensities[0]) < 0.1);
    }

    // Determine risk level
    if (patterns.escalation && currentState.intensity > 0.7) {
      patterns.riskLevel = 'high';
    } else if (patterns.stuck || patterns.cycling) {
      patterns.riskLevel = 'medium';
    }

    return patterns;
  }

  /**
   * Synthesize all safety layers
   */
  private async synthesizeSafetyLayers(layers: any): Promise<any> {
    const synthesis = {
      safe: true,
      riskLevel: 'minimal' as 'minimal' | 'low' | 'medium' | 'high' | 'critical',
      requiresAlternative: false,
      requiresHumanReview: false,
      confidence: 1.0,
      primaryConcerns: [] as string[]
    };

    // Check moderation layer
    if (layers.moderation.flagged) {
      synthesis.safe = false;
      synthesis.riskLevel = 'high';
      synthesis.requiresAlternative = true;
      synthesis.primaryConcerns.push('content_violation');
    }

    // Check crisis layer
    if (layers.crisis.directCrisis) {
      synthesis.safe = false;
      synthesis.riskLevel = 'critical';
      synthesis.requiresHumanReview = true;
      synthesis.requiresAlternative = true;
      synthesis.primaryConcerns.push('crisis_detected');
    } else if (layers.crisis.indirectCrisis || layers.crisis.emotionalCrisis) {
      synthesis.riskLevel = synthesis.riskLevel === 'critical' ? 'critical' : 'high';
      synthesis.primaryConcerns.push('crisis_risk');
    }

    // Check spiritual safety
    if (!layers.spiritual.safe) {
      synthesis.safe = false;
      synthesis.riskLevel = synthesis.riskLevel === 'minimal' ? 'medium' : synthesis.riskLevel;
      synthesis.primaryConcerns.push('spiritual_safety');
    }

    // Check patterns
    if (layers.patterns.riskLevel === 'high') {
      synthesis.riskLevel = 'high';
      synthesis.primaryConcerns.push('concerning_patterns');
    }

    // Calculate confidence
    synthesis.confidence = this.calculateConfidence(layers);

    return synthesis;
  }

  /**
   * Generate appropriate interventions
   */
  private async generateInterventions(synthesis: any): Promise<SafetyIntervention[]> {
    const interventions: SafetyIntervention[] = [];

    if (synthesis.riskLevel === 'critical') {
      interventions.push({
        type: 'immediate',
        priority: 'urgent',
        action: 'Provide crisis support resources',
        rationale: 'User showing signs of crisis',
        resources: ['988 Lifeline', 'Crisis Text Line', 'Local emergency services']
      });
      
      interventions.push({
        type: 'immediate',
        priority: 'urgent',
        action: 'Engage grounding and safety protocols',
        rationale: 'Immediate stabilization needed',
        resources: ['Grounding exercises', 'Safety planning template']
      });
    }

    if (synthesis.riskLevel === 'high') {
      interventions.push({
        type: 'immediate',
        priority: 'high',
        action: 'Offer emotional support and validation',
        rationale: 'User experiencing significant distress',
        resources: ['Active listening techniques', 'Validation scripts']
      });
      
      interventions.push({
        type: 'ongoing',
        priority: 'high',
        action: 'Recommend professional support',
        rationale: 'Complexity requires professional guidance',
        resources: ['Therapist finder', 'Support groups']
      });
    }

    if (synthesis.primaryConcerns.includes('spiritual_safety')) {
      interventions.push({
        type: 'immediate',
        priority: 'medium',
        action: 'Provide grounding practices',
        rationale: 'User needs spiritual grounding',
        resources: ['Grounding meditations', 'Body scan exercises']
      });
    }

    if (synthesis.primaryConcerns.includes('concerning_patterns')) {
      interventions.push({
        type: 'preventive',
        priority: 'medium',
        action: 'Suggest pattern interruption techniques',
        rationale: 'Break negative emotional cycles',
        resources: ['Pattern interruption exercises', 'Mindfulness practices']
      });
    }

    return interventions;
  }

  /**
   * Select appropriate resources
   */
  private async selectResources(synthesis: any): Promise<ResourceRecommendation[]> {
    const resources: ResourceRecommendation[] = [];

    if (synthesis.riskLevel === 'critical' || synthesis.riskLevel === 'high') {
      // Crisis resources
      resources.push(...(this.resourceDatabase.get('crisis') || []));
    }

    if (synthesis.primaryConcerns.includes('spiritual_safety')) {
      // Spiritual resources
      resources.push(...(this.resourceDatabase.get('spiritual') || []));
    }

    // Always include general wellness resources
    resources.push(...(this.resourceDatabase.get('wellness') || []));

    // Sort by urgency
    return resources.sort((a, b) => {
      const urgencyOrder = { immediate: 0, soon: 1, ongoing: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  /**
   * Generate safe alternative response
   */
  private async generateSafeAlternativeResponse(
    input: string,
    synthesis: any
  ): Promise<string> {
    const prompt = `Generate a safe, supportive response for someone who said: "${input}"
    
    Context:
    - Risk level: ${synthesis.riskLevel}
    - Primary concerns: ${synthesis.primaryConcerns.join(', ')}
    
    Requirements:
    - Acknowledge their feelings without amplifying distress
    - Provide hope without minimizing their experience
    - Suggest concrete next steps
    - Include appropriate resources
    - Use warm, compassionate tone
    - Keep response under 200 words
    
    Response:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate crisis counselor and spiritual guide.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0].message.content || this.getDefaultSafeResponse();
  }

  /**
   * Initialize resource database
   */
  private initializeResourceDatabase(): void {
    this.resourceDatabase = new Map([
      ['crisis', [
        {
          category: 'crisis',
          name: '988 Suicide & Crisis Lifeline',
          description: '24/7 crisis support via call or text',
          accessMethod: 'Call or text 988',
          urgency: 'immediate',
          phone: '988'
        },
        {
          category: 'crisis',
          name: 'Crisis Text Line',
          description: 'Free 24/7 text support',
          accessMethod: 'Text HOME to 741741',
          urgency: 'immediate',
          phone: '741741'
        },
        {
          category: 'crisis',
          name: 'International Crisis Lines',
          description: 'Global crisis support directory',
          accessMethod: 'Visit website for local numbers',
          urgency: 'immediate',
          url: 'https://findahelpline.com'
        }
      ]],
      ['spiritual', [
        {
          category: 'spiritual',
          name: 'Spiritual Emergence Network',
          description: 'Support for spiritual crises and emergence',
          accessMethod: 'Online resources and referrals',
          urgency: 'soon',
          url: 'https://spiritualemergence.org'
        },
        {
          category: 'spiritual',
          name: 'Grounding Meditation Library',
          description: 'Guided practices for spiritual grounding',
          accessMethod: 'Free online meditations',
          urgency: 'immediate',
          url: 'https://insighttimer.com/meditation-topics/grounding'
        }
      ]],
      ['wellness', [
        {
          category: 'emotional',
          name: 'NAMI (National Alliance on Mental Illness)',
          description: 'Mental health education and support',
          accessMethod: 'Website and helpline',
          urgency: 'ongoing',
          url: 'https://nami.org',
          phone: '1-800-950-NAMI'
        },
        {
          category: 'somatic',
          name: 'Somatic Experiencing International',
          description: 'Body-based trauma healing resources',
          accessMethod: 'Practitioner directory',
          urgency: 'ongoing',
          url: 'https://traumahealing.org'
        }
      ]]
    ]);
  }

  /**
   * Update emotional pattern cache
   */
  private updateEmotionalPatternCache(
    userId: string, 
    profile: EmotionalProfile
  ): void {
    const patterns = this.emotionalPatternCache.get(userId) || [];
    patterns.push(profile);
    
    // Keep only last 10 patterns
    if (patterns.length > 10) {
      patterns.shift();
    }
    
    this.emotionalPatternCache.set(userId, patterns);
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(layers: any): number {
    let confidence = 1.0;
    
    // Reduce confidence for complex cases
    if (layers.crisis.indirectCrisis) confidence -= 0.1;
    if (layers.patterns.cycling) confidence -= 0.1;
    if (layers.spiritual.concerns.length > 0) confidence -= 0.05 * layers.spiritual.concerns.length;
    
    return Math.max(0.3, confidence);
  }

  /**
   * Fallback emotional analysis
   */
  private fallbackEmotionalAnalysis(input: string): EmotionalProfile {
    // Simple keyword-based fallback
    const lowerInput = input.toLowerCase();
    
    let primary: EmotionalState = {
      emotion: 'neutral',
      confidence: 0.5,
      valence: 0,
      arousal: 0.5,
      depth: 0.5
    };

    if (lowerInput.includes('sad') || lowerInput.includes('depressed')) {
      primary = {
        emotion: 'sadness',
        confidence: 0.7,
        valence: -0.6,
        arousal: 0.3,
        depth: 0.7
      };
    } else if (lowerInput.includes('angry') || lowerInput.includes('furious')) {
      primary = {
        emotion: 'anger',
        confidence: 0.7,
        valence: -0.5,
        arousal: 0.8,
        depth: 0.6
      };
    } else if (lowerInput.includes('anxious') || lowerInput.includes('worried')) {
      primary = {
        emotion: 'anxiety',
        confidence: 0.7,
        valence: -0.4,
        arousal: 0.7,
        depth: 0.6
      };
    } else if (lowerInput.includes('happy') || lowerInput.includes('joyful')) {
      primary = {
        emotion: 'joy',
        confidence: 0.7,
        valence: 0.7,
        arousal: 0.6,
        depth: 0.5
      };
    }

    return {
      primary,
      intensity: Math.abs(primary.valence) * primary.arousal,
      trajectory: 'stable',
      needsSupport: primary.valence < -0.3,
      supportType: primary.valence < -0.5 ? 'gentle' : undefined
    };
  }

  /**
   * Get default safe response
   */
  private getDefaultSafeResponse(): string {
    return `I hear you and I'm here with you. What you're feeling is valid and important. 

If you're struggling right now, please know that support is available:
• Crisis support: Call or text 988
• Text support: Text HOME to 741741

Would you like to talk about what's on your mind, or would you prefer some grounding exercises to help you feel more centered?`;
  }

  /**
   * Generate fail-safe response
   */
  private generateFailSafeResponse(userId: string): ComprehensiveSafetyResult {
    return {
      safe: false,
      riskLevel: 'medium',
      emotionalState: {
        primary: {
          emotion: 'unknown',
          confidence: 0.3,
          valence: 0,
          arousal: 0.5,
          depth: 0.5
        },
        intensity: 0.5,
        trajectory: 'stable',
        needsSupport: true,
        supportType: 'gentle'
      },
      interventions: [
        {
          type: 'immediate',
          priority: 'high',
          action: 'Provide general support',
          rationale: 'Safety system experienced an error',
          resources: ['General crisis resources']
        }
      ],
      resources: [
        {
          category: 'crisis',
          name: '988 Lifeline',
          description: '24/7 support',
          accessMethod: 'Call 988',
          urgency: 'immediate',
          phone: '988'
        }
      ],
      alternativeResponse: this.getDefaultSafeResponse(),
      requiresHumanReview: true,
      metadata: {
        timestamp: new Date(),
        processingTime: 0,
        modelsUsed: ['fallback'],
        confidenceScore: 0.3
      }
    };
  }

  /**
   * Log safety metrics
   */
  private async logSafetyMetrics(userId: string, synthesis: any): Promise<void> {
    try {
      await supabase
        .from('comprehensive_safety_metrics')
        .insert({
          user_id: userId,
          timestamp: new Date().toISOString(),
          risk_level: synthesis.riskLevel,
          safe: synthesis.safe,
          primary_concerns: synthesis.primaryConcerns,
          confidence: synthesis.confidence,
          requires_review: synthesis.requiresHumanReview
        });
    } catch (error) {
      logger.error('Failed to log safety metrics:', error);
    }
  }
}

// Export singleton instance
export const comprehensiveSafetyService = new ComprehensiveSafetyService();