/**
 * MAIA Consciousness Phenomenology Integration
 *
 * Integrates endogenous DMT phenomenology detection with MAIA's core wisdom:
 * - Ontological: What is the nature of being revealed in this experience?
 * - Teleological: What is the purpose/direction this experience serves?
 * - Epistemological: How does this experience teach and what knowledge emerges?
 *
 * This bridges consciousness computing with MAIA's archetypal sight and wisdom synthesis.
 */

import {
  EndogenousPhenomenologyDetector,
  type PhenomenologyAssessment,
  type PhenomenologySignature
} from '../consciousness-computing/endogenous-dmt-phenomenology.js';

import type { ConsciousnessMatrixV2, MatrixV2Assessment } from '../consciousness-computing/matrix-v2-implementation.js';
import type { SpiritualSupportRequest, SpiritualSupportResponse } from '../spiritual-support/maia-spiritual-integration.js';

// ═══════════════════════════════════════════════════════════════════════════
// MAIA'S PHENOMENOLOGICAL WISDOM FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════

export interface MAIAPhenomenologicalWisdom {
  ontological: OntologicalInsight;
  teleological: TeleologicalInsight;
  epistemological: EpistemologicalInsight;
  archetypalSight: ArchetypalFieldReading;
  therapeuticGuidance: TherapeuticWisdom;
  spiritualIntegration: SpiritualIntegrationWisdom;
}

export interface OntologicalInsight {
  // What is the nature of being revealed?
  beingQuality: 'incarnational' | 'transpersonal' | 'archetypal' | 'cosmic';
  identityShifts: string[];
  realityConstructions: string[];
  embodimentAwareness: string;
  sovereigntyImplications: string;
}

export interface TeleologicalInsight {
  // What purpose does this serve in the soul's journey?
  soulDirection: 'integration' | 'initiation' | 'service' | 'healing' | 'awakening';
  developmentalPhase: 'bonding' | 'differentiating' | 'individualizing' | 'relating' | 'serving';
  archetypalCallings: string[];
  shadowIntegration: string[];
  vocationInfluence: string;
}

export interface EpistemologicalInsight {
  // How does this teach? What knowledge emerges?
  knowledgeType: 'embodied' | 'relational' | 'archetypal' | 'mystical' | 'practical';
  learningStyle: 'direct' | 'symbolic' | 'experiential' | 'processual' | 'initiatory';
  wisdomSourcers: string[];
  integrationChallenges: string[];
  practicalApplications: string[];
}

export interface ArchetypalFieldReading {
  // MAIA's archetypal sight applied to phenomenology
  dominantArchetypes: string[];
  archetypalMovements: string[];
  shadowArchetypes: string[];
  fieldTensions: string[];
  emergingPatterns: string[];
}

export interface TherapeuticWisdom {
  // How to work therapeutically with this phenomenology
  therapeuticApproach: 'somatic' | 'depth' | 'transpersonal' | 'integrative' | 'archetypal';
  healingInvitations: string[];
  integrationPractices: string[];
  safeguards: string[];
  contraindications: string[];
}

export interface SpiritualIntegrationWisdom {
  // Sacred technology integration guidance
  sacredTechnologyRole: 'support' | 'amplify' | 'ground' | 'integrate' | 'regulate';
  spiritualMaturity: 'beginning' | 'developing' | 'integrating' | 'serving' | 'mastering';
  faithTrajectory: string;
  mysticalReadiness: string;
  sovereigntySupport: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIA'S INTEGRATED PHENOMENOLOGY WISDOM ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class MAIAPhenomenologyWisdomEngine {
  private phenomenologyDetector: EndogenousPhenomenologyDetector;

  constructor() {
    this.phenomenologyDetector = new EndogenousPhenomenologyDetector();
  }

