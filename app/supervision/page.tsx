'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  History,
  Settings,
  Upload,
  Loader2,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';
import {
  SupervisionRecorder,
  TranscriptViewer,
  InsightPanel
} from '@/components/supervision';
import InsightsViewer from '@/components/supervision/InsightsViewer';
import PracticePanel from '@/components/supervision/PracticePanel';

interface TranscriptSegment {
  id: string;
  speaker: string;
  speakerConfidence?: number;
  startMs: number;
  endMs: number;
  text: string;
  confidence?: number;
}

type InsightType = 'pattern' | 'countertransference' | 'intervention' | 'stuck_point' | 'rupture' | 'attunement' | 'documentation' | 'recommendation';

interface Insight {
  id: string;
  type: InsightType;
  content: string;
  significance?: number;
  timeRange?: { startMs: number | null; endMs: number | null };
  modelUsed?: string;
  createdAt: string;
}

interface SessionSummary {
  id: string;
  title: string | null;
  sessionType: string;
  startedAt: string;
  endedAt: string | null;
  processingStatus: string;
  totalDurationMs: number | null;
  speakerCount: number | null;
}

type ViewMode = 'live' | 'history';
type SupervisionMode = 'clinical' | 'practice';

// Unified insight type for SSE and history modes
// Uses explicit optional fields so that `Insight` is assignable without casts
type InsightLike = {
  id: string;
  // segment anchors (preferred over time - exact jump)
  segment_refs?: string[] | null;
  segmentRefs?: string[];
  segmentId?: string;
  segment_id?: string;
  // snake_case variants (from DB/SSE)
  time_range_start_ms?: number;
  time_range_end_ms?: number;
  start_ms?: number;
  // camelCase variants (from transformed payloads)
  timeRangeStartMs?: number;
  timeRangeEndMs?: number;
  startMs?: number;
  // content fields (for detail panel)
  title?: string;
  summary?: string;
  kind?: string;
  insight_type?: string;
  type?: string;
  body?: string;
  content?: string;
  text?: string;
  message?: string;
  created_at?: string;
  createdAt?: string;
  timestamp?: string;
  // timeRange from local Insight type
  timeRange?: { startMs: number | null; endMs: number | null };
};

// Parse segmentRefs reliably (handles ["a"], "{a,b}", "a,b", etc.)
function parseSegmentRefs(raw: unknown): string[] {
  if (!raw) return [];

  // Already an array
  if (Array.isArray(raw)) {
    return raw.map(String).map(s => s.trim()).filter(Boolean);
  }

  if (typeof raw !== 'string') return [];

  const s = raw.trim();
  if (!s) return [];

  // JSON array as string: '["a","b"]'
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map(x => x.trim()).filter(Boolean);
      }
    } catch {
      // fall through
    }
  }

  // Postgres array literal: '{a,b}' or '{"a","b"}'
  if (s.startsWith('{') && s.endsWith('}')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];

    const out: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];

      if (ch === '"' && inner[i - 1] !== '\\') {
        inQuotes = !inQuotes;
        continue;
      }

      if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
        continue;
      }

      cur += ch;
    }
    if (cur) out.push(cur);

    return out
      .map(x => x.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'))
      .map(x => x.trim())
      .filter(Boolean);
  }

  // Comma-separated fallback: 'a,b'
  if (s.includes(',')) {
    return s.split(',').map(x => x.trim()).filter(Boolean);
  }

  // Single id string
  return [s];
}

function getInsightSegmentId(i: InsightLike): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insight = i as any;
  const direct = insight?.segmentId ?? insight?.segment_id ?? null;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const refsRaw = insight?.segmentRefs ?? insight?.segment_refs ?? null;
  const refs = parseSegmentRefs(refsRaw);
  return refs[0] ?? null;
}

