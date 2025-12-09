// CulturalIntelligence.js - Meet people within their own meaning-making system
// Open intellect approach for faith-based, psychology-based, physiology-based, and more

class CulturalIntelligence {

  /**
   * CULTURAL CONTEXT DETECTION - Identify the person's primary meaning-making framework
   */
  static detectCulturalContext(soulState) {
    const text = soulState.description?.toLowerCase() || '';
    const contexts = [];

    // Faith-based indicators
    if (this.detectFaithBasedContext(text, soulState)) {
      contexts.push('faith_based');
    }

    // Psychology/therapy-based indicators
    if (this.detectPsychologyContext(text, soulState)) {
      contexts.push('psychology_based');
    }

    // Physiology/medical/somatic indicators
    if (this.detectPhysiologyContext(text, soulState)) {
      contexts.push('physiology_based');
    }

    // Indigenous/earth-based spiritual indicators
    if (this.detectIndigenousContext(text, soulState)) {
      contexts.push('indigenous_based');
    }

    // Eastern spiritual/philosophical indicators
    if (this.detectEasternContext(text, soulState)) {
      contexts.push('eastern_philosophy');
    }

    // Scientific/secular/rationalist indicators
    if (this.detectScientificContext(text, soulState)) {
      contexts.push('scientific_rationalist');
    }

    // Artistic/creative expression indicators
    if (this.detectArtisticContext(text, soulState)) {
      contexts.push('artistic_creative');
    }

    return {
      primaryContext: contexts[0] || 'universal_human',
      secondaryContexts: contexts.slice(1),
      allContexts: contexts,
      confidence: this.assessContextConfidence(contexts, text)
    };
  }

  /**
   * CONTEXT-APPROPRIATE PROTOCOL TRANSLATION
   * Same wisdom, different language and approach
   */
  static translateProtocolToContext(protocol, culturalContext, soulState) {
    const contextualProtocol = { ...protocol };

    switch (culturalContext.primaryContext) {
      case 'faith_based':
        return this.translateToFaithContext(contextualProtocol, soulState);

      case 'psychology_based':
        return this.translateToPsychologyContext(contextualProtocol, soulState);

      case 'physiology_based':
        return this.translateToPhysiologyContext(contextualProtocol, soulState);

      case 'indigenous_based':
        return this.translateToIndigenousContext(contextualProtocol, soulState);

      case 'eastern_philosophy':
        return this.translateToEasternContext(contextualProtocol, soulState);

      case 'scientific_rationalist':
        return this.translateToScientificContext(contextualProtocol, soulState);

      case 'artistic_creative':
        return this.translateToArtisticContext(contextualProtocol, soulState);

      default:
        return this.translateToUniversalContext(contextualProtocol, soulState);
    }
  }

  /**
   * DETECTION METHODS for different cultural contexts
   */

  static detectFaithBasedContext(text, soulState) {
    const faithMarkers = [
      'pray', 'prayer', 'god', 'divine', 'sacred', 'holy', 'blessed',
      'faith', 'believe', 'church', 'congregation', 'minister',
      'jesus', 'christ', 'allah', 'spiritual gifts', 'calling',
      'discernment', 'surrender', 'divine will', 'grace'
    ];
    return faithMarkers.some(marker => text.includes(marker));
  }

  static detectPsychologyContext(text, soulState) {
    const psychMarkers = [
      'therapy', 'therapist', 'trauma', 'attachment', 'coping',
      'mental health', 'anxiety', 'depression', 'boundaries',
      'inner child', 'shadow work', 'parts work', 'integration',
      'emotional regulation', 'trigger', 'healing journey'
    ];
    return psychMarkers.some(marker => text.includes(marker));
  }

  static detectPhysiologyContext(text, soulState) {
    const physioMarkers = [
      'nervous system', 'somatic', 'body', 'embodied', 'breath',
      'tension', 'physical', 'sensations', 'movement', 'yoga',
      'nervous system regulation', 'polyvagal', 'trauma stored',
      'body awareness', 'felt sense', 'physical symptoms'
    ];
    return physioMarkers.some(marker => text.includes(marker));
  }

