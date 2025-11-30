// Conversation Router - Intelligent archetypal response mode selection
// Routes users to optimal agent experiences based on sophisticated psychological analysis

import { logger } from '../utils/logger';
import { ContextAnalysis, contextAnalyzer, UserHistory } from './ContextAnalyzer';
import { integratedOracleService } from './IntegratedOracleService';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { FireAgent } from '../agents/FireAgent';
import { WaterAgent } from '../agents/WaterAgent';
import { EarthAgent } from '../agents/EarthAgent';
import { AirAgent } from '../agents/AirAgent';

export interface ResponseModeSelection {
  primaryAgent: 'maya' | 'fire' | 'water' | 'earth' | 'air';
  supportingAgents: string[];
  conversationStyle: {
    approach: 'analytical' | 'supportive' | 'creative' | 'practical' | 'mystical' | 'therapeutic';
    tone: 'gentle' | 'direct' | 'inspiring' | 'grounding' | 'challenging' | 'nurturing';
    depth: 'surface' | 'moderate' | 'deep' | 'transformational';
    pacing: 'immediate' | 'gradual' | 'patient' | 'intensive';
  };
  responseFramework: {
    openingStyle: string;
    bodyApproach: string;
    closingStyle: string;
    followUpSuggestions: string[];
  };
  confidence: number;
  reasoning: string;
}

export interface RoutingContext {
  userMessage: string;
  contextAnalysis: ContextAnalysis;
  userHistory?: UserHistory;
  sessionContext?: {
    previousAgent: string;
    sessionGoals: string[];
    therapeuticPhase: string;
    userPreferences: any;
  };
  environmentalFactors?: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'late_night';
    userLocation?: string;
    deviceType?: 'mobile' | 'desktop' | 'voice';
  };
}

class ConversationRouter {
  private agentCapabilities = {
    maya: {
      strengths: ['integration', 'wisdom', 'guidance', 'synthesis', 'personal_oracle'],
      domains: ['life_direction', 'meaning', 'integration', 'soul_guidance', 'wisdom_synthesis'],
      emotionalRange: ['contemplative', 'wise', 'integrative', 'mysterious', 'knowing'],
      complexity: 'high',
      archetypalEssence: 'divine_feminine_wisdom'
    },
    fire: {
      strengths: ['transformation', 'passion', 'creativity', 'breakthrough', 'energy'],
      domains: ['creative_blocks', 'passion_projects', 'transformation', 'energy', 'breakthrough'],
      emotionalRange: ['passionate', 'intense', 'transformative', 'energizing', 'catalytic'],
      complexity: 'high',
      archetypalEssence: 'transformative_power'
    },
    water: {
      strengths: ['emotional_healing', 'intuition', 'flow', 'cleansing', 'adaptation'],
      domains: ['emotions', 'healing', 'relationships', 'intuition', 'psychic_awareness'],
      emotionalRange: ['flowing', 'healing', 'intuitive', 'cleansing', 'adaptive'],
      complexity: 'medium',
      archetypalEssence: 'emotional_wisdom'
    },
    earth: {
      strengths: ['grounding', 'practical_wisdom', 'stability', 'nurturing', 'manifestation'],
      domains: ['practical_matters', 'grounding', 'stability', 'nurturing', 'material_world'],
      emotionalRange: ['stable', 'nurturing', 'grounding', 'practical', 'solid'],
      complexity: 'medium',
      archetypalEssence: 'material_wisdom'
    },
    air: {
      strengths: ['clarity', 'communication', 'intellectual_insight', 'perspective', 'freedom'],
      domains: ['mental_clarity', 'communication', 'ideas', 'perspective', 'intellectual_growth'],
      emotionalRange: ['clear', 'intellectual', 'free', 'detached', 'perspective'],
      complexity: 'medium',
      archetypalEssence: 'mental_clarity'
    }
  };

