/**
 * Conversation Memory Integration
 *
 * Integrates Bardic Memory with real-time conversation flow
 * Air (contextual wisdom) serving Fire (present emergence)
 *
 * Architecture:
 * - Background pattern recognition (non-intrusive)
 * - Auto-episode creation from crystallization moments
 * - Fire-Air balance monitoring
 * - Subtle pattern reflection (not dominating)
 *
 * McGilchrist's master-emissary made computational:
 * Right hemisphere (Fire) leads, left hemisphere (Air) serves
 */

import { getRecognitionService } from './RecognitionService';
import { getReentryService } from './ReentryService';
import { getTeleologyService } from './TeleologyService';
import { getStanzaWriter } from './StanzaWriter';
import { getEmbeddingService } from './EmbeddingService';
import { getLinkingService } from './LinkingService';
import { createClientComponentClient } from '@/lib/supabase';
import type {
  EpisodeCandidate,
  Telos,
  BalanceCheck
} from './types';

export interface ConversationContext {
  userId: string;
  sessionId: string;
  currentAffect?: {
    valence: number; // -5 to +5
    arousal: number; // 0 to 10
  };
  currentCoherence?: number; // 0-1 from biometrics
  placeCue?: string;
  senseCues?: string[];
}

export interface PatternRecognitionResult {
  hasResonance: boolean;
  candidates: EpisodeCandidate[];
  reflection?: string; // What MAIA might say
  shouldMention: boolean; // Only mention if strong (>0.85)
}

export interface CrystallizationDetection {
  isCrystallizing: boolean;
  fireAirAlignment: number;
  shouldCapture: boolean;
  suggestedStanza?: string;
}

export interface MemoryEnrichedResponse {
  originalResponse: string;
  patternReflection?: string; // Subtle Air wisdom
  crystallizationNote?: string; // Fire recognition
  balanceGuidance?: string; // When imbalanced
}

export class ConversationMemoryIntegration {
  private supabase = createClientComponentClient();
  private recognitionCache = new Map<string, PatternRecognitionResult>();
  private lastBalanceCheck: Date | null = null;

