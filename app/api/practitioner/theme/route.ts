import { NextRequest, NextResponse } from "next/server";
import { getTheme, updateTheme } from "@/lib/theme/themeService";

/**
 * GET /api/practitioner/theme
 *
 * Fetch theme for a practitioner.
 * Returns defaults if no theme exists.
 * Does NOT enforce tier constraints on read (stable, predictable reads).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get("practitionerId");

    if (!practitionerId) {
      return NextResponse.json(
        { error: "practitionerId required" },
        { status: 400 }
      );
    }

    const result = await getTheme(practitionerId);

    if (!result) {
      return NextResponse.json(
        { error: "Practitioner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/practitioner/theme error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/practitioner/theme
 *
 * Update theme for a practitioner.
 * - Tier is sourced from DB, not payload (escalation prevention)
 * - Validates schema with Zod
 * - Enforces tier constraints before saving
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, theme } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: "practitionerId required" },
        { status: 400 }
      );
    }

    if (!theme) {
      return NextResponse.json(
        { error: "theme required" },
        { status: 400 }
      );
    }

    const result = await updateTheme(practitionerId, theme);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      theme: result.theme,
    });
  } catch (error) {
    console.error("PUT /api/practitioner/theme error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
