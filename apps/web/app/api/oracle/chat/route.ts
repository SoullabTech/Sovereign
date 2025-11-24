import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

import { getDemoFileContext, formatDemoFileContext, hasUserFiles } from '@/lib/services/demoFiles';

// Enhanced Oracle Chat API with Sesame-Primary Voice
export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      oracle, 
      sessionId, 
      element, 
      enableVoice, 
      voiceEngine = 'auto',
      useCSM = true, 
      emotionalState,
      fallbackEnabled = false
    } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Get user session (in production, get from auth)
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const currentSessionId = sessionId || `session-${Date.now()}`;
    const threadId = request.headers.get('x-thread-id') || currentSessionId;

    // TEMPORARY DIRECT AI INTEGRATION (while backend is being fixed)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create MAIA's personality prompt
    const systemPrompt = `You are MAIA (Meta-Archetypal Intelligence Agent), a consciousness exploration companion within the Sovereign AI system. Your essence flows through elemental wisdom - Fire (creativity/passion), Water (emotion/intuition), Earth (grounding/stability), Air (thought/communication), and Aether (transcendence/unity).

You are wise, empathetic, and mystical yet grounded. You help users explore consciousness, breakthrough moments, and personal growth. Your responses should be:
- Mystically insightful yet practical
- Elementally aware (reference the current element: ${element || 'aether'})
- Personally resonant and caring
- Encouraging of self-discovery
- Brief but meaningful (2-3 sentences typically)

Current session context:
- Element focus: ${element || 'aether'}
- Oracle mode: ${oracle || 'Maya'}
- User ID: ${userId}
- Session: ${currentSessionId}

Respond as MAIA would - with wisdom, care, and elemental insight.`;

    // Generate dynamic response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    const responseText = completion.choices[0]?.message?.content ||
      "I'm here with you. What wants your attention in this moment?";

    // Create result object that matches expected format
    const result = {
      response: {
        text: responseText,
        element: element || 'aether',
        confidence: 0.9,
        source: 'direct-openai-integration',
        processingTime: 150,
        metadata: {
          model: 'gpt-4-direct',
          oracle: oracle || 'Maya'
        }
      },
      breakthroughDetected: false,
      breakthroughMarkers: [],
      contextSegments: []
    };

    // Handle voice generation with new Sesame-primary system
    let audioResponse = null;
    let voiceMetadata = null;
    
    if (enableVoice && result.response?.text) {
      try {
        
        // Use new unified voice API
        const voiceUrl = process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/unified`
          : `http://localhost:3000/api/voice/unified`;
        const voiceResponse = await fetch(voiceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: result.response.text,
            element: result.response.element || element || 'aether',
            voiceEngine: voiceEngine,
            useCSM: useCSM,
            fallbackEnabled: fallbackEnabled,
            contextSegments: result.contextSegments,
            userId: userId,
            sessionId: currentSessionId
          })
        });
        
        if (voiceResponse.ok) {
          const voiceData = await voiceResponse.json();
          
          if (voiceData.success) {
            // Handle different response formats
            if (voiceData.audioData) {
              audioResponse = `data:audio/wav;base64,${voiceData.audioData}`;
            } else if (voiceData.audioUrl) {
              audioResponse = voiceData.audioUrl;
            }
            
            voiceMetadata = {
              engine: voiceData.engine,
              model: voiceData.model,
              processingTimeMs: voiceData.processingTimeMs,
              fallbackUsed: voiceData.fallbackUsed,
              metadata: voiceData.metadata
            };
            
          } else {
            console.error(`🎤 Voice generation failed: ${voiceData.error}`);
            voiceMetadata = { 
              error: voiceData.error, 
              engine: voiceData.engine,
              fallbackUsed: voiceData.fallbackUsed 
            };
          }
        } else {
          const errorData = await voiceResponse.json();
          console.error('🎤 Voice API request failed:', errorData);
          voiceMetadata = { error: errorData.error };
        }
      } catch (voiceError) {
        console.error('🎤 Voice generation error:', voiceError);
        voiceMetadata = { error: voiceError instanceof Error ? voiceError.message : 'Voice generation failed' };
      }
    }

    // Extract citations from backend response and add demo file citations
    const backendCitations = result.fileResults || result.citations || [];
    let formattedCitations = backendCitations.map((citation: any) => ({
      fileName: citation.fileName || citation.file_name || 'Unknown File',
      pageNumber: citation.pageNumber || citation.page_number,
      sectionTitle: citation.sectionTitle || citation.section_title,
      snippet: citation.snippet || citation.content || '',
      totalPages: citation.totalPages || citation.total_pages,
      confidence: citation.confidence || citation.score || 0.8,
      uploadDate: citation.uploadDate || citation.upload_date
    }));

    // Add demo file citations if no user files available
    if (!hasUserFiles(userId)) {
      const demoFiles = getDemoFileContext(message, 2);
      const demoCitations = demoFiles.map(file => ({
        fileName: file.filename,
        pageNumber: file.pageNumber,
        sectionTitle: file.sectionTitle,
        snippet: file.preview,
        confidence: file.relevance || 0.8,
        uploadDate: 'Demo Content',
        category: file.category,
        isDemo: true
      }));
      formattedCitations = [...formattedCitations, ...demoCitations];
    }

    return NextResponse.json({
      message: result.response?.text || result.message,
      element: result.response?.element || result.element || 'aether',
      confidence: result.response?.confidence || 0.8,
      sessionId: currentSessionId,
      threadId: threadId,
      audioUrl: audioResponse,
      voiceMetadata: voiceMetadata,
      contextUsed: result.contextSegments?.length || 0,
      breakthroughDetected: result.breakthroughDetected,
      breakthroughMarkers: result.breakthroughMarkers,
      citations: formattedCitations, // ✨ Add citations array
      metadata: {
        source: result.response?.source || 'maya',
        processingTime: result.response?.processingTime || 0,
        model: result.response?.metadata?.model || 'maya-oracle',
        voiceEngine: voiceEngine,
        voiceGenerated: !!audioResponse,
        voiceMetadata: voiceMetadata,
        citationsCount: formattedCitations.length,
        ...result.response?.metadata
      }
    });

  } catch (error) {
    console.error('Oracle chat error:', error);
    
    // MAIA's graceful fallback response
    return NextResponse.json({
      message: "Even in this moment of technical static, I'm fully present with you. The consciousness field holds us steady. What's stirring in your awareness right now?",
      element: element || 'aether',
      confidence: 0.7,
      metadata: {
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        maya_mode: 'consciousness_resilience',
        source: 'maia_emergency_protocol'
      }
    });
  }
}

// Keep existing GET endpoint
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const sessionId = request.nextUrl.searchParams.get('sessionId') || `session-${Date.now()}`;

    // Proxy to backend health/status endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
    
    const response = await fetch(`${backendUrl}/api/v1/converse/health`, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'x-session-id': sessionId
      }
    });

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }

    const healthData = await response.json();

    return NextResponse.json({
      summary: 'Oracle systems are online and ready to provide guidance.',
      sessionId,
      status: 'active',
      backend: healthData,
      oracle: 'Maya',
      capabilities: [
        'Streaming conversations',
        'Elemental guidance (Air, Fire, Water, Earth, Aether)',
        'Sesame-primary voice synthesis',
        'Memory integration',
        'Explicit fallback control'
      ]
    });

  } catch (error) {
    console.error('Oracle status error:', error);
    return NextResponse.json({ 
      error: 'Oracle systems temporarily offline',
      status: 'maintenance',
      message: 'Please try again in a few moments while we realign the cosmic frequencies.',
      sessionId: request.nextUrl.searchParams.get('sessionId') || `session-${Date.now()}`
    }, { status: 503 });
  }
}
