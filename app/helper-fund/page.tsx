/**
 * Helper Fund Landing Page
 *
 * Public page explaining the Helper Fund and how to apply or contribute.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HelperFundStats {
  activeContributors: number;
  activeScholarships: number;
  monthlyContributionsCents: number;
}

export default function HelperFundPage() {
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
        console.error('Failed to fetch Helper Fund stats:', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
      {/* Hero */}
      <section className="relative px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-400/10 flex items-center justify-center text-rose-400 mx-auto mb-8">
            <Heart className="w-8 h-8" />
          </div>

          <h1 className="text-4xl md:text-5xl font-light text-maia-ink-100 mb-6">
            The Helper Fund
          </h1>

          <p className="text-xl text-maia-ink-60 leading-relaxed mb-8">
            Stewardship flows in both directions. Those with capacity support those building it.
            No public markers. No shame. Just practitioners helping practitioners.
          </p>

          {/* Stats */}
          {stats && (
            <div className="flex justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-light text-rose-400">
                  {stats.activeScholarships}
                </div>
                <div className="text-sm text-maia-ink-50">Active scholarships</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-maia-spice-400">
                  {stats.activeContributors}
                </div>
                <div className="text-sm text-maia-ink-50">Contributors</div>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/helper-fund/apply">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white py-3 px-8 rounded-xl font-medium transition-all group">
                Apply for Support
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/helper-fund/contribute">
              <Button
                variant="outline"
                className="border-maia-spice-400/30 text-maia-spice-400 hover:bg-maia-spice-400/10 py-3 px-8 rounded-xl font-medium transition-all"
              >
                Contribute
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-light text-maia-ink-100 text-center mb-12"
          >
            How it works
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Those Seeking Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-maia-navy-900/50 rounded-2xl p-8 border border-rose-400/10"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-400/10 flex items-center justify-center text-rose-400 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-maia-ink-100 mb-4">
                For emerging practitioners
              </h3>
              <ul className="space-y-3 text-maia-ink-60">
                <li className="flex gap-3">
                  <span className="text-rose-400">1.</span>
                  <span>Share a bit about your situation (private, no judgment)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-rose-400">2.</span>
                  <span>Request support for 3 or 6 months</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-rose-400">3.</span>
                  <span>If approved, your Studio fee is reduced or waived</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-rose-400">4.</span>
                  <span>No public markers. Your clients see nothing different.</span>
                </li>
              </ul>
            </motion.div>

            {/* For Contributors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-maia-navy-900/50 rounded-2xl p-8 border border-maia-spice-400/10"
            >
              <div className="w-12 h-12 rounded-xl bg-maia-spice-400/10 flex items-center justify-center text-maia-spice-400 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-maia-ink-100 mb-4">
                For thriving practitioners
              </h3>
              <ul className="space-y-3 text-maia-ink-60">
                <li className="flex gap-3">
                  <span className="text-maia-spice-400">1.</span>
                  <span>Choose a monthly contribution amount</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-maia-spice-400">2.</span>
                  <span>Your contribution directly supports scholarships</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-maia-spice-400">3.</span>
                  <span>Pause or adjust anytime life circumstances change</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-maia-spice-400">4.</span>
                  <span>No public recognition (unless you want it)</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <blockquote className="text-xl text-maia-ink-60 italic leading-relaxed mb-6">
            &ldquo;The soul of community is mutual aid. When we recognize that each of us
            moves through seasons of giving and receiving, we stop keeping score.&rdquo;
          </blockquote>
          <p className="text-sm text-maia-ink-40">
            — Soullab Philosophy
          </p>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-light text-maia-ink-100 text-center mb-12">
            Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'How are applications reviewed?',
                a: 'Applications are reviewed by the Soullab team within 3-5 days. We look for genuine need, not perfect circumstances. The process is confidential.',
              },
              {
                q: 'What if my circumstances change?',
                a: 'Life happens. If you receive support and later find yourself thriving, we hope you\'ll consider giving back. If you\'re contributing and hit a rough patch, pause anytime.',
              },
              {
                q: 'Is there a public list of recipients or donors?',
                a: 'No. Dignity is preserved. There are no public markers, badges, or recognition unless someone explicitly opts in.',
              },
              {
                q: 'How long do scholarships last?',
                a: 'Typically 3-6 months, with the option to reapply. The goal is to bridge a gap, not create permanent dependency.',
              },
            ].map((item, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-maia-navy-900/30 rounded-xl border border-maia-ink-20/10"
              >
                <summary className="flex justify-between items-center cursor-pointer p-6 text-maia-ink-80 font-medium">
                  {item.q}
                  <span className="text-maia-ink-40 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-maia-ink-60 leading-relaxed">
                  {item.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
