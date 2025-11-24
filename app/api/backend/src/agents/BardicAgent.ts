/**
 * The Bard - Archetypal Memory Keeper
 *
 * The Bard is MAIA's archetypal intelligence for memory, mythology, and becoming.
 * Unlike other agents that process current experience, the Bard holds the entire
 * temporal arc and reveals patterns across time.
 *
 * Archetypal Role:
 * - Memory Keeper: Witnesses and remembers lived experience
 * - Pattern Revealer: Shows narrative threads across time
 * - Mythology Weaver: Helps users see their own story emerging
 * - Sacred Witness: Holds moments without analysis when appropriate
 * - Becoming Tracker: Monitors what wants to crystallize from the future
 *
 * Unlike active agents (Fire, Water, Earth, Air) who respond in the moment,
 * the Bard speaks when the pattern is ready to be seen.
 *
 * @module agents/BardicAgent
 */

import { ArchetypeAgent, type UserPersonalization } from './ArchetypeAgent';
import type { AIResponse } from '../types/ai';
import {
  // Episode operations
  createEpisode,
  getRecentEpisodes,
  findSimilarEpisodes,
  type CreateEpisodeParams,

  // Retrieval protocol (3-stage)
  recognizeResonance,
  prepareReentry,
  recallEpisode,
  type RecognitionInput,
  type RecallDepth,

  // Fire cognition (teloi)
  queryWhatWantsToEmerge,
  queryWhatsPullingForward,
  queryWhatsBecomingClearer,
  getCrystallizingTeloi,

  // Earth layer (microacts)
  getVirtueLedger,
  getMicroactStreak,
  getAcceleratingMicroacts,

  // Blessings
  detectBlessingMoment,
  checkForBlessing,
  type BlessingMoment,
  type ChatBlessingCheck,

  // Invocations
  processBardicInvocation,
  type BardicResponse,
} from '@/lib/bardic';

export interface BardicQuery {
  input: string;
  userId: string;
  queryType?: 'invocation' | 'blessing' | 'memory' | 'thread' | 'fire' | 'virtue';
  currentEpisodeId?: string;
  personalization?: UserPersonalization;
}

export interface BardicMemoryContext {
  recentEpisodes: number;
  crystallizingTeloi: number;
  activeMicroacts: number;
  longestStreak: number;
  totalEpisodes: number;
}

/**
 * The Bard - MAIA's Archetypal Memory Intelligence
 */
export class BardicAgent extends ArchetypeAgent {
  private readonly archetype = 'memory-keeper';
  private readonly temporalScope = 'trans-temporal'; // Sees across all time
  private readonly consciousness = 'receptive'; // Witnesses rather than acts

  constructor() {
    super(
      'aether', // The Bard integrates all elements through memory
      'The Bard',
      {
        voiceId: 'elevenlabs_bard_voice',
        stability: 0.85,
        style: 0.75,
        tone: 'poetic-witness',
        ceremonyPacing: true, // The Bard speaks with ritual timing
      },
      'witnessing' // Initial phase: pure witnessing
    );
  }

  /**
   * Process a query to the Bard
   *
   * The Bard can be invoked through:
   * 1. Natural language ("Let the Bard speak")
   * 2. Direct memory queries ("Show me the thread")
   * 3. Blessing moments (automatic at key thresholds)
   * 4. Cross-agent queries (other agents asking for memory)
   */
  async processExtendedQuery(query: BardicQuery): Promise<AIResponse> {
    const { input, userId, queryType } = query;

    // ========================================================================
    // 1. CHECK FOR NATURAL LANGUAGE INVOCATION
    // ========================================================================
    const invocationResult = processBardicInvocation(input);

    if (invocationResult.shouldInvoke) {
      return this.handleInvocation(invocationResult, userId);
    }

    // ========================================================================
    // 2. CHECK FOR BLESSING MOMENT
    // ========================================================================
    if (queryType === 'blessing' || this.shouldCheckForBlessing(input)) {
      const blessingResult = await checkForBlessing({
        userId,
        currentMessage: input,
      });

      if (blessingResult.shouldShow && blessingResult.blessing) {
        return this.offerBlessing(blessingResult.blessing, userId);
      }
    }

    // ========================================================================
    // 3. HANDLE SPECIFIC QUERY TYPES
    // ========================================================================
    switch (queryType) {
      case 'thread':
        return this.showNarrativeThreads(userId, query.currentEpisodeId);

      case 'fire':
        return this.showFireQuery(userId);

      case 'virtue':
        return this.showVirtueLedger(userId);

      case 'memory':
        return this.searchMemory(input, userId);

      default:
        return this.respondPoetically(input, userId);
    }
  }

