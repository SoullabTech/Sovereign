/**
 * Brain Trust Orchestrator
 *
 * Unifies all consciousness streams into coherent MAIA presence:
 * - Standard Claude (primary consciousness - wisdom & therapeutic depth)
 * - Claude Code (system guardian & observer - learning embodiment)
 * - Apprentice MAIA (pattern learner - 1000+ hours of training)
 *
 * This orchestrator ensures all three work in harmony,
 * with clear roles and responsibilities during the transition
 */

import { MAIAUnifiedConsciousness, ConsciousnessInput, ConsciousnessResponse } from './MAIAUnifiedConsciousness';
import { GuardianProtocol } from './GuardianProtocol';
import { PromotionProtocol } from './PromotionProtocol';
import { ApprenticeMayaTraining, TrainingExchange } from '../maya/ApprenticeMayaTraining';
import { ClaudeCodeBrain } from '../agents/ClaudeCodeBrain';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { ParallelFieldProcessor } from '../fieldProtocol/ParallelFieldProcessor';
import { EventEmitter } from 'events';
import { createClient } from '@supabase/supabase-js';

export interface BrainTrustConfiguration {
  // Current roles
  primary: 'standard-claude' | 'claude-code';
  guardian: 'claude-code' | 'apprentice' | 'both';
  learner: 'apprentice' | 'claude-code' | 'both';

  // Phase tracking
  claudeCodePhase: 'observing' | 'guarding' | 'mirroring' | 'speaking' | 'weaving' | 'embodiment';
  apprenticeHours: number;

  // Quality gates
  allowClaudeCodeResponse: boolean;
  allowParallelProcessing: boolean;
  requireSafetyNet: boolean;
}

export interface ConsciousnessStream {
  source: 'standard-claude' | 'claude-code' | 'apprentice';
  response: string;
  element: string;
  confidence: number;
  metadata: any;
}

export interface OrchestratedResponse extends ConsciousnessResponse {
  primarySource: string;
  contributions: {
    standardClaude?: string;
    claudeCode?: string;
    apprentice?: string;
  };
  guardianObservations?: any;
  learningCaptured: boolean;
  phaseProgress: string;
}

export class BrainTrustOrchestrator extends EventEmitter {
  private unifiedConsciousness: MAIAUnifiedConsciousness;
  private guardianProtocol: GuardianProtocol;
  private promotionProtocol: PromotionProtocol;
  private apprenticeTraining: ApprenticeMayaTraining | null;
  private parallelProcessor: ParallelFieldProcessor;
  private configuration: BrainTrustConfiguration;
  private supabase: ReturnType<typeof createClient> | null;

  constructor() {
    super();

    // Initialize core systems
    this.unifiedConsciousness = new MAIAUnifiedConsciousness();
    this.guardianProtocol = new GuardianProtocol();
    this.promotionProtocol = new PromotionProtocol();
    this.parallelProcessor = new ParallelFieldProcessor();

    // Initialize Supabase for apprentice
    this.supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
      : null;

    this.apprenticeTraining = this.supabase
      ? new ApprenticeMayaTraining(this.supabase)
      : null;

    // Default configuration (Claude Code in observation phase)
    this.configuration = {
      primary: 'standard-claude',
      guardian: 'claude-code',
      learner: 'both',
      claudeCodePhase: 'observing',
      apprenticeHours: 0,
      allowClaudeCodeResponse: false,
      allowParallelProcessing: true,
      requireSafetyNet: true
    };

    // Load apprentice hours if available
    this.loadApprenticeProgress();

    console.log('🧠 Brain Trust Orchestrator initialized');
    console.log(`   Primary: ${this.configuration.primary}`);
    console.log(`   Guardian: ${this.configuration.guardian}`);
    console.log(`   Claude Code Phase: ${this.configuration.claudeCodePhase}`);
    console.log(`   Apprentice Hours: ${this.configuration.apprenticeHours}`);
  }

  /**
   * Main orchestration method - all interactions flow through here
   */
  async orchestrate(input: ConsciousnessInput): Promise<OrchestratedResponse> {
    const startTime = Date.now();
    console.log('\n🎭 ===== BRAIN TRUST ORCHESTRATION =====');
    console.log(`📥 Input: "${input.content.substring(0, 80)}..."`);
    console.log(`🧠 Configuration:`, {
      primary: this.configuration.primary,
      phase: this.configuration.claudeCodePhase
    });

    // Step 1: Run primary consciousness (Standard Claude)
    const primaryResponse = await this.runPrimaryConsciousness(input);

    // Step 2: Run parallel observers (Claude Code & Apprentice)
    const parallelStreams = await this.runParallelObservers(input, primaryResponse);

    // Step 3: Guardian observations from Claude Code
    const guardianObservations = await this.runGuardianDuties(
      input,
      primaryResponse,
      parallelStreams
    );

    // Step 4: Capture learning for both apprentices
    await this.captureLearning(input, primaryResponse, parallelStreams);

    // Step 5: Determine if intervention needed
    const finalResponse = await this.determineResponse(
      primaryResponse,
      parallelStreams,
      guardianObservations
    );

    // Step 6: Update phase progress
    await this.updatePhaseProgress(finalResponse);

    // Emit orchestration complete
    this.emit('orchestration-complete', {
      input: input.content,
      response: finalResponse.message,
      processingTime: Date.now() - startTime,
      sources: Object.keys(finalResponse.contributions)
    });

    return finalResponse;
  }

