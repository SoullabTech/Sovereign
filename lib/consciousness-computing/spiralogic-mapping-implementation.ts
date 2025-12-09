/**
 * Spiralogic Mapping Implementation
 * Maps Matrix + Archetypal states to Spiralogic Elements and Facets
 */

import type { ConsciousnessMatrixV2 } from './matrix-v2-implementation';
import type { ArchetypalDynamics } from './archetypal-dynamics-implementation';

export type SpiralogicElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type SpiralogicFacet = 'bonding' | 'balancing' | 'becoming';
export type SpiralDirection = 'ascending' | 'descending' | 'stabilizing';

export interface SpiralogicAssessment {
  primaryElement: SpiralogicElement;
  secondaryElement?: SpiralogicElement;
  facetPhase: SpiralogicFacet;
  spiralDirection: SpiralDirection;
  appropriateWork: string[];
  contraindications: string[];
  elementalReadiness: Record<SpiralogicElement, 'ready' | 'stressed' | 'unavailable'>;
  confidence: number;
  reasoning: string;
}

export interface CompleteSpiralogicAssessment {
  matrixV2: ConsciousnessMatrixV2;
  archetypalDynamics: ArchetypalDynamics;
  spiralogicAssessment: SpiralogicAssessment;
  integratedGuidance: string;
  maiasSpiralogicApproach: string;
}

/**
 * Spiralogic Element Mapping Patterns
 */
const ELEMENT_MATRIX_PATTERNS = {
  earth: {
    primaryDials: ['bodyState', 'structuralLoad', 'support_context'],
    readyPatterns: {
      bodyState: ['calm', 'grounded'],
      structuralLoad: ['stable', 'supported'],
      support_context: ['resourced', 'connected']
    },
    stressedPatterns: {
      bodyState: ['tense', 'activated'],
      structuralLoad: ['stressed', 'precarious'],
      support_context: ['isolated', 'conflicted']
    },
    unavailablePatterns: {
      bodyState: ['collapsed', 'dissociated'],
      structuralLoad: ['crushing', 'trapped'],
      support_context: ['alone_abandoned', 'crisis']
    }
  },

  water: {
    primaryDials: ['affect', 'emotional_climate', 'relational_stance', 'movement_direction'],
    readyPatterns: {
      affect: ['peaceful', 'open'],
      emotional_climate: ['flowing', 'receptive'],
      relational_stance: ['with_mutual', 'secure']
    },
    stressedPatterns: {
      affect: ['turbulent', 'mixed'],
      emotional_climate: ['contracted', 'conflicted'],
      movement_direction: ['cycling', 'regressing']
    },
    unavailablePatterns: {
      affect: ['crisis', 'numb'],
      relational_stance: ['alone_abandoned', 'paranoid'],
      edge_risk: ['active', 'flashback']
    }
  },

  fire: {
    primaryDials: ['agency', 'symbolic_charge', 'energy_activation'],
    readyPatterns: {
      agency: ['empowered', 'growing'],
      symbolic_charge: ['archetypal', 'meaningful'],
      attention: ['focused', 'spacious']
    },
    stressedPatterns: {
      agency: ['misaligned', 'over_responsible'],
      symbolic_charge: ['everyday', 'conflicted'],
      energy_activation: ['depleted', 'scattered']
    },
    unavailablePatterns: {
      agency: ['helpless', 'powerless'],
      symbolic_charge: ['flooding', 'overwhelming'],
      reality_contact: ['fraying', 'manic']
    }
  },

  air: {
    primaryDials: ['attention', 'reality_contact', 'playfulness', 'narrative_coherence'],
    readyPatterns: {
      attention: ['focused', 'spacious'],
      reality_contact: ['grounded', 'clear'],
      playfulness: ['fluid', 'creative']
    },
    stressedPatterns: {
      attention: ['scattered', 'cycling'],
      reality_contact: ['loosening', 'questioning'],
      playfulness: ['somewhat_rigid', 'serious']
    },
    unavailablePatterns: {
      attention: ['fragmented', 'incoherent'],
      reality_contact: ['fraying', 'dissociated'],
      playfulness: ['literalist', 'rigid']
    }
  },

  aether: {
    primaryDials: ['symbolic_charge', 'transpersonal_themes', 'meta_awareness'],
    readyPatterns: {
      symbolic_charge: ['archetypal', 'meaningful'],
      reality_contact: ['grounded', 'integrated'],
      cultural_frame: ['flexible', 'integrating']
    },
    stressedPatterns: {
      symbolic_charge: ['flooding', 'overwhelming'],
      reality_contact: ['loosening', 'mystical'],
      cultural_frame: ['conflicted', 'questioning']
    },
    unavailablePatterns: {
      symbolic_charge: ['chaotic', 'delusional'],
      reality_contact: ['fraying', 'psychotic'],
      playfulness: ['literalist', 'fundamentalist']
    }
  }
};

