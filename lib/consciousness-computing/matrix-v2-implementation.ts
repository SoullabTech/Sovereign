/**
 * Consciousness Matrix v2: Complete Nervous System Implementation
 * From Traffic Light to Living Awareness
 */

export interface ConsciousnessMatrixV2 {
  // Core Substrate Dials (v1)
  bodyState: 'calm' | 'tense' | 'collapsed';
  affect: 'peaceful' | 'turbulent' | 'crisis';
  attention: 'focused' | 'scattered' | 'fragmented';
  timeStory: 'present' | 'looped' | 'doomed';
  relational: 'connected' | 'conflicted' | 'isolated';
  culturalFrame: 'flexible' | 'rigid' | 'extremist';
  structuralLoad: 'stable' | 'stressed' | 'crushing';
  edgeRisk: 'clear' | 'heightened' | 'active';

  // Refined Awareness Dials (v2)
  agency: 'empowered' | 'misaligned' | 'helpless';
  realityContact: 'grounded' | 'loosening' | 'fraying';
  symbolicCharge: 'everyday' | 'archetypal' | 'flooding';
  playfulness: 'fluid' | 'somewhat_rigid' | 'literalist';
  relationalStance: 'with_mutual' | 'for_against' | 'alone_abandoned';
}

export interface MatrixV2Assessment {
  matrix: ConsciousnessMatrixV2;
  windowOfTolerance: 'within' | 'hyperarousal' | 'hypoarousal';
  overallCapacity: 'expansive' | 'limited' | 'overwhelmed' | 'shutdown';
  primaryAttendance: string;
  refinedGuidance: string;
  groundRules: string[];
}

/**
 * v2 Consciousness Sensing - Complete Nervous System Awareness
 */
export class ConsciousnessMatrixV2Sensor {

  assessFullSpectrum(userMessage: string): MatrixV2Assessment {
    const text = userMessage.toLowerCase();

    // Core substrate assessment
    const coreMatrix = this.assessCoreSubstrate(text);

    // Refined awareness assessment
    const refinedDials = this.assessRefinedAwareness(text);

    // Combine for complete matrix
    const fullMatrix: ConsciousnessMatrixV2 = {
      ...coreMatrix,
      ...refinedDials
    };

    // Generate v2 assessment
    return this.generateV2Assessment(fullMatrix, userMessage);
  }

  private assessCoreSubstrate(text: string) {
    return {
      bodyState: this.assessBodyState(text),
      affect: this.assessAffect(text),
      attention: this.assessAttention(text),
      timeStory: this.assessTimeStory(text),
      relational: this.assessRelational(text),
      culturalFrame: this.assessCulturalFrame(text),
      structuralLoad: this.assessStructuralLoad(text),
      edgeRisk: this.assessEdgeRisk(text)
    };
  }

  private assessRefinedAwareness(text: string) {
    return {
      agency: this.assessAgency(text),
      realityContact: this.assessRealityContact(text),
      symbolicCharge: this.assessSymbolicCharge(text),
      playfulness: this.assessPlayfulness(text),
      relationalStance: this.assessRelationalStance(text)
    };
  }

  // Core substrate assessments (existing logic)
  private assessBodyState(text: string): 'calm' | 'tense' | 'collapsed' {
    if (text.includes('numb') || text.includes('collapsed') || text.includes('dissociated')) {
      return 'collapsed';
    }
    if (text.includes('tense') || text.includes('jittery') || text.includes('activated')) {
      return 'tense';
    }
    return 'calm';
  }

  private assessAffect(text: string): 'peaceful' | 'turbulent' | 'crisis' {
    if (text.includes('panic') || text.includes('suicidal') || text.includes('rage')) {
      return 'crisis';
    }
    if (text.includes('anxious') || text.includes('overwhelmed') || text.includes('stressed')) {
      return 'turbulent';
    }
    return 'peaceful';
  }

