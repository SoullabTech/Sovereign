'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Mic, Square, Radio, BookOpen, Sparkles, Clock } from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';

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

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export default function ScribePage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [insights, setInsights] = useState<LiveInsight[]>([]);
  const [showInsights, setShowInsights] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start session
  const startSession = async () => {
    try {
      const response = await fetch(apiUrl('/api/supervision/session/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'live_scribe',
          title: `Live Scribe - ${new Date().toLocaleDateString()}`
        })
      });

      const data = await response.json();
      if (data.success && data.session?.id) {
        setSessionId(data.session.id);
        setIsRecording(true);
        setSegments([]);
        setInsights([]);
        setSessionDuration(0);

        // Start duration counter
        durationIntervalRef.current = setInterval(() => {
          setSessionDuration(d => d + 1);
        }, 1000);

        // Connect to live scribe stream
        connectToStream(data.session.id);
      }
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  // Stop session
  const stopSession = async () => {
    if (!sessionId) return;

    // Disconnect stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Stop duration counter
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    try {
      await fetch(apiUrl('/api/supervision/session/stop'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          triggerAnalysis: true,
          totalDurationMs: sessionDuration * 1000
        })
      });

      setIsRecording(false);
      setConnectionStatus('disconnected');
    } catch (err) {
      console.error('Failed to stop session:', err);
    }
  };

  // Connect to live scribe SSE stream
  const connectToStream = useCallback((sid: string) => {
    setConnectionStatus('connecting');

    const url = apiUrl(`/api/supervision/scribe?sessionId=${sid}`);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus('connected');
    };

    es.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      console.log('[SCRIBE] Connected:', data);
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
      console.log('[SCRIBE] Incremental analysis started');
    });

    es.addEventListener('analysis_complete', (e) => {
      const data = JSON.parse(e.data);
      console.log('[SCRIBE] Analysis complete:', data);
    });

    es.addEventListener('session_ended', () => {
      setIsRecording(false);
      setConnectionStatus('disconnected');
    });

    es.onerror = () => {
      setConnectionStatus('disconnected');
      // Attempt reconnect after 3s
      setTimeout(() => {
        if (isRecording && sessionId) {
          connectToStream(sessionId);
        }
      }, 3000);
    };
  }, [isRecording, sessionId]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get insight type color
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

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab Tools
          </button>

          {isRecording && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">
                  {formatDuration(sessionDuration)}
                </span>
              </div>
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
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Mic className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-medium text-white mb-2">Live Scribe</h1>
          <p className="text-gray-500 text-sm">
            Real-time transcription with MAIA insights
          </p>
        </div>

        {/* Main Content */}
        {!isRecording && !sessionId ? (
          /* Start Button */
          <div className="text-center py-8">
            <button
              onClick={startSession}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
            >
              <Mic className="w-5 h-5" />
              Start Session
            </button>
          </div>
        ) : (
          /* Recording View */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Transcript Column */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Live Transcript
                  </h2>
                  {isRecording && (
                    <button
                      onClick={stopSession}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all"
                    >
                      <Square className="w-3 h-3" />
                      Stop
                    </button>
                  )}
                </div>

                <div className="h-[400px] overflow-y-auto space-y-3 pr-2">
                  {segments.length === 0 ? (
                    <div className="text-center py-16 text-gray-600 text-sm">
                      {isRecording
                        ? 'Waiting for speech...'
                        : 'Session transcript will appear here'}
                    </div>
                  ) : (
                    segments.map((seg) => (
                      <div
                        key={seg.id}
                        className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-amber-400 uppercase">
                            {seg.speaker}
                          </span>
                          <span className="text-xs text-gray-600">
                            {formatDuration(Math.floor(seg.startMs / 1000))}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{seg.text}</p>
                      </div>
                    ))
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </div>

            {/* Insights Column */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    MAIA Insights
                  </h2>
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className={`text-xs px-2 py-1 rounded ${
                      showInsights
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {showInsights ? 'Live' : 'Paused'}
                  </button>
                </div>

                <div className="h-[400px] overflow-y-auto space-y-3 pr-2">
                  {insights.length === 0 ? (
                    <div className="text-center py-16 text-gray-600 text-sm">
                      {isRecording
                        ? 'Insights will appear as patterns emerge...'
                        : 'No insights generated'}
                    </div>
                  ) : (
                    insights.map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-3 rounded-lg border ${getInsightColor(insight.insightType)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium uppercase">
                            {insight.insightType.replace(/_/g, ' ')}
                          </span>
                          {insight.significance && insight.significance > 0.7 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">
                              High
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed opacity-90">
                          {insight.content.slice(0, 200)}
                          {insight.content.length > 200 && '...'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Session Complete - Show Essence Link */}
              {!isRecording && sessionId && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h3 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Session Complete
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    View the full session synthesis and insights.
                  </p>
                  <button
                    onClick={() => router.push('/supervision')}
                    className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-all"
                  >
                    View Session Summary
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
