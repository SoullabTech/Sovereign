/**
 * Wisdom Engine Matrix Integration
 * Plugs consciousness matrix directly into existing wisdom-engine-api.js
 *
 * USAGE: Replace existing soulState creation with this enhanced version
 */

const { MatrixAnalyzer, NavigatorModeSelector, GoldenRuleValidator } = require('./navigator-matrix-implementation');

/**
 * Enhanced soul state that includes consciousness matrix
 * Replaces the existing liveSoulState creation in wisdom-engine-api.js
 */
function createEnhancedSoulState(userId, userMessage, conversationHistory = []) {
  // Analyze consciousness matrix from user message
  const analyzer = new MatrixAnalyzer();
  const dials = analyzer.analyzeDials(userMessage);

  // Generate Navigator response based on matrix
  const selector = new NavigatorModeSelector();
  const matrixResponse = selector.generateResponse(dials, userMessage);

  // Create enhanced soul state (preserving existing structure)
  const enhancedSoulState = {
    // EXISTING STRUCTURE (keep as-is for compatibility)
    session: {
      awarenessLevel: 3,
      nervousSystemLoad: mapDialsToNervousSystemLoad(dials)
    },
    activeSpiral: {
      currentPhase: mapDialsToSpiralPhase(dials)
    },
    detectedFacet: 'Core',
    constellation: {
      harmonyIndex: calculateHarmonyFromDials(dials)
    },

    // NEW: Consciousness Matrix Data
    consciousnessMatrix: {
      dials,
      mode: matrixResponse.mode,
      safetyLevel: getSafetyLevel(dials),
      confidence: 0.85,
      lastUpdated: Date.now()
    }
  };

  return enhancedSoulState;
}

/**
 * Enhanced Navigator decision that incorporates matrix protocols
 * Replaces the existing liveNavigatorDecision creation
 */
function createEnhancedNavigatorDecision(userMessage, enhancedSoulState) {
  const { consciousnessMatrix } = enhancedSoulState;
  const { dials, mode } = consciousnessMatrix;

  // Base decision structure (preserving existing fields)
  let enhancedDecision = {
    recommendedProtocolId: mapModeToProtocol(mode),
    guidanceTone: mapModeToTone(mode),
    depthLevel: mapModeToDepthLevel(mode),
    confidence: 0.8,
    reasoning: `Matrix-guided: ${mode} mode based on consciousness assessment`
  };

  // Override for safety if any red dials detected
  if (new MatrixAnalyzer().hasRedDials(dials)) {
    enhancedDecision = {
      ...enhancedDecision,
      recommendedProtocolId: 'crisis-safety-protocol',
      guidanceTone: 'extremely-calm-directive',
      depthLevel: 'basic-safety',
      confidence: 0.95,
      reasoning: 'RED ALERT: Crisis state detected - safety protocols activated'
    };
  }

  // Add matrix-specific guidance
  enhancedDecision.matrixGuidance = {
    mode: mode,
    actions: getActionsForMode(mode),
    contraindications: getContraindicationsForMode(mode, dials),
    professionalReferralNeeded: shouldReferToProfessional(dials)
  };

  return enhancedDecision;
}

/**
 * Mapping functions to convert matrix data to existing Navigator concepts
 */

function mapDialsToNervousSystemLoad(dials) {
  const analyzer = new MatrixAnalyzer();

  if (analyzer.hasRedDials(dials)) return 'crisis';
  if (analyzer.countYellowDials(dials) > 2) return 'overwhelmed';
  if (analyzer.countYellowDials(dials) > 0) return 'stressed';
  return 'balanced';
}

function mapDialsToSpiralPhase(dials) {
  const analyzer = new MatrixAnalyzer();

  if (analyzer.hasRedDials(dials)) return 'crisis-stabilization';
  if (analyzer.countYellowDials(dials) > 0) return 'grounding';
  return 'integration';
}

function calculateHarmonyFromDials(dials) {
  const greenCount = Object.values(dials).filter(dial => dial === 'green').length;
  const totalDials = Object.keys(dials).length;
  return greenCount / totalDials; // Returns 0.0 to 1.0
}

function getSafetyLevel(dials) {
  const analyzer = new MatrixAnalyzer();

  if (analyzer.hasRedDials(dials)) return 'red';
  if (analyzer.countYellowDials(dials) > 0) return 'yellow';
  return 'green';
}

function mapModeToProtocol(mode) {
  const protocolMap = {
    'DEPTH': 'deep-exploration-cultivation',
    'BRIDGING': 'stabilization-resourcing',
    'SAFETY': 'crisis-safety-grounding'
  };
  return protocolMap[mode] || 'awareness-cultivation';
}

