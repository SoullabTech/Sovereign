// @ts-nocheck - Field protocol prototype, not type-checked
/**
 * Field Records Service - Sacred Laboratory Storage Layer
 *
 * Manages the persistence and retrieval of Field Records,
 * integrating with PostgreSQL for storage and the Brain Trust
 * for consciousness observation.
 */

import type {
  FieldRecord,
  ElementType,
  PhaseType,
  PrivacyLevel,
  UserFieldPattern,
  FieldRecordContext,
  CommunityReflection,
} from './types';
import { FieldRecordsRepo } from './storage/FieldRecordsRepo';

export class FieldRecordsService {
  /**
   * Create or update a Field Record
   */
  async saveFieldRecord(
    record: Partial<FieldRecord>,
    userId: string
  ): Promise<FieldRecord> {
    const saved = await FieldRecordsRepo.upsert(record, userId);

    if (!saved) {
      throw new Error('Failed to save field record');
    }

    // Trigger Brain Trust processing if record is complete enough
    if (saved.completionStage >= 3) {
      await this.notifyBrainTrust(saved);
    }

    return saved;
  }

  /**
   * Get Field Records for a user
   */
  async getUserFieldRecords(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      privacyFilter?: PrivacyLevel[];
      elementFilter?: ElementType[];
      phaseFilter?: PhaseType[];
      completionStageMin?: number;
    }
  ): Promise<FieldRecord[]> {
    let records = await FieldRecordsRepo.getUserRecords(userId, {
      limit: options?.limit,
      offset: options?.offset,
      privacyFilter: options?.privacyFilter,
      completionStageMin: options?.completionStageMin,
    });

    // Filter by elements and phases in post-processing
    if (options?.elementFilter) {
      records = records.filter(
        (record) =>
          record.interpretation?.primaryElement &&
          options.elementFilter!.includes(record.interpretation.primaryElement)
      );
    }

    if (options?.phaseFilter) {
      records = records.filter(
        (record) =>
          record.interpretation?.currentPhase &&
          options.phaseFilter!.includes(record.interpretation.currentPhase)
      );
    }

    return records;
  }

  /**
   * Get public Field Records from the Commons
   */
  async getCommonsRecords(options?: {
    limit?: number;
    elementFilter?: ElementType[];
    sortBy?: 'recent' | 'resonance' | 'completion';
  }): Promise<FieldRecord[]> {
    let records = await FieldRecordsRepo.getCommonsRecords({
      limit: options?.limit,
      sortBy: options?.sortBy,
    });

    // Filter by elements in post-processing
    if (options?.elementFilter) {
      records = records.filter(
        (record) =>
          record.interpretation?.primaryElement &&
          options.elementFilter!.includes(record.interpretation.primaryElement)
      );
    }

    return records;
  }

  /**
   * Add community reflection to a Field Record
   */
  async addCommunityReflection(
    recordId: string,
    reflection: Omit<CommunityReflection, 'id' | 'timestamp'>
  ): Promise<void> {
    const engagement = await FieldRecordsRepo.getCommunityEngagement(recordId);

    if (!engagement) {
      throw new Error('Field record not found');
    }

    const newReflection: CommunityReflection = {
      ...reflection,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    const updatedEngagement = {
      ...engagement,
      reflections: [...(engagement.reflections || []), newReflection],
    };

    await FieldRecordsRepo.updateCommunityEngagement(
      recordId,
      updatedEngagement
    );
  }

  /**
   * Mark resonance with a Field Record
   */
  async markResonance(recordId: string, userId: string): Promise<void> {
    const engagement = await FieldRecordsRepo.getCommunityEngagement(recordId);

    if (!engagement) {
      throw new Error('Field record not found');
    }

    const updatedEngagement = {
      ...engagement,
      resonanceMarkers: (engagement.resonanceMarkers || 0) + 1,
    };

    await FieldRecordsRepo.updateCommunityEngagement(
      recordId,
      updatedEngagement
    );

    // Log resonance event for pattern detection
    await FieldRecordsRepo.logResonanceEvent(recordId, userId);
  }

  /**
   * Get user's Field Pattern analysis
   */
  async getUserFieldPattern(userId: string): Promise<UserFieldPattern> {
    const records = await this.getUserFieldRecords(userId);

    // Analyze elemental journey
    const elementalJourney = records
      .filter((r) => r.interpretation?.primaryElement)
      .map((r) => ({
        date: new Date(r.createdAt),
        element: r.interpretation!.primaryElement,
        intensity:
          r.interpretation!.elementalBalance?.[
            r.interpretation!.primaryElement
          ] || 0.5,
      }));

    // Calculate elemental balance
    const elementCounts: Record<ElementType, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      ether: 0,
    };

    elementalJourney.forEach((e) => {
      elementCounts[e.element]++;
    });

    const total = elementalJourney.length || 1;
    const elementalBalance: Record<ElementType, number> = {
      fire: elementCounts.fire / total,
      water: elementCounts.water / total,
      earth: elementCounts.earth / total,
      air: elementCounts.air / total,
      ether: elementCounts.ether / total,
    };

    // Find dominant element
    const dominantElement = (Object.keys(elementCounts) as ElementType[]).reduce(
      (a, b) => (elementCounts[a] > elementCounts[b] ? a : b)
    );

    // Analyze phase cycles
    const phaseHistory = records
      .filter((r) => r.interpretation?.currentPhase)
      .map((r) => ({
        date: new Date(r.createdAt),
        phase: r.interpretation!.currentPhase,
        duration: 1, // Would calculate actual duration between phases
      }));

    const currentPhase = phaseHistory[0]?.phase || ('emergence' as PhaseType);

    // Calculate completion patterns
    const completionStages = records.map((r) => r.completionStage);
    const averageCompletionStage = completionStages.length
      ? completionStages.reduce((a, b) => a + b, 0) / completionStages.length
      : 0;

    const fullTransmissions = records.filter(
      (r) => r.completionStage === 5
    ).length;
    const privateRecords = records.filter(
      (r) => r.privacyLevel === 'private'
    ).length;
    const privateRatio = records.length ? privateRecords / records.length : 1;

    // Detect synchronicities (would need more complex cross-user analysis)
    const synchronicityEvents: UserFieldPattern['synchronicityEvents'] = [];

    return {
      userId,
      elementalJourney,
      dominantElement,
      elementalBalance,
      phaseHistory,
      currentPhase,
      averagePhaseDuration: {
        creation: 7,
        preservation: 14,
        dissolution: 7,
        void: 3,
        emergence: 7,
      }, // Default values
      averageCompletionStage,
      fullTransmissions,
      privateRatio,
      synchronicityEvents,
    };
  }

  /**
   * Get Field Record context for MAIA conversations
   */
  async getFieldRecordContext(userId: string): Promise<FieldRecordContext> {
    // Get recent records (last 7 days)
    const recentRecords = await FieldRecordsRepo.getRecentRecords(userId, 7, 10);

    // Extract unresolved questions
    const unresolvedQuestions = recentRecords
      .flatMap((r) => r.reflection?.openQuestions || [])
      .filter((q) => q.length > 0);

    // Determine dominant elements
    const elementCounts: Record<ElementType, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      ether: 0,
    };

    recentRecords.forEach((r) => {
      if (r.interpretation?.primaryElement) {
        elementCounts[r.interpretation.primaryElement]++;
      }
    });

    const dominantElements = (Object.keys(elementCounts) as ElementType[])
      .filter((e) => elementCounts[e] > 0)
      .sort((a, b) => elementCounts[b] - elementCounts[a])
      .slice(0, 2);

    // Get active phase
    const activePhase =
      recentRecords[0]?.interpretation?.currentPhase ||
      ('emergence' as PhaseType);

    // Generate conversation starters
    const suggestedOpeners = this.generateConversationStarters(
      recentRecords,
      dominantElements,
      activePhase
    );

    // Identify emerging patterns
    const emergingPatterns = this.identifyEmergingPatterns(recentRecords);

    // Find insights ready for integration
    const readyForIntegration = recentRecords
      .filter((r) => r.completionStage >= 4 && r.reflection?.coreInsight)
      .map((r) => r.reflection!.coreInsight);

    return {
      recentRecords,
      unresolvedQuestions,
      dominantElements,
      activePhase,
      suggestedOpeners,
      emergingPatterns,
      readyForIntegration,
    };
  }

  /**
   * Generate MAIA conversation starters based on Field Records
   */
  private generateConversationStarters(
    records: FieldRecord[],
    dominantElements: ElementType[],
    activePhase: PhaseType
  ): string[] {
    const starters: string[] = [];

    // Based on recent powerful experiences
    const powerfulRecord = records.find((r) => r.interpretation?.significance);
    if (powerfulRecord) {
      starters.push(
        `I notice you documented a powerful ${powerfulRecord.interpretation?.primaryElement} ` +
          `element experience in your Field Records. Would you like to explore what's wanting to be born from that?`
      );
    }

    // Based on unresolved questions
    const questionRecord = records.find(
      (r) => r.reflection?.openQuestions?.length
    );
    if (questionRecord) {
      const question = questionRecord.reflection!.openQuestions[0];
      starters.push(
        `In your recent Field Record, you asked: "${question}". ` +
          `Shall we explore that together?`
      );
    }

    // Based on phase transitions
    if (activePhase === 'dissolution') {
      starters.push(
        `I see you're in a Dissolution phase. What needs to be released ` +
          `to make space for what's emerging?`
      );
    } else if (activePhase === 'creation') {
      starters.push(
        `Your Field Records show you're in a Creation phase. ` +
          `What vision is calling to be manifested?`
      );
    }

    // Based on elemental patterns
    if (dominantElements.includes('fire')) {
      starters.push(
        `There's been a strong Fire element in your recent experiences. ` +
          `What passion or transformation is burning within you?`
      );
    } else if (dominantElements.includes('water')) {
      starters.push(
        `Water has been flowing through your recent Field Records. ` +
          `What emotions or intuitions are asking to be honored?`
      );
    }

    // Based on integration needs
    const needsIntegration = records.find(
      (r) => r.completionStage === 2 && !r.integration
    );
    if (needsIntegration) {
      starters.push(
        `You have a Field Record that's interpreted but not yet integrated. ` +
          `Would you like support in embodying those insights?`
      );
    }

    return starters;
  }

  /**
   * Identify emerging patterns across Field Records
   */
  private identifyEmergingPatterns(records: FieldRecord[]): string[] {
    const patterns: string[] = [];

    // Check for recurring symbols
    const symbolCounts: Record<string, number> = {};
    records.forEach((r) => {
      r.interpretation?.symbols?.forEach((s) => {
        symbolCounts[s] = (symbolCounts[s] || 0) + 1;
      });
    });

    Object.entries(symbolCounts).forEach(([symbol, count]) => {
      if (count >= 3) {
        patterns.push(
          `The symbol "${symbol}" appears repeatedly in your journey`
        );
      }
    });

    // Check for elemental progressions
    const elements = records
      .filter((r) => r.interpretation?.primaryElement)
      .map((r) => r.interpretation!.primaryElement);

    if (elements.length >= 3) {
      const progression = elements.slice(0, 3).join(' → ');
      patterns.push(`Elemental progression: ${progression}`);
    }

    // Check for phase cycles
    const phases = records
      .filter((r) => r.interpretation?.currentPhase)
      .map((r) => r.interpretation!.currentPhase);

    if (new Set(phases).size >= 3) {
      patterns.push('Moving through multiple phases of transformation');
    }

    return patterns;
  }

  /**
   * Notify Brain Trust of new Field Record for processing
   */
  private async notifyBrainTrust(record: FieldRecord): Promise<void> {
    try {
      // Send to Brain Trust for processing
      await fetch('/api/brain-trust/process-field-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: record.id,
          userId: record.userId,
          elements: record.interpretation?.primaryElement,
          phase: record.interpretation?.currentPhase,
          symbols: record.interpretation?.symbols,
          coreInsight: record.reflection?.coreInsight,
        }),
      });
    } catch (error) {
      console.error('Error notifying Brain Trust:', error);
      // Non-critical, don't throw
    }
  }
}

// Export singleton instance
export const fieldRecordsService = new FieldRecordsService();
