'use client';

import { useState } from 'react';
import { ExternalLink, Check, Loader2 } from 'lucide-react';
import type { MediaIntegrationRow } from '@/lib/media/types';

interface DescriptLinkFieldProps {
  projectId: string;
  integration?: MediaIntegrationRow | null;
  onSaved?: () => void;
}

export function DescriptLinkField({ projectId, integration, onSaved }: DescriptLinkFieldProps) {
  const [url, setUrl] = useState(integration?.external_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!url.trim()) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/media/projects/${projectId}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'descript', externalUrl: url }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs text-white/40">Descript Project URL</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.descript.com/..."
          className="flex-1 bg-[#1a1a2e] border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={handleSave}
          disabled={saving || !url.trim()}
          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm rounded transition-colors flex items-center gap-1"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
           saved ? <Check className="w-4 h-4" /> : 'Save'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {integration?.external_url && (
        <a
          href={integration.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
        >
          <ExternalLink className="w-3 h-3" />
          Open in Descript
        </a>
      )}
    </div>
  );
}
