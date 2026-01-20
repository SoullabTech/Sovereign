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

interface TierCardProps {
  tier: MemberTier;
  isCurrentTier: boolean;
  isDayMode: boolean;
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
    color: 'emerald',
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

function TierCard({ tier, isCurrentTier, isDayMode, onSelect }: TierCardProps) {
  const data = TIER_DATA[tier];
  const Icon = data.icon;

  const colorClasses = {
    emerald: {
      bg: isDayMode ? 'from-emerald-50 to-teal-50' : 'from-emerald-900/30 to-teal-900/20',
      border: isDayMode ? 'border-emerald-200/50' : 'border-emerald-500/30',
      icon: isDayMode ? 'text-emerald-600 bg-emerald-100' : 'text-emerald-400 bg-emerald-500/20',
      button: isDayMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-400',
      check: isDayMode ? 'text-emerald-600' : 'text-emerald-400',
    },
    violet: {
      bg: isDayMode ? 'from-violet-50 to-indigo-50' : 'from-violet-900/30 to-indigo-900/20',
      border: isDayMode ? 'border-violet-200/50' : 'border-violet-500/30',
      icon: isDayMode ? 'text-violet-600 bg-violet-100' : 'text-violet-400 bg-violet-500/20',
      button: isDayMode ? 'bg-violet-600 hover:bg-violet-700' : 'bg-violet-500 hover:bg-violet-400',
      check: isDayMode ? 'text-violet-600' : 'text-violet-400',
    },
    amber: {
      bg: isDayMode ? 'from-amber-50 to-orange-50' : 'from-amber-900/30 to-orange-900/20',
      border: isDayMode ? 'border-amber-200/50' : 'border-amber-500/30',
      icon: isDayMode ? 'text-amber-600 bg-amber-100' : 'text-amber-400 bg-amber-500/20',
      button: isDayMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-400',
      check: isDayMode ? 'text-amber-600' : 'text-amber-400',
    },
  };

  const colors = colorClasses[data.color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border bg-gradient-to-br ${colors.bg} ${colors.border} overflow-hidden`}
    >
      {/* Current tier badge */}
      {isCurrentTier && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
          isDayMode ? 'bg-stone-200 text-stone-700' : 'bg-stone-700 text-stone-300'
        }`}>
          Your tier
        </div>
      )}

      <div className="p-6">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Header */}
        <h3 className={`text-xl font-semibold mb-1 ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
          {data.name}
        </h3>
        <p className={`text-sm mb-4 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
          {data.tagline}
        </p>

        {/* Price */}
        <div className="mb-6">
          <span className={`text-3xl font-bold ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
            {data.price}
          </span>
          {data.priceNote && (
            <span className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
              {data.priceNote}
            </span>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {data.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.check}`} />
              <span className={`text-sm ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Emphasis */}
        <p className={`text-sm italic mb-6 ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
          {data.emphasis}
        </p>

        {/* CTA */}
        {!isCurrentTier && tier !== 'free' && (
          <button
            onClick={onSelect}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${colors.button}`}
          >
            {data.cta}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {isCurrentTier && (
          <div className={`w-full py-3 px-4 rounded-xl text-center text-sm ${
            isDayMode ? 'bg-stone-100 text-stone-600' : 'bg-stone-800 text-stone-400'
          }`}>
            This is where you are
          </div>
        )}

        {tier === 'free' && !isCurrentTier && (
          <div className={`w-full py-3 px-4 rounded-xl text-center text-sm ${
            isDayMode ? 'bg-stone-100 text-stone-600' : 'bg-stone-800 text-stone-400'
          }`}>
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
  const [isDayMode, setIsDayMode] = useState(false);
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

    // Check time for day/night mode
    const hour = new Date().getHours();
    setIsDayMode(hour >= 6 && hour < 18);

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
    <div className={`min-h-screen ${
      isDayMode
        ? 'bg-gradient-to-b from-stone-50 via-stone-100 to-stone-50'
        : 'bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${
        isDayMode ? 'bg-stone-50/80' : 'bg-stone-900/80'
      } border-b ${
        isDayMode ? 'border-stone-200/50' : 'border-stone-700/50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-xl transition-colors ${
              isDayMode ? 'hover:bg-stone-200' : 'hover:bg-stone-800'
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`} />
          </button>
          <h1 className={`text-lg font-medium ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
            Your Relationship with MAIA
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl ${
                isDayMode ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-300'
              }`}
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
              className={`mb-6 p-4 rounded-xl ${
                isDayMode ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-red-900/30 border border-red-500/30 text-red-300'
              }`}
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

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className={`text-2xl font-light mb-4 ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
            Local Sovereignty. Sovereign Cloud.
          </h2>
          <p className={`max-w-xl mx-auto ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
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
                isDayMode={isDayMode}
                onSelect={() => handleTierSelect(tier)}
              />
            </motion.div>
          ))}
        </div>

        {/* Why Sovereign Cloud - Plain language explanation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-2xl mb-6 ${
            isDayMode ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/50' : 'bg-gradient-to-r from-violet-900/20 to-indigo-900/10 border border-violet-500/20'
          }`}
        >
          <h3 className={`font-medium mb-4 ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
            Why Sovereign Cloud?
          </h3>
          <div className={`space-y-4 text-sm ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
            <p>
              <span className={`font-medium ${isDayMode ? 'text-violet-700' : 'text-violet-300'}`}>
                Your local experience is complete.
              </span>
            </p>
            <p>
              MAIA runs on your device with full memory. Your conversations, journal entries,
              and insights stay with you—always yours, always private.
            </p>
            <p>
              Sovereign cloud is for when you want to extend: upload files for deeper analysis,
              sync across devices, let MAIA weave patterns over months and years.
              It&apos;s infrastructure, not permission.
            </p>
            <p className={`italic ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
              Self-hosted. No third parties. No data mining. Still sovereign.
            </p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl mb-6 ${
            isDayMode ? 'bg-white/60 border border-stone-200/50' : 'bg-stone-800/50 border border-stone-700/50'
          }`}
        >
          <h3 className={`font-medium mb-4 ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
            Common Questions
          </h3>
          <div className="space-y-4">
            <div>
              <p className={`text-sm font-medium mb-1 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                What do I get with free/local?
              </p>
              <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
                A complete experience. MAIA conversations, journal, oracle, memory—all on your device.
                Your data stays with you.
              </p>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                What does sovereign cloud add?
              </p>
              <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
                Extension, not permission. Upload files for deeper analysis. Sync across devices.
                Let MAIA weave patterns across months and years.
              </p>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                What makes it &quot;sovereign&quot;?
              </p>
              <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
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
          className={`p-6 rounded-2xl ${
            isDayMode ? 'bg-white/60 border border-stone-200/50' : 'bg-stone-800/50 border border-stone-700/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDayMode ? 'bg-stone-100' : 'bg-stone-700'}`}>
              <Shield className={`w-5 h-5 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`} />
            </div>
            <div>
              <h3 className={`font-medium mb-2 ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
                Your Data, Your Sovereignty
              </h3>
              <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
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
          <p className={`text-sm italic ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
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
              className={`fixed bottom-0 left-0 right-0 p-6 ${
                isDayMode ? 'bg-white border-t border-stone-200' : 'bg-stone-900 border-t border-stone-700'
              }`}
            >
              <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`font-medium ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
                      Continue to {TIER_DATA[selectedTier].name}
                    </p>
                    <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                      {TIER_DATA[selectedTier].price}{TIER_DATA[selectedTier].priceNote}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTier(null)}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-xl text-sm ${
                      isDayMode ? 'text-stone-600 hover:bg-stone-100' : 'text-stone-400 hover:bg-stone-800'
                    } disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCheckout(selectedTier, 'month')}
                    disabled={isProcessing}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${
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
                  </button>
                  <button
                    onClick={() => handleCheckout(selectedTier, 'year')}
                    disabled={isProcessing}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border-2 ${
                      selectedTier === 'personal'
                        ? isDayMode
                          ? 'border-violet-300 text-violet-700 hover:bg-violet-50'
                          : 'border-violet-500/50 text-violet-300 hover:bg-violet-500/10'
                        : isDayMode
                          ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                          : 'border-amber-500/50 text-amber-300 hover:bg-amber-500/10'
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
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-stone-400" />
        <p className="text-stone-400">Loading...</p>
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
