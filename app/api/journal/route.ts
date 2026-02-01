/**
 * Journal API Route - Thin adapter
 * All logic lives in lib/journal/handlers
 */
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Lazy import handler to avoid module-load issues
    const { listJournalEntriesHandler } = await import(
      '@/lib/journal/handlers/journalHandlers'
    );

    const result = await listJournalEntriesHandler(req);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Journal GET]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: err?.message?.includes('required') ? 400 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Lazy import handler
    const { createJournalEntryHandler } = await import(
      '@/lib/journal/handlers/journalHandlers'
    );

    const result = await createJournalEntryHandler(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('[Journal POST]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Lazy import handler
    const { updateJournalEntryHandler } = await import(
      '@/lib/journal/handlers/journalHandlers'
    );

    const result = await updateJournalEntryHandler(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Journal PUT]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const entryId = url.searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { ok: false, error: 'entryId parameter is required' },
        { status: 400 }
      );
    }

    // Lazy import handler
    const { deleteJournalEntryHandler } = await import(
      '@/lib/journal/handlers/journalHandlers'
    );

    const result = await deleteJournalEntryHandler(entryId);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Journal DELETE]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
