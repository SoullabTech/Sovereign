// ===============================================
// SOUL MEMORY ROUTES - API ENDPOINTS
// RESTful API for Soul Memory System
// ===============================================

import { Router } from "express";
import { soulMemoryService } from "../services/soulMemoryService.js";
import { logger } from "../utils/logger.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// ===============================================
// ORACLE INTERACTION ENDPOINTS
// ===============================================

/**
 * POST /api/soul-memory/oracle/message
 * Process a message through the Oracle and store in memory
 */
router.post("/oracle/message", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await soulMemoryService.processOracleMessage(
      userId,
      message,
      sessionId,
    );

    res.json({
      success: true,
      response: result.response,
      memoryId: result.memory.id,
      transformationMetrics: result.transformationMetrics,
    });
  } catch (error) {
    logger.error("Error processing oracle message:", error);
    res.status(500).json({ error: "Failed to process oracle message" });
  }
});

/**
 * POST /api/soul-memory/oracle/retreat/activate
 * Activate retreat mode for enhanced support
 */
router.post("/oracle/retreat/activate", async (req, res) => {
  try {
    const { phase } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const validPhases = ["pre-retreat", "retreat-active", "post-retreat"];
    if (!phase || !validPhases.includes(phase)) {
      return res.status(400).json({
        error: "Valid retreat phase required",
        validPhases,
      });
    }

    await soulMemoryService.activateRetreatMode(userId, phase);

    res.json({
      success: true,
      message: `Retreat mode activated: ${phase}`,
      phase,
    });
  } catch (error) {
    logger.error("Error activating retreat mode:", error);
    res.status(500).json({ error: "Failed to activate retreat mode" });
  }
});

// ===============================================
// MEMORY STORAGE ENDPOINTS
// ===============================================

/**
 * POST /api/soul-memory/store
 * Universal memory storage endpoint with type detection
 */
router.post("/store", async (req, res) => {
  try {
    const { 
      content, 
      type, 
      metadata = {},
      archetypes = [],
      element,
      spiralPhase,
      dreamSymbols,
      emotionalTone,
      shadowAspects,
      integrationLevel,
      sacredContext
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Auto-detect memory type if not provided
    const memoryType = type || await soulMemoryService.detectMemoryType(content);
    
    // Enhanced metadata with archetypal resonance
    const enhancedMetadata = {
      ...metadata,
      element,
      spiralPhase,
      dreamSymbols,
      emotionalTone,
      shadowAspects,
      integrationLevel,
      sacredContext,
      archetypes,
      timestamp: new Date().toISOString(),
      sourceEndpoint: "/api/memory/store"
    };

    // Store with automatic embeddings and indexing
    const memory = await soulMemoryService.storeEnhancedMemory(
      userId, 
      content, 
      memoryType,
      enhancedMetadata
    );

    // Trigger archetypal pattern detection if dream content
    if (memoryType === "dream" || dreamSymbols) {
      await soulMemoryService.analyzeArchetypalResonance(userId, memory.id);
    }

    res.json({
      success: true,
      memory: {
        id: memory.id,
        type: memory.type,
        timestamp: memory.timestamp,
        element: memory.element,
        archetypes: memory.archetypes || [],
        integrationLevel: memory.integrationLevel,
        indexed: true,
        embedded: true
      },
      message: "Memory stored and indexed successfully"
    });
  } catch (error) {
    logger.error("Error storing memory:", error);
    res.status(500).json({ error: "Failed to store memory" });
  }
});

/**
 * POST /api/soul-memory/journal
 * Store a journal entry
 */
router.post("/journal", async (req, res) => {
  try {
    const { content, element, spiralPhase, shadowContent } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const memory = await soulMemoryService.storeJournalEntry(userId, content, {
      element,
      spiralPhase,
      shadowContent,
    });

    res.json({
      success: true,
      memory: {
        id: memory.id,
        type: memory.type,
        timestamp: memory.timestamp,
        element: memory.element,
      },
    });
  } catch (error) {
    logger.error("Error storing journal entry:", error);
    res.status(500).json({ error: "Failed to store journal entry" });
  }
});

/**
 * POST /api/soul-memory/ritual
 * Record a ritual moment
 */
router.post("/ritual", async (req, res) => {
  try {
    const { ritualType, content, element, oracleGuidance } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!ritualType || !content || !element) {
      return res.status(400).json({
        error: "Ritual type, content, and element are required",
      });
    }

    const memory = await soulMemoryService.recordRitualMoment(
      userId,
      ritualType,
      content,
      element,
      oracleGuidance,
    );

    res.json({
      success: true,
      memory: {
        id: memory.id,
        type: memory.type,
        timestamp: memory.timestamp,
        element: memory.element,
        sacredMoment: memory.sacredMoment,
      },
    });
  } catch (error) {
    logger.error("Error recording ritual moment:", error);
    res.status(500).json({ error: "Failed to record ritual moment" });
  }
});

