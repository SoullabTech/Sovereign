// NavigatorEngineV2.js - Personal Alchemy Navigator
// Integrates Training Notes wisdom, Cultural Intelligence, Spiralogic Universal, and Safety Guardian
// Focus: Personal alchemy through infinite cultural expressions of universal consciousness patterns

const { WisdomScoring } = require('./WisdomScoring');
const { SafetyGuardian } = require('./SafetyGuardian');
const { CulturalIntelligence } = require('./CulturalIntelligence');
const { SpiralogicUniversal } = require('./SpiralogicUniversal');

class NavigatorEngineV2 {

  /**
   * MAIN GUIDANCE ENGINE - Personal Alchemy Focus
   * Same consciousness transformation, infinite cultural expressions
   */
  static async generateAlchemicalGuidance(soulState, availableProtocols, options = {}) {
    try {
      console.log('🧙‍♀️ Navigator v2.0: Starting personal alchemy guidance generation...');

      // STEP 1: Detect cultural context - meet them where they are
      const culturalContext = CulturalIntelligence.detectCulturalContext(soulState);
      console.log('🌍 Cultural Context Detected:', culturalContext.primaryContext);

      // STEP 2: Detect Spiralogic patterns - universal geometry beneath traditions
      const spiralogicAnalysis = SpiralogicUniversal.translateThroughSpiralogic(
        soulState, culturalContext, availableProtocols
      );
      console.log('🌀 Spiralogic Pattern:', spiralogicAnalysis.spiralogicFoundation.spiralogicSignature);

      // STEP 3: Apply safety guardian - wisdom includes protection
      const safetyAssessment = SafetyGuardian.performCompleteSafetyAssessment(
        soulState, spiralogicAnalysis.universalProtocols
      );
      console.log('🛡️ Safety Assessment:', safetyAssessment.assessment.riskLevel);

      // STEP 4: Score protocols through wisdom systems
      const wisdomScoredProtocols = this.scoreProtocolsWithWisdom(
        safetyAssessment.safeProtocols,
        soulState,
        culturalContext,
        spiralogicAnalysis
      );

      // STEP 5: Generate alchemical guidance
      const alchemicalGuidance = this.synthesizeAlchemicalGuidance(
        wisdomScoredProtocols,
        soulState,
        culturalContext,
        spiralogicAnalysis,
        safetyAssessment
      );

      console.log('✨ Personal Alchemy Navigator v2.0: Guidance generated');
      return alchemicalGuidance;

    } catch (error) {
      console.error('🔴 Navigator v2.0 error:', error.message);
      return this.getFailsafeGuidance(soulState, error);
    }
  }

