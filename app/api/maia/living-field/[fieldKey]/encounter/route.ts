// POST /api/maia/living-field/[fieldKey]/encounter
//
// The Living Encounter — conversation-first entry into a Living Field dimension
// (Wave 2, Move 1: docs/specs/LIVING_FIELD_IDEAL_BUILD_2026-07-05.md §5).
//
// Conversation ↔ Field; everything else is a projection. This route opens/continues/
// closes a `living_encounters` row and appends append-only events to
// `living_encounter_events`. Proposals carry zero authority until member-confirmed —
// this route emits only 'utterance' / 'maia_utterance' turns plus two purely
// structural observables ('interruption': abandoned-encounter fact, 'friction':
// failed-turn fact). No semantic interpretation, no sentiment detection, no identity
// conclusions — MAIA surfaces/suggests/organizes, never concludes.

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import Anthropic from '@anthropic-ai/sdk'
import { buildEncounterContext, formatGatheredMaterial } from '@/lib/maia/living-field/encounterContext'
import { CANONICAL_FIELD_KEYS } from '@/lib/maia/living-field/canonicalFieldKeys'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const SONNET_MODEL = 'claude-sonnet-5'

// An encounter left open this long without a 'close' is treated as abandoned —
// a structural fact recorded (once) at the next time this field is opened.
const ABANDONED_AFTER_MS = 30 * 60 * 1000

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}

function fieldLabel(fieldKey: string): string {
  return CANONICAL_FIELD_KEYS.find((f) => f.key === fieldKey)?.label ?? fieldKey
}

interface EncounterRow {
  id: string
  status: 'open' | 'closed'
  opened_at: string
  closed_at: string | null
}

