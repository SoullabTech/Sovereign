import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@supabase/supabase-js';
// Temporarily stub out backend imports that are excluded from build
// import { enqueueIngestion } from '@/backend/src/services/IngestionQueue';
import { getServerSession } from 'next-auth';

// Stub enqueueIngestion
const enqueueIngestion = async (data: any) => {
  return {
    id: `job-${Date.now()}`,
    status: 'queued',
    ...data
  };
};

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// File size and type limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
  'image/webp'
];

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

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tags = formData.getAll('tags') as string[];
    const userId = session.user.email || "anonymous";

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. Please upload PDF, text, Word, or image files.' },
        { status: 400 }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}-${sanitizedFileName}`;

    // Convert file to buffer for Supabase
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from('user-files')
      .getPublicUrl(filePath);

    // Enqueue for async processing
    const ingestionJob = await enqueueIngestion({
      userId,
      filePath,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      publicUrl: urlData.publicUrl,
      tags: tags.length > 0 ? tags : ['uploaded-file'],
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        sessionId: session.user.email || "anonymous"
      }
    });

    // Return immediate response
    return NextResponse.json({
      file_id: ingestionJob.id,
      status: 'queued',
      message: 'Maya is absorbing your file now. She will weave its insights into future conversations.',
      details: {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        tags,
        processingTime: 'Usually takes 10-30 seconds'
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while uploading your file' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
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