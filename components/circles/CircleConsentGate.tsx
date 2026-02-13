'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface CircleConsentGateProps {
  circleId: string;
  consentMode: 'manual' | 'not_now';
  onUpdated: (next: 'manual' | 'not_now') => void;
}

export function CircleConsentGate({ circleId, consentMode, onUpdated }: CircleConsentGateProps) {
  const [mode, setMode] = useState<'manual' | 'not_now'>(consentMode);
  const [saving, setSaving] = useState(false);

  // Only show the gate when consent is not yet granted
  if (consentMode === 'manual') return null;

  return (
    <div className="mb-6 rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5">
      <h2 className="text-lg font-semibold text-maia-ink-100">Your privacy is the default</h2>
      <p className="mt-2 text-sm text-maia-ink-60">
        In Soullab, circles don't grant anyone access to your inner work. Your Field, sessions, and
        MAIA conversations remain private unless you explicitly share something.
      </p>

      <div className="mt-4 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="consent"
            checked={mode === 'manual'}
            onChange={() => setMode('manual')}
            className="mt-1 accent-maia-spice-400"
          />
          <div>
            <span className="text-sm font-medium text-maia-ink-100">
              Manual sharing only (recommended)
            </span>
            <p className="mt-0.5 text-xs text-maia-ink-40">
              You choose what to share, one item at a time. You can revoke anytime.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="consent"
            checked={mode === 'not_now'}
            onChange={() => setMode('not_now')}
            className="mt-1 accent-maia-spice-400"
          />
          <div>
            <span className="text-sm font-medium text-maia-ink-100">Not now</span>
            <p className="mt-0.5 text-xs text-maia-ink-40">
              Stay in the circle without sharing anything. You can change this later.
            </p>
          </div>
        </label>
      </div>

      <p className="mt-4 text-xs text-maia-ink-40">
        Sanctuary is absolute. Nothing in Sanctuary can be shared or signaled.
      </p>

      <div className="mt-4">
        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              const res = await apiFetch(`/api/circles/${circleId}/consent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consentMode: mode }),
              });

              if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Failed to save consent');
              }

              onUpdated(mode);
            } finally {
              setSaving(false);
            }
          }}
          className="rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm font-medium text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
