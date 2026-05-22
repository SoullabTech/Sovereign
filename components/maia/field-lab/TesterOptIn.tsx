'use client';

/**
 * Standalone Tester opt-in toggle.
 *
 * This component is intentionally NOT yet wired into AccountSettings.tsx.
 * That file has an active typology audit pending (per `next_audit_accountsettings`
 * memory: classify before changing behavior). When the audit settles where
 * Field Lab participation belongs — likely a new "Participation" section, or
 * adjacent to Sovereignty — slot this component in.
 *
 * In the meantime, members can opt in from the Field Lab landing page itself
 * (when they hit /maia/field-lab as a non-tester) and opt out from the
 * footer of any Field Lab page.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

export function TesterOptIn() {
  const [tester, setTester] = useState<boolean | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/members/tester', { method: 'GET' });
        const json = await res.json().catch(() => ({}));
        if (!cancelled) setTester(json.tester === true);
      } catch {
        if (!cancelled) setTester(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle() {
    if (tester === null) return;
    setWorking(true);
    setError(null);
    try {
      const next = !tester;
      const res = await apiFetch('/api/members/tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tester: next }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error || 'Could not update. Try again in a moment.');
      } else {
        setTester(next);
      }
    } catch {
      setError('A connection hiccup. Try again in a moment.');
    } finally {
      setWorking(false);
    }
  }

  if (tester === null) {
    return <div className="text-[13px] text-stone-400">Loading…</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="text-[14px] font-medium text-stone-800 mb-1">
            Participate in Field Lab
          </div>
          <p className="text-[13px] leading-relaxed text-stone-500">
            Field Lab is where new MAIA surfaces live while they are still
            being formed. Opting in does not unlock anything special — it
            means your access includes surfaces that are still being shaped,
            and you are willing to notice friction and surprise.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={tester}
          onClick={toggle}
          disabled={working}
          className={[
            'relative w-12 h-6 rounded-full transition-colors shrink-0',
            tester ? 'bg-[#5a7a6f]' : 'bg-stone-300',
            working ? 'opacity-60 cursor-wait' : 'cursor-pointer',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              tester ? 'translate-x-6' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </div>
      {error && (
        <div className="text-[12.5px] text-amber-700 bg-amber-50/60 border border-amber-300/40 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
