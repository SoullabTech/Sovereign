// POST /api/maia/session/process
// Process session transcript → Spiralogic structure → memory objects
// Used by MCP: session_notes

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { generateWithClaude } from '@/lib/ai/claudeClient'
import { query } from '@/lib/db/postgres'

// Validation constants
const VALID_CONSENT_LEVELS = ['clinical', 'coaching', 'personal', 'research'] as const
const VALID_PRIVACY_MODES = ['sanctuary', 'standard', 'full'] as const
const VALID_ELEMENTS = ['earth', 'water', 'fire', 'air', 'aether'] as const
const VALID_KAIROS = ['stasis', 'transition', 'threshold', 'integration'] as const
const VALID_FACETS = [
  'water_initiation', 'water_integration', 'water_transcendence',
  'fire_initiation', 'fire_integration', 'fire_transcendence',
  'earth_initiation', 'earth_integration', 'earth_transcendence',
  'air_initiation', 'air_integration', 'air_transcendence',
  'aether_initiation', 'aether_integration', 'aether_transcendence'
] as const

// Session analysis prompt - the "200 lines of markdown" that does the work
const SESSION_ANALYSIS_PROMPT = `You are a session analyst for MAIA, a consciousness development companion using the Spiralogic framework.

SPIRALOGIC FRAMEWORK:
Elements: Earth (grounding/body), Water (emotion/psyche), Fire (will/activation), Air (perspective/mind), Aether (integration/numinous)
Each element has 3 phases: Initiation (orient), Integration (transform), Transcendence (expand)
This creates 12 facets (e.g., water_initiation = emotional safety, fire_transcendence = vision/purpose)

KAIROS STATES:
- stasis: stable, no active movement
- transition: between states, uncertain
- threshold: at a crossing point, decision pending
- integration: synthesizing after a shift

THRESHOLD EVENT TYPES:
- insight: new understanding emerges
- grief_release: emotional release/completion
- boundary_formation: claiming space/saying no
- shadow_recognition: seeing disowned parts
- commitment: vow/decision crystallized
- relational_repair: connection restored
- somatic_shift: body-based change
- meaning_reframe: perspective transformation

TASK: Analyze this session transcript and extract:

1. STATE VECTOR - The overall consciousness state:
   - primary_element: most present element
   - secondary_element: supporting element (if any)
   - facet: specific facet (element_phase)
   - kairos: current movement state
   - confidence: 0-1 how clear this is

2. THRESHOLD EVENTS - Significant moments (max 5):
   - type: from list above
   - segment_index: rough position (0-10 scale)
   - intensity: 1-5
   - summary: 1-2 sentences
   - element: elemental tone

3. MOTIFS - Recurring symbols/themes (max 5):
   - symbol: the image/metaphor/theme
   - valence: helpful, haunting, or ambivalent
   - frequency: how often it appeared (low/medium/high)

4. FOLLOW-UPS - Suggested next practices/inquiries (max 5):
   - suggestion: what to explore
   - facet: which facet this serves
   - priority: 1-3

5. MARKDOWN SUMMARY - For practitioner/client (150-300 words):
   - What elemental territory was visited
   - What shifted or crossed
   - What's still alive/unresolved
   - Suggested practices

Respond in valid JSON with this structure:
{
  "stateVector": { "primary_element": "", "secondary_element": null, "facet": "", "kairos": "", "confidence": 0.0 },
  "thresholdEvents": [],
  "motifs": [],
  "followUps": [],
  "markdown": ""
}
`

// Types for the response
interface StateVector {
  primary_element: string
  secondary_element: string | null
  facet: string
  kairos: string
  confidence: number
}

interface ThresholdEvent {
  type: string
  segment_index: number
  intensity: number
  summary: string
  element?: string
}

interface Motif {
  symbol: string
  valence: 'helpful' | 'haunting' | 'ambivalent'
  frequency: 'low' | 'medium' | 'high'
}

interface FollowUp {
  suggestion: string
  facet: string
  priority: number
}

interface AnalysisResult {
  stateVector: StateVector
  thresholdEvents: ThresholdEvent[]
  motifs: Motif[]
  followUps: FollowUp[]
  markdown: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    const {
      memberId,
      transcript,
      sessionId,
      sessionDate,
      consentLevel = 'coaching',
      privacyMode = 'standard',
      practitionerIntent,
      runResonanceSearch = true,
    } = body

