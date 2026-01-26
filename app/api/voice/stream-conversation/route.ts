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
  getOrCreateVoiceSession,
  processTurn,
  recordSilence,
  setPendingMove,
  computeGuidancePosture,
  type MoshiVoiceSession,
  type TurnDecision,
  type MoveIntent as SessionMoveIntent,
  type GuidanceSignal,
} from '@/lib/voice/moshi/MoshiSessionManager';
import type { RelationalStackState } from '@/lib/consciousness/session/MAIASessionManager';
import {
  MaiaWisdomProvider,
  type VoiceContextPayload,
  type MaiaVoiceMode,
} from '@/lib/voice/wisdom/MaiaWisdomProvider';
import { renderWithPersonaPlex } from '@/lib/voice/personaplex/personaPlexClient';

/**
 * Convert PersonaPlex PCM Float32 audio to WAV format for browser playback.
 * This allows the client to use standard HTMLAudioElement with data URLs.
 */
function pcmF32ToWavBase64(pcmB64: string, sampleRate = 24000, channels = 1): string {
  // Decode base64 -> bytes
  const bin = Buffer.from(pcmB64, 'base64');

  // Interpret as Float32 PCM
  const float32 = new Float32Array(bin.buffer, bin.byteOffset, Math.floor(bin.byteLength / 4));

  // Convert Float32 [-1..1] -> 16-bit PCM
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = float32.length * bytesPerSample;

  const buffer = Buffer.alloc(44 + dataSize);
  let o = 0;

  // RIFF header
  buffer.write('RIFF', o); o += 4;
  buffer.writeUInt32LE(36 + dataSize, o); o += 4;
  buffer.write('WAVE', o); o += 4;

  // fmt chunk
  buffer.write('fmt ', o); o += 4;
  buffer.writeUInt32LE(16, o); o += 4;          // PCM fmt chunk size
  buffer.writeUInt16LE(1, o); o += 2;           // AudioFormat = 1 (PCM)
  buffer.writeUInt16LE(channels, o); o += 2;
  buffer.writeUInt32LE(sampleRate, o); o += 4;
  buffer.writeUInt32LE(byteRate, o); o += 4;
  buffer.writeUInt16LE(blockAlign, o); o += 2;
  buffer.writeUInt16LE(16, o); o += 2;          // BitsPerSample

  // data chunk
  buffer.write('data', o); o += 4;
  buffer.writeUInt32LE(dataSize, o); o += 4;

  // samples
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    const int16 = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff);
    buffer.writeInt16LE(int16, o);
    o += 2;
  }

  return buffer.toString('base64');
}

/**
 * MoveIntent: What MAIA is doing for the user (Meet → Mirror → Move).
 * Computed from relational stack signals. Logged for tuning + UI legibility.
 */
type MoveIntent =
  | 'MEET_REGULATE'     // settle, ground, de-escalate
  | 'MEET_BOUNDARY'     // protect, contain, clarify limits
  | 'MIRROR_REFLECT'    // name/reflect/hold meaning
  | 'MOVE_NEXT_STEP'    // action, choice, next step
  | 'MOVE_REFRAME'      // shift perspective / unlock stuckness
  | 'MOVE_CREATIVE';    // mythopoetic synthesis / imaginative opening