  /**
   * WISDOM SCORING INTEGRATION
   * Combine all wisdom systems for comprehensive scoring
   */
  static scoreProtocolsWithWisdom(safeProtocols, soulState, culturalContext, spiralogicAnalysis) {
    return safeProtocols.map(protocol => {
      // Core wisdom scoring from Training Notes
      const wisdomScore = WisdomScoring.scoreProtocolWisdom(soulState, protocol);

      // Cultural alignment scoring
      const culturalScore = CulturalIntelligence.scoreCulturalAlignment(
        protocol, culturalContext
      );

      // Personal alchemy alignment (new scoring dimension)
      const alchemyScore = this.scorePersonalAlchemy(
        protocol, soulState, spiralogicAnalysis
      );

      // Spiralogic geometric alignment
      const geometricScore = this.scoreSpiralogicAlignment(
        protocol, spiralogicAnalysis.spiralogicFoundation
      );

      const totalScore = wisdomScore.totalScore +
                        culturalScore.score +
                        alchemyScore.score +
                        geometricScore.score;

      return {
        ...protocol,
        scoring: {
          totalScore,
          wisdomComponents: wisdomScore.wisdomComponents,
          culturalAlignment: culturalScore.score,
          personalAlchemy: alchemyScore.score,
          spiralogicAlignment: geometricScore.score,
          reasoning: [
            ...wisdomScore.reasoning,
            ...culturalScore.reasoning,
            ...alchemyScore.reasoning,
            ...geometricScore.reasoning
          ]
        },
        safetyFlags: wisdomScore.safetyFlags || [],
        alchemicalPotential: this.assessAlchemicalPotential(
          protocol, soulState, spiralogicAnalysis
        )
      };
    }).sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);
  }

  /**
   * PERSONAL ALCHEMY SCORING
   * How well does this protocol support consciousness transformation?
   */
  static scorePersonalAlchemy(protocol, soulState, spiralogicAnalysis) {
    let score = 0;
    let reasoning = [];

    // Transformation potential
    if (this.detectTransformationalMoment(soulState)) {
      if (protocol.transformationFocus || protocol.alchemical) {
        score += 20;
        reasoning.push('Transformational moment: Protocol supports conscious alchemy');
      }
    }

    // Integration support
    if (this.detectIntegrationNeed(soulState)) {
      if (protocol.type?.includes('integration') || protocol.integrative) {
        score += 15;
        reasoning.push('Integration needed: Protocol supports synthesis');
      }
    }

    // Emergence facilitation
    if (this.detectEmergentPotential(soulState)) {
      if (protocol.emergent || protocol.type?.includes('emergence')) {
        score += 18;
        reasoning.push('Emergent potential: Protocol facilitates new consciousness');
      }
    }

    // Shadow work potential
    if (this.detectShadowWork(soulState)) {
      if (protocol.shadowWork || protocol.type?.includes('shadow')) {
        score += 25;
        reasoning.push('Shadow work opportunity: Protocol supports unconscious integration');
      }
    }

    // Sacred marriage (integration of opposites)
    if (this.detectPolarityWork(soulState)) {
      if (protocol.polarityIntegration || protocol.type?.includes('polarity')) {
        score += 22;
        reasoning.push('Polarity integration: Protocol supports sacred marriage of opposites');
      }
    }

    return { score, reasoning };
  }

  /**
   * SPIRALOGIC GEOMETRIC SCORING
   * Alignment with universal consciousness patterns
   */
  static scoreSpiralogicAlignment(protocol, spiralogicFoundation) {
    let score = 0;
    let reasoning = [];

    const primaryPattern = spiralogicFoundation.primaryPattern;

    // Pattern-specific alignment
    switch (primaryPattern.type) {
      case 'spiral_dynamics':
        if (protocol.spiralLevel === primaryPattern.level) {
          score += 15;
          reasoning.push(`Spiral dynamics alignment: Protocol fits ${primaryPattern.level} consciousness level`);
        }
        break;

      case 'consciousness_geometry':
        if (protocol.geometricPattern === primaryPattern.pattern) {
          score += 20;
          reasoning.push(`Geometric alignment: Protocol follows ${primaryPattern.pattern} pattern`);
        }
        break;

      case 'elemental':
        if (protocol.elementFocus === primaryPattern.pattern) {
          score += 12;
          reasoning.push(`Elemental alignment: Protocol works with ${primaryPattern.pattern} energy`);
        }
        break;

      case 'integration':
        if (protocol.integrative || protocol.type?.includes('integration')) {
          score += 18;
          reasoning.push('Integration pattern: Protocol supports consciousness integration');
        }
        break;
    }

    // Fractal complexity bonus
    const fractalityScore = spiralogicFoundation.spiralogicSignature.fractality * 10;
    score += fractalityScore;
    reasoning.push(`Fractal complexity: +${fractalityScore.toFixed(1)} for pattern complexity`);

    return { score, reasoning };
  }

  /**
   * ALCHEMICAL GUIDANCE SYNTHESIS
   * Create the final guidance with all wisdom integrated
   */
  static synthesizeAlchemicalGuidance(
    scoredProtocols,
    soulState,
    culturalContext,
    spiralogicAnalysis,
    safetyAssessment
  ) {
    const topProtocol = scoredProtocols[0];
    const alternativeProtocols = scoredProtocols.slice(1, 3);

    return {
      // Core guidance
      guidance: {
        primaryProtocol: this.createAlchemicalProtocol(topProtocol, culturalContext, spiralogicAnalysis),
        alternatives: alternativeProtocols.map(protocol =>
          this.createAlchemicalProtocol(protocol, culturalContext, spiralogicAnalysis)
        ),
        reasoning: this.generateAlchemicalReasoning(
          topProtocol, soulState, culturalContext, spiralogicAnalysis
        )
      },

      // Personal alchemy context
      alchemicalContext: {
        transformationStage: this.identifyTransformationStage(soulState, spiralogicAnalysis),
        culturalAlchemy: this.describeCulturalAlchemy(culturalContext, spiralogicAnalysis),
        spiralogicProcess: spiralogicAnalysis.spiralogicFoundation,
        fractalVariables: spiralogicAnalysis.fractalVariables
      },

      // Safety and wisdom integration
      safetyGuidance: this.createSafetyGuidance(safetyAssessment),
      wisdomInsights: this.generateWisdomInsights(scoredProtocols, soulState),

      // Meta-information
      meta: {
        navigatorVersion: '2.0',
        focusParadigm: 'personal_alchemy',
        culturalFramework: culturalContext.primaryContext,
        spiralogicSignature: spiralogicAnalysis.spiralogicFoundation.spiralogicSignature,
        safetyLevel: safetyAssessment.assessment.riskLevel,
        wisdomSources: ['training_notes', 'cultural_intelligence', 'spiralogic_universal', 'safety_guardian']
      }
    };
  }

  /**
   * CREATE ALCHEMICAL PROTOCOL
   * Personal alchemy version of the protocol
   */
  static createAlchemicalProtocol(protocol, culturalContext, spiralogicAnalysis) {
    return {
      ...protocol,
      alchemicalName: this.generateAlchemicalName(protocol, culturalContext),
      alchemicalDescription: this.generateAlchemicalDescription(protocol, culturalContext, spiralogicAnalysis),
      transformationFocus: this.identifyTransformationFocus(protocol, spiralogicAnalysis),
      culturalExpression: culturalContext.primaryContext,
      spiralogicGeometry: spiralogicAnalysis.spiralogicFoundation.spiralogicSignature.primary,
      personalAlchemyPotential: protocol.alchemicalPotential
    };
  }

  /**
   * HELPER METHODS
   */

  // Transformation detection
  static detectTransformationalMoment(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('transform') || text.includes('change') ||
           text.includes('breakthrough') || text.includes('shift');
  }

  static detectIntegrationNeed(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('parts') || text.includes('integrate') ||
           text.includes('bringing together') || text.includes('fragmented');
  }

  static detectEmergentPotential(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('emerging') || text.includes('new') ||
           text.includes('potential') || text.includes('arising');
  }

  static detectShadowWork(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('shadow') || text.includes('hidden') ||
           text.includes('unconscious') || text.includes('dark');
  }

  static detectPolarityWork(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('opposite') || text.includes('both') ||
           text.includes('tension') || text.includes('balance');
  }

  // Assessment methods
  static assessAlchemicalPotential(protocol, soulState, spiralogicAnalysis) {
    const transformationScore = this.scorePersonalAlchemy(protocol, soulState, spiralogicAnalysis);
    const geometricAlignment = this.scoreSpiralogicAlignment(protocol, spiralogicAnalysis.spiralogicFoundation);

    return {
      level: transformationScore.score + geometricAlignment.score > 40 ? 'high' :
             transformationScore.score + geometricAlignment.score > 20 ? 'moderate' : 'low',
      transformationSupport: transformationScore.score,
      geometricResonance: geometricAlignment.score
    };
  }

  // Generation methods
  static generateAlchemicalName(protocol, culturalContext) {
    const culturalPrefixes = {
      faith_based: 'Sacred',
      psychology_based: 'Therapeutic',
      physiology_based: 'Embodied',
      indigenous_based: 'Traditional',
      eastern_philosophy: 'Dharmic',
      scientific_rationalist: 'Evidence-Based',
      artistic_creative: 'Creative',
      universal_human: 'Universal'
    };

    const prefix = culturalPrefixes[culturalContext.primaryContext] || 'Alchemical';
    return `${prefix} ${protocol.contextualName || protocol.name || protocol.type}`;
  }

  static generateAlchemicalDescription(protocol, culturalContext, spiralogicAnalysis) {
    const baseDescription = protocol.contextualDescription || protocol.description || 'Personal alchemy practice';
    const geometricPattern = spiralogicAnalysis.spiralogicFoundation.spiralogicSignature.primary;

    return `${baseDescription} - Following the natural ${geometricPattern} pattern of consciousness transformation within ${culturalContext.primaryContext} wisdom.`;
  }

  static identifyTransformationFocus(protocol, spiralogicAnalysis) {
    const patterns = spiralogicAnalysis.spiralogicFoundation.allPatterns;
    if (patterns.some(p => p.type === 'integration')) return 'consciousness_integration';
    if (patterns.some(p => p.type === 'spiral_dynamics')) return 'developmental_alchemy';
    if (patterns.some(p => p.type === 'elemental')) return 'elemental_transformation';
    return 'general_alchemy';
  }

  static identifyTransformationStage(soulState, spiralogicAnalysis) {
    // Simplified transformation stage identification
    const text = soulState.description?.toLowerCase() || '';

    if (text.includes('beginning') || text.includes('starting')) return 'initiation';
    if (text.includes('middle') || text.includes('working')) return 'dissolution';
    if (text.includes('integrat') || text.includes('bringing together')) return 'coagulation';
    if (text.includes('complete') || text.includes('mastery')) return 'sublimation';

    return 'dissolution'; // Most common stage
  }

  static describeCulturalAlchemy(culturalContext, spiralogicAnalysis) {
    const culturalDescriptions = {
      faith_based: 'Divine transformation through sacred spiritual practices',
      psychology_based: 'Psychological integration and therapeutic consciousness development',
      physiology_based: 'Embodied transformation through somatic alchemy',
      indigenous_based: 'Traditional earth wisdom and ancestral transformation patterns',
      eastern_philosophy: 'Classical consciousness alchemy through dharmic practices',
      scientific_rationalist: 'Evidence-based consciousness development and neural transformation',
      artistic_creative: 'Creative consciousness alchemy through artistic expression',
      universal_human: 'Universal human transformation through natural consciousness patterns'
    };

    return {
      description: culturalDescriptions[culturalContext.primaryContext],
      spiralogicExpression: `${culturalContext.primaryContext}_spiralogic`,
      universalPattern: spiralogicAnalysis.spiralogicFoundation.spiralogicSignature.primary
    };
  }

  static generateAlchemicalReasoning(topProtocol, soulState, culturalContext, spiralogicAnalysis) {
    return [
      `Personal alchemy focus: This guidance supports your unique consciousness transformation`,
      `Cultural alignment: Expressed through ${culturalContext.primaryContext} wisdom tradition`,
      `Spiralogic foundation: Following ${spiralogicAnalysis.spiralogicFoundation.spiralogicSignature.primary} consciousness geometry`,
      `Wisdom integration: Based on safety protocols, cultural intelligence, and universal patterns`,
      ...topProtocol.scoring.reasoning.slice(0, 3)
    ];
  }

  static createSafetyGuidance(safetyAssessment) {
    return {
      riskLevel: safetyAssessment.assessment.riskLevel,
      blockedProtocols: safetyAssessment.blockedProtocols.length,
      facilitatorRequired: safetyAssessment.facilitatorAlert.required,
      safetyRecommendations: safetyAssessment.safetyRecommendations,
      protectiveGuidance: safetyAssessment.safetyWarnings
    };
  }

  static generateWisdomInsights(scoredProtocols, soulState) {
    const insights = [];

    // Top scoring dimensions
    const topProtocol = scoredProtocols[0];
    const components = topProtocol.scoring.wisdomComponents;

    const maxComponent = Object.keys(components).reduce((a, b) =>
      components[a] > components[b] ? a : b
    );

    insights.push({
      type: 'wisdom_strength',
      message: `Your soul state most benefits from ${maxComponent} wisdom approaches`,
      score: components[maxComponent]
    });

    // Cultural resonance
    if (topProtocol.scoring.culturalAlignment > 15) {
      insights.push({
        type: 'cultural_resonance',
        message: 'Strong cultural alignment detected - guidance fits your meaning-making system',
        score: topProtocol.scoring.culturalAlignment
      });
    }

    // Personal alchemy potential
    if (topProtocol.scoring.personalAlchemy > 20) {
      insights.push({
        type: 'transformation_potential',
        message: 'High personal alchemy potential - this is a powerful transformation moment',
        score: topProtocol.scoring.personalAlchemy
      });
    }

    return insights;
  }

  /**
   * FAILSAFE GUIDANCE
   * When main system fails, provide basic safe guidance
   */
  static getFailsafeGuidance(soulState, error) {
    return {
      guidance: {
        primaryProtocol: {
          name: 'Gentle Awareness Practice',
          description: 'Simple mindful breathing and present moment awareness',
          approach: 'universal_safety',
          alchemicalName: 'Universal Grounding Practice',
          alchemicalDescription: 'Basic consciousness alchemy through breath and presence'
        },
        reasoning: [
          'Navigator v2.0 operating in safety mode',
          'Gentle universal practice selected for maximum safety',
          'Personal alchemy through basic awareness cultivation'
        ]
      },
      meta: {
        navigatorVersion: '2.0',
        focusParadigm: 'personal_alchemy',
        mode: 'failsafe',
        error: error.message
      }
    };
  }
}

module.exports = { NavigatorEngineV2 };