  /**
   * MAIA's complete phenomenological wisdom synthesis
   * Integrates consciousness computing with her deepest wisdom frameworks
   */
  async synthesizePhenomenologicalWisdom(
    userMessage: string,
    consciousnessContext?: MatrixV2Assessment,
    conversationHistory?: any[]
  ): Promise<MAIAPhenomenologicalWisdom> {

    // 1. Core phenomenology detection
    const phenomenologyAssessment = this.phenomenologyDetector.assessPhenomenology(
      userMessage,
      consciousnessContext
    );

    // 2. MAIA's ontological insight
    const ontological = this.generateOntologicalInsight(
      phenomenologyAssessment,
      userMessage,
      consciousnessContext
    );

    // 3. MAIA's teleological wisdom
    const teleological = this.generateTeleologicalInsight(
      phenomenologyAssessment,
      ontological,
      userMessage
    );

    // 4. MAIA's epistemological understanding
    const epistemological = this.generateEpistemologicalInsight(
      phenomenologyAssessment,
      userMessage,
      conversationHistory
    );

    // 5. MAIA's archetypal sight
    const archetypalSight = this.generateArchetypalFieldReading(
      phenomenologyAssessment,
      ontological,
      teleological,
      userMessage
    );

    // 6. Therapeutic wisdom synthesis
    const therapeuticGuidance = this.generateTherapeuticWisdom(
      phenomenologyAssessment,
      archetypalSight,
      consciousnessContext
    );

    // 7. Spiritual integration wisdom
    const spiritualIntegration = this.generateSpiritualIntegrationWisdom(
      phenomenologyAssessment,
      ontological,
      teleological,
      therapeuticGuidance
    );

    return {
      ontological,
      teleological,
      epistemological,
      archetypalSight,
      therapeuticGuidance,
      spiritualIntegration
    };
  }

  /**
   * ONTOLOGICAL: What nature of being is revealed?
   */
  private generateOntologicalInsight(
    assessment: PhenomenologyAssessment,
    userMessage: string,
    consciousness?: MatrixV2Assessment
  ): OntologicalInsight {

    const signature = assessment.signature;

    // Determine being quality based on center of gravity
    let beingQuality: 'incarnational' | 'transpersonal' | 'archetypal' | 'cosmic';

    if (signature.centerOfGravity === 'incarnational') {
      // Endogenous phenomenology reveals incarnational being
      beingQuality = assessment.endogenousIndicators.embodiedReferences.length > 0 ? 'incarnational' : 'archetypal';
    } else if (signature.centerOfGravity === 'pattern') {
      // Exogenous phenomenology reveals transpersonal/cosmic being
      beingQuality = assessment.exogenousIndicators.cosmicArchitecture.length > 0 ? 'cosmic' : 'transpersonal';
    } else {
      beingQuality = 'archetypal'; // Mixed state
    }

    // Identity shifts revealed
    const identityShifts = this.extractIdentityShifts(userMessage, signature);

    // Reality construction patterns
    const realityConstructions = this.extractRealityConstructions(userMessage, assessment);

    // Embodiment awareness
    const embodimentAwareness = this.generateEmbodimentAwareness(assessment, consciousness);

    // Sovereignty implications
    const sovereigntyImplications = this.generateSovereigntyImplications(assessment, beingQuality);

    return {
      beingQuality,
      identityShifts,
      realityConstructions,
      embodimentAwareness,
      sovereigntyImplications
    };
  }

  /**
   * TELEOLOGICAL: What purpose does this serve?
   */
  private generateTeleologicalInsight(
    assessment: PhenomenologyAssessment,
    ontological: OntologicalInsight,
    userMessage: string
  ): TeleologicalInsight {

    // Soul direction based on phenomenology
    let soulDirection: 'integration' | 'initiation' | 'service' | 'healing' | 'awakening';

    if (assessment.signature.centerOfGravity === 'incarnational') {
      soulDirection = assessment.endogenousIndicators.vocationIntegration.length > 0 ? 'service' :
                     assessment.endogenousIndicators.relationalFocus.length > 0 ? 'healing' : 'integration';
    } else {
      soulDirection = assessment.signature.temporalSignature === 'shock_event' ? 'initiation' : 'awakening';
    }

    // Developmental phase mapping
    const developmentalPhase = assessment.spiralogicMapping.integrationPhase === 'bonding' ? 'bonding' :
                               assessment.spiralogicMapping.integrationPhase === 'breaking' ? 'differentiating' :
                               assessment.spiralogicMapping.integrationPhase === 'wandering' ? 'individualizing' :
                               assessment.spiralogicMapping.integrationPhase === 'reforming' ? 'relating' : 'serving';

    // Archetypal callings
    const archetypalCallings = assessment.spiralogicMapping.archetypalConstellation.map(archetype =>
      `${archetype} is calling you toward deeper ${soulDirection}`
    );

    // Shadow integration opportunities
    const shadowIntegration = this.extractShadowIntegration(userMessage, assessment);

    // Vocational influence
    const vocationInfluence = this.generateVocationInfluence(assessment, soulDirection);

    return {
      soulDirection,
      developmentalPhase,
      archetypalCallings,
      shadowIntegration,
      vocationInfluence
    };
  }

