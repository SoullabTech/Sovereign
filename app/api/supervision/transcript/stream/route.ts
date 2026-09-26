import { NextRequest, NextResponse } from 'next/server';
import { getTranscriptSegments, addTranscriptSegment, getLastChunkTail, getRecentTranscriptTexts, getSession } from '@/lib/supervision/SupervisionStore';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { isLikelyPhantomDuplicate } from '@/lib/scribe/transcriptCleaner';
import { evaluate as evaluateSegmentGate } from '@/lib/supervision/segmentGate';
import {
  computeAverageNoSpeechProb,
  isSilenceHallucination,
  NO_SPEECH_PROB_THRESHOLD,
} from '@/lib/supervision/silenceHallucinationGuard';
import {
  consumeSkipPromptFlag,
  markContinuityBreak,
} from '@/lib/supervision/promptContinuityState';
import {
  CHANNEL_PROVENANCE_CONFIDENCE,
  isCaptureChannel,
  laneKey,
  speakerLabelForChannel,
} from '@/lib/studio/audioChannels';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = false;

// Whisper endpoint (local container)
const WHISPER_URL = process.env.WHISPER_URL || 'http://maia-whisper:8000';
const MAX_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB max per audio chunk
const SILENCE_GATE_BYTES = 1500; // below this = almost certainly silence

interface WhisperResponse {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    confidence?: number;
    /** Whisper's own per-segment probability that the audio is non-speech. */
    no_speech_prob?: number;
  }>;
  language?: string;
}

/**
 * Phase A.2 observability (2026-05-16). One grep-friendly JSON line per
 * chunk decision so missing utterances and over-aggressive rejections
 * become diagnosable. Use:
 *   grep '\[GateTelemetry\]' production.log | jq '.'
 */
type ChunkDecisionKind =
  | 'silence-gate-bytes'        // audio too small to send to Whisper
  | 'whisper-error'             // Whisper API returned non-OK
  | 'whisper-connection-error'  // Whisper unreachable
  | 'whisper-no-text'           // Whisper returned no transcript text
  | 'silence-hallucination'     // no_speech_prob > threshold → reject
  | 'gate-discarded'            // segmentGate said discard (filler/internal-rep)
  | 'gate-buffered'             // segmentGate said keep as candidate, not yet finalize
  | 'gate-finalized'            // segmentGate said finalize → persisted as segment
  | 'persistence-dedup';        // gate finalized but dedup guard rejected

interface ChunkDecisionLog {
  sessionId: string;
  chunkIndex: number;
  audioBytes: number;
  noSpeechProb: number | null;
  whisperText: string;
  whisperConfidence: number;
  whisperPromptUsed: boolean;
  decision: ChunkDecisionKind;
  reason: string;
  finalizedTextPreview?: string;
  startMs?: number;
  endMs?: number;
}

function logChunkDecision(ctx: ChunkDecisionLog): void {
  const payload = {
    ts: new Date().toISOString(),
    ...ctx,
    whisperText: ctx.whisperText?.slice(0, 120) ?? '',
    finalizedTextPreview: ctx.finalizedTextPreview?.slice(0, 120),
  };
  console.log(`[GateTelemetry] ${JSON.stringify(payload)}`);
}

