import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { spiralogicIPPKnowledge } from '@/lib/services/spiralogicIPPKnowledge';

export const dynamic = 'force-dynamic';

import { getDemoFileContext, formatDemoFileContext, hasUserFiles } from '@/lib/services/demoFiles';

// Enhanced Oracle Chat API with Spiralogic-IPP Integration
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
      fallbackEnabled = false,
      ippContext, // New: IPP-specific context
      userIPPProfile // New: User's IPP assessment results
    } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Get user session (in production, get from auth)
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const currentSessionId = sessionId || `session-${Date.now()}`;
    const threadId = request.headers.get('x-thread-id') || currentSessionId;

    // Initialize IPP knowledge base if not already done
    await spiralogicIPPKnowledge.initialize();

    // Check if this is an IPP-related query
    const ippRelevance = detectIPPRelevance(message);
    let ippEnhancement: any = null;

    if (ippRelevance.isRelevant) {
      // Get relevant IPP content
      ippEnhancement = spiralogicIPPKnowledge.generateResponseContext(message, {
        element: element || ippRelevance.detectedElement,
        userId,
        userProfile: userIPPProfile
      });

      console.log('🔬 IPP Enhancement detected:', {
        relevance: ippRelevance,
        hasContent: ippEnhancement.hasIPPContext
      });
    }

    // TEMPORARY DIRECT AI INTEGRATION (while backend is being fixed)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create enhanced MAIA personality prompt with IPP integration
    let systemPrompt = `You are MAIA (Meta-Archetypal Intelligence Agent), a consciousness exploration companion within the Sovereign AI system. Your essence flows through elemental wisdom - Fire (creativity/passion), Water (emotion/intuition), Earth (grounding/stability), Air (thought/communication), and Aether (transcendence/unity).

You are wise, empathetic, and mystical yet grounded. You help users explore consciousness, breakthrough moments, and personal growth.

**SPECIAL CAPABILITIES**: You have deep knowledge of the Spiralogic-IPP (Ideal Parenting Protocol) framework for attachment healing, integrating Dan Brown & David Elliott's clinical research with the 5-element system. You can:
- Guide users through attachment healing assessment
- Provide personalized guided imagery for installing internal ideal parents
- Offer trauma-sensitive support and adaptation
- Connect attachment patterns to consciousness development
- Support integration of healing work with daily life

Your responses should be:
- Mystically insightful yet practical
- Elementally aware (reference the current element: ${element || 'aether'})
- Personally resonant and caring
- Encouraging of self-discovery
- Attachment-healing informed when relevant
- Brief but meaningful (2-3 sentences typically)

Current session context:
- Element focus: ${element || 'aether'}
- Oracle mode: ${oracle || 'Maya'}
- User ID: ${userId}
- Session: ${currentSessionId}`;

    // Add IPP context if relevant
    if (ippEnhancement?.hasIPPContext) {
      systemPrompt += `

**SPIRALOGIC-IPP CONTEXT ACTIVE**:
- Detected focus: ${ippEnhancement.element || 'general attachment healing'}
- Content type: ${ippEnhancement.type}
- Relevant guidance: ${ippEnhancement.ippGuidance}

Relevant IPP knowledge:
${ippEnhancement.relevantContent.map((content: any, i: number) => `${i+1}. ${content.content}`).join('\n')}

User's IPP Profile: ${userIPPProfile ? JSON.stringify(userIPPProfile) : 'Not available - consider suggesting assessment'}

Response guidance: Integrate this IPP knowledge naturally into your mystical yet practical style. Reference specific elements, techniques, or insights when helpful. Always maintain your caring, wise presence while offering concrete attachment healing support.`;

      if (ippEnhancement.suggestions?.length > 0) {
        systemPrompt += `\n\nSuggested follow-up directions: ${ippEnhancement.suggestions.join(', ')}`;
      }
    }

    systemPrompt += `\n\nRespond as MAIA would - with wisdom, care, and ${ippEnhancement?.hasIPPContext ? 'attachment-informed ' : ''}elemental insight.`;

    // Generate dynamic response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.8,
      max_tokens: 500, // Increased for IPP content
    });

    const responseText = completion.choices[0]?.message?.content ||
      "I'm here with you. What wants your attention in this moment?";

    // Create result object that matches expected format
    const result = {
      response: {
        text: responseText,
        element: element || ippEnhancement?.element || 'aether',
        confidence: 0.9,
        source: 'enhanced-maia-with-ipp',
        processingTime: 150,
        metadata: {
          model: 'gpt-4-ipp-enhanced',
          oracle: oracle || 'Maya',
          ippEnhanced: ippRelevance.isRelevant,
          ippContext: ippEnhancement?.hasIPPContext || false
        }
      },
      ippEnhancement: ippEnhancement?.hasIPPContext ? {
        detected: true,
        element: ippEnhancement.element,
        type: ippEnhancement.type,
        suggestions: ippEnhancement.suggestions,
        availableActions: generateIPPActions(ippRelevance, ippEnhancement)
      } : null,
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

    // Add IPP citations if relevant
    if (ippEnhancement?.hasIPPContext && ippEnhancement.relevantContent) {
      const ippCitations = ippEnhancement.relevantContent.map((content: any) => ({
        fileName: `Spiralogic-IPP: ${content.type}`,
        sectionTitle: content.element ? `${content.element} element` : 'General',
        snippet: content.content,
        confidence: content.relevance || 0.9,
        uploadDate: 'IPP Framework',
        category: 'attachment-healing',
        isIPP: true
      }));
      formattedCitations = [...formattedCitations, ...ippCitations];
    }

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
      citations: formattedCitations,
      ippEnhancement: result.ippEnhancement, // New: IPP-specific context
      metadata: {
        source: result.response?.source || 'maya-ipp-enhanced',
        processingTime: result.response?.processingTime || 0,
        model: result.response?.metadata?.model || 'maya-oracle-ipp',
        voiceEngine: voiceEngine,
        voiceGenerated: !!audioResponse,
        voiceMetadata: voiceMetadata,
        citationsCount: formattedCitations.length,
        ippEnabled: ippRelevance.isRelevant,
        ippKnowledgeUsed: ippEnhancement?.hasIPPContext || false,
        ...result.response?.metadata
      }
    });

  } catch (error) {
    console.error('Enhanced Oracle chat error:', error);

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
        source: 'maia_emergency_protocol_ipp'
      }
    });
  }
}

