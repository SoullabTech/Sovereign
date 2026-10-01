'use client';

/**
 * MEMBER-ADULT-ACK-01 — one-time sign-in prompt.
 *
 * Members who have not yet given their own 18+ confirmation (everyone who
 * registered before 2026-10-01) are asked once, on a member surface, and the
 * answer is recorded as their act. Members who confirmed at registration never
 * see it.
 *
 * This is a prompt, not the record: the record is member_acknowledgments, and
 * a member with no row is simply asked again. If the check cannot be made
 * (signed out, offline, server unavailable) nothing is shown.
 */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { ADULT_ACK_COPY, ADULT_ACK_KIND } from '@/lib/members/adultConfirmation';

/** Member surfaces only. Public, sign-in and registration pages never ask. */
const MEMBER_SURFACE_PREFIXES = [
  '/maia',
  '/studio',
  '/writers-studio',
  '/book-studio',
  '/vision-studio',
  '/soullab-studio',
  '/commons',
  '/onboarding',
];

function isMemberSurface(path: string | null): boolean {
  if (!path) return false;
  return MEMBER_SURFACE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export function AdultAcknowledgmentGate() {
  const pathname = usePathname();
  const [needed, setNeeded] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMemberSurface(pathname) || needed) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/members/acknowledgments');
        if (!res.ok) return; // signed out or unavailable: do not ask now
        const data = (await res.json()) as { missing?: Array<{ kind: string }> };
        if (!cancelled && data.missing?.some((m) => m.kind === ADULT_ACK_KIND)) setNeeded(true);
      } catch {
        /* offline: ask another time */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, needed]);

  if (!needed) return null;

  const confirm = async () => {
    if (!checked || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/members/acknowledgments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: ADULT_ACK_KIND, confirms: true }),
      });
      if (res.ok) {
        setNeeded(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error || 'Could not record. Please try again.');
    } catch {
      setError('Could not reach Soullab. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adult-ack-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-stone-900 p-6 text-stone-100 shadow-xl">
        <h2 id="adult-ack-title" className="text-lg font-medium">
          One thing before you continue
        </h2>
        <p className="mt-3 text-sm text-stone-300">
          Soullab is open to adults only for now. We&apos;re asking every member to confirm this
          once, in their own words, rather than assuming it.
        </p>
        <label className="mt-5 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>{ADULT_ACK_COPY}</span>
        </label>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        <button
          type="button"
          onClick={confirm}
          disabled={!checked || saving}
          className="mt-6 w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
