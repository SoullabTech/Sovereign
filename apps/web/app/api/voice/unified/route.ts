import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Stub voice router
const voiceRouter = {
  handleVoiceInput: async (data: any) => ({ 
    success: false, 
    message: 'Voice routing not available in beta'
  }),
  synthesize: async (data: any) => ({
    success: false,
    error: 'TTS service not available in stub mode',
    fallbackUsed: true
  })
};
// Temporarily stub out backend imports that are excluded from build
// import { voiceRouter } from '../../../../backend/src/services/VoiceRouter';

/**
 * Unified Voice API - Sesame-Primary with Explicit Fallback
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      text, 
      element, 
      voiceEngine = 'auto',
      useCSM = true,
      fallbackEnabled = false,
      contextSegments,
      userId,
      sessionId,
      testMode = false
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // For test mode, use a minimal text to reduce processing time
    const testText = testMode ? '.' : text;

    // Route through VoiceRouter
    const result = await voiceRouter.synthesize({
      text: testText,
      element,
      voiceEngine,
      useCSM,
      contextSegments,
      userId,
      sessionId,
      fallbackEnabled,
      testMode
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error,
        engine: result.engine,
        fallbackUsed: result.fallbackUsed || false,
        testMode
      }, { status: 500 });
    }

    // For test mode, return minimal response without audio data
    if (testMode) {
      return NextResponse.json({
        success: true,
        testMode: true,
        engine: result.engine,
        model: result.model,
        processingTimeMs: result.processingTimeMs,
        fallbackUsed: result.fallbackUsed || false,
        fallbackReason: result.fallbackReason,
        metadata: result.metadata
      });
    }

    // Return audio data
    if (result.audioBuffer) {
      // Convert buffer to base64 for JSON response
      const audioBase64 = result.audioBuffer.toString('base64');
      return NextResponse.json({
        success: true,
        audioData: audioBase64,
        format: 'wav',
        engine: result.engine,
        model: result.model,
        processingTimeMs: result.processingTimeMs,
        fallbackUsed: result.fallbackUsed || false,
        metadata: result.metadata
      });
    } else if (result.audioUrl) {
      return NextResponse.json({
        success: true,
        audioUrl: result.audioUrl,
        engine: result.engine,
        model: result.model,
        processingTimeMs: result.processingTimeMs,
        fallbackUsed: result.fallbackUsed || false,
        metadata: result.metadata
      });
    } else {
      return NextResponse.json({ 
        error: 'No audio generated',
        engine: result.engine
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Voice API error:', error);
    return NextResponse.json({ 
      error: 'Voice synthesis failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  // Status endpoint
  const status = voiceRouter.getStatus();
  return NextResponse.json({
    status: 'online',
    voiceRouter: status,
    timestamp: new Date().toISOString()
  });
}
