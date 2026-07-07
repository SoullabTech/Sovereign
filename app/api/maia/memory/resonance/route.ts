// POST /api/maia/memory/resonance
// Search historical dreams, journal entries, and symbolic content for resonance with current context
// Used by MCP: search_symbolic_resonance

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { VectorEmbeddingService } from '@/lib/vector-embeddings'

const CONTENT_TYPE_KEYWORDS: Record<string, string[]> = {
  dream: ['dream', 'dreamed', 'dreaming', 'nightmare', 'sleep', 'vision while sleeping'],
  journal: ['journal', 'wrote', 'writing', 'entry', 'reflection', 'processed'],
  vision: ['vision', 'saw', 'appeared', 'revelation', 'glimpse', 'showed me'],
  insight: ['realized', 'understood', 'clarity', 'breakthrough', 'insight', 'dawned']
}

// Infer content type from text
function inferContentType(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()

  for (const [type, keywords] of Object.entries(CONTENT_TYPE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return type
    }
  }
  return 'experience'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      memberId,
      queryText,
      contentTypes,
      maxAgeDays = 365,
      limit = 5
    } = body

    // Validation
    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(memberId)) {
      return NextResponse.json({ error: 'Invalid memberId format' }, { status: 400 })
    }

    if (!queryText || queryText.length < 3) {
      return NextResponse.json({ error: 'queryText required (min 3 chars)' }, { status: 400 })
    }

    if (queryText.length > 1000) {
      return NextResponse.json({ error: 'queryText too long (max 1000 chars)' }, { status: 400 })
    }

    const cappedDays = Math.min(Math.max(maxAgeDays, 1), 730)
    const cappedLimit = Math.min(Math.max(limit, 1), 10)

    // Generate embedding for query
    const embedder = new VectorEmbeddingService({
      dimension: 768
    })

    const queryVector = await embedder.getEmbedding(queryText)

    // Search episodic memories using vector similarity
    // First try pgvector, fall back to text search if not available
    let matches: Array<{
      id: number
      episodeId: string
      title: string
      description: string
      context: string | null
      timestamp: Date
      significance: number
      emotionalIntensity: number
      spiralStage: string | null
      archetypes: unknown[]
      similarity: number
      inferredType: string
    }> = []

    try {
      // Try pgvector search first
      const vectorResult = await query(
        `SELECT
          id,
          episode_id,
          experience_title,
          experience_description,
          experience_context,
          timestamp,
          significance,
          emotional_intensity,
          spiral_stage,
          archetypal_resonances,
          1 - (semantic_vector <=> $2::vector) as similarity
        FROM episodic_memories
        WHERE user_id = $1
          AND timestamp >= NOW() - INTERVAL '${cappedDays} days'
          AND semantic_vector IS NOT NULL
        ORDER BY semantic_vector <=> $2::vector
        LIMIT $3`,
        [memberId, `[${queryVector.join(',')}]`, cappedLimit * 2] // Get extra for filtering
      )

      matches = vectorResult.rows.map(row => ({
        id: row.id,
        episodeId: row.episode_id,
        title: row.experience_title,
        description: row.experience_description,
        context: row.experience_context,
        timestamp: row.timestamp,
        significance: row.significance,
        emotionalIntensity: parseFloat(row.emotional_intensity),
        spiralStage: row.spiral_stage,
        archetypes: row.archetypal_resonances || [],
        similarity: parseFloat(row.similarity),
        inferredType: inferContentType(row.experience_title, row.experience_description)
      }))

    } catch (vectorError) {
      // Fall back to text-based search with in-memory similarity
      console.error('[memory/resonance] Vector search failed, using text fallback:', vectorError)

      const textResult = await query(
        `SELECT
          id,
          episode_id,
          experience_title,
          experience_description,
          experience_context,
          timestamp,
          significance,
          emotional_intensity,
          spiral_stage,
          archetypal_resonances,
          semantic_vector
        FROM episodic_memories
        WHERE user_id = $1
          AND timestamp >= NOW() - INTERVAL '${cappedDays} days'
        ORDER BY significance DESC, timestamp DESC
        LIMIT 50`,
        [memberId]
      )

      // Calculate similarity in memory
      for (const row of textResult.rows) {
        let similarity = 0

        if (row.semantic_vector && Array.isArray(row.semantic_vector) && row.semantic_vector.length > 0) {
          // Calculate cosine similarity
          const storedVector = row.semantic_vector as number[]
          if (storedVector.length === queryVector.length) {
            let dotProduct = 0
            let norm1 = 0
            let norm2 = 0
            for (let i = 0; i < queryVector.length; i++) {
              dotProduct += queryVector[i] * storedVector[i]
              norm1 += queryVector[i] * queryVector[i]
              norm2 += storedVector[i] * storedVector[i]
            }
            similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
          }
        } else {
          // Text-based similarity fallback
          const text = `${row.experience_title} ${row.experience_description}`.toLowerCase()
          const queryLower = queryText.toLowerCase()
          const words = queryLower.split(/\s+/)
          const matchingWords = words.filter(w => text.includes(w))
          similarity = matchingWords.length / words.length
        }

        matches.push({
          id: row.id,
          episodeId: row.episode_id,
          title: row.experience_title,
          description: row.experience_description,
          context: row.experience_context,
          timestamp: row.timestamp,
          significance: row.significance,
          emotionalIntensity: parseFloat(row.emotional_intensity),
          spiralStage: row.spiral_stage,
          archetypes: row.archetypal_resonances || [],
          similarity,
          inferredType: inferContentType(row.experience_title, row.experience_description)
        })
      }

      // Sort by similarity
      matches.sort((a, b) => b.similarity - a.similarity)
    }

    // Filter by content types if specified
    if (contentTypes && Array.isArray(contentTypes) && contentTypes.length > 0) {
      matches = matches.filter(m => contentTypes.includes(m.inferredType))
    }

    // Take top N
    matches = matches.slice(0, cappedLimit)

    // Filter out low similarity matches
    matches = matches.filter(m => m.similarity > 0.1)

    // Format response with snippets (not full content)
    const resonances = matches.map(m => ({
      id: m.episodeId,
      type: m.inferredType,
      title: m.title,
      snippet: m.description.slice(0, 200) + (m.description.length > 200 ? '...' : ''),
      occurredAt: m.timestamp,
      similarity: Math.round(m.similarity * 100) / 100,
      significance: m.significance,
      emotionalIntensity: m.emotionalIntensity,
      spiralStage: m.spiralStage,
      archetypes: (m.archetypes as string[]).slice(0, 3)
    }))

    return NextResponse.json({
      resonances,
      count: resonances.length,
      query: {
        text: queryText.slice(0, 100),
        maxAgeDays: cappedDays,
        contentTypes: contentTypes || 'all'
      }
    })

  } catch (error) {
    console.error('[memory/resonance] Error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
