import { Router, Request, Response } from 'express';
import { ConversationalPipeline } from '../services/ConversationalPipeline';
import { logger } from '../utils/logger';
import { Readable } from 'stream';

const router = Router();
const conversationalPipeline = new ConversationalPipeline();

// SSE streaming endpoint
router.post('/api/v1/converse/stream', async (req: Request, res: Response) => {
  try {
    const { 
      userText, 
      element = 'aether', 
      userId = 'anonymous',
      metadata = {},
      stream = true,
      enableVoice = true,
      useCSM = true,
      emotionalState
    } = req.body;

    // Get session info from headers
    const sessionId = req.headers['x-session-id'] as string || `session-${Date.now()}`;
    const threadId = req.headers['x-thread-id'] as string || sessionId;

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send initial event
    res.write(`data: ${JSON.stringify({ 
      type: 'start', 
      sessionId,
      element,
      userId 
    })}\n\n`);

    // Process message with streaming
    const streamResponse = await conversationalPipeline.processStreamingMessage({
      userText,
      element,
      userId,
      sessionId,
      threadId,
      metadata: {
        ...metadata,
        stream: true,
        enableVoice,
        useCSM,
        emotionalState
      }
    });

    // Handle streaming response
    if (streamResponse && typeof streamResponse === 'object' && 'stream' in streamResponse) {
      const stream = streamResponse.stream as Readable;
      
      let buffer = '';
      
      stream.on('data', (chunk: any) => {
        try {
          // Convert chunk to string if needed
          const text = typeof chunk === 'string' ? chunk : chunk.toString();
          buffer += text;
          
          // Check for sentence boundaries
          const sentences = buffer.split(/([.!?]\s+)/);
          
          // Keep the last incomplete sentence in buffer
          if (sentences.length > 1) {
            const completeSentences = sentences.slice(0, -1).join('');
            buffer = sentences[sentences.length - 1];
            
            if (completeSentences.trim()) {
              res.write(`data: ${JSON.stringify({
                type: 'chunk',
                text: completeSentences
              })}\n\n`);
            }
          }
          
          // Also send raw chunks for immediate display
          res.write(`data: ${JSON.stringify({
            type: 'text',
            text: text
          })}\n\n`);
          
        } catch (error) {
          logger.error('Stream chunk processing error:', error);
        }
      });
      
      stream.on('end', () => {
        // Send any remaining buffer
        if (buffer.trim()) {
          res.write(`data: ${JSON.stringify({
            type: 'chunk',
            text: buffer
          })}\n\n`);
        }
        
        // Send completion event
        res.write(`data: ${JSON.stringify({
          type: 'done',
          metadata: streamResponse.metadata || {}
        })}\n\n`);
        
        res.end();
      });
      
      stream.on('error', (error: Error) => {
        logger.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: error.message
        })}\n\n`);
        res.end();
      });
      
    } else {
      // Fallback to non-streaming response
      const response = await conversationalPipeline.processMessage({
        userText,
        element,
        userId,
        sessionId,
        metadata
      });
      
      if (response && response.text) {
        // Send as complete chunk
        res.write(`data: ${JSON.stringify({
          type: 'chunk',
          text: response.text
        })}\n\n`);
      }
      
      res.write(`data: ${JSON.stringify({
        type: 'done',
        metadata: response?.metadata || {}
      })}\n\n`);
      
      res.end();
    }

  } catch (error) {
    logger.error('Streaming endpoint error:', error);
    
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error instanceof Error ? error.message : 'Streaming failed'
    })}\n\n`);
    
    res.end();
  }
});

// Health check endpoint
router.get('/api/v1/converse/health', (req: Request, res: Response) => {
  res.json({
    status: 'active',
    service: 'conversational-streaming',
    capabilities: {
      streaming: true,
      voiceGeneration: true,
      sesameIntegration: true,
      elevenLabsFallback: true
    },
    timestamp: new Date().toISOString()
  });
});

export default router;