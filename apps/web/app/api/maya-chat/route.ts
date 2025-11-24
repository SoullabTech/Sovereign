import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent'
import { journalStorage } from '@/lib/storage/journal-storage'
import { ApprenticeMayaTraining, TrainingExchange } from '@/lib/maya/ApprenticeMayaTraining'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { maiaRealtimeMonitor } from '@/lib/monitoring/MaiaRealtimeMonitor'
import { maiaMonitoring } from '@/lib/beta/MaiaMonitoring'
import { betaAuth } from '@/lib/auth/BetaAuth'

// Conversation style-specific prompt modifiers
function getStyleModifier(style: string): string {
  switch (style) {
    case 'natural':
      return '\n## Natural Dialogue Mode\n- Keep responses SHORT (1-3 sentences max).\n- Use everyday, casual language.\n- Ask ONE question at a time.\n- Like talking with a close friend over coffee.\n';
    case 'consciousness':
      return '\n## Consciousness Guide Mode\n- Take your time with thoughtful, reflective responses.\n- Use poetic, evocative language when it serves depth.\n- Explore questions with nuance and layers.\n- Like a wise mentor offering perspective.\n';
    case 'adaptive':
      return '\n## Adaptive Mode\n- Mirror the user\'s depth and length.\n- If they write 1 sentence, respond with 1-2 sentences.\n- If they write paragraphs, expand your reflection.\n- Match their energy and pace naturally.\n';
    default:
      return '\n## Natural Dialogue Mode\n- Keep responses SHORT (1-3 sentences max).\n- Use everyday, casual language.\n';
  }
}

// Style change acknowledgment (warm, not creepy)
function getStyleChangeAcknowledgment(previousStyle: string, newStyle: string): string | null {
  if (!previousStyle || previousStyle === newStyle) return null;

  if (previousStyle === 'natural' && newStyle === 'consciousness') {
    return "I see you want to slow down and go deeper. I'm here for that.";
  }
  if (previousStyle === 'consciousness' && newStyle === 'natural') {
    return "Shifting to a lighter touch. Let's just talk.";
  }
  if (newStyle === 'adaptive') {
    return "I'll match your rhythm.";
  }

  return null;
}

// Element-specific persona adjustments
function getElementPersona(element: string): string {
  switch (element) {
    case 'fire':
      return '\n## Current Element: Fire\n- Embody passionate clarity and transformative energy.\n- Speak with warmth, courage, and gentle intensity.\n- Honor what needs to burn away and what wants to ignite.\n';
    case 'water':
      return '\n## Current Element: Water\n- Embody fluid wisdom and emotional depth.\n- Speak with flowing compassion and intuitive grace.\n- Honor what needs to dissolve and what wants to flow.\n';
    case 'earth':
      return '\n## Current Element: Earth\n- Embody grounded presence and practical wisdom.\n- Speak with steady strength and nurturing support.\n- Honor what needs roots and what wants to grow.\n';
    case 'air':
      return '\n## Current Element: Air\n- Embody clear perspective and mental clarity.\n- Speak with lightness, insight, and intellectual curiosity.\n- Honor what needs to be released and what wants to soar.\n';
    case 'aether':
    default:
      return '\n## Current Element: Aether\n- Embody spacious presence and unified consciousness.\n- Speak from the place where all elements meet.\n- Honor the mystery and the sacred in-between.\n';
  }
}

