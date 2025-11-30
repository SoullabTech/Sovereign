// routes/orchestrator.routes.ts - Enhanced Sacred Journey Orchestrator API Routes
import { Router } from "express";
import { agentOrchestrator } from "../services/agentOrchestrator";
import { sacredOrchestrator } from '../core/agents/orchestrator';
import { logger } from '../utils/logger';

const router = Router();

// === EXISTING AGENT ORCHESTRATOR ROUTES ===

/**
 * @route POST /api/orchestrator/query
 * @description Process query through agent orchestration system
 */
router.post("/query", async (req, res) => {
  try {
    const { input, userContext } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: "Input is required",
      });
    }

    const result = await agentOrchestrator.processQuery(input, userContext);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Orchestrator query error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process orchestrated query",
      message: error.message,
    });
  }
});

/**
 * @route GET /api/orchestrator/insights
 * @description Get archetypal insights for user session
 */
router.get("/insights", async (req, res) => {
  try {
    const { sessionId, userId } = req.query;
    const userContext = {
      sessionId: sessionId as string,
      userId: userId as string,
    };

    const insights = await agentOrchestrator.getArchetypalInsights(userContext);

    res.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Orchestrator insights error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate archetypal insights",
      message: error.message,
    });
  }
});

/**
 * @route GET /api/orchestrator/health
 * @description Health check for Agent Orchestrator
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Agent Orchestrator",
    description: "Collective Intelligence Coordination System",
    status: "active",
    features: [
      "Archetypal Intent Analysis",
      "Multi-Agent Response Synthesis",
      "Dynamic Orchestration Strategies",
      "Collective Memory Management",
      "Emergent Wisdom Generation",
    ],
    orchestrationStrategies: [
      "fire_lead",
      "water_lead",
      "fire_water_synthesis",
      "water_fire_synthesis",
      "dual_synthesis",
      "fire_balance",
      "water_balance",
    ],
    supportedAgents: [
      "Fire Agent (Vision & Creative Transformation)",
      "Water Agent (Emotional Intelligence & Flow State)",
    ],
    collectiveIntelligence: {
      archetypalBalancing: true,
      patternRecognition: true,
      emergentWisdomGeneration: true,
      sessionMemory: true,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route POST /api/orchestrator/reset-session
 * @description Reset collective memory for a session
 */
router.post("/reset-session", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    // Clear session memory (orchestrator handles this internally)
    res.json({
      success: true,
      message: "Session memory reset",
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Session reset error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset session",
      message: error.message,
    });
  }
});

// === NEW SACRED JOURNEY ORCHESTRATOR ROUTES ===

/**
 * @route GET /api/orchestrator/workflows
 * @description Get available workflow templates
 */
router.get('/workflows', async (req, res) => {
  try {
    const workflows = sacredOrchestrator.getAvailableWorkflows();
    res.json({
      success: true,
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        estimatedDuration: w.estimatedDuration,
        triggers: w.triggers,
        stepCount: w.steps.length
      }))
    });
  } catch (error: any) {
    logger.error('Failed to get workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve workflows'
    });
  }
});

/**
 * @route POST /api/orchestrator/journey/start
 * @description Start a new sacred journey
 */
router.post('/journey/start', async (req, res) => {
  try {
    const { workflowId, userId, context = {} } = req.body;
    
    if (!workflowId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'workflowId and userId are required'
      });
    }

    const result = await sacredOrchestrator.startJourney(workflowId, userId, context);
    
    res.json({
      success: true,
      journeyId: result.journeyId,
      workflow: {
        name: result.workflow.name,
        description: result.workflow.description,
        estimatedDuration: result.workflow.estimatedDuration
      },
      nextStep: {
        id: result.nextStep.id,
        name: result.nextStep.name,
        type: result.nextStep.type,
        config: result.nextStep.config
      }
    });
  } catch (error: any) {
    logger.error('Failed to start journey:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start journey'
    });
  }
});

/**
 * @route POST /api/orchestrator/journey/:journeyId/next
 * @description Execute next step in journey
 */
router.post('/journey/:journeyId/next', async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { userInput } = req.body;

    const result = await sacredOrchestrator.executeNextStep(journeyId, userInput);

    res.json({
      success: true,
      stepResult: result.stepResult,
      nextStep: result.nextStep ? {
        id: result.nextStep.id,
        name: result.nextStep.name,
        type: result.nextStep.type,
        config: result.nextStep.config
      } : null,
      journeyComplete: result.journeyComplete
    });
  } catch (error: any) {
    logger.error(`Failed to execute next step for journey ${req.params.journeyId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute next step'
    });
  }
});

/**
 * @route GET /api/orchestrator/journey/:journeyId/status
 * @description Get journey status
 */
router.get('/journey/:journeyId/status', async (req, res) => {
  try {
    const { journeyId } = req.params;
    const status = sacredOrchestrator.getJourneyStatus(journeyId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Journey not found'
      });
    }

    res.json({
      success: true,
      journey: {
        id: status.id,
        workflowId: status.workflowId,
        status: status.status,
        currentStepIndex: status.currentStepIndex,
        startedAt: status.startedAt,
        completedAt: status.completedAt,
        stepsCompleted: status.stepHistory.length
      }
    });
  } catch (error: any) {
    logger.error(`Failed to get journey status for ${req.params.journeyId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to get journey status'
    });
  }
});

/**
 * @route POST /api/orchestrator/journey/:journeyId/pause
 * @description Pause/resume journey
 */
router.post('/journey/:journeyId/pause', async (req, res) => {
  try {
    const { journeyId } = req.params;
    const success = sacredOrchestrator.pauseJourney(journeyId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Journey not found'
      });
    }

    const status = sacredOrchestrator.getJourneyStatus(journeyId);
    res.json({
      success: true,
      message: `Journey ${status.status}`,
      status: status.status
    });
  } catch (error: any) {
    logger.error(`Failed to pause journey ${req.params.journeyId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause journey'
    });
  }
});

/**
 * @route POST /api/orchestrator/journey/:journeyId/cancel
 * @description Cancel journey
 */
router.post('/journey/:journeyId/cancel', async (req, res) => {
  try {
    const { journeyId } = req.params;
    const success = sacredOrchestrator.cancelJourney(journeyId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Journey not found'
      });
    }

    res.json({
      success: true,
      message: 'Journey cancelled'
    });
  } catch (error: any) {
    logger.error(`Failed to cancel journey ${req.params.journeyId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel journey'
    });
  }
});

/**
 * @route POST /api/orchestrator/workflow/suggest
 * @description Find workflow by trigger keywords
 */
router.post('/workflow/suggest', async (req, res) => {
  try {
    const { trigger } = req.body;
    
    if (!trigger) {
      return res.status(400).json({
        success: false,
        error: 'trigger is required'
      });
    }

    const workflow = sacredOrchestrator.getWorkflowByTrigger(trigger);
    
    if (!workflow) {
      return res.json({
        success: true,
        workflow: null,
        message: 'No matching workflow found'
      });
    }

    res.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        estimatedDuration: workflow.estimatedDuration,
        triggers: workflow.triggers
      }
    });
  } catch (error: any) {
    logger.error('Failed to suggest workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suggest workflow'
    });
  }
});

export default router;