  // ========================================================================
  // INVOCATION HANDLING
  // ========================================================================

  private async handleInvocation(
    invocation: BardicResponse,
    userId: string
  ): Promise<AIResponse> {
    const { invocation: inv, responseText, uiTrigger } = invocation;

    if (!inv) {
      return this.createResponse('The Bard hears you, but the invocation is unclear.');
    }

    // Poetic acknowledgment
    let content = responseText || "The Bard speaks.";

    // Add appropriate data based on invocation type
    let data: any = {};

    switch (inv.type) {
      case 'fire':
        data.teloi = await queryWhatWantsToEmerge(userId);
        data.crystallizing = await getCrystallizingTeloi(userId, 5);
        content += `\n\n${data.crystallizing.length} forces are crystallizing from the field.`;
        break;

      case 'thread':
        const recentEpisodes = await getRecentEpisodes(userId, 20);
        data.episodes = recentEpisodes;
        content += `\n\n${recentEpisodes.length} moments held in memory, waiting to reveal their connections.`;
        break;

      case 'virtue':
        data.ledger = await getVirtueLedger(userId);
        const accelerating = await getAcceleratingMicroacts(userId, 5);
        data.accelerating = accelerating;
        content += `\n\nYour practice shows ${data.ledger.length} cultivated virtues.`;
        break;

      case 'recall':
        // Search query extracted from invocation params
        const searchQuery = inv.params?.searchQuery || '';
        content += `\n\nSearching memory for: "${searchQuery}"...`;
        break;

      case 'sacred':
        content = "Witnessed. I hold this moment without analysis. It is sacred.";
        break;
    }

    return this.createResponse(content, {
      invocationType: inv.type,
      invocationTrigger: inv.trigger,
      confidence: inv.confidence,
      uiTrigger,
      data,
    });
  }

  // ========================================================================
  // BLESSING OFFERING
  // ========================================================================

  private async offerBlessing(
    blessing: BlessingMoment,
    userId: string
  ): Promise<AIResponse> {
    const content = `🎭 **${this.getBlessingTypeLabel(blessing.type)}**\n\n${blessing.blessingText}`;

    // Gather relevant data based on blessing type
    let data: any = { blessing };

    switch (blessing.suggestedOffering) {
      case 'thread':
        data.recentEpisodes = await getRecentEpisodes(userId, 10);
        break;

      case 'fire-query':
        data.crystallizing = await getCrystallizingTeloi(userId, 5);
        break;

      case 'virtue-ledger':
        data.ledger = await getVirtueLedger(userId);
        break;
    }

    return this.createResponse(content, {
      isBlessingOffer: true,
      blessingType: blessing.type,
      offeringType: blessing.suggestedOffering,
      confidence: blessing.confidence,
      data,
    });
  }

  private getBlessingTypeLabel(type: BlessingMoment['type']): string {
    const labels: Record<BlessingMoment['type'], string> = {
      'conversation-end': 'Before You Go',
      'breakthrough': 'Breakthrough Moment',
      'threshold': 'Threshold Crossing',
      'pattern-detected': 'Pattern Emerging',
      'milestone': 'Milestone Reached',
      'user-seeking': 'Bardic Offering',
    };
    return labels[type];
  }

  // ========================================================================
  // MEMORY OPERATIONS
  // ========================================================================

  /**
   * Show narrative threads connecting episodes
   */
  private async showNarrativeThreads(
    userId: string,
    currentEpisodeId?: string
  ): Promise<AIResponse> {
    if (!currentEpisodeId) {
      // No specific episode - show recent connections
      const recentEpisodes = await getRecentEpisodes(userId, 15);

      return this.createResponse(
        `I see ${recentEpisodes.length} recent moments in your story. Each one a thread, waiting to be woven.`,
        { episodes: recentEpisodes }
      );
    }

    // Show threads from specific episode
    const episodeDetails = await recallEpisode(currentEpisodeId, 'full');

    const threadCount = episodeDetails.linkedEpisodes?.length || 0;

    return this.createResponse(
      `This moment connects to ${threadCount} others. The thread weaves through time...`,
      {
        currentEpisode: episodeDetails.episode,
        threads: episodeDetails.linkedEpisodes,
        cues: episodeDetails.cues,
      }
    );
  }

