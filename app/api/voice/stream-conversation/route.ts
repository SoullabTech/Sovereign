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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for long conversations

// TTS endpoint configuration
const SESAME_URL = process.env.SESAME_URL || process.env.SESAME_CSM_URL || 'http://localhost:8000';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

interface StreamRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  element?: string;
  voice?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * Synthesize a single sentence to audio
 * Returns base64 audio data or null on failure
 */
async function synthesizeSentence(
  text: string,
  voice: string = 'maya'
): Promise<{ audio: string; format: string } | null> {
  // Try Sesame first
  try {
    const response = await fetch(`${SESAME_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        format: 'wav',
        speed: 1.0
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audio) {
        return { audio: data.audio, format: data.format || 'wav' };
      }
    }
  } catch (e) {
    console.warn('[StreamConversation] Sesame TTS failed, trying ElevenLabs');
  }

  // Fallback to ElevenLabs
  if (ELEVENLABS_API_KEY) {
    try {
      const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella - calm, clear
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5
            }
          }),
          signal: AbortSignal.timeout(10000)
        }
      );

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const audio = Buffer.from(buffer).toString('base64');
        return { audio, format: 'mp3' };
      }
    } catch (e) {
      console.error('[StreamConversation] ElevenLabs TTS failed:', e);
    }
  }

  return null;
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
