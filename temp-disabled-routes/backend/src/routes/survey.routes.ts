// src/routes/survey.routes.ts

import { Router } from "express";
import { handleSurveySubmission } from "../controllers/survey.controller";
import { z } from "zod";

const router = Router();

// Define the expected shape of the survey submission
const SurveySubmissionSchema = z.object({
  crystalFocus: z.object({
    type: z.enum([
      "career",
      "spiritual",
      "relational",
      "health",
      "creative",
      "other",
    ]),
    customDescription: z.string().optional(),
    challenges: z.string(),
    aspirations: z.string(),
  }),
  responses: z.array(
    z.object({
      questionId: z.string(),
      answer: z.number().min(1).max(5),
    }),
  ),
});

// POST /api/oracle/survey
router.post("/", async (req, res) => {
  try {
    const result = SurveySubmissionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid submission",
        details: result.error.flatten(),
      });
    }

    // Attach to request object for controller
    req.body = { ...result.data };

    return handleSurveySubmission(req as any, res);
  } catch (err) {
    console.error("❌ Survey processing error:", err);
    return res.status(500).json({
      success: false,
      error: "Unexpected server error",
    });
  }
});

export default router;
