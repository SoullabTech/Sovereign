/**
 * API endpoint for Oracle System Readiness Check
 * 
 * Provides programmatic access to the readiness dashboard for visual interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { runReadinessCheck } from '../../../backend/src/tools/readinessDashboard';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'api_readiness_test';
    
    console.log('🧪 Starting API readiness check for user:', userId);
    
    const result = await runReadinessCheck(userId);
    
    return NextResponse.json(result, { 
      status: result.systemReady ? 200 : 206 // 206 = Partial Content (system issues)
    });
    
  } catch (error) {
    console.error('❌ Readiness check API error:', error);
    
    return NextResponse.json(
      {
        error: 'Readiness check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        systemReady: false,
        overallScore: 0,
        criticalFailures: ['API execution failed']
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AIN Oracle Readiness Check API',
    usage: 'POST to this endpoint with { "userId": "test_user" } to run readiness check',
    endpoints: {
      readinessCheck: 'POST /api/readiness-check',
      dashboard: 'GET /readiness-dashboard'
    }
  });
}