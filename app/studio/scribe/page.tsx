'use client';

/**
 * Studio Scribe — Interactive live session companion
 *
 * Three-phase practitioner workflow:
 *   idle (setup) → recording (interactive) → review
 *
 * Idle: container selector (solo/witness/practitioner), consent gate, memory policy
 * Recording: live transcript + interactive rail (markers / ask MAIA / insights)
 * Review: SessionReviewChat + markers timeline + export
 *
 * Infrastructure:
 *   - useAudioCapture hook (chunked 5s intervals)
 *   - POST /api/supervision/session/start & stop (audio session)
 *   - POST /api/supervision/transcript/stream (audio chunks)
 *   - SSE  /api/supervision/scribe?sessionId=xxx (real-time updates)
 *   - POST /api/scribe/start (scribe session with container)
 *   - POST /api/scribe/consent (consent confirmation)
 *   - POST /api/studio/scribe/markers (moment markers)
 *   - POST /api/studio/scribe/live-prompts (mid-session MAIA)
 *   - SessionReviewChat → POST /api/scribe/review-session
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
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
  Send,
  Tag,
  MessageCircle,
  Eye,
  User,
  Users,
  Briefcase,
  Shield,
  Lock,
  Unlock,
} from 'lucide-react';
import { apiUrl, apiFetch } from '@/lib/http/apiBase';
import { useAudioCapture, type TranscriptResult } from '@/hooks/useAudioCapture';
import { SessionReviewChat } from '@/components/studio/SessionReviewChat';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScribeContainer = 'solo' | 'witness' | 'practitioner';
type MemoryPolicy = 'sealed' | 'learning';
type ScribePhase = 'idle' | 'recording' | 'review';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type RailTab = 'markers' | 'maia' | 'insights';

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

interface SessionMarker {
  id: string;
  markerType: string;
  note?: string;
  tsMs: number;
  createdAt: string;
}

interface LivePromptExchange {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONTAINER_CONFIG: Record<ScribeContainer, {
  label: string;
  description: string;
  icon: typeof User;
  markers: { type: string; label: string; color: string }[];
}> = {
  solo: {
    label: 'Solo',
    description: 'Self-study, journaling, personal reflection',
    icon: User,
    markers: [
      { type: 'insight', label: 'Insight', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
      { type: 'resistance', label: 'Resistance', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
      { type: 'opening', label: 'Opening', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      { type: 'integration', label: 'Integration', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
      { type: 'question', label: 'Question', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    ],
  },
  witness: {
    label: 'Witness',
    description: 'Couples or group — MAIA observes, doesn\'t referee',
    icon: Users,
    markers: [
      { type: 'escalation', label: 'Escalation', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
      { type: 'softening', label: 'Softening', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      { type: 'miss', label: 'Miss', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
      { type: 'need_named', label: 'Need Named', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
      { type: 'repair', label: 'Repair', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
      { type: 'appreciation', label: 'Appreciation', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    ],
  },
  practitioner: {
    label: 'Practitioner',
    description: 'Client session — notes, patterns, skill tracking',
    icon: Briefcase,
    markers: [
      { type: 'turning_point', label: 'Turning Point', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
      { type: 'somatic_shift', label: 'Somatic Shift', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      { type: 'avoidance', label: 'Avoidance', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
      { type: 'repair_attempt', label: 'Repair Attempt', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
      { type: 'breakthrough', label: 'Breakthrough', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    ],
  },
};

const QUICK_PROMPTS = [
  { label: 'What patterns?', prompt: 'What patterns are you noticing in this session?' },
  { label: 'What am I missing?', prompt: 'What might I be missing or not seeing in this session?' },
  { label: 'Summarize last 5 min', prompt: 'Summarize the key themes from the last 5 minutes.' },
  { label: 'What to watch', prompt: 'What should I be watching for in the next few minutes?' },
];

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

  // Session setup
  const [container, setContainer] = useState<ScribeContainer>('solo');
  const [memoryPolicy, setMemoryPolicy] = useState<MemoryPolicy>('sealed');
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Session
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scribeSessionId, setScribeSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');

  // Recording
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [insights, setInsights] = useState<LiveInsight[]>([]);

  // Interactive rail
  const [activeTab, setActiveTab] = useState<RailTab>('markers');
  const [markers, setMarkers] = useState<SessionMarker[]>([]);
  const [markerNote, setMarkerNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingMarkerType, setPendingMarkerType] = useState<string | null>(null);
  const noteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ask MAIA
  const [maiaPrompt, setMaiaPrompt] = useState('');
  const [maiaExchanges, setMaiaExchanges] = useState<LivePromptExchange[]>([]);
  const [maiaLoading, setMaiaLoading] = useState(false);

  // Review
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [markersExpanded, setMarkersExpanded] = useState(true);

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const maiaEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const scribeSessionIdRef = useRef<string | null>(null);

  // Keep refs in sync
  useEffect(() => { isRecordingRef.current = phase === 'recording'; }, [phase]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { scribeSessionIdRef.current = scribeSessionId; }, [scribeSessionId]);

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

    es.onopen = () => { setConnectionStatus('connected'); };

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

    es.addEventListener('session_ended', () => { setConnectionStatus('disconnected'); });

    es.onerror = () => {
      setConnectionStatus('disconnected');
      setTimeout(() => {
        if (isRecordingRef.current && sessionIdRef.current) {
          connectToStream(sessionIdRef.current);
        }
      }, 3000);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (transcriptEndRef.current && phase === 'recording') {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments, phase]);

  useEffect(() => {
    if (maiaEndRef.current) {
      maiaEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [maiaExchanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  // ── Session lifecycle ───────────────────────────────────────────────────

  const startSession = async () => {
    const title = sessionTitle.trim() || `Session — ${new Date().toLocaleDateString()}`;

    try {
      // 1. Create scribe session with container
      const scribeResp = await apiFetch('/api/scribe/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          container,
          memoryPolicy,
        }),
      });
      const scribeData = await scribeResp.json();

      if (!scribeData.success || !scribeData.session?.id) {
        console.error('[Studio Scribe] Failed to create scribe session:', scribeData);
        return;
      }

      const newScribeSessionId = scribeData.session.id;
      setScribeSessionId(newScribeSessionId);
      scribeSessionIdRef.current = newScribeSessionId;

      // 2. Confirm consent
      await apiFetch('/api/scribe/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newScribeSessionId,
          confirmed: true,
          method: 'tap',
        }),
      });

      // 3. Create audio/supervision session
      const response = await apiFetch('/api/supervision/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'live_scribe',
          title,
          metadata: {
            captureMode: 'chunked',
            source: 'studio',
            container,
            scribeSessionId: newScribeSessionId,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.session?.id) {
        setSessionId(data.session.id);
        sessionIdRef.current = data.session.id;
        setSegments([]);
        setInsights([]);
        setMarkers([]);
        setMaiaExchanges([]);
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
    setScribeSessionId(null);
    scribeSessionIdRef.current = null;
    setSessionTitle('');
    setSegments([]);
    setInsights([]);
    setMarkers([]);
    setMaiaExchanges([]);
    setTranscriptExpanded(false);
    setConsentConfirmed(false);
    setPhase('idle');
  };

  // ── Markers ─────────────────────────────────────────────────────────────

  const addMarker = async (markerType: string, note?: string) => {
    if (!scribeSessionId) return;

    const tsMs = Date.now() - startTimeRef.current;

    // Optimistic local add
    const tempMarker: SessionMarker = {
      id: `temp-${Date.now()}`,
      markerType,
      note,
      tsMs,
      createdAt: new Date().toISOString(),
    };
    setMarkers(prev => [tempMarker, ...prev]);

    try {
      const resp = await apiFetch('/api/studio/scribe/markers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: scribeSessionId, markerType, note, tsMs }),
      });
      const data = await resp.json();
      if (data.success && data.marker) {
        setMarkers(prev =>
          prev.map(m => m.id === tempMarker.id ? { ...data.marker } : m)
        );
      }
    } catch (err) {
      console.error('[Studio Scribe] Failed to add marker:', err);
    }
  };

  const handleMarkerTap = (markerType: string) => {
    if (showNoteInput && pendingMarkerType === markerType) {
      // Second tap on same button — submit with note
      addMarker(markerType, markerNote.trim() || undefined);
      setShowNoteInput(false);
      setMarkerNote('');
      setPendingMarkerType(null);
      if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    } else {
      // First tap — add marker immediately, show note input
      addMarker(markerType);
      setPendingMarkerType(markerType);
      setShowNoteInput(true);
      setMarkerNote('');
      // Auto-hide after 4s
      if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
      noteTimeoutRef.current = setTimeout(() => {
        setShowNoteInput(false);
        setPendingMarkerType(null);
        setMarkerNote('');
      }, 4000);
    }
  };

  const submitMarkerNote = () => {
    if (pendingMarkerType && markerNote.trim()) {
      // Update the last marker with a note (add a new one with the note)
      addMarker(pendingMarkerType, markerNote.trim());
    }
    setShowNoteInput(false);
    setMarkerNote('');
    setPendingMarkerType(null);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
  };

  // ── Ask MAIA ────────────────────────────────────────────────────────────

  const sendMaiaPrompt = async (promptText?: string) => {
    const text = promptText || maiaPrompt;
    if (!text.trim() || !scribeSessionId || maiaLoading) return;

    setMaiaPrompt('');
    setMaiaLoading(true);

    const tsMs = Date.now() - startTimeRef.current;

    try {
      const resp = await apiFetch('/api/studio/scribe/live-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: scribeSessionId, prompt: text, tsMs }),
      });
      const data = await resp.json();
      if (data.success) {
        setMaiaExchanges(prev => [...prev, {
          id: data.id,
          prompt: text,
          response: data.response,
          createdAt: data.createdAt,
        }]);
      }
    } catch (err) {
      console.error('[Studio Scribe] Live prompt error:', err);
      setMaiaExchanges(prev => [...prev, {
        id: `error-${Date.now()}`,
        prompt: text,
        response: 'Connection error. Try again in a moment.',
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setMaiaLoading(false);
    }
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

    const markersSection = markers.length > 0
      ? markers
          .map(m => `- [${formatDuration(Math.floor(m.tsMs / 1000))}] **${m.markerType.replace(/_/g, ' ')}**${m.note ? ` — ${m.note}` : ''}`)
          .join('\n')
      : '_No markers._';

    const maiaSection = maiaExchanges.length > 0
      ? maiaExchanges
          .map(e => `**Q:** ${e.prompt}\n**A:** ${e.response}`)
          .join('\n\n')
      : '_No mid-session prompts._';

    const md = `---
date: ${date}
title: "${title}"
container: ${container}
duration: ${dur}
segments: ${segments.length}
markers: ${markers.length}
insights: ${insights.length}
tags: [session, scribe, soullab]
---

# ${title}

**Date:** ${date}
**Container:** ${container}
**Duration:** ${dur}
**Segments:** ${segments.length}

## Markers

${markersSection}

## Transcript

${transcriptSection}

## Mid-Session MAIA Exchanges

${maiaSection}

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

  // ── Derived ─────────────────────────────────────────────────────────────

  const needsConsent = container === 'witness' || container === 'practitioner';
  const canStart = !needsConsent || consentConfirmed;
  const containerMarkers = CONTAINER_CONFIG[container].markers;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── IDLE PHASE ───────────────────────────────────────────── */}
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto pt-4"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Mic className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Scribe</h1>
              <p className="text-slate-400 text-sm mt-1">
                Record a session, mark moments, ask MAIA mid-session, review with structured notes
              </p>
            </div>

            {/* Container selector */}
            <div className="mb-5">
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                Container
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CONTAINER_CONFIG) as ScribeContainer[]).map(key => {
                  const cfg = CONTAINER_CONFIG[key];
                  const Icon = cfg.icon;
                  const active = container === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setContainer(key);
                        setConsentConfirmed(false);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                        active
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-[#1e1e38] border-slate-800/50 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{cfg.label}</span>
                      <span className="text-[10px] leading-tight opacity-70">{cfg.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Consent gate */}
            <AnimatePresence>
              {needsConsent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-[#1e1e38] border border-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentConfirmed}
                      onChange={(e) => setConsentConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/50"
                    />
                    <div>
                      <div className="text-sm text-white flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        Recording consent confirmed by all participants
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {container === 'witness'
                          ? 'All participants must consent before recording begins. MAIA will observe without taking sides.'
                          : 'Client has consented to this session being recorded for professional review.'}
                      </p>
                    </div>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Session title */}
            <div className="mb-4">
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                Session title (optional)
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder={`Session — ${new Date().toLocaleDateString()}`}
                className="w-full bg-[#1e1e38] border border-slate-800/50 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            {/* Memory policy */}
            <div className="mb-6">
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                Memory policy
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMemoryPolicy('sealed')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all ${
                    memoryPolicy === 'sealed'
                      ? 'bg-slate-800/60 border-slate-700 text-white'
                      : 'bg-[#1e1e38] border-slate-800/50 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sealed
                </button>
                <button
                  onClick={() => setMemoryPolicy('learning')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all ${
                    memoryPolicy === 'learning'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-[#1e1e38] border-slate-800/50 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Learning
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">
                {memoryPolicy === 'sealed'
                  ? 'Summary only — no long-term pattern learning from this session'
                  : 'Session contributes to your longitudinal patterns and growth tracking'}
              </p>
            </div>

            {/* Start button */}
            <button
              onClick={startSession}
              disabled={!canStart}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border text-base font-medium transition-all ${
                canStart
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-slate-800/30 border-slate-800/50 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Mic className="w-5 h-5" />
              Start Session
            </button>

            {!canStart && (
              <p className="text-center text-xs text-red-400/70 mt-2">
                Confirm consent before starting
              </p>
            )}

            <p className="text-center text-xs text-slate-600 mt-3">
              Your browser will request microphone access. All transcription runs locally.
            </p>
          </motion.div>
        )}

        {/* ── RECORDING PHASE ──────────────────────────────────────── */}
        {phase === 'recording' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-medium text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                Recording
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                  {CONTAINER_CONFIG[container].label}
                </span>
                {sessionTitle && (
                  <span className="text-slate-500 font-normal ml-1">— {sessionTitle}</span>
                )}
              </h1>

              <div className="flex items-center gap-3">
                {/* Audio level */}
                <div className="hidden sm:flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
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
                <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
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

            {/* Two-column: Transcript + Interactive Rail */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Transcript column */}
              <div>
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
                        .txt
                      </button>
                    )}
                  </div>

                  <div className="h-[calc(100vh-220px)] overflow-y-auto space-y-2 pr-2">
                    {segments.length === 0 ? (
                      <div className="text-center py-20 text-slate-600 text-sm">
                        {audioCapture.isPaused ? 'Recording paused...' : 'Listening for speech...'}
                      </div>
                    ) : (
                      segments.map((seg) => (
                        <motion.div
                          key={seg.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-2.5 rounded-lg border ${
                            seg.id.startsWith('local-')
                              ? 'bg-slate-800/20 border-slate-700/20'
                              : 'bg-slate-800/40 border-slate-700/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
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
                          <p className="text-sm text-slate-300 leading-relaxed">{seg.text}</p>
                        </motion.div>
                      ))
                    )}
                    <div ref={transcriptEndRef} />
                  </div>
                </div>
              </div>

              {/* Interactive Rail */}
              <div>
                {/* Tab selector */}
                <div className="flex gap-1 mb-3">
                  {([
                    { key: 'markers' as RailTab, label: 'Markers', icon: Tag, count: markers.length },
                    { key: 'maia' as RailTab, label: 'Ask MAIA', icon: MessageCircle, count: maiaExchanges.length },
                    { key: 'insights' as RailTab, label: 'Insights', icon: Eye, count: insights.length },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab.key
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                          : 'bg-[#1e1e38] border border-slate-800/50 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px]">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
                  {/* ── Markers Tab ──────────────────────────── */}
                  {activeTab === 'markers' && (
                    <div>
                      <h2 className="text-sm font-medium text-slate-400 mb-3">Quick Markers</h2>

                      {/* Marker buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                        {containerMarkers.map(m => (
                          <button
                            key={m.type}
                            onClick={() => handleMarkerTap(m.type)}
                            className={`px-3 py-3 rounded-lg border text-xs font-medium transition-all active:scale-95 ${m.color} hover:opacity-90`}
                          >
                            {m.label}
                          </button>
                        ))}
                        {/* Generic mark */}
                        <button
                          onClick={() => handleMarkerTap('generic')}
                          className="px-3 py-3 rounded-lg border bg-slate-700/30 text-slate-400 border-slate-600/40 text-xs font-medium transition-all active:scale-95 hover:opacity-90"
                        >
                          Mark
                        </button>
                      </div>

                      {/* Note input */}
                      <AnimatePresence>
                        {showNoteInput && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-3"
                          >
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={markerNote}
                                onChange={(e) => setMarkerNote(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') submitMarkerNote();
                                }}
                                placeholder="Add note (optional)..."
                                autoFocus
                                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                              />
                              <button
                                onClick={submitMarkerNote}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/30 transition-all"
                              >
                                Add
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Recent markers */}
                      <div className="h-[calc(100vh-420px)] overflow-y-auto space-y-1.5">
                        {markers.length === 0 ? (
                          <p className="text-xs text-slate-600 text-center py-8">
                            Tap a button to mark a moment
                          </p>
                        ) : (
                          markers.slice(0, 20).map(m => (
                            <div
                              key={m.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/30 border border-slate-700/20"
                            >
                              <span className="text-[10px] text-slate-600 font-mono w-10 shrink-0">
                                {formatDuration(Math.floor(m.tsMs / 1000))}
                              </span>
                              <span className="text-xs text-slate-300 font-medium">
                                {m.markerType.replace(/_/g, ' ')}
                              </span>
                              {m.note && (
                                <span className="text-xs text-slate-500 truncate">
                                  — {m.note}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Ask MAIA Tab ─────────────────────────── */}
                  {activeTab === 'maia' && (
                    <div className="flex flex-col h-[calc(100vh-260px)]">
                      <h2 className="text-sm font-medium text-slate-400 mb-2">Ask MAIA</h2>

                      {/* Quick prompts */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {QUICK_PROMPTS.map((qp, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMaiaPrompt(qp.prompt)}
                            disabled={maiaLoading}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[10px] text-slate-400 hover:text-teal-300 hover:border-teal-500/30 transition-all disabled:opacity-40"
                          >
                            {qp.label}
                          </button>
                        ))}
                      </div>

                      {/* Exchanges */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 mb-3">
                        {maiaExchanges.length === 0 && !maiaLoading ? (
                          <p className="text-xs text-slate-600 text-center py-8">
                            Ask MAIA a question about this session
                          </p>
                        ) : (
                          maiaExchanges.map(ex => (
                            <div key={ex.id} className="space-y-1.5">
                              <div className="flex justify-end">
                                <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-1.5 max-w-[85%]">
                                  <p className="text-xs text-teal-200">{ex.prompt}</p>
                                </div>
                              </div>
                              <div className="flex justify-start">
                                <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 max-w-[90%]">
                                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {ex.response}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        {maiaLoading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={maiaEndRef} />
                      </div>

                      {/* Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={maiaPrompt}
                          onChange={(e) => setMaiaPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMaiaPrompt();
                            }
                          }}
                          placeholder="Ask about this session..."
                          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                        />
                        <button
                          onClick={() => sendMaiaPrompt()}
                          disabled={!maiaPrompt.trim() || maiaLoading}
                          className="p-2 bg-teal-500/80 text-white rounded-lg hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Insights Tab ─────────────────────────── */}
                  {activeTab === 'insights' && (
                    <div>
                      <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4" />
                        MAIA Insights
                      </h2>

                      <div className="h-[calc(100vh-280px)] overflow-y-auto space-y-2.5 pr-2">
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
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── REVIEW PHASE ─────────────────────────────────────────── */}
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
                    {segments.length} segments &middot; {formatDuration(audioCapture.duration)} &middot; {markers.length} marker{markers.length !== 1 ? 's' : ''} &middot; {insights.length} insight{insights.length !== 1 ? 's' : ''}
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-500">
                      {CONTAINER_CONFIG[container].label}
                    </span>
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

            {/* Markers timeline */}
            {markers.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setMarkersExpanded(!markersExpanded)}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-2"
                >
                  {markersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Session markers ({markers.length})
                </button>

                <AnimatePresence>
                  {markersExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 space-y-1.5 max-h-[250px] overflow-y-auto">
                        {[...markers].reverse().map(m => (
                          <div key={m.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/30 border border-slate-700/20">
                            <span className="text-[10px] text-slate-600 font-mono w-10 shrink-0">
                              {formatDuration(Math.floor(m.tsMs / 1000))}
                            </span>
                            <span className="text-xs text-slate-300 font-medium">
                              {m.markerType.replace(/_/g, ' ')}
                            </span>
                            {m.note && (
                              <span className="text-xs text-slate-500 truncate">— {m.note}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mid-session MAIA exchanges */}
            {maiaExchanges.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Mid-session MAIA exchanges ({maiaExchanges.length})
                </h3>
                <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {maiaExchanges.map(ex => (
                    <div key={ex.id} className="space-y-1">
                      <p className="text-xs text-teal-300">Q: {ex.prompt}</p>
                      <p className="text-xs text-slate-400 whitespace-pre-wrap">{ex.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              reviewedSessionId={scribeSessionId || sessionId}
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
