// Main API Router - Minimal working version for development
// Temporary simplified implementation to get the server running

import { Router } from "express";
import { errorResponse } from "../utils/sharedUtilities";
import { logger } from "../utils/logger";

// Import our new route services  
// import orchestratorRoutes from '../routes/orchestrator.routes'; // Temporarily disabled
import voiceJournalingRoutes from '../routes/voiceJournaling.routes';
import voiceStreamRoutes from '../routes/voice/stream.routes';
import semanticJournalingRoutes from '../routes/semanticJournaling.routes';
import conversationalRoutes from '../routes/conversational.routes';
import conversationalStreamRoutes from '../routes/conversational.stream.routes';
import enhancedConversationalStreamRoutes from '../routes/enhanced.conversational.stream.routes';
import streamingChatRoutes from '../routes/streaming.chat.routes';
import adminRoutes from '../routes/admin.routes';
import soulLabRoutes from '../routes/soullab.routes';

const router = Router();

// API version prefix
const API_VERSION = "v1";

// Temporary placeholder for missing routers
const createPlaceholderRouter = (name: string) => {
  const placeholderRouter = Router();
  placeholderRouter.get("*", (req, res) => {
    res.json({
      success: true,
      data: {
        message: `${name} endpoint is temporarily disabled during development setup`,
        availableEndpoints: [`/${API_VERSION}/health`]
      },
      errors: []
    });
  });
  return placeholderRouter;
};

/**
 * Basic health endpoint
 */
router.get(`/${API_VERSION}/health`, (req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.APP_VERSION || "1.0.0-dev",
    },
    errors: []
  });
});

/**
 * Mount our new service routes
 */
// router.use(`/${API_VERSION}/orchestrator`, orchestratorRoutes); // Temporarily disabled
router.use(`/${API_VERSION}/voice`, voiceJournalingRoutes);
router.use(`/${API_VERSION}/voice`, voiceStreamRoutes); // Add streaming voice endpoints
router.use(`/${API_VERSION}/semantic`, semanticJournalingRoutes);
router.use(`/${API_VERSION}/converse`, conversationalRoutes);
router.use(`/${API_VERSION}/converse`, conversationalStreamRoutes);
router.use(`/${API_VERSION}/enhanced/converse`, enhancedConversationalStreamRoutes);
router.use(`/${API_VERSION}/stream`, streamingChatRoutes); // Real-time streaming with chunked TTS
router.use(`/${API_VERSION}/admin`, adminRoutes); // Admin dashboard and monitoring
router.use(`/${API_VERSION}/soullab`, soulLabRoutes); // Sacred Technology System

/**
 * Placeholder routers for missing modules
 */
router.use(`/${API_VERSION}/personal-oracle`, createPlaceholderRouter("Personal Oracle"));
router.use(`/${API_VERSION}/ain-engine`, createPlaceholderRouter("AIN Engine"));
router.use(`/${API_VERSION}/developer`, createPlaceholderRouter("Developer"));

// Basic PSI endpoint
router.get("/psi/status", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "PSI system temporarily disabled during development",
      learning: false
    },
    errors: []
  });
});

/**
 * API root endpoint - provides API information
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "Spiralogic Oracle API",
      version: API_VERSION,
      description:
        "Production-ready API for Personal Oracle Agent consultations",
      endpoints: {
        orchestrator: `/${API_VERSION}/orchestrator`,
        voice: `/${API_VERSION}/voice`,
        semantic: `/${API_VERSION}/semantic`,
        converse: `/${API_VERSION}/converse`,
        enhancedConverse: `/${API_VERSION}/enhanced/converse`,
        oracle: `/${API_VERSION}/oracle`,
        personalOracle: `/${API_VERSION}/personal-oracle`,
        ainEngine: `/${API_VERSION}/ain-engine`,
        developer: `/${API_VERSION}/developer`,
        health: `/${API_VERSION}/health`,
      },
      documentation: process.env.API_DOCS_URL || "/docs",
      timestamp: new Date().toISOString(),
    },
    errors: [],
  });
});

/**
 * API version endpoint
 */
router.get(`/${API_VERSION}`, (req, res) => {
  res.json({
    success: true,
    data: {
      version: API_VERSION,
      buildVersion: process.env.BUILD_VERSION || "unknown",
      environment: process.env.NODE_ENV || "development",
      features: [
        "Sacred Journey Orchestration",
        "Voice Journaling with Whisper",
        "Semantic Pattern Recognition",
        "Safety & Crisis Moderation",
        "Archetypal Constellation Mapping",
        "Personal Oracle Agent",
        "AIN Engine Public API",
        "Collective Intelligence",
        "Archetypal Processes",
        "Elemental Routing",
        "Rate Limiting",
        "Authentication",
        "Developer SDK",
        "Standardized Responses",
      ],
    },
    errors: [],
  });
});

/**
 * Catch-all for unmatched API routes
 */
router.use("*", (req, res) => {
  logger.warn("API endpoint not found", {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res
    .status(404)
    .json(
      errorResponse([
        "API endpoint not found",
        `Available endpoints: /${API_VERSION}/personal-oracle, /${API_VERSION}/ain-engine, /${API_VERSION}/health`,
      ]),
    );
});

/**
 * Global error handler for API routes
 */
router.use((error: Error, req: any, res: any, next: any) => {
  logger.error("API error", {
    error: error.message,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
  });

  res
    .status(500)
    .json(
      errorResponse([
        "Internal server error",
        "Please try again or contact support if the issue persists",
      ]),
    );
});

export default router;
