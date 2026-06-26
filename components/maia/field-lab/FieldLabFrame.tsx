'use client';

/**
 * Shared frame for Field Lab pages.
 *
 * Carries:
 *   - The Field Lab header chrome
 *   - The experimental-posture status row
 *   - The entitlement gate, via <PreviewGate> on `labs.fieldLab`
 *
 * If the member is not entitled, this frame shows the opt-in invitation instead
 * of the experiment surface — without making the absence punitive. The
 * non-entitled state explains what Field Lab is, what opting in means, and what
 * it does not mean.
 *
 * `labs.fieldLab` is the entitlement generalization of the live `members.tester`
 * proto-entitlement; the opt-in/opt-out below still toggle the tester flag
 * (which is what `labs.fieldLab` currently resolves from), so behavior is
 * unchanged by the extraction.
 *
 * Invariant: this frame does NOT optimize for conversion. The opt-in copy must
 * read as honest invitation, not as a CTA. If you find yourself adjusting it to
 * "improve activation," you have misread what this surface is.
 *
 * Visual language: the intimacy of the MAIA field — warm-charcoal depth, an
 * ember glow rising from below, a soft Holoflower presence and a breathing
 * atmosphere, so content is held *inside* a field rather than placed on a page.
 * Mirrors components/maia/MaiaCenterField.tsx. The atmosphere is warm; the
 * restraint of the copy is unchanged.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { PreviewGate } from '@/components/auth/PreviewGate';
import { MiniHoloflower } from '@/components/holoflower/MiniHoloflower';

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-soullab-text-secondary">
      {/* soft top vignette — a gentle hand of light from above */}
      <div className="sl-atmosphere" aria-hidden="true" />

      {/* the field, breathing: a Holoflower presence rising at the top, an ember hearth below */}
      <div
        className="sl-field-alive pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 -top-32 -translate-x-1/2 opacity-[0.16] blur-[6px]">
          <MiniHoloflower size={440} animated />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[34rem] bg-gradient-to-t from-[#3d2817]/45 via-[#3d2817]/8 to-transparent" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-950/55 border-b border-amber-500/10">
          <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-5">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-soullab-text-muted hover:text-amber-100 hover:-translate-x-0.5 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="h-4 w-px bg-amber-500/15" />
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-300/80" strokeWidth={2} />
              <h1 className="text-sm font-medium tracking-[0.2em] text-amber-100/80 uppercase">
                Field Lab
                {title ? <span className="text-amber-200/40"> · {title}</span> : null}
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
                  className="text-[11px] uppercase tracking-wider text-amber-100/60 bg-stone-900/40 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-500/15"
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
              className="mb-8 rounded-2xl border border-amber-500/15 bg-stone-900/40 backdrop-blur-md p-5"
            >
              <div className="text-[11px] uppercase tracking-wider text-amber-300/80 mb-2">
                What this room is exploring
              </div>
              <p className="text-[14.5px] leading-relaxed text-soullab-text-secondary">
                {exploring}
              </p>
            </motion.div>
          )}

          <PreviewGate
            entitlement="labs.fieldLab"
            signedOut={<NotSignedInView />}
            preview={<OptInInvitation />}
          >
            {children}
            <TesterOptOutFooter />
          </PreviewGate>
        </main>
      </div>
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
    <div className="mt-16 pt-6 border-t border-amber-500/10 flex justify-end">
      <button
        type="button"
        onClick={optOut}
        disabled={working}
        className="text-[12px] text-soullab-text-muted hover:text-amber-200/70 underline-offset-2 hover:underline transition-colors"
      >
        {working ? 'Updating…' : 'Stop participating in Field Lab'}
      </button>
    </div>
  );
}

function NotSignedInView() {
  return (
    <div className="rounded-2xl border border-amber-500/15 bg-stone-900/40 backdrop-blur-md p-6">
      <p className="text-[15px] leading-relaxed text-soullab-text-secondary">
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
      <div className="rounded-2xl border border-amber-500/15 bg-stone-900/40 backdrop-blur-md p-6 space-y-4">
        <h2 className="font-cormorant text-2xl font-medium text-amber-50/90">
          Field Lab is for members who want to participate in observation.
        </h2>
        <p className="text-[15px] leading-relaxed text-soullab-text-secondary">
          The surfaces here are still being shaped. They may change. Some may
          be removed. None of them are claiming to be finished. We are looking
          to learn — with members — what they become.
        </p>
        <p className="text-[15px] leading-relaxed text-soullab-text-secondary">
          Opting in does not unlock anything special. It means your access
          includes surfaces that are still being formed, and that you are
          willing to notice friction, surprise, and what does not yet fit.
        </p>
        <p className="text-[14px] leading-relaxed text-amber-200/40 italic">
          You can step out at any time, from any Field Lab page.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-900/15 p-4 text-[14px] text-amber-100/80">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={optIn}
          disabled={working}
          className={[
            'rounded-xl px-5 py-3 text-[14.5px] font-medium tracking-wide transition-all border',
            working
              ? 'bg-stone-900/40 text-soullab-text-muted border-amber-500/10 cursor-not-allowed'
              : 'bg-stone-900/50 text-amber-50/90 border-amber-500/20 hover:bg-stone-900/70 hover:border-amber-400/30 active:scale-[0.98]',
          ].join(' ')}
        >
          {working ? 'Updating…' : 'Begin participating'}
        </button>
        <p className="text-[12.5px] text-soullab-text-muted">
          Reversible. Held only as a flag. Not used by MAIA's responses.
        </p>
      </div>
    </div>
  );
}
