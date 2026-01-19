export const dynamic = 'force-static';

import { NextResponse } from "next/server";
import { listPresets } from "@/lib/theme/themeService";

/**
 * GET /api/practitioner/theme/presets
 *
 * List available vibe presets with preview data.
 * Safe for caching - no mutations, no auth required.
 */
export async function GET() {
  const presets = listPresets();
  return NextResponse.json({ presets });
}
