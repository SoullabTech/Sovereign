// src/controllers/survey.controller.ts

import type { Response } from "express";
import { supabase } from "../lib/supabaseClient";
import { elementalProfileSchema } from "../lib/schemas/elemental";
import { surveySubmissionSchema, type SurveySubmission } from "../types/survey";
import type { AuthenticatedRequest } from "../types";

export async function handleSurveySubmission(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    // 1️⃣ Full schema validation using Zod
    const parsed = surveySubmissionSchema.safeParse({
      ...req.body,
      userId: req.user!.id,
    });

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid survey submission",
        details: parsed.error.format(),
      });
    }

    const { responses, crystalFocus, userId } = parsed.data;

    // 2️⃣ Load questions from Supabase
    const { data: questions, error: qError } = await supabase
      .from("survey_questions")
      .select("*");

    if (qError || !questions) {
      return res.status(500).json({ error: "Failed to load questions" });
    }

    // 3️⃣ Aggregate scores per element
    const totals: Record<string, { total: number; count: number }> = {
      fire: { total: 0, count: 0 },
      water: { total: 0, count: 0 },
      earth: { total: 0, count: 0 },
      air: { total: 0, count: 0 },
      aether: { total: 0, count: 0 },
    };

    for (const r of responses) {
      const q = questions.find((q: any) => q.id === r.questionId);
      if (q && q.element && totals[q.element]) {
        totals[q.element]!.total += r.answer * q.weight;
        totals[q.element]!.count += q.weight;
      }
    }

    // 4️⃣ Normalize scores to 0–100 scale
    const profile = {
      user_id: userId,
      fire: Math.round(
        (totals.fire!.total / Math.max(totals.fire!.count, 1)) * 20,
      ),
      water: Math.round(
        (totals.water!.total / Math.max(totals.water!.count, 1)) * 20,
      ),
      earth: Math.round(
        (totals.earth!.total / Math.max(totals.earth!.count, 1)) * 20,
      ),
      air: Math.round(
        (totals.air!.total / Math.max(totals.air!.count, 1)) * 20,
      ),
      aether: Math.round(
        (totals.aether!.total / Math.max(totals.aether!.count, 1)) * 20,
      ),
      updated_at: new Date().toISOString(),
      crystal_focus: crystalFocus,
    };

    // 5️⃣ Validate the resulting profile
    const profileParsed = elementalProfileSchema.safeParse(profile);
    if (!profileParsed.success) {
      return res.status(400).json({
        error: "Profile validation failed",
        details: profileParsed.error.format(),
      });
    }

    // 6️⃣ Save profile to database
    const { data, error } = await supabase
      .from("elemental_profiles")
      .upsert(profileParsed.data)
      .select()
      .single();

    if (error || !data) {
      return res
        .status(500)
        .json({ error: "Failed to save elemental profile" });
    }

    // ✅ Return processed stats
    return res.status(200).json({
      message: "Survey processed successfully",
      stats: {
        fire: profile.fire,
        water: profile.water,
        earth: profile.earth,
        air: profile.air,
        aether: profile.aether,
      },
    });
  } catch (err: any) {
    console.error("❌ Survey submission error:", err.message || err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
