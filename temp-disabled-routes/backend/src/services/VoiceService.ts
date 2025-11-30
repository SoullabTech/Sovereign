import { get } from '../core/di/container';
import { TOKENS } from '../core/di/tokens';
import { VoiceQueue } from './VoiceQueue';
import { VoiceGuards } from '../core/guards/VoiceGuards';
import { VoiceEventBus } from '../core/events/VoiceEventBus';
import { getPresetForContext } from '../adapters/voice/voicePresets';
import { VoicePreprocessor } from '../../../../../lib/voice/VoicePreprocessor';

interface VoiceRequest {
  userId: string;
  text: string;
  element?: string;
  personality?: string;
  mood?: string;
  sessionId?: string;
}

/**
 * High-level voice service that orchestrates all voice-related operations
 * This is the main entry point for voice synthesis in the application
 */
export class VoiceService {
  private voiceQueue: VoiceQueue;
  private voiceGuards: VoiceGuards;
  private eventBus: VoiceEventBus;

  constructor() {
    this.voiceQueue = get<VoiceQueue>(TOKENS.VOICE_QUEUE);
    this.voiceGuards = get<VoiceGuards>(TOKENS.VOICE_GUARDS);
    this.eventBus = get<VoiceEventBus>(TOKENS.VOICE_EVENTS);
  }

  /**
   * Queue voice synthesis with all production safeguards
   * @returns taskId for tracking or null if synthesis disabled/failed
   */
  async synthesize(request: VoiceRequest): Promise<string | null> {
    try {
      // Check if voice is enabled for user
      const voiceEnabled = await this.voiceGuards.checkUserPreference(request.userId);
      if (!voiceEnabled) {
        console.log(`🔇 Voice synthesis disabled for user ${request.userId}`);
        return null;
      }

      // Apply security guards
      await this.voiceGuards.checkText(request.userId, request.text);

      // First remove stage directions and narrative text that shouldn't be spoken
      const preprocessedText = VoicePreprocessor.extractSpokenContent(request.text);

      // Then scrub PII from the spoken content
      const cleanText = this.voiceGuards.scrubPii(preprocessedText);

      // Select appropriate voice preset
      const preset = getPresetForContext(
        request.element,
        request.mood,
        request.personality
      );

      // Determine voice ID based on personality/element
      const voiceId = this.selectVoiceId(request);

      // Queue synthesis
      const taskId = this.voiceQueue.enqueue({
        userId: request.userId,
        text: cleanText,
        voiceId,
        preset
      });

      console.log(`🎤 Voice queued: ${taskId} | ${voiceId} | ${preset} | ${cleanText.substring(0, 30)}...`);

      // Emit analytics event
      this.eventBus.emit({
        type: 'voice.analytics',
        userId: request.userId,
        taskId,
        textLength: request.text.length,
        element: request.element,
        personality: request.personality,
        preset,
        timestamp: new Date()
      });

      return taskId;

    } catch (error: any) {
      console.error('Voice synthesis failed:', error);
      
      // Emit failure event
      this.eventBus.emit({
        type: 'voice.error',
        userId: request.userId,
        error: error.message,
        timestamp: new Date()
      });

      return null;
    }
  }

  /**
   * Get current voice usage stats for monitoring
   */
  getStats() {
    return {
      queue: this.voiceQueue.getQueueStatus(),
      guards: this.voiceGuards.getUsageStats(),
      cache: (get<any>(TOKENS.Voice) as any).getCacheStats?.() || null
    };
  }

  /**
   * Check ElevenLabs quota and emit warning if needed
   */
  async checkQuota() {
    try {
      const voice = get<any>(TOKENS.Voice);
      
      // Get underlying ElevenLabs instance (through memoization wrapper)
      const elevenLabs = voice.inner || voice;
      
      if (elevenLabs.getQuota) {
        const quota = await elevenLabs.getQuota();
        const warning = this.voiceGuards.getQuotaWarning(
          quota.charactersRemaining,
          quota.characterLimit
        );

        if (warning) {
          console.warn(`⚠️  ${warning}`);
          this.eventBus.emit({
            type: 'voice.quota_warning',
            charactersRemaining: quota.charactersRemaining,
            characterLimit: quota.characterLimit,
            percentUsed: ((quota.characterLimit - quota.charactersRemaining) / quota.characterLimit) * 100,
            timestamp: new Date().toISOString()
          });
        }

        return quota;
      }
    } catch (error) {
      console.error('Failed to check voice quota:', error);
    }

    return null;
  }

  private selectVoiceId(request: VoiceRequest): string {
    // Import voice config
    const { getVoiceIdForPersonality, getVoiceIdForElement } = require('../config/voice');

    // Priority: personality > element > default
    if (request.personality) {
      return getVoiceIdForPersonality(request.personality);
    }

    if (request.element) {
      return getVoiceIdForElement(request.element);
    }

    return getVoiceIdForPersonality('default');
  }
}