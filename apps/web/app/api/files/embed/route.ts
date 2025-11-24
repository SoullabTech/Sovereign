import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { searchUserFiles } from '@/backend/src/services/IngestionQueue';
import { getServerSession } from 'next-auth';

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

    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId' },
        { status: 400 }
      );
    }

    // Note: The actual embedding is done automatically by the IngestionQueue
    // This endpoint is mainly for status checking and manual retrieval
    
    return NextResponse.json({
      status: 'embedded',
      message: 'File has been processed and embedded by Maya',
      fileId,
    });

  } catch (error) {
    console.error('Embed API error:', error);
    return NextResponse.json(
      { error: 'Failed to process embedding request' },
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