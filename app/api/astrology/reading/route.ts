/**
 * Astrology Reading API
 *
 * Unified intake endpoint that:
 * - Accepts plain text chart dumps OR structured JSON
 * - Validates via Zod schema
 * - Routes to appropriate lenses based on keywords
 * - Runs engines in parallel (natal chart, transits, life cycles, narrative, spiralogic)
 * - Returns unified reading payload
 */

import { NextResponse } from "next/server";
import { parseAstrologyIntake } from "@/lib/astrology/parseAstrologyIntake";
import { pickLenses } from "@/lib/astrology/pickLenses";
import { composeAstrologyReading } from "@/lib/astrology/composeAstrologyReading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function readBodyAsUnknown(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await req.json();
    } catch {
      // fall through to text
    }
  }

  // Default to text
  const text = await req.text();
  return text;
}

export async function POST(req: Request) {
  try {
    const body = await readBodyAsUnknown(req);
    const intake = parseAstrologyIntake(body);
    const lensesUsed = pickLenses(intake);

    // Run the unified composer with all engines
    const reading = await composeAstrologyReading({ intake, lensesUsed });

    return NextResponse.json(reading, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: "Astrology reading failed",
        detail: message,
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      hint: "POST chart paste or JSON to this endpoint.",
      lensesAvailable: ["developmental", "mythic", "timing", "integration", "spiralogic"],
      houseSystemsAvailable: ["whole_sign", "placidus", "porphyry", "equal", "koch"],
      example: {
        houseSystem: "whole_sign",
        question: "What is being initiated in me right now and how do I cooperate with it?",
        birth: {
          date: "1990-05-15",
          time: "14:30",
          location: "30.2672,-97.7431", // lat,lng format
          timezone: "America/Chicago",
        },
        natal: {
          placements: [
            { body: "Sun", pos: "Scorpio 18°" },
            { body: "Moon", pos: "Aquarius 5°" },
          ],
        },
        timing: {
          transits: [{ transitingBody: "Pluto", toNatalBody: "Sun", type: "conjunction", orbDeg: 0.5 }],
        },
      },
    },
    { status: 200 }
  );
}
