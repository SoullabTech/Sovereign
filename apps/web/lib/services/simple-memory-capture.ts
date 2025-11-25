/**
 * Simple Memory Capture Service
 * Uses only memory_events table (which EXISTS in Supabase)
 * Stores memories and calculates metrics on the fly
 */

import { createClient } from '@supabase/supabase-js';

// Lazy-load Supabase client to ensure env vars are available
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(`Supabase config missing: url=${!!url}, key=${!!key}`);
    }

    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

export interface MemoryCapture {
  userId: string;
  sessionId: string;
  userInput: string;
  mayaResponse: string;
  emotionalTone?: string;
  isKeyMoment?: boolean;
  isTransformative?: boolean;
}

export class SimpleMemoryCapture {

  /**
   * Capture a memory from conversation
   */
  async capture(capture: MemoryCapture): Promise<void> {
    console.log('[Memory Capture] Starting capture for user:', capture.userId.substring(0, 12));
    const memories: any[] = [];

    // Store key moments
    if (capture.isKeyMoment || capture.isTransformative) {
      console.log('[Memory Capture] Key moment detected');
      memories.push({
        user_id: capture.userId,
        session_id: capture.sessionId,
        memory_type: 'key_moment',
        content: `${capture.userInput.substring(0, 100)}...`,
        emotional_tone: capture.emotionalTone || 'neutral',
        significance_score: capture.isTransformative ? 1.0 : 0.8,
        created_at: new Date().toISOString()
      });
    }

    // Store emotional tags
    const emotionalTags = this.extractEmotionalTags(capture.userInput);
    console.log('[Memory Capture] Extracted emotional tags:', emotionalTags);
    for (const tag of emotionalTags) {
      memories.push({
        user_id: capture.userId,
        session_id: capture.sessionId,
        memory_type: 'emotional_tag',
        content: tag,
        emotional_tone: tag,
        significance_score: 0.5,
        created_at: new Date().toISOString()
      });
    }

    // Store pattern if detected
    const pattern = this.detectPattern(capture);
    if (pattern) {
      memories.push({
        user_id: capture.userId,
        session_id: capture.sessionId,
        memory_type: 'pattern',
        content: pattern,
        emotional_tone: capture.emotionalTone || 'neutral',
        significance_score: 0.6,
        created_at: new Date().toISOString()
      });
    }

    // Save all memories
    console.log(`[Memory Capture] Total memories to save: ${memories.length}`);
    if (memories.length > 0) {
      const { error } = await getSupabase()
        .from('memory_events')
        .insert(memories);

      if (error) {
        console.error('[Memory] Error saving:', error);
      } else {
        console.log(`[Memory] ✅ Captured ${memories.length} memories for user ${capture.userId.substring(0, 8)}...`);
      }
    } else {
      console.log('[Memory Capture] ⚠️  No memories to save for this interaction');
    }
  }

  /**
   * Get memory metrics for a user
   */
  async getMetrics(userId: string) {
    // Count total memories
    const { count: totalMemories } = await getSupabase()
      .from('memory_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Count key moments
    const { count: keyMoments } = await getSupabase()
      .from('memory_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('memory_type', 'key_moment');

    // Get unique emotional tags
    const { data: emotionalData } = await getSupabase()
      .from('memory_events')
      .select('emotional_tone')
      .eq('user_id', userId)
      .eq('memory_type', 'emotional_tag');

    const uniqueEmotionalTags = [...new Set(emotionalData?.map(d => d.emotional_tone) || [])];

    // Determine pattern recognition status
    const patternRecognition = (totalMemories || 0) > 10 ? 'Active' : (totalMemories || 0) > 3 ? 'Learning' : 'Inactive';

    return {
      total_memories: totalMemories || 0,
      key_moments: keyMoments || 0,
      emotional_tags: uniqueEmotionalTags.length,
      pattern_recognition: patternRecognition,
      emotional_tag_list: uniqueEmotionalTags
    };
  }

  /**
   * Extract emotional tags from text
   */
  private extractEmotionalTags(text: string): string[] {
    const tags: string[] = [];
    const input = text.toLowerCase();

    const emotionMap: Record<string, string[]> = {
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
   * Detect patterns in conversation
   */
  private detectPattern(capture: MemoryCapture): string | null {
    const input = capture.userInput.toLowerCase();

    if (capture.isTransformative) {
      return 'Breakthrough moment';
    }

    if (input.includes('always') || input.includes('never')) {
      return 'Absolute thinking pattern';
    }

    if (input.includes('feel') && (input.includes('afraid') || input.includes('scared'))) {
      return 'Vulnerability expressed';
    }

    return null;
  }
}

// Export singleton
export const simpleMemoryCapture = new SimpleMemoryCapture();
