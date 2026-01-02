/**
 * AIN TOC API ROUTE
 *
 * GET /api/book-companion/ain/toc
 * Returns the table of contents for the AIN corpus
 *
 * OPTIMIZATION: TOC is cached in memory after first load to prevent
 * repeated file reads on every request (serverless-friendly)
 */

import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

type TocItem = {
  id: string;
  title: string;
  filename: string;
  bytes: number;
};

// In-memory cache (survives across requests in warm serverless instances)
let tocCache: TocItem[] | null = null;
let tocLoadTime: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function loadToc(): Promise<TocItem[]> {
  // Return cached TOC if still valid
  const now = Date.now();
  if (tocCache && tocLoadTime && (now - tocLoadTime) < CACHE_TTL_MS) {
    return tocCache;
  }

  // Load fresh TOC
  const file = path.join(process.cwd(), 'data/ain/build/toc.json');
  const json = await fs.readFile(file, 'utf8');
  const toc = JSON.parse(json) as TocItem[];

  // Update cache
  tocCache = toc;
  tocLoadTime = now;

  return toc;
}

export async function GET() {
  try {
    const toc = await loadToc();

    return NextResponse.json({
      success: true,
      toc,
      total: toc.length,
      cached: tocCache !== null, // Indicates whether this was served from cache
    });
  } catch (e) {
    console.error('❌ [AIN TOC] Failed to load:', e);
    return NextResponse.json(
      {
        success: false,
        toc: [],
        total: 0,
        error: 'Failed to load table of contents',
      },
      { status: 200 }
    );
  }
}
