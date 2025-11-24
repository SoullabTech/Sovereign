import { getServerSession } from 'next-auth';
/**
 * File Management API - Delete, reprocess, and manage files
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@supabase/supabase-js';
import { getServerAuth } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'fileId parameter required' }, { status: 400 });
    }

    // Get file details for cleanup
    const { data: file, error: fetchError } = await supabase
      .from('user_files')
      .select('id, storage_path')
      .eq('id', fileId)
      .eq('user_id', session.user.email)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from storage
    if (file.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('maya-files')
        .remove([file.storage_path]);

      if (storageError) {
        console.error('Failed to delete from storage:', storageError);
        // Continue with database deletion even if storage fails
      }
    }

    // Delete embeddings (cascade should handle this, but being explicit)
    const { error: embeddingError } = await supabase
      .from('file_embeddings')
      .delete()
      .eq('file_id', fileId);

    if (embeddingError) {
      console.error('Failed to delete embeddings:', embeddingError);
    }

    // Delete file record
    const { error: deleteError } = await supabase
      .from('user_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', session.user.email);

    if (deleteError) {
      console.error('Failed to delete file record:', deleteError);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { action, fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId required' }, { status: 400 });
    }

    switch (action) {
      case 'reprocess':
        return await reprocessFile(fileId, session.user.email);
      
      case 'update_metadata':
        const { metadata } = await request.json();
        return await updateFileMetadata(fileId, session.user.email, metadata);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('File management error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function reprocessFile(fileId: string, userId: string) {
  // Get file details
  const { data: file, error: fetchError } = await supabase
    .from('user_files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Delete existing embeddings
  const { error: deleteEmbeddingsError } = await supabase
    .from('file_embeddings')
    .delete()
    .eq('file_id', fileId);

  if (deleteEmbeddingsError) {
    console.error('Failed to delete existing embeddings:', deleteEmbeddingsError);
  }

  // Reset file status to processing
  const { error: updateError } = await supabase
    .from('user_files')
    .update({
      status: 'processing',
      processing_notes: 'Reprocessing file...',
      total_chunks: 0,
      total_tokens: 0,
      text_preview: null,
      processed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fileId);

  if (updateError) {
    console.error('Failed to reset file status:', updateError);
    return NextResponse.json({ error: 'Failed to start reprocessing' }, { status: 500 });
  }

  // Trigger reprocessing
  try {
    const processingUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/oracle/files/process`;
    
    fetch(processingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        userId,
        mimeType: file.mime_type,
        storagePath: file.storage_path,
      }),
    }).catch(error => {
      console.error('Failed to trigger reprocessing:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'File reprocessing started',
      fileId,
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger reprocessing' }, { status: 500 });
  }
}

async function updateFileMetadata(fileId: string, userId: string, metadata: any) {
  const { error } = await supabase
    .from('user_files')
    .update({
      category: metadata.category,
      tags: metadata.tags || [],
      emotional_weight: metadata.emotionalWeight || 0.5,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fileId)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update metadata:', error);
    return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'File metadata updated',
  });
}