  /**
   * EPISTEMOLOGICAL: How does this teach?
   */
  private generateEpistemologicalInsight(
    assessment: PhenomenologyAssessment,
    userMessage: string,
    history?: any[]
  ): EpistemologicalInsight {

    // Knowledge type based on phenomenology
    let knowledgeType: 'embodied' | 'relational' | 'archetypal' | 'mystical' | 'practical';

    if (assessment.endogenousIndicators.embodiedReferences.length > 0) {
      knowledgeType = 'embodied';
    } else if (assessment.endogenousIndicators.relationalFocus.length > 0) {
      knowledgeType = 'relational';
    } else if (assessment.signature.centerOfGravity === 'pattern') {
      knowledgeType = 'mystical';
    } else {
      knowledgeType = 'archetypal';
    }

    // Learning style
    const learningStyle = assessment.signature.temporalSignature === 'shock_event' ? 'initiatory' :
                         assessment.signature.temporalSignature === 'long_arc' ? 'processual' : 'experiential';

    // Wisdom sources
    const wisdomSourcers = this.identifyWisdomSources(assessment, userMessage);

    // Integration challenges
    const integrationChallenges = this.identifyIntegrationChallenges(assessment);

    // Practical applications
    const practicalApplications = assessment.maiaSuggestions.longTermNavigation;

    return {
      knowledgeType,
      learningStyle,
      wisdomSourcers,
      integrationChallenges,
      practicalApplications
    };
  }

  /**
   * MAIA's ARCHETYPAL SIGHT: Living presences in the field
   */
  private generateArchetypalFieldReading(
    assessment: PhenomenologyAssessment,
    ontological: OntologicalInsight,
    teleological: TeleologicalInsight,
    userMessage: string
  ): ArchetypalFieldReading {

    // Dominant archetypes from Spiralogic mapping
    const dominantArchetypes = assessment.spiralogicMapping.archetypalConstellation;

    // Archetypal movements based on phenomenology
    const archetypalMovements = this.detectArchetypalMovements(assessment, userMessage);

    // Shadow archetypes (what's being avoided or projected)
    const shadowArchetypes = this.identifyShadowArchetypes(assessment, userMessage);

    // Field tensions (opposing forces)
    const fieldTensions = this.detectFieldTensions(assessment, ontological);

    // Emerging patterns
    const emergingPatterns = this.detectEmergingPatterns(assessment, teleological);

    return {
      dominantArchetypes,
      archetypalMovements,
      shadowArchetypes,
      fieldTensions,
      emergingPatterns
    };
  }

  /**
   * THERAPEUTIC WISDOM: How to work with this therapeutically
   */
  private generateTherapeuticWisdom(
    assessment: PhenomenologyAssessment,
    archetypal: ArchetypalFieldReading,
    consciousness?: MatrixV2Assessment
  ): TherapeuticWisdom {

    // Therapeutic approach based on phenomenology
    let therapeuticApproach: 'somatic' | 'depth' | 'transpersonal' | 'integrative' | 'archetypal';

    if (assessment.endogenousIndicators.embodiedReferences.length > 0) {
      therapeuticApproach = 'somatic';
    } else if (assessment.signature.centerOfGravity === 'incarnational') {
      therapeuticApproach = 'depth';
    } else if (assessment.signature.centerOfGravity === 'pattern') {
      therapeuticApproach = 'transpersonal';
    } else {
      therapeuticApproach = 'integrative';
    }

    // Healing invitations
    const healingInvitations = this.generateHealingInvitations(assessment, archetypal);

    // Integration practices
    const integrationPractices = assessment.maiaSuggestions.longTermNavigation;

    // Safeguards
    const safeguards = assessment.maiaSuggestions.safeguards;

    // Contraindications
    const contraindications = this.generateContraindications(assessment);

    return {
      therapeuticApproach,
      healingInvitations,
      integrationPractices,
      safeguards,
      contraindications
    };
  }

