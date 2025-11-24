import { getServerSession } from 'next-auth';
/**
 * File Status API - Track processing progress for frontend
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@supabase/supabase-js';
import { getServerAuth } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
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

    // Get file status and processing info
    const { data, error } = await supabase
      .from('user_files')
      .select(`
        id,
        filename,
        original_name,
        status,
        processing_notes,
        total_chunks,
        total_tokens,
        text_preview,
        created_at,
        updated_at,
        processed_at
      `)
      .eq('id', fileId)
      .eq('user_id', session.user.email)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Calculate processing progress
    let progress = 0;
    let progressMessage = '';

    switch (data.status) {
      case 'processing':
        if (data.processing_notes?.includes('Extracting text')) {
          progress = 25;
          progressMessage = 'Maya is reading your file...';
        } else if (data.processing_notes?.includes('Creating memory chunks')) {
          progress = 50;
          progressMessage = 'Creating memory chunks...';
        } else if (data.processing_notes?.includes('Generating embeddings')) {
          progress = 75;
          progressMessage = 'Weaving into memory system...';
        } else if (data.processing_notes?.includes('Storing')) {
          progress = 90;
          progressMessage = 'Almost complete...';
        } else {
          progress = 10;
          progressMessage = 'Processing started...';
        }
        break;
      
      case 'completed':
        progress = 100;
        progressMessage = `Successfully integrated! ${data.total_chunks} memory chunks created.`;
        break;
      
      case 'error':
        progress = 0;
        progressMessage = data.processing_notes || 'Processing failed';
        break;
      
      default:
        progress = 0;
        progressMessage = 'Unknown status';
    }

    return NextResponse.json({
      success: true,
      file: {
        id: data.id,
        filename: data.filename,
        originalName: data.original_name,
        status: data.status,
        progress,
        progressMessage,
        totalChunks: data.total_chunks || 0,
        totalTokens: data.total_tokens || 0,
        textPreview: data.text_preview,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        processedAt: data.processed_at,
      }
    });

  } catch (error) {
    console.error('File status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all files for a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_files')
      .select(`
        id,
        filename,
        original_name,
        status,
        category,
        tags,
        total_chunks,
        total_tokens,
        text_preview,
        created_at,
        processed_at
      `)
      .eq('user_id', session.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user files:', error);
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    // Calculate stats
    const stats = {
      total: data.length,
      completed: data.filter(f => f.status === 'completed').length,
      processing: data.filter(f => f.status === 'processing').length,
      error: data.filter(f => f.status === 'error').length,
      totalChunks: data.reduce((sum, f) => sum + (f.total_chunks || 0), 0),
      totalTokens: data.reduce((sum, f) => sum + (f.total_tokens || 0), 0),
    };

    return NextResponse.json({
      success: true,
      files: data,
      stats
    });

  } catch (error) {
    console.error('Files list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}