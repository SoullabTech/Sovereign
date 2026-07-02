// POST /api/maia/living-field/[fieldKey]/refine
// MAIA proposes a candidate expression. Never auto-saved.
// Candidate is ephemeral — only persisted when member accepts via PATCH on parent route.

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import Anthropic from '@anthropic-ai/sdk'

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
  const memberId = request.headers.get('x-member-id')
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const { fieldKey } = params

  try {
    // 1. Load the field and its active sources
    const fieldResult = await query(
      `SELECT f.id, f.current_expression,
              array_agg(s.source_excerpt ORDER BY s.created_at DESC) FILTER (WHERE s.id IS NOT NULL) AS source_excerpts
       FROM personal_living_fields f
       LEFT JOIN personal_living_field_sources s ON s.field_id = f.id
       WHERE f.member_id = $1 AND f.field_key = $2
       GROUP BY f.id, f.current_expression`,
      [memberId, fieldKey]
    )
    const field = fieldResult.rows[0] ?? null
    const fieldId: string | null = field?.id ?? null
    const currentExpression: string | null = field?.current_expression ?? null
    const sourceExcerpts: string[] = (field?.source_excerpts ?? []).filter(Boolean).slice(0, 5)

    // 2. Load developmental history
    const historyResult = fieldId
      ? await query(
          `SELECT expression, change_note, authored_by, created_at
           FROM personal_living_field_versions
           WHERE field_id = $1
           ORDER BY created_at DESC
           LIMIT 5`,
          [fieldId]
        )
      : { rows: [] }
    const history = historyResult.rows

    // 3. Load recent states (last 14 days)
    const statesResult = await query(
      `SELECT state_key, label, intensity, created_at
       FROM personal_states
       WHERE member_id = $1
         AND created_at > NOW() - INTERVAL '14 days'
       ORDER BY created_at DESC
       LIMIT 10`,
      [memberId]
    )
    const states = statesResult.rows

    // 4. Load atom affinities for this field (member-triggered = include member_pulled)
    const atomsResult = await query<{
      title: string
      body: string | null
      source_type: string
      primary_register: string | null
      affinity_score: number
    }>(
      `SELECT a.title, a.body, a.source_type, a.primary_register, lfa.affinity_score
       FROM living_field_affinities lfa
       JOIN member_memory_atoms a ON a.id = lfa.atom_id
       WHERE lfa.member_id = $1
         AND lfa.field_key = $2
         AND a.status NOT IN ('protected', 'archived')
         AND a.primary_register != 'sacred_protected'
         AND 'sacred_protected' != ALL(a.registers)
       ORDER BY lfa.affinity_score DESC
       LIMIT 10`,
      [memberId, fieldKey]
    )
    const affinityAtoms = atomsResult.rows

    // 6. If nothing has gathered, return invitation
    const hasAnything = currentExpression || sourceExcerpts.length > 0 || history.length > 0 || states.length > 0 || affinityAtoms.length > 0
    if (!hasAnything) {
      return NextResponse.json({
        candidate_expression: null,
        sources_used: [],
        rationale: 'Not enough has gathered in this field yet to draft from. You can write directly, speak, or explore it with MAIA.',
      })
    }

    // 5. Build source inventory for prompt and response
    const sourcesUsed: string[] = []
    const parts: string[] = []

    if (currentExpression) {
      parts.push(`Current expression the member has written:\n"${currentExpression}"`)
      sourcesUsed.push('current_expression')
    }
    if (sourceExcerpts.length > 0) {
      parts.push(`Excerpts from sources the member connected to this field:\n${sourceExcerpts.map((e, i) => `- [source ${i + 1}] ${e}`).join('\n')}`)
      sourcesUsed.push(...sourceExcerpts.map((_, i) => `source_excerpt_${i + 1}`))
    }
    if (history.length > 0) {
      const histLines = history.map(h => `- "${h.expression}"${h.change_note ? ` (note: ${h.change_note})` : ''} — by ${h.authored_by}`).join('\n')
      parts.push(`Developmental history (most recent first):\n${histLines}`)
      sourcesUsed.push('developmental_history')
    }
    if (states.length > 0) {
      const stateLines = states.map(s => `- ${s.label}${s.intensity != null ? ` (intensity: ${s.intensity})` : ''}`).join('\n')
      parts.push(`Recent states the member has reported (last 14 days):\n${stateLines}`)
      sourcesUsed.push('recent_states')
    }
    if (affinityAtoms.length > 0) {
      const atomLines = affinityAtoms.map(a =>
        `[Keep: "${a.title}"]\n${a.body ?? `(sourced from ${a.source_type})`}\nRegister: ${a.primary_register ?? 'unset'}`
      ).join('\n\n')
      parts.push(`KEEPS / MEMORY ATOMS (what this member has chosen to hold):\n${atomLines}`)
      sourcesUsed.push(...affinityAtoms.map(a => a.title))
    }

    const gatheredMaterial = parts.join('\n\n')

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
