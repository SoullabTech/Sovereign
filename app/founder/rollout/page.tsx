'use client';

import { useState, useEffect } from 'react';
import { Rocket, UserCheck, UserX, Clock } from 'lucide-react';
import type { RolloutSummary } from '@/lib/founder/types';

export default function RolloutPage() {
  const [data, setData] = useState<RolloutSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/founder/rollout')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--sl-text-primary)]">Rollout</h1>
        <p className="text-sm text-[var(--sl-text-muted)]">Beta tester lifecycle and activation</p>
      </div>

      {/* Funnel */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3">Activation Funnel</h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.funnel?.length ? (
          <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-6 text-center">
            <Rocket className="w-8 h-8 mx-auto text-[var(--sl-text-muted)] mb-2" />
            <p className="text-sm text-[var(--sl-text-muted)]">No beta testers tracked yet.</p>
            <p className="text-xs text-[var(--sl-text-muted)] mt-1">Add contacts with type &quot;beta_tester&quot; in Pipeline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.funnel.map(f => (
              <div key={f.stage} className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-4 text-center">
                <p className="text-2xl font-bold text-[var(--sl-text-primary)]">{f.count}</p>
                <p className="text-xs text-[var(--sl-text-muted)] mt-1 capitalize">{f.stage}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stalled */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Stalled (no activity &gt;7d)
        </h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.stalled?.length ? (
          <div className="rounded-lg border border-dashed border-[var(--sl-border-subtle)] p-6 text-center">
            <p className="text-xs text-[var(--sl-text-muted)]">No stalled testers. Everyone is progressing.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.stalled.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-[var(--sl-state-warning)]/30 bg-[var(--sl-bg-surface)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-text-primary)]">{c.name}</p>
                  <p className="text-xs text-[var(--sl-text-muted)]">{c.pipeline_stage} &middot; Last contact: {c.last_contacted ? new Date(c.last_contacted).toLocaleDateString() : 'never'}</p>
                </div>
                <UserX className="w-4 h-4 text-[var(--sl-state-warning)]" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent activations */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Recent Activations
        </h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.recent_activations?.length ? (
          <div className="rounded-lg border border-dashed border-[var(--sl-border-subtle)] p-6 text-center">
            <p className="text-xs text-[var(--sl-text-muted)]">No recent activations to show.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recent_activations.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-text-primary)]">{c.name}</p>
                  <p className="text-xs text-[var(--sl-text-muted)]">{c.pipeline_stage} &middot; {c.source || 'unknown source'}</p>
                </div>
                <UserCheck className="w-4 h-4 text-[var(--sl-state-success)]" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
