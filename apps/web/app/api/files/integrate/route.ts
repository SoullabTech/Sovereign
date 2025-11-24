import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { searchUserFiles } from '@/backend/src/services/IngestionQueue';
import { getServerSession } from 'next-auth';

// Stub searchUserFiles
const searchUserFiles = async (userId: string, message: string, limit: number) => {
  return [] as Array<{
    id: string;
    fileName: string;
    content: string;
    relevantChunks: string[];
    confidence: number;
  }>;
};

/**
 * Integrate user's uploaded files into Maya's conversational context
 * This endpoint is called automatically when Maya needs file context
 */
export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message, limit = 3 } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Missing message to search against' },
        { status: 400 }
      );
    }

    const userId = session.user.email || 'anonymous';

    // Search for relevant files based on the conversation message
    const relevantFiles = await searchUserFiles(userId, message, limit);

    if (!relevantFiles || relevantFiles.length === 0) {
      return NextResponse.json({
        hasRelevantFiles: false,
        context: '',
        fileCount: 0,
      });
    }

    // Build contextual information for Maya
    const contextualSummary = relevantFiles
      .map((file: any) => 
        `From "${file.fileName}" (${file.elementalResonance} resonance): ${file.summary}`
      )
      .join('\n\n');

    const keyThemes = Array.from(
      new Set(
        relevantFiles
          .flatMap((file: any) => file.keyTopics || [])
          .filter(Boolean)
      )
    );

    return NextResponse.json({
      hasRelevantFiles: true,
      context: contextualSummary,
      fileCount: relevantFiles.length,
      themes: keyThemes,
      files: relevantFiles.map((file: any) => ({
        name: file.fileName,
        summary: file.summary,
        element: file.elementalResonance,
        tone: file.emotionalTone,
        similarity: file.similarity,
      })),
      mayaContext: {
        systemPrompt: `The user has uploaded ${relevantFiles.length} relevant files. Key themes include: ${keyThemes.join(', ')}. Reference these insights naturally in your response.`,
        filesSummary: contextualSummary,
      }
    });

  } catch (error) {
    console.error('File integration error:', error);
    return NextResponse.json(
      { error: 'Failed to integrate file context' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}