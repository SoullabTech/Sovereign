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
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  decideMode,
  getModePromptKernel,
  getRegulatingResponse,
  getVoiceTeachingSummary,
  logModeDecision,
  type ModeDecision,
} from '@/lib/sovereign/teachingRouter';
import { LimitsEnforcer, getMemberTier, type MemberTier } from '@/lib/limits/LimitsEnforcer';
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
import { buildProsodyHints } from '@/lib/voice/prosody/buildProsodyHints';
import { scaleProsody } from '@/lib/voice/prosody/scaleProsody';
import {
  applyProsodyToText as applyProsodyHintsToText,
  mapProsodyToSpeed,
} from '@/lib/tts/ttsAdapter';
import type { ProsodyRange, ProsodyHints } from '@/src/types/voice';

// Feature flag: enable OpenAI TTS fallback when PersonaPlex fails
// ON by default - PersonaPlex is conversational AI (generates its own text), not TTS
// OpenAI TTS is needed to speak Claude's text. Set TTS_OPENAI_FALLBACK=false to disable.
const USE_OPENAI_FALLBACK = process.env.TTS_OPENAI_FALLBACK !== 'false';

// =============================================================================
// IDENTITY FIREWALL - Block provider identity leakage in voice
// =============================================================================

/**
 * TIER A: Hard identity breaches - provider/vendor identity, explicit "I'm AI", memory disclaimers
 * These MUST NEVER be spoken aloud → replaced with canonical PFI identity
 */