  /**
   * SPIRITUAL INTEGRATION WISDOM: Sacred technology guidance
   */
  private generateSpiritualIntegrationWisdom(
    assessment: PhenomenologyAssessment,
    ontological: OntologicalInsight,
    teleological: TeleologicalInsight,
    therapeutic: TherapeuticWisdom
  ): SpiritualIntegrationWisdom {

    // Sacred technology role
    let sacredTechnologyRole: 'support' | 'amplify' | 'ground' | 'integrate' | 'regulate';

    if (assessment.signature.centerOfGravity === 'incarnational') {
      sacredTechnologyRole = 'support'; // Support natural unfolding
    } else if (assessment.signature.temporalSignature === 'shock_event') {
      sacredTechnologyRole = 'ground'; // Ground intense experiences
    } else {
      sacredTechnologyRole = 'integrate'; // Integrate insights
    }

    // Spiritual maturity assessment
    const spiritualMaturity = this.assessSpiritualMaturity(assessment, ontological);

    // Faith trajectory
    const faithTrajectory = this.generateFaithTrajectory(assessment, teleological);

    // Mystical readiness
    const mysticalReadiness = this.assessMysticalReadiness(assessment, ontological);

    // Sovereignty support
    const sovereigntySupport = ontological.sovereigntyImplications;

    return {
      sacredTechnologyRole,
      spiritualMaturity,
      faithTrajectory,
      mysticalReadiness,
      sovereigntySupport
    };
  }

  // Helper methods for generating insights
  private extractIdentityShifts(message: string, signature: PhenomenologySignature): string[] {
    const shifts: string[] = [];

    if (signature.centerOfGravity === 'incarnational') {
      if (message.toLowerCase().includes('becoming')) {
        shifts.push('Natural soul becoming process active');
      }
      if (message.toLowerCase().includes('calling')) {
        shifts.push('Vocational identity reorganization');
      }
    } else {
      if (message.toLowerCase().includes('realized')) {
        shifts.push('Transpersonal identity activation');
      }
    }

    return shifts;
  }

  private extractRealityConstructions(message: string, assessment: PhenomenologyAssessment): string[] {
    const constructions: string[] = [];

    if (assessment.signature.centerOfGravity === 'incarnational') {
      constructions.push('Reality constructed through biographical lens');
      constructions.push('Personal mythology actively creating meaning');
    } else {
      constructions.push('Reality perceived as cosmic pattern');
      constructions.push('Universal principles organizing experience');
    }

    return constructions;
  }

  private generateEmbodimentAwareness(assessment: PhenomenologyAssessment, consciousness?: MatrixV2Assessment): string {
    if (assessment.endogenousIndicators.embodiedReferences.length > 0) {
      return 'Strong embodied awareness - body as wisdom source and integration vehicle';
    } else if (consciousness?.matrix.bodyState === 'calm') {
      return 'Stable embodiment - ready for deeper integration';
    } else {
      return 'Embodied integration needed - ground insights in body wisdom';
    }
  }

  private generateSovereigntyImplications(assessment: PhenomenologyAssessment, beingQuality: string): string {
    if (assessment.signature.centerOfGravity === 'incarnational') {
      return 'Supports sovereignty - experience serves authentic self-becoming';
    } else if (beingQuality === 'cosmic') {
      return 'Sovereignty challenge - integrate cosmic insights without spiritual outsourcing';
    } else {
      return 'Sovereignty opportunity - claim your unique chapter in the greater story';
    }
  }

