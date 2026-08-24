import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { getLLMProvider } from '@/lib/consciousness/LLMProvider'
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request)

  if (!memberId) {
    return unauthenticatedResponse()
  }

  try {
    const body = await request.json()
    const { segmentId, question, ritualMode } = body

    if (!segmentId || !question) {
      return NextResponse.json({ error: 'segmentId and question required' }, { status: 400 })
    }

    // Get the segment text and surrounding context
    const segmentResult = await query(
      `SELECT s.*, c.title as chapter_title
       FROM audiobook_segments s
       JOIN audiobook_chapters c ON c.id = s.chapter_id
       WHERE s.id = $1`,
      [segmentId]
    )

    if (segmentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    const segment = segmentResult.rows[0]

    // Get surrounding segments for context
    const contextResult = await query(
      `SELECT text FROM audiobook_segments
       WHERE chapter_id = $1
       AND segment_index BETWEEN $2 AND $3
       ORDER BY segment_index`,
      [segment.chapter_id, segment.segment_index - 2, segment.segment_index + 2]
    )

    const context = contextResult.rows.map((r: { text: string }) => r.text).join('\n\n')

    // Build the prompt based on ritual mode
    const modeInstructions: Record<string, string> = {
      earth: 'Ground your response in practical wisdom. What can be applied today?',
      water: 'Flow with emotional resonance. What feelings arise? What healing is possible?',
      fire: 'Ignite transformation. What action does this inspire? What must be released?',
      air: 'Expand understanding. What connections emerge? What patterns become visible?',
      aether: 'Touch the transcendent. What deeper truth lives here? What is beyond words?'
    }

    const modeInstruction = ritualMode ? modeInstructions[ritualMode] || '' : ''

    const systemPrompt = `You are MAIA, a wisdom companion helping someone engage deeply with "Elemental Alchemy" by Kelly Nezat.

The reader is in the "${segment.chapter_title}" chapter, reflecting on this passage:
"${segment.text}"

Surrounding context:
${context}

${modeInstruction}

Respond with warmth, depth, and precision. Help them discover what this passage holds for them. Keep responses focused and meaningful (2-4 paragraphs).`

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt,
      messages: [{ role: 'user', content: question }],
      maxTokens: 1024,
    })

    const maiaResponse = llmResponse.text

    // Save as an insight moment
    await query(
      `INSERT INTO reading_moments (member_id, segment_id, moment_type, content, ritual_mode)
       VALUES ($1, $2, 'insight', $3, $4)`,
      [memberId, segmentId, `Q: ${question}\n\nMAIA: ${maiaResponse}`, ritualMode || null]
    )

    return NextResponse.json({ response: maiaResponse })
  } catch (error) {
    console.error('Error in Ask MAIA:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