/**
 * POST /api/soul-memory/breakthrough
 * Record a breakthrough moment
 */
router.post("/breakthrough", async (req, res) => {
  try {
    const { content, insights, element } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!content || !insights) {
      return res.status(400).json({
        error: "Content and insights are required",
      });
    }

    const memory = await soulMemoryService.recordBreakthrough(
      userId,
      content,
      insights,
      element,
    );

    res.json({
      success: true,
      memory: {
        id: memory.id,
        type: memory.type,
        timestamp: memory.timestamp,
        transformationMarker: memory.transformationMarker,
        sacredMoment: memory.sacredMoment,
      },
    });
  } catch (error) {
    logger.error("Error recording breakthrough:", error);
    res.status(500).json({ error: "Failed to record breakthrough" });
  }
});

// ===============================================
// MEMORY RETRIEVAL ENDPOINTS
// ===============================================

/**
 * GET /api/soul-memory/memories
 * Get user's memories with optional filtering
 */
router.get("/memories", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      type,
      element,
      limit = "20",
      sacred,
      transformations,
      retreatMode,
      retreatPhase,
      startDate,
      endDate,
    } = req.query;

    const options: any = {
      limit: parseInt(limit as string),
    };

    if (type) options.type = type;
    if (element) options.element = element;
    if (sacred === "true") options.sacred = true;
    if (transformations === "true") options.transformations = true;

    if (startDate && endDate) {
      options.dateRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string),
      };
    }

    const memories = await soulMemoryService.getUserMemories(userId, options);

    // Filter by retreat context if requested
    let filteredMemories = memories;
    if (retreatMode === "true") {
      filteredMemories = memories.filter(
        (memory) =>
          memory.metadata?.mode === "retreat" ||
          memory.metadata?.retreatPhase ||
          memory.metadata?.retreatIntensive ||
          memory.ritualContext?.includes("retreat"),
      );
    }

    if (retreatPhase) {
      filteredMemories = filteredMemories.filter(
        (memory) => memory.metadata?.retreatPhase === retreatPhase,
      );
    }

    res.json({
      success: true,
      memories: filteredMemories.map((memory) => ({
        id: memory.id,
        type: memory.type,
        content: memory.content,
        timestamp: memory.timestamp,
        element: memory.element,
        sacredMoment: memory.sacredMoment,
        transformationMarker: memory.transformationMarker,
        oracleResponse: memory.oracleResponse,
        retreatContext: {
          mode: memory.metadata?.mode,
          retreatPhase: memory.metadata?.retreatPhase,
          retreatIntensive: memory.metadata?.retreatIntensive,
          ritualContext: memory.ritualContext,
        },
      })),
      count: filteredMemories.length,
      totalMemories: memories.length,
    });
  } catch (error) {
    logger.error("Error retrieving memories:", error);
    res.status(500).json({ error: "Failed to retrieve memories" });
  }
});

/**
 * GET /api/soul-memory/sacred-moments
 * Get user's sacred moments
 */
router.get("/sacred-moments", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { limit = "10" } = req.query;
    const sacredMoments = await soulMemoryService.getSacredMoments(
      userId,
      parseInt(limit as string),
    );

    res.json({
      success: true,
      sacredMoments: sacredMoments.map((moment) => ({
        id: moment.id,
        type: moment.type,
        content: moment.content,
        timestamp: moment.timestamp,
        element: moment.element,
        ritualContext: moment.ritualContext,
        oracleResponse: moment.oracleResponse,
      })),
      count: sacredMoments.length,
    });
  } catch (error) {
    logger.error("Error retrieving sacred moments:", error);
    res.status(500).json({ error: "Failed to retrieve sacred moments" });
  }
});

