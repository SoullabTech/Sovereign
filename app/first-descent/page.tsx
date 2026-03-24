'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { apiUrl } from '@/lib/http/apiBase';
import type { DescentStep } from '@/lib/consciousness/firstDescent';

const OPENING_QUESTION = `Something in your life is already asking for your attention.\nWhat feels most present right now — not the whole story, just the part that has weight?`;

export default function FirstDescentPage() {
  const router = useRouter();
  const [step, setStep] = useState<DescentStep>('threshold');
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');
  const [promptVersion, setPromptVersion] = useState('');
  const [modelUsed, setModelUsed] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Gate: if already completed, go to /maia
  useEffect(() => {
    try {
      const raw = localStorage.getItem('beta_user');
      if (raw) {
        const user = JSON.parse(raw);
        if (user.firstDescentCompleted) {
          router.replace('/maia');
          return;
        }
      }
    } catch {
      // Continue with descent
    }
  }, [router]);

  // Auto-focus textarea when input step appears
  useEffect(() => {
    if (step === 'input' && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 600);
    }
  }, [step]);

  const getUserName = (): string | undefined => {
    try {
      const raw = localStorage.getItem('beta_user');
      if (raw) {
        const user = JSON.parse(raw);
        return user.preferredName || user.name || undefined;
      }
    } catch {
      // No name available
    }
    return undefined;
  };

  const handleSubmit = async () => {
    if (!input.trim() || input.trim().length < 5) return;

    setIsGenerating(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/api/first-descent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          originInput: input.trim(),
          userName: getUserName(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Try again.');
        setIsGenerating(false);
        return;
      }

      const data = await res.json();
      setReply(data.reply);
      setPromptVersion(data.promptVersion || '');
      setModelUsed(data.modelUsed || '');
      setStep('reply');
    } catch {
      setError('Could not connect. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnter = async () => {
    // Persist seed (fire-and-forget on server, but we await the call)
    try {
      await fetch(apiUrl('/api/first-descent/complete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          originInput: input.trim(),
          maiaReply: reply,
          promptVersion,
          modelUsed,
        }),
      });
    } catch {
      // Non-blocking — continue to /maia even if persist fails
      console.warn('[FirstDescent] Complete call failed, continuing to /maia');
    }

    // Update localStorage
    try {
      const raw = localStorage.getItem('beta_user');
      if (raw) {
        const user = JSON.parse(raw);
        user.firstDescentCompleted = true;
        localStorage.setItem('beta_user', JSON.stringify(user));
      }
    } catch {
      // Continue regardless
    }

    router.push('/maia');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim().length >= 5) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Holoflower — subtle, not dominant */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2 }}
        className="mb-10"
      >
        <div className="w-16 h-16">
          <Holoflower size="lg" glowIntensity="low" animate={false} />
        </div>
      </motion.div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Threshold ─────────────────────────────────── */}
          {step === 'threshold' && (
            <motion.div
              key="threshold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="text-center"
            >
              <p className="text-white/80 text-lg leading-relaxed font-light whitespace-pre-line">
                {OPENING_QUESTION}
              </p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                onClick={() => setStep('input')}
                className="mt-10 text-sm text-white/30 hover:text-white/60 transition-colors"
              >
                I'm ready
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Input ─────────────────────────────────────── */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <p className="text-white/40 text-sm text-center font-light">
                Not the whole story. Just the part that has weight.
              </p>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                placeholder="What's present..."
                rows={4}
                maxLength={2000}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder:text-white/20 text-base leading-relaxed outline-none focus:border-white/25 focus:bg-white/8 transition-all resize-none disabled:opacity-50"
              />

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <motion.button
                onClick={handleSubmit}
                disabled={isGenerating || input.trim().length < 5}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                    Listening...
                  </span>
                ) : (
                  'Share'
                )}
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 3: Reply ─────────────────────────────────────── */}
          {step === 'reply' && (
            <motion.div
              key="reply"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="space-y-10"
            >
              <div className="text-white/70 text-base leading-relaxed font-light">
                {reply.split('\n').map((paragraph, i) => (
                  <p key={i} className={i > 0 ? 'mt-4' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                onClick={handleEnter}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-black font-medium text-sm transition-all shadow-lg"
              >
                Enter
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="fixed bottom-6 text-white/15 text-xs"
      >
        First Descent
      </motion.p>
    </div>
  );
}
