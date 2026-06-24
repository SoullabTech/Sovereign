'use client';

import { useEffect, useState } from 'react';
import {
  NOTIFICATION_EVENT_TYPES,
  EVENT_LABELS,
  type NotificationEventType,
  type ResolvedPreference,
} from '@/lib/team/notificationTypes';

// Co-lab Notifications panel. v1 surfaces the EMAIL channel per event type — the
// live, opt-out-able delivery. The in-app badge is always on (shown as static
// info, not a dead toggle); SMS is deferred to a later phase.
export function NotificationSettings() {
  const [emailEnabled, setEmailEnabled] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/api/team/notifications/preferences')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((d: { preferences: ResolvedPreference[] }) => {
        if (!alive) return;
        const map: Record<string, boolean> = {};
        for (const p of d.preferences) {
          if (p.channel === 'email') map[p.event_type] = p.enabled;
        }
        setEmailEnabled(map);
      })
      .catch(() => { if (alive) setError('Could not load your notification settings.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const toggle = async (event: NotificationEventType) => {
    const next = !emailEnabled[event];
    setEmailEnabled(prev => ({ ...prev, [event]: next })); // optimistic
    setSaving(event);
    setError('');
    try {
      const res = await fetch('/api/team/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: event, channel: 'email', enabled: next }),
      });
      if (!res.ok) throw new Error('save failed');
    } catch {
      setEmailEnabled(prev => ({ ...prev, [event]: !next })); // rollback
      setError('Could not save that change. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <header className="mb-6">
          <h1 className="text-lg font-semibold text-white/90">Notifications</h1>
          <p className="mt-1 text-sm text-white/45">
            Choose when Soullab emails you. The in-app badge always stays on, so you
            never miss anything inside Co-lab.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : (
          <div className="rounded-xl border border-white/8 bg-[#16162a] divide-y divide-white/5">
            {NOTIFICATION_EVENT_TYPES.map(event => {
              const label = EVENT_LABELS[event];
              const on = emailEnabled[event] ?? false;
              return (
                <div key={event} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm text-white/85">{label.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{label.detail}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-white/30">Email</span>
                    <Switch on={on} disabled={saving === event} onClick={() => toggle(event)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
          In-app badge is always on. Text / SMS notifications are coming later.
        </div>
      </div>
    </div>
  );
}

function Switch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        on ? 'bg-amber-500' : 'bg-white/15'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
