'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { OrganizingPrincipleRepresentation } from '@/lib/sovereign/maiaService';

interface OrganizingPrincipleCardProps {
  representation: OrganizingPrincipleRepresentation;
  conversationId?: string;
  onDismiss: () => void;
}

export function OrganizingPrincipleCard({
  representation,
  conversationId,
  onDismiss,
}: OrganizingPrincipleCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  async function handleKeep() {
    if (saving || saved) return;
    setSaving(true);
    try {
      await apiFetch('/api/sovereign/principles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: representation.title,
          principle: representation.principle,
          questionAnswered: representation.questionAnswered,
          evidence: representation.evidence,
          conversationId,
        }),
      });
      setSaved(true);
    } catch {
      // Silently degrade — the member can re-accept next time
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      {/* Header */}
      <div className="mb-3">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
          Orientation
        </p>
        <p className="text-sm font-medium text-white/80 leading-snug">
          {representation.title}
        </p>
      </div>

      {/* Principle */}
      <p className="text-sm text-white/60 leading-relaxed mb-3">
        {representation.principle}
      </p>

      {/* Evidence toggle */}
      {representation.evidence.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setEvidenceOpen(o => !o)}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            {evidenceOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {evidenceOpen ? 'Less' : 'What this emerged from'}
          </button>
          {evidenceOpen && (
            <ul className="mt-2 space-y-1 pl-2 border-l border-white/10">
              {representation.evidence.map((e, i) => (
                <li key={i} className="text-xs text-white/35 leading-snug">
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      {saved ? (
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Check className="w-3 h-3" />
          Kept as orientation
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={handleKeep}
            disabled={saving}
            className="text-xs text-white/60 hover:text-white/90 transition-colors underline underline-offset-2 disabled:opacity-40"
          >
            {saving ? 'Keeping…' : 'Keep this orientation'}
          </button>
          <button
            onClick={onDismiss}
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Not right now
          </button>
        </div>
      )}
    </div>
  );
}
