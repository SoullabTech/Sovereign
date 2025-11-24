import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { journalStorage } from '@/lib/storage/journal-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'beta-user';
    const mode = searchParams.get('mode') as any;
    const symbol = searchParams.get('symbol');
    const archetype = searchParams.get('archetype');
    const emotion = searchParams.get('emotion');

    const entries = journalStorage.getEntries(userId, {
      mode,
      symbol: symbol || undefined,
      archetype: archetype || undefined,
      emotion: emotion || undefined
    });

    const stats = journalStorage.getUserStats(userId);

    return NextResponse.json({
      success: true,
      entries,
      stats
    });

  } catch (error) {
    console.error('Entries API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}