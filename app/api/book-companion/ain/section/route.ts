/**
 * AIN SECTION API ROUTE
 *
 * GET /api/book-companion/ain/section?id=xxx
 * Returns a specific section from the AIN corpus
 *
 * OPTIMIZATION: Both TOC and compiled corpus are cached in memory
 * to prevent loading the 23MB file on every request (serverless-friendly)
 */

import { NextRequest, NextResponse } from 'next/server';
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

// In-memory cache for TOC (136KB)
let tocCache: TocItem[] | null = null;
let tocLoadTime: number | null = null;

// In-memory cache for compiled corpus (23MB - cached for performance)
let corpusCache: string | null = null;
let corpusLoadTime: number | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function loadToc(): Promise<TocItem[]> {
  const now = Date.now();
  if (tocCache && tocLoadTime && (now - tocLoadTime) < CACHE_TTL_MS) {
    return tocCache;
  }

  const tocFile = path.join(process.cwd(), 'data/ain/build/toc.json');
  const toc = JSON.parse(await fs.readFile(tocFile, 'utf8')) as TocItem[];

  tocCache = toc;
  tocLoadTime = now;

  return toc;
}

async function loadCorpus(): Promise<string> {
  const now = Date.now();
  if (corpusCache && corpusLoadTime && (now - corpusLoadTime) < CACHE_TTL_MS) {
    return corpusCache;
  }

  const compiledFile = path.join(process.cwd(), 'data/ain/build/ain_compiled.md');
  const corpus = await fs.readFile(compiledFile, 'utf8');

  corpusCache = corpus;
  corpusLoadTime = now;

  console.log(`📚 [AIN CORPUS] Loaded 23MB corpus into memory (cached for ${CACHE_TTL_MS / 1000}s)`);

  return corpus;
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    // Load cached TOC
    const toc = await loadToc();

    const item = toc.find((t) => t.id === id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: `Section not found: ${id}` },
        { status: 404 }
      );
    }

    // Load cached corpus
    const compiled = await loadCorpus();

    // Extract the section: find `# title` and slice until next `# `
    const marker = `# ${item.title}\n`;
    const start = compiled.indexOf(marker);

    if (start === -1) {
      return NextResponse.json(
        { success: false, error: 'Section marker not found in corpus' },
        { status: 404 }
      );
    }

    const rest = compiled.slice(start + marker.length);
    const nextHeader = rest.indexOf('\n# ');
    const section = nextHeader === -1 ? rest : rest.slice(0, nextHeader);

    return NextResponse.json({
      success: true,
      id: item.id,
      title: item.title,
      filename: item.filename,
      content: section.trim(),
      bytes: item.bytes,
      cached: corpusCache !== null, // Indicates corpus was served from cache
    });
  } catch (e) {
    console.error('❌ [AIN SECTION] Failed to load:', e);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load section',
      },
      { status: 500 }
    );
  }
}
