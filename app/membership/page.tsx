'use client';

/**
 * Membership Page - /membership
 *
 * A non-transactional view of MAIA's tier system.
 * Not a paywall — an opening. Not features — relationship.
 *
 * Language follows /docs/TIER_STRUCTURE.md:
 * - "deepen" not "upgrade"
 * - "opening" not "unlock"
 * - "continue" not "subscribe"
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Shield, Heart, Download, RefreshCw } from 'lucide-react';
import { betaSession } from '@/lib/auth/betaSession';
import { type MemberTier } from '@/lib/auth/tierAccess';
import { Holoflower } from '@/components/ui/Holoflower';
import SupportFooter from '@/components/shared/SupportFooter';

interface TierCardProps {
  tier: MemberTier;
  isCurrentTier: boolean;
  onSelect: () => void;
}

// Elegant tier symbols - simple geometric SVGs
const TierSymbol = ({ tier, className, style }: { tier: MemberTier; className?: string; style?: React.CSSProperties }) => {
  if (tier === 'free') {
    // Single circle - touch, beginning
    return (
      <svg viewBox="0 0 40 40" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="20" r="12" />
      </svg>
    );
  }
  if (tier === 'personal') {
    // Vesica piscis - continuity, intersection
    return (
      <svg viewBox="0 0 40 40" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="15" cy="20" r="10" />
        <circle cx="25" cy="20" r="10" />
      </svg>
    );
  }
  // Three interlocking circles - stewardship, service
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="20" cy="14" r="8" />
      <circle cx="14" cy="24" r="8" />
      <circle cx="26" cy="24" r="8" />
    </svg>
  );
};

const TIER_DATA: Record<MemberTier, {
  name: string;
  tagline: string;
  bestFor: string;
  price: string;
  priceNote?: string;
  color: string;
  features: string[];
  emphasis: string;
  cta: string;
}> = {
  free: {
    name: 'Touch',
    tagline: 'Explore MAIA',
    bestFor: 'Those beginning the relationship',
    price: 'Free',
    color: 'sage',
    features: [
      'MAIA conversations (Talk, Care, Note)',
      'Basic journal entries',
      'Birth chart overview',
      'Pattern recognition across time',
      'Element discovery',
    ],
    emphasis: 'A taste of presence',
    cta: 'Begin here',
  },
  personal: {
    name: 'Continuity',
    tagline: 'Memory that spans time',
    bestFor: 'Those ready for a lasting relationship',
    price: '$12',
    priceNote: '/month',
    color: 'violet',
    features: [
      'Everything in Touch, plus:',
      'Cross-device sync',
      'MAIA remembers patterns across weeks',
      'Full astrology: transits, cycles, returns',
      'Complete oracle access',
      'Data export (your sovereignty)',
    ],
    emphasis: 'Your data, our servers, your keys',
    cta: 'Deepen the relationship',
  },
  pro: {
    name: 'Stewardship',
    tagline: 'Serve others sovereignly',
    bestFor: 'Practitioners holding space for others',
    price: '$35',
    priceNote: '/month',
    color: 'gold',
    features: [
      'Everything in Continuity, plus:',
      'Practitioner portal (your clients)',
      'Client session sovereignty',
      'Scribe Pro: transcription & capture',
      'Brain Trust: multi-model weaving',
      'Field analytics',
    ],
    emphasis: 'Tools for those who hold space',
    cta: 'Enter stewardship',
  },
};

// Comparison table data
const COMPARISON_ROWS = [
  { label: 'Memory retention', free: 'This session', personal: 'Weeks & months', pro: 'Unlimited history' },
  { label: 'Saved sessions', free: 'Local only', personal: 'Cloud sync', pro: 'Cloud + client sessions' },
  { label: 'Devices', free: 'Single device', personal: 'All your devices', pro: 'All devices + client access' },
  { label: 'Export', free: 'Basic', personal: 'Full data export', pro: 'Full + client exports' },
  { label: 'Privacy modes', free: 'Sanctuary', personal: 'Sanctuary + Local', pro: 'All modes + client privacy' },
];

function TierCard({ tier, isCurrentTier, onSelect }: TierCardProps) {
  const data = TIER_DATA[tier];

  const colorClasses = {
    sage: {
      border: 'border-stone-300/50',
      symbol: '#5a7a6f',
      buttonBg: '#5a7a6f',
      highlight: 'from-[#5a7a6f]/5 to-transparent',
    },
    violet: {
      border: 'border-[#8b7ab8]/30',
      symbol: '#6b5a98',
      buttonBg: '#6b5a98',
      highlight: 'from-[#6b5a98]/8 to-transparent',
    },
    gold: {
      border: 'border-[#b8a07a]/40',
      symbol: '#8a7a5a',
      buttonBg: '#8a7a5a',
      highlight: 'from-[#8a7a5a]/8 to-transparent',
    },
  };

  const colors = colorClasses[data.color as keyof typeof colorClasses];

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden hover:-translate-y-0.5 transition-transform duration-300 ${colors.border}`}
      style={{
        background: 'linear-gradient(175deg, rgba(255, 255, 255, 0.92), rgba(250, 249, 247, 0.85))',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Subtle highlight gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.highlight} pointer-events-none`} />

      {/* Current tier indicator */}
      {isCurrentTier && (
        <div className="absolute top-5 right-5">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">
            Current
          </span>
        </div>
      )}

      <div className="relative px-7 py-8">
        {/* Symbol */}
        <div className="mb-4">
          <TierSymbol tier={tier} className="w-10 h-10" style={{ color: colors.symbol }} />
        </div>

        {/* Header */}
        <h3 className="text-lg font-medium tracking-wide mb-1 text-stone-800">
          {data.name}
        </h3>
        <p className="text-[13px] mb-2 text-stone-500 tracking-wide">
          {data.tagline}
        </p>

        {/* Best for */}
        <p className="text-[11px] uppercase tracking-wider text-stone-400 mb-4">
          Best for: {data.bestFor}
        </p>

        {/* Price */}
        <div className="mb-5 pb-5 border-b border-stone-200/60">
          <span className="text-2xl font-light tracking-tight text-stone-800">
            {data.price}
          </span>
          {data.priceNote && (
            <span className="text-sm text-stone-400 ml-1">
              {data.priceNote}
            </span>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-5">
          {data.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors.symbol }} />
              <span className="text-[13px] leading-relaxed text-stone-700">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Emphasis */}
        <p className="text-[12px] italic mb-5 text-stone-500">
          {data.emphasis}
        </p>

        {/* CTA */}
        {!isCurrentTier && tier !== 'free' && (
          <>
            <button
              onClick={onSelect}
              className={`w-full py-3 px-4 rounded-lg text-[13px] font-semibold tracking-wide border-0 cursor-pointer shadow-lg !text-white ${
                tier === 'personal' ? '!bg-[#5b4a88]' : '!bg-[#7a6a4a]'
              }`}
            >
              {data.cta}
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-2.5">
              Cancel anytime
            </p>
          </>
        )}

        {isCurrentTier && (
          <div className="w-full py-3 px-4 rounded-lg text-center text-[13px] tracking-wide text-stone-600 border border-stone-300/80 bg-stone-100/50">
            This is where you are
          </div>
        )}

        {tier === 'free' && !isCurrentTier && (
          <div className="w-full py-3 px-4 rounded-lg text-center text-[13px] tracking-wide text-stone-400 border border-stone-200/60">
            Always available
          </div>
        )}
      </div>
    </div>
  );
}

function MembershipPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTier, setCurrentTier] = useState<MemberTier>('free');
  const [selectedTier, setSelectedTier] = useState<MemberTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = betaSession.getCurrentUser();
    if (user?.tier) {
      setCurrentTier(user.tier);
    }

    const success = searchParams?.get('success');
    const tier = searchParams?.get('tier');
    const canceled = searchParams?.get('canceled');

    if (success === 'true' && tier) {
      setSuccessMessage(`Welcome to ${TIER_DATA[tier as MemberTier]?.name || tier}. Your relationship with MAIA deepens.`);
      if (user) {
        betaSession.updateUser({ tier: tier as MemberTier });
        setCurrentTier(tier as MemberTier);
      }
    } else if (canceled === 'true') {
      setCheckoutError('Checkout was canceled. No changes were made.');
    }
  }, [searchParams]);

  const handleTierSelect = (tier: MemberTier) => {
    setSelectedTier(tier);
    setCheckoutError(null);
  };

  const handleCheckout = async (tier: MemberTier, interval: 'month' | 'year' = 'month') => {
    const user = betaSession.getCurrentUser();
    if (!user?.id) {
      setCheckoutError('Please sign in to continue.');
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/stripe/membership/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          interval,
          memberId: user.id,
          memberEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('[Membership] Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f5]/80 border-b border-stone-200/40">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-2.5 -ml-2 rounded-lg hover:-translate-x-0.5 transition-all"
            style={{
              backgroundColor: '#292524',
              color: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#ffffff' }} strokeWidth={2.5} />
          </button>
          <div className="h-4 w-px bg-stone-300/60" />
          <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
            Membership
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Success/Error messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-5 rounded-lg bg-[#5a7a6f]/10 border border-[#5a7a6f]/20 text-stone-700"
            >
              <p className="text-[13px]">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-5 rounded-lg bg-rose-50 border border-rose-200/50 text-stone-700"
            >
              <p className="text-[13px]">{checkoutError}</p>
              <button
                onClick={() => setCheckoutError(null)}
                className="text-xs text-stone-500 mt-2 hover:text-stone-700 transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-8">
            <Holoflower
              size="lg"
              glowIntensity="high"
              animate={true}
              theme="light"
              customColor="rgba(90, 122, 111, 0.6)"
            />
          </div>
          <h2 className="text-2xl font-light mb-4 text-stone-800 tracking-wide">
            Your Relationship with MAIA
          </h2>
          <p className="max-w-md mx-auto text-[15px] leading-relaxed text-stone-500 mb-6">
            Choose the level of remembrance and support you want.
          </p>
        </div>

        {/* The Why - narrative block */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <blockquote className="text-lg font-light text-stone-700 leading-relaxed italic">
            &ldquo;Membership isn&apos;t access. It&apos;s continuity.&rdquo;
          </blockquote>
          <p className="text-[14px] text-stone-500 mt-3">
            It&apos;s the difference between a conversation and a relationship&mdash;between a moment and a thread.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {(['free', 'personal', 'pro'] as MemberTier[]).map((tier) => (
            <TierCard
              key={tier}
              tier={tier}
              isCurrentTier={tier === currentTier}
              onSelect={() => handleTierSelect(tier)}
            />
          ))}
        </div>

        {/* What changes - comparison table */}
        <div className="mb-16">
          <h3 className="text-sm font-medium tracking-wide mb-6 text-stone-700 text-center">
            What changes when you deepen
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-stone-200/60">
                  <th className="text-left py-3 px-4 font-medium text-stone-600"></th>
                  <th className="text-center py-3 px-4 font-medium text-stone-600">Touch</th>
                  <th className="text-center py-3 px-4 font-medium text-[#6b5a98]">Continuity</th>
                  <th className="text-center py-3 px-4 font-medium text-[#8a7a5a]">Stewardship</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="border-b border-stone-100">
                    <td className="py-3 px-4 text-stone-600 font-medium">{row.label}</td>
                    <td className="py-3 px-4 text-center text-stone-500">{row.free}</td>
                    <td className="py-3 px-4 text-center text-stone-700">{row.personal}</td>
                    <td className="py-3 px-4 text-center text-stone-700">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust + Sovereignty footer */}
        <div className="grid md:grid-cols-4 gap-6 mb-12 p-6 rounded-xl bg-white/50 border border-stone-200/40">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-[#5a7a6f] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-stone-700">Cancel anytime</p>
              <p className="text-[12px] text-stone-500">No commitments, no questions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#5a7a6f] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-stone-700">Your data stays yours</p>
              <p className="text-[12px] text-stone-500">Export everything, delete anytime</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-[#5a7a6f] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-stone-700">Self-hosted infrastructure</p>
              <p className="text-[12px] text-stone-500">No third parties, no data mining</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-[#5a7a6f] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-stone-700">Local-first options</p>
              <p className="text-[12px] text-stone-500">Sanctuary mode always free</p>
            </div>
          </div>
        </div>

        {/* Ethos line */}
        <div className="text-center mb-4">
          <p className="text-[13px] italic text-stone-400">
            Your device, your memory. Sovereign cloud extends what&apos;s possible.
          </p>
        </div>

        <SupportFooter theme="light" />

        {/* Selected tier confirmation */}
        <AnimatePresence>
          {selectedTier && selectedTier !== 'free' && selectedTier !== currentTier && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-0 left-0 right-0 p-6 backdrop-blur-xl border-t border-stone-200/60"
              style={{
                background: 'linear-gradient(to top, rgba(248, 247, 245, 0.98), rgba(248, 247, 245, 0.92))',
              }}
            >
              <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      Continue to {TIER_DATA[selectedTier].name}
                    </p>
                    <p className="text-[13px] text-stone-500">
                      {TIER_DATA[selectedTier].price}{TIER_DATA[selectedTier].priceNote}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTier(null)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCheckout(selectedTier, 'month')}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-[13px] font-semibold disabled:opacity-50 !bg-stone-800 !text-white hover:!bg-stone-900 transition-colors shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Monthly ({TIER_DATA[selectedTier].price}/mo)</>
                    )}
                  </button>
                  <button
                    onClick={() => handleCheckout(selectedTier, 'year')}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg text-[13px] font-semibold disabled:opacity-50 !bg-[#5b4a88] !text-white hover:!bg-[#4a3a77] transition-colors shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Annual (2 months free)</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function MembershipPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7f5' }}>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-6 opacity-60">
          <Holoflower size="md" glowIntensity="low" animate={false} />
        </div>
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-stone-400" />
      </div>
    </div>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={<MembershipPageLoading />}>
      <MembershipPageContent />
    </Suspense>
  );
}
