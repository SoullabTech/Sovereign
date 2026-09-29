import { NextRequest, NextResponse } from 'next/server'
import { generateWithLocalModel } from '@/lib/ai/localModelClient'
import {
  buildRealityVetoSystemPrompt,
  buildRealityVetoUserPrompt,
  grammarForRealityRelation,
  isRealityVetoBoundaryError,
  validateRealityVetoOutput,
} from '@/lib/maia/life-loop/realityVeto'

export const dynamic = 'force-dynamic'

const MAX_TEXT_LENGTH = 3000

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'NOT_AVAILABLE' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const expectation =
    typeof body?.expectation === 'string' ? body.expectation.trim() : ''
  const consequence =
    typeof body?.consequence === 'string' ? body.consequence.trim() : ''

  if (!expectation || !consequence) {
    return NextResponse.json(
      { error: 'EXPECTATION_AND_CONSEQUENCE_REQUIRED' },
      { status: 400 },
    )
  }

  if (
    expectation.length > MAX_TEXT_LENGTH ||
    consequence.length > MAX_TEXT_LENGTH
  ) {
    return NextResponse.json({ error: 'INPUT_TOO_LONG' }, { status: 413 })
  }

  try {
    const generated = await generateWithLocalModel({
      systemPrompt: buildRealityVetoSystemPrompt(),
      userInput: buildRealityVetoUserPrompt(expectation, consequence),
      meta: {
        surface: 'maia-soul-service-reality-veto-pilot',
        persistence: 'none',
        memory: 'none',
      },
    })

    const relation = validateRealityVetoOutput(generated.text)

    return NextResponse.json({
      comparison: grammarForRealityRelation(relation),
      expectationStanding: 'HISTORICAL_MEMBER_EXPECTATION',
      consequenceStanding: 'MEMBER_REPORTED_LIVED_EVIDENCE',
      persistence: 'none',
      provider: {
        kind: generated.provider?.provider ?? 'local',
        model: generated.provider?.model ?? null,
      },
    })
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'REALITY_VETO_FAILED'

    if (isRealityVetoBoundaryError(error)) {
      return NextResponse.json(
        {
          abstained: true,
          reason:
            'MAIA could not classify the evidence relationship within the permitted boundary.',
          boundary: reason,
          persistence: 'none',
        },
        { status: 422 },
      )
    }

    return NextResponse.json(
      {
        error: 'REALITY_VETO_FAILED',
        reason,
        persistence: 'none',
      },
      { status: 502 },
    )
  }
}
