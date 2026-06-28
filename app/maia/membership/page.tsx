'use client';

/**
 * Membership Options Page
 *
 * The honest, non-coercive home for MAIA's three tiers.
 * Reached from /maia/stewardship ("View membership options"),
 * the astrology threshold prompts, and as the Stripe checkout
 * success / cancel return URL.
 *
 * Truth sources:
 * - docs/TIER_STRUCTURE.md (tier meaning, pricing, copy guidelines)
 * - app/api/stripe/membership/checkout/route.ts (checkout flow)
 *
 * Principles (TIER_STRUCTURE.md):
 * - Free is welcomed, not limited. The limit is continuity, not care.
 * - No "upgrade" / "premium" / "unlock" language. No dark patterns.
 * - Local mode stays complete whether you ever pay or not.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Heart, Sparkles, Users } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import SupportFooter from '@/components/shared/SupportFooter';
import { getValidMemberId, apiFetch } from '@/lib/http/apiBase';

type PaidTier = 'personal' | 'pro';
type BillingInterval = 'month' | 'year';

interface TierCard {
  id: 'free' | PaidTier;
  name: string;        // Touch / Continuity / Stewardship
  displayName: string; // Free / Personal / Pro
  framing: string;     // one-line core value
  monthly: number | null; // dollars, null = free
  annual: number | null;  // dollars
  accent: string;
  features: string[];
  boundary: string;
  cta: string;         // copy-guide aligned action
}

const TIERS: TierCard[] = [
  {
    id: 'free',
    name: 'Touch',
    displayName: 'Free',
    framing: 'A taste of MAIA — genuine presence, in the moment.',
    monthly: 0,
    annual: 0,
    accent: '#8a7a5a',
    features: [
      'MAIA conversation — Talk, Care, Note',
      'Basic journal',
      'Birth chart (view)',
      'Occasional oracle readings',
      'Element discovery',
      'Sanctuary mode — privacy is never paywalled',
    ],
    boundary: 'The limit here is continuity, not care.',
    cta: '',
  },
  {
    id: 'personal',
    name: 'Continuity',
    displayName: 'Personal',
    framing: 'MAIA remembers. Patterns emerge. Time becomes visible.',
    monthly: 12,
    annual: 120,
    accent: '#5a7a6f',
    features: [
      'Everything in Free',
      'Unlimited conversations',
      'Full journal — insight, pattern recognition, chart integration',
      'Complete astrology — transits, returns, life cycles',
      'Unlimited oracle — I Ching, Tarot, Runes',
      'Dream journal with symbol recurrence',
      'Data export — your data, your sovereignty',
    ],
    boundary: 'For your inner work. Self, not other.',
    cta: 'Let MAIA remember',
  },
  {
    id: 'pro',
    name: 'Stewardship',
    displayName: 'Pro',
    framing: 'Work for others. Creation tools. Responsibility for the field.',
    monthly: 35,
    annual: 350,
    accent: '#6b5a98',
    features: [
      'Everything in Personal',
      'Scribe & Capture — transcription, session export',
      'Brain Trust — multi-model consciousness weaver',
      'Library of Alexandria — full corpus',
      'Guardian Console & field analytics',
      'Practitioner tools — synastry for others, session docs',
    ],
    boundary: 'Pro confers responsibility, not authority over others.',
    cta: 'Become a steward',
  },
];

type Notice =
  | { kind: 'success'; tier: string | null }
  | { kind: 'canceled' }
  | { kind: 'error'; message: string }
  | null;

export default function MembershipPage() {
  const router = useRouter();
  const [interval, setInterval] = useState<BillingInterval>('month');
  const [loadingTier, setLoadingTier] = useState<PaidTier | null>(null);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  // Read current tier + Stripe return params on mount (no useSearchParams →
  // keeps the route static-export safe for the Capacitor build).
  useEffect(() => {
    try {
      const stored = localStorage.getItem('beta_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.tier) setCurrentTier(String(parsed.tier).toLowerCase());
      }
    } catch {
      /* ignore — anonymous / unparseable session */
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setNotice({ kind: 'success', tier: params.get('tier') });
    } else if (params.get('canceled') === 'true') {
      setNotice({ kind: 'canceled' });
    }
  }, []);

  const handleSelect = async (tier: PaidTier) => {
    if (currentTier === tier) return; // already on this tier

    const memberId = getValidMemberId();
    if (!memberId) {
      // Not signed in — send to sign-in, return here afterward.
      router.push('/signin?returnTo=/maia/membership');
      return;
    }

    setLoadingTier(tier);
    setNotice(null);

    try {
      // apiFetch (not plain fetch) so iOS/Safari send x-member-id — the
      // checkout API is auth-gated (minTier:free) and WebView cookies don't
      // cross origin, so plain fetch would 401 on native. See CLAUDE.md
      // Capacitor cookie trap.
      const res = await apiFetch('/api/stripe/membership/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval, memberId }),
      });

      if (res.status === 503) {
        setNotice({
          kind: 'error',
          message:
            "Membership isn't quite ready yet — the payment system is still being set up. Local mode stays complete in the meantime.",
        });
        setLoadingTier(null);
        return;
      }

      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Could not start checkout.');
      }

      // Hand off to Stripe-hosted checkout.
      window.location.href = data.url as string;
    } catch (err) {
      setNotice({
        kind: 'error',
        message:
          err instanceof Error ? err.message : 'Something went wrong starting checkout.',
      });
      setLoadingTier(null);
    }
  };

  const priceLabel = (t: TierCard): string => {
    if (t.monthly === 0 || t.monthly === null) return '$0';
    return interval === 'year' ? `$${t.annual}` : `$${t.monthly}`;
  };

  const priceSuffix = (t: TierCard): string => {
    if (t.monthly === 0 || t.monthly === null) return 'always';
    return interval === 'year' ? '/ year' : '/ month';
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f5]/80 border-b border-stone-200/40">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-stone-700 hover:text-stone-900 hover:-translate-x-0.5 transition-all"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="h-4 w-px bg-stone-300/60" />
          <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
            Membership
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 mx-auto mb-8">
            <Holoflower
              size="md"
              glowIntensity="medium"
              animate={true}
              theme="light"
              customColor="rgba(90, 122, 111, 0.6)"
            />
          </div>
          <h2 className="text-2xl font-light mb-4 text-stone-800 tracking-wide">
            Choose your depth of relationship
          </h2>
          <p className="text-[15px] text-stone-500 max-w-xl mx-auto leading-relaxed">
            Free is exploration. Personal is relationship. Pro is stewardship.
            No tier is less human — the difference is continuity, whether MAIA
            can remember and walk with you over time.
          </p>
        </motion.div>

        {/* Return / status notice */}
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-xl mx-auto mb-10 p-4 rounded-xl border text-[14px] text-center ${
              notice.kind === 'success'
                ? 'border-[#5a7a6f]/30 bg-[#5a7a6f]/5 text-[#4a6a5f]'
                : notice.kind === 'canceled'
                ? 'border-stone-200/60 bg-white/40 text-stone-500'
                : 'border-amber-300/40 bg-amber-50/60 text-amber-800'
            }`}
          >
            {notice.kind === 'success' && (
              <>
                Welcome in. Your{' '}
                <span className="font-medium capitalize">{notice.tier || 'membership'}</span>{' '}
                membership is active — MAIA can hold the thread with you now.
              </>
            )}
            {notice.kind === 'canceled' && (
              <>No charge made. You&apos;re always welcome here at any tier.</>
            )}
            {notice.kind === 'error' && notice.message}
          </motion.div>
        )}

        {/* Billing interval toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1 rounded-full border border-stone-200/70 bg-white/50">
            {(['month', 'year'] as BillingInterval[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setInterval(opt)}
                className={`px-5 py-2 rounded-full text-[13px] font-medium tracking-wide transition-all ${
                  interval === opt
                    ? 'bg-[#5a7a6f] text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {opt === 'month' ? 'Monthly' : 'Annual'}
                {opt === 'year' && (
                  <span className={interval === 'year' ? 'text-white/80' : 'text-[#5a7a6f]'}>
                    {' '}· 2 months free
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-16 items-start">
          {TIERS.map((tier, idx) => {
            const isCurrent = currentTier === tier.id;
            const isPaid = tier.id !== 'free';
            const isLoading = loadingTier === tier.id;
            const emphasized = tier.id === 'personal';

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className={`relative flex flex-col h-full p-6 rounded-2xl border bg-white/50 ${
                  emphasized
                    ? 'border-[#5a7a6f]/40 shadow-sm md:-mt-2'
                    : 'border-stone-200/60'
                }`}
              >
                {emphasized && (
                  <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[#5a7a6f] text-white">
                    Relationship
                  </span>
                )}

                {/* Tier name + framing */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-lg font-medium text-stone-800">{tier.name}</h3>
                    <span className="text-[12px] uppercase tracking-wide text-stone-400">
                      {tier.displayName}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-stone-500 min-h-[2.5rem]">
                    {tier.framing}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-5 flex items-baseline gap-1.5">
                  <span className="text-3xl font-light text-stone-800">{priceLabel(tier)}</span>
                  <span className="text-[12px] text-stone-400">{priceSuffix(tier)}</span>
                </div>

                {/* CTA */}
                <div className="mb-6">
                  {!isPaid ? (
                    <div className="text-center py-2.5 text-[13px] text-stone-400 border border-dashed border-stone-200 rounded-lg">
                      {isCurrent ? 'Your current tier' : 'Always available'}
                    </div>
                  ) : isCurrent ? (
                    <div
                      className="text-center py-2.5 text-[13px] font-medium rounded-lg border"
                      style={{ color: tier.accent, borderColor: `${tier.accent}55` }}
                    >
                      Your current membership
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelect(tier.id as PaidTier)}
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-lg text-white text-[13px] font-medium tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
                      style={{ backgroundColor: tier.accent }}
                      onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(0.94)')}
                      onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Opening checkout…
                        </>
                      ) : (
                        <>
                          {tier.id === 'personal' ? (
                            <Heart className="w-4 h-4" strokeWidth={1.5} />
                          ) : (
                            <Users className="w-4 h-4" strokeWidth={1.5} />
                          )}
                          {tier.cta}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] text-stone-600 leading-snug">
                      <Check
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: tier.accent }}
                        strokeWidth={2}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Boundary note */}
                <p className="mt-5 pt-4 border-t border-stone-200/50 text-[12px] italic text-stone-400 leading-relaxed">
                  {tier.boundary}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance — local is complete */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="p-6 rounded-2xl border border-[#5a7a6f]/20 bg-[#5a7a6f]/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#5a7a6f]" strokeWidth={1.5} />
              <h4 className="text-[13px] font-medium text-stone-700">
                Local mode stays complete — whether you ever pay or not.
              </h4>
            </div>
            <p className="text-[13px] text-stone-500 leading-relaxed mb-3">
              Paid tiers carry the cost of shared cloud infrastructure — encrypted
              memory, backups, and the humans who steward it. They never hold your
              work hostage: export anytime, 90-day notice on any change, and local
              keeps working if the company disappears.
            </p>
            <p className="text-[13px] text-stone-500 leading-relaxed">
              No artificial urgency. No degrading your experience to push an upgrade.
              No selling your data. No ads. Ever.
            </p>
            <a
              href="/maia/stewardship"
              className="mt-4 inline-block text-[12px] text-stone-400 hover:text-[#5a7a6f] transition-colors"
            >
              Why support matters →
            </a>
          </div>
        </motion.section>

        {/* Footer */}
        <SupportFooter theme="light" />
      </main>
    </div>
  );
}
