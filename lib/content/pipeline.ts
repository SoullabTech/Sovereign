import { extractContent } from './extractor'
import { transformContent } from './transformer'
import { ContentSource, ExtractedContent, TransformedContent } from './types'
import {
  logAgentRunStart,
  logAgentRunEvent,
  logAgentRunComplete,
  computeAgentFlags,
  type AgentRunOutputSummary,
} from '@/lib/ai/agentMonitor'

export async function runContentPipeline(source: ContentSource): Promise<{
  extracted: ExtractedContent
  transformed: TransformedContent
  agentRunId: string
}> {
  const startTime = Date.now()

  // Log run start
  const agentRunId = await logAgentRunStart({
    agentName: 'content_pipeline_agent',
    sourceType: 'book_chapter',
    sourceId: source.id,
    sourceTitle: source.title,
    modelUsed: 'claude-sonnet-4-20250514',
    orchestrationMode: 'sequential',
    maxAttempts: 1,
  })

  await logAgentRunEvent({
    agentRunId,
    eventType: 'started',
    payload: { title: source.title, element: source.element, bodyLength: source.body.length },
  })

  let extracted: ExtractedContent
  let transformed: TransformedContent
  let schemaValid = true

  try {
    // Extract
    await logAgentRunEvent({ agentRunId, eventType: 'attempt_started', payload: { step: 'extract' } })
    extracted = await extractContent(source)

    await logAgentRunEvent({
      agentRunId,
      eventType: 'parsed_output',
      payload: {
        step: 'extract',
        passageCount: extracted.passages.length,
        quoteCount: extracted.quotes.length,
        summaryLength: extracted.summary.length,
      },
    })

    // Transform
    await logAgentRunEvent({ agentRunId, eventType: 'attempt_started', payload: { step: 'transform' } })
    transformed = await transformContent(extracted)

    await logAgentRunEvent({
      agentRunId,
      eventType: 'parsed_output',
      payload: {
        step: 'transform',
        shortPosts: transformed.shortPosts.length,
        longPosts: transformed.longPosts.length,
        poeticPosts: transformed.poeticPosts.length,
        audioScripts: transformed.audioScripts.length,
      },
    })
  } catch (error) {
    const durationMs = Date.now() - startTime
    const errorText = error instanceof Error ? error.message : String(error)

    await logAgentRunEvent({
      agentRunId,
      eventType: 'failed',
      payload: { error: errorText },
    })

    const flags = computeAgentFlags({
      attemptCount: 1,
      maxAttempts: 1,
      schemaValid: false,
      passagesExtracted: 0,
      passagesRejected: 0,
      runtimeError: true,
    })

    await logAgentRunComplete({
      agentRunId,
      status: 'failed',
      attemptCount: 1,
      retryCount: 0,
      durationMs,
      flags,
      errorText,
    })

    throw error
  }

  // Validate schema shape
  schemaValid =
    Array.isArray(extracted.passages) &&
    Array.isArray(extracted.quotes) &&
    typeof extracted.summary === 'string' &&
    Array.isArray(transformed.shortPosts) &&
    Array.isArray(transformed.longPosts) &&
    Array.isArray(transformed.poeticPosts) &&
    Array.isArray(transformed.audioScripts)

  const totalPosts =
    transformed.shortPosts.length +
    transformed.longPosts.length +
    transformed.poeticPosts.length +
    transformed.audioScripts.length

  const outputSummary: AgentRunOutputSummary = {
    passagesExtracted: extracted.passages.length,
    passagesRejected: 0,
    draftsSaved: 0, // updated when posts are saved
    schemaValid,
    genericToneScore: null,
    bannedPatternHits: 0,
    repeatedPhraseHits: 0,
  }

  const flags = computeAgentFlags({
    attemptCount: 1,
    maxAttempts: 1,
    schemaValid,
    passagesExtracted: extracted.passages.length,
    passagesRejected: 0,
  })

  const durationMs = Date.now() - startTime

  await logAgentRunEvent({
    agentRunId,
    eventType: 'completed',
    payload: { durationMs, totalPosts, flags },
  })

  await logAgentRunComplete({
    agentRunId,
    status: 'completed',
    attemptCount: 1,
    retryCount: 0,
    durationMs,
    outputSummary,
    flags,
  })

  return { extracted, transformed, agentRunId }
}
