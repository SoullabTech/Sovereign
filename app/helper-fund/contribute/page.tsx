/**
 * Helper Fund Contribution Page
 *
 * Form for thriving practitioners to contribute to the fund.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Users, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CONTRIBUTION_AMOUNTS = [
  { value: 1000, label: '$10', desc: 'Supports one month partially' },
  { value: 2500, label: '$25', desc: 'Covers most of a monthly scholarship' },
  { value: 3500, label: '$35', desc: 'Covers one full Studio scholarship' },
  { value: 5000, label: '$50', desc: 'Covers one scholarship + a bit more' },
  { value: 10000, label: '$100', desc: 'Supports multiple practitioners' },
];

interface HelperFundStats {
  activeScholarships: number;
  pendingApplications: number;
}

export default function HelperFundContributePage() {
  const [amount, setAmount] = useState(3500);
  const [isRecurring, setIsRecurring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState<HelperFundStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/pricing/helper-fund/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }
    fetchStats();
  }, []);

  const handleContribute = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pricing/helper-fund/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents: amount,
          isRecurring,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout if URL provided
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          setIsComplete(true);
        }
      } else {
        console.error('Failed to initiate contribution');
      }
    } catch (err) {
      console.error('Error initiating contribution:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-maia-navy-950 via-maia-navy-900 to-maia-navy-950 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-maia-sage/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-maia-sage" />
          </div>
          <h1 className="text-2xl font-light text-maia-ink-100 mb-4">
            Thank you
          </h1>
          <p className="text-maia-ink-60 mb-8">
            Your contribution directly supports emerging practitioners.
            Stewardship flows in both directions.
          </p>
          <Link href="/maia">
            <Button className="bg-maia-spice-500 hover:bg-maia-spice-600 text-white">
              Return to MAIA
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
      {/* Header */}
      <header className="px-6 py-6">
        <Link
          href="/helper-fund"
          className="inline-flex items-center gap-2 text-maia-ink-60 hover:text-maia-ink-80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Helper Fund
        </Link>
      </header>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 rounded-xl bg-maia-spice-400/10 flex items-center justify-center text-maia-spice-400 mb-6">
              <Heart className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-light text-maia-ink-100 mb-4">
              Contribute to the Helper Fund
            </h1>
            <p className="text-maia-ink-60 mb-8">
              Your contribution directly supports practitioners who are just starting out.
              100% goes to scholarships — no admin fees.
            </p>

            {/* Current impact */}
            {stats && (
              <div className="flex items-center gap-3 p-4 bg-maia-spice-400/5 rounded-xl mb-8">
                <Users className="w-5 h-5 text-maia-spice-400/60" />
                <div className="text-sm text-maia-ink-60">
                  Currently supporting{' '}
                  <span className="text-maia-spice-400">{stats.activeScholarships}</span>{' '}
                  practitioners
                  {stats.pendingApplications > 0 && (
                    <span className="text-maia-ink-40">
                      {' '}
                      ({stats.pendingApplications} applications pending)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Amount selection */}
            <div className="space-y-3 mb-8">
              <label className="text-sm text-maia-ink-60">Choose an amount</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CONTRIBUTION_AMOUNTS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAmount(option.value)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      amount === option.value
                        ? 'bg-maia-spice-400/10 border-maia-spice-400/40'
                        : 'bg-maia-navy-900/30 border-transparent hover:border-maia-spice-400/20'
                    }`}
                  >
                    <div className={`text-lg font-medium ${
                      amount === option.value ? 'text-maia-spice-400' : 'text-maia-ink-80'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-maia-ink-50 mt-1">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring toggle */}
            <div className="mb-8">
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isRecurring
                    ? 'bg-maia-spice-400/10 border-maia-spice-400/40'
                    : 'bg-maia-navy-900/30 border-transparent'
                }`}
              >
                <div>
                  <div className={`font-medium ${
                    isRecurring ? 'text-maia-spice-400' : 'text-maia-ink-80'
                  }`}>
                    Monthly contribution
                  </div>
                  <div className="text-sm text-maia-ink-50">
                    Sustain ongoing support. Pause anytime.
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  isRecurring ? 'bg-maia-spice-400' : 'bg-maia-ink-20/20'
                }`}>
                  <div className={`w-5 h-5 mt-0.5 rounded-full bg-white transition-transform ${
                    isRecurring ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            </div>

            {/* Submit */}
            <Button
              onClick={handleContribute}
              disabled={isSubmitting}
              className="w-full bg-maia-spice-500 hover:bg-maia-spice-600 text-white py-3 rounded-xl font-medium"
            >
              {isSubmitting ? 'Processing...' : isRecurring
                ? `Contribute ${(amount / 100).toFixed(0)}/month`
                : `Make a one-time ${(amount / 100).toFixed(0)} contribution`
              }
            </Button>

            <p className="mt-6 text-xs text-maia-ink-40 text-center">
              Processed securely via Stripe. You can pause or cancel anytime from your account settings.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
