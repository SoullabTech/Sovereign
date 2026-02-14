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
import * as ttsRouter from '@/lib/tts/ttsRouter';
import { TTSFallbackToOpenAI } from '@/lib/tts/ttsRouter';
import { resolveOpenAIVoice, resolveKokoroVoice } from '@/lib/voice/voiceMap';
import type { Element } from '@/lib/types/voiceIntent';
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
import { buildProsodyHints } from '@/lib/voice/prosody/buildProsodyHints';
import { scaleProsody } from '@/lib/voice/prosody/scaleProsody';
import {
  applyProsodyToText as applyProsodyHintsToText,
  mapProsodyToSpeed,
} from '@/lib/tts/ttsAdapter';
import type { ProsodyRange, ProsodyHints } from '@/src/types/voice';
import { logMaiaTurn } from '@/lib/learning/maiaTrainingDataService';

// Feature flag: enable OpenAI TTS fallback when PersonaPlex fails
// ON by default - PersonaPlex is conversational AI (generates its own text), not TTS
// OpenAI TTS is needed to speak Claude's text. Set TTS_OPENAI_FALLBACK=false to disable.
const USE_OPENAI_FALLBACK = process.env.TTS_OPENAI_FALLBACK !== 'false';

/**
 * TTS with sovereign provider routing:
 *   1. PersonaPlex (conversational AI voice)
 *   2. Kokoro (local sovereign TTS) via ttsRouter
 *   3. OpenAI TTS (cloud fallback, consent-gated)
 *
 * Returns { audio: base64, format: 'wav' | 'mp3', source: 'personaplex' | 'kokoro' | 'openai' }
 */
