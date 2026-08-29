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

import {
  resolveVoicePreference,
  classifyCloudVoiceGate,
  CloudVoiceForbidden,
} from '@/lib/tts/cloudVoicePolicy';
import { MAIA_VOICE_ARCHETYPES } from '@/lib/voice/voiceArchetypes';
import { sanitizeForSpeech } from '@/lib/tts/sanitizeForSpeech';
import { NextRequest } from 'next/server';
import os from 'os';
import { streamOracleResponse, type TurnProvenance } from '@/lib/ai/oracleStreaming';
// R2 (2026-08-13): voice must inhabit the SAME continuity contract as text MAIA.
// Before this, PWA voice reached ClaudeService with no memory loaded and no memory
// canon guard — which is why MAIA truthfully said she had no memory on this path.
// Reuses the shared composer (MemoryBundleService), not /list's route-specific logic.
import { MemoryBundleService, type MemoryBundle } from '@/lib/memory/MemoryBundle';
import { ConversationMemoryUsesStore } from '@/lib/memory/stores/ConversationMemoryUsesStore';
import { MEMORY_CANON_GUARD_PROMPT } from '@/lib/maia/prompts/memoryCanonGuard';
import { guardVoiceChunk, advanceVoiceGuardTail } from '@/lib/maia/prompts/voiceStreamGuard';
import { synthesizeSpeech } from '@/lib/tts/openaiTts';
import * as ttsRouter from '@/lib/tts/ttsRouter';
import { TTSFallbackToOpenAI } from '@/lib/tts/ttsRouter';
import { resolveOpenAIVoice, resolveKokoroVoice } from '@/lib/voice/voiceMap';
import { SOVEREIGN_VOICES, resolveToKokoro, resolveToOpenAI } from '@/lib/voice/sovereignVoices';
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
import {
  renderWithPersonaPlex,
  isPersonaPlexReady,
  markPersonaPlexHealthy,
  markPersonaPlexUnhealthy,
} from '@/lib/voice/personaplex/personaPlexClient';
import { buildProsodyHints } from '@/lib/voice/prosody/buildProsodyHints';
import { scaleProsody } from '@/lib/voice/prosody/scaleProsody';
import {
  applyProsodyToText as applyProsodyHintsToText,
  mapProsodyToSpeed,
  generateSSML,
} from '@/lib/tts/ttsAdapter';
import type { ProsodyRange, ProsodyHints } from '@/src/types/voice';
import { logMaiaTurn } from '@/lib/learning/maiaTrainingDataService';
import { fireAndForgetFieldMonitor } from '@/lib/consciousness/fieldMonitorTelemetry';
import { storeTrustObservation, inferEngagementProxy, classifyResponseType, isTrustObservationEnabled } from '@/lib/trust/trustObservationService';
import { getSystemVoiceProfile, getMemberVoicePreferences, mergeVoiceIntent } from '@/lib/voice/voiceControlsService';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { classifyConversationDepth, tierToBrevity } from '@/lib/consciousness/conversationDepthClassifier';
import { resolveCouncil, buildCouncilPromptSection, normalizeGuideId } from '@/lib/consciousness/interpretiveCouncil';
import { buildMaiaContext } from '@/lib/maia/context/buildMaiaContext';
import { enforceMaiaIdentity } from '@/lib/maia/identityGuard';
import { query } from '@/lib/db/postgres';
import { detectIdeaCandidate } from '@/lib/consciousness/ideaDetection';

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

  // ── TTS routing: OpenAI Alloy leads, Kokoro only when member picks "local" ──
  const elementKey = (options.element ?? '').toLowerCase() as Element;
  const memberProvider = options.ttsProvider || 'auto';

  // ── Resolve sovereign voice IDs before passing to any provider ──
  const VALID_OPENAI_VOICES = new Set(['nova', 'shimmer', 'echo', 'onyx', 'fable', 'alloy', 'ash', 'sage', 'coral']);
  const rawVoice = options.voice && options.voice !== 'maya' ? options.voice : undefined;
  const isSovereignId = rawVoice ? SOVEREIGN_VOICES.some(v => v.id === rawVoice) : false;
  const kokoroVoice = rawVoice
    ? (isSovereignId ? resolveToKokoro(rawVoice) : rawVoice)
    : undefined;
  // Only pass valid OpenAI voices — unknown/sovereign names fall back to alloy
  const openaiVoice = rawVoice
    ? (isSovereignId ? resolveToOpenAI(rawVoice) : (VALID_OPENAI_VOICES.has(rawVoice) ? rawVoice : undefined))
    : undefined;

  // ── Resolve log: what this request decided BEFORE any synthesis ──
  console.info('[tts.resolve]', JSON.stringify({
    path: 'stream-conversation',
    ttsProviderPref: memberProvider,
    voiceArchetype: options.voiceArchetype || null,
    openaiVoice: openaiVoice ?? 'alloy',
    kokoroVoice: kokoroVoice || null,
    localEnabled: process.env.MAIA_LOCAL_VOICE_ENABLED === '1',
  }));

  // ── Member chose "local" → Kokoro only, no cloud fallback ──
  if (memberProvider === 'local') {
    console.info('[tts.attempt]', JSON.stringify({ provider: 'kokoro', voice: kokoroVoice, reason: 'member_chose_local' }));
    try {
      // VOICE-TTS-SSML-01: Kokoro-FastAPI does NOT interpret SSML — it speaks
      // the markup aloud ("speak", "prosody rate equals 108 percent", "break
      // time equals 120 MS"). The earlier "Kokoro supports SSML" claim was an
      // untested assumption. Send the shaped plain text; prosody architecture
      // is untouched and still applies to any provider that reads SSML.
      const kokoroInput = text;
      const result = await ttsRouter.synthesize({
        text: kokoroInput,
        voice: kokoroVoice,
        format: 'mp3',
        speed: options.speed,
        voiceHint: elementKey ? { element: elementKey, speed: options.speed } as any : undefined,
        ttsProviderPref: 'local',
      });
      const audio = result.audioBuffer.toString('base64');
      const label = options.ssml ? 'plain_ssml_discarded' : 'plain';
      console.log(`[TTS] provider=kokoro member_choice=local input=${label} ${result.audioBuffer.length}B MP3`);
      return { audio, format: 'mp3', source: 'kokoro' };
    } catch (err) {
      console.warn(`[TTS] Kokoro failed, member chose local-only — no fallback: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }

  // ── VOICE-SOVEREIGNTY-01: local TTS is the production authority ──
  //
  // Founder canon ruling 2026-08-27. This block used to read "auto or cloud →
  // OpenAI Alloy leads", which put `provider:"openai"` on ordinary member turns
  // while Kokoro was healthy and available — not a failover, a deliberate
  // preference for the cloud over an available sovereign path, against
  // CLAUDE.md's "Voice: Local TTS/STT or browser APIs only."
  //
  // Under the current canon (MAIA_ALLOW_CLOUD_VOICE unset) auto, cloud and
  // unset all still resolve to local — nothing below changes that. The
  // pre-existing DISABLE_OPENAI_COMPLETELY / missing-key conditions are kept
  // as-is rather than replaced; the ruling declined that flag as the repair.
  // ⭐ VOICE-SOVEREIGNTY-02 (founder ruling 2026-08-27, second pass).
  //
  // The single question this route asks is `voicePref.effective`, and the whole
  // matrix lives in `resolveVoicePreference`. This route does not re-derive it.
  //
  // ⛔ `auto` is NOT in the cloud condition, deliberately and permanently.
  // `auto` is the absence of a choice, and the absence of a choice is not
  // consent to leave the local machine — that `auto`-shaped default reaching
  // OpenAI is the exact violation this lineage exists to close. Under
  // re-permission the flag honours an explicit `cloud`; it does not restore a
  // preferred provider.
  const voicePref = resolveVoicePreference(memberProvider);
  const memberChoseCloud = voicePref.effective === 'cloud';
  const openaiDisabled = !memberChoseCloud
    || process.env.DISABLE_OPENAI_COMPLETELY === 'true'
    || !process.env.OPENAI_API_KEY;

  if (voicePref.cloudRequestedButUnavailable) {
    // ⭐ Truthful, and the stored preference is left exactly as the member set
    // it. Rewriting `cloud` to `local` in their settings would be the system
    // deciding what they meant.
    console.info('[tts.policy]', JSON.stringify({
      storedPreference: voicePref.stored,
      effective: voicePref.effective,
      note: 'cloud voice unavailable under current sovereignty policy; member preference preserved',
    }));
  }

  if (!openaiDisabled) {
    // ── EXPLICIT `cloud` preference, under explicit re-permission → Alloy ──
    // Unreachable while MAIA_ALLOW_CLOUD_VOICE is unset. Never reachable by an
    // `auto` member in any flag state.
    const elementFallback = elementKey ? resolveOpenAIVoice(elementKey) : null;
    const finalOpenaiVoice = openaiVoice ?? elementFallback ?? 'alloy';

    // `reason` no longer says "auto/cloud lead" — auto can no longer be here,
    // and the log line is the thing an auditor greps. It must not describe a
    // route the canon has closed.
    console.info('[tts.attempt]', JSON.stringify({ provider: 'openai', voice: finalOpenaiVoice, reason: 'member_chose_cloud' }));
    try {
      const response = await synthesizeSpeech({
        text,
        voice: finalOpenaiVoice,
        format: 'mp3',
        speed: options.speed,
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      return { audio: buffer.toString('base64'), format: 'mp3', source: 'openai' };
    } catch (e) {
      console.error(`[TTS] OpenAI failed: ${e instanceof Error ? e.message : e}`);
      // ⛔ Deliberately NO `return null` here. The founder ruling is explicit:
      //
      //   cloud preference + cloud unavailable -> local, if local is healthy
      //                                        -> otherwise text
      //
      // Not silence. A member who chose the cloud and cannot be served it falls
      // to the default like anyone who never chose; punishing them with silence
      // for selecting an option the system itself offered is not sovereignty.
      // Falling through to Kokoro is what "Kokoro for offline" means.
    }
  }

  // ── Kokoro path: primary when OpenAI disabled, fallback otherwise ──
  console.info('[tts.attempt]', JSON.stringify({ provider: 'kokoro', voice: kokoroVoice, reason: openaiDisabled ? 'sovereign_primary' : 'openai_fallback' }));
  try {
    // VOICE-TTS-SSML-01: plain text only — see the member-choice branch above.
    const kokoroInput = text;
    const result = await ttsRouter.synthesize({
      text: kokoroInput,
      voice: kokoroVoice,
      format: 'mp3',
      speed: options.speed,
      voiceHint: elementKey ? { element: elementKey, speed: options.speed } as any : undefined,
      // ⭐ DESKTOP-TTS-ALLOY-POLICY-MISMATCH-01 (D1). This was the literal
      // 'auto', which discarded the preference computed at the top of this
      // function. The policy was then enforced against a value the member never
      // set: someone who had stored 'cloud' was refused with `pref=auto`, and
      // the [tts.resolve] log above printed their real choice while the boundary
      // received a different one. The log and the enforcement must agree.
      //
      // The sibling branch's hard-coded 'local' is correct — an `if` above it
      // establishes that as the member's explicit choice. Nothing establishes
      // 'auto' here, so nothing may assert it.
      ttsProviderPref: memberProvider,
      // ⛔ (D2) voiceArchetype is DELIBERATELY NOT forwarded here, and this is
      //    the opposite of the obvious repair. The trace observed correctly that
      //    the router's archetype intercept (ttsRouter.ts:188-206) is dead on
      //    this route — but forwarding the archetype INTO THE LOCAL PATH is not
      //    how to revive it, because the intercept runs BEFORE the Kokoro
      //    dispatch and diverts `maia_core` to OpenAI. The consequences:
      //
      //      no consent  → CloudVoiceForbidden → silence, where the member
      //                    would otherwise have heard Kokoro. That inverts the
      //                    ruling: "Not now" must PRESERVE the local voice, not
      //                    remove it.
      //      consent but → the sentinel throws, this catch does not recognise
      //      no key        it, and the turn is silent anyway.
      //
      //    In production (MAIA_TTS_PROVIDER=kokoro, MAIA_VOICE_OVERRIDE unset)
      //    that would have taken MAIA's voice away from every member using the
      //    default archetype.
      //
      //    ⭐ And it is unnecessary: MAIA's identity already reaches BOTH
      //      providers through the `voice` channel resolved above —
      //      resolveToOpenAI('maia_core') = 'alloy' and
      //      resolveToKokoro('maia_core') = 'af_kore'. The archetype channel
      //      would add no identity, only a diversion.
      //
      //    The archetype is still carried into this function for the resolve and
      //    gate logs, where naming which voice was wanted is exactly the point.
    });
    const audio = result.audioBuffer.toString('base64');
    return { audio, format: 'mp3', source: 'kokoro' };
  } catch (kokoroErr) {
    // ── A CLOSED GATE is not a BROKEN SERVICE ──
    // Both produce no audio; only one is the member's to open, and the log line
    // an operator greps must not describe the wrong one. The original witness
    // read "[TTS] Kokoro failed: cloud voice is not available…" — naming a
    // provider that was never reached. That sentence is why this lane exists.
    if (kokoroErr instanceof CloudVoiceForbidden) {
      console.info('[tts.gate]', JSON.stringify({
        path: 'stream-conversation',
        storedPreference: memberProvider,
        voiceArchetype: options.voiceArchetype || null,
        reason: kokoroErr.reason,
      }));
      return null;
    }
    console.error(`[TTS] Kokoro failed: ${kokoroErr instanceof Error ? kokoroErr.message : kokoroErr}`);
    return null;
  }
}

/**
 * Sanitize text before sending to TTS.
 * Removes metadata blocks, JSON fragments, and other non-speakable content.
 * Defense-in-depth: even if ClaudeService filters, this guarantees clean input.
 */
/**
 * VOICE-TTS-LEAK-01 — delegates to the shared speech authority.
 *
 * This used to hold the rules inline. It removed metadata and JSON but had no
 * rule for code fences, backticks, headings, emphasis or links, so on
 * 2026-08-27 MAIA read fenced code aloud to a member on the healthy Kokoro
 * path. It also deleted ANY brace- or bracket-delimited span, which silently
 * ate ordinary prose like "[the old house]".
 *
 * Both are fixed in `lib/tts/sanitizeForSpeech.ts`. The name is kept here so
 * the two call sites below read unchanged, and so a future speech path has one
 * obvious thing to import rather than a local helper to copy.
 */
function sanitizeForTts(input: string): string {
  return sanitizeForSpeech(input);
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
  voice: string = 'maia_core',
  speed: number = 1.0,
  element?: string | null,
): Promise<{ audio: string; format: string } | null> {
  const elementKey = (element ?? '').toLowerCase() as Element;

  // ── Resolve sovereign voice IDs before passing to any provider ──
  const VALID_OPENAI = new Set(['nova', 'shimmer', 'echo', 'onyx', 'fable', 'alloy', 'ash', 'sage', 'coral']);
  const rawVoice = voice && voice !== 'maya' ? voice : undefined;
  const isSovereign = rawVoice ? SOVEREIGN_VOICES.some(v => v.id === rawVoice) : false;
  const resolvedKokoro = rawVoice ? (isSovereign ? resolveToKokoro(rawVoice) : rawVoice) : undefined;
  const resolvedOpenai = rawVoice ? (isSovereign ? resolveToOpenAI(rawVoice) : (VALID_OPENAI.has(rawVoice) ? rawVoice : undefined)) : undefined;

  // Try Kokoro via ttsRouter
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
  } catch (err) {
    if (err instanceof TTSFallbackToOpenAI) {
      // SOVEREIGNTY GATE: never attempt OpenAI when disabled or key absent
      const openaiDisabled = process.env.DISABLE_OPENAI_COMPLETELY === 'true'
        || !process.env.OPENAI_API_KEY;
      if (openaiDisabled) {
        console.warn('[synthesizeSentence] Kokoro failed and OpenAI is disabled — returning null (no audio)');
        return null;
      }

      // If the router specified a voice (archetype-driven), use it directly
      if (err.voice) {
        try {
          const response = await synthesizeSpeech({ text, voice: err.voice, format: 'mp3', speed });
          const buffer = Buffer.from(await response.arrayBuffer());
          return { audio: buffer.toString('base64'), format: 'mp3' };
        } catch (e) {
          console.error(`[synthesizeSentence] OpenAI archetype voice failed: ${e instanceof Error ? e.message : e}`);
        }
      }
      // Fall through to final OpenAI fallback
    } else {
      console.warn(`[StreamConversation] ttsRouter error: ${err instanceof Error ? err.message : err}`);
    }
  }

  // OpenAI fallback — archetype-aware (never drift to element-based defaults)
  // Only reached when OpenAI is configured and Kokoro is unavailable
  if (process.env.DISABLE_OPENAI_COMPLETELY === 'true' || !process.env.OPENAI_API_KEY) {
    return null;
  }
  try {
    const elementVoice = elementKey ? resolveOpenAIVoice(elementKey) : null;
    const openaiVoice = resolvedOpenai ?? elementVoice ?? 'nova';

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
  // (D2) MAIA's voice IDENTITY, carried on its own axis. Reaching the router at
  // all is what makes `maia_core → Alloy` expressible; it grants nothing.
  let memberVoiceArchetype: string | null = null;
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
    memberVoiceArchetype = merged.voiceArchetype;
    // If member has a voice_id_override in the database, use it as the
    // authoritative voice — ensures cross-device consistency
    if (merged.voiceId && merged.voiceId !== 'maia') {
      effectiveVoice = merged.voiceId;
    }
  } catch (e) {
    console.warn('[StreamConversation] Voice prefs load failed (continuing without):', e);
  }

  // ── VOICE-SOVEREIGNTY-03: classify the consent gate ONCE per request ──
  //
  // Computed here rather than from a synthesis failure, because the question is
  // about the member's stored preference and their chosen voice — not about
  // whether Kokoro happened to succeed. Local synthesis proceeding normally must
  // not suppress the gesture, and a Kokoro outage must not manufacture one.
  //
  // ⛔ `identityIsCloudBacked` requires an ACTUAL member pick. resolveArchetypeVoice
  //    returns { provider: 'openai', voice: 'alloy' } for a null archetype, so
  //    deriving cloud-backedness without this guard would raise the consent
  //    gesture for every member who has never chosen a voice at all — inferring a
  //    cloud-backed identity from a default. The ruling is explicit that consent
  //    is never inferred from "an existing default voice", and a default is not a
  //    pick: only a pick may INITIATE the request.
  const pickedArchetype = memberVoiceArchetype
    ? MAIA_VOICE_ARCHETYPES.find(a => a.id === memberVoiceArchetype) ?? null
    : null;
  const identityIsCloudBacked = pickedArchetype?.provider === 'openai';
  const cloudVoiceGate = classifyCloudVoiceGate(
    memberTtsProvider,
    !!identityIsCloudBacked,
    pickedArchetype
      ? {
          archetype: pickedArchetype.id,
          label: pickedArchetype.label,
          provider: pickedArchetype.provider,
          voice: pickedArchetype.voice,
        }
      : null,
  );

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

      // ── VOICE-SOVEREIGNTY-03: the consent gesture, offered once per request ──
      //
      // Emitted BEFORE any synthesis, and independent of it. The member chose a
      // cloud-backed voice, the deployment permits cloud synthesis, and they have
      // not yet said whether their words may leave the machine. That is a
      // question, not a failure, and it must not arrive disguised as one.
      //
      // ⛔ NO transcript or conversation content in this event. It carries which
      //    voice was asked for and nothing about what was said — the gesture is
      //    about a data boundary, so it must not itself cross one.
      //
      // ⛔ Emitting this does NOT withhold audio. Local synthesis proceeds with
      //    the already-resolved af_kore mapping; a member who never answers keeps
      //    MAIA's voice. The ask is additive, never a toll.
      //
      // The surface should raise this at most once and let it rest: "Not now"
      // stores 'local', which makes this state unreachable on later turns, so a
      // decline is durable rather than re-litigated.
      if (cloudVoiceGate.state === 'consent_required') {
        emit('cloud_voice_consent_required', {
          voiceArchetype: cloudVoiceGate.identity.archetype,
          voiceLabel: cloudVoiceGate.identity.label,
          provider: cloudVoiceGate.identity.provider,
          voice: cloudVoiceGate.identity.voice,
          storedPreference: cloudVoiceGate.storedPreference,
          timestamp: Date.now(),
        });
      }

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

        // ============ IDENTITY-LAYER CONTEXT (always-on continuity) ============
        // Natal chart + display name are identity-layer continuity — must reach
        // the voice path the same way they reach oracle text. Sanctuary mode
        // still excludes retrieval (hard wall).
        let identityContext: Awaited<ReturnType<typeof buildMaiaContext>> | null = null;
        if (userId && !sanctuary) {
          try {
            identityContext = await buildMaiaContext(userId);
            if (identityContext.hasBirthData || identityContext.userName) {
              console.log(
                `🌟 [StreamConversation] Identity layer loaded for ${userId.substring(0, 8)}... ` +
                  `(natal=${!!identityContext.astrologyAddendum}, name=${!!identityContext.userName})`,
              );
            }
          } catch (identityErr) {
            console.warn('[StreamConversation] Identity context load failed (continuing):', identityErr);
          }
        }

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
            speed: effectiveSpeed,  // Use prosody-adjusted speed
            brevity: effectiveBrevity,
            wisdomDirective,
            voice: effectiveVoice,
            ttsProvider: memberTtsProvider,
            voiceArchetype: memberVoiceArchetype,
            skipPersonaPlex: isIosPwa,
            ssml: thresholdSSML,
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
              // VOICE-SOVEREIGNTY-03. "TTS unavailable" is true of a closed
              // consent gate and of a crashed synthesiser alike, and the member
              // can act on one of those. Naming which is what makes the gesture
              // possible; without it the surface can only apologise.
              gate: cloudVoiceGate.state,
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
        // ⛔ VOICE-STREAM-PROVIDER-CONVERGENCE-01. This used to be
        // `const claudeService = getClaudeService()` — an Anthropic client
        // constructed unconditionally, so the voice response ignored
        // MAIA_TEXT_PROVIDER entirely. With the sovereign local substrate
        // configured and a placeholder key, a successfully transcribed member
        // turn died here on `validation_error: API key is invalid`.
        //
        // Nothing below this line changed. The generator now honours the same
        // provider authority as canonical text generation and yields the same
        // chunk contract, so the memory bundle, identity and natal context, the
        // council, relational governance, the canon and identity guards and the
        // per-sentence TTS all operate exactly as before.
        timer.mark('llm_starting');

        // Build context with wisdom field integration (wisdomDirective already computed above)
        const context = {
          element,
          conversationHistory,
          // Identity-layer display name — resolved from member row when available;
          // undefined falls through to the caller's default handling.
          userName: identityContext?.userName,
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
        // Compose voice system prompt: council lens first (interpretive framing),
        // then identity-layer context (natal chart + transits). Either may be undefined
        // independently; joined only when at least one is present.
        // ── R2: CANONICAL CONTINUITY SUBSTRATE ───────────────────────────
        // Voice gets the SAME contributors as text MAIA, via the shared composer
        // (MemoryBundleService — the same entry point maiaOrchestrator uses). A
        // reduced voice-memory profile would just be a fifth MAIA.
        //
        // Fire-safe by construction: memory failure degrades this turn to the prior
        // (memoryless) behavior rather than breaking voice. But when it degrades we
        // record hasLoadedContext=false, so the amnesia guard below stays HONEST —
        // MAIA may truthfully say she cannot recall when nothing was in fact loaded.
        let voiceMemoryContext = '';
        let voiceMemoryLoaded = false;
        // M1.5 OBSERVABILITY (D2/D3) — evidence only. Nothing below reads these
        // to decide anything; they exist so a turn can be reconstructed after
        // the fact instead of inferred from a single boolean.
        let memoryAttempted = false;
        let memoryNotAttemptedReason: string | null = userId ? null : 'no_member';
        let memoryStats: MemoryBundle['retrievalStats'] | null = null;
        let memorySelection: MemoryBundle['selectionTrace'] = [];
        // Rolling detection window for the streaming canon guard — carries just
        // enough already-emitted text to catch a violation split across chunks.
        let voiceGuardTail = '';
        // SANCTUARY IS A RETRIEVAL BOUNDARY, NOT ONLY A RETENTION ONE (F10).
        // Until 2026-08-28 this guard read `if (userId)`, so a Sanctuary voice turn
        // built the cross-session bundle and injected it into voiceSystemPrompt below.
        // Nothing was written back — recordRetrievedCandidates is gated on a traceId
        // this call does not pass — so Invariant 1 (no retention) held while
        // Invariant 6 (absolute boundary) did not. Non-retention is not the boundary.
        // MaiaWisdomProvider.buildVoiceContext already implements this hard wall; the
        // R2 substrate duplicated that branch without carrying its predicate across.
        if (sanctuary) {
          // F10 exclusion, stated rather than left to look like an empty result.
          // "Sanctuary: retrieval deliberately not attempted" and "retrieval ran
          // and found nothing" are different facts, and only one of them is a
          // boundary working correctly.
          memoryNotAttemptedReason = 'sanctuary';
        }
        if (userId && !sanctuary) {
          memoryAttempted = true;
          try {
            const bundle = await MemoryBundleService.build({
              userId,
              currentInput: message,
              sessionId: effectiveSessionId,
              scope: 'cross_session',
              maxBullets: 5,
            });
            if (bundle) {
              voiceMemoryContext = MemoryBundleService.formatForPrompt(bundle) || '';
              voiceMemoryLoaded = voiceMemoryContext.length > 0;
              memoryStats = bundle.retrievalStats;
              memorySelection = bundle.selectionTrace;
              console.log(
                `📦 [Voice/MemoryBundle] bullets=${bundle.memoryBullets?.length ?? 0} ` +
                `encounters=${bundle.relationshipSnapshot?.encounterCount ?? 0} ` +
                `loaded=${voiceMemoryLoaded}`
              );
            }
          } catch (memErr: any) {
            // R4 TRIPWIRE: if this ever reports a uuid cast failure on a `voice-`
            // prefixed session id, the UUID defect has become load-bearing for
            // restoration and must stop being separately bounded.
            console.warn('⚠️ [Voice/MemoryBundle] continuity load failed (non-blocking):', memErr?.message || memErr);
          }
        }

        // TIME-TO-FIRST-WORD ATTRIBUTION (observational only; no behavior change).
        // `llm_starting` is marked well before the model is actually called: the
        // cross-session MemoryBundle build is awaited in between. Without this mark
        // the whole `llm_starting -> llm_first_chunk` gap (4,070ms in the 19a2f166
        // trace) is unattributed between memory composition and model prefill, and
        // any tuning would be guesswork about which half to touch.
        timer.mark('memory_bundle_done');

        // Same contributors, same filter, same join as before — split into a named
        // array ONLY so inclusion can be witnessed at the insertion site.
        const voicePromptParts = [
          councilPromptSection,
          identityContext?.astrologyAddendum,
          voiceMemoryContext,
          // Same memory posture text/list ships. Included even when nothing loaded:
          // the canon governs how MAIA speaks about memory, not only when she has it.
          MEMORY_CANON_GUARD_PROMPT,
        ].filter((s): s is string => !!s && s.length > 0);
        const voiceSystemPrompt = voicePromptParts.join('\n\n') || undefined;

        // M1.5 (D4) — PROMPT-INCLUSION WITNESS.
        // Deliberately NOT `voiceSystemPrompt.includes(voiceMemoryContext)`:
        // `String.includes('')` is unconditionally true, so an empty memory
        // context — no memory, or Sanctuary — would report as INCLUDED, and the
        // F10 boundary would be the first thing the witness lied about. And when
        // the context is non-empty a substring search is tautological anyway,
        // since it is one of the joined elements. Membership in the composed
        // array is the certain form of the same question.
        const memoryPromptIncluded =
          voiceMemoryContext.length > 0 &&
          voicePromptParts.includes(voiceMemoryContext) &&
          voiceSystemPrompt !== undefined;
        if (councilResolution.guide.id !== 'auto' || councilResolution.source === 'auto_integrator') {
          console.log(`🏛️ [Voice Council] ${councilResolution.guide.archetypeName} | ${councilResolution.source}`);
        }
        // ─────────────────────────────────────────────────────────────────

        // Prompt weight, in characters only — never content. A prefill-dominated
        // profile (long time-to-first-word, short total generation) points at prompt
        // size; this is the number that would confirm or refute that reading.
        const historyChars = (conversationHistory || []).reduce(
          (n: number, m: any) => n + (m?.content?.length || 0),
          0,
        );
        console.log(
          `[voice:prompt_weight:${turnId}] ` +
          `system=${voiceSystemPrompt?.length ?? 0} ` +
          `council=${councilPromptSection?.length ?? 0} ` +
          `astrology=${identityContext?.astrologyAddendum?.length ?? 0} ` +
          `memory=${voiceMemoryContext.length} ` +
          `history=${historyChars} ` +
          `historyMsgs=${conversationHistory?.length ?? 0} ` +
          `input=${message?.length ?? 0}`
        );
        // ── M1.5 MEMORY TRACE (D1/D2/D3/D4) ──────────────────────────────
        // One line, keyed by the turnId this route already carries, so retrieval,
        // selection, prompt inclusion and downstream attribution join without
        // inference. Four states that `voiceMemoryLoaded` alone collapses into
        // one: a turn that retrieved five candidates, selected none and included
        // nothing must be distinguishable from a turn that never retrieved.
        // Identifiers, provenance, scores and state only — never memory bodies.
        const memorySelected = memorySelection.filter((c) => c.selected);
        console.log(
          `[voice:memory_trace:${turnId}] ` +
          `attempted=${memoryAttempted} ` +
          `notAttemptedReason=${memoryNotAttemptedReason ?? 'n/a'} ` +
          `retrieved=${memoryStats?.totalCandidates ?? 0} ` +
          `turns=${memoryStats?.turnsRetrieved ?? 0} ` +
          `crossSession=${memoryStats?.turnsCrossSession ?? 0} ` +
          `semantic=${memoryStats?.semanticHits ?? 0} ` +
          `breakthroughs=${memoryStats?.breakthroughsFound ?? 0} ` +
          `selected=${memorySelected.length} ` +
          `formatted=${voiceMemoryContext.length > 0} ` +
          `promptIncluded=${memoryPromptIncluded} ` +
          `palace=not_run`
        );
        if (memorySelection.length > 0) {
          console.log(
            `[voice:memory_selection:${turnId}] ` +
            JSON.stringify(
              memorySelection.map((c) => ({
                id: c.id, src: c.source, score: c.score, rank: c.rank, sel: c.selected,
              })),
            )
          );
        }

        // ── M1.5 ATTRIBUTION (D5) ────────────────────────────────────────────
        // conversation_memory_uses means memory USED, so rows are written only
        // for what was selected AND actually reached the prompt. The text path
        // records retrieved candidates here instead, which conflates retrieval
        // evidence with prompt use; that is a RECORDED DEFECT this cut neither
        // repairs on text nor reproduces on voice. Retrieval-side evidence lives
        // in the trace line above, joined by the same turnId — so a turn that
        // retrieved and included nothing still leaves a witness, it just does not
        // leave a false claim of use.
        //
        // Not awaited: attribution must not enter the response path.
        if (memoryPromptIncluded && memorySelected.length > 0 && userId && !sanctuary) {
          ConversationMemoryUsesStore.recordRetrievedCandidates({
            sessionId: effectiveSessionId,
            messageId: turnId,
            userId,
            candidates: memorySelected.map((c) => ({
              id: c.id,
              source: c.source,
              retrievalScore: c.score,
            })),
          }).catch((auditErr) =>
            console.warn('⚠️ [voice:memory_attribution] non-blocking failure:', auditErr?.message || auditErr),
          );
        }

        timer.mark('llm_request_sent');

        // ⛔ VOICE-STREAM-PROVIDER-PROVENANCE-01. What actually generated this
        // turn, reported by the code that chose and invoked the provider — not
        // re-derived here. The training record below used to assert
        // `claude-3-sonnet` unconditionally, which after provider convergence
        // would have recorded a sovereign local turn as a Claude one.
        let turnProvenance: TurnProvenance | null = null;

        // Stream sentences from the CONFIGURED provider.
        for await (const chunk of streamOracleResponse(
          message,
          context,
          voiceSystemPrompt,
          { onProvenance: (p) => { turnProvenance = p; } }
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

            // ── R2: MEMORY CANON GUARD, APPLIED TO THE STREAM ─────────────
            // Text MAIA scrubs a completed response. Voice cannot: by the time a
            // response is "complete" the member has already read and HEARD it. So
            // the guard runs per sentence, before anything leaves the server.
            //
            // hasLoadedContext reflects what this turn actually loaded — so when
            // continuity genuinely failed, MAIA is still permitted to say so.
            // Probes the chunk AND the boundary it forms with already-emitted text,
            // so a violation split across two chunks cannot reach the member.
            const canonVerdict = guardVoiceChunk(identityCheck.sanitized, {
              recentTail: voiceGuardTail,
              hasLoadedContext: voiceMemoryLoaded,
            });
            if (canonVerdict.scrubbed) {
              console.warn('[Voice] §V amnesia posture intercepted mid-stream:', {
                index: chunk.index,
                reason: canonVerdict.reason,
                originalText: identityCheck.sanitized.substring(0, 80),
                hasLoadedContext: voiceMemoryLoaded,
              });
            }
            // Single safe text for EVERY downstream consumer — screen, transcript,
            // and audio. Nothing bypasses this value.
            const safeText = canonVerdict.safeText;
            voiceGuardTail = advanceVoiceGuardTail(voiceGuardTail, safeText);

            // Emit text immediately so UI can show it
            emit('text', {
              index: chunk.index,
              text: safeText,
              timestamp: Date.now(),
              identity_checked: !identityCheck.safe,
              memory_canon_checked: canonVerdict.scrubbed,
              memory_canon_reason: canonVerdict.reason,
            });

            if (chunk.index === 0) {
              timer.mark('text_0_emitted');
            }

            // Accumulate the safe (identity + canon checked) text, not raw
            fullResponse += safeText + ' ';
            sentenceCount = chunk.index + 1;

            // TTS per-sentence render with fallback (PersonaPlex → OpenAI → Kokoro)
            // ⚠️ Was `chunk.text` (RAW): audio spoke text the screen had been
            // protected from, so both guards leaked audibly. Member-visible
            // protection includes what MAIA says out loud.
            const chunkIndex = chunk.index;
            const chunkText = safeText;

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

              const result = await synthesizeWithFallback(safeChunkText, {
                mode: wisdomPayload?.mode ?? mode,
                element: wisdomPayload?.element ?? element ?? null,
                sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
                speed: effectiveSpeed,
                brevity: effectiveBrevity,
                wisdomDirective,
                voice: effectiveVoice,
                ttsProvider: memberTtsProvider,
                voiceArchetype: memberVoiceArchetype,
                skipPersonaPlex: isIosPwa,
                ssml: chunkSSML,
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
                  gate: cloudVoiceGate.state,
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

            // 💡 IDEA FIELD: Detect generative moments in voice conversation
            const ideaCandidate = !sanctuary ? detectIdeaCandidate(message, fullResponse.trim()) : null;
            if (ideaCandidate) {
              console.info('[idea-field]', {
                title: ideaCandidate.title,
                confidence: ideaCandidate.confidence,
                fingerprint: ideaCandidate.fingerprint,
              });
            }

            // 🌀 BEHAVIORAL LOOP: Relational detection for suggested actions
            const relationalSignals = [
              'partner', 'relationship', 'friend', 'mother', 'father', 'parent',
              'husband', 'wife', 'spouse', 'daughter', 'son', 'sibling', 'brother', 'sister',
              'conflict', 'boundary', 'boundaries', 'arguing', 'fight', 'divorce',
              'betrayal', 'trust', 'attachment', 'intimacy', 'codependent',
            ];
            const lowerMsg = message.toLowerCase();
            const relHits = relationalSignals.filter(s => lowerMsg.includes(s));
            const voiceSuggestedActions = relHits.length >= 1
              ? [{ id: 'open_relationship', label: 'Map this relationship', priority: Math.min(0.5 + relHits.length * 0.12, 0.92), kind: 'relational', route: '/relationships' }]
              : [];

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
              // 💡 Idea candidate for client-side toast (null if none detected)
              ideaCandidate: ideaCandidate ?? undefined,
              // 🌀 BEHAVIORAL LOOP: Suggested actions for inline rendering
              suggestedActions: voiceSuggestedActions.length > 0 ? voiceSuggestedActions : undefined,
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
                  // ⛔ The provider that actually ran, and the model IT named.
                  // A record that says Claude when Ollama answered is worse
                  // than no record: it is a sovereignty claim in reverse.
                  primaryEngine: (turnProvenance as TurnProvenance | null)?.model
                    ?? (turnProvenance as TurnProvenance | null)?.provider
                    ?? 'unknown',
                  latencyMs,
                  element: wisdomPayload?.element || element,
                  usedClaudeConsult: (turnProvenance as TurnProvenance | null)?.usedClaudeConsult ?? false,
                  // R1: this route was invisible to route attribution — turn 173903
                  // landed with origin_route NULL and only the runtime log named it.
                  originRoute: '/api/voice/stream-conversation',
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

            // TRUST OBSERVATION: Phase 3 behavioral signal capture (fire-and-forget)
            if (isTrustObservationEnabled() && userId && !sanctuary) {
              storeTrustObservation({
                memberId: userId,
                sessionId: effectiveSessionId,
                responseType: classifyResponseType({ careLensActive: false }),
                engagementProxy: inferEngagementProxy({
                  replyLength: message.length,
                  conversationDepth: conversationHistory?.length ?? 0,
                }),
                context: {
                  element: wisdomPayload?.element || element,
                  mode: voiceSession.relationalStack.currentMode,
                  route: 'voice/stream-conversation',
                },
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
