import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';import { v4 as uuidv4 } from 'uuid';

// SSE Streaming Oracle Chat with Real-time TTS
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const { 
      message, 
      oracle = 'Maya', 
      sessionId, 
      element = 'aether', 
      enableVoice = true, 
      voiceEngine = 'auto',
      useCSM = true,
      emotionalState,
      fallbackEnabled = true
    } = await request.json();
    
    if (!message) {
      return new Response(
        encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Missing message' })}\n\n`),
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id') || 'anonymous';
    const currentSessionId = sessionId || `session-${Date.now()}`;
    const threadId = request.headers.get('x-thread-id') || currentSessionId;

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'start', 
              sessionId: currentSessionId,
              oracle,
              element 
            })}\n\n`)
          );

          // Connect to backend streaming endpoint
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
          const response = await fetch(`${backendUrl}/api/v1/converse/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
              'x-session-id': currentSessionId,
              'x-thread-id': threadId
            },
            body: JSON.stringify({
              userText: message,
              element,
              userId,
              stream: true,
              enableVoice,
              useCSM,
              emotionalState,
              metadata: {
                oracle,
                sessionId: currentSessionId,
                threadId,
                personality: 'adaptive mystical guide',
                voiceProfile: 'maya_oracle_v1',
                voiceEngine
              }
            })
          });

          if (!response.ok) {
            throw new Error(`Backend request failed: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          let buffer = '';
          let sentenceBuffer = '';
          let chunkIndex = 0;

          // Process streaming response
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Parse SSE events from buffer
            const lines = buffer.split('\n');
            buffer = lines[lines.length - 1]; // Keep incomplete line

            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'chunk' && data.text) {
                    // Accumulate text for sentence detection
                    sentenceBuffer += data.text;
                    
                    // Send text chunk immediately for display
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({
                        type: 'text',
                        text: data.text
                      })}\n\n`)
                    );

                    // Check for sentence boundaries
                    const sentenceEnd = /[.!?]\s*$/.test(sentenceBuffer);
                    const longPhrase = sentenceBuffer.length > 80; // Arbitrary threshold
                    const naturalBreak = /[,;:]\s*$/.test(sentenceBuffer);
                    
                    if (sentenceEnd || (longPhrase && naturalBreak)) {
                      const textToSpeak = sentenceBuffer.trim();
                      
                      if (textToSpeak && enableVoice) {
                        // Generate TTS for this chunk
                        chunkIndex++;
                        const chunkId = `${currentSessionId}-${chunkIndex}-${uuidv4().slice(0, 8)}`;
                        
                        // Spawn async TTS generation (non-blocking)
                        generateTTSChunk(
                          textToSpeak,
                          chunkId,
                          element,
                          voiceEngine,
                          useCSM,
                          fallbackEnabled,
                          controller,
                          encoder
                        );
                      }
                      
                      // Reset sentence buffer
                      sentenceBuffer = '';
                    }
                  } else if (data.type === 'done') {
                    // Process any remaining text
                    if (sentenceBuffer.trim() && enableVoice) {
                      chunkIndex++;
                      const chunkId = `${currentSessionId}-${chunkIndex}-${uuidv4().slice(0, 8)}`;
                      
                      await generateTTSChunk(
                        sentenceBuffer.trim(),
                        chunkId,
                        element,
                        voiceEngine,
                        useCSM,
                        fallbackEnabled,
                        controller,
                        encoder
                      );
                    }
                    
                    // Send completion event
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({
                        type: 'done',
                        metadata: data.metadata || {}
                      })}\n\n`)
                    );
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              message: error instanceof Error ? error.message : 'Stream error'
            })}\n\n`)
          );
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Oracle stream error:', error);
    return new Response(
      encoder.encode(`data: ${JSON.stringify({
        type: 'error',
        message: 'Stream initialization failed'
      })}\n\n`),
      { status: 500 }
    );
  }
}

// Async TTS generation function
async function generateTTSChunk(
  text: string,
  chunkId: string,
  element: string,
  voiceEngine: string,
  useCSM: boolean,
  fallbackEnabled: boolean,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  try {
    const voiceUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/stream-chunk`
      : `http://localhost:3000/api/voice/stream-chunk`;
    
    const voiceResponse = await fetch(voiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        chunkId,
        element,
        voiceEngine,
        useCSM,
        fallbackEnabled
      })
    });
    
    if (voiceResponse.ok) {
      const voiceData = await voiceResponse.json();
      
      if (voiceData.success) {
        // Send audio event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'audio',
            chunkId,
            audioUrl: voiceData.audioUrl,
            audioData: voiceData.audioData,
            engine: voiceData.engine,
            duration: voiceData.duration
          })}\n\n`)
        );
      }
    }
  } catch (error) {
    console.error(`TTS chunk generation error for ${chunkId}:`, error);
    // Don't break the stream, just log the error
  }
}