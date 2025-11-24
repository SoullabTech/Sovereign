import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@supabase/supabase-js';
import { getServerAuth } from '@/lib/auth';
import { getServerSession } from 'next-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BulkDeleteRequest {
  fileIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.email;
    const { fileIds }: BulkDeleteRequest = await request.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ 
        error: 'fileIds array is required' 
      }, { status: 400 });
    }

    if (fileIds.length > 50) {
      return NextResponse.json({ 
        error: 'Cannot delete more than 50 files at once' 
      }, { status: 400 });
    }


    // Get all files to verify ownership and get storage paths
    const { data: files, error: filesError } = await supabase
      .from('user_files')
      .select('id, storage_path, filename, status')
      .in('id', fileIds)
      .eq('user_id', userId);

    if (filesError) {
      console.error('Failed to fetch files for deletion:', filesError);
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files found or access denied' }, { status: 404 });
    }

    const results = {
      successful: [] as string[],
      failed: [] as { fileId: string; filename: string; error: string }[],
      warnings: [] as string[]
    };

    // Process each file
    for (const file of files) {
      try {
        // Delete from storage
        if (file.storage_path) {
          const { error: storageError } = await supabase.storage
            .from('maya-files')
            .remove([file.storage_path]);

          if (storageError) {
            results.warnings.push(`Storage cleanup failed for ${file.filename}: ${storageError.message}`);
          }
        }

        // Delete embeddings
        const { error: embeddingsError } = await supabase
          .from('file_embeddings')
          .delete()
          .eq('file_id', file.id);

        if (embeddingsError) {
          results.warnings.push(`Embeddings cleanup failed for ${file.filename}: ${embeddingsError.message}`);
        }

        // Delete citations
        const { error: citationsError } = await supabase
          .from('file_citations')
          .delete()
          .eq('file_id', file.id);

        if (citationsError) {
          results.warnings.push(`Citations cleanup failed for ${file.filename}: ${citationsError.message}`);
        }

        // Delete file record
        const { error: deleteError } = await supabase
          .from('user_files')
          .delete()
          .eq('id', file.id)
          .eq('user_id', userId);

        if (deleteError) {
          results.failed.push({
            fileId: file.id,
            filename: file.filename,
            error: deleteError.message
          });
        } else {
          results.successful.push(file.id);
        }

      } catch (error) {
        results.failed.push({
          fileId: file.id,
          filename: file.filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }


    return NextResponse.json({
      success: true,
      deleted: results.successful.length,
      failed: results.failed.length,
      results,
      message: `Deleted ${results.successful.length} of ${fileIds.length} files from Maya's memory`
    });

  } catch (error) {
    console.error('[BulkDelete] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}