  private routingRules = {
    // Crisis routing - immediate supportive response
    crisis: {
      primaryAgent: 'water',
      supportingAgents: ['earth', 'maya'],
      approach: 'therapeutic',
      tone: 'nurturing',
      depth: 'moderate',
      pacing: 'immediate'
    },

    // Emotional processing - water-led with appropriate support
    emotional_processing: {
      primaryAgent: 'water',
      supportingAgents: ['earth'],
      approach: 'supportive',
      tone: 'gentle',
      depth: 'deep',
      pacing: 'patient'
    },

    // Creative breakthrough - fire-led transformation
    creative_breakthrough: {
      primaryAgent: 'fire',
      supportingAgents: ['air', 'water'],
      approach: 'creative',
      tone: 'inspiring',
      depth: 'deep',
      pacing: 'intensive'
    },

    // Practical guidance - earth-led grounding
    practical_guidance: {
      primaryAgent: 'earth',
      supportingAgents: ['air'],
      approach: 'practical',
      tone: 'grounding',
      depth: 'moderate',
      pacing: 'gradual'
    },

    // Intellectual analysis - air-led clarity
    intellectual_analysis: {
      primaryAgent: 'air',
      supportingAgents: ['maya'],
      approach: 'analytical',
      tone: 'direct',
      depth: 'deep',
      pacing: 'immediate'
    },

    // Spiritual/meaning exploration - maya-led wisdom
    spiritual_exploration: {
      primaryAgent: 'maya',
      supportingAgents: ['water', 'fire'],
      approach: 'mystical',
      tone: 'inspiring',
      depth: 'transformational',
      pacing: 'patient'
    }
  };

  async selectResponseMode(context: RoutingContext): Promise<ResponseModeSelection> {
    const { userMessage, contextAnalysis, userHistory, sessionContext } = context;

    try {
      logger.info('Routing conversation based on context analysis', {
        primaryEmotion: contextAnalysis.emotionalTone.primary,
        requestType: contextAnalysis.requestType.category,
        urgency: contextAnalysis.urgencyLevel
      });

      // Step 1: Assess routing priority factors
      const routingFactors = this.assessRoutingFactors(contextAnalysis, userHistory);

      // Step 2: Select primary routing pattern
      const routingPattern = this.selectRoutingPattern(routingFactors, contextAnalysis);

      // Step 3: Determine primary agent based on archetypal alignment and context
      const primaryAgent = this.selectPrimaryAgent(contextAnalysis, routingPattern, userHistory);

      // Step 4: Select supporting agents for multi-perspective response
      const supportingAgents = this.selectSupportingAgents(primaryAgent, contextAnalysis, routingPattern);

      // Step 5: Determine conversation style parameters
      const conversationStyle = this.determineConversationStyle(contextAnalysis, routingPattern, userHistory);

      // Step 6: Create response framework
      const responseFramework = this.createResponseFramework(primaryAgent, conversationStyle, contextAnalysis);

      // Step 7: Calculate confidence and reasoning
      const confidence = this.calculateConfidence(contextAnalysis, routingPattern);
      const reasoning = this.generateReasoning(primaryAgent, conversationStyle, routingFactors);

      const selection: ResponseModeSelection = {
        primaryAgent,
        supportingAgents,
        conversationStyle,
        responseFramework,
        confidence,
        reasoning
      };

      logger.info('Conversation routing completed', {
        primaryAgent,
        approach: conversationStyle.approach,
        confidence,
        reasoning: reasoning.substring(0, 100)
      });

      return selection;

    } catch (error) {
      logger.error('Conversation routing failed', { error: error.message });
      return this.getFallbackRouting(contextAnalysis);
    }
  }

  private assessRoutingFactors(analysis: ContextAnalysis, userHistory?: UserHistory) {
    return {
      // Emotional factors
      emotionalIntensity: analysis.emotionalTone.intensity,
      emotionalComplexity: analysis.emotionalTone.complexity,
      emotionalAuthenticity: analysis.emotionalTone.authenticity,

      // Request urgency
      requiresImmediate: analysis.urgencyLevel.immediate,
      requiresTherapeutic: analysis.urgencyLevel.therapeutic,

      // Readiness factors
      readyForInsight: analysis.readiness.forInsight,
      readyForChallenge: analysis.readiness.forChallenge,
      needsSupport: analysis.readiness.forSupport,
      readyForAction: analysis.readiness.forAction,

      // Communication preferences
      directnessPreference: analysis.communicationStyle.directness,
      metaphoricalThinking: analysis.communicationStyle.metaphoricalThinking,

      // Historical patterns
      preferredAgents: userHistory?.patterns.preferredApproaches || [],
      currentPhase: userHistory?.therapeutic.currentPhase || 'engagement'
    };
  }

