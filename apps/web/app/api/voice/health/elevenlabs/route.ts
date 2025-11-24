import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const baseUrl = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key missing', healthy: false },
        { status: 503 }
      );
    }

    // Test ElevenLabs API by checking available voices
    const response = await fetch(`${baseUrl}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const healthy = response.ok;

    let data = null;
    if (healthy) {
      data = await response.json();
    }

    return NextResponse.json({
      healthy,
      status: response.status,
      engine: 'elevenlabs',
      voiceCount: data?.voices?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ElevenLabs health check failed:', error);
    return NextResponse.json(
      { 
        healthy: false, 
        error: 'Health check failed',
        engine: 'elevenlabs',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}