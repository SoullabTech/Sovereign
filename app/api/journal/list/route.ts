// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

export const revalidate = false;
import { z } from "zod";
import { memoryStore } from "../../_backend/src/services/memory/MemoryStore";
import { llamaService } from "../../_backend/src/services/memory/LlamaService";
import { logger } from "../../_backend/src/utils/logger";
import { getMemberIdFromRequest } from "@/lib/auth/getMemberFromRequest";

// Force dynamic for Docker/dev builds - Next.js 15 doesn't support conditional exports

// `userId` is accepted but ignored: the owner is resolved from the verified
// session. It stays in the schema only so any older caller sending it still
// parses. See the note on POST below.
const JournalSchema = z.object({
  userId: z.string().optional(),
  title: z.string(),
  content: z.string(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // BEFORE (2026-07-28): the entry owner came from a body-supplied `userId`
    // with no session resolution, so any caller could write into any member's
    // journal. AFTER: the owner is the member on the verified session.
    const userId = await getMemberIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = JournalSchema.parse(body);

    // Initialize memory services if needed
    const dbPath = process.env.MEMORY_DB_PATH || './data/soullab.sqlite';
    await memoryStore.init(dbPath);
    await llamaService.init();

    // 1. Save in SQLite with enhanced metadata
    const entryId = await memoryStore.saveJournalEntry(
      userId,
      parsed.title,
      parsed.content,
      parsed.mood,
      parsed.tags
    );

    // 2. Index in LlamaIndex for semantic search
    await llamaService.addMemory(userId, {
      id: entryId,
      type: "journal",
      content: parsed.content,
      meta: { 
        title: parsed.title, 
        mood: parsed.mood, 
        tags: parsed.tags,
        timestamp: new Date().toISOString()
      },
    });

    logger.info("Journal entry saved and indexed", {
      userId: userId.substring(0, 8) + '...',
      entryId,
      contentLength: parsed.content.length
    });

    return NextResponse.json({ 
      success: true, 
      entryId,
      message: "Journal entry saved and indexed for Oracle memory"
    });
  } catch (err: any) {
    logger.error("Journal POST error:", err);
    return NextResponse.json({ 
      error: err.message,
      details: err instanceof z.ZodError ? err.errors : undefined
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    // BEFORE (2026-07-28): `userId` came from the query string, so any caller
    // could read any member's journal. AFTER: session-derived only.
    const userId = await getMemberIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const search = req.nextUrl.searchParams.get("search");

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
}

// Retrieve a specific journal entry
export async function getEntry(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getMemberIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const dbPath = process.env.MEMORY_DB_PATH || './data/soullab.sqlite';
    await memoryStore.init(dbPath);

    const entry = await memoryStore.getJournalEntry(userId, params.id);
    
    if (!entry) {
      return NextResponse.json({ 
        error: "Journal entry not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      entry 
    });
  } catch (err: any) {
    logger.error("Journal entry retrieval error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}