'use client';

/**
 * Membership Page
 *
 * A non-transactional view of MAIA's tier system.
 * Not a paywall — an opening.
 *
 * Language follows /docs/TIER_STRUCTURE.md:
 * - "deepen" not "upgrade"
 * - "opening" not "unlock"
 * - "continue" not "subscribe"
 *
 * See /docs/TIER_STRUCTURE.md for full tier philosophy.
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
    price: 'Free',
    color: 'sage',
    features: [
      'MAIA conversations (Talk, Care, Note)',
      'Basic journal entries',
      'Birth chart overview',
      'Occasional oracle readings',
      'Element discovery',
      'Soul signature profile',
    ],
    emphasis: 'A taste of presence',
    cta: 'Begin here',
  },
  personal: {
    name: 'Continuity',
    tagline: 'MAIA remembers',
    price: '$12',
    priceNote: '/month',
    color: 'violet',
    features: [
      'Everything in Touch, plus:',
      'Unlimited MAIA conversations',
      'Pattern recognition across time',
      'Full astrology: transits, cycles, returns',
      'Complete oracle access',
      'Dream journal with symbol tracking',
      'Elder Council guidance',
      'Sacred Story Creator',
      'Relationship synastry',
      'Data export (your sovereignty)',
    ],
    emphasis: 'MAIA holds your thread',
    cta: 'Deepen the relationship',
  },
  pro: {
    name: 'Stewardship',
    tagline: 'Serve others',
    price: '$35',
    priceNote: '/month',
    color: 'gold',
    features: [
      'Everything in Continuity, plus:',
      'Scribe Pro: transcription & capture',
      'Brain Trust: multi-model weaving',
      'Library of Alexandria access',
      'Guardian Console: biometrics',
      'Navigator Lab: depth training',
      'Practitioner session tools',
      'Advanced client synastry',
      'Field analytics',
    ],
    emphasis: 'Tools for those who hold space',
    cta: 'Enter stewardship',
  },
};

function TierCard({ tier, isCurrentTier, onSelect }: TierCardProps) {
  const data = TIER_DATA[tier];

  const colorClasses = {
    sage: {
      border: 'border-stone-300/50',
      symbol: '#5a7a6f',
      accent: 'bg-[#5a7a6f]/10',
      buttonBg: '#5a7a6f',
      buttonHover: '#4a6a5f',
      check: 'text-[#5a7a6f]',
      highlight: 'from-[#5a7a6f]/5 to-transparent',
    },
    violet: {
      border: 'border-[#8b7ab8]/30',
      symbol: '#6b5a98',
      accent: 'bg-[#6b5a98]/10',
      buttonBg: '#6b5a98',
      buttonHover: '#5b4a88',
      check: 'text-[#6b5a98]',
      highlight: 'from-[#6b5a98]/8 to-transparent',
    },
    gold: {
      border: 'border-[#b8a07a]/40',
      symbol: '#8a7a5a',
      accent: 'bg-[#8a7a5a]/10',
      buttonBg: '#8a7a5a',
      buttonHover: '#7a6a4a',
      check: 'text-[#8a7a5a]',
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
        <div className="mb-6">
          <TierSymbol tier={tier} className="w-10 h-10" style={{ color: colors.symbol }} />
        </div>

        {/* Header */}
        <h3 className="text-lg font-medium tracking-wide mb-1 text-stone-800">
          {data.name}
        </h3>
        <p className="text-[13px] mb-5 text-stone-500 tracking-wide">
          {data.tagline}
        </p>

        {/* Price */}
        <div className="mb-6 pb-6 border-b border-stone-200/60">
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
        <ul className="space-y-3 mb-6">
          {data.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors.symbol }} />
              <span className="text-[13px] leading-relaxed text-stone-700">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Emphasis */}
        <p className="text-[13px] italic mb-6 text-stone-600">
          {data.emphasis}
        </p>

        {/* CTA */}
        {!isCurrentTier && tier !== 'free' && (
          <>
            <button
              onClick={onSelect}
              style={{
                position: 'relative',
                zIndex: 10,
                backgroundColor: tier === 'personal' ? 'rgba(107,90,152,0.12)' : 'rgba(138,122,90,0.12)',
                width: '100%',
                padding: '14px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.025em',
                color: tier === 'personal' ? '#6b5a98' : '#8a7a5a',
                border: `1px solid ${tier === 'personal' ? 'rgba(107,90,152,0.25)' : 'rgba(138,122,90,0.25)'}`,
                cursor: 'pointer',
              }}
            >
              {data.cta}
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-3">
              You can change this anytime.
            </p>
          </>
        )}

        {isCurrentTier && (
          <div className="w-full py-3.5 px-4 rounded-lg text-center text-[13px] tracking-wide text-stone-600 border border-stone-300/80 bg-stone-100/50">
            This is where you are
          </div>
        )}

        {tier === 'free' && !isCurrentTier && (
          <div className="w-full py-3.5 px-4 rounded-lg text-center text-[13px] tracking-wide text-stone-400 border border-stone-200/60">
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
    // Get current user's tier
    const user = betaSession.getCurrentUser();
    if (user?.tier) {
      setCurrentTier(user.tier);
    }

    // Check for success/canceled from Stripe redirect
    const success = searchParams?.get('success');
    const tier = searchParams?.get('tier');
    const canceled = searchParams?.get('canceled');

    if (success === 'true' && tier) {
      setSuccessMessage(`Welcome to ${TIER_DATA[tier as MemberTier]?.name || tier}. Your relationship with MAIA deepens.`);
      // Update local tier
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

      // Redirect to Stripe Checkout
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
            className="p-2.5 -ml-2 rounded-lg bg-stone-800 text-white hover:bg-stone-900 hover:-translate-x-0.5 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div className="h-4 w-px bg-stone-300/60" />
          <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
            Membership
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Success message */}
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

        {/* Error message */}
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
        <div className="text-center mb-16">
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
          <p className="max-w-lg mx-auto text-[15px] leading-relaxed text-stone-500">
            MAIA runs on your device with full local memory. Sovereign cloud extends
            what&apos;s possible: file uploads, cross-device sync, pattern weaving across time.
          </p>
        </div>

        {/* Choice framing */}
        <p className="text-center text-[14px] text-stone-500 mb-8">
          Choose how you want to walk with MAIA.
        </p>

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

        {/* Divider */}
        <div className="flex items-center gap-6 mb-12">
          <div className="flex-1 h-px bg-stone-200/60" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Philosophy</span>
          <div className="flex-1 h-px bg-stone-200/60" />
        </div>

        {/* Why Sovereign Cloud */}
        <div className="mb-12">
          <h3 className="text-sm font-medium tracking-wide mb-6 text-stone-700">
            Why Sovereign Cloud?
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-[14px] leading-relaxed text-stone-600">
            <div>
              <p className="mb-4">
                <span className="text-[#6b5a98]">Your local experience is complete.</span> MAIA runs
                on your device with full memory. Your conversations, journal entries, and insights
                stay with you always.
              </p>
              <p>
                Sovereign cloud is for when you want to extend: upload files for deeper analysis,
                sync across devices, let MAIA weave patterns over months and years.
              </p>
            </div>
            <div>
              <p className="mb-4">
                Contribute to community and collective intelligence, helping build something
                that serves us all. It&apos;s infrastructure, not permission.
              </p>
              <p className="italic text-stone-400">
                Self-hosted. No third parties. No data mining. Still sovereign.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h3 className="text-sm font-medium tracking-wide mb-6 text-stone-700">
            Common Questions
          </h3>
          <div className="space-y-6">
            <div className="border-l-2 border-stone-200/60 pl-5">
              <p className="text-[13px] font-medium mb-2 text-stone-700">
                What do I get with free/local?
              </p>
              <p className="text-[13px] text-stone-500 leading-relaxed">
                A complete experience. MAIA conversations, journal, oracle, memory, all on your device.
                Your data stays with you.
              </p>
            </div>
            <div className="border-l-2 border-stone-200/60 pl-5">
              <p className="text-[13px] font-medium mb-2 text-stone-700">
                What does sovereign cloud add?
              </p>
              <p className="text-[13px] text-stone-500 leading-relaxed">
                Extension, not permission. Upload files for deeper analysis. Sync across devices.
                Let MAIA weave patterns across months and years. Contribute to community and
                collective intelligence.
              </p>
            </div>
            <div className="border-l-2 border-stone-200/60 pl-5">
              <p className="text-[13px] font-medium mb-2 text-stone-700">
                What makes it &quot;sovereign&quot;?
              </p>
              <p className="text-[13px] text-stone-500 leading-relaxed">
                Self-hosted infrastructure. No AWS, no Google Cloud, no third parties.
                We run our own servers. Your data never touches external services.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy note */}
        <div className="p-6 rounded-xl border border-stone-200/60 bg-white/40">
          <h3 className="text-sm font-medium mb-3 text-stone-700">
            Your Data, Your Sovereignty
          </h3>
          <p className="text-[13px] text-stone-500 leading-relaxed">
            MAIA runs on your terms. Your conversations, patterns, and insights belong to you.
            Export your data anytime. Delete everything if you choose.
            Privacy is not a premium feature. Sanctuary mode is always free.
          </p>
        </div>

        {/* Ethos line */}
        <div className="text-center mt-12 mb-4">
          <p className="text-[13px] italic text-stone-400">
            Your device, your memory. Sovereign cloud extends what&apos;s possible.
          </p>
          <a
            href="/maia/stewardship"
            className="mt-3 inline-block text-[12px] text-stone-400 hover:text-[#5a7a6f] transition-colors"
          >
            Why support matters →
          </a>
        </div>

        {/* Footer */}
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
                    className="flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#ffffff',
                      backgroundColor: selectedTier === 'personal' ? '#6b5a98' : '#5a4a3a',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
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
                    className="flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: selectedTier === 'personal' ? '#6b5a98' : '#5a4a3a',
                      backgroundColor: 'transparent',
                      border: `1px solid ${selectedTier === 'personal' ? 'rgba(107,90,152,0.3)' : 'rgba(90,74,58,0.3)'}`,
                    }}
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
