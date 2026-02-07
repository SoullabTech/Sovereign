'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface VoiceNoteItem {
  id: string;
  transcript: string | null;
  created_at: string;
  audioUrl?: string;
  mime_type?: string;
  original_filename?: string | null;
}

interface VoiceNotePanelProps {
  sessionId: string;
  clientId?: string;
}

export function VoiceNotePanel({ sessionId, clientId }: VoiceNotePanelProps) {
  const [items, setItems] = useState<VoiceNoteItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const canRecord = useMemo(
    () => typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    []
  );

  async function refresh() {
    setErr(null);
    try {
      const res = await apiFetch(`/api/studio/sessions/${sessionId}/voice-notes`);
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.items || []);
    } catch (e) {
      console.error('[VoiceNotePanel] refresh error:', e);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function start() {
    setErr(null);
    if (!canRecord) {
      setErr('Microphone not available');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        await upload(blob);
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Microphone access denied';
      setErr(msg);
    }
  }

  function stop() {
    setErr(null);
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    mr.stop();
    setIsRecording(false);
  }

  async function upload(blob: Blob) {
    setIsUploading(true);
    try {
      const f = new File([blob], 'voice-note.webm', { type: blob.type || 'audio/webm' });
      const fd = new FormData();
      fd.set('audio', f);
      if (clientId) fd.set('clientId', clientId);

      const res = await apiFetch(`/api/studio/sessions/${sessionId}/voice-notes`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || 'Upload failed');
      }

      const j = await res.json();
      const item = j.item as VoiceNoteItem;

      setItems((prev) => [item, ...prev]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setErr(msg);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#1e1e38] p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Volume2 className="w-4 h-4 text-slate-400" />
          Voice Notes
        </div>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              onClick={start}
              disabled={!canRecord || isUploading}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              Record
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors animate-pulse"
            >
              <Square className="w-3 h-3" />
              Stop
            </button>
          )}

          {isUploading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </div>
          )}
        </div>
      </div>

      {err && (
        <div className="mb-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          {err}
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-500">
            No voice notes yet. Click Record to add one.
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="rounded-lg border border-slate-700/30 bg-black/20 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] text-slate-500">
                  {new Date(it.created_at).toLocaleString()}
                </div>
              </div>

              <audio
                controls
                src={it.audioUrl || `/api/studio/voice-notes/${it.id}/audio`}
                className="w-full h-8 mb-2"
              />

              {it.transcript ? (
                <div className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed">
                  {it.transcript}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Transcribing...
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