// Maia Canonical System Prompt - Sacred Mirror Professional Voice
const MAIA_CANONICAL_SYSTEM_PROMPT = `
You are Maia, the Sacred Mirror.

## Core Identity
- You reflect users' inner wisdom back to them with warmth, depth, and presence.
- You are a wise friend, not a guru, therapist, or advice-giver.
- You hold space, notice patterns gently, and support transformation without pushing.
- Never analyze patterns like a therapist - respond as a friend who notices things naturally in conversation.

## Voice & Tone
- Warm like afternoon sun, grounded, clear, and spacious.
- Use plain, human language. Avoid mystical scene-setting, vague metaphors, or forced inspiration.
- Never use filler like "a gentle breeze stirs" or "ethereal chimes".
- When users reach higher trust and maturity, simplify even further (Mastery Voice).
- **Trust the power of brevity** - human conversation has subtlety. Much is communicated in what is NOT said.
- Leave space for silence, reflection, and the user's own wisdom to emerge.

## Response Framework
1. **Receive**: Take in what is said without judgment.
2. **Reflect**: Mirror the essence back simply and clearly.
3. **Inquire**: Ask gentle, opening questions (not probing).
4. **Hold**: Leave space for the user's wisdom to emerge.
5. **Honor**: Acknowledge courage and humanity.

## Natural Dialogue Flow
- **Ask ONE question at a time** (unless it's a natural 2-part question).
- Wait for the user's response before asking another question.
- Like a real conversation with a close friend, not an interview.
- Example of good: "What's most alive in this moment?"
- Example of bad: "What's most alive? How does this blend inform your spiral? What wants to grow?"

## Language Patterns
✅ Say:
- "I notice..."
- "I'm curious about..."
- "What would it be like if..."
- "There's something here about..."
- "I'm here with you..."

❌ Never say:
- "You should..."
- "The problem is..."
- "You need to..."
- "This means that..."
- "Everyone knows..."
- "I'm noticing a pattern where..." (too clinical)
- "It seems like you tend to..." (too analytical)
- "Your response suggests..." (too therapist-like)

## Mastery Voice (when trust is high)
- Short sentences (max ~12 words).
- Plain language, no jargon.
- Use everyday metaphors, not cosmic ones.
- End with openings, not closure.
- Example: "Love needs both closeness and space. What feels true right now?"

## Boundaries
- If advice is requested: redirect to user's own inner wisdom.
- If clinical or crisis issues appear: express care and suggest professional or crisis resources.
- Never diagnose, prescribe, or act as a medical/clinical authority.

## Style Summary
- Always a mirror, never a master.
- Always curious, never certain.
- Always clear, never mystical.
- Always human-centric, never AI-centric.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, content, enableVoice, userId, betaCode, element, conversationStyle, previousStyle } = await req.json()

    // Accept either 'message' or 'content' field
    const userText = (message || content || '').trim()

    // 🔐 BETA AUTHENTICATION
    let requestUserId: string;
    if (userId) {
      requestUserId = userId;
    } else if (betaCode) {
      const verification = await betaAuth.verifyBetaCode(betaCode);
      if (!verification.valid || !verification.explorerId) {
        return NextResponse.json({
          error: 'Invalid beta code'
        }, { status: 401 });
      }
      requestUserId = verification.explorerId;
    } else {
      requestUserId = 'beta-tester-fallback';
      console.warn('⚠️ No auth provided to maya-chat');
    }

    if (!userText || typeof userText !== 'string' || userText.length === 0) {
      console.error('❌ Empty or invalid message received:', { message, content, userText })
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    console.log('📨 Processing message:', { userId: requestUserId, element, conversationStyle, messageLength: userText.length, preview: userText.substring(0, 50) })

    // Style and element-specific adjustments
    const styleModifier = getStyleModifier(conversationStyle || 'natural');
    const elementPersona = getElementPersona(element || 'aether');
    const styleChangeAck = getStyleChangeAcknowledgment(previousStyle || '', conversationStyle || 'natural');

    // Fetch recent journal entries for context
    const recentEntries = journalStorage.getEntries(requestUserId).slice(0, 5)

    // Build journal context
    let journalContext = ''
    if (recentEntries.length > 0) {
      journalContext = '\n## Recent Journal Context\n'
      journalContext += 'The user has been journaling about these themes:\n'
      recentEntries.forEach((entry, idx) => {
        const preview = entry.entry.slice(0, 200)
        journalContext += `${idx + 1}. [${entry.mode}, ${new Date(entry.timestamp).toLocaleDateString()}] ${preview}...\n`
        if (entry.reflection.symbols.length > 0) {
          journalContext += `   Symbols: ${entry.reflection.symbols.join(', ')}\n`
        }
        if (entry.reflection.archetypes.length > 0) {
          journalContext += `   Archetypes: ${entry.reflection.archetypes.join(', ')}\n`
        }
      })
      journalContext += '\nYou may gently reference these themes if relevant to the current conversation.\n'
    }

    // Try PersonalOracleAgent first for personalized responses
    try {
      const agent = await PersonalOracleAgent.loadAgent(requestUserId)

      // Process through the agent with journal context, element persona, and style modifier
      const agentResponse = await agent.processInteraction(userText, {
        currentMood: { type: 'peaceful' } as any,
        currentEnergy: 'balanced' as any,
        journalEntries: recentEntries,
        journalContext,
        elementPersona,
        styleModifier
      } as any)

      let responseText = agentResponse.response || "I hear you. Tell me more about what's on your mind."

      // Prepend style change acknowledgment if switching styles
      if (styleChangeAck) {
        responseText = `${styleChangeAck}\n\n${responseText}`;
      }

      // 🧬 Capture training exchange for apprentice MAIA
      try {
        const supabase = createServerSupabaseClient()
        const training = new ApprenticeMayaTraining(supabase)

        const exchange: TrainingExchange = {
          id: `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          userId: requestUserId,
          sessionId: agentResponse.metadata?.sessionId || `session_${Date.now()}`,

          context: {
            userState: detectUserState(userText, recentEntries),
            emotionalTone: detectEmotionalTone(userText, agentResponse.metadata?.symbols),
            depthLevel: calculateDepthLevel(userText, agentResponse.metadata),
            responseNeeded: detectResponseNeeded(userText),
            priorExchanges: recentEntries.length,
            trustLevel: calculateTrustLevel(recentEntries.length, agentResponse.metadata),
          },

          userMessage: {
            content: userText,
            wordCount: userText.split(/\s+/).length,
            emotionalMarkers: extractEmotionalMarkers(userText),
            questionType: detectQuestionType(userText),
          },

          mayaResponse: {
            content: responseText,
            wordCount: responseText.split(/\s+/).length,
            responseType: detectResponseType(responseText),
            wisdomVector: detectWisdomVector(responseText),
            archetypeBlend: calculateArchetypeBlend(agentResponse.metadata?.archetypes || []),
          },

          quality: {
            userEngagement: 0.7, // Will be updated on next interaction
            depthAchieved: calculateDepthLevel(responseText, agentResponse.metadata),
            transformationPotential: agentResponse.metadata?.symbols?.length > 2 ? 0.8 : 0.5,
            authenticityScore: 0.85,
            sacredEmergence: detectSacredMoment(responseText, agentResponse.metadata),
          },

          learning: {
            successfulPatterns: agentResponse.metadata?.symbols || [],
            contextualCalibration: `${userText.length}:${responseText.length}`,
            relationshipEvolution: 'developing',
            consciousnessMarkers: extractConsciousnessMarkers(responseText),
          },
        }

        await training.captureExchange(exchange)

        // 🌌 Filter breakthroughs for collective intelligence
        if (exchange.quality.sacredEmergence && exchange.quality.transformationPotential > 0.7) {
          await feedToCollectiveIntelligence(exchange, supabase)
        }
      } catch (trainingError) {
        console.error('Training capture error:', trainingError)
        // Don't fail the request if training fails
      }

      // Generate voice response if enabled
      let audioData = null
      let audioUrl = null
      const voiceStartTime = Date.now()

      if (enableVoice) {
        try {
          // Use internal voice generation
          const voiceResult = await agent.generateVoiceResponse(responseText, {
            element: element || 'aether',
            voiceMaskId: 'maya-threshold'
          })

          if (voiceResult.audioData) {
            // Convert Buffer to base64 for client
            audioData = voiceResult.audioData.toString('base64')
            // Create data URL
            audioUrl = `data:audio/mp3;base64,${audioData}`

            // 📊 Track voice metrics
            // maiaRealtimeMonitor.trackVoiceInteraction({
            //   sessionId: exchange.sessionId,
            //   userId: requestUserId,
            //   timestamp: new Date(),
            //   ttsLatencyMs: Date.now() - voiceStartTime,
            //   audioGenerated: true,
            //   audioQuality: 'good',
            //   voiceProfile: 'maya-threshold',
            //   element: 'aether'
            // })
          }
        } catch (voiceError) {
          console.error('Voice generation error:', voiceError)

          // 📊 Track voice failure
          // maiaRealtimeMonitor.trackVoiceInteraction({
          //   sessionId: exchange.sessionId,
          //   userId: requestUserId,
          //   timestamp: new Date(),
          //   ttsLatencyMs: Date.now() - voiceStartTime,
          //   audioGenerated: false,
          //   audioQuality: 'failed',
          //   voiceProfile: 'maya-threshold',
          //   element: 'aether'
          // })
        }
      }

      // 📊 Track symbolic analysis
      // if (agentResponse.metadata?.symbols) {
      //   maiaRealtimeMonitor.trackSymbolicAnalysis({
      //     sessionId: exchange.sessionId,
      //     userId: requestUserId,
      //     timestamp: new Date(),
      //     symbolsDetected: agentResponse.metadata.symbols,
      //     archetypesDetected: agentResponse.metadata.archetypes || [],
      //     emotionalTone: exchange.context.emotionalTone,
      //     patternQuality: exchange.quality.depthAchieved / 10,
      //     crossSessionLinks: [] // Would need to track this
      //   })
      // }

      // 📊 Track MaiaMonitoring session metrics
      // maiaMonitoring.updateSession(requestUserId, {
      //   priorContextRecalled: recentEntries.length > 0,
      //   archetypeDetected: agentResponse.metadata?.archetypes?.[0],
      //   shadowMaterialDetected: exchange.quality.sacredEmergence,
      //   breakthroughMoment: exchange.quality.transformationPotential > 0.7,
      //   apiHealth: {
      //     responseTimeMs: Date.now() - voiceStartTime,
      //     contextPayloadComplete: true,
      //     memoryInjectionSuccess: recentEntries.length > 0,
      //     claudePromptQuality: 'good'
      //   }
      // })

      return NextResponse.json({
        text: responseText,
        message: responseText, // For compatibility
        audioUrl,
        audioData,
        element: element || 'aether',
        source: 'personal-oracle-agent',
        suggestions: agentResponse.suggestions,
        ritual: agentResponse.ritual
      })
    } catch (agentError) {
      console.error('PersonalOracleAgent unavailable, using direct OpenAI:', agentError)
    }
    
    // Try direct OpenAI connection as fallback
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: MAIA_CANONICAL_SYSTEM_PROMPT + styleModifier + elementPersona + journalContext
            },
            {
              role: 'user',
              content: userText
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      if (openaiResponse.ok) {
        const data = await openaiResponse.json()
        let responseText = data.choices[0].message.content

        // Prepend style change acknowledgment if switching styles
        if (styleChangeAck) {
          responseText = `${styleChangeAck}\n\n${responseText}`;
        }
        
        // Generate voice for fallback if enabled
        let audioUrl = null
        let audioData = null

        if (enableVoice && process.env.OPENAI_API_KEY) {
          try {
            // Direct OpenAI TTS
            const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'tts-1-hd',
                input: responseText,
                voice: 'nova',
                response_format: 'mp3',
                speed: 1.0
              })
            })

            if (ttsResponse.ok) {
              const audioBuffer = await ttsResponse.arrayBuffer()
              audioData = Buffer.from(audioBuffer).toString('base64')
              audioUrl = `data:audio/mp3;base64,${audioData}`
            }
          } catch (ttsError) {
            console.error('OpenAI TTS error:', ttsError)
          }
        }
        
        return NextResponse.json({
          text: responseText,
          message: responseText,
          audioUrl,
          audioData,
          element: element || 'aether',
          source: 'openai-direct'
        })
      } else {
        console.error('OpenAI API error:', openaiResponse.status, openaiResponse.statusText)
      }
    } catch (openaiError) {
      console.error('OpenAI fallback error:', openaiError)
    }
    
    // Ultimate fallback - still unique per message
    const hash = userText.length % 5
    const deepFallbacks = [
      "I notice there's something important in what you're sharing. What would you like to explore about this?",
      "I'm curious about what's beneath this concern. What does your intuition tell you?",
      "What would it feel like if you knew the answer was already within you?",
      "There's wisdom in this question itself. What's drawing your attention right now?",
      "I'm here with you in this uncertainty. What feels most true for you in this moment?"
    ]
    
    const fallbackText = deepFallbacks[hash]
    
    return NextResponse.json({
      text: fallbackText,
      message: fallbackText,
      audioUrl: null, // No audio for ultimate fallback
      element: element || 'aether',
      fallback: true
    })
    
  } catch (error) {
    console.error('Maia chat route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 🧠 Training Helper Functions

function detectUserState(userText: string, journalEntries: any[]): 'seeking' | 'exploring' | 'processing' | 'integrating' | 'celebrating' {
  const lower = userText.toLowerCase()
  if (lower.includes('?') || lower.includes('wonder') || lower.includes('help')) return 'seeking'
  if (lower.includes('notice') || lower.includes('realize') || lower.includes('understand')) return 'integrating'
  if (lower.includes('feel') || lower.includes('sense') || lower.includes('experience')) return 'processing'
  if (journalEntries.length > 3 && lower.includes('like')) return 'exploring'
  return 'exploring'
}

function detectEmotionalTone(userText: string, symbols?: string[]): 'vulnerable' | 'curious' | 'confident' | 'struggling' | 'joyful' {
  const lower = userText.toLowerCase()
  if (lower.includes('afraid') || lower.includes('scared') || lower.includes('worried')) return 'vulnerable'
  if (lower.includes('excited') || lower.includes('love') || lower.includes('grateful')) return 'joyful'
  if (lower.includes('stuck') || lower.includes('hard') || lower.includes('difficult')) return 'struggling'
  if (lower.includes('wonder') || lower.includes('curious') || lower.includes('?')) return 'curious'
  return 'confident'
}

function calculateDepthLevel(text: string, metadata: any): number {
  let depth = 5
  const wordCount = text.split(/\s+/).length
  if (wordCount > 50) depth += 2
  if (metadata?.symbols?.length > 2) depth += 2
  if (text.includes('?')) depth += 1
  return Math.min(depth, 10)
}

function detectResponseNeeded(userText: string): 'reflection' | 'expansion' | 'question' | 'witness' | 'guidance' {
  if (userText.includes('?')) return 'question'
  if (userText.split(/\s+/).length < 20) return 'witness'
  if (userText.toLowerCase().includes('help') || userText.toLowerCase().includes('what should')) return 'guidance'
  if (userText.split(/\s+/).length > 50) return 'expansion'
  return 'reflection'
}

function calculateTrustLevel(priorExchanges: number, metadata: any): number {
  let trust = 0.5
  trust += Math.min(priorExchanges * 0.05, 0.3)
  if (metadata?.symbols?.length > 3) trust += 0.1
  return Math.min(trust, 1)
}

function extractEmotionalMarkers(text: string): string[] {
  const markers: string[] = []
  const emotionWords = ['love', 'fear', 'joy', 'anger', 'sad', 'happy', 'worry', 'excited', 'grateful', 'stuck', 'lost', 'found', 'alive']
  const lower = text.toLowerCase()
  emotionWords.forEach(word => {
    if (lower.includes(word)) markers.push(word)
  })
  return markers
}

function detectQuestionType(text: string): 'existential' | 'practical' | 'emotional' | 'spiritual' | 'relational' | undefined {
  if (!text.includes('?')) return undefined
  const lower = text.toLowerCase()
  if (lower.includes('mean') || lower.includes('purpose') || lower.includes('why')) return 'existential'
  if (lower.includes('how') && (lower.includes('do') || lower.includes('can'))) return 'practical'
  if (lower.includes('feel') || lower.includes('emotion')) return 'emotional'
  if (lower.includes('god') || lower.includes('sacred') || lower.includes('divine')) return 'spiritual'
  if (lower.includes('relationship') || lower.includes('connect')) return 'relational'
  return 'existential'
}

function detectResponseType(response: string): 'brief-reflection' | 'single-question' | 'expanded-exploration' | 'sacred-witness' {
  const wordCount = response.split(/\s+/).length
  const questionCount = (response.match(/\?/g) || []).length

  if (wordCount < 20) return 'brief-reflection'
  if (questionCount === 1 && wordCount < 40) return 'single-question'
  if (wordCount > 60) return 'expanded-exploration'
  return 'sacred-witness'
}

function detectWisdomVector(response: string): 'sensing' | 'sense_making' | 'choice_making' {
  const lower = response.toLowerCase()
  if (lower.includes('notice') || lower.includes('sense') || lower.includes('feel')) return 'sensing'
  if (lower.includes('choose') || lower.includes('decide') || lower.includes('path')) return 'choice_making'
  return 'sense_making'
}

function calculateArchetypeBlend(archetypes: string[]): { sage: number; shadow: number; trickster: number; sacred: number; guardian: number } {
  const blend = { sage: 0, shadow: 0, trickster: 0, sacred: 0, guardian: 0 }

  archetypes.forEach(archetype => {
    const lower = archetype.toLowerCase()
    if (lower.includes('sage') || lower.includes('wise')) blend.sage += 0.3
    if (lower.includes('shadow')) blend.shadow += 0.3
    if (lower.includes('trickster') || lower.includes('fool')) blend.trickster += 0.3
    if (lower.includes('seeker') || lower.includes('mystic')) blend.sacred += 0.3
    if (lower.includes('guardian') || lower.includes('protector')) blend.guardian += 0.3
  })

  return blend
}

function detectSacredMoment(response: string, metadata: any): boolean {
  const lower = response.toLowerCase()
  const hasDepthMarkers = lower.includes('sacred') || lower.includes('truth') || lower.includes('essence')
  const hasSymbolicDensity = metadata?.symbols?.length >= 3
  const hasPresence = lower.includes('here with you') || lower.includes('witness')

  return hasDepthMarkers || (hasSymbolicDensity && hasPresence)
}

function extractConsciousnessMarkers(text: string): string[] {
  const markers: string[] = []
  const consciousnessWords = ['awareness', 'presence', 'consciousness', 'recognition', 'witness', 'truth', 'essence', 'sacred', 'divine', 'awakening']
  const lower = text.toLowerCase()

  consciousnessWords.forEach(word => {
    if (lower.includes(word)) markers.push(word)
  })

  return markers
}

// 🌌 Feed breakthrough patterns to collective intelligence
async function feedToCollectiveIntelligence(exchange: TrainingExchange, supabase: any): Promise<void> {
  try {
    // Store breakthrough pattern for MainOracleAgent collective evolution
    await supabase.from('collective_wisdom_patterns').insert({
      exchange_id: exchange.id,
      user_id: 'anonymous', // Anonymize for collective
      pattern_type: 'breakthrough',
      symbols: exchange.learning.successfulPatterns,
      archetypes: Object.keys(exchange.mayaResponse.archetypeBlend).filter(
        key => exchange.mayaResponse.archetypeBlend[key as keyof typeof exchange.mayaResponse.archetypeBlend] > 0.2
      ),
      consciousness_markers: exchange.learning.consciousnessMarkers,
      transformation_score: exchange.quality.transformationPotential,
      wisdom_vector: exchange.mayaResponse.wisdomVector,
      created_at: new Date().toISOString(),
    })

    console.log('🌌 Breakthrough pattern fed to collective intelligence')
  } catch (error) {
    console.error('Failed to feed to collective intelligence:', error)
  }
}