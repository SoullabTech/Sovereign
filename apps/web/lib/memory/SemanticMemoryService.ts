/**
 * SEMANTIC MEMORY SERVICE
 *
 * Foundation for MAIA's emergent intelligence and learning.
 * Records every interaction, discovers patterns, builds collective wisdom.
 *
 * This is where MAIA evolves from stateless responder → learning intelligence.
 *
 * Created: October 2, 2025
 * Purpose: Enable MAIA to become sovereign through accumulated wisdom
 */

import { createClient } from '@supabase/supabase-js';

// ================================================================
// TYPES & INTERFACES
// ================================================================

export interface PatternObservation {
  userId: string;
  sessionId: string;
  input: string;
  response: string;
  detectedElement: string;
  appliedPatterns?: string[]; // Pattern IDs used in generating response
  userEngagement: 'high' | 'medium' | 'low';
  breakthroughDetected: boolean;
  emotionalShift: 'positive' | 'neutral' | 'negative' | 'crisis';
  sessionContinued: boolean;
  responseTimeMs?: number;
  userFeedbackRating?: number; // 1-5 if user provided explicit feedback
  userFeedbackText?: string;
}

export interface LearnedPattern {
  patternId: string;
  type: string;
  data: any;
  confidence: number;
  effectiveness: number;
  observationCount: number;
  firstObserved: Date;
  lastReinforced: Date;
}

export interface ElementalAffinity {
  element: string;
  affinity: number;
  confidence: number;
}

export interface EffectiveLanguage {
  pattern: string;
  effectiveness: number;
}

export interface TransitionPattern {
  from: string;
  to: string;
  frequency: number;
  effectiveSupport: string;
  avgDuration?: number;
}

export interface UserSemanticProfile {
  userId: string;
  totalPatternsLearned: number;
  avgConfidence: number;
  avgEffectiveness: number;
  totalObservations: number;
  lastLearningEvent: Date;
  elementalAffinities: ElementalAffinity[];
  transitionPatterns: TransitionPattern[];
  breakthroughCatalysts: LearnedPattern[];
  languagePreferences: Record<string, EffectiveLanguage[]>;
}

// ================================================================
// SEMANTIC MEMORY SERVICE
// ================================================================