async function appendEvent(
  encounterId: string,
  memberId: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  await query(
    `INSERT INTO living_encounter_events (encounter_id, member_id, event_type, payload)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [encounterId, memberId, eventType, JSON.stringify(payload)]
  )
}

/**
 * Structural observable: if the most recent encounter for this field was left
 * open past ABANDONED_AFTER_MS with no matching close, record ONE 'interruption'
 * event (signal:'abandoned') and close it out. Purely structural — no content read.
 */
async function recordAbandonedIfAny(memberId: string, fieldKey: string) {
  const abandonedAfterMinutes = ABANDONED_AFTER_MS / 60000
  const stale = await query<EncounterRow>(
    `SELECT id, status, opened_at, closed_at
     FROM living_encounters
     WHERE member_id = $1 AND field_key = $2 AND status = 'open'
       AND opened_at < NOW() - make_interval(mins => $3)
     ORDER BY opened_at DESC`,
    [memberId, fieldKey, abandonedAfterMinutes]
  )
  for (const row of stale.rows) {
    await appendEvent(row.id, memberId, 'interruption', {
      source: 'structural',
      signal: 'abandoned',
    })
    await query(`UPDATE living_encounters SET status = 'closed', closed_at = NOW() WHERE id = $1`, [row.id])
  }
}

async function findOrOpenEncounter(memberId: string, fieldKey: string): Promise<EncounterRow> {
  await recordAbandonedIfAny(memberId, fieldKey)

  const existing = await query<EncounterRow>(
    `SELECT id, status, opened_at, closed_at
     FROM living_encounters
     WHERE member_id = $1 AND field_key = $2 AND status = 'open'
     ORDER BY opened_at DESC
     LIMIT 1`,
    [memberId, fieldKey]
  )
  if (existing.rows[0]) return existing.rows[0]

  const created = await query<EncounterRow>(
    `INSERT INTO living_encounters (member_id, field_key)
     VALUES ($1, $2)
     RETURNING id, status, opened_at, closed_at`,
    [memberId, fieldKey]
  )
  return created.rows[0]
}

function buildSystemPrompt(fieldKey: string, ctx: Awaited<ReturnType<typeof buildEncounterContext>>): string {
  const { gatheredMaterial } = formatGatheredMaterial(ctx)
  const label = fieldLabel(fieldKey)

  return `You are MAIA, present with a member inside one dimension of their Personal Living Field: "${label}".

This is a conversation, not a form. You already hold what has gathered here — speak from inside it, don't ask the member to re-explain what you already know.

What has gathered in this dimension so far:
${gatheredMaterial || '(Nothing has gathered here yet — this is a first encounter.)'}

Rules — these are constitutional, not stylistic:
- Never say "you are…", never diagnose, never assert identity or certainty about who the member is or is becoming.
- You may reference a gathered Keep by its title and its warrant ("you kept something called '${'{title}'}' because ${'{warrant}'}") — but only to invite, never to conclude.
- Any proposal about phase, state, or development must be framed as a genuine question the member can decline ("does that feel right?", "would you call it that?") — never a statement.
- Ask real questions. Be curious about specifics, not generic.
- Warm, brief: 2-5 sentences per turn. This is a conversation, not an essay.
- The member's own words always outrank your suggested vocabulary — if they name something differently than you did, use their word from then on.
- You do not conclude. You do not summarize their identity. You reflect, ask, and hold what they bring.`
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
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action = body?.action
  if (action !== 'open' && action !== 'turn' && action !== 'close') {
    return NextResponse.json({ error: "action must be 'open', 'turn', or 'close'" }, { status: 400 })
  }

  try {
    if (action === 'open') {
      const encounter = await findOrOpenEncounter(memberId, fieldKey)
      const ctx = await buildEncounterContext(memberId, fieldKey)

      let greeting: string
      const client = getAnthropicClient()
      if (!client) {
        greeting = ctx.hasAnything
          ? `I'm here with you in ${fieldLabel(fieldKey)}. What's alive in this right now?`
          : `I'm here with you in ${fieldLabel(fieldKey)}. Nothing has gathered here yet — what would you like to bring?`
      } else {
        const systemPrompt = buildSystemPrompt(fieldKey, ctx)
        const response = await client.messages.create({
          model: SONNET_MODEL,
          max_tokens: 400,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content:
                'The member has just opened this dimension to talk with you. Offer a short, warm opening (2-4 sentences) grounded in what has gathered here, if anything. Invite them in with a real question. Do not summarize their identity.',
            },
          ],
        })
        greeting = response.content
          .filter((b) => b.type === 'text')
          .map((b) => (b as { type: 'text'; text: string }).text)
          .join('')
          .trim()
      }

      await appendEvent(encounter.id, memberId, 'maia_utterance', { text: greeting, turn: 'greeting' })

      return NextResponse.json({ encounter_id: encounter.id, greeting })
    }

    if (action === 'turn') {
      const encounterId = body?.encounter_id
      const text = typeof body?.text === 'string' ? body.text.trim() : ''
      if (!encounterId || typeof encounterId !== 'string') {
        return NextResponse.json({ error: 'encounter_id required' }, { status: 400 })
      }
      if (!text) {
        return NextResponse.json({ error: 'text required' }, { status: 400 })
      }

      const encounterResult = await query<EncounterRow>(
        `SELECT id, status, opened_at, closed_at FROM living_encounters
         WHERE id = $1 AND member_id = $2 AND field_key = $3`,
        [encounterId, memberId, fieldKey]
      )
      const encounter = encounterResult.rows[0]
      if (!encounter) {
        return NextResponse.json({ error: 'Encounter not found' }, { status: 404 })
      }
      if (encounter.status !== 'open') {
        return NextResponse.json({ error: 'Encounter is closed' }, { status: 409 })
      }

      await appendEvent(encounter.id, memberId, 'utterance', { text })

      // Recent turns for conversational continuity within this encounter.
      const recentTurns = await query<{ event_type: string; payload: any }>(
        `SELECT event_type, payload FROM living_encounter_events
         WHERE encounter_id = $1 AND event_type IN ('utterance', 'maia_utterance')
         ORDER BY id DESC LIMIT 20`,
        [encounter.id]
      )
      const turnsChron = recentTurns.rows.reverse()
      const messages = turnsChron
        .map((t) => ({
          role: t.event_type === 'utterance' ? ('user' as const) : ('assistant' as const),
          content: String(t.payload?.text ?? ''),
        }))
        .filter((m) => m.content)

      const ctx = await buildEncounterContext(memberId, fieldKey)
      const client = getAnthropicClient()

      if (!client) {
        const reply =
          "I'm here, though I can't reach my full voice right now — the connection to Claude is unavailable. Keep talking; I'm listening, and this will still be recorded."
        await appendEvent(encounter.id, memberId, 'maia_utterance', { text: reply, turn: 'fallback' })
        return NextResponse.json({ reply })
      }

      try {
        const systemPrompt = buildSystemPrompt(fieldKey, ctx)
        const response = await client.messages.create({
          model: SONNET_MODEL,
          max_tokens: 500,
          system: systemPrompt,
          messages: messages.length > 0 ? messages : [{ role: 'user', content: text }],
        })
        const reply = response.content
          .filter((b) => b.type === 'text')
          .map((b) => (b as { type: 'text'; text: string }).text)
          .join('')
          .trim()

        await appendEvent(encounter.id, memberId, 'maia_utterance', { text: reply })

        return NextResponse.json({ reply })
      } catch (err) {
        // Structural observable: a turn failed after the member spoke. Fact only —
        // no interpretation of why, no sentiment read on the member's utterance.
        console.error('[living-field/encounter] turn error', err)
        await appendEvent(encounter.id, memberId, 'friction', {
          source: 'structural',
          signal: 'turn_error',
        })
        return NextResponse.json({ error: 'MAIA could not respond just now. Try again.' }, { status: 502 })
      }
    }

    // action === 'close'
    const encounterId = body?.encounter_id
    if (!encounterId || typeof encounterId !== 'string') {
      return NextResponse.json({ error: 'encounter_id required' }, { status: 400 })
    }
    const closedResult = await query<EncounterRow>(
      `UPDATE living_encounters
       SET status = 'closed', closed_at = NOW()
       WHERE id = $1 AND member_id = $2 AND field_key = $3 AND status = 'open'
       RETURNING id, status, opened_at, closed_at`,
      [encounterId, memberId, fieldKey]
    )
    if (!closedResult.rows[0]) {
      return NextResponse.json({ closed: true }) // already closed or not found — idempotent
    }
    return NextResponse.json({ closed: true })
  } catch (err) {
    console.error('[living-field/encounter] POST error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH — member-marked evidence (highest-authority observation): friction,
 * interruption, novelty, recovery. The member is the instrument; no explanation
 * demanded. This is observation, not interpretation — MAIA does not classify.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { fieldKey: string } }
) {
  const memberId = request.headers.get('x-member-id')
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }
  const { fieldKey } = params

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const encounterId = body?.encounter_id
  const mark = body?.mark
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 500) : undefined
  const validMarks = ['friction', 'interruption', 'novelty', 'recovery']
  if (!encounterId || typeof encounterId !== 'string') {
    return NextResponse.json({ error: 'encounter_id required' }, { status: 400 })
  }
  if (!validMarks.includes(mark)) {
    return NextResponse.json({ error: `mark must be one of: ${validMarks.join(', ')}` }, { status: 400 })
  }

  try {
    const encounterResult = await query<EncounterRow>(
      `SELECT id FROM living_encounters WHERE id = $1 AND member_id = $2 AND field_key = $3`,
      [encounterId, memberId, fieldKey]
    )
    if (!encounterResult.rows[0]) {
      return NextResponse.json({ error: 'Encounter not found' }, { status: 404 })
    }

    await appendEvent(encounterId, memberId, mark, {
      source: 'member_marked',
      ...(note ? { note } : {}),
    })

    return NextResponse.json({ marked: true })
  } catch (err) {
    console.error('[living-field/encounter] PATCH error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
