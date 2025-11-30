// ===============================================
// TEST ROUTES FOR SOUL MEMORY INTEGRATION
// Development only - remove in production
// ===============================================

import express from "express";
import { PersonalOracleAgent } from "../core/agents/adjusterAgent";
import { SoulMemorySystem } from "../../memory/SoulMemorySystem";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

// Test endpoint for Soul Memory integration
router.post(
  "/test-integration",
  asyncHandler(async (req, res) => {
    const {
      message = "I'm feeling overwhelmed by all these changes in my life",
    } = req.body;

    // Create test instances
    const userId = "test_user_" + Date.now();

    const soulMemory = new SoulMemorySystem({
      userId,
      storageType: "sqlite",
      databasePath: "./test_soul_memory.db",
      memoryDepth: 100,
    });

    const oracle = new PersonalOracleAgent({
      userId,
      oracleName: "Aria",
      elementalResonance: "water",
    });

    // Connect Oracle to Soul Memory
    await oracle.connectToSoulMemory(soulMemory);

    // Process message
    const oracleResponse = await oracle.respondToPrompt(message);

    // Wait for async storage
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Retrieve stored memory
    const memories = await soulMemory.retrieveMemories(userId, { limit: 1 });

    // Clean up
    await soulMemory.closeDatabase();

    res.json({
      success: true,
      test: {
        userId,
        message,
        oracleResponse,
        memoryStored: memories.length > 0,
        memory: memories[0] || null,
      },
    });
  }),
);

// Test semantic search
router.post(
  "/test-search",
  asyncHandler(async (req, res) => {
    const { userId = "test_user_123", query } = req.body;

    const soulMemory = new SoulMemorySystem({
      userId,
      storageType: "sqlite",
      databasePath: "./test_soul_memory.db",
      memoryDepth: 100,
    });

    const results = await soulMemory.semanticSearch(userId, query, { topK: 5 });

    await soulMemory.closeDatabase();

    res.json({
      success: true,
      query,
      results: results.length,
      memories: results,
    });
  }),
);

export default router;
