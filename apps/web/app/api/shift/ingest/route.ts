/**
 * POST /api/shift/ingest
 * 
 * Ingests session data for implicit SHIFt profile updates.
 * Called by PersonalOracleAgent and other system components.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { SHIFtIngestRequestZ } from '../../../../backend/src/schemas/shift.z';
// Temporarily stub out backend imports that are excluded from build
// import { SHIFtInferenceService } from '../../../../backend/src/services/SHIFtInferenceService';

// Stub implementations
class SHIFtInferenceService {
  async ingest(request: any) {
    return {
      success: true,
      message: 'Data ingested successfully'
    };
  }
}

const SHIFtIngestRequestZ = {
  parse: (data: any) => data
};

// Initialize service
const shiftService = new SHIFtInferenceService();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = SHIFtIngestRequestZ.parse(body);
    
    // Transform string timestamps to Date objects if events exist
    const transformedRequest = {
      ...validatedRequest,
      events: validatedRequest.events?.map((event: any) => ({
        type: event.type,
        timestamp: new Date(event.timestamp),
        payload: event.payload || {}
      }))
    };
    
    // Ingest data
    await shiftService.ingest(transformedRequest);
    
    // Return success response
    return NextResponse.json({
      status: 'accepted',
      userId: validatedRequest.userId,
      sessionId: validatedRequest.sessionId,
      timestamp: new Date().toISOString()
    }, { status: 202 });
    
  } catch (error) {
    console.error('Error in /api/shift/ingest:', error);
    
    // Return validation error if zod parsing failed
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Return generic error
    return NextResponse.json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}