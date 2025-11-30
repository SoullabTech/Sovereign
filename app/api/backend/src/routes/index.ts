// src/routes/index.ts

import { Router } from "express";

import authRoutes from "./authRoutes";
import memoryRoutes from "./memoryRoutes";
import journalRoutes from "./journal.routes";
import surveyRoutes from "./survey.routes";
import sessionRoutes from "./session.routes";
import storyRoutes from "./storyGenerator.routes";
import symbolicTrendsRoutes from "./symbolicTrends.routes";
import learningRoutes from "./learning.routes";
import facilitatorRoutes from "./facilitator.routes";
import symbolicMemoryRoutes from "./symbolicMemory.routes";
import personalOracleRoutes from "./oracle/personalOracle.routes";
import personalGuideRoutes from "./oracle/personalGuide.routes";
import dreamRoutes from "./oracle/dream.routes";
import modeSelectorRoutes from "./oracle/modeSelector.routes";
import founderRoutes from "./founder.routes";
import retreatRoutes from "./retreat.routes";
import retreatOnboardingRoutes from "./retreatOnboarding.routes";
import retreatSupportRoutes from "./retreatSupport.routes";
import postRetreatRoutes from "./postRetreat.routes";
import { holoflowerRouter } from "./holoflower.routes";
import { elementalAlchemyRouter } from "./elementalAlchemy.routes";
import { astrologyRouter } from "./astrology.routes";
import { facilitatorDashboardRouter } from "./facilitatorDashboard.routes";
import automationRoutes from "./automation.routes";
import sacredMirrorRoutes from "./sacredMirror.routes";
import spiralogicReportRouter from "./spiralogicReport.routes";
import fourPillarsRouter from "./astrology/fourPillars.routes";
import ichingRouter from "./iching.routes";
import divinationRouter from "./divination.routes";
import { practitionerPortalRouter } from "./practitionerPortal.routes";
import { retreatModeRouter } from "./retreatMode.routes";
import narrationRoutes from "./narration.routes";
import oraclePreferencesRoutes from "./oracle/preferences.routes";
import voicePreviewRoutes from "./voice/preview.routes";
import voiceListRoutes from "./voice/list.routes";
import fireAgentRoutes from "./fire-agent.routes";
import waterAgentRoutes from "./water-agent.routes";
import orchestratorRoutes from "./orchestrator.routes";
import holisticRoutes from "./holistic.routes";
import integrationRoutes from "./integration.routes";
import spiralJourneyRoutes from "./spiralJourney";
import soulLabRoutes from "./soullab.routes";
import oracleRoutes from "./oracle.routes";

const router = Router();

/**
 * 🌐 Root index route for healthcheck or greeting
 */
router.get("/", (req, res) => {
  res.send("🔮 Oracle Backend is Alive");
});

/**
 * 🧩 API Aggregation
 */
router.use("/auth", authRoutes);
router.use("/memory", memoryRoutes);
router.use("/personal-guide", personalGuideRoutes);
router.use("/api/oracle/dream", dreamRoutes);
router.use("/oracle/personal", personalOracleRoutes);
router.use("/api/oracle", modeSelectorRoutes);
router.use("/symbolic-tags", symbolicMemoryRoutes);
router.use("/journal", journalRoutes);
router.use("/survey", surveyRoutes);
router.use("/session", sessionRoutes);
router.use("/oracle/story-generator", storyRoutes);
router.use("/symbolic-trends", symbolicTrendsRoutes);
router.use("/learning", learningRoutes);
router.use("/facilitator", facilitatorRoutes);
router.use("/founder", founderRoutes);
router.use("/retreat", retreatRoutes);
router.use("/retreat/onboarding", retreatOnboardingRoutes);
router.use("/retreat/support", retreatSupportRoutes);
router.use("/post-retreat", postRetreatRoutes);
router.use("/holoflower", holoflowerRouter);
router.use("/elemental-alchemy", elementalAlchemyRouter);
router.use("/astrology", astrologyRouter);
router.use("/astrology/four-pillars", fourPillarsRouter);
router.use("/iching", ichingRouter);
router.use("/divination", divinationRouter);
router.use("/facilitator", facilitatorDashboardRouter);
router.use("/automation", automationRoutes);
router.use("/sacred-mirror", sacredMirrorRoutes);
router.use("/spiralogic-report", spiralogicReportRouter);
router.use("/practitioner", practitionerPortalRouter);
router.use("/retreat", retreatModeRouter);
router.use("/narration", narrationRoutes);
router.use("/oracle/preferences", oraclePreferencesRoutes);
router.use("/voice/preview", voicePreviewRoutes);
router.use("/voice/list", voiceListRoutes);
router.use("/fire-agent", fireAgentRoutes);
router.use("/water-agent", waterAgentRoutes);
router.use("/orchestrator", orchestratorRoutes);
router.use("/holistic", holisticRoutes);
router.use("/integration", integrationRoutes);
router.use("/spiral-journey", spiralJourneyRoutes);
router.use("/soullab", soulLabRoutes);
router.use("/oracle", oracleRoutes);

export default router;