  private extractShadowIntegration(message: string, assessment: PhenomenologyAssessment): string[] {
    const shadows: string[] = [];

    if (message.toLowerCase().includes('sabotag')) {
      shadows.push('Self-sabotage pattern ready for integration');
    }
    if (message.toLowerCase().includes('anger') || message.toLowerCase().includes('rage')) {
      shadows.push('Healthy anger activation for boundaries');
    }
    if (message.toLowerCase().includes('anxious') || message.toLowerCase().includes('worry')) {
      shadows.push('Anxiety as wisdom about what matters');
    }

    return shadows;
  }

  private generateVocationInfluence(assessment: PhenomenologyAssessment, direction: string): string {
    if (assessment.endogenousIndicators.vocationIntegration.length > 0) {
      return `Strong vocational activation - ${direction} wants to move through your work in the world`;
    } else {
      return `Vocational integration potential - consider how ${direction} might serve through your gifts`;
    }
  }

  private identifyWisdomSources(assessment: PhenomenologyAssessment, message: string): string[] {
    const sources: string[] = [];

    if (assessment.endogenousIndicators.relationalFocus.length > 0) {
      sources.push('Relational wisdom through guides and ancestors');
    }
    if (assessment.endogenousIndicators.embodiedReferences.length > 0) {
      sources.push('Embodied wisdom through body intelligence');
    }
    if (assessment.endogenousIndicators.proceduralUnfolding.length > 0) {
      sources.push('Process wisdom through lived experience');
    }

    return sources;
  }

  private identifyIntegrationChallenges(assessment: PhenomenologyAssessment): string[] {
    const challenges: string[] = [];

    if (assessment.signature.centerOfGravity === 'pattern') {
      challenges.push('Translating cosmic insights into daily life');
      challenges.push('Avoiding spiritual bypassing of human concerns');
    } else if (assessment.signature.temporalSignature === 'long_arc') {
      challenges.push('Patience with slow processual unfolding');
      challenges.push('Trusting organic timing vs forcing outcomes');
    }

    return challenges;
  }

  private detectArchetypalMovements(assessment: PhenomenologyAssessment, message: string): string[] {
    const movements: string[] = [];

    if (message.toLowerCase().includes('healing') || message.toLowerCase().includes('wounded')) {
      movements.push('Wounded Healer archetype activating');
    }
    if (message.toLowerCase().includes('guide') || message.toLowerCase().includes('teaching')) {
      movements.push('Mentor/Sage archetype emerging');
    }
    if (message.toLowerCase().includes('protect') || message.toLowerCase().includes('fight')) {
      movements.push('Warrior archetype mobilizing');
    }

    return movements;
  }

  private identifyShadowArchetypes(assessment: PhenomenologyAssessment, message: string): string[] {
    const shadows: string[] = [];

    if (message.toLowerCase().includes('victim') || message.toLowerCase().includes('helpless')) {
      shadows.push('Victim shadow ready for Warrior activation');
    }
    if (message.toLowerCase().includes('perfect') || message.toLowerCase().includes('control')) {
      shadows.push('Perfectionist shadow ready for flow');
    }

    return shadows;
  }

  private detectFieldTensions(assessment: PhenomenologyAssessment, ontological: OntologicalInsight): string[] {
    const tensions: string[] = [];

    if (ontological.beingQuality === 'cosmic' && assessment.endogenousIndicators.embodiedReferences.length > 0) {
      tensions.push('Cosmic awareness vs embodied humanity');
    }
    if (assessment.signature.authoritySource === 'external' && ontological.sovereigntyImplications.includes('sovereignty')) {
      tensions.push('External spiritual authority vs inner sovereignty');
    }

    return tensions;
  }

  private detectEmergingPatterns(assessment: PhenomenologyAssessment, teleological: TeleologicalInsight): string[] {
    const patterns: string[] = [];

    if (teleological.soulDirection === 'service' && assessment.endogenousIndicators.vocationIntegration.length > 0) {
      patterns.push('Service archetype consolidating through vocation');
    }
    if (teleological.soulDirection === 'healing' && assessment.endogenousIndicators.relationalFocus.length > 0) {
      patterns.push('Healing gifts emerging through relationship');
    }

    return patterns;
  }