    // Validation
    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }
    if (!transcript || transcript.length < 50) {
      return NextResponse.json({ error: 'transcript must be at least 50 characters' }, { status: 400 })
    }
    if (transcript.length > 100000) {
      return NextResponse.json({ error: 'transcript must be under 100k characters' }, { status: 400 })
    }
    if (!VALID_CONSENT_LEVELS.includes(consentLevel)) {
      return NextResponse.json({ error: `consentLevel must be one of: ${VALID_CONSENT_LEVELS.join(', ')}` }, { status: 400 })
    }
    if (!VALID_PRIVACY_MODES.includes(privacyMode)) {
      return NextResponse.json({ error: `privacyMode must be one of: ${VALID_PRIVACY_MODES.join(', ')}` }, { status: 400 })
    }

    // SANCTUARY GATE: If sanctuary mode, only store metadata
    if (privacyMode === 'sanctuary') {
      // Log session occurred but don't process or store content
      const sessionRecord = await query(
        `INSERT INTO session_summaries
          (member_id, session_date, privacy_mode, summary_text, meta)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [
          memberId,
          sessionDate || new Date().toISOString(),
          'sanctuary',
          '[sanctuary session - content not stored]',
          { consentLevel, practitionerIntent, sanctuaryMode: true }
        ]
      )

      return NextResponse.json({
        sanctuary: true,
        message: 'Session recorded in sanctuary mode. No content processed or stored.',
        sessionId: sessionRecord.rows[0]?.id,
        markdown: '## Sanctuary Session\n\nThis session was held in sanctuary mode. Content was not analyzed or stored. Only the fact that a session occurred was recorded.',
        stateVector: null,
        thresholdEvents: [],
        motifs: [],
        followUps: [],
        resonanceEchoes: [],
        memoryPacketsWritten: 0,
      })
    }

    // Build context for analysis
    let contextPrefix = ''
    if (practitionerIntent) {
      contextPrefix = `PRACTITIONER INTENT: ${practitionerIntent}\n\n`
    }

    // Call Claude for analysis (using opus for deep reasoning)
    console.log(`[session/process] Analyzing ${transcript.length} char transcript for ${memberId}`)

    const result = await generateWithClaude({
      systemPrompt: SESSION_ANALYSIS_PROMPT,
      userInput: `${contextPrefix}SESSION TRANSCRIPT:\n\n${transcript}`,
      meta: {
        reasoningMode: 'analysis',  // Triggers Opus
        forceOpus: true,
        userId: memberId,
        mode: 'session_notes',
      }
    })

    // Parse the JSON response
    let analysis: AnalysisResult
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = result.text
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1]
      }
      analysis = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('[session/process] Failed to parse analysis:', parseError)
      return NextResponse.json({
        error: 'Failed to parse session analysis',
        rawResponse: result.text.slice(0, 500)
      }, { status: 500 })
    }

    // Validate and normalize the response
    const stateVector = {
      primary_element: VALID_ELEMENTS.includes(analysis.stateVector?.primary_element as typeof VALID_ELEMENTS[number])
        ? analysis.stateVector.primary_element
        : 'earth',
      secondary_element: analysis.stateVector?.secondary_element || null,
      facet: VALID_FACETS.includes(analysis.stateVector?.facet as typeof VALID_FACETS[number])
        ? analysis.stateVector.facet
        : 'earth_initiation',
      kairos: VALID_KAIROS.includes(analysis.stateVector?.kairos as typeof VALID_KAIROS[number])
        ? analysis.stateVector.kairos
        : 'stasis',
      confidence: Math.min(1, Math.max(0, analysis.stateVector?.confidence || 0.5))
    }

    const thresholdEvents = (analysis.thresholdEvents || []).slice(0, 5).map(e => ({
      type: e.type || 'insight',
      segment_index: e.segment_index || 0,
      intensity: Math.min(5, Math.max(1, e.intensity || 3)),
      summary: (e.summary || '').slice(0, 500),
      element: e.element
    }))

    const motifs = (analysis.motifs || []).slice(0, 5).map(m => ({
      symbol: (m.symbol || '').slice(0, 100),
      valence: ['helpful', 'haunting', 'ambivalent'].includes(m.valence) ? m.valence : 'ambivalent',
      frequency: ['low', 'medium', 'high'].includes(m.frequency) ? m.frequency : 'medium'
    }))

    const followUps = (analysis.followUps || []).slice(0, 5).map(f => ({
      suggestion: (f.suggestion || '').slice(0, 300),
      facet: f.facet || 'earth_initiation',
      priority: Math.min(3, Math.max(1, f.priority || 2))
    }))

    const markdown = analysis.markdown || '(No summary generated)'

    // Store session summary
    let memoryPacketsWritten = 0
    let storedSessionId = sessionId

    try {
      const sessionResult = await query(
        `INSERT INTO session_summaries
          (member_id, session_id, session_date, privacy_mode, consent_level,
           summary_text, state_vector, practitioner_intent, meta)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (session_id) DO UPDATE SET
          summary_text = EXCLUDED.summary_text,
          state_vector = EXCLUDED.state_vector,
          updated_at = NOW()
        RETURNING id`,
        [
          memberId,
          sessionId || null,
          sessionDate || new Date().toISOString(),
          privacyMode,
          consentLevel,
          markdown,
          stateVector,
          practitionerIntent,
          { motifs, followUps, analysisLatencyMs: Date.now() - startTime }
        ]
      )
      storedSessionId = sessionResult.rows[0]?.id
      memoryPacketsWritten++
    } catch (dbError) {
      console.error('[session/process] Failed to store session summary:', dbError)
      // Continue - we can still return the analysis
    }

    // Store threshold events
    for (const event of thresholdEvents) {
      try {
        await query(
          `INSERT INTO threshold_events
            (member_id, event_type, summary, element, intensity, source, session_id, meta)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            memberId,
            event.type,
            event.summary,
            event.element,
            event.intensity === 5 ? 'profound' : event.intensity >= 4 ? 'high' : event.intensity >= 2 ? 'medium' : 'low',
            'session_analysis',
            storedSessionId,
            { segment_index: event.segment_index }
          ]
        )
        memoryPacketsWritten++
      } catch (dbError) {
        console.error('[session/process] Failed to store threshold event:', dbError)
      }
    }

    // Store motifs as symbolic content
    for (const motif of motifs) {
      try {
        await query(
          `INSERT INTO symbolic_motifs
            (member_id, session_id, symbol, valence, frequency, meta)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [memberId, storedSessionId, motif.symbol, motif.valence, motif.frequency, {}]
        )
        memoryPacketsWritten++
      } catch (dbError) {
        // Table might not exist yet - that's fine
        console.error('[session/process] Failed to store motif (table may not exist):', dbError)
      }
    }

    // Optional: Run resonance search for echoes
    let resonanceEchoes: unknown[] = []
    if (runResonanceSearch && motifs.length > 0) {
      try {
        // Build resonance query from top motifs + primary element
        const resonanceQuery = [
          stateVector.primary_element,
          ...motifs.slice(0, 2).map(m => m.symbol)
        ].join(' ')

        const resonanceResult = await fetch(
          `${process.env.MAIA_BASE_URL || 'http://localhost:3000'}/api/maia/memory/resonance`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberId,
              queryText: resonanceQuery,
              maxAgeDays: 365,
              limit: 3
            })
          }
        )

        if (resonanceResult.ok) {
          const resonanceData = await resonanceResult.json()
          resonanceEchoes = resonanceData.echoes || resonanceData.results || []
        }
      } catch (resonanceError) {
        console.error('[session/process] Resonance search failed:', resonanceError)
        // Non-critical - continue without echoes
      }
    }

    const totalLatencyMs = Date.now() - startTime
    console.log(`[session/process] Complete: ${memoryPacketsWritten} packets, ${totalLatencyMs}ms`)

    return NextResponse.json({
      markdown,
      stateVector,
      thresholdEvents,
      motifs,
      followUps,
      resonanceEchoes,
      memoryPacketsWritten,
      sessionId: storedSessionId,
      latencyMs: totalLatencyMs,
    })

  } catch (error) {
    console.error('[session/process] Error:', error)
    return NextResponse.json({
      error: 'Session processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
