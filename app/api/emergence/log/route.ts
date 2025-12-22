import { NextRequest, NextResponse } from 'next/server';

const EMERGENCE_SERVICE_URL = process.env.EMERGENCE_SERVICE_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy to Python emergence service
    const response = await fetch(`${EMERGENCE_SERVICE_URL}/api/emergence/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: body.event_type,
        event_data: body.event_data,
        context: body.context || {},
        user_id: body.user_id || null,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Emergence service error:', error);
      throw new Error(`Emergence service error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Emergence logging failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to log emergence event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
