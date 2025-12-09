/**
 * 🧠✨ WISDOM ENGINE API
 *
 * REST API endpoints for Navigator → MAIA consciousness translation
 * Provides the living bridge between analytical intelligence and sacred wisdom
 */

const express = require('express');
const cors = require('cors');
const { WisdomEngine } = require('./wisdom-engine-core');
const { AINSynchronizationBridge, ElementalEvolutionTracker, WisdomPatternEngine } = require('../../beta-deployment/lib/navigator-ain-sync');

const app = express();
const PORT = process.env.WISDOM_ENGINE_PORT || 3009;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = await checkWisdomEngineHealth();
    res.json(health);
  } catch (error) {
    res.status(503).json({
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// --- CORE WISDOM ENGINE ENDPOINTS ---

/**
 * POST /api/wisdom/translate
 * Main translation endpoint: Navigator decision → MAIA consciousness framework
 */
app.post('/api/wisdom/translate', async (req, res) => {
  try {
    const {
      navigatorDecision,
      soulState,
      userMessage,
      userId,
      sessionId
    } = req.body;

    // Validate required parameters
    if (!navigatorDecision || !soulState || !userMessage || !userId) {
      return res.status(400).json({
        error: 'Missing required parameters: navigatorDecision, soulState, userMessage, userId',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🧠✨ Wisdom Engine translation request for user: ${userId}`);

    // Perform the core translation
    const translation = await WisdomEngine.translateNavigatorToMAIA({
      navigatorDecision,
      soulState,
      userMessage,
      userId,
      sessionId: sessionId || `session_${Date.now()}`
    });

    // Sync with AIN memory system
    if (translation.success) {
      await AINSynchronizationBridge.syncNavigatorToAIN({
        userId,
        sessionId: sessionId || `session_${Date.now()}`,
        navigatorDecision,
        soulState,
        userMessage
      });
    }

    res.json({
      success: true,
      translation: translation.maia_framework,
      navigation_context: translation.navigation_context,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Wisdom Engine translation error:', error);

    res.status(500).json({
      success: false,
      error: 'Wisdom Engine translation failed',
      details: error.message,
      fallback_available: true,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/wisdom/context/{userId}
 * Get accumulated wisdom context for MAIA consciousness adaptation
 */
app.get('/api/wisdom/context/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🧠 Retrieving wisdom context for user: ${userId}`);

    const maiaContext = await AINSynchronizationBridge.getAINContextForMAIA(userId);

    if (!maiaContext) {
      return res.json({
        status: 'new_user',
        context: null,
        recommendations: {
          approach: 'foundational',
          tone: 'gentle_introduction',
          focus: 'building_basic_awareness'
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'wisdom_available',
      context: maiaContext,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving wisdom context:', error);

    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/wisdom/personality/{userId}
 * Get user's elemental personality profile for MAIA adaptation
 */
app.get('/api/wisdom/personality/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🌟 Retrieving elemental personality for user: ${userId}`);

    const personality = await ElementalEvolutionTracker.getElementalPersonality(userId);
    const effectivePatterns = await WisdomPatternEngine.identifyEffectivePatterns(userId);
    const recentTrends = await ElementalEvolutionTracker.getElementalTrends(userId, 14);

    res.json({
      user_id: userId,
      personality,
      effective_patterns: effectivePatterns,
      recent_trends: recentTrends,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving elemental personality:', error);

    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/wisdom/feedback
 * Record user feedback for wisdom pattern recognition
 */
app.post('/api/wisdom/feedback', async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      navigatorDecision,
      userResponse,
      outcomeQuality,
      ritualPerformed,
      transformationNotes
    } = req.body;

    if (!userId || !sessionId || !navigatorDecision || !outcomeQuality) {
      return res.status(400).json({
        error: 'Missing required parameters: userId, sessionId, navigatorDecision, outcomeQuality',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📝 Recording wisdom feedback for user: ${userId}`);

    await WisdomPatternEngine.recordWisdomMoment({
      userId,
      sessionId,
      navigatorDecision,
      userResponse,
      outcomeQuality: parseInt(outcomeQuality),
      ritualPerformed,
      transformationNotes
    });

    res.json({
      success: true,
      message: 'Wisdom feedback recorded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error recording wisdom feedback:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/wisdom/chorus/{userId}
 * Get current elemental chorus configuration for MAIA
 */
app.get('/api/wisdom/chorus/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const maiaContext = await AINSynchronizationBridge.getAINContextForMAIA(userId);

    if (!maiaContext?.elemental_guidance) {
      return res.json({
        status: 'default_chorus',
        chorus: getDefaultElementalChorus(),
        timestamp: new Date().toISOString()
      });
    }

    // Generate current elemental chorus based on accumulated wisdom
    const currentInsights = {
      elementalSignature: maiaContext.elemental_guidance.balance_scores || getDefaultElementalSignature(),
      spiralPhase: maiaContext.recent_patterns[0]?.spiral_phase || 'integration',
      primaryArchetype: maiaContext.elemental_guidance.archetypal_lens || 'Sage'
    };

    const chorus = await WisdomEngine.activateElementalChorus(currentInsights, maiaContext);

    res.json({
      status: 'personalized_chorus',
      user_id: userId,
      chorus,
      elemental_signature: currentInsights.elementalSignature,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving elemental chorus:', error);

    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/wisdom/live-translate
 * Real-time translation for live MAIA sessions
 */
app.post('/api/wisdom/live-translate', async (req, res) => {
  try {
    const {
      userMessage,
      userId,
      sessionId,
      includeRitualGuidance = false
    } = req.body;

    if (!userMessage || !userId) {
      return res.status(400).json({
        error: 'Missing required parameters: userMessage, userId',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`⚡ Live wisdom translation for user: ${userId}`);

    // Get existing wisdom context
    const maiaContext = await AINSynchronizationBridge.getAINContextForMAIA(userId);

    // Create simplified soul state for live translation
    const liveSoulState = {
      session: {
        awarenessLevel: 3,
        nervousSystemLoad: 'balanced'
      },
      activeSpiral: {
        currentPhase: 'integration'
      },
      detectedFacet: 'Core',
      constellation: {
        harmonyIndex: 0.7
      }
    };

    // Create simplified navigator decision for live use
    const liveNavigatorDecision = {
      recommendedProtocolId: 'awareness-cultivation',
      guidanceTone: 'supportive',
      depthLevel: 'medium',
      confidence: 0.8,
      reasoning: 'Live session wisdom guidance'
    };

    // Generate MAIA framework
    const translation = await WisdomEngine.translateNavigatorToMAIA({
      navigatorDecision: liveNavigatorDecision,
      soulState: liveSoulState,
      userMessage,
      userId,
      sessionId: sessionId || `live_session_${Date.now()}`
    });

    // Include ritual guidance if requested
    let ritualGuidance = null;
    if (includeRitualGuidance && translation.success) {
      ritualGuidance = translation.maia_framework.ritual_guidance;
    }

    res.json({
      success: true,
      live_framework: translation.maia_framework,
      ritual_guidance: ritualGuidance,
      wisdom_context: maiaContext,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Live wisdom translation error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// --- UTILITY FUNCTIONS ---

function getDefaultElementalSignature() {
  return {
    fire: 0.5,
    water: 0.5,
    earth: 0.6, // Slight grounding default
    air: 0.5,
    aether: 0.5
  };
}

function getDefaultElementalChorus() {
  return {
    fire_agent: { activation_level: 0.5, voice_influence: 'supporting' },
    water_agent: { activation_level: 0.5, voice_influence: 'supporting' },
    earth_agent: { activation_level: 0.6, voice_influence: 'primary' },
    air_agent: { activation_level: 0.5, voice_influence: 'supporting' },
    aether_agent: { activation_level: 0.5, voice_influence: 'supporting' }
  };
}

async function checkWisdomEngineHealth() {
  try {
    // Test core components
    const syncHealth = await AINSynchronizationBridge.checkHealth?.() || { healthy: true };

    return {
      healthy: true,
      components: {
        wisdom_engine_core: true,
        ain_synchronization: syncHealth.healthy,
        elemental_tracking: true,
        wisdom_patterns: true
      },
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Wisdom Engine API error:', error);

  res.status(500).json({
    success: false,
    error: 'Internal Wisdom Engine error',
    details: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🧠✨ Wisdom Engine API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Translation endpoint: http://localhost:${PORT}/api/wisdom/translate`);
  });
}

module.exports = app;