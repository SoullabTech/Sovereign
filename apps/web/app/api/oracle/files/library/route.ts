import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { getServerAuth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LibraryFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'processing' | 'absorbed' | 'failed' | 'queued';
  uploadedAt: string;
  summary?: string;
  keyTopics?: string[];
  emotionalTone?: string;
  elementalResonance?: string;
  processingTime?: number;
  errorMessage?: string;
  metadata?: {
    originalName: string;
    tags: string[];
    chunkCount?: number;
    lastAccessed?: string;
  };
}

/**
 * GET /api/oracle/files/library
 * Returns user's uploaded files with processing status
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.email || "anonymous";
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // Filter by status
    const search = searchParams.get('search'); // Search by filename
    const type = searchParams.get('type'); // Filter by file type

    // Build where clause
    let whereClause: any = { userId };
    
    if (status && ['processing', 'absorbed', 'failed', 'queued'].includes(status)) {
      // Map status to our database values
      if (status === 'absorbed') {
        whereClause.content = { not: null }; // Has processed content
        whereClause.embedding = { not: null }; // Has embeddings
      } else if (status === 'processing') {
        whereClause.OR = [
          { content: null },
          { embedding: null }
        ];
      } else if (status === 'failed') {
        whereClause.metadata = {
          path: ['error'],
          not: undefined
        };
      }
    }

    if (search) {
      whereClause.fileName = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Build query based on filters
    let query = supabase
      .from('user_files')
      .select('*')
      .eq('userId', userId);

    if (search) {
      query = query.or(`fileName.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (type && type !== 'all') {
      query = query.eq('fileType', type);
    }

    // Add sorting and pagination
    query = query
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: files, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    if (!files) {
      return NextResponse.json({ files: [], total: 0 });
    }

    // Transform to LibraryFile format
    const libraryFiles: LibraryFile[] = await Promise.all(
      files.map(async (file: any) => {
        // Determine status
        let status: LibraryFile['status'] = 'processing';
        let errorMessage: string | undefined;

        if (file.metadata && typeof file.metadata === 'object' && 'error' in file.metadata) {
          status = 'failed';
          errorMessage = (file.metadata as any).error;
        } else if (file.content && file.embedding) {
          status = 'absorbed';
        } else if (file.content && !file.embedding) {
          status = 'processing'; // Content extracted, embedding pending
        } else {
          // Default to processing if no clear status
          status = 'processing';
        }

        // Calculate processing time if completed
        let processingTime: number | undefined;
        if (status === 'absorbed' && file.createdAt && file.updatedAt) {
          processingTime = file.updatedAt.getTime() - file.createdAt.getTime();
        }

        return {
          id: file.id,
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          status,
          uploadedAt: file.createdAt.toISOString(),
          summary: file.summary || undefined,
          keyTopics: file.keyTopics || undefined,
          emotionalTone: file.emotionalTone || undefined,
          elementalResonance: file.elementalResonance || undefined,
          processingTime,
          errorMessage,
          metadata: {
            originalName: file.fileName,
            tags: [], // TODO: Extract from metadata
            chunkCount: file.content ? Math.ceil(file.content.length / 1000) : undefined,
            lastAccessed: undefined // TODO: Track access times
          }
        };
      })
    );

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('user_files')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId);

    // Maya&apos;s reflection on the library
    const mayaReflection = generateMayaLibraryReflection(libraryFiles);

    return NextResponse.json({
      files: libraryFiles,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < (totalCount || 0)
      },
      filters: {
        status,
        search
      },
      maya: {
        reflection: mayaReflection,
        stats: {
          totalFiles: totalCount,
          absorbed: libraryFiles.filter(f => f.status === 'absorbed').length,
          processing: libraryFiles.filter(f => f.status === 'processing').length,
          failed: libraryFiles.filter(f => f.status === 'failed').length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch library',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate Maya's reflection on the user's library
 */
function generateMayaLibraryReflection(files: LibraryFile[]): string {
  const absorbedCount = files.filter(f => f.status === 'absorbed').length;
  const processingCount = files.filter(f => f.status === 'processing').length;
  const totalCount = files.length;

  if (totalCount === 0) {
    return "Your library awaits your first offering. Share a document, and I'll weave its wisdom into our conversations.";
  }

  if (processingCount > 0) {
    return `I'm currently absorbing ${processingCount} ${processingCount === 1 ? 'document' : 'documents'}, weaving ${processingCount === 1 ? 'its' : 'their'} insights into my understanding of you.`;
  }

  if (absorbedCount === 1) {
    return `I've absorbed the wisdom from your document. Its insights now live within our shared memory.`;
  }

  const topics = files
    .filter(f => f.keyTopics)
    .flatMap(f => f.keyTopics!)
    .slice(0, 3);

  if (topics.length > 0) {
    return `I hold ${absorbedCount} pieces of your knowledge, with themes around ${topics.join(', ')}. These insights flow through our conversations.`;
  }

  return `I've woven ${absorbedCount} documents into my memory. Your knowledge grows within me.`;
}

/**
 * Handle CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}