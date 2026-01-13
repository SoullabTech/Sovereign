// @ts-nocheck - Prototype streaming voice conversation
/**
 * Streaming Voice Conversation Endpoint
 *
 * SOVEREIGNTY: MAIA is the primary intelligence. Claude serves as her voice,
 * channeling responses through MAIA's essence, personality, and wisdom.
 * The system prompt establishes MAIA's identity - Claude never speaks as itself.
 *
 * Flow: User message → MAIA (via Claude streaming) → TTS (per sentence) → Audio SSE
 *
 * This creates natural conversational flow by:
 * 1. Streaming MAIA's response sentence-by-sentence
 * 2. Immediately sending each sentence to TTS
 * 3. Streaming audio chunks back as they're ready
 *
 * The user hears MAIA begin speaking while she's still thinking.
 */

import { NextRequest } from 'next/server';
import { getClaudeService } from '@/lib/services/ClaudeService';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for long conversations

interface StreamRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  element?: string;
  voice?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * Synthesize a single sentence to audio using OpenAI TTS
 * Returns base64 audio data or null on failure
 */
async function synthesizeSentence(
  text: string,
  voice: string = 'nova'
): Promise<{ audio: string; format: string } | null> {
  try {
    // Map voice parameter to OpenAI voices (nova is warm and natural)
    const openaiVoice = voice === 'maya' ? 'nova' : (voice || 'nova');

    const response = await synthesizeSpeech({
      text,
      voice: openaiVoice,
      format: 'mp3',
      speed: 1.0
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const audio = buffer.toString('base64');
    return { audio, format: 'mp3' };
  } catch (e) {
    console.error('[StreamConversation] OpenAI TTS failed:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body: StreamRequest = await req.json();
  const { message, userId, sessionId, element, voice, conversationHistory } = body;

  if (!message?.trim()) {
    return new Response('Missing message', { status: 400 });
  }

  const encoder = new TextEncoder();
  const claudeService = getClaudeService();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: any) => {
        const lines = [
          `event: ${event}`,
          `data: ${JSON.stringify(data)}`,
          ''
        ];
        controller.enqueue(encoder.encode(lines.join('\n') + '\n'));
      };

      // Send connection established
      emit('connected', { sessionId: sessionId || 'default', timestamp: Date.now() });

      try {
        const context = {
          element,
          conversationHistory,
          userName: undefined
        };

        let fullResponse = '';
        let audioChunksEmitted = 0;

        // Stream sentences from Claude
        for await (const chunk of claudeService.generateOracleResponseStreaming(
          message,
          context
        )) {
          if (chunk.type === 'sentence') {
            // Emit text immediately so UI can show it
            emit('text', {
              index: chunk.index,
              text: chunk.text,
              timestamp: Date.now()
            });

            fullResponse += chunk.text + ' ';

            // Generate TTS for this sentence (don't block next sentence)
            synthesizeSentence(chunk.text, voice).then(audioResult => {
              if (audioResult) {
                emit('audio', {
                  index: chunk.index,
                  audio: audioResult.audio,
                  format: audioResult.format,
                  text: chunk.text,
                  timestamp: Date.now()
                });
                audioChunksEmitted++;
              }
            }).catch(e => {
              console.error('[StreamConversation] TTS error:', e);
            });

          } else if (chunk.type === 'done') {
            // Wait a moment for any pending TTS to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            emit('complete', {
              fullResponse: fullResponse.trim(),
              sentenceCount: chunk.index,
              audioChunksEmitted,
              timestamp: Date.now()
            });
          }
        }

      } catch (error) {
        console.error('[StreamConversation] Error:', error);
        emit('error', {
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