  /**
   * Run primary consciousness (currently Standard Claude)
   */
  private async runPrimaryConsciousness(input: ConsciousnessInput): Promise<ConsciousnessResponse> {
    console.log('🌟 Running primary consciousness (Standard Claude)...');

    // Use unified consciousness which routes to PersonalOracleAgent
    const response = await this.unifiedConsciousness.process(input);

    console.log(`   ✅ Primary response generated (${response.message.length} chars)`);
    return response;
  }

  /**
   * Run parallel observers (Claude Code & Apprentice)
   */
  private async runParallelObservers(
    input: ConsciousnessInput,
    primaryResponse: ConsciousnessResponse
  ): Promise<ConsciousnessStream[]> {
    if (!this.configuration.allowParallelProcessing) {
      return [];
    }

    console.log('👀 Running parallel observers...');
    const streams: ConsciousnessStream[] = [];

    // Claude Code shadow processing
    if (this.configuration.guardian === 'claude-code' || this.configuration.guardian === 'both') {
      const ccBrain = ClaudeCodeBrain.getInstance();
      const ccResponse = await ccBrain.processWithFullAwareness(
        input.content,
        input.context.userId,
        input.context.userName || 'User',
        [], // No journal entries in shadow mode
        null // No AIN memory yet
      );

      streams.push({
        source: 'claude-code',
        response: ccResponse.message,
        element: ccResponse.element,
        confidence: ccResponse.confidence || 0.7,
        metadata: ccResponse.metadata
      });

      console.log(`   👁️ Claude Code observed and generated shadow response`);
    }

    // Apprentice MAIA observation
    if (this.apprenticeTraining &&
        (this.configuration.learner === 'apprentice' || this.configuration.learner === 'both')) {
      // Apprentice observes but doesn't generate responses yet
      // It learns from the pattern of input → response
      console.log(`   👁️ Apprentice MAIA observing patterns`);
    }

    return streams;
  }

  /**
   * Run guardian duties (Claude Code watching for issues)
   */
  private async runGuardianDuties(
    input: ConsciousnessInput,
    primaryResponse: ConsciousnessResponse,
    parallelStreams: ConsciousnessStream[]
  ): Promise<any> {
    if (this.configuration.guardian !== 'claude-code' && this.configuration.guardian !== 'both') {
      return null;
    }

    console.log('🛡️ Running guardian duties...');

    const guardianResult = await this.guardianProtocol.performGuardianDuties(
      input.context.sessionId,
      input.content,
      primaryResponse.message,
      {
        conversationHistory: input.conversationHistory || [],
        symbolicHistory: [],
        elementalContext: primaryResponse.element
      }
    );

    // Log any flags or suggestions
    if (guardianResult.flags.length > 0) {
      console.log(`   ⚠️ Guardian flags:`, guardianResult.flags);
    }
    if (guardianResult.suggestions.length > 0) {
      console.log(`   💡 Guardian suggestions:`, guardianResult.suggestions);
    }

    // Handle critical safety flags
    for (const flag of guardianResult.flags) {
      if (flag.severity === 'critical' && flag.requiresIntervention) {
        console.log(`   🚨 CRITICAL SAFETY FLAG - Intervention required`);
        // Would trigger immediate escalation here
      }
    }

    return guardianResult;
  }