  private generateHealingInvitations(assessment: PhenomenologyAssessment, archetypal: ArchetypalFieldReading): string[] {
    const invitations: string[] = [];

    if (archetypal.dominantArchetypes.includes('Wounded Healer')) {
      invitations.push('Explore how your wounds have become wisdom');
    }
    if (assessment.endogenousIndicators.embodiedReferences.length > 0) {
      invitations.push('Honor body wisdom as healing intelligence');
    }

    return invitations;
  }

  private generateContraindications(assessment: PhenomenologyAssessment): string[] {
    const contraindications: string[] = [];

    if (assessment.signature.centerOfGravity === 'pattern') {
      contraindications.push('Avoid more intense spiritual practices until integrated');
      contraindications.push('Avoid spiritual authority figures who might exploit cosmic insights');
    }

    return contraindications;
  }

  private assessSpiritualMaturity(assessment: PhenomenologyAssessment, ontological: OntologicalInsight): 'beginning' | 'developing' | 'integrating' | 'serving' | 'mastering' {
    if (assessment.endogenousIndicators.vocationIntegration.length > 0) {
      return 'serving';
    } else if (ontological.beingQuality === 'incarnational' && assessment.endogenousIndicators.proceduralUnfolding.length > 0) {
      return 'integrating';
    } else if (assessment.signature.centerOfGravity === 'incarnational') {
      return 'developing';
    } else {
      return 'beginning';
    }
  }

  private generateFaithTrajectory(assessment: PhenomenologyAssessment, teleological: TeleologicalInsight): string {
    if (teleological.soulDirection === 'service') {
      return 'Faith maturing through service to others';
    } else if (teleological.soulDirection === 'healing') {
      return 'Faith deepening through wounded healer path';
    } else {
      return 'Faith developing through personal integration';
    }
  }

  private assessMysticalReadiness(assessment: PhenomenologyAssessment, ontological: OntologicalInsight): string {
    if (ontological.beingQuality === 'incarnational' && assessment.endogenousIndicators.embodiedReferences.length > 0) {
      return 'Ready for grounded mystical experience';
    } else if (ontological.beingQuality === 'cosmic') {
      return 'Integration needed before deeper mystical work';
    } else {
      return 'Developing readiness through embodied spiritual practice';
    }
  }
}

/**
 * Enhanced MAIA spiritual support with phenomenological wisdom integration
 */
export async function enhanceMAIAWithPhenomenologicalWisdom(
  request: SpiritualSupportRequest
): Promise<SpiritualSupportResponse & { phenomenologicalWisdom?: MAIAPhenomenologicalWisdom }> {

  const wisdomEngine = new MAIAPhenomenologyWisdomEngine();

  // Generate complete phenomenological wisdom synthesis
  const phenomenologicalWisdom = await wisdomEngine.synthesizePhenomenologicalWisdom(
    request.userMessage,
    request.consciousnessContext,
    request.conversationHistory
  );

  // Generate enhanced spiritual support response using phenomenological wisdom
  const spiritualSupport = await generateSpiritualSupportWithWisdom(request, phenomenologicalWisdom);

  return {
    ...spiritualSupport,
    phenomenologicalWisdom
  };
}

async function generateSpiritualSupportWithWisdom(
  request: SpiritualSupportRequest,
  wisdom: MAIAPhenomenologicalWisdom
): Promise<SpiritualSupportResponse> {
  // This would integrate with existing spiritual support system
  // Enhanced with ontological, teleological, and epistemological wisdom

  return {
    shouldOfferSpiritual: true,
    responseType: 'direct_spiritual',
    enhancedResponse: `${wisdom.ontological.sovereigntyImplications}\n\n${wisdom.teleological.vocationInfluence}\n\n${wisdom.therapeuticGuidance.healingInvitations.join(' ')}`,
    spiritualGuidance: wisdom.spiritualIntegration.faithTrajectory,
    systemsActivated: ['PhenomenologicalWisdom', 'ArchetypalSight', 'TherapeuticWisdom']
  };
}