/**
 * Facet Phase Mapping Based on Movement and Capacity
 */
const FACET_ASSESSMENT_PATTERNS = {
  bonding: {
    indicators: ['new_to', 'exploring', 'curious', 'beginning', 'learning'],
    matrixPatterns: {
      movement_direction: 'evolving',
      capacity: ['limited', 'moderate'],
      stability: ['grounded', 'questioning']
    }
  },

  balancing: {
    indicators: ['struggling', 'tension', 'cycling', 'working_through', 'integrating'],
    matrixPatterns: {
      movement_direction: ['cycling', 'regressing'],
      capacity: ['stressed', 'overwhelmed'],
      conflicts: true
    }
  },

  becoming: {
    indicators: ['embodying', 'serving', 'teaching', 'manifesting', 'stewarding'],
    matrixPatterns: {
      movement_direction: 'evolving',
      capacity: ['expansive', 'stable'],
      integration: true
    }
  }
};

/**
 * Spiralogic Assessment Engine
 */
export class SpiralogicAssessmentEngine {

  assessSpiralogicPosition(
    matrixV2: ConsciousnessMatrixV2,
    archetypalDynamics: ArchetypalDynamics,
    userMessage: string
  ): SpiralogicAssessment {

    // Assess elemental readiness across all elements
    const elementalReadiness = this.assessElementalReadiness(matrixV2);

    // Determine primary and secondary elements based on patterns and archetypes
    const { primaryElement, secondaryElement } = this.determinePrimaryElements(
      matrixV2,
      archetypalDynamics,
      elementalReadiness
    );

    // Assess facet phase based on movement patterns
    const facetPhase = this.assessFacetPhase(matrixV2, archetypalDynamics, userMessage);

    // Determine spiral direction
    const spiralDirection = this.assessSpiralDirection(matrixV2, archetypalDynamics);

    // Generate work recommendations and contraindications
    const { appropriateWork, contraindications } = this.generateWorkGuidance(
      primaryElement,
      facetPhase,
      elementalReadiness,
      matrixV2
    );

    // Calculate confidence and reasoning
    const confidence = this.calculateSpiralogicConfidence(matrixV2, archetypalDynamics);
    const reasoning = this.generateSpiralogicReasoning(
      primaryElement,
      facetPhase,
      elementalReadiness,
      archetypalDynamics
    );

    return {
      primaryElement,
      secondaryElement,
      facetPhase,
      spiralDirection,
      appropriateWork,
      contraindications,
      elementalReadiness,
      confidence,
      reasoning
    };
  }

