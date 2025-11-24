/**
 * Error Logging API - MAIA Sovereign Consciousness
 * Handles frontend error logging for debugging
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
interface ErrorLogRequest {
  error: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ErrorLogRequest = await request.json();
    const { error, stack, userAgent, url, timestamp, userId } = body;

    // Log error to console for development
    console.error('🚨 Frontend Error:', {
      error,
      stack,
      userAgent,
      url,
      timestamp: timestamp || new Date().toISOString(),
      userId
    });

    // In production, you might want to send to error tracking service
    // like Sentry, LogRocket, etc.

    return NextResponse.json({
      status: 'logged',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error logging failed:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Error logging endpoint online',
    timestamp: new Date().toISOString()
  });
}