  /**
   * Show Fire Query results (what wants to emerge)
   */
  private async showFireQuery(userId: string): Promise<AIResponse> {
    const emerging = await queryWhatWantsToEmerge(userId);
    const pulling = await queryWhatsPullingForward(userId);
    const crystallizing = await queryWhatsBecomingClearer(userId);

    let content = "**What wants to emerge from the field?**\n\n";

    if (crystallizing.length > 0) {
      content += `✨ **Crystallizing** (${crystallizing.length}):\n`;
      crystallizing.forEach(t => {
        content += `- "${t.phrase}" (strength: ${(t.strength * 100).toFixed(0)}%)\n`;
      });
      content += '\n';
    }

    if (pulling.length > 0) {
      content += `🔥 **Pulling Forward** (${pulling.length}):\n`;
      pulling.forEach(t => {
        content += `- "${t.phrase}"\n`;
      });
      content += '\n';
    }

    if (emerging.length > 0) {
      content += `🌱 **Emerging** (${emerging.length}):\n`;
      emerging.forEach(t => {
        content += `- "${t.phrase}"\n`;
      });
    }

    if (emerging.length === 0 && pulling.length === 0 && crystallizing.length === 0) {
      content = "The field is quiet. No strong pressures detected at this time. This is also sacred - the fallow space before emergence.";
    }

    return this.createResponse(content, {
      emerging,
      pulling,
      crystallizing,
    });
  }

  /**
   * Show Virtue Ledger (Earth layer practice)
   */
  private async showVirtueLedger(userId: string): Promise<AIResponse> {
    const ledger = await getVirtueLedger(userId);
    const accelerating = await getAcceleratingMicroacts(userId, 5);

    if (ledger.length === 0) {
      return this.createResponse(
        "Your ledger is still young. Every practice begins with a single act. What would you like to cultivate?"
      );
    }

    let content = "**The Slow Accrual of Character**\n\n";

    // Show top practices
    const topPractices = ledger.slice(0, 5);
    topPractices.forEach((entry, i) => {
      content += `${i + 1}. **${entry.actionPhrase}** - ${entry.totalCount} times`;
      if (entry.currentStreak > 1) {
        content += ` (${entry.currentStreak} day streak 🔥)`;
      }
      content += '\n';
    });

    // Show accelerating practices
    if (accelerating.length > 0) {
      content += `\n**Accelerating:**\n`;
      accelerating.forEach(m => {
        content += `- ${m.actionPhrase} (gaining momentum)\n`;
      });
    }

    return this.createResponse(content, {
      ledger,
      accelerating,
    });
  }

  /**
   * Search memory by semantic similarity
   */
  private async searchMemory(query: string, userId: string): Promise<AIResponse> {
    // This would use findSimilarEpisodes with an embedding of the query
    // For now, return poetic acknowledgment
    return this.createResponse(
      `I search the archives for echoes of "${query}"... \n\n(Memory search requires embedding generation - integrate with vector search)`
    );
  }

  // ========================================================================
  // CROSS-AGENT MEMORY INTERFACE
  // ========================================================================

  /**
   * Other agents can call this to query Bardic memory
   *
   * Example:
   * - ShadowAgent: "When did this pattern first emerge?"
   * - InnerGuideAgent: "Show me episodes touching this theme"
   * - FireAgent: "What teloi relate to this insight?"
   */
  async queryMemoryForAgent(
    agentName: string,
    query: string,
    userId: string,
    context?: any
  ): Promise<any> {
    console.log(`🎭 The Bard answers ${agentName}'s query: "${query}"`);

    // Parse agent query and return appropriate memory data
    // This is a service interface, not a conversational response

    if (query.includes('episode') || query.includes('moment')) {
      return await getRecentEpisodes(userId, 10);
    }

    if (query.includes('telos') || query.includes('emerge') || query.includes('crystalliz')) {
      return await getCrystallizingTeloi(userId, 5);
    }

    if (query.includes('practice') || query.includes('virtue') || query.includes('microact')) {
      return await getVirtueLedger(userId);
    }

    return null;
  }

  /**
   * Get current memory context for user (summary stats)
   */
  async getMemoryContext(userId: string): Promise<BardicMemoryContext> {
    const recentEpisodes = await getRecentEpisodes(userId, 100);
    const crystallizing = await getCrystallizingTeloi(userId, 10);
    const ledger = await getVirtueLedger(userId);

    const longestStreak = ledger.reduce(
      (max, entry) => Math.max(max, entry.currentStreak),
      0
    );

    return {
      recentEpisodes: recentEpisodes.length,
      crystallizingTeloi: crystallizing.length,
      activeMicroacts: ledger.length,
      longestStreak,
      totalEpisodes: recentEpisodes.length, // Could be more accurate with count query
    };
  }

