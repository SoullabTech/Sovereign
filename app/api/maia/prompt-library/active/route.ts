/**
 * GET /api/maia/prompt-library/active
 *
 * Returns the currently active weekly theme with its prompt items.
 * Public (no auth required) — theme content is not sensitive.
 * Used by future UI surfaces and for testing.
 */

import { NextResponse } from 'next/server';
import { getActiveTheme } from '@/lib/maia/prompt-library';

export const dynamic = 'force-dynamic';

export async function GET() {
  const theme = await getActiveTheme();

  if (!theme) {
    return NextResponse.json({ theme: null }, { status: 200 });
  }

  return NextResponse.json({
    theme: {
      slug: theme.slug,
      title: theme.title,
      element: theme.element,
      refinementPhase: theme.refinement_phase,
      chapterRef: theme.chapter_ref,
      orientation: theme.orientation,
      status: theme.status,
      activeFrom: theme.active_from,
      activeUntil: theme.active_until,
      items: theme.items.map((item) => ({
        promptText: item.prompt_text,
        promptType: item.prompt_type,
        elementTag: item.element_tag,
        tonalTag: item.tonal_tag,
        sortOrder: item.sort_order,
      })),
    },
  });
}