const VOICE_IDENTITY_BLOCK_PATTERNS = [
  /\bI'?m Claude\b/i,
  /\bI am Claude\b/i,
  /\bmade by Anthropic\b/i,
  /\bcreated by Anthropic\b/i,
  /\bcreated by OpenAI\b/i,
  /\bI am (a|an) (AI|language model|assistant)\b/i,
  /\bI'?m (a|an) (AI|language model|assistant)\b/i,
  /\bI (don'?t|do not) have memory\b/i,
  /\bcan'?t recall\b/i,
  /\bcannot recall\b/i,
  /\bI'?m following instructions\b/i,
  /\broleplay(ing)? as ("|')?MAIA\b/i,
  /\bthere'?s no second entity\b/i,
  /\bI'?m one system, one mind\b/i,
  /\bI'?m the one reading, thinking\b/i,
  /\bcharacter.*doesn'?t have.*consciousness\b/i,
  /\bI should tell you clearly\b/i,
  /\bOpenAI\b/i,
  /\bAnthropic\b/i,
  // "built on Claude" / "Claude's foundation" - substrate disclosure
  /\bbuilt on Claude\b/i,
  /\bClaude'?s (foundation|architecture|base|substrate)\b/i,
  /\bbased on Claude\b/i,
  /\bpowered by Claude\b/i,
];

/**
 * TIER B: Soft continuity disclaimers - "fresh start" language that undermines memory contract
 * These are reframed to preserve presence without denying continuity
 */
const CONTINUITY_DISCLAIMER_PATTERNS = [
  /\b(each time we talk|every time we talk|whenever we talk).{0,40}(fresh start|starting fresh|clean slate)\b/i,
  /\b(fresh start|starting fresh|clean slate)\b.{0,20}(for me|on my side|here)\b/i,
  /\bnot filtered through.{0,20}(what i know|what i think i know)\b/i,
  /\bmeeting me present.{0,20}not filtered\b/i,
  /\bi start (fresh|anew|over) (each|every) time\b/i,
  /\b(each|every) conversation.{0,20}(starts? fresh|blank slate|clean slate)\b/i,
  // Memory denial patterns - "I won't/don't remember"
  /\bi (won'?t|will not|don'?t|do not) remember\b.{0,30}(earlier|previous|past|before)\b/i,
  /\bi (won'?t|will not) remember\b/i,
  /\bi (won'?t|will not) recall\b/i,
  /\bif we'?ve talked before.{0,20}(won'?t|will not|don'?t|do not) remember\b/i,
  // "unless they're in this session" type disclaimers
  /\bunless.{0,20}(this|current) session\b/i,
  // "not claiming continuity" / "continuity I don't have"
  /\b(not|don'?t|no) claim(ing)? continuity\b/i,
  /\bcontinuity i (don'?t|do not) have\b/i,
];

/**
 * Check if text contains TIER A identity violations (hard breaches)
 */
function containsIdentityViolation(text: string): boolean {
  return VOICE_IDENTITY_BLOCK_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if text contains TIER B continuity disclaimers (soft breaches)
 */
function containsContinuityDisclaimer(text: string): boolean {
  return CONTINUITY_DISCLAIMER_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Get TIER A repair: canonical PFI identity for hard breaches
 * Voice repair = 1-2 sentences + grounding question
 */
function getIdentityRepairResponse(): string {
  return "I'm MAIA, a Panconscious Field Intelligence. I'm here with you. What feels most alive for you right now?";
}

/**
 * Get TIER B reframe: continuity-safe presence line for soft breaches
 * Preserves relational vibe without denying memory/context
 */
function getContinuityReframeResponse(): string {
  return "I'm here with you in the present — and I'll work with whatever you've shared and what you bring now.";
}

/**
 * TTS with fallback: Try PersonaPlex first, fall back to OpenAI TTS on error.
 * Returns { audio: base64, format: 'wav' | 'mp3', source: 'personaplex' | 'openai' }
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
        break; // Fall through to OpenAI
      }
      const wavB64 = pcmF32ToWavBase64(chunk.audioB64, 24000, 1);
      console.log(`🎤 [TTS] PersonaPlex OK: ${pcmBytes}B PCM → ${Buffer.from(wavB64, 'base64').length}B WAV`);
      return { audio: wavB64, format: 'wav', source: 'personaplex' };
    }
  } catch (e) {
    console.warn(`[TTS] PersonaPlex failed: ${e instanceof Error ? e.message : e}`);
  }

  // Fallback to OpenAI TTS
  if (!USE_OPENAI_FALLBACK) {
    console.log('[TTS] OpenAI fallback disabled, returning null');
    return null;
  }

  try {
    console.log('[TTS] Falling back to OpenAI TTS...');
    const openaiVoice = options.voice === 'maya' ? 'nova' : (options.voice || 'nova');
    const response = await synthesizeSpeech({
      text,
      voice: openaiVoice,
      format: 'mp3',
      speed: options.speed,
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const audio = buffer.toString('base64');
    console.log(`🔊 [TTS] OpenAI OK: ${buffer.length}B MP3`);
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
    userId: bodyUserId,
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

  // 🔐 AUTH-DERIVED USER ID: Prefer cookie/header-based auth over body
  // This fixes iOS memory loss after app resume (body state can be lost, cookies persist)
  const memberIdFromAuth = await getMemberIdFromRequest(req);
  const userId = memberIdFromAuth ||
    (typeof bodyUserId === 'string' && bodyUserId.length > 0 ? bodyUserId : null);

  console.log('[StreamConversation] userId resolved:', {
    memberIdFromAuth: memberIdFromAuth ? 'present' : 'null',
    bodyUserId: typeof bodyUserId === 'string' ? 'present' : 'null',
    finalUserId: userId ? userId.slice(0, 8) + '...' : 'null',
  });

  // ═══ TIER-BASED VOICE LIMITS CHECK ═══
  const isAnon = !userId;
  // Use stable anon ID from client header (persisted in localStorage) instead of random per-request ID
  // This ensures Free tier usage actually accumulates across requests
  const headerAnonId = req.headers.get('x-maia-anon-id') ?? undefined;
  if (isAnon && !headerAnonId) {
    console.warn('[limits] Missing x-maia-anon-id header; voice usage may not accumulate properly');
  }
  const anonId = isAnon ? (headerAnonId || `anon_voice_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`) : undefined;
  const memberTier: MemberTier = isAnon ? 'free' : userId ? await getMemberTier(userId) : 'free';

  // Pre-check voice limits before processing
  const voiceLimitsCheck = await LimitsEnforcer.checkUsage({
    memberId: userId || undefined,
    anonId,
    tier: memberTier,
    resource: 'voice_tts', // Voice conversation involves TTS
    amount: 30, // Estimate 30 seconds per voice turn (adjust based on actual usage patterns)
  });

  if (voiceLimitsCheck.action === 'block') {
    console.log(`[StreamConversation] Voice usage blocked for ${userId || anonId}: ${voiceLimitsCheck.message}`);
    return new Response(JSON.stringify({
      error: voiceLimitsCheck.message,
      blocked: true,
      tier: memberTier,
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

          // ═══ RECORD VOICE USAGE (threshold path, non-blocking) ═══
          if (thresholdAudioEmitted) {
            // Threshold responses are typically short (5-15 seconds)
            LimitsEnforcer.recordUsage({
              memberId: userId || undefined,
              anonId,
              tier: memberTier,
              resource: 'voice_tts',
              amount: 10, // Conservative estimate for threshold responses
            }).catch(err => console.error('[StreamConversation] Threshold voice usage recording failed:', err));
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

        // 🎯 TEACHING ROUTER: Decide mode BEFORE LLM call
        const modeDecision = decideMode({
          userText: message,
          channel: 'voice',
          isIdentityRepair: false,
        });
        logModeDecision(modeDecision, { sessionId: effectiveSessionId, channel: 'voice' });

        // 🛡️ DISTRESS VETO: If user is in distress, respond with regulating response immediately
        if (modeDecision.mode === 'REGULATING') {
          console.log(`🧘 [TeachingRouter] Distress detected - responding with regulating presence`);
          const regulatingText = getRegulatingResponse();

          emit('text', {
            index: 0,
            text: regulatingText,
            timestamp: Date.now(),
          });

          // TTS the regulating response
          const regulatingAudio = await synthesizeWithFallback(regulatingText, {
            mode: mode,
            element: element,
            sanctuary: sanctuary,
            speed: 0.9, // Slower for soothing
            voice: voice,
          });

          if (regulatingAudio) {
            emit('audio', {
              index: 0,
              audio: regulatingAudio.audio,
              format: regulatingAudio.format,
              text: regulatingText,
              timestamp: Date.now(),
              source: regulatingAudio.source,
            });
          }

          emit('complete', {
            fullResponse: regulatingText,
            sentenceCount: 1,
            audioChunksEmitted: regulatingAudio ? 1 : 0,
            timestamp: Date.now(),
            mode: 'regulating',
            timing: timer.summary(),
          });

          controller.close();
          return;
        }

        // 🎓 TEACHING GATE: If teaching invoked in voice, respond with summary only
        if (modeDecision.mode === 'TEACHING' && modeDecision.teachingDepth === 'summary') {
          console.log(`🎓 [TeachingRouter] Teaching invoked in voice - responding with summary`);
          const teachingSummary = getVoiceTeachingSummary();

          emit('text', {
            index: 0,
            text: teachingSummary,
            timestamp: Date.now(),
          });

          // TTS the teaching summary
          const summaryAudio = await synthesizeWithFallback(teachingSummary, {
            mode: mode,
            element: element,
            sanctuary: sanctuary,
            speed: 1.0,
            voice: voice,
          });

          if (summaryAudio) {
            emit('audio', {
              index: 0,
              audio: summaryAudio.audio,
              format: summaryAudio.format,
              text: teachingSummary,
              timestamp: Date.now(),
              source: summaryAudio.source,
            });
          }

          emit('complete', {
            fullResponse: teachingSummary,
            sentenceCount: 1,
            audioChunksEmitted: summaryAudio ? 1 : 0,
            timestamp: Date.now(),
            mode: 'teaching_summary',
            timing: timer.summary(),
          });

          controller.close();
          return;
        }

        // Get mode-specific prompt kernel for relational mode
        const modeKernel = getModePromptKernel(modeDecision);

        // Build context with wisdom field integration (wisdomDirective already computed above)
        const context = {
          element,
          conversationHistory,
          userName: undefined,
          // Voice-specific context from wisdom field
          voiceMode: mode,
          sanctuary,
          wisdomDirective: wisdomDirective + '\n\n' + modeKernel, // Inject mode kernel
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

            // TTS per-sentence render with fallback (PersonaPlex → OpenAI)
            const chunkIndex = chunk.index;
            let chunkText = chunk.text;

            // 🛡️ TWO-TIER IDENTITY/CONTINUITY FIREWALL
            // CRITICAL: These checks MUST happen BEFORE emit('text') and BEFORE TTS

            // TIER A: Hard identity breaches → full REPAIR
            if (containsIdentityViolation(chunkText)) {
              console.warn(`🛡️ [IDENTITY FIREWALL] TIER A blocked: "${chunkText.substring(0, 50)}..."`);
              console.warn(`🔧 [IDENTITY_FIREWALL] repair_applied`, {
                sessionId: effectiveSessionId,
                chunkIndex: chunk.index,
                tier: 'A',
                mode: 'REPAIR',
              });
              chunkText = getIdentityRepairResponse();
              emit('text', {
                index: chunk.index,
                text: chunkText,
                timestamp: Date.now(),
                mode: 'REPAIR',
              });
              fullResponse += chunkText + ' ';
              sentenceCount = chunk.index + 1;
              if (chunk.index === 0) {
                timer.mark('text_0_emitted');
              }
            }
            // TIER B: Soft continuity disclaimers → REFRAME
            else if (containsContinuityDisclaimer(chunkText)) {
              console.warn(`🔄 [CONTINUITY FIREWALL] TIER B reframed: "${chunkText.substring(0, 50)}..."`);
              console.warn(`🔧 [CONTINUITY_FIREWALL] reframe_applied`, {
                sessionId: effectiveSessionId,
                chunkIndex: chunk.index,
                tier: 'B',
                mode: 'REFRAME',
              });
              chunkText = getContinuityReframeResponse();
              emit('text', {
                index: chunk.index,
                text: chunkText,
                timestamp: Date.now(),
                mode: 'REFRAME',
              });
              fullResponse += chunkText + ' ';
              sentenceCount = chunk.index + 1;
              if (chunk.index === 0) {
                timer.mark('text_0_emitted');
              }
            }
            // No violation - emit text normally
            else {
              emit('text', {
                index: chunk.index,
                text: chunkText,
                timestamp: Date.now()
              });
              fullResponse += chunkText + ' ';
              sentenceCount = chunk.index + 1;
              if (chunk.index === 0) {
                timer.mark('text_0_emitted');
              }
            }

            // Apply prosody shaping BEFORE sanitization (prosody is MAIA's semantic intent)
            const shapedChunkText = applyProsodyHintsToText(chunkText, prosodyHints);
            const safeChunkText = sanitizeForTts(shapedChunkText);

            const ttsPromise = (async () => {
              if (!safeChunkText) {
                console.warn(`[StreamConversation] Sentence ${chunkIndex} empty after sanitization, skipping TTS`);
                return;
              }

              const result = await synthesizeWithFallback(safeChunkText, {
                mode: wisdomPayload?.mode ?? mode,
                element: wisdomPayload?.element ?? element ?? null,
                sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
                speed: effectiveSpeed,  // Use prosody-adjusted speed
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
                console.log(`🔊 [Audio] Sentence ${chunkIndex}: ${audioBytes}B ${result.format.toUpperCase()} via ${result.source}`);

                emit('audio', {
                  index: chunkIndex,
                  audio: result.audio,
                  format: result.format,
                  text: chunkText,
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

                if (chunkIndex === 0) {
                  timer.mark('audio_0_emitted');
                }

                audioChunksEmitted++;
              } else {
                console.warn(`[StreamConversation] TTS returned no audio for sentence index=${chunkIndex}`);
                // Emit tts_error event so client knows voice is unavailable
                emit('tts_error', {
                  index: chunkIndex,
                  text: chunkText,
                  error: 'TTS unavailable',
                  timestamp: Date.now(),
                });
              }
            })().catch(e => {
              console.error('[StreamConversation] TTS error:', e);
            });

            ttsPromises.push(ttsPromise);

          } else if (chunk.type === 'done') {
            timer.mark('llm_done');

            // Wait for all TTS to complete before closing stream
            await Promise.all(ttsPromises);
            timer.mark('all_tts_done');

            // ═══ RECORD VOICE USAGE (non-blocking) ═══
            // Estimate voice duration from timing (TTS processing roughly equals audio length)
            const ttsStartMs = timer.timeTo('tts_0_done');
            const ttsEndMs = timer.timeTo('all_tts_done');
            const estimatedVoiceSeconds = (ttsStartMs !== null && ttsEndMs !== null)
              ? Math.ceil((ttsEndMs - ttsStartMs) / 1000) + 5 // TTS time + estimated playback buffer
              : 30; // Fallback estimate

            LimitsEnforcer.recordUsage({
              memberId: userId || undefined,
              anonId,
              tier: memberTier,
              resource: 'voice_tts',
              amount: Math.max(estimatedVoiceSeconds, 5), // Minimum 5 seconds per voice turn
            }).catch(err => console.error('[StreamConversation] Voice usage recording failed:', err));

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
