// POST /api/maia/memory/ingest
// Writes a memory item to episodic_memories WITH embedding for later resonance search.
// Used by: journal upload, dream capture, session summaries, insight logging

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { VectorEmbeddingService } from '@/lib/vector-embeddings'
import { randomUUID } from 'crypto'

const CONTENT_TYPES = ['dream', 'journal', 'vision', 'insight', 'session_note'] as const
type ContentType = typeof CONTENT_TYPES[number]

// Generate embedding for semantic search
async function embedText(text: string): Promise<number[]> {
  try {
    const embedder = new VectorEmbeddingService({
      dimension: 768
    })
    return await embedder.getEmbedding(text)
  } catch (err) {
    console.error('[memory/ingest] Embedding failed, using deterministic fallback:', err)
    // Deterministic fallback for dev/testing
    const dim = 768
    const v = new Array(dim).fill(0)
    let h = 0
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
    for (let i = 0; i < dim; i++) v[i] = ((h ^ (i * 2654435761)) >>> 0) / 2 ** 32
    return v
  }
}

// Map content type to title prefix for inferContentType in resonance search
function titleForType(contentType: ContentType, rawTitle?: string): string {
  if (rawTitle) return rawTitle

  const prefixes: Record<ContentType, string> = {
    dream: 'Dream:',
    journal: 'Journal entry:',
    vision: 'Vision:',
    insight: 'Insight:',
    session_note: 'Session reflection:'
  }
  return prefixes[contentType] || 'Experience:'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      memberId,
      contentType,
      text,
      title,
      context,
      occurredAt,
      source = 'user',
      significance = 5,
      emotionalIntensity = 0.5,
      spiralStage,
      archetypes = [],
      metadata = {}
    } = body

    // Validation
    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(memberId)) {
      return NextResponse.json({ error: 'Invalid memberId format' }, { status: 400 })
    }

    if (!contentType || !CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({
        error: `contentType required, must be one of: ${CONTENT_TYPES.join(', ')}`
      }, { status: 400 })
    }

    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'text required (min 10 chars)' }, { status: 400 })
    }

    if (text.length > 20000) {
      return NextResponse.json({ error: 'text too long (max 20000 chars)' }, { status: 400 })
    }

    // Generate unique episode ID
    const episodeId = `${contentType}-${Date.now()}-${randomUUID().slice(0, 8)}`

    // Generate embedding
    const embedding = await embedText(text)

    // Build title from content type if not provided
    const experienceTitle = titleForType(contentType as ContentType, title)

    // Timestamp
    const timestamp = occurredAt ? new Date(occurredAt) : new Date()

    // Insert into episodic_memories
    const result = await query(
      `INSERT INTO episodic_memories (
        user_id,
        episode_id,
        timestamp,
        experience_title,
        experience_description,
        experience_context,
        significance,
        emotional_intensity,
        semantic_vector,
        spiral_stage,
        archetypal_resonances
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, episode_id`,
      [
        memberId,
        episodeId,
        timestamp,
        experienceTitle,
        text,
        context || null,
        Math.min(Math.max(significance, 1), 10),
        Math.min(Math.max(emotionalIntensity, 0), 1),
        JSON.stringify(embedding),
        spiralStage || null,
        JSON.stringify(archetypes)
      ]
    )

    const inserted = result.rows[0]

    return NextResponse.json({
      success: true,
      id: inserted.id,
      episodeId: inserted.episode_id,
      contentType,
      embeddingDimension: embedding.length
    })

  } catch (error) {
    console.error('[memory/ingest] Error:', error)
    return NextResponse.json({ error: 'Ingestion failed' }, { status: 500 })
  }
}
