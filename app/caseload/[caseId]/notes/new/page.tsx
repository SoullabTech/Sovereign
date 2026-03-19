'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Mic, Square, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { SacredCard } from '@/components/ui/SacredCard';
import { NoteEditor } from '@/components/caseload/NoteEditor';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import type { PractitionerCase, CreateNoteInput } from '@/lib/caseload/types';

export default function NewNotePage() {
  const router = useRouter();
  const params = useParams();

  if (!params) return null;

  const caseIdParam = params.caseId as string | string[] | undefined;
  const caseId = Array.isArray(caseIdParam) ? caseIdParam[0] : caseIdParam;

  if (!caseId) return null;

  const [caseData, setCaseData] = useState<PractitionerCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice capture state
  type VoiceState = 'idle' | 'recording' | 'transcribing' | 'done' | 'error';
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [editorKey, setEditorKey] = useState(0);

  const { isCapturing, audioLevel, duration, start: startCapture, stop: stopCapture } =
    useAudioCapture({ mode: 'full' });

  const handleStartRecording = useCallback(async () => {
    setVoiceError(null);
    try {
      await startCapture();
      setVoiceState('recording');
    } catch (err: any) {
      setVoiceError(err.message || 'Could not access microphone');
      setVoiceState('error');
    }
  }, [startCapture]);

  const handleStopRecording = useCallback(async () => {
    const blob = await stopCapture();
    if (!blob || blob.size === 0) {
      setVoiceError('No audio recorded');
      setVoiceState('error');
      return;
    }
    setVoiceState('transcribing');
    try {
      const fd = new FormData();
      fd.append('file', blob, `note-${Date.now()}.webm`);
      const res = await fetch('/api/caseload/transcribe', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Transcription failed');
      setTranscript(data.transcript);
      setEditorKey(k => k + 1);
      setVoiceState('done');
    } catch (err: any) {
      setVoiceError(err.message || 'Transcription failed');
      setVoiceState('error');
    }
  }, [stopCapture]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getMemberId = () => {
    if (typeof window === 'undefined') return null;
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const parsed = JSON.parse(betaUser);
        return parsed.id || parsed.memberId;
      } catch {
        return null;
      }
    }
    return null;
  };

  const fetchCase = useCallback(async () => {
    const memberId = getMemberId();
    if (!memberId) {
      setError('Please sign in to add notes');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/caseload/${caseId}?memberId=${memberId}&includeNotes=false`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch case');
      }

      setCaseData(data.case);
    } catch (err) {
      console.error('[CASELOAD] Fetch case error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const handleSave = async (noteData: CreateNoteInput) => {
    const memberId = getMemberId();
    if (!memberId) {
      throw new Error('Please sign in to add notes');
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/caseload/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          ...noteData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save note');
      }

      // Navigate back to case detail
      router.push(`/caseload/${caseId}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/caseload/${caseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue flex items-center justify-center">
        <div className="text-gold-divine/60 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <SacredCard variant="outlined" className="border-red-500/30">
            <div className="text-center py-8">
              <p className="text-red-400">{error || 'Case not found'}</p>
              <button
                onClick={() => router.push('/caseload')}
                className="mt-4 px-4 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 rounded-lg text-neutral-silver text-sm"
              >
                Back to Caseload
              </button>
            </div>
          </SacredCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue">
      {/* Header */}
      <div className="border-b border-gold-divine/20 bg-sacred-navy/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={handleCancel}
              className="text-neutral-silver/60 hover:text-neutral-silver transition-colors"
            >
              ← Back to Case
            </button>
          </div>
          <h1 className="text-2xl font-light text-gold-divine">
            New Session Note
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">

        {/* Voice capture */}
        <SacredCard variant="outlined" className="border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="font-medium">Voice Capture</span>
              {voiceState === 'done' && transcript && (
                <span className="text-xs text-emerald-400 ml-1">— transcript ready</span>
              )}
            </div>

            {voiceState === 'idle' && (
              <button
                onClick={handleStartRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors"
              >
                <Mic className="w-3 h-3" /> Record
              </button>
            )}

            {voiceState === 'recording' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full transition-all duration-100"
                      style={{ width: `${Math.max(5, audioLevel * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-red-400 font-mono">{formatDuration(duration)}</span>
                </div>
                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Square className="w-3 h-3" /> Stop
                </button>
              </div>
            )}

            {voiceState === 'transcribing' && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Transcribing...
              </div>
            )}

            {voiceState === 'done' && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <button
                  onClick={() => { setVoiceState('idle'); setTranscript(''); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {voiceState === 'error' && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400">{voiceError}</span>
                <button
                  onClick={() => { setVoiceState('idle'); setVoiceError(null); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {voiceState === 'done' && transcript && (
            <div className="mt-3 p-3 bg-teal-500/5 border border-teal-500/20 rounded-lg">
              <p className="text-xs text-teal-400 mb-1">Transcript — injected into note below</p>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{transcript}</p>
            </div>
          )}
        </SacredCard>

        <SacredCard variant="consciousness" size="lg">
          <NoteEditor
            key={editorKey}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            clientIdentifier={caseData.client_identifier}
            initialData={{
              element_focus: caseData.primary_element,
              content: transcript || undefined,
            }}
          />
        </SacredCard>
      </div>
    </div>
  );
}