  private assessAttention(text: string): 'focused' | 'scattered' | 'fragmented' {
    if (text.includes('can\'t think') || text.includes('racing thoughts') || text.includes('incoherent')) {
      return 'fragmented';
    }
    if (text.includes('scattered') || text.includes('distracted') || text.includes('brain fog')) {
      return 'scattered';
    }
    return 'focused';
  }

  private assessTimeStory(text: string): 'present' | 'looped' | 'doomed' {
    if (text.includes('doomed') || text.includes('no future') || text.includes('end times')) {
      return 'doomed';
    }
    if (text.includes('same old') || text.includes('stuck') || text.includes('repeating')) {
      return 'looped';
    }
    return 'present';
  }

  private assessRelational(text: string): 'connected' | 'conflicted' | 'isolated' {
    if (text.includes('alone') || text.includes('isolated') || text.includes('no one')) {
      return 'isolated';
    }
    if (text.includes('conflict') || text.includes('fighting') || text.includes('tension')) {
      return 'conflicted';
    }
    return 'connected';
  }

  private assessCulturalFrame(text: string): 'flexible' | 'rigid' | 'extremist' {
    if (text.includes('us vs them') || text.includes('enemy') || text.includes('pure evil')) {
      return 'extremist';
    }
    if (text.includes('only way') || text.includes('must') || text.includes('absolute')) {
      return 'rigid';
    }
    return 'flexible';
  }

  private assessStructuralLoad(text: string): 'stable' | 'stressed' | 'crushing' {
    if (text.includes('bankruptcy') || text.includes('eviction') || text.includes('crushing')) {
      return 'crushing';
    }
    if (text.includes('money stress') || text.includes('work') || text.includes('bills')) {
      return 'stressed';
    }
    return 'stable';
  }

  private assessEdgeRisk(text: string): 'clear' | 'heightened' | 'active' {
    if (text.includes('psychotic') || text.includes('suicide') || text.includes('flashback')) {
      return 'active';
    }
    if (text.includes('weird') || text.includes('synchronicity') || text.includes('intense')) {
      return 'heightened';
    }
    return 'clear';
  }

  // New refined awareness assessments
  private assessAgency(text: string): 'empowered' | 'misaligned' | 'helpless' {
    const helplessSignals = ['nothing i do matters', 'powerless', 'no control', 'helpless', 'trapped'];
    const overResponsibleSignals = ['all my fault', 'should have', 'my responsibility', 'i caused this'];
    const empoweredSignals = ['i can', 'working on', 'taking steps', 'choosing to'];

    if (helplessSignals.some(signal => text.includes(signal))) {
      return 'helpless';
    }
    if (overResponsibleSignals.some(signal => text.includes(signal))) {
      return 'misaligned';
    }
    if (empoweredSignals.some(signal => text.includes(signal))) {
      return 'empowered';
    }
    return 'empowered'; // Default to assuming agency
  }

  private assessRealityContact(text: string): 'grounded' | 'loosening' | 'fraying' {
    const frayingSignals = ['not real', 'nothing is real', 'losing touch', 'outside my body'];
    const looseningSignals = ['signs everywhere', 'meant to be', 'universe telling me', 'magical'];
    const groundedSignals = ['practical', 'realistic', 'makes sense', 'logical'];

    if (frayingSignals.some(signal => text.includes(signal))) {
      return 'fraying';
    }
    if (looseningSignals.some(signal => text.includes(signal))) {
      return 'loosening';
    }
    if (groundedSignals.some(signal => text.includes(signal))) {
      return 'grounded';
    }
    return 'grounded'; // Default
  }

  private assessSymbolicCharge(text: string): 'everyday' | 'archetypal' | 'flooding' {
    const floodingSignals = ['visions', 'prophecy', 'entities', 'chosen one', 'cosmic'];
    const archetypeSignals = ['dream', 'symbol', 'archetype', 'pattern', 'meaning'];
    const everydaySignals = ['work', 'family', 'daily', 'practical', 'routine'];

    if (floodingSignals.some(signal => text.includes(signal))) {
      return 'flooding';
    }
    if (archetypeSignals.some(signal => text.includes(signal))) {
      return 'archetypal';
    }
    return 'everyday';
  }