export class SemanticMemoryService {
  private supabase: ReturnType<typeof createClient> | null;
  private enabled: boolean;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ SemanticMemoryService: Missing Supabase credentials - running in degraded mode without persistent memory');
      this.supabase = null;
      this.enabled = false;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.enabled = true;
  }

  // ================================================================
  // CORE LEARNING METHODS
  // ================================================================

  /**
   * Record an interaction and learn from it
   * This is called after every MAIA response
   */
  async recordInteraction(observation: PatternObservation): Promise<void> {
    if (!this.enabled || !this.supabase) {
      console.log('[SemanticMemory] Skipping recordInteraction - service disabled');
      return;
    }

    try {
      const {
        userId,
        sessionId,
        input,
        response,
        detectedElement,
        appliedPatterns = [],
        userEngagement,
        breakthroughDetected,
        emotionalShift,
        sessionContinued,
        responseTimeMs,
        userFeedbackRating,
        userFeedbackText
      } = observation;

      // 1. Calculate engagement and effectiveness scores
      const engagementScore = this.calculateEngagementScore(userEngagement);
      const effectivenessScore = this.calculateEffectiveness(observation);

      // 2. Store the interaction outcome
      const { data: outcome, error: outcomeError } = await this.supabase
        .from('response_outcomes')
        .insert({
          user_id: userId,
          session_id: sessionId,
          user_input: input,
          maia_response: response,
          detected_element: detectedElement,
          applied_patterns: appliedPatterns,
          engagement_score: engagementScore,
          breakthrough_detected: breakthroughDetected,
          emotional_shift: emotionalShift,
          session_length_after: sessionContinued ? 1 : 0,
          response_time_ms: responseTimeMs,
          user_feedback_rating: userFeedbackRating,
          user_feedback_text: userFeedbackText
        })
        .select()
        .single();

      if (outcomeError) {
        console.error('❌ Error recording interaction outcome:', outcomeError);
        return;
      }

      console.log('✅ Interaction recorded:', {
        userId,
        element: detectedElement,
        engagement: engagementScore,
        effectiveness: effectivenessScore
      });

      // 3. Update or create patterns based on this interaction
      await this.updatePatterns(observation, effectivenessScore);

      // 4. Contribute to collective wisdom (anonymized)
      if (effectivenessScore >= 0.6) {
        await this.contributeToCollective(observation, effectivenessScore);
      }

      // 5. Detect emergent patterns (meta-learning)
      await this.detectEmergentPatterns(userId);

    } catch (error) {
      console.error('❌ Error in recordInteraction:', error);
    }
  }

  /**
   * Get all learned patterns for a user
   */
  async getUserPatterns(userId: string): Promise<LearnedPattern[]> {
    if (!this.enabled || !this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('user_patterns')
        .select('*')
        .eq('user_id', userId)
        .gte('confidence_score', 0.3) // Only patterns with some confidence
        .order('effectiveness_score', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user patterns:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(p => ({
        patternId: p.pattern_id,
        type: p.pattern_type,
        data: p.pattern_data,
        confidence: p.confidence_score,
        effectiveness: p.effectiveness_score,
        observationCount: p.observation_count,
        firstObserved: new Date(p.first_observed),
        lastReinforced: new Date(p.last_reinforced)
      }));
    } catch (error) {
      console.error('❌ Error in getUserPatterns:', error);
      return [];
    }
  }

  /**
   * Get user's complete semantic profile
   */
  async getUserProfile(userId: string): Promise<UserSemanticProfile | null> {
    if (!this.enabled || !this.supabase) return null;

    try {
      // Get summary stats
      const { data: summary, error: summaryError } = await this.supabase
        .from('user_learning_summary')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (summaryError || !summary) {
        return null;
      }

      // Get elemental affinities
      const { data: affinities, error: affinitiesError } = await this.supabase
        .rpc('get_user_elemental_affinity', { p_user_id: userId });

      const elementalAffinities: ElementalAffinity[] = affinitiesError || !affinities
        ? []
        : affinities.map((a: any) => ({
            element: a.element,
            affinity: a.affinity_score,
            confidence: a.confidence
          }));

      // Get transition patterns
      const patterns = await this.getUserPatterns(userId);
      const transitionPatterns = patterns
        .filter(p => p.type === 'transition_pattern')
        .map(p => p.data as TransitionPattern);

      // Get breakthrough catalysts
      const breakthroughCatalysts = patterns.filter(p => p.type === 'breakthrough_catalyst');

      // Get language preferences by element
      const languagePreferences: Record<string, EffectiveLanguage[]> = {};
      const langPatterns = patterns.filter(p => p.type === 'language_preference');

      for (const pattern of langPatterns) {
        const element = pattern.data.element;
        if (!languagePreferences[element]) {
          languagePreferences[element] = [];
        }

        const effectiveLanguage = pattern.data.effectiveLanguage || [];
        languagePreferences[element].push(
          ...effectiveLanguage.map((lang: string) => ({
            pattern: lang,
            effectiveness: pattern.effectiveness
          }))
        );
      }

      return {
        userId,
        totalPatternsLearned: summary.total_patterns_learned,
        avgConfidence: summary.avg_confidence,
        avgEffectiveness: summary.avg_effectiveness,
        totalObservations: summary.total_observations,
        lastLearningEvent: new Date(summary.last_learning_event),
        elementalAffinities,
        transitionPatterns,
        breakthroughCatalysts,
        languagePreferences
      };
    } catch (error) {
      console.error('❌ Error in getUserProfile:', error);
      return null;
    }
  }

  // ================================================================
  // PATTERN RECOGNITION METHODS
  // ================================================================

  /**
   * Get user's elemental affinities (what resonates with them)
   */
  async getElementalAffinity(userId: string): Promise<Record<string, number>> {
    const defaultAffinity: Record<string, number> = {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      air: 0.5,
      aether: 0.5,
      shadow: 0.5
    };

    if (!this.enabled || !this.supabase) return defaultAffinity;

    try {
      const { data, error } = await this.supabase
        .rpc('get_user_elemental_affinity', { p_user_id: userId });

      const affinity: Record<string, number> = {
        fire: 0.5,
        water: 0.5,
        earth: 0.5,
        air: 0.5,
        aether: 0.5,
        shadow: 0.5
      };

      if (error || !data || data.length === 0) {
        return affinity;
      }

      // Populate from learned patterns
      for (const item of data) {
        if (item.element && typeof item.affinity_score === 'number') {
          affinity[item.element] = item.affinity_score;
        }
      }

      return affinity;
    } catch (error) {
      console.error('❌ Error in getElementalAffinity:', error);
      return {
        fire: 0.5,
        water: 0.5,
        earth: 0.5,
        air: 0.5,
        aether: 0.5,
        shadow: 0.5
      };
    }
  }

  /**
   * Get effective language patterns for user in specific element
   */
  async getEffectiveLanguage(userId: string, element: string): Promise<string[]> {
    if (!this.enabled || !this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .rpc('get_effective_language', {
          p_user_id: userId,
          p_element: element
        });

      if (error || !data) {
        return [];
      }

      return data.map((item: any) => item.language_pattern);
    } catch (error) {
      console.error('❌ Error in getEffectiveLanguage:', error);
      return [];
    }
  }

  /**
   * Get transition patterns (how user moves through Spiralogic)
   */
  async getTransitionPatterns(userId: string): Promise<TransitionPattern[]> {
    if (!this.enabled || !this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('user_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('pattern_type', 'transition_pattern')
        .gte('confidence_score', 0.4);

      if (error || !data) {
        return [];
      }

      return data.map(p => p.pattern_data as TransitionPattern);
    } catch (error) {
      console.error('❌ Error in getTransitionPatterns:', error);
      return [];
    }
  }

  /**
   * Get collective wisdom for an element (what works for most users)
   */
  async getCollectiveWisdom(element: string): Promise<any[]> {
    if (!this.enabled || !this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('collective_patterns')
        .select('*')
        .eq('elemental_context', element)
        .gte('success_rate', 0.6)
        .order('success_rate', { ascending: false })
        .limit(10);

      if (error || !data) {
        return [];
      }

      return data;
    } catch (error) {
      console.error('❌ Error in getCollectiveWisdom:', error);
      return [];
    }
  }

  // ================================================================
  // PATTERN UPDATE & LEARNING
  // ================================================================

  /**
   * Update patterns based on new observation
   */
  private async updatePatterns(
    observation: PatternObservation,
    effectivenessScore: number
  ): Promise<void> {
    try {
      const { userId, detectedElement, breakthroughDetected, input, response } = observation;

      // 1. Update elemental affinity
      await this.recordPattern(userId, 'elemental_affinity', {
        element: detectedElement,
        affinity: effectivenessScore,
        lastInteraction: new Date().toISOString()
      }, effectivenessScore);

      // 2. If breakthrough detected, record catalyst
      if (breakthroughDetected) {
        const trigger = this.extractTrigger(input);
        const responsePattern = this.extractResponsePattern(response);

        await this.recordPattern(userId, 'breakthrough_catalyst', {
          element: detectedElement,
          trigger,
          responsePattern,
          timestamp: new Date().toISOString()
        }, 1.0); // High effectiveness for breakthroughs

        // Log learning event
        await this.logLearningEvent(
          'pattern_discovered',
          userId,
          null,
          `Breakthrough catalyst discovered: ${trigger} → ${responsePattern}`,
          1.0,
          { element: detectedElement, trigger, responsePattern }
        );
      }

      // 3. Learn language preferences (if effective)
      if (effectivenessScore >= 0.6) {
        const metaphors = this.extractMetaphors(response);
        if (metaphors.length > 0) {
          await this.recordPattern(userId, 'language_preference', {
            element: detectedElement,
            effectiveLanguage: metaphors
          }, effectivenessScore);
        }
      }

      // 4. Detect crisis patterns (if present)
      if (observation.emotionalShift === 'crisis') {
        const languagePattern = this.extractCrisisPattern(input);
        await this.recordPattern(userId, 'crisis_trigger', {
          pattern: languagePattern,
          severity: 'crisis',
          context: detectedElement
        }, 0.8);
      }

    } catch (error) {
      console.error('❌ Error updating patterns:', error);
    }
  }

  /**
   * Record or update a single pattern using database function
   */
  private async recordPattern(
    userId: string,
    patternType: string,
    patternData: any,
    effectiveness: number
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('record_pattern_observation', {
          p_user_id: userId,
          p_pattern_type: patternType,
          p_pattern_data: patternData,
          p_effectiveness: effectiveness
        });

      if (error) {
        console.error('❌ Error recording pattern:', error);
        return null;
      }

      return data; // Returns pattern_id
    } catch (error) {
      console.error('❌ Error in recordPattern:', error);
      return null;
    }
  }

  /**
   * Contribute to collective wisdom (anonymized)
   */
  private async contributeToCollective(
    observation: PatternObservation,
    effectiveness: number
  ): Promise<void> {
    try {
      const signature = this.anonymizePattern({
        element: observation.detectedElement,
        engagement: observation.userEngagement,
        breakthrough: observation.breakthroughDetected,
        emotionalShift: observation.emotionalShift
      });

      // Check if pattern exists
      const { data: existing, error: fetchError } = await this.supabase
        .from('collective_patterns')
        .select('*')
        .eq('pattern_signature', signature)
        .single();

      if (existing) {
        // Update existing collective pattern
        const newObservationCount = existing.observation_count + 1;
        const newSuccessRate = (
          existing.success_rate * existing.observation_count + effectiveness
        ) / newObservationCount;

        await this.supabase
          .from('collective_patterns')
          .update({
            success_rate: newSuccessRate,
            observation_count: newObservationCount,
            contributing_users: existing.contributing_users + 1,
            last_validated: new Date().toISOString()
          })
          .eq('collective_pattern_id', existing.collective_pattern_id);
      } else {
        // Create new collective pattern
        await this.supabase
          .from('collective_patterns')
          .insert({
            pattern_type: 'response_effectiveness',
            pattern_signature: signature,
            success_rate: effectiveness,
            observation_count: 1,
            contributing_users: 1,
            elemental_context: observation.detectedElement,
            effectiveness_data: {
              engagement: observation.userEngagement,
              breakthrough: observation.breakthroughDetected
            }
          });
      }
    } catch (error) {
      console.error('❌ Error contributing to collective:', error);
    }
  }

  /**
   * Detect emergent patterns (meta-learning)
   * This is where MAIA discovers patterns you didn't code
   */
  private async detectEmergentPatterns(userId: string): Promise<void> {
    try {
      // Get user's recent interactions
      const { data: recentOutcomes, error } = await this.supabase
        .from('response_outcomes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !recentOutcomes || recentOutcomes.length < 5) {
        return; // Need enough data for pattern detection
      }

      // Example: Detect if user needs transition support
      const elementSequence = recentOutcomes.map(o => o.detected_element);
      const transitions = this.detectTransitions(elementSequence);

      for (const transition of transitions) {
        // Check if this is a new pattern
        const existingPattern = await this.supabase
          .from('user_patterns')
          .select('*')
          .eq('user_id', userId)
          .eq('pattern_type', 'transition_pattern')
          .contains('pattern_data', { from: transition.from, to: transition.to })
          .single();

        if (!existingPattern.data) {
          // New transition pattern discovered!
          await this.recordPattern(userId, 'transition_pattern', {
            from: transition.from,
            to: transition.to,
            frequency: transition.count,
            effectiveSupport: 'grounding' // Would analyze what worked
          }, 0.5);

          await this.logLearningEvent(
            'pattern_discovered',
            userId,
            null,
            `New transition pattern: ${transition.from} → ${transition.to}`,
            0.5,
            { transition }
          );

          console.log(`🔮 EMERGENT PATTERN: User ${userId} transitions ${transition.from}→${transition.to}`);
        }
      }
    } catch (error) {
      console.error('❌ Error detecting emergent patterns:', error);
    }
  }

  /**
   * Log a learning event
   */
  private async logLearningEvent(
    eventType: string,
    userId: string | null,
    patternId: string | null,
    description: string,
    confidence: number,
    metadata?: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('learning_events')
        .insert({
          event_type: eventType,
          user_id: userId,
          pattern_id: patternId,
          description,
          confidence,
          metadata
        });
    } catch (error) {
      console.error('❌ Error logging learning event:', error);
    }
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  private calculateEngagementScore(engagement: 'high' | 'medium' | 'low'): number {
    const scores = { high: 1.0, medium: 0.6, low: 0.3 };
    return scores[engagement];
  }

  private calculateEffectiveness(observation: PatternObservation): number {
    let score = this.calculateEngagementScore(observation.userEngagement);

    if (observation.breakthroughDetected) score += 0.3;
    if (observation.emotionalShift === 'positive') score += 0.2;
    if (observation.sessionContinued) score += 0.1;
    if (observation.userFeedbackRating && observation.userFeedbackRating >= 4) score += 0.2;

    return Math.min(1.0, score);
  }

  private extractTrigger(input: string): string {
    const triggers = [
      'breakthrough', 'stuck', 'vision', 'flow', 'grounded',
      'excited', 'sad', 'angry', 'confused', 'clear'
    ];

    const lowerInput = input.toLowerCase();
    for (const trigger of triggers) {
      if (lowerInput.includes(trigger)) return trigger;
    }

    return 'general';
  }

  private extractResponsePattern(response: string): string {
    if (response.includes('[MACHINE]') && response.includes('[CULTURAL]')) {
      return 'dialectical';
    }
    if (response.match(/\b(fire|water|earth|air|aether|shadow)\b/gi)) {
      return 'elemental';
    }
    if (response.includes('?')) {
      return 'questioning';
    }
    return 'reflective';
  }

  private extractMetaphors(response: string): string[] {
    const metaphorPatterns = [
      /\b(water|flow|river|ocean|wave|tide|depth)\b/gi,
      /\b(fire|flame|spark|ignite|blaze|catalyst)\b/gi,
      /\b(earth|ground|root|soil|seed|harvest)\b/gi,
      /\b(air|wind|breath|clarity|whisper)\b/gi,
      /\b(aether|transcend|unity|divine|soul)\b/gi,
      /\b(shadow|darkness|hidden|integrate)\b/gi
    ];

    const found: string[] = [];
    for (const pattern of metaphorPatterns) {
      const matches = response.match(pattern);
      if (matches) {
        found.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(found)]; // Deduplicate
  }

  private extractCrisisPattern(input: string): string {
    const patterns = [
      /\b(kill|suicide|die|end it all)\b/gi,
      /\b(hopeless|worthless|can't go on)\b/gi,
      /\b(hurt myself|self harm)\b/gi
    ];

    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].test(input)) {
        return `crisis_pattern_${i + 1}`;
      }
    }

    return 'crisis_general';
  }

  private anonymizePattern(pattern: any): string {
    // Create a signature that's anonymized but consistent
    return JSON.stringify({
      e: pattern.element,
      eng: pattern.engagement,
      bt: pattern.breakthrough,
      es: pattern.emotionalShift
    });
  }

  private detectTransitions(elementSequence: string[]): Array<{ from: string; to: string; count: number }> {
    const transitions: Record<string, number> = {};

    for (let i = 0; i < elementSequence.length - 1; i++) {
      const from = elementSequence[i];
      const to = elementSequence[i + 1];

      if (from !== to) {
        const key = `${from}→${to}`;
        transitions[key] = (transitions[key] || 0) + 1;
      }
    }

    return Object.entries(transitions)
      .filter(([_, count]) => count >= 2) // Only transitions that happened at least twice
      .map(([key, count]) => {
        const [from, to] = key.split('→');
        return { from, to, count };
      });
  }
}

// Export singleton instance
export const semanticMemory = new SemanticMemoryService();