/**
 * GET /api/soul-memory/transformation-journey
 * Get user's transformation journey
 */
router.get("/transformation-journey", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const journey = await soulMemoryService.getTransformationJourney(userId);

    res.json({
      success: true,
      journey,
    });
  } catch (error) {
    logger.error("Error retrieving transformation journey:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve transformation journey" });
  }
});

/**
 * GET /api/soul-memory/archetypal-patterns
 * Get user's active archetypal patterns
 */
router.get("/archetypal-patterns", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const patterns = await soulMemoryService.getActiveArchetypes(userId);

    res.json({
      success: true,
      patterns: patterns.map((p) => ({
        archetype: p.archetype,
        activationCount: p.activationCount,
        lastActivated: p.lastActivated,
        patternStrength: p.patternStrength,
        relatedMemories: p.relatedMemories.length,
      })),
      count: patterns.length,
    });
  } catch (error) {
    logger.error("Error retrieving archetypal patterns:", error);
    res.status(500).json({ error: "Failed to retrieve archetypal patterns" });
  }
});

/**
 * POST /api/soul-memory/search
 * Search through user's memories
 */
router.post("/search", async (req, res) => {
  try {
    const { query, topK = 5, memoryTypes, includeArchetypal } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await soulMemoryService.searchMemories(userId, query, {
      topK,
      memoryTypes,
      includeArchetypal,
    });

    res.json({
      success: true,
      results: results.map((memory) => ({
        id: memory.id,
        type: memory.type,
        content: memory.content,
        timestamp: memory.timestamp,
        element: memory.element,
        relevance: 1.0, // TODO: Add actual relevance scoring
      })),
      query,
      count: results.length,
    });
  } catch (error) {
    logger.error("Error searching memories:", error);
    res.status(500).json({ error: "Failed to search memories" });
  }
});

// ===============================================
// ARCHETYPAL PATTERNS ENDPOINTS
// ===============================================

/**
 * GET /api/soul-memory/archetypes
 * Get user's active archetypal patterns
 */
router.get("/archetypes", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const archetypes = await soulMemoryService.getActiveArchetypes(userId);

    res.json({
      success: true,
      archetypes: archetypes.map((pattern) => ({
        id: pattern.id,
        archetype: pattern.archetype,
        activationCount: pattern.activationCount,
        lastActivated: pattern.lastActivated,
        patternStrength: pattern.patternStrength,
        relatedMemoriesCount: pattern.relatedMemories.length,
      })),
      count: archetypes.length,
    });
  } catch (error) {
    logger.error("Error retrieving archetypes:", error);
    res.status(500).json({ error: "Failed to retrieve archetypes" });
  }
});

// ===============================================
// MEMORY THREADS (JOURNEYS) ENDPOINTS
// ===============================================

/**
 * POST /api/soul-memory/threads
 * Create a new memory thread (journey)
 */
router.post("/threads", async (req, res) => {
  try {
    const { threadName, threadType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const validTypes = [
      "ritual",
      "shadow_work",
      "transformation",
      "integration",
    ];
    if (!threadName || !threadType || !validTypes.includes(threadType)) {
      return res.status(400).json({
        error: "Valid thread name and type required",
        validTypes,
      });
    }

    const thread = await soulMemoryService.createMemoryThread(
      userId,
      threadName,
      threadType,
    );

    res.json({
      success: true,
      thread: {
        id: thread.id,
        threadName: thread.threadName,
        threadType: thread.threadType,
        createdAt: thread.createdAt,
        state: thread.state,
      },
    });
  } catch (error) {
    logger.error("Error creating memory thread:", error);
    res.status(500).json({ error: "Failed to create memory thread" });
  }
});

/**
 * GET /api/soul-memory/threads
 * Get user's memory threads
 */
router.get("/threads", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const threads = await soulMemoryService.getUserThreads(userId);

    res.json({
      success: true,
      threads: threads.map((thread) => ({
        id: thread.id,
        threadName: thread.threadName,
        threadType: thread.threadType,
        createdAt: thread.createdAt,
        lastUpdated: thread.lastUpdated,
        state: thread.state,
        memoryCount: thread.memories.length,
      })),
      count: threads.length,
    });
  } catch (error) {
    logger.error("Error retrieving memory threads:", error);
    res.status(500).json({ error: "Failed to retrieve memory threads" });
  }
});

