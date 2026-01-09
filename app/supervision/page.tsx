'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  History,
  Settings,
  Upload,
  Loader2
} from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';
import {
  SupervisionRecorder,
  TranscriptViewer,
  InsightPanel
} from '@/components/supervision';

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

export default function SupervisionDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [insights, setInsights] = useState<Record<string, Insight[]>>({});
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [pastSessions, setPastSessions] = useState<SessionSummary[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedInsightId, setSelectedInsightId] = useState<string | undefined>();

  // Fetch past sessions
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch(apiUrl('/api/supervision/sessions?limit=20'));
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

  // Handle session start
  const handleSessionStart = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setTranscript([]);
    setInsights({});
  };

  // Handle session stop
  const handleSessionStop = async (sessionId: string) => {
    // Fetch final insights after processing
    setTimeout(() => fetchInsights(sessionId), 2000);
  };

  // Handle transcript updates (real-time)
  const handleTranscriptUpdate = (segments: TranscriptSegment[]) => {
    setTranscript(segments);
    // Periodically fetch insights during recording
    if (activeSessionId && segments.length > 0 && segments.length % 10 === 0) {
      fetchInsights(activeSessionId);
    }
  };

  // Handle insight click to highlight related transcript
  const handleInsightClick = (insight: Insight) => {
    setSelectedInsightId(insight.id);
    // Could also scroll transcript to the relevant time range
  };

  // Load session from history
  const loadSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsLoadingInsights(true);

    try {
      // Fetch transcript
      const transcriptRes = await fetch(apiUrl(`/api/supervision/transcript?sessionId=${sessionId}`));
      const transcriptData = await transcriptRes.json();
      if (transcriptData.success) {
        setTranscript(transcriptData.transcript || []);
      }

      // Fetch insights
      await fetchInsights(sessionId);
    } catch (err) {
      console.error('Failed to load session:', err);
    }
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
              <h1 className="text-xl font-semibold">Clinical Supervision</h1>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-stone-800/50 rounded-lg p-1">
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
                onTranscriptUpdate={handleTranscriptUpdate}
              />

              {/* Live Transcript */}
              <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-stone-200 mb-4">
                  Live Transcript
                </h3>
                <TranscriptViewer
                  segments={transcript}
                  isLive={!!activeSessionId}
                  maxHeight="500px"
                />
              </div>
            </div>

            {/* Right: Insights */}
            <div className="space-y-6">
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

              {/* HIPAA Notice */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <h4 className="text-sm font-medium text-emerald-400 mb-1">
                  HIPAA Compliant
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
                        activeSessionId === session.id
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
                  segments={transcript}
                  isLive={false}
                  maxHeight="600px"
                />
              </div>
            </div>

            {/* Right: Insights */}
            <div className="lg:col-span-1">
              <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-stone-200 mb-4">
                  Insights
                </h3>
                <InsightPanel
                  insights={insights}
                  isLoading={isLoadingInsights}
                  onInsightClick={handleInsightClick}
                  selectedInsightId={selectedInsightId}
                />
              </div>
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
