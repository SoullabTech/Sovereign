// lib/navigator-integration.js - JavaScript integration for Navigator system

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { NavigatorEngineV2 } = require('./consciousness/navigator/NavigatorEngineV2');
const { MAIANavigatorIntegration } = require('./consciousness/navigator/MAIANavigatorIntegration');

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'maia_consciousness',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500,
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// --- Spiralogic mapping v0.1 --------------------------------------

/**
 * Very simple first-pass mapping from soulState → Spiralogic signature.
 * This is intentionally dumb-but-explicit so we can refine it later
 * using Navigator_Training_Notes.
 */
function mapSoulStateToSpiralogicSignature(soulState) {
  // Default values
  let spiral_domain = soulState?.activeSpiral?.lifeDomain || null;
  let spiral_phase = soulState?.activeSpiral?.currentPhase || null;
  let spiral_facet = null;

  const detectedFacet = soulState?.detectedFacet;
  const awareness = soulState?.session?.awarenessLevel;
  const nsLoad = soulState?.session?.nervousSystemLoad; // e.g. 'overwhelmed', 'balanced'

  // Map detected facet → Spiralogic facet label
  if (typeof detectedFacet === 'string') {
    // Map basic facet names to Spiralogic signatures
    const facetMap = {
      'Core': 'Earth1', // basic grounding
      'Fire1': 'Fire1',
      'Fire2': 'Fire2',
      'Air1': 'Air1',
      'Air2': 'Air2',
      'Air3': 'Air3',
      'Water1': 'Water1',
      'Water2': 'Water2',
      'Earth1': 'Earth1',
      'Earth2': 'Earth2',
      'Aether1': 'Aether1'
    };
    spiral_facet = facetMap[detectedFacet] || detectedFacet;
  }

  // Simple phase heuristic v0.1 (override if not already set)
  if (!spiral_phase) {
    if (nsLoad === 'overwhelmed' || nsLoad === 'high_stress') {
      spiral_phase = 'descent';
    } else if (nsLoad === 'balanced' && awareness >= 4) {
      spiral_phase = 'emergence';
    } else if (awareness <= 2) {
      spiral_phase = 'call';
    } else {
      spiral_phase = 'integration';
    }
  }

  // Map life domain to Spiralogic domains
  if (!spiral_domain && soulState?.field?.primaryTheme) {
    const domainMap = {
      'individual-consciousness-exploration': 'initiation',
      'consciousness-exploration': 'initiation',
      'work': 'vocation',
      'relationship': 'relationship',
      'creativity': 'vocation',
      'healing': 'initiation'
    };
    spiral_domain = domainMap[soulState.field.primaryTheme] || 'initiation';
  }

  return {
    spiral_domain,
    spiral_phase,
    spiral_facet,
  };
}

// Navigator Logger for JavaScript Express server
class NavigatorLogger {
  static async logDecision(params) {
    const { memberId, sessionId, soulState, decision } = params;

    try {
      // Map to Spiralogic signature
      const { spiral_domain, spiral_phase, spiral_facet } = mapSoulStateToSpiralogicSignature(soulState);

      await pool.query(
        `
        INSERT INTO navigator_decisions (
          member_id,
          session_id,
          decision_id,
          awareness_level,
          awareness_confidence,
          nervous_system_load,
          life_domain,
          spiral_phase,
          spiral_intensity,
          detected_facet,
          harmony_index,
          total_intensity_load,
          field_primary_theme,
          field_similarity_percentile,
          recommended_protocol_id,
          secondary_protocol_ids,
          guidance_tone,
          depth_level,
          risk_flags,
          requires_facilitator,
          spiral_domain,
          spiral_facet,
          raw_soul_state,
          raw_decision
        ) VALUES (
          $1, $2, $3,
          $4, $5, $6,
          $7, $8, $9,
          $10, $11, $12,
          $13, $14,
          $15, $16,
          $17, $18,
          $19, $20,
          $21, $22,
          $23, $24
        )
        `,
        [
          memberId,
          sessionId || null,
          decision.decisionId,

          soulState.session?.awarenessLevel || null,
          soulState.session?.awarenessConfidence || null,
          soulState.session?.nervousSystemLoad || null,

          soulState.activeSpiral?.lifeDomain || null,
          spiral_phase, // Use Spiralogic-mapped phase
          soulState.activeSpiral?.intensity || null,

          soulState.detectedFacet || null,
          soulState.constellation?.harmonyIndex || null,
          soulState.constellation?.totalIntensityLoad || null,

          soulState.field?.primaryTheme || null,
          soulState.field?.similarityPercentile || null,

          decision.recommendedProtocolId || null,
          decision.secondaryProtocolIds || null,
          decision.guidanceTone || null,
          decision.depthLevel || null,
          decision.riskFlags || null,
          decision.requiresFacilitator || false,

          spiral_domain, // Spiralogic domain
          spiral_facet,  // Spiralogic facet
          JSON.stringify(soulState),
          JSON.stringify(decision),
        ]
      );
      console.log('✅ Navigator decision logged successfully');
    } catch (error) {
      console.error('❌ Failed to log Navigator decision:', error);
      // Don't throw - logging failures shouldn't break the user experience
    }
  }

