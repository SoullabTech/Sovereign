import { AgentResponse } from "../types/agentResponse";
import { ConversationalContext, ConversationalResult, conversationalPipeline } from './ConversationalPipeline';
import { dialogueStateTracker, DialogueState, UserIntent, DialogueStage } from './EnhancedDialogueStateTracker';
import { ConversationThreadingService } from './ConversationThreadingService';
import { SesameMayaRefiner } from './SesameMayaRefiner';
import { logger } from '../utils/logger';
import { AgentResponse, UserState } from '../types/agentCommunication';
import { EventEmitter } from 'events';

// Enhanced context with dialogue state
export interface EnhancedConversationalContext extends ConversationalContext {
  threadId: string;
  dialogueState?: DialogueState;
  intentAwareRefinement?: boolean;
  emotionAdaptiveVoice?: boolean;
}

// Enhanced result with state insights
export interface EnhancedConversationalResult extends ConversationalResult {
  dialogueInsights: {
    intent: UserIntent;
    topic: string;
    emotionalTone: string;
    stage: DialogueStage;
    momentum: number;
    suggestions: string[];
  };
  stateGuidedRefinements: {
    applied: string[];
    voiceModulations: string[];
    pacingAdjustments: string[];
  };
}

// Event types for real-time dialogue tracking
export interface DialogueEvents {
  'intent:detected': { threadId: string; intent: UserIntent; confidence: number };
  'topic:changed': { threadId: string; from: string; to: string };
  'emotion:shift': { threadId: string; emotion: string; intensity: number };
  'stage:transition': { threadId: string; from: DialogueStage; to: DialogueStage };
  'breakthrough:detected': { threadId: string; marker: string };
  'resistance:encountered': { threadId: string; type: string; intensity: number };
}

export class EnhancedConversationalOrchestrator extends EventEmitter {
  private threadingService: ConversationThreadingService;
  private mayaRefiner: SesameMayaRefiner;
  private activeThreads: Map<string, {
    lastActivity: Date;
    momentum: number;
    intentHistory: UserIntent[];
  }> = new Map();

  constructor() {
    super();
    this.threadingService = ConversationThreadingService.getInstance();
    this.mayaRefiner = new SesameMayaRefiner({ element: 'aether' });
    
    // Clean up inactive threads every hour
    setInterval(() => this.cleanupInactiveThreads(), 60 * 60 * 1000);
  }

  /**
   * Enhanced conversational flow with full dialogue state tracking
   */
  async orchestrateConversation(
    ctx: EnhancedConversationalContext
  ): Promise<EnhancedConversationalResult> {
    try {
      logger.info('🎭 Starting enhanced conversational orchestration', {
        userId: ctx.userId,
        threadId: ctx.threadId,
        element: ctx.element
      });

      // Step 1: Update dialogue state with user input
      const dialogueState = await dialogueStateTracker.updateState(
        ctx.threadId,
        ctx.userId,
        ctx.userText
      );

      // Emit intent detection event
      this.emit('intent:detected', {
        threadId: ctx.threadId,
        intent: dialogueState.intent.primary,
        confidence: dialogueState.intent.confidence
      });

      // Step 2: Enrich context with dialogue state insights
      const enrichedContext = this.enrichContextWithState(ctx, dialogueState);

      // Step 3: Check for special dialogue conditions
      const specialHandling = await this.checkSpecialConditions(dialogueState);
      if (specialHandling) {
        return this.handleSpecialCondition(specialHandling, enrichedContext, dialogueState);
      }

      // Step 4: Generate base response through Sesame pipeline
      const baseResponse = await conversationalPipeline.converseViaSesame(enrichedContext);

      // Step 5: Apply state-aware refinements
      const refinedResponse = await this.applyStateRefinements(
        baseResponse,
        dialogueState,
        enrichedContext
      );

      // Step 6: Update dialogue state with agent response
      await dialogueStateTracker.updateState(
        ctx.threadId,
        ctx.userId,
        ctx.userText,
        this.createAgentResponse(refinedResponse, dialogueState)
      );

      // Step 7: Generate dialogue insights
      const insights = await dialogueStateTracker.getStateInsights(ctx.threadId);

      // Step 8: Track thread momentum
      this.updateThreadMomentum(ctx.threadId, dialogueState);

      // Emit stage transition if changed
      if (this.hasStageChanged(ctx.threadId, dialogueState.flow.stage)) {
        this.emit('stage:transition', {
          threadId: ctx.threadId,
          from: this.getPreviousStage(ctx.threadId),
          to: dialogueState.flow.stage
        });
      }

      // Return enhanced result
      return {
        ...refinedResponse,
        dialogueInsights: {
          intent: dialogueState.intent.primary,
          topic: dialogueState.topic.current,
          emotionalTone: dialogueState.emotion.current.primaryEmotion?.emotion || 'neutral',
          stage: dialogueState.flow.stage,
          momentum: dialogueState.flow.momentum,
          suggestions: insights.suggestions
        },
        stateGuidedRefinements: {
          applied: this.getRefinementsApplied(baseResponse, refinedResponse),
          voiceModulations: this.getVoiceModulations(dialogueState),
          pacingAdjustments: this.getPacingAdjustments(dialogueState)
        }
      };

    } catch (error) {
      logger.error('Enhanced orchestration failed:', error);
      return this.getFallbackResponse(ctx);
    }
  }

