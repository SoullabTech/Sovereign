  // ========================================================================
  // ADVANCED SIGNATURES (5-6 Frameworks)
  // ========================================================================

  /**
   * ADVANCED PATTERN 1: Complete Systemic Shutdown (5 frameworks)
   */
  export function detectCompleteSystemicShutdown(extraction: any): any | null {
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasRetroflection = extraction.gestaltState?.contactDisturbances.retroflection.detected;
    const hasExhaustedManagers = extraction.ifsParts?.parts.some(p => p.type === 'manager' && p.indicator.includes('exhausted'));
    const hasEntanglement = extraction.constellationState?.systemicEntanglement.detected;

    if (hasFreeze && hasDorsal && hasRetroflection && hasExhaustedManagers && hasEntanglement) {
      return {
        name: 'Complete Systemic Shutdown',
        description: 'Individual + family system both in shutdown',
        frameworks: ['Levine', 'Polyvagal', 'Gestalt', 'IFS', 'Family Constellation'],
        frameworkCount: 5,
        complexity: 'advanced',
        confidence: 0.90,
        clinicalMeaning: 'Both individual AND family system in shutdown. Freeze response with systemic burden.',
        therapeuticFocus: 'Co-regulate FIRST, then explore systemic burden',
        interventions: [
          'PRIORITY: Safety and co-regulation',
          'Levine: Gentle freeze thaw',
          'Constellation: Explore what they\\\'re carrying for family'
        ],
        urgency: 'critical'
      };
    }
    return null;
  }
