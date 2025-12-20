/**
 * Reality Hygiene API - Save Assessment Endpoint
 *
 * Allows users to save their Reality Hygiene assessments to the database.
 * Scores are user-provided (1-5 for each of 20 indicators).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { insertOne, query, findMany } from "@/lib/db/postgres";
import {
  REALITY_INDICATORS,
  computeRealityTotal,
  type RealityScores,
} from "@/lib/reality/realityTypes";

const ScoresSchema = z.record(z.number().int().min(1).max(5));

const BodySchema = z.object({
  source_type: z.string().default("oracle_turn"),
  source_ref: z.string().optional(),
  session_id: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  scores: ScoresSchema,
  questions: z.any().optional(), // RealityCheckAgent output
});

export async function POST(req: Request) {
  // TODO: Add authentication when auth system is in place
  // For now, require userId in request body

  try {
    const body = await req.json();
    const parsed = BodySchema.parse(body);

    // Require userId for now (until auth is implemented)
    if (!body.userId) {
      return NextResponse.json(
        { error: "userId required" },
        { status: 400 }
      );
    }

    // Validate all 20 indicators are present
    for (const k of REALITY_INDICATORS) {
      if (typeof parsed.scores[k] !== "number") {
        return NextResponse.json(
          { error: `missing score for indicator: ${k}` },
          { status: 400 }
        );
      }
    }

    const scores = parsed.scores as unknown as RealityScores;
    const { total, max, band } = computeRealityTotal(scores);

    // Insert assessment using direct Postgres
    const assessment = await insertOne("reality_assessments", {
      user_id: body.userId,
      session_id: parsed.session_id ?? null,
      source_type: parsed.source_type,
      source_ref: parsed.source_ref ?? null,
      title: parsed.title ?? null,
      notes: parsed.notes ?? null,
      scores: JSON.stringify(scores),
      total_score: total,
      max_score: max,
      risk_band: band,
      questions: parsed.questions ? JSON.stringify(parsed.questions) : null,
      auto_scored: false,
      user_edited: false,
    });

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("[RealityScore] Request error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve user's reality assessments
 */
export async function GET(req: Request) {
  // TODO: Add authentication when auth system is in place

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sessionId = searchParams.get("session_id");

    if (!userId) {
      return NextResponse.json(
        { error: "userId required" },
        { status: 400 }
      );
    }

    // Build query with optional session filter
    let sql = `
      SELECT * FROM reality_assessments
      WHERE user_id = $1
      ${sessionId ? "AND session_id = $2" : ""}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const params = sessionId ? [userId, sessionId] : [userId];
    const result = await query(sql, params);

    return NextResponse.json({ assessments: result.rows });
  } catch (error) {
    console.error("[RealityScore] GET request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
