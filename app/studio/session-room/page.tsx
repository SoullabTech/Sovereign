'use client';

/**
 * Studio Session Room — Live session companion (refactored from Scribe)
 *
 * Three-phase practitioner workflow:
 *   idle (setup) → recording (interactive) → review
 *
 * Recording state lives in RecordingContext (layout-level) so it
 * survives navigation between Studio pages.
 *
 * Idle: container selector, consent gate, tab audio toggle, memory policy
 * Recording: live transcript + interactive rail (markers / ask MAIA / insights)
 * Review: SessionReviewChat + markers timeline + export
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Monitor,
  Calendar,
  LinkIcon,
  History,
  ArrowLeft,
  AlertCircle,
  Video,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { cleanTranscriptTexts } from '@/lib/scribe/transcriptCleaner';
import { repairTranscriptTexts } from '@/lib/scribe/transcriptRepair';
import { logMeetingAudioEvent } from '@/lib/studio/meetingAudioTelemetry';
import { SessionReviewChat } from '@/components/studio/SessionReviewChat';
import { TranscriptImportPanel, type ImportedSessionInfo } from '@/components/studio/TranscriptImportPanel';
import { AudioSourcesStatus } from '@/components/studio/AudioSourcesStatus';
import { ShareToCircleModal } from '@/components/circles/ShareToCircleModal';
import { useOfferToCircle } from '@/lib/circles/useOfferToCircle';
import { getReviewEligibility, getSessionStatusBadge } from '@/lib/studio/reviewEligibility';
import {
  useRecordingContext,
  type SessionContainer,
  type MemoryPolicy,
  type TranscriptSegment,
  type LiveInsight,
  type SessionMarker,
  type LivePromptExchange,
} from '@/lib/studio/RecordingContext';

// ---------------------------------------------------------------------------
// Types (page-local)
// ---------------------------------------------------------------------------

type RailTab = 'markers' | 'maia' | 'insights';

interface PastSession {
  id: string;
  container: string;
  title: string | null;
  client_id: string | null;
  client_name: string | null;
  started_at: string;
  ended_at: string | null;
  memory_policy: string;
  transcript_enabled: boolean;
  duration_seconds: number;
  segment_count: number;
  marker_count: number;
  assembled_turns: number;
  has_assembled: boolean;
}

interface BookingOption {
  id: string;
  clientId: string | null;
  clientName: string;
  serviceName: string | null;
  startAt: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONTAINER_CONFIG: Record<SessionContainer, {
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

export default function SessionRoomPage() {
  // ── Query params (case context) ───────────────────────────────────────
  const searchParams = useSearchParams();
  const caseId = searchParams?.get('caseId') ?? null;

  // ── Context (global recording state) ──────────────────────────────────
  const ctx = useRecordingContext();

  // ── Page-local state (idle phase setup) ───────────────────────────────
  const [localContainer, setLocalContainer] = useState<SessionContainer>('solo');
  const [localMemoryPolicy, setLocalMemoryPolicy] = useState<MemoryPolicy>('sealed');
  // Session Support: defaults to off. When Phase 4 wires allow_ai_distillation to bookings,
  // initialize from persisted state here instead of hardcoded false.
  const [sessionSupport, setSessionSupport] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [localSessionTitle, setLocalSessionTitle] = useState('');
  const [captureTabAudio, setCaptureTabAudio] = useState(false);
  const [blockedFeedbackSent, setBlockedFeedbackSent] = useState(false);
  const [videoRoomUrl, setVideoRoomUrl] = useState<string | null>(null);

  // Past sessions / history review
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [pastSessionsLoading, setPastSessionsLoading] = useState(false);
  const [pastSessionsOpen, setPastSessionsOpen] = useState(false);
  const [historyReviewId, setHistoryReviewId] = useState<string | null>(null);
  const [historyReviewMeta, setHistoryReviewMeta] = useState<{ segmentCount: number; duration: number; assembledTurns: number; hasAssembled: boolean }>({ segmentCount: 0, duration: 0, assembledTurns: 0, hasAssembled: false });

  // Booking picker (practitioner only)
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  // Relationship Memory v1 — Phase 1: stricter-sanctuary opt-out (store no client link).
  const [keepLinkPrivate, setKeepLinkPrivate] = useState(false);

  // Interactive rail
  const [activeTab, setActiveTab] = useState<RailTab>('markers');
  const [markerNote, setMarkerNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingMarkerType, setPendingMarkerType] = useState<string | null>(null);
  const noteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ask MAIA (local input state)
  const [maiaPrompt, setMaiaPrompt] = useState('');
  const [maiaLoading, setMaiaLoading] = useState(false);

  // Review
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [markersExpanded, setMarkersExpanded] = useState(true);
  const circleOffer = useOfferToCircle();

  // Refs
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const maiaEndRef = useRef<HTMLDivElement>(null);

  // ── Derived ─────────────────────────────────────────────────────────
  // When recording/review, use context values; when idle, use local state
  const phase = ctx.phase;

  // Cleaned transcript texts for the review-phase "View transcript" panel.
  // 1. Strip phantom prefix (repeated hallucination across many segments)
  // 2. Repair high-confidence Whisper chunk-boundary fragments (e.g. "t's" → "it's")
  const cleanedSegmentTexts = useMemo(() => {
    if (ctx.segments.length === 0) return [] as string[];
    const raw = ctx.segments.map(s => s.text);
    const deduped = cleanTranscriptTexts(raw).texts;
    return repairTranscriptTexts(deduped).texts;
  }, [ctx.segments]);
  const container = phase === 'idle' ? localContainer : ctx.container;
  const memoryPolicy = phase === 'idle' ? localMemoryPolicy : ctx.memoryPolicy;
  const needsConsent = container === 'witness' || container === 'practitioner';
  const canStart = !needsConsent || consentConfirmed;
  const containerMarkers = CONTAINER_CONFIG[container].markers;

  // Feature-detect browser tab-audio capture. getDisplayMedia is absent in
  // Capacitor/iOS WebView, older Safari, and some embedded webviews. When
  // missing, we hide the "Add meeting audio" toggle so users aren't offered
  // a feature their environment can't deliver.
  const displayMediaSupported = useMemo(
    () =>
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === 'function',
    [],
  );

  // If a previously-set toggle persists in an unsupported environment, coerce off.
  useEffect(() => {
    if (!displayMediaSupported && captureTabAudio) setCaptureTabAudio(false);
  }, [displayMediaSupported, captureTabAudio]);

  // Emit listening telemetry once per mount if the browser cannot offer the
  // browser-tab path. Aggregate signal helps determine whether the native-app
  // gap (Capacitor/iOS WebView, older Safari) is real before scoping a
  // companion app. Doctrine: participation before infrastructure.
  const unsupportedEmittedRef = useRef(false);
  useEffect(() => {
    if (!displayMediaSupported && !unsupportedEmittedRef.current) {
      unsupportedEmittedRef.current = true;
      logMeetingAudioEvent('meeting_audio_unsupported');
    }
  }, [displayMediaSupported]);

  // Fetch bookings when practitioner container is selected
  useEffect(() => {
    if (localContainer !== 'practitioner' || phase !== 'idle') return;
    let cancelled = false;
    setBookingsLoading(true);

    const fetchBookings = async () => {
      try {
        // Fetch today's and upcoming bookings (within next 7 days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAhead = new Date(today);
        weekAhead.setDate(weekAhead.getDate() + 7);

        const res = await apiFetch(
          `/api/studio/bookings?from=${today.toISOString()}&to=${weekAhead.toISOString()}&limit=20`
        );
        const data = await res.json();
        if (!cancelled && data.bookings) {
          setBookings(
            data.bookings
              .filter((b: any) => b.status !== 'cancelled' && b.status !== 'completed')
              .map((b: any) => ({
                id: b.id,
                clientId: b.clientId ?? null,
                clientName: b.clientName || 'Unknown Client',
                serviceName: b.serviceName,
                startAt: b.startAt,
                status: b.status,
              }))
          );
        }
      } catch (err) {
        console.error('[SessionRoom] Failed to fetch bookings:', err);
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    };

    fetchBookings();
    return () => { cancelled = true; };
  }, [localContainer, phase]);

  // Fetch practitioner's configured video room URL (non-critical — silently ignored if absent)
  useEffect(() => {
    const fetchVideoRoomUrl = async () => {
      try {
        const res = await apiFetch('/api/studio/settings?key=video_room_url');
        const data = await res.json();
        if (data?.value) setVideoRoomUrl(data.value);
      } catch {
        // non-critical — Session Room works without it
      }
    };
    fetchVideoRoomUrl();
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current && phase === 'recording') {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ctx.segments, phase]);

  // Auto-scroll MAIA exchanges
  useEffect(() => {
    if (maiaEndRef.current) {
      maiaEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ctx.maiaExchanges]);

  // ── Session lifecycle (delegates to context) ──────────────────────────

  const handleStartSession = async () => {
    // For practitioner sessions, auto-set title from booking if not custom
    let title = localSessionTitle;
    if (localContainer === 'practitioner' && selectedBookingId && !title) {
      const booking = bookings.find(b => b.id === selectedBookingId);
      if (booking) {
        title = `${booking.clientName} — ${booking.serviceName || 'Session'}`;
      }
    }

    const selectedBooking = bookings.find(b => b.id === selectedBookingId);
    await ctx.startSession({
      container: localContainer,
      memoryPolicy: localMemoryPolicy,
      title,
      captureTabAudio,
      ...(localContainer === 'practitioner' && selectedBookingId
        ? { bookingId: selectedBookingId }
        : {}),
      // Attach the durable person the booking already references (spec §6 Phase 1).
      ...(localContainer === 'practitioner' && selectedBooking?.clientId
        ? { clientId: selectedBooking.clientId }
        : {}),
      ...(keepLinkPrivate ? { keepLinkPrivate: true } : {}),
    });
  };

  const handleStopSession = async () => {
    await ctx.stopSession();
  };

  const handleResetSession = () => {
    ctx.resetSession();
    setConsentConfirmed(false);
    setLocalSessionTitle('');
    setSelectedBookingId(null);
    setTranscriptExpanded(false);
  };

  // ── Markers ─────────────────────────────────────────────────────────

  const handleMarkerTap = (markerType: string) => {
    if (showNoteInput && pendingMarkerType === markerType) {
      ctx.addMarker(markerType, markerNote.trim() || undefined);
      setShowNoteInput(false);
      setMarkerNote('');
      setPendingMarkerType(null);
      if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    } else {
      ctx.addMarker(markerType);
      setPendingMarkerType(markerType);
      setShowNoteInput(true);
      setMarkerNote('');
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
      ctx.addMarker(pendingMarkerType, markerNote.trim());
    }
    setShowNoteInput(false);
    setMarkerNote('');
    setPendingMarkerType(null);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
  };

  // ── Ask MAIA ────────────────────────────────────────────────────────

  const handleSendMaiaPrompt = async (promptText?: string) => {
    const text = promptText || maiaPrompt;
    if (!text.trim() || maiaLoading) return;

    setMaiaPrompt('');
    setMaiaLoading(true);

    try {
      await ctx.sendMaiaPrompt(text);
    } catch (err) {
      console.error('[Session Room] Live prompt error:', err);
    } finally {
      setMaiaLoading(false);
    }
  };

  // ── Past sessions ───────────────────────────────────────────────────

  const fetchPastSessions = useCallback(async () => {
    if (pastSessionsLoading) return;
    setPastSessionsLoading(true);
    try {
      const resp = await apiFetch('/api/scribe/sessions');
      const data = await resp.json();
      if (data.sessions) setPastSessions(data.sessions);
    } catch (err) {
      console.error('[Session Room] Failed to load past sessions:', err);
    } finally {
      setPastSessionsLoading(false);
    }
  }, [pastSessionsLoading]);

  const togglePastSessions = useCallback(() => {
    if (!pastSessionsOpen && pastSessions.length === 0) {
      fetchPastSessions();
    }
    setPastSessionsOpen(v => !v);
  }, [pastSessionsOpen, pastSessions.length, fetchPastSessions]);

  const openHistoryReview = useCallback((session: PastSession) => {
    setHistoryReviewId(session.id);
    setHistoryReviewMeta({
      segmentCount: session.segment_count,
      duration: session.duration_seconds,
      assembledTurns: session.assembled_turns,
      hasAssembled: session.has_assembled,
    });
  }, []);

  // Session Room threshold (Step 1): a freshly imported transcript goes straight into
  // review (recognition precedes identification), and the past-sessions list
  // is invalidated so it refetches with the new session included.
  const openImportedReview = useCallback((session: ImportedSessionInfo) => {
    setPastSessions([]);
    setHistoryReviewId(session.id);
    setHistoryReviewMeta({
      segmentCount: session.segmentCount,
      duration: session.durationSeconds,
      assembledTurns: 0,
      hasAssembled: false,
    });
  }, []);

  // ── Export helpers ──────────────────────────────────────────────────

  const buildTranscriptText = () =>
    ctx.segments
      .map(seg => `[${formatDuration(Math.floor(seg.startMs / 1000))}] ${seg.speaker}: ${seg.text}`)
      .join('\n\n');

  const downloadTranscriptTxt = () => {
    const content = buildTranscriptText();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-room-${ctx.sessionId || 'draft'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTranscriptMd = () => {
    const title = ctx.sessionTitle.trim() || 'Untitled Session';
    const date = new Date().toISOString().split('T')[0];
    const dur = formatDuration(ctx.duration);

    const transcriptSection = ctx.segments
      .map(seg => `[${formatDuration(Math.floor(seg.startMs / 1000))}] ${seg.speaker}: ${seg.text}`)
      .join('\n\n');

    const insightsSection = ctx.insights.length > 0
      ? ctx.insights
          .map(i => `### ${i.insightType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}\n${i.content}`)
          .join('\n\n')
      : '_No insights generated during this session._';

    const markersSection = ctx.markers.length > 0
      ? ctx.markers
          .map(m => `- [${formatDuration(Math.floor(m.tsMs / 1000))}] **${m.markerType.replace(/_/g, ' ')}**${m.note ? ` — ${m.note}` : ''}`)
          .join('\n')
      : '_No markers._';

    const maiaSection = ctx.maiaExchanges.length > 0
      ? ctx.maiaExchanges
          .map(e => `**Q:** ${e.prompt}\n**A:** ${e.response}`)
          .join('\n\n')
      : '_No mid-session prompts._';

    const md = `---
date: ${date}
title: "${title}"
container: ${ctx.container}
duration: ${dur}
segments: ${ctx.segments.length}
markers: ${ctx.markers.length}
insights: ${ctx.insights.length}
tags: [session, session-room, soullab]
---

# ${title}

**Date:** ${date}
**Container:** ${ctx.container}
**Duration:** ${dur}
**Segments:** ${ctx.segments.length}

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

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── IDLE PHASE ───────────────────────────────────────────── */}
        {phase === 'idle' && !historyReviewId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto pt-4"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Radio className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Session Room</h1>
              <p className="text-slate-400 text-sm mt-1">
                Live session companion — record, mark moments, text MAIA, review with structured notes
              </p>
            </div>

            {/* Container selector */}
            <div className="mb-5">
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                Container
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CONTAINER_CONFIG) as SessionContainer[]).map(key => {
                  const cfg = CONTAINER_CONFIG[key];
                  const Icon = cfg.icon;
                  const active = localContainer === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setLocalContainer(key);
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
                      <span className="text-[10px] leading-tight text-stone-400">{cfg.description}</span>
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
                        {localContainer === 'witness'
                          ? 'All participants must consent before recording begins. MAIA will observe without taking sides.'
                          : 'Client has consented to this session being recorded for professional review.'}
                      </p>
                      {captureTabAudio && (
                        <p className="text-[11px] text-amber-300/80 mt-1.5">
                          Meeting audio will also be captured — make sure everyone on the
                          call has been told the session is being recorded.
                        </p>
                      )}
                    </div>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Booking picker (practitioner only) */}
            <AnimatePresence>
              {localContainer === 'practitioner' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                    <LinkIcon className="w-3 h-3 inline mr-1" />
                    Link to booking
                  </label>
                  {bookingsLoading ? (
                    <div className="text-xs text-slate-600 py-3 text-center">Loading bookings...</div>
                  ) : bookings.length === 0 ? (
                    <div className="text-xs text-slate-600 py-2">
                      No upcoming bookings found. Recording will be unlinked.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {bookings.map(b => {
                        const selected = selectedBookingId === b.id;
                        const time = new Date(b.startAt).toLocaleTimeString('en-US', {
                          hour: 'numeric', minute: '2-digit', hour12: true,
                        });
                        const day = new Date(b.startAt).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                        });
                        return (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBookingId(selected ? null : b.id)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                              selected
                                ? 'bg-amber-500/15 border-amber-500/40'
                                : 'bg-[#1e1e38] border-slate-800/50 hover:border-slate-700'
                            }`}
                          >
                            <Calendar className={`w-4 h-4 shrink-0 ${selected ? 'text-amber-400' : 'text-slate-600'}`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium truncate ${selected ? 'text-amber-300' : 'text-slate-300'}`}>
                                {b.clientName}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {day} at {time}{b.serviceName ? ` · ${b.serviceName}` : ''}
                              </div>
                            </div>
                            {selected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0">
                                Linked
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <p className="text-[10px] text-slate-600 mt-1">
                        {selectedBookingId
                          ? 'Recording will auto-save to this booking\'s session notes.'
                          : 'Select a booking to link, or leave unlinked for ad-hoc sessions.'}
                      </p>
                    </div>
                  )}
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
                value={localSessionTitle}
                onChange={(e) => setLocalSessionTitle(e.target.value)}
                placeholder={
                  localContainer === 'practitioner' && selectedBookingId
                    ? bookings.find(b => b.id === selectedBookingId)
                      ? `${bookings.find(b => b.id === selectedBookingId)!.clientName} — ${bookings.find(b => b.id === selectedBookingId)!.serviceName || 'Session'}`
                      : `Session — ${new Date().toLocaleDateString()}`
                    : `Session — ${new Date().toLocaleDateString()}`
                }
                className="w-full bg-[#1e1e38] border border-slate-800/50 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            {/* Tab audio capture toggle */}
            <div className="mb-4">
              {displayMediaSupported ? (
                <label className="flex items-start gap-3 p-3 rounded-xl bg-[#1e1e38] border border-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={captureTabAudio}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setCaptureTabAudio(next);
                      if (next) {
                        logMeetingAudioEvent('meeting_audio_toggle_enabled', {
                          container: localContainer,
                        });
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500/50"
                  />
                  <div>
                    <div className="text-sm text-white flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-teal-400" />
                      Add meeting audio
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Recommended: use the browser version of Teams, Zoom, or Meet.
                      Choose the meeting tab and enable &quot;Share tab audio.&quot;
                      Desktop meeting apps may require advanced audio routing.
                    </p>
                  </div>
                </label>
              ) : null}
            </div>

            {/* Session Support (AI participation) */}
            <div className="mb-6">
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                Session Support
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSessionSupport(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all ${
                    !sessionSupport
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                      : 'bg-[#1e1e38] border-slate-800/50 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Off
                </button>
                <button
                  onClick={() => setSessionSupport(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all ${
                    sessionSupport
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                      : 'bg-[#1e1e38] border-slate-800/50 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  On
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">
                {sessionSupport
                  ? 'MAIA may assist with reflection and follow-up'
                  : 'No AI support during this session'}
              </p>
            </div>

            {/* Memory policy */}
            <div className="mb-6">
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">
                Memory policy
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalMemoryPolicy('sealed')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all ${
                    localMemoryPolicy === 'sealed'
                      ? 'bg-slate-800/60 border-slate-700 text-white'
                      : 'bg-[#1e1e38] border-slate-800/50 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sealed
                </button>
                <button
                  onClick={() => setLocalMemoryPolicy('learning')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all ${
                    localMemoryPolicy === 'learning'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-[#1e1e38] border-slate-800/50 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Learning
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">
                {localMemoryPolicy === 'sealed'
                  ? 'Summary only — no long-term pattern learning from this session'
                  : 'Session contributes to your longitudinal patterns and growth tracking'}
              </p>
            </div>

            {/* Relationship Memory (Phase 1): client link + stricter-sanctuary opt-out */}
            {localContainer === 'practitioner' && selectedBookingId && (
              <div className="mb-6">
                <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                  {localMemoryPolicy === 'sealed'
                    ? 'Sealed: this session can remain attached to the client record for continuity of care, but its content will not be remembered or used in future preparation.'
                    : 'This session will be linked to the client record for continuity.'}
                </p>
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepLinkPrivate}
                    onChange={(e) => setKeepLinkPrivate(e.target.checked)}
                    className="rounded border-slate-700 bg-[#1e1e38] accent-amber-500"
                  />
                  Keep even the client link private for this session
                </label>
              </div>
            )}

            {/* Open video call — shown when a video room URL is configured in Settings → Integrations.
                Annotated so practitioners understand this JOINS the external meeting and can
                double-join if they are already in the call. */}
            {videoRoomUrl && (
              <div className="mb-3">
                <a
                  href={videoRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/40 text-slate-300 hover:border-slate-600 hover:text-white transition-all text-sm"
                >
                  <Video className="w-4 h-4" />
                  Open meeting{' '}
                  <span className="text-slate-500">(joins as another participant)</span>
                </a>
                <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>
                    Opens the meeting link from Settings &rarr; Integrations. If you&apos;re already
                    in the call (especially in a desktop app), this adds you a second time &mdash;
                    skip it and keep your existing window.
                  </span>
                </p>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={handleStartSession}
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

            {ctx.tabAudioError && (
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-200/90 flex-1">{ctx.tabAudioError}</p>
                  <button
                    onClick={() => {
                      ctx.clearTabAudioError();
                      setBlockedFeedbackSent(false);
                    }}
                    className="text-[10px] uppercase tracking-wider text-amber-300/70 hover:text-amber-200"
                  >
                    Dismiss
                  </button>
                </div>
                {!blockedFeedbackSent ? (
                  <button
                    onClick={() => {
                      setBlockedFeedbackSent(true);
                      logMeetingAudioEvent('meeting_audio_blocked_feedback');
                    }}
                    className="mt-1.5 ml-5.5 text-[11px] text-amber-300/70 hover:text-amber-200 underline-offset-2 hover:underline"
                  >
                    Using a desktop meeting app? Let us know this didn&apos;t work.
                  </button>
                ) : (
                  <p className="mt-1.5 ml-5.5 text-[11px] text-amber-300/60 italic">
                    Thanks — noted.
                  </p>
                )}
              </div>
            )}

            <p className="text-center text-xs text-slate-600 mt-3">
              Your browser will request microphone access.
              {captureTabAudio && ' You\'ll also be asked to pick a meeting tab — remember to enable "Share tab audio".'}
              {' '}All transcription runs locally.
            </p>

            {/* Past sessions + transcript import */}
            <div className="mt-8 border-t border-slate-800/50 pt-6">
              <button
                onClick={togglePastSessions}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors w-full"
              >
                <History className="w-4 h-4" />
                <span>{pastSessionsOpen ? 'Hide' : 'Show'} past sessions</span>
                {pastSessions.length > 0 && (
                  <span className="ml-auto text-xs text-slate-600">{pastSessions.length} sessions</span>
                )}
              </button>

              <AnimatePresence>
                {pastSessionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    {pastSessionsLoading ? (
                      <p className="text-xs text-slate-600 text-center py-4">Loading…</p>
                    ) : pastSessions.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-4">No past sessions found.</p>
                    ) : (
                      <div className="space-y-2">
                        {pastSessions.map((s) => {
                          const startDate = new Date(s.started_at);
                          const durMin = Math.floor(s.duration_seconds / 60);
                          const durSec = s.duration_seconds % 60;
                          const label = s.client_name || s.title || `${s.container.charAt(0).toUpperCase() + s.container.slice(1)} session`;
                          const eligibility = getReviewEligibility(s);
                          const statusBadge = getSessionStatusBadge(s);
                          return (
                            <div
                              key={s.id}
                              className="flex items-center gap-3 p-3 bg-[#1e1e38] border border-slate-800/50 rounded-xl"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{label}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-xs text-slate-500">
                                    {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="text-xs text-slate-600">·</span>
                                  <span className="text-xs text-slate-500">
                                    {durMin > 0 ? `${durMin}m ` : ''}{durSec}s
                                  </span>
                                  <span className="text-xs text-slate-600">·</span>
                                  {s.has_assembled ? (
                                    <span className="text-xs text-teal-500/80">{s.assembled_turns} turns</span>
                                  ) : s.segment_count > 0 ? (
                                    <span className="text-xs text-slate-500">{s.segment_count} segments</span>
                                  ) : null}
                                  {s.marker_count > 0 && (
                                    <>
                                      <span className="text-xs text-slate-600">·</span>
                                      <span className="text-xs text-amber-600">{s.marker_count} markers</span>
                                    </>
                                  )}
                                  {statusBadge && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ml-1 ${statusBadge.color}`}>
                                      {statusBadge.text}
                                    </span>
                                  )}
                                  {!s.transcript_enabled && (
                                    <span title="Transcript not enabled"><AlertCircle className="w-3 h-3 text-orange-500/60 ml-auto flex-shrink-0" /></span>
                                  )}
                                </div>
                              </div>
                              {eligibility.allowed ? (
                                <button
                                  onClick={() => openHistoryReview(s)}
                                  className="flex-shrink-0 px-3 py-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs rounded-lg hover:bg-teal-500/25 transition-colors"
                                >
                                  Review
                                </button>
                              ) : (
                                <span
                                  className="flex-shrink-0 px-3 py-1.5 bg-slate-800/50 border border-slate-700/30 text-slate-600 text-xs rounded-lg cursor-not-allowed"
                                  title={eligibility.message || 'Cannot review this session'}
                                >
                                  {eligibility.reason === 'no_segments' || eligibility.reason === 'no_transcript'
                                    ? 'Empty'
                                    : eligibility.reason === 'session_too_short'
                                    ? 'Too short'
                                    : 'N/A'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Session Room threshold (Step 1) — bring an existing transcript into review */}
              <TranscriptImportPanel onImported={openImportedReview} />
            </div>
          </motion.div>
        )}

        {/* ── HISTORY REVIEW (past session opened from idle) ─────────── */}
        {phase === 'idle' && historyReviewId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto pt-4"
          >
            <button
              onClick={() => setHistoryReviewId(null)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to session setup
            </button>

            {/* Guard: only show review chat if session has reviewable content (segments or assembled turns) */}
            {(historyReviewMeta.segmentCount > 0 || (historyReviewMeta.hasAssembled && historyReviewMeta.assembledTurns > 0)) ? (
              <SessionReviewChat
                reviewedSessionId={historyReviewId}
                segmentCount={historyReviewMeta.segmentCount || historyReviewMeta.assembledTurns}
                duration={historyReviewMeta.duration}
              />
            ) : (
              <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500/60 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-white mb-2">Session cannot be reviewed</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  This session has no transcript segments. The recording may not have captured audio,
                  or transcription may have failed.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setHistoryReviewId(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded-lg hover:text-white transition-colors"
                  >
                    Return to sessions
                  </button>
                </div>
              </div>
            )}
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
                  {CONTAINER_CONFIG[ctx.container].label}
                </span>
                {ctx.sessionTitle && (
                  <span className="text-slate-500 font-normal ml-1">— {ctx.sessionTitle}</span>
                )}
              </h1>

              <div className="flex items-center gap-3">
                {/* Audio level */}
                <div className="hidden sm:flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500"
                      animate={{ width: `${ctx.audioLevels.combined * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  {ctx.hasTabAudio && (
                    <span className="text-[10px] text-teal-400 px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                      Tab
                    </span>
                  )}
                </div>

                {/* Duration */}
                <span className="text-sm font-medium text-amber-400">
                  {formatDuration(ctx.duration)}
                </span>

                {/* Connection status */}
                <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                  ctx.connectionStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : ctx.connectionStatus === 'connecting'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    ctx.connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-current'
                  }`} />
                  {ctx.connectionStatus}
                </div>

                {/* Pause / Resume */}
                <button
                  onClick={ctx.isPaused ? ctx.resumeSession : ctx.pauseSession}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs hover:bg-slate-700 transition-all"
                >
                  {ctx.isPaused ? (
                    <><Play className="w-3 h-3" /> Resume</>
                  ) : (
                    <><Pause className="w-3 h-3" /> Pause</>
                  )}
                </button>

                {/* Stop */}
                <button
                  onClick={handleStopSession}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  Stop
                </button>
              </div>
            </div>

            {/* Audio sources — frames capture as a positive checklist of what MAIA can hear,
                driven by the reactive ctx.hasTabAudio (false when meeting audio was never
                shared AND when a shared tab stops mid-session). Display only — does not touch
                capture, consent, Sanctuary, or transcription. */}
            <AudioSourcesStatus hasTabAudio={ctx.hasTabAudio} />

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
                    {ctx.segments.length > 0 && (
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
                    {ctx.segments.length === 0 ? (
                      <div className="text-center py-20 text-slate-600 text-sm">
                        {ctx.isPaused ? 'Recording paused...' : 'Listening for speech...'}
                      </div>
                    ) : (
                      ctx.segments.map((seg) => (
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
                    { key: 'markers' as RailTab, label: 'Markers', icon: Tag, count: ctx.markers.length },
                    { key: 'maia' as RailTab, label: 'Ask MAIA', icon: MessageCircle, count: ctx.maiaExchanges.length },
                    { key: 'insights' as RailTab, label: 'Insights', icon: Eye, count: ctx.insights.length },
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
                        {ctx.markers.length === 0 ? (
                          <p className="text-xs text-slate-600 text-center py-8">
                            Tap a button to mark a moment
                          </p>
                        ) : (
                          ctx.markers.slice(0, 20).map(m => (
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
                            onClick={() => handleSendMaiaPrompt(qp.prompt)}
                            disabled={maiaLoading}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[10px] text-slate-400 hover:text-teal-300 hover:border-teal-500/30 transition-all disabled:opacity-40"
                          >
                            {qp.label}
                          </button>
                        ))}
                      </div>

                      {/* Exchanges */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 mb-3">
                        {ctx.maiaExchanges.length === 0 && !maiaLoading ? (
                          <p className="text-xs text-slate-600 text-center py-8">
                            Ask MAIA a question about this session
                          </p>
                        ) : (
                          ctx.maiaExchanges.map(ex => (
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
                              handleSendMaiaPrompt();
                            }
                          }}
                          placeholder="Ask about this session..."
                          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                        />
                        <button
                          onClick={() => handleSendMaiaPrompt()}
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
                        {ctx.insights.length === 0 ? (
                          <div className="text-center py-20 text-slate-600 text-sm">
                            Insights will appear as patterns emerge...
                          </div>
                        ) : (
                          ctx.insights.map((insight) => (
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
                              <p className="text-sm leading-relaxed text-stone-200">
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
        {phase === 'review' && ctx.sessionId && (
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
                    {ctx.segments.length} segments &middot; {formatDuration(ctx.duration)} &middot; {ctx.markers.length} marker{ctx.markers.length !== 1 ? 's' : ''} &middot; {ctx.insights.length} insight{ctx.insights.length !== 1 ? 's' : ''}
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-500">
                      {CONTAINER_CONFIG[ctx.container].label}
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
                  <button
                    onClick={() => {
                      const title = ctx.sessionTitle || 'Session';
                      const summary = `${ctx.segments.length} segments, ${formatDuration(ctx.duration)}, ${ctx.markers.length} marker${ctx.markers.length !== 1 ? 's' : ''}, ${ctx.insights.length} insight${ctx.insights.length !== 1 ? 's' : ''}`;
                      circleOffer.offerToCircle('session', ctx.sessionId || `session-${Date.now()}`, title, summary);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-500/20 text-amber-400/80 text-xs hover:bg-amber-500/10 transition-all"
                    title="Offer session summary to a circle"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Offer
                  </button>
                </div>
              </div>
            </div>

            {/* Markers timeline */}
            {ctx.markers.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setMarkersExpanded(!markersExpanded)}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-2"
                >
                  {markersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Session markers ({ctx.markers.length})
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
                        {[...ctx.markers].reverse().map(m => (
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
            {ctx.maiaExchanges.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Mid-session MAIA exchanges ({ctx.maiaExchanges.length})
                </h3>
                <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {ctx.maiaExchanges.map(ex => (
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
                {transcriptExpanded ? 'Collapse transcript' : `View transcript (${ctx.segments.length} segments)`}
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
                      {ctx.segments.map((seg, idx) => (
                        <div key={seg.id} className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/20">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-amber-400 uppercase">{seg.speaker}</span>
                            <span className="text-xs text-slate-600">{formatDuration(Math.floor(seg.startMs / 1000))}</span>
                          </div>
                          <p className="text-sm text-slate-300">{cleanedSegmentTexts[idx] ?? seg.text}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MAIA Review Chat — only if segments exist */}
            {ctx.segments.length > 0 ? (
              <SessionReviewChat
                reviewedSessionId={ctx.scribeSessionId || ctx.sessionId}
                segmentCount={ctx.segments.length}
                duration={ctx.duration}
                caseId={caseId}
              />
            ) : (
              <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500/60 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-white mb-2">No transcript captured</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This session recorded for {formatDuration(ctx.duration)} but no transcript segments were captured.
                  This may happen if microphone access was blocked or audio was too quiet.
                </p>
              </div>
            )}

            {/* New session button */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={handleResetSession}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-sm hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                New Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>

      <ShareToCircleModal
        open={circleOffer.open}
        onClose={() => circleOffer.setOpen(false)}
        artifactType={circleOffer.artifact.type}
        artifactRef={circleOffer.artifact.ref}
        defaultTitle={circleOffer.artifact.title}
        defaultSummary={circleOffer.artifact.summary}
      />
    </div>
  );
}