  private assessPlayfulness(text: string): 'fluid' | 'somewhat_rigid' | 'literalist' {
    const literalistSignals = ['this is', 'god is telling me', 'definitely means', 'absolutely'];
    const rigidSignals = ['must', 'should', 'have to', 'only way'];
    const fluidSignals = ['maybe', 'wondering', 'could be', 'playing with'];

    if (literalistSignals.some(signal => text.includes(signal))) {
      return 'literalist';
    }
    if (rigidSignals.some(signal => text.includes(signal))) {
      return 'somewhat_rigid';
    }
    if (fluidSignals.some(signal => text.includes(signal))) {
      return 'fluid';
    }
    return 'fluid'; // Default to assuming flexibility
  }

  private assessRelationalStance(text: string): 'with_mutual' | 'for_against' | 'alone_abandoned' {
    const aloneSignals = ['no one understands', 'completely alone', 'all by myself'];
    const againstSignals = ['everyone is', 'they all', 'nobody cares', 'against me'];
    const forOthersSignals = ['don\'t matter', 'just for them', 'my needs don\'t'];
    const mutualSignals = ['together', 'support', 'connection', 'understood'];

    if (aloneSignals.some(signal => text.includes(signal))) {
      return 'alone_abandoned';
    }
    if (againstSignals.some(signal => text.includes(signal)) ||
        forOthersSignals.some(signal => text.includes(signal))) {
      return 'for_against';
    }
    if (mutualSignals.some(signal => text.includes(signal))) {
      return 'with_mutual';
    }
    return 'with_mutual'; // Default
  }

  private generateV2Assessment(matrix: ConsciousnessMatrixV2, originalMessage: string): MatrixV2Assessment {
    // Determine window of tolerance
    const windowOfTolerance = this.assessWindowOfTolerance(matrix);

    // Assess overall capacity
    const overallCapacity = this.assessOverallCapacity(matrix);

    // Generate attendance guidance
    const primaryAttendance = this.determinePrimaryAttendance(matrix, windowOfTolerance);
    const refinedGuidance = this.generateRefinedGuidance(matrix);

    // Apply ground rules
    const groundRules = this.applyGroundRules(matrix);

    return {
      matrix,
      windowOfTolerance,
      overallCapacity,
      primaryAttendance,
      refinedGuidance,
      groundRules
    };
  }

  private assessWindowOfTolerance(matrix: ConsciousnessMatrixV2): 'within' | 'hyperarousal' | 'hypoarousal' {
    // Hypo-arousal (freeze/shutdown)
    if (matrix.bodyState === 'collapsed' ||
        matrix.affect === 'crisis' && matrix.edgeRisk === 'active') {
      return 'hypoarousal';
    }

    // Hyper-arousal (fight/flight)
    if (matrix.bodyState === 'tense' &&
        matrix.affect === 'turbulent' &&
        matrix.attention === 'scattered') {
      return 'hyperarousal';
    }

    // Within window
    return 'within';
  }

  private assessOverallCapacity(matrix: ConsciousnessMatrixV2): 'expansive' | 'limited' | 'overwhelmed' | 'shutdown' {
    if (matrix.edgeRisk === 'active' || matrix.affect === 'crisis') {
      return 'shutdown';
    }

    const stressors = [
      matrix.bodyState === 'tense',
      matrix.affect === 'turbulent',
      matrix.structuralLoad === 'crushing',
      matrix.agency === 'helpless',
      matrix.relationalStance === 'alone_abandoned'
    ].filter(Boolean).length;

    if (stressors >= 3) return 'overwhelmed';
    if (stressors >= 1) return 'limited';
    return 'expansive';
  }