/**
 * POST - Receive audio chunk, transcribe via Whisper, store in database
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: require authenticated member
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Feature gate: audio uploads disabled by default (local-only policy)
    if (process.env.ALLOW_AUDIO_UPLOADS !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Audio uploads are disabled. Audio is stored locally on-device by default.' },
        { status: 410 }
      );
    }

    // Guard: reject non-multipart requests with a clear 415 error
    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data (FormData upload). Do not set Content-Type manually.' },
        { status: 415 }
      );
    }

    const formData = await request.formData();

    const sessionId = formData.get('sessionId') as string;
    const audioFile = formData.get('audio') as File | null;
    const startMs = parseInt(formData.get('startMs') as string || '0', 10);
    const endMs = parseInt(formData.get('endMs') as string || '0', 10);
    const chunkIndex = parseInt(formData.get('chunkIndex') as string ?? '-1', 10);

    // Speaker attribution is derived from the capture channel, never from the
    // client's assertion and never from inference over the audio. An absent or
    // unrecognised channel means the uploader could not separate sources, so
    // the utterance is persisted as Unattributed rather than assigned to
    // someone. See lib/studio/audioChannels.ts.
    const rawChannel = formData.get('channel');
    const channel = isCaptureChannel(rawChannel) ? rawChannel : null;
    const speaker = speakerLabelForChannel(channel);

    // In-memory per-session state (gate candidate buffer, prompt-continuity
    // flags) must be scoped to the lane. Two channels sharing one buffer would
    // splice one speaker's partial sentence onto the other's.
    const lane = laneKey(sessionId, channel);

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId is required'
      }, { status: 400 });
    }

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({
        success: false,
        error: 'audio file is required'
      }, { status: 400 });
    }

    // Size cap: reject chunks over 10MB
    if (audioFile.size > MAX_CHUNK_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Audio chunk too large. Maximum size is ${MAX_CHUNK_SIZE / (1024 * 1024)}MB.`
      }, { status: 413 });
    }

    // Verify session exists and is active
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    if (session.ended_at) {
      return NextResponse.json({
        success: false,
        error: 'Session has already ended'
      }, { status: 400 });
    }

    // Silence gate: skip Whisper for near-empty chunks (avoids hallucination on silence/noise)
    const audioSizeBytes = audioFile.size;
    if (audioSizeBytes < SILENCE_GATE_BYTES) {
      logChunkDecision({
        sessionId,
        chunkIndex,
        audioBytes: audioSizeBytes,
        noSpeechProb: null,
        whisperText: '',
        whisperConfidence: 0,
        whisperPromptUsed: false,
        decision: 'silence-gate-bytes',
        reason: `bytes<${SILENCE_GATE_BYTES}`,
        startMs,
        endMs,
      });
      return NextResponse.json({ success: true, skipped: true, reason: 'silence', chunkIndex });
    }

    // Fire parallel DB query for previous chunk tail (Whisper context anchoring).
    // Phase A.2 continuity-state reset (2026-05-16, Kelly): if the previous
    // chunk was rejected as silence-hallucination, the prior persisted tail
    // represents a now-stale conversational continuity. Skip the prompt for
    // exactly one chunk so silence resets context — the next real utterance
    // arrives unconditioned by what the user said before the gap.
    // Narrow scope: silence-hallucination only. whisper-no-text is NOT
    // included pending telemetry evidence of fragmentation after no-text.
    // Lane-scoped: a silence break on the practitioner's mic says nothing
    // about continuity on the participants' channel, and the tail that anchors
    // Whisper must come from this speaker's own prior words.
    const skipPromptThisChunk = consumeSkipPromptFlag(lane);
    const previousTailPromise: Promise<string | null> = skipPromptThisChunk
      ? Promise.resolve(null)
      : getLastChunkTail(sessionId, channel ? speaker : undefined);

    // Prepare audio for Whisper
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

    // Resolve previous tail for context prompt
    const previousTail = await previousTailPromise;

    console.log(`[SupervisionTranscript] chunk=${chunkIndex} size=${audioSizeBytes}B whisperPrompt=${!!previousTail}`);

    // Send to local Whisper for transcription
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioBlob, 'audio.webm');
    whisperFormData.append('response_format', 'verbose_json');
    whisperFormData.append('language', 'en');
    if (previousTail) {
      whisperFormData.append('prompt', previousTail);
    }

    let transcriptText = '';
    let confidence = 0.9;
    let language = 'en';
    let averageNoSpeechProb: number | null = null;

    try {
      const whisperResponse = await fetch(`${WHISPER_URL}/v1/audio/transcriptions`, {
        method: 'POST',
        body: whisperFormData,
      });

      if (whisperResponse.ok) {
        const whisperResult: WhisperResponse = await whisperResponse.json();
        transcriptText = whisperResult.text?.trim() || '';
        language = whisperResult.language || 'en';

        if (whisperResult.segments?.length) {
          const totalConfidence = whisperResult.segments.reduce(
            (sum, seg) => sum + (seg.confidence || 0.9),
            0
          );
          confidence = totalConfidence / whisperResult.segments.length;
          // Phase A.2 audio-side tuning: capture Whisper's own no-speech probability
          // so we can reject silence-hallucinated coherent text before the text gate.
          averageNoSpeechProb = computeAverageNoSpeechProb(whisperResult.segments);
        }
      } else {
        const errBody = await whisperResponse.text();
        console.error('[TranscriptStream] Whisper error:', errBody);
        logChunkDecision({
          sessionId,
          chunkIndex,
          audioBytes: audioSizeBytes,
          noSpeechProb: null,
          whisperText: '',
          whisperConfidence: 0,
          whisperPromptUsed: !!previousTail,
          decision: 'whisper-error',
          reason: `whisper http ${whisperResponse.status}`,
          startMs,
          endMs,
        });
      }
    } catch (whisperError) {
      console.error('[TranscriptStream] Whisper connection error:', whisperError);
      logChunkDecision({
        sessionId,
        chunkIndex,
        audioBytes: audioSizeBytes,
        noSpeechProb: null,
        whisperText: '',
        whisperConfidence: 0,
        whisperPromptUsed: !!previousTail,
        decision: 'whisper-connection-error',
        reason: whisperError instanceof Error ? whisperError.message : 'unknown',
        startMs,
        endMs,
      });
      // Fall back to browser transcription if provided
      transcriptText = formData.get('fallbackText') as string || '';
    }

    // Phase A.2 audio-side tuning — silence-hallucination guard.
    // Whisper fabricates coherent dialogue from silence/low-signal audio (e.g.
    // "We'll see you in the next one.", "What are you guys doing?"). These pass
    // every text-side heuristic because they look like real speech. Use Whisper's
    // own no_speech_prob field to reject the source before the candidate gate
    // ever sees it. Field absence is treated as no signal (defer to text gate).
    if (transcriptText && isSilenceHallucination(averageNoSpeechProb)) {
      logChunkDecision({
        sessionId,
        chunkIndex,
        audioBytes: audioSizeBytes,
        noSpeechProb: averageNoSpeechProb,
        whisperText: transcriptText,
        whisperConfidence: confidence,
        whisperPromptUsed: !!previousTail,
        decision: 'silence-hallucination',
        reason: `no_speech_prob=${averageNoSpeechProb?.toFixed(2)}>${NO_SPEECH_PROB_THRESHOLD}`,
        startMs,
        endMs,
      });
      // Phase A.2 continuity-state reset (2026-05-16): silence resets
      // conversational continuity. Arm the one-shot skip-prompt flag so the
      // NEXT real chunk reaches Whisper without a now-stale previousTail.
      markContinuityBreak(lane);
      return NextResponse.json({
        success: true,
        chunkIndex,
        silenceSkipped: false,
        noSpeechHallucinationRejected: true,
        noSpeechProb: averageNoSpeechProb,
        whisperPromptUsed: !!previousTail,
        segment: null,
        message: `Rejected as silence hallucination (no_speech_prob=${averageNoSpeechProb?.toFixed(2)})`,
      });
    }

    // Only store if we have text
    if (transcriptText) {
      // Phase A.2 — Segment Integrity gate. Holds Whisper candidates until a
      // plausible utterance boundary is detected (silence, sentence terminator,
      // or repetition signal). Chunk cadence is not utterance cadence.
      const decision = evaluateSegmentGate({
        sessionId: lane,
        newText: transcriptText,
        chunkIndex,
        startMs,
        endMs,
        speaker,
      });

      if (decision.shouldDiscard) {
        logChunkDecision({
          sessionId,
          chunkIndex,
          audioBytes: audioSizeBytes,
          noSpeechProb: averageNoSpeechProb,
          whisperText: transcriptText,
          whisperConfidence: confidence,
          whisperPromptUsed: !!previousTail,
          decision: 'gate-discarded',
          reason: decision.reason,
          startMs,
          endMs,
        });
        return NextResponse.json({
          success: true,
          chunkIndex,
          silenceSkipped: false,
          gateDiscarded: true,
          gateReason: decision.reason,
          whisperPromptUsed: !!previousTail,
          segment: null,
          message: `Gate discarded: ${decision.reason}`,
        });
      }

      if (!decision.shouldFinalize) {
        logChunkDecision({
          sessionId,
          chunkIndex,
          audioBytes: audioSizeBytes,
          noSpeechProb: averageNoSpeechProb,
          whisperText: transcriptText,
          whisperConfidence: confidence,
          whisperPromptUsed: !!previousTail,
          decision: 'gate-buffered',
          reason: decision.reason,
          startMs,
          endMs,
        });
        return NextResponse.json({
          success: true,
          chunkIndex,
          silenceSkipped: false,
          gateBuffered: true,
          gateReason: decision.reason,
          whisperPromptUsed: !!previousTail,
          segment: null,
          message: `Gate buffered: ${decision.reason}`,
        });
      }

      // Gate approved finalization. Use the finalized text (may be merged) and
      // its preserved chunk-start timing.
      const finalText = decision.finalText ?? transcriptText;
      const finalChunkIndex = decision.finalChunkIndex ?? chunkIndex;
      const finalStartMs = decision.finalStartMs ?? startMs;
      const finalEndMs = decision.finalEndMs ?? endMs;
      const finalSpeaker = decision.speaker ?? speaker;

      // Phase A.1 — pre-persistence dedup guard against already-persisted
      // recent segments. Belt protection if the gate buffer drifts.
      // Lane-scoped: two people saying "yeah" seconds apart is conversation,
      // not duplication. Comparing across lanes would delete a real turn.
      const recentTexts = await getRecentTranscriptTexts(
        sessionId,
        5,
        channel ? speaker : undefined,
      );
      if (isLikelyPhantomDuplicate(finalText, recentTexts)) {
        logChunkDecision({
          sessionId,
          chunkIndex,
          audioBytes: audioSizeBytes,
          noSpeechProb: averageNoSpeechProb,
          whisperText: transcriptText,
          whisperConfidence: confidence,
          whisperPromptUsed: !!previousTail,
          decision: 'persistence-dedup',
          reason: `gate-finalized-but-dedup-blocked (gate.reason=${decision.reason})`,
          finalizedTextPreview: finalText,
          startMs: finalStartMs,
          endMs: finalEndMs,
        });
        return NextResponse.json({
          success: true,
          chunkIndex,
          silenceSkipped: false,
          duplicateRejected: true,
          gateReason: decision.reason,
          whisperPromptUsed: !!previousTail,
          segment: null,
          message: 'Gate finalized but rejected as phantom duplicate at persistence',
        });
      }

      const segment = await addTranscriptSegment({
        sessionId,
        speaker: finalSpeaker,
        // NOTE ON WHAT THIS 1 MEANS — the column is named speakerConfidence,
        // but under channel-derived attribution it carries PROVENANCE
        // confidence, not IDENTITY confidence:
        //
        //   1 = "this audio certainly arrived on that capture channel"
        //   1 ≠ "we are certain which person spoke"
        //
        // For 'Participants' the system still cannot tell one remote speaker
        // from another; the certainty is about the wire, never about a human.
        // Reading this as identity confidence would reintroduce exactly the
        // false precision this lane exists to remove. The honest schema is
        // attributionSource='capture_channel' + attributionConfidence, which
        // needs a migration this branch deliberately avoids (see the
        // chunk-index striping note in lib/studio/audioChannels.ts).
        //
        // Absent a channel the segment is Unattributed — there is no
        // attribution to be confident about, so the column stays null. The
        // former hardcoded 0.8 reported confidence in a label nothing had
        // actually determined.
        speakerConfidence: channel ? CHANNEL_PROVENANCE_CONFIDENCE : undefined,
        startMs: finalStartMs,
        endMs: finalEndMs,
        text: finalText,
        transcriptionConfidence: confidence,
        chunkIndex: finalChunkIndex,
      });

      logChunkDecision({
        sessionId,
        chunkIndex,
        audioBytes: audioSizeBytes,
        noSpeechProb: averageNoSpeechProb,
        whisperText: transcriptText,
        whisperConfidence: confidence,
        whisperPromptUsed: !!previousTail,
        decision: 'gate-finalized',
        reason: decision.reason,
        finalizedTextPreview: finalText,
        startMs: finalStartMs,
        endMs: finalEndMs,
      });

      return NextResponse.json({
        success: true,
        chunkIndex,
        silenceSkipped: false,
        gateFinalized: true,
        gateReason: decision.reason,
        whisperPromptUsed: !!previousTail,
        segment: {
          id: segment.id,
          text: finalText,
          startMs: finalStartMs,
          endMs: finalEndMs,
          speaker: finalSpeaker,
          confidence,
          language,
        },
      });
    }

    // Phase A.2 QA (2026-05-17): whisper-no-text is also an absence-of-new-
    // participation signal — mark the session for prompt-continuity reset on
    // the next chunk. Telemetry from sentence 5→6 transition showed that
    // without this, previousTail vocabulary biases the next real chunk
    // (e.g. spoken "question" gets transcribed as "sentence").
    markContinuityBreak(lane);

    logChunkDecision({
      sessionId,
      chunkIndex,
      audioBytes: audioSizeBytes,
      noSpeechProb: averageNoSpeechProb,
      whisperText: '',
      whisperConfidence: confidence,
      whisperPromptUsed: !!previousTail,
      decision: 'whisper-no-text',
      reason: 'whisper returned empty text',
      startMs,
      endMs,
    });
    return NextResponse.json({
      success: true,
      chunkIndex,
      silenceSkipped: false,
      whisperPromptUsed: !!previousTail,
      segment: null,
      message: 'No speech detected in this chunk'
    });

  } catch (error) {
    console.error('🔴 [TranscriptStream] Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to process transcript chunk'
    }, { status: 500 });
  }
}

/**
 * GET - SSE stream for receiving transcript updates
 */

