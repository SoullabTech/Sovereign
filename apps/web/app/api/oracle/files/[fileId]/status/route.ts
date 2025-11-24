import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.email || "anonymous";
    const { fileId } = params;

    // Get file record
    const { data: file, error: fileError } = await supabase
      .from('user_files')
      .select(`
        id,
        filename,
        status,
        error_message,
        processing_started_at,
        processing_completed_at,
        created_at
      `)
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Calculate progress based on status and time
    let progress = 0;
    if (file.status === 'processing') {
      if (file.processing_started_at) {
        const elapsed = Date.now() - new Date(file.processing_started_at).getTime();
        const estimatedTotal = 60000; // 60 seconds estimated
        progress = Math.min(90, Math.floor((elapsed / estimatedTotal) * 100));
      } else {
        progress = 10; // Just started
      }
    } else if (file.status === 'ready') {
      progress = 100;
    } else if (file.status === 'failed') {
      progress = 0;
    }

    // Get embedding count if ready
    let embeddingCount;
    let mayaReflection;

    if (file.status === 'ready') {
      const { count } = await supabase
        .from('file_embeddings')
        .select('*', { count: 'exact' })
        .eq('file_id', fileId);
      
      embeddingCount = count || 0;

      // Get Maya's reflection if available
      const { data: reflectionData } = await supabase
        .from('user_files')
        .select('maya_reflection')
        .eq('id', fileId)
        .single();
      
      mayaReflection = reflectionData?.maya_reflection;
    }

    const response = {
      fileId,
      status: file.status,
      progress,
      filename: file.filename,
      embeddingCount,
      mayaReflection,
      error: file.error_message,
      processingStarted: file.processing_started_at,
      completedAt: file.processing_completed_at,
      uploadedAt: file.created_at
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('File status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}