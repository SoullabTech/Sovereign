/**
 * VOICE LEARNING SERVICE
 *
 * Collects and analyzes voice interaction data for MAIA's sovereign voice training.
 * Tracks prosody patterns, response timing, emotional resonance, and user feedback.
 *
 * Key metrics for voice training:
 * - Response timing (first-byte latency, total duration)
 * - Prosody effectiveness (user engagement signals)
 * - Mode-appropriate voice modulation (Talk/Care/Note)
 * - Repair mode success (crisis response patterns)
 */

import { query } from '../db/postgres';

export interface VoiceTurnData {
  turnId: number;
  sessionId: string;
  mode: 'talk' | 'care' | 'note';

  // Voice metrics
  firstByteLatencyMs: number;
  totalDurationMs: number;
  audioLengthMs: number;
  chunkCount: number;

  // Prosody data
  prosodyProfile?: {
    tempo: 'slow' | 'medium' | 'fast';
    warmth: number; // 0-1
    pause_frequency: number;
    emphasis_words: string[];
  };

  // TTS metadata
  ttsProvider: 'openai' | 'xtts' | 'personaplex' | 'local';
  ttsModel?: string;
  voiceId?: string;

  // Quality signals
  userInterrupted?: boolean;
  userRequestedRepeat?: boolean;
  completedListening?: boolean;
}

export interface VoiceFeedback {
  turnId: number;
  voiceQuality?: 1 | 2 | 3 | 4 | 5;
  paceAppropriate?: boolean;
  toneAppropriate?: boolean;
  clarityScore?: number;
  userComment?: string;
}

/**
 * MAIA Voice Learning Service
 *
 * Collects voice interaction data for training sovereign TTS
 */
export class VoiceLearningService {

  /**
   * Log voice turn data for learning
   */
  static async logVoiceTurn(data: VoiceTurnData): Promise<number> {
    try {
      const result = await query<{ id: number }>(
        `INSERT INTO maia_voice_turns (
          turn_id, session_id, mode,
          first_byte_latency_ms, total_duration_ms, audio_length_ms, chunk_count,
          prosody_profile, tts_provider, tts_model, voice_id,
          user_interrupted, user_requested_repeat, completed_listening
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          data.turnId,
          data.sessionId,
          data.mode,
          data.firstByteLatencyMs,
          data.totalDurationMs,
          data.audioLengthMs,
          data.chunkCount,
          data.prosodyProfile ? JSON.stringify(data.prosodyProfile) : null,
          data.ttsProvider,
          data.ttsModel,
          data.voiceId,
          data.userInterrupted ?? false,
          data.userRequestedRepeat ?? false,
          data.completedListening ?? true
        ]
      );

      const voiceTurnId = result.rows[0]?.id;
      console.log(`🎤 [VOICE LEARNING] Logged voice turn ${voiceTurnId} | Mode: ${data.mode} | Latency: ${data.firstByteLatencyMs}ms`);

      return voiceTurnId;
    } catch (error) {
      console.warn('⚠️ [VOICE LEARNING] Failed to log voice turn:', error);
      return -1;
    }
  }

  /**
   * Log voice feedback
   */
  static async logVoiceFeedback(feedback: VoiceFeedback): Promise<number | null> {
    try {
      const result = await query<{ id: number }>(
        `INSERT INTO maia_voice_feedback (
          turn_id, voice_quality, pace_appropriate, tone_appropriate,
          clarity_score, user_comment
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          feedback.turnId,
          feedback.voiceQuality,
          feedback.paceAppropriate,
          feedback.toneAppropriate,
          feedback.clarityScore,
          feedback.userComment
        ]
      );

      return result.rows[0]?.id;
    } catch (error) {
      console.warn('⚠️ [VOICE LEARNING] Failed to log voice feedback:', error);
      return null;
    }
  }

  /**
   * Get voice performance stats by mode
   */
  static async getVoiceStatsByMode(): Promise<{
    mode: string;
    avgLatency: number;
    avgDuration: number;
    completionRate: number;
    interruptionRate: number;
    sampleCount: number;
  }[]> {
    try {
      const result = await query(`
        SELECT
          mode,
          AVG(first_byte_latency_ms) as avg_latency,
          AVG(total_duration_ms) as avg_duration,
          AVG(CASE WHEN completed_listening THEN 1.0 ELSE 0.0 END) as completion_rate,
          AVG(CASE WHEN user_interrupted THEN 1.0 ELSE 0.0 END) as interruption_rate,
          COUNT(*) as sample_count
        FROM maia_voice_turns
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY mode
        ORDER BY mode
      `);

      return result.rows.map(row => ({
        mode: row.mode,
        avgLatency: parseFloat(row.avg_latency) || 0,
        avgDuration: parseFloat(row.avg_duration) || 0,
        completionRate: parseFloat(row.completion_rate) || 0,
        interruptionRate: parseFloat(row.interruption_rate) || 0,
        sampleCount: parseInt(row.sample_count) || 0
      }));
    } catch (error) {
      console.error('❌ [VOICE LEARNING] Failed to get stats by mode:', error);
      return [];
    }
  }

