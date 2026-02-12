'use client';

/**
 * Explainer Script Generator
 *
 * Phase 1 HeyGen Integration:
 * - Generate video scripts with MAIA
 * - Copy and paste into HeyGen
 * - No persistence, no API complexity
 *
 * Behind feature flag: NEXT_PUBLIC_ENABLE_EXPLAINER_SCRIPTS
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Video,
  Sparkles,
  Copy,
  ExternalLink,
  Check,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react';

interface ExplainerScriptResponse {
  title: string;
  script: string;
  durationSeconds: number;
}

export default function ExplainerScriptsPage() {
  const router = useRouter();

  // Feature flag check
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    setEnabled(process.env.NEXT_PUBLIC_ENABLE_EXPLAINER_SCRIPTS === 'true');
  }, []);

  // Form state
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Soullab members — thoughtful adults exploring consciousness');
  const [lengthSeconds, setLengthSeconds] = useState(90);

  // Generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainerScriptResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Feature flag loading
  if (enabled === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4B896] animate-spin" />
      </div>
    );
  }

  // Feature not enabled
  if (!enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab
          </button>

          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Video className="w-8 h-8 text-white/30" />
            </div>
            <h1 className="text-xl font-medium text-white/80 mb-2">Coming Soon</h1>
            <p className="text-white/50 text-sm">
              Explainer video scripts are not yet enabled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  async function handleGenerate() {
    setError(null);

    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setError('Enter a topic first.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/labtools/explainer-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          audience,
          lengthSeconds,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate script');
      }

      const data = (await res.json()) as ExplainerScriptResponse;
      setResult(data);
      setShowModal(true);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong generating the script.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    const payload = `${result.title}\n\n${result.script}`;
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRegenerate() {
    setShowModal(false);
    setResult(null);
    handleGenerate();
  }

  const heygenUrl = 'https://app.heygen.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <button
          onClick={() => router.push('/labtools')}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lab
        </button>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-[#D4B896]/20 to-[#D4B896]/5 border border-[#D4B896]/20">
            <Video className="w-8 h-8 text-[#D4B896]" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Create Explainer Video</h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Generate a 60–120 second explainer script, then paste it into HeyGen to create your video.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <div className="space-y-5">
            {/* Topic */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Topic <span className="text-[#D4B896]">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., What is MAIA? / Why the Consciousness Lab exists / Fire as initiation"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10
                         text-white placeholder:text-white/30 text-sm
                         focus:outline-none focus:border-[#D4B896]/40 focus:ring-1 focus:ring-[#D4B896]/20
                         transition-all"
              />
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Audience <span className="text-white/40">(optional)</span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10
                         text-white placeholder:text-white/30 text-sm
                         focus:outline-none focus:border-[#D4B896]/40 focus:ring-1 focus:ring-[#D4B896]/20
                         transition-all"
              />
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Video Length
              </label>
              <div className="flex gap-3">
                {[60, 90, 120].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => setLengthSeconds(seconds)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                              ${lengthSeconds === seconds
                                ? 'bg-[#D4B896]/20 border border-[#D4B896]/40 text-[#D4B896]'
                                : 'bg-black/20 border border-white/10 text-white/60 hover:text-white/80 hover:border-white/20'
                              }`}
                  >
                    ~{seconds}s
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4B896] to-[#B8956E]
                         text-[#0a0f1a] font-medium text-sm
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Script
                  </>
                )}
              </button>

              <a
                href={heygenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10
                         text-white/70 text-sm hover:text-white hover:bg-white/10
                         transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                HeyGen
              </a>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-white/30 text-xs">
            Generate script → Copy → Paste into HeyGen → Create video
          </p>
        </motion.div>
      </div>

      {/* Script Result Modal */}
      <AnimatePresence>
        {showModal && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl
                       bg-gradient-to-br from-[#1a1f2e] to-[#0f1419]
                       border border-white/10 shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-white truncate">
                    {result.title}
                  </h2>
                  <p className="text-white/50 text-xs mt-1">
                    ~{result.durationSeconds} seconds • Copy and paste into HeyGen
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Script Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div
                  className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {result.script}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/10 flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4B896]/20 border border-[#D4B896]/30
                           text-[#D4B896] text-sm font-medium
                           hover:bg-[#D4B896]/30 transition-all
                           flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Script
                    </>
                  )}
                </button>

                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                           text-white/70 text-sm hover:text-white hover:bg-white/10
                           transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>

                <a
                  href={heygenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                           text-white/70 text-sm hover:text-white hover:bg-white/10
                           transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open HeyGen
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
