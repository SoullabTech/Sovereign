/**
 * Conversation Analytics Service
 * Saves conversations with full voice and model analytics metadata to Supabase
 */

import { createClient } from '@/lib/supabase';

interface ConversationAnalytics {
  // Core conversation data
  userId: string;
  prompt: string;
  response: string;
  soulprintId?: string;
  milestone?: string;

  // Model performance
  aiModel?: 'gpt-4o' | 'gpt-5' | 'claude-3-5-sonnet';
  aiProvider?: 'openai' | 'anthropic';
  responseTimeMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  apiRetries?: number;

  // Conversation quality
  conversationMode?: 'walking' | 'classic' | 'adaptive' | 'her';
  responseWordCount?: number;
  responseSentenceCount?: number;
  userWordCount?: number;
  brevityScore?: number;
  emotionalResonance?: 'deep' | 'moderate' | 'light' | 'disconnected';

  // Voice interaction
  userSpokeDurationMs?: number;
  maiaSpokeDurationMs?: number;
  listeningPauses?: number;
  interruptions?: number;
  silenceDurationMs?: number;
  transcriptionConfidence?: number;
  audioQuality?: 'excellent' | 'good' | 'fair' | 'poor';

  // Session context
  sessionId?: string;
  exchangeNumber?: number;
  timeInSessionMs?: number;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  voiceEnabled?: boolean;
  ttsEnabled?: boolean;
}

/**
 * Save a conversation with full analytics metadata
 */
export async function saveConversationWithAnalytics(
  analytics: ConversationAnalytics
): Promise<{ success: boolean; entryId?: string; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: analytics.userId,
        soulprint_id: analytics.soulprintId,
        prompt: analytics.prompt,
        response: analytics.response,
        milestone: analytics.milestone,

        // Model performance
        ai_model: analytics.aiModel,
        ai_provider: analytics.aiProvider,
        response_time_ms: analytics.responseTimeMs,
        input_tokens: analytics.inputTokens,
        output_tokens: analytics.outputTokens,
        total_tokens: analytics.totalTokens,
        cost_usd: analytics.costUsd,
        api_retries: analytics.apiRetries || 0,

        // Conversation quality
        conversation_mode: analytics.conversationMode,
        response_word_count: analytics.responseWordCount,
        response_sentence_count: analytics.responseSentenceCount,
        user_word_count: analytics.userWordCount,
        brevity_score: analytics.brevityScore,
        emotional_resonance: analytics.emotionalResonance,

        // Voice interaction
        user_spoke_duration_ms: analytics.userSpokeDurationMs,
        maia_spoke_duration_ms: analytics.maiaSpokeDurationMs,
        listening_pauses: analytics.listeningPauses || 0,
        interruptions: analytics.interruptions || 0,
        silence_duration_ms: analytics.silenceDurationMs,
        transcription_confidence: analytics.transcriptionConfidence,
        audio_quality: analytics.audioQuality,

        // Session context
        session_id: analytics.sessionId,
        exchange_number: analytics.exchangeNumber,
        time_in_session_ms: analytics.timeInSessionMs,
        device_type: analytics.deviceType,
        voice_enabled: analytics.voiceEnabled || false,
        tts_enabled: analytics.ttsEnabled || false,

        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to save conversation with analytics:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Conversation saved with analytics:', data.id);
    return { success: true, entryId: data.id };
  } catch (error: any) {
    console.error('❌ Exception saving conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get live voice analytics from SimplifiedOrganicVoice component
 */
export function getLiveVoiceAnalytics(): {
  sessionId: string;
  sessionDurationMs: number;
  exchangeCount: number;
  totalUserSpeechDurationMs: number;
  totalMaiaSpeechDurationMs: number;
  listeningPauses: number;
  interruptions: number;
  avgUserSpeechDurationMs: number;
  avgMaiaSpeechDurationMs: number;
} | null {
  if (typeof window === 'undefined') return null;

  const getAnalytics = (window as any).__getVoiceAnalytics;
  if (!getAnalytics) return null;

  return getAnalytics();
}

/**
 * Query model performance comparison from Supabase view
 */
export async function getModelPerformanceComparison(
  userId: string,
  timeRangeDays?: number
) {
  try {
    const supabase = createClient();

    let query = supabase
      .from('analytics_model_performance')
      .select('*')
      .eq('user_id', userId);

    if (timeRangeDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRangeDays);
      query = query.gte('last_use', cutoffDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Failed to fetch model performance:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Exception fetching model performance:', error);
    return null;
  }
}

/**
 * Query voice quality stats from Supabase view
 */
export async function getVoiceQualityStats(userId: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('analytics_voice_quality')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Failed to fetch voice quality stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Exception fetching voice quality stats:', error);
    return null;
  }
}

/**
 * Query conversation mode effectiveness from Supabase view
 */
export async function getModeEffectiveness(userId: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('analytics_mode_effectiveness')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to fetch mode effectiveness:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Exception fetching mode effectiveness:', error);
    return null;
  }
}

/**
 * Detect device type from user agent
 */
export function detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}