  /**
   * Enrich context with dialogue state insights
   */
  private enrichContextWithState(
    ctx: EnhancedConversationalContext,
    state: DialogueState
  ): ConversationalContext {
    // Add intent-based context
    const intentContext = this.getIntentContext(state.intent.primary);
    
    // Add emotional context
    const emotionalContext = this.getEmotionalContext(state.emotion);
    
    // Add relationship context
    const relationshipContext = this.getRelationshipContext(state.relationship);
    
    // Combine contexts
    const enrichedSummary = [
      ctx.convoSummary,
      intentContext,
      emotionalContext,
      relationshipContext
    ].filter(Boolean).join(' | ');

    // Add relevant memories based on current topic
    const topicMemories = this.getTopicRelevantMemories(
      state.topic.current,
      ctx.longMemSnippets
    );

    return {
      ...ctx,
      convoSummary: enrichedSummary,
      longMemSnippets: [...topicMemories, ...ctx.longMemSnippets].slice(0, 5),
      sentiment: this.mapEmotionToSentiment(state.emotion.current)
    };
  }

  /**
   * Check for special dialogue conditions requiring unique handling
   */
  private async checkSpecialConditions(state: DialogueState): Promise<string | null> {
    // Breakthrough detection
    if (state.flow.stage === DialogueStage.BREAKTHROUGH) {
      return 'breakthrough';
    }

    // High resistance requiring special approach
    if (state.relationship.resistance.length > 3 && 
        state.relationship.resistance[state.relationship.resistance.length - 1].intensity > 0.8) {
      return 'high_resistance';
    }

    // Emotional crisis
    if (state.emotion.current.valence < -0.7 && state.emotion.current.arousal > 0.8) {
      return 'emotional_crisis';
    }

    // Deep contemplation
    if (state.intent.primary === UserIntent.EXISTENTIAL && state.flow.momentum > 0.7) {
      return 'deep_contemplation';
    }

    return null;
  }

