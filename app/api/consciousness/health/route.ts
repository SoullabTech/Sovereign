import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker container health monitoring
 * Returns 200 OK if the service is healthy
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'maia-sovereign',
    timestamp: new Date().toISOString()
  });
}

export const runtime = 'nodejs';