  static async logFeedback(params) {
    const { decisionId, memberId, rating, notes, source = 'member' } = params;

    try {
      await pool.query(
        `
        INSERT INTO navigator_feedback (
          decision_id,
          member_id,
          rating,
          notes,
          source
        ) VALUES ($1, $2, $3, $4, $5)
        `,
        [decisionId, memberId, rating || null, notes || null, source]
      );
      console.log('✅ Navigator feedback logged successfully');
    } catch (error) {
      console.error('❌ Failed to log Navigator feedback:', error);
      // Don't throw - logging failures shouldn't break the user experience
    }
  }

  static async checkHealth() {
    try {
      const result = await pool.query('SELECT NOW()');
      return { healthy: true, timestamp: result.rows[0].now };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

// Personal Alchemy Navigator Engine v2.0 - Ontological Foundation
class PersonalAlchemyNavigatorEngine {
  static async decide(soulState) {
    console.log('🧙‍♀️ Using Navigator v2.0: Personal Alchemy Engine with Field Learning');

    try {
      // Use complete MAIANavigatorIntegration for full v2.0 experience with field learning
      const navigatorSession = await MAIANavigatorIntegration.conductNavigatorSession({
        userId: soulState.userId,
        userMessage: soulState.description || 'Navigator session request',
        sessionContext: { sessionType: 'navigator-guided' },
        faithContext: this.detectFaithContext(soulState.description || ''),
        previousSessionData: null
      });

      console.log('🧬 Field learning processed:', navigatorSession.fieldLearning?.summary);

      // Convert Navigator v2.0 session to legacy format for existing server
      return this.convertNavigatorSessionToLegacy(navigatorSession, soulState);

    } catch (error) {
      console.error('🔴 Navigator v2.0 with field learning error, falling back to basic engine:', error.message);

      // Fallback to original Navigator v2.0 without field learning
      try {
        const availableProtocols = this.generateMockProtocols(soulState);
        const alchemicalGuidance = await NavigatorEngineV2.generateAlchemicalGuidance(
          soulState,
          availableProtocols
        );
        return this.convertToLegacyFormat(alchemicalGuidance, soulState);
      } catch (fallbackError) {
        console.error('🔴 Navigator fallback error, using simple engine:', fallbackError.message);
        return SimpleNavigatorEngine.decide(soulState);
      }
    }
  }

  static detectFaithContext(message) {
    const text = message.toLowerCase();
    if (text.includes('prayer') || text.includes('god') || text.includes('divine') || text.includes('sacred') || text.includes('spiritual')) return 'faith_based';
    if (text.includes('therapy') || text.includes('trauma') || text.includes('anxiety')) return 'psychology_based';
    if (text.includes('body') || text.includes('nervous system') || text.includes('breath')) return 'physiology_based';
    if (text.includes('meditation') || text.includes('mindfulness') || text.includes('dharma')) return 'eastern_philosophy';
    if (text.includes('research') || text.includes('evidence') || text.includes('study')) return 'scientific_rationalist';
    if (text.includes('creative') || text.includes('art') || text.includes('expression')) return 'artistic_creative';
    return 'universal_human';
  }

  static convertNavigatorSessionToLegacy(navigatorSession, soulState) {
    // Convert the complete Navigator v2.0 session with field learning to legacy format
    return {
      decisionId: navigatorSession.sessionId || uuidv4(),
      timestamp: navigatorSession.timestamp,
      recommendedProtocolId: navigatorSession.practiceGuidance?.primaryPractice?.type || 'gentle-sensing',
      secondaryProtocolIds: navigatorSession.practiceGuidance?.supportingPractices?.map(p => p.type) || [],
      guidanceTone: navigatorSession.navigatorSession?.culturalFramework?.includes('gentle') ? 'gentle' : 'supportive',
      depthLevel: navigatorSession.navigatorSession?.transformationPhase === 'foundation' ? 'surface' : 'medium',
      riskFlags: navigatorSession.safetyGuidance?.riskLevel === 'high' ? ['high_intensity'] :
                 navigatorSession.safetyGuidance?.riskLevel === 'moderate' ? ['stress_detected'] : [],
      requiresFacilitator: navigatorSession.facilitatorAlert || false,
      confidence: 0.9, // High confidence for Navigator v2.0
      reasoning: `Navigator v2.0 Personal Alchemy guidance with ${navigatorSession.navigatorSession?.culturalFramework || 'universal'} cultural framework`,
      suggestedExperienceModules: this.mapToExperienceModules(navigatorSession),
      emphasisElement: navigatorSession.navigatorSession?.elementalBalance ?
        this.getDominantElement(navigatorSession.navigatorSession.elementalBalance) : 'sacred',
      // Include field learning data for logging
      fieldLearning: navigatorSession.fieldLearning
    };
  }

  static mapToExperienceModules(navigatorSession) {
    const modules = ['WelcomePioneerBanner'];

    if (navigatorSession.navigatorSession?.transformationPhase === 'foundation') {
      modules.push('BreathingExercise', 'ReflectionJournal');
    } else if (navigatorSession.navigatorSession?.transformationPhase === 'expansion') {
      modules.push('ConsciousnessComputingPanel', 'DeepReflectionJournal');
    } else {
      modules.push('ConsciousnessComputingPanel', 'IntegrationJournal');
    }

    return modules;
  }

  static getDominantElement(elementalBalance) {
    if (!elementalBalance) return 'sacred';

    const elements = Object.entries(elementalBalance);
    if (elements.length === 0) return 'sacred';

    const [dominantElement] = elements.reduce((a, b) => a[1] > b[1] ? a : b);
    return dominantElement;
  }

  static generateMockProtocols(soulState) {
    // Generate representative protocols for testing
    return [
      {
        type: 'nervous-system-regulation',
        name: 'Nervous System Regulation',
        description: 'Practices to regulate the nervous system and restore balance',
        intensity: 'gentle',
        elementFocus: 'earth',
        facetFocus: 'Earth2'
      },
      {
        type: 'deep-consciousness-exploration',
        name: 'Deep Consciousness Exploration',
        description: 'Profound practices for exploring expanded consciousness',
        intensity: 'deep',
        elementFocus: 'aether',
        facetFocus: 'Aether1',
        transformationFocus: true
      },
      {
        type: 'fire-element-integration',
        name: 'Fire Element Integration',
        description: 'Working with passionate energy and creative fire',
        intensity: 'medium',
        elementFocus: 'fire',
        facetFocus: 'Fire1',
        alchemical: true
      },
      {
        type: 'awareness-cultivation',
        name: 'Awareness Cultivation',
        description: 'Gentle practices for developing mindful awareness',
        intensity: 'gentle',
        elementFocus: 'air',
        facetFocus: 'Air1'
      },
      {
        type: 'grounding',
        name: 'Grounding Practice',
        description: 'Earth-based practices for stability and presence',
        intensity: 'gentle',
        elementFocus: 'earth',
        facetFocus: 'Earth1'
      },
      {
        type: 'gentle-sensing',
        name: 'Gentle Body Sensing',
        description: 'Soft reconnection with bodily awareness',
        intensity: 'micro',
        elementFocus: 'earth',
        facetFocus: 'Core',
        specialized: true
      },
      {
        type: 'attachment-work',
        name: 'Relational Healing Practice',
        description: 'Working with attachment patterns and relationship wounds',
        intensity: 'gentle',
        elementFocus: 'water',
        facetFocus: 'Water3',
        relationalDimension: true
      },
      {
        type: 'creative-channeling',
        name: 'Creative Energy Channeling',
        description: 'Structure for creative flow and artistic expression',
        intensity: 'medium',
        elementFocus: 'fire',
        facetFocus: 'Fire1',
        creativeFocus: true
      }
    ];
  }

  static convertToLegacyFormat(alchemicalGuidance, soulState) {
    const primary = alchemicalGuidance.guidance.primaryProtocol;

    return {
      decisionId: uuidv4(),
      timestamp: new Date().toISOString(),

      // Core protocol selection
      recommendedProtocolId: primary.type,
      secondaryProtocolIds: alchemicalGuidance.guidance.alternatives.map(alt => alt.type),

      // Guidance qualities
      guidanceTone: primary.tone || 'supportive',
      depthLevel: primary.intensity || 'medium',

      // Safety and facilitation
      riskFlags: alchemicalGuidance.safetyGuidance?.protectiveGuidance || [],
      requiresFacilitator: alchemicalGuidance.safetyGuidance?.facilitatorRequired || false,

      // Navigator v2.0 specific
      alchemicalGuidance: {
        culturalFramework: alchemicalGuidance.meta.culturalFramework,
        spiralogicSignature: alchemicalGuidance.meta.spiralogicSignature,
        transformationStage: alchemicalGuidance.alchemicalContext.transformationStage,
        personalAlchemyPotential: primary.personalAlchemyPotential
      },

      // Reasoning with ontological foundation
      confidence: 0.85, // v2.0 has higher confidence due to wisdom integration
      reasoning: `Navigator v2.0 Personal Alchemy: ${alchemicalGuidance.guidance.reasoning.join('; ')}`,

      // Experience modules and elements
      suggestedExperienceModules: this.getModulesForProtocol(primary.type),
      emphasisElement: primary.elementFocus || this.getElementForFacet(soulState.detectedFacet)
    };
  }

  static getModulesForProtocol(protocolType) {
    const moduleMap = {
      'nervous-system-regulation': ['WelcomePioneerBanner', 'BreathingExercise', 'ReflectionJournal'],
      'deep-consciousness-exploration': ['WelcomePioneerBanner', 'ConsciousnessComputingPanel', 'DeepReflectionJournal'],
      'fire-element-integration': ['WelcomePioneerBanner', 'ElementalWork', 'IntegrationJournal'],
      'awareness-cultivation': ['WelcomePioneerBanner', 'ConsciousnessComputingPanel', 'ReflectionJournal'],
      'grounding': ['WelcomePioneerBanner', 'GroundingExercise', 'ReflectionJournal'],
      'gentle-sensing': ['WelcomePioneerBanner', 'SomaticAwareness', 'ReflectionJournal']
    };

    return moduleMap[protocolType] || ['WelcomePioneerBanner', 'ConsciousnessComputingPanel', 'ReflectionJournal'];
  }

  static getElementForFacet(facet) {
    const elementMap = {
      'Fire1': 'fire', 'Fire2': 'fire',
      'Air1': 'air', 'Air2': 'air', 'Air3': 'air',
      'Water1': 'water', 'Water2': 'water', 'Water3': 'water',
      'Earth1': 'earth', 'Earth2': 'earth',
      'Aether1': 'aether', 'Core': 'sacred'
    };
    return elementMap[facet] || 'sacred';
  }
}

// Simplified Navigator Engine for JavaScript integration (fallback)
class SimpleNavigatorEngine {
  static decide(soulState) {
    const decisionId = uuidv4();

    // Extract basic consciousness indicators for rule-based decisions
    const awarenessLevel = soulState.session?.awarenessLevel || 3;
    const stressLevel = soulState.session?.nervousSystemLoad || 'balanced';
    const detectedFacet = soulState.detectedFacet || 'Core';

    // Simple rule-based protocol selection
    let recommendedProtocolId;
    let guidanceTone;
    let depthLevel;
    let riskFlags = [];
    let requiresFacilitator = false;

    if (stressLevel === 'overwhelmed' || stressLevel === 'high_stress') {
      recommendedProtocolId = 'nervous-system-regulation';
      guidanceTone = 'gentle';
      depthLevel = 'surface';
      riskFlags.push('stress_detected');
    } else if (awarenessLevel >= 4) {
      recommendedProtocolId = 'deep-consciousness-exploration';
      guidanceTone = 'supportive';
      depthLevel = 'deep';
      if (awarenessLevel === 5) {
        requiresFacilitator = true;
        riskFlags.push('high_intensity');
      }
    } else if (detectedFacet === 'Fire1' || detectedFacet === 'Fire2') {
      recommendedProtocolId = 'fire-element-integration';
      guidanceTone = 'grounding';
      depthLevel = 'medium';
    } else {
      recommendedProtocolId = 'awareness-cultivation';
      guidanceTone = 'encouraging';
      depthLevel = 'surface';
    }

    // Generate suggestions based on protocol
    const suggestedExperienceModules = this.getModulesForProtocol(recommendedProtocolId);

    return {
      decisionId,
      timestamp: new Date().toISOString(),
      recommendedProtocolId,
      secondaryProtocolIds: [],
      guidanceTone,
      depthLevel,
      riskFlags,
      requiresFacilitator,
      confidence: 0.7,
      reasoning: `Selected ${recommendedProtocolId} based on awareness level ${awarenessLevel}, stress level ${stressLevel}, and detected facet ${detectedFacet}`,
      suggestedExperienceModules,
      emphasisElement: this.getElementForFacet(detectedFacet)
    };
  }

  static getModulesForProtocol(protocolId) {
    const moduleMap = {
      'nervous-system-regulation': ['WelcomePioneerBanner', 'BreathingExercise', 'ReflectionJournal'],
      'deep-consciousness-exploration': ['WelcomePioneerBanner', 'ConsciousnessComputingPanel', 'DeepReflectionJournal'],
      'fire-element-integration': ['WelcomePioneerBanner', 'ElementalWork', 'IntegrationJournal'],
      'awareness-cultivation': ['WelcomePioneerBanner', 'ConsciousnessComputingPanel', 'ReflectionJournal']
    };

    return moduleMap[protocolId] || ['WelcomePioneerBanner', 'ConsciousnessComputingPanel', 'ReflectionJournal'];
  }

  static getElementForFacet(facet) {
    const elementMap = {
      'Fire1': 'fire',
      'Fire2': 'fire',
      'Air1': 'air',
      'Air2': 'air',
      'Water1': 'water',
      'Water2': 'water',
      'Earth1': 'earth',
      'Earth2': 'earth'
    };

    return elementMap[facet] || 'sacred';
  }
}

// Simple Soul State Builder for JavaScript integration
class SimpleSoulStateBuilder {
  static async buildForRequest(params) {
    const { userId, message, sessionType = 'individual' } = params;

    // Simulate soul state building from consciousness computing data
    // In a full implementation, this would integrate with your Seven-Layer Architecture

    const awarenessLevel = Math.floor(Math.random() * 5) + 1;
    const nervousSystemLoad = this.detectNervousSystemLoad(message);
    const detectedFacet = this.detectFacet(message, awarenessLevel);

    return {
      userId,
      sessionId: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),

      session: {
        awarenessLevel,
        awarenessConfidence: 0.5 + Math.random() * 0.5,
        nervousSystemLoad,
        sessionType
      },

      activeSpiral: {
        lifeDomain: 'consciousness-exploration',
        currentPhase: awarenessLevel >= 4 ? 'expansion' : 'foundation',
        intensity: Math.random()
      },

      detectedFacet,

      constellation: {
        harmonyIndex: Math.random() * 0.4 + 0.6, // 0.6-1.0
        totalIntensityLoad: Math.random() * 0.8 + 0.2 // 0.2-1.0
      },

      field: {
        primaryTheme: 'individual-consciousness-exploration',
        similarityPercentile: Math.random()
      }
    };
  }

  static detectNervousSystemLoad(message) {
    const stressKeywords = ['overwhelmed', 'stressed', 'anxious', 'exhausted', 'tired'];
    const calmKeywords = ['peaceful', 'calm', 'relaxed', 'balanced', 'centered'];

    const lowerMessage = message.toLowerCase();

    if (stressKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'overwhelmed';
    } else if (calmKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'balanced';
    } else {
      return 'moderate';
    }
  }

  static detectFacet(message, awarenessLevel) {
    // Simple facet detection based on content and awareness level
    const facets = ['Core', 'Fire1', 'Fire2', 'Air1', 'Air2', 'Water1', 'Water2', 'Earth1', 'Earth2'];

    if (awarenessLevel <= 2) return 'Core';
    if (awarenessLevel >= 5) return 'Fire2';

    // Simple keyword-based detection
    if (message.toLowerCase().includes('passion') || message.toLowerCase().includes('energy')) {
      return Math.random() > 0.5 ? 'Fire1' : 'Fire2';
    }

    return facets[Math.floor(Math.random() * facets.length)];
  }
}

module.exports = {
  NavigatorLogger,
  PersonalAlchemyNavigatorEngine,
  SimpleNavigatorEngine,
  SimpleSoulStateBuilder,
  pool
};