  static detectIndigenousContext(text, soulState) {
    const indigenousMarkers = [
      'ceremony', 'ritual', 'ancestral', 'land', 'earth', 'nature',
      'medicine', 'plant medicine', 'vision quest', 'elder',
      'tribal', 'indigenous', 'shamanic', 'spirit animal',
      'four directions', 'sacred circle', 'pipe ceremony'
    ];
    return indigenousMarkers.some(marker => text.includes(marker));
  }

  static detectEasternContext(text, soulState) {
    const easternMarkers = [
      'meditation', 'mindfulness', 'buddhist', 'dharma', 'karma',
      'chakras', 'energy', 'chi', 'qi', 'prana', 'yoga',
      'zen', 'tao', 'taoist', 'hindu', 'vedic', 'mantra',
      'enlightenment', 'awakening', 'non-dual', 'emptiness'
    ];
    return easternMarkers.some(marker => text.includes(marker));
  }

  static detectScientificContext(text, soulState) {
    const scientificMarkers = [
      'research', 'evidence', 'neuroscience', 'brain', 'study',
      'data', 'scientific', 'psychology research', 'clinical',
      'empirical', 'measurable', 'hypothesis', 'rational',
      'cognitive', 'behavioral', 'evidence-based'
    ];
    return scientificMarkers.some(marker => text.includes(marker));
  }

  static detectArtisticContext(text, soulState) {
    const artisticMarkers = [
      'creative', 'art', 'music', 'dance', 'write', 'writing',
      'painting', 'express', 'expression', 'flow', 'muse',
      'inspiration', 'creative process', 'artistic', 'beauty',
      'aesthetic', 'creative block', 'artistic vision'
    ];
    return artisticMarkers.some(marker => text.includes(marker));
  }

  /**
   * TRANSLATION METHODS - Same wisdom, contextual language
   */

  static translateToFaithContext(protocol, soulState) {
    // Translate using faith-based language and concepts
    const faithTranslations = {
      'nervous-system-regulation': {
        name: 'Prayer and Centering Practice',
        description: 'Find peace through prayer, allowing divine grace to calm your spirit',
        approach: 'prayer_based',
        language: 'faith'
      },
      'grounding': {
        name: 'Divine Grounding Prayer',
        description: 'Connect with God\'s steadying presence through grounded prayer',
        approach: 'faith_grounding',
        language: 'faith'
      },
      'awareness-cultivation': {
        name: 'Spiritual Discernment Practice',
        description: 'Cultivate spiritual awareness and divine discernment',
        approach: 'faith_awareness',
        language: 'faith'
      }
    };

    const translation = faithTranslations[protocol.type];
    if (translation) {
      return {
        ...protocol,
        contextualName: translation.name,
        contextualDescription: translation.description,
        culturalFramework: 'faith_based',
        approach: translation.approach
      };
    }
    return protocol;
  }

  static translateToPsychologyContext(protocol, soulState) {
    const psychTranslations = {
      'nervous-system-regulation': {
        name: 'Nervous System Regulation Practice',
        description: 'Evidence-based techniques to regulate your nervous system and reduce trauma responses',
        approach: 'trauma_informed',
        language: 'clinical'
      },
      'grounding': {
        name: '5-4-3-2-1 Grounding Technique',
        description: 'Therapeutic grounding to help manage dissociation and anxiety',
        approach: 'cbt_grounding',
        language: 'therapeutic'
      },
      'awareness-cultivation': {
        name: 'Mindful Self-Awareness Practice',
        description: 'Develop emotional awareness and self-regulation skills',
        approach: 'mindfulness_based',
        language: 'therapeutic'
      }
    };

    const translation = psychTranslations[protocol.type];
    if (translation) {
      return {
        ...protocol,
        contextualName: translation.name,
        contextualDescription: translation.description,
        culturalFramework: 'psychology_based',
        approach: translation.approach
      };
    }
    return protocol;
  }

