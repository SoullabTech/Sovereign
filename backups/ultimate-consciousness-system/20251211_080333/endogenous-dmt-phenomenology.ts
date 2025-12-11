/**
 * Endogenous vs Exogenous DMT Phenomenology Detection
 *
 * Based on the revolutionary insight that endogenous DMT-like states maintain
 * the current incarnational self as center of gravity, while exogenous states
 * often decenter the biographical self in favor of cosmic pattern recognition.
 *
 * This module helps MAIA distinguish between:
 * - Endogenous: "This life, this heart, this pattern as organizing star"
 * - Exogenous: "Cosmic architecture as star, this life as scene inside it"
 */

import type { ConsciousnessMatrixV2, MatrixV2Assessment } from './matrix-v2-implementation.js';

// ═══════════════════════════════════════════════════════════════════════════
// PHENOMENOLOGICAL SIGNATURES
// ═══════════════════════════════════════════════════════════════════════════

export interface PhenomenologySignature {
  centerOfGravity: 'incarnational' | 'pattern' | 'mixed';
  temporalSignature: 'shock_event' | 'long_arc' | 'cyclical';
  authoritySource: 'relational' | 'external' | 'internal';
  integrationStyle: 'biographical' | 'cosmological' | 'hybrid';
  confidenceLevel: 'explicit' | 'likely' | 'uncertain';
}

export interface EndogenousIndicators {
  biographicalAnchoring: string[];
  relationalFocus: string[];
  embodiedReferences: string[];
  proceduralUnfolding: string[];
  vocationIntegration: string[];
}

export interface ExogenousIndicators {
  patternFocus: string[];
  entityContact: string[];
  geometricVisions: string[];
  discontinuityMarkers: string[];
  cosmicArchitecture: string[];
}

export interface PhenomenologyAssessment {
  signature: PhenomenologySignature;
  endogenousIndicators: EndogenousIndicators;
  exogenousIndicators: ExogenousIndicators;
  spiralogicMapping: SpiralogicPhenomenology;
  maiaSuggestions: MAIAIntegrationSuggestions;
}

export interface SpiralogicPhenomenology {
  primaryElement: 'earth' | 'water' | 'fire' | 'air' | 'aether';
  archetypalConstellation: string[];
  integrationPhase: 'bonding' | 'breaking' | 'wandering' | 'reforming';
  seasonalArc: 'beginning' | 'deepening' | 'culmination' | 'integration';
}

