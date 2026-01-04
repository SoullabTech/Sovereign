'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  PenLine,
  Copy,
  Check
} from 'lucide-react';
import { ELEMENT_INFO, type ElementKey } from '@/lib/elemental-alchemy/assessmentQuestions';

interface AskMaiaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  teaching: string;
  element: ElementKey;
  chapterNum: number;
  chapterTitle?: string;
  userId: string;
  onSaveToJournal?: (insight: string, teaching: string) => void;
}

export function AskMaiaSheet({
  isOpen,
  onClose,
  teaching,
  element,
  chapterNum,
  chapterTitle,
  userId,
  onSaveToJournal
}: AskMaiaSheetProps) {
  const [question, setQuestion] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const info = ELEMENT_INFO[element];

  const askMaia = async () => {
    setLoading(true);
    setError(null);
    setInsight(null);

    try {
      const res = await fetch('/api/community/elemental-alchemy/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teaching,
          question: question.trim() || undefined,
          element,
          chapterNum,
          chapterTitle,
          userId
        })
      });

      const data = await res.json();

      if (data.ok) {
        setInsight(data.insight);
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (insight) {
      await navigator.clipboard.writeText(insight);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToJournal = () => {
    if (insight && onSaveToJournal) {
      onSaveToJournal(insight, teaching);
      onClose();
    }
  };

  const handleClose = () => {
    setQuestion('');
    setInsight(null);
    setError(null);
    onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-900 to-slate-950
                     rounded-t-3xl border-t border-white/10 max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.gradient}
                              flex items-center justify-center`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Ask MAIA</h2>
                  <p className="text-xs text-white/50">
                    Chapter {chapterNum} * {info.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Teaching */}
              <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${info.gradient}/10 border border-${info.color}-500/20`}>
                <div className="flex items-start gap-3">
                  <BookOpen className={`w-5 h-5 text-${info.color}-400 flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Teaching</p>
                    <p className="text-white/90 text-sm leading-relaxed">{teaching}</p>
                  </div>
                </div>
              </div>

              {!insight ? (
                <>
                  {/* Question Input */}
                  <div className="mb-4">
                    <label className="text-sm text-white/60 mb-2 block">
                      Your question (optional)
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="How does this apply to my life? What should I know about this?"
                      rows={3}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl
                               text-white placeholder-white/30 resize-none focus:outline-none
                               focus:border-amber-500/50"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Ask Button */}
                  <button
                    onClick={askMaia}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                             font-medium transition-all
                             bg-gradient-to-r ${info.gradient} text-white hover:opacity-90
                             disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        MAIA is reflecting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Ask MAIA
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* MAIA's Insight */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-white/70">MAIA&apos;s Insight</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                        {insight}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                 bg-white/5 border border-white/10 text-white/70
                                 hover:bg-white/10 transition-all"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                      {onSaveToJournal && (
                        <button
                          onClick={handleSaveToJournal}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                   bg-gradient-to-r from-green-600 to-emerald-600 text-white
                                   hover:opacity-90 transition-all"
                        >
                          <PenLine className="w-4 h-4" />
                          Save to Journal
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setInsight(null);
                        setQuestion('');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                               bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                    >
                      Ask another question
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
