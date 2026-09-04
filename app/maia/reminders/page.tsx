'use client';

/**
 * "Your reminders" — the authenticated pre-delivery cancellation surface.
 *
 * Tier 1 is a one-shot act, so a cancel link that appears only in the delivery
 * email arrives at the same moment as the thing it would cancel. This page (and
 * the confirmation email) are what give the member authority BEFORE the send.
 *
 * The page states what is scheduled and lets them stop it. It does not
 * encourage more reminders, celebrate any of it, or report anything about how
 * often they visit — there is nothing here that counts.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface Reminder {
  id: string;
  delivery_at: string;
  delivery_timezone: string;
  delivery_text: string;
  cancelled_at: string | null;
  dispatch_started_at: string | null;
  delivered_at: string | null;
  failure_code: string | null;
}

function when(r: Reminder): string {
  try {
    const at = new Date(r.delivery_at);
    const d = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: r.delivery_timezone,
    }).format(at);
    const t = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: r.delivery_timezone,
    }).format(at);
    return `${d} at ${t}`;
  } catch {
    return new Date(r.delivery_at).toLocaleString();
  }
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    const res = await apiFetch('/api/reminders');
    if (res.ok) setReminders((await res.json()).reminders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancel(id: string) {
    const res = await apiFetch(`/api/reminders/${id}`, { method: 'DELETE' });
    const body = await res.json().catch(() => ({}));
    // Truthful: an already-sending reminder is reported as such, not as a
    // cancellation that did not happen.
    if (body?.state === 'already_sending') {
      setNotice('That one had already started sending, so it could not be stopped.');
    }
    await load();
  }

  if (loading) return <p className="p-6 text-sm text-neutral-500">Loading…</p>;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-lg text-neutral-800">Your reminders</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Notes you asked us to send you. You can cancel any of them before they send.
      </p>

      {notice && <p className="mt-4 rounded bg-neutral-100 p-3 text-sm text-neutral-700">{notice}</p>}

      {reminders.length === 0 && (
        <p className="mt-8 text-sm text-neutral-500">Nothing scheduled.</p>
      )}

      <ul className="mt-6 space-y-4">
        {reminders.map((r) => {
          const pending = !r.cancelled_at && !r.delivered_at && !r.failure_code;
          return (
            <li key={r.id} className="rounded-lg border border-neutral-200 p-4">
              <p className="whitespace-pre-wrap text-sm text-neutral-800">{r.delivery_text}</p>
              <p className="mt-2 text-xs text-neutral-500">
                {r.delivered_at
                  ? `Sent ${when(r)}`
                  : r.cancelled_at
                    ? 'Cancelled'
                    : r.failure_code
                      ? 'Not sent'
                      : `Scheduled for ${when(r)}`}
              </p>
              {pending && (
                <button
                  type="button"
                  onClick={() => cancel(r.id)}
                  className="mt-3 text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-800"
                >
                  Cancel this reminder
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
