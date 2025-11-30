/**
 * SPIRALOGIC API ROUTES
 *
 * Core API endpoints for the Spiralogic Engine
 * Provides spiral quest progression, state management, and integration discovery
 */

import { Router, Request, Response } from 'express';
import { SpiralogicEngine } from '../../lib/spiralogic/core/spiralogic-engine';
import { logger } from '../utils/logger';
import { authenticateUser } from '../middleware/auth';

const router = Router();
let spiralogicEngine: SpiralogicEngine | null = null;

// Initialize Spiralogic Engine singleton
async function getSpiralogicEngine(): Promise<SpiralogicEngine> {
  if (!spiralogicEngine) {
    spiralogicEngine = new SpiralogicEngine();
    await spiralogicEngine.initialize();
    logger.info('[SPIRALOGIC] Engine initialized');
  }
  return spiralogicEngine;
}

/**
 * POST /api/spiralogic/enter-spiral
 * Enter or progress through an elemental spiral
 */
router.post('/enter-spiral', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { element, userId } = req.body;

    // Use authenticated user ID or provided userId (for admin)
    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!element || !['fire', 'water', 'earth', 'air', 'aether', 'shadow'].includes(element)) {
      return res.status(400).json({ error: 'Valid element required (fire, water, earth, air, aether, shadow)' });
    }

    const engine = await getSpiralogicEngine();
    const result = await engine.enterSpiral(targetUserId, element);

    logger.info('[SPIRALOGIC] Spiral entry:', {
      userId: targetUserId,
      element,
      success: result.success,
      depth: result.depth
    });

    res.json({
      success: true,
      spiralogic: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('[SPIRALOGIC] Failed to enter spiral:', error);
    res.status(500).json({
      error: 'Failed to enter spiral',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/spiralogic/state/:userId
 * Get current spiral state for user
 */
router.get('/state/:userId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate user access
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    const engine = await getSpiralogicEngine();
    const state = await engine.getUserState(userId);

    if (!state) {
      return res.json({
        success: true,
        state: null,
        message: 'No spiral journey started yet'
      });
    }

    // Generate visualization for current state
    const visualization = {
      elements: {},
      spiralCompletion: '0%',
      integrations: state.integrations,
      currentPosition: state.position
    };

    // Calculate element progress
    const elements = ['fire', 'water', 'earth', 'air', 'aether', 'shadow'];
    elements.forEach(element => {
      const depth = state.elementDepths[element] || 0;
      visualization.elements[element] = {
        current: depth,
        max: 3,
        progress: depth > 0 ? Array(3).fill(0).map((_, i) => i < depth ? '●' : '○').join('→') : '○→○→○',
        mastered: depth === 3
      };
    });

    // Calculate total completion
    const totalDepth = Object.values(state.elementDepths).reduce((a: number, b: number) => a + b, 0);
    const maxDepth = elements.length * 3;
    visualization.spiralCompletion = `${((totalDepth / maxDepth) * 100).toFixed(1)}%`;

    res.json({
      success: true,
      state: {
        userId: state.userId,
        position: state.position,
        elementDepths: state.elementDepths,
        integrations: state.integrations,
        shadowDepth: state.shadowDepth,
        lastTransition: state.lastTransition,
        totalJourneyTime: state.totalJourneyTime
      },
      visualization,
      availableElements: elements.filter(el => {
        const currentDepth = state.elementDepths[el] || 0;
        return currentDepth < 3; // Can still progress
      })
    });

  } catch (error) {
    logger.error('[SPIRALOGIC] Failed to get state:', error);
    res.status(500).json({
      error: 'Failed to get spiral state',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/spiralogic/integrations/:userId
 * Get available and unlocked integrations for user
 */
router.get('/integrations/:userId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate user access
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    const engine = await getSpiralogicEngine();
    const integrations = await engine.checkUserIntegrations(userId);
    const state = await engine.getUserState(userId);

    if (!state) {
      return res.json({
        success: true,
        integrations: [],
        available: [],
        message: 'No spiral journey started yet'
      });
    }

    // Define all possible integrations with requirements
    const allIntegrations = [
      {
        name: 'steam-rising',
        display: 'Steam Rising',
        elements: ['fire', 'water'],
        minDepth: 1,
        description: 'Fire and Water dance together - emotional alchemy',
        unlocked: integrations.includes('steam-rising')
      },
      {
        name: 'grounded-fire',
        display: 'Grounded Fire',
        elements: ['fire', 'earth'],
        minDepth: 1,
        description: 'Passion manifests through solid foundation',
        unlocked: integrations.includes('grounded-fire')
      },
      {
        name: 'flowing-earth',
        display: 'Flowing Earth',
        elements: ['water', 'earth'],
        minDepth: 2,
        description: 'Emotions shape form - the mud lotus blooms',
        unlocked: integrations.includes('flowing-earth')
      },
      {
        name: 'sacred-breath',
        display: 'Sacred Breath',
        elements: ['air', 'fire', 'water'],
        minDepth: 2,
        description: 'Breath unites passion and emotion through clarity',
        unlocked: integrations.includes('sacred-breath')
      },
      {
        name: 'quintessence',
        display: 'The Quintessence',
        elements: ['fire', 'water', 'earth', 'air', 'aether'],
        minDepth: 2,
        description: 'All elements unite in the fifth essence',
        unlocked: integrations.includes('quintessence')
      },
      {
        name: 'great-work',
        display: 'The Great Work',
        elements: ['fire', 'water', 'earth', 'air', 'aether', 'shadow'],
        minDepth: 3,
        description: 'The alchemical opus - lead into gold',
        unlocked: integrations.includes('great-work')
      }
    ];

    // Check which integrations are available but not yet unlocked
    const available = allIntegrations.filter(integration => {
      if (integration.unlocked) return false;

      return integration.elements.every(element =>
        (state.elementDepths[element] || 0) >= integration.minDepth
      );
    });

    res.json({
      success: true,
      integrations: allIntegrations.filter(i => i.unlocked),
      available,
      totalUnlocked: integrations.length,
      progressToNext: available.length > 0 ? available[0] : null
    });

  } catch (error) {
    logger.error('[SPIRALOGIC] Failed to get integrations:', error);
    res.status(500).json({
      error: 'Failed to get integrations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/spiralogic/detect-element
 * Detect elemental intent from user input
 */
router.post('/detect-element', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { text, userId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text input required' });
    }

    // Simple element detection patterns
    const patterns = {
      fire: /fire|flame|burn|ignite|passion|energy|transform|anger|rage|intensity|heat|spark/i,
      water: /water|flow|emotion|feel|ocean|river|tears|fluid|intuition|depth|current|wave/i,
      earth: /earth|ground|foundation|solid|stable|body|physical|material|structure|root|grounded/i,
      air: /air|wind|thought|clarity|breath|mind|mental|communicate|speak|express|ideas/i,
      aether: /aether|ether|unity|spirit|connection|consciousness|transcend|divine|sacred|oneness/i,
      shadow: /shadow|dark|hidden|unconscious|fear|rejected|denied|avoid|suppress|integrate/i
    };

    let detectedElement = null;
    let confidence = 0;

    for (const [element, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches) {
        const elementConfidence = matches.length / text.split(' ').length;
        if (elementConfidence > confidence) {
          confidence = elementConfidence;
          detectedElement = element;
        }
      }
    }

    // Check if spiral quest is available for detected element
    let questAvailable = false;
    if (detectedElement && userId) {
      const engine = await getSpiralogicEngine();
      const state = await engine.getUserState(userId);

      if (state) {
        const currentDepth = state.elementDepths[detectedElement] || 0;
        questAvailable = currentDepth < 3; // Can progress if not at max depth
      } else {
        questAvailable = true; // First time user
      }
    }

    res.json({
      success: true,
      detection: {
        element: detectedElement,
        confidence: Math.round(confidence * 100),
        questAvailable,
        suggestions: detectedElement ? [`Enter the ${detectedElement} spiral`] : ['Try mentioning an element: fire, water, earth, air, aether, or shadow']
      }
    });

  } catch (error) {
    logger.error('[SPIRALOGIC] Failed to detect element:', error);
    res.status(500).json({
      error: 'Failed to detect element',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/spiralogic/quest/:element/:depth
 * Get specific quest content for element and depth
 */
router.get('/quest/:element/:depth', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { element, depth } = req.params;
    const userId = req.user?.id;

    if (!['fire', 'water', 'earth', 'air', 'aether', 'shadow'].includes(element)) {
      return res.status(400).json({ error: 'Invalid element' });
    }

    const depthNum = parseInt(depth);
    if (isNaN(depthNum) || depthNum < 1 || depthNum > 3) {
      return res.status(400).json({ error: 'Depth must be 1, 2, or 3' });
    }

    // Define spiral quests
    const spiralQuests = {
      fire: {
        1: { question: "What needs to ignite?", theme: "The Spark Within" },
        2: { question: "What must burn away?", theme: "The Sacred Destruction" },
        3: { question: "What emerges from the ashes?", theme: "The Phoenix Rising" }
      },
      water: {
        1: { question: "What emotions are present?", theme: "The Feeling Waters" },
        2: { question: "What flows beneath the surface?", theme: "The Deep Currents" },
        3: { question: "How do you merge with the flow?", theme: "Becoming Water" }
      },
      earth: {
        1: { question: "Where is your foundation?", theme: "The Solid Ground" },
        2: { question: "What structure serves your growth?", theme: "The Sacred Architecture" },
        3: { question: "How do you embody stillness?", theme: "The Mountain Being" }
      },
      air: {
        1: { question: "What thoughts arise?", theme: "The Mental Winds" },
        2: { question: "What clarity seeks expression?", theme: "The Clear Sky" },
        3: { question: "How does wisdom speak through you?", theme: "The Voice of Truth" }
      },
      aether: {
        1: { question: "What connects all things?", theme: "The Unified Field" },
        2: { question: "How does spirit manifest?", theme: "The Sacred Manifestation" },
        3: { question: "What transcends duality?", theme: "The Non-Dual Awareness" }
      },
      shadow: {
        1: { question: "What remains hidden?", theme: "The Unseen Aspects" },
        2: { question: "What seeks integration?", theme: "The Shadow Dance" },
        3: { question: "How does darkness illuminate?", theme: "The Dark Light" }
      }
    };

    const quest = spiralQuests[element]?.[depthNum];

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if user has access to this quest
    if (userId) {
      const engine = await getSpiralogicEngine();
      const state = await engine.getUserState(userId);

      if (state) {
        const userDepth = state.elementDepths[element] || 0;
        if (depthNum > userDepth + 1) {
          return res.status(403).json({
            error: 'Quest not accessible yet',
            message: `Complete depth ${userDepth + 1} first`
          });
        }
      }
    }

    res.json({
      success: true,
      quest: {
        element,
        depth: depthNum,
        question: quest.question,
        theme: quest.theme,
        practices: getPracticesForDepth(element, depthNum),
        reflections: getReflectionsForDepth(element, depthNum)
      }
    });

  } catch (error) {
    logger.error('[SPIRALOGIC] Failed to get quest:', error);
    res.status(500).json({
      error: 'Failed to get quest',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/spiralogic/status
 * Get Spiralogic Engine status and health
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const engine = spiralogicEngine;

    res.json({
      success: true,
      status: {
        engineInitialized: !!engine,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: [
          'spiral-progression',
          'integration-discovery',
          'element-detection',
          'quest-system',
          'balance-requirements',
          'shadow-gating'
        ]
      }
    });

  } catch (error) {
    logger.error('[SPIRALOGIC] Failed to get status:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Helper functions
 */
function getPracticesForDepth(element: string, depth: number): string[] {
  const practices = {
    fire: {
      1: ['candle-gazing', 'spark-meditation', 'passion-sensing'],
      2: ['fire-breathing', 'release-ritual', 'anger-alchemy'],
      3: ['phoenix-embodiment', 'eternal-flame', 'sacred-destruction']
    },
    water: {
      1: ['flow-sensing', 'emotion-waves', 'water-scrying'],
      2: ['deep-diving', 'current-navigation', 'emotional-depth'],
      3: ['ocean-merge', 'formless-flow', 'water-consciousness']
    },
    earth: {
      1: ['grounding-roots', 'foundation-sensing', 'earth-connection'],
      2: ['mountain-sitting', 'structure-building', 'earth-wisdom'],
      3: ['bedrock-being', 'crystallization', 'mountain-consciousness']
    },
    air: {
      1: ['breath-awareness', 'mind-watching', 'thought-clouds'],
      2: ['clarity-breathing', 'mental-spaciousness', 'air-wisdom'],
      3: ['wind-consciousness', 'thought-mastery', 'clear-expression']
    },
    aether: {
      1: ['unity-sensing', 'connection-awareness', 'field-perception'],
      2: ['spirit-manifestation', 'consciousness-recognition', 'unity-practice'],
      3: ['non-dual-awareness', 'consciousness-embodiment', 'unity-being']
    },
    shadow: {
      1: ['shadow-acknowledgment', 'projection-recognition', 'denied-aspects'],
      2: ['shadow-dialogue', 'integration-practice', 'wholeness-embrace'],
      3: ['shadow-mastery', 'dark-light-unity', 'complete-acceptance']
    }
  };

  return practices[element]?.[depth] || ['contemplation', 'presence-practice'];
}

function getReflectionsForDepth(element: string, depth: number): string[] {
  const baseReflections = [
    `How has your relationship with ${element} evolved?`,
    `What resistance do you notice with ${element}?`,
    `How does ${element} want to express through you?`
  ];

  if (depth > 1) {
    baseReflections.push(`What did you discover in your previous ${element} spiral?`);
  }

  return baseReflections;
}

export default router;