import { NextResponse } from "next/server";
import { parseAstrologyIntake } from "@/lib/astrology/parseAstrologyIntake";
import { pickLenses } from "@/lib/astrology/pickLenses";

/**
 * This endpoint is the "intake router":
 * - accepts plain text chart dumps OR JSON
 * - normalizes + validates
 * - picks lenses
 * - returns a structured response object
 *
 * You can later wire this into your narrative engine / spiralogic mapping / transits, etc.
 */
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

    // v1 response: the "engine" can be plugged in here
    // - if intake.birth exists: you can call birth-chart/ logic
    // - if timing needed: call current-transits/ logic
    // - if spiralogic: call spiralogicMapping.ts
    // - if mythic: call narrative/ logic
    //
    // For now, return a structured object so frontend + logs can verify routing.

    const response = {
      ok: true,
      lensesUsed,
      houseSystem: intake.houseSystem,
      intake: {
        hasBirth: !!intake.birth,
        hasNatal: !!intake.natal?.placements?.length,
        hasAspects: !!intake.natal?.aspects?.length,
        hasTiming: !!intake.timing?.transits?.length,
        question: intake.question,
        source: intake.meta?.source ?? "other",
      },
      // Placeholder interpretation so callers always get something usable
      interpretation: {
        corePattern:
          "Received astrology intake. Lens routing completed. Next: wire this endpoint into narrative + spiralogic + timing composers.",
        currentActivation: intake.timing?.transits?.length
          ? "Timing data detected (transits present)."
          : "No timing data detected.",
        integrationPath: [
          "If you want timing: include transits or provide current date range.",
          "If you want a chart build: provide birth date/time/location.",
          "If you want Spiralogic: include 'Spiralogic' or element/facet language (or select Spiralogic lens).",
        ],
      },
      meta: {
        version: intake.version,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: "Astrology reading intake failed",
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
      example: {
        houseSystem: "whole_sign",
        question: "What is being initiated in me right now and how do I cooperate with it?",
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
