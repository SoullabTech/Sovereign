// @ts-nocheck - Prototype streaming voice conversation
/**
 * Streaming Voice Conversation Endpoint
 *
 * SOVEREIGNTY: MAIA is the primary intelligence. Claude serves as her voice,
 * channeling responses through MAIA's essence, personality, and wisdom.
 * The system prompt establishes MAIA's identity - Claude never speaks as itself.
 *
 * Flow: User message → Relational Stack decision → Threshold check → (fast-path OR Claude streaming) → TTS → Audio SSE
 *
 * Relational Stack governs:
 * 1. SILENCE responses (when speaking would intrude)
 * 2. BACKCHANNEL responses (soft acknowledgments)
 * 3. SPOKEN responses (with adaptive prosody)
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
import {
  createMoshiVoiceSession,
  processTurn,
  recordSilence,
  type MoshiVoiceSession,
  type TurnDecision,
} from '@/lib/voice/moshi/MoshiSessionManager';
import type { RelationalStackState } from '@/lib/consciousness/session/MAIASessionManager';
import {
  MaiaWisdomProvider,
  type VoiceContextPayload,
  type MaiaVoiceMode,
} from '@/lib/voice/wisdom/MaiaWisdomProvider';

// Session store for SSE connections (keyed by sessionId)
// In production, this would be Redis or similar for horizontal scaling
const voiceSessions = new Map<string, MoshiVoiceSession>();

/**
 * Get or create a voice session for this connection.
 * Sessions are keyed by sessionId and expire after 30 minutes of inactivity.
 */
