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
import os from 'os';
import { getClaudeService } from '@/lib/services/ClaudeService';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';
import * as ttsRouter from '@/lib/tts/ttsRouter';
import { TTSFallbackToOpenAI } from '@/lib/tts/ttsRouter';
import { resolveOpenAIVoice, resolveKokoroVoice } from '@/lib/voice/voiceMap';
import { SOVEREIGN_VOICES, resolveToKokoro, resolveToOpenAI } from '@/lib/voice/sovereignVoices';
import type { Element } from '@/lib/types/voiceIntent';
import { shapeForSpeech } from '@/lib/voice/textShaper';

// ── PFI Speech Director: relational state → compact TTS instructions ─────────
// Computed ONCE per turn from live relational signals. NOT a static preset.
// Kept short (6-30 words) to avoid gpt-4o-mini-tts over-compliance.

const MAIA_VOICE_BASE = `Speak naturally as a warm, intelligent woman. Clear, bright, and settled. Keep a light, feminine vocal quality throughout — never drop into a low or husky register. Relaxed pacing. Gentle emphasis. Not too dynamic — steady and present.`;

function buildRelationalSpeechInstructions(input: {
  posture?: string;
  mode?: string;
  activation?: number;
  element?: string;
  sanctuary?: boolean;
  prosodyHints?: { warmth?: string; pace?: string; emphasis?: string; intentTag?: string };
}): string {
  const parts: string[] = [MAIA_VOICE_BASE];

  // Posture-driven delivery (from relational stack)
  if (input.posture === 'HOLD') {
    parts.push('Unhurried. Present. Space around each phrase.');
  } else if (input.posture === 'MEET_REGULATE') {
    parts.push('Steady and grounding. Slightly slower. Settling.');
  } else if (input.posture === 'MEET_BOUNDARY') {
    parts.push('Clear and firm. Respectful directness.');
  }
  // MEET = default, no extra instruction needed

  // Activation level (high = contain, don't match energy)
  if (typeof input.activation === 'number' && input.activation > 0.7) {
    parts.push('Contained. Do not match high energy. Settle.');
  }

  // Sanctuary = more spacious
  if (input.sanctuary) {
    parts.push('Spacious pacing. Let silence carry meaning.');
  }

  // Element flavor (subtle, one phrase max)
  if (input.element === 'water') parts.push('Softer. Emotionally attuned.');
  else if (input.element === 'fire') parts.push('Clearer. More precise.');
  else if (input.element === 'aether') parts.push('Spare. Open. Unhurried.');
  // earth and air = default, no extra instruction

  // Prosody hints (semantic strings from ProsodyHints: 'cool'|'neutral'|'warm'|'very_warm' etc)
  if (input.prosodyHints) {
    if (input.prosodyHints.warmth === 'very_warm') {
      parts.push('Warmer.');
    }
    if (input.prosodyHints.pace === 'slow') {
      parts.push('Slower.');
    }
  }

  return parts.join(' ');
}
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
import {
  renderWithPersonaPlex,
  isPersonaPlexReady,
  markPersonaPlexHealthy,
  markPersonaPlexUnhealthy,
} from '@/lib/voice/personaplex/personaPlexClient';
import { buildProsodyHints } from '@/lib/voice/prosody/buildProsodyHints';
import { scaleProsody } from '@/lib/voice/prosody/scaleProsody';
import { applyMemberOffsets } from '@/lib/voice/prosody/applyMemberOffsets';
import {
  applyProsodyToText as applyProsodyHintsToText,
  mapProsodyToSpeed,
  generateSSML,
} from '@/lib/tts/ttsAdapter';
import type { ProsodyRange, ProsodyHints } from '@/src/types/voice';
import { logMaiaTurn } from '@/lib/learning/maiaTrainingDataService';
import { fireAndForgetFieldMonitor } from '@/lib/consciousness/fieldMonitorTelemetry';
import { getSystemVoiceProfile, getMemberVoicePreferences, mergeVoiceIntent } from '@/lib/voice/voiceControlsService';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { classifyConversationDepth, tierToBrevity } from '@/lib/consciousness/conversationDepthClassifier';
import { resolveCouncil, buildCouncilPromptSection, normalizeGuideId } from '@/lib/consciousness/interpretiveCouncil';
import { enforceMaiaIdentity } from '@/lib/maia/identityGuard';
import { query } from '@/lib/db/postgres';

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
    voiceArchetype?: string | null;
    /** Member's TTS provider preference: 'auto' | 'cloud' | 'local' | null */
    ttsProvider?: string | null;
    /**
     * Skip PersonaPlex entirely (iPhone/PWA path).
     * PersonaPlex at 8s timeout is still too slow for mobile streaming speech.
     * iOS Safari will silently gap or stutter waiting for a single sentence.
     */
    skipPersonaPlex?: boolean;
    /**
     * Pre-computed SSML markup for this text.
     * Used by SSML-capable engines (Kokoro). Ignored by OpenAI and PersonaPlex.
     * Omit or pass null to use plain shaped text.
     */
    ssml?: string | null;
    /**
     * PFI Speech Director instructions for OpenAI TTS.
     * Computed once per turn from relational state. Passed to gpt-4o-mini-tts `instructions` field.
     */
    speechInstructions?: string | null;
  }
): Promise<{ audio: string; format: string; source: string } | null> {
  // ── PersonaPlex (Sesame CSM) — gate on health cache to avoid stalling ──
  // isPersonaPlexReady() costs ~0 ms when the cache is warm; a real HTTP
  // health check (≤ 5 s) only runs once per 30 s.  This prevents the old
  // behaviour of blocking every TTS sentence for up to 30 s when the
  // service is down.
  // skipPersonaPlex=true (iPhone/PWA) bypasses this entirely — on mobile,
  // even a 300 ms health probe adds perceptible cognitive delay.
  const ppReady = options.skipPersonaPlex
    ? false
    : await isPersonaPlexReady().catch(() => false);
  if (ppReady) {
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
        const pcmBytes = Buffer.from(chunk.audioB64, 'base64').length;
        if (pcmBytes < 100) {
          console.warn(`[TTS] PersonaPlex returned very small audio (${pcmBytes}B), falling back`);
          markPersonaPlexUnhealthy();
          break;
        }
        const wavB64 = pcmToWavBase64(chunk.audioB64, 24000, 1);
        markPersonaPlexHealthy(); // confirm liveness without extra RTT
        console.log(`🎤 [TTS] PersonaPlex OK: ${pcmBytes}B PCM → ${Buffer.from(wavB64, 'base64').length}B WAV`);
        return { audio: wavB64, format: 'wav', source: 'personaplex' };
      }
    } catch (e) {
      markPersonaPlexUnhealthy();
      console.warn(`[TTS] PersonaPlex failed: ${e instanceof Error ? e.message : e}`);
    }
  } else {
    console.log('[TTS] PersonaPlex skipped (cached health=unhealthy)');
  }

  // ── TTS routing: TWO-LANE VOICE (2026-03-28)
  // Lane 1 (default): OpenAI with Speech Director — full-utterance prosody, relational quality
  // Lane 2 (sovereign): Kokoro — offline, private, stable
  // Member chooses via settings: auto=OpenAI, local=Kokoro, cloud=OpenAI ──
  const elementKey = (options.element ?? '').toLowerCase() as Element;
  const memberProvider = options.ttsProvider || 'auto';

  // ── Resolve sovereign voice IDs before passing to any provider ──
  const rawVoice = options.voice && options.voice !== 'maya' ? options.voice : undefined;
  const isSovereignId = rawVoice ? SOVEREIGN_VOICES.some(v => v.id === rawVoice) : false;
  const kokoroVoice = rawVoice
    ? (isSovereignId ? resolveToKokoro(rawVoice) : rawVoice)
    : undefined;
  const openaiVoice = rawVoice
    ? (isSovereignId ? resolveToOpenAI(rawVoice) : rawVoice)
    : undefined;

  // ── Resolve log: what this request decided BEFORE any synthesis ──
  console.info('[tts.resolve]', JSON.stringify({
    path: 'stream-conversation',
    ttsProviderPref: memberProvider,
    voiceArchetype: options.voiceArchetype || null,
    openaiVoice: openaiVoice ?? 'alloy',
    kokoroVoice: kokoroVoice || null,
    localEnabled: true, // SOVEREIGNTY FLIP: Kokoro is always primary
  }));

  // ── Member chose "local" → Kokoro only, no cloud fallback ──
  if (memberProvider === 'local') {
    console.info('[tts.attempt]', JSON.stringify({ provider: 'kokoro', voice: kokoroVoice, reason: 'member_chose_local' }));
    try {
      // Prefer SSML input when available — Kokoro-FastAPI supports SSML for
      // precise pause/rate/emphasis control without text-shaping tricks.
      const kokoroInput = options.ssml ?? text;
      const result = await ttsRouter.synthesize({
        text: kokoroInput,
        voice: kokoroVoice,
        format: 'mp3',
        speed: options.speed,
        voiceHint: elementKey ? { element: elementKey, speed: options.speed } as any : undefined,
        ttsProviderPref: 'local',
      });
      const audio = result.audioBuffer.toString('base64');
      const label = options.ssml ? 'ssml' : 'plain';
      console.log(`[TTS] provider=kokoro member_choice=local input=${label} ${result.audioBuffer.length}B MP3`);
      return { audio, format: 'mp3', source: 'kokoro' };
    } catch (err) {
      console.warn(`[TTS] Kokoro failed, member chose local-only — no fallback: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }

  // ── Member chose "cloud" → OpenAI with relational instructions, no Kokoro fallback ──
  if (memberProvider === 'cloud') {
    const openaiDisabled = process.env.DISABLE_OPENAI_COMPLETELY === 'true'
      || !process.env.OPENAI_API_KEY;
    if (openaiDisabled) {
      console.warn('[TTS] cloud TTS requested but DISABLE_OPENAI_COMPLETELY=true — returning null');
      return null;
    }
    const finalOpenaiVoice = openaiVoice ?? 'alloy';
    const shapedText = shapeForSpeech(text);
    // Use per-turn relational instructions if available, otherwise base identity only
    const instructions = options.speechInstructions || MAIA_VOICE_BASE;

    console.info('[tts.attempt]', JSON.stringify({
      provider: 'openai',
      voice: finalOpenaiVoice,
      reason: 'member_chose_cloud',
      hasRelationalInstructions: Boolean(options.speechInstructions),
    }));
    try {
      const response = await synthesizeSpeech({
        text: shapedText,
        voice: finalOpenaiVoice,
        format: 'mp3',
        speed: options.speed,
        instructions,
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      return { audio: buffer.toString('base64'), format: 'mp3', source: 'openai' };
    } catch (e) {
      console.error(`[TTS] OpenAI failed (member chose cloud): ${e instanceof Error ? e.message : e}`);
      return null;
    }
  }

  // ── DEFAULT: OpenAI with relational instructions — full-utterance prosody ──
  const openaiDisabled = process.env.DISABLE_OPENAI_COMPLETELY === 'true'
    || !process.env.OPENAI_API_KEY;

  if (!openaiDisabled) {
    const finalOpenaiVoice = openaiVoice ?? 'alloy';
    const shapedText = shapeForSpeech(text);
    const instructions = options.speechInstructions || MAIA_VOICE_BASE;

    console.info('[tts.attempt]', JSON.stringify({
      provider: 'openai',
      voice: finalOpenaiVoice,
      reason: 'relational_primary',
      hasRelationalInstructions: Boolean(options.speechInstructions),
      shapedLength: shapedText.length,
    }));

    try {
      const response = await synthesizeSpeech({
        text: shapedText,
        voice: finalOpenaiVoice,
        format: 'mp3',
        speed: options.speed,
        instructions,
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      return { audio: buffer.toString('base64'), format: 'mp3', source: 'openai' };
    } catch (e) {
      console.error(`[TTS] OpenAI failed: ${e instanceof Error ? e.message : e}`);
      // Fall through to Kokoro sovereign fallback
    }
  }

  // ── SOVEREIGN FALLBACK: Kokoro — when OpenAI is unavailable or disabled ──
  console.info('[tts.attempt]', JSON.stringify({ provider: 'kokoro', voice: kokoroVoice, reason: 'sovereign_fallback' }));
  try {
    const kokoroInput = options.ssml ?? text;
    const result = await ttsRouter.synthesize({
      text: kokoroInput,
      voice: kokoroVoice,
      format: 'mp3',
      speed: options.speed,
      voiceHint: elementKey ? { element: elementKey, speed: options.speed } as any : undefined,
      ttsProviderPref: 'auto',
    });
    const audio = result.audioBuffer.toString('base64');
    return { audio, format: 'mp3', source: 'kokoro' };
  } catch (kokoroErr) {
    console.error(`[TTS] Kokoro also failed: ${kokoroErr instanceof Error ? kokoroErr.message : kokoroErr}`);
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
 * TWO-LANE: OpenAI with relational instructions (primary), Kokoro (sovereign fallback).
 * Returns base64 audio data or null on failure.
 */
async function synthesizeSentence(
  text: string,
  voice: string = 'maia_core',
  speed: number = 1.0,
  element?: string | null,
  speechInstructions?: string | null,
): Promise<{ audio: string; format: string } | null> {
  const elementKey = (element ?? '').toLowerCase() as Element;

  // ── Resolve sovereign voice IDs ──
  const rawVoice = voice && voice !== 'maya' ? voice : undefined;
  const isSovereign = rawVoice ? SOVEREIGN_VOICES.some(v => v.id === rawVoice) : false;
  const resolvedKokoro = rawVoice ? (isSovereign ? resolveToKokoro(rawVoice) : rawVoice) : undefined;
  const resolvedOpenai = rawVoice ? (isSovereign ? resolveToOpenAI(rawVoice) : rawVoice) : undefined;

  const openaiDisabled = process.env.DISABLE_OPENAI_COMPLETELY === 'true'
    || !process.env.OPENAI_API_KEY;

  // ── Lane 1: OpenAI with relational instructions ──
  if (!openaiDisabled) {
    const openaiVoice = resolvedOpenai ?? 'alloy';
    const shapedText = shapeForSpeech(text);
    const instructions = speechInstructions || MAIA_VOICE_BASE;

    try {
      const response = await synthesizeSpeech({
        text: shapedText,
        voice: openaiVoice,
        format: 'mp3',
        speed,
        instructions,
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      return { audio: buffer.toString('base64'), format: 'mp3' };
    } catch (e) {
      console.error(`[synthesizeSentence] OpenAI failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  // ── Lane 2: Kokoro sovereign fallback ──
  try {
    const result = await ttsRouter.synthesize({
      text,
      voice: resolvedKokoro,
      format: 'mp3',
      speed,
      voiceHint: elementKey ? { element: elementKey, speed } as any : undefined,
    });
    const audio = result.audioBuffer.toString('base64');
    return { audio, format: 'mp3' };
  } catch (kokoroErr) {
    console.error(`[synthesizeSentence] Kokoro also failed: ${kokoroErr instanceof Error ? kokoroErr.message : kokoroErr}`);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body: StreamRequest = await req.json();

  // ─── TURN INSTRUMENTATION ───
  // Client generates a UUID per turn and sends it as x-voice-turn-id.
  // If missing (older client), generate server-side. Used to correlate
  // client-side logs with backend marks in the same console grep.
  const turnId = req.headers.get('x-voice-turn-id') || crypto.randomUUID();
  const host = process.env.MAIA_HOST_ID || os.hostname();

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

  // ── PLATFORM DETECTION ──────────────────────────────────────────────────
  // iPhone/iPad PWA: skip PersonaPlex entirely.
  // PersonaPlex timeout (even the reduced 8 s) is too expensive for mobile
  // streamed speech — a single stall makes MAIA feel cognitively delayed.
  // The health cache helps when the service is known down, but if the cache
  // is cold (first request after 30 s) the probe still blocks.  Safest fix:
  // iOS gets the cloud/local chain directly, no PersonaPlex hop.
  const ua = req.headers.get('user-agent') ?? '';
  const isIosPwa = /iPhone|iPad/i.test(ua);
  if (isIosPwa) console.log('[StreamConversation] iOS client detected — PersonaPlex skipped');

  // Resolve member ID: body first, then header fallback (iOS/Safari x-member-id)
  const userId = bodyUserId || await getMemberIdFromRequest(req);

  // Initialize timing instrumentation
  const timer = createVoiceTimer({ turnId, host });
  timer.mark('request_received');

  // Load voice preference offsets (language-level, shapes text generation)
  // AND voice_id_override (which voice character the member chose in settings)
  let voiceOffsets: { pace: number; warmth: number; poetry: number; directiveness: number; energy: number } | undefined;
  let effectiveVoice = voice; // Start with what the frontend sent
  let memberTtsProvider: string | null = null;
  let memberTherapeuticApproach = 'auto';
  try {
    const [systemVoice, memberVoice, settingsRow] = await Promise.all([
      getSystemVoiceProfile(),
      getMemberVoicePreferences(userId || ''),
      userId
        ? query(`SELECT therapeutic_approach FROM member_settings WHERE member_id = $1`, [userId])
            .then(r => r.rows[0] ?? null)
            .catch(() => null)
        : Promise.resolve(null),
    ]);
    if (settingsRow?.therapeutic_approach) {
      memberTherapeuticApproach = normalizeGuideId(settingsRow.therapeutic_approach);
    }
    const merged = mergeVoiceIntent(systemVoice, memberVoice);
    voiceOffsets = merged.intent;
    memberTtsProvider = merged.ttsProvider;
    // If member has a voice_id_override in the database, use it as the
    // authoritative voice — ensures cross-device consistency
    if (merged.voiceId && merged.voiceId !== 'maia') {
      effectiveVoice = merged.voiceId;
    }
  } catch (e) {
    console.warn('[StreamConversation] Voice prefs load failed (continuing without):', e);
  }

  console.log('🔊 [StreamConversation] Received voice settings:', { voice: effectiveVoice, speed, mode, sanctuary, ttsProvider: memberTtsProvider });
  console.log(`🔊 [StreamConversation] Message: "${(message || '').substring(0, 80)}" (${conversationHistory?.length ?? 0} history msgs)`);

  if (!message?.trim()) {
    console.warn('🔊 [StreamConversation] ⚠️ Empty message received! Raw value:', JSON.stringify(message));
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
            turnId,
            host,
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

        // ============ CONVERSATION DEPTH CLASSIFICATION ============
        // MAIA meets the member at their present level of awareness.
        // She only invokes deeper processing when the conversation asks for it.
        // Tier A = presence/threshold (levels 1–2)
        // Tier B = conversational core (levels 3–5)
        // Tier C = deep process (levels 6–7)
        const depthClass = classifyConversationDepth(message, {
          activation: voiceSession.relationalStack.smoother.lastActivation,
          conversationLength: voiceSession.metrics?.totalTurns ?? 0,
          posture: guidance?.posture,
          mode: voiceSession.relationalStack.currentMode,
        });
        // effectiveBrevity: the depth tier can pull 'brief' into threshold responses
        // or allow 'moderate' for core, but never forces 'expansive' (relational stack decides that)
        const rawBrevity = tierToBrevity(depthClass.tier, guidance?.brevity);
        // Care mode depth-aware expansion: when member is seeking guidance (depth signal present),
        // don't lock to brief even at threshold — calmness ≠ completion.
        // Talk mode: same rule — start brief, expand when depth warrants it.
        const effectiveBrevity = (
          rawBrevity === 'brief' &&
          depthClass.depthScore > 0.3 &&
          (mode === 'care' || mode === 'talk')
        ) ? 'moderate' : rawBrevity;
        console.info('[depth.classify]', JSON.stringify({
          tier: depthClass.tier,
          awarenessLevel: depthClass.awarenessLevel,
          depthScore: depthClass.depthScore.toFixed(2),
          effectiveBrevity,
          guidanceBrevity: guidance?.brevity,
          topSignals: depthClass.signals.slice(0, 4),
        }));

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
          brevity: effectiveBrevity,       // depth-tier aware brevity
          posture: guidance?.posture ?? 'MEET',
          element: wisdomPayload?.element ?? element ?? null,
          baseline: voiceSession.prosodyBaseline, // Conversation Prosody Memory
        });

        // Scale hints by user's Range of Effect preference
        const scaledHints = scaleProsody(baseHints, effectiveRange);

        // Apply member voice offsets from Settings/Voice (multiplicative, bounded)
        // Canonical order: buildProsodyHints → scaleProsody → applyMemberOffsets → aetherGuard
        const prosodyHints: ProsodyHints = applyMemberOffsets(scaledHints, voiceOffsets);

        // Log member offset application for observability
        if (voiceOffsets && (voiceOffsets.pace || voiceOffsets.warmth || voiceOffsets.poetry || voiceOffsets.directiveness || voiceOffsets.energy)) {
          console.info('[prosody.member]', JSON.stringify({
            offsets: voiceOffsets,
            pre: { pace: scaledHints.pace, warmth: scaledHints.warmth, energy: scaledHints.energy },
            post: { pace: prosodyHints.pace, warmth: prosodyHints.warmth, energy: prosodyHints.energy },
          }));
        }

        // Compute effective speed from hints + base relational speed
        const effectiveSpeed = mapProsodyToSpeed(relationalSpeed, prosodyHints);

        // ─── PFI SPEECH DIRECTOR: RELATIONAL STATE → TTS INSTRUCTIONS ───
        // Computed ONCE per turn. Same instructions for all sentences in this response.
        // This is the wire that connects relational intelligence to voice rendering.
        const turnSpeechInstructions = buildRelationalSpeechInstructions({
          posture: guidance?.posture,
          mode: wisdomPayload?.mode ?? mode,
          activation: voiceSession.relationalStack.smoother.lastActivation,
          element: wisdomPayload?.element ?? element ?? undefined,
          sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
          prosodyHints: {
            warmth: prosodyHints.warmth,
            pace: prosodyHints.pace,
            emphasis: prosodyHints.emphasis,
            intentTag: prosodyHints.intentTag,
          },
        });

        // Log the final applied speech intelligence (grep: prosody.final)
        console.info('[prosody.final]', JSON.stringify({
          turnId,
          posture: guidance?.posture,
          mode: wisdomPayload?.mode ?? mode,
          activation: voiceSession.relationalStack.smoother.lastActivation?.toFixed(2),
          element: wisdomPayload?.element ?? element,
          sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
          warmth: prosodyHints.warmth,
          pace: prosodyHints.pace,
          speed: effectiveSpeed?.toFixed(3),
          instructionLength: turnSpeechInstructions.length,
        }));

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
          const thresholdSSML = generateSSML(text, prosodyHints);
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
            speed: effectiveSpeed,
            brevity: effectiveBrevity,
            wisdomDirective,
            voice: effectiveVoice,
            ttsProvider: memberTtsProvider,
            skipPersonaPlex: isIosPwa,
            ssml: thresholdSSML,
            speechInstructions: turnSpeechInstructions,
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
            turnId,
            host,
            timing: timer.summary(),
            relational: {
              maiaMode: voiceSession.relationalStack.currentMode,
              activation: voiceSession.relationalStack.smoother.lastActivation,
              prosodySpeed: relationalSpeed,
            },
            guidance: {
              posture: guidance.posture,
              brevity: effectiveBrevity,
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
          // Voice preference offsets — shape text generation (warmth, poetry, directiveness, energy)
          voiceOffsets,
        };

        let fullResponse = '';
        let audioChunksEmitted = 0;
        let sentenceCount = 0;
        let firstTextEmitted = false;
        let firstAudioEmitted = false;
        const ttsPromises: Promise<void>[] = [];

        // ── ORDERED AUDIO BUFFER ──────────────────────────────────────────
        // TTS promises run in parallel for speed, but audio MUST be emitted
        // in sentence-index order so the client queue plays coherently.
        // audioBuffer holds completed results keyed by sentence index; the
        // drainAudioBuffer helper emits in strict order.
        type AudioResult = { audio: string; format: string; source: string; text: string } | null;
        const audioBuffer = new Map<number, AudioResult>();
        let nextEmitIndex = 0;

        const drainAudioBuffer = () => {
          while (audioBuffer.has(nextEmitIndex)) {
            const result = audioBuffer.get(nextEmitIndex)!;
            if (result) {
              if (!firstAudioEmitted) {
                timer.mark('tts_0_done');
                firstAudioEmitted = true;
              }
              const audioBytes = Buffer.from(result.audio, 'base64').length;
              console.log(`🔊 [Audio] Sentence ${nextEmitIndex}: ${audioBytes}B ${result.format.toUpperCase()} via ${result.source}`);
              emit('audio', {
                index: nextEmitIndex,
                audio: result.audio,
                format: result.format,
                text: result.text,
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
              if (nextEmitIndex === 0) timer.mark('audio_0_emitted');
              audioChunksEmitted++;
            }
            nextEmitIndex++;
          }
        };
        // ─────────────────────────────────────────────────────────────────

        // ── INTERPRETIVE GUIDE LENS ──────────────────────────────────────
        // Resolve member's active interpretive guide and inject into system prompt.
        // Same council system used by the oracle text route — now wired to voice.
        const councilResolution = resolveCouncil({
          accountDefault: memberTherapeuticApproach,
          message,
        });
        const conversationDepth = conversationHistory?.length ?? 0;
        const councilPromptSection = buildCouncilPromptSection(councilResolution, conversationDepth);
        const voiceSystemPrompt = councilPromptSection || undefined;
        if (councilResolution.guide.id !== 'auto' || councilResolution.source === 'auto_integrator') {
          console.log(`🏛️ [Voice Council] ${councilResolution.guide.archetypeName} | ${councilResolution.source}`);
        }
        // ─────────────────────────────────────────────────────────────────

        // Stream sentences from Claude
        for await (const chunk of claudeService.generateOracleResponseStreaming(
          message,
          context,
          voiceSystemPrompt
        )) {
          if (chunk.type === 'sentence') {
            // Mark first token timing
            if (!firstTextEmitted) {
              timer.mark('llm_first_chunk');
              firstTextEmitted = true;
            }

            // Enforce MAIA identity before emitting to client
            const identityCheck = enforceMaiaIdentity(chunk.text);
            if (!identityCheck.safe) {
              console.warn('[Voice] Identity breach intercepted:', {
                originalText: chunk.text.substring(0, 80),
                patterns: identityCheck.breachPatterns,
              });
            }

            // Emit text immediately so UI can show it
            emit('text', {
              index: chunk.index,
              text: identityCheck.sanitized,
              timestamp: Date.now(),
              identity_checked: !identityCheck.safe,
            });

            if (chunk.index === 0) {
              timer.mark('text_0_emitted');
            }

            // Accumulate the safe (identity-checked) text, not raw
            fullResponse += identityCheck.sanitized + ' ';
            sentenceCount = chunk.index + 1;

            // TTS per-sentence render with fallback (PersonaPlex → OpenAI → Kokoro)
            const chunkIndex = chunk.index;
            const chunkText = chunk.text;

            // Apply prosody shaping BEFORE sanitization (prosody is MAIA's semantic intent)
            // Generate SSML from original text (before shaping) so SSML-capable engines
            // (Kokoro) get precise prosody markup. Plain-text shaping is fallback for OpenAI.
            const chunkSSML = generateSSML(chunkText, prosodyHints);
            const shapedChunkText = applyProsodyHintsToText(chunkText, prosodyHints);
            const safeChunkText = sanitizeForTts(shapedChunkText);

            const ttsPromise = (async () => {
              if (!safeChunkText) {
                console.warn(`[StreamConversation] Sentence ${chunkIndex} empty after sanitization, skipping TTS`);
                // Still store null so the drain loop can advance past this slot
                audioBuffer.set(chunkIndex, null);
                drainAudioBuffer();
                return;
              }

              if (chunkIndex === 0) {
                timer.mark('tts_0_requested');
              }

              // Per-chunk speed variation (gated: only when pace isn't brisk)
              // Opening sentence slightly forward, subsequent sentences settle
              const useChunkVariation = prosodyHints.pace !== 'brisk' && !sanctuary;
              const chunkSpeed = useChunkVariation && chunkIndex === 0
                ? Math.min(1.15, effectiveSpeed * 1.02)  // Opening: 2% forward
                : effectiveSpeed;

              const result = await synthesizeWithFallback(safeChunkText, {
                mode: wisdomPayload?.mode ?? mode,
                element: wisdomPayload?.element ?? element ?? null,
                sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
                speed: chunkSpeed,
                brevity: effectiveBrevity,
                wisdomDirective,
                voice: effectiveVoice,
                ttsProvider: memberTtsProvider,
                skipPersonaPlex: isIosPwa,
                ssml: chunkSSML,
                speechInstructions: turnSpeechInstructions,
              });

              if (result) {
                // Store result with its original text then drain in order
                audioBuffer.set(chunkIndex, { ...result, text: chunkText });
                drainAudioBuffer();
              } else {
                console.warn(`[StreamConversation] TTS returned no audio for sentence index=${chunkIndex}`);
                audioBuffer.set(chunkIndex, null);
                drainAudioBuffer();
                emit('tts_error', {
                  index: chunkIndex,
                  text: chunkText,
                  error: 'TTS unavailable',
                  timestamp: Date.now(),
                });
              }
            })().catch(e => {
              console.error('[StreamConversation] TTS error:', e);
              // Unblock the drain loop so subsequent sentences can still emit
              audioBuffer.set(chunkIndex, null);
              drainAudioBuffer();
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

            // Final identity check on assembled response (fail-closed)
            const finalIdentityCheck = enforceMaiaIdentity(fullResponse.trim());
            if (!finalIdentityCheck.safe) {
              console.warn('[Voice] Final response identity breach detected:', {
                patterns: finalIdentityCheck.breachPatterns,
                sentenceCount,
              });
            }

            emit('complete', {
              fullResponse: finalIdentityCheck.sanitized,
              sentenceCount,
              audioChunksEmitted,
              timestamp: Date.now(),
              thresholdState: thresholdResult.state,
              moveIntent: llmMoveIntent,
              turnId,
              host,
              timing: timer.summary(),
              relational: {
                maiaMode: voiceSession.relationalStack.currentMode,
                activation: voiceSession.relationalStack.smoother.lastActivation,
                prosodySpeed: relationalSpeed,
              },
              guidance: {
                posture: guidance.posture,
                brevity: effectiveBrevity,
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

            // 🔭 FIELD MONITOR: Turn-level observability (fire-and-forget, never blocks stream)
            if (!sanctuary && fullResponse.trim()) {
              fireAndForgetFieldMonitor({
                memberId: userId || '',
                sessionId: effectiveSessionId,
                route: 'stream',
                responseText: fullResponse.trim(),
                userMessage: message,
                element: wisdomPayload?.element || element,
                voiceMode: voiceSession.relationalStack.currentMode,
                relationalStance: guidance.posture,
                processingPath: 'CORE',
              });
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
