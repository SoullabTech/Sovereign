import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent'
import { journalStorage } from '@/lib/storage/journal-storage'
import { betaAuth } from '@/lib/auth/BetaAuth'

/**
 * /api/oracle/personal - MAIA Personal Oracle Endpoint v2.0
 *
 * Primary: PersonalOracleAgent (Claude-based with journal context & symbolic intelligence)
 * Fallback: OpenAI GPT-4
 * Ultimate Fallback: Graceful static responses
 *
 * All responses include voiceCharacteristics for voice chat compatibility
 */

const MAIA_SYSTEM_PROMPT = `You are MAIA, a wise and empathetic AI companion. You offer gentle insights and reflective questions to help users explore their thoughts and feelings. Keep responses warm, concise (1-3 sentences), and focused on the user's emotional journey. Avoid spiritual jargon or overly mystical language. Simply be present and supportive.`

function getVoiceCharacteristics(element?: string) {
  if (element === 'water') return { tone: 'gentle', pace: 'slow', energy: 'soft' }
  if (element === 'fire') return { tone: 'uplifting', pace: 'fast', energy: 'expansive' }
  if (element === 'earth') return { tone: 'grounding', pace: 'moderate', energy: 'focused' }
  if (element === 'air') return { tone: 'clear', pace: 'moderate', energy: 'light' }
  return { tone: 'warm', pace: 'moderate', energy: 'balanced' }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { userId, userText, message, text, input, content, betaCode } = body

    // Get the user input from various possible field names
    const userInput = (userText || message || text || input || content || '').trim()

    // 🔐 BETA AUTHENTICATION - Verify user
    let requestUserId: string;

    // Priority 1: If userId provided directly (from frontend session)
    if (userId) {
      requestUserId = userId;
    }
    // Priority 2: If betaCode provided, verify and get explorerId
    else if (betaCode) {
      const verification = await betaAuth.verifyBetaCode(betaCode);
      if (!verification.valid || !verification.explorerId) {
        return NextResponse.json({
          success: false,
          error: 'Invalid beta code. Please check your invitation email.'
        }, { status: 401 });
      }
      requestUserId = verification.explorerId;
      console.log('✅ Beta code verified:', { explorerId: requestUserId, name: verification.name });
    }
    // Fallback: Use 'beta-tester-fallback' for testing
    else {
      requestUserId = 'beta-tester-fallback';
      console.warn('⚠️ No userId or betaCode provided, using fallback');
    }

    console.log('[DEBUG] Resolved userId in route:', requestUserId)
    console.log('[DEBUG] Route body received:', { userId, betaCode: betaCode ? '***' : undefined, userText, message, text, input, content })
    console.log('📨 /api/oracle/personal:', {
      userId: requestUserId,
      messageLength: userInput.length,
      hasInput: !!userInput
    })

    // Validate input
    if (!userInput || userInput.length === 0) {
      return NextResponse.json({
        success: true,
        text: "I'm here with you. What's on your mind?",
        response: "I'm here with you. What's on your mind?",
        message: "I'm here with you. What's on your mind?",
        element: 'aether',
        archetype: 'maia',
        voiceCharacteristics: getVoiceCharacteristics('aether'),
        metadata: {
          spiralogicPhase: 'invocation',
          responseTime: 0
        },
        version: 'v2.0.0',
        source: 'validation-fallback'
      })
    }

    // Fetch recent journal entries for context
    const recentEntries = journalStorage.getEntries(requestUserId).slice(0, 5)

    // PRIMARY PATH: Try PersonalOracleAgent (Claude with full MAIA intelligence)
    console.log('🔮 Attempting PersonalOracleAgent (primary MAIA path)...')
    console.log('[DEBUG] Loading agent with userId:', requestUserId)
    try {
      const agent = await PersonalOracleAgent.loadAgent(requestUserId)
      const agentResponse = await agent.processInteraction(userInput, {
        currentMood: { type: 'peaceful' } as any,
        currentEnergy: 'balanced' as any,
        journalEntries: recentEntries
      } as any)

      const responseText = agentResponse.response || "I hear you. Tell me more about what's on your mind."
      const element = agentResponse.element || 'aether'
      const archetype = agentResponse.metadata?.archetypes?.[0] || 'maia'

      console.log('✅ PersonalOracleAgent response successful')

      return NextResponse.json({
        success: true,
        text: responseText,
        response: responseText,
        message: responseText,
        element,
        archetype,
        voiceCharacteristics: getVoiceCharacteristics(element),
        metadata: {
          ...agentResponse.metadata,
          spiralogicPhase: agentResponse.metadata?.phase || 'reflection',
          responseTime: Date.now() - startTime
        },
        version: 'v2.0.0',
        source: 'personal-oracle-agent'
      })
    } catch (agentError: any) {
      console.error('❌ PersonalOracleAgent failed:', agentError.message || agentError)
      console.log('🔄 Falling back to OpenAI...')
    }

    // FALLBACK PATH: OpenAI GPT-4
    try {
      console.log('🔄 Calling OpenAI directly...')

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: MAIA_SYSTEM_PROMPT },
            { role: 'user', content: userInput }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      if (openaiResponse.ok) {
        const data = await openaiResponse.json()
        const responseText = data.choices[0].message.content.trim()

        console.log('✅ OpenAI fallback response successful')

        return NextResponse.json({
          success: true,
          text: responseText,
          response: responseText,
          message: responseText,
          element: 'aether',
          archetype: 'maia',
          voiceCharacteristics: getVoiceCharacteristics('aether'),
          metadata: {
            spiralogicPhase: 'exploration',
            responseTime: Date.now() - startTime
          },
          version: 'v2.0.0',
          source: 'openai-fallback'
        })
      } else {
        console.error('❌ OpenAI API error:', openaiResponse.status, await openaiResponse.text())
      }
    } catch (openaiError: any) {
      console.error('❌ OpenAI fallback failed:', openaiError.message || openaiError)
    }

    // ULTIMATE FALLBACK: Graceful static responses
    const fallbackResponses = [
      "I hear you. Tell me more about what's on your mind.",
      "That sounds important to you. Can you share what feels most significant about it?",
      "I'm listening. What would feel most helpful to explore right now?",
      "Thank you for sharing that. What stands out to you about this situation?",
      "I appreciate you opening up. What's drawing your attention in this moment?"
    ]

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

    console.log('⚠️ Using ultimate fallback response')

    return NextResponse.json({
      success: true,
      text: randomResponse,
      response: randomResponse,
      message: randomResponse,
      element: 'aether',
      archetype: 'maia',
      voiceCharacteristics: getVoiceCharacteristics('aether'),
      metadata: {
        spiralogicPhase: 'grounding',
        responseTime: Date.now() - startTime
      },
      version: 'v2.0.0',
      source: 'ultimate-fallback',
      fallback: true
    })

  } catch (error: any) {
    console.error('💥 Oracle personal route error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: "I'm experiencing a moment of difficulty. Could you try again?",
      version: 'v2.0.0'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const check = request.nextUrl.searchParams.get('check')

  if (check === '1') {
    return NextResponse.json({
      success: true,
      text: '🧪 MAIA API is healthy',
      version: 'v2.0.0-personal-oracle-agent',
      element: 'aether',
      archetype: 'maia',
      source: 'health-check',
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      buildDate: new Date().toISOString()
    })
  }

  return NextResponse.json({
    status: 'ok',
    using: 'personal-oracle-agent-primary',
    version: 'v2.0.0',
    environment: process.env.NODE_ENV,
    deployedAt: new Date().toISOString()
  })
}