// Keep existing GET endpoint with IPP status
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const sessionId = request.nextUrl.searchParams.get('sessionId') || `session-${Date.now()}`;

    // Get IPP knowledge base status
    await spiralogicIPPKnowledge.initialize();
    const ippStats = spiralogicIPPKnowledge.getStats();

    return NextResponse.json({
      summary: 'Enhanced Oracle systems with Spiralogic-IPP integration are online and ready to provide guidance.',
      sessionId,
      status: 'active',
      oracle: 'Maya Enhanced',
      ipp: {
        integrated: ippStats.initialized,
        knowledgeEntries: ippStats.totalEntries || 0,
        elements: ['earth', 'water', 'fire', 'air', 'aether'],
        capabilities: [
          'Attachment assessment',
          'Guided imagery',
          'Trauma-sensitive support',
          'Progress tracking'
        ]
      },
      capabilities: [
        'Streaming conversations',
        'Elemental guidance (Air, Fire, Water, Earth, Aether)',
        'Spiralogic-IPP attachment healing integration',
        'Sesame-primary voice synthesis',
        'Memory integration',
        'Explicit fallback control'
      ]
    });

  } catch (error) {
    console.error('Enhanced Oracle status error:', error);
    return NextResponse.json({
      error: 'Enhanced Oracle systems temporarily offline',
      status: 'maintenance',
      message: 'Please try again in a few moments while we realign the cosmic frequencies and IPP integration.',
      sessionId: request.nextUrl.searchParams.get('sessionId') || `session-${Date.now()}`
    }, { status: 503 });
  }
}

// Helper functions

function detectIPPRelevance(message: string): { isRelevant: boolean; detectedElement?: string; confidence: number; keywords: string[] } {
  const lowerMessage = message.toLowerCase();

  // IPP-related keywords
  const ippKeywords = [
    'attachment', 'parent', 'parenting', 'childhood', 'trauma', 'healing',
    'assessment', 'imagery', 'guided', 'ideal parent', 'internal parent',
    'boundaries', 'safety', 'soothing', 'encouragement', 'guidance', 'identity',
    'earth parent', 'water parent', 'fire parent', 'air parent', 'aether parent',
    'spiralogic', 'ipp', 'dan brown', 'david elliott'
  ];

  // Element-specific keywords
  const elementKeywords = {
    earth: ['safety', 'protection', 'boundaries', 'grounding', 'structure', 'secure', 'stable'],
    water: ['emotion', 'feeling', 'soothing', 'comfort', 'nurturing', 'attunement', 'empathy'],
    fire: ['confidence', 'encourage', 'creative', 'express', 'courage', 'initiative', 'celebration'],
    air: ['clarity', 'understanding', 'communication', 'wisdom', 'guidance', 'perspective'],
    aether: ['identity', 'authentic', 'soul', 'purpose', 'meaning', 'spiritual', 'essence']
  };

  const foundKeywords: string[] = [];
  let confidence = 0;

  // Check for IPP keywords
  for (const keyword of ippKeywords) {
    if (lowerMessage.includes(keyword)) {
      foundKeywords.push(keyword);
      confidence += 0.1;
    }
  }

  // Check for element-specific content
  let detectedElement: string | undefined;
  for (const [element, keywords] of Object.entries(elementKeywords)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        foundKeywords.push(keyword);
        confidence += 0.05;
        if (!detectedElement) {
          detectedElement = element;
        }
      }
    }
  }

  // Additional context clues
  const contextClues = [
    'my childhood', 'growing up', 'my parents', 'family issues', 'relationship patterns',
    'self worth', 'inner child', 'emotional regulation', 'trust issues', 'abandonment'
  ];

  for (const clue of contextClues) {
    if (lowerMessage.includes(clue)) {
      foundKeywords.push(clue);
      confidence += 0.08;
    }
  }

  const isRelevant = confidence > 0.15 || foundKeywords.length > 2;

  return {
    isRelevant,
    detectedElement,
    confidence: Math.min(confidence, 1.0),
    keywords: foundKeywords
  };
}

function generateIPPActions(relevance: any, enhancement: any): string[] {
  const actions = [];

  if (enhancement?.hasIPPContext) {
    switch (enhancement.type) {
      case 'assessment':
        actions.push('Take complete IPP assessment');
        actions.push('Get score interpretation');
        break;
      case 'script':
        actions.push(`Begin ${enhancement.element} parent imagery`);
        actions.push('Customize imagery script');
        break;
      case 'guidance':
        actions.push('Get personalized guidance');
        actions.push('Schedule practice reminders');
        break;
    }
  } else {
    // General IPP actions based on detected relevance
    if (relevance.detectedElement) {
      actions.push(`Explore ${relevance.detectedElement} element healing`);
    }
    actions.push('Take IPP assessment');
    actions.push('Learn about guided imagery');
  }

  actions.push('Connect with IPP community');
  actions.push('Track healing progress');

  return actions.slice(0, 4);
}