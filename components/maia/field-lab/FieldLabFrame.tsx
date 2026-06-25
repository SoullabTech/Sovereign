'use client';

/**
 * Shared frame for Field Lab pages.
 *
 * Carries:
 *   - The Field Lab header chrome
 *   - The experimental-posture status row
 *   - The entitlement gate, via <PreviewGate> on `labs.preview`
 *
 * If the member is not entitled, this frame shows the opt-in invitation instead
 * of the experiment surface — without making the absence punitive. The
 * non-entitled state explains what Field Lab is, what opting in means, and what
 * it does not mean.
 *
 * `labs.preview` is the entitlement generalization of the live `members.tester`
 * proto-entitlement; the opt-in/opt-out below still toggle the tester flag
 * (which is what `labs.preview` currently resolves from), so behavior is
 * unchanged by the extraction.
 *
 * Invariant: this frame does NOT optimize for conversion. The opt-in copy must
 * read as honest invitation, not as a CTA. If you find yourself adjusting it to
 * "improve activation," you have misread what this surface is.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { PreviewGate } from '@/components/auth/PreviewGate';

interface FieldLabFrameProps {
  title: string;
  /** Optional sub-label rendered next to the title (e.g. "Experimental · Observation phase"). */
  status?: string;
  /** Optional "what is being explored" sentence rendered on this page. */
  exploring?: string;
  children: React.ReactNode;
}

export function FieldLabFrame({
  title,
  status,
  exploring,
  children,
}: FieldLabFrameProps) {
  const router = useRouter();

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)',
      }}
    >
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f5]/80 border-b border-stone-200/40">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-stone-700 hover:text-stone-900 hover:-translate-x-0.5 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="h-4 w-px bg-stone-300/60" />
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-stone-500" strokeWidth={2} />
            <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
              Field Lab
              {title ? <span className="text-stone-400"> · {title}</span> : null}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {status && (
          <div className="mb-6 flex flex-wrap gap-2">
            {status.split('·').map((s, i) => (
              <span
                key={i}
                className="text-[11px] uppercase tracking-wider text-stone-500 bg-stone-100/80 rounded-full px-3 py-1 border border-stone-200/70"
              >
                {s.trim()}
              </span>
            ))}
          </div>
        )}
        {exploring && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 rounded-2xl border border-stone-200 bg-white/50 p-5"
          >
            <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">
              What this room is exploring
            </div>
            <p className="text-[14.5px] leading-relaxed text-stone-700">
              {exploring}
            </p>
          </motion.div>
        )}

        <PreviewGate
          entitlement="labs.preview"
          signedOut={<NotSignedInView />}
          preview={<OptInInvitation />}
        >
          {children}
          <TesterOptOutFooter />
        </PreviewGate>
      </main>
    </div>
  );
}

function TesterOptOutFooter() {
  const [working, setWorking] = useState(false);

  async function optOut() {
    if (!confirm('Stop participating in Field Lab? You will lose access to its surfaces. This is reversible.')) {
      return;
    }
    setWorking(true);
    try {
      const res = await apiFetch('/api/members/tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tester: false }),
      });
      if (res.ok) {
        window.location.href = '/maia';
        return;
      }
    } catch {}
    setWorking(false);
  }

  return (
    <div className="mt-16 pt-6 border-t border-stone-200/50 flex justify-end">
      <button
        type="button"
        onClick={optOut}
        disabled={working}
        className="text-[12px] text-stone-400 hover:text-stone-600 underline-offset-2 hover:underline transition-colors"
      >
        {working ? 'Updating…' : 'Stop participating in Field Lab'}
      </button>
    </div>
  );
}

function NotSignedInView() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/60 p-6">
      <p className="text-[15px] leading-relaxed text-stone-700">
        Field Lab requires being signed in. Once you sign in, you can choose
        whether to participate as a tester.
      </p>
    </div>
  );
}

function OptInInvitation() {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function optIn() {
    setWorking(true);
    setError(null);
    try {
      const res = await apiFetch('/api/members/tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tester: true }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error || 'Could not update. Try again in a moment.');
        setWorking(false);
        return;
      }
      window.location.reload();
    } catch {
      setError('A connection hiccup. Try again in a moment.');
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white/70 p-6 space-y-4">
        <h2 className="text-lg font-medium text-stone-800">
          Field Lab is for members who want to participate in observation.
        </h2>
        <p className="text-[15px] leading-relaxed text-stone-700">
          The surfaces here are still being shaped. They may change. Some may
          be removed. None of them are claiming to be finished. We are looking
          to learn — with members — what they become.
        </p>
        <p className="text-[15px] leading-relaxed text-stone-700">
          Opting in does not unlock anything special. It means your access
          includes surfaces that are still being formed, and that you are
          willing to notice friction, surprise, and what does not yet fit.
        </p>
        <p className="text-[14px] leading-relaxed text-stone-600 italic">
          You can step out at any time, from any Field Lab page.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-300/50 bg-amber-50/60 p-4 text-[14px] text-stone-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={optIn}
          disabled={working}
          className={[
            'rounded-xl px-5 py-3 text-[14.5px] font-medium tracking-wide transition-all',
            working
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-[#5a7a6f] text-white hover:bg-[#4a6a5f] active:scale-[0.98]',
          ].join(' ')}
        >
          {working ? 'Updating…' : 'Begin participating'}
        </button>
        <p className="text-[12.5px] text-stone-500">
          Reversible. Held only as a flag. Not used by MAIA's responses.
        </p>
      </div>
    </div>
  );
}
