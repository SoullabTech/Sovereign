import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Stub DI container
function get<T>(token: any): T {
  return {} as T;
}
function wireDI() {
  // No-op
}
const TOKENS = {
  SSE_HUB: Symbol('SSE_HUB'),
  VOICE_QUEUE: Symbol('VOICE_QUEUE'),
  VOICE_EVENT_BUS: Symbol('VOICE_EVENT_BUS')
};
// Temporarily disabled to fix build issues
// import { get } from '../../../../backend/src/core/di/container';
// import { TOKENS } from '../../../../backend/src/core/di/tokens';
// import { wireDI } from '../../../../backend/src/bootstrap/di';
// import { PersonalOracleAgent } from '../../../../backend/src/agents/PersonalOracleAgent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, entry, title } = body;
    
    if (!userId || !entry) {
      return NextResponse.json(
        { error: 'userId and entry content are required' },
        { status: 400 }
      );
    }

    // Temporary stub implementation - to be replaced when PersonalOracleAgent is fixed
    const mockJournalResponse = {
      id: `journal_${Date.now()}`,
      userId,
      title: title || `Journal Entry ${new Date().toLocaleDateString()}`,
      content: entry,
      processed: true,
      insights: ['Mock insight: Journal entry has been received'],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      processed: true,
      message: 'Journal entry received (mock implementation)',
      data: mockJournalResponse
    });
    
  } catch (err: any) {
    console.error('Journal processing failed:', err);
    return NextResponse.json(
      { error: 'journal_processing_failed', message: err?.message },
      { status: 500 }
    );
  }
}