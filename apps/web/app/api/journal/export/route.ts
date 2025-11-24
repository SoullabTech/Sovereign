import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { obsidianJournalExporter, JournalEntry } from '@/lib/journaling/ObsidianJournalExporter';
import { journalStorage } from '@/lib/storage/journal-storage';

export async function POST(req: NextRequest) {
  try {
    const { entry, mode, reflection, userId, element } = await req.json();

    if (!entry || !mode || !reflection) {
      return NextResponse.json(
        { error: 'Entry, mode, and reflection are required' },
        { status: 400 }
      );
    }

    const journalEntry: JournalEntry = {
      id: `journal_${Date.now()}`,
      userId: userId || 'beta-user',
      mode,
      entry,
      reflection,
      timestamp: new Date(),
      element
    };

    journalStorage.addEntry({
      id: journalEntry.id,
      userId: journalEntry.userId,
      mode: journalEntry.mode,
      entry: journalEntry.entry,
      reflection: journalEntry.reflection,
      timestamp: journalEntry.timestamp.toISOString(),
      element: journalEntry.element
    });

    const result = await obsidianJournalExporter.exportJournalEntry(journalEntry);

    if (result.success) {
      return NextResponse.json({
        success: true,
        filePath: result.filePath,
        message: 'Journal entry exported to Obsidian and saved to storage'
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Journal entry saved to storage (Obsidian export failed)'
      });
    }

  } catch (error) {
    console.error('Journal export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}