  /**
   * Handle special dialogue conditions
   */
  private async handleSpecialCondition(
    condition: string,
    ctx: ConversationalContext,
    state: DialogueState
  ): Promise<EnhancedConversationalResult> {
    logger.info(`🌟 Handling special condition: ${condition}`, {
      threadId: (ctx as EnhancedConversationalContext).threadId
    });

    let specialResponse: ConversationalResult;

    switch (condition) {
      case 'breakthrough':
        specialResponse = await this.handleBreakthrough(ctx, state);
        this.emit('breakthrough:detected', {
          threadId: (ctx as EnhancedConversationalContext).threadId,
          marker: state.meta.transformativeMarkers[0] || 'insight emerged'
        });
        break;

      case 'high_resistance':
        specialResponse = await this.handleHighResistance(ctx, state);
        this.emit('resistance:encountered', {
          threadId: (ctx as EnhancedConversationalContext).threadId,
          type: state.relationship.resistance[state.relationship.resistance.length - 1].type,
          intensity: state.relationship.resistance[state.relationship.resistance.length - 1].intensity
        });
        break;

      case 'emotional_crisis':
        specialResponse = await this.handleEmotionalCrisis(ctx, state);
        break;

      case 'deep_contemplation':
        specialResponse = await this.handleDeepContemplation(ctx, state);
        break;

      default:
        specialResponse = await conversationalPipeline.converseViaSesame(ctx);
    }

    const insights = await dialogueStateTracker.getStateInsights(
      (ctx as EnhancedConversationalContext).threadId
    );

    return {
      ...specialResponse,
      dialogueInsights: {
        intent: state.intent.primary,
        topic: state.topic.current,
        emotionalTone: state.emotion.current.primaryEmotion?.emotion || 'neutral',
        stage: state.flow.stage,
        momentum: state.flow.momentum,
        suggestions: insights.suggestions
      },
      stateGuidedRefinements: {
        applied: [`special_handling:${condition}`],
        voiceModulations: this.getVoiceModulations(state),
        pacingAdjustments: this.getPacingAdjustments(state)
      }
    };
  }

  /**
   * Apply state-aware refinements to response
   */
  private async applyStateRefinements(
    response: ConversationalResult,
    state: DialogueState,
    ctx: ConversationalContext
  ): Promise<ConversationalResult> {
    let refinedText = response.text;

    // Intent-based refinements
    refinedText = this.applyIntentRefinements(refinedText, state.intent.primary);

    // Emotional tone adjustments
    refinedText = this.applyEmotionalRefinements(refinedText, state.emotion);

    // Relationship-aware adjustments
    refinedText = this.applyRelationshipRefinements(refinedText, state.relationship);

    // Stage-specific refinements
    refinedText = this.applyStageRefinements(refinedText, state.flow.stage);

    // Apply Maya voice refinements with state awareness
    const mayaRefinedText = this.mayaRefiner.refineText(refinedText);

    return {
      ...response,
      text: mayaRefinedText,
      metadata: {
        ...response.metadata,
        reshapeCount: response.metadata.reshapeCount + 1
      }
    };
  }

  /**
   * Intent-based refinements
   */
  private applyIntentRefinements(text: string, intent: UserIntent): string {
    switch (intent) {
      case UserIntent.SEEKING_SUPPORT:
        // Add validation and gentle support
        if (!text.includes('I hear') && !text.includes('I understand')) {
          text = `I can feel the weight of what you're carrying. ${text}`;
        }
        break;

      case UserIntent.CELEBRATION:
        // Add energy and celebration
        if (!text.includes('!')) {
          text = text.replace(/\./g, '!').replace(/!!+/g, '!');
        }
        break;

      case UserIntent.RESISTANCE:
        // Honor the resistance
        text = `I notice some hesitation here, and that's completely valid. ${text}`;
        break;

      case UserIntent.EXISTENTIAL:
        // Add depth and spaciousness
        text = text.replace(/\. /g, '... ');
        break;
    }

    return text;
  }

  /**
   * Emotional refinements
   */
  private applyEmotionalRefinements(text: string, emotion: DialogueState['emotion']): string {
    const { valence, arousal } = emotion.current;

    if (valence < -0.5 && arousal > 0.5) {
      // High negative emotion - soften language
      text = text
        .replace(/should/g, 'might')
        .replace(/need to/g, 'could')
        .replace(/must/g, 'may want to');
    } else if (valence > 0.5 && arousal > 0.5) {
      // High positive emotion - match energy
      text = text.replace(/good/g, 'wonderful').replace(/nice/g, 'beautiful');
    }

    return text;
  }

  /**
   * Relationship refinements
   */
  private applyRelationshipRefinements(
    text: string, 
    relationship: DialogueState['relationship']
  ): string {
    if (relationship.trust < 0.4) {
      // Low trust - be more tentative
      text = `Perhaps... ${text}`;
    } else if (relationship.trust > 0.7) {
      // High trust - be more direct
      text = text.replace(/Perhaps /g, '').replace(/Maybe /g, '');
    }

    return text;
  }