  static translateToPhysiologyContext(protocol, soulState) {
    const physioTranslations = {
      'nervous-system-regulation': {
        name: 'Vagal Tone Restoration',
        description: 'Somatic practices to activate the parasympathetic nervous system',
        approach: 'somatic_experiencing',
        language: 'embodied'
      },
      'grounding': {
        name: 'Embodied Grounding Practice',
        description: 'Physical practices to reconnect with your body and felt sense',
        approach: 'somatic_grounding',
        language: 'embodied'
      },
      'awareness-cultivation': {
        name: 'Interoceptive Awareness Practice',
        description: 'Develop awareness of internal bodily sensations and signals',
        approach: 'body_awareness',
        language: 'somatic'
      }
    };

    const translation = physioTranslations[protocol.type];
    if (translation) {
      return {
        ...protocol,
        contextualName: translation.name,
        contextualDescription: translation.description,
        culturalFramework: 'physiology_based',
        approach: translation.approach
      };
    }
    return protocol;
  }

  static translateToIndigenousContext(protocol, soulState) {
    const indigenousTranslations = {
      'nervous-system-regulation': {
        name: 'Return to Earth Mother',
        description: 'Traditional practices to restore harmony with the natural world',
        approach: 'earth_connection',
        language: 'indigenous'
      },
      'grounding': {
        name: 'Four Directions Grounding',
        description: 'Connect with the earth and the four sacred directions',
        approach: 'traditional_grounding',
        language: 'indigenous'
      },
      'awareness-cultivation': {
        name: 'Spirit Vision Practice',
        description: 'Cultivate traditional awareness and spiritual vision',
        approach: 'traditional_awareness',
        language: 'indigenous'
      }
    };

    const translation = indigenousTranslations[protocol.type];
    if (translation) {
      return {
        ...protocol,
        contextualName: translation.name,
        contextualDescription: translation.description,
        culturalFramework: 'indigenous_based',
        approach: translation.approach
      };
    }
    return protocol;
  }

  static translateToEasternContext(protocol, soulState) {
    const easternTranslations = {
      'nervous-system-regulation': {
        name: 'Pranayama Regulation Practice',
        description: 'Classical breathing practices to balance prana and calm the mind',
        approach: 'yogic_breathing',
        language: 'eastern'
      },
      'grounding': {
        name: 'Muladhara Grounding Meditation',
        description: 'Root chakra practices to establish earthly connection',
        approach: 'chakra_grounding',
        language: 'eastern'
      },
      'awareness-cultivation': {
        name: 'Vipassana Awareness Practice',
        description: 'Classical mindfulness meditation to develop clear seeing',
        approach: 'buddhist_mindfulness',
        language: 'eastern'
      }
    };

    const translation = easternTranslations[protocol.type];
    if (translation) {
      return {
        ...protocol,
        contextualName: translation.name,
        contextualDescription: translation.description,
        culturalFramework: 'eastern_philosophy',
        approach: translation.approach
      };
    }
    return protocol;
  }

  static translateToScientificContext(protocol, soulState) {
    const scientificTranslations = {
      'nervous-system-regulation': {
        name: 'Evidence-Based Stress Response Regulation',
        description: 'Research-validated techniques for autonomic nervous system regulation',
        approach: 'evidence_based',
        language: 'scientific'
      },
      'grounding': {
        name: 'Cognitive Grounding Protocol',
        description: 'Empirically-supported grounding techniques for emotional regulation',
        approach: 'cognitive_behavioral',
        language: 'scientific'
      },
      'awareness-cultivation': {
        name: 'Metacognitive Awareness Training',
        description: 'Research-based mindfulness training for cognitive flexibility',
        approach: 'mindfulness_science',
        language: 'scientific'
      }
    };

    const translation = scientificTranslations[protocol.type];
    if (translation) {
      return {
        ...protocol,
        contextualName: translation.name,
        contextualDescription: translation.description,
        culturalFramework: 'scientific_rationalist',
        approach: translation.approach
      };
    }
    return protocol;
  }

