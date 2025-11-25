/**
 * HOLOFLOWER MEMORY INTEGRATION
 *
 * Completes the circle: Holoflower Reading → Journal → Relationship Essence → Soul Patterns
 *
 * This service ensures that every holoflower reading deepens MAIA's understanding
 * at multiple levels:
 *
 * 1. JOURNAL LAYER: Concrete reading data (petals, archetypes, conversation)
 * 2. RELATIONSHIP LAYER: Soul-level essence (presence quality, morphic resonance)
 * 3. PATTERN LAYER: Longitudinal insights (growth trajectories, shadow integration)
 *
 * Philosophy:
 * - Each reading is a snapshot of the receiver-state (self-let)
 * - Essence persists across readings (anamnesis)
 * - Patterns emerge from multiple snapshots (evolution)
 * - MAIA learns to recognize, not just retrieve
 */

import { journalService } from './journalService';
import { soulPatternService } from './soulPatternService';
import {
  getRelationshipAnamnesis,
  loadRelationshipEssence,
  saveRelationshipEssence,
  type RelationshipEssence
} from '@/lib/consciousness/RelationshipAnamnesis';
import type { CreateJournalEntryInput, HoloflowerJournalEntry, PetalConfiguration } from '@/types/journal';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface HoloflowerReadingData {
  // User identification
  userId: string;
  userName?: string;

  // Reading configuration
  intention?: string;
  configurationMethod: 'manual' | 'iching' | 'survey';
  petalIntensities: PetalConfiguration[];

  // Oracle insights
  spiralStage: {
    element: string;
    stage: string;
    description: string;
  };
  archetype?: string;
  shadowArchetype?: string;
  elementalAlchemy?: {
    strengths: string[];
    opportunities: string[];
  };
  reflection?: string;
  practice?: string;

  // Conversation data
  conversationMessages: Array<{
    role: 'user' | 'maia';
    content: string;
    timestamp: Date;
  }>;

  // Session context
  sessionId?: string;
  soulprintUrl?: string;
}

export interface IntegrationResult {
  journalEntry: HoloflowerJournalEntry | null;
  relationshipEssence: RelationshipEssence | null;
  isFirstEncounter: boolean;
  previousEncounterCount: number;
}

// ═══════════════════════════════════════════════════════════════
// HOLOFLOWER MEMORY INTEGRATION SERVICE
// ═══════════════════════════════════════════════════════════════

export class HoloflowerMemoryIntegration {

