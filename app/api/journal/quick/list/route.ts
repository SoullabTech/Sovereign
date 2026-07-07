// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Quick Journal API - Fast capture for dreams and day reflections
 * POST /api/journal/quick
 *
 * Designed for rapid capture at 2am dreams or midday reflections
 * Minimal friction, maximum presence
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { createCapsule } from '@/lib/capsules/capsuleService';
import { VectorEmbeddingService } from '@/lib/vector-embeddings';
import crypto from 'crypto';

// Map quick journal entry types to episodic memory content types
const JOURNAL_TO_MEMORY_TYPE: Record<string, string> = {
  dream: 'Dream',
  day: 'Journal',
  handwriting: 'Journal',
};

// Fire-and-forget: write to episodic_memories for resonance search
async function bridgeToEpisodicMemory(
  userId: string,
  entryType: string,
  content: string
) {
  try {
    const prefix = JOURNAL_TO_MEMORY_TYPE[entryType] || 'Journal';
    const firstLine = content.trim().split(/[\n.!?]/)[0].slice(0, 80);
    const title = `${prefix}: ${firstLine}`;
    const episodeId = `quick-${entryType}-${crypto.randomUUID()}`;

    let semanticVector: number[] | null = null;
    try {
      const embedder = new VectorEmbeddingService({
        dimension: 768,
      });
      semanticVector = await embedder.getEmbedding(`${title} ${content}`);
    } catch {
      // Non-fatal: text fallback still works for resonance
    }

    await query(
      `INSERT INTO episodic_memories
        (user_id, episode_id, experience_title, experience_description,
         experience_context, significance, emotional_intensity,
         semantic_vector, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())`,
      [
        userId,
        episodeId,
        title,
        content.trim(),
        `quick_journal_${entryType}`,
        entryType === 'dream' ? 7 : 5,
        0.5,
        semanticVector ? JSON.stringify(semanticVector) : '[]',
      ]
    );

    console.log(`[QuickJournal→Memory] Bridged ${entryType} → ${episodeId}`);
  } catch (err) {
    // Non-fatal: journal save already succeeded
    console.error('[QuickJournal→Memory] Bridge failed (journal still saved):', err);
  }
}

// Fire-and-forget: write a minimal capsule so the oracle context layer has this entry.
// No LLM distillation — just a bridge artifact so MAIA holds the raw record.
// source_id = journal entry UUID for deduplication if re-run.
async function bridgeToCapsule(
  userId: string,
  entryId: string,
  entryType: string,
  content: string
) {
  try {
    const isDream = entryType === 'dream';
    const firstLine = content.trim().split(/[\n.!?]/)[0].slice(0, 80);
    const title = isDream
      ? `Dream: ${firstLine}`
      : `Journal: ${firstLine}`;

    await createCapsule({
      userId,
      sourceType: 'journal',
      sourceId: entryId,
      title,
      summary: content.trim().slice(0, 1200),
      signals: isDream
        ? { element: 'water', tone: 'dream' }
        : { tone: 'reflection' },
      tags: ['auto-captured', entryType],
      draft: true,
    });

    console.log(`[QuickJournal→Capsule] Bridged ${entryType} → capsule for user ${userId}`);
  } catch (err) {
    // Non-fatal: journal save already succeeded
    console.error('[QuickJournal→Capsule] Bridge failed (journal still saved):', err);
  }
}

// Skip during static export (Capacitor builds)

interface QuickJournalEntry {
  id: string;
  user_id: string;
  entry_type: 'dream' | 'day' | 'handwriting';
  content: string;
  tags: string[];
  source: string;
  created_at: string;
  // Audio fields (optional - present when voice recorded)
  audio_path?: string;
  audio_mime?: string;
  audio_duration_ms?: number;
  transcript_source?: string;
  transcript_confidence?: number;
  // OCR metadata (optional - present for handwriting entries)
  meta?: {
    ocrProvider?: string;
    ocrConfidence?: number;
    hasImage?: boolean;
    imageSize?: number;
  };
}