  static translateToArtisticContext(protocol, soulState) {
    const artisticTranslations = {
      'nervous-system-regulation': {
        name: 'Creative Flow State Practice',
        description: 'Use artistic expression to regulate emotions and find inner harmony',
        approach: 'expressive_arts',
        language: 'creative'
      },
      'grounding': {
        name: 'Embodied Creative Practice',
        description: 'Ground yourself through physical creative expression',
        approach: 'movement_arts',
        language: 'creative'
      },
      'awareness-cultivation': {
        name: 'Artistic Awareness Practice',
        description: 'Develop creative awareness through mindful artistic expression',
        approach: 'contemplative_arts',
        language: 'creative'
      }
    };

    const translation = artisticTranslations[protocol.type];
    if (translation) {
      return {
        ...protocol,
        contextualName: translation.name,
        contextualDescription: translation.description,
        culturalFramework: 'artistic_creative',
        approach: translation.approach
      };
    }
    return protocol;
  }

  static translateToUniversalContext(protocol, soulState) {
    // Default human-universal approach when no specific context is detected
    return {
      ...protocol,
      contextualName: protocol.name || protocol.type,
      contextualDescription: protocol.description || 'Universal human practice for wellbeing',
      culturalFramework: 'universal_human',
      approach: 'humanistic'
    };
  }

  /**
   * CROSS-CULTURAL WISDOM SCORING
   * Boost protocols that align with person's cultural framework
   */
  static scoreCulturalAlignment(protocol, culturalContext) {
    let score = 0;
    let reasoning = [];

    // Strong bonus for culturally-aligned protocols
    if (protocol.culturalFramework === culturalContext.primaryContext) {
      score += 25;
      reasoning.push(`Strong cultural alignment: Protocol fits ${culturalContext.primaryContext} framework`);
    }

    // Moderate bonus for secondary cultural contexts
    if (culturalContext.secondaryContexts.includes(protocol.culturalFramework)) {
      score += 15;
      reasoning.push(`Secondary cultural alignment: Protocol fits ${protocol.culturalFramework} perspective`);
    }

    // Penalty for cultural mismatch if person is strongly identified with one tradition
    if (culturalContext.confidence > 0.8 &&
        !culturalContext.allContexts.includes(protocol.culturalFramework) &&
        protocol.culturalFramework !== 'universal_human') {
      score -= 10;
      reasoning.push(`Cultural mismatch: Protocol may not resonate with ${culturalContext.primaryContext} framework`);
    }

    return { score, reasoning };
  }

  /**
   * COMPLETE CULTURAL INTELLIGENCE INTEGRATION
   */
  static applyculturalIntelligence(soulState, protocols) {
    const culturalContext = this.detectCulturalContext(soulState);

    const culturallyAdaptedProtocols = protocols.map(protocol => {
      // Translate protocol to appropriate cultural context
      const adaptedProtocol = this.translateProtocolToContext(protocol, culturalContext, soulState);

      // Score cultural alignment
      const alignmentScore = this.scoreCulturalAlignment(adaptedProtocol, culturalContext);

      return {
        ...adaptedProtocol,
        culturalAlignment: alignmentScore,
        originalProtocol: protocol,
        culturalContext: culturalContext
      };
    });

    return {
      adaptedProtocols: culturallyAdaptedProtocols,
      detectedContext: culturalContext,
      culturalWisdomApplied: true
    };
  }

  /**
   * HELPERS
   */
  static assessContextConfidence(contexts, text) {
    // Higher confidence when multiple markers from same context appear
    // or when highly specific markers are present
    if (contexts.length === 0) return 0;
    if (contexts.length === 1) return 0.7;
    return Math.min(0.9, 0.5 + (contexts.length * 0.1));
  }
}

module.exports = { CulturalIntelligence };