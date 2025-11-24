import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { voiceJournalingService } from '@/lib/journaling/VoiceJournalingService';
import { ObsidianExporter } from '@/lib/export/ObsidianExporter';

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId, sessionIds, options } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Export single session
    if (sessionId) {
      const sessions = voiceJournalingService.getSessionHistory(userId);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      const result = ObsidianExporter.exportSession(session, options);

      return NextResponse.json({
        success: result.success,
        filename: result.filename,
        content: result.content,
        error: result.error
      });
    }

    // Export multiple sessions
    if (sessionIds && Array.isArray(sessionIds)) {
      const sessions = voiceJournalingService.getSessionHistory(userId);
      const sessionsToExport = sessions.filter(s => sessionIds.includes(s.id));

      const results = ObsidianExporter.exportSessions(sessionsToExport, options);

      return NextResponse.json({
        success: true,
        exports: results
      });
    }

    // Export all sessions
    const sessions = voiceJournalingService.getSessionHistory(userId);

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'No sessions to export' },
        { status: 404 }
      );
    }

    const results = ObsidianExporter.exportSessions(sessions, options);

    return NextResponse.json({
      success: true,
      count: results.length,
      exports: results
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const sessions = voiceJournalingService.getSessionHistory(userId);

    return NextResponse.json({
      success: true,
      count: sessions.length,
      sessions: sessions.map(s => ({
        id: s.id,
        mode: s.mode,
        startTime: s.startTime,
        wordCount: s.wordCount
      }))
    });

  } catch (error) {
    console.error('Export preview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}