function deriveMoveIntent(args: {
  maiaMode: 'REGULATOR' | 'NAVIGATOR' | 'MYTHOPOET';
  activation: number;
  silenceIntent?: 'REGULATORY' | 'REFLECTIVE' | 'BOUNDARY';
  wisdomMode?: 'talk' | 'care' | 'note';
  thresholdMode?: 'threshold' | 'llm' | 'silence';
}): MoveIntent {
  const { maiaMode, activation, silenceIntent, wisdomMode } = args;

  // If MAIA chose silence, that IS the move.
  if (silenceIntent === 'BOUNDARY') return 'MEET_BOUNDARY';
  if (silenceIntent === 'REGULATORY') return 'MEET_REGULATE';
  if (silenceIntent === 'REFLECTIVE') return 'MIRROR_REFLECT';

  // Speech path: bias by archetype mode first
  if (maiaMode === 'REGULATOR') return 'MEET_REGULATE';

  if (maiaMode === 'NAVIGATOR') {
    // If activation is low/moderate, suggest next step; if high, reframe first
    return activation >= 0.65 ? 'MOVE_REFRAME' : 'MOVE_NEXT_STEP';
  }

  // MYTHOPOET
  // If user is in "care" we can still mirror; otherwise open creativity
  if (wisdomMode === 'care' && activation < 0.5) return 'MIRROR_REFLECT';
  return 'MOVE_CREATIVE';
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

        const now = Date.now();
        const turnDecision = processTurn(voiceSession, {
          userText: message,
          now,
        });

        // Guidance was computed and cached by processTurn; grab it for complete events + PersonaPlex
        const guidance: GuidanceSignal =
          voiceSession.tuning.lastGuidance ?? computeGuidancePosture(voiceSession, now);

        timer.mark('relational_decision');

        // ── EMIT MOVE OUTCOME (if a pending move was classified) ──
        // This tells the client what happened from MAIA's last turn
        if (turnDecision.classifiedOutcome) {
          emit('move_outcome', {
            ...turnDecision.classifiedOutcome,
            timestamp: Date.now(),
          });
        }

        // Log the governance decision
        console.log(`🧘 [Relational] Session ${effectiveSessionId}: ` +
          `mode=${voiceSession.relationalStack.currentMode}, ` +
          `activation=${voiceSession.relationalStack.smoother.lastActivation.toFixed(2)}, ` +
          `shouldSpeak=${turnDecision.shouldSpeak}, ` +
          `backchannel=${turnDecision.shouldBackchannel}`);

        // If relational stack says SILENCE, return immediately
        if (!turnDecision.shouldSpeak) {
          recordSilence(voiceSession, turnDecision.nextPauseMs, turnDecision.silenceIntent!);

          // Compute moveIntent for silence
          const silenceMoveIntent = deriveMoveIntent({
            maiaMode: voiceSession.relationalStack.currentMode,
            activation: voiceSession.relationalStack.smoother.lastActivation,
            silenceIntent: turnDecision.silenceIntent,
            thresholdMode: 'silence',
          });

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
            moveIntent: silenceMoveIntent,
            timing: timer.summary(),
            guidance: {
              posture: guidance.posture,
              brevity: guidance.brevity,
              reason: guidance.reason,
              modeLockMs: guidance.modeLockMs,
              speakBias: guidance.speakBias,
            },
          });

          // Set pending move for outcome tracking on next user turn
          setPendingMove(
            voiceSession,
            silenceMoveIntent as SessionMoveIntent,
            'SILENCE',
            voiceSession.relationalStack.smoother.lastActivation
          );

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

        // ============ WISDOM DIRECTIVE (computed once) ============
        // Build once after wisdomPayload is known, reuse for threshold + LLM paths
        const wisdomDirective =
          wisdomPayload && !wisdomPayload.sanctuary
            ? MaiaWisdomProvider.formatForPersonaPlex(wisdomPayload)
            : undefined;

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

          // PersonaPlex render (keep SSE schema the same: emit a single audio payload)
          let thresholdAudioEmitted = false;
          for await (const chunk of renderWithPersonaPlex({
            text,
            wisdomDirective,
            mode: wisdomPayload?.mode ?? mode,
            element: wisdomPayload?.element ?? element ?? null,
            sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
            speed: relationalSpeed,
            brevity: guidance.brevity,
          })) {
            timer.mark('tts_0_done');

            emit('audio', {
              index: 0,
              audio: pcmF32ToWavBase64(chunk.audioB64, 24000, 1),
              format: 'wav',
              text,
              timestamp: Date.now(),
              mode: 'threshold',
            });
            timer.mark('audio_0_emitted');
            thresholdAudioEmitted = true;
            break; // keep 1 audio event per sentence for schema stability
          }

          if (!thresholdAudioEmitted) {
            console.warn('[StreamConversation] PersonaPlex returned no audio for threshold path');
          }

          // Compute moveIntent for threshold path
          const thresholdMoveIntent = deriveMoveIntent({
            maiaMode: voiceSession.relationalStack.currentMode,
            activation: voiceSession.relationalStack.smoother.lastActivation,
            wisdomMode: wisdomPayload?.mode,
            thresholdMode: 'threshold',
          });

          // Complete with updated threshold state + relational metadata
          emit('complete', {
            fullResponse: text,
            sentenceCount: 1,
            audioChunksEmitted: thresholdAudioEmitted ? 1 : 0,
            timestamp: Date.now(),
            mode: 'threshold',
            thresholdState: thresholdResult.state,
            moveIntent: thresholdMoveIntent,
            timing: timer.summary(),
            relational: {
              maiaMode: voiceSession.relationalStack.currentMode,
              activation: voiceSession.relationalStack.smoother.lastActivation,
              prosodySpeed: relationalSpeed,
            },
            guidance: {
              posture: guidance.posture,
              brevity: guidance.brevity,
              reason: guidance.reason,
              modeLockMs: guidance.modeLockMs,
              speakBias: guidance.speakBias,
            },
          });

          // Set pending move for outcome tracking on next user turn
          setPendingMove(
            voiceSession,
            thresholdMoveIntent as SessionMoveIntent,
            'SPOKEN',
            voiceSession.relationalStack.smoother.lastActivation
          );

          console.log(`[voice] THRESHOLD fast-path: ${timer.summary()}`);
          controller.close();
          return;
        }

        // ============ FULL LLM PATH ============
        const claudeService = getClaudeService();
        timer.mark('llm_starting');

        // Build context with wisdom field integration (wisdomDirective already computed above)
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

            // PersonaPlex per-sentence render (preserve concurrency; emit first audio chunk only)
            const chunkIndex = chunk.index;
            const chunkText = chunk.text;

            const ttsPromise = (async () => {
              let emitted = false;
              for await (const pchunk of renderWithPersonaPlex({
                text: chunkText,
                wisdomDirective,
                mode: wisdomPayload?.mode ?? mode,
                element: wisdomPayload?.element ?? element ?? null,
                sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
                speed: relationalSpeed,
                brevity: guidance.brevity,
              })) {
                if (!firstAudioEmitted) {
                  timer.mark('tts_0_done');
                  firstAudioEmitted = true;
                }

                emit('audio', {
                  index: chunkIndex,
                  audio: pcmF32ToWavBase64(pchunk.audioB64, 24000, 1),
                  format: 'wav',
                  text: chunkText,
                  timestamp: Date.now(),
                });

                if (chunkIndex === 0) {
                  timer.mark('audio_0_emitted');
                }

                audioChunksEmitted++;
                emitted = true;
                break; // keep 1 audio event per sentence for schema stability
              }

              if (!emitted) {
                console.warn(`[StreamConversation] PersonaPlex returned no audio for sentence index=${chunkIndex}`);
              }
            })().catch(e => {
              console.error('[StreamConversation] PersonaPlex error:', e);
            });

            ttsPromises.push(ttsPromise);

          } else if (chunk.type === 'done') {
            timer.mark('llm_done');

            // Wait for all TTS to complete before closing stream
            await Promise.all(ttsPromises);
            timer.mark('all_tts_done');

            // Compute moveIntent for LLM path
            const llmMoveIntent = deriveMoveIntent({
              maiaMode: voiceSession.relationalStack.currentMode,
              activation: voiceSession.relationalStack.smoother.lastActivation,
              wisdomMode: wisdomPayload?.mode,
              thresholdMode: 'llm',
            });

            emit('complete', {
              fullResponse: fullResponse.trim(),
              sentenceCount,
              audioChunksEmitted,
              timestamp: Date.now(),
              thresholdState: thresholdResult.state,
              moveIntent: llmMoveIntent,
              timing: timer.summary(),
              relational: {
                maiaMode: voiceSession.relationalStack.currentMode,
                activation: voiceSession.relationalStack.smoother.lastActivation,
                prosodySpeed: relationalSpeed,
              },
              guidance: {
                posture: guidance.posture,
                brevity: guidance.brevity,
                reason: guidance.reason,
                modeLockMs: guidance.modeLockMs,
                speakBias: guidance.speakBias,
              },
              // Wisdom field metadata (for debugging and PersonaPlex integration)
              wisdom: wisdomPayload ? {
                mode: wisdomPayload.mode,
                element: wisdomPayload.element,
                sanctuary: wisdomPayload.sanctuary,
                metadata: wisdomPayload.metadata,
              } : undefined,
            });

            // Set pending move for outcome tracking on next user turn
            setPendingMove(
              voiceSession,
              llmMoveIntent as SessionMoveIntent,
              'SPOKEN',
              voiceSession.relationalStack.smoother.lastActivation
            );

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