// Backoff intervals (ms): start at 1s, back off when idle
const INTERVALS = [1000, 2000, 3000, 5000];

export async function GET(req: NextRequest) {
  // Static export: return empty response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return new Response('SSE not available in static export', { status: 200 });
  }

  // Auth: require authenticated member
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  // Support Last-Event-ID for automatic reconnect resume
  const lastEventId = req.headers.get('last-event-id');
  let afterMs = Number(url.searchParams.get('afterMs') ?? -1);
  if (lastEventId && !Number.isNaN(Number(lastEventId))) {
    afterMs = Math.max(afterMs, Number(lastEventId));
  }
  if (!Number.isFinite(afterMs)) afterMs = -1;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let idleCycles = 0;
      let currentInterval = INTERVALS[0];
      let timer: ReturnType<typeof setTimeout> | null = null;

      const emit = (lines: string[]) => {
        controller.enqueue(encoder.encode(lines.join('\n') + '\n\n'));
      };

      // Send retry hint so browser reconnects after 2s on drop
      emit(['retry: 2000']);
      emit(['event: ready', `data: ${JSON.stringify({ sessionId, afterMs })}`]);

      const tick = async () => {
        try {
          const segs = await getTranscriptSegments(sessionId, { afterMs });

          if (segs.length) {
            // Transform snake_case to camelCase for frontend
            const transformed = segs.map(s => ({
              id: s.id,
              speaker: s.speaker,
              speakerConfidence: s.speaker_confidence,
              startMs: s.start_ms,
              endMs: s.end_ms,
              text: s.text,
              confidence: s.transcription_confidence,
              createdAt: s.created_at,
            }));

            afterMs = Math.max(afterMs, ...segs.map(s => s.start_ms ?? 0));

            // Include id: for Last-Event-ID resume
            emit([
              `id: ${afterMs}`,
              'event: segments',
              `data: ${JSON.stringify({ segments: transformed, afterMs })}`
            ]);

            // Reset backoff on activity
            idleCycles = 0;
            currentInterval = INTERVALS[0];
          } else {
            // SSE comment keepalive (proxy-friendly)
            emit([`: keepalive ${Date.now()}`]);

            // Backoff when idle
            idleCycles++;
            const idx = Math.min(idleCycles, INTERVALS.length - 1);
            currentInterval = INTERVALS[idx];
          }
        } catch (err) {
          emit([
            'event: error',
            `data: ${JSON.stringify({ message: err instanceof Error ? err.message : String(err) })}`
          ]);
        }

        // Schedule next tick with current interval
        timer = setTimeout(tick, currentInterval);
      };

      // Start polling
      timer = setTimeout(tick, currentInterval);

      req.signal.addEventListener('abort', () => {
        if (timer) clearTimeout(timer);
        try { controller.close(); } catch { /* ignore */ }
      });
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
