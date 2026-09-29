import { NextRequest, NextResponse } from 'next/server'
import { generateWithLocalModel } from '@/lib/ai/localModelClient'
import {
  buildFrameDetectionSystemPrompt,
  buildFrameDetectionUserPrompt,
  frameForDimension,
  isFrameBoundaryError,
  validateFrameDetectionOutput,
} from '@/lib/maia/soul-service/frameDetection'

export const dynamic = 'force-dynamic'

const MAX_SOURCE_LENGTH = 2400

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'NOT_AVAILABLE' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const source = typeof body?.source === 'string' ? body.source.trim() : ''

  if (!source) {
    return NextResponse.json({ error: 'SOURCE_REQUIRED' }, { status: 400 })
  }
  if (source.length > MAX_SOURCE_LENGTH) {
    return NextResponse.json({ error: 'SOURCE_TOO_LONG' }, { status: 413 })
  }

  try {
    const generated = await generateWithLocalModel({
      systemPrompt: buildFrameDetectionSystemPrompt(),
      userInput: buildFrameDetectionUserPrompt(source),
      meta: {
        surface: 'maia-soul-service-frame-pilot',
        persistence: 'none',
        memory: 'none',
      },
    })

    const result = validateFrameDetectionOutput(generated.text)

    return NextResponse.json({
      source,
      possibleFrame: frameForDimension(result.primaryDimension),
      alternativeFrame: frameForDimension(result.alternativeDimension),
      scope: result.scope,
      persistence: 'none',
      provider: {
        kind: generated.provider?.provider ?? 'local',
        model: generated.provider?.model ?? null,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'FRAME_GENERATION_FAILED'
    if (isFrameBoundaryError(error)) {
      return NextResponse.json(
        {
          abstained: true,
          reason: 'MAIA could not choose two bounded apertures within this pilot.',
          boundary: message,
          persistence: 'none',
        },
        { status: 422 },
      )
    }
    return NextResponse.json(
      {
        error: 'FRAME_GENERATION_FAILED',
        reason: message,
        persistence: 'none',
      },
      { status: 502 },
    )
  }
}