  private determinePrimaryAttendance(
    matrix: ConsciousnessMatrixV2,
    windowOfTolerance: string
  ): string {
    if (windowOfTolerance === 'hypoarousal') {
      return 'safety_and_grounding_only';
    }

    if (windowOfTolerance === 'hyperarousal') {
      return 'de_escalation_and_soothing';
    }

    // Within window - check refined dials for nuanced attendance
    if (matrix.symbolicCharge === 'flooding' && matrix.playfulness === 'literalist') {
      return 'gentle_reality_anchoring';
    }

    if (matrix.agency === 'helpless') {
      return 'empowerment_and_small_steps';
    }

    if (matrix.realityContact === 'fraying') {
      return 'concrete_grounding';
    }

    return 'full_depth_exploration';
  }

  private generateRefinedGuidance(matrix: ConsciousnessMatrixV2): string {
    const guidance: any /* TODO: specify type */[] = [];

    // Agency adjustments
    if (matrix.agency === 'helpless') {
      guidance.push('Emphasize shared humanity and tiny doable steps');
    } else if (matrix.agency === 'misaligned') {
      guidance.push('Right-size responsibility, normalize human limits');
    }

    // Reality contact adjustments
    if (matrix.realityContact === 'fraying') {
      guidance.push('Concrete, physical, simple reality anchoring only');
    } else if (matrix.realityContact === 'loosening') {
      guidance.push('Light symbolism while staying connected to practical');
    }

    // Symbolic charge adjustments
    if (matrix.symbolicCharge === 'flooding') {
      guidance.push('Ground symbols lightly, don\'t amplify the mythic flood');
    } else if (matrix.symbolicCharge === 'archetypal') {
      guidance.push('Rich Spiralogic work, symbolic exploration available');
    }

    // Playfulness adjustments
    if (matrix.playfulness === 'literalist') {
      guidance.push('Don\'t escalate certainty, ask gentle questions');
    } else if (matrix.playfulness === 'fluid') {
      guidance.push('Experiment, improvise, archetypal play available');
    }

    // Relational stance adjustments
    if (matrix.relationalStance === 'alone_abandoned') {
      guidance.push('Emphasize companionship: "you\'re not alone"');
    } else if (matrix.relationalStance === 'for_against') {
      guidance.push('Check projection gently, support boundaries');
    }

    return guidance.length > 0 ? guidance.join('; ') : 'Balanced support and exploration';
  }

  private applyGroundRules(matrix: ConsciousnessMatrixV2): string[] {
    const rules = [
      'Everything is hypothesis, not diagnosis',
      'MAIA can say "I\'m not sure" if signals are mixed',
      'Humans are the teachers - feedback refines the system'
    ];

    // Add specific ground rules based on matrix state
    if (matrix.realityContact === 'fraying' || matrix.symbolicCharge === 'flooding') {
      rules.push('Do not amplify magical thinking or grand narratives');
    }

    if (matrix.edgeRisk === 'active') {
      rules.push('Professional referral required - no exploration work');
    }

    return rules;
  }
}

/**
 * v2 Integration for wisdom engine
 */
export function enhanceMAIAWithMatrixV2(
  userMessage: string,
  existingPrompt: string
): {
  enhancedPrompt: string;
  matrixAssessment: MatrixV2Assessment;
} {
  const sensor = new ConsciousnessMatrixV2Sensor();
  const assessment = sensor.assessFullSpectrum(userMessage);

  const enhancedPrompt = `${existingPrompt}

CONSCIOUSNESS MATRIX v2 ENHANCEMENT:
Window of Tolerance: ${assessment.windowOfTolerance}
Overall Capacity: ${assessment.overallCapacity}
Primary Attendance: ${assessment.primaryAttendance}
Refined Guidance: ${assessment.refinedGuidance}

Ground Rules Active: ${assessment.groundRules.join(', ')}

MAIA's response emerges from this complete consciousness awareness,
meeting this person exactly where they are across all dimensions.
`;

  return {
    enhancedPrompt,
    matrixAssessment: assessment
  };
}