/**
 * GET /api/soul-memory/threads/:threadId
 * Get specific memory thread details
 */
router.get("/threads/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const thread = await soulMemoryService.getMemoryThread(threadId);

    if (!thread) {
      return res.status(404).json({ error: "Memory thread not found" });
    }

    // Verify ownership
    if (thread.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      success: true,
      thread,
    });
  } catch (error) {
    logger.error("Error retrieving memory thread:", error);
    res.status(500).json({ error: "Failed to retrieve memory thread" });
  }
});

// ===============================================
// USER INSIGHTS ENDPOINT
// ===============================================

/**
 * GET /api/soul-memory/insights
 * Get comprehensive user insights and analytics
 */
router.get("/insights", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const insights = await soulMemoryService.getUserInsights(userId);

    res.json({
      success: true,
      insights,
    });
  } catch (error) {
    logger.error("Error retrieving user insights:", error);
    res.status(500).json({ error: "Failed to retrieve user insights" });
  }
});

// ===============================================
// JUNG-BUDDHA SACRED MIRROR ENDPOINTS
// ===============================================

/**
 * POST /api/soul-memory/oracle/sacred-mirror/mode
 * Set Sacred Mirror mode (jung/buddha/hybrid/adaptive)
 */
router.post("/oracle/sacred-mirror/mode", async (req, res) => {
  try {
    const { mode } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const validModes = ["jung", "buddha", "hybrid", "adaptive"];
    if (!mode || !validModes.includes(mode)) {
      return res.status(400).json({
        error: "Valid sacred mirror mode required",
        validModes,
      });
    }

    const result = await soulMemoryService.setSacredMirrorMode(userId, mode);

    res.json({
      success: true,
      message: result,
      mode,
    });
  } catch (error) {
    logger.error("Error setting sacred mirror mode:", error);
    res.status(500).json({ error: "Failed to set sacred mirror mode" });
  }
});

/**
 * GET /api/soul-memory/oracle/sacred-mirror/status
 * Get current Sacred Mirror status
 */
router.get("/oracle/sacred-mirror/status", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const status = await soulMemoryService.getSacredMirrorStatus(userId);

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    logger.error("Error retrieving sacred mirror status:", error);
    res.status(500).json({ error: "Failed to retrieve sacred mirror status" });
  }
});

/**
 * POST /api/soul-memory/oracle/sacred-mirror/balance
 * Adjust integration-liberation balance
 */
router.post("/oracle/sacred-mirror/balance", async (req, res) => {
  try {
    const { direction } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const validDirections = ["more_integration", "more_liberation", "balanced"];
    if (!direction || !validDirections.includes(direction)) {
      return res.status(400).json({
        error: "Valid balance direction required",
        validDirections,
      });
    }

    const result = await soulMemoryService.adjustIntegrationLiberationBalance(
      userId,
      direction,
    );

    res.json({
      success: true,
      message: result,
      direction,
    });
  } catch (error) {
    logger.error("Error adjusting integration-liberation balance:", error);
    res.status(500).json({ error: "Failed to adjust balance" });
  }
});

/**
 * GET /api/soul-memory/oracle/jung-patterns
 * Get detected Jung archetypal patterns
 */
router.get("/oracle/jung-patterns", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const patterns = await soulMemoryService.getJungArchetypalPatterns(userId);

    res.json({
      success: true,
      patterns,
    });
  } catch (error) {
    logger.error("Error retrieving Jung patterns:", error);
    res.status(500).json({ error: "Failed to retrieve Jung patterns" });
  }
});

/**
 * GET /api/soul-memory/oracle/buddha-attachments
 * Get detected Buddha attachment patterns
 */
router.get("/oracle/buddha-attachments", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const attachments =
      await soulMemoryService.getBuddhaAttachmentPatterns(userId);

    res.json({
      success: true,
      attachments,
    });
  } catch (error) {
    logger.error("Error retrieving Buddha attachment patterns:", error);
    res.status(500).json({ error: "Failed to retrieve attachment patterns" });
  }
});

// ===============================================
// HEALTH CHECK ENDPOINT
// ===============================================

/**
 * GET /api/soul-memory/health
 * Check Soul Memory System health
 */
router.get("/health", async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Soul Memory System is operational",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(500).json({ error: "Health check failed" });
  }
});

export default router;