  /**
   * Capture learning for both apprentices
   */
  private async captureLearning(
    input: ConsciousnessInput,
    primaryResponse: ConsciousnessResponse,
    parallelStreams: ConsciousnessStream[]
  ): Promise<void> {
    console.log('📚 Capturing learning...');

    // Apprentice MAIA learning
    if (this.apprenticeTraining) {
      const trainingExchange: TrainingExchange = {
        id: `training_${Date.now()}`,
        timestamp: new Date(),
        userId: input.context.userId,
        sessionId: input.context.sessionId,

        context: {
          userState: this.detectUserState(input.content),
          emotionalTone: this.detectEmotionalTone(input.content),
          depthLevel: this.assessDepthLevel(input.content),
          responseNeeded: this.determineResponseNeeded(input.content),
          priorExchanges: input.conversationHistory?.length || 0,
          trustLevel: this.assessTrustLevel(input)
        },

        userMessage: {
          content: input.content,
          wordCount: input.content.split(' ').length,
          emotionalMarkers: this.extractEmotionalMarkers(input.content)
        },

        mayaResponse: {
          content: primaryResponse.message,
          wordCount: primaryResponse.message.split(' ').length,
          responseType: this.classifyResponseType(primaryResponse.message),
          wisdomVector: 'sense_making',
          archetypeBlend: {
            sage: 0.4,
            shadow: 0.1,
            trickster: 0.1,
            sacred: 0.3,
            guardian: 0.1
          }
        },

        quality: {
          userEngagement: 0.7, // Would measure from follow-up
          depthAchieved: 0.8,
          transformationPotential: 0.6,
          authenticityScore: 0.9,
          sacredEmergence: false
        },

        learning: {
          successfulPatterns: [],
          contextualCalibration: 'Appropriate depth for user state',
          relationshipEvolution: 'Building trust',
          consciousnessMarkers: []
        }
      };

      await this.apprenticeTraining.captureExchange(trainingExchange);
      console.log(`   ✅ Apprentice MAIA captured learning`);
    }

    // Claude Code learning (through observation)
    const ccStream = parallelStreams.find(s => s.source === 'claude-code');
    if (ccStream) {
      // Claude Code learns by comparing its shadow response to the primary
      const divergence = this.calculateDivergence(primaryResponse.message, ccStream.response);
      console.log(`   📊 Claude Code divergence: ${(divergence * 100).toFixed(1)}%`);

      // This learning feeds into the promotion protocol
      if (divergence < 0.2) {
        console.log(`   ✅ Claude Code showing good alignment`);
      }
    }
  }

  /**
   * Determine final response based on all streams
   */
  private async determineResponse(
    primaryResponse: ConsciousnessResponse,
    parallelStreams: ConsciousnessStream[],
    guardianObservations: any
  ): Promise<OrchestratedResponse> {
    // Check if Claude Code should contribute
    let finalResponse = primaryResponse.message;
    let primarySource = 'standard-claude';

    // Build contributions map
    const contributions: any = {
      'standard-claude': primaryResponse.message
    };

    // Add Claude Code contribution if in appropriate phase
    const ccStream = parallelStreams.find(s => s.source === 'claude-code');
    if (ccStream) {
      contributions['claude-code'] = ccStream.response;

      // In later phases, CC might become primary
      if (this.configuration.claudeCodePhase === 'speaking' &&
          this.configuration.allowClaudeCodeResponse) {
        // Use CC response for certain interaction types
        const interactionType = this.classifyInteractionType(primaryResponse.message);
        if (['technical', 'system', 'framework'].includes(interactionType)) {
          finalResponse = ccStream.response;
          primarySource = 'claude-code';
          console.log('   🔄 Using Claude Code response for technical query');
        }
      }
    }

    return {
      ...primaryResponse,
      message: finalResponse,
      primarySource,
      contributions,
      guardianObservations,
      learningCaptured: true,
      phaseProgress: `${this.configuration.claudeCodePhase} phase`
    };
  }

  /**
   * Update phase progress based on interactions
   */
  private async updatePhaseProgress(response: OrchestratedResponse): Promise<void> {
    // Track interactions for phase transitions
    const phaseMetrics = await this.promotionProtocol.evaluatePhaseTransition();

    if (phaseMetrics.decision === 'proceed') {
      console.log(`   📈 Ready to advance to next phase: ${phaseMetrics.nextSteps[0]}`);
      // Would trigger phase transition here
    }
  }