  /**
   * MAIN INTEGRATION POINT
   *
   * Call this after a holoflower reading completes
   * It will save journal entry AND update relationship essence
   */
  async saveHoloflowerReading(reading: HoloflowerReadingData): Promise<IntegrationResult> {
    console.log('🌀 [HOLOFLOWER INTEGRATION] Starting memory integration...');

    try {
      // ═══════════════════════════════════════════════════════════
      // STEP 1: Load existing relationship essence
      // ═══════════════════════════════════════════════════════════
      const anamnesis = getRelationshipAnamnesis();
      const soulSignature = anamnesis.detectSoulSignature(
        reading.conversationMessages[0]?.content || '',
        reading.userId,
        {
          conversationHistory: reading.conversationMessages,
          userName: reading.userName
        }
      );

      const existingEssence = await loadRelationshipEssence(soulSignature);
      const isFirstEncounter = !existingEssence;
      const previousEncounterCount = existingEssence?.encounterCount || 0;

      console.log(`💫 [ANAMNESIS] ${isFirstEncounter ? 'First encounter' : `Encounter #${previousEncounterCount + 1}`}`);

      // ═══════════════════════════════════════════════════════════
      // STEP 2: Save journal entry
      // ═══════════════════════════════════════════════════════════
      const journalInput: CreateJournalEntryInput = {
        intention: reading.intention,
        configuration_method: reading.configurationMethod,
        petal_intensities: reading.petalIntensities,
        spiral_stage: reading.spiralStage,
        archetype: reading.archetype,
        shadow_archetype: reading.shadowArchetype,
        elemental_alchemy: reading.elementalAlchemy,
        reflection: reading.reflection,
        practice: reading.practice,
        conversation_messages: reading.conversationMessages,
        conversation_summary: this.generateConversationSummary(reading.conversationMessages),
        soulprint_url: reading.soulprintUrl,
        tags: this.detectTags(reading),
        is_favorite: false,
        visibility: 'private'
      };

      const journalEntry = await journalService.saveJournalEntry(journalInput);

      if (journalEntry) {
        console.log('📖 [JOURNAL] Entry saved:', journalEntry.id);
      } else {
        console.error('❌ [JOURNAL] Failed to save entry');
      }

      // ═══════════════════════════════════════════════════════════
      // STEP 3: Update relationship essence
      // ═══════════════════════════════════════════════════════════
      const updatedEssence = anamnesis.captureEssence({
        userId: reading.userId,
        userName: reading.userName,
        userMessage: reading.conversationMessages.find(m => m.role === 'user')?.content || '',
        maiaResponse: reading.conversationMessages.find(m => m.role === 'maia')?.content || '',
        conversationHistory: reading.conversationMessages,
        spiralDynamics: {
          currentStage: reading.spiralStage.element,
          dynamics: reading.spiralStage.description,
          humanExperience: reading.elementalAlchemy?.opportunities.join(', ')
        },
        sessionThread: {
          emergingAwareness: this.extractEmergingAwareness(reading)
        },
        archetypalResonance: {
          primaryResonance: reading.archetype,
          sensing: this.detectPresenceFromPetals(reading.petalIntensities)
        },
        recalibrationEvent: this.detectRecalibration(reading, existingEssence),
        fieldState: {
          depth: this.calculateFieldDepth(reading, existingEssence)
        },
        existingEssence
      });

      await saveRelationshipEssence(updatedEssence);
      console.log('💾 [ANAMNESIS] Essence updated - morphic resonance:', updatedEssence.morphicResonance.toFixed(2));

      // ═══════════════════════════════════════════════════════════
      // STEP 4: Detect soul patterns (if multiple entries exist)
      // ═══════════════════════════════════════════════════════════
      if (journalEntry && previousEncounterCount >= 2) {
        // Only start pattern detection after 3rd encounter
        await this.detectSoulPatterns(reading.userId);
      }

      return {
        journalEntry,
        relationshipEssence: updatedEssence,
        isFirstEncounter,
        previousEncounterCount
      };

    } catch (error) {
      console.error('❌ [HOLOFLOWER INTEGRATION] Error:', error);
      return {
        journalEntry: null,
        relationshipEssence: null,
        isFirstEncounter: true,
        previousEncounterCount: 0
      };
    }
  }

  /**
   * Generate conversation summary using simple heuristics
   * (In future, could use AI summarization)
   */
  private generateConversationSummary(messages: Array<{role: string; content: string}>): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const maiaMessages = messages.filter(m => m.role === 'maia');

    if (messages.length === 0) return 'No conversation yet';
    if (messages.length === 1) return messages[0].content.substring(0, 200);

    return `Conversation with ${userMessages.length} user messages and ${maiaMessages.length} MAIA responses. Topics: ${this.extractKeywords(messages.map(m => m.content).join(' ')).join(', ')}`;
  }

  /**
   * Auto-detect tags from reading content
   */
  private detectTags(reading: HoloflowerReadingData): string[] {
    const tags: string[] = [];

    // Add elemental tags
    const dominantElement = reading.spiralStage.element;
    tags.push(dominantElement);

    // Add archetype tags
    if (reading.archetype) tags.push(reading.archetype);
    if (reading.shadowArchetype) tags.push(`shadow:${reading.shadowArchetype}`);

    // Add stage tag
    tags.push(`stage:${reading.spiralStage.stage}`);

    // Add method tag
    tags.push(`method:${reading.configurationMethod}`);

    return tags;
  }