  /**
   * Get prosody patterns that lead to high engagement
   */
  static async getEffectiveProsodyPatterns(minSamples: number = 10): Promise<{
    tempo: string;
    warmth: number;
    avgCompletionRate: number;
    avgQualityScore: number;
    sampleCount: number;
  }[]> {
    try {
      const result = await query(`
        SELECT
          vt.prosody_profile->>'tempo' as tempo,
          AVG((vt.prosody_profile->>'warmth')::numeric) as warmth,
          AVG(CASE WHEN vt.completed_listening THEN 1.0 ELSE 0.0 END) as avg_completion_rate,
          AVG(vf.voice_quality) as avg_quality_score,
          COUNT(*) as sample_count
        FROM maia_voice_turns vt
        LEFT JOIN maia_voice_feedback vf ON vt.turn_id = vf.turn_id
        WHERE vt.prosody_profile IS NOT NULL
          AND vt.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY vt.prosody_profile->>'tempo'
        HAVING COUNT(*) >= $1
        ORDER BY AVG(CASE WHEN vt.completed_listening THEN 1.0 ELSE 0.0 END) DESC
      `, [minSamples]);

      return result.rows.map(row => ({
        tempo: row.tempo || 'unknown',
        warmth: parseFloat(row.warmth) || 0.5,
        avgCompletionRate: parseFloat(row.avg_completion_rate) || 0,
        avgQualityScore: parseFloat(row.avg_quality_score) || 0,
        sampleCount: parseInt(row.sample_count) || 0
      }));
    } catch (error) {
      console.error('❌ [VOICE LEARNING] Failed to get prosody patterns:', error);
      return [];
    }
  }

  /**
   * Export voice training data for XTTS fine-tuning
   */
  static async exportVoiceTrainingData(): Promise<{
    totalSamples: number;
    byMode: Record<string, number>;
    avgQuality: number;
    exportPath?: string;
  }> {
    try {
      // Get counts by mode
      const modeCountsResult = await query(`
        SELECT mode, COUNT(*) as count
        FROM maia_voice_turns
        WHERE completed_listening = true
          AND user_interrupted = false
        GROUP BY mode
      `);

      const byMode: Record<string, number> = {};
      let totalSamples = 0;
      modeCountsResult.rows.forEach(row => {
        byMode[row.mode] = parseInt(row.count);
        totalSamples += parseInt(row.count);
      });

      // Get average quality
      const qualityResult = await query(`
        SELECT AVG(voice_quality) as avg_quality
        FROM maia_voice_feedback
        WHERE voice_quality IS NOT NULL
      `);
      const avgQuality = parseFloat(qualityResult.rows[0]?.avg_quality) || 0;

      console.log(`📊 [VOICE LEARNING] Export stats: ${totalSamples} samples, ${Object.keys(byMode).length} modes, avg quality ${avgQuality.toFixed(2)}`);

      return {
        totalSamples,
        byMode,
        avgQuality
      };
    } catch (error) {
      console.error('❌ [VOICE LEARNING] Failed to export voice training data:', error);
      return {
        totalSamples: 0,
        byMode: {},
        avgQuality: 0
      };
    }
  }

  /**
   * Get voice learning readiness assessment
   */
  static async getVoiceLearningReadiness(): Promise<{
    ready: boolean;
    totalSamples: number;
    feedbackCoverage: number;
    modesCovered: string[];
    recommendations: string[];
  }> {
    try {
      const turnsResult = await query(`
        SELECT COUNT(*) as total, mode
        FROM maia_voice_turns
        GROUP BY mode
      `);

      const feedbackResult = await query(`
        SELECT COUNT(DISTINCT turn_id) as feedback_count
        FROM maia_voice_feedback
      `);

      const totalTurns = turnsResult.rows.reduce((sum, row) => sum + parseInt(row.total), 0);
      const feedbackCount = parseInt(feedbackResult.rows[0]?.feedback_count) || 0;
      const feedbackCoverage = totalTurns > 0 ? feedbackCount / totalTurns : 0;
      const modesCovered = turnsResult.rows.map(row => row.mode);

      const recommendations: string[] = [];

      if (totalTurns < 500) {
        recommendations.push(`Need more voice samples (${totalTurns}/500 minimum)`);
      }
      if (feedbackCoverage < 0.1) {
        recommendations.push(`Need more voice feedback (${(feedbackCoverage * 100).toFixed(1)}% coverage)`);
      }
      if (!modesCovered.includes('care')) {
        recommendations.push('Missing Care mode samples - important for emotional voice training');
      }

      const ready = totalTurns >= 500 && feedbackCoverage >= 0.1 && modesCovered.length >= 2;

      return {
        ready,
        totalSamples: totalTurns,
        feedbackCoverage,
        modesCovered,
        recommendations
      };
    } catch (error) {
      console.error('❌ [VOICE LEARNING] Readiness check failed:', error);
      return {
        ready: false,
        totalSamples: 0,
        feedbackCoverage: 0,
        modesCovered: [],
        recommendations: ['Voice learning system check failed']
      };
    }
  }
}

export default VoiceLearningService;
