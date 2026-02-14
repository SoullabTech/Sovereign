'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Square,
  Radio,
  BookOpen,
  Sparkles,
  Clock,
  Upload,
  Waves,
  Settings,
  Pause,
  Play,
  Volume2,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl, apiFetch } from '@/lib/http/apiBase';
import { useAudioCapture, type CaptureMode, type TranscriptResult } from '@/hooks/useAudioCapture';

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
type ScribeMode = 'live' | 'upload';

export default function ScribePage() {
  const router = useRouter();

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [insights, setInsights] = useState<LiveInsight[]>([]);
  const [showInsights, setShowInsights] = useState(true);

  // Mode selection
  const [scribeMode, setScribeMode] = useState<ScribeMode>('live');
  const [captureMode, setCaptureMode] = useState<CaptureMode>('chunked');
  const [showSettings, setShowSettings] = useState(false);

  // Upload mode state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio capture hook for live transcription
  const audioCapture = useAudioCapture({
    mode: captureMode,
    chunkIntervalMs: 5000,
    onTranscript: useCallback((result: TranscriptResult) => {
      // Add local transcript while waiting for server
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
      if (!sessionId) return;

      // Send chunk to server for transcription and storage
      const formData = new FormData();
      formData.append('sessionId', sessionId);
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
            // Replace local segment with server segment
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
        console.error('[Scribe] Failed to stream chunk:', err);
      }
    }, [sessionId]),
  });

  // Start live session
  const startSession = async () => {
    try {
      const response = await apiFetch('/api/supervision/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'live_scribe',
          title: `Live Scribe - ${new Date().toLocaleDateString()}`,
          metadata: { captureMode }
        })
      });

      const data = await response.json();
      if (data.success && data.session?.id) {
        setSessionId(data.session.id);
        setIsRecording(true);
        setSegments([]);
        setInsights([]);
        startTimeRef.current = Date.now();

        // Start audio capture
        await audioCapture.start();

        // Connect to SSE stream for insights
        connectToStream(data.session.id);
      }
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  // Stop session
  const stopSession = async () => {
    if (!sessionId) return;

    // Stop audio capture
    const fullRecording = await audioCapture.stop();

    // Disconnect SSE stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Upload full recording if in full capture mode
    if (captureMode === 'full' && fullRecording && fullRecording.size > 0) {
      const formData = new FormData();
      formData.append('audio', fullRecording, 'session.webm');
      formData.append('sessionId', sessionId);
      formData.append('durationMs', String(audioCapture.duration * 1000));

      await fetch(apiUrl('/api/supervision/upload'), {
        method: 'POST',
        body: formData,
      });
    }

    try {
      await apiFetch('/api/supervision/session/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          triggerAnalysis: true,
          totalDurationMs: audioCapture.duration * 1000
        })
      });

      setIsRecording(false);
      setConnectionStatus('disconnected');
    } catch (err) {
      console.error('Failed to stop session:', err);
    }
  };

  // Handle file upload for upload mode
  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create session first
      const sessionResponse = await apiFetch('/api/supervision/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'live_scribe',
          title: `Upload: ${uploadFile.name}`,
          metadata: { uploadMode: true, filename: uploadFile.name }
        })
      });

      const sessionData = await sessionResponse.json();
      if (!sessionData.success || !sessionData.session?.id) {
        throw new Error('Failed to create session');
      }

      setSessionId(sessionData.session.id);
      setUploadProgress(30);

      // Upload the audio file
      const formData = new FormData();
      formData.append('audio', uploadFile);
      formData.append('practitionerId', '');
      formData.append('sessionType', 'live_scribe');
      formData.append('title', `Upload: ${uploadFile.name}`);

      const uploadResponse = await fetch(apiUrl('/api/supervision/upload'), {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(70);

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        setSessionId(uploadData.session?.id || sessionData.session.id);
        setUploadProgress(100);

        // Connect to stream for processing updates
        connectToStream(uploadData.session?.id || sessionData.session.id);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
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

  // Download transcript
  const downloadTranscript = () => {
    const content = segments
      .map(seg => `[${formatDuration(Math.floor(seg.startMs / 1000))}] ${seg.speaker}: ${seg.text}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scribe-session-${sessionId || 'draft'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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

          <div className="flex items-center gap-4">
            {isRecording && (
              <>
                {/* Audio Level Indicator */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500"
                      animate={{ width: `${audioCapture.audioLevel * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-amber-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">
                    {formatDuration(audioCapture.duration)}
                  </span>
                </div>

                {/* Connection Status */}
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
              </>
            )}

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
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

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && !isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Session Settings</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Mode Selection */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                      Input Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setScribeMode('live')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
                          scribeMode === 'live'
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-gray-800 border-gray-700 text-gray-400'
                        } border`}
                      >
                        <Mic className="w-4 h-4 inline mr-2" />
                        Live Recording
                      </button>
                      <button
                        onClick={() => setScribeMode('upload')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
                          scribeMode === 'upload'
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-gray-800 border-gray-700 text-gray-400'
                        } border`}
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload Audio
                      </button>
                    </div>
                  </div>

                  {/* Capture Mode (for live) */}
                  {scribeMode === 'live' && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                        Transcription Mode
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCaptureMode('chunked')}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                            captureMode === 'chunked'
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                              : 'bg-gray-800 border-gray-700 text-gray-400'
                          } border`}
                        >
                          <Waves className="w-3 h-3 inline mr-1" />
                          Real-time
                        </button>
                        <button
                          onClick={() => setCaptureMode('full')}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                            captureMode === 'full'
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                              : 'bg-gray-800 border-gray-700 text-gray-400'
                          } border`}
                        >
                          <Radio className="w-3 h-3 inline mr-1" />
                          Post-Session
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {captureMode === 'chunked'
                          ? 'Transcribes every 5 seconds for live feedback'
                          : 'Records full session, transcribes when stopped'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {!isRecording && !sessionId ? (
          /* Start/Upload Section */
          <div className="text-center py-8">
            {scribeMode === 'live' ? (
              <button
                onClick={startSession}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
              >
                <Mic className="w-5 h-5" />
                Start Session
              </button>
            ) : (
              <div className="max-w-md mx-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                {!uploadFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 rounded-xl border-2 border-dashed border-gray-700 hover:border-amber-500/50 transition-all flex flex-col items-center gap-3"
                  >
                    <Upload className="w-8 h-8 text-gray-500" />
                    <span className="text-gray-400">Click to select audio file</span>
                    <span className="text-xs text-gray-600">WAV, MP3, M4A, WebM supported</span>
                  </button>
                ) : (
                  <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm text-white truncate">{uploadFile.name}</div>
                        <div className="text-xs text-gray-500">
                          {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadFile(null)}
                        className="p-1 hover:bg-gray-800 rounded"
                      >
                        <MicOff className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {isUploading ? (
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-amber-500"
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          {uploadProgress < 30 ? 'Creating session...' :
                           uploadProgress < 70 ? 'Uploading audio...' :
                           'Processing...'}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleFileUpload}
                        className="w-full py-3 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
                      >
                        Upload & Transcribe
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Recording/Results View */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Transcript Column */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Live Transcript
                  </h2>
                  <div className="flex items-center gap-2">
                    {segments.length > 0 && (
                      <button
                        onClick={downloadTranscript}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs hover:bg-gray-700 transition-all"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    )}
                    {isRecording && (
                      <>
                        <button
                          onClick={audioCapture.isPaused ? audioCapture.resume : audioCapture.pause}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs hover:bg-gray-700 transition-all"
                        >
                          {audioCapture.isPaused ? (
                            <><Play className="w-3 h-3" /> Resume</>
                          ) : (
                            <><Pause className="w-3 h-3" /> Pause</>
                          )}
                        </button>
                        <button
                          onClick={stopSession}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all"
                        >
                          <Square className="w-3 h-3" />
                          Stop
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="h-[400px] overflow-y-auto space-y-3 pr-2">
                  {segments.length === 0 ? (
                    <div className="text-center py-16 text-gray-600 text-sm">
                      {isRecording
                        ? audioCapture.isPaused
                          ? 'Recording paused...'
                          : 'Listening for speech...'
                        : 'Session transcript will appear here'}
                    </div>
                  ) : (
                    segments.map((seg) => (
                      <motion.div
                        key={seg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border ${
                          seg.id.startsWith('local-')
                            ? 'bg-gray-800/30 border-gray-700/30'
                            : 'bg-gray-800/50 border-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-amber-400 uppercase">
                            {seg.speaker}
                          </span>
                          <span className="text-xs text-gray-600">
                            {formatDuration(Math.floor(seg.startMs / 1000))}
                          </span>
                          {seg.confidence && (
                            <span className={`text-xs px-1 rounded ${
                              seg.confidence > 0.8 ? 'text-emerald-500' :
                              seg.confidence > 0.5 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {Math.round(seg.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{seg.text}</p>
                      </motion.div>
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
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                        <p className="text-sm leading-relaxed text-stone-200">
                          {insight.content.slice(0, 200)}
                          {insight.content.length > 200 && '...'}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Session Complete */}
              {!isRecording && sessionId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <h3 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Session Complete
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {segments.length} transcript segments captured.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push(`/supervision/session/${sessionId}`)}
                      className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-all"
                    >
                      View Full Analysis
                    </button>
                    <button
                      onClick={() => {
                        setSessionId(null);
                        setSegments([]);
                        setInsights([]);
                      }}
                      className="w-full py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-sm hover:bg-gray-700 transition-all"
                    >
                      New Session
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
