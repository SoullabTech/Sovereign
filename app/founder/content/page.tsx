'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Zap } from 'lucide-react';
import type { OpsContentItem, ContentStatus } from '@/lib/founder/types';

const STATUSES: { key: ContentStatus; label: string }[] = [
  { key: 'captured', label: 'Captured' },
  { key: 'drafting', label: 'Drafting' },
  { key: 'review', label: 'Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'published', label: 'Published' },
];

const ENERGY_COLORS: Record<string, string> = {
  high: 'text-[var(--sl-state-success)]',
  medium: 'text-[var(--sl-accent-admin)]',
  low: 'text-[var(--sl-text-muted)]',
  unknown: 'text-[var(--sl-text-muted)]',
};

export default function ContentPage() {
  const [items, setItems] = useState<OpsContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/founder/content')
      .then(r => r.ok ? r.json() : { items: [] })
      .then(d => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = (status: ContentStatus) => items.filter(i => i.status === status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sl-text-primary)]">Content</h1>
          <p className="text-sm text-[var(--sl-text-muted)]">Ideas, drafts, posts, emails, invitations</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sl-accent-admin)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Capture Idea
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--sl-text-muted)]">Loading content...</p>
      ) : (
        <div className="space-y-8">
          {STATUSES.map(status => {
            const statusItems = byStatus(status.key);
            if (statusItems.length === 0 && status.key === 'published') return null; // hide empty published
            return (
              <section key={status.key}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] uppercase tracking-wider">
                    {status.label}
                  </h2>
                  <span className="text-xs text-[var(--sl-text-muted)]">({statusItems.length})</span>
                </div>

                {statusItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--sl-border-subtle)] p-6 text-center">
                    <p className="text-xs text-[var(--sl-text-muted)]">
                      {status.key === 'captured' ? 'No ideas yet. Capture one above.' : `No items in ${status.label.toLowerCase()}.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {statusItems.map(item => (
                      <div key={item.id} className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-[var(--sl-text-primary)]">{item.title}</p>
                          {item.priority_signal && (
                            <Zap className="w-4 h-4 text-[var(--sl-accent-admin)] flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--sl-bg-elevated)] text-[var(--sl-text-muted)]">
                            {item.content_type}
                          </span>
                          <span className={`text-xs ${ENERGY_COLORS[item.energy]}`}>
                            {item.energy !== 'unknown' ? item.energy + ' energy' : ''}
                          </span>
                        </div>
                        {item.target_channel && (
                          <p className="text-xs text-[var(--sl-text-muted)] mt-2">
                            Target: {item.target_channel}
                          </p>
                        )}
                        <p className="text-xs text-[var(--sl-text-muted)] mt-2">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
