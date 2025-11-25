/**
 * Spiralogic Field Protocol Validation System
 * Implements the validation loop for consciousness observations
 */

import {
  FieldRecord,
  ValidationCriteria,
  ValidationResult,
  Element,
  Practitioner
} from '@/types/fieldProtocol';

/**
 * Core validation engine for Field Records
 */
export class FieldValidation {
  /**
   * Validates a field record against the Spiralogic criteria
   */
  static async validateRecord(
    record: FieldRecord,
    historicalRecords: FieldRecord[] = []
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      recordId: record.id,
      timestamp: new Date(),
      criteriaResults: {},
      overallValid: false,
      coherenceScore: 0,
      recommendations: []
    };

    // Check each validation criteria
    for (const criteria of record.validation.criteria) {
      result.criteriaResults[criteria] = await this.checkCriteria(
        criteria,
        record,
        historicalRecords
      );
    }

    // Calculate overall validation
    const passedCriteria = Object.values(result.criteriaResults).filter(
      r => r?.passed
    ).length;
    const totalCriteria = Object.keys(result.criteriaResults).length;

    result.overallValid = passedCriteria > 0 && passedCriteria >= totalCriteria * 0.5;
    result.coherenceScore = this.calculateCoherence(record, result);

    // Generate recommendations
    result.recommendations = this.generateRecommendations(record, result);

