import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        api: 'operational',
        database: checkDatabase(),
        ai: checkAIServices(),
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

function checkDatabase(): string {
  // Check if Supabase env vars are set
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return 'configured';
  }
  return 'not configured';
}

function checkAIServices(): string {
  // Check if AI service keys are configured
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  
  if (hasOpenAI && hasElevenLabs) {
    return 'configured';
  } else if (hasOpenAI || hasElevenLabs) {
    return 'partial';
  }
  return 'not configured';
}
