'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Radio,
  Square,
  Plus,
  Copy,
  Check,
  Loader2,
  Ship,
  Wrench,
  GitBranch,
  AlertTriangle,
  ArrowRight,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type CaptureTag = 'ship' | 'fix' | 'decision' | 'blocked' | 'next';

interface CaptureNote {
  id: string;
  session_id: string;
  created_at: string;
  offset_ms: number;
  tag: CaptureTag;
  text: string;
}

interface CaptureSession {
  id: string;
  started_at: string;
  ended_at: string | null;
  auto_started: boolean;
  title: string | null;
}

interface CaptureSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  captureActive: boolean;
  sessionId: string | null;
  sessionStartedAt?: string | null;
  onToggleCapture: () => void;
}

const TAG_CONFIG: Record<CaptureTag, { label: string; icon: typeof Ship; color: string; bgColor: string }> = {
  ship: { label: 'Ship', icon: Ship, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/40' },
  fix: { label: 'Fix', icon: Wrench, color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/40' },
  decision: { label: 'Decision', icon: GitBranch, color: 'text-purple-400', bgColor: 'bg-purple-500/20 border-purple-500/40' },
  blocked: { label: 'Blocked', icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/40' },
  next: { label: 'Next', icon: ArrowRight, color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/40' }
};

export function CaptureSheet({
  isOpen,
  onClose,
  userId,
  captureActive,
  sessionId,
  sessionStartedAt,
  onToggleCapture
}: CaptureSheetProps) {
  const [noteText, setNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState<CaptureTag>('ship');
  const [notes, setNotes] = useState<CaptureNote[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopying, setCopying] = useState<'descript' | 'patreon' | null>(null);
  const [copySuccess, setCopySuccess] = useState<'descript' | 'patreon' | null>(null);
  const [showExport, setShowExport] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch notes when sheet opens or session changes
  useEffect(() => {
    if (isOpen && sessionId) {
      fetchNotes();
    }
  }, [isOpen, sessionId]);

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const fetchNotes = async () => {
    if (!sessionId) return;

    try {
      const res = await fetch(`/api/v1/capture/status?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && data.notes) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const handleSubmitNote = async () => {
    if (!noteText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/capture/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          tag: selectedTag,
          text: noteText.trim(),
          clientTsMs: Date.now()
        })
      });

      const data = await res.json();
      if (data.success) {
        setNotes(prev => [...prev, data.note]);
        setNoteText('');
        inputRef.current?.focus();
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (format: 'descript' | 'patreon') => {
    if (!sessionId) return;

    setCopying(format);
    try {
      const res = await fetch('/api/v1/capture/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          format: format === 'descript' ? 'descript_chapters' : 'patreon_md'
        })
      });

      const data = await res.json();
      if (data.success) {
        const text = format === 'descript' ? data.descript_chapters : data.patreon_md;
        await navigator.clipboard.writeText(text);
        setCopySuccess(format);
        setTimeout(() => setCopySuccess(null), 2000);
      }
    } catch (err) {
      console.error('Failed to export:', err);
    } finally {
      setCopying(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitNote();
    }
  };

  const formatTimestamp = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatSessionStartTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-stone-900 to-black border-t border-red-500/30 rounded-t-3xl z-[9999] max-h-[85vh] overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-red-500/40 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleCapture}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    captureActive
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                      : 'bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:bg-stone-700/50'
                  }`}
                >
                  {captureActive ? (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Recording</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4" />
                      <span className="text-sm font-medium">Start</span>
                    </>
                  )}
                </button>
                <div className="flex flex-col">
                  <h2 className="text-lg font-medium text-white">Capture Mode</h2>
                  {captureActive && sessionStartedAt && (
                    <span className="text-xs text-stone-500">
                      Started at {formatSessionStartTime(sessionStartedAt)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 overflow-y-auto max-h-[calc(85vh-100px)]">
              {/* Input Area */}
              <div className="mb-4">
                {/* Tag Chips */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {(Object.keys(TAG_CONFIG) as CaptureTag[]).map(tag => {
                    const config = TAG_CONFIG[tag];
                    const Icon = config.icon;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border whitespace-nowrap ${
                          selectedTag === tag
                            ? config.bgColor + ' ' + config.color
                            : 'bg-stone-800/50 border-stone-700/50 text-stone-400 hover:bg-stone-700/50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Input + Add Button */}
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What just happened? (one sentence)"
                    className="flex-1 px-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/30"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleSubmitNote}
                    disabled={!noteText.trim() || isSubmitting}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      !noteText.trim() || isSubmitting
                        ? 'bg-stone-700/50 text-stone-500 cursor-not-allowed'
                        : 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Notes List */}
              {notes.length > 0 && (
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-medium text-stone-500 mb-2">
                    Notes ({notes.length})
                  </div>
                  {notes.slice().reverse().map(note => {
                    const config = TAG_CONFIG[note.tag];
                    const Icon = config.icon;
                    return (
                      <div
                        key={note.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgColor}`}
                      >
                        <div className="flex items-center gap-2 text-xs text-stone-500 whitespace-nowrap">
                          <span>{formatTimestamp(note.offset_ms)}</span>
                          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                        <p className="text-sm text-white flex-1">{note.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Export Section */}
              {notes.length > 0 && (
                <div className="border-t border-stone-700/50 pt-4">
                  <button
                    onClick={() => setShowExport(!showExport)}
                    className="w-full flex items-center justify-between text-stone-400 hover:text-stone-300 transition-colors mb-3"
                  >
                    <span className="text-xs font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Export Session
                    </span>
                    {showExport ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showExport && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleExport('descript')}
                            disabled={!!isCopying}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300"
                          >
                            {isCopying === 'descript' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : copySuccess === 'descript' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            <span>{copySuccess === 'descript' ? 'Copied!' : 'Descript Chapters'}</span>
                          </button>

                          <button
                            onClick={() => handleExport('patreon')}
                            disabled={!!isCopying}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300"
                          >
                            {isCopying === 'patreon' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : copySuccess === 'patreon' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            <span>{copySuccess === 'patreon' ? 'Copied!' : 'Patreon Draft'}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Empty State */}
              {notes.length === 0 && captureActive && (
                <div className="text-center py-8 text-stone-500">
                  <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Session active. Add your first note.</p>
                </div>
              )}

              {notes.length === 0 && !captureActive && (
                <div className="text-center py-8 text-stone-500">
                  <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start capture to begin logging your work.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