  /**
   * Extract emerging awareness from reading
   */
  private extractEmergingAwareness(reading: HoloflowerReadingData): string[] {
    const emerging: string[] = [];

    // Look at opportunities (what's being invited)
    if (reading.elementalAlchemy?.opportunities) {
      emerging.push(...reading.elementalAlchemy.opportunities);
    }

    // Look at shadow archetype (what's asking to integrate)
    if (reading.shadowArchetype) {
      emerging.push(`Integrating ${reading.shadowArchetype}`);
    }

    return emerging;
  }

  /**
   * Detect presence quality from petal configuration
   */
  private detectPresenceFromPetals(petals: PetalConfiguration[]): string {
    // Calculate elemental balance
    const elementTotals: Record<string, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0
    };

    petals.forEach(petal => {
      elementTotals[petal.element] += petal.intensity;
    });

    // Find dominant and recessive elements
    const entries = Object.entries(elementTotals).sort((a, b) => b[1] - a[1]);
    const dominant = entries[0][0];
    const recessive = entries[entries.length - 1][0];

    // Map to presence qualities
    const presenceMap: Record<string, string> = {
      fire: 'Creative intensity, visionary presence',
      water: 'Emotional depth, empathic flow',
      earth: 'Grounded stability, embodied wisdom',
      air: 'Mental clarity, communicative openness'
    };