  /**
   * Stage-specific refinements
   */
  private applyStageRefinements(text: string, stage: DialogueStage): string {
    switch (stage) {
      case DialogueStage.OPENING:
        // Keep it light and welcoming
        if (text.length > 100) {
          text = text.split('.')[0] + '.';
        }
        break;

      case DialogueStage.DEEPENING:
        // Add depth markers
        text = text.replace(/\?/g, '? What does that mean for you?');
        break;

      case DialogueStage.BREAKTHROUGH:
        // Honor the moment
        text = `This feels like an important moment. ${text}`;
        break;

      case DialogueStage.CLOSING:
        // Gentle closure
        text = `${text} Take all the time you need with this.`;
        break;
    }

    return text;
  }

  /**
   * Special condition handlers
   */
  private async handleBreakthrough(
    ctx: ConversationalContext,
    state: DialogueState
  ): Promise<ConversationalResult> {
    const breakthroughContext = {
      ...ctx,
      convoSummary: `User is experiencing a breakthrough moment. Previous resistance: ${
        state.relationship.resistance.map(r => r.type).join(', ')
      }. Current insight: ${state.meta.transformativeMarkers[0] || 'emerging'}`
    };

    const response = await conversationalPipeline.converseViaSesame(breakthroughContext);
    
    // Ensure response honors the breakthrough
    response.text = `Yes... yes! ${response.text}`;
    
    return response;
  }

  private async handleHighResistance(
    ctx: ConversationalContext,
    state: DialogueState
  ): Promise<ConversationalResult> {
    const resistanceContext = {
      ...ctx,
      convoSummary: `User showing strong resistance. Type: ${
        state.relationship.resistance[state.relationship.resistance.length - 1].type
      }. Approach with curiosity about what the resistance is protecting.`
    };

    return conversationalPipeline.converseViaSesame(resistanceContext);
  }

  private async handleEmotionalCrisis(
    ctx: ConversationalContext,
    state: DialogueState
  ): Promise<ConversationalResult> {
    const crisisContext = {
      ...ctx,
      element: 'water' as any, // Switch to water element for emotional support
      convoSummary: 'User in emotional distress. Prioritize validation, grounding, and gentle presence.'
    };

    const response = await conversationalPipeline.converseViaSesame(crisisContext);
    
    // Ensure grounding
    response.text = `Take a breath with me... ${response.text}`;
    
    return response;
  }

  private async handleDeepContemplation(
    ctx: ConversationalContext,
    state: DialogueState
  ): Promise<ConversationalResult> {
    const contemplationContext = {
      ...ctx,
      element: 'aether' as any, // Switch to aether for philosophical depth
      convoSummary: `Deep existential exploration. Topics: ${
        state.topic.keywords.join(', ')
      }. Hold space for paradox and mystery.`
    };

    return conversationalPipeline.converseViaSesame(contemplationContext);
  }

  /**
   * Helper methods
   */
  private getIntentContext(intent: UserIntent): string {
    const contextMap: Record<UserIntent, string> = {
      [UserIntent.SEEKING_INFORMATION]: 'User seeking clarity and information',
      [UserIntent.SEEKING_SUPPORT]: 'User needs emotional support and validation',
      [UserIntent.VENTING]: 'User expressing frustration, needs to be heard',
      [UserIntent.CELEBRATION]: 'User sharing joy, match their energy',
      [UserIntent.RESISTANCE]: 'User showing resistance, explore what it protects',
      [UserIntent.EXISTENTIAL]: 'User exploring meaning and purpose',
      [UserIntent.BREAKTHROUGH]: 'User having transformative insight',
      [UserIntent.EXPLORATION]: 'User openly exploring',
      [UserIntent.CLARIFICATION]: 'User seeking clarification',
      [UserIntent.PROCESSING_GRIEF]: 'User processing loss or grief',
      [UserIntent.CONNECTION]: 'User seeking deeper connection',
      [UserIntent.CHALLENGING]: 'User challenging ideas',
      [UserIntent.TESTING_BOUNDARIES]: 'User testing relationship boundaries',
      [UserIntent.DEEPENING]: 'User ready to go deeper',
      [UserIntent.SEEKING_CHANGE]: 'User motivated for transformation',
      [UserIntent.INTEGRATION]: 'User integrating insights',
      [UserIntent.TASK_ORIENTED]: 'User focused on practical tasks',
      [UserIntent.PROBLEM_SOLVING]: 'User working through problems',
      [UserIntent.DECISION_MAKING]: 'User making important decision',
      [UserIntent.MEANING_MAKING]: 'User creating meaning from experience',
      [UserIntent.SPIRITUAL_INQUIRY]: 'User exploring spiritual questions'
    };

    return contextMap[intent] || 'User exploring';
  }