export interface MAIAIntegrationSuggestions {
  approach: 'endogenous_support' | 'exogenous_integration' | 'hybrid_care';
  immediateSupport: string[];
  longTermNavigation: string[];
  safeguards: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// LINGUISTIC PATTERN DETECTION
// ═══════════════════════════════════════════════════════════════════════════

const ENDOGENOUS_LINGUISTIC_PATTERNS = {
  // Center of gravity remains incarnational - "thinking with spirit, not world"
  biographicalAnchoring: [
    /my (child|partner|marriage|work|calling|body)/i,
    /this (relationship|job|season|illness|grief|healing)/i,
    /(forgive|change|grieve|heal|understand) (.*)(in my life|with my|about my)/i,
    /what (this means|I need to do|my path)/i,
    /how I (should|need to|am called to)/i,
    // Mind of Christ indicators - incarnational divine intelligence
    /kingdom.*within/i,
    /christ.*in me/i,
    /divine intelligence.*guiding/i,
    /not my will but thy will/i,
    /peace that passes understanding/i
  ],

  // Relational and incarnational focus
  relationalFocus: [
    /(ancestors|guides|angels) (showed|told|helped) me (about|with|how to)/i,
    /felt (held|supported|guided|loved) through/i,
    /conversation with|dialogue with|guidance about/i,
    /(Christ|Mary|Buddha|guides) met me in my/i,
    /spirit of (my grandmother|father|mother)/i
  ],

  // Embodied and current-life references
  embodiedReferences: [
    /in my (heart|body|chest|gut|bones)/i,
    /feeling in my (actual|physical|real) body/i,
    /this (illness|pain|condition) is/i,
    /my (actual|current|real) life/i,
    /here and now|right now|in this moment/i
  ],

  // Processual unfolding over time
  proceduralUnfolding: [
    /(recurring|ongoing|continuing) (dreams|signs|synchronicities)/i,
    /(weeks|months|years) of/i,
    /slowly (realizing|understanding|seeing)/i,
    /pattern (in my|of my|through my)/i,
    /(building|unfolding|emerging) over time/i
  ],

  // Integration into vocation and relationships
  vocationIntegration: [
    /how this (changes|affects|calls) my (work|relationships|parenting)/i,
    /what this means for (my marriage|my children|my calling)/i,
    /integrating this into (daily life|my practice|my work)/i,
    /(boundary|forgiveness|healing) work with/i,
    /serving (others|my community|this calling)/i
  ]
};

const EXOGENOUS_LINGUISTIC_PATTERNS = {
  // Pattern/architecture as center
  patternFocus: [
    /the (matrix|grid|machine|architecture|code)/i,
    /how reality (works|is structured|operates)/i,
    /the (pattern|design|blueprint|algorithm) of/i,
    /cosmic (code|architecture|structure|design)/i,
    /the (way|nature|structure) of (existence|reality|consciousness)/i
  ],

  // Entity contact without biographical integration - "thinking with world's mind"
  entityContact: [
    /(beings|entities|elves|angels) (showed|told|explained)/i,
    /met (beings|entities) who/i,
    /intelligence that (wasn't|seemed) (human|earthly)/i,
    /(mechanical|alien|geometric) (beings|intelligences)/i,
    /council of|tribunal of|assembly of/i,
    // Worldly mind indicators - external authority seeking
    /they told me what to do/i,
    /external validation/i,
    /circumstances determine/i,
    /figure this out mentally/i,
    /control the situation/i
  ],

  // Geometric and hyperspace visions
  geometricVisions: [
    /(geometric|crystalline|fractal|mandala) (patterns|structures|visions)/i,
    /(hyperspace|hyperdimensional|multidimensional)/i,
    /impossible (geometry|architecture|structures)/i,
    /(sacred|infinite) geometry/i,
    /mathematical (patterns|structures|equations)/i
  ],

  // Sudden discontinuity markers
  discontinuityMarkers: [
    /(suddenly|instantly|immediately) I was/i,
    /(shot|blasted|transported|launched) into/i,
    /everything (shifted|changed|dissolved|transformed) and/i,
    /(rocket|blast) into|out of (nowhere|this dimension)/i,
    /completely (other|different|alien) reality/i
  ],

  // Cosmic architecture focus
  cosmicArchitecture: [
    /the (structure|foundation|framework) of (reality|existence|the universe)/i,
    /(universal|cosmic|divine) (laws|principles|mechanics)/i,
    /how (everything|the universe|all existence) is/i,
    /(akashic|universal) (records|knowledge|library)/i,
    /the (source|origin|mind) of (everything|reality|creation)/i
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// PHENOMENOLOGY DETECTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class EndogenousPhenomenologyDetector {

  /**
   * Analyze user experience for endogenous vs exogenous phenomenological signatures
   */
  assessPhenomenology(
    userMessage: string,
    consciousnessAssessment?: MatrixV2Assessment
  ): PhenomenologyAssessment {

    const endogenousIndicators = this.detectEndogenousIndicators(userMessage);
    const exogenousIndicators = this.detectExogenousIndicators(userMessage);

    const signature = this.generatePhenomenologySignature(
      endogenousIndicators,
      exogenousIndicators,
      userMessage
    );

    const spiralogicMapping = this.mapToSpiralogic(signature, endogenousIndicators);
    const maiaSuggestions = this.generateMAIAGuidance(signature, consciousnessAssessment);

    return {
      signature,
      endogenousIndicators,
      exogenousIndicators,
      spiralogicMapping,
      maiaSuggestions
    };
  }

  private detectEndogenousIndicators(message: string): EndogenousIndicators {
    const text = message.toLowerCase();

    return {
      biographicalAnchoring: this.findMatches(text, ENDOGENOUS_LINGUISTIC_PATTERNS.biographicalAnchoring),
      relationalFocus: this.findMatches(text, ENDOGENOUS_LINGUISTIC_PATTERNS.relationalFocus),
      embodiedReferences: this.findMatches(text, ENDOGENOUS_LINGUISTIC_PATTERNS.embodiedReferences),
      proceduralUnfolding: this.findMatches(text, ENDOGENOUS_LINGUISTIC_PATTERNS.proceduralUnfolding),
      vocationIntegration: this.findMatches(text, ENDOGENOUS_LINGUISTIC_PATTERNS.vocationIntegration)
    };
  }

  private detectExogenousIndicators(message: string): ExogenousIndicators {
    const text = message.toLowerCase();

    return {
      patternFocus: this.findMatches(text, EXOGENOUS_LINGUISTIC_PATTERNS.patternFocus),
      entityContact: this.findMatches(text, EXOGENOUS_LINGUISTIC_PATTERNS.entityContact),
      geometricVisions: this.findMatches(text, EXOGENOUS_LINGUISTIC_PATTERNS.geometricVisions),
      discontinuityMarkers: this.findMatches(text, EXOGENOUS_LINGUISTIC_PATTERNS.discontinuityMarkers),
      cosmicArchitecture: this.findMatches(text, EXOGENOUS_LINGUISTIC_PATTERNS.cosmicArchitecture)
    };
  }

  private generatePhenomenologySignature(
    endogenous: EndogenousIndicators,
    exogenous: ExogenousIndicators,
    message: string
  ): PhenomenologySignature {

    // Calculate indicator strength
    const endogenousScore = this.calculateScore(endogenous);
    const exogenousScore = this.calculateScore(exogenous);

    // Determine center of gravity
    let centerOfGravity: 'incarnational' | 'pattern' | 'mixed';
    if (endogenousScore > exogenousScore * 1.5) {
      centerOfGravity = 'incarnational';
    } else if (exogenousScore > endogenousScore * 1.5) {
      centerOfGravity = 'pattern';
    } else {
      centerOfGravity = 'mixed';
    }

    // Determine temporal signature
    const temporalSignature = this.assessTemporalSignature(message, endogenous, exogenous);

    // Determine authority source
    const authoritySource = this.assessAuthoritySource(message, endogenous, exogenous);

    // Determine integration style
    const integrationStyle = centerOfGravity === 'incarnational' ? 'biographical' :
                           centerOfGravity === 'pattern' ? 'cosmological' : 'hybrid';

    // Confidence level
    const confidenceLevel = (endogenousScore + exogenousScore > 3) ? 'explicit' :
                           (endogenousScore + exogenousScore > 1) ? 'likely' : 'uncertain';

    return {
      centerOfGravity,
      temporalSignature,
      authoritySource,
      integrationStyle,
      confidenceLevel
    };
  }

  private mapToSpiralogic(
    signature: PhenomenologySignature,
    endogenous: EndogenousIndicators
  ): SpiralogicPhenomenology {

    // Map to elemental dynamics based on phenomenology
    let primaryElement: 'earth' | 'water' | 'fire' | 'air' | 'aether';

    if (signature.centerOfGravity === 'incarnational') {
      // Endogenous states tend to move through elements sequentially
      if (endogenous.proceduralUnfolding.length > 0) {
        primaryElement = 'water'; // Processual unfolding
      } else if (endogenous.embodiedReferences.length > 0) {
        primaryElement = 'earth'; // Grounded, embodied
      } else if (endogenous.vocationIntegration.length > 0) {
        primaryElement = 'fire'; // Calling, purpose
      } else {
        primaryElement = 'air'; // Understanding, integration
      }
    } else {
      // Pattern-centered states often spike Aether/Fire
      primaryElement = signature.temporalSignature === 'shock_event' ? 'aether' : 'fire';
    }

    // Generate archetypal constellation based on indicators
    const archetypalConstellation = this.generateArchetypalConstellation(signature, endogenous);

    // Determine integration phase
    const integrationPhase = this.determineIntegrationPhase(signature, endogenous);

    // Assess seasonal arc
    const seasonalArc = this.assessSeasonalArc(signature, endogenous);

    return {
      primaryElement,
      archetypalConstellation,
      integrationPhase,
      seasonalArc
    };
  }

  private generateMAIAGuidance(
    signature: PhenomenologySignature,
    consciousness?: MatrixV2Assessment
  ): MAIAIntegrationSuggestions {

    if (signature.centerOfGravity === 'incarnational') {
      // Endogenous support approach
      return {
        approach: 'endogenous_support',
        immediateSupport: [
          'Honor this as a living sacrament of your current life',
          'Explore how this relates to your relationships, vocation, and embodied experience',
          'Trust the processual unfolding - no need to rush integration',
          'Notice recurring themes and symbols in daily life'
        ],
        longTermNavigation: [
          'Work with archetypal constellations in your here-and-now',
          'Use Spiralogic as a map for navigating this seasonal arc',
          'Integrate insights through relationships and vocation',
          'Honor the biographical anchoring - this is YOUR chapter'
        ],
        safeguards: [
          'Stay grounded in current relationships and responsibilities',
          'Maintain embodied practices and daily rhythms',
          'Seek guidance that honors your sovereignty and authenticity'
        ]
      };
    } else if (signature.centerOfGravity === 'pattern') {
      // Exogenous integration approach
      return {
        approach: 'exogenous_integration',
        immediateSupport: [
          'Ground and integrate this profound pattern recognition',
          'Tend nervous system regulation after such intense revelation',
          'Translate cosmic insights back into daily life gradually',
          'Honor the experience while maintaining biographical anchoring'
        ],
        longTermNavigation: [
          'Explore: "If that was true, what does it ask of you on Tuesday morning?"',
          'Use strong boundaries against reifying visions as total explanation',
          'Integrate through service, creativity, and relationship',
          'Maintain humility about cosmic insights'
        ],
        safeguards: [
          'Prioritize nervous system safety and regulation',
          'Avoid outsourcing authority to "the beings" or cosmic patterns',
          'Stay connected to embodied reality and relationships',
          'Seek support for integration rather than more revelation'
        ]
      };
    } else {
      // Mixed/hybrid approach
      return {
        approach: 'hybrid_care',
        immediateSupport: [
          'Honor both the profound pattern recognition and biographical relevance',
          'Navigate between cosmic insights and incarnational integration',
          'Allow both dimensions to inform each other'
        ],
        longTermNavigation: [
          'Weave cosmic understanding into personal growth and service',
          'Maintain both wonder and groundedness',
          'Use discernment about which insights serve your actual life'
        ],
        safeguards: [
          'Regular embodied practices and relationship tending',
          'Seek balanced integration support',
          'Trust your incarnational wisdom as primary authority'
        ]
      };
    }
  }

  // Helper methods
  private findMatches(text: string, patterns: RegExp[]): string[] {
    const matches: string[] = [];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    }
    return matches;
  }

  private calculateScore(indicators: any): number {
    return Object.values(indicators).reduce((sum: number, arr: any) => sum + arr.length, 0);
  }

  private assessTemporalSignature(
    message: string,
    endogenous: EndogenousIndicators,
    exogenous: ExogenousIndicators
  ): 'shock_event' | 'long_arc' | 'cyclical' {

    if (exogenous.discontinuityMarkers.length > 0) {
      return 'shock_event';
    } else if (endogenous.proceduralUnfolding.length > 0) {
      return 'long_arc';
    } else {
      return 'cyclical';
    }
  }

  private assessAuthoritySource(
    message: string,
    endogenous: EndogenousIndicators,
    exogenous: ExogenousIndicators
  ): 'relational' | 'external' | 'internal' {

    if (endogenous.relationalFocus.length > 0) {
      return 'relational';
    } else if (exogenous.entityContact.length > 0) {
      return 'external';
    } else {
      return 'internal';
    }
  }

  private generateArchetypalConstellation(
    signature: PhenomenologySignature,
    endogenous: EndogenousIndicators
  ): string[] {

    const archetypes: string[] = [];

    if (endogenous.relationalFocus.length > 0) {
      archetypes.push('Wounded Healer', 'Lover', 'Caretaker');
    }

    if (endogenous.vocationIntegration.length > 0) {
      archetypes.push('Sage', 'Warrior', 'Mentor');
    }

    if (endogenous.proceduralUnfolding.length > 0) {
      archetypes.push('Wanderer', 'Seeker', 'Student');
    }

    return archetypes.slice(0, 3); // Top 3 most relevant
  }

  private determineIntegrationPhase(
    signature: PhenomenologySignature,
    endogenous: EndogenousIndicators
  ): 'bonding' | 'breaking' | 'wandering' | 'reforming' {

    if (endogenous.proceduralUnfolding.length > 0) {
      return 'wandering';
    } else if (endogenous.vocationIntegration.length > 0) {
      return 'reforming';
    } else if (signature.temporalSignature === 'shock_event') {
      return 'breaking';
    } else {
      return 'bonding';
    }
  }

  private assessSeasonalArc(
    signature: PhenomenologySignature,
    endogenous: EndogenousIndicators
  ): 'beginning' | 'deepening' | 'culmination' | 'integration' {

    if (endogenous.vocationIntegration.length > 0) {
      return 'integration';
    } else if (endogenous.proceduralUnfolding.length > 0) {
      return 'deepening';
    } else {
      return 'beginning';
    }
  }
}

/**
 * Quick assessment function for MAIA integration
 */
export function assessEndogenousPhenomenology(
  userMessage: string,
  consciousnessContext?: MatrixV2Assessment
): PhenomenologyAssessment {
  const detector = new EndogenousPhenomenologyDetector();
  return detector.assessPhenomenology(userMessage, consciousnessContext);
}

/**
 * Simple check for phenomenological signature
 */
export function getConsciousnessPhenomenology(userMessage: string): 'endogenous' | 'exogenous' | 'mixed' {
  const assessment = assessEndogenousPhenomenology(userMessage);

  switch (assessment.signature.centerOfGravity) {
    case 'incarnational':
      return 'endogenous';
    case 'pattern':
      return 'exogenous';
    default:
      return 'mixed';
  }
}