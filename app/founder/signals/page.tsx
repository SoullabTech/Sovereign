'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import type { SignalsSummary } from '@/lib/founder/types';

const SEVERITY_STYLES = {
  critical: 'border-[var(--sl-state-error)]/50 bg-[var(--sl-state-error)]/5',
  warning: 'border-[var(--sl-state-warning)]/50 bg-[var(--sl-state-warning)]/5',
  info: 'border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)]',
};

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

export default function SignalsPage() {
  const [data, setData] = useState<SignalsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/founder/signals')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--sl-text-primary)]">Signals</h1>
        <p className="text-sm text-[var(--sl-text-muted)]">Health, momentum, risks</p>
      </div>

      {/* Health signals */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Platform Signals
        </h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.signals?.length ? (
          <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-6 text-center">
            <Activity className="w-8 h-8 mx-auto text-[var(--sl-text-muted)] mb-2" />
            <p className="text-sm text-[var(--sl-text-muted)]">No signals yet. Data will appear as ops activity accumulates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.signals.map(s => {
              const TrendIcon = s.trend ? TREND_ICON[s.trend] : null;
              return (
                <div key={s.id} className={`rounded-lg border p-4 ${SEVERITY_STYLES[s.severity]}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-[var(--sl-text-muted)] uppercase tracking-wider">{s.category}</p>
                      <p className="text-sm font-medium text-[var(--sl-text-primary)] mt-1">{s.message}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {s.value !== null && (
                        <span className="text-lg font-bold text-[var(--sl-text-primary)]">{s.value}</span>
                      )}
                      {TrendIcon && (
                        <TrendIcon className={`w-4 h-4 ${
                          s.trend === 'up' ? 'text-[var(--sl-state-success)]' :
                          s.trend === 'down' ? 'text-[var(--sl-state-error)]' :
                          'text-[var(--sl-text-muted)]'
                        }`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Stuck tasks */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Stuck Tasks (in_progress &gt;3d)
        </h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.stuck_tasks?.length ? (
          <div className="rounded-lg border border-dashed border-[var(--sl-border-subtle)] p-4 text-center">
            <p className="text-xs text-[var(--sl-text-muted)]">Nothing stuck. Tasks are flowing.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.stuck_tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-[var(--sl-state-warning)]/30 bg-[var(--sl-bg-surface)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-text-primary)]">{t.title}</p>
                  <p className="text-xs text-[var(--sl-text-muted)]">{t.category} &middot; stuck since {new Date(t.state_changed_at).toLocaleDateString()}</p>
                </div>
                <AlertTriangle className="w-4 h-4 text-[var(--sl-state-warning)]" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stale contacts */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3">Stale Contacts (no contact &gt;14d)</h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.stale_contacts?.length ? (
          <div className="rounded-lg border border-dashed border-[var(--sl-border-subtle)] p-4 text-center">
            <p className="text-xs text-[var(--sl-text-muted)]">No stale relationships. Pipeline is healthy.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.stale_contacts.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-text-primary)]">{c.name}</p>
                  <p className="text-xs text-[var(--sl-text-muted)]">{c.contact_type} &middot; {c.pipeline_stage} &middot; last: {c.last_contacted ? new Date(c.last_contacted).toLocaleDateString() : 'never'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
