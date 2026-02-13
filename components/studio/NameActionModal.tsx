'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface EdgeItem {
  id: string;
  type: 'change' | 'decision';
  title: string;
  description: string;
  reason: string;
  urgency?: string;
  status: string;
  createdAt: string;
}

interface NameActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  edgeItem: EdgeItem;
  onSuccess: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Duration options
// ─────────────────────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '2 hours' },
];

function categoryFromType(type: 'change' | 'decision'): string {
  return type === 'change' ? 'Change Navigation' : 'Decision Counsel';
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function NameActionModal({
  isOpen,
  onClose,
  edgeItem,
  onSuccess,
}: NameActionModalProps) {
  const [name, setName] = useState(edgeItem.title.slice(0, 120));
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const category = categoryFromType(edgeItem.type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError('A name is needed.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Sanitise: only edge metadata passes through — strip newlines, enforce length
      const safeName = name.trim().replace(/\n/g, ' ').slice(0, 120);
      const safeDesc = description.trim().replace(/\n+/g, ' ').slice(0, 300) || null;

      const res = await apiFetch('/api/studio/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: safeName,
          description: safeDesc,
          category,
          durationMinutes: duration,
          priceCents: 0,
          isActive: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create service');
      }

      setCreated(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md mx-4 bg-[#16162a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-white font-medium">Name as service</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source context */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="capitalize">{edgeItem.type}</span>
                <span className="text-slate-700">&middot;</span>
                <span className="truncate">{edgeItem.reason}</span>
              </div>
            </div>

            {/* Form */}
            {created ? (
              <div className="px-6 pb-8 pt-4 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-white text-sm">Service created</p>
                <p className="text-slate-500 text-xs">{name}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Service name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name this service..."
                    maxLength={120}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Description
                    <span className="text-slate-600 normal-case tracking-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What this session holds..."
                    rows={2}
                    maxLength={300}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition resize-none"
                  />
                </div>

                {/* Category (read-only, auto-derived) */}
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Category
                  </label>
                  <div className="px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-sm text-slate-400">
                    {category}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Duration
                  </label>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDuration(opt.value)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs transition border ${
                          duration === opt.value
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 rounded-xl text-sm text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Create service
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
