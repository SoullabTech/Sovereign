// MAIA Metacognitive Reflection API
// Enables MAIA to explain her own process and therapeutic framework usage

import { NextRequest, NextResponse } from 'next/server';
import { analyzeTherapeuticFrameworks, generateTransparencyReport, type FrameworkAnalysis } from '@/lib/consciousness/therapeuticFrameworkTracker';
import { getMAIAArchitectureContext, buildSelfAwareContext } from '@/lib/consciousness/maiaArchitectureContext';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Security: Require research API key for all endpoints
 */
function requireResearchKey(request: NextRequest): NextResponse | null {
  const key = request.headers.get('x-maia-research-key');
  const envKey = process.env.MAIA_RESEARCH_KEY;

  if (!envKey || key !== envKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - valid research API key required' },
      { status: 401 }
    );
  }

  return null; // Authorization passed
}

/**
 * GET /api/maia/metacognition
 * Returns MAIA's architectural context and capabilities
 */
export async function GET(request: NextRequest) {
  const authError = requireResearchKey(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const detail = searchParams.get('detail') as 'minimal' | 'standard' | 'comprehensive' || 'standard';

    const context = getMAIAArchitectureContext();
    const selfAwareContext = buildSelfAwareContext(detail);

    return NextResponse.json({
      success: true,
      architecture: context,
      selfAwarePrompt: selfAwareContext,
      capabilities: {
        canExplainArchitecture: true,
        canTrackFrameworks: true,
        canProvideTransparency: true,
        detailLevels: ['minimal', 'standard', 'comprehensive']
      }
    });
  } catch (error) {
    console.error('Error in metacognition GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve metacognitive context' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/maia/metacognition
 * Analyzes a conversation turn for therapeutic frameworks used
 *
 * Body:
 * {
 *   userInput: string,
 *   maiaResponse: string,
 *   includeTransparencyReport?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  const authError = requireResearchKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { userInput, maiaResponse, includeTransparencyReport = false } = body;

    if (!userInput || !maiaResponse) {
      return NextResponse.json(
        { success: false, error: 'Missing userInput or maiaResponse' },
        { status: 400 }
      );
    }

    // Analyze therapeutic frameworks
    const analysis: FrameworkAnalysis = analyzeTherapeuticFrameworks(maiaResponse, userInput);

    // Generate transparency report if requested
    let report: string | undefined;
    if (includeTransparencyReport) {
      report = generateTransparencyReport(maiaResponse, userInput, analysis);
    }

    return NextResponse.json({
      success: true,
      analysis,
      transparencyReport: report,
      metadata: {
        timestamp: new Date().toISOString(),
        userInputLength: userInput.length,
        maiaResponseLength: maiaResponse.length
      }
    });
  } catch (error) {
    console.error('Error in metacognition POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze therapeutic frameworks' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/maia/metacognition/explain
 * Get MAIA to explain a specific aspect of her architecture or process
 *
 * Body:
 * {
 *   question: string,  // e.g., "How do you decide which processing path to use?"
 *   context?: string   // Optional conversation context
 * }
 */
export async function PUT(request: NextRequest) {
  const authError = requireResearchKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { question, context: conversationContext } = body;

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Missing question' },
        { status: 400 }
      );
    }

    const architectureContext = getMAIAArchitectureContext();

    // Determine which aspect of architecture is being asked about
    const aspect = detectAspect(question);
    let relevantContext = '';

    switch (aspect) {
      case 'processing':
        relevantContext = architectureContext.processingPaths;
        break;
      case 'frameworks':
        relevantContext = architectureContext.therapeuticFrameworks;
        break;
      case 'technical':
        relevantContext = architectureContext.technicalStack;
        break;
      case 'memory':
        relevantContext = architectureContext.memorySystem;
        break;
      case 'conversation':
        relevantContext = architectureContext.conversationalMechanics;
        break;
      case 'sovereignty':
        relevantContext = architectureContext.sovereigntyPrinciples;
        break;
      default:
        relevantContext = buildSelfAwareContext('comprehensive');
    }

    return NextResponse.json({
      success: true,
      question,
      aspect,
      relevantContext,
      fullArchitecture: architectureContext,
      suggestion: `To get MAIA's personalized explanation, send this question to /api/between/chat with selfAwareMode: true`
    });
  } catch (error) {
    console.error('Error in metacognition PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to explain architecture' },
      { status: 500 }
    );
  }
}

/**
 * Detect which aspect of architecture is being asked about
 */
function detectAspect(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('processing') || q.includes('path') || q.includes('fast') || q.includes('core') || q.includes('deep')) {
    return 'processing';
  }
  if (q.includes('framework') || q.includes('therapeutic') || q.includes('somatic') || q.includes('jungian') || q.includes('ifs')) {
    return 'frameworks';
  }
  if (q.includes('technical') || q.includes('code') || q.includes('implementation') || q.includes('deepseek') || q.includes('ollama')) {
    return 'technical';
  }
  if (q.includes('memory') || q.includes('remember') || q.includes('tracking') || q.includes('conversation history')) {
    return 'memory';
  }
  if (q.includes('conversation') || q.includes('respond') || q.includes('attune') || q.includes('convention')) {
    return 'conversation';
  }
  if (q.includes('privacy') || q.includes('sovereignty') || q.includes('ethics') || q.includes('boundaries')) {
    return 'sovereignty';
  }

  return 'general';
}
