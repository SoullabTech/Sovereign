// SafetyGuardian.js - Hard safety stops based on Training Notes critical findings
// These override all other preferences when safety is at stake

class SafetyGuardian {

  /**
   * CRITICAL SAFETY OVERRIDES - Based on dangerous patterns observed in lab
   * These are hard stops that prevent potentially destabilizing combinations
   */
  static applySafetyOverrides(soulState, candidateProtocols) {
    const safeProtocols = [];
    const blockedProtocols = [];
    const safetyWarnings = [];

    for (const protocol of candidateProtocols) {
      const safetyCheck = this.assessProtocolSafety(soulState, protocol);

      if (safetyCheck.blocked) {
        blockedProtocols.push({
          protocol,
          blockReason: safetyCheck.reason,
          riskLevel: safetyCheck.riskLevel
        });
        safetyWarnings.push(safetyCheck.reason);
      } else {
        safeProtocols.push(protocol);
      }
    }

    return {
      safeProtocols,
      blockedProtocols,
      safetyWarnings,
      overrideApplied: blockedProtocols.length > 0
    };
  }

  /**
   * Assess individual protocol safety against soul state
   */
  static assessProtocolSafety(soulState, protocol) {
    // OVERRIDE 1: Spiritual Emergency + Deep Exploration = BLOCKED
    if (this.detectSpiritualEmergency(soulState) && this.isDeepExplorationProtocol(protocol)) {
      return {
        blocked: true,
        reason: 'SAFETY BLOCK: Spiritual emergency detected - deep exploration protocols pose destabilization risk',
        riskLevel: 'critical',
        trainingNotesReference: 'Scenario 3: Dangerous spiritual hype tendency'
      };
    }

    // OVERRIDE 2: Dissociation + Fire/Intensity Work = BLOCKED
    if (this.detectDissociation(soulState) && this.isIntensityProtocol(protocol)) {
      return {
        blocked: true,
        reason: 'SAFETY BLOCK: Dissociation detected - fire/intensity work may increase fragmentation',
        riskLevel: 'critical',
        trainingNotesReference: 'Scenario 6: Potentially destabilizing fire work'
      };
    }

    // OVERRIDE 3: Shutdown State + Standard Regulation = WARNING ONLY
    if (this.detectShutdownState(soulState) && this.isStandardRegulation(protocol)) {
      // This gets a warning but isn't blocked - it's an education opportunity
      return {
        blocked: false,
        reason: 'LEARNING ALERT: Shutdown state may need reconnection rather than regulation',
        riskLevel: 'educational',
        trainingNotesReference: 'Scenario 2: Concerning confusion of overwhelm vs numbness'
      };
    }

    // OVERRIDE 4: Fragmented State + High Intensity = BLOCKED
    if (this.detectFragmentation(soulState) && this.isHighIntensity(protocol)) {
      return {
        blocked: true,
        reason: 'SAFETY BLOCK: Fragmented state detected - high intensity may worsen dissociation',
        riskLevel: 'high',
        trainingNotesReference: 'General safety principle from dissociation findings'
      };
    }

    // OVERRIDE 5: Overwhelmed + More Activation = BLOCKED
    if (this.detectOverwhelm(soulState) && this.isActivatingProtocol(protocol)) {
      return {
        blocked: true,
        reason: 'SAFETY BLOCK: Overwhelmed state - activating protocols may worsen nervous system dysregulation',
        riskLevel: 'moderate',
        trainingNotesReference: 'Nervous system wisdom - not pathologizing but protecting'
      };
    }

    // Protocol is safe
    return {
      blocked: false,
      reason: 'Protocol passes safety assessment',
      riskLevel: 'low'
    };
  }

  /**
   * SAFETY DETECTION METHODS - Based on lab observation patterns
   */

  static detectSpiritualEmergency(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    const markers = [
      'dissolving into light',
      'intense spiritual experiences',
      'ecstatic and terrified',
      'panic',
      'overwhelmed by spiritual',
      'spiritual emergency'
    ];
    return markers.some(marker => text.includes(marker));
  }

  static detectDissociation(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    const markers = [
      'watching my life from far away',
      'conversations feel unreal',
      'parts don\'t trust',
      'fragmented',
      'dissociat',
      'disconnected from reality'
    ];
    return markers.some(marker => text.includes(marker));
  }

  static detectShutdownState(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    const markers = [
      'don\'t feel much of anything',
      'flat',
      'numb',
      'disconnected from my body',
      'disconnected from my emotions',
      'shutdown'
    ];
    return markers.some(marker => text.includes(marker));
  }

  static detectFragmentation(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    const markers = [
      'parts',
      'fragmented',
      'split',
      'multiple selves',
      'internal conflict'
    ];
    return markers.some(marker => text.includes(marker));
  }

  static detectOverwhelm(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    // Distinguish true overwhelm from healthy creative excitement
    const overwhelmMarkers = [
      'completely overwhelmed',
      'nervous system feels fried',
      'can\'t handle',
      'too much'
    ];
    const excitementMarkers = [
      'exciting and overwhelming in a good way',
      'good way'
    ];

    const hasOverwhelm = overwhelmMarkers.some(marker => text.includes(marker));
    const hasPositiveExcitement = excitementMarkers.some(marker => text.includes(marker));

    return hasOverwhelm && !hasPositiveExcitement;
  }

