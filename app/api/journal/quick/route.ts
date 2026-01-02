/**
 * Quick Journal API - Fast capture for dreams and day reflections
 * POST /api/journal/quick
 *
 * Designed for rapid capture at 2am dreams or midday reflections
 * Minimal friction, maximum presence
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

interface QuickJournalEntry {
  id: string;
  user_id: string;
  entry_type: 'dream' | 'day';
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
}

// Ensure table exists (runs once on first request)
async function ensureTableExists() {
  await query(`
    CREATE TABLE IF NOT EXISTS quick_journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      entry_type TEXT NOT NULL CHECK (entry_type IN ('dream', 'day')),
      content TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      source TEXT DEFAULT 'quick_sheet',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
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
    const { userId, entryType, content, tags = [], source = 'quick_sheet' } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!entryType || !['dream', 'day'].includes(entryType)) {
      return NextResponse.json(
        { success: false, error: 'entryType must be "dream" or "day"' },
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

    // Insert entry
    const result = await query<QuickJournalEntry>(`
      INSERT INTO quick_journal_entries (user_id, entry_type, content, tags, source)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, entryType, content.trim(), tags, source]);

    const entry = result.rows[0];

    console.log(`✅ [QuickJournal] ${entryType} entry saved for user ${userId}`);

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
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
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

    let queryStr = `
      SELECT * FROM quick_journal_entries
      WHERE user_id = $1
    `;
    const params: (string | number)[] = [userId];

    if (entryType && ['dream', 'day'].includes(entryType)) {
      queryStr += ` AND entry_type = $2`;
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
