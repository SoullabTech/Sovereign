'use client';

/**
 * VoiceNotePanel — Self-contained voice note lifecycle for Studio sessions
 *
 * States: idle → recording → uploading → transcribed → drafting → drafted
 *
 * Uses:
 * - useAudioCapture (full mode) for recording
 * - /api/studio/sessions/{id}/voice-notes for upload + transcription
 * - /api/studio/sessions/{id}/voice-notes/{noteId}/draft-note for MAIA note drafting
 *
 * Table: session_voice_notes (file_path, duration_ms, transcript, etc.)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  Loader2,
  FileText,
  Copy,
  Save,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { apiFetch } from '@/lib/http/apiBase';

interface VoiceNote {
  id: string;
  sessionId: string;
  clientId: string | null;
  durationMs: number | null;
  transcript: string | null;
  createdAt: string;
}

interface VoiceNotePanelProps {
  sessionId: string;
  clientName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type PanelState = 'idle' | 'recording' | 'uploading' | 'transcribed' | 'drafting' | 'drafted';

export function VoiceNotePanel({ sessionId, clientName, isOpen, onClose }: VoiceNotePanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [existingNotes, setExistingNotes] = useState<VoiceNote[]>([]);
  const [currentNote, setCurrentNote] = useState<VoiceNote | null>(null);
  const [draftedNote, setDraftedNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const {
    isCapturing,
    audioLevel,
    duration,
    start: startCapture,
    stop: stopCapture,
  } = useAudioCapture({ mode: 'full' });

  // Fetch existing voice notes on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchNotes = async () => {
      try {
        const res = await apiFetch(`/api/studio/sessions/${sessionId}/voice-notes`);
        const data = await res.json();
        if (data.success && data.voiceNotes) {
          setExistingNotes(data.voiceNotes);
        }
      } catch {
        // Silently fail — not critical
      }
    };

    fetchNotes();
  }, [isOpen, sessionId]);

  // Start recording
  const handleStartRecording = useCallback(async () => {
    setError(null);
    try {
      await startCapture();
      setPanelState('recording');
    } catch (err: any) {
      setError(err.message || 'Could not access microphone');
    }
  }, [startCapture]);

  // Stop recording → upload → transcribe
  const handleStopRecording = useCallback(async () => {
    const blob = await stopCapture();
    if (!blob || blob.size === 0) {
      setError('No audio recorded');
      setPanelState('idle');
      return;
    }

    setPanelState('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', blob, `voice-note-${Date.now()}.webm`);
      // Send duration in milliseconds (duration from useAudioCapture is in seconds)
      formData.append('duration_ms', String(Math.round(duration * 1000)));

      const res = await apiFetch(`/api/studio/sessions/${sessionId}/voice-notes`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setCurrentNote(data.voiceNote);

      if (data.voiceNote.transcript) {
        setPanelState('transcribed');
      } else {
        setError('Transcription failed — audio saved, try again');
        setPanelState('idle');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setPanelState('idle');
    }
  }, [stopCapture, duration, sessionId]);

  // Draft session note via Claude
  const handleDraftNote = useCallback(async () => {
    if (!currentNote) return;

    setPanelState('drafting');
    setError(null);

    try {
      const res = await apiFetch(
        `/api/studio/sessions/${sessionId}/voice-notes/${currentNote.id}/draft-note`,
        { method: 'POST' }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Draft failed');
      }

      setDraftedNote(data.draftedNote);
      setPanelState('drafted');
    } catch (err: any) {
      setError(err.message || 'Failed to draft note');
      setPanelState('transcribed');
    }
  }, [currentNote, sessionId]);

  // Copy drafted note to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(draftedNote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [draftedNote]);

  // Save drafted note to session.practitioner_notes
  const handleSaveToSession = useCallback(async () => {
    try {
      const res = await apiFetch('/api/studio/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          practitioner_notes: draftedNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to save to session');
      }
    } catch (err: any) {
      setError(err.message || 'Save failed');
    }
  }, [sessionId, draftedNote]);

  // Reset panel
  const handleNewRecording = useCallback(() => {
    setCurrentNote(null);
    setDraftedNote('');
    setError(null);
    setCopied(false);
    setSaved(false);
    setPanelState('idle');
  }, []);

  // Format duration as mm:ss (from seconds)
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Format duration from milliseconds
  const formatDurationMs = (ms: number) => {
    const totalSecs = Math.round(ms / 1000);
    return formatDuration(totalSecs);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 bg-[#1a1a2e] border border-slate-800/50 rounded-xl overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Mic className="w-4 h-4 text-amber-400" />
            <span className="font-medium">Voice Notes</span>
            {clientName && (
              <span className="text-slate-500">for {clientName}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* IDLE state */}
        {panelState === 'idle' && (
          <div>
            <button
              onClick={handleStartRecording}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              <Mic className="w-5 h-5" />
              Record Voice Note
            </button>
          </div>
        )}

        {/* RECORDING state */}
        {panelState === 'recording' && (
          <div className="space-y-3">
            {/* Audio level visualization */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500 rounded-full"
                  animate={{ width: `${Math.max(5, audioLevel * 100)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-red-400 text-sm font-mono min-w-[3rem] text-right">
                {formatDuration(duration)}
              </span>
            </div>

            {/* Recording indicator */}
            <div className="flex items-center gap-2 text-sm text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recording...
            </div>

            {/* Stop button */}
            <button
              onClick={handleStopRecording}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </button>
          </div>
        )}

        {/* UPLOADING state */}
        {panelState === 'uploading' && (
          <div className="flex items-center justify-center gap-3 py-6 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Uploading &amp; transcribing...</span>
          </div>
        )}

        {/* TRANSCRIBED state */}
        {panelState === 'transcribed' && currentNote && (
          <div className="space-y-3">
            <div className="p-3 bg-teal-500/5 border border-teal-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-xs text-teal-400">
                <FileText className="w-3 h-3" />
                Transcript
                {currentNote.durationMs && (
                  <span className="text-slate-500">
                    ({formatDurationMs(currentNote.durationMs)})
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentNote.transcript}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDraftNote}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Draft Session Note
              </button>
              <button
                onClick={handleNewRecording}
                className="px-3 py-2.5 text-slate-500 hover:text-slate-300 transition-colors text-sm"
              >
                Record another
              </button>
            </div>
          </div>
        )}

        {/* DRAFTING state */}
        {panelState === 'drafting' && (
          <div className="space-y-3">
            {currentNote && (
              <div className="p-3 bg-teal-500/5 border border-teal-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-xs text-teal-400">
                  <FileText className="w-3 h-3" />
                  Transcript
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentNote.transcript}
                </p>
              </div>
            )}
            <div className="flex items-center justify-center gap-3 py-4 text-amber-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">MAIA is drafting your session note...</span>
            </div>
          </div>
        )}

        {/* DRAFTED state */}
        {panelState === 'drafted' && (
          <div className="space-y-3">
            {/* Transcript (collapsed) */}
            {currentNote?.transcript && (
              <button
                onClick={() => setExpandedNoteId(expandedNoteId === 'transcript' ? null : 'transcript')}
                className="w-full flex items-center justify-between p-2 bg-teal-500/5 border border-teal-500/20 rounded-lg text-xs text-teal-400 hover:bg-teal-500/10 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  Original transcript
                </span>
                {expandedNoteId === 'transcript' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            <AnimatePresence>
              {expandedNoteId === 'transcript' && currentNote?.transcript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-lg"
                >
                  <p className="text-sm text-slate-400 leading-relaxed">{currentNote.transcript}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Editable drafted note */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-xs text-amber-400">
                <Sparkles className="w-3 h-3" />
                Session Note (editable)
              </div>
              <textarea
                value={draftedNote}
                onChange={(e) => setDraftedNote(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-300 leading-relaxed resize-y min-h-[120px] outline-none"
                rows={8}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleSaveToSession}
                disabled={saved}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                  saved
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                }`}
              >
                {saved ? <CheckCircle className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                {saved ? 'Saved to Session' : 'Save to Session'}
              </button>
              <button
                onClick={handleNewRecording}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                New
              </button>
            </div>
          </div>
        )}

        {/* Existing voice notes list */}
        {panelState === 'idle' && existingNotes.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs text-slate-500 mb-2">Previous notes</div>
            {existingNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-slate-800/30 border border-slate-800/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">
                    {new Date(note.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                    {note.durationMs && ` (${formatDurationMs(note.durationMs)})`}
                  </span>
                  <span className={`text-xs ${note.transcript ? 'text-teal-400' : 'text-slate-500'}`}>
                    {note.transcript ? 'transcribed' : 'no transcript'}
                  </span>
                </div>
                {note.transcript && (
                  <p className="text-sm text-slate-400 line-clamp-2">{note.transcript}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
