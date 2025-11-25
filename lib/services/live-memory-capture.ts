/**
 * Live Memory Capture Service
 * Captures and stores memory patterns during active conversations
 * Bridges conversation flow with memory systems
 */

import { RelationalMemory, Interaction } from '@/lib/oracle/relational/RelationalMemory';
import { IndividualFieldMemory } from '@/lib/oracle/memory/IndividualFieldMemory';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ConversationTurn {
  userId: string;
  sessionId: string;
  userInput: string;
  mayaResponse: string;
  fieldState?: any;
  archetype?: string;
  emotionalTone?: string;
  engagementLevel?: 'deep' | 'engaged' | 'neutral' | 'disengaged' | 'closed';
  transformationOccurred?: boolean;
  sacredMoment?: boolean;
}

export interface MemoryMetrics {
  totalMemories: number;
  keyMoments: number;
  emotionalTags: string[];
  patternRecognition: 'Active' | 'Learning' | 'Inactive';
  recentInsights: string[];
}

export class LiveMemoryCapture {
  private relationalMemory: Map<string, RelationalMemory> = new Map();
  private fieldMemory: Map<string, IndividualFieldMemory> = new Map();
  private sessionMemories: Map<string, any[]> = new Map();

  /**
   * Capture a conversation turn and extract memories
   */
  async captureConversationTurn(turn: ConversationTurn): Promise<void> {
    const { userId, sessionId } = turn;

    console.log(`[Memory Capture] Processing turn for user ${userId.substring(0, 8)}...`);

    // Get or create relational memory for user
    if (!this.relationalMemory.has(userId)) {
      this.relationalMemory.set(userId, new RelationalMemory());
    }
    const relationalMem = this.relationalMemory.get(userId)!;

    // Get or create field memory for user
    if (!this.fieldMemory.has(userId)) {
      this.fieldMemory.set(userId, new IndividualFieldMemory(userId));
    }
    const fieldMem = this.fieldMemory.get(userId)!;

    // Create interaction record for relational memory
    const interaction: Interaction = {
      timestamp: new Date(),
      userInput: turn.userInput,
      mayaResponse: turn.mayaResponse,
      archetype: turn.archetype || 'sage',
      engagement: turn.engagementLevel || 'engaged',
      directnessLevel: this.calculateDirectness(turn.mayaResponse),
      vulnerabilityShown: this.detectVulnerability(turn.userInput),
      transformationOccurred: turn.transformationOccurred || false,
      emotionalIntensity: this.calculateEmotionalIntensity(turn)
    };

    // Evolve relational memory
    await relationalMem.evolveWithUser(userId, interaction);

    // Store field memory if field state available
    if (turn.fieldState) {
      await fieldMem.store_interaction(
        turn.fieldState,
        turn.archetype || 'sage',
        {
          success: turn.transformationOccurred || false,
          coherence: turn.fieldState.connectionDynamics?.coherence || 0.5
        }
      );
    }

    // Extract and store memory events
    await this.extractMemoryEvents(turn, interaction);

    // Track session memories
    if (!this.sessionMemories.has(sessionId)) {
      this.sessionMemories.set(sessionId, []);
    }
    this.sessionMemories.get(sessionId)!.push({
      timestamp: new Date(),
      interaction,
      fieldState: turn.fieldState
    });

    console.log(`[Memory Capture] ✓ Captured memory for session ${sessionId}`);
  }

