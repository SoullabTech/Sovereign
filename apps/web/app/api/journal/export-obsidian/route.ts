import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { voiceJournalingService } from '@/lib/journaling/VoiceJournalingService';
import { obsidianExporter, type ObsidianExportOptions } from '@/lib/export/ObsidianExporter';

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionIds, options } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const exportOptions: ObsidianExportOptions = options || {};

    // Get sessions to export
    let sessionsToExport;
    if (sessionIds && sessionIds.length > 0) {
      // Export specific sessions
      const allSessions = voiceJournalingService.getSessionHistory(userId);
      sessionsToExport = allSessions.filter(s => sessionIds.includes(s.id));
    } else {
      // Export all sessions
      sessionsToExport = voiceJournalingService.getSessionHistory(userId);
    }

    if (sessionsToExport.length === 0) {
      return NextResponse.json(
        { error: 'No sessions found to export' },
        { status: 404 }
      );
    }

    // Generate exports
    const exports = obsidianExporter.exportBatch(sessionsToExport, exportOptions);

    // Generate index
    const index = obsidianExporter.generateIndex(sessionsToExport);

    // Return exports as ZIP-ready data
    const response = {
      success: true,
      count: exports.length,
      exports: exports.map(exp => ({
        filename: exp.filename,
        path: exp.path,
        content: exp.content,
        success: exp.success
      })),
      index: {
        filename: 'INDEX.md',
        content: index
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export journal entries' },
      { status: 500 }
    );
  }
}

// GET endpoint for single session preview
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'User ID and Session ID are required' },
        { status: 400 }
      );
    }

    const sessions = voiceJournalingService.getSessionHistory(userId);
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const exportResult = obsidianExporter.exportSession(session);

    return new Response(exportResult.content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`
      }
    });

  } catch (error) {
    console.error('Export preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export preview' },
      { status: 500 }
    );
  }
}