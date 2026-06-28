'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFetch } from '@/lib/http/apiBase';

export default function OrientPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'orientation' | 'arrival' | 'fire' | 'crossing'>('orientation');
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus and auto-size textarea
  useEffect(() => {
    if (phase === 'fire' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  async function cross() {
    if (submitting) return;
    setSubmitting(true);
    setPhase('crossing');

    const arrivalEnergy = input.trim();

    // Store locally immediately
    localStorage.setItem('maia_orientation_seen', 'true');
    if (arrivalEnergy) {
      localStorage.setItem('maia_orientation_energy', arrivalEnergy);
    }

    // Persist server-side (fire-and-forget)
    apiFetch('/api/members/orientation', {
      method: 'POST',
      body: JSON.stringify({ arrival_energy: arrivalEnergy || null }),
    }).catch(() => {});

    // Brief pause so the transition feels intentional, not abrupt
    await new Promise(r => setTimeout(r, 800));
    router.replace('/maia');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await cross();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) cross();
    }
  }

  // ── Crossing (transitioning to MAIA) ─────────────────────────────────────
  if (phase === 'crossing') {
    return (
      <div className="fixed inset-0 bg-stone-950 flex items-center justify-center z-50">
        <p className="text-stone-500 text-base animate-pulse">Entering...</p>
      </div>
    );
  }

  // ── Fire phase (question) ─────────────────────────────────────────────────
  if (phase === 'fire') {
    return (
      <div className="fixed inset-0 bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-6 z-50">
        <div className="max-w-lg w-full space-y-8">
          <p className="text-stone-300 text-lg font-light leading-relaxed">
            What called you here today?
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e.target); }}
              onKeyDown={handleKeyDown}
              placeholder="A question, a dream, a feeling — anything at all."
              rows={1}
              className="w-full bg-transparent border-b border-stone-700 focus:border-stone-400 outline-none resize-none text-stone-200 text-base placeholder-stone-600 py-3 transition-colors duration-200"
            />
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={cross}
                className="text-stone-600 text-sm hover:text-stone-400 transition-colors"
              >
                I'd rather just begin
              </button>
              <button
                type="submit"
                disabled={!input.trim() || submitting}
                className="text-stone-300 text-sm disabled:text-stone-700 hover:text-stone-100 transition-colors disabled:cursor-default"
              >
                Continue →
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Orientation ("What is this place?") ──────────────────────────────────
  if (phase === 'orientation') {
    return (
      <div className="fixed inset-0 bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-6 z-50">
        <div className="max-w-lg w-full space-y-8">
          <div className="flex justify-center mb-2">
            <Image
              src="/holoflower.png"
              alt="Soullab"
              width={120}
              height={120}
              priority
            />
          </div>

          <div className="space-y-5">
            <p className="text-stone-300 text-xl font-light leading-relaxed">
              Welcome to Soullab.
            </p>
            <p className="text-stone-400 text-base leading-relaxed">
              Every person arrives with a different story.
            </p>
            <p className="text-stone-400 text-base leading-relaxed">
              I'm glad you've come.
            </p>
            <p className="text-stone-500 text-base leading-relaxed">
              MAIA is ready whenever you are.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={cross}
              className="text-stone-600 text-sm hover:text-stone-400 transition-colors"
            >
              Skip — I'll explore on my own
            </button>
            <button
              onClick={() => setPhase('arrival')}
              className="text-stone-400 text-sm hover:text-stone-200 transition-colors duration-200 border-b border-transparent hover:border-stone-600 pb-0.5"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Arrival / Threshold ───────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-6 z-50">
      <div className="max-w-lg w-full space-y-8">
        <div className="space-y-5">
          <p className="text-stone-300 text-xl font-light leading-relaxed">
            Welcome.
          </p>
          <p className="text-stone-400 text-base leading-relaxed">
            Every journey begins with a single step.
          </p>
          <p className="text-stone-400 text-base leading-relaxed">
            Some people arrive carrying a question.
            Others arrive carrying a dream.
            Some arrive without knowing why they came.
          </p>
          <p className="text-stone-400 text-base leading-relaxed">
            All of those are good places to begin.
          </p>
        </div>

        <button
          onClick={() => setPhase('fire')}
          className="text-stone-400 text-sm hover:text-stone-200 transition-colors duration-200 border-b border-transparent hover:border-stone-600 pb-0.5"
        >
          Tell me →
        </button>
      </div>
    </div>
  );
}
