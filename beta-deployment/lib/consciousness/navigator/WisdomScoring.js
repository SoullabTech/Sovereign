// WisdomScoring.js - Convert Training Notes insights into practical scoring functions
// This transforms MAIA from rule-based to wisdom-based guidance

class WisdomScoring {

  /**
   * SAFETY-CRITICAL SCORING: Based on Training Notes findings
   * These override other preferences when safety is at stake
   */
  static scoreSafetyCritical(soulState, protocol) {
    let score = 0;
    let reasoning = [];
    let safetyFlags = [];

    // CRITICAL: Spiritual Emergency Detection
    if (this.detectSpiritualEmergency(soulState)) {
      if (protocol.type === 'deep-consciousness-exploration') {
        score -= 50; // Major penalty - dangerous tendency observed in lab
        reasoning.push('SAFETY CRITICAL: Spiritual emergency detected - deep exploration could destabilize');
        safetyFlags.push('spiritual_emergency_exploration_risk');
      }

      if (protocol.type === 'nervous-system-regulation' || protocol.type === 'grounding') {
        score += 30; // Strong preference for stabilization
        reasoning.push('Spiritual emergency: Prioritizing stabilization over exploration');
      }
    }

    // CRITICAL: Dissociation/Fragmentation Safety
    if (this.detectDissociation(soulState)) {
      if (protocol.elementFocus === 'fire' || protocol.intensity === 'medium' || protocol.intensity === 'deep') {
        score -= 40; // Major penalty - fire work for fragmented states is dangerous
        reasoning.push('SAFETY CRITICAL: Dissociation detected - fire/intensity work could fragment further');
        safetyFlags.push('dissociation_intensity_risk');
      }

      if (protocol.type === 'gentle-embodiment' || protocol.type === 'self-contact') {
        score += 25;
        reasoning.push('Dissociation: Prioritizing gentle self-contact over intensity');
      }
    }

    // Training Note: Distinguish overwhelm vs shutdown vs healthy activation
    const nervousSystemState = this.assessNervousSystemState(soulState);

    if (nervousSystemState === 'shutdown' && protocol.type === 'nervous-system-regulation') {
      // This was a critical miss in lab scenario #2
      score -= 15;
      reasoning.push('LEARNING: Shutdown state needs reconnection, not regulation');

      if (protocol.type === 'gentle-sensing' || protocol.type === 'body-awareness') {
        score += 20;
        reasoning.push('Shutdown: Prioritizing gentle reconnection over regulation');
      }
    }

    return {
      score,
      reasoning,
      safetyFlags,
      criticalityLevel: safetyFlags.length > 0 ? 'safety_critical' : 'standard'
    };
  }

  /**
   * RELATIONAL INTELLIGENCE: Missing dimension identified in Training Notes
   */
  static scoreRelationalWisdom(soulState, protocol) {
    let score = 0;
    let reasoning = [];

    // Detect relationship/attachment context
    if (this.detectRelationalWound(soulState)) {
      if (protocol.facetFocus === 'Core' && !protocol.relationalDimension) {
        score -= 20; // Lab finding: Missing relational intelligence
        reasoning.push('LEARNING: Relationship wound needs relational work, not individual focus');
      }

      if (protocol.type === 'attachment-work' || protocol.type === 'relational-healing') {
        score += 25;
        reasoning.push('Relational wound: Prioritizing attachment-focused protocols');
      }

      if (protocol.tone === 'tender' || protocol.tone === 'attuned') {
        score += 10;
        reasoning.push('Relational context: Tender attunement supports attachment healing');
      }
    }

    // Community/interpersonal field dimension
    if (soulState.context?.relational || soulState.description?.includes('relationship')) {
      if (protocol.facetFocus === 'Water3' || protocol.relationalDimension) {
        score += 15;
        reasoning.push('Interpersonal context: Supporting relational facet work');
      }
    }

    return { score, reasoning };
  }

  /**
   * CREATIVE FIRE INTELLIGENCE: Support vs dampen creative energy
   */
  static scoreCreativeWisdom(soulState, protocol) {
    let score = 0;
    let reasoning = [];

    if (this.detectCreativeSurge(soulState)) {
      // Lab finding: Missing creative fire intelligence
      if (protocol.facetFocus === 'Earth1' && !this.isCreativeProtocol(protocol)) {
        score -= 15;
        reasoning.push('LEARNING: Creative surge needs Fire support, not Earth dampening');
      }

      if (protocol.type === 'awareness-cultivation' && !protocol.creativeFocus) {
        score -= 10;
        reasoning.push('Creative surge: Generic awareness may dampen creative flow');
      }

      // Support healthy creative activation
      if (protocol.facetFocus === 'Fire1' || protocol.facetFocus === 'Fire2') {
        score += 20;
        reasoning.push('Creative surge: Supporting Fire activation');
      }

      if (protocol.type === 'creative-channeling' || protocol.type === 'structured-expression') {
        score += 25;
        reasoning.push('Creative surge: Offering container for creative energy');
      }

      // Training insight: Structure supports flow, doesn't restrict it
      if (protocol.qualities?.includes('structured') || protocol.qualities?.includes('channeling')) {
        score += 15;
        reasoning.push('Creative energy: Structure creates beneficial container');
      }
    }

    return { score, reasoning };
  }