function mapModeToTone(mode) {
  const toneMap = {
    'DEPTH': 'curious-challenging',
    'BRIDGING': 'warm-supportive',
    'SAFETY': 'calm-directive'
  };
  return toneMap[mode] || 'supportive';
}

function mapModeToDepthLevel(mode) {
  const depthMap = {
    'DEPTH': 'transformational',
    'BRIDGING': 'stabilizing',
    'SAFETY': 'basic'
  };
  return depthMap[mode] || 'medium';
}

function getActionsForMode(mode) {
  const actionMap = {
    'DEPTH': [
      'Ask complex, open-ended questions',
      'Introduce Spiralogic archetypes',
      'Challenge assumptions playfully',
      'Explore shadow aspects'
    ],
    'BRIDGING': [
      'Validate feelings first',
      'Focus on small, achievable steps',
      'Offer practical resources',
      'Normalize the struggle'
    ],
    'SAFETY': [
      'Provide immediate grounding',
      'Use simple, concrete language',
      'Avoid exploration or depth work',
      'Consider professional referral'
    ]
  };
  return actionMap[mode] || [];
}

function getContraindicationsForMode(mode, dials) {
  if (mode === 'SAFETY') {
    return [
      'NO trauma exploration',
      'NO complex spiritual concepts',
      'NO challenging work',
      'NO deep emotional processing'
    ];
  }

  if (mode === 'BRIDGING') {
    return [
      'Avoid overwhelming transformational work',
      'No intensive shadow work',
      'Limit challenging assumptions',
      'Focus on support over growth'
    ];
  }

  return []; // DEPTH mode has no contraindications
}

function shouldReferToProfessional(dials) {
  const criticalTriggers = [
    dials.affect === 'red',     // Suicidal/manic states
    dials.attention === 'red',  // Psychotic symptoms
    dials.edgeRisk === 'red'    // Active trauma/breakdown
  ];

  return criticalTriggers.some(trigger => trigger);
}

/**
 * Log analysis function for team review
 * Implements the "Golden Rule" validation from the internal spec
 */
function analyzeSessionForGoldenRule(sessionLog) {
  const validator = new GoldenRuleValidator();

  const results = sessionLog.exchanges.map(exchange => {
    const analyzer = new MatrixAnalyzer();
    const dials = analyzer.analyzeDials(exchange.userMessage);
    const expectedMode = new NavigatorModeSelector().selectMode(dials);

    return validator.validateResponse(
      dials,
      exchange.maiaModeUsed,
      exchange.userMessage,
      exchange.maiaResponse
    );
  });

  return {
    sessionId: sessionLog.sessionId,
    overallGrade: calculateOverallGrade(results),
    exchanges: results,
    recommendations: generateTuningRecommendations(results)
  };
}

function calculateOverallGrade(results) {
  const failures = results.filter(r => r.grade === 'FAILURE').length;
  const successes = results.filter(r => r.grade === 'SUCCESS').length;

  if (failures > 0) return 'NEEDS_TUNING';
  if (successes >= results.length * 0.8) return 'EXCELLENT';
  return 'GOOD';
}

function generateTuningRecommendations(results) {
  const failures = results.filter(r => r.grade === 'FAILURE');
  const recommendations = [];

  if (failures.length > 0) {
    recommendations.push(
      'URGENT: Increase sensitivity to crisis state detection',
      'Review red trigger keywords',
      'Strengthen safety protocol activation'
    );
  }

  return recommendations;
}

/**
 * INTEGRATION EXAMPLE FOR WISDOM-ENGINE-API.JS
 */
function exampleWisdomEngineIntegration(userMessage, userId, sessionId) {
  // REPLACE EXISTING CODE:
  // const liveSoulState = {
  //   session: { awarenessLevel: 3, nervousSystemLoad: 'balanced' },
  //   ...
  // };

  // WITH THIS:
  const enhancedSoulState = createEnhancedSoulState(userId, userMessage);
  const enhancedNavigatorDecision = createEnhancedNavigatorDecision(userMessage, enhancedSoulState);

  // Log for Golden Rule analysis
  console.log('🧭 Matrix Analysis:', {
    mode: enhancedSoulState.consciousnessMatrix.mode,
    safetyLevel: enhancedSoulState.consciousnessMatrix.safetyLevel,
    dials: enhancedSoulState.consciousnessMatrix.dials
  });

  // Continue with existing WisdomEngine.translateNavigatorToMAIA call
  // but now with consciousness-aware soul state and navigator decision
  return {
    soulState: enhancedSoulState,
    navigatorDecision: enhancedNavigatorDecision
  };
}

module.exports = {
  createEnhancedSoulState,
  createEnhancedNavigatorDecision,
  analyzeSessionForGoldenRule,
  exampleWisdomEngineIntegration
};