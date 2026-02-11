'use client';

/**
 * Studio Scribe — Record, review, and export session notes
 *
 * Three-phase practitioner workflow:
 *   idle → recording → review
 *
 * Uses existing infrastructure:
 *   - useAudioCapture hook (chunked 5s intervals)
 *   - POST /api/supervision/session/start & stop
 *   - POST /api/supervision/transcript/stream (audio chunks)
 *   - SSE  /api/supervision/scribe?sessionId=xxx (real-time updates)
 *   - SessionReviewChat → POST /api/scribe/review-session
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Square,
  Radio,
  BookOpen,
  Sparkles,
  Clock,
  Pause,
  Play,
  Volume2,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { apiUrl, apiFetch } from '@/lib/http/apiBase';
import { useAudioCapture, type TranscriptResult } from '@/hooks/useAudioCapture';
import { SessionReviewChat } from '@/components/studio/SessionReviewChat';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TranscriptSegment {
  id: string;
  speaker: string;
  startMs: number;
  endMs: number;
  text: string;
  confidence?: number;
}

interface LiveInsight {
  id: string;
  insightType: string;
  content: string;
  significance?: number;
  timeRangeStartMs?: number;
  createdAt: string;
}

type ScribePhase = 'idle' | 'recording' | 'review';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getInsightColor = (type: string) => {
  const colors: Record<string, string> = {
    rupture: 'bg-red-500/20 text-red-300 border-red-500/40',
    countertransference: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    pattern: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    attunement: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    intervention: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    stuck_point: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/40';
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StudioScribePage() {
  // Phase
  const [phase, setPhase] = useState<ScribePhase>('idle');

  // Session
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');

  // Recording
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [insights, setInsights] = useState<LiveInsight[]>([]);

  // Review
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  // Keep refs in sync for SSE reconnect closure
  useEffect(() => {
    isRecordingRef.current = phase === 'recording';
  }, [phase]);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Audio capture
  const audioCapture = useAudioCapture({
    mode: 'chunked',
    chunkIntervalMs: 5000,
    onTranscript: useCallback((result: TranscriptResult) => {
      const tempSegment: TranscriptSegment = {
        id: `local-${Date.now()}`,
        speaker: 'Speaker',
        startMs: result.startMs,
        endMs: result.endMs,
        text: result.text,
        confidence: result.confidence,
      };
      setSegments(prev => [...prev, tempSegment]);
    }, []),
    onChunk: useCallback(async (chunk) => {
      if (!sessionIdRef.current) return;

      const formData = new FormData();
      formData.append('sessionId', sessionIdRef.current);
      formData.append('audio', chunk.blob, `chunk_${chunk.index}.webm`);
      formData.append('startMs', String(chunk.startMs));
      formData.append('endMs', String(chunk.endMs));
      formData.append('speaker', 'Speaker 1');

      try {
        const response = await fetch(apiUrl('/api/supervision/transcript/stream'), {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.segment) {
            setSegments(prev => {
              const filtered = prev.filter(s => !s.id.startsWith('local-'));
              return [...filtered, {
                id: data.segment.id,
                speaker: data.segment.speaker,
                startMs: data.segment.startMs,
                endMs: data.segment.endMs,
                text: data.segment.text,
                confidence: data.segment.confidence,
              }];
            });
          }
        }
      } catch (err) {
        console.error('[Studio Scribe] Failed to stream chunk:', err);
      }
    }, []),
  });

  // ── SSE stream ──────────────────────────────────────────────────────────

  const connectToStream = useCallback((sid: string) => {
    setConnectionStatus('connecting');

    const url = apiUrl(`/api/supervision/scribe?sessionId=${sid}`);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus('connected');
    };

    es.addEventListener('connected', () => {
      // Server confirmed connection
    });

    es.addEventListener('transcript', (e) => {
      const data = JSON.parse(e.data);
      if (data.segments?.length) {
        setSegments(prev => {
          const newSegs = data.segments.filter(
            (s: TranscriptSegment) => !prev.find(p => p.id === s.id)
          );
          return [...prev, ...newSegs];
        });
      }
    });

    es.addEventListener('insights', (e) => {
      const data = JSON.parse(e.data);
      if (data.insights?.length) {
        setInsights(prev => {
          const newInsights = data.insights.filter(
            (i: LiveInsight) => !prev.find(p => p.id === i.id)
          );
          return [...prev, ...newInsights];
        });
      }
    });

    es.addEventListener('analysis_started', () => {
      // Background analysis running
    });

    es.addEventListener('analysis_complete', () => {
      // Analysis finished
    });

    es.addEventListener('session_ended', () => {
      setConnectionStatus('disconnected');
    });

    es.onerror = () => {
      setConnectionStatus('disconnected');
      setTimeout(() => {
        if (isRecordingRef.current && sessionIdRef.current) {
          connectToStream(sessionIdRef.current);
        }
      }, 3000);
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current && phase === 'recording') {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments, phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // ── Session lifecycle ───────────────────────────────────────────────────

  const startSession = async () => {
    const title = sessionTitle.trim() || `Session \u2014 ${new Date().toLocaleDateString()}`;

    try {
      const response = await apiFetch('/api/supervision/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'live_scribe',
          title,
          metadata: { captureMode: 'chunked', source: 'studio' },
        }),
      });

      const data = await response.json();
      if (data.success && data.session?.id) {
        setSessionId(data.session.id);
        sessionIdRef.current = data.session.id;
        setSegments([]);
        setInsights([]);
        startTimeRef.current = Date.now();
        setPhase('recording');

        await audioCapture.start();
        connectToStream(data.session.id);
      }
    } catch (err) {
      console.error('[Studio Scribe] Failed to start session:', err);
    }
  };

  const stopSession = async () => {
    if (!sessionId) return;

    await audioCapture.stop();

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      await apiFetch('/api/supervision/session/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          triggerAnalysis: true,
          totalDurationMs: audioCapture.duration * 1000,
        }),
      });
    } catch (err) {
      console.error('[Studio Scribe] Failed to stop session:', err);
    }

    setConnectionStatus('disconnected');
    setPhase('review');
  };

  const resetSession = () => {
    setSessionId(null);
    sessionIdRef.current = null;
    setSessionTitle('');
    setSegments([]);
    setInsights([]);
    setTranscriptExpanded(false);
    setPhase('idle');
  };

  // ── Export helpers ──────────────────────────────────────────────────────

  const buildTranscriptText = () =>
    segments
      .map(seg => `[${formatDuration(Math.floor(seg.startMs / 1000))}] ${seg.speaker}: ${seg.text}`)
      .join('\n\n');

  const downloadTranscriptTxt = () => {
    const content = buildTranscriptText();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scribe-session-${sessionId || 'draft'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTranscriptMd = () => {
    const title = sessionTitle.trim() || 'Untitled Session';
    const date = new Date().toISOString().split('T')[0];
    const dur = formatDuration(audioCapture.duration);

    const transcriptSection = segments
      .map(seg => `[${formatDuration(Math.floor(seg.startMs / 1000))}] ${seg.speaker}: ${seg.text}`)
      .join('\n\n');

    const insightsSection = insights.length > 0
      ? insights
          .map(i => `### ${i.insightType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}\n${i.content}`)
          .join('\n\n')
      : '_No insights generated during this session._';

    const md = `---
date: ${date}
title: "${title}"
duration: ${dur}
segments: ${segments.length}
insights: ${insights.length}
tags: [session, scribe, soullab]
---

# ${title}

**Date:** ${date}
**Duration:** ${dur}
**Segments:** ${segments.length}

## Transcript

${transcriptSection}

## MAIA Insights

${insightsSection}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${date}-${title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      <div className="max-w-6xl mx-auto">

        {/* ── IDLE PHASE ───────────────────────────────────────────────── */}
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto pt-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Mic className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Scribe</h1>
              <p className="text-slate-400 text-sm mt-1">
                Record a session, review it with MAIA, export structured notes
              </p>
            </div>

            {/* Session title input */}
            <div className="mb-6">
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                Session title (optional)
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder={`Session \u2014 ${new Date().toLocaleDateString()}`}
                className="w-full bg-[#1e1e38] border border-slate-800/50 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            {/* Start button */}
            <button
              onClick={startSession}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-base font-medium"
            >
              <Mic className="w-5 h-5" />
              Start Session
            </button>

            <p className="text-center text-xs text-slate-600 mt-4">
              Your browser will request microphone access. All transcription runs locally.
            </p>
          </motion.div>
        )}

        {/* ── RECORDING PHASE ──────────────────────────────────────────── */}
        {phase === 'recording' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-lg font-medium text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                Recording
                {sessionTitle && (
                  <span className="text-slate-500 font-normal ml-2">\u2014 {sessionTitle}</span>
                )}
              </h1>

              <div className="flex items-center gap-3">
                {/* Audio level */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500"
                      animate={{ width: `${audioCapture.audioLevel * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

                {/* Duration */}
                <span className="text-sm font-medium text-amber-400">
                  {formatDuration(audioCapture.duration)}
                </span>

                {/* Connection status */}
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-current'
                  }`} />
                  {connectionStatus}
                </div>

                {/* Pause / Resume */}
                <button
                  onClick={audioCapture.isPaused ? audioCapture.resume : audioCapture.pause}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs hover:bg-slate-700 transition-all"
                >
                  {audioCapture.isPaused ? (
                    <><Play className="w-3 h-3" /> Resume</>
                  ) : (
                    <><Pause className="w-3 h-3" /> Pause</>
                  )}
                </button>

                {/* Stop */}
                <button
                  onClick={stopSession}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  Stop
                </button>
              </div>
            </div>

            {/* Two-column: Transcript + Insights */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Transcript column */}
              <div className="lg:col-span-2">
                <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Live Transcript
                    </h2>
                    {segments.length > 0 && (
                      <button
                        onClick={downloadTranscriptTxt}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 text-slate-500 text-xs hover:text-slate-300 transition-all"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    )}
                  </div>

                  <div className="h-[450px] overflow-y-auto space-y-2.5 pr-2">
                    {segments.length === 0 ? (
                      <div className="text-center py-20 text-slate-600 text-sm">
                        {audioCapture.isPaused
                          ? 'Recording paused...'
                          : 'Listening for speech...'}
                      </div>
                    ) : (
                      segments.map((seg) => (
                        <motion.div
                          key={seg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border ${
                            seg.id.startsWith('local-')
                              ? 'bg-slate-800/20 border-slate-700/20'
                              : 'bg-slate-800/40 border-slate-700/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-amber-400 uppercase">
                              {seg.speaker}
                            </span>
                            <span className="text-xs text-slate-600">
                              {formatDuration(Math.floor(seg.startMs / 1000))}
                            </span>
                            {seg.confidence != null && (
                              <span className={`text-xs px-1 rounded ${
                                seg.confidence > 0.8 ? 'text-emerald-500' :
                                seg.confidence > 0.5 ? 'text-amber-500' : 'text-red-500'
                              }`}>
                                {Math.round(seg.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-300">{seg.text}</p>
                        </motion.div>
                      ))
                    )}
                    <div ref={transcriptEndRef} />
                  </div>
                </div>
              </div>

              {/* Insights column */}
              <div className="lg:col-span-1">
                <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
                  <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4" />
                    MAIA Insights
                  </h2>

                  <div className="h-[450px] overflow-y-auto space-y-2.5 pr-2">
                    {insights.length === 0 ? (
                      <div className="text-center py-20 text-slate-600 text-sm">
                        Insights will appear as patterns emerge...
                      </div>
                    ) : (
                      insights.map((insight) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-3 rounded-lg border ${getInsightColor(insight.insightType)}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium uppercase">
                              {insight.insightType.replace(/_/g, ' ')}
                            </span>
                            {insight.significance != null && insight.significance > 0.7 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">
                                High
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed opacity-90">
                            {insight.content.slice(0, 200)}
                            {insight.content.length > 200 && '...'}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── REVIEW PHASE ─────────────────────────────────────────────── */}
        {phase === 'review' && sessionId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Session summary banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Session Complete
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    {segments.length} transcript segments &middot; {formatDuration(audioCapture.duration)} &middot; {insights.length} insight{insights.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadTranscriptMd}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white transition-all"
                    title="Download as Obsidian-compatible Markdown"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    .md
                  </button>
                  <button
                    onClick={downloadTranscriptTxt}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white transition-all"
                    title="Download as plain text"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .txt
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible transcript */}
            <div className="mb-6">
              <button
                onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-2"
              >
                {transcriptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {transcriptExpanded ? 'Collapse transcript' : `View transcript (${segments.length} segments)`}
              </button>

              <AnimatePresence>
                {transcriptExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 max-h-[400px] overflow-y-auto space-y-2">
                      {segments.map((seg) => (
                        <div key={seg.id} className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/20">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-amber-400 uppercase">{seg.speaker}</span>
                            <span className="text-xs text-slate-600">{formatDuration(Math.floor(seg.startMs / 1000))}</span>
                          </div>
                          <p className="text-sm text-slate-300">{seg.text}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MAIA Review Chat */}
            <SessionReviewChat
              reviewedSessionId={sessionId}
              segmentCount={segments.length}
              duration={audioCapture.duration}
            />

            {/* New session button */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={resetSession}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-sm hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                New Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