async function synthesizeWithFallback(
  text: string,
  options: {
    mode: 'talk' | 'care' | 'note';
    element?: string | null;
    sanctuary: boolean;
    speed: number;
    brevity?: 'brief' | 'moderate' | 'expansive';
    wisdomDirective?: string;
    voice?: string;
  }
): Promise<{ audio: string; format: string; source: string } | null> {
  // Try PersonaPlex first
  try {
    for await (const chunk of renderWithPersonaPlex({
      text,
      wisdomDirective: options.wisdomDirective,
      mode: options.mode,
      element: options.element,
      sanctuary: options.sanctuary,
      speed: options.speed,
      brevity: options.brevity,
    })) {
      // Got a chunk - convert to WAV
      const pcmBytes = Buffer.from(chunk.audioB64, 'base64').length;
      if (pcmBytes < 100) {
        console.warn(`[TTS] PersonaPlex returned very small audio (${pcmBytes}B), trying fallback`);
        break; // Fall through to Kokoro/OpenAI
      }
      const wavB64 = pcmF32ToWavBase64(chunk.audioB64, 24000, 1);
      console.log(`🎤 [TTS] PersonaPlex OK: ${pcmBytes}B PCM → ${Buffer.from(wavB64, 'base64').length}B WAV`);
      return { audio: wavB64, format: 'wav', source: 'personaplex' };
    }
  } catch (e) {
    console.warn(`[TTS] PersonaPlex failed: ${e instanceof Error ? e.message : e}`);
  }

  // ── Sovereign TTS routing: Kokoro first, OpenAI fallback ──
  const elementKey = (options.element ?? '').toLowerCase() as Element;

  // Try Kokoro via ttsRouter (same path as preview endpoint)
  try {
    const result = await ttsRouter.synthesize({
      text,
      voice: options.voice && options.voice !== 'maya' ? options.voice : undefined,
      format: 'mp3',
      speed: options.speed,
      voiceHint: elementKey ? { element: elementKey, speed: options.speed } as any : undefined,
    });
    const audio = result.audioBuffer.toString('base64');
    console.log(`[TTS] provider=kokoro element=${elementKey || 'none'} voice=${result.reason} ${result.audioBuffer.length}B MP3`);
    return { audio, format: 'mp3', source: 'kokoro' };
  } catch (err) {
    if (err instanceof TTSFallbackToOpenAI) {
      console.log(`[TTS] provider=openai fallback=true reason=${err.reason}`);
    } else {
      console.warn(`[TTS] ttsRouter error: ${err instanceof Error ? err.message : err}`);
    }
  }

  // OpenAI fallback (cloud) — only if enabled
  if (!USE_OPENAI_FALLBACK) {
    console.log('[TTS] OpenAI fallback disabled, returning null');
    return null;
  }

  try {
    const elementVoice = elementKey ? resolveOpenAIVoice(elementKey) : null;
    const openaiVoice = (options.voice && options.voice !== 'maya')
      ? options.voice
      : elementVoice ?? 'nova';
    console.log(`[TTS] provider=openai fallback=true element=${elementKey || 'none'} voice=${openaiVoice}`);
    const response = await synthesizeSpeech({
      text,
      voice: openaiVoice,
      format: 'mp3',
      speed: options.speed,
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const audio = buffer.toString('base64');
    return { audio, format: 'mp3', source: 'openai' };
  } catch (e) {
    console.error(`[TTS] OpenAI fallback also failed: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

/**
 * Sanitize text before sending to TTS.
 * Removes metadata blocks, JSON fragments, and other non-speakable content.
 * Defense-in-depth: even if ClaudeService filters, this guarantees clean input.
 */
function sanitizeForTts(input: string): string {
  if (!input) return '';

  let s = input;

  // Remove full metadata blocks
  s = s.replace(/---SOUL_METADATA---[\s\S]*?---END_METADATA---/g, '');

  // Remove JSON objects that sometimes leak as "sentences"
  s = s.replace(/\{[\s\S]*?\}/g, '');

  // Remove JSON arrays
  s = s.replace(/\[[\s\S]*?\]/g, '');

  // Remove orphan JSON fragments at start/end
  s = s.replace(/^[\s\d,}\]]+/, '');
  s = s.replace(/[\s\d,{\[]+$/, '');

  // Collapse whitespace and trim
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Convert PCM audio to WAV format for browser playback.
 * Auto-detects Float32 vs Int16 format based on byte alignment.
 *
 * PersonaPlex may return either format:
 * - Float32 PCM: 4 bytes per sample, values in [-1..1]
 * - Int16 PCM: 2 bytes per sample, little-endian (like OpenAI's pcm format)
 */
function pcmToWavBase64(pcmB64: string, sampleRate = 24000, channels = 1): string {
  const bin = Buffer.from(pcmB64, 'base64');

  // Auto-detect format based on byte alignment
  // Float32 requires 4-byte alignment, Int16 requires 2-byte
  const isFloat32 = bin.length % 4 === 0 && bin.length >= 4;
  const isInt16 = bin.length % 2 === 0;

  let sampleCount: number;
  let int16Samples: Int16Array;

  if (isFloat32) {
    // Float32 PCM: Convert to aligned buffer, then to Int16
    const aligned = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      aligned[i] = bin[i];
    }
    const float32 = new Float32Array(aligned.buffer);
    sampleCount = float32.length;

    // Check if values look like Float32 (within [-1..1] range with variance)
    let maxAbs = 0;
    for (let i = 0; i < Math.min(100, sampleCount); i++) {
      maxAbs = Math.max(maxAbs, Math.abs(float32[i]));
    }

    if (maxAbs > 2.0) {
      // Values too large for Float32 range - probably Int16 misread as Float32
      console.log(`[pcmToWav] Detected Int16 format (max sample ${maxAbs.toFixed(2)} > 2.0)`);
      // Reinterpret as Int16
      int16Samples = new Int16Array(bin.buffer, bin.byteOffset, Math.floor(bin.length / 2));
      sampleCount = int16Samples.length;
    } else {
      // Valid Float32 - convert to Int16
      console.log(`[pcmToWav] Float32 format (${sampleCount} samples, max ${maxAbs.toFixed(3)})`);
      int16Samples = new Int16Array(sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16Samples[i] = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff);
      }
    }
  } else if (isInt16) {
    // Int16 PCM: Direct interpretation
    console.log(`[pcmToWav] Int16 format (${bin.length / 2} samples)`);
    int16Samples = new Int16Array(bin.buffer, bin.byteOffset, bin.length / 2);
    sampleCount = int16Samples.length;
  } else {
    console.warn(`[pcmToWav] Unusual byte count ${bin.length}, treating as Int16`);
    int16Samples = new Int16Array(Math.floor(bin.length / 2));
    for (let i = 0; i < int16Samples.length; i++) {
      int16Samples[i] = bin.readInt16LE(i * 2);
    }
    sampleCount = int16Samples.length;
  }

  // Sanity check
  const durationMs = (sampleCount / sampleRate) * 1000;
  if (sampleCount < 10) {
    console.warn(`[pcmToWav] Very short audio: ${sampleCount} samples (${bin.length} bytes input)`);
  } else {
    console.log(`[pcmToWav] ${sampleCount} samples → ~${Math.round(durationMs)}ms`);
  }

  // Build WAV file
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = sampleCount * bytesPerSample;

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

  // Write samples
  for (let i = 0; i < sampleCount; i++) {
    buffer.writeInt16LE(int16Samples[i], o);
    o += 2;
  }

  return buffer.toString('base64');
}

// Backwards compatibility alias
const pcmF32ToWavBase64 = pcmToWavBase64;

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
  /** Range of Effect: scales prosody intensity (0-4), default 1 */
  prosodyRange?: ProsodyRange;
}

/**
 * Synthesize a single sentence to audio.
 * Routes through ttsRouter (Kokoro first, OpenAI fallback).
 * Returns base64 audio data or null on failure.
 */
async function synthesizeSentence(
  text: string,
  voice: string = 'nova',
  speed: number = 1.0,
  element?: string | null
): Promise<{ audio: string; format: string } | null> {
  const elementKey = (element ?? '').toLowerCase() as Element;

  // Try Kokoro via ttsRouter
  try {
    const result = await ttsRouter.synthesize({
      text,
      voice: voice && voice !== 'maya' ? voice : undefined,
      format: 'mp3',
      speed,
      voiceHint: elementKey ? { element: elementKey, speed } as any : undefined,
    });
    const audio = result.audioBuffer.toString('base64');
    return { audio, format: 'mp3' };
  } catch (err) {
    if (err instanceof TTSFallbackToOpenAI) {
      // Expected — fall through to OpenAI
    } else {
      console.warn(`[StreamConversation] ttsRouter error: ${err instanceof Error ? err.message : err}`);
    }
  }

  // OpenAI fallback
  try {
    const elementVoice = elementKey ? resolveOpenAIVoice(elementKey) : null;
    const openaiVoice = (voice && voice !== 'maya')
      ? voice
      : elementVoice ?? 'nova';

    const response = await synthesizeSpeech({
      text,
      voice: openaiVoice,
      format: 'mp3',
      speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const audio = buffer.toString('base64');
    return { audio, format: 'mp3' };
  } catch (e) {
    console.error('[StreamConversation] OpenAI TTS fallback failed:', e);
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
    prosodyRange = 1,  // Default: Subtle (most users want warmth without theatrics)
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
        // Note: classifiedOutcome already has tsOutcome and tsMove - no extra timestamp needed
        if (turnDecision.classifiedOutcome) {
          emit('move_outcome', turnDecision.classifiedOutcome);
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
        // Floor at 0.92 — below that, speech sounds "slow and drunk"
        // Ceiling at 1.15 to keep natural without rushing
        const relationalSpeed = Math.min(1.15, Math.max(0.92, relationalSpeedRaw));

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

        // ============ PROSODY HINTS (MAIA's semantic voice intent) ============
        // MAIA decides delivery intent via ProsodyHints (semantic).
        // TTS adapter translates hints to provider-specific controls.
        // This is NOT model-driven — MAIA is the author of delivery.
        const effectiveRange = (prosodyRange ?? 1) as ProsodyRange;

        // Build base hints from relational state + session baseline
        const baseHints = buildProsodyHints({
          activation: voiceSession.relationalStack.smoother.lastActivation,
          mode: wisdomPayload?.mode ?? mode ?? 'talk',
          sanctuary: wisdomPayload?.sanctuary ?? sanctuary ?? false,
          brevity: guidance?.brevity ?? 'moderate',
          posture: guidance?.posture ?? 'MEET',
          element: wisdomPayload?.element ?? element ?? null,
          baseline: voiceSession.prosodyBaseline, // Conversation Prosody Memory
        });

        // Scale hints by user's Range of Effect preference
        const prosodyHints: ProsodyHints = scaleProsody(baseHints, effectiveRange);

        // Compute effective speed from hints + base relational speed
        const effectiveSpeed = mapProsodyToSpeed(relationalSpeed, prosodyHints);

        // ─── UPDATE SESSION PROSODY BASELINE ───
        // Conversation Prosody Memory: baseline drifts toward current delivery
        const baselineTs = Date.now();
        const prevBaseline = voiceSession.prosodyBaseline;
        const dt = baselineTs - prevBaseline.updatedAt;
        const decay = dt > 60_000 ? 0.2 : 0; // 1+ min gap = loosen continuity

        // Store baseHints (pre-range), NOT prosodyHints (post-range).
        // Baseline tracks MAIA's conversational posture, not member's amplification.
        voiceSession.prosodyBaseline = {
          warmth: baseHints.warmth,
          pace: baseHints.pace,
          emphasis: baseHints.emphasis,
          // Continuity rises each turn, decays on gaps, caps at 1
          continuity: Math.max(0, Math.min(1, prevBaseline.continuity + 0.15 - decay)),
          updatedAt: baselineTs,
        };

        // Debug trace: only emits when VOICE_DEBUG_PROSODY=1 (no user content)
        if (process.env.VOICE_DEBUG_PROSODY === '1') {
          console.log('[voice][prosody]', {
            range: effectiveRange,
            base: baseHints,
            scaled: prosodyHints,
            speed: effectiveSpeed,
            baseline: voiceSession.prosodyBaseline,
          });
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

          // TTS render with fallback (PersonaPlex → OpenAI)
          // Apply prosody shaping BEFORE sanitization (prosody is MAIA's semantic intent)
          const shapedThresholdText = applyProsodyHintsToText(text, prosodyHints);
          const safeThresholdText = sanitizeForTts(shapedThresholdText);
          let thresholdAudioEmitted = false;

          if (!safeThresholdText) {
            console.warn('[StreamConversation] Threshold text empty after sanitization, skipping TTS');
          }

          const thresholdTtsResult = safeThresholdText ? await synthesizeWithFallback(safeThresholdText, {
            mode: wisdomPayload?.mode ?? mode,
            element: wisdomPayload?.element ?? element ?? null,
            sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
            speed: effectiveSpeed,  // Use prosody-adjusted speed
            brevity: guidance.brevity,
            wisdomDirective,
            voice: voice,
          }) : null;

          if (thresholdTtsResult) {
            timer.mark('tts_0_done');

            const audioBytes = Buffer.from(thresholdTtsResult.audio, 'base64').length;
            console.log(`🔊 [Audio-Threshold] ${audioBytes}B ${thresholdTtsResult.format.toUpperCase()} via ${thresholdTtsResult.source}`);

            emit('audio', {
              index: 0,
              audio: thresholdTtsResult.audio,
              format: thresholdTtsResult.format,
              text,
              timestamp: Date.now(),
              mode: 'threshold',
              source: thresholdTtsResult.source,
              prosody: {
                range: effectiveRange,
                pace: prosodyHints.pace,
                warmth: prosodyHints.warmth,
                emphasis: prosodyHints.emphasis,
                intentTag: prosodyHints.intentTag,
                speed: effectiveSpeed,
              },
            });
            timer.mark('audio_0_emitted');
            thresholdAudioEmitted = true;
          }

          if (!thresholdAudioEmitted) {
            console.warn('[StreamConversation] TTS returned no audio for threshold path');
            emit('tts_error', {
              index: 0,
              text,
              error: 'TTS unavailable',
              timestamp: Date.now(),
            });
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

        // 🎙️ SENTENCE BUFFER: Group sentences for better prosodic arcs.
        // Single sentences reset intonation at every boundary, producing a
        // "read-out" effect. Batching 2 sentences gives Kokoro enough context
        // for natural phrase-level intonation while keeping latency acceptable.
        // The FIRST sentence always goes immediately for fast time-to-first-audio.
        const SENTENCES_PER_BATCH = 2;
        const sentenceBuffer: Array<{ index: number; text: string }> = [];
        let audioGroupIndex = 0; // Monotonic index for audio emission (one per batch)

        // Flush buffered sentences as one TTS call
        const flushSentenceBuffer = () => {
          if (sentenceBuffer.length === 0) return;

          const batch = sentenceBuffer.splice(0);
          const batchText = batch.map(s => s.text).join(' ');
          const batchIndex = audioGroupIndex++;
          const firstSentenceIndex = batch[0].index;

          // Apply prosody shaping BEFORE sanitization (prosody is MAIA's semantic intent)
          const shapedText = applyProsodyHintsToText(batchText, prosodyHints);
          const safeText = sanitizeForTts(shapedText);

          const ttsPromise = (async () => {
            if (!safeText) {
              console.warn(`[StreamConversation] Batch ${batchIndex} empty after sanitization, skipping TTS`);
              return;
            }

            const result = await synthesizeWithFallback(safeText, {
              mode: wisdomPayload?.mode ?? mode,
              element: wisdomPayload?.element ?? element ?? null,
              sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
              speed: effectiveSpeed,
              brevity: guidance.brevity,
              wisdomDirective,
              voice: voice,
            });

            if (result) {
              if (!firstAudioEmitted) {
                timer.mark('tts_0_done');
                firstAudioEmitted = true;
              }

              const audioBytes = Buffer.from(result.audio, 'base64').length;
              console.log(`🔊 [Audio] Batch ${batchIndex} (sentences ${batch.map(s => s.index).join(',')}): ${audioBytes}B ${result.format.toUpperCase()} via ${result.source}`);

              emit('audio', {
                index: batchIndex,
                audio: result.audio,
                format: result.format,
                text: batchText,
                timestamp: Date.now(),
                source: result.source,
                prosody: {
                  range: effectiveRange,
                  pace: prosodyHints.pace,
                  warmth: prosodyHints.warmth,
                  emphasis: prosodyHints.emphasis,
                  intentTag: prosodyHints.intentTag,
                  speed: effectiveSpeed,
                },
              });

              if (firstSentenceIndex === 0) {
                timer.mark('audio_0_emitted');
              }

              audioChunksEmitted++;
            } else {
              console.warn(`[StreamConversation] TTS returned no audio for batch index=${batchIndex}`);
              emit('tts_error', {
                index: batchIndex,
                text: batchText,
                error: 'TTS unavailable',
                timestamp: Date.now(),
              });
            }
          })().catch(e => {
            console.error('[StreamConversation] TTS error:', e);
          });

          ttsPromises.push(ttsPromise);
        };

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

            // Buffer sentences for batched TTS synthesis.
            // First sentence always goes immediately for low latency.
            sentenceBuffer.push({ index: chunk.index, text: chunk.text });
            if (chunk.index === 0 || sentenceBuffer.length >= SENTENCES_PER_BATCH) {
              flushSentenceBuffer();
            }

          } else if (chunk.type === 'done') {
            // Flush any remaining buffered sentences
            flushSentenceBuffer();

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

            // 🎓 TRAINING: Log turn for sovereign learning (fire-and-forget)
            // Skip sanctuary mode (privacy) and threshold fast-path (not real LLM responses)
            if (!sanctuary && fullResponse.trim()) {
              const latencyMs = timer.timeTo('llm_done') || timer.timeTo('all_tts_done') || 0;
              logMaiaTurn(
                effectiveSessionId,
                voiceSession.metrics.totalTurns || 1,
                message,
                fullResponse.trim(),
                'CORE', // Voice mode is typically CORE processing
                {
                  primaryEngine: 'claude-3-sonnet',
                  latencyMs,
                  element: wisdomPayload?.element || element,
                  usedClaudeConsult: true,
                }
              ).catch(err => console.warn('⚠️ [TRAINING] Voice turn logging failed:', err));
            }

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
        // Guard against double-close (early returns may have already closed)
        try {
          controller.close();
        } catch {
          // Already closed — that's fine
        }
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
