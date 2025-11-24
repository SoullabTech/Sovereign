import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { AfferentStream } from '@/lib/ain/AfferentStreamGenerator';
import { streamStore } from '@/lib/ain/StreamStore';

interface StreamSubmission {
  userId: string;
  stream: AfferentStream;
}

export async function POST(req: NextRequest) {
  try {
    const body: StreamSubmission = await req.json();
    const { userId, stream } = body;

    if (!userId || !stream) {
      return NextResponse.json(
        { error: 'Missing userId or stream' },
        { status: 400 }
      );
    }

    streamStore.addStream(userId, stream);

    return NextResponse.json({
      success: true,
      streamCount: streamStore.getStreams(userId).length,
      message: 'Stream submitted to collective field',
    });
  } catch (error: any) {
    console.error('Stream submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit stream' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const userStreams = streamStore.getStreams(userId);

    return NextResponse.json({
      streams: userStreams,
      count: userStreams.length,
    });
  } catch (error: any) {
    console.error('Stream retrieval error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve streams' },
      { status: 500 }
    );
  }
}