// Ensure table exists (runs once on first request)
async function ensureTableExists() {
  await query(`
    CREATE TABLE IF NOT EXISTS quick_journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      entry_type TEXT NOT NULL CHECK (entry_type IN ('dream', 'day', 'handwriting')),
      content TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      source TEXT DEFAULT 'quick_sheet',
      meta JSONB DEFAULT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add meta column if it doesn't exist (for existing tables)
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'quick_journal_entries' AND column_name = 'meta') THEN
        ALTER TABLE quick_journal_entries ADD COLUMN meta JSONB DEFAULT NULL;
      END IF;
    END $$;
  `);

  // Update constraint to include 'handwriting' if needed
  await query(`
    DO $$
    BEGIN
      ALTER TABLE quick_journal_entries DROP CONSTRAINT IF EXISTS quick_journal_entries_entry_type_check;
      ALTER TABLE quick_journal_entries ADD CONSTRAINT quick_journal_entries_entry_type_check
        CHECK (entry_type IN ('dream', 'day', 'handwriting'));
    EXCEPTION WHEN others THEN
      NULL;
    END $$;
  `);

  // Create indexes if they don't exist
  await query(`
    CREATE INDEX IF NOT EXISTS idx_quick_journal_user_id ON quick_journal_entries(user_id);
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_quick_journal_created_at ON quick_journal_entries(created_at DESC);
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_quick_journal_type ON quick_journal_entries(entry_type);
  `);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, entryType, content, tags = [], source = 'quick_sheet', meta = null } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!entryType || !['dream', 'day', 'handwriting'].includes(entryType)) {
      return NextResponse.json(
        { success: false, error: 'entryType must be "dream", "day", or "handwriting"' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'content is required' },
        { status: 400 }
      );
    }

    // Ensure table exists
    await ensureTableExists();

    // Insert entry (with optional meta for handwriting OCR data)
    const result = await query<QuickJournalEntry>(`
      INSERT INTO quick_journal_entries (user_id, entry_type, content, tags, source, meta)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, entryType, content.trim(), tags, source, meta ? JSON.stringify(meta) : null]);

    const entry = result.rows[0];

    console.log(`✅ [QuickJournal] ${entryType} entry saved for user ${userId}`);

    // Bridge to episodic memory for resonance search (fire-and-forget)
    if (content.trim().length >= 10) {
      bridgeToEpisodicMemory(userId, entryType, content).catch(() => {});
    }

    // Bridge to capsule layer so oracle context holds this entry (fire-and-forget)
    if (content.trim().length >= 10) {
      bridgeToCapsule(userId, entry.id, entryType, content).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      entryId: entry.id,
      entryType: entry.entry_type,
      createdAt: entry.created_at
    });

  } catch (error) {
    console.error('❌ [QuickJournal] Error saving entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save journal entry' },
      { status: 500 }
    );
  }
}

// GET - Retrieve entries for a user
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    // Accept userId from query param (QuickJournalSheet) or x-member-id header (Reflections page via apiFetch)
    const userId = searchParams.get('userId') || request.headers.get('x-member-id');
    const entryType = searchParams.get('type'); // optional filter
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Ensure table exists
    await ensureTableExists();

    // Build list of all possible user IDs to check (handles legacy ID migrations)
    // This includes: current UUID, username, and legacy 'username-nezat' format
    const userIds: string[] = [userId];

    // If userId is a UUID, look up the member's username for legacy entries
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(userId)) {
      try {
        const memberResult = await query<{ username: string }>(
          'SELECT username FROM members WHERE id::text = $1',
          [userId]
        );
        if (memberResult.rows.length > 0) {
          const username = memberResult.rows[0].username;
          userIds.push(username);
          userIds.push(`${username}-nezat`); // Legacy format
          console.log(`📚 [QuickJournal] Checking entries for IDs: ${userIds.join(', ')}`);
        }
      } catch (e) {
        // Members table might not exist, continue with just userId
      }
    }

    // Build query with all possible user IDs
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ');
    let queryStr = `
      SELECT * FROM quick_journal_entries
      WHERE user_id IN (${placeholders})
    `;
    const params: (string | number)[] = [...userIds];

    if (entryType && ['dream', 'day', 'handwriting'].includes(entryType)) {
      queryStr += ` AND entry_type = $${params.length + 1}`;
      params.push(entryType);
    }

    queryStr += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query<QuickJournalEntry>(queryStr, params);

    return NextResponse.json({
      success: true,
      entries: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ [QuickJournal] Error fetching entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}
