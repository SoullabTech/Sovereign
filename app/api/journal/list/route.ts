// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD:app/api/journal/route.ts

// Force dynamic for Docker/dev builds
export const dynamic = 'force-dynamic';
=======

export const revalidate = false;
import { z } from "zod";
import { memoryStore } from "../../_backend/src/services/memory/MemoryStore";
import { llamaService } from "../../_backend/src/services/memory/LlamaService";
import { logger } from "../../_backend/src/utils/logger";

// Force dynamic for Docker/dev builds - Next.js 15 doesn't support conditional exports
>>>>>>> ecstatic-brown:app/api/journal/list/route.ts

/**
 * Journal API - Temporarily unavailable
 * Services are being migrated from legacy backend
 */

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: 'Journal service temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
<<<<<<< HEAD:app/api/journal/route.ts
  return NextResponse.json(
    { ok: false, error: 'Journal service temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
=======
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const search = req.nextUrl.searchParams.get("search");

    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required" 
      }, { status: 400 });
    }

    // Initialize memory store
    const dbPath = process.env.MEMORY_DB_PATH || './data/soullab.sqlite';
    await memoryStore.init(dbPath);

    let entries;
    
    if (search) {
      // Use LlamaIndex for semantic search
      await llamaService.init();
      const searchResults = await llamaService.searchMemories(
        userId, 
        search, 
        limit,
        { type: "journal" }
      );
      
      // Extract entry IDs and fetch full entries from SQLite
      const entryIds = searchResults.map(r => r.id);
      entries = await memoryStore.getJournalEntriesByIds(userId, entryIds);
    } else {
      // Get recent entries from SQLite
      entries = await memoryStore.getJournalEntries(userId, limit);
    }

    return NextResponse.json({ 
      success: true, 
      entries,
      count: entries.length
    });
  } catch (err: any) {
    logger.error("Journal GET error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
>>>>>>> ecstatic-brown:app/api/journal/list/route.ts
}
