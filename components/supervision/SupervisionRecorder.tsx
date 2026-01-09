'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  Clock,
  Users,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';

interface SupervisionRecorderProps {
  practitionerId?: string;
  caseId?: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionStop?: (sessionId: string) => void;
  onTranscriptUpdate?: (segments: TranscriptSegment[]) => void;
}

interface TranscriptSegment {
  id: string;
  speaker: string;
  startMs: number;
  endMs: number;
  text: string;
  confidence?: number;
}

type SessionStatus = 'idle' | 'connecting' | 'recording' | 'paused' | 'stopping';

export function SupervisionRecorder({
  practitionerId,
  caseId,
  onSessionStart,
  onSessionStop,
  onTranscriptUpdate
}: SupervisionRecorderProps) {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionType, setSessionType] = useState<'individual' | 'group' | 'peer' | 'consultation' | 'team_meeting'>('consultation');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [speakerCount, setSpeakerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Format elapsed time
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Start recording session
  const startSession = async () => {
    setError(null);
    setStatus('connecting');

    try {
      const response = await fetch(apiUrl('/api/supervision/session/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          caseId,
          sessionType,
          title: sessionTitle || `Session ${new Date().toLocaleString()}`
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to start session');
      }

      setSessionId(data.session.id);
      setStatus('recording');
      startTimeRef.current = Date.now();
      setIsConnected(true);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 1000);

      // Start polling for transcript updates
      pollRef.current = setInterval(() => pollTranscript(data.session.id), 3000);

      onSessionStart?.(data.session.id);

      console.log(`🎙️ [SUPERVISION] Recording started: ${data.session.id}`);
    } catch (err) {
      console.error('Failed to start session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
      setStatus('idle');
    }
  };

  // Stop recording session
  const stopSession = async () => {
    if (!sessionId) return;

    setStatus('stopping');

    try {
      // Clear timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);

      const response = await fetch(apiUrl('/api/supervision/session/stop'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          triggerAnalysis: true,
          totalDurationMs: elapsedMs,
          speakerCount
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to stop session');
      }

      onSessionStop?.(sessionId);

      console.log(`🛑 [SUPERVISION] Recording stopped: ${sessionId}`);

      // Reset state
      setSessionId(null);
      setStatus('idle');
      setElapsedMs(0);
      setSpeakerCount(0);
      setSessionTitle('');
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to stop session:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop session');
      setStatus('recording'); // Allow retry
    }
  };

  // Poll for transcript updates
  const pollTranscript = async (sid: string) => {
    try {
      const response = await fetch(apiUrl(`/api/supervision/transcript?sessionId=${sid}&limit=50`));
      const data = await response.json();

      if (data.success && data.transcript) {
        onTranscriptUpdate?.(data.transcript);
        if (data.stats?.speakerCount) {
          setSpeakerCount(data.stats.speakerCount);
        }
      }
    } catch (err) {
      console.warn('Failed to poll transcript:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const isRecording = status === 'recording' || status === 'paused';

  return (
    <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-stone-200">Clinical Supervision</h2>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
              <Wifi className="w-4 h-4" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-stone-500 text-sm">
              <WifiOff className="w-4 h-4" />
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Session Config (when idle) */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 mb-6"
          >
            <div>
              <label className="block text-sm text-stone-400 mb-1.5">Session Title</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Enter session title (optional)"
                className="w-full bg-stone-800/50 border border-stone-700/50 rounded-lg px-3 py-2 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1.5">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as typeof sessionType)}
                className="w-full bg-stone-800/50 border border-stone-700/50 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="consultation">Consultation</option>
                <option value="individual">Individual Supervision</option>
                <option value="group">Group Supervision</option>
                <option value="peer">Peer Supervision</option>
                <option value="team_meeting">Team Meeting</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Recording Stats (when recording) */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div className="bg-stone-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-stone-400 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Duration
              </div>
              <div className="text-2xl font-mono text-stone-200">
                {formatTime(elapsedMs)}
              </div>
            </div>
            <div className="bg-stone-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-stone-400 text-sm mb-1">
                <Users className="w-4 h-4" />
                Speakers
              </div>
              <div className="text-2xl font-mono text-stone-200">
                {speakerCount || '—'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4">
        {status === 'idle' && (
          <button
            onClick={startSession}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-colors"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        )}

        {status === 'connecting' && (
          <button
            disabled
            className="flex items-center gap-2 px-6 py-3 bg-stone-700 text-stone-400 rounded-full font-medium cursor-not-allowed"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Mic className="w-5 h-5" />
            </motion.div>
            Connecting...
          </button>
        )}

        {isRecording && (
          <>
            {/* Recording indicator */}
            <div className="flex items-center gap-2 text-red-400">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
              <span className="text-sm font-medium">Recording</span>
            </div>

            <button
              onClick={stopSession}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-medium transition-colors"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>
          </>
        )}

        {status === 'stopping' && (
          <button
            disabled
            className="flex items-center gap-2 px-6 py-3 bg-stone-700 text-stone-400 rounded-full font-medium cursor-not-allowed"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Square className="w-5 h-5" />
            </motion.div>
            Stopping...
          </button>
        )}
      </div>

      {/* HIPAA Notice */}
      <p className="text-center text-stone-500 text-xs mt-4">
        All audio and analysis processed locally. HIPAA compliant.
      </p>
    </div>
  );
}