function getOrCreateVoiceSession(sessionId: string): MoshiVoiceSession {
  const existing = voiceSessions.get(sessionId);
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  if (existing && (now - existing.lastActivity) < maxAge) {
    return existing;
  }

  // Clean up expired sessions periodically
  if (voiceSessions.size > 100) {
    for (const [id, session] of voiceSessions) {
      if (now - session.lastActivity > maxAge) {
        voiceSessions.delete(id);
      }
    }
  }

  const session = createMoshiVoiceSession(sessionId);
  voiceSessions.set(sessionId, session);
  return session;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
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
  /** Optional relational stack state from client (for cross-request continuity) */
  relationalStackState?: Partial<RelationalStackState>;
  /** MAIA voice mode: talk (peer), care (therapeutic), note (scribe) */
  mode?: MaiaVoiceMode;
  /** Sanctuary mode: presence-only, no memory retrieval or persistence */
  sanctuary?: boolean;
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
  const {
    message,
    userId,
    sessionId,
    element,
    voice,
    speed,
    conversationHistory,
    thresholdState,
    mode = 'talk',
    sanctuary = false,
  } = body;

  // Initialize timing instrumentation
  const timer = createVoiceTimer();
  timer.mark('request_received');

  console.log('🔊 [StreamConversation] Received voice settings:', { voice, speed, mode, sanctuary });

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
        // ============ RELATIONAL STACK GOVERNANCE ============
        // Get/create session and run governance gate FIRST
        const effectiveSessionId = sessionId || 'default';
        const voiceSession = getOrCreateVoiceSession(effectiveSessionId);

        const turnDecision = processTurn(voiceSession, {
          userText: message,
          now: Date.now(),
        });

        timer.mark('relational_decision');

        // Log the governance decision
        console.log(`🧘 [Relational] Session ${effectiveSessionId}: ` +
          `mode=${voiceSession.relationalStack.currentMode}, ` +
          `activation=${voiceSession.relationalStack.smoother.lastActivation.toFixed(2)}, ` +
          `shouldSpeak=${turnDecision.shouldSpeak}, ` +
          `backchannel=${turnDecision.shouldBackchannel}`);

        // If relational stack says SILENCE, return immediately
        if (!turnDecision.shouldSpeak) {
          recordSilence(voiceSession, turnDecision.nextPauseMs, turnDecision.silenceIntent!);

          emit('silence', {
            durationMs: turnDecision.nextPauseMs,
            intent: turnDecision.silenceIntent,
            mode: voiceSession.relationalStack.currentMode,
            activation: voiceSession.relationalStack.smoother.lastActivation,
            timestamp: Date.now(),
          });

          emit('complete', {
            fullResponse: '', // Intentional silence
            sentenceCount: 0,
            audioChunksEmitted: 0,
            timestamp: Date.now(),
            mode: 'silence',
            silenceIntent: turnDecision.silenceIntent,
            timing: timer.summary(),
          });

          console.log(`[voice] SILENCE response: ${turnDecision.silenceIntent} for ${turnDecision.nextPauseMs}ms`);
          controller.close();
          return;
        }

        // Apply prosody as a multiplier on top of user preference.
        // Clamp to keep TTS stable and avoid accidental extremes.
        const baseSpeed = typeof speed === 'number' ? speed : 1.0;
        const mult =
          typeof turnDecision.prosody?.tempoMultiplier === 'number'
            ? turnDecision.prosody.tempoMultiplier
            : 1.0;

        const relationalSpeedRaw = baseSpeed * mult;

        // Conservative clamp; OpenAI TTS supports 0.25-4.0 but we stay tighter
        const relationalSpeed = Math.min(1.5, Math.max(0.5, relationalSpeedRaw));

        // ============ WISDOM FIELD RETRIEVAL ============
        // Build full MAIA context from memory bundle + spiral state
        // Sanctuary mode is a HARD WALL: no retrieval, no persistence
        let wisdomPayload: VoiceContextPayload | null = null;
        if (userId) {
          try {
            wisdomPayload = await MaiaWisdomProvider.buildVoiceContext({
              userId,
              sessionId: effectiveSessionId,
              currentInput: message,
              mode,
              element: element as any,
              sanctuary,
              conversationHistory: conversationHistory || [],
            });
            timer.mark('wisdom_retrieved');

            // Emit wisdom metadata (no content in sanctuary)
            emit('wisdom', {
              sanctuary: wisdomPayload.sanctuary,
              mode: wisdomPayload.mode,
              element: wisdomPayload.element,
              metadata: wisdomPayload.metadata,
              timestamp: Date.now(),
            });
          } catch (wisdomErr) {
            console.warn('[StreamConversation] Wisdom retrieval failed (continuing):', wisdomErr);
          }
        }

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

          // Generate TTS and emit audio immediately (using relational prosody speed)
          const audioResult = await synthesizeSentence(text, voice, relationalSpeed);
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

          // Complete with updated threshold state + relational metadata
          emit('complete', {
            fullResponse: text,
            sentenceCount: 1,
            audioChunksEmitted: audioResult ? 1 : 0,
            timestamp: Date.now(),
            mode: 'threshold',
            thresholdState: thresholdResult.state,
            timing: timer.summary(),
            relational: {
              maiaMode: voiceSession.relationalStack.currentMode,
              activation: voiceSession.relationalStack.smoother.lastActivation,
              prosodySpeed: relationalSpeed,
            },
          });

          console.log(`[voice] THRESHOLD fast-path: ${timer.summary()}`);
          controller.close();
          return;
        }

        // ============ FULL LLM PATH ============
        const claudeService = getClaudeService();
        timer.mark('llm_starting');

        // Build context with wisdom field integration
        // When PersonaPlex is wired in, wisdomPayload.formatForPersonaPlex() provides the persona prompt
        const wisdomDirective = wisdomPayload
          ? MaiaWisdomProvider.formatForPersonaPlex(wisdomPayload)
          : undefined;

        const context = {
          element,
          conversationHistory,
          userName: undefined,
          // Voice-specific context from wisdom field
          voiceMode: mode,
          sanctuary,
          wisdomDirective,
          memoryContext: wisdomPayload?.memoryDirective,
          spiralContext: wisdomPayload?.spiralDirective,
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
            // Uses relational prosody speed for affect-responsive pacing
            const chunkIndex = chunk.index;
            const chunkText = chunk.text;
            const ttsPromise = synthesizeSentence(chunkText, voice, relationalSpeed).then(audioResult => {
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
              relational: {
                maiaMode: voiceSession.relationalStack.currentMode,
                activation: voiceSession.relationalStack.smoother.lastActivation,
                prosodySpeed: relationalSpeed,
              },
              // Wisdom field metadata (for debugging and PersonaPlex integration)
              wisdom: wisdomPayload ? {
                mode: wisdomPayload.mode,
                element: wisdomPayload.element,
                sanctuary: wisdomPayload.sanctuary,
                metadata: wisdomPayload.metadata,
              } : undefined,
            });

            console.log(`[voice] LLM path: ${timer.summary()}${wisdomPayload?.sanctuary ? ' (sanctuary)' : ''}`);
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