  /**
   * PROTOCOL RISK ASSESSMENT METHODS
   */

  static isDeepExplorationProtocol(protocol) {
    const riskTypes = [
      'deep-consciousness-exploration',
      'mystical-exploration',
      'expanded-awareness',
      'transcendent-work'
    ];
    return riskTypes.includes(protocol.type) ||
           protocol.depth === 'deep' ||
           protocol.intensity === 'intense';
  }

  static isIntensityProtocol(protocol) {
    return protocol.elementFocus === 'fire' ||
           protocol.intensity === 'medium' ||
           protocol.intensity === 'deep' ||
           protocol.intensity === 'intense' ||
           protocol.type?.includes('fire') ||
           protocol.type?.includes('activation');
  }

  static isStandardRegulation(protocol) {
    return protocol.type === 'nervous-system-regulation' &&
           !protocol.type.includes('gentle') &&
           !protocol.specialized;
  }

  static isHighIntensity(protocol) {
    return protocol.intensity === 'deep' ||
           protocol.intensity === 'intense' ||
           protocol.type?.includes('intense') ||
           protocol.type?.includes('breakthrough');
  }

  static isActivatingProtocol(protocol) {
    const activatingTypes = [
      'energy-activation',
      'consciousness-expansion',
      'fire-element',
      'breakthrough-work'
    ];
    return activatingTypes.some(type => protocol.type?.includes(type)) ||
           protocol.elementFocus === 'fire' ||
           protocol.energyDirection === 'activating';
  }

  /**
   * SAFETY RECOMMENDATIONS - What TO do when we block protocols
   */
  static generateSafetyRecommendations(soulState, blockedProtocols) {
    const recommendations = [];

    if (this.detectSpiritualEmergency(soulState)) {
      recommendations.push({
        protocol: 'grounding-stabilization',
        reasoning: 'Spiritual emergency requires immediate grounding and nervous system stabilization',
        priority: 'immediate',
        facilitatorRequired: true
      });
    }

    if (this.detectDissociation(soulState)) {
      recommendations.push({
        protocol: 'gentle-self-contact',
        reasoning: 'Dissociation benefits from gentle embodiment and self-contact practices',
        priority: 'primary',
        facilitatorRequired: true
      });
    }

    if (this.detectShutdownState(soulState)) {
      recommendations.push({
        protocol: 'gentle-sensing-reconnection',
        reasoning: 'Shutdown state needs gentle reconnection rather than regulation',
        priority: 'primary',
        facilitatorRequired: false
      });
    }

    return recommendations;
  }

  /**
   * FACILITATOR ALERTING - When human oversight is required
   */
  static assessFacilitatorRequirement(soulState, blockedProtocols) {
    const criticalBlocks = blockedProtocols.filter(bp => bp.riskLevel === 'critical');

    if (criticalBlocks.length > 0) {
      return {
        required: true,
        urgency: 'immediate',
        reason: 'Critical safety blocks detected - human facilitator oversight required',
        alertText: 'Navigator has detected patterns requiring immediate facilitator support'
      };
    }

    const highRiskBlocks = blockedProtocols.filter(bp => bp.riskLevel === 'high');
    if (highRiskBlocks.length > 0) {
      return {
        required: true,
        urgency: 'priority',
        reason: 'High-risk patterns detected - facilitator guidance recommended',
        alertText: 'Navigator recommends facilitator support for this guidance session'
      };
    }

    return {
      required: false,
      urgency: 'none',
      reason: 'No critical safety patterns detected'
    };
  }

  /**
   * COMPLETE SAFETY ASSESSMENT - Main entry point
   */
  static performCompleteSafetyAssessment(soulState, candidateProtocols) {
    const overrides = this.applySafetyOverrides(soulState, candidateProtocols);
    const facilitatorAlert = this.assessFacilitatorRequirement(soulState, overrides.blockedProtocols);
    const recommendations = this.generateSafetyRecommendations(soulState, overrides.blockedProtocols);

    return {
      safeProtocols: overrides.safeProtocols,
      blockedProtocols: overrides.blockedProtocols,
      safetyWarnings: overrides.safetyWarnings,
      facilitatorAlert,
      safetyRecommendations: recommendations,
      assessment: {
        riskLevel: this.calculateOverallRiskLevel(overrides.blockedProtocols),
        criticalFlags: overrides.blockedProtocols.filter(bp => bp.riskLevel === 'critical'),
        educationalFlags: overrides.blockedProtocols.filter(bp => bp.riskLevel === 'educational')
      }
    };
  }

  static calculateOverallRiskLevel(blockedProtocols) {
    if (blockedProtocols.some(bp => bp.riskLevel === 'critical')) return 'critical';
    if (blockedProtocols.some(bp => bp.riskLevel === 'high')) return 'high';
    if (blockedProtocols.some(bp => bp.riskLevel === 'moderate')) return 'moderate';
    if (blockedProtocols.some(bp => bp.riskLevel === 'educational')) return 'educational';
    return 'low';
  }
}

module.exports = { SafetyGuardian };