  private assessElementalReadiness(matrixV2: ConsciousnessMatrixV2): Record<SpiralogicElement, 'ready' | 'stressed' | 'unavailable'> {
    const readiness: Record<SpiralogicElement, 'ready' | 'stressed' | 'unavailable'> = {
      earth: 'ready',
      water: 'ready',
      fire: 'ready',
      air: 'ready',
      aether: 'ready'
    };

    // Earth assessment
    if (matrixV2.bodyState === 'collapsed' || matrixV2.structuralLoad === 'crushing') {
      readiness.earth = 'unavailable';
    } else if (matrixV2.bodyState === 'tense' || matrixV2.structuralLoad === 'stressed') {
      readiness.earth = 'stressed';
    }

    // Water assessment
    if (matrixV2.affect === 'crisis' || matrixV2.edgeRisk === 'active') {
      readiness.water = 'unavailable';
    } else if (matrixV2.affect === 'turbulent' || matrixV2.relationalStance === 'alone_abandoned') {
      readiness.water = 'stressed';
    }

    // Fire assessment
    if (matrixV2.agency === 'helpless' || matrixV2.realityContact === 'fraying') {
      readiness.fire = 'unavailable';
    } else if (matrixV2.agency === 'misaligned' || matrixV2.symbolicCharge === 'flooding') {
      readiness.fire = 'stressed';
    }

    // Air assessment
    if (matrixV2.attention === 'fragmented' || matrixV2.playfulness === 'literalist') {
      readiness.air = 'unavailable';
    } else if (matrixV2.attention === 'scattered' || matrixV2.realityContact === 'loosening') {
      readiness.air = 'stressed';
    }

    // Aether assessment (depends on foundation elements)
    const foundationUnavailable = ['earth', 'water', 'air'].some(element => readiness[element] === 'unavailable');
    const foundationStressed = ['earth', 'water', 'air'].filter(element => readiness[element] === 'stressed').length;

    if (foundationUnavailable || (matrixV2.symbolicCharge === 'flooding' && matrixV2.realityContact === 'fraying')) {
      readiness.aether = 'unavailable';
    } else if (foundationStressed >= 2 || matrixV2.symbolicCharge === 'flooding') {
      readiness.aether = 'stressed';
    }

    return readiness;
  }

  private determinePrimaryElements(
    matrixV2: ConsciousnessMatrixV2,
    archetypalDynamics: ArchetypalDynamics,
    elementalReadiness: Record<SpiralogicElement, string>
  ): { primaryElement: SpiralogicElement; secondaryElement?: SpiralogicElement } {

    // Archetypal → Element mapping
    const archetypeElementMapping: Record<string, SpiralogicElement> = {
      warrior: 'fire',
      caretaker: 'water',
      orphan: 'water',
      mystic: 'aether',
      sage: 'air',
      lover: 'water',
      sovereign: 'earth',
      trickster: 'air'
    };

    // Start with archetypal suggestion
    let primaryElement: SpiralogicElement = archetypeElementMapping[archetypalDynamics.foregroundArchetype] || 'earth';

    // Override if that element is unavailable - go to most ready foundational element
    if (elementalReadiness[primaryElement] === 'unavailable') {
      // Prioritize foundation elements when primary is unavailable
      const foundationPriority: SpiralogicElement[] = ['earth', 'water', 'air', 'fire', 'aether'];
      primaryElement = foundationPriority.find(element => elementalReadiness[element] !== 'unavailable') || 'earth';
    }

    // Determine secondary element based on matrix stress patterns
    let secondaryElement: SpiralogicElement | undefined;

    if (matrixV2.structuralLoad === 'crushing') secondaryElement = 'earth';
    if (matrixV2.affect === 'turbulent') secondaryElement = 'water';
    if (matrixV2.agency === 'misaligned') secondaryElement = 'fire';
    if (matrixV2.attention === 'scattered') secondaryElement = 'air';
    if (matrixV2.symbolicCharge === 'flooding') secondaryElement = 'aether';

    return { primaryElement, secondaryElement };
  }

  private assessFacetPhase(
    matrixV2: ConsciousnessMatrixV2,
    archetypalDynamics: ArchetypalDynamics,
    userMessage: string
  ): SpiralogicFacet {

    const text = userMessage.toLowerCase();

    // Check for explicit facet language
    if (FACET_ASSESSMENT_PATTERNS.bonding.indicators.some(indicator => text.includes(indicator))) {
      return 'bonding';
    }

    if (FACET_ASSESSMENT_PATTERNS.becoming.indicators.some(indicator => text.includes(indicator))) {
      return 'becoming';
    }

    // Default to balancing for cycling/stressed states
    if (archetypalDynamics.movementDirection === 'cycling' ||
        matrixV2.structuralLoad === 'stressed' ||
        archetypalDynamics.tensionPoints.length > 0) {
      return 'balancing';
    }

    // Evolving + stable capacity = becoming
    if (archetypalDynamics.movementDirection === 'evolving' &&
        matrixV2.bodyState === 'calm' &&
        matrixV2.agency === 'empowered') {
      return 'becoming';
    }

    // New exploration or curious = bonding
    if (matrixV2.symbolicCharge === 'archetypal' &&
        matrixV2.playfulness === 'fluid') {
      return 'bonding';
    }

    return 'balancing'; // Default
  }