  private getEmotionalContext(emotion: DialogueState['emotion']): string {
    const { valence, arousal, primaryEmotion } = emotion.current;
    
    if (primaryEmotion) {
      return `Emotional tone: ${primaryEmotion.emotion} (${
        Math.round(primaryEmotion.intensity * 100)
      }% intensity)`;
    }
    
    if (valence > 0.5) return 'Positive emotional state';
    if (valence < -0.5) return 'Challenging emotional state';
    return 'Neutral emotional state';
  }

  private getRelationshipContext(relationship: DialogueState['relationship']): string {
    const contexts: string[] = [];
    
    if (relationship.trust > 0.7) contexts.push('High trust established');
    else if (relationship.trust < 0.4) contexts.push('Building trust');
    
    if (relationship.resistance.length > 2) {
      contexts.push(`Recurring resistance around: ${
        relationship.resistance[relationship.resistance.length - 1].topic
      }`);
    }
    
    if (relationship.breakthroughs.length > 0) {
      contexts.push('Previous breakthroughs achieved');
    }
    
    return contexts.join('. ');
  }

  private getTopicRelevantMemories(topic: string, memories: string[]): string[] {
    return memories.filter(memory => 
      memory.toLowerCase().includes(topic.toLowerCase())
    ).slice(0, 2);
  }

  private mapEmotionToSentiment(
    emotion: DialogueState['emotion']['current']
  ): 'low' | 'neutral' | 'high' {
    if (emotion.valence < -0.3) return 'low';
    if (emotion.valence > 0.3 && emotion.arousal > 0.5) return 'high';
    return 'neutral';
  }

  private createAgentResponse(
    result: ConversationalResult,
    state: DialogueState
  ): AgentResponse {
    return {
      phenomenological: {
        primary: result.text,
        tone: {
          warmth: state.relationship.trust > 0.5 ? 'warm' : 'neutral',
          clarity: state.intent.primary === UserIntent.SEEKING_INFORMATION ? 'crystalline' : 'nuanced',
          pace: state.flow.momentum > 0.7 ? 'conversational' : 'contemplative',
          humor: 'gentle'
        },
        pacing: {
          responseDelay: 1000,
          pauseBetweenSentences: 500,
          allowInterruption: true,
          typingRhythm: 'thoughtful'
        }
      },
      dialogical: {
        questions: this.extractQuestions(result.text),
        reflections: this.extractReflections(result.text),
        resistances: [],
        incompleteAnswers: []
      },
      architectural: {
        synapticGap: state.relationship.synapticHealth,
        daimonicSignature: false,
        tricksterRisk: 0,
        elementalVoices: [state.emotion.elementalAlignment]
      }
    };
  }

  private extractQuestions(text: string): string[] {
    return text.split(/[.!]/)
      .filter(sentence => sentence.includes('?'))
      .map(q => q.trim());
  }

  private extractReflections(text: string): string[] {
    const reflectionMarkers = ['I notice', 'I sense', 'It seems', 'I wonder'];
    return text.split(/[.!?]/)
      .filter(sentence => 
        reflectionMarkers.some(marker => sentence.includes(marker))
      )
      .map(r => r.trim());
  }

