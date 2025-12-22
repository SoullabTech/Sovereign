import { NextRequest, NextResponse } from 'next/server';

const EMERGENCE_SERVICE_URL = process.env.EMERGENCE_SERVICE_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    const url = new URL(`${EMERGENCE_SERVICE_URL}/api/emergence/dashboard`);
    if (userId) {
      url.searchParams.set('user_id', userId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Dashboard fetch error:', error);
      throw new Error(`Dashboard fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Dashboard fetch failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch emergence dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
