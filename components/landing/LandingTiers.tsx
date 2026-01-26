'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';

type StripeTier = 'presence' | 'continuity' | 'stewardship' | 'pioneer';

interface Tier {
  name: string;
  stripeTier: StripeTier | null;
  price: string;
  priceNote?: string;
  description: string;
  detail: string;
  features: string[];
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Presence",
    stripeTier: null, // Free tier - no Stripe checkout
    price: "Free",
    description: "Meet MAIA. Journal. Reflect.",
    detail: "Experience sovereignty before any paywall.",
    features: [
      "Voice conversations with MAIA",
      "Talk / Care / Note modes",
      "Sanctuary mode",
      "Elemental attunement",
      "Session-based reflection"
    ]
  },
  {
    name: "Continuity",
    stripeTier: 'continuity',
    price: "$11/mo",
    description: "MAIA remembers alongside you.",
    detail: "Patterns across time. Becoming visible.",
    features: [
      "Everything in Presence",
      "Cross-session memory",
      "Pattern recognition",
      "Wisdom capsules",
      "Personal timeline"
    ],
    highlighted: true
  },
  {
    name: "Stewardship",
    stripeTier: 'stewardship',
    price: "$33/mo",
    description: "For those who hold space for others.",
    detail: "Practitioner tools. Guardian Console.",
    features: [
      "Everything in Continuity",
      "Guardian Console access",
      "Practitioner tools",
      "Priority support",
      "Beta features"
    ]
  }
];

interface LandingTiersProps {
  onBegin: () => void;
}

export function LandingTiers({ onBegin }: LandingTiersProps) {
  const ref = useRef(null);
  const router = useRouter();
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (tier: StripeTier) => {
    setLoadingTier(tier);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          interval: tier === 'pioneer' ? 'one_time' : 'month',
          successUrl: `${window.location.origin}/begin?tier=${tier}&success=true`,
          cancelUrl: `${window.location.origin}/landing?canceled=true`,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        setLoadingTier(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoadingTier(null);
    }
  };

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white/60 text-sm uppercase tracking-[0.2em] mb-12 text-center"
        >
          Three ways to be here
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 flex flex-col ${
                tier.highlighted
                  ? 'border-teal-400/40 ring-1 ring-teal-400/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full">
                  <span className="text-teal-300 text-xs font-medium">Most Popular</span>
                </div>
              )}

              <h3 className="text-white text-xl font-medium mb-2">
                {tier.name}
              </h3>
              <div className="mb-4">
                <span className="text-teal-200 text-2xl font-light">
                  {tier.price}
                </span>
                {tier.priceNote && (
                  <span className="text-white/40 text-sm block mt-1">
                    {tier.priceNote}
                  </span>
                )}
              </div>
              <p className="text-white/80 text-base leading-relaxed mb-2">
                {tier.description}
              </p>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                {tier.detail}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-teal-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {tier.stripeTier ? (
                <button
                  onClick={() => handleCheckout(tier.stripeTier!)}
                  disabled={loadingTier !== null}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                    tier.highlighted
                      ? 'bg-teal-500/80 hover:bg-teal-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
                  } ${loadingTier === tier.stripeTier ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {loadingTier === tier.stripeTier ? 'Loading...' : 'Choose ' + tier.name}
                </button>
              ) : (
                <button
                  onClick={onBegin}
                  className="w-full py-3 rounded-xl font-medium transition-all duration-200 bg-white/10 hover:bg-white/20 text-white/90 border border-white/10"
                >
                  Begin Free
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pioneer tier - special card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 text-center">
            <h3 className="text-amber-200 text-lg font-medium mb-2">Pioneer</h3>
            <p className="text-amber-100/80 text-2xl font-light mb-2">$111 once</p>
            <p className="text-amber-100/50 text-sm mb-4">
              Price locked for life. Honored, not advantaged.
              <br />
              <span className="text-amber-200/70">Lifetime Continuity access.</span>
            </p>
            <button
              onClick={() => handleCheckout('pioneer')}
              disabled={loadingTier !== null}
              className={`px-8 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium rounded-xl border border-amber-500/30 transition-all duration-200 ${
                loadingTier === 'pioneer' ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {loadingTier === 'pioneer' ? 'Loading...' : 'Become a Pioneer'}
            </button>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-white/30 text-sm"
        >
          Everyone deserves a companion who truly listens.
        </motion.p>
      </div>
    </section>
  );
}
