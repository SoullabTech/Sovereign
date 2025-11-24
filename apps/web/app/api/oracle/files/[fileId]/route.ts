import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { getServerAuth } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/oracle/files/[fileId]
 * Returns detailed information about a specific file
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileId } = params;
    const userId = session.user.email || "anonymous";

    // Fetch file details from Supabase
    const { data: file, error } = await supabase
      .from('user_files')
      .select('*')
      .eq('id', fileId)
      .eq('userId', userId)
      .single();

    if (error || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Determine detailed status
    let status: string;
    let statusMessage: string;

    if (file.content && file.embedding) {
      status = 'absorbed';
      statusMessage = 'File has been fully processed and absorbed into memory';
    } else if (file.content && !file.embedding) {
      status = 'processing';
      statusMessage = 'Content extracted, generating embeddings...';
    } else {
      status = 'processing';
      statusMessage = 'Extracting content from file...';
    }

    // Calculate processing metrics
    const uploadTime = file.createdAt;
    const lastUpdate = file.updatedAt;
    const processingTime = lastUpdate.getTime() - uploadTime.getTime();

    return NextResponse.json({
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      status,
      statusMessage,
      uploadedAt: file.createdAt.toISOString(),
      lastUpdatedAt: file.updatedAt.toISOString(),
      processingTime: status === 'absorbed' ? processingTime : undefined,
      content: {
        preview: file.content ? file.content.substring(0, 500) + '...' : null,
        summary: file.summary,
        keyTopics: file.keyTopics || [],
        emotionalTone: file.emotionalTone,
        elementalResonance: file.elementalResonance,
        wordCount: file.content ? file.content.split(' ').length : 0,
        chunkCount: file.content ? Math.ceil(file.content.length / 1000) : 0
      },
      metadata: file.metadata,
      maya: {
        reflection: generateMayaFileReflection(file)
      }
    });

  } catch (error) {
    console.error('File details fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch file details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/oracle/files/[fileId]
 * Removes file and all associated data
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileId } = params;
    const userId = session.user.email || "anonymous";

    // First, verify the file belongs to the user
    const { data: file, error: fetchError } = await supabase
      .from('user_files')
      .select('*')
      .eq('id', fileId)
      .eq('userId', userId)
      .single();

    if (fetchError || !file) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      );
    }

    // Delete from Supabase storage
    if (file.filePath) {
      try {
        const { error: storageError } = await supabase.storage
          .from('user-files')
          .remove([file.filePath]);

        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
          // Continue with database deletion even if storage fails
        }
      } catch (storageError) {
        console.warn('Storage deletion error:', storageError);
      }
    }

    // Delete from database (this will also clean up related records)
    const { error: deleteError } = await supabase
      .from('user_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      console.error('[FileDelete] Database delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete file from database' },
        { status: 500 }
      );
    }


    return NextResponse.json({
      message: 'File successfully removed from Maya\'s memory',
      fileName: file.fileName,
      deletedAt: new Date().toISOString(),
      maya: {
        reflection: `I've released ${file.fileName} from my memory. Its patterns no longer influence our conversations.`
      }
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/oracle/files/[fileId]
 * Update file metadata (tags, notes, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileId } = params;
    const userId = session.user.email || "anonymous";
    const body = await req.json();

    // Validate update data
    const allowedFields = ['tags', 'notes', 'visibility'];
    const updates: any = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update file metadata
    const { data: updatedFile, error: updateError } = await supabase
      .from('user_files')
      .update({
        metadata: {
          // Merge with existing metadata
          ...(updates.metadata || {}),
          updatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      })
      .eq('id', fileId)
      .eq('userId', userId)
      .select()
      .single();

    if (updateError || !updatedFile) {
      return NextResponse.json(
        { error: 'Failed to update file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'File metadata updated',
      fileName: updatedFile.fileName || updatedFile.filename,
      updatedFields: Object.keys(updates),
      updatedAt: updatedFile.updatedAt || new Date().toISOString()
    });

  } catch (error) {
    console.error('File update error:', error);
    
    // Handle not found case
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to update file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate Maya's reflection on a specific file
 */
function generateMayaFileReflection(file: any): string {
  if (!file.content) {
    return "I'm still absorbing this document, feeling its patterns and themes.";
  }

  const wordCount = file.content.split(' ').length;
  const hasTopics = file.keyTopics && file.keyTopics.length > 0;
  const tone = file.emotionalTone || 'contemplative';

  let reflection = `I've absorbed ${wordCount} words from this ${file.fileType.replace('application/', '')}`;
  
  if (hasTopics) {
    reflection += `, discovering themes around ${file.keyTopics.slice(0, 2).join(' and ')}`;
  }

  reflection += `. The tone feels ${tone} to me`;

  if (file.summary) {
    reflection += `, carrying insights about ${file.summary.toLowerCase()}`;
  }

  reflection += '. These patterns now live within our shared understanding.';

  return reflection;
}

/**
 * Handle CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}