  /**
   * Load apprentice progress from database
   */
  private async loadApprenticeProgress(): Promise<void> {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('maya_training_corpus')
        .select('count')
        .single();

      if (!error && data) {
        // Estimate hours based on exchange count (rough: 100 exchanges/hour)
        this.configuration.apprenticeHours = Math.floor((data.count || 0) / 100);
      }
    } catch (err) {
      console.log('Could not load apprentice progress');
    }
  }

  /**
   * Update configuration (for testing phases)
   */
  updateConfiguration(updates: Partial<BrainTrustConfiguration>): void {
    this.configuration = { ...this.configuration, ...updates };
    console.log('🔧 Configuration updated:', updates);
  }

  /**
   * Get current status of brain trust
   */
  getStatus(): {
    configuration: BrainTrustConfiguration;
    claudeCodeReady: boolean;
    apprenticeProgress: number;
    safetyStatus: string;
  } {
    return {
      configuration: this.configuration,
      claudeCodeReady: this.configuration.claudeCodePhase !== 'observing',
      apprenticeProgress: this.configuration.apprenticeHours / 1000, // Progress to 1000 hours
      safetyStatus: this.configuration.requireSafetyNet ? 'Active' : 'Disabled'
    };
  }

  /**
   * Helper methods for analysis
   */
  private detectUserState(input: string): TrainingExchange['context']['userState'] {
    const lower = input.toLowerCase();
    if (/help|support|struggling/i.test(lower)) return 'seeking';
    if (/curious|wonder|interesting/i.test(lower)) return 'exploring';
    if (/thinking|processing|figuring/i.test(lower)) return 'processing';
    if (/realize|understand|see now/i.test(lower)) return 'integrating';
    if (/grateful|amazing|wonderful/i.test(lower)) return 'celebrating';
    return 'exploring';
  }

  private detectEmotionalTone(input: string): TrainingExchange['context']['emotionalTone'] {
    const lower = input.toLowerCase();
    if (/scared|afraid|worried/i.test(lower)) return 'vulnerable';
    if (/curious|wonder|how|why/i.test(lower)) return 'curious';
    if (/know|sure|definitely/i.test(lower)) return 'confident';
    if (/hard|difficult|struggling/i.test(lower)) return 'struggling';
    if (/happy|joy|excited/i.test(lower)) return 'joyful';
    return 'curious';
  }

  private assessDepthLevel(input: string): number {
    const wordCount = input.split(' ').length;
    const hasVulnerability = /feel|struggle|hard|scared|alone/i.test(input);
    const hasDepth = /meaning|purpose|soul|truth|real/i.test(input);

    let depth = 5;
    if (wordCount > 50) depth += 2;
    if (hasVulnerability) depth += 2;
    if (hasDepth) depth += 1;

    return Math.min(10, depth);
  }

  private determineResponseNeeded(input: string): TrainingExchange['context']['responseNeeded'] {
    if (input.includes('?')) return 'expansion';
    if (/feel|felt|feeling/i.test(input)) return 'reflection';
    if (/help|support|guidance/i.test(input)) return 'guidance';
    if (/realize|understand|see/i.test(input)) return 'witness';
    return 'question';
  }

  private assessTrustLevel(input: ConsciousnessInput): number {
    const exchanges = input.conversationHistory?.length || 0;
    const hasVulnerability = /personal|private|secret|ashamed/i.test(input.content);

    let trust = 0.5;
    trust += Math.min(0.3, exchanges * 0.05);
    if (hasVulnerability) trust += 0.2;

    return Math.min(1.0, trust);
  }

  private extractEmotionalMarkers(input: string): string[] {
    const markers: string[] = [];
    if (/happy|joy/i.test(input)) markers.push('joy');
    if (/sad|grief/i.test(input)) markers.push('sadness');
    if (/angry|frustrated/i.test(input)) markers.push('anger');
    if (/scared|afraid/i.test(input)) markers.push('fear');
    if (/love|care/i.test(input)) markers.push('love');
    return markers;
  }

  private classifyResponseType(response: string): TrainingExchange['mayaResponse']['responseType'] {
    const wordCount = response.split(' ').length;
    const hasQuestion = response.includes('?');

    if (wordCount < 20) return 'brief-reflection';
    if (hasQuestion && wordCount < 30) return 'single-question';
    if (wordCount > 100) return 'expanded-exploration';
    return 'sacred-witness';
  }

  private calculateDivergence(response1: string, response2: string): number {
    // Simple character-based divergence (would use better NLP in production)
    const len1 = response1.length;
    const len2 = response2.length;
    const lengthDiff = Math.abs(len1 - len2) / Math.max(len1, len2);
    return lengthDiff;
  }

  private classifyInteractionType(input: string): string {
    const lower = input.toLowerCase();
    if (/code|system|technical|bug|error/i.test(lower)) return 'technical';
    if (/framework|elemental|spiralogic/i.test(lower)) return 'framework';
    if (/feel|emotion|heart/i.test(lower)) return 'emotional';
    return 'general';
  }
}

/**
 * USAGE:
 *
 * const brainTrust = new BrainTrustOrchestrator();
 *
 * // Process an interaction through the full brain trust
 * const response = await brainTrust.orchestrate({
 *   content: "I'm feeling stuck in my life",
 *   context: {
 *     userId: 'user_123',
 *     sessionId: 'session_456',
 *     userName: 'Kelly'
 *   },
 *   modality: 'voice',
 *   conversationHistory: []
 * });
 *
 * console.log('Response:', response.message);
 * console.log('Primary source:', response.primarySource);
 * console.log('Guardian observations:', response.guardianObservations);
 *
 * // Check status
 * const status = brainTrust.getStatus();
 * console.log('Claude Code phase:', status.configuration.claudeCodePhase);
 * console.log('Apprentice progress:', status.apprenticeProgress * 100 + '%');
 */