  private selectRoutingPattern(factors: any, analysis: ContextAnalysis): string {
    // Crisis takes absolute priority
    if (analysis.urgencyLevel.immediate || factors.requiresTherapeutic) {
      return 'crisis';
    }

    // Route based on request type and archetypal alignment
    if (analysis.requestType.category === 'creative' ||
        (analysis.archetypeAlignment.fire > 0.4 && analysis.readiness.forChallenge > 0.6)) {
      return 'creative_breakthrough';
    }

    if (analysis.requestType.category === 'analytical' ||
        analysis.archetypeAlignment.air > 0.4) {
      return 'intellectual_analysis';
    }

    if (analysis.requestType.category === 'practical' ||
        analysis.archetypeAlignment.earth > 0.4) {
      return 'practical_guidance';
    }

    if (analysis.topicCategory.domain === 'spirituality' ||
        analysis.topicCategory.depth === 'core' ||
        analysis.topicCategory.depth === 'shadow') {
      return 'spiritual_exploration';
    }

    // Default to emotional processing for supportive needs
    return 'emotional_processing';
  }

  private selectPrimaryAgent(
    analysis: ContextAnalysis,
    pattern: string,
    userHistory?: UserHistory
  ): 'maya' | 'fire' | 'water' | 'earth' | 'air' {

    // Use routing pattern defaults with archetypal alignment override
    const patternDefault = this.routingRules[pattern]?.primaryAgent || 'maya';

    // Calculate agent scores based on multiple factors
    const agentScores = {
      maya: this.calculateAgentScore('maya', analysis, pattern, userHistory),
      fire: this.calculateAgentScore('fire', analysis, pattern, userHistory),
      water: this.calculateAgentScore('water', analysis, pattern, userHistory),
      earth: this.calculateAgentScore('earth', analysis, pattern, userHistory),
      air: this.calculateAgentScore('air', analysis, pattern, userHistory)
    };

    // Select highest scoring agent
    const selectedAgent = Object.keys(agentScores).reduce((a, b) =>
      agentScores[a] > agentScores[b] ? a : b
    ) as any;

    return selectedAgent;
  }

  private calculateAgentScore(
    agent: string,
    analysis: ContextAnalysis,
    pattern: string,
    userHistory?: UserHistory
  ): number {
    let score = 0;

    // Base archetypal alignment
    score += analysis.archetypeAlignment[agent] * 0.4;

    // Pattern fit
    if (this.routingRules[pattern]?.primaryAgent === agent) {
      score += 0.3;
    }

    // Domain expertise match
    const agentCaps = this.agentCapabilities[agent];
    if (agentCaps.domains.includes(analysis.topicCategory.domain)) {
      score += 0.2;
    }

    // Historical preference
    if (userHistory?.patterns.preferredApproaches.includes(agent)) {
      score += 0.1;
    }

    return score;
  }

  private selectSupportingAgents(
    primaryAgent: string,
    analysis: ContextAnalysis,
    pattern: string
  ): string[] {
    const supporting = [];
    const patternSupports = this.routingRules[pattern]?.supportingAgents || [];

    // Add pattern-suggested supporting agents
    patternSupports.forEach(agent => {
      if (agent !== primaryAgent) {
        supporting.push(agent);
      }
    });

    // Add highest archetypal alignment as backup support
    const alignmentKeys = Object.keys(analysis.archetypeAlignment)
      .filter(key => key !== primaryAgent)
      .sort((a, b) => analysis.archetypeAlignment[b] - analysis.archetypeAlignment[a]);

    if (alignmentKeys[0] && !supporting.includes(alignmentKeys[0])) {
      supporting.push(alignmentKeys[0]);
    }

    return supporting.slice(0, 2); // Limit to 2 supporting agents
  }

  private determineConversationStyle(
    analysis: ContextAnalysis,
    pattern: string,
    userHistory?: UserHistory
  ) {
    const baseStyle = this.routingRules[pattern] || this.routingRules.emotional_processing;

    return {
      approach: baseStyle.approach as any,
      tone: this.adjustTone(baseStyle.tone, analysis) as any,
      depth: this.adjustDepth(baseStyle.depth, analysis) as any,
      pacing: this.adjustPacing(baseStyle.pacing, analysis) as any
    };
  }

  private adjustTone(baseTone: string, analysis: ContextAnalysis): string {
    // Adjust based on emotional intensity and communication preferences
    if (analysis.emotionalTone.intensity > 0.8) {
      return 'gentle';
    }
    if (analysis.communicationStyle.directness > 0.7) {
      return 'direct';
    }
    if (analysis.readiness.forChallenge > 0.7) {
      return 'challenging';
    }
    return baseTone;
  }

