import { Router, Request, Response } from "express";
import { astrologicalService } from "../services/astrologicalService";
import { authenticateToken } from "../middleware/authenticateToken";
import { logger } from "../lib/logger";
import { z } from "zod";

const router = Router();

// Validation schema for report generation
const generateReportSchema = z.object({
  lifeStage: z.string().optional(),
  personalityNotes: z.array(z.string()).optional(),
});

/**
 * @route POST /api/spiralogic-report/generate
 * @desc Generate a personalized Spiralogic Astrology Report
 * @access Private
 */
router.post(
  "/generate",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;

      // Validate request body
      const validation = generateReportSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: validation.error.errors,
        });
      }

      const { lifeStage, personalityNotes } = validation.data;

      logger.info(`Generating Spiralogic report for user ${userId}`);

      // Generate the report
      const reportOutput = await astrologicalService.generateSpiralogicReport(
        userId,
        {
          lifeStage,
          personalityNotes,
        },
      );

      // Return the report
      res.json({
        success: true,
        report: reportOutput.report,
        message: "Spiralogic report generated successfully",
      });
    } catch (error: any) {
      logger.error("Error generating Spiralogic report:", error);

      if (error.message.includes("birth data not found")) {
        return res.status(400).json({
          success: false,
          error: "Birth data not set",
          message:
            "Please set your birth information before generating a report",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to generate report",
        message: error.message || "An unexpected error occurred",
      });
    }
  },
);

/**
 * @route GET /api/spiralogic-report/history
 * @desc Get user's previous Spiralogic reports
 * @access Private
 */
router.get(
  "/history",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;

      logger.info(`Fetching report history for user ${userId}`);

      // Get user's reports
      const reports = await astrologicalService.getUserReports(userId);

      res.json({
        success: true,
        reports,
        count: reports.length,
      });
    } catch (error: any) {
      logger.error("Error fetching report history:", error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch report history",
        message: error.message || "An unexpected error occurred",
      });
    }
  },
);

/**
 * @route GET /api/spiralogic-report/:reportId
 * @desc Get a specific Spiralogic report by ID
 * @access Private
 */
router.get(
  "/:reportId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const { reportId } = req.params;

      logger.info(`Fetching report ${reportId} for user ${userId}`);

      // Get the specific report (with user validation)
      const reports = await astrologicalService.getUserReports(userId);
      const report = reports.find((r) => r.id === reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: "Report not found",
        });
      }

      res.json({
        success: true,
        report,
      });
    } catch (error: any) {
      logger.error("Error fetching report:", error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch report",
        message: error.message || "An unexpected error occurred",
      });
    }
  },
);

/**
 * @route POST /api/spiralogic-report/:reportId/download
 * @desc Download a Spiralogic report as PDF
 * @access Private
 */
router.post(
  "/:reportId/download",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const { reportId } = req.params;

      logger.info(`Downloading report ${reportId} for user ${userId}`);

      // Get the report
      const reports = await astrologicalService.getUserReports(userId);
      const report = reports.find((r) => r.id === reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: "Report not found",
        });
      }

      // TODO: Generate PDF using existing spiralogicReportPdfService
      // For now, return a message
      res.json({
        success: true,
        message: "PDF generation coming soon",
        report: {
          id: reportId,
          title: `Spiralogic Report - ${report.metadata?.name || "Sacred Journey"}`,
        },
      });
    } catch (error: any) {
      logger.error("Error downloading report:", error);

      res.status(500).json({
        success: false,
        error: "Failed to download report",
        message: error.message || "An unexpected error occurred",
      });
    }
  },
);

/**
 * @route POST /api/spiralogic-report/sample
 * @desc Generate a sample Spiralogic report with example data
 * @access Public
 */
router.post("/sample", async (req: Request, res: Response) => {
  try {
    logger.info("Generating sample Spiralogic report");

    // Create sample input for Noemi
    const sampleInput = {
      userId: "sample-user",
      name: "Noemi",
      birthDate: "2006-08-27",
      birthTime: "22:15",
      birthLocation: "Basel, Switzerland",
      chartData: {
        sun: { sign: "virgo", house: 5 },
        moon: { sign: "libra", house: 6 },
        rising: "taurus",
        northNode: { sign: "pisces", house: 12 },
        southNode: { sign: "virgo", house: 6 },
      },
      dominantElement: "earth" as const,
      underactiveElement: "fire" as const,
      archetypes: ["Mystic Guide", "Earth Priestess", "Visionary Alchemist"],
      lifeStage: "Rite of Passage – Post A-Levels, preparing for college",
      personalityNotes: ["ADD", "Aspergers", "Creative", "Entrepreneurial"],
    };

    // Use the GenerateReportFlow directly for the sample
    const { GenerateReportFlow } = await import("../flows/generateReportFlow");
    const reportFlow = new GenerateReportFlow();
    const reportOutput = await reportFlow.generateReport(sampleInput);

    res.json({
      success: true,
      report: reportOutput.report,
      message: "Sample report generated successfully",
    });
  } catch (error: any) {
    logger.error("Error generating sample report:", error);

    res.status(500).json({
      success: false,
      error: "Failed to generate sample report",
      message: error.message || "An unexpected error occurred",
    });
  }
});

export default router;
