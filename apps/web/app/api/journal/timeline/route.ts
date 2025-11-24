import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { JournalSoulprintIntegration } from '@/lib/soulprint/JournalSoulprintIntegration';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'beta-user';

    const entriesData = [];

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/journal/entries?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        entriesData.push(...(data.entries || []));
      }
    } catch (error) {
      console.error('Failed to fetch entries from API:', error);
    }

    const stats = JournalSoulprintIntegration.generateJournalingSummary(entriesData);

    return NextResponse.json({
      success: true,
      entries: entriesData,
      stats,
      totalEntries: entriesData.length
    });

  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const entriesData = [];

    const stats = JournalSoulprintIntegration.generateJournalingSummary(entriesData);

    return NextResponse.json({
      success: true,
      entries: entriesData,
      stats,
      totalEntries: entriesData.length
    });

  } catch (error) {
    console.error('Timeline POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}