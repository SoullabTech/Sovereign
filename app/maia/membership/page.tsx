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
import { ArrowLeft, Heart, Sparkles, Crown, Check, ChevronRight, Shield, Loader2 } from 'lucide-react';
import { betaSession } from '@/lib/auth/betaSession';
import { type MemberTier } from '@/lib/auth/tierAccess';
import { Holoflower } from '@/components/ui/Holoflower';

interface TierCardProps {
  tier: MemberTier;
  isCurrentTier: boolean;
  onSelect: () => void;
}

const TIER_DATA: Record<MemberTier, {
  name: string;
  tagline: string;
  price: string;
  priceNote?: string;
  icon: typeof Heart;
  color: string;
  features: string[];
  emphasis: string;
  cta: string;
}> = {
  free: {
    name: 'Touch',
    tagline: 'Explore MAIA',
    price: 'Free',
    icon: Heart,
    color: 'teal',
    features: [
      'MAIA conversations (Talk, Care, Note)',
      'Basic journal entries',
      'Birth chart overview',
      'Occasional oracle readings',
      'Element discovery',
      'Soul signature profile',
    ],
    emphasis: 'Taste of presence',
    cta: 'Begin here',
  },
  personal: {
    name: 'Continuity',
    tagline: 'MAIA remembers',
    price: '$12',
    priceNote: '/month',
    icon: Sparkles,
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
    icon: Crown,
    color: 'amber',
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
  const Icon = data.icon;

  const colorClasses = {
    teal: {
      border: 'border-teal-300/40',
      icon: 'text-teal-700 bg-teal-100/80',
      button: 'bg-teal-600 hover:bg-teal-700',
      check: 'text-teal-600',
      glow: 'from-teal-200/30 to-teal-100/10',
    },
    violet: {
      border: 'border-violet-300/40',
      icon: 'text-violet-700 bg-violet-100/80',
      button: 'bg-violet-600 hover:bg-violet-700',
      check: 'text-violet-600',
      glow: 'from-violet-200/30 to-violet-100/10',
    },
    amber: {
      border: 'border-amber-300/40',
      icon: 'text-amber-700 bg-amber-100/80',
      button: 'bg-amber-600 hover:bg-amber-700',
      check: 'text-amber-600',
      glow: 'from-amber-200/30 to-amber-100/10',
    },
  };

  const colors = colorClasses[data.color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`relative rounded-3xl border overflow-hidden backdrop-blur-xl ${colors.border}`}
      style={{
        background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.4))',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Subtle gradient glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} pointer-events-none`} />

      {/* Current tier badge */}
      {isCurrentTier && (
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-teal-600/90 text-white shadow-sm">
          Your tier
        </div>
      )}

      <div className="relative p-6">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors.icon} shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Header */}
        <h3 className="text-xl font-semibold mb-1 text-teal-900">
          {data.name}
        </h3>
        <p className="text-sm mb-4 text-teal-700/70">
          {data.tagline}
        </p>

        {/* Price */}
        <div className="mb-6">
          <span className="text-3xl font-bold text-teal-900">
            {data.price}
          </span>
          {data.priceNote && (
            <span className="text-sm text-teal-600/70">
              {data.priceNote}
            </span>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {data.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.check}`} />
              <span className="text-sm text-teal-800/80">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Emphasis */}
        <p className="text-sm italic mb-6 text-teal-600/60">
          {data.emphasis}
        </p>

        {/* CTA */}
        {!isCurrentTier && tier !== 'free' && (
          <motion.button
            onClick={onSelect}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 shadow-lg ${colors.button}`}
          >
            {data.cta}
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}

        {isCurrentTier && (
          <div className="w-full py-3 px-4 rounded-xl text-center text-sm bg-teal-50/80 text-teal-700 border border-teal-200/50">
            This is where you are
          </div>
        )}

        {tier === 'free' && !isCurrentTier && (
          <div className="w-full py-3 px-4 rounded-xl text-center text-sm bg-teal-50/80 text-teal-700 border border-teal-200/50">
            Always available
          </div>
        )}
      </div>
    </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] via-[#8FBFBD] to-[#7FB5B3]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/30 border-b border-white/30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-teal-800" />
          </motion.button>
          <h1 className="text-lg font-medium text-teal-900">
            Your Relationship with MAIA
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Success message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-100/80 border border-emerald-300/50 text-emerald-800 backdrop-blur-sm"
            >
              <p className="text-sm">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-2xl bg-red-100/80 border border-red-300/50 text-red-800 backdrop-blur-sm"
            >
              <p className="text-sm">{checkoutError}</p>
              <button
                onClick={() => setCheckoutError(null)}
                className="text-xs underline mt-2 opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero with Holoflower */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 mx-auto mb-6">
            <Holoflower size="xl" glowIntensity="medium" animate={true} />
          </div>
          <h2 className="text-3xl font-light mb-3 text-teal-900 tracking-wide">
            Local Sovereignty. Sovereign Cloud.
          </h2>
          <p className="max-w-xl mx-auto text-teal-800/70">
            MAIA runs on your device with full local memory. Sovereign cloud extends what&apos;s possible—file
            uploads, cross-device sync, pattern weaving across time.
          </p>
        </motion.div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {(['free', 'personal', 'pro'] as MemberTier[]).map((tier, idx) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <TierCard
                tier={tier}
                isCurrentTier={tier === currentTier}
                onSelect={() => handleTierSelect(tier)}
              />
            </motion.div>
          ))}
        </div>

        {/* Why Sovereign Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl mb-6 backdrop-blur-xl border border-violet-200/40"
          style={{
            background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.6), rgba(237, 233, 254, 0.4))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h3 className="font-medium mb-4 text-teal-900 text-lg">
            Why Sovereign Cloud?
          </h3>
          <div className="space-y-4 text-sm text-teal-800/80">
            <p>
              <span className="font-medium text-violet-700">
                Your local experience is complete.
              </span>
            </p>
            <p>
              MAIA runs on your device with full memory. Your conversations, journal entries,
              and insights stay with you—always yours, always private.
            </p>
            <p>
              Sovereign cloud is for when you want to extend: upload files for deeper analysis,
              sync across devices, let MAIA weave patterns over months and years,
              and contribute to community and collective intelligence.
              It&apos;s infrastructure, not permission.
            </p>
            <p className="italic text-teal-600/70">
              Self-hosted. No third parties. No data mining. Still sovereign.
            </p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-3xl mb-6 backdrop-blur-xl border border-white/40"
          style={{
            background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.4))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h3 className="font-medium mb-4 text-teal-900 text-lg">
            Common Questions
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1 text-teal-800">
                What do I get with free/local?
              </p>
              <p className="text-sm text-teal-700/70">
                A complete experience. MAIA conversations, journal, oracle, memory—all on your device.
                Your data stays with you.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1 text-teal-800">
                What does sovereign cloud add?
              </p>
              <p className="text-sm text-teal-700/70">
                Extension, not permission. Upload files for deeper analysis. Sync across devices.
                Let MAIA weave patterns across months and years. Contribute to community and
                collective intelligence—helping build something that serves us all.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1 text-teal-800">
                What makes it &quot;sovereign&quot;?
              </p>
              <p className="text-sm text-teal-700/70">
                Self-hosted infrastructure. No AWS, no Google Cloud, no third parties.
                We run our own servers. Your data never touches external services.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Philosophy note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-3xl backdrop-blur-xl border border-white/40"
          style={{
            background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.4))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-teal-100/80 shadow-sm">
              <Shield className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="font-medium mb-2 text-teal-900">
                Your Data, Your Sovereignty
              </h3>
              <p className="text-sm text-teal-800/70">
                MAIA runs on your terms. Your conversations, patterns, and insights belong to you.
                Export your data anytime. Delete everything if you choose.
                Privacy is not a premium feature — sanctuary mode is always free.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ethos line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 mb-4"
        >
          <p className="text-sm italic text-teal-700/60">
            Your device, your memory. Sovereign cloud extends what&apos;s possible.
          </p>
        </motion.div>

        {/* Selected tier confirmation */}
        <AnimatePresence>
          {selectedTier && selectedTier !== 'free' && selectedTier !== currentTier && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 p-6 backdrop-blur-xl border-t border-white/40"
              style={{
                background: 'linear-gradient(to top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
              }}
            >
              <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-teal-900">
                      Continue to {TIER_DATA[selectedTier].name}
                    </p>
                    <p className="text-sm text-teal-600/70">
                      {TIER_DATA[selectedTier].price}{TIER_DATA[selectedTier].priceNote}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTier(null)}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl text-sm text-teal-700 hover:bg-teal-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleCheckout(selectedTier, 'month')}
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                      selectedTier === 'personal'
                        ? 'bg-violet-600 hover:bg-violet-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    } disabled:opacity-50`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Monthly ({TIER_DATA[selectedTier].price}/mo)</>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => handleCheckout(selectedTier, 'year')}
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border-2 ${
                      selectedTier === 'personal'
                        ? 'border-violet-300 text-violet-700 hover:bg-violet-50'
                        : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                    } disabled:opacity-50`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Annual (2 months free)</>
                    )}
                  </motion.button>
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
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] via-[#8FBFBD] to-[#7FB5B3] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6">
          <Holoflower size="lg" glowIntensity="medium" animate={true} />
        </div>
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-teal-700" />
        <p className="text-teal-800/70">Loading...</p>
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
