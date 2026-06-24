'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { X } from 'lucide-react';

interface AtomItem {
  id: string;
  title: string;
  status: string;
}

interface StillAlivePanelProps {
  onDismiss: () => void;
}

export function StillAlivePanel({ onDismiss }: StillAlivePanelProps) {
  const [atoms, setAtoms] = useState<AtomItem[]>([]);
  const [label, setLabel] = useState<'still_alive' | 'recent'>('still_alive');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await apiFetch('/api/psyche/portfolio/atoms?view=still_alive');
        if (!r.ok) throw new Error('still_alive fetch failed');
        const data = await r.json();
        const items: AtomItem[] = (data.atoms ?? data ?? []).map((a: any) => ({
          id: a.id,
          title: a.title,
          status: a.status,
        }));
        if (cancelled) return;
        if (items.length > 0) {
          setAtoms(items);
          setLabel('still_alive');
        } else {
          // Fall back to recent active atoms
          const r2 = await apiFetch('/api/psyche/portfolio/atoms?view=chronological');
          if (!r2.ok) throw new Error('chronological fetch failed');
          const data2 = await r2.json();
          const recent: AtomItem[] = (data2.atoms ?? data2 ?? []).slice(0, 8).map((a: any) => ({
            id: a.id,
            title: a.title,
            status: a.status,
          }));
          if (!cancelled) {
            setAtoms(recent);
            setLabel('recent');
          }
        }
      } catch {
        // Silently degrade — panel shows empty state
        if (!cancelled) setAtoms([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const heading = label === 'still_alive' ? 'Still Alive' : 'Recent living threads';

  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
            {heading}
          </p>
          <p className="text-xs text-white/30">
            What has remained alive
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/30 hover:text-white/60 transition-colors mt-0.5"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-3 rounded bg-white/5 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
          ))}
        </div>
      ) : atoms.length === 0 ? (
        <p className="text-xs text-white/25 italic">Nothing has been kept yet.</p>
      ) : (
        <ul className="space-y-2">
          {atoms.map(atom => (
            <li key={atom.id} className="text-sm text-white/60 leading-snug">
              {atom.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
