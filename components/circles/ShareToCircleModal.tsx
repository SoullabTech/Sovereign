'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import Link from 'next/link';

type CircleListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  myRole: string;
  consentMode: 'manual' | 'not_now';
};

interface ShareToCircleModalProps {
  open: boolean;
  onClose: () => void;
  artifactType: string;
  artifactRef: string;
  defaultTitle?: string;
  defaultSummary?: string;
}

type Step = 'choose' | 'confirm';

export function ShareToCircleModal({
  open,
  onClose,
  artifactType,
  artifactRef,
  defaultTitle,
  defaultSummary,
}: ShareToCircleModalProps) {
  const [circles, setCircles] = useState<CircleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('choose');
  const [selectedCircle, setSelectedCircle] = useState<CircleListItem | null>(null);
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [summary, setSummary] = useState(defaultSummary ?? '');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Reset state on open
    setStep('choose');
    setSelectedCircle(null);
    setTitle(defaultTitle ?? '');
    setSummary(defaultSummary ?? '');
    setError(null);
    setSuccess(false);

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/circles');
        const json = await res.json();
        if (!cancelled) setCircles(json.circles ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, defaultTitle, defaultSummary]);

  if (!open) return null;

  const sharingCircles = circles.filter((c) => c.consentMode === 'manual');

  async function handleShare() {
    if (!selectedCircle) return;

    setSharing(true);
    setError(null);

    try {
      const res = await apiFetch('/api/circles/shared', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circleId: selectedCircle.id,
          artifactType,
          artifactRef,
          contentMode: 'summary_only',
          sharedTitle: title.trim() || null,
          sharedSummary: summary.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error === 'CONSENT_REQUIRED') {
          setError('You need to enable sharing for this circle first.');
        } else {
          setError(json.error || 'Failed to share');
        }
        return;
      }

      setSuccess(true);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-t-2xl border border-maia-navy-700 bg-maia-navy-900 p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-maia-ink-100">Offer to circle</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-maia-ink-40 transition-colors hover:text-maia-ink-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-xs text-maia-ink-40">
          You're offering a reflection from your work. You can revoke anytime. Revoking removes it
          from the circle feed. It does not delete your original.
        </p>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm font-medium text-maia-sage-400">Offered to circle</p>
            <p className="text-xs text-maia-ink-40 italic" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
              Some people share these.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href={`/commons/circles/${selectedCircle?.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs text-maia-spice-400 hover:text-maia-spice-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View in Circle
              </Link>
              <button
                onClick={onClose}
                className="text-xs text-maia-ink-40 hover:text-maia-ink-60 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : step === 'choose' ? (
          <>
            {loading ? (
              <p className="py-4 text-sm text-maia-ink-40">Loading circles...</p>
            ) : sharingCircles.length === 0 ? (
              <div className="py-4">
                <p className="text-sm text-maia-ink-60">
                  {circles.length === 0
                    ? 'You are not a member of any circles yet.'
                    : 'None of your circles have sharing enabled. Enable manual sharing in a circle first.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sharingCircles.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCircle(c);
                      setStep('confirm');
                    }}
                    className="w-full rounded-xl border border-maia-navy-700 bg-maia-navy-850 p-3 text-left transition-colors hover:border-maia-spice-500/30"
                  >
                    <span className="text-sm font-medium text-maia-ink-100">{c.name}</span>
                    {c.description && (
                      <span className="ml-2 text-xs text-maia-ink-40">{c.description}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="mb-3 text-xs text-maia-ink-40">
              Offering to <span className="font-medium text-maia-ink-80">{selectedCircle?.name}</span>
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="share-title" className="block text-xs font-medium text-maia-ink-60">
                  Title
                </label>
                <input
                  id="share-title"
                  type="text"
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you sharing?"
                  className="mt-1 w-full rounded-xl border border-maia-navy-700 bg-maia-navy-850 px-3 py-2 text-sm text-maia-ink-100 placeholder:text-maia-ink-40 focus:border-maia-spice-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="share-summary" className="block text-xs font-medium text-maia-ink-60">
                  Summary <span className="text-maia-ink-40">(optional)</span>
                </label>
                <textarea
                  id="share-summary"
                  maxLength={1200}
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Add context for circle members..."
                  className="mt-1 w-full rounded-xl border border-maia-navy-700 bg-maia-navy-850 px-3 py-2 text-sm text-maia-ink-100 placeholder:text-maia-ink-40 focus:border-maia-spice-500/50 focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep('choose')}
                className="rounded-xl border border-maia-navy-700 px-4 py-2 text-sm text-maia-ink-60 transition-colors hover:border-maia-ink-40"
              >
                Back
              </button>
              <button
                onClick={handleShare}
                disabled={sharing || success}
                className="flex-1 rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm font-medium text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20 disabled:opacity-50"
              >
                {sharing ? 'Offering...' : 'Offer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