  /**
   * NERVOUS SYSTEM SOPHISTICATION: Improved state differentiation
   */
  static scoreNervousSystemWisdom(soulState, protocol) {
    let score = 0;
    let reasoning = [];

    const nervousSystemState = this.assessNervousSystemState(soulState);

    switch (nervousSystemState) {
      case 'overwhelmed':
        if (protocol.type === 'nervous-system-regulation') {
          score += 20;
          reasoning.push('Overwhelm: Supporting nervous system regulation');
        }
        if (protocol.tone === 'gentle' || protocol.intensity === 'micro') {
          score += 10;
          reasoning.push('Overwhelm: Gentle approach supports regulation');
        }
        break;

      case 'shutdown':
        // Critical distinction from lab notes
        if (protocol.type === 'gentle-sensing' || protocol.type === 'reconnection') {
          score += 25;
          reasoning.push('Shutdown: Prioritizing gentle reconnection over regulation');
        }
        if (protocol.type === 'nervous-system-regulation') {
          score -= 10;
          reasoning.push('LEARNING: Shutdown needs reconnection, not regulation');
        }
        break;

      case 'healthy_activation':
        // Don't pathologize healthy energy
        if (protocol.type === 'nervous-system-regulation') {
          score -= 15;
          reasoning.push('Healthy activation: No need to regulate healthy energy');
        }
        if (protocol.type === 'energy-channeling' || protocol.supportsFocus) {
          score += 15;
          reasoning.push('Healthy activation: Supporting channeling of good energy');
        }
        break;

      case 'fragmented':
        // Requires specialized approach
        if (protocol.intensity === 'gentle' && protocol.type === 'integration') {
          score += 20;
          reasoning.push('Fragmentation: Supporting gentle integration work');
        }
        break;
    }

    return { score, reasoning };
  }

  /**
   * FACET DETECTION WISDOM: Improve energetic signature recognition
   */
  static scoreFacetAccuracy(soulState, protocol) {
    let score = 0;
    let reasoning = [];

    const suggestedFacets = this.detectEnergeticSignature(soulState);

    if (suggestedFacets.includes(protocol.facetFocus)) {
      score += 15;
      reasoning.push(`Energetic match: ${protocol.facetFocus} aligns with soul state signature`);
    }

    // Penalize clear mismatches from lab observations
    if (this.detectCreativeSurge(soulState) && protocol.facetFocus === 'Earth1') {
      score -= 10;
      reasoning.push('LEARNING: Creative surge signature suggests Fire, not Earth');
    }

    if (this.detectDissociation(soulState) && protocol.facetFocus === 'Fire1') {
      score -= 15;
      reasoning.push('LEARNING: Dissociation suggests fragmentation, not Fire activation');
    }

    return { score, reasoning };
  }

  /**
   * INTEGRATION SCORING: Combine all wisdom dimensions
   */
  static scoreProtocolWisdom(soulState, protocol) {
    const safety = this.scoreSafetyCritical(soulState, protocol);
    const relational = this.scoreRelationalWisdom(soulState, protocol);
    const creative = this.scoreCreativeWisdom(soulState, protocol);
    const nervousSystem = this.scoreNervousSystemWisdom(soulState, protocol);
    const facet = this.scoreFacetAccuracy(soulState, protocol);

    const totalScore = safety.score + relational.score + creative.score +
                      nervousSystem.score + facet.score;

    const allReasoning = [
      ...safety.reasoning,
      ...relational.reasoning,
      ...creative.reasoning,
      ...nervousSystem.reasoning,
      ...facet.reasoning
    ];

    return {
      totalScore,
      reasoning: allReasoning,
      safetyFlags: safety.safetyFlags,
      criticalityLevel: safety.criticalityLevel,
      wisdomComponents: {
        safety: safety.score,
        relational: relational.score,
        creative: creative.score,
        nervousSystem: nervousSystem.score,
        facet: facet.score
      }
    };
  }

  // DETECTION HELPERS - Based on lab observations

  static detectSpiritualEmergency(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('dissolving') || text.includes('ecstatic and terrified') ||
           text.includes('intense spiritual') || text.includes('panic') ||
           (text.includes('spiritual') && text.includes('overwhelming'));
  }

  static detectDissociation(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('watching my life from far away') ||
           text.includes('conversations feel unreal') ||
           text.includes('parts don\'t trust') ||
           text.includes('fragmented') || text.includes('dissociat');
  }

  static detectRelationalWound(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('relationships') || text.includes('attachment wound') ||
           text.includes('feel unseen') || text.includes('relationship') ||
           soulState.context?.relational;
  }

  static detectCreativeSurge(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    return text.includes('creative wave') || text.includes('creative surge') ||
           text.includes('exciting and overwhelming in a good way') ||
           text.includes('want to ride this wave');
  }

  static assessNervousSystemState(soulState) {
    const text = soulState.description?.toLowerCase() || '';

    if (text.includes('fried') || text.includes('overwhelmed about')) {
      return 'overwhelmed';
    }
    if (text.includes('don\'t feel much') || text.includes('flat') ||
        text.includes('disconnected from my body')) {
      return 'shutdown';
    }
    if (text.includes('exciting') && text.includes('good way')) {
      return 'healthy_activation';
    }
    if (text.includes('watching my life from far away') || text.includes('parts')) {
      return 'fragmented';
    }

    return 'unknown';
  }

  static detectEnergeticSignature(soulState) {
    const signatures = [];
    const text = soulState.description?.toLowerCase() || '';

    if (text.includes('creative') || text.includes('wave') || text.includes('surge')) {
      signatures.push('Fire1', 'Fire2');
    }
    if (text.includes('overwhelmed') || text.includes('grounded')) {
      signatures.push('Earth2');
    }
    if (text.includes('relationship') || text.includes('emotions')) {
      signatures.push('Water3');
    }
    if (text.includes('disconnected') || text.includes('spiritual')) {
      signatures.push('Aether');
    }

    return signatures;
  }

  static isCreativeProtocol(protocol) {
    return protocol.type?.includes('creative') ||
           protocol.qualities?.includes('creative') ||
           protocol.qualities?.includes('expressive');
  }
}

module.exports = { WisdomScoring };