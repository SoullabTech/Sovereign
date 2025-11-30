// streaming.chat.routes.ts - Real-time streaming chat with chunked TTS
import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { streamingVoiceService } from '../services/StreamingVoiceService';
import OpenAI from 'openai';
import { personalOracleAgent } from '../agents/PersonalOracleAgent';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/v1/stream/chat
 * Streaming chat with real-time TTS chunks
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message, userId = 'anon', sessionId, element = 'aether' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const streamSessionId = sessionId || `stream-${userId}-${Date.now()}`;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Setup voice streaming
  streamingVoiceService.setupSSE(res, streamSessionId);

  const send = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    logger.info('🚀 [StreamingChat] Starting streaming conversation', {
      userId,
      sessionId: streamSessionId,
      message: message.substring(0, 50)
    });

    // Send initial metadata
    send('meta', {
      sessionId: streamSessionId,
      model: 'maya-streaming',
      pipeline: ['openai-stream', 'chunk-detection', 'parallel-tts'],
      startTime: Date.now()
    });

    // Get Maya's personality context
    const mayaContext = await personalOracleAgent.getStreamingContext({
      userId,
      sessionId: streamSessionId,
      element
    });

    // Start OpenAI streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: mayaContext.systemPrompt || `You are Maya, a warm, intuitive oracle guide. 
            Speak naturally and conversationally. Keep responses concise but meaningful.
            Use natural pauses and rhythm in your speech.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      stream: true,
      temperature: 0.8,
      max_tokens: 500,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    let accumulatedText = '';
    let currentChunk = '';
    let chunkCount = 0;

    // Process streaming tokens
    for await (const part of stream) {
      const content = part.choices[0]?.delta?.content || '';
      
      if (content) {
        accumulatedText += content;
        currentChunk += content;
        
        // Send text delta to client
        send('text-delta', { content });

        // Check for sentence boundaries
        if (/[.!?]/.test(content)) {
          // We've hit a punctuation mark - process the chunk
          if (currentChunk.trim().length > 10) { // Min length for TTS
            chunkCount++;
            
            // Process TTS in background (non-blocking)
            streamingVoiceService.processStreamingText(
              currentChunk.trim(),
              `${streamSessionId}-${chunkCount}`
            ).catch(error => {
              logger.error('🔊 [StreamingChat] TTS processing error', { error });
            });

            // Reset current chunk
            currentChunk = '';
          }
        }
      }

      // Check for completion
      if (part.choices[0]?.finish_reason) {
        // Process any remaining text
        if (currentChunk.trim().length > 0) {
          chunkCount++;
          await streamingVoiceService.processStreamingText(
            currentChunk.trim(),
            `${streamSessionId}-${chunkCount}`
          );
        }

        // Send completion event
        send('complete', {
          totalText: accumulatedText,
          chunks: chunkCount,
          duration: Date.now() - Date.now()
        });

        logger.info('🎯 [StreamingChat] Stream complete', {
          sessionId: streamSessionId,
          totalChunks: chunkCount,
          textLength: accumulatedText.length
        });
      }
    }

  } catch (error) {
    logger.error('💥 [StreamingChat] Stream error', { error });
    send('error', { 
      message: 'Stream processing error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Keep connection open for audio chunks to complete
    setTimeout(() => {
      send('stream-end', { status: 'complete' });
      res.end();
    }, 5000); // Give audio chunks time to process
  }
});

/**
 * GET /api/v1/stream/status
 * Get streaming service status
 */
router.get('/status', (req: Request, res: Response) => {
  const status = streamingVoiceService.getStatus();
  res.json({
    service: 'streaming-voice',
    ...status,
    timestamp: Date.now()
  });
});

export default router;