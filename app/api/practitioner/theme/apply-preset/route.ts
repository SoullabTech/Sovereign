export const dynamic = 'force-static';

import { NextRequest, NextResponse } from "next/server";
import { applyPreset } from "@/lib/theme/themeService";

/**
 * POST /api/practitioner/theme/apply-preset
 *
 * Apply a vibe preset to practitioner's theme.
 * Preserves identity and custom settings, updates colors/typography/tone.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, preset } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: "practitionerId required" },
        { status: 400 }
      );
    }

    if (!preset) {
      return NextResponse.json(
        { error: "preset required" },
        { status: 400 }
      );
    }

    const result = await applyPreset(practitionerId, preset);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      theme: result.theme,
      appliedPreset: preset,
    });
  } catch (error) {
    console.error("POST /api/practitioner/theme/apply-preset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