  /**
   * Extract and store specific memory events to database
   */
  private async extractMemoryEvents(
    turn: ConversationTurn,
    interaction: Interaction
  ): Promise<void> {
    const memories: any[] = [];

    // Key moment detection
    if (interaction.transformationOccurred || turn.sacredMoment) {
      memories.push({
        user_id: turn.userId,
        session_id: turn.sessionId,
        memory_type: 'key_moment',
        content: this.abstractContent(turn.userInput),
        emotional_tone: turn.emotionalTone || 'neutral',
        significance_score: turn.sacredMoment ? 1.0 : 0.8,
        created_at: new Date().toISOString()
      });
    }

    // Emotional tag extraction
    const emotionalTags = this.extractEmotionalTags(turn);
    for (const tag of emotionalTags) {
      memories.push({
        user_id: turn.userId,
        session_id: turn.sessionId,
        memory_type: 'emotional_tag',
        content: tag,
        emotional_tone: tag,
        significance_score: 0.5,
        created_at: new Date().toISOString()
      });
    }

    // Pattern recognition
    if (interaction.engagement === 'deep' || interaction.engagement === 'engaged') {
      const pattern = this.identifyPattern(turn, interaction);
      if (pattern) {
        memories.push({
          user_id: turn.userId,
          session_id: turn.sessionId,
          memory_type: 'pattern_recognition',
          content: pattern,
          emotional_tone: turn.emotionalTone || 'neutral',
          significance_score: 0.6,
          created_at: new Date().toISOString()
        });
      }
    }

    // Store all memories
    if (memories.length > 0) {
      console.log('[DEBUG] Writing to DB', {
        table: 'memory_events',
        userId: turn.userId,
        count: memories.length,
        firstMemory: memories[0]
      });

      const { data, error } = await supabase
        .from('memory_events')
        .insert(memories)
        .select();

      console.log('[DEBUG] DB write result', {
        success: !error,
        error: error?.message,
        insertedCount: data?.length
      });

      if (error) {
        console.error('[Memory Capture] Error storing memories:', error);
      } else {
        console.log(`[Memory Capture] Stored ${memories.length} memory events`);
      }
    }

    // Update relational memory metrics in database
    await this.updateRelationalMetrics(turn.userId);
  }