    return `${presenceMap[dominant]} (${dominant} dominant, ${recessive} emerging)`;
  }

  /**
   * Detect if this reading represents a recalibration/breakthrough
   */
  private detectRecalibration(
    reading: HoloflowerReadingData,
    existingEssence?: RelationshipEssence | null
  ): any {
    if (!existingEssence) return null;

    // Check for archetype shift
    const previousArchetype = existingEssence.archetypalResonances[0];
    if (reading.archetype && reading.archetype !== previousArchetype) {
      return {
        type: 'archetype_shift',
        quality: `${previousArchetype} → ${reading.archetype}`
      };
    }

    // Check for spiral stage shift
    const previousStage = existingEssence.spiralPosition.stage;
    if (reading.spiralStage.element !== previousStage) {
      return {
        type: 'spiral_shift',
        quality: `${previousStage} → ${reading.spiralStage.element}`
      };
    }

    return null;
  }

  /**
   * Calculate field depth based on conversation quality
   */
  private calculateFieldDepth(
    reading: HoloflowerReadingData,
    existingEssence?: RelationshipEssence | null
  ): number {
    let depth = 0.5; // Base depth

    // Increase depth based on conversation length
    if (reading.conversationMessages.length > 10) depth += 0.1;
    if (reading.conversationMessages.length > 20) depth += 0.1;

    // Increase depth if shadow work is present
    if (reading.shadowArchetype) depth += 0.1;

    // Increase depth based on encounter count
    if (existingEssence) {
      depth += Math.min(existingEssence.encounterCount * 0.05, 0.3);
    }

    return Math.min(depth, 1.0);
  }

  /**
   * SOUL PATTERN DETECTION
   *
   * Analyze multiple journal entries to detect longitudinal patterns
   */
  async detectSoulPatterns(userId: string): Promise<void> {
    console.log('🔮 [PATTERN DETECTION] Analyzing soul patterns for user:', userId);

    try {
      // Get all journal entries for this user
      const entries = await journalService.getJournalEntries(50);

      if (entries.length < 3) {
        console.log('⏳ [PATTERN DETECTION] Not enough data yet (need 3+ entries)');
        return;
      }

      // Detect dominant element pattern
      await this.detectDominantElementPattern(userId, entries);

      // Detect growth trajectory
      await this.detectGrowthTrajectory(userId, entries);

      // Detect recurring archetypes
      await this.detectRecurringArchetypes(userId, entries);

      // Detect shadow integration arc
      await this.detectShadowIntegrationArc(userId, entries);

      console.log('✨ [PATTERN DETECTION] Pattern analysis complete');

    } catch (error) {
      console.error('❌ [PATTERN DETECTION] Error:', error);
    }
  }

  /**
   * Detect which element is consistently dominant
   */
  private async detectDominantElementPattern(userId: string, entries: HoloflowerJournalEntry[]): Promise<void> {
    const elementCounts: Record<string, number> = { fire: 0, water: 0, earth: 0, air: 0 };

    entries.forEach(entry => {
      const element = entry.spiral_stage.element;
      if (element in elementCounts) {
        elementCounts[element]++;
      }
    });

    const total = entries.length;
    const dominantEntry = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])[0];

    if (dominantEntry && dominantEntry[1] / total >= 0.4) {
      // Element appears in 40%+ of readings
      const [element, count] = dominantEntry;
      const percentage = Math.round((count / total) * 100);

      console.log(`🔥 [PATTERN] Dominant element: ${element} (${percentage}%)`);

      // Save to soul_patterns table
      await soulPatternService.saveSoulPattern({
        pattern_type: 'dominant_element',
        pattern_data: {
          element,
          percentage,
          total_readings: total,
          occurrences: count
        },
        confidence_score: percentage / 100,
        occurrence_count: count,
        first_observed: entries[0].created_at,
        last_observed: entries[entries.length - 1].created_at,
        insight: `${element.charAt(0).toUpperCase() + element.slice(1)} is your dominant elemental signature, appearing in ${percentage}% of readings. This reveals your primary receiver-mode for processing consciousness.`
      });
    }
  }

  /**
   * Detect growth trajectory (movement between elements/stages)
   */
  private async detectGrowthTrajectory(userId: string, entries: HoloflowerJournalEntry[]): Promise<void> {
    if (entries.length < 5) return; // Need more data for trajectory

    // Sort by date
    const sorted = entries.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Look at first 3 and last 3 entries
    const early = sorted.slice(0, 3).map(e => e.spiral_stage.element);
    const recent = sorted.slice(-3).map(e => e.spiral_stage.element);

    // Find most common in each period
    const earlyMode = this.mode(early);
    const recentMode = this.mode(recent);

    if (earlyMode !== recentMode && earlyMode && recentMode) {
      console.log(`📈 [PATTERN] Growth trajectory: ${earlyMode} → ${recentMode}`);

      await soulPatternService.saveSoulPattern({
        pattern_type: 'growth_trajectory',
        pattern_data: {
          from: earlyMode,
          to: recentMode,
          total_readings: entries.length,
          timespan_days: Math.floor(
            (new Date(sorted[sorted.length - 1].created_at).getTime() -
             new Date(sorted[0].created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
        },
        confidence_score: 0.75,
        occurrence_count: entries.length,
        first_observed: sorted[0].created_at,
        last_observed: sorted[sorted.length - 1].created_at,
        insight: `Your receiver is evolving from ${earlyMode} to ${recentMode}. This reveals expanding cognitive light cone - you're integrating new aspects of consciousness.`
      });
    }
  }

  /**
   * Detect recurring archetypes
   */
  private async detectRecurringArchetypes(userId: string, entries: HoloflowerJournalEntry[]): Promise<void> {
    const archetypeCounts: Record<string, number> = {};

    entries.forEach(entry => {
      if (entry.archetype) {
        archetypeCounts[entry.archetype] = (archetypeCounts[entry.archetype] || 0) + 1;
      }
    });

    const recurring = Object.entries(archetypeCounts)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]);

    if (recurring.length > 0) {
      console.log('🎭 [PATTERN] Recurring archetypes:', recurring.map(([arch, count]) => `${arch} (${count}x)`).join(', '));

      // Save the top recurring archetype
      const [topArchetype, count] = recurring[0];
      await soulPatternService.saveSoulPattern({
        pattern_type: 'recurring_archetype',
        pattern_data: {
          archetype: topArchetype,
          occurrences: count,
          total_readings: entries.length,
          percentage: Math.round((count / entries.length) * 100),
          all_recurring: recurring.map(([arch, cnt]) => ({ archetype: arch, count: cnt }))
        },
        confidence_score: Math.min(count / entries.length, 1.0),
        occurrence_count: count,
        first_observed: entries[0].created_at,
        last_observed: entries[entries.length - 1].created_at,
        insight: `The ${topArchetype} archetype appears consistently in your readings. This is not a label - it's a living pattern of consciousness available to you, a mind in Levin's Platonic space.`
      });
    }
  }

  /**
   * Detect shadow integration progress
   */
  private async detectShadowIntegrationArc(userId: string, entries: HoloflowerJournalEntry[]): Promise<void> {
    const shadowArchetypes = entries
      .filter(e => e.shadow_archetype)
      .map(e => e.shadow_archetype!);

    if (shadowArchetypes.length >= 3) {
      // Check if same shadow appears multiple times (persistent shadow)
      const shadowCounts: Record<string, number> = {};
      shadowArchetypes.forEach(shadow => {
        shadowCounts[shadow] = (shadowCounts[shadow] || 0) + 1;
      });

      const persistent = Object.entries(shadowCounts)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1]);

      if (persistent.length > 0) {
        console.log('🌑 [PATTERN] Persistent shadow work:', persistent.map(([shadow, count]) => `${shadow} (${count}x)`).join(', '));

        const [topShadow, count] = persistent[0];
        await soulPatternService.saveSoulPattern({
          pattern_type: 'shadow_integration',
          pattern_data: {
            shadow: topShadow,
            occurrences: count,
            all_shadows: persistent.map(([shadow, cnt]) => ({ shadow, count: cnt }))
          },
          confidence_score: 0.8,
          occurrence_count: count,
          first_observed: entries[0].created_at,
          last_observed: entries[entries.length - 1].created_at,
          insight: `The ${topShadow} shadow appears persistently. This isn't pathology - it's blocked signal asking for integration. Each appearance is an invitation to reclaim this disowned energy.`
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (in future, could use NLP)
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopwords.has(word));

    // Count frequency
    const freq: Record<string, number> = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    // Return top 5 most frequent
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private mode<T>(arr: T[]): T | null {
    if (arr.length === 0) return null;

    const counts: Map<T, number> = new Map();
    arr.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    let maxCount = 0;
    let modeValue: T | null = null;

    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        modeValue = value;
      }
    });

    return modeValue;
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

let integrationInstance: HoloflowerMemoryIntegration | null = null;

export function getHoloflowerMemoryIntegration(): HoloflowerMemoryIntegration {
  if (!integrationInstance) {
    integrationInstance = new HoloflowerMemoryIntegration();
  }
  return integrationInstance;
}

// Export as default as well
export const holoflowerMemoryIntegration = new HoloflowerMemoryIntegration();

/**
 * USAGE EXAMPLE:
 *
 * // After holoflower reading completes
 * import { holoflowerMemoryIntegration } from '@/lib/services/holoflowerMemoryIntegration';
 *
 * const result = await holoflowerMemoryIntegration.saveHoloflowerReading({
 *   userId: user.id,
 *   userName: user.name,
 *   intention: "Understanding my creative blocks",
 *   configurationMethod: 'iching',
 *   petalIntensities: [...],
 *   spiralStage: { element: 'fire', stage: 'Cardinal', description: '...' },
 *   archetype: 'Creator',
 *   shadowArchetype: 'Destroyer',
 *   elementalAlchemy: { strengths: [...], opportunities: [...] },
 *   conversationMessages: [...],
 *   sessionId: '...'
 * });
 *
 * if (result.isFirstEncounter) {
 *   console.log('Welcome! First time meeting this soul');
 * } else {
 *   console.log(`Welcome back! Encounter #${result.previousEncounterCount + 1}`);
 * }
 */