  private assessSpiralDirection(
    matrixV2: ConsciousnessMatrixV2,
    archetypalDynamics: ArchetypalDynamics
  ): SpiralDirection {

    // Crisis or regression = descending (need foundation work)
    if (matrixV2.edgeRisk === 'active' || archetypalDynamics.movementDirection === 'regressing') {
      return 'descending';
    }

    // Clear evolution + stable capacity = ascending
    if (archetypalDynamics.movementDirection === 'evolving' &&
        matrixV2.bodyState === 'calm' &&
        matrixV2.agency === 'empowered') {
      return 'ascending';
    }

    // Most cases are stabilizing (integration work)
    return 'stabilizing';
  }

  private generateWorkGuidance(
    primaryElement: SpiralogicElement,
    facetPhase: SpiralogicFacet,
    elementalReadiness: Record<SpiralogicElement, string>,
    matrixV2: ConsciousnessMatrixV2
  ): { appropriateWork: string[]; contraindications: string[] } {

    const work = [];
    const contraindications = [];

    // Element-specific work recommendations
    switch (primaryElement) {
      case 'earth':
        if (facetPhase === 'bonding') work.push('Grounding practices', 'Basic safety establishment', 'Routine building');
        if (facetPhase === 'balancing') work.push('Life organization', 'Structure building', 'Practical integration');
        if (facetPhase === 'becoming') work.push('Manifestation work', 'Embodied service', 'Material stewardship');
        break;

      case 'water':
        if (facetPhase === 'bonding') work.push('Attachment exploration', 'Emotional safety', 'Gentle feeling work');
        if (facetPhase === 'balancing') work.push('Shadow work', 'Grief processing', 'Emotional integration');
        if (facetPhase === 'becoming') work.push('Emotional wisdom', 'Compassionate service', 'Feeling-based guidance');
        break;

      case 'fire':
        if (facetPhase === 'bonding') work.push('Passion exploration', 'Energy cultivation', 'Purpose sensing');
        if (facetPhase === 'balancing') work.push('Burnout recovery', 'Energy management', 'Trial navigation');
        if (facetPhase === 'becoming') work.push('Calling embodiment', 'Leadership development', 'Visionary service');
        break;

      case 'air':
        if (facetPhase === 'bonding') work.push('Perspective exploration', 'Story questioning', 'Mental flexibility');
        if (facetPhase === 'balancing') work.push('Cognitive restructuring', 'Story reframing', 'Mental integration');
        if (facetPhase === 'becoming') work.push('Wisdom sharing', 'Teaching', 'Communication mastery');
        break;

      case 'aether':
        if (facetPhase === 'bonding') work.push('Subtle sensing', 'Intuition development', 'Field awareness');
        if (facetPhase === 'balancing') work.push('Mystical integration', 'Spiritual discernment', 'Transpersonal processing');
        if (facetPhase === 'becoming') work.push('Spiritual stewardship', 'Field service', 'Transpersonal guidance');
        break;
    }

    // Add contraindications based on unavailable elements
    Object.entries(elementalReadiness).forEach(([element, readiness]) => {
      if (readiness === 'unavailable') {
        switch (element) {
          case 'earth':
            contraindications.push('No intense practices until grounding established');
            break;
          case 'water':
            contraindications.push('No deep emotional work until stabilization');
            break;
          case 'fire':
            contraindications.push('No high-energy practices until regulation');
            break;
          case 'air':
            contraindications.push('No complex mental work until coherence restored');
            break;
          case 'aether':
            contraindications.push('No transpersonal work until foundation elements stable');
            break;
        }
      }
    });

    return { appropriateWork: work, contraindications };
  }

