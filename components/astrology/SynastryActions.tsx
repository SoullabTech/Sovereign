'use client';

import { useState, useEffect } from 'react';
import { getOrCreateExplorerId } from '@/lib/identity/explorerId';

interface SynastryActionsProps {
  analysisId: string;
  initialSavedAt: string | null;
}

export function SynastryActions({ analysisId, initialSavedAt }: SynastryActionsProps) {
  const [savedAt, setSavedAt] = useState<string | null>(initialSavedAt);
  const [saving, setSaving] = useState(false);
  const [memberId, setMemberId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMemberId(getOrCreateExplorerId());
  }, []);

  async function toggleSave() {
    if (!analysisId || !memberId || saving) return;

    setSaving(true);
    try {
      const res = await fetch('/api/astrology/synastry/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          memberId,
          saved: !savedAt,
        }),
      });

      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || 'Save failed');

      setSavedAt(json.savedAt ?? null);
    } catch (e) {
      console.error('Failed to save synastry:', e);
    } finally {
      setSaving(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/astrology/synastry/${analysisId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isSaved = savedAt !== null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>

      {memberId && (
        <button
          onClick={toggleSave}
          disabled={saving}
          className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
            isSaved
              ? 'border-violet-500/30 bg-violet-500/20 text-violet-200'
              : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
          } disabled:opacity-50`}
          title={isSaved ? 'Remove from Timeline' : 'Save to Timeline'}
        >
          {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save to Timeline'}
        </button>
      )}
    </div>
  );
}
