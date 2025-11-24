import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@supabase/supabase-js';
import { getServerAuth } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Get user from auth
    const { userId, userEmail } = getServerAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { fileId } = params;


    // Get file info first to verify ownership and get storage path
    const { data: file, error: fileError } = await supabase
      .from('user_files')
      .select('storage_path, filename, status')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fileError || !file) {
      console.error('File not found or access denied:', fileError);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Begin cleanup process
    const cleanupErrors: string[] = [];

    // 1. Delete file from storage
    if (file.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('maya-files')
        .remove([file.storage_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        cleanupErrors.push(`Storage: ${storageError.message}`);
      } else {
      }
    }

    // 2. Delete file embeddings (foreign key constraint requires this first)
    const { error: embeddingsError } = await supabase
      .from('file_embeddings')
      .delete()
      .eq('file_id', fileId);

    if (embeddingsError) {
      console.error('Embeddings deletion error:', embeddingsError);
      cleanupErrors.push(`Embeddings: ${embeddingsError.message}`);
    } else {
    }

    // 3. Delete file citations
    const { error: citationsError } = await supabase
      .from('file_citations')
      .delete()
      .eq('file_id', fileId);

    if (citationsError) {
      console.error('Citations deletion error:', citationsError);
      cleanupErrors.push(`Citations: ${citationsError.message}`);
    } else {
    }

    // 4. Delete file record
    const { error: deleteError } = await supabase
      .from('user_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('File record deletion error:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete file record',
        details: deleteError.message
      }, { status: 500 });
    }


    // Return success with any cleanup warnings
    const response: {
      success: boolean;
      fileId: string;
      filename: any;
      message: string;
      warnings?: string[];
    } = {
      success: true,
      fileId,
      filename: file.filename,
      message: 'File removed from Maya\'s memory'
    };

    if (cleanupErrors.length > 0) {
      response.warnings = cleanupErrors;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('[FileDelete] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}