'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, Users, Activity, Plus } from 'lucide-react';
import type { TodaySummary } from '@/lib/founder/types';

function StatCard({ label, value, icon: Icon, accent }: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-4">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${accent || 'text-[var(--sl-text-muted)]'}`} />
        <div>
          <p className="text-xs text-[var(--sl-text-muted)]">{label}</p>
          <p className="text-lg font-semibold text-[var(--sl-text-primary)]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [data, setData] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/founder/today')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sl-text-primary)]">Today</h1>
          <p className="text-sm text-[var(--sl-text-muted)]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sl-accent-admin)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Quick Add
        </button>
      </div>

      {/* Vitals row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Conversations (24h)"
          value={data?.vitals?.total_conversations_24h ?? '—'}
          icon={Activity}
          accent="text-[var(--sl-state-info)]"
        />
        <StatCard
          label="Active Members (7d)"
          value={data?.vitals?.active_members_7d ?? '—'}
          icon={Users}
          accent="text-[var(--sl-state-success)]"
        />
        <StatCard
          label="Errors (24h)"
          value={data?.vitals?.error_count_24h ?? '—'}
          icon={AlertTriangle}
          accent="text-[var(--sl-state-error)]"
        />
        <StatCard
          label="Overdue Tasks"
          value={data?.overdue_tasks?.length ?? '—'}
          icon={CalendarCheck}
          accent="text-[var(--sl-state-warning)]"
        />
      </div>

      {/* Overdue tasks */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3">Overdue</h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.overdue_tasks?.length ? (
          <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-6 text-center">
            <p className="text-sm text-[var(--sl-text-muted)]">Nothing overdue. Clean slate.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.overdue_tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-[var(--sl-state-warning)]/30 bg-[var(--sl-bg-surface)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-text-primary)]">{t.title}</p>
                  <p className="text-xs text-[var(--sl-text-muted)]">{t.category} &middot; {t.priority}</p>
                </div>
                <span className="text-xs text-[var(--sl-state-warning)]">
                  {t.due_date ? new Date(t.due_date).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Today's tasks */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3">Today&apos;s Tasks</h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.today_tasks?.length ? (
          <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-6 text-center">
            <p className="text-sm text-[var(--sl-text-muted)]">No tasks due today. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.today_tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-text-primary)]">{t.title}</p>
                  <p className="text-xs text-[var(--sl-text-muted)]">{t.category} &middot; {t.priority}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  t.status === 'in_progress' ? 'bg-[var(--sl-state-info)]/20 text-[var(--sl-state-info)]' : 'bg-[var(--sl-bg-elevated)] text-[var(--sl-text-muted)]'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Follow-ups due */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3">Follow-ups Due</h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.followups_due?.length ? (
          <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-6 text-center">
            <p className="text-sm text-[var(--sl-text-muted)]">No follow-ups due. Pipeline is quiet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.followups_due.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--sl-text-primary)]">{c.name}</p>
                  <p className="text-xs text-[var(--sl-text-muted)]">{c.contact_type} &middot; {c.pipeline_stage}</p>
                </div>
                <span className="text-xs text-[var(--sl-text-muted)]">{c.next_action}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--sl-text-secondary)] mb-3">Recent Activity</h2>
        {loading ? (
          <p className="text-sm text-[var(--sl-text-muted)]">Loading...</p>
        ) : !data?.recent_activity?.length ? (
          <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-6 text-center">
            <p className="text-sm text-[var(--sl-text-muted)]">No activity yet. Start adding tasks and contacts.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.recent_activity.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 px-3 text-xs text-[var(--sl-text-muted)]">
                <span className="w-16 flex-shrink-0">
                  {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[var(--sl-text-secondary)]">
                  {a.action} {a.entity_type}
                </span>
                <span className="truncate">{(a.details as Record<string, string>).title || (a.details as Record<string, string>).name || ''}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
