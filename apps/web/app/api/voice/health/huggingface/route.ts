import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.SESAME_FALLBACK_API_KEY;
    const url = process.env.SESAME_FALLBACK_URL;

    if (!apiKey || !url) {
      return NextResponse.json(
        { error: 'HuggingFace configuration missing', healthy: false },
        { status: 503 }
      );
    }

    // Test HuggingFace API with a minimal request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'test',
        options: {
          wait_for_model: false,
          use_cache: true
        }
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const healthy = response.ok || response.status === 503; // 503 means model loading, which is still "healthy"

    return NextResponse.json({
      healthy,
      status: response.status,
      engine: 'huggingface',
      model: 'facebook/blenderbot-1B-distill',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('HuggingFace health check failed:', error);
    return NextResponse.json(
      { 
        healthy: false, 
        error: 'Health check failed',
        engine: 'huggingface',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}