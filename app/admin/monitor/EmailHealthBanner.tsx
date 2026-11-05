'use client';

// Is email working? One line at the top of Monitor, from the delivery ledger.
// Never says "working" without a recorded accepted send.

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';

type Payload = {
  health: {
    status: 'working' | 'failing' | 'unknown';
    lastAcceptedAt: string | null;
    failingSince: string | null;
    failureClass: string | null;
    failingPurposes: string[];
  };
  smtpConfigured: boolean;
  alertRecipientConfigured: boolean;
};

function when(value: string | null): string {
  if (!value) return 'never';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 'unknown' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function EmailHealthBanner() {
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    adminFetch('/api/admin/monitor/email-health', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as Payload;
        if (live) setData(json);
      })
      .catch(() => live && setFailed(true));
    return () => { live = false; };
  }, []);

  if (failed) {
    return (
      <div className="rounded border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-200">
        Email health could not be read. That is not the same as email working.
      </div>
    );
  }
  if (!data) return null;
  const h = data.health;

  const tone =
    h.status === 'failing'
      ? 'border-rose-400/40 bg-rose-400/10 text-rose-200'
      : h.status === 'working'
        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
        : 'border-amber-300/40 bg-amber-300/10 text-amber-200';

  return (
    <div className={`rounded border px-3 py-2 text-sm ${tone}`}>
      {h.status === 'failing' && (
        <>
          <strong>Email is failing</strong> since {when(h.failingSince)} ({h.failureClass ?? 'unnamed'}). Last sent{' '}
          {when(h.lastAcceptedAt)}. Affects: {h.failingPurposes.join(', ') || 'unnamed'}.
        </>
      )}
      {h.status === 'working' && <>Email is working. Last sent {when(h.lastAcceptedAt)}.</>}
      {h.status === 'unknown' && <>No email sends recorded yet, so email health is unknown.</>}
      {!data.smtpConfigured && <> Mail settings are not present on this server.</>}
      {!data.alertRecipientConfigured && <> No alert recipient is configured.</>}
    </div>
  );
}