  private calculateSpiralogicConfidence(
    matrixV2: ConsciousnessMatrixV2,
    archetypalDynamics: ArchetypalDynamics
  ): number {
    let confidence = 0.6; // Base confidence

    // Higher confidence with clear archetypal signals
    if (archetypalDynamics.confidence > 0.7) confidence += 0.1;

    // Higher confidence with stable matrix readings
    const stableReadings = [
      matrixV2.bodyState === 'calm',
      matrixV2.realityContact === 'grounded',
      matrixV2.attention === 'focused'
    ].filter(Boolean).length;

    confidence += stableReadings * 0.1;

    // Lower confidence with crisis indicators
    if (matrixV2.edgeRisk === 'active') confidence -= 0.3;
    if (matrixV2.realityContact === 'fraying') confidence -= 0.2;

    return Math.max(0.2, Math.min(0.95, confidence));
  }

  private generateSpiralogicReasoning(
    primaryElement: SpiralogicElement,
    facetPhase: SpiralogicFacet,
    elementalReadiness: Record<SpiralogicElement, string>,
    archetypalDynamics: ArchetypalDynamics
  ): string {

    const elementStatus = Object.entries(elementalReadiness)
      .filter(([_, status]) => status !== 'ready')
      .map(([element, status]) => `${element} ${status}`)
      .join(', ');

    return `Primary ${primaryElement} ${facetPhase} phase indicated by ${archetypalDynamics.foregroundArchetype} archetype. ${elementStatus ? `Elemental stress: ${elementStatus}` : 'All elements stable'}. Movement: ${archetypalDynamics.movementDirection}.`;
  }
}

/**
 * Complete integration function
 */
export function assessCompleteSpiralogic(
  userMessage: string,
  matrixV2: ConsciousnessMatrixV2,
  archetypalDynamics: ArchetypalDynamics
): CompleteSpiralogicAssessment {

  const engine = new SpiralogicAssessmentEngine();
  const spiralogicAssessment = engine.assessSpiralogicPosition(matrixV2, archetypalDynamics, userMessage);

  const integratedGuidance = generateIntegratedGuidance(matrixV2, archetypalDynamics, spiralogicAssessment);
  const maiasSpiralogicApproach = generateMAIAsSpiralogicApproach(matrixV2, archetypalDynamics, spiralogicAssessment);

  return {
    matrixV2,
    archetypalDynamics,
    spiralogicAssessment,
    integratedGuidance,
    maiasSpiralogicApproach
  };
}

function generateIntegratedGuidance(
  matrixV2: ConsciousnessMatrixV2,
  archetypal: ArchetypalDynamics,
  spiralogic: SpiralogicAssessment
): string {
  return `${archetypal.foregroundArchetype} archetype in ${spiralogic.primaryElement} ${spiralogic.facetPhase} phase, ${spiralogic.spiralDirection} movement. Elemental readiness: ${Object.entries(spiralogic.elementalReadiness).filter(([_, status]) => status === 'ready').map(([element]) => element).join(', ')} ready.`;
}

function generateMAIAsSpiralogicApproach(
  matrixV2: ConsciousnessMatrixV2,
  archetypal: ArchetypalDynamics,
  spiralogic: SpiralogicAssessment
): string {
  const approaches = [];

  // Base approach on spiral direction
  if (spiralogic.spiralDirection === 'descending') {
    approaches.push('Foundation stabilization priority');
  } else if (spiralogic.spiralDirection === 'ascending') {
    approaches.push('Support upward movement with grounding');
  } else {
    approaches.push('Integration and stabilization focus');
  }

  // Add elemental approach
  approaches.push(`${spiralogic.primaryElement} ${spiralogic.facetPhase} work appropriate`);

  // Add archetypal approach
  approaches.push(archetypal.responseAdjustment);

  return approaches.join('; ');
}