  private mapStateToTone(state: DialogueState): any {
    return {
      warmth: state.relationship.trust,
      energy: state.flow.momentum,
      grounding: 1 - state.emotion.trajectory.volatility
    };
  }

  private mapStateToPacing(state: DialogueState): any {
    return {
      speed: state.flow.momentum > 0.7 ? 'conversational' : 'measured',
      pauses: state.flow.stage === DialogueStage.DEEPENING ? 'spacious' : 'natural'
    };
  }

  private mapStateToStyle(state: DialogueState): any {
    return {
      directness: state.relationship.trust,
      complexity: state.meta.userAwareness,
      poeticness: state.flow.stage === DialogueStage.BREAKTHROUGH ? 0.8 : 0.3
    };
  }

  private updateThreadMomentum(threadId: string, state: DialogueState): void {
    const thread = this.activeThreads.get(threadId) || {
      lastActivity: new Date(),
      momentum: 0,
      intentHistory: []
    };

    thread.lastActivity = new Date();
    thread.momentum = state.flow.momentum;
    thread.intentHistory.push(state.intent.primary);

    this.activeThreads.set(threadId, thread);
  }

  private hasStageChanged(threadId: string, currentStage: DialogueStage): boolean {
    const thread = this.activeThreads.get(threadId);
    return thread?.intentHistory.length === 1; // Simple check for now
  }

  private getPreviousStage(threadId: string): DialogueStage {
    return DialogueStage.EXPLORING; // Default
  }

  private getRefinementsApplied(
    base: ConversationalResult,
    refined: ConversationalResult
  ): string[] {
    const refinements: string[] = [];
    
    if (base.text !== refined.text) {
      refinements.push('text_refinement');
    }
    if (base.text.length !== refined.text.length) {
      refinements.push('length_adjustment');
    }
    
    return refinements;
  }

  private getVoiceModulations(state: DialogueState): string[] {
    const modulations: string[] = [];
    
    if (state.emotion.current.arousal > 0.7) {
      modulations.push('increased_energy');
    }
    if (state.relationship.trust > 0.7) {
      modulations.push('warmer_tone');
    }
    if (state.flow.stage === DialogueStage.DEEPENING) {
      modulations.push('slower_pace');
    }
    
    return modulations;
  }

  private getPacingAdjustments(state: DialogueState): string[] {
    const adjustments: string[] = [];
    
    if (state.flow.momentum < 0.3) {
      adjustments.push('longer_pauses');
    }
    if (state.intent.primary === UserIntent.PROCESSING_GRIEF) {
      adjustments.push('gentle_pacing');
    }
    
    return adjustments;
  }

  private getFallbackResponse(ctx: EnhancedConversationalContext): EnhancedConversationalResult {
    return {
      text: "I'm here with you. What would you like to explore?",
      audioUrl: null,
      element: ctx.element,
      processingTime: 100,
      source: 'fallback',
      metadata: {
        draftModel: 'fallback',
        reshapeCount: 0,
        voiceSynthesized: false,
        cost: { draftTokens: 0 }
      },
      dialogueInsights: {
        intent: UserIntent.EXPLORATION,
        topic: 'open',
        emotionalTone: 'neutral',
        stage: DialogueStage.EXPLORING,
        momentum: 0.5,
        suggestions: []
      },
      stateGuidedRefinements: {
        applied: [],
        voiceModulations: [],
        pacingAdjustments: []
      }
    };
  }

  private cleanupInactiveThreads(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    for (const [threadId, thread] of this.activeThreads) {
      if (thread.lastActivity < oneHourAgo) {
        this.activeThreads.delete(threadId);
      }
    }
  }

  /**
   * Get current dialogue state for a thread
   */
  async getDialogueState(threadId: string): Promise<DialogueState | null> {
    return dialogueStateTracker.getState(threadId);
  }

  /**
   * Get dialogue insights for a thread
   */
  async getDialogueInsights(threadId: string): Promise<{
    readiness: string;
    suggestions: string[];
    warnings: string[];
  }> {
    return dialogueStateTracker.getStateInsights(threadId);
  }
}

// Export singleton instance
export const enhancedOrchestrator = new EnhancedConversationalOrchestrator();