    return result;
  }

  /**
   * Check individual validation criteria
   */
  private static async checkCriteria(
    criteria: ValidationCriteria,
    record: FieldRecord,
    historicalRecords: FieldRecord[]
  ): Promise<{ passed: boolean; evidence?: string; confidence: number }> {
    switch (criteria) {
      case ValidationCriteria.TEMPORAL_REPETITION:
        return this.checkTemporalRepetition(record, historicalRecords);

      case ValidationCriteria.PSYCHOLOGICAL_TRANSFORMATION:
        return this.checkPsychologicalTransformation(record);

      case ValidationCriteria.ARCHETYPAL_ALIGNMENT:
        return this.checkArchetypalAlignment(record);

      case ValidationCriteria.SYMBOLIC_TRANSLATION:
        return this.checkSymbolicTranslation(record);

      default:
        return { passed: false, confidence: 0 };
    }
  }

  /**
   * Check for temporal repetition patterns
   */
  private static checkTemporalRepetition(
    record: FieldRecord,
    historicalRecords: FieldRecord[]
  ): { passed: boolean; evidence?: string; confidence: number } {
    // Find similar patterns in historical records
    const similarRecords = historicalRecords.filter(hr => {
      // Check for elemental similarity
      const elementalMatch = record.elementalContext.dominant.some(
        e => hr.elementalContext.dominant.includes(e)
      );

      // Check for phenomenological similarity
      const phenomenMatch = this.calculateTextSimilarity(
        record.phenomenon.description,
        hr.phenomenon.description
      ) > 0.6;

      return elementalMatch && phenomenMatch;
    });

    const passed = similarRecords.length >= 2;
    const confidence = Math.min(similarRecords.length * 0.25, 1);

    return {
      passed,
      evidence: passed
        ? `Found ${similarRecords.length} similar observations across time`
        : 'Insufficient temporal repetition',
      confidence
    };
  }

  /**
   * Check for psychological transformation markers
   */
  private static checkPsychologicalTransformation(
    record: FieldRecord
  ): { passed: boolean; evidence?: string; confidence: number } {
    const transformationMarkers = [
      'shift', 'change', 'transform', 'evolve', 'integrate',
      'release', 'breakthrough', 'insight', 'realization', 'awakening'
    ];

    // Check for transformation language in various fields
    const cognitiveTransform = record.cognitive.insights.some(insight =>
      transformationMarkers.some(marker =>
        insight.toLowerCase().includes(marker)
      )
    );

    const applicationTransform = record.application.behavioralChanges?.length > 0 ||
      record.application.perceptualShifts?.length > 0;

    const somaticTransform = record.somatic.emotionalTone &&
      ['release', 'peace', 'clarity', 'expansion'].some(
        state => record.somatic.emotionalTone?.toLowerCase().includes(state)
      );

    const transformationScore =
      (cognitiveTransform ? 0.4 : 0) +
      (applicationTransform ? 0.4 : 0) +
      (somaticTransform ? 0.2 : 0);

    const passed = transformationScore >= 0.5;

    return {
      passed,
      evidence: passed
        ? 'Psychological transformation markers present'
        : 'No clear transformation indicators',
      confidence: transformationScore
    };
  }

  /**
   * Check for archetypal alignment
   */
  private static checkArchetypalAlignment(
    record: FieldRecord
  ): { passed: boolean; evidence?: string; confidence: number } {
    // Universal archetypal patterns
    const archetypes = {
      Fire: ['warrior', 'passion', 'transformation', 'will', 'courage'],
      Water: ['flow', 'emotion', 'intuition', 'receptivity', 'healing'],
      Air: ['thought', 'communication', 'clarity', 'intellect', 'vision'],
      Earth: ['grounding', 'stability', 'manifestation', 'nurturing', 'abundance'],
      Void: ['emptiness', 'potential', 'mystery', 'unity', 'transcendence']
    };

    let alignmentScore = 0;
    const evidence: string[] = [];

    // Check elemental-archetypal coherence
    for (const element of record.elementalContext.dominant) {
      const elementArchetypes = archetypes[element];

      // Check symbolic data for archetypal presence
      const symbolicsPresent = record.symbolic.archetypes?.some(
        archetype => elementArchetypes.some(
          ea => archetype.toLowerCase().includes(ea)
        )
      );

      // Check cognitive insights for archetypal themes
      const cognitivePresent = record.cognitive.insights.some(
        insight => elementArchetypes.some(
          ea => insight.toLowerCase().includes(ea)
        )
      );

      if (symbolicsPresent || cognitivePresent) {
        alignmentScore += 0.25;
        evidence.push(`${element} archetype present`);
      }
    }

    // Check for mythic motif coherence
    if (record.symbolic.mythicMotifs?.length > 0) {
      alignmentScore += 0.25;
      evidence.push('Mythic motifs identified');
    }

    const passed = alignmentScore >= 0.5;

    return {
      passed,
      evidence: evidence.length > 0
        ? evidence.join(', ')
        : 'No archetypal alignment found',
      confidence: Math.min(alignmentScore, 1)
    };
  }

  /**
   * Check for symbolic translation capability
   */
  private static checkSymbolicTranslation(
    record: FieldRecord
  ): { passed: boolean; evidence?: string; confidence: number } {
    // Check if experience can be expressed in multiple symbolic languages
    const hasImagery = record.symbolic.imagery?.length > 0;
    const hasArchetypes = record.symbolic.archetypes?.length > 0;
    const hasPlanetary = record.symbolic.planetaryResonance?.length > 0;
    const hasMythic = record.symbolic.mythicMotifs?.length > 0;
    const hasVerbal = record.cognitive.verbalExpressions?.length > 0;
    const hasPatterns = record.cognitive.patterns?.length > 0;

    const translationCount = [
      hasImagery, hasArchetypes, hasPlanetary,
      hasMythic, hasVerbal, hasPatterns
    ].filter(Boolean).length;

    const passed = translationCount >= 3;
    const confidence = translationCount / 6;

    return {
      passed,
      evidence: passed
        ? `Experience translated into ${translationCount} symbolic systems`
        : 'Insufficient symbolic translation',
      confidence
    };
  }

  /**
   * Calculate overall coherence score
   */
  private static calculateCoherence(
    record: FieldRecord,
    validationResult: ValidationResult
  ): number {
    let coherenceScore = 0;

    // Stage completion coherence (0.2)
    const completedStages = Object.values(record.stageCompletions || {})
      .filter(stage => stage?.completed).length;
    coherenceScore += (completedStages / 5) * 0.2;

    // Elemental resonance (0.2)
    coherenceScore += (record.elementalContext.resonance || 0.5) * 0.2;

    // Validation criteria success (0.3)
    const criteriaSuccess = Object.values(validationResult.criteriaResults)
      .filter(r => r?.passed).length /
      Math.max(Object.keys(validationResult.criteriaResults).length, 1);
    coherenceScore += criteriaSuccess * 0.3;

    // Data completeness (0.2)
    const dataFields = [
      record.phenomenon.description,
      record.symbolic.imagery?.length > 0,
      record.somatic.emotionalTone,
      record.cognitive.insights.length > 0,
      record.application.actions?.length > 0
    ];
    const dataCompleteness = dataFields.filter(Boolean).length / dataFields.length;
    coherenceScore += dataCompleteness * 0.2;

    // Synchronicity bonus (0.1)
    if (record.validation.synchronicities?.length > 0) {
      coherenceScore += 0.1;
    }

    return Math.min(coherenceScore, 1);
  }

  /**
   * Generate recommendations for improving the record
   */
  private static generateRecommendations(
    record: FieldRecord,
    validationResult: ValidationResult
  ): string[] {
    const recommendations: string[] = [];

    // Check for incomplete stages
    const incompleteStages = ['Observation', 'Interpretation', 'Integration', 'Reflection', 'Transmission']
      .filter(stage => !record.stageCompletions[stage as keyof typeof record.stageCompletions]?.completed);

    if (incompleteStages.length > 0) {
      recommendations.push(`Complete remaining stages: ${incompleteStages.join(', ')}`);
    }

    // Check for low coherence areas
    if (validationResult.coherenceScore < 0.5) {
      recommendations.push('Deepen observation and add more phenomenological detail');
    }

    // Check for missing elemental context
    if (record.elementalContext.dominant.length === 0) {
      recommendations.push('Identify dominant elemental energies present');
    }

    // Check for missing somatic data
    if (!record.somatic.emotionalTone && !record.somatic.sensations?.length) {
      recommendations.push('Include somatic and emotional observations');
    }

    // Check for missing cognitive insights
    if (record.cognitive.insights.length === 0) {
      recommendations.push('Articulate cognitive insights and interpretations');
    }

    // Check for missing application
    if (!record.application.actions?.length && !record.application.behavioralChanges?.length) {
      recommendations.push('Describe how this will inform your practice');
    }

    // Validation-specific recommendations
    const failedCriteria = Object.entries(validationResult.criteriaResults)
      .filter(([_, result]) => !result?.passed)
      .map(([criteria]) => criteria);

    if (failedCriteria.includes(ValidationCriteria.TEMPORAL_REPETITION)) {
      recommendations.push('Continue observing for temporal patterns');
    }

    if (failedCriteria.includes(ValidationCriteria.ARCHETYPAL_ALIGNMENT)) {
      recommendations.push('Explore archetypal and mythic dimensions');
    }

    return recommendations;
  }

  /**
   * Simple text similarity calculation
   */
  private static calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Cross-reference multiple records for collective patterns
   */
  static findCollectivePatterns(records: FieldRecord[]): {
    dominantElements: Element[];
    commonArchetypes: string[];
    temporalClusters: Date[];
    coherenceNetwork: Map<string, string[]>;
  } {
    // Analyze dominant elements across all records
    const elementCounts = new Map<Element, number>();
    records.forEach(record => {
      record.elementalContext.dominant.forEach(element => {
        elementCounts.set(element, (elementCounts.get(element) || 0) + 1);
      });
    });

    const dominantElements = [...elementCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([element]) => element);

    // Find common archetypes
    const archetypeCounts = new Map<string, number>();
    records.forEach(record => {
      record.symbolic.archetypes?.forEach(archetype => {
        archetypeCounts.set(archetype, (archetypeCounts.get(archetype) || 0) + 1);
      });
    });

    const commonArchetypes = [...archetypeCounts.entries()]
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([archetype]) => archetype);

    // Identify temporal clusters (records within 24 hours of each other)
    const temporalClusters: Date[] = [];
    const sortedRecords = [...records].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    for (let i = 0; i < sortedRecords.length - 1; i++) {
      const timeDiff = sortedRecords[i + 1].timestamp.getTime() -
                       sortedRecords[i].timestamp.getTime();
      if (timeDiff <= 24 * 60 * 60 * 1000) { // 24 hours
        temporalClusters.push(sortedRecords[i].timestamp);
      }
    }

    // Build coherence network (records that reference each other)
    const coherenceNetwork = new Map<string, string[]>();
    records.forEach(record => {
      if (record.meta.linkedRecords?.length > 0) {
        coherenceNetwork.set(record.id, record.meta.linkedRecords);
      }
    });

    return {
      dominantElements,
      commonArchetypes,
      temporalClusters,
      coherenceNetwork
    };
  }

  /**
   * Calculate practitioner integrity score based on their records
   */
  static calculatePractitionerIntegrity(
    practitioner: Practitioner,
    records: FieldRecord[]
  ): {
    integrityScore: number;
    transparencyScore: number;
    coherenceScore: number;
  } {
    const practitionerRecords = records.filter(
      r => r.meta.practitionerId === practitioner.id
    );

    // Integrity: consistency and completion
    const completionRate = practitionerRecords.reduce((sum, record) => {
      const stages = Object.values(record.stageCompletions || {});
      const completed = stages.filter(s => s?.completed).length;
      return sum + (completed / 5);
    }, 0) / practitionerRecords.length;

    // Transparency: detailed observations and acknowledged limitations
    const transparencyRate = practitionerRecords.reduce((sum, record) => {
      let score = 0;
      if (record.phenomenon.description.length > 100) score += 0.25;
      if (record.cognitive.questions?.length > 0) score += 0.25;
      if (record.validation.synchronicities?.length > 0) score += 0.25;
      if (record.meta.revisionHistory?.length > 0) score += 0.25;
      return sum + score;
    }, 0) / practitionerRecords.length;

    // Coherence: validated records and cross-references
    const validatedCount = practitionerRecords.filter(
      r => r.validation.selfValidation || r.validation.peerValidation?.length > 0
    ).length;
    const coherenceRate = validatedCount / practitionerRecords.length;

    return {
      integrityScore: completionRate,
      transparencyScore: transparencyRate,
      coherenceScore: coherenceRate
    };
  }
}