function getInsightStartMs(i: InsightLike): number | null {
  // Check timeRange object first (local Insight type)
  if (i.timeRange?.startMs != null) {
    return i.timeRange.startMs;
  }

  const raw =
    i.time_range_start_ms ??
    i.timeRangeStartMs ??
    i.start_ms ??
    i.startMs ??
    null;

  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function SupervisionDashboard() {
  const [supervisionMode, setSupervisionMode] = useState<SupervisionMode>('clinical');
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [insights, setInsights] = useState<Record<string, Insight[]>>({});
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [pastSessions, setPastSessions] = useState<SessionSummary[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedInsightId, setSelectedInsightId] = useState<string | undefined>();
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState<string | null>(null);
  const [liveInsights, setLiveInsights] = useState<InsightLike[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<InsightLike | null>(null);
  const [selectedPracticeInsight, setSelectedPracticeInsight] = useState<{
    id: string;
    content: string;
    insight_type: string;
    world_code: string;
  } | null>(null);

  // Transcript jump state (segmentId preferred, ms as fallback)
  const [jumpToSegmentId, setJumpToSegmentId] = useState<string | null>(null);
  const [jumpToMs, setJumpToMs] = useState<number | null>(null);
  const [jumpNonce, setJumpNonce] = useState(0);

  // Fetch past sessions
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch(apiUrl('/api/supervision/sessions?limit=20'), {
        cache: 'no-store'
      });
      const data = await response.json();
      if (data.success) {
        setPastSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Fetch insights for active session
  const fetchInsights = useCallback(async (sessionId: string) => {
    setIsLoadingInsights(true);
    try {
      const response = await fetch(apiUrl(`/api/supervision/insights?sessionId=${sessionId}`));
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights || {});
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  // Load past sessions on mount
  useEffect(() => {
    if (viewMode === 'history') {
      fetchSessions();
    }
  }, [viewMode, fetchSessions]);

  // Reset insight selection when session changes
  useEffect(() => {
    setSelectedInsightId(undefined);
    setSelectedInsight(null);
    setLiveInsights([]);
    setJumpToSegmentId(null);
    setJumpToMs(null);
    setJumpNonce(0);
  }, [activeSessionId]);

  // Handle session start
  const handleSessionStart = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsRecording(true);
    setInsights({});
  };

  // Handle session stop
  const handleSessionStop = async (sessionId: string) => {
    setIsRecording(false);
    // Fetch final insights after processing
    setTimeout(() => fetchInsights(sessionId), 2000);
  };

  // Handle insight click to highlight related transcript + jump to segment/time
  const handleInsightClick = (insight: InsightLike) => {
    setSelectedInsightId(insight.id);
    setSelectedInsight(insight);

    // Prefer segment anchor (exact jump) over time anchor (closest match)
    const segId = getInsightSegmentId(insight);
    if (segId) {
      setJumpToSegmentId(segId);
      setJumpToMs(null);
      setJumpNonce((n) => n + 1);
      return;
    }

    const startMs = getInsightStartMs(insight);
    if (startMs !== null) {
      setJumpToSegmentId(null);
      setJumpToMs(startMs);
      setJumpNonce((n) => n + 1);
    }
  };

  // Compute the opened insight from either live or history source
  const openedInsight = useMemo(() => {
    // Flatten history insights (Record<string, Insight[]>) to array
    const historyFlat = Object.values(insights).flat();
    const source = isRecording ? liveInsights : historyFlat;
    const fromList = selectedInsightId
      ? source.find((x) => (x as { id?: string })?.id === selectedInsightId)
      : null;

    // Prefer the newest from the list (has freshest body), fallback to last clicked object
    return fromList ?? selectedInsight;
  }, [isRecording, liveInsights, insights, selectedInsightId, selectedInsight]);

  // Cast to InsightLike for field access (InsightLike has all optional field variants)
  const insightData = openedInsight as InsightLike | null;

  const openedTitle =
    insightData?.title ??
    insightData?.summary ??
    insightData?.kind ??
    insightData?.insight_type ??
    insightData?.type ??
    'Insight';

  const openedBody =
    insightData?.body ??
    insightData?.content ??
    insightData?.text ??
    insightData?.message ??
    '';

  const openedCreated =
    insightData?.created_at ??
    insightData?.createdAt ??
    insightData?.timestamp ??
    null;

  // Load session from history (TranscriptViewer handles its own fetching)
  const loadSession = async (sessionId: string) => {
    setSelectedHistorySessionId(sessionId);
    // Fetch insights (transcript is self-managed by TranscriptViewer)
    await fetchInsights(sessionId);
  };

  // Format duration
  const formatDuration = (ms: number | null) => {
    if (!ms) return '—';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-xl border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-amber-500" />
              <h1 className="text-xl font-semibold">
                {supervisionMode === 'clinical' ? 'Clinical Supervision' : 'Practice Development'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Supervision Mode Toggle (Clinical vs Practice) */}
              <div className="flex items-center gap-1 bg-stone-800/50 rounded-lg p-1">
                <button
                  onClick={() => setSupervisionMode('clinical')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    supervisionMode === 'clinical'
                      ? 'bg-emerald-600 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Clinical
                </button>
                <button
                  onClick={() => setSupervisionMode('practice')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    supervisionMode === 'practice'
                      ? 'bg-violet-600 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Practice
                </button>
              </div>

              {/* View Mode Toggle (Live vs History) */}
              <div className="flex items-center gap-1 bg-stone-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('live')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === 'live'
                      ? 'bg-amber-600 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Live
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === 'history'
                      ? 'bg-amber-600 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'live' ? (
          /* Live Recording Mode */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Recorder + Transcript */}
            <div className="lg:col-span-2 space-y-6">
              <SupervisionRecorder
                onSessionStart={handleSessionStart}
                onSessionStop={handleSessionStop}
              />

              {/* Live Transcript */}
              <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-stone-200 mb-4">
                  Live Transcript
                </h3>
                <TranscriptViewer
                  sessionId={activeSessionId}
                  isLive={isRecording}
                  pollIntervalMs={1000}
                  maxHeight="500px"
                  jumpToSegmentId={jumpToSegmentId}
                  jumpToMs={jumpToMs}
                  jumpNonce={jumpNonce}
                />
              </div>
            </div>

            {/* Right: Insights (Clinical or Practice based on mode) */}
            <div className="space-y-6">
              {supervisionMode === 'clinical' ? (
                /* Clinical Insights */
                <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-stone-200 mb-4">
                    Clinical Insights
                  </h3>
                  {activeSessionId ? (
                    isRecording ? (
                      <InsightsViewer
                        sessionId={activeSessionId}
                        isLive={true}
                        onInsightsChange={setLiveInsights}
                        onInsightClick={handleInsightClick}
                        selectedInsightId={selectedInsightId}
                      />
                    ) : (
                      <InsightPanel
                        insights={insights}
                        isLoading={isLoadingInsights}
                        onInsightClick={handleInsightClick}
                        selectedInsightId={selectedInsightId}
                      />
                    )
                  ) : (
                    <div className="text-stone-500 text-sm">
                      Start a session to see live insights.
                    </div>
                  )}

                  {/* Clinical Insight Detail Panel */}
                  {openedInsight ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-stone-100 text-sm font-medium capitalize">
                            {String(openedTitle).replace(/_/g, ' ')}
                          </div>
                          {openedCreated && (
                            <div className="text-stone-500 text-xs mt-1">
                              {new Date(String(openedCreated)).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 text-stone-200 text-sm whitespace-pre-wrap">
                        {openedBody ? (
                          String(openedBody)
                        ) : (
                          <pre className="text-stone-300 text-xs whitespace-pre-wrap">
                            {JSON.stringify(openedInsight, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ) : activeSessionId ? (
                    <div className="mt-4 text-stone-500 text-sm">
                      Click an insight to view details.
                    </div>
                  ) : null}
                </div>
              ) : (
                /* Practice Development Insights */
                <div className="bg-stone-900/80 backdrop-blur-xl border border-violet-700/30 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-stone-200 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    Practice Insights
                  </h3>
                  <PracticePanel
                    sessionId={activeSessionId}
                    onInsightClick={(insight) => setSelectedPracticeInsight(insight)}
                    selectedInsightId={selectedPracticeInsight?.id}
                  />

                  {/* Practice Insight Detail Panel */}
                  {selectedPracticeInsight && (
                    <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-violet-300 text-xs font-medium uppercase tracking-wide">
                            {selectedPracticeInsight.world_code.replace(/_/g, ' ')}
                          </div>
                          <div className="text-stone-100 text-sm font-medium capitalize mt-1">
                            {selectedPracticeInsight.insight_type.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-stone-200 text-sm whitespace-pre-wrap">
                        {selectedPracticeInsight.content}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* HIPAA Notice */}
              <div className={`${supervisionMode === 'clinical' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-violet-500/10 border-violet-500/30'} border rounded-xl p-4`}>
                <h4 className={`text-sm font-medium ${supervisionMode === 'clinical' ? 'text-emerald-400' : 'text-violet-400'} mb-1`}>
                  {supervisionMode === 'clinical' ? 'HIPAA Compliant' : 'Local Processing'}
                </h4>
                <p className="text-xs text-stone-400">
                  All audio capture, transcription, and analysis occurs locally.
                  No patient data is sent to external servers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* History Mode */
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left: Session List */}
            <div className="lg:col-span-1">
              <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-stone-200">Past Sessions</h3>
                  <button
                    onClick={fetchSessions}
                    className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    {isLoadingSessions ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <History className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {pastSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedHistorySessionId === session.id
                          ? 'bg-amber-500/20 border border-amber-500/30'
                          : 'bg-stone-800/50 hover:bg-stone-800/80 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm text-stone-200 truncate">
                        {session.title || 'Untitled Session'}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                        <span>{formatDate(session.startedAt)}</span>
                        <span>•</span>
                        <span>{formatDuration(session.totalDurationMs)}</span>
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          session.processingStatus === 'complete'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : session.processingStatus === 'error'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {session.processingStatus}
                        </span>
                      </div>
                    </button>
                  ))}

                  {pastSessions.length === 0 && !isLoadingSessions && (
                    <p className="text-sm text-stone-500 text-center py-8">
                      No sessions yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Transcript */}
            <div className="lg:col-span-2">
              <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-stone-200 mb-4">
                  Session Transcript
                </h3>
                <TranscriptViewer
                  sessionId={selectedHistorySessionId}
                  isLive={false}
                  maxHeight="600px"
                  jumpToSegmentId={jumpToSegmentId}
                  jumpToMs={jumpToMs}
                  jumpNonce={jumpNonce}
                />
              </div>
            </div>

            {/* Right: Insights (Clinical or Practice based on mode) */}
            <div className="lg:col-span-1">
              {supervisionMode === 'clinical' ? (
                <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-stone-200 mb-4">
                    Clinical Insights
                  </h3>
                  <InsightPanel
                    insights={insights}
                    isLoading={isLoadingInsights}
                    onInsightClick={handleInsightClick}
                    selectedInsightId={selectedInsightId}
                  />
                </div>
              ) : (
                <div className="bg-stone-900/80 backdrop-blur-xl border border-violet-700/30 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-stone-200 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    Practice Insights
                  </h3>
                  <PracticePanel
                    sessionId={selectedHistorySessionId}
                    onInsightClick={(insight) => setSelectedPracticeInsight(insight)}
                    selectedInsightId={selectedPracticeInsight?.id}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Notice */}
      <footer className="mt-auto py-4 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-xs text-stone-500">
            Clinical Supervision powered by local AI (Ollama/DeepSeek).
            Audio transcription via local Whisper. All data stored locally.
          </p>
        </div>
      </footer>
    </div>
  );
}
