'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface CircleSettingsProps {
  circleId: string;
  onLeft: () => void;
}

export function CircleSettings({ circleId, onLeft }: CircleSettingsProps) {
  const [invite, setInvite] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateInvite() {
    setGenerating(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/circles/${circleId}/invite`, { method: 'POST' });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error === 'FORBIDDEN'
          ? 'Only the circle creator can generate invites.'
          : json.error || 'Failed to generate invite');
        return;
      }

      const url = `${window.location.origin}/commons/join?token=${json.invite.token}`;
      setInvite(url);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!invite) return;
    await navigator.clipboard.writeText(invite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLeave() {
    if (!confirm('Leaving revokes everything you shared into this circle. Your original items remain private in your Field. Continue?')) {
      return;
    }

    setLeaving(true);
    try {
      await apiFetch(`/api/circles/${circleId}/leave`, { method: 'POST' });
      onLeft();
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Invite section */}
      <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5">
        <h3 className="text-sm font-semibold text-maia-ink-100">Invite link</h3>
        <p className="mt-2 text-sm text-maia-ink-60">
          Generate a link to share with people you want to invite. Generating a new link revokes
          all previous ones.
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleGenerateInvite}
            disabled={generating}
            className="rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate invite link'}
          </button>

          {invite && (
            <button
              onClick={handleCopy}
              className="rounded-xl border border-maia-navy-700 px-4 py-2 text-sm text-maia-ink-60 transition-colors hover:border-maia-ink-40"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          )}
        </div>

        {invite && (
          <div className="mt-3 break-all rounded-xl border border-maia-navy-700 bg-maia-navy-900 px-4 py-2.5 text-xs text-maia-ink-40">
            {invite}
          </div>
        )}
      </div>

      {/* Leave section */}
      <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5">
        <h3 className="text-sm font-semibold text-maia-ink-100">Leave circle</h3>
        <p className="mt-2 text-sm text-maia-ink-60">
          Leaving revokes everything you shared into this circle. Your original items remain private
          in your Field.
        </p>

        <div className="mt-4">
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {leaving ? 'Leaving...' : 'Leave circle'}
          </button>
        </div>
      </div>
    </div>
  );
}
