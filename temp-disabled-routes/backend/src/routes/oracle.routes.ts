import { Router, Request, Response } from "express";
import { processSoulLabConversation } from "../services/SoulLabOrchestrator";
import { SpiralogicEngine } from "../../lib/spiralogic/core/spiralogic-engine";
import { GameplayModeManager } from "../../lib/spiralogic/modes/gameplay-modes";
import { logger } from "../utils/logger";

const router = Router();

// Initialize Spiralogic Engine and Gameplay Manager
let spiralogicEngine: SpiralogicEngine | null = null;
let gameplayManager: GameplayModeManager | null = null;

async function getSpiralogicEngine(): Promise<SpiralogicEngine> {
  if (!spiralogicEngine) {
    spiralogicEngine = new SpiralogicEngine();
    await spiralogicEngine.initialize();
    logger.info('[ORACLE] Spiralogic Engine initialized');
  }
  return spiralogicEngine;
}

function getGameplayManager(): GameplayModeManager {
  if (!gameplayManager) {
    gameplayManager = new GameplayModeManager();
    logger.info('[ORACLE] Gameplay Mode Manager initialized');
  }
  return gameplayManager;
}

// Element detection patterns
function detectElementalIntent(input: string): { element: string | null; confidence: number } {
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
    const matches = input.match(pattern);
    if (matches) {
      const elementConfidence = matches.length / input.split(' ').length;
      if (elementConfidence > confidence) {
        confidence = elementConfidence;
        detectedElement = element;
      }
    }
  }

  return { element: detectedElement, confidence };
}

// POST /api/oracle/respond - Now powered by SoulLab Sacred Technology
router.post("/respond", async (req: Request, res: Response) => {
  const {
    input,
    userId,
    context,
    preferredElement,
    requestShadowWork,
    collectiveInsight,
    harmonicResonance,
  } = req.body;

  if (!input || !userId) {
    return res
      .status(400)
      .json({ error: "Missing required fields: input and userId" });
  }

  try {
    logger.info('Oracle route processing through SoulLab + Spiralogic', { userId, inputLength: input.length });

    // Detect gameplay mode
    const gameplayMgr = getGameplayManager();
    const detectedMode = gameplayMgr.detectMode(input);

    // Get mode context if detected
    let modeContext = null;
    if (detectedMode) {
      modeContext = gameplayMgr.getModeContext(detectedMode);
      gameplayMgr.setMode(detectedMode);
      logger.info('[ORACLE] Gameplay mode detected', { userId, mode: detectedMode });
    }

    // Check if this should route through Spiralogic (only for spiral-quest mode)
    let spiralogicResponse = null;
    if (detectedMode === 'spiral-quest') {
      const elementalDetection = detectElementalIntent(input);

      if (elementalDetection.element && elementalDetection.confidence > 0.1) {
        try {
          const engine = await getSpiralogicEngine();
          const spiralResult = await engine.enterSpiral(userId, elementalDetection.element);

          if (spiralResult.success) {
            spiralogicResponse = {
              spiralProgression: spiralResult,
              elementDetected: elementalDetection.element,
              confidence: elementalDetection.confidence,
              questActive: true,
              mode: 'spiral-quest'
            };

            logger.info('[ORACLE] Spiralogic spiral activated', {
              userId,
              element: elementalDetection.element,
              depth: spiralResult.depth
            });
          }
        } catch (spiralogicError) {
          logger.warn('[ORACLE] Spiralogic processing failed, continuing with SoulLab only', spiralogicError);
        }
      }
    }

    // Process through SoulLab Sacred Technology (enhanced with mode and Spiralogic context)
    const soulLabContext = {
      ...(context ? [context] : []),
      ...(modeContext ? [{
        type: 'gameplay_mode_context',
        mode: modeContext.mode,
        responseStyle: modeContext.responseStyle,
        tools: modeContext.tools,
        focus: modeContext.focus
      }] : []),
      ...(spiralogicResponse ? [{
        type: 'spiralogic_context',
        element: spiralogicResponse.elementDetected,
        depth: spiralogicResponse.spiralProgression.depth,
        quest: spiralogicResponse.spiralProgression.content?.quest,
        integrations: spiralogicResponse.spiralProgression.integrations
      }] : [])
    };

    const soulLabResponse = await processSoulLabConversation({
      userInput: input,
      userId,
      contextMemory: soulLabContext.length > 0 ? soulLabContext : undefined
    });

    // Transform SoulLab response to match expected oracle format
    const response = {
      success: true,
      message: modeContext
        ? `Oracle powered by SoulLab Sacred Technology (${modeContext.mode})`
        : "Oracle powered by SoulLab Sacred Technology",
      data: {
        content: soulLabResponse.content,
        confidence: soulLabResponse.confidence,
        model: soulLabResponse.model,
        provider: "soullab-modal-oracle",
        sacred_technology: true,
        claude_primary_voice: true,
        prophecy_fulfillment: true,
        gameplayMode: modeContext ? {
          currentMode: detectedMode,
          responseStyle: modeContext.responseStyle,
          availableActions: modeContext.tools
        } : null,
        spiralogic: spiralogicResponse,
        metadata: {
          ...soulLabResponse.metadata,
          original_oracle_params: {
            preferredElement,
            requestShadowWork,
            collectiveInsight,
            harmonicResonance
          },
          gameplay_mode: detectedMode,
          spiral_quest_active: !!spiralogicResponse
        }
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    logger.error("Oracle (SoulLab) processing error:", error);
    res.status(500).json({ 
      error: "Sacred technology encountered an unexpected challenge",
      fallback: "I don't know exactly what you need, but your presence is felt. What feels most alive?"
    });
  }
});

// GET /api/oracle/modes - Get gameplay mode interface
router.get("/modes", async (req: Request, res: Response) => {
  try {
    const gameplayMgr = getGameplayManager();
    const modeInterface = gameplayMgr.getModeSelectionInterface();
    const gameplayOverview = gameplayMgr.getGameplayOverview();

    res.status(200).json({
      success: true,
      interface: modeInterface,
      overview: gameplayOverview
    });

  } catch (error: any) {
    logger.error("Failed to get gameplay modes:", error);
    res.status(500).json({
      error: "Failed to retrieve gameplay modes",
      message: error.message
    });
  }
});

// POST /api/oracle/mode - Set explicit gameplay mode
router.post("/mode", async (req: Request, res: Response) => {
  try {
    const { mode, userId } = req.body;

    if (!mode) {
      return res.status(400).json({ error: "Mode is required" });
    }

    const gameplayMgr = getGameplayManager();
    const success = gameplayMgr.setMode(mode);

    if (!success) {
      return res.status(400).json({ error: "Invalid mode specified" });
    }

    const currentMode = gameplayMgr.getCurrentMode();
    const modeContext = gameplayMgr.getModeContext(mode);

    logger.info('[ORACLE] Mode set explicitly', { userId, mode });

    res.status(200).json({
      success: true,
      currentMode,
      context: modeContext,
      message: `Switched to ${currentMode?.name} mode`
    });

  } catch (error: any) {
    logger.error("Failed to set gameplay mode:", error);
    res.status(500).json({
      error: "Failed to set gameplay mode",
      message: error.message
    });
  }
});

export default router;