  /**
   * Background pattern recognition during conversation
   *
   * Runs quietly while user speaks. Doesn't interrupt Fire.
   * Air notices patterns but waits for Fire's invitation.
   */
  async recognizeInBackground(
    context: ConversationContext,
    userMessage: string
  ): Promise<PatternRecognitionResult> {
    try {
      // Check cache first (don't re-recognize same content)
      const cacheKey = `${context.userId}:${userMessage.substring(0, 100)}`;
      if (this.recognitionCache.has(cacheKey)) {
        return this.recognitionCache.get(cacheKey)!;
      }

      const recognitionService = getRecognitionService();
      const candidates = await recognitionService.recognize({
        userId: context.userId,
        recentText: userMessage,
        affect: context.currentAffect,
        softCues: context.senseCues
      });

      // Only surface strong resonance (>0.85 similarity)
      const strongMatches = candidates.filter(c => c.score > 0.85);
      const hasResonance = strongMatches.length > 0;

      // Craft subtle reflection (Air language, not left-brain analysis)
      let reflection: string | undefined;
      if (hasResonance && strongMatches[0]) {
        const top = strongMatches[0];
        reflection = this.craftResonanceReflection(top);
      }

      const result: PatternRecognitionResult = {
        hasResonance,
        candidates: strongMatches,
        reflection,
        shouldMention: hasResonance && strongMatches[0].score > 0.88 // Very high bar
      };

      // Cache for 5 minutes
      this.recognitionCache.set(cacheKey, result);
      setTimeout(() => this.recognitionCache.delete(cacheKey), 5 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('[ConversationMemoryIntegration] Error in recognition:', error);
      return {
        hasResonance: false,
        candidates: [],
        shouldMention: false
      };
    }
  }

  /**
   * Craft resonance reflection (poetic Air language)
   *
   * NOT: "I found a similar conversation from 3 weeks ago"
   * BUT: "This moment has a quality... familiar but fresh"
   */
  private craftResonanceReflection(candidate: EpisodeCandidate): string {
    const { episode, score } = candidate;
    const stanza = episode.scene_stanza;

    // Poetic, not analytical
    const templates = [
      `The shape of what you're feeling... it resonates. *${stanza}*`,
      `This has a quality I recognize. Echoes of: *${stanza}*`,
      `Something familiar here, but transformed: *${stanza}*`,
      `The pattern feels known, yet new: *${stanza}*`
    ];

    const index = Math.floor(Math.random() * templates.length);
    return templates[index];
  }

  /**
   * Detect crystallization moments
   *
   * When Fire and Air perfectly align:
   * - User has clarity (Fire)
   * - Context matches past patterns (Air)
   * - High coherence (embodied)
   *
   * These are breakthrough moments worth capturing
   */
  async detectCrystallization(
    context: ConversationContext,
    userMessage: string,
    recognitionResult: PatternRecognitionResult
  ): Promise<CrystallizationDetection> {
    try {
      // Calculate Fire-Air alignment
      const hasStrongResonance = recognitionResult.candidates.length > 0 &&
                                 recognitionResult.candidates[0].score > 0.85;

      const coherence = context.currentCoherence || 0.5;
      const hasClarity = userMessage.includes('clear') ||
                        userMessage.includes('see') ||
                        userMessage.includes('understand') ||
                        userMessage.includes('realize');

      // Fire-Air alignment score
      const fireAirAlignment = (
        (hasStrongResonance ? 0.4 : 0) +
        (coherence * 0.3) +
        (hasClarity ? 0.3 : 0)
      );

      const isCrystallizing = fireAirAlignment > 0.75;
      const shouldCapture = isCrystallizing && coherence > 0.7;

      // Generate stanza if crystallizing
      let suggestedStanza: string | undefined;
      if (isCrystallizing) {
        const stanzaWriter = getStanzaWriter();
        suggestedStanza = await stanzaWriter.write({
          text: userMessage,
          placeCue: context.placeCue,
          senseCues: context.senseCues,
          affectValence: context.currentAffect?.valence,
          affectArousal: context.currentAffect?.arousal
        });
      }

      return {
        isCrystallizing,
        fireAirAlignment,
        shouldCapture,
        suggestedStanza
      };
    } catch (error) {
      console.error('[ConversationMemoryIntegration] Error detecting crystallization:', error);
      return {
        isCrystallizing: false,
        fireAirAlignment: 0.5,
        shouldCapture: false
      };
    }
  }

  /**
   * Auto-capture episode from conversation
   *
   * Creates episode when crystallization detected
   * Happens in background, doesn't interrupt flow
   */
  async captureEpisode(
    context: ConversationContext,
    userMessage: string,
    assistantResponse: string,
    crystallization: CrystallizationDetection
  ): Promise<string | null> {
    try {
      if (!crystallization.shouldCapture) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('episodes')
        .insert({
          user_id: context.userId,
          occurred_at: new Date().toISOString(),
          place_cue: context.placeCue,
          sense_cues: context.senseCues,
          affect_valence: context.currentAffect?.valence,
          affect_arousal: context.currentAffect?.arousal,
          elemental_state: {
            fire: crystallization.fireAirAlignment,
            air: crystallization.fireAirAlignment,
            water: context.currentAffect?.valence ? (context.currentAffect.valence + 5) / 10 : 0.5,
            earth: context.currentCoherence || 0.5,
            aether: (crystallization.fireAirAlignment + (context.currentCoherence || 0.5)) / 2
          },
          scene_stanza: crystallization.suggestedStanza,
          sacred_flag: false
        })
        .select()
        .single();

      if (error || !data) {
        console.error('[ConversationMemoryIntegration] Error capturing episode:', error);
        return null;
      }

      // Generate embedding & links (async, non-blocking)
      const embeddingService = getEmbeddingService();
      const linkingService = getLinkingService();

      Promise.all([
        embeddingService.embedEpisode(data.id, {
          text: userMessage + '\n\n' + assistantResponse,
          stanza: crystallization.suggestedStanza,
          placeCue: context.placeCue,
          senseCues: context.senseCues
        }),
        linkingService.generateLinks(data.id, context.userId)
      ]).catch(err => {
        console.error('[ConversationMemoryIntegration] Error in post-capture tasks:', err);
      });

      console.log(`[ConversationMemoryIntegration] ✨ Captured crystallization moment: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('[ConversationMemoryIntegration] Error:', error);
      return null;
    }
  }

  /**
   * Check Fire-Air balance
   *
   * Only check every 5 minutes to avoid overhead
   * Provides guidance when imbalanced
   */
  async checkBalance(
    context: ConversationContext
  ): Promise<BalanceCheck | null> {
    try {
      // Throttle: only check every 5 minutes
      if (this.lastBalanceCheck) {
        const elapsed = Date.now() - this.lastBalanceCheck.getTime();
        if (elapsed < 5 * 60 * 1000) {
          return null;
        }
      }

      const teleologyService = getTeleologyService();
      const balance = await teleologyService.checkBalance({
        userId: context.userId,
        recentDays: 7
      });

      this.lastBalanceCheck = new Date();
      return balance;
    } catch (error) {
      console.error('[ConversationMemoryIntegration] Error checking balance:', error);
      return null;
    }
  }

  /**
   * Enrich MAIA's response with memory wisdom
   *
   * Subtly weaves in:
   * - Pattern recognition (if strong)
   * - Crystallization acknowledgment (if detected)
   * - Balance guidance (if needed)
   *
   * Air serves Fire, never dominates
   */
  async enrichResponse(
    originalResponse: string,
    context: ConversationContext,
    recognition: PatternRecognitionResult,
    crystallization: CrystallizationDetection,
    balance: BalanceCheck | null
  ): Promise<MemoryEnrichedResponse> {
    const enriched: MemoryEnrichedResponse = {
      originalResponse
    };

    // Pattern reflection (only if should mention)
    if (recognition.shouldMention && recognition.reflection) {
      enriched.patternReflection = `\n\n*[softly]* ${recognition.reflection}`;
    }

    // Crystallization note (Fire recognition)
    if (crystallization.isCrystallizing) {
      enriched.crystallizationNote = `\n\n✨ *Something crystallizing here...*`;
    }

    // Balance guidance (if imbalanced)
    if (balance && balance.imbalance && balance.recommendation) {
      const rec = balance.recommendation;

      if (balance.imbalance === 'projection_outruns_continuity') {
        enriched.balanceGuidance = `\n\n*[noticing]* Fire reaches ahead... ${rec.stanza}`;
      } else if (balance.imbalance === 'continuity_stalls_telos') {
        enriched.balanceGuidance = `\n\n*[sensing]* Rich continuity... what wants to emerge?`;
      }
    }

    return enriched;
  }

  /**
   * Extract teloi from conversation
   *
   * When user expresses future-pull, capture it
   */
  async extractTeloi(
    context: ConversationContext,
    conversationText: string
  ): Promise<number> {
    try {
      const teleologyService = getTeleologyService();
      const extraction = await teleologyService.extract({
        userId: context.userId,
        text: conversationText
      });

      return extraction.teloi.length;
    } catch (error) {
      console.error('[ConversationMemoryIntegration] Error extracting teloi:', error);
      return 0;
    }
  }
}

/**
 * Create singleton instance
 */
let conversationMemory: ConversationMemoryIntegration | null = null;

export function getConversationMemory(): ConversationMemoryIntegration {
  if (!conversationMemory) {
    conversationMemory = new ConversationMemoryIntegration();
  }
  return conversationMemory;
}
