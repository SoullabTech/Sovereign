'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Book, Compass, Flame, Droplet, Mountain, Wind, Sparkle } from 'lucide-react';

type DetectedTheme = string;
type Chapter = {
  element: string;
  title: string;
  excerpt: string;
  relevance: number;
};

type BookResponse = {
  query: string;
  detectedThemes: DetectedTheme[];
  chapters: Chapter[];
  fullTeaching?: string;
  suggestedQuestions: string[];
  practices: string[];
};

const ELEMENT_ICONS: Record<string, any> = {
  fire: Flame,
  water: Droplet,
  earth: Mountain,
  air: Wind,
  aether: Sparkle,
  spiralogic: Compass,
};

const ELEMENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  fire: { bg: 'from-orange-500/20 to-red-500/10', border: 'border-orange-400/30', text: 'text-orange-300' },
  water: { bg: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-400/30', text: 'text-blue-300' },
  earth: { bg: 'from-green-500/20 to-emerald-500/10', border: 'border-green-400/30', text: 'text-green-300' },
  air: { bg: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-400/30', text: 'text-purple-300' },
  aether: { bg: 'from-indigo-500/20 to-pink-500/10', border: 'border-indigo-400/30', text: 'text-indigo-300' },
  spiralogic: { bg: 'from-teal-500/20 to-cyan-500/10', border: 'border-teal-400/30', text: 'text-teal-300' },
};

export default function AskTheBookPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<BookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/elemental-alchemy/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user', // TODO: Replace with actual user ID from auth
          question: question.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (suggestedQ: string) => {
    setQuestion(suggestedQ);
    // Auto-submit
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900/30 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="w-10 h-10 text-teal-400" />
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-wide">
              Ask the Book
            </h1>
          </div>
          <p className="text-teal-200/70 text-lg font-light max-w-2xl mx-auto">
            Query Kelly's <em>Elemental Alchemy</em> directly. Receive wisdom from the chapter that resonates with your question.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What's alive in you right now? Ask your question..."
                className="w-full px-6 py-4 bg-slate-800/40 backdrop-blur-sm border border-teal-500/30 rounded-2xl text-white placeholder-teal-300/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent resize-none transition-all"
                rows={4}
                maxLength={1000}
                disabled={loading}
              />
              <div className="absolute bottom-4 right-4 text-xs text-teal-400/50">
                {question.length}/1000
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-teal-300/60">
                {question.length < 3 && question.length > 0 && 'At least 3 characters needed'}
              </div>
              <button
                type="submit"
                disabled={loading || question.trim().length < 3}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Consulting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Ask
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response */}
        <AnimatePresence mode="wait">
          {response && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >

              {/* Detected Themes */}
              {response.detectedThemes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-800/40 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-medium text-teal-300 mb-3 flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    Detected Themes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {response.detectedThemes.map((theme, idx) => {
                      const element = theme.split(' ')[0].toLowerCase();
                      const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS.spiralogic;
                      const Icon = ELEMENT_ICONS[element] || Compass;

                      return (
                        <div
                          key={idx}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r ${colors.bg} border ${colors.border} flex items-center gap-2`}
                        >
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                          <span className="text-white text-sm font-medium capitalize">
                            {theme}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Chapter Excerpts */}
              {response.chapters.map((chapter, idx) => {
                const colors = ELEMENT_COLORS[chapter.element] || ELEMENT_COLORS.spiralogic;
                const Icon = ELEMENT_ICONS[chapter.element] || Book;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="bg-slate-800/40 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.bg} border ${colors.border}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-white mb-1">
                          {chapter.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-teal-300/60">
                          <span className="capitalize">{chapter.element}</span>
                          <span>•</span>
                          <span>{chapter.relevance}% relevant</span>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-invert prose-teal max-w-none">
                      <p className="text-teal-100/80 leading-relaxed whitespace-pre-wrap">
                        {chapter.excerpt}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Practices */}
              {response.practices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-slate-800/40 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-medium text-teal-300 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Practices to Explore
                  </h3>
                  <ul className="space-y-3">
                    {response.practices.map((practice, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-teal-100/80"
                      >
                        <span className="text-teal-400 mt-1">•</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Suggested Questions */}
              {response.suggestedQuestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-slate-800/40 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-medium text-teal-300 mb-4">
                    Questions to Deepen
                  </h3>
                  <div className="space-y-2">
                    {response.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedQuestion(q)}
                        className="w-full text-left px-4 py-3 bg-slate-700/30 hover:bg-slate-700/50 border border-teal-500/20 hover:border-teal-500/40 rounded-xl text-teal-100/80 hover:text-teal-100 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
