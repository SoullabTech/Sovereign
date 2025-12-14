'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Sparkles } from 'lucide-react';

type ForceElement = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic';

type Chapter = {
  element: string;
  title?: string;
  content?: string;
  excerpt?: string;
};

type AskResponse = {
  success: boolean;
  data?: {
    detectedThemes?: string[];
    chapters?: Chapter[];
    practices?: string[];
    suggestedQuestions?: string[];
    fullTeaching?: string;
  };
  error?: string;
};

const ELEMENTS: { id: ForceElement; label: string; color: string }[] = [
  { id: 'fire', label: 'Fire', color: 'text-orange-400' },
  { id: 'water', label: 'Water', color: 'text-blue-400' },
  { id: 'earth', label: 'Earth', color: 'text-green-400' },
  { id: 'air', label: 'Air', color: 'text-purple-400' },
  { id: 'aether', label: 'Aether', color: 'text-indigo-400' },
  { id: 'spiralogic', label: 'Spiralogic', color: 'text-teal-400' },
];

const STORAGE_KEY = 'ea_companion_last_element';

export default function BookCompanionPage() {
  const [active, setActive] = useState<ForceElement>('fire');
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [chapterText, setChapterText] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState<string>('Elemental Alchemy');

  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string>('');

  const promptForElement = useMemo(
    () => (el: ForceElement) =>
      `Show me the complete ${el.toUpperCase()} chapter from Elemental Alchemy, with all sections and practices.`,
    []
  );

  // Load saved position on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ForceElement | null;
      if (saved && ELEMENTS.some((e) => e.id === saved)) {
        setActive(saved);
      }
    }
  }, []);

  // Load chapter when element changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, active);
    }
    void loadChapter(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  async function loadChapter(el: ForceElement) {
    setLoadingChapter(true);
    setAnswer('');
    try {
      const res = await fetch('/api/elemental-alchemy/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'book-companion',
          question: promptForElement(el),
          forceElement: el, // ✅ bypass semantic detection
        }),
      });

      const data = (await res.json()) as AskResponse;

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to load chapter');
      }

      const raw =
        data.data.fullTeaching ||
        data.data.chapters?.[0]?.content ||
        data.data.chapters?.[0]?.excerpt ||
        'No chapter content available.';

      const title = data.data.chapters?.[0]?.title || `${ELEMENTS.find((e) => e.id === el)?.label ?? el}`;

      setChapterTitle(title);
      setChapterText(raw);
    } catch (e) {
      console.error('Failed to load chapter:', e);
      setChapterText('Failed to load chapter. Check server logs.');
    } finally {
      setLoadingChapter(false);
    }
  }

  async function ask() {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer('');
    try {
      const contextualQuestion =
        `Context: I'm reading the ${active.toUpperCase()} chapter of Elemental Alchemy.\n\n` +
        `Question: ${question.trim()}`;

      const res = await fetch('/api/elemental-alchemy/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'book-companion',
          question: contextualQuestion,
        }),
      });

      const data = (await res.json()) as AskResponse;

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to get answer');
      }

      // Format the answer with practices if available
      let answerText = data.data.chapters?.[0]?.excerpt || 'No answer available.';

      if (data.data.practices && data.data.practices.length > 0) {
        answerText += '\n\n**Practices:**\n' + data.data.practices.map(p => `• ${p}`).join('\n');
      }

      setAnswer(answerText);
    } catch (e) {
      console.error('Ask failed:', e);
      setAnswer('Failed to get answer. Check server logs.');
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900/20 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Book className="w-8 h-8 text-teal-400" />
            <h1 className="text-3xl font-light text-white">Book Companion</h1>
          </div>
          <p className="text-teal-200/70 text-sm">
            Elemental Alchemy — read any chapter, then ask questions with context
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* TOC */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 rounded-2xl border border-teal-500/20 bg-slate-800/40 backdrop-blur-sm p-4"
          >
            <div className="text-sm font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <Book className="w-4 h-4" />
              Table of Contents
            </div>
            <div className="space-y-2">
              {ELEMENTS.map((el) => {
                const selected = el.id === active;
                return (
                  <button
                    key={el.id}
                    onClick={() => setActive(el.id)}
                    className={`w-full text-left rounded-xl px-4 py-3 border transition-all duration-200 ${
                      selected
                        ? 'border-teal-400/50 bg-teal-500/10 shadow-lg'
                        : 'border-slate-700/50 hover:border-teal-500/30 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className={`font-medium ${selected ? 'text-white' : 'text-slate-300'}`}>
                      {el.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {selected ? 'Currently reading' : 'Click to read'}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Reader */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-6 rounded-2xl border border-teal-500/20 bg-slate-800/40 backdrop-blur-sm p-6"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-xs text-teal-400/60 uppercase tracking-wide mb-1">
                  Chapter
                </div>
                <div className="text-xl font-medium text-white">
                  {chapterTitle}
                </div>
              </div>
              {loadingChapter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-teal-300 flex items-center gap-2"
                >
                  <div className="w-3 h-3 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                  Loading…
                </motion.div>
              )}
            </div>

            <div className="prose prose-invert max-w-none prose-p:text-slate-200/90 prose-headings:text-teal-100 prose-strong:text-teal-200">
              <div className="max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-200/90">
                  {chapterText || (loadingChapter ? 'Loading chapter...' : '')}
                </pre>
              </div>
            </div>
          </motion.div>

          {/* Ask Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 rounded-2xl border border-teal-500/20 bg-slate-800/40 backdrop-blur-sm p-4"
          >
            <div className="text-sm font-semibold text-teal-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Ask the Companion
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`Ask about ${active.toUpperCase()}...`}
              className="w-full min-h-[120px] rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent resize-none transition-all"
              maxLength={1000}
            />

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">{question.length}/1000</div>
              <button
                onClick={ask}
                disabled={asking || !question.trim()}
                className="rounded-lg bg-teal-500/20 border border-teal-400/50 px-4 py-2 text-sm font-medium text-teal-200 hover:bg-teal-500/30 hover:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {asking ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                    Asking…
                  </span>
                ) : (
                  'Ask'
                )}
              </button>
            </div>

            {answer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4"
              >
                <div className="text-xs text-teal-400/60 uppercase tracking-wide mb-2">
                  Answer
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-slate-100/90 leading-6">
                    {answer}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
