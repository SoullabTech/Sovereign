/**
 * GET /api/shift/reflection
 * 
 * Returns the ritual reflection form for embodied, 
 * poetic self-assessment in retreat/ceremony contexts.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { generateRitualReflectionForm } from '../../../../backend/src/content/SHIFtRitualReflection';

// Stub function
function generateRitualReflectionForm() {
  return {
    opening: 'Welcome to the ritual reflection',
    prompts: [],
    closing: 'Thank you for your reflection',
    instructions: 'Please reflect deeply',
    metadata: {
      version: '1.0.0',
      created: new Date().toISOString()
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeMetadata = searchParams.get('metadata') === 'true';
    const format = searchParams.get('format') || 'complete'; // 'complete' | 'prompts-only'
    
    const reflectionForm = generateRitualReflectionForm();
    
    let response;
    
    if (format === 'prompts-only') {
      response = {
        prompts: reflectionForm.prompts,
        ...(includeMetadata && { metadata: reflectionForm.metadata })
      };
    } else {
      response = {
        opening: reflectionForm.opening,
        prompts: reflectionForm.prompts,
        closing: reflectionForm.closing,
        ...(includeMetadata && { metadata: reflectionForm.metadata })
      };
    }
    
    // Return with cache headers
    const res = NextResponse.json(response);
    res.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.headers.set('Content-Type', 'application/json');
    
    return res;
    
  } catch (error) {
    console.error('Error in /api/shift/reflection:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}