  /**
   * Update relational memory metrics in database
   */
  private async updateRelationalMetrics(userId: string): Promise<void> {
    // Get total memory count
    const { count: totalMemories } = await supabase
      .from('memory_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get key moments count
    const { count: keyMoments } = await supabase
      .from('memory_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('memory_type', 'key_moment');

    // Get unique emotional tags
    const { data: emotionalData } = await supabase
      .from('memory_events')
      .select('emotional_tone')
      .eq('user_id', userId)
      .eq('memory_type', 'emotional_tag');

    const emotionalTags = [...new Set(emotionalData?.map(d => d.emotional_tone) || [])];

    // Determine pattern recognition status
    const patternRecognition = totalMemories && totalMemories > 10 ? 'Active' : 'Learning';

    // Update database
    await supabase
      .from('relational_memory')
      .upsert({
        user_id: userId,
        total_memories: totalMemories || 0,
        key_moments: keyMoments || 0,
        emotional_tags: emotionalTags.length,
        pattern_recognition: patternRecognition,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
  }

  /**
   * Get memory metrics for a user
   */
  async getMemoryMetrics(userId: string): Promise<MemoryMetrics> {
    const { data } = await supabase
      .from('relational_memory')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: emotionalData } = await supabase
      .from('memory_events')
      .select('emotional_tone')
      .eq('user_id', userId)
      .eq('memory_type', 'emotional_tag')
      .limit(50);

    const { data: patterns } = await supabase
      .from('memory_events')
      .select('content')
      .eq('user_id', userId)
      .eq('memory_type', 'pattern_recognition')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalMemories: data?.total_memories || 0,
      keyMoments: data?.key_moments || 0,
      emotionalTags: [...new Set(emotionalData?.map(d => d.emotional_tone) || [])],
      patternRecognition: data?.pattern_recognition || 'Learning',
      recentInsights: patterns?.map(p => p.content) || []
    };
  }

  /**
   * Retrieve relational memory for user
   */
  getRelationalMemory(userId: string): RelationalMemory | undefined {
    return this.relationalMemory.get(userId);
  }

  /**
   * Retrieve field memory for user
   */
  getFieldMemory(userId: string): IndividualFieldMemory | undefined {
    return this.fieldMemory.get(userId);
  }

  /**
   * Calculate directness level from response
   */
  private calculateDirectness(response: string): number {
    // Heuristic: more metaphorical language = lower directness
    const metaphorIndicators = ['like', 'as if', 'imagine', 'perhaps', 'seems'];
    const directIndicators = ['you are', 'you need', 'I see', 'clearly', 'exactly'];

    let score = 0.5; // neutral
    for (const indicator of metaphorIndicators) {
      if (response.toLowerCase().includes(indicator)) score -= 0.1;
    }
    for (const indicator of directIndicators) {
      if (response.toLowerCase().includes(indicator)) score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Detect vulnerability in user input
   */
  private detectVulnerability(input: string): boolean {
    const vulnerabilityIndicators = [
      'feel', 'afraid', 'scared', 'hurt', 'pain', 'struggle',
      'difficult', 'hard', 'lost', 'confused', 'vulnerable',
      'shame', 'guilt', 'alone', 'lonely'
    ];

    return vulnerabilityIndicators.some(indicator =>
      input.toLowerCase().includes(indicator)
    );
  }

  /**
   * Calculate emotional intensity
   */
  private calculateEmotionalIntensity(turn: ConversationTurn): number {
    let intensity = 0.3; // base intensity

    // Increase for deep engagement
    if (turn.engagementLevel === 'deep') intensity += 0.3;
    if (turn.engagementLevel === 'engaged') intensity += 0.2;

    // Increase for sacred moments
    if (turn.sacredMoment) intensity += 0.3;

    // Increase for transformation
    if (turn.transformationOccurred) intensity += 0.2;

    return Math.min(1, intensity);
  }

  /**
   * Extract emotional tags from conversation
   */
  private extractEmotionalTags(turn: ConversationTurn): string[] {
    const tags: string[] = [];

    if (turn.emotionalTone) {
      tags.push(turn.emotionalTone);
    }

    // Extract from text patterns
    const input = turn.userInput.toLowerCase();
    const emotionMap: Record<string, string> = {
      'joy': ['happy', 'joy', 'excited', 'grateful', 'love'],
      'sadness': ['sad', 'grief', 'loss', 'miss', 'lonely'],
      'fear': ['afraid', 'scared', 'anxious', 'worry', 'nervous'],
      'anger': ['angry', 'frustrated', 'mad', 'annoyed', 'upset'],
      'peace': ['calm', 'peaceful', 'serene', 'tranquil', 'still'],
      'curiosity': ['wonder', 'curious', 'interesting', 'explore', 'discover']
    };

    for (const [emotion, keywords] of Object.entries(emotionMap)) {
      if (keywords.some(kw => input.includes(kw))) {
        tags.push(emotion);
      }
    }

    return [...new Set(tags)];
  }

  /**
   * Identify patterns from interaction
   */
  private identifyPattern(turn: ConversationTurn, interaction: Interaction): string | null {
    // Check for recurring themes
    if (turn.fieldState?.semanticLandscape?.depth_measure > 0.7) {
      return 'Deep existential exploration';
    }

    if (interaction.vulnerabilityShown && interaction.engagement === 'deep') {
      return 'Vulnerability opens depth';
    }

    if (turn.archetype === 'shadow' && interaction.engagement === 'engaged') {
      return 'Shadow work creates engagement';
    }

    return null;
  }

  /**
   * Abstract content for privacy
   */
  private abstractContent(text: string): string {
    // Return abstracted version - pattern without specifics
    return `Interaction pattern: ${text.length} chars, ${text.split(' ').length} words`;
  }

  /**
   * Get session summary
   */
  async getSessionSummary(sessionId: string): Promise<{
    memoryCount: number;
    keyMoments: number;
    emotionalRange: string[];
    patterns: string[];
  }> {
    const sessionData = this.sessionMemories.get(sessionId) || [];

    return {
      memoryCount: sessionData.length,
      keyMoments: sessionData.filter(d => d.interaction.transformationOccurred).length,
      emotionalRange: [...new Set(sessionData.map(d => d.interaction.emotionalIntensity > 0.7 ? 'high' : 'moderate'))],
      patterns: sessionData
        .filter(d => d.interaction.engagement === 'deep')
        .map(d => d.interaction.archetype)
    };
  }
}

// Export singleton instance
export const liveMemoryCapture = new LiveMemoryCapture();
