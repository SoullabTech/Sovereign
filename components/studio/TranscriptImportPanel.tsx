'use client';

/**
 * TranscriptImportPanel — Session Room threshold (Step 1): "Add a transcript".
 * Spec: docs/architecture/SESSION_ROOM_THRESHOLD_2026-07-19.md
 *
 * Paste or upload (.txt) an existing transcript → creates an UNASSIGNED
 * completed session → hands the caller the new session so it can enter the
 * same review surface as live-captured sessions.
 *
 * Consent is explicit and minimal here (authority + AI-processing); the full
 * consent/provenance threshold and speaker-confirmation screen are Step 2.
 */

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

export interface ImportedSessionInfo {
  id: string;
  title: string;
  segmentCount: number;
  durationSeconds: number;
  durationEstimated: boolean;
  speakerLabels: string[];
  timestampsSupplied: boolean;
}

interface TranscriptImportPanelProps {
  onImported: (session: ImportedSessionInfo) => void;
}

type Container = 'practitioner' | 'witness' | 'solo';

const CONTAINER_OPTIONS: Array<{ value: Container; label: string; hint: string }> = [
  { value: 'practitioner', label: 'Practitioner', hint: 'A session you held with a client' },
  { value: 'witness', label: 'Witness', hint: 'Couples or group session' },
  { value: 'solo', label: 'Solo', hint: 'Self-study or personal material' },
];

export function TranscriptImportPanel({ onImported }: TranscriptImportPanelProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [method, setMethod] = useState<'paste' | 'txt'>('paste');
  const [title, setTitle] = useState('');
  const [container, setContainer] = useState<Container>('practitioner');
  const [memoryPolicy, setMemoryPolicy] = useState<'sealed' | 'learning'>('sealed');
  const [confirmAuthority, setConfirmAuthority] = useState(false);
  const [allowAiProcessing, setAllowAiProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Only .txt files are supported in this step. Paste other formats as text.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ''));
      setMethod('txt');
      if (!title) setTitle(file.name.replace(/\.txt$/i, ''));
      setError(null);
    };
    reader.onerror = () => setError('Could not read that file.');
    reader.readAsText(file);
  };

  const canImport = text.trim().length > 0 && confirmAuthority && allowAiProcessing && !importing;

  const runImport = async () => {
    if (!canImport) return;
    setImporting(true);
    setError(null);
    try {
      const res = await apiFetch('/api/scribe/import-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          method,
          title: title.trim() || undefined,
          container,
          memoryPolicy,
          confirmAuthority,
          allowAiProcessing,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Import failed.');
        return;
      }
      // Reset for a future import, then hand off to review.
      setText('');
      setTitle('');
      setConfirmAuthority(false);
      setAllowAiProcessing(false);
      setOpen(false);
      onImported(data.session as ImportedSessionInfo);
    } catch {
      setError('Import failed — connection error.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <FileText className="w-4 h-4" />
        <span>Add a transcript</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 space-y-3">
              <p className="text-xs text-slate-500">
                Bring an existing session in as text — pasted, or a .txt export. It becomes a
                standalone session you can review with MAIA. Nothing is connected to a client
                unless you do that yourself, later and explicitly.
              </p>

              <textarea
                value={text}
                onChange={e => {
                  setText(e.target.value);
                  setMethod('paste');
                }}
                placeholder={'Paste the transcript here…\n\nSpeaker labels like "Name: …" and timestamps like [12:34] are kept if present. Nothing is invented if they are absent.'}
                rows={6}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 resize-y"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800/70 text-slate-300 hover:text-white transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload .txt
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                  }}
                />
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Session title (optional)"
                  className="flex-1 min-w-[160px] bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {CONTAINER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setContainer(opt.value)}
                    title={opt.hint}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      container === opt.value
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="ml-auto flex gap-2">
                  {(['sealed', 'learning'] as const).map(mp => (
                    <button
                      key={mp}
                      onClick={() => setMemoryPolicy(mp)}
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                        memoryPolicy === mp
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      {mp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmAuthority}
                    onChange={e => setConfirmAuthority(e.target.checked)}
                    className="mt-0.5 accent-teal-500"
                  />
                  <span>I have the authority and any needed permission to bring this material here.</span>
                </label>
                <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowAiProcessing}
                    onChange={e => setAllowAiProcessing(e.target.checked)}
                    className="mt-0.5 accent-teal-500"
                  />
                  <span>MAIA may process this material to support my review of the session.</span>
                </label>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={runImport}
                disabled={!canImport}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing…
                  </>
                ) : (
                  'Import and review'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
