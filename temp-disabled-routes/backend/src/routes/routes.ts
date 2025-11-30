// 📁 File: /routes/routes.ts

import express from "express";

// Import individual route files with explicit '.js' extensions for ESM compatibility
import authRoutes from "./authRoutes.js";
import chatRoutes from "./chatRoutes.js";
import facetRoutes from "./facet.routes.js";
import facetMapRoutes from "./facetMap.routes.js";
import facilitatorRoutes from "./facilitatorRoutes.js";
import feedbackRoutes from "./feedback.routes.js";
import fieldpulseRoutes from "./fieldpulse.routes.js";
import flowRoutes from "./flow.routes.js";
import insightHistoryRoutes from "./insightHistory.routes.js";
import journalRoutes from "./journal.routes.js";
import memoryRoutes from "./memory.routes.js";
import notionIngestRoutes from "./notionIngest.routes.js";
import personalGuideRoutes from "./oracle/personalGuide.routes.js";
import personalOracleRoutes from "./oracle/personalOracle.routes.js";
import profileSettingsRoutes from "./profileSettings.routes.js";
import sessionRoutes from "./session.routes.js";
import storyGeneratorRoutes from "./storyGenerator.routes.js";
import surveyRoutes from "./survey.routes.js";
import symbolicMemoryRoutes from "./symbolicMemory.routes.js";
import symbolicTrendsRoutes from "./symbolicTrends.routes.js";
import userRoutes from "./user.routes.js";
import userProfileRoutes from "./userProfile.routes.js";
import personalRoutes from "./oracle/personal.routes.js"; // Corrected import path with .js extension

const router = express.Router();

// Register routes
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/facets", facetRoutes);
router.use("/facet-map", facetMapRoutes);
router.use("/facilitator", facilitatorRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/fieldpulse", fieldpulseRoutes);
router.use("/flow", flowRoutes);
router.use("/insights", insightHistoryRoutes);
router.use("/journal", journalRoutes);
router.use("/memory", memoryRoutes);
router.use("/notion", notionIngestRoutes);
router.use("/personal-guide", personalGuideRoutes);
router.use("/personal-oracle", personalOracleRoutes);
router.use("/profile-settings", profileSettingsRoutes);
router.use("/sessions", sessionRoutes);
router.use("/story-generator", storyGeneratorRoutes);
router.use("/survey", surveyRoutes);
router.use("/symbolic-memory", symbolicMemoryRoutes);
router.use("/symbolic-trends", symbolicTrendsRoutes);
router.use("/users", userRoutes);
router.use("/user-profile", userProfileRoutes);
router.use("/personal", personalRoutes);

export default router;