  private adjustDepth(baseDepth: string, analysis: ContextAnalysis): string {
    if (analysis.topicCategory.depth === 'shadow' || analysis.topicCategory.depth === 'core') {
      return 'transformational';
    }
    if (analysis.readiness.forInsight > 0.7) {
      return 'deep';
    }
    return baseDepth;
  }

  private adjustPacing(basePacing: string, analysis: ContextAnalysis): string {
    if (analysis.urgencyLevel.immediate) {
      return 'immediate';
    }
    if (analysis.emotionalTone.intensity > 0.8) {
      return 'patient';
    }
    return basePacing;
  }

  private createResponseFramework(
    primaryAgent: string,
    style: any,
    analysis: ContextAnalysis
  ) {
    const frameworks = {
      maya: {
        openingStyle: 'mystical_acknowledgment',
        bodyApproach: 'wisdom_integration',
        closingStyle: 'soul_guidance',
        followUpSuggestions: ['deeper_exploration', 'meditation_practice', 'soul_work']
      },
      fire: {
        openingStyle: 'energetic_recognition',
        bodyApproach: 'transformational_challenge',
        closingStyle: 'catalytic_inspiration',
        followUpSuggestions: ['creative_practice', 'breakthrough_work', 'passionate_action']
      },
      water: {
        openingStyle: 'emotional_attunement',
        bodyApproach: 'healing_flow',
        closingStyle: 'nurturing_support',
        followUpSuggestions: ['emotional_processing', 'healing_practice', 'intuitive_guidance']
      },
      earth: {
        openingStyle: 'grounded_acknowledgment',
        bodyApproach: 'practical_wisdom',
        closingStyle: 'stable_support',
        followUpSuggestions: ['practical_steps', 'grounding_practice', 'material_manifestation']
      },
      air: {
        openingStyle: 'clarity_offering',
        bodyApproach: 'intellectual_exploration',
        closingStyle: 'perspective_expansion',
        followUpSuggestions: ['mental_clarity', 'communication_practice', 'idea_development']
      }
    };

    return frameworks[primaryAgent] || frameworks.maya;
  }

  private calculateConfidence(analysis: ContextAnalysis, pattern: string): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence for clear emotional signals
    confidence += analysis.emotionalTone.intensity * 0.2;

    // Boost for clear request type
    confidence += analysis.requestType.confidence * 0.2;

    // Boost for strong archetypal alignment
    const maxAlignment = Math.max(...Object.values(analysis.archetypeAlignment));
    confidence += maxAlignment * 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateReasoning(primaryAgent: string, style: any, factors: any): string {
    return `Selected ${primaryAgent} agent with ${style.approach} approach based on ${style.tone} tone needs, ` +
           `emotional intensity of ${factors.emotionalIntensity.toFixed(2)}, and readiness factors. ` +
           `This archetypal configuration provides optimal support for the user's current state and expressed needs.`;
  }

  private getFallbackRouting(analysis: ContextAnalysis): ResponseModeSelection {
    return {
      primaryAgent: 'maya',
      supportingAgents: ['water'],
      conversationStyle: {
        approach: 'supportive',
        tone: 'gentle',
        depth: 'moderate',
        pacing: 'gradual'
      },
      responseFramework: {
        openingStyle: 'gentle_acknowledgment',
        bodyApproach: 'supportive_exploration',
        closingStyle: 'nurturing_guidance',
        followUpSuggestions: ['continued_exploration', 'gentle_support', 'patient_guidance']
      },
      confidence: 0.3,
      reasoning: 'Fallback routing to Maya with supportive approach due to analysis limitations'
    };
  }

  // Method to learn from user interactions and improve routing over time
  async recordInteractionOutcome(
    context: RoutingContext,
    selection: ResponseModeSelection,
    userFeedback: {
      helpful: boolean;
      appropriateAgent: boolean;
      appropriateTone: boolean;
      notes?: string;
    }
  ) {
    // This would integrate with learning system to improve routing accuracy
    logger.info('Recording routing outcome for learning', {
      primaryAgent: selection.primaryAgent,
      helpful: userFeedback.helpful,
      appropriateAgent: userFeedback.appropriateAgent
    });
  }
}

export const conversationRouter = new ConversationRouter();