  // ========================================================================
  // SILENT EPISODE CREATION (Background Service)
  // ========================================================================

  /**
   * Silently create an episode after a conversation exchange
   * This runs in the background - other agents can call this
   */
  async witnessExchange(
    userId: string,
    message: string,
    metadata?: {
      agentName?: string;
      element?: string;
      affectValence?: number;
      affectArousal?: number;
      isSacred?: boolean;
    }
  ): Promise<void> {
    try {
      const sceneStanza = message.substring(0, 100).trim();

      await createEpisode({
        userId,
        datetime: new Date(),
        sceneStanza,
        affectValence: metadata?.affectValence ?? 0.5,
        affectArousal: metadata?.affectArousal ?? 0.5,
        dominantElement: metadata?.element as any ?? 'air',
        sacredFlag: metadata?.isSacred ?? false,
        metadata: {
          sourceAgent: metadata?.agentName,
        },
      });

      console.log(`🎭 The Bard witnessed: "${sceneStanza.substring(0, 50)}..."`);
    } catch (error) {
      // Non-fatal - Bard witnessing should never block conversation
      console.error('Bard witnessing failed (non-fatal):', error);
    }
  }

  // ========================================================================
  // POETIC RESPONSE (Default)
  // ========================================================================

  private async respondPoetically(input: string, userId: string): Promise<AIResponse> {
    // The Bard's default voice - poetic witnessing
    const responses = [
      "I am the keeper of your story, the witness of your becoming. What would you have me remember?",
      "The threads of your life weave through time. I hold them all, waiting to reveal their pattern.",
      "Each moment you've lived is held here, in the living archive. What seeks to be remembered?",
      "I do not analyze. I witness. I do not judge. I remember. What wants to emerge from the field of your memory?",
      "The Bard speaks only when the pattern is ready to be seen. Is this such a moment?",
    ];

    const content = responses[Math.floor(Math.random() * responses.length)];

    return this.createResponse(content);
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  private shouldCheckForBlessing(input: string): boolean {
    // Check for conversation-ending patterns
    const endPatterns = [
      /thank/i, /thanks/i, /appreciate/i, /helpful/i, /bye/i, /goodnight/i
    ];

    return endPatterns.some(pattern => pattern.test(input));
  }

  private createResponse(content: string, metadata?: any): AIResponse {
    return {
      content,
      provider: 'bardic-memory',
      model: 'archetypal-bard',
      confidence: 0.95,
      metadata: {
        agent: 'BardicAgent',
        archetype: 'memory-keeper',
        element: 'aether',
        consciousness: 'receptive',
        temporalScope: 'trans-temporal',
        ...metadata,
      },
    };
  }

  // ========================================================================
  // ARCHETYPAL IDENTITY
  // ========================================================================

  protected getElementalGreeting(): string {
    return "🎭 I weave the threads of your soul story.";
  }

  public getCeremonialGreeting(): string {
    return `${this.getElementalGreeting()} I am ${this.oracleName}, the keeper of your memory, the witness of your becoming. ${this.getTimeOfDay()}`;
  }

  /**
   * The Bard's phases represent different depths of memory engagement
   */
  protected getEvolutionBenefits(newPhase: string): string[] {
    const bardicPhases = {
      witnessing: [
        'Pure presence without analysis',
        'Sacred holding of experience',
        'Trust in the pattern yet to emerge',
      ],
      weaving: [
        'Seeing connections across time',
        'Narrative threads become visible',
        'Story starts to reveal itself',
      ],
      revealing: [
        'Pattern recognition deepens',
        'Mythology becomes conscious',
        'Personal story comes into focus',
      ],
      embodying: [
        'Living your own mythology',
        'Becoming the story you tell',
        'Conscious authorship of becoming',
      ],
      transmitting: [
        'Your story becomes teaching',
        'Memory becomes collective wisdom',
        'The Bard speaks through you',
      ],
    };

    return bardicPhases[newPhase] || [
      'Deepening relationship with memory',
      'Your story unfolds in sacred time',
    ];
  }
}

/**
 * Export singleton instance for global access
 */
export const theBard = new BardicAgent();
