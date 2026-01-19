// @ts-nocheck - Prototype streaming voice conversation
/**
 * Streaming Voice Conversation Endpoint
 *
 * SOVEREIGNTY: MAIA is the primary intelligence. Claude serves as her voice,
 * channeling responses through MAIA's essence, personality, and wisdom.
 * The system prompt establishes MAIA's identity - Claude never speaks as itself.
 *
 * Flow: User message → Threshold check → (fast-path OR Claude streaming) → TTS → Audio SSE
 *
 * Latency optimization:
 * 1. Threshold fast-path bypasses LLM for minimal/fragile inputs
 * 2. Audio emits immediately as each chunk completes
 * 3. Clause-level chunking for faster first audio
 *
 * The user hears MAIA begin speaking while she's still thinking.
 */

import { NextRequest } from 'next/server';
import { getClaudeService } from '@/lib/services/ClaudeService';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';
import {
  processThreshold,
  createInitialThresholdState,
  createVoiceTimer,
  DEFAULT_MAIA_THRESHOLD_CONFIG,
  type ThresholdState,
} from '@/lib/threshold';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const maxDuration = 60; // Allow up to 60s for long conversations

interface StreamRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  element?: string;
  voice?: string;
  speed?: number;
  conversationHistory?: Array<{ role: string; content: string }>;
  thresholdState?: ThresholdState;  // Persisted threshold state across turns
}

/**
 * Synthesize a single sentence to audio using OpenAI TTS
 * Returns base64 audio data or null on failure
 */
async function synthesizeSentence(
  text: string,
  voice: string = 'nova',
  speed: number = 1.0
): Promise<{ audio: string; format: string } | null> {
  try {
    // Map voice parameter to OpenAI voices (nova is warm and natural)
    // If voice is 'maya' (legacy), use nova; otherwise use the specified OpenAI voice
    const openaiVoice = voice === 'maya' ? 'nova' : (voice || 'nova');

    const response = await synthesizeSpeech({
      text,
      voice: openaiVoice,
      format: 'mp3',
      speed: speed
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
  const { message, userId, sessionId, element, voice, speed, conversationHistory, thresholdState } = body;

  // Initialize timing instrumentation
  const timer = createVoiceTimer();
  timer.mark('request_received');

  console.log('🔊 [StreamConversation] Received voice settings:', { voice, speed });

  if (!message?.trim()) {
    return new Response('Missing message', { status: 400 });
  }

  const encoder = new TextEncoder();

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
        // ============ THRESHOLD FAST-PATH ============
        // Check if this input can be handled without LLM
        const currentThresholdState = thresholdState || createInitialThresholdState();
        const thresholdResult = processThreshold({
          text: message,
          state: currentThresholdState,
          config: DEFAULT_MAIA_THRESHOLD_CONFIG,
        });

        timer.mark('threshold_checked');

        // If Threshold matched, skip LLM entirely for faster response
        if (thresholdResult.skipLLM && thresholdResult.response) {
          const text = thresholdResult.response.content;

          // Emit text immediately
          emit('text', {
            index: 0,
            text,
            timestamp: Date.now(),
            mode: 'threshold',
            responseType: thresholdResult.response.type,
          });

          timer.mark('text_0_emitted');

          // Generate TTS and emit audio immediately
          const audioResult = await synthesizeSentence(text, voice, speed);
          timer.mark('tts_0_done');

          if (audioResult) {
            emit('audio', {
              index: 0,
              audio: audioResult.audio,
              format: audioResult.format,
              text,
              timestamp: Date.now(),
              mode: 'threshold',
            });
            timer.mark('audio_0_emitted');
          }

          // Complete with updated threshold state
          emit('complete', {
            fullResponse: text,
            sentenceCount: 1,
            audioChunksEmitted: audioResult ? 1 : 0,
            timestamp: Date.now(),
            mode: 'threshold',
            thresholdState: thresholdResult.state,
            timing: timer.summary(),
          });

          console.log(`[voice] THRESHOLD fast-path: ${timer.summary()}`);
          controller.close();
          return;
        }

        // ============ FULL LLM PATH ============
        const claudeService = getClaudeService();
        timer.mark('llm_starting');

        const context = {
          element,
          conversationHistory,
          userName: undefined
        };

        let fullResponse = '';
        let audioChunksEmitted = 0;
        let sentenceCount = 0;
        let firstTextEmitted = false;
        let firstAudioEmitted = false;
        const ttsPromises: Promise<void>[] = [];

        // Stream sentences from Claude
        for await (const chunk of claudeService.generateOracleResponseStreaming(
          message,
          context
        )) {
          if (chunk.type === 'sentence') {
            // Mark first token timing
            if (!firstTextEmitted) {
              timer.mark('llm_first_chunk');
              firstTextEmitted = true;
            }

            // Emit text immediately so UI can show it
            emit('text', {
              index: chunk.index,
              text: chunk.text,
              timestamp: Date.now()
            });

            if (chunk.index === 0) {
              timer.mark('text_0_emitted');
            }

            fullResponse += chunk.text + ' ';
            sentenceCount = chunk.index + 1;

            // Generate TTS for this sentence - emit audio as soon as it's ready
            const chunkIndex = chunk.index;
            const chunkText = chunk.text;
            const ttsPromise = synthesizeSentence(chunkText, voice, speed).then(audioResult => {
              if (audioResult) {
                // Mark timing for first audio
                if (!firstAudioEmitted) {
                  timer.mark('tts_0_done');
                  firstAudioEmitted = true;
                }

                emit('audio', {
                  index: chunkIndex,
                  audio: audioResult.audio,
                  format: audioResult.format,
                  text: chunkText,
                  timestamp: Date.now()
                });

                if (chunkIndex === 0) {
                  timer.mark('audio_0_emitted');
                }

                audioChunksEmitted++;
              }
            }).catch(e => {
              console.error('[StreamConversation] TTS error:', e);
            });
            ttsPromises.push(ttsPromise);

          } else if (chunk.type === 'done') {
            timer.mark('llm_done');

            // Wait for all TTS to complete before closing stream
            await Promise.all(ttsPromises);
            timer.mark('all_tts_done');

            emit('complete', {
              fullResponse: fullResponse.trim(),
              sentenceCount,
              audioChunksEmitted,
              timestamp: Date.now(),
              thresholdState: thresholdResult.state,
              timing: timer.summary(),
            });

            console.log(`[voice] LLM path: ${timer.summary()}`);
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
