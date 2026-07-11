// POST /api/maia/living-field/[fieldKey]/refine
// MAIA proposes a candidate expression. Never auto-saved.
// Candidate is ephemeral — only persisted when member accepts via PATCH on parent route.

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildEncounterContext, formatGatheredMaterial } from '@/lib/maia/living-field/encounterContext'
import { probeAuthPosture } from '@/lib/auth/authPostureProbe'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const HAIKU_MODEL = 'claude-haiku-4-5'

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { fieldKey: string } }
) {
  const memberId = probeAuthPosture(request)
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const { fieldKey } = params

  try {
    // Shared context assembly — same source of truth the encounter route uses.
    const ctx = await buildEncounterContext(memberId, fieldKey)
    const { currentExpression } = ctx.field

    // If nothing has gathered, return invitation
    if (!ctx.hasAnything) {
      return NextResponse.json({
        candidate_expression: null,
        sources_used: [],
        rationale: 'Not enough has gathered in this field yet to draft from. You can write directly, speak, or explore it with MAIA.',
      })
    }

    const { gatheredMaterial, sourcesUsed } = formatGatheredMaterial(ctx)

    const systemPrompt = `You are helping a member articulate one dimension of their Personal Living Field — a developing, member-owned expression of who they are becoming.

Your role: draft a candidate expression from the material the member has explicitly brought here. You do not synthesize beyond what the material shows. You do not assign identity. You do not conclude.

Rules:
- Do not write "MAIA understands you as..." or "Your identity is..." or assign confidence.
- Write as: "Based on what you've brought here, one possible expression might be..."
- Draft in first person as if the member is speaking.
- Keep it brief — 2-5 sentences.
- Note at the end (in one short sentence) which sources shaped the draft.
- This is a draft the member can edit, not a conclusion.`

    const userMessage = `Field dimension: ${fieldKey}

Material gathered from this member:
${gatheredMaterial}

Please draft a first-person candidate expression for this field dimension.`

    // 6. Call Claude
    const client = getAnthropicClient()
    if (!client) {
      // Graceful fallback if API key missing
      return NextResponse.json({
        candidate_expression: currentExpression ?? 'Something is beginning to take shape in this dimension.',
        sources_used: sourcesUsed,
        rationale: 'Draft from existing expression (AI unavailable).',
      })
    }

    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const rawText = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    // Split the last sentence as rationale if it notes sources
    const sentences = rawText.split(/(?<=[.!?])\s+/)
    const lastSentence = sentences[sentences.length - 1] ?? ''
    const looksLikeRationale = /shaped|source|drawn from|based on|informed by/i.test(lastSentence)
    const candidateExpression = looksLikeRationale && sentences.length > 1
      ? sentences.slice(0, -1).join(' ').trim()
      : rawText
    const rationale = looksLikeRationale
      ? lastSentence
      : 'Drafted from what has gathered in this field.'

    return NextResponse.json({
      candidate_expression: candidateExpression,
      sources_used: sourcesUsed,
      rationale,
    })
  } catch (err) {
    console.error('[living-field/refine] POST error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
