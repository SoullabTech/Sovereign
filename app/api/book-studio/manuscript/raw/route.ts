/**
 * GET /api/book-studio/manuscript/raw
 *
 * Returns the raw markdown of the sealed Elemental Alchemy manuscript.
 * Used by the Book Studio canvas's "Pull manuscript" button so the
 * smart importer can fetch the source directly without copy-paste.
 *
 * Source of truth (per book studio canon):
 *   docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md
 */

import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MD_PATH = path.join(
  process.cwd(),
  'docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md',
);

export async function GET() {
  try {
    const content = await fs.readFile(MD_PATH, 'utf-8');
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Manuscript source not found',
        details:
          'Expected docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md. Check .dockerignore allowance.',
      